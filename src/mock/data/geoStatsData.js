/**
 * 全国 19 省配给地理统计数据层 (地图联动统计页 / 下滑式看板共用)
 * - 省份边界 GeoJSON: src/assets/geo/iraq-governorates.geojson (geoBoundaries ADM1 简化版)
 * - 人口/面积基准: 伊拉克官方省级行政区划参考数据 (COSIT 2020 口径, 演示用途)
 * - 配给指标: 基于家庭户数 × 月度人均配给标准推演, 全程确定性伪随机 (可复现)
 */
import { IRAQ_19_PROVINCES, IRAQ_ALL_600_CENTERS } from './iraqRegionWarehouses.js';
import iraqGeo from '../../assets/geo/iraq-governorates.json';

// ============ 基础字典 ============

// GeoJSON shapeName ↔ 中文省名 映射 (哈拉卜贾省无独立边界, 由苏莱曼尼亚多边形 + 省会点标记承载)
export const PROVINCE_GEO_NAME_MAP = {
  '巴格达省': 'Baghdad', '巴士拉省': 'Al-Basrah', '尼尼微省': 'Ninawa', '基尔库克省': 'Kirkuk',
  '迪亚拉省': 'Diyala', '安巴尔省': 'Al-Anbar', '巴比伦省': 'Babil', '卡尔巴拉省': 'Karbala',
  '纳杰夫省': 'An-Najaf', '卡迪西亚省': 'Al-Qadisiyah', '穆萨纳省': 'Al-Muthanna', '济加尔省': 'Dhi Qar',
  '米桑省': 'Maysan', '瓦西特省': 'Wasit', '萨拉赫丁省': 'Salah al-Din', '埃尔比勒省': 'Erbil',
  '苏莱曼尼亚省': 'Al-Sulaimaniyah', '杜胡克省': 'Dohuk', '哈拉卜贾省': null
};

const PROVINCE_BASE = {
  '巴格达省': { pop: 8126755, area: 4555, lat: 33.3152, lng: 44.3661, urbanRate: 95 },
  '巴士拉省': { pop: 2908491, area: 19070, lat: 30.5085, lng: 47.7804, urbanRate: 75 },
  '尼尼微省': { pop: 3729998, area: 37323, lat: 36.335, lng: 43.1189, urbanRate: 68 },
  '埃尔比勒省': { pop: 2009537, area: 15074, lat: 36.1912, lng: 44.0119, urbanRate: 80 },
  '苏莱曼尼亚省': { pop: 2120700, area: 17023, lat: 35.5571, lng: 45.4351, urbanRate: 75 },
  '杜胡克省': { pop: 1342900, area: 6553, lat: 36.867, lng: 42.95, urbanRate: 64 },
  '哈拉卜贾省': { pop: 118500, area: 889, lat: 35.1787, lng: 45.9864, urbanRate: 58 },
  '基尔库克省': { pop: 1597876, area: 9679, lat: 35.4681, lng: 44.3922, urbanRate: 74 },
  '迪亚拉省': { pop: 1637226, area: 17685, lat: 33.75, lng: 44.65, urbanRate: 58 },
  '萨拉赫丁省': { pop: 1595316, area: 24363, lat: 34.61, lng: 43.68, urbanRate: 54 },
  '安巴尔省': { pop: 1771656, area: 138501, lat: 33.428, lng: 43.294, urbanRate: 62 },
  '巴比伦省': { pop: 2065042, area: 5119, lat: 32.6161, lng: 44.0253, urbanRate: 61 },
  '卡尔巴拉省': { pop: 1218732, area: 5034, lat: 32.616, lng: 44.0249, urbanRate: 72 },
  '纳杰夫省': { pop: 1471592, area: 28824, lat: 32.0003, lng: 44.3355, urbanRate: 71 },
  '瓦西特省': { pop: 1370800, area: 17153, lat: 32.4907, lng: 45.831, urbanRate: 55 },
  '米桑省': { pop: 1074100, area: 16072, lat: 31.8356, lng: 47.1456, urbanRate: 47 },
  '济加尔省': { pop: 2095172, area: 12900, lat: 31.0439, lng: 46.2573, urbanRate: 49 },
  '穆萨纳省': { pop: 818300, area: 51740, lat: 31.316, lng: 45.28, urbanRate: 44 },
  '卡迪西亚省': { pop: 1296000, area: 8153, lat: 31.992, lng: 44.926, urbanRate: 46 }
};

