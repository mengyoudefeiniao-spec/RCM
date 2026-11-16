<template>
  <section class="cockpit mx-auto max-w-[1720px] space-y-3 p-3 sm:p-4">
    <header class="cockpit-hero">
      <div class="flex min-w-0 items-center gap-3">
        <span class="cockpit-hero__icon"><el-icon><Monitor /></el-icon></span>
        <div class="min-w-0">
          <h1>{{ t('cockpit.title') }}</h1>
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

    <div v-else class="cockpit-layout">
      <aside class="cockpit-rail cockpit-rail--left">
        <article class="cockpit-chart">
          <header class="cockpit-chart__head"><span class="cockpit-chart__dot"></span><h3>{{ t('cockpit.charts.fulfillmentTrend') }}</h3></header>
          <div ref="trendEl" class="bidi-ltr cockpit-chart__body"></div>
        </article>
        <article class="cockpit-chart">
          <header class="cockpit-chart__head"><span class="cockpit-chart__dot is-gold"></span><h3>{{ t('cockpit.charts.itemMix') }}</h3></header>
          <div ref="mixEl" class="bidi-ltr cockpit-chart__body"></div>
        </article>
      </aside>

      <div class="cockpit-center">
        <div class="cockpit-map-head">
          <div class="min-w-0">
            <h2>{{ t('cockpit.mapTitle') }}</h2>
            <p>{{ t('cockpit.mapHint') }}</p>
          </div>
          <div class="cockpit-metrics" role="group" :aria-label="t('cockpit.mapMetricLabel')">
            <button v-for="option in metricOptions" :key="option.key" type="button" class="cockpit-metric" :class="{ 'is-active': option.key === activeMetric }" @click="activeMetric = option.key">{{ option.label }}</button>
          </div>
        </div>

        <div class="cockpit-map-canvas">
          <div v-if="loading" class="cockpit-map-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>{{ t('cockpit.loading') }}</span>
          </div>
          <Cockpit25DMap
            v-else
            :provinces="overview.provinces"
            :metric="activeMetric"
            :selected-code="selectedProvinceCode"
            @select="selectProvince"
          />
        </div>

        <div class="cockpit-map-footer">
          <div class="cockpit-legend">
            <span class="cockpit-legend__label">{{ t('cockpit.legendTitle') }} · {{ t('cockpit.mapMetrics.' + activeMetric) }}</span>
            <span class="cockpit-legend__scale" :style="{ background: legendGradient }"></span>
            <span class="cockpit-legend__range"><bdi dir="ltr">{{ legendRange[0] }}</bdi> – <bdi dir="ltr">{{ legendRange[1] }}</bdi></span>
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
      </div>

      <aside class="cockpit-rail cockpit-rail--right">
        <article class="cockpit-chart">
          <header class="cockpit-chart__head"><span class="cockpit-chart__dot"></span><h3>{{ t('cockpit.charts.rationTop') }}</h3></header>
          <div ref="rationEl" class="bidi-ltr cockpit-chart__body"></div>
        </article>
        <article class="cockpit-chart">
          <header class="cockpit-chart__head"><span class="cockpit-chart__dot is-navy"></span><h3>{{ t('cockpit.charts.systemRadar') }}</h3></header>
          <div ref="radarEl" class="bidi-ltr cockpit-chart__body"></div>
        </article>
      </aside>

      <div class="cockpit-bottom">
        <article class="cockpit-chart">
          <header class="cockpit-chart__head"><span class="cockpit-chart__dot"></span><h3>{{ t('cockpit.charts.agentTop') }}</h3></header>
          <div ref="agentsEl" class="bidi-ltr cockpit-chart__body"></div>
        </article>
        <article class="cockpit-chart">
          <header class="cockpit-chart__head"><span class="cockpit-chart__dot is-gold"></span><h3>{{ t('cockpit.charts.fulfillmentRank') }}</h3><span class="cockpit-chart__meta">{{ t('cockpit.charts.nationalAverage') }} {{ formatCockpitValue(nationalFulfillment, 'percent', locale) }}%</span></header>
          <div ref="fulfillmentEl" class="bidi-ltr cockpit-chart__body"></div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import * as echarts from 'echarts';
