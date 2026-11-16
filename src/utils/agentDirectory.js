// Agent company branches and the agent registry are shared business data.
// Every human-readable field is stored as a multilingual object so the same
// PocketBase record renders correctly in zh / en / ar / ckb.
import { isPocketBaseSyncEnabled, readPocketBaseValue, writePocketBaseValue } from '../services/pocketBaseSync.js';

export const AGENT_BRANCHES_KEY = 'rcm_shared_agent_company_branches';
export const AGENT_DIRECTORY_KEY = 'rcm_shared_agent_directory';

const COMPANY_BRANCH_SEED = [
  {
    code: 'BAG-KARKH-01',
    centerId: '101',
    names: {
      zh: '卡尔赫第一粮食供应分部',
      en: 'Karkh First Grain Supply Branch',
      ar: 'فرع تموين الكرخ الأول',
      ckb: 'لقی یەکەمی دابینکردنی خۆراکی کەرخ'
    }
  },
  {
    code: 'BAG-RUSAFA-02',
    centerId: '108',
    names: {
      zh: '鲁萨法第二粮食供应分部',
      en: 'Rusafa Second Grain Supply Branch',
      ar: 'فرع تموين الرصافة الثاني',
      ckb: 'لقی دووەمی دابینکردنی خۆراکی ڕەسافە'
    }
  },
  {
    code: 'DIY-KHANAQIN-01',
    centerId: '496',
    names: {
      zh: '迪亚拉东部粮食保障分部',
      en: 'Diyala Eastern Grain Supply Branch',
      ar: 'فرع تموين شرق ديالى',
      ckb: 'لقی دابینکردنی خۆراکی ڕۆژهەڵاتی دیالە'
    }
  },
  {
    code: 'BAS-ASHAR-01',
    centerId: '201',
    names: {
      zh: '巴士拉港口配给保障分部',
      en: 'Basra Port Ration Supply Branch',
      ar: 'فرع تموين ميناء البصرة',
      ckb: 'لقی دابینکردنی خۆراکی بەندەری بەسرە'
    }
  },
  {
    code: 'NIN-MOSUL-01',
    centerId: '305',
    names: {
      zh: '尼尼微西部战后保供分部',
      en: 'Nineveh Western Supply Branch',
      ar: 'فرع تموين غرب نينوى',
      ckb: 'لقی دابینکردنی ڕۆژئاوای نەینەوا'
    }
  },
  {
    code: 'KRK-AZADI-01',
    centerId: '412',
    names: {
      zh: '基尔库克多民族联合保供分部',
      en: 'Kirkuk Multi-Community Supply Branch',
      ar: 'فرع تموين كركوك المشترك',
      ckb: 'لقی دابینکردنی هاوبەشی کەرکووک'
    }
  },
  {
    code: 'NAJ-KUFA-01',
    centerId: '508',
    names: {
      zh: '纳杰夫省粮食专员公署',
      en: 'Najaf Grain Commission Branch',
      ar: 'مفوضية الحبوب في النجف',
      ckb: 'نووسینگەی دانەی نەجەف'
    }
  }
];

