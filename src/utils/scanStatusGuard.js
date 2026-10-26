/**
 * 代理 APP 扫描公民电子配给卡二维码时的用户状态异常判定工具
 *
 * 背景：代理网点现场扫描公民 APP 出示的电子配给卡二维码后，
 * 需要在放行核销前自动判定持卡用户状态，出现异常时以红色警示
 * 拦截并引导处理，禁止无单/异常发货。
 *
 * 错误码约定：
 *  - ERR_FROZEN    该成员资格已冻结（展示冻结原因，引导发起解冻申请）
 *  - ERR_QUOTA     配额不足（展示剩余可领量与本次请求量差额）
 *  - ERR_DUPLICATE 重复领取尝试（展示本期已核销记录）
 *  - ERR_EXPIRED   提货码已过期或已使用（引导重新发起选购）
 *  - ERR_CARD      配给卡已注销或挂失
 *  - ERR_SYS       系统错误（提示稍后重试或联系客服）
 *
 * 说明：本工具只做纯判定（输入二维码载荷 + 云端核验上下文），
 * 输出规范化的异常对象；界面文案由视图层通过 i18n 词条渲染。
 */

export const SCAN_ERROR_CODES = Object.freeze({
  FROZEN: 'ERR_FROZEN',
  QUOTA: 'ERR_QUOTA',
  DUPLICATE: 'ERR_DUPLICATE',
  EXPIRED: 'ERR_EXPIRED',
  CARD: 'ERR_CARD',
  SYS: 'ERR_SYS'
});

// 动态二维码有效期（分钟）：超出后视为过期，需重新发起选购
export const CITIZEN_CARD_QR_VALID_MINUTES = 5;

// 每名符合资格成员的标准份额（大米 3KG + 面粉 9KG + 食用油 1L + 白糖 1KG = 14 标准份额）
const PER_HEAD_QUOTA_UNITS = 14;

// 各类异常的界面词条键映射（视图层按此渲染标题与处理指引）
const ERROR_META = Object.freeze({
  [SCAN_ERROR_CODES.FROZEN]: { titleKey: 'errFrozenTitle', guideKey: 'errFrozenGuide' },
  [SCAN_ERROR_CODES.QUOTA]: { titleKey: 'errQuotaTitle', guideKey: 'errQuotaGuide' },
  [SCAN_ERROR_CODES.DUPLICATE]: { titleKey: 'errDuplicateTitle', guideKey: 'errDuplicateGuide' },
  [SCAN_ERROR_CODES.EXPIRED]: { titleKey: 'errExpiredTitle', guideKey: 'errExpiredGuide' },
  [SCAN_ERROR_CODES.CARD]: { titleKey: 'errCardTitle', guideKey: 'errCardGuide' },
  [SCAN_ERROR_CODES.SYS]: { titleKey: 'errSysTitle', guideKey: 'errSysGuide' }
});

const FROZEN_STATUS = /冻结|frozen|freeze|مجمد|مجمّد|بەستراو/iu;
const CANCELLED_STATUS = /注销|吊销|撤销|cancell|revok|ملغ|هەڵوەشا/iu;
const LOST_STATUS = /挂失|丢失|遗失|lost|missing|مفقود|ونبوو/iu;

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}

/**
 * 计算云端核验结果中的剩余可领量（标准份额）
 * @param {Array<{ totalQuota?: number, remainingQuota?: number, claimedQty?: number }>} quotaList
 * @returns {number} 剩余可领量
 */
export function computeRemainingQuota(quotaList) {
  if (!Array.isArray(quotaList)) return 0;
  return round1(quotaList.reduce((sum, item) => {
    if (!item) return sum;
    const remaining = item.remainingQuota != null ? Number(item.remainingQuota) : Number(item.totalQuota ?? 0) - Number(item.claimedQty ?? 0);
    return sum + (Number.isFinite(remaining) ? remaining : 0);
  }, 0));
}

/**
 * 获取某错误码对应的界面词条键
 * @param {string} code 错误码（SCAN_ERROR_CODES）
 * @returns {{ titleKey: string, guideKey: string } | null}
 */
export function getScanErrorMeta(code) {
  return ERROR_META[code] || null;
}

/**
 * 构造系统错误异常对象（核验服务调用失败时使用）
 * @param {string} [detail] 原始错误信息（仅用于控制台排查）
 * @returns {{ code: string }}
 */
export function createScanSystemError(detail = '') {
  return { code: SCAN_ERROR_CODES.SYS, detail: String(detail || '') };
}