import { Loading, Monitor, Refresh, Warning } from '@element-plus/icons-vue';
import { getCockpitOverview } from '../../api/cockpit.js';
import { REVIEW_SCOPE_REGIONS } from '../../utils/reviewPermission.js';
import Cockpit25DMap from './components/Cockpit25DMap.vue';
import {
  COCKPIT_MAP_METRICS, COCKPIT_SCALE, cockpitIndicatorValue, cockpitMetricRange,
  cockpitNumberLocale, cockpitProvinceTop, cockpitRadarSeries,
  compactCockpitNumber, formatCockpitValue, normalizeCockpitOverview
} from '../../utils/nationalCockpit.js';

const { t, te, locale } = useI18n();

const overview = ref({ updatedAt: '', indicators: [], provinces: [], charts: { months: [], quota: [], actual: [], items: [] } });
const loading = ref(true);
const loadFailed = ref(false);
const activeMetric = ref('fulfillment');
const selectedProvinceCode = ref('');

const trendEl = ref(null);
const mixEl = ref(null);
const rationEl = ref(null);
const radarEl = ref(null);
const agentsEl = ref(null);
const fulfillmentEl = ref(null);
const charts = {};
let resizeObserver;

const indicators = computed(() => overview.value.indicators);
const metricOptions = computed(() => COCKPIT_MAP_METRICS.map((key) => ({ key, label: t('cockpit.mapMetrics.' + key) })));
const legendGradient = computed(() => 'linear-gradient(90deg, ' + COCKPIT_SCALE.join(', ') + ')');
const legendRange = computed(() => cockpitMetricRange(overview.value.provinces, activeMetric.value)
  .map((value) => formatCockpitValue(value, activeMetric.value === 'fulfillment' ? 'percent' : 'int', locale.value)));
const selectedProvince = computed(() => overview.value.provinces.find((province) => province.provinceCode === selectedProvinceCode.value) || null);
const rationTop = computed(() => cockpitProvinceTop(overview.value.provinces, 'ration', 6));
const agentTop = computed(() => cockpitProvinceTop(overview.value.provinces, 'agents', 8));
const fulfillmentTop = computed(() => cockpitProvinceTop(overview.value.provinces, 'fulfillment', 8));
const nationalFulfillment = computed(() => cockpitIndicatorValue(indicators.value, 'fulfillment'));
const RADAR_LABEL_KEYS = { fulfillment: 'radarFulfillment', compliance: 'radarCompliance', uptime: 'radarUptime', sync: 'radarSync' };
const updatedTime = computed(() => {
  if (!overview.value.updatedAt) return '—';
  const date = new Date(overview.value.updatedAt);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(cockpitNumberLocale(locale.value), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
});

function provinceLabel(code) {
  const region = REVIEW_SCOPE_REGIONS.find((item) => item.code === code);
  return region ? t('systemExtras.' + region.labelKey) : code;
}

function valueLabel(unit) {
  return (value) => formatCockpitValue(value, unit, locale.value) + (unit === 'percent' ? '%' : '');
}

function chartFor(key, element) {
  if (!element || !element.clientWidth) return null;
  if (!charts[key]) charts[key] = echarts.init(element);
  return charts[key];
}

function renderTrendChart() {
  const chart = chartFor('trend', trendEl.value);
  if (!chart) return;
  const { months, quota, actual } = overview.value.charts;
  chart.setOption({
    textStyle: { fontSize: 10, color: '#52675a' },
    tooltip: { trigger: 'axis', valueFormatter: (value) => formatCockpitValue(value, 'int', locale.value) },
    legend: { top: 0, itemWidth: 10, itemHeight: 8, textStyle: { fontSize: 10, color: '#58685D' }, data: [t('cockpit.charts.quota'), t('cockpit.charts.actual')] },
    grid: { left: 4, right: 8, top: 28, bottom: 2, containLabel: true },
    xAxis: {
      type: 'category',
      data: months.map((month) => te('dataLabels.months.m' + month) ? t('dataLabels.months.m' + month) : String(month)),
      axisTick: { show: false }, axisLine: { lineStyle: { color: '#D9E5DB' } }, axisLabel: { fontSize: 9, color: '#7C8B80' }
    },
    yAxis: {
      type: 'value', axisLabel: { fontSize: 9, color: '#7C8B80', formatter: (value) => compactCockpitNumber(value, locale.value) },
      splitLine: { lineStyle: { type: 'dashed', color: '#EDF3EE' } }
    },
    series: [
      { name: t('cockpit.charts.quota'), type: 'bar', barMaxWidth: 14, itemStyle: { color: '#A8C8B0', borderRadius: [3, 3, 0, 0] }, data: quota },
      { name: t('cockpit.charts.actual'), type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 2, color: '#2F7A50' }, itemStyle: { color: '#2F7A50' }, areaStyle: { color: 'rgba(47,122,80,.12)' }, data: actual }
    ]
  }, true);
}