const AGENT_DIRECTORY_SEED = [
  {
    agentNo: 'FA-00128',
    branchCode: 'BAG-KARKH-01',
    centerId: '101',
    phone: '07701122339',
    demoAccount: true,
    shopNames: {
      zh: '卡尔赫第一配给中心综合代销站',
      en: 'Karkh First Ration Center Comprehensive Outlet',
      ar: 'منفذ الكرخ الأول الشامل لمركز التموين',
      ckb: 'فرۆشگای گشتگیری ناوەندی خۆراکی کەرخی یەکەم'
    },
    ownerNames: {
      zh: '穆罕默德·贾巴尔·拉希德',
      en: 'Mohammed Jabbar Rashid',
      ar: 'محمد جبار رشيد',
      ckb: 'محەمەد جەبار ڕەشید'
    }
  },
  {
    agentNo: 'FD-00129',
    branchCode: 'DIY-KHANAQIN-01',
    centerId: '496',
    phone: '07701122339',
    shopNames: {
      zh: '哈奈根第一边境综合代销保供站',
      en: 'Khanaqin First Border Supply Outlet',
      ar: 'منفذ خانقين الأول الحدودي للتموين',
      ckb: 'فرۆشگای سنووری یەکەمی خانەقین'
    },
    ownerNames: {
      zh: '穆罕默德·贾巴尔·拉希德',
      en: 'Mohammed Jabbar Rashid',
      ar: 'محمد جبار رشيد',
      ckb: 'محەمەد جەبار ڕەشید'
    }
  },
  {
    agentNo: 'FL-00130',
    branchCode: 'BAG-RUSAFA-02',
    centerId: '108',
    phone: '07701122339',
    shopNames: {
      zh: '萨德尔城中央第 5 面粉代销网点',
      en: 'Sadr City Central No. 5 Flour Outlet',
      ar: 'منفذ الطحين الخامس في مدينة الصدر',
      ckb: 'فرۆشگای ئاردی ژمارە ٥ی ناوەندی سەدر'
    },
    ownerNames: {
      zh: '穆罕默德·贾巴尔·拉希德',
      en: 'Mohammed Jabbar Rashid',
      ar: 'محمد جبار رشيد',
      ckb: 'محەمەد جەبار ڕەشید'
    }
  },
  {
    agentNo: 'FL-00341',
    branchCode: 'BAG-RUSAFA-02',
    centerId: '102',
    phone: '07702233445',
    shopNames: {
      zh: '鲁萨法面粉专项代销点',
      en: 'Rusafa Flour Specialized Outlet',
      ar: 'منفذ الرصافة المتخصص بالطحين',
      ckb: 'فرۆشگای تایبەتی ئاردی ڕەسافە'
    },
    ownerNames: {
      zh: '萨利姆·努里',
      en: 'Salim Nuri',
      ar: 'سالم نوري',
      ckb: 'سالیم نوری'
    }
  },
  {
    agentNo: 'FA-00210',
    branchCode: 'BAS-ASHAR-01',
    centerId: '201',
    phone: '07803344556',
    shopNames: {
      zh: '巴士拉阿夏尔港口联合代销站',
      en: 'Basra Ashar Port Joint Outlet',
      ar: 'منفذ ميناء العشار المشترك في البصرة',
      ckb: 'فرۆشگای هاوبەشی بەندەری عەشار لە بەسرە'
    },
    ownerNames: {
      zh: '哈立德·奥马尔',
      en: 'Khalid Omar',
      ar: 'خالد عمر',
      ckb: 'خالید عومەر'
    }
  },
  {
    agentNo: 'FA-00305',
    branchCode: 'NIN-MOSUL-01',
    centerId: '305',
    phone: '07718899221',
    shopNames: {
      zh: '摩苏尔老城保供代销中心',
      en: 'Mosul Old City Supply Outlet',
      ar: 'منفذ تموين مدينة الموصل القديمة',
      ckb: 'فرۆشگای دابینکردنی شاری کۆنی موسڵ'
    },
    ownerNames: {
      zh: '塔里克·纳吉姆·阿齐兹',
      en: 'Tariq Najm Aziz',
      ar: 'طارق نجم عزيز',
      ckb: 'تاریق نەجم عەزیز'
    }
  },
  {
    agentNo: 'FA-00412',
    branchCode: 'KRK-AZADI-01',
    centerId: '412',
    phone: '07504455667',
    shopNames: {
      zh: '基尔库克第一石油新村代销处',
      en: 'Kirkuk First Oil District Outlet',
      ar: 'منفذ حي النفط الأول في كركوك',
      ckb: 'فرۆشگای یەکەمی گەڕەکی نەوتی کەرکووک'
    },
    ownerNames: {
      zh: '尤素夫·卡里姆·库尔迪',
      en: 'Yusuf Karim Kurdi',
      ar: 'يوسف كريم الكردي',
      ckb: 'یوسف کەریم کوردی'
    }
  },
  {
    agentNo: 'FL-00508',
    branchCode: 'NAJ-KUFA-01',
    centerId: '508',
    phone: '07812233889',
    shopNames: {
      zh: '纳杰夫古城便民面粉代销点',
      en: 'Najaf Old City Flour Outlet',
      ar: 'منفذ طحين مدينة النجف القديمة',
      ckb: 'فرۆشگای ئاردی شاری کۆنی نەجەف'
    },
    ownerNames: {
      zh: '贾法尔·穆萨维',
      en: 'Jafar Mousavi',
      ar: 'جعفر الموسوي',
      ckb: 'جەعفەر موسەوی'
    }
  }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// `ku` is the legacy language code kept by the mock layer; the catalog is `ckb`.
export function normalizeAgentLang(lang) {
  return lang === 'ku' ? 'ckb' : lang;
}

export function localizeAgentNames(names, lang = 'zh') {
  if (!names || typeof names !== 'object') return '';
  const code = normalizeAgentLang(lang);
  return names[code] || names.en || names.zh || Object.values(names).find(Boolean) || '';
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
    const local = JSON.parse(localStorage.getItem(key) || 'null');
    return local;
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
      // Keep a local copy so the registration flow is not blocked.
    }
  }
  localStorage.setItem(key, JSON.stringify(value));
}

