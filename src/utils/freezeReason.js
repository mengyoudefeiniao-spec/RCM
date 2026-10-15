/**
 * 家庭成员/配给卡冻结原因统一处理工具
 *
 * 背景：历史版本在管理端冻结时按当前界面语言把原因词根（如中文"更新"、
 * 英文"Civil Registry Update Required"）直接持久化到 freezeReason，
 * 导致其他语言环境的页面出现中文词条残留。
 *
 * 修复约定：冻结时持久化稳定代码（commercial / update / ...），
 * 展示端统一通过 i18n 词根词条 (freezeReason.*) 翻译，括号备注保留原文，
 * 并兼容映射历史已持久化的中英文词根值。
 */

// 冻结原因稳定代码
export const FREEZE_REASON_CODES = [
  'commercial',
  'travel',
  'highIncome',
  'unknownAddress',
  'update',
  'duplicate',
  'temporary',
  'geoLocation',
  'regulatory',
  'frozen'
];

// 历史持久化值 (中文词根 / 英文词根) → 稳定代码
export const FREEZE_REASON_LEGACY_MAP = {
  '商业': 'commercial',
  'Commercial': 'commercial',
  'Commercial Activity': 'commercial',
  '旅行': 'travel',
  'Travel': 'travel',
  'Overseas Travel': 'travel',
  '高收入': 'highIncome',
  'High Income Threshold': 'highIncome',
  '住址不明': 'unknownAddress',
  'Unknown Residence Address': 'unknownAddress',
  '更新': 'update',
  'Update': 'update',
  'Civil Registry Update Required': 'update',
  '重复': 'duplicate',
  'Duplicate': 'duplicate',
  'Duplicate Registration': 'duplicate',
  '临时': 'temporary',
  'Temporary': 'temporary',
  'Temporary Biometric Audit': 'temporary',
  '地理位置': 'geoLocation',
  'Geographic Discrepancy': 'geoLocation',
  '监管合规冻结': 'regulatory',
  'Regulatory Compliance Freeze': 'regulatory',
  '冻结': 'frozen',
  'Frozen': 'frozen'
};

/**
 * 将持久化的冻结原因解析为稳定代码
 * @param {string} reason 持久化的冻结原因 (代码 / 历史中文 / 历史英文，可含 "(备注)")
 * @returns {string} 稳定代码；无法识别时返回空字符串
 */
export function resolveFreezeReasonCode(reason) {
  if (!reason) return '';
  const str = String(reason).trim();
  const m = str.match(/^(.*?)\s*\((.*)\)$/);
  const head = (m ? m[1] : str).trim();
  if (FREEZE_REASON_LEGACY_MAP[head]) return FREEZE_REASON_LEGACY_MAP[head];
  if (FREEZE_REASON_CODES.includes(head)) return head;
  return '';
}

/**
 * 将持久化的冻结原因本地化为当前语言展示文本
 * 组合式 "原因 (备注)"：分别翻译原因词根，保留备注原文
 * @param {string} reason 持久化的冻结原因
 * @param {Function} t vue-i18n 翻译函数
 * @returns {string} 本地化文本；空值返回空字符串
 */
export function localizeFreezeReason(reason, t) {
  if (!reason) return '';
  const str = String(reason).trim();
  const m = str.match(/^(.*?)\s*\((.*)\)$/);
  const head = (m ? m[1] : str).trim();
  const remark = m ? m[2].trim() : '';
  const code = resolveFreezeReasonCode(head);
  const localizedHead = code ? t(`freezeReason.${code}`) : head;
  return remark ? `${localizedHead} (${remark})` : localizedHead;
}
