<template>
  <section class="cockpit mx-auto max-w-[1720px] space-y-3 p-3 sm:p-4">
    <header class="cockpit-hero">
      <div class="flex min-w-0 items-center gap-3">
        <span class="cockpit-hero__icon"><el-icon><Monitor /></el-icon></span>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h1>{{ t('cockpit.title') }}</h1>
            <span class="cockpit-badge" :class="'is-' + healthTone">{{ t('cockpit.' + healthTone) }}</span>
          </div>
          <p class="cockpit-hero__subtitle">{{ t('cockpit.subtitle') }}</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="cockpit-updated">{{ t('cockpit.updatedAt', { time: updatedTime }) }}</span>
        <el-button size="small" :loading="loading" @click="load">
          <el-icon><Refresh /></el-icon>{{ t('cockpit.refresh') }}
        </el-button>
      </div>
    </header>

    <div v-if="loadFailed" class="cockpit-error">
      <el-icon class="text-lg"><Warning /></el-icon>
      <p>{{ t('cockpit.loadFailed') }}</p>
      <el-button size="small" type="primary" plain @click="load">{{ t('cockpit.retry') }}</el-button>
    </div>

    <template v-else>
      <div class="cockpit-grid">
        <aside class="cockpit-side cockpit-side--start">
          <article v-for="indicator in leftIndicators" :key="indicator.key" class="cockpit-kpi" :class="'is-' + indicator.tone">
            <span class="cockpit-kpi__icon"><el-icon><component :is="indicatorIcon(indicator.key)" /></el-icon></span>
            <div class="cockpit-kpi__body">
              <p class="cockpit-kpi__label">{{ indicatorLabel(indicator) }}</p>
              <p class="cockpit-kpi__value"><bdi dir="ltr">{{ formatIndicator(indicator) }}</bdi><span class="cockpit-kpi__unit">{{ unitLabel(indicator) }}</span></p>
              <p class="cockpit-kpi__trend">{{ trendLabel(indicator) }}</p>
            </div>
          </article>
        </aside>

        <div class="cockpit-map-card">
          <div class="cockpit-map-head">
            <div class="min-w-0">
              <h2>{{ t('cockpit.mapTitle') }}</h2>
              <p>{{ t('cockpit.mapHint') }}</p>
            </div>
            <div class="cockpit-metrics" role="group" :aria-label="t('cockpit.mapMetricLabel')">
              <button v-for="option in metricOptions" :key="option.key" type="button" class="cockpit-metric" :class="{ 'is-active': option.key === activeMetric }" @click="activeMetric = option.key">{{ option.label }}</button>
            </div>
          </div>
          <div class="cockpit-map-wrap">
            <div ref="mapEl" class="cockpit-map" dir="ltr"></div>
            <div v-if="loading" class="cockpit-map-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>{{ t('cockpit.loading') }}</span>
            </div>
            <div v-if="selectedProvince" class="cockpit-province">
              <div class="cockpit-province__head">
                <div class="min-w-0">
                  <p class="cockpit-province__eyebrow">{{ t('cockpit.provinceDetail') }}</p>
                  <h3>{{ provinceLabel(selectedProvince.provinceCode) }}</h3>
                </div>
                <button type="button" class="cockpit-province__close" :aria-label="t('cockpit.closeDetail')" @click="selectedProvinceCode = ''">×</button>
              </div>
              <dl class="cockpit-province__grid">
                <div><dt>{{ t('cockpit.fieldPopulation') }}</dt><dd>{{ formatCockpitValue(selectedProvince.population, 'people', locale) }}</dd></div>
                <div><dt>{{ t('cockpit.fieldHouseholds') }}</dt><dd>{{ formatCockpitValue(selectedProvince.households, 'households', locale) }}</dd></div>
                <div><dt>{{ t('cockpit.fieldFulfillment') }}</dt><dd>{{ formatCockpitValue(selectedProvince.fulfillment, 'percent', locale) }}%</dd></div>
                <div><dt>{{ t('cockpit.fieldAgents') }}</dt><dd>{{ formatCockpitValue(selectedProvince.agents, 'outlets', locale) }}</dd></div>
                <div><dt>{{ t('cockpit.fieldSites') }}</dt><dd>{{ formatCockpitValue(selectedProvince.sites, 'sites', locale) }}</dd></div>
              </dl>
            </div>
          </div>
          <div class="cockpit-legend">
            <span class="cockpit-legend__label">{{ t('cockpit.legendTitle') }} · {{ t('cockpit.mapMetrics.' + activeMetric) }}</span>
            <span class="cockpit-legend__scale" :style="{ background: legendGradient }"></span>
            <span class="cockpit-legend__range"><bdi dir="ltr">{{ legendRange[0] }}</bdi> – <bdi dir="ltr">{{ legendRange[1] }}</bdi></span>
          </div>
        </div>

        <aside class="cockpit-side cockpit-side--end">
          <article v-for="indicator in rightIndicators" :key="indicator.key" class="cockpit-kpi" :class="'is-' + indicator.tone">
            <span class="cockpit-kpi__icon"><el-icon><component :is="indicatorIcon(indicator.key)" /></el-icon></span>
            <div class="cockpit-kpi__body">
              <p class="cockpit-kpi__label">{{ indicatorLabel(indicator) }}</p>
              <p class="cockpit-kpi__value"><bdi dir="ltr">{{ formatIndicator(indicator) }}</bdi><span class="cockpit-kpi__unit">{{ unitLabel(indicator) }}</span></p>
              <p class="cockpit-kpi__trend">{{ trendLabel(indicator) }}</p>
            </div>
          </article>
        </aside>
      </div>

      <div class="cockpit-strip">
        <article v-for="indicator in stripIndicators" :key="indicator.key" class="cockpit-mini" :class="'is-' + indicator.tone">
          <span class="cockpit-mini__icon"><el-icon><component :is="indicatorIcon(indicator.key)" /></el-icon></span>
          <div class="min-w-0">
            <p class="cockpit-mini__label">{{ indicatorLabel(indicator) }}</p>
            <p class="cockpit-mini__value"><bdi dir="ltr">{{ formatIndicator(indicator) }}</bdi><span>{{ unitLabel(indicator) }}</span></p>
          </div>
        </article>
      </div>

      <p class="cockpit-source">{{ t('cockpit.source') }}</p>
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bell, Box, CircleCheck, Connection, DataAnalysis, Goods, House, Loading, MapLocation,
  Monitor, Odometer, Refresh, Shop, Stamp, TrendCharts, User, Warning
} from '@element-plus/icons-vue';
import { getCockpitOverview } from '../../api/cockpit.js';
import { getIraqGeoFeatures } from '../../mock/data/geoStatsData.js';
import { REVIEW_SCOPE_REGIONS } from '../../utils/reviewPermission.js';
import {
  COCKPIT_MAP_METRICS, COCKPIT_SCALE, cockpitColor, cockpitMetricRange, cockpitNumberLocale,
  cockpitProvinceValue, formatCockpitValue, normalizeCockpitOverview
} from '../../utils/nationalCockpit.js';