/**
 * 判定代理扫描公民电子配给卡二维码后的用户状态是否异常
 *
 * @param {object} payload 解析后的公民卡二维码载荷
 * @param {string} payload.cardNo 配给卡号
 * @param {string} [payload.status] 卡片/家庭状态（正常 / 冻结 / 注销 / 挂失 ...）
 * @param {string} [payload.freezeReason] 冻结原因（稳定代码或历史词根）
 * @param {number} [payload.memberCount] 在册成员数
 * @param {string} [payload.issuedAt] 二维码签发时间 (ISO)
 * @param {object} [ctx] 云端核验上下文
 * @param {object} [ctx.verification] 云端配额核验结果（verifyCitizenCardAndQuota）
 * @param {number} [ctx.requestedQty] 本次请求量（标准份额），缺省按核验通过成员与当前标准推算
 * @param {Array<object>} [ctx.claimedRecords] 本期已核销记录（ERR_DUPLICATE 展示用）
 * @param {number} [ctx.now] 当前时间戳（测试注入用）
 * @returns {null | { code: string, cardNo: string, headName?: string, freezeReason?: string,
 *   cardStatus?: string, remaining?: number, requested?: number, deficit?: number,
 *   eligibleMembers?: number, memberCount?: number, claimPeriod?: string,
 *   claimedRecords?: Array<object>, issuedAt?: string, validMinutes?: number }}
 *   返回 null 表示状态正常，可继续核销流程
 */
export function evaluateCitizenCardScan(payload, ctx = {}) {
  if (!payload || typeof payload !== 'object' || !String(payload.cardNo || '').trim()) {
    return { code: SCAN_ERROR_CODES.CARD, cardNo: '', cardStatus: '' };
  }

  const cardNo = String(payload.cardNo).trim();
  const headName = String(payload.headName || '').trim();
  const status = String(payload.status || '').trim();

  // 1. 卡片状态：冻结 / 注销 / 挂失 直接拦截
  if (FROZEN_STATUS.test(status)) {
    return { code: SCAN_ERROR_CODES.FROZEN, cardNo, headName, freezeReason: String(payload.freezeReason || '') };
  }
  if (CANCELLED_STATUS.test(status) || LOST_STATUS.test(status)) {
    return { code: SCAN_ERROR_CODES.CARD, cardNo, headName, cardStatus: status };
  }

  // 2. 云端核验上下文（配额 / 重复领取）
  const verification = ctx.verification;
  if (verification) {
    if (verification.alreadyClaimed) {
      return {
        code: SCAN_ERROR_CODES.DUPLICATE,
        cardNo,
        headName,
        claimPeriod: String(verification.claimPeriod || ''),
        claimedRecords: Array.isArray(ctx.claimedRecords) ? ctx.claimedRecords : []
      };
    }

    const remaining = computeRemainingQuota(verification.quotaList);
    const memberCount = Number(payload.memberCount) > 0 ? Number(payload.memberCount) : 0;
    const eligibleMembers = Number.isFinite(Number(verification.eligibleMembers))
      ? Math.max(0, Number(verification.eligibleMembers)) : memberCount;
    const quotaPerHead = (verification.quotaList || []).reduce((sum, item) => sum + Number(item?.quotaPerHead || 0), 0) || PER_HEAD_QUOTA_UNITS;
    const requested = Number(ctx.requestedQty) > 0 ? Number(ctx.requestedQty) : round1((eligibleMembers || memberCount) * quotaPerHead);
    if (requested > 0 && remaining + 0.05 < requested) {
      return {
        code: SCAN_ERROR_CODES.QUOTA,
        cardNo,
        headName,
        remaining,
        requested: round1(requested),
        deficit: round1(requested - remaining),
        eligibleMembers: Number(verification.eligibleMembers) || 0,
        memberCount
      };
    }
  }

  // 3. 动态二维码有效期（提货码过期或已使用）
  const issuedAt = Date.parse(payload.issuedAt || '');
  if (Number.isFinite(issuedAt)) {
    const now = Number(ctx.now) > 0 ? Number(ctx.now) : Date.now();
    const ageMinutes = (now - issuedAt) / 60000;
    if (ageMinutes > CITIZEN_CARD_QR_VALID_MINUTES) {
      return {
        code: SCAN_ERROR_CODES.EXPIRED,
        cardNo,
        headName,
        issuedAt: String(payload.issuedAt || ''),
        validMinutes: CITIZEN_CARD_QR_VALID_MINUTES
      };
    }
  }

  return null;
}
