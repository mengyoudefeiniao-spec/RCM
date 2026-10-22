/**
 * 业务规则配置中心（前端共享层）
 *
 * 设计要点：
 * 1. 六类规则全部集中在一份版本化文档中，存储于 rcm_center_business_rules_v1（随 PocketBase 同步）。
 * 2. 每次发布生成新版本号，history 保存全量快照；历史业务在受理时把版本号写入单据，不随规则调整追溯改写。
 * 3. 视图与 mock 均通过本文件的同步读取函数取当前生效值，避免规则散落在组件与接口里。
 */

export const BUSINESS_RULES_STORAGE_KEY = 'rcm_center_business_rules_v1';

export const RULE_SECTIONS = ['autoAcceptance', 'article140Centers', 'householdThresholds', 'feeStandards', 'quotaStandards', 'approvalMatrix'];

export const RULE_LEVELS = ['system', 'branch', 'manager', 'minister', 'deputy', 'director'];

export const RULE_LEVEL_LABEL_KEYS = {
  system: 'businessRules.levels.system',
  branch: 'businessRules.levels.branch',
  manager: 'businessRules.levels.manager',
  minister: 'businessRules.levels.minister',
  deputy: 'businessRules.levels.deputy',
  director: 'businessRules.levels.director'
};

export const RULE_BUSINESS_LABELS = {
  TRF: 'businessRules.business.TRF',
  TRM: 'businessRules.business.TRM',
  SPL: 'businessRules.business.SPL',
  HED: 'businessRules.business.HED',
  UNF: 'businessRules.business.UNF',
  GRANT_AGENT: 'businessRules.business.GRANT_AGENT',
  UNIFY_AGENT: 'businessRules.business.UNIFY_AGENT',
  ESTABLISH_AGENT: 'businessRules.business.ESTABLISH_AGENT',
  SPLIT_LARGE_AGENT: 'businessRules.business.SPLIT_LARGE_AGENT',
  DECEASED_ROTATION: 'businessRules.business.DECEASED_ROTATION',
  RESTORE_AGENT: 'businessRules.business.RESTORE_AGENT',
  CANCEL_AGENT: 'businessRules.business.CANCEL_AGENT',
  ROTATE_TRANSFER_AGENT: 'businessRules.business.ROTATE_TRANSFER_AGENT',
  MERGE_AGENT: 'businessRules.business.MERGE_AGENT',
  PENALIZE_AGENT: 'businessRules.business.PENALIZE_AGENT'
};

const DEFAULT_ARTICLE140_CENTERS = [
  { id: '101', name: '卡尔赫第一配给中心 (曼苏尔)', province: '巴格达省 (Baghdad)' },
  { id: '102', name: '卡尔赫区 (Al-Karkh)第1配给储备中心', province: '巴格达省 (Baghdad)' },
  { id: '103', name: '鲁萨法区 (Al-Rusafa)第2配给储备中心', province: '巴格达省 (Baghdad)' },
  { id: '104', name: '曼苏尔 (Al-Mansour)第3配给储备中心', province: '巴格达省 (Baghdad)' },
  { id: '105', name: '卡达米亚 (Kadhimiya)第1配给储备中心', province: '巴格达省 (Baghdad)' },
  { id: '106', name: '阿达米亚 (Adhamiyah)第2配给储备中心', province: '巴格达省 (Baghdad)' },
  { id: '108', name: '萨德尔城中央配给中心', province: '巴格达省 (Baghdad)' },
  { id: '304', name: '祖马尔 (Zummar) 湖畔配给中心', province: '尼尼微省 (Nineveh)' },
  { id: '305', name: '泰勒阿费尔 (Tal Afar) 西区配给中心', province: '尼尼微省 (Nineveh)' },
  { id: '320', name: '辛贾尔 (Sinjar) 核心配给中心', province: '尼尼微省 (Nineveh)' },
  { id: '496', name: '哈奈根 (Khanaqin) 第一配给中心', province: '迪亚拉省 (Diyala)' },
  { id: '497', name: '贾劳拉 (Jalawla) 干线配给中心', province: '迪亚拉省 (Diyala)' },
  { id: '498', name: '萨阿迪耶 (Saadiya) 绿洲配给中心', province: '迪亚拉省 (Diyala)' },
  { id: '499', name: '曼德利 (Mandali) 边境便民配给中心', province: '迪亚拉省 (Diyala)' },
  { id: '512', name: '达古格 (Daquq) 南部便民配给中心', province: '基尔库克省 (Kirkuk)' },
  { id: '513', name: '哈维贾 (Hawija) 农业配给中心', province: '基尔库克省 (Kirkuk)' }
];