const { t, te, locale } = useI18n();

const ICONS = {
  population: User, households: House, provinces: MapLocation, agents: Shop, sites: Box,
  inventory: Goods, fulfillment: TrendCharts, compliance: CircleCheck, reviews: Stamp,
  messages: Bell, uptime: Odometer, sync: Connection
};

const overview = ref({ updatedAt: '', indicators: [], provinces: [] });
const loading = ref(true);
const loadFailed = ref(false);
const activeMetric = ref('fulfillment');
const selectedProvinceCode = ref('');
const mapEl = ref(null);

const indicators = computed(() => overview.value.indicators);
const leftIndicators = computed(() => indicators.value.slice(0, 3));
const rightIndicators = computed(() => indicators.value.slice(3, 6));
const stripIndicators = computed(() => indicators.value.slice(6, 12));
const healthTone = computed(() => indicators.value.some((indicator) => indicator.tone === 'watch') ? 'watch' : 'healthy');
const metricOptions = computed(() => COCKPIT_MAP_METRICS.map((key) => ({ key, label: t('cockpit.mapMetrics.' + key) })));
const legendRange = computed(() => cockpitMetricRange(overview.value.provinces, activeMetric.value).map((value) => formatCockpitValue(value, activeMetric.value === 'fulfillment' ? 'percent' : 'int', locale.value)));
const legendGradient = computed(() => 'linear-gradient(90deg, ' + COCKPIT_SCALE.join(', ') + ')');
const selectedProvince = computed(() => overview.value.provinces.find((province) => province.provinceCode === selectedProvinceCode.value) || null);
const updatedTime = computed(() => {
  if (!overview.value.updatedAt) return '—';
  const date = new Date(overview.value.updatedAt);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(cockpitNumberLocale(locale.value), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
});

let map;
let geoLayer;
let resizeObserver;

function indicatorIcon(key) { return ICONS[key] || DataAnalysis; }
function indicatorLabel(indicator) { const key = 'cockpit.indicators.' + indicator.key; return te(key) ? t(key) : indicator.key; }
function unitLabel(indicator) { const key = 'cockpit.units.' + (indicator.unit || ''); return te(key) ? t(key) : ''; }
function formatIndicator(indicator) { return formatCockpitValue(indicator.value, indicator.unit, locale.value); }
function trendLabel(indicator) {
  if (!indicator.trend) return t('cockpit.trendFlat');
  const value = formatCockpitValue(Math.abs(indicator.trend), 'percent', locale.value);
  return t(indicator.trend > 0 ? 'cockpit.trendUp' : 'cockpit.trendDown', { value });
}
function provinceLabel(provinceCode) {
  const region = REVIEW_SCOPE_REGIONS.find((item) => item.code === provinceCode);
  return region ? t('systemExtras.' + region.labelKey) : provinceCode;
}
function provinceForGeoName(name) {
  // GeoJSON keeps Chinese province names only as a geometry key; records store ISO-like codes.
  const region = REVIEW_SCOPE_REGIONS.find((item) => item.value === name);
  return region ? overview.value.provinces.find((province) => province.provinceCode === region.code) || null : null;
}

function styleForFeature(feature) {
  const province = provinceForGeoName(feature?.properties?.provinceName);
  const [min, max] = cockpitMetricRange(overview.value.provinces, activeMetric.value);
  const value = province ? cockpitProvinceValue(province, activeMetric.value) : min;
  const ratio = max > min ? (value - min) / (max - min) : 0.5;
  const selected = province?.provinceCode && province.provinceCode === selectedProvinceCode.value;
  return {
    fillColor: cockpitColor(ratio),
    fillOpacity: selected ? 0.95 : 0.82,
    color: selected ? '#1f3326' : '#ffffff',
    weight: selected ? 2.4 : 1
  };
}

function tooltipHtml(name) {
  const province = provinceForGeoName(name);
  const label = province?.provinceCode ? provinceLabel(province.provinceCode) : name;
  if (!province) return '<strong>' + label + '</strong>';
  const unit = activeMetric.value === 'fulfillment' ? '%' : '';
  const value = formatCockpitValue(cockpitProvinceValue(province, activeMetric.value), activeMetric.value === 'fulfillment' ? 'percent' : 'int', locale.value);
  return '<strong>' + label + '</strong><span>' + t('cockpit.mapMetrics.' + activeMetric.value) + ': ' + value + unit + '</span>';
}

function renderMap() {
  if (!mapEl.value) return;
  if (!map) {
    map = L.map(mapEl.value, { zoomControl: true, attributionControl: false, scrollWheelZoom: true, minZoom: 5, maxZoom: 9, zoomSnap: 0.25 });
  }
  if (geoLayer) geoLayer.remove();
  geoLayer = L.geoJSON({ type: 'FeatureCollection', features: getIraqGeoFeatures() }, {
    style: (feature) => styleForFeature(feature),
    onEachFeature: (feature, layer) => {
      const name = feature?.properties?.provinceName;
      layer.bindTooltip(() => tooltipHtml(name), { sticky: true, direction: 'top', className: 'cockpit-tooltip' });
      layer.on('mouseover', () => layer.setStyle({ weight: 2.2, color: '#2f7a50' }));
      layer.on('mouseout', () => layer.setStyle(styleForFeature(feature)));
      layer.on('click', () => {
        const province = provinceForGeoName(name);
        selectedProvinceCode.value = province?.provinceCode && province.provinceCode !== selectedProvinceCode.value ? province.provinceCode : '';
      });
    }
  }).addTo(map);
  map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] });
  window.setTimeout(() => map?.invalidateSize(), 60);
}