function isValidBranchList(value) {
  return Array.isArray(value) && value.every(branch => branch?.code && branch?.names);
}

function isValidDirectory(value) {
  return Array.isArray(value) && value.every(entry => entry?.agentNo && entry?.branchCode);
}

export function normalizeAgentNo(value) {
  return String(value || '').trim().toUpperCase();
}

export function isValidAgentNo(value) {
  return /^(FA|FD|FL)-\d{5}$/.test(normalizeAgentNo(value));
}

/**
 * Seeds the demo branch/agent directory once and returns the shared records.
 * The records live in PocketBase so every device and every language reads the
 * same source of truth.
 */
export async function loadAgentDirectory() {
  let branches = await readShared(AGENT_BRANCHES_KEY);
  if (!isValidBranchList(branches) || branches.length === 0) {
    branches = clone(COMPANY_BRANCH_SEED);
    await writeShared(AGENT_BRANCHES_KEY, branches);
  }
  let entries = await readShared(AGENT_DIRECTORY_KEY);
  if (!isValidDirectory(entries) || entries.length === 0) {
    entries = clone(AGENT_DIRECTORY_SEED).map(entry => ({
      ...entry,
      claimed: Boolean(entry.demoAccount),
      claimedNationalId: null,
      claimedAt: null
    }));
    await writeShared(AGENT_DIRECTORY_KEY, entries);
  }
  return { branches, entries };
}

export async function getAgentCompanyBranches() {
  const { branches } = await loadAgentDirectory();
  return branches;
}

export async function getAgentDirectoryEntries() {
  const { entries } = await loadAgentDirectory();
  return entries;
}

export async function findAgentDirectoryEntry(agentNo, branchCode) {
  const normalizedNo = normalizeAgentNo(agentNo);
  const normalizedBranch = String(branchCode || '').trim();
  if (!normalizedNo || !normalizedBranch) return null;
  const { branches, entries } = await loadAgentDirectory();
  const entry = entries.find(item => normalizeAgentNo(item.agentNo) === normalizedNo && item.branchCode === normalizedBranch);
  if (!entry) return null;
  const branch = branches.find(item => item.code === entry.branchCode) || null;
  return {
    ...entry,
    branchNames: branch?.names || {},
    centerId: entry.centerId || branch?.centerId || null
  };
}

/**
 * Marks an agent number as used by a registered account so the same
 * company branch + agent number pair cannot be claimed twice.
 */
export async function claimAgentDirectoryEntry(agentNo, claim = {}) {
  const normalizedNo = normalizeAgentNo(agentNo);
  const entries = await getAgentDirectoryEntries();
  const index = entries.findIndex(item => normalizeAgentNo(item.agentNo) === normalizedNo);
  if (index < 0) return null;
  entries[index] = {
    ...entries[index],
    claimed: true,
    claimedNationalId: claim.nationalId || null,
    claimedPhone: claim.phone || null,
    claimedAt: claim.claimedAt || new Date().toISOString()
  };
  await writeShared(AGENT_DIRECTORY_KEY, entries);
  return entries[index];
}