// 月度人均配给标准 (kg/人/月) —— 与全国月度配发约 38.4 万吨口径对齐
export const PER_PERSON_MONTHLY_KG = 10.2;
export const RATION_ITEM_STANDARDS = [
  { name: '小麦粉', kgPerPerson: 5.2 },
  { name: '大米', kgPerPerson: 2.2 },
  { name: '食用油', kgPerPerson: 0.9 },
  { name: '白糖', kgPerPerson: 1.0 },
  { name: '奶粉', kgPerPerson: 0.55 },
  { name: '食盐', kgPerPerson: 0.35 }
];

export const GEO_MONTHS = ['5月', '6月', '7月', '8月', '9月', '10月'];

// 已知省份代理网点数据 (来自管理看板 mock, 其余省份确定性推演)
const KNOWN_AGENT_STATS = {
  '巴格达省': { agentCount: 9800, complianceRate: 94.2 },
  '尼尼微省': { agentCount: 5200, complianceRate: 91.5 },
  '巴士拉省': { agentCount: 4600, complianceRate: 93.8 },
  '苏莱曼尼亚省': { agentCount: 3800, complianceRate: 96.0 },
  '埃尔比勒省': { agentCount: 3400, complianceRate: 95.5 },
  '迪亚拉省': { agentCount: 2900, complianceRate: 90.8 },
  '基尔库克省': { agentCount: 2800, complianceRate: 89.5 },
  '安巴尔省': { agentCount: 2650, complianceRate: 91.0 }
};

// 既有省份配给进度 (季度口径, 其余省份推演)
const KNOWN_PROGRESS = {
  '巴格达省': { progress: 99.4 }, '巴士拉省': { progress: 98.9 }, '尼尼微省': { progress: 98.3 },
  '苏莱曼尼亚省': { progress: 99.1 }, '埃尔比勒省': { progress: 99.0 }, '迪亚拉省': { progress: 97.6 },
  '基尔库克省': { progress: 98.1 }, '安巴尔省': { progress: 97.6 }
};

// ============ 确定性伪随机 ============
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ============ 省级统计构建 ============
function buildProvinceStats() {
  // 各省仓库数量 (来自 600 配给中心真实 mock 口径)
  const whByProvince = {};
  for (const c of IRAQ_ALL_600_CENTERS) {
    const zhName = Object.keys(PROVINCE_GEO_NAME_MAP).find(k => c.province.includes(k));
    if (!zhName) continue;
    if (!whByProvince[zhName]) whByProvince[zhName] = { total: 0, assigned: 0, vacant: 0 };
    whByProvince[zhName].total++;
    if (c.status.includes('注销')) whByProvince[zhName].vacant++;
    else whByProvince[zhName].assigned++;
  }

  const list = IRAQ_19_PROVINCES.map((prov) => {
    const base = PROVINCE_BASE[prov.name] || {};
    const rnd = mulberry32(hashStr(prov.id));
    const pop = base.pop || 800000;
    const area = base.area || 5000;
    const households = Math.round(pop / 4.05);
    const monthlyQuotaTon = Number(((pop * PER_PERSON_MONTHLY_KG) / 1000).toFixed(0));
    const fulfillment = KNOWN_PROGRESS[prov.name] ? KNOWN_PROGRESS[prov.name].progress : Number((97 + rnd() * 2.2).toFixed(1));
    const monthlyDistributedTon = Number(((monthlyQuotaTon * fulfillment) / 100).toFixed(0));
    const deviationRate = Number(((monthlyDistributedTon - monthlyQuotaTon) / monthlyQuotaTon * 100).toFixed(2));
    const wh = whByProvince[prov.name] || { total: prov.centerCount, assigned: Math.round(prov.centerCount * 0.75), vacant: prov.centerCount - Math.round(prov.centerCount * 0.75) };
    const knownAgent = KNOWN_AGENT_STATS[prov.name];
    const agentCount = knownAgent ? knownAgent.agentCount : Math.round(households / 1000) + 120 + Math.round(rnd() * 300);
    const complianceRate = knownAgent ? knownAgent.complianceRate : Number((88.5 + rnd() * 7).toFixed(1));

    // 近 6 个月配给趋势 (额度 vs 实际)
    const monthlyTrend = GEO_MONTHS.map((m, i) => {
      const r = mulberry32(hashStr(prov.id + m));
      const quota = Number((monthlyQuotaTon * (0.94 + i * 0.012)).toFixed(0));
      const rate = fulfillment - 0.9 + r() * 1.4;
      const actual = Number(((quota * rate) / 100).toFixed(0));
      return { month: m, quotaTon: quota, actualTon: actual, progress: Number(((actual / quota) * 100).toFixed(1)) };
    });

    // 人口年龄结构 (省间小幅波动)
    const young = Number((30 + rnd() * 5).toFixed(1));
    const old = Number((6.5 + rnd() * 2.2).toFixed(1));
    const ageStructure = [
      { name: '0-14岁', value: Number((pop * young / 100).toFixed(0)), percentage: young },
      { name: '15-59岁', value: Number((pop * (100 - young - old) / 100).toFixed(0)), percentage: Number((100 - young - old).toFixed(1)) },
      { name: '60岁及以上', value: Number((pop * old / 100).toFixed(0)), percentage: old }
    ];

    // 月度人均商品配额明细
    const itemQuotas = RATION_ITEM_STANDARDS.map(s => ({
      name: s.name,
      kgPerPerson: s.kgPerPerson,
      provinceTon: Number(((pop * s.kgPerPerson) / 1000).toFixed(0))
    }));

    return {
      id: prov.id,
      name: prov.name,
      enName: prov.enName,
      geoName: PROVINCE_GEO_NAME_MAP[prov.name],
      isArticle140: prov.isArticle140,
      lat: base.lat, lng: base.lng,
      areaKm2: area,
      population: pop,
      density: Number((pop / area).toFixed(1)),
      households,
      urbanRate: base.urbanRate,
      ruralRate: 100 - base.urbanRate,
      monthlyQuotaTon,
      monthlyDistributedTon,
      monthlyTrend,
      fulfillmentRate: fulfillment,
      deviationRate,
      warehouseTotal: wh.total,
      warehouseAssigned: wh.assigned,
      warehouseVacant: wh.vacant,
      agentCount,
      householdsPerAgent: Math.round(households / agentCount),
      complianceRate,
      ageStructure,
      itemQuotas
    };
  });
  return list;
}

