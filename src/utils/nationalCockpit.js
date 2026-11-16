/**
 * National cockpit helpers. The backend stores locale-neutral indicator keys,
 * units and province codes; every label is resolved through i18n at render time.
 */

export const COCKPIT_MAP_METRICS = ['fulfillment', 'households', 'agents', 'sites'];

export const COCKPIT_SCALE = ['#EDF4EF', '#C9DFD0', '#96C2A8', '#5E9B74', '#2F6B4C'];

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
    sites: numeric(province.sites)
  };
}

/** Defensive shaping of the PocketBase cockpit record for the view. */
export function normalizeCockpitOverview(payload = {}) {
  return {
    updatedAt: payload.updatedAt || '',
    indicators: Array.isArray(payload.indicators) ? payload.indicators.map(normalizeCockpitIndicator).filter((item) => item.key) : [],
    provinces: Array.isArray(payload.provinces) ? payload.provinces.map(normalizeCockpitProvince).filter((item) => item.provinceCode || item.name) : []
  };
}

export function cockpitProvinceValue(province, metric) {
  if (!province || !COCKPIT_MAP_METRICS.includes(metric)) return 0;
  return Number(province[metric]) || 0;
}

export function cockpitMetricRange(provinces = [], metric) {
  const values = provinces.map((province) => cockpitProvinceValue(province, metric));
  if (!values.length) return [0, 0];
  return [Math.min(...values), Math.max(...values)];
}

/** Maps a 0–1 ratio onto the sequential green scale used by the map. */
export function cockpitColor(ratio) {
  const clamped = Math.min(1, Math.max(0, Number(ratio) || 0));
  const index = Math.min(COCKPIT_SCALE.length - 1, Math.floor(clamped * COCKPIT_SCALE.length));
  return COCKPIT_SCALE[index];
}