const DEFAULT_RULES = {
  // 一、双路径条件：各业务的自动受理判定规则
  autoAcceptance: [
    { key: 'TRF', autoAccept: true, requireSameFamilyCode: false, minAge: 18, regionScope: 'intra-province', manualLevel: 'branch' },
    { key: 'TRM', autoAccept: true, requireSameFamilyCode: true, minAge: 18, regionScope: 'any', manualLevel: 'branch' },
    { key: 'SPL', autoAccept: true, requireSameFamilyCode: true, minAge: 14, regionScope: 'any', manualLevel: 'branch' },
    { key: 'HED', autoAccept: false, requireSameFamilyCode: true, minAge: 18, regionScope: 'any', manualLevel: 'manager' },
    { key: 'UNF', autoAccept: false, requireSameFamilyCode: false, minAge: 0, regionScope: 'any', manualLevel: 'manager' }
  ],
  // 二、140 号决议地区清单（默认 16 个中心，可增减，即时生效）
  article140Centers: DEFAULT_ARTICLE140_CENTERS.map((item) => ({ ...item })),
  // 三、户数阈值四档
  householdThresholds: {
    capacityRedline: 1500,
    smallOutlet: 750,
    newOutletBaseline: 500,
    minAcceptedHouseholds: 40
  },
  // 四、规费标准四档
  feeStandards: [
    { key: 'TRF', amount: 5000 },
    { key: 'TRM', amount: 5000 },
    { key: 'SPL', amount: 10000 },
    { key: 'HED', amount: 5000 }
  ],
  // 五、配额标准（人均月度定额，调整后下一周期生效）
  quotaStandards: {
    effectiveFrom: null,
    previousItems: null,
    items: [
      { itemCode: 'FLOUR-WHT-02', quotaPerPerson: 9, unit: 'kg' },
      { itemCode: 'RICE-BAS-01', quotaPerPerson: 3, unit: 'kg' },
      { itemCode: 'OIL-SUN-03', quotaPerPerson: 1, unit: 'L' },
      { itemCode: 'SUGAR-WHT-04', quotaPerPerson: 1, unit: 'kg' }
    ]
  },
  // 六、审批矩阵
  approvalMatrix: [
    { key: 'GRANT_AGENT', level: 'minister' },
    { key: 'UNIFY_AGENT', level: 'minister' },
    { key: 'ESTABLISH_AGENT', level: 'minister' },
    { key: 'SPLIT_LARGE_AGENT', level: 'minister' },
    { key: 'DECEASED_ROTATION', level: 'deputy' },
    { key: 'RESTORE_AGENT', level: 'deputy' },
    { key: 'CANCEL_AGENT', level: 'director' },
    { key: 'ROTATE_TRANSFER_AGENT', level: 'director' },
    { key: 'MERGE_AGENT', level: 'director' },
    { key: 'PENALIZE_AGENT', level: 'director' },
    { key: 'TRF', level: 'branch' },
    { key: 'TRM', level: 'branch' },
    { key: 'SPL', level: 'branch' },
    { key: 'HED', level: 'manager' },
    { key: 'UNF', level: 'manager' }
  ]
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toPositiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function defaultBusinessRules() {
  return deepClone(DEFAULT_RULES);
}

export function formatRuleAmount(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export function nowStamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// 配额下一周期生效：取次月 1 日
export function nextCycleStart() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const pad = (value) => String(value).padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-01`;
}

function normalizeRules(input) {
  const defaults = defaultBusinessRules();
  const rules = input && typeof input === 'object' ? input : {};
  const thresholds = { ...defaults.householdThresholds, ...(rules.householdThresholds || {}) };
  const quota = rules.quotaStandards || {};
  const articleCenters = Array.isArray(rules.article140Centers) && rules.article140Centers.length
    ? rules.article140Centers
    : defaults.article140Centers;
  return {
    autoAcceptance: Array.isArray(rules.autoAcceptance) && rules.autoAcceptance.length ? rules.autoAcceptance : defaults.autoAcceptance,
    article140Centers: articleCenters.map((item) => ({
      id: String(item?.id || '').trim(),
      name: String(item?.name || '').trim(),
      province: String(item?.province || '').trim()
    })).filter((item) => item.id && item.name),
    householdThresholds: {
      capacityRedline: toPositiveNumber(thresholds.capacityRedline, defaults.householdThresholds.capacityRedline),
      smallOutlet: toPositiveNumber(thresholds.smallOutlet, defaults.householdThresholds.smallOutlet),
      newOutletBaseline: toPositiveNumber(thresholds.newOutletBaseline, defaults.householdThresholds.newOutletBaseline),
      minAcceptedHouseholds: toPositiveNumber(thresholds.minAcceptedHouseholds, defaults.householdThresholds.minAcceptedHouseholds)
    },
    feeStandards: (Array.isArray(rules.feeStandards) && rules.feeStandards.length ? rules.feeStandards : defaults.feeStandards)
      .map((item) => ({ key: String(item?.key || ''), amount: Math.max(0, toPositiveNumber(item?.amount, 0)) }))
      .filter((item) => item.key),
    quotaStandards: {
      effectiveFrom: quota.effectiveFrom || null,
      previousItems: Array.isArray(quota.previousItems) ? quota.previousItems : null,
      items: (Array.isArray(quota.items) && quota.items.length ? quota.items : defaults.quotaStandards.items)
        .map((item) => ({
          itemCode: String(item?.itemCode || ''),
          quotaPerPerson: Math.max(0, toPositiveNumber(item?.quotaPerPerson, 0)),
          unit: String(item?.unit || 'kg')
        }))
        .filter((item) => item.itemCode)
    },
    approvalMatrix: (Array.isArray(rules.approvalMatrix) && rules.approvalMatrix.length ? rules.approvalMatrix : defaults.approvalMatrix)
      .map((item) => ({ key: String(item?.key || ''), level: RULE_LEVELS.includes(item?.level) ? item.level : 'branch' }))
      .filter((item) => item.key)
  };
}

function createInitialDocument() {
  const rules = defaultBusinessRules();
  return {
    version: 1,
    updatedAt: nowStamp(),
    updatedBy: '',
    rules,
    history: [{ version: 1, savedAt: nowStamp(), savedBy: '', changedGroups: [], rules: deepClone(rules) }]
  };
}

export function readBusinessRulesDocument() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(BUSINESS_RULES_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const version = Math.max(1, Math.floor(Number(parsed?.version) || 1));
      return {
        version,
        updatedAt: parsed?.updatedAt || nowStamp(),
        updatedBy: parsed?.updatedBy || '',
        rules: normalizeRules(parsed?.rules),
        history: Array.isArray(parsed?.history) && parsed.history.length
          ? parsed.history.map((entry, index) => ({
            version: Math.max(1, Math.floor(Number(entry?.version) || index + 1)),
            savedAt: entry?.savedAt || '',
            savedBy: entry?.savedBy || '',
            changedGroups: Array.isArray(entry?.changedGroups) ? entry.changedGroups : [],
            rules: normalizeRules(entry?.rules)
          }))
          : [{ version, savedAt: parsed?.updatedAt || nowStamp(), savedBy: parsed?.updatedBy || '', changedGroups: [], rules: normalizeRules(parsed?.rules) }]
      };
    }
  } catch (error) {
    console.warn('[BusinessRules] Failed to parse stored rules, using defaults.', error);
  }
  const initial = createInitialDocument();
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(BUSINESS_RULES_STORAGE_KEY, JSON.stringify(initial));
  } catch (error) {
    // ignore storage quota errors
  }
  return initial;
}

export function writeBusinessRulesDocument(document) {
  const normalized = {
    ...document,
    rules: normalizeRules(document.rules)
  };
  try {
    localStorage.setItem(BUSINESS_RULES_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error('[BusinessRules] Failed to persist rules.', error);
  }
  return normalized;
}

export function getBusinessRules() {
  return readBusinessRulesDocument().rules;
}

export function getBusinessRulesVersion() {
  return readBusinessRulesDocument().version;
}

export function getHouseholdThresholds() {
  return getBusinessRules().householdThresholds;
}

export function feeAmountFor(key) {
  const rule = getBusinessRules().feeStandards.find((item) => item.key === key);
  if (rule) return rule.amount;
  const fallback = DEFAULT_RULES.feeStandards.find((item) => item.key === key);
  return fallback ? fallback.amount : 0;
}

export function getApprovalLevels(businessType) {
  const row = getBusinessRules().approvalMatrix.find((item) => item.key === businessType);
  return row ? row.level : 'branch';
}

export function autoAcceptRuleFor(businessType) {
  const rule = getBusinessRules().autoAcceptance.find((item) => item.key === businessType);
  return rule || { key: businessType, autoAccept: false, requireSameFamilyCode: false, minAge: 18, regionScope: 'any', manualLevel: 'branch' };
}

export function getArticle140Centers() {
  return getBusinessRules().article140Centers;
}

export function getArticle140CenterIds() {
  return getArticle140Centers().map((item) => String(item.id));
}

export function isArticle140Center(centerId) {
  return getArticle140CenterIds().includes(String(centerId));
}

// 当前生效的人均配额：若新版本尚未到生效日，继续沿用上一周期的定额
export function effectiveQuotaItems() {
  const quota = getBusinessRules().quotaStandards;
  const effective = !quota.effectiveFrom || Date.parse(`${quota.effectiveFrom}T00:00:00`) <= Date.now();
  if (effective) return quota.items;
  return Array.isArray(quota.previousItems) && quota.previousItems.length ? quota.previousItems : quota.items;
}

export function quotaPerPerson(itemCode) {
  const item = effectiveQuotaItems().find((row) => row.itemCode === itemCode);
  if (item) return Number(item.quotaPerPerson) || 0;
  const fallback = DEFAULT_RULES.quotaStandards.items.find((row) => row.itemCode === itemCode);
  return fallback ? fallback.quotaPerPerson : 0;
}

export function validateBusinessRules(input) {
  const rules = normalizeRules(input);
  const errors = [];
  const { capacityRedline, smallOutlet, newOutletBaseline, minAcceptedHouseholds } = rules.householdThresholds;
  if (!(minAcceptedHouseholds > 0 && minAcceptedHouseholds <= newOutletBaseline && newOutletBaseline <= smallOutlet && smallOutlet < capacityRedline)) {
    errors.push('thresholds');
  }
  if (!rules.article140Centers.length) errors.push('article140Centers');
  if (rules.feeStandards.some((item) => !(item.amount >= 0))) errors.push('feeStandards');
  if (rules.quotaStandards.items.some((item) => !(item.quotaPerPerson > 0))) errors.push('quotaStandards');
  if (rules.autoAcceptance.some((item) => !(item.minAge >= 0))) errors.push('autoAcceptance');
  return errors;
}

function changedRuleGroups(previous, next) {
  return RULE_SECTIONS.filter((section) => JSON.stringify(previous?.[section] ?? null) !== JSON.stringify(next?.[section] ?? null));
}

function currentEffectiveQuotaItems(document) {
  const quota = document?.rules?.quotaStandards || {};
  const effective = !quota.effectiveFrom || Date.parse(`${quota.effectiveFrom}T00:00:00`) <= Date.now();
  if (effective) return quota.items || [];
  return Array.isArray(quota.previousItems) && quota.previousItems.length ? quota.previousItems : (quota.items || []);
}

/**
 * 生成新版本：版本号 +1，追加历史快照；配额变更自动顺延到下一周期生效。
 */
export function buildNextBusinessRulesVersion(currentDocument, incomingRules, actor) {
  const current = currentDocument || readBusinessRulesDocument();
  const nextRules = normalizeRules(incomingRules);
  const changedGroups = changedRuleGroups(current.rules, nextRules);

  const incomingQuota = nextRules.quotaStandards.items;
  const effectiveQuota = currentEffectiveQuotaItems(current);
  const quotaChanged = JSON.stringify(incomingQuota) !== JSON.stringify(effectiveQuota || []);
  if (quotaChanged) {
    nextRules.quotaStandards.previousItems = deepClone(effectiveQuota);
    nextRules.quotaStandards.effectiveFrom = nextCycleStart();
  } else {
    // 配额未调整时保留原有生效排期
    nextRules.quotaStandards = deepClone(current.rules.quotaStandards);
  }

  const version = Math.max(1, Number(current.version) || 1) + 1;
  const savedAt = nowStamp();
  const entry = {
    version,
    savedAt,
    savedBy: actor || '',
    changedGroups,
    rules: deepClone(nextRules)
  };
  return {
    version,
    updatedAt: savedAt,
    updatedBy: actor || '',
    rules: nextRules,
    history: [...(current.history || []), entry]
  };
}

/**
 * 计算年龄（用于自动受理的年龄门槛判定）
 */
export function ageFromBirthDate(birthDate, reference = new Date()) {
  if (!birthDate) return null;
  const date = new Date(String(birthDate).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return null;
  let age = reference.getFullYear() - date.getFullYear();
  const monthDiff = reference.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < date.getDate())) age -= 1;
  return age;
}
