/**
 * National cockpit helpers. The backend stores locale-neutral indicator keys,
 * units, province codes and chart series; every label is resolved through i18n.
 */

export const COCKPIT_MAP_METRICS = ['fulfillment', 'households', 'agents', 'sites'];

export const COCKPIT_RADAR_KEYS = ['fulfillment', 'compliance', 'uptime', 'sync'];

// Iraq-inspired palette: flag green / red / black with the gold of the national emblem.
export const IRAQ_PALETTE = Object.freeze({
  green: '#007A3D', deepGreen: '#0B4D2B', red: '#CE1126', black: '#141414', gold: '#C9A13B', cream: '#F4E9D2', sand: '#EFE4CC'
});

export const COCKPIT_SCALE = ['#DCEADF', '#B9D6C2', '#86B99B', '#4E8D69', '#2B5D45'];

export const COCKPIT_FULFILLMENT_SCALE = ['#CE1126', '#D9694A', '#E3B36A', '#8FBF9F', '#007A3D'];

export const COCKPIT_NUMBER_LOCALES = { zh: 'zh-CN', en: 'en-GB', ar: 'ar-IQ', ckb: 'ckb-IQ' };

export function cockpitNumberLocale(locale) {
  return COCKPIT_NUMBER_LOCALES[locale] || 'en-GB';
}

/** Formats a cockpit value with the active language's digits and separators. */
export function formatCockpitValue(value, unit, locale) {
  const numeric = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(numeric)) return '—';
  const maximumFractionDigits = unit === 'percent' ? 1 : 0;
  return new Intl.NumberFormat(cockpitNumberLocale(locale), { maximumFractionDigits }).format(numeric);
}

/** Compact axis labels: 12.4万 for zh, 12k for the other locales. */
export function compactCockpitNumber(value, locale) {
  const numeric = Number(value) || 0;
  if (locale === 'zh') return numeric >= 10000 ? (numeric / 10000).toFixed(numeric >= 100000 ? 0 : 1) + '万' : String(Math.round(numeric));
  if (numeric >= 1000) return (numeric / 1000).toFixed(numeric >= 10000 ? 0 : 1) + 'k';
  return String(Math.round(numeric));
}

export function normalizeCockpitIndicator(indicator = {}) {
  const value = Number(indicator.value);
  const trend = Number(indicator.trend);
  return {
    key: String(indicator.key || ''),
    value: Number.isFinite(value) ? value : 0,
    unit: String(indicator.unit || 'count'),
    trend: Number.isFinite(trend) ? trend : 0,
    tone: indicator.tone === 'watch' ? 'watch' : 'good'
  };
}

function normalizeCockpitProvince(province = {}) {
  const numeric = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };
  return {
    provinceCode: String(province.provinceCode || ''),
    name: String(province.name || ''),
    population: numeric(province.population),
    households: numeric(province.households),
    fulfillment: numeric(province.fulfillment),
    agents: numeric(province.agents),
    sites: numeric(province.sites),
    ration: numeric(province.ration),
    lat: numeric(province.lat),
    lng: numeric(province.lng)
  };
}

function normalizeCockpitCharts(charts = {}) {
  const numeric = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };
  return {
    months: Array.isArray(charts.months) ? charts.months.map(numeric) : [],
    quota: Array.isArray(charts.quota) ? charts.quota.map(numeric) : [],
    actual: Array.isArray(charts.actual) ? charts.actual.map(numeric) : [],
    items: Array.isArray(charts.items)
      ? charts.items.filter((item) => item && item.key).map((item) => ({ key: String(item.key), value: numeric(item.value) }))
      : []
  };
}

/** Defensive shaping of the PocketBase cockpit record for the view. */
export function normalizeCockpitOverview(payload = {}) {
  return {
    updatedAt: payload.updatedAt || '',
    indicators: Array.isArray(payload.indicators) ? payload.indicators.map(normalizeCockpitIndicator).filter((item) => item.key) : [],
    provinces: Array.isArray(payload.provinces) ? payload.provinces.map(normalizeCockpitProvince).filter((item) => item.provinceCode || item.name) : [],
    charts: normalizeCockpitCharts(payload.charts)
  };
}

export function cockpitProvinceValue(province, metric) {
  if (!province) return 0;
  return Number(province[metric]) || 0;
}

export function cockpitMetricRange(provinces = [], metric) {
  const values = provinces.map((province) => cockpitProvinceValue(province, metric));
  if (!values.length) return [0, 0];
  return [Math.min(...values), Math.max(...values)];
}

/** Ranked province list for the bar charts (locale-neutral, highest first). */
export function cockpitProvinceTop(provinces = [], metric, limit = 8) {
  return provinces
    .filter((province) => province.provinceCode)
    .sort((a, b) => cockpitProvinceValue(b, metric) - cockpitProvinceValue(a, metric))
    .slice(0, limit);
}

export function cockpitIndicatorValue(indicators = [], key) {
  return Number(indicators.find((indicator) => indicator.key === key)?.value) || 0;
}

/** Radar series around system operations (0–100 scale). */
export function cockpitRadarSeries(indicators = []) {
  return COCKPIT_RADAR_KEYS.map((key) => ({ key, value: cockpitIndicatorValue(indicators, key) }));
}

/** Maps a 0–1 ratio onto the sequential green scale used by the map. */
export function cockpitColor(ratio) {
  const clamped = Math.min(1, Math.max(0, Number(ratio) || 0));
  const index = Math.min(COCKPIT_SCALE.length - 1, Math.floor(clamped * COCKPIT_SCALE.length));
  return COCKPIT_SCALE[index];
}

/** Fulfillment thresholds keep most provinces green/gold with red only for laggards. */
export function cockpitFulfillmentColor(value) {
  const numeric = Number(value) || 0;
  if (numeric >= 99) return '#007A3D';
  if (numeric >= 98.5) return '#4E8D69';
  if (numeric >= 98) return '#9CC9A8';
  if (numeric >= 97.5) return '#E3B36A';
  return '#CE1126';
}

/** Fulfillment uses the flag palette (low red → gold → high green). */
export function cockpitColorForMetric(ratio, metric = '') {
  const clamped = Math.min(1, Math.max(0, Number(ratio) || 0));
  const scale = metric === 'fulfillment' ? COCKPIT_FULFILLMENT_SCALE : COCKPIT_SCALE;
  const index = Math.min(scale.length - 1, Math.floor(clamped * scale.length));
  return scale[index];
}
