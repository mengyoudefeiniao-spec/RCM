// Agent family roster: the households an outlet is already responsible for.
// Human-readable business fields are stored as multilingual objects so one
// PocketBase record renders correctly in zh / en / ar / ckb, and language
// switching never rewrites the stored data.
import { isPocketBaseSyncEnabled, readPocketBaseValue, writePocketBaseValue } from '../services/pocketBaseSync.js';

export const AGENT_FAMILY_ROSTER_KEY = 'rcm_shared_agent_family_roster';
export const AGENT_FAMILY_DEMO_SITE_ID = 'FA-00128';
export const AGENT_FAMILY_CURRENT_BATCH = '2026-11';

// Language-neutral current-batch claim state, keyed by ration card number.
const CLAIM_STATUS_BY_CARD = {
  'RC-10029381': 'CLAIMED',
  'RC-10029382': 'CLAIMED',
  'RC-10029383': 'PENDING',
  'RC-10029384': 'CLAIMED',
  'RC-10029385': 'PENDING',
  'RC-10029386': 'PARTIAL',
  'RC-10029387': 'PENDING',
  'RC-10029388': 'CLAIMED',
  'RC-10029389': 'CLAIMED',
  'RC-10029390': 'PENDING',
  'RC-10029391': 'PARTIAL',
  'RC-10029392': 'CLAIMED'
};