function renderMixChart() {
  const chart = chartFor('mix', mixEl.value);
  if (!chart) return;
  const items = overview.value.charts.items.map((item) => ({
    name: te('dataLabels.commodity.' + item.key) ? t('dataLabels.commodity.' + item.key) : item.key,
    value: item.value
  }));
  chart.setOption({
    tooltip: { trigger: 'item', valueFormatter: (value) => formatCockpitValue(value, 'int', locale.value) },
    legend: { bottom: 0, left: 'center', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 9, color: '#58685D' } },
    color: ['#326445', '#5C8A6B', '#8FBFA3', '#C9A13B', '#7FA48C', '#B7D3C1'],
    series: [{
      type: 'pie', radius: ['42%', '64%'], center: ['50%', '42%'],
      itemStyle: { borderColor: '#fff', borderWidth: 1 }, label: { show: false }, emphasis: { label: { show: false } }, data: items
    }]
  }, true);
}

function renderRationChart() {
  const chart = chartFor('ration', rationEl.value);
  if (!chart) return;
  const list = [...rationTop.value].reverse();
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value) => formatCockpitValue(value, 'int', locale.value) },
    grid: { left: 4, right: 40, top: 6, bottom: 2, containLabel: true },
    xAxis: {
      type: 'value', axisLabel: { fontSize: 9, color: '#7C8B80', formatter: (value) => compactCockpitNumber(value, locale.value) },
      splitLine: { lineStyle: { type: 'dashed', color: '#EDF3EE' } }
    },
    yAxis: { type: 'category', data: list.map((province) => provinceLabel(province.provinceCode)), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { fontSize: 9, color: '#58685D' } },
    series: [{
      type: 'bar', barWidth: 10, data: list.map((province) => province.ration),
      itemStyle: { color: '#326445', borderRadius: [0, 3, 3, 0] },
      showBackground: true, backgroundStyle: { color: '#F0F6F1', borderRadius: [0, 3, 3, 0] },
      label: { show: true, position: 'right', fontSize: 9, color: '#52675a', formatter: ({ value }) => compactCockpitNumber(value, locale.value) }
    }]
  }, true);
}

function renderRadarChart() {
  const chart = chartFor('radar', radarEl.value);
  if (!chart) return;
  const radar = cockpitRadarSeries(indicators.value);
  chart.setOption({
    tooltip: { trigger: 'item', valueFormatter: (value) => formatCockpitValue(value, 'percent', locale.value) + '%' },
    radar: {
      center: ['50%', '54%'], radius: '50%', splitNumber: 4,
      axisName: { fontSize: 9, color: '#58685D' },
      axisLine: { lineStyle: { color: '#E3EDE5' } },
      splitLine: { lineStyle: { color: '#E3EDE5' } },
      splitArea: { areaStyle: { color: ['rgba(47,122,80,.02)', 'rgba(47,122,80,.06)'] } },
      indicator: radar.map((item) => ({ name: t('cockpit.charts.' + RADAR_LABEL_KEYS[item.key]), max: 100 }))
    },
    series: [{
      type: 'radar', symbolSize: 4, lineStyle: { color: '#2F7A50', width: 2 }, itemStyle: { color: '#2F7A50' },
      areaStyle: { color: 'rgba(47,122,80,.18)' },
      data: [{ value: radar.map((item) => item.value), name: t('cockpit.charts.systemRadar') }]
    }]
  }, true);
}

function renderAgentsChart() {
  const chart = chartFor('agents', agentsEl.value);
  if (!chart) return;
  const list = agentTop.value;
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value) => formatCockpitValue(value, 'int', locale.value) },
    grid: { left: 4, right: 8, top: 12, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: list.map((province) => provinceLabel(province.provinceCode)),
      axisTick: { show: false }, axisLine: { lineStyle: { color: '#D9E5DB' } },
      axisLabel: { fontSize: 9, color: '#58685D', interval: 0, rotate: 28 }
    },
    yAxis: {
      type: 'value', axisLabel: { fontSize: 9, color: '#7C8B80', formatter: (value) => compactCockpitNumber(value, locale.value) },
      splitLine: { lineStyle: { type: 'dashed', color: '#EDF3EE' } }
    },
    series: [{
      type: 'bar', barMaxWidth: 26, data: list.map((province) => province.agents),
      itemStyle: { borderRadius: [3, 3, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#2F7A50' }, { offset: 1, color: '#A8C8B0' }]) }
    }]
  }, true);
}

