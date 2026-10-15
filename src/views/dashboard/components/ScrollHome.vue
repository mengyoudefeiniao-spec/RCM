<template>
  <div class="scroll-home -mt-0 sm:-mt-6 -mx-0 sm:-mx-6 -mb-0 sm:-mb-6 bg-[#FDFDFB]">
    <!-- ============ 顶部吸附区块导航 (参考 Iraq Census GeoPortal) ============ -->
    <nav class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E8EDE9]">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar h-11">
        <button
          v-for="s in sections"
          :key="s.id"
          class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0"
          :class="activeSection === s.id
            ? 'bg-[#1E3A5F] text-white shadow'
            : 'text-[#4A5A50] hover:bg-[#EEF3EF]'"
          @click="scrollToSection(s.id)"
        >
          {{ $t(`scrollHome.nav.${s.id}`) }}
        </button>
        <div class="flex-1 min-w-4"></div>
        <div class="hidden md:flex items-center gap-2 shrink-0 pl-3 border-l border-[#E8EDE9]">
          <span class="text-[10px] uppercase tracking-widest text-[#8A9A8F]">{{ $t('scrollHome.rationPopulation') }}</span>
          <span class="text-sm font-bold text-[#1E3A5F] font-mono">{{ formatInt(national.population) }}</span>
        </div>
      </div>
    </nav>

    <!-- ============ HERO: 卫星地图沉浸首屏 ============ -->
    <section id="sec-hero" class="relative h-[calc(100vh-140px)] min-h-[540px] overflow-hidden bg-[#1B2A33]">
      <div ref="heroMapRef" class="absolute inset-0 z-0"></div>
      <!-- 渐变遮罩 -->
      <div class="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/70 via-black/10 to-black/30"></div>

      <!-- 右上角核心指标 -->
      <div class="absolute top-5 right-5 sm:top-8 sm:right-10 z-20 text-right text-white">
        <div class="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/70">{{ $t('scrollHome.rationPopulation') }}</div>
        <div class="text-3xl sm:text-5xl font-bold font-mono mt-1 drop-shadow-lg">{{ formatInt(national.population) }}</div>
        <div class="text-[10px] sm:text-xs text-white/60 mt-1">{{ $t('scrollHome.dataPeriod') }}</div>
      </div>

      <!-- 左下主标题 -->
      <div class="absolute bottom-16 left-5 sm:left-10 z-20 text-white max-w-2xl">
        <div class="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/60 mb-3">{{ $t('scrollHome.brand') }}</div>
        <h1 class="text-4xl sm:text-6xl font-bold leading-tight drop-shadow-xl">
          {{ $t('scrollHome.heroTitle') }}<br />{{ $t('scrollHome.heroTitle2') }}
        </h1>
        <p class="mt-4 text-sm sm:text-base text-white/80">
          {{ $t('scrollHome.heroMeta') }}
        </p>
      </div>

      <!-- 底部滚动提示 -->
      <button class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1" @click="scrollToSection('sec-overview')">
        <span class="text-[10px] tracking-[0.3em] uppercase">{{ $t('scrollHome.scrollToExplore') }}</span>
        <el-icon class="animate-bounce"><ArrowDown /></el-icon>
      </button>
    </section>

    <!-- ============ 总览 ============ -->
    <section id="sec-overview" class="relative bg-[#FDFDFB] py-16 sm:py-20 wave-bottom">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-10">
        <div class="text-[10px] uppercase tracking-[0.25em] text-[#C8A45C] font-semibold">{{ $t('scrollHome.overviewTag') }}</div>
        <h2 class="text-2xl sm:text-4xl font-bold text-[#152233] mt-2 mb-8">{{ $t('scrollHome.overviewTitle') }}</h2>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="card in overviewCards" :key="card.label" class="bg-white rounded-xl border border-[#EAEFEA] p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-[11px] text-[#8A9A8F] uppercase tracking-wider">{{ card.label }}</div>
            <div class="text-2xl sm:text-3xl font-bold mt-2 font-mono" :style="{ color: card.color }">{{ card.value }}<span class="text-sm font-normal ml-1">{{ card.unit }}</span></div>
            <div class="text-xs mt-2 text-[#58685D]">{{ card.sub }}</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4 mt-6">
          <div class="lg:col-span-2 bg-white rounded-xl border border-[#EAEFEA] p-5 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-bold text-[#152233]">{{ $t('scrollHome.nationalTrend') }}</h3>
              <el-tag size="small" effect="plain" type="success">{{ $t('scrollHome.last6Months') }}</el-tag>
            </div>
            <div ref="trendChartRef" data-chart="trend" class="h-64"></div>
          </div>
          <div class="bg-white rounded-xl border border-[#EAEFEA] p-5 shadow-sm">
            <h3 class="text-sm font-bold text-[#152233] mb-2">{{ $t('scrollHome.commodityCompletion') }}</h3>
            <div ref="commodityChartRef" data-chart="commodity" class="h-64"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 人口与家庭 ============ -->
    <section id="sec-population" class="relative bg-white py-16 sm:py-20">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-10">
        <div class="text-[10px] uppercase tracking-[0.25em] text-[#C8A45C] font-semibold">{{ $t('scrollHome.populationTag') }}</div>
        <h2 class="text-2xl sm:text-4xl font-bold text-[#152233] mt-2 mb-8">{{ $t('scrollHome.populationTitle') }}</h2>

        <div class="grid lg:grid-cols-2 gap-8 items-start">
          <div class="bg-[#FAFBFA] rounded-xl border border-[#EAEFEA] p-5">
            <h3 class="text-sm font-bold text-[#152233] mb-2">{{ $t('scrollHome.ageStructure') }}</h3>
            <div ref="ageChartRef" data-chart="age" class="h-72"></div>
            <div class="text-[11px] text-[#8A9A8F] text-center mt-1">{{ $t('scrollHome.ageFootnote') }}</div>
          </div>
          <div class="space-y-6">
            <div class="bg-[#FAFBFA] rounded-xl border border-[#EAEFEA] p-5">
              <h3 class="text-xs font-bold text-[#152233] uppercase tracking-widest mb-4">{{ $t('scrollHome.whereFamiliesLive') }}</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-lg bg-[#EEF3F7] py-5 text-center">
                  <div class="text-2xl sm:text-3xl font-bold text-[#1E3A5F]">{{ nationalUrbanRate }}%</div>
                  <div class="text-[11px] uppercase tracking-widest text-[#5A6B75] mt-1">{{ $t('scrollHome.urban') }}</div>
                </div>
                <div class="rounded-lg bg-[#F7F3E9] py-5 text-center">
                  <div class="text-2xl sm:text-3xl font-bold text-[#C8A45C]">{{ (100 - nationalUrbanRate).toFixed(1) }}%</div>
                  <div class="text-[11px] uppercase tracking-widest text-[#8A7A55] mt-1">{{ $t('scrollHome.rural') }}</div>
                </div>
              </div>
              <div class="mt-4 bg-white rounded-lg border border-[#EAEFEA] p-3 text-xs text-[#4A5A50] leading-relaxed">
                {{ $t('scrollHome.populationInsight', { n: formatInt(topProvince.population), p: topProvince.name }) }}
              </div>
            </div>
            <div class="bg-[#FAFBFA] rounded-xl border border-[#EAEFEA] p-5">
              <h3 class="text-sm font-bold text-[#152233] mb-2">{{ $t('scrollHome.familySizeDist') }}</h3>
              <div ref="familyChartRef" data-chart="family" class="h-56"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 配给进度与偏差 ============ -->
    <section id="sec-distribution" class="relative bg-[#FDFDFB] py-16 sm:py-20 wave-bottom">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-10">
        <div class="text-[10px] uppercase tracking-[0.25em] text-[#C8A45C] font-semibold">{{ $t('scrollHome.distributionTag') }}</div>
        <h2 class="text-2xl sm:text-4xl font-bold text-[#152233] mt-2 mb-8">{{ $t('scrollHome.distributionTitle') }}</h2>

        <div class="grid lg:grid-cols-5 gap-6 items-start">
          <div class="lg:col-span-3 bg-white rounded-xl border border-[#EAEFEA] p-5 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-bold text-[#152233]">{{ $t('scrollHome.provinceFulfillment') }}</h3>
              <el-button size="small" text type="primary" @click="goStats('fulfillmentRate')">
                {{ $t('scrollHome.viewOnMap') }} <el-icon class="ml-1"><Position /></el-icon>
              </el-button>
            </div>
            <div ref="provinceChartRef" data-chart="province" class="h-[520px]"></div>
          </div>
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-xl border border-[#EAEFEA] p-5 shadow-sm">
              <div class="text-[11px] text-[#8A9A8F] uppercase tracking-wider">{{ $t('scrollHome.monthlyQuota') }}</div>
              <div class="text-3xl font-bold text-[#2F7A50] font-mono mt-1">{{ formatInt(national.monthlyQuotaTon) }} <span class="text-sm font-normal text-[#8A9A8F]">{{ $t('scrollHome.ton') }}</span></div>
              <div class="h-px bg-[#EEF1EE] my-4"></div>
              <div class="text-[11px] text-[#8A9A8F] uppercase tracking-wider">{{ $t('scrollHome.monthlyActual') }}</div>
              <div class="text-3xl font-bold text-[#1E3A5F] font-mono mt-1">{{ formatInt(national.monthlyDistributedTon) }} <span class="text-sm font-normal text-[#8A9A8F]">{{ $t('scrollHome.ton') }}</span></div>
            </div>
            <div class="bg-[#FFFDF7] rounded-xl border border-[#E5CEA1]/60 p-5">
              <h4 class="text-xs font-bold text-[#6B5A2E] uppercase tracking-widest mb-2">{{ $t('scrollHome.quotaStandard') }}</h4>
              <div class="space-y-2">
                <div v-for="item in rationStandards" :key="item.name" class="flex items-center gap-3">
                  <span class="text-xs text-[#4A4230] w-14 shrink-0">{{ item.name }}</span>
                  <div class="flex-1 h-2 rounded-full bg-[#EFE8D5] overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-[#C8A45C] to-[#E0C288]" :style="{ width: (item.kgPerPerson / maxStandardKg * 100) + '%' }"></div>
                  </div>
                  <span class="text-xs font-mono text-[#6B5A2E] w-16 text-right">{{ item.kgPerPerson }} kg</span>
                </div>
              </div>
              <div class="text-[11px] text-[#8A7A55] mt-3">{{ $t('scrollHome.standardFootnote') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 仓库与代理网络 ============ -->
    <section id="sec-network" class="relative bg-white py-16 sm:py-20">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-10">
        <div class="text-[10px] uppercase tracking-[0.25em] text-[#C8A45C] font-semibold">{{ $t('scrollHome.networkTag') }}</div>
        <h2 class="text-2xl sm:text-4xl font-bold text-[#152233] mt-2 mb-8">{{ $t('scrollHome.networkTitle') }}</h2>

        <div class="grid lg:grid-cols-2 gap-6 items-stretch">
          <div class="rounded-xl overflow-hidden border border-[#EAEFEA] shadow-sm relative min-h-[420px]">
            <div ref="networkMapRef" class="absolute inset-0"></div>
            <div class="absolute top-3 left-3 z-[500] bg-white/95 rounded-lg shadow px-3 py-2 space-y-1.5">
              <div class="flex items-center gap-2 text-[11px] text-[#4A5A50]"><span class="w-2.5 h-2.5 rounded-sm bg-[#2F7A50] inline-block"></span>{{ $t('scrollHome.activeWarehouse') }} <b class="font-mono">{{ formatInt(national.warehouseTotal - national.warehouseVacant) }}</b></div>
              <div class="flex items-center gap-2 text-[11px] text-[#4A5A50]"><span class="w-2.5 h-2.5 rounded-sm bg-[#C8A45C] inline-block"></span>{{ $t('scrollHome.vacantWarehouse') }} <b class="font-mono">{{ formatInt(national.warehouseVacant) }}</b></div>
              <div class="flex items-center gap-2 text-[11px] text-[#4A5A50]"><span class="w-2.5 h-2.5 rounded-full bg-[#1E3A5F] inline-block"></span>{{ $t('scrollHome.agentPoints') }} <b class="font-mono">{{ formatInt(national.agentCount) }}</b></div>
            </div>
            <button class="absolute bottom-3 right-3 z-[500] bg-[#1E3A5F] text-white text-xs px-3 py-1.5 rounded-full shadow hover:bg-[#152A47] transition-colors" @click="goStats()">
              {{ $t('scrollHome.openGeoStats') }}
            </button>
          </div>

          <div class="bg-white rounded-xl border border-[#EAEFEA] shadow-sm overflow-hidden flex flex-col">
            <div class="px-5 py-4 border-b border-[#EEF1EE]">
              <h3 class="text-sm font-bold text-[#152233]">{{ $t('scrollHome.provinceRanking') }}</h3>
            </div>
            <div class="flex-1 overflow-auto max-h-[420px]">
              <table class="w-full text-xs">
                <thead class="sticky top-0 bg-[#FAFBFA] text-[#8A9A8F] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th class="px-4 py-2.5 text-left font-semibold">#</th>
                    <th class="px-4 py-2.5 text-left font-semibold">{{ $t('scrollHome.gov') }}</th>
                    <th class="px-4 py-2.5 text-right font-semibold">{{ $t('scrollHome.warehouses') }}</th>
                    <th class="px-4 py-2.5 text-right font-semibold">{{ $t('scrollHome.agents') }}</th>
                    <th class="px-4 py-2.5 text-right font-semibold">{{ $t('scrollHome.quotaTonShort') }}</th>
                    <th class="px-4 py-2.5 text-right font-semibold">{{ $t('scrollHome.fulfillment') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(p, i) in provinceRanking" :key="p.id"
                    class="border-t border-[#F2F5F2] hover:bg-[#F7FAF7] cursor-pointer transition-colors"
                    @click="goStats('', p.name)"
                  >
                    <td class="px-4 py-2.5 text-[#8A9A8F] font-mono">{{ i + 1 }}</td>
                    <td class="px-4 py-2.5 font-medium text-[#152233]">
                      {{ p.name }}
                      <el-tag v-if="p.isArticle140" size="small" effect="plain" type="warning" class="ml-1 !text-[9px] !px-1">140</el-tag>
                    </td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ p.warehouseTotal }}</td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ formatInt(p.agentCount) }}</td>
                    <td class="px-4 py-2.5 text-right font-mono">{{ formatInt(p.monthlyQuotaTon) }}</td>
                    <td class="px-4 py-2.5 text-right">
                      <span class="font-mono font-bold" :class="p.fulfillmentRate >= 98.5 ? 'text-[#2F7A50]' : 'text-[#C8502F]'">{{ p.fulfillmentRate }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 开始探索 CTA ============ -->
    <section id="sec-start" class="relative bg-[#FDFDFB] py-20 sm:py-28">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-10 text-center">
        <h2 class="text-3xl sm:text-5xl font-bold text-[#152233]">{{ $t('scrollHome.ctaTitle') }}</h2>
        <p class="mt-4 text-sm sm:text-base text-[#58685D] max-w-xl mx-auto">
          {{ $t('scrollHome.ctaDesc') }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button class="bg-[#152233] hover:bg-[#1E3A5F] text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-colors flex items-center gap-2" @click="goStats()">
            {{ $t('scrollHome.ctaOpenMap') }} <el-icon><ArrowRight /></el-icon>
          </button>
          <button class="bg-white hover:bg-[#F2F6F2] text-[#152233] border border-[#D8E2D8] font-medium px-6 py-3 rounded-lg transition-colors" @click="$emit('switch-mode', 'operational')">
            {{ $t('scrollHome.ctaOpenOps') }}
          </button>
        </div>
        <div class="mt-8 flex flex-wrap justify-center gap-2 text-[11px]">
          <span class="px-3 py-1.5 rounded-full bg-white border border-[#EAEFEA] text-[#4A5A50]">{{ $t('scrollHome.chip19') }}</span>
          <span class="px-3 py-1.5 rounded-full bg-white border border-[#EAEFEA] text-[#4A5A50]">{{ $t('scrollHome.chip6') }}</span>
          <span class="px-3 py-1.5 rounded-full bg-white border border-[#EAEFEA] text-[#4A5A50]">{{ $t('scrollHome.chip15') }}</span>
        </div>
      </div>
    </section>

    <!-- 页脚状态条 -->
    <footer class="bg-[#152233] text-white/70 py-4">
      <div class="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase tracking-widest">
        <div><div class="text-white/40 mb-1">DataSource</div><div class="font-mono text-white">IQ-RCM-2026</div></div>
        <div><div class="text-white/40 mb-1">Last Updated</div><div class="font-mono text-white">2026-10-15</div></div>
        <div><div class="text-white/40 mb-1">Governorates</div><div class="font-mono text-white">19 / 19</div></div>
        <div class="md:text-right"><span class="text-[#5BD08B]">● SYSTEM ONLINE</span></div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowDown, ArrowRight, Position } from '@element-plus/icons-vue';
import {
  NATIONAL_SUMMARY, PROVINCE_STATS, FACILITY_POINTS, RATION_ITEM_STANDARDS,
  IRAQ_GEO_JSON, PROVINCE_GEO_NAME_MAP
} from '../../../mock/data/geoStatsData.js';
import { MOCK_ADMIN_DASHBOARD_DATA } from '../../../mock/data/dashboardData.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const emit = defineEmits(['switch-mode']);

// ============ 基础数据 ============
const national = NATIONAL_SUMMARY;
const sections = [
  { id: 'sec-overview' }, { id: 'sec-population' }, { id: 'sec-distribution' }, { id: 'sec-network' }, { id: 'sec-start' }
];

const formatInt = (n) => Number(n).toLocaleString('en-US');
const nationalUrbanRate = computed(() => {
  const total = PROVINCE_STATS.reduce((a, p) => a + p.population, 0);
  const urban = PROVINCE_STATS.reduce((a, p) => a + p.population * p.urbanRate / 100, 0);
  return Number((urban / total * 100).toFixed(1));
});
const topProvince = computed(() => [...PROVINCE_STATS].sort((a, b) => b.population - a.population)[0]);
const provinceRanking = computed(() => [...PROVINCE_STATS].sort((a, b) => b.warehouseTotal - a.warehouseTotal));
const rationStandards = RATION_ITEM_STANDARDS;
const maxStandardKg = Math.max(...RATION_ITEM_STANDARDS.map(s => s.kgPerPerson));

const overviewCards = computed(() => {
  const q = MOCK_ADMIN_DASHBOARD_DATA.quarter;
  return [
    { label: t('scrollHome.cardFamilies'), value: formatInt(national.households), unit: t('scrollHome.householdsUnit'), color: '#1E3A5F', sub: t('scrollHome.cardFamiliesSub') },
    { label: t('scrollHome.cardQuota'), value: formatInt(national.monthlyQuotaTon), unit: t('scrollHome.ton'), color: '#2F7A50', sub: t('scrollHome.cardQuotaSub') },
    { label: t('scrollHome.cardFulfillment'), value: national.fulfillmentRate, unit: '%', color: '#C8A45C', sub: t('scrollHome.cardFulfillmentSub') },
    { label: t('scrollHome.cardNetwork'), value: `${formatInt(national.warehouseTotal)} / ${formatInt(national.agentCount)}`, unit: '', color: '#152233', sub: t('scrollHome.cardNetworkSub') }
  ];
});

// ============ 全局主题色 ============
const C = { navy: '#1E3A5F', deep: '#152233', green: '#2F7A50', gold: '#C8A45C', grey: '#8A9A8F', axis: '#C4CFC6' };
const chartAxis = {
  axisLabel: { color: '#8A9A8F', fontSize: 10 },
  axisLine: { lineStyle: { color: '#DDE5DE' } },
  splitLine: { lineStyle: { color: '#EEF2EE' } }
};

// ============ 图表 ============
let trendChart, commodityChart, ageChart, familyChart, provinceChart;
const trendChartRef = ref(null), commodityChartRef = ref(null), ageChartRef = ref(null), familyChartRef = ref(null), provinceChartRef = ref(null);
const heroMapRef = ref(null), networkMapRef = ref(null);
let heroMap, networkMap;
const initedCharts = new Set();

function renderTrend() {
  trendChart = echarts.init(trendChartRef.value);
  const months = PROVINCE_STATS[0].monthlyTrend.map(m => m.month);
  const quota = months.map((m, i) => PROVINCE_STATS.reduce((a, p) => a + p.monthlyTrend[i].quotaTon, 0));
  const actual = months.map((m, i) => PROVINCE_STATS.reduce((a, p) => a + p.monthlyTrend[i].actualTon, 0));
  trendChart.setOption({
    grid: { left: 56, right: 16, top: 30, bottom: 24 },
    legend: { data: [t('scrollHome.quotaLegend'), t('scrollHome.actualLegend')], top: 0, textStyle: { color: '#58685D', fontSize: 11 }, itemWidth: 14 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => formatInt(v) + ' t' },
    xAxis: { type: 'category', data: months, ...chartAxis },
    yAxis: { type: 'value', ...chartAxis, axisLabel: { ...chartAxis.axisLabel, formatter: (v) => (v / 10000) + '万' } },
    series: [
      { name: t('scrollHome.quotaLegend'), type: 'bar', data: quota, itemStyle: { color: '#B9CDBD', borderRadius: [3, 3, 0, 0] }, barWidth: 18 },
      { name: t('scrollHome.actualLegend'), type: 'line', data: actual, smooth: true, symbolSize: 6, lineStyle: { width: 3, color: C.green }, itemStyle: { color: C.green } }
    ]
  });
}

function renderCommodity() {
  commodityChart = echarts.init(commodityChartRef.value);
  const items = MOCK_ADMIN_DASHBOARD_DATA.quarter.distribution.commodities;
  commodityChart.setOption({
    grid: { left: 60, right: 40, top: 8, bottom: 24 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => formatInt(v) + ' t' },
    xAxis: { type: 'value', ...chartAxis },
    yAxis: { type: 'category', data: items.map(i => i.name).reverse(), ...chartAxis, axisLabel: { ...chartAxis.axisLabel, color: '#4A5A50' } },
    series: [
      { name: t('scrollHome.plannedLegend'), type: 'bar', data: items.map(i => i.plannedTon).reverse(), barWidth: 8, itemStyle: { color: '#D5DFD7', borderRadius: 4 }, barGap: '-100%' },
      { name: t('scrollHome.actualLegend'), type: 'bar', data: items.map(i => i.actualTon).reverse(), barWidth: 8, itemStyle: { color: C.green, borderRadius: 4 } }
    ]
  });
}

function renderAge() {
  ageChart = echarts.init(ageChartRef.value);
  const age = MOCK_ADMIN_DASHBOARD_DATA.quarter.citizens.ageDistribution;
  ageChart.setOption({
    grid: { left: 130, right: 60, top: 10, bottom: 24 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => formatInt(v) },
    xAxis: { type: 'value', ...chartAxis },
    yAxis: { type: 'category', data: age.map(a => a.name).reverse(), ...chartAxis, axisLabel: { ...chartAxis.axisLabel, color: '#4A5A50' } },
    series: [{
      type: 'bar',
      data: age.map(a => a.value).reverse(),
      barWidth: 22,
      label: { show: true, position: 'right', color: '#4A5A50', fontSize: 11, formatter: (p) => formatInt(p.value) },
      itemStyle: { borderRadius: [0, 5, 5, 0], color: (p) => [C.gold, C.navy, C.green][p.dataIndex % 3] }
    }]
  });
}

function renderFamily() {
  familyChart = echarts.init(familyChartRef.value);
  const fam = MOCK_ADMIN_DASHBOARD_DATA.quarter.families.sizeDistribution;
  familyChart.setOption({
    grid: { left: 110, right: 56, top: 8, bottom: 24 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => formatInt(v) + ' 户' },
    xAxis: { type: 'value', ...chartAxis },
    yAxis: { type: 'category', data: fam.map(f => f.name).reverse(), ...chartAxis, axisLabel: { ...chartAxis.axisLabel, color: '#4A5A50' } },
    series: [{
      type: 'bar',
      data: fam.map(f => f.count).reverse(),
      barWidth: 16,
      label: { show: true, position: 'right', color: '#4A5A50', fontSize: 10, formatter: (p) => (fam[fam.length - 1 - p.dataIndex].percentage) + '%' },
      itemStyle: { borderRadius: [0, 5, 5, 0], color: C.navy }
    }]
  });
}

function renderProvinceChart() {
  provinceChart = echarts.init(provinceChartRef.value);
  const sorted = [...PROVINCE_STATS].sort((a, b) => a.fulfillmentRate - b.fulfillmentRate);
  provinceChart.setOption({
    grid: { left: 90, right: 70, top: 10, bottom: 30 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => v + ' %' },
    xAxis: { type: 'value', min: 95, max: 100, ...chartAxis },
    yAxis: { type: 'category', data: sorted.map(p => p.name), ...chartAxis, axisLabel: { ...chartAxis.axisLabel, color: '#4A5A50', fontSize: 11 } },
    series: [{
      type: 'bar',
      data: sorted.map(p => p.fulfillmentRate),
      barWidth: 12,
      label: { show: true, position: 'right', color: '#4A5A50', fontSize: 10, formatter: (p) => p.value + '%' },
      itemStyle: {
        borderRadius: [0, 5, 5, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#C8502F' }, { offset: 0.5, color: C.gold }, { offset: 1, color: C.green }
        ])
      }
    }]
  });
}

// ============ 地图 ============
function initHeroMap() {
  heroMap = L.map(heroMapRef.value, {
    center: [33.2, 43.8], zoom: 6, zoomControl: false, attributionControl: false,
    dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false
  });
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 12 }).addTo(heroMap);
  L.geoJSON(IRAQ_GEO_JSON, {
    style: { color: '#FFFFFF', weight: 1.6, opacity: 0.9, fill: false, dashArray: '4 3' }
  }).addTo(heroMap);
}