function restyleMap() {
  if (!geoLayer) return;
  geoLayer.eachLayer((layer) => layer.setStyle(styleForFeature(layer.feature)));
}

async function load() {
  loading.value = true;
  loadFailed.value = false;
  try {
    overview.value = normalizeCockpitOverview(await getCockpitOverview());
    if (selectedProvinceCode.value && !overview.value.provinces.some((province) => province.provinceCode === selectedProvinceCode.value)) selectedProvinceCode.value = '';
  } catch {
    loadFailed.value = true;
    overview.value = { updatedAt: '', indicators: [], provinces: [] };
  } finally {
    loading.value = false;
    await nextTick();
    renderMap();
  }
}

watch(activeMetric, () => restyleMap());
watch(selectedProvinceCode, () => restyleMap());
watch(() => locale.value, () => restyleMap());

onMounted(async () => {
  await load();
  resizeObserver = new ResizeObserver(() => map?.invalidateSize());
  if (mapEl.value) resizeObserver.observe(mapEl.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = undefined;
  map?.remove();
  map = undefined;
  geoLayer = undefined;
});
</script>

<style scoped>
.cockpit { color: #1f3326; }
.cockpit-hero { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; border: 1px solid #d9e5db; border-radius: .75rem; padding: .75rem 1rem; background: linear-gradient(120deg, #1f3326, #2f5240 58%, #326445); color: #fff; box-shadow: 0 8px 22px -16px rgba(31, 51, 38, .7); }
.cockpit-hero__icon { display: inline-flex; width: 2.5rem; height: 2.5rem; flex: 0 0 auto; align-items: center; justify-content: center; border: 1px solid rgba(229, 206, 161, .55); border-radius: .625rem; background: rgba(255, 255, 255, .12); color: #f3d9a4; font-size: 1.25rem; }
.cockpit-hero h1 { margin: 0; font-size: 1.0625rem; font-weight: 800; }
.cockpit-hero__subtitle { margin: .125rem 0 0; color: rgba(255, 255, 255, .72); font-size: .75rem; }
.cockpit-badge { display: inline-flex; align-items: center; gap: .3rem; border: 1px solid rgba(255, 255, 255, .26); border-radius: 999px; padding: .1rem .5rem; background: rgba(255, 255, 255, .12); font-size: .6875rem; font-weight: 600; }
.cockpit-badge::before { content: ''; width: .375rem; height: .375rem; border-radius: 50%; background: #7ed9a0; }
.cockpit-badge.is-watch::before { background: #f3c46b; }
.cockpit-updated { color: rgba(255, 255, 255, .72); font-size: .6875rem; }
.cockpit-error { display: flex; flex-direction: column; align-items: center; gap: .5rem; border: 1px solid #f0d9c0; border-radius: .75rem; background: #fffaf3; padding: 2rem 1rem; color: #a9752a; text-align: center; }
.cockpit-error p { margin: 0; font-size: .8125rem; }
.cockpit-grid { display: grid; grid-template-areas: 'start map end'; grid-template-columns: minmax(170px, .85fr) minmax(0, 2.5fr) minmax(170px, .85fr); gap: .75rem; align-items: stretch; }
.cockpit-side { display: flex; flex-direction: column; justify-content: space-between; gap: .75rem; min-width: 0; }
.cockpit-side--start { grid-area: start; }
.cockpit-side--end { grid-area: end; }
.cockpit-kpi { display: flex; flex: 0 0 auto; min-width: 0; align-items: flex-start; gap: .625rem; border: 1px solid #d9e5db; border-radius: .65rem; background: #fff; padding: .7rem .75rem; box-shadow: 0 2px 6px rgba(31, 51, 38, .03); }
.cockpit-kpi__icon { display: inline-flex; width: 2.1rem; height: 2.1rem; flex: 0 0 auto; align-items: center; justify-content: center; border: 1px solid #dceadf; border-radius: .55rem; background: #eef6f0; color: #2f7a50; }
.cockpit-kpi.is-watch .cockpit-kpi__icon { border-color: #efdcb8; background: #fdf3e0; color: #a9752a; }
.cockpit-kpi__body { min-width: 0; }
.cockpit-kpi__label { margin: 0; color: #58685d; font-size: .6875rem; font-weight: 600; line-height: 1.35; }
.cockpit-kpi__value { display: flex; align-items: baseline; gap: .25rem; margin: .125rem 0; color: #1f3326; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 1.25rem; font-weight: 800; line-height: 1.15; }
.cockpit-kpi__unit { color: #8a9a8f; font-family: inherit; font-size: .6875rem; font-weight: 600; }
.cockpit-kpi__trend { margin: 0; color: #2f7a50; font-size: .625rem; font-weight: 600; }
.cockpit-kpi.is-watch .cockpit-kpi__trend { color: #a9752a; }
.cockpit-map-card { position: relative; display: flex; flex-direction: column; grid-area: map; min-width: 0; overflow: hidden; border: 1px solid #d9e5db; border-radius: .75rem; background: #fff; box-shadow: 0 2px 6px rgba(31, 51, 38, .03); }
.cockpit-map-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .5rem; padding: .7rem .875rem .5rem; }
.cockpit-map-head h2 { margin: 0; color: #24483a; font-size: .875rem; font-weight: 700; }
.cockpit-map-head p { margin: .125rem 0 0; color: #8a9a8f; font-size: .6875rem; }
.cockpit-metrics { display: flex; flex-wrap: wrap; gap: .25rem; }
.cockpit-metric { border: 1px solid #d9e5db; border-radius: 999px; padding: .2rem .55rem; background: #f6faf7; color: #52675a; font-size: .6875rem; font-weight: 600; cursor: pointer; transition: background-color .15s ease, color .15s ease, border-color .15s ease; }
.cockpit-metric:hover { border-color: #b9d4c1; color: #2f7a50; }
.cockpit-metric.is-active { border-color: #2f7a50; background: #2f7a50; color: #fff; }
.cockpit-map-wrap { position: relative; flex: 1; min-height: 0; }
.cockpit-map { height: clamp(320px, 48vh, 520px); background: #f4f8f5; }
.cockpit-map-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: .4rem; background: rgba(244, 248, 245, .82); color: #52675a; font-size: .75rem; }
.cockpit-province { position: absolute; inset-block-end: .75rem; inset-inline-start: .75rem; width: min(300px, calc(100% - 1.5rem)); border: 1px solid #d9e5db; border-radius: .6rem; background: rgba(255, 255, 255, .96); padding: .6rem .7rem; box-shadow: 0 10px 24px -18px rgba(31, 51, 38, .8); backdrop-filter: blur(4px); }
.cockpit-province__head { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; }
.cockpit-province__eyebrow { margin: 0; color: #8a9a8f; font-size: .625rem; font-weight: 600; }
.cockpit-province h3 { margin: .05rem 0 0; color: #1f3326; font-size: .8125rem; font-weight: 700; }
.cockpit-province__close { border: 0; background: transparent; color: #8a9a8f; font-size: 1.125rem; line-height: 1; cursor: pointer; }
.cockpit-province__close:hover { color: #1f3326; }
.cockpit-province__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .35rem .6rem; margin: .5rem 0 0; }
.cockpit-province__grid dt { color: #8a9a8f; font-size: .625rem; }
.cockpit-province__grid dd { margin: 0; color: #24483a; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .75rem; font-weight: 700; }
.cockpit-legend { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; border-top: 1px solid #edf3ee; padding: .45rem .875rem .55rem; }
.cockpit-legend__label { color: #52675a; font-size: .625rem; font-weight: 600; }
.cockpit-legend__scale { width: 120px; height: 6px; border-radius: 999px; }
.cockpit-legend__range { color: #8a9a8f; font-size: .625rem; }
.cockpit-strip { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .5rem; }
.cockpit-mini { display: flex; min-width: 0; align-items: center; gap: .5rem; border: 1px solid #d9e5db; border-radius: .6rem; background: #fff; padding: .5rem .6rem; }
.cockpit-mini__icon { display: inline-flex; width: 1.8rem; height: 1.8rem; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: .5rem; background: #eef6f0; color: #2f7a50; }
.cockpit-mini.is-watch .cockpit-mini__icon { background: #fdf3e0; color: #a9752a; }
.cockpit-mini__label { margin: 0; color: #58685d; font-size: .625rem; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cockpit-mini__value { display: flex; align-items: baseline; gap: .2rem; margin: .05rem 0 0; color: #1f3326; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .8125rem; font-weight: 800; }
.cockpit-mini__value span { color: #8a9a8f; font-family: inherit; font-size: .5625rem; font-weight: 600; }
.cockpit-source { margin: 0; color: #9aa89f; font-size: .625rem; text-align: end; }
.cockpit :deep(.cockpit-tooltip) { border: 1px solid #d9e5db; border-radius: .45rem; background: #fff; padding: .35rem .5rem; box-shadow: 0 6px 16px -12px rgba(31, 51, 38, .8); color: #1f3326; font-size: .6875rem; }
.cockpit :deep(.cockpit-tooltip strong) { display: block; font-size: .75rem; }
.cockpit :deep(.cockpit-tooltip span) { color: #52675a; }
.cockpit :deep(.leaflet-container) { background: #f4f8f5; font: inherit; }
.cockpit :deep(.leaflet-control-zoom a) { color: #326445; }
@media (max-width: 1180px) {
  .cockpit-grid { grid-template-columns: minmax(160px, 1fr) minmax(0, 2.2fr) minmax(160px, 1fr); }
  .cockpit-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1023px) {
  .cockpit-grid { grid-template-areas: 'map map' 'start start' 'end end'; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cockpit-side { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cockpit-kpi { flex: initial; }
  .cockpit-map { height: clamp(300px, 46vh, 460px); }
}
@media (max-width: 767px) {
  .cockpit-side, .cockpit-side--end { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cockpit-kpi__value { font-size: 1.0625rem; }
}
@media (max-width: 639px) {
  .cockpit-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cockpit-hero { padding: .625rem .75rem; }
  .cockpit-map-head { padding: .6rem .75rem .4rem; }
}
</style>
