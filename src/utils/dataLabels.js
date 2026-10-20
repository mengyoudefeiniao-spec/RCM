/**
 * 数据层中文词条的展示期国际化工具
 * mock 数据中的实体名称 (商品/年龄段/家庭规模/月份/省份) 为中文,
 * 在图表与表格渲染时通过本工具按当前语言转换展示文案。
 */
import { getProvinceStatsByName } from '../mock/data/geoStatsData.js';

const COMMODITY_KEYS = {
  '小麦粉': 'flour',
  '大米': 'rice',
  '食用油': 'oil',
  '白糖': 'sugar',
  '奶粉': 'milkPowder',
  '食盐': 'salt'
};

const AGE_KEYS = {
  '0-14岁': 'child',
  '0-14岁未成年人': 'child',
  '15-59岁': 'working',
  '15-59岁适龄劳动力': 'working',
  '60岁及以上': 'senior',
  '60岁及以上长者': 'senior'
};

const FAMILY_KEYS = {
  '1-2人小家庭': 'f12',
  '3-4人标准家庭': 'f34',
  '5-6大家庭': 'f56',
  '7人及以上多代家庭': 'f7p'
};

const UNIT_KEYS = {
  '吨': 'ton',
  'kg/人/月': 'kgPersonMonth',
  '%': 'percent',
  '人': 'people',
  '户': 'households',
  '人/km²': 'perKm2',
  '座': 'sites',
  '个': 'outlets',
  '户/网点': 'householdsPerOutlet'
};

/** 统计单位: 吨 → t */
export function unitLabel(t, unit) {
  const key = UNIT_KEYS[unit];
  if (!key) return unit;
  const i18nKey = `dataLabels.units.${key}`;
  const res = t(i18nKey);
  return res === i18nKey ? unit : res;
}

/** 配给设施点位名称: 苏莱曼尼亚省第15配给储备中心 → Sulaymaniyah Ration Storage Center 15 */
export function facilityPointLabel(t, locale, pt) {
  const prov = getProvinceStatsByName(pt.province);
  const province = provinceLabel(t, locale, prov || pt.province);
  const kind = pt.type === 'agent' ? 'pointAgent' : 'pointWarehouse';
  const i18nKey = `dataLabels.${kind}`;
  let res = t(i18nKey, { province, seq: pt.seq });
  if (res === i18nKey) res = pt.name;
  return res;
}

function lookup(t, prefix, name, map) {
  const key = map[name];
  if (!key) return name;
  const i18nKey = `${prefix}.${key}`;
  const res = t(i18nKey);
  return res === i18nKey ? name : res;
}

/** 商品名称: 小麦粉 → Flour */
export function commodityLabel(t, name) {
  return lookup(t, 'dataLabels.commodity', name, COMMODITY_KEYS);
}

const BUSINESS_KEYS = {
  '变更户主': 'sourceChangeHead', 'Change Head': 'sourceChangeHead',
  '申请解冻': 'sourceUnfreeze', 'Unfreeze Card': 'sourceUnfreeze',
  '申请分户': 'sourceSplit', 'Split Household': 'sourceSplit',
  '成员转移': 'sourceMemberTransfer', 'Transfer Member': 'sourceMemberTransfer'
};

export function businessLabel(t, name) {
  return lookup(t, 'review', name, BUSINESS_KEYS);
}

const COMPLAINT_KEYS = {
  '代销点缺斤短两/克扣': 'typeShortfall', 'Short Weight / Deductions': 'typeShortfall',
  '服务态度差/排队耗时': 'typeService', 'Poor Service / Long Waiting Queues': 'typeService',
  '物资品质口感异议': 'typeQuality', '物资品质/口感异议': 'typeQuality', 'Quality / Odor Complaints': 'typeQuality',
  '私自加价/违规收费': 'typeOvercharge', 'Unauthorized Overcharge / Illegal Fees': 'typeOvercharge',
  '配给份额核定有误': 'typeQuotaError', 'Quota Calculation Dispute': 'typeQuotaError',
  '违规收费': 'typeOvercharge', 'Overcharge': 'typeOvercharge',
  '少发漏发': 'typeShortfall', 'Shortfall': 'typeShortfall',
  '物资品质': 'typeQuality', 'Quality': 'typeQuality',
  '排队耗时': 'typeService', 'Long Waiting': 'typeService'
};

export function dashboardComplaintLabel(t, name) {
  return lookup(t, 'dashboard.admin', name, COMPLAINT_KEYS);
}

export function weekLabel(t, name) {
  const match = /^(?:第(\d+)周|Week\s+(\d+))$/.exec(name || '');
  return match ? t('dataLabels.week', { count: match[1] || match[2] }) : name;
}

/** 年龄段: 0-14岁未成年人 → Ages 0-14 */
export function ageLabel(t, name) {
  return lookup(t, 'dataLabels.age', name, AGE_KEYS);
}

/** 家庭规模: 3-4人标准家庭 → 3-4 members */
export function familyLabel(t, name) {
  return lookup(t, 'dataLabels.family', name, FAMILY_KEYS);
}

/** 月份: 5月 → May */
export function monthLabel(t, locale, name) {
  if (locale === 'zh') return name;
  const num = parseInt(name, 10);
  if (!num) return name;
  const i18nKey = `dataLabels.months.m${num}`;
  const res = t(i18nKey);
  return res === i18nKey ? name : res;
}

/** 省份名称: 巴格达省 → Baghdad (非中文语言使用 enName) */
export function provinceLabel(t, locale, nameOrProv) {
  const prov = typeof nameOrProv === 'string'
    ? getProvinceStatsByName(nameOrProv)
      || getProvinceStatsByName(nameOrProv.replace(/ Province$/, ''))
      || getProvinceStatsByName(nameOrProv.match(/^[^\s(]+省/)?.[0])
    : nameOrProv;
  if (!prov) return typeof nameOrProv === 'string' ? nameOrProv : '';
  if (locale === 'zh') return prov.name;
  const provinceKeys = {
    '巴格达省': 'baghdad', '尼尼微省': 'nineveh', '巴士拉省': 'basra',
    '迪亚拉省': 'diyala', '基尔库克省': 'kirkuk', '安巴尔省': 'anbar',
    '埃尔比勒省': 'erbil', '苏莱曼尼亚省': 'sulaymaniyah'
  };
  const key = provinceKeys[prov.name];
  if (key) {
    const translated = t(`dataLabels.provinces.${key}`);
    if (translated !== `dataLabels.provinces.${key}`) return translated;
  }
  return prov.enName || prov.name;
}

/**
 * 吨位纵轴刻度格式化: 中文用「万」, 其他语言用 k
 */
export function tonAxisFormatter(locale) {
  if (locale === 'zh') {
    return (v) => (v >= 10000 ? (v / 10000) + '万' : v);
  }
  return (v) => (v >= 1000 ? (v / 1000) + 'k' : v);
}