function renderFulfillmentChart() {
  const chart = chartFor('fulfillment', fulfillmentEl.value);
  if (!chart) return;
  const list = fulfillmentTop.value;
  const values = list.map((province) => province.fulfillment);
  const floor = Math.max(90, Math.floor(Math.min(...values) - 1));
  chart.setOption({
    tooltip: { trigger: 'axis', valueFormatter: (value) => formatCockpitValue(value, 'percent', locale.value) + '%' },
    grid: { left: 4, right: 8, top: 24, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: list.map((province) => provinceLabel(province.provinceCode)),
      axisTick: { show: false }, axisLine: { lineStyle: { color: '#D9E5DB' } },
      axisLabel: { fontSize: 9, color: '#58685D', interval: 0, rotate: 28 }
    },
    yAxis: {
      type: 'value', min: floor, max: 100,
      axisLabel: { fontSize: 9, color: '#7C8B80', formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed', color: '#EDF3EE' } }
    },
    series: [{
      type: 'bar', barMaxWidth: 26,
      data: list.map((province) => ({
        value: province.fulfillment,
        itemStyle: { color: province.fulfillment >= 99 ? '#2F7A50' : province.fulfillment >= 98 ? '#5C8A6B' : '#C9A13B', borderRadius: [3, 3, 0, 0] }
      })),
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: '#C04442', type: 'dashed', width: 1 },
        label: { show: false },
        data: [{ yAxis: nationalFulfillment.value }]
      }
    }]
  }, true);
}

function renderCharts() {
  renderTrendChart();
  renderMixChart();
  renderRationChart();
  renderRadarChart();
  renderAgentsChart();
  renderFulfillmentChart();
}

function selectProvince(code) {
  selectedProvinceCode.value = selectedProvinceCode.value === code ? '' : code;
}

async function load() {
  loading.value = true;
  loadFailed.value = false;
  try {
    overview.value = normalizeCockpitOverview(await getCockpitOverview());
    if (selectedProvinceCode.value && !overview.value.provinces.some((province) => province.provinceCode === selectedProvinceCode.value)) selectedProvinceCode.value = '';
  } catch {
    loadFailed.value = true;
    overview.value = { updatedAt: '', indicators: [], provinces: [], charts: { months: [], quota: [], actual: [], items: [] } };
  } finally {
    loading.value = false;
    await nextTick();
    renderCharts();
  }
}

watch(() => locale.value, async () => { await nextTick(); renderCharts(); });

onMounted(async () => {
  await load();
  resizeObserver = new ResizeObserver(() => Object.values(charts).forEach((chart) => chart?.resize()));
  if (trendEl.value) resizeObserver.observe(trendEl.value.parentElement);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = undefined;
  Object.values(charts).forEach((chart) => chart?.dispose());
});
</script>