export const PROVINCE_STATS = buildProvinceStats();

export function getProvinceStatsByName(name) {
  return PROVINCE_STATS.find(p => p.name === name || p.enName === name || p.geoName === name);
}

// ============ 省内设施点位 (仓库/代理, 确定性生成) ============
function buildFacilityPoints() {
  const pts = [];
  let seq = 1;
  for (const p of PROVINCE_STATS) {
    const rnd = mulberry32(hashStr(p.id + '-pts'));
    const n = Math.min(p.warehouseTotal, 40); // 每省最多 40 个点位, 保证渲染流畅
    for (let i = 0; i < n; i++) {
      const isVacant = i < Math.round(n * (p.warehouseVacant / Math.max(p.warehouseTotal, 1)));
      const ang = rnd() * Math.PI * 2;
      const radius = 0.15 + rnd() * 0.85;
      pts.push({
        id: `WH-${p.id}-${String(seq++).padStart(3, '0')}`,
        name: `${p.name}第${i + 1}配给储备中心`,
        province: p.name,
        type: 'warehouse',
        status: isVacant ? 'vacant' : 'assigned',
        households: isVacant ? 0 : 600 + Math.round(rnd() * 800),
        lat: Number((p.lat + Math.sin(ang) * radius * 0.55).toFixed(4)),
        lng: Number((p.lng + Math.cos(ang) * radius * 0.8).toFixed(4))
      });
    }
    // 代理网点聚合点位 (抽样呈现)
    const agentSample = Math.min(Math.max(Math.round(p.agentCount / 400), 4), 24);
    for (let i = 0; i < agentSample; i++) {
      const ang = rnd() * Math.PI * 2;
      const radius = 0.2 + rnd() * 1.1;
      pts.push({
        id: `AGT-${p.id}-${String(i + 1).padStart(3, '0')}`,
        name: `${p.name}代理网点 ${String(i + 1).padStart(2, '0')}`,
        province: p.name,
        type: 'agent',
        households: 450 + Math.round(rnd() * 1050),
        lat: Number((p.lat + Math.sin(ang) * radius * 0.5).toFixed(4)),
        lng: Number((p.lng + Math.cos(ang) * radius * 0.75).toFixed(4))
      });
    }
  }
  return pts;
}

export const FACILITY_POINTS = buildFacilityPoints();

