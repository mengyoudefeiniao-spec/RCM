<template>
  <div class="geo-stats-page -mt-0 sm:-mt-6 -mx-0 sm:-mx-6 -mb-0 sm:-mb-8 bg-[#F4F6F4]">
    <div class="flex h-[calc(100vh-150px)] min-h-[520px]">
      <!-- ============ 左侧: 主题指标树 ============ -->
      <aside class="hidden lg:flex flex-col w-[264px] shrink-0 bg-white border-r border-[#E4EAE5]">
        <div class="px-4 pt-4 pb-3 border-b border-[#EEF1EE]">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white">
              <el-icon class="text-sm"><DataAnalysis /></el-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-[#152233] leading-none">{{ $t('geoStats.title') }}</div>
              <div class="text-[10px] text-[#8A9A8F] mt-1">IRAQ RATION GEO-STATS</div>
            </div>
          </div>
          <button
            class="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs text-[#4A5A50] bg-[#F7FAF8] hover:bg-[#EEF3EF] border border-[#E4EAE5] transition-colors"
            @click="goBackDashboard"
          >
            <el-icon :size="12"><Back /></el-icon>{{ $t('geoStats.backToDashboard') }}
          </button>
          <el-select
            v-model="searchProvinceName"
            filterable clearable
            :placeholder="$t('geoStats.searchPlaceholder')"
            size="small"
            class="mt-3 w-full"
            @change="handleSearchSelect"
          >
            <el-option v-for="p in provinceList" :key="p.id" :label="provinceLabel(t, locale, p)" :value="p.name">
              <span class="flex justify-between items-center">
                <span>{{ provinceLabel(t, locale, p) }}</span>
                <span class="text-[10px] text-[#8A9A8F] font-mono">{{ formatMetricValue(p[activeMetric]) }}</span>
              </span>
            </el-option>
          </el-select>
        </div>

        <div class="flex-1 overflow-y-auto py-2">
          <div v-for="theme in themes" :key="theme.key" class="px-2 py-1">
            <div class="flex items-center gap-2 px-2 py-2 rounded-lg bg-[#F7FAF8]">
              <el-icon class="text-[#2F7A50]" :size="14"><component :is="theme.icon" /></el-icon>
              <span class="text-xs font-bold text-[#152233]">{{ $t(`geoStats.themes.${theme.key}`) }}</span>
            </div>
            <div class="mt-1 space-y-0.5">
              <button
                v-for="m in theme.metrics"
                :key="m.key"
                class="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-xs transition-colors"
                :class="activeMetric === m.key
                  ? 'bg-[#1E3A5F] text-white font-medium shadow-sm'
                  : 'text-[#4A5A50] hover:bg-[#F0F5F1]'"
                @click="setActiveMetric(m.key)"
              >
                <span class="w-1 h-1 rounded-full" :class="activeMetric === m.key ? 'bg-[#C8A45C]' : 'bg-[#C4CFC6]'"></span>
                {{ metricLabel(m.key) }}
              </button>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="px-4 py-3 border-t border-[#EEF1EE]">
          <div class="text-[10px] uppercase tracking-widest text-[#8A9A8F] mb-2">
            {{ $t('geoStats.legend') }} · {{ metricLabel(activeMetric) }} ({{ activeMetricUnit }})
          </div>
          <div class="h-2.5 rounded-full" :style="{ background: legendGradient }"></div>
          <div class="flex justify-between text-[10px] font-mono text-[#8A9A8F] mt-1">
            <span>{{ formatLegendValue(legendRange[0]) }}</span>
            <span>{{ formatLegendValue(legendRange[1]) }}</span>
          </div>
        </div>
      </aside>

      <!-- ============ 中央: 地图 ============ -->
      <div class="relative flex-1 min-w-0">
        <div ref="mapRef" class="absolute inset-0"></div>

        <!-- 当前指标浮层 (移动端标题替代) -->
        <div class="absolute top-3 left-3 z-[600] bg-white/95 backdrop-blur rounded-lg shadow px-3 py-2 pointer-events-none">
          <div class="text-[10px] uppercase tracking-widest text-[#8A9A8F]">{{ $t('geoStats.currentMetric') }}</div>
          <div class="text-sm font-bold text-[#152233]">{{ metricLabel(activeMetric) }}</div>
        </div>

        <!-- 移动端指标切换 -->
        <div class="lg:hidden absolute top-3 right-3 z-[600]">
          <el-select v-model="activeMetric" size="small" class="w-36" @change="onMetricChange">
            <el-option v-for="m in allMetrics" :key="m.key" :label="metricLabel(m.key)" :value="m.key" />
          </el-select>
        </div>

        <!-- 底部控制条 -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-[600] bg-white/95 backdrop-blur rounded-full shadow-lg border border-[#E4EAE5] px-2 py-1.5 flex items-center gap-1 flex-wrap justify-center max-w-[92%]">
          <el-radio-group v-model="warehouseFilter" size="small" class="!mr-1">
            <el-radio-button value="all">{{ $t('geoStats.filterAll') }}</el-radio-button>
            <el-radio-button value="assigned">{{ $t('geoStats.filterAssigned') }}</el-radio-button>
            <el-radio-button value="vacant">{{ $t('geoStats.filterVacant') }}</el-radio-button>
          </el-radio-group>
          <button
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            :class="showWarehouseLayer ? 'bg-[#2F7A50] text-white' : 'text-[#4A5A50] hover:bg-[#F0F5F1]'"
            @click="toggleLayer('warehouse')"
          >
            {{ $t('geoStats.warehouseLayer') }}
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            :class="showAgentLayer ? 'bg-[#1E3A5F] text-white' : 'text-[#4A5A50] hover:bg-[#F0F5F1]'"
            @click="toggleLayer('agent')"
          >
            {{ $t('geoStats.agentLayer') }}
          </button>
          <el-divider direction="vertical" />
          <el-button size="small" text bg @click="resetView">
            <el-icon class="mr-1"><Refresh /></el-icon>{{ $t('geoStats.resetView') }}
          </el-button>
        </div>
      </div>

      <!-- ============ 右侧: 联动统计面板 ============ -->
      <aside class="hidden xl:flex flex-col w-[336px] shrink-0 bg-white border-l border-[#E4EAE5] overflow-y-auto">
        <div class="px-5 pt-5 pb-4 border-b border-[#EEF1EE]">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-[#152233]">{{ selectedProvince ? provinceLabel(t, locale, selectedProvince) : $t('geoStats.nationalView') }}</h2>
            <el-button v-if="selectedProvince" size="small" text @click="selectProvince(null)">
              <el-icon class="mr-1"><Back /></el-icon>{{ $t('geoStats.backToNational') }}
            </el-button>
          </div>
          <div v-if="selectedProvince" class="text-[11px] text-[#8A9A8F] mt-0.5">
            {{ selectedProvince.enName }}
            <el-tag v-if="selectedProvince.isArticle140" size="small" effect="plain" type="warning" class="ml-1 !text-[9px]">{{ $t('geoStats.article140') }}</el-tag>
          </div>

          <!-- 当前指标大数字 -->
          <div class="mt-4 bg-[#F7FAF8] rounded-xl p-4 text-center">
            <div class="text-[10px] uppercase tracking-widest text-[#8A9A8F]">{{ metricLabel(activeMetric) }}</div>
            <div class="text-3xl font-bold text-[#1E3A5F] font-mono mt-1">
              {{ formatMetricValue(displayStats[activeMetric]) }}
              <span class="text-xs font-normal text-[#8A9A8F]">{{ activeMetricUnit }}</span>
            </div>
            <div v-if="selectedProvince" class="text-[11px] text-[#58685D] mt-1">
              {{ $t('geoStats.nationalShare') }}
              <b class="font-mono">{{ calcNationalShare(activeMetric) }}%</b>
            </div>
          </div>
        </div>

        <div class="p-4 space-y-4">
          <!-- 配给核心卡 -->
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-xl border border-[#EAEFEA] p-3">
              <div class="text-[10px] text-[#8A9A8F] uppercase">{{ $t('geoStats.monthlyQuota') }}</div>
              <div class="text-base font-bold text-[#2F7A50] font-mono mt-0.5">{{ formatInt(displayStats.monthlyQuotaTon) }} <span class="text-[10px] font-normal">t</span></div>
            </div>
            <div class="rounded-xl border border-[#EAEFEA] p-3">
              <div class="text-[10px] text-[#8A9A8F] uppercase">{{ $t('geoStats.monthlyActual') }}</div>
              <div class="text-base font-bold text-[#1E3A5F] font-mono mt-0.5">{{ formatInt(displayStats.monthlyDistributedTon) }} <span class="text-[10px] font-normal">t</span></div>
            </div>
            <div class="rounded-xl border border-[#EAEFEA] p-3">
              <div class="text-[10px] text-[#8A9A8F] uppercase">{{ $t('geoStats.deviation') }}</div>
              <div class="text-base font-bold font-mono mt-0.5" :class="displayStats.deviationRate >= -1 ? 'text-[#2F7A50]' : 'text-[#C8502F]'">
                {{ displayStats.deviationRate > 0 ? '+' : '' }}{{ displayStats.deviationRate }}%
              </div>
            </div>
            <div class="rounded-xl border border-[#EAEFEA] p-3">
              <div class="text-[10px] text-[#8A9A8F] uppercase">{{ $t('scrollHome.cardFulfillment') }}</div>
              <div class="text-base font-bold text-[#C8A45C] font-mono mt-0.5">{{ displayStats.fulfillmentRate }}%</div>
            </div>
          </div>

          <!-- 月度额度 vs 实际 -->
          <div class="rounded-xl border border-[#EAEFEA] p-3">
            <div class="flex items-center justify-between mb-1">
              <h4 class="text-xs font-bold text-[#152233]">{{ $t('geoStats.monthlyTrend') }}</h4>
              <el-dropdown trigger="click" @command="handleExport">
                <el-button size="small" text>{{ $t('geoStats.export') }}<el-icon class="ml-1"><ArrowDown /></el-icon></el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="csv">CSV</el-dropdown-item>
                    <el-dropdown-item command="png">PNG</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div ref="trendChartRef" class="h-44"></div>
          </div>

          <!-- 仓库与代理网络 -->
          <div class="rounded-xl border border-[#EAEFEA] p-3">
            <h4 class="text-xs font-bold text-[#152233] mb-2">{{ $t('geoStats.networkPanel') }}</h4>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-[#F7FAF8] rounded-lg py-2.5">
                <div class="text-lg font-bold text-[#2F7A50] font-mono">{{ displayStats.warehouseTotal }}</div>
                <div class="text-[10px] text-[#8A9A8F]">{{ $t('scrollHome.warehouses') }}</div>
              </div>
              <div class="bg-[#F7FAF8] rounded-lg py-2.5">
                <div class="text-lg font-bold text-[#C8A45C] font-mono">{{ displayStats.warehouseVacant }}</div>
                <div class="text-[10px] text-[#8A9A8F]">{{ $t('geoStats.vacant') }}</div>
              </div>
              <div class="bg-[#F7FAF8] rounded-lg py-2.5">
                <div class="text-lg font-bold text-[#1E3A5F] font-mono">{{ formatInt(displayStats.agentCount) }}</div>
                <div class="text-[10px] text-[#8A9A8F]">{{ $t('scrollHome.agents') }}</div>
              </div>
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] text-[#4A5A50]">
              <span>{{ $t('geoStats.householdsPerAgent') }}</span>
              <b class="font-mono">{{ displayStats.householdsPerAgent }} {{ $t('scrollHome.householdsUnit') }}</b>
            </div>
            <div class="flex items-center justify-between text-[11px] text-[#4A5A50] mt-1">
              <span>{{ $t('geoStats.compliance') }}</span>
              <b class="font-mono">{{ displayStats.complianceRate }}%</b>
            </div>
          </div>

          <!-- 人口结构 -->
          <div class="rounded-xl border border-[#EAEFEA] p-3">
            <div class="flex items-center justify-between mb-1">
              <h4 class="text-xs font-bold text-[#152233]">{{ $t('scrollHome.ageStructure') }}</h4>
              <div class="text-[10px] text-[#8A9A8F] font-mono">
                {{ $t('scrollHome.urban') }} {{ displayStats.urbanRate }}% · {{ $t('scrollHome.rural') }} {{ displayStats.ruralRate }}%
              </div>
            </div>
            <div ref="ageChartRef" class="h-32"></div>
          </div>

          <!-- 人均商品配额 -->
          <div class="rounded-xl border border-[#EAEFEA] p-3">
            <h4 class="text-xs font-bold text-[#152233] mb-1">{{ $t('geoStats.itemQuotaPanel') }}</h4>
            <div ref="itemChartRef" class="h-40"></div>
            <div class="text-[10px] text-[#8A9A8F] mt-1">{{ $t('geoStats.itemQuotaFootnote') }}</div>
          </div>
        </div>
      </aside>

      <!-- 移动端底部抽屉式统计面板 -->
      <div class="xl:hidden fixed bottom-14 left-2 right-2 z-[700]">
        <el-collapse v-model="mobilePanelOpen" class="geo-mobile-panel">
          <el-collapse-item name="open">
            <template #title>
              <span class="text-sm font-bold text-[#152233] px-1">
                {{ selectedProvince ? provinceLabel(t, locale, selectedProvince) : $t('geoStats.nationalView') }} · {{ metricLabel(activeMetric) }}
                <b class="font-mono text-[#1E3A5F] ml-1">{{ formatMetricValue(displayStats[activeMetric]) }}</b>
              </span>
            </template>
            <div class="px-1 pb-2 space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <div class="rounded-lg border border-[#EAEFEA] p-2.5 bg-white">
                  <div class="text-[10px] text-[#8A9A8F]">{{ $t('geoStats.monthlyQuota') }}</div>
                  <div class="text-sm font-bold text-[#2F7A50] font-mono">{{ formatInt(displayStats.monthlyQuotaTon) }} t</div>
                </div>
                <div class="rounded-lg border border-[#EAEFEA] p-2.5 bg-white">
                  <div class="text-[10px] text-[#8A9A8F]">{{ $t('geoStats.deviation') }}</div>
                  <div class="text-sm font-bold font-mono" :class="displayStats.deviationRate >= -1 ? 'text-[#2F7A50]' : 'text-[#C8502F]'">{{ displayStats.deviationRate }}%</div>
                </div>
              </div>
              <div ref="mobileTrendChartRef" class="h-36 bg-white rounded-lg border border-[#EAEFEA] p-1"></div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ElMessage } from 'element-plus';
import { DataAnalysis, Refresh, Back, ArrowDown } from '@element-plus/icons-vue';
import {
  PROVINCE_STATS, GEO_STAT_THEMES, FACILITY_POINTS, IRAQ_GEO_JSON,
  getMetricLabel, NATIONAL_SUMMARY
} from '../../mock/data/geoStatsData.js';
import { useI18n } from 'vue-i18n';
import {
  commodityLabel, ageLabel, monthLabel, provinceLabel, tonAxisFormatter,
  unitLabel, facilityPointLabel
} from '../../utils/dataLabels.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

function goBackDashboard() {
  router.push('/dashboard');
}

// ============ 状态 ============
const themes = GEO_STAT_THEMES;
const allMetrics = themes.flatMap(t2 => t2.metrics);
const activeMetric = ref('monthlyQuotaTon');
const selectedProvinceName = ref(null);
const searchProvinceName = ref(null);
const warehouseFilter = ref('all');
const showWarehouseLayer = ref(true);
const showAgentLayer = ref(false);
const mobilePanelOpen = ref([]);

const selectedProvince = computed(() => PROVINCE_STATS.find(p => p.name === selectedProvinceName.value) || null);
const displayStats = computed(() => selectedProvince.value || NATIONAL_SUMMARY_PROXIED.value);
const provinceList = PROVINCE_STATS;

// 全国汇总代理 (补齐省级专有字段的全国口径)
const NATIONAL_SUMMARY_PROXIED = computed(() => {
  const avg = (fn) => Number((PROVINCE_STATS.reduce((a, p) => a + fn(p), 0) / PROVINCE_STATS.length).toFixed(2));
  const sum = (fn) => PROVINCE_STATS.reduce((a, p) => a + fn(p), 0);
  return {
    ...NATIONAL_SUMMARY,
    deviationRate: Number(((NATIONAL_SUMMARY.monthlyDistributedTon - NATIONAL_SUMMARY.monthlyQuotaTon) / NATIONAL_SUMMARY.monthlyQuotaTon * 100).toFixed(2)),
    fulfillmentRate: NATIONAL_SUMMARY.fulfillmentRate,
    urbanRate: avg(p => p.urbanRate),
    ruralRate: 100 - avg(p => p.urbanRate),
    warehouseAssigned: sum(p => p.warehouseAssigned),
    monthlyTrend: PROVINCE_STATS[0].monthlyTrend.map((m, i) => ({
      month: m.month,
      quotaTon: sum(p => p.monthlyTrend[i].quotaTon),
      actualTon: sum(p => p.monthlyTrend[i].actualTon)
    })),
    ageStructure: PROVINCE_STATS.reduce((acc, p) => {
      p.ageStructure.forEach((a, idx) => { acc[idx] = acc[idx] || { name: a.name, value: 0 }; acc[idx].value += a.value; });
      return acc;
    }, []),
    itemQuotas: PROVINCE_STATS.reduce((acc, p) => {
      p.itemQuotas.forEach((q, idx) => { acc[idx] = acc[idx] || { name: q.name, provinceTon: 0, kgPerPerson: q.kgPerPerson }; acc[idx].provinceTon += q.provinceTon; });
      return acc;
    }, [])
  };
});

// ============ 指标配置 ============
const activeMetricConfig = computed(() => allMetrics.find(m => m.key === activeMetric.value) || allMetrics[0]);
const activeMetricUnit = computed(() => unitLabel(t, activeMetricConfig.value.unit));
const metricLabel = (key) => t(`geoStats.metrics.${key}`) !== `geoStats.metrics.${key}` ? t(`geoStats.metrics.${key}`) : getMetricLabel(key);
const formatInt = (n) => Number(n || 0).toLocaleString('en-US');
const formatMetricValue = (v) => {
  if (v == null) return '-';
  const c = activeMetricConfig.value;
  if (c.format === 'dec') return Number(v).toFixed(2);
  return formatInt(v);
};
const formatLegendValue = (v) => activeMetricConfig.value.format === 'dec' ? Number(v).toFixed(1) : formatInt(v);

const legendRange = computed(() => {
  const [lo, hi] = activeMetricConfig.value.geoRange;
  return [lo, hi];
});

const legendGradient = computed(() => {
  if (activeMetric.value === 'deviationRate') {
    return `linear-gradient(90deg, ${DIV_STOPS.join(', ')})`;
  }
  return `linear-gradient(90deg, ${SEQ_STOPS.join(', ')})`;
});

// ============ 地图 ============
const mapRef = ref(null);
let map, geoLayer, warehouseLayer, agentLayer, halabjaMarker;
let warehouseMarkers = [], agentMarkers = [];
let isProgrammaticStyleUpdate = false;

const SEQ_STOPS = ['#EAF2EC', '#A8C8B0', '#5E9B74', '#2F7A50', '#1E3A5F'];
const DIV_STOPS = ['#D9482F', '#E4B96A', '#C9CFA9', '#7FAE8E', '#2F7A50'];

// 分位色阶: 按省内指标值排序分桶, 避免极值(如巴格达)拉平线性映射
function getColorForValue(value) {
  if (value == null) return '#E5E9E5';
  const key = activeMetric.value;
  if (key === 'deviationRate') {
    if (value >= -0.5) return DIV_STOPS[4];
    if (value >= -1) return DIV_STOPS[3];
    if (value >= -1.5) return DIV_STOPS[2];
    if (value >= -2) return DIV_STOPS[1];
    return DIV_STOPS[0];
  }
  const values = PROVINCE_STATS.map(p => p[key]).sort((a, b) => a - b);
  const idx = values.findIndex(v => v >= value);
  const rank = idx < 0 ? values.length - 1 : idx;
  const bucket = Math.min(SEQ_STOPS.length - 1, Math.floor(rank / values.length * SEQ_STOPS.length));
  return SEQ_STOPS[bucket];
}

function featureStyle(feature) {
  const provName = feature.properties.provinceName;
  const prov = PROVINCE_STATS.find(p => p.name === provName);
  const isSelected = selectedProvinceName.value === provName;
  const base = {
    fillColor: prov ? getColorForValue(prov[activeMetric.value]) : '#E5E9E5',
    fillOpacity: isSelected ? 0.92 : 0.78,
    color: isSelected ? '#C8A45C' : '#FFFFFF',
    weight: isSelected ? 3 : 1,
    dashArray: feature.properties.isHalabjaCarrier ? '5 3' : null
  };
  return base;
}

function refreshStyles() {
  isProgrammaticStyleUpdate = true;
  geoLayer?.eachLayer((layer) => layer.setStyle(featureStyle(layer.feature)));
  isProgrammaticStyleUpdate = false;
}

function highlightFeature(e) {
  const layer = e.target;
  if (selectedProvinceName.value === layer.feature.properties.provinceName) return;
  layer.setStyle({ weight: 2.5, color: '#C8A45C', fillOpacity: 0.95 });
  layer.bringToFront?.();
}

function resetHighlight(e) {
  if (isProgrammaticStyleUpdate) return;
  geoLayer?.resetStyle(e.target);
}

function onMapReady() {
  map = L.map(mapRef.value, {
    center: [33.2, 43.6], zoom: 6, zoomControl: false,
    attributionControl: false, minZoom: 5, maxZoom: 12,
    preferCanvas: false
  });
  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12
  }).addTo(map);

  geoLayer = L.geoJSON(IRAQ_GEO_JSON, {
    style: (feature) => featureStyle(feature),
    onEachFeature: (feature, layer) => {
      const prov = PROVINCE_STATS.find(p => p.name === feature.properties.provinceName);
      layer.bindTooltip(() => tooltipHtml(prov), { sticky: true, className: 'geo-tooltip', opacity: 1 });
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: () => selectProvince(feature.properties.provinceName, layer)
      });
    }
  }).addTo(map);

  // 哈拉卜贾省: 无独立边界, 以省会点标记承载
  const hal = PROVINCE_STATS.find(p => p.id === 'HAL');
  if (hal) {
    halabjaMarker = L.circleMarker([hal.lat, hal.lng], {
      radius: 9, color: '#C8A45C', weight: 2, fillColor: '#C8A45C', fillOpacity: 0.85
    }).addTo(map);
    halabjaMarker.bindTooltip(() => tooltipHtml(hal), { className: 'geo-tooltip', opacity: 1 });
    halabjaMarker.on('click', () => selectProvince(hal.name));
  }

  // 标记只创建一次存入数组，图层组在 applyLayerVisibility 中按需重建，
  // 避免 clearLayers 导致标记永久丢失（切换图层/筛选后无法恢复）
  warehouseMarkers = [];
  agentMarkers = [];
  for (const pt of FACILITY_POINTS) {
    const isWarehouse = pt.type === 'warehouse';
    const marker = L.circleMarker([pt.lat, pt.lng], isWarehouse ? {
      radius: 4,
      color: '#FFFFFF', weight: 0.8,
      fillColor: pt.status === 'vacant' ? '#C8A45C' : '#2F7A50', fillOpacity: 0.92
    } : {
      radius: 2.5, stroke: false,
      fillColor: '#1E3A5F', fillOpacity: 0.7
    });
    marker.bindTooltip(`${facilityPointLabel(t, locale.value, pt)} · ${pt.households} ${t('scrollHome.householdsUnit')}`, { direction: 'top' });
    marker.on('click', () => selectProvince(pt.province));
    (isWarehouse ? warehouseMarkers : agentMarkers).push(marker);
  }
  applyLayerVisibility();
}

function tooltipHtml(prov) {
  if (!prov) return '';
  const displayName = locale.value === 'zh' ? `${prov.name} ${prov.enName}` : prov.enName;
  return `<div style="font-family:inherit">
    <div style="font-weight:700;font-size:12px;color:#152233">${displayName}</div>
    <div style="font-size:11px;color:#4A5A50;margin-top:2px">${metricLabel(activeMetric.value)}: <b style="font-family:monospace">${formatMetricValue(prov[activeMetric.value])}</b> ${activeMetricUnit.value}</div>
    <div style="font-size:10px;color:#8A9A8F">${t('scrollHome.warehouses')} ${prov.warehouseTotal} · ${t('scrollHome.agents')} ${formatInt(prov.agentCount)}</div>
  </div>`;
}

function applyLayerVisibility() {
  if (!map) return;
  // 先整体摘除旧图层组，再从标记数组按当前开关/筛选重建，标记本身不销毁
  map.removeLayer(warehouseLayer);
  map.removeLayer(agentLayer);
  if (showWarehouseLayer.value) {
    warehouseLayer = L.layerGroup(warehouseMarkers.filter(l =>
      warehouseFilter.value === 'all'
      || (warehouseFilter.value === 'vacant' && l.options.fillColor === '#C8A45C')
      || (warehouseFilter.value === 'assigned' && l.options.fillColor === '#2F7A50')
    )).addTo(map);
  }
  if (showAgentLayer.value) {
    agentLayer = L.layerGroup(agentMarkers).addTo(map);
  }
}

function toggleLayer(type) {
  if (type === 'warehouse') showWarehouseLayer.value = !showWarehouseLayer.value;
  else showAgentLayer.value = !showAgentLayer.value;
  applyLayerVisibility();
}

// 复位视图: 恢复到刚打开页面时的完整初始状态
function resetView() {
  selectedProvinceName.value = null;
  searchProvinceName.value = null;
  activeMetric.value = 'monthlyQuotaTon';
  warehouseFilter.value = 'all';
  showWarehouseLayer.value = true;
  showAgentLayer.value = false;
  refreshStyles();
  applyLayerVisibility();
  map?.flyTo([33.2, 43.6], 6, { duration: 0.6 });
}

function zoomToProvince(prov) {
  if (!map || !prov) return;
  if (prov.id === 'HAL') {
    map.flyTo([prov.lat, prov.lng], 8, { duration: 0.7 });
    return;
  }
  const target = geoLayer?.getLayers().find(l => l.feature.properties.provinceName === prov.name);
  if (target?.getBounds) {
    map.flyToBounds(target.getBounds(), { padding: [40, 40], duration: 0.7 });
  } else {
    map.flyTo([prov.lat, prov.lng], 8, { duration: 0.7 });
  }
}

// ============ 选择联动 ============
function selectProvince(name, layer) {
  selectedProvinceName.value = name;
  searchProvinceName.value = name;
  refreshStyles();
  if (name) {
    const prov = PROVINCE_STATS.find(p => p.name === name);
    if (!layer && prov) zoomToProvince(prov);
  }
}

function handleSearchSelect(name) {
  if (!name) {
    selectProvince(null);
    resetView();
    return;
  }
  selectProvince(name);
}

function setActiveMetric(key) {
  activeMetric.value = key;
}

function onMetricChange() { /* 触发 refreshStyles via watch */ }

function calcNationalShare(metric) {
  const prov = selectedProvince.value;
  if (!prov) return 100;
  const nationalVal = NATIONAL_SUMMARY[metric];
  if (!nationalVal) return '-';
  return ((prov[metric] / nationalVal) * 100).toFixed(1);
}

function handleExport(cmd) {
  if (cmd === 'csv') {
    const rows = [['province', activeMetric.value]];
    (selectedProvince.value ? [selectedProvince.value] : PROVINCE_STATS).forEach(p => rows.push([p.name, p[activeMetric.value]]));
    const blob = new Blob(['\ufeff' + rows.map(r => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rcm-${activeMetric.value}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    ElMessage.success(t('geoStats.exportDone'));
  } else {
    const chart = trendChart || mobileTrendChart;
    chart?.getDataURL({ pixelRatio: 2, backgroundColor: '#fff' });
    ElMessage.info(t('geoStats.exportPngTip'));
  }
}

// ============ 图表 ============
const trendChartRef = ref(null), ageChartRef = ref(null), itemChartRef = ref(null), mobileTrendChartRef = ref(null);
let trendChart, ageChart, itemChart, mobileTrendChart;

const chartAxis = {
  axisLabel: { color: '#8A9A8F', fontSize: 9 },
  axisLine: { lineStyle: { color: '#DDE5DE' } },
  splitLine: { lineStyle: { color: '#EEF2EE' } }
};

function renderPanelCharts() {
  const stats = displayStats.value;
  if (!stats) return;
  nextTick(() => {
    // 月度趋势
    const months = stats.monthlyTrend.map(m => monthLabel(t, locale.value, m.month));
    const quota = stats.monthlyTrend.map(m => m.quotaTon);
    const actual = stats.monthlyTrend.map(m => m.actualTon);
    const trendOption = {
      grid: { left: 44, right: 8, top: 18, bottom: 20 },
      tooltip: { trigger: 'axis', valueFormatter: (v) => formatInt(v) + ' t' },
      legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 8, textStyle: { fontSize: 9, color: '#58685D' } },
      xAxis: { type: 'category', data: months, ...chartAxis },
      yAxis: { type: 'value', ...chartAxis, axisLabel: { ...chartAxis.axisLabel, formatter: tonAxisFormatter(locale.value) } },
      series: [
        { name: t('geoStats.quotaShort'), type: 'bar', data: quota, barWidth: 8, itemStyle: { color: '#C9D8CD', borderRadius: [2, 2, 0, 0] } },
        { name: t('geoStats.actualShort'), type: 'line', data: actual, smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#1E3A5F' } }
      ]
    };
    if (trendChartRef.value) {
      trendChart = trendChart || echarts.init(trendChartRef.value);
      trendChart.setOption(trendOption, true);
      trendChart.resize();
    }
    if (mobileTrendChartRef.value && mobilePanelOpen.value.length) {
      mobileTrendChart = mobileTrendChart || echarts.init(mobileTrendChartRef.value);
      mobileTrendChart.setOption({ ...trendOption, grid: { left: 44, right: 8, top: 26, bottom: 18 } }, true);
      mobileTrendChart.resize();
    }

    // 年龄结构
    if (ageChartRef.value) {
      ageChart = ageChart || echarts.init(ageChartRef.value);
      const age = stats.ageStructure;
      ageChart.setOption({
        grid: { left: 74, right: 40, top: 6, bottom: 18 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => formatInt(v) },
        xAxis: { type: 'value', ...chartAxis },
        yAxis: { type: 'category', data: age.map(a => ageLabel(t, a.name)).reverse(), ...chartAxis },
        series: [{
          type: 'bar', barWidth: 10,
          data: age.map(a => a.value).reverse(),
          label: { show: true, position: 'right', fontSize: 9, color: '#8A9A8F', formatter: (p) => age[age.length - 1 - p.dataIndex].percentage + '%' },
          itemStyle: { borderRadius: [0, 4, 4, 0], color: '#1E3A5F' }
        }]
      }, true);
      ageChart.resize();
    }

    // 商品配额结构
    if (itemChartRef.value) {
      itemChart = itemChart || echarts.init(itemChartRef.value);
      const items = stats.itemQuotas;
      itemChart.setOption({
        grid: { left: 52, right: 46, top: 6, bottom: 18 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => formatInt(v) + ' t' },
        xAxis: { type: 'value', ...chartAxis },
        yAxis: { type: 'category', data: items.map(i => commodityLabel(t, i.name)).reverse(), ...chartAxis },
        series: [{
          type: 'bar', barWidth: 9,
          data: items.map(i => i.provinceTon).reverse(),
          label: { show: true, position: 'right', fontSize: 9, color: '#8A9A8F', formatter: (p) => formatInt(p.value) },
          itemStyle: { borderRadius: [0, 4, 4, 0], color: '#2F7A50' }
        }]
      }, true);
      itemChart.resize();
    }
  });
}

// ============ 侦听 ============
watch(activeMetric, () => {
  refreshStyles();
});

watch(warehouseFilter, applyLayerVisibility);

watch(selectedProvinceName, () => {
  renderPanelCharts();
});

watch(mobilePanelOpen, () => {
  renderPanelCharts();
});

// ============ URL 参数直达 (下滑主页跳转联动) ============
function applyRouteQuery() {
  if (route.query.metric && allMetrics.some(m => m.key === route.query.metric)) {
    activeMetric.value = route.query.metric;
  }
  if (route.query.province) {
    const name = decodeURIComponent(String(route.query.province));
    if (PROVINCE_STATS.some(p => p.name === name)) {
      selectedProvinceName.value = name;
      searchProvinceName.value = name;
    }
  }
}

// ============ 生命周期 ============
onMounted(async () => {
  await nextTick();
  applyRouteQuery();
  onMapReady();
  if (selectedProvince.value) zoomToProvince(selectedProvince.value);
  renderPanelCharts();
});

onBeforeUnmount(() => {
  [trendChart, ageChart, itemChart, mobileTrendChart].forEach(c => c?.dispose());
  map?.remove();
});
</script>

<style>
.geo-stats-page .leaflet-container { background: #DDE7DD; font: inherit; }
.geo-tooltip.leaflet-tooltip {
  background: #FFFFFF;
  border: 1px solid #E4EAE5;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(21, 34, 51, 0.14);
  color: #152233;
  padding: 8px 10px;
}
.geo-tooltip.leaflet-tooltip::before { display: none; }
.geo-mobile-panel .el-collapse-item__header { height: 44px; padding: 0 12px; background: #fff; border-radius: 12px 12px 0 0; }
.geo-mobile-panel .el-collapse-item__wrap { border-radius: 0 0 12px 12px; background: #F7FAF8; }
</style>