<style scoped>
.cockpit { color: #1f3326; }
.cockpit-hero { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; border: 1px solid #d9e5db; border-radius: .75rem; padding: .75rem 1rem; background: linear-gradient(120deg, #1f3326, #2f5240 58%, #326445); color: #fff; box-shadow: 0 8px 22px -16px rgba(31, 51, 38, .7); }
.cockpit-hero__icon { display: inline-flex; width: 2.5rem; height: 2.5rem; flex: 0 0 auto; align-items: center; justify-content: center; border: 1px solid rgba(229, 206, 161, .55); border-radius: .625rem; background: rgba(255, 255, 255, .12); color: #f3d9a4; font-size: 1.25rem; }
.cockpit-hero h1 { margin: 0; font-size: 1.0625rem; font-weight: 800; }
.cockpit-hero__subtitle { margin: .125rem 0 0; color: rgba(255, 255, 255, .72); font-size: .75rem; }
.cockpit-updated { color: rgba(255, 255, 255, .72); font-size: .6875rem; }
.cockpit-error { display: flex; flex-direction: column; align-items: center; gap: .5rem; border: 1px solid #f0d9c0; border-radius: .75rem; background: #fffaf3; padding: 2rem 1rem; color: #a9752a; text-align: center; }
.cockpit-error p { margin: 0; font-size: .8125rem; }
.cockpit-layout { display: grid; grid-template-areas: 'left center right' 'bottom bottom bottom'; grid-template-columns: minmax(250px, 288px) minmax(0, 1fr) minmax(250px, 288px); gap: .75rem; align-items: stretch; }
.cockpit-rail { display: flex; flex-direction: column; gap: .75rem; min-width: 0; }
.cockpit-rail--left { grid-area: left; }
.cockpit-rail--right { grid-area: right; }
.cockpit-chart { display: flex; flex: 1; min-width: 0; flex-direction: column; border: 1px solid rgba(217, 229, 219, .8); border-radius: .6rem; background: #fff; padding: .55rem .65rem .5rem; box-shadow: 0 2px 6px rgba(31, 51, 38, .03); }
.cockpit-chart__head { display: flex; align-items: center; gap: .4rem; margin-bottom: .25rem; }
.cockpit-chart__dot { width: .4rem; height: .4rem; flex: 0 0 auto; border-radius: 50%; background: #326445; }
.cockpit-chart__dot.is-gold { background: #c9a13b; }
.cockpit-chart__dot.is-navy { background: #3d5a73; }
.cockpit-chart__head h3 { margin: 0; color: #1f3326; font-size: .6875rem; font-weight: 700; }
.cockpit-chart__meta { margin-inline-start: auto; color: #8a9a8f; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .5625rem; font-weight: 600; }
.cockpit-chart__body { flex: 1; min-height: 176px; }
.cockpit-center { display: flex; grid-area: center; min-width: 0; flex-direction: column; }
.cockpit-map-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .5rem; padding: 0 .25rem .15rem; }
.cockpit-map-head h2 { margin: 0; color: #24483a; font-size: .9375rem; font-weight: 700; }
.cockpit-map-head p { margin: .125rem 0 0; color: #8a9a8f; font-size: .6875rem; }
.cockpit-metrics { display: flex; flex-wrap: wrap; gap: .25rem; }
.cockpit-metric { border: 1px solid #d9e5db; border-radius: 999px; padding: .2rem .55rem; background: #f6faf7; color: #52675a; font-size: .6875rem; font-weight: 600; cursor: pointer; transition: background-color .15s ease, color .15s ease, border-color .15s ease; }
.cockpit-metric:hover { border-color: #b9d4c1; color: #2f7a50; }
.cockpit-metric.is-active { border-color: #2f7a50; background: #2f7a50; color: #fff; }
.cockpit-map-canvas { position: relative; flex: 1; min-height: 0; }
.cockpit-map-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: .4rem; color: #52675a; font-size: .75rem; }
.cockpit-map-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .5rem; padding: .25rem .25rem 0; }
.cockpit-legend { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.cockpit-legend__label { color: #52675a; font-size: .625rem; font-weight: 600; }
.cockpit-legend__scale { width: 120px; height: 6px; border-radius: 999px; }
.cockpit-legend__range { color: #8a9a8f; font-size: .625rem; }
.cockpit-province { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem 1rem; border-radius: .5rem; background: #f4f8f5; padding: .4rem .6rem; }
.cockpit-province__head { display: flex; align-items: center; gap: .5rem; }
.cockpit-province__eyebrow { margin: 0; color: #8a9a8f; font-size: .5625rem; font-weight: 600; }
.cockpit-province h3 { margin: 0; color: #1f3326; font-size: .75rem; font-weight: 700; }
.cockpit-province__close { border: 0; background: transparent; color: #8a9a8f; font-size: 1rem; line-height: 1; cursor: pointer; }
.cockpit-province__close:hover { color: #1f3326; }
.cockpit-province__grid { display: flex; flex-wrap: wrap; gap: .25rem .875rem; margin: 0; }
.cockpit-province__grid dt { color: #8a9a8f; font-size: .5625rem; }
.cockpit-province__grid dd { margin: 0; color: #24483a; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .6875rem; font-weight: 700; }
.cockpit-bottom { display: grid; grid-area: bottom; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.cockpit-bottom .cockpit-chart__body { min-height: 190px; }
.cockpit :deep(.leaflet-container) { background: #f4f8f5; font: inherit; }
@media (max-width: 1279px) {
  .cockpit-layout { grid-template-columns: minmax(230px, 260px) minmax(0, 1fr) minmax(230px, 260px); }
}
@media (max-width: 1100px) {
  .cockpit-layout { grid-template-areas: 'center' 'bottom' 'left' 'right'; grid-template-columns: minmax(0, 1fr); }
  .cockpit-rail { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cockpit-chart__body { min-height: 200px; }
}
@media (max-width: 767px) {
  .cockpit-rail, .cockpit-bottom { grid-template-columns: minmax(0, 1fr); }
}
</style>