function initNetworkMap() {
  networkMap = L.map(networkMapRef.value, {
    center: [33.2, 43.8], zoom: 6, zoomControl: false, attributionControl: false,
    scrollWheelZoom: false
  }).on('click', () => networkMap.scrollWheelZoom.enable());
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(networkMap);
  L.geoJSON(IRAQ_GEO_JSON, { style: { color: '#326445', weight: 1.2, opacity: 0.7, fillOpacity: 0.04 } }).addTo(networkMap);

  for (const pt of FACILITY_POINTS) {
    if (pt.type === 'warehouse') {
      L.circleMarker([pt.lat, pt.lng], {
        radius: 3.5,
        color: '#FFFFFF', weight: 0.6,
        fillColor: pt.status === 'vacant' ? '#C8A45C' : '#2F7A50', fillOpacity: 0.9
      }).addTo(networkMap).bindTooltip(`${pt.name} · ${pt.households || 0} 户`, { direction: 'top' });
    } else {
      L.circleMarker([pt.lat, pt.lng], {
        radius: 2.2, stroke: false,
        fillColor: '#1E3A5F', fillOpacity: 0.65
      }).addTo(networkMap);
    }
  }
}

// ============ 滚动行为 ============
const activeSection = ref('sec-hero');
let sectionObserver, chartObserver;

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goStats(metric, province) {
  const query = {};
  if (metric) query.metric = metric;
  if (province) query.province = encodeURIComponent(province);
  router.push({ path: '/stats', query });
}