// ============ 主题树 (统计页左侧指标树) ============
export const GEO_STAT_THEMES = [
  {
    key: 'ration',
    icon: 'Odometer',
    metrics: [
      { key: 'monthlyQuotaTon', unit: '吨', geoRange: [800, 460000], format: 'int' },
      { key: 'monthlyDistributedTon', unit: '吨', geoRange: [800, 460000], format: 'int' },
      { key: 'perCapitaKg', unit: 'kg/人/月', geoRange: [9, 11], format: 'dec' }
    ]
  },
  {
    key: 'deviation',
    icon: 'ScaleToOriginal',
    metrics: [
      { key: 'deviationRate', unit: '%', geoRange: [-3, 1], format: 'dec' },
      { key: 'fulfillmentRate', unit: '%', geoRange: [96, 100], format: 'dec' }
    ]
  },
  {
    key: 'population',
    icon: 'User',
    metrics: [
      { key: 'population', unit: '人', geoRange: [100000, 8200000], format: 'int' },
      { key: 'households', unit: '户', geoRange: [30000, 2000000], format: 'int' },
      { key: 'density', unit: '人/km²', geoRange: [15, 1800], format: 'dec' },
      { key: 'urbanRate', unit: '%', geoRange: [40, 96], format: 'dec' }
    ]
  },
  {
    key: 'warehouse',
    icon: 'OfficeBuilding',
    metrics: [
      { key: 'warehouseTotal', unit: '座', geoRange: [14, 54], format: 'int' },
      { key: 'warehouseAssigned', unit: '座', geoRange: [10, 42], format: 'int' },
      { key: 'warehouseVacant', unit: '座', geoRange: [2, 14], format: 'int' }
    ]
  },
  {
    key: 'agent',
    icon: 'Shop',
    metrics: [
      { key: 'agentCount', unit: '个', geoRange: [200, 9900], format: 'int' },
      { key: 'householdsPerAgent', unit: '户/网点', geoRange: [850, 1250], format: 'int' },
      { key: 'complianceRate', unit: '%', geoRange: [88, 97], format: 'dec' }
    ]
  }
];

export const METRIC_LABELS = {
  monthlyQuotaTon: '月度配给额度',
  monthlyDistributedTon: '月度实际配发',
  perCapitaKg: '人均配给标准',
  deviationRate: '配给额度偏差',
  fulfillmentRate: '配给履约率',
  population: '总人口',
  households: '覆盖家庭户数',
  density: '人口密度',
  urbanRate: '城镇人口占比',
  warehouseTotal: '仓库总数',
  warehouseAssigned: '已启用仓库',
  warehouseVacant: '空置待申请仓库',
  agentCount: '代理网点数',
  householdsPerAgent: '网点均载户数',
  complianceRate: '网点合规率'
};

export function getMetricLabel(key) {
  return METRIC_LABELS[key] || key;
}

// ============ 地图 GeoJSON 关联 (预关联中文省名, 供 choropleth 直接消费) ============
const ENRICHED_GEO = {
  type: 'FeatureCollection',
  features: iraqGeo.features.map(f => {
    const prov = PROVINCE_STATS.find(p => p.geoName === f.properties.name);
    return { ...f, properties: { ...f.properties, provinceName: prov ? prov.name : '苏莱曼尼亚省', isHalabjaCarrier: !prov } };
  })
};

export function getIraqGeoFeatures() {
  return ENRICHED_GEO.features;
}

export const IRAQ_GEO_JSON = ENRICHED_GEO;

// 全国汇总
export const NATIONAL_SUMMARY = (() => {
  const sum = (fn) => PROVINCE_STATS.reduce((acc, p) => acc + fn(p), 0);
  return {
    population: sum(p => p.population),
    households: sum(p => p.households),
    monthlyQuotaTon: sum(p => p.monthlyQuotaTon),
    monthlyDistributedTon: sum(p => p.monthlyDistributedTon),
    warehouseTotal: sum(p => p.warehouseTotal),
    warehouseVacant: sum(p => p.warehouseVacant),
    agentCount: sum(p => p.agentCount),
    fulfillmentRate: Number((sum(p => p.monthlyDistributedTon) / sum(p => p.monthlyQuotaTon) * 100).toFixed(1))
  };
})();

export default {
  PROVINCE_STATS,
  GEO_STAT_THEMES,
  METRIC_LABELS,
  FACILITY_POINTS,
  NATIONAL_SUMMARY,
  GEO_MONTHS,
  RATION_ITEM_STANDARDS,
  PER_PERSON_MONTHLY_KG,
  PROVINCE_GEO_NAME_MAP,
  IRAQ_GEO_JSON,
  getIraqGeoFeatures,
  getProvinceStatsByName,
  getMetricLabel
};