const ROSTER_SEED = [
  {
    id: 'FA-00128-RC-10029381',
    agentId: 'FA-00128',
    cardNo: 'RC-10029381',
    familyCode: 'FAM-BAG-08832',
    headNames: {
      zh: '艾哈迈德·哈桑·萨利赫',
      en: 'Ahmed Hassan Saleh',
      ar: 'أحمد حسن صالح',
      ckb: 'ئەحمەد حەسەن ساڵح'
    },
    nationalId: '197582910481',
    phone: '07701234567',
    memberCount: 5,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔街区14号',
      en: 'No. 14, Mansour District, Al-Karkh, Baghdad',
      ar: 'رقم 14، حي المنصور، الكرخ، بغداد',
      ckb: 'ژمارە 14، گەڕەکی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2024-03-15',
    quota: { flourKg: 45, riceKg: 22.5, oilL: 6 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-12'
  },
  {
    id: 'FA-00128-RC-10029382',
    agentId: 'FA-00128',
    cardNo: 'RC-10029382',
    familyCode: 'FAM-BAG-08833',
    headNames: {
      zh: '阿里·侯赛因·拉希姆',
      en: 'Ali Hussein Rahim',
      ar: 'علي حسين رحيم',
      ckb: 'عەلی حوسێن ڕەحیم'
    },
    nationalId: '198210150992',
    phone: '07701234588',
    memberCount: 6,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔商业街18号附3号',
      en: 'No. 18-B3, Mansour Commercial Street, Al-Karkh, Baghdad',
      ar: 'رقم 18/3، شارع المنصور التجاري، الكرخ، بغداد',
      ckb: 'ژمارە 18/3، شەقامی بازرگانی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2024-04-10',
    quota: { flourKg: 54, riceKg: 27, oilL: 7.2 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-11'
  },
  {
    id: 'FA-00128-RC-10029383',
    agentId: 'FA-00128',
    cardNo: 'RC-10029383',
    familyCode: 'FAM-BAG-08834',
    headNames: {
      zh: '海德尔·穆尔塔达·贾西姆',
      en: 'Haider Murtada Jasim',
      ar: 'حيدر مرتضى جاسم',
      ckb: 'حەیدەر مورتەزا جاسم'
    },
    nationalId: '197904221103',
    phone: '07701234599',
    memberCount: 4,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔街区绿树巷2号',
      en: 'No. 2, Green Lane, Mansour District, Al-Karkh, Baghdad',
      ar: 'رقم 2، زقاق الأشجار الخضراء، حي المنصور، الكرخ، بغداد',
      ckb: 'ژمارە 2، کۆڵانی درەختی سەوز، گەڕەکی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2024-05-18',
    quota: { flourKg: 36, riceKg: 18, oilL: 4.8 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-09'
  },
  {
    id: 'FA-00128-RC-10029384',
    agentId: 'FA-00128',
    cardNo: 'RC-10029384',
    familyCode: 'FAM-BAG-08835',
    headNames: {
      zh: '法蒂玛·扎赫拉·纳赛尔',
      en: 'Fatima Zahra Nasser',
      ar: 'فاطمة زهراء ناصر',
      ckb: 'فاتیمە زەهرا ناسر'
    },
    nationalId: '198607180024',
    phone: '07701234610',
    memberCount: 3,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔中心花园北路9号',
      en: 'No. 9, North Garden Road, Mansour Center, Al-Karkh, Baghdad',
      ar: 'رقم 9، طريق الحديقة الشمالي، مركز المنصور، الكرخ، بغداد',
      ckb: 'ژمارە 9، شەقامی باخی باکوور، ناوەندی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2024-06-01',
    quota: { flourKg: 27, riceKg: 13.5, oilL: 3.6 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-12'
  },
  {
    id: 'FA-00128-RC-10029385',
    agentId: 'FA-00128',
    cardNo: 'RC-10029385',
    familyCode: 'FAM-BAG-08836',
    headNames: {
      zh: '奥马尔·法鲁克·巴希尔',
      en: 'Omar Farouk Bashir',
      ar: 'عمر فاروق بشير',
      ckb: 'عومەر فاروق بەشیر'
    },
    nationalId: '199103091155',
    phone: '07701234621',
    memberCount: 7,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔商务外环11号',
      en: 'No. 11, Mansour Business Ring, Al-Karkh, Baghdad',
      ar: 'رقم 11، الحلقة التجارية للمنصور، الكرخ، بغداد',
      ckb: 'ژمارە 11، بازنەی بازرگانی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2024-07-22',
    quota: { flourKg: 63, riceKg: 31.5, oilL: 8.4 },
    cardStatus: 'SUSPENDED',
    complianceStatus: 'PENDING',
    lastVerifiedAt: '2026-08-28'
  },
  {
    id: 'FA-00128-RC-10029386',
    agentId: 'FA-00128',
    cardNo: 'RC-10029386',
    familyCode: 'FAM-BAG-08837',
    headNames: {
      zh: '塔里克·阿齐兹·阿卜杜拉',
      en: 'Tariq Aziz Abdullah',
      ar: 'طارق عزيز عبد الله',
      ckb: 'تاریق عەزیز عەبدوڵا'
    },
    nationalId: '197311200846',
    phone: '07701234632',
    memberCount: 5,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔中段77号',
      en: 'No. 77, Mansour Middle Section, Al-Karkh, Baghdad',
      ar: 'رقم 77، وسط المنصور، الكرخ، بغداد',
      ckb: 'ژمارە 77، ناوەڕاستی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2024-08-05',
    quota: { flourKg: 45, riceKg: 22.5, oilL: 6 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-08'
  },
  {
    id: 'FA-00128-RC-10029387',
    agentId: 'FA-00128',
    cardNo: 'RC-10029387',
    familyCode: 'FAM-BAG-08838',
    headNames: {
      zh: '穆斯塔法·卡迈勒·萨巴赫',
      en: 'Mustafa Kamel Sabah',
      ar: 'مصطفى كامل صباح',
      ckb: 'مستەفا کامیل سەباح'
    },
    nationalId: '198809140327',
    phone: '07701234643',
    memberCount: 4,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔南苑3号楼',
      en: 'Building 3, Mansour South Court, Al-Karkh, Baghdad',
      ar: 'مبنى 3، حوش المنصور الجنوبي، الكرخ، بغداد',
      ckb: 'بینای 3، حەوشەی باشووری مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2024-09-12',
    quota: { flourKg: 36, riceKg: 18, oilL: 4.8 },
    cardStatus: 'REVIEW',
    complianceStatus: 'PENDING',
    lastVerifiedAt: '2026-09-30'
  },
  {
    id: 'FA-00128-RC-10029388',
    agentId: 'FA-00128',
    cardNo: 'RC-10029388',
    familyCode: 'FAM-BAG-08839',
    headNames: {
      zh: '宰纳卜·卡西姆·哈米德',
      en: 'Zainab Qasim Hamid',
      ar: 'زينب قاسم حامد',
      ckb: 'زەینەب قاسم حەمید'
    },
    nationalId: '199405260518',
    phone: '07701234654',
    memberCount: 6,
    addresses: {
      zh: '巴格达市卡尔赫区亚尔穆克商业环岛西侧6号',
      en: 'No. 6, West of Yarmouk Commercial Circle, Al-Karkh, Baghdad',
      ar: 'رقم 6، غرب دوار اليرموك التجاري، الكرخ، بغداد',
      ckb: 'ژمارە 6، ڕۆژئاوای خولی بازرگانی یارموک، کەرخ، بەغدا'
    },
    assignedDate: '2024-10-03',
    quota: { flourKg: 54, riceKg: 27, oilL: 7.2 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-10'
  },
  {
    id: 'FA-00128-RC-10029389',
    agentId: 'FA-00128',
    cardNo: 'RC-10029389',
    familyCode: 'FAM-BAG-08840',
    headNames: {
      zh: '优素福·卡里姆·萨利姆',
      en: 'Yusuf Karim Salim',
      ar: 'يوسف كريم سليم',
      ckb: 'یووسف کەریم سەلیم'
    },
    nationalId: '198002130761',
    phone: '07701234665',
    memberCount: 8,
    addresses: {
      zh: '巴格达市卡尔赫区海法街88号',
      en: 'No. 88, Haifa Street, Al-Karkh, Baghdad',
      ar: 'رقم 88، شارع حيفا، الكرخ، بغداد',
      ckb: 'ژمارە 88، شەقامی حەیفا، کەرخ، بەغدا'
    },
    assignedDate: '2024-11-19',
    quota: { flourKg: 72, riceKg: 36, oilL: 9.6 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-07'
  },
  {
    id: 'FA-00128-RC-10029390',
    agentId: 'FA-00128',
    cardNo: 'RC-10029390',
    familyCode: 'FAM-BAG-08841',
    headNames: {
      zh: '玛丽亚姆·侯赛因·阿里',
      en: 'Maryam Hussein Ali',
      ar: 'مريم حسين علي',
      ckb: 'مەریەم حوسێن عەلی'
    },
    nationalId: '199712080434',
    phone: '07701234676',
    memberCount: 2,
    addresses: {
      zh: '巴格达市卡尔赫区哈德拉绿化带社区中路22号',
      en: 'No. 22, Khadraa Green Community Middle Road, Al-Karkh, Baghdad',
      ar: 'رقم 22، الطريق الأوسط لمجتمع الخضراء السكني، الكرخ، بغداد',
      ckb: 'ژمارە 22، شەقامی ناوەڕاستی کۆمەڵگەی خەزرا، کەرخ، بەغدا'
    },
    assignedDate: '2025-01-08',
    quota: { flourKg: 18, riceKg: 9, oilL: 2.4 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-13'
  },
  {
    id: 'FA-00128-RC-10029391',
    agentId: 'FA-00128',
    cardNo: 'RC-10029391',
    familyCode: 'FAM-BAG-08842',
    headNames: {
      zh: '易卜拉欣·纳吉·哈桑',
      en: 'Ibrahim Naji Hassan',
      ar: 'إبراهيم ناجي حسن',
      ckb: 'ئیبراهیم ناجی حەسەن'
    },
    nationalId: '198506210887',
    phone: '07701234687',
    memberCount: 5,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔街区14号附2号',
      en: 'No. 14-B2, Mansour District, Al-Karkh, Baghdad',
      ar: 'رقم 14/2، حي المنصور، الكرخ، بغداد',
      ckb: 'ژمارە 14/2، گەڕەکی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2025-02-14',
    quota: { flourKg: 45, riceKg: 22.5, oilL: 6 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-12'
  },
  {
    id: 'FA-00128-RC-10029392',
    agentId: 'FA-00128',
    cardNo: 'RC-10029392',
    familyCode: 'FAM-BAG-08843',
    headNames: {
      zh: '哈南·马哈茂德·阿卜杜勒',
      en: 'Hanan Mahmoud Abdul',
      ar: 'حنان محمود عبد',
      ckb: 'حەنان مەحمود عەبدول'
    },
    nationalId: '199208301126',
    phone: '07701234698',
    memberCount: 4,
    addresses: {
      zh: '巴格达市卡尔赫区曼苏尔商业街26号',
      en: 'No. 26, Mansour Commercial Street, Al-Karkh, Baghdad',
      ar: 'رقم 26، شارع المنصور التجاري، الكرخ، بغداد',
      ckb: 'ژمارە 26، شەقامی بازرگانی مەنسوور، کەرخ، بەغدا'
    },
    assignedDate: '2025-03-02',
    quota: { flourKg: 36, riceKg: 18, oilL: 4.8 },
    cardStatus: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    lastVerifiedAt: '2026-10-06'
  }
];

// `ku` is the language code used by the mock layer; the catalog is `ckb`.
export function normalizeRosterLang(lang) {
  return String(lang || '') === 'ku' ? 'ckb' : String(lang || 'zh');
}

export function localizeRosterNames(names, lang = 'zh') {
  if (!names || typeof names !== 'object') return '';
  const code = normalizeRosterLang(lang);
  return names[code] || names.en || names.zh || names.ar || Object.values(names).find(Boolean) || '';
}

/** Resolves the multilingual record into display-ready strings for one language. */
export function localizeAgentFamily(record, lang = 'zh') {
  if (!record || typeof record !== 'object') return record;
  return {
    ...record,
    headName: localizeRosterNames(record.headNames, lang),
    address: localizeRosterNames(record.addresses, lang)
  };
}

/**
 * Households are searched by every stored language, so a citizen query typed in
 * Arabic still matches the record while the interface runs in Kurdish or English.
 */
export function searchAgentFamilies(list, keyword) {
  const query = String(keyword || '').trim().toLowerCase();
  if (!query) return Array.isArray(list) ? list : [];
  return (Array.isArray(list) ? list : []).filter((family) => {
    if (!family || typeof family !== 'object') return false;
    const fields = [
      family.cardNo,
      family.familyCode,
      family.nationalId,
      family.phone,
      ...Object.values(family.headNames || {}),
      ...Object.values(family.addresses || {})
    ];
    return fields.some((value) => String(value || '').toLowerCase().includes(query));
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Adds the current batch claim state and sugar quota to records created before
 * these fields existed. Existing values are kept so outlet updates are never
 * overwritten. Sugar follows the monthly 1 kg per registered member standard.
 */
export function normalizeRosterRecords(records) {
  return (Array.isArray(records) ? records : []).map((record) => ({
    ...record,
    currentBatch: record.currentBatch || AGENT_FAMILY_CURRENT_BATCH,
    claimStatus: record.claimStatus || CLAIM_STATUS_BY_CARD[record.cardNo] || 'PENDING',
    quota: {
      ...record.quota,
      sugarKg: Number(record.quota?.sugarKg) || (Number(record.memberCount) || 0)
    }
  }));
}

function isValidRoster(value) {
  return Array.isArray(value) && value.length > 0
    && value.every((record) => record?.cardNo && record?.headNames && record?.addresses);
}

async function readShared(key) {
  if (isPocketBaseSyncEnabled()) {
    try {
      const remote = await readPocketBaseValue(key);
      if (remote != null) return remote;
    } catch {
      // Offline or misconfigured PocketBase: fall back to the local cache.
    }
  }
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

async function writeShared(key, value) {
  if (isPocketBaseSyncEnabled()) {
    try {
      await writePocketBaseValue(key, value);
      return;
    } catch {
      // Keep the local copy so the roster is still usable offline.
    }
  }
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Returns the outlet family register. The multilingual records live in
 * PocketBase under AGENT_FAMILY_ROSTER_KEY so every device and language reads
 * the same roster; the seed is written only when the record is missing.
 */
export async function loadAgentFamilyRoster() {
  const stored = await readShared(AGENT_FAMILY_ROSTER_KEY);
  if (isValidRoster(stored)) {
    const normalized = normalizeRosterRecords(stored);
    const changed = normalized.some((record, index) =>
      record.currentBatch !== stored[index]?.currentBatch
      || record.claimStatus !== stored[index]?.claimStatus
      || record.quota?.sugarKg !== stored[index]?.quota?.sugarKg);
    if (changed) await writeShared(AGENT_FAMILY_ROSTER_KEY, normalized);
    return normalized;
  }
  const seeded = normalizeRosterRecords(clone(ROSTER_SEED));
  await writeShared(AGENT_FAMILY_ROSTER_KEY, seeded);
  return seeded;
}