function setupObservers() {
  sectionObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) activeSection.value = e.target.id;
    }
  }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('.scroll-home section[id]').forEach(el => sectionObserver.observe(el));

  chartObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting || initedCharts.has(e.target.dataset.chart)) continue;
      initedCharts.add(e.target.dataset.chart);
      switch (e.target.dataset.chart) {
        case 'trend': renderTrend(); break;
        case 'commodity': renderCommodity(); break;
        case 'age': renderAge(); break;
        case 'family': renderFamily(); break;
        case 'province': renderProvinceChart(); break;
      }
    }
  }, { rootMargin: '80px' });
  document.querySelectorAll('[data-chart]').forEach(el => chartObserver.observe(el));
}

function handleResize() {
  trendChart?.resize(); commodityChart?.resize(); ageChart?.resize();
  familyChart?.resize(); provinceChart?.resize();
  heroMap?.invalidateSize(); networkMap?.invalidateSize();
}

onMounted(async () => {
  await nextTick();
  initHeroMap();
  initNetworkMap();
  setupObservers();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  sectionObserver?.disconnect();
  chartObserver?.disconnect();
  [trendChart, commodityChart, ageChart, familyChart, provinceChart].forEach(c => c?.dispose());
  heroMap?.remove(); networkMap?.remove();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

/* 区块之间的柔和波浪分隔 */
.wave-bottom::after {
  content: '';
  display: block;
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 48px;
  background: #ffffff;
  clip-path: ellipse(60% 100% at 50% 100%);
  pointer-events: none;
}
#sec-overview.wave-bottom::after,
#sec-distribution.wave-bottom::after {
  background: #ffffff;
}
/* 深色 hero 上的 leaflet 控件隐藏 */
:deep(.leaflet-container) { background: #1B2A33; font: inherit; }
:deep(.leaflet-tooltip) { font-size: 11px; }
</style>
