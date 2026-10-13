<template>
  <div class="agent-dashboard space-y-4">
    <!-- ======================================================== -->
    <!-- 核心 KPI 数据概览卡片 (适配 Google Pixel 9 412px 视口，2x2 规整网格) -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
      <!-- KPI 1: 计划出库执行率 -->
      <div class="p-3 sm:p-4 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-1.5 sm:space-y-2 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between text-blue-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.outboundRate') || '出库执行率' }}</span>
          <el-icon class="text-blue-600 text-sm sm:text-base"><DataAnalysis /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-bold font-mono text-blue-700">{{ kpiData.outboundRate }}%</span>
          <span class="text-[10px] sm:text-xs text-slate-500">{{ isEn ? 'Executed' : '已执行' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 sm:h-1.5 overflow-hidden">
          <div class="bg-blue-600 h-full rounded-full transition-all duration-500" :style="{ width: `${kpiData.outboundRate}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5 font-mono">
          <span>{{ isEn ? 'Signed:' : '签收:' }} <strong>{{ kpiData.receivedRate }}%</strong></span>
          <span>{{ isEn ? 'Claimed:' : '核销:' }} <strong>{{ kpiData.claimedRate }}%</strong></span>
        </div>
      </div>

      <!-- KPI 2: 战略储备在库可用余量 -->
      <div class="p-3 sm:p-4 bg-white rounded-xl border border-teal-100 shadow-2xs space-y-1.5 sm:space-y-2 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between text-teal-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.strategicStock') || '战略储备在库' }}</span>
          <el-icon class="text-teal-600 text-sm sm:text-base"><Box /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-bold font-mono text-slate-900">{{ (kpiData.availableStock || 0).toLocaleString() }}</span>
          <span class="text-[10px] sm:text-xs text-slate-400">KG</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 sm:h-1.5 overflow-hidden flex">
          <div class="bg-teal-500 h-full" style="width: 93%" title="可用"></div>
          <div class="bg-amber-400 h-full" style="width: 6.4%" title="在途锁定"></div>
          <div class="bg-rose-500 h-full" style="width: 0.6%" title="异常冻结"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5 font-mono">
          <span>{{ isEn ? 'In-Transit:' : '在途:' }} <strong class="text-amber-600">{{ (kpiData.lockedStock || 0).toLocaleString() }}</strong></span>
          <span>{{ isEn ? 'Frozen:' : '冻结:' }} <strong class="text-rose-600">{{ (kpiData.frozenStock || 0).toLocaleString() }}</strong></span>
        </div>
      </div>

      <!-- KPI 3: 交付与网点对账合规率 -->
      <div class="p-3 sm:p-4 bg-white rounded-xl border border-amber-100 shadow-2xs space-y-1.5 sm:space-y-2 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between text-amber-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.deliveryReconRate') || '网点交付对账率' }}</span>
          <el-icon class="text-amber-600 text-sm sm:text-base"><Checked /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-bold font-mono text-amber-700">{{ kpiData.complianceRate }}%</span>
          <span class="text-[10px] sm:text-xs text-slate-500">{{ isEn ? 'Qualified' : '达标' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 sm:h-1.5 overflow-hidden">
          <div class="bg-amber-500 h-full rounded-full transition-all duration-500" :style="{ width: `${kpiData.complianceRate}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
          <span>{{ isEn ? 'Blocked:' : '阻断:' }} <strong class="text-rose-600">{{ kpiData.blockedCount }}</strong></span>
          <span class="text-emerald-700 font-medium">{{ isEn ? 'No Discrepancy' : '无差额' }}</span>
        </div>
      </div>

      <!-- KPI 4: 账实相符达标率 -->
      <div class="p-3 sm:p-4 bg-white rounded-xl border border-emerald-100 shadow-2xs space-y-1.5 sm:space-y-2 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between text-emerald-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.stockAccuracy') || '账实相符率' }}</span>
          <el-icon class="text-emerald-600 text-sm sm:text-base"><CircleCheckFilled /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-bold font-mono text-emerald-700">{{ kpiData.matchRate }}%</span>
          <span class="text-[10px] sm:text-xs text-slate-500">{{ isEn ? 'Qualified' : '达标' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 sm:h-1.5 overflow-hidden">
          <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" :style="{ width: `${kpiData.matchRate}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
          <span>{{ isEn ? 'Loss:' : '损耗:' }} <strong class="text-slate-800 font-mono">{{ kpiData.lossRate }}%</strong></span>
          <span class="text-emerald-600 font-medium">{{ isEn ? 'Audited' : '双签在册' }}</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 进销存统计概览卡片 (移动端适配) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
      <!-- 进货 (入库) -->
      <div class="p-3 sm:p-4 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1.5 sm:space-y-2 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between text-indigo-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">本期进货入库</span>
          <el-icon class="text-indigo-600 text-sm sm:text-base"><Bottom /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-bold font-mono text-indigo-700">{{ (inventoryStats.totalInbound || 0).toLocaleString() }}</span>
          <span class="text-[10px] sm:text-xs text-slate-400">吨</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div class="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" :style="{ width: `${Math.min(100, (inventoryStats.totalInbound / (inventoryStats.plannedInbound || 1)) * 100)}%` }"></div>
        </div>
        <div class="text-[11px] text-slate-500 flex items-center justify-between pt-0.5 font-mono">
          <span>计划: <strong>{{ (inventoryStats.plannedInbound || 0).toLocaleString() }}</strong> 吨</span>
          <span class="text-indigo-600 font-medium">完成率 {{ inventoryStats.inboundRate || 0 }}%</span>
        </div>
      </div>

      <!-- 销货 (出库配发) -->
      <div class="p-4 bg-white rounded-xl border border-orange-100 shadow-2xs space-y-2 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between text-orange-900 text-xs">
          <span class="font-medium text-slate-700">本期销货出库配发</span>
          <el-icon class="text-orange-600 text-base"><Top /></el-icon>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold font-mono text-orange-700">{{ (inventoryStats.totalOutbound || 0).toLocaleString() }}</span>
          <span class="text-xs text-slate-400">吨</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div class="bg-orange-500 h-1.5 rounded-full transition-all duration-500" :style="{ width: `${Math.min(100, (inventoryStats.totalOutbound / (inventoryStats.plannedOutbound || 1)) * 100)}%` }"></div>
        </div>
        <div class="text-[11px] text-slate-500 flex items-center justify-between pt-0.5 font-mono">
          <span>计划: <strong>{{ (inventoryStats.plannedOutbound || 0).toLocaleString() }}</strong> 吨</span>
          <span class="text-orange-600 font-medium">配发率 {{ inventoryStats.outboundDispatchRate || 0 }}%</span>
        </div>
      </div>

      <!-- 库存结余 -->
      <div class="p-4 bg-white rounded-xl border border-cyan-100 shadow-2xs space-y-2 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between text-cyan-900 text-xs">
          <span class="font-medium text-slate-700">期末库存结余</span>
          <el-icon class="text-cyan-600 text-base"><Coin /></el-icon>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold font-mono text-cyan-700">{{ (inventoryStats.endingStock || 0).toLocaleString() }}</span>
          <span class="text-xs text-slate-400">吨</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
          <div class="bg-cyan-500 h-1.5" :style="{ width: `${inventoryStats.stockHealthRate || 85}%` }" title="健康库存"></div>
          <div class="bg-amber-400 h-1.5" :style="{ width: `${100 - (inventoryStats.stockHealthRate || 85)}%` }" title="预警库存"></div>
        </div>
        <div class="text-[11px] text-slate-500 flex items-center justify-between pt-0.5 font-mono">
          <span>库存周转: <strong class="text-cyan-600">{{ inventoryStats.turnoverDays || 0 }} 天</strong></span>
          <span :class="(inventoryStats.stockChangeRate || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="font-medium">
            {{ (inventoryStats.stockChangeRate || 0) >= 0 ? '+' : '' }}{{ inventoryStats.stockChangeRate || 0 }}% 环比
          </span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 第一行: 省区配给履约柱折图 + 物资状态分布堆叠图 -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div class="lg:col-span-7 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>重点省区配给履约比对</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              各省指标下发、出库发运、网点签收与核销率
            </p>
          </div>
          <el-tag size="small" type="primary" effect="plain" class="font-mono">SCM</el-tag>
        </div>
        <div ref="fulfillmentChartRef" class="w-full h-76"></div>
      </div>

      <div class="lg:col-span-5 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>储备物资业务状态分布</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              各口粮品类可用储备与在途/异常占用
            </p>
          </div>
          <el-tag size="small" type="success" effect="plain" class="font-mono">库存模型</el-tag>
        </div>
        <div ref="inventoryStatusChartRef" class="w-full h-76"></div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 第二行: 储备仓库容玫瑰图 + 流通损耗雷达图 -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div class="lg:col-span-5 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>重点战略储备仓库容分布</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              中心总仓与前置保供仓战略储备吨位分布
            </p>
          </div>
          <el-tag size="small" type="info" effect="plain" class="font-mono">仓储分布</el-tag>
        </div>
        <div ref="warehouseCapacityChartRef" class="w-full h-76"></div>
      </div>

      <div class="lg:col-span-7 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>流转节点损耗合规雷达</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              仓储、运输与网点损耗对比国标预警红线
            </p>
          </div>
          <el-tag size="small" type="danger" effect="plain" class="font-mono">合规审计</el-tag>
        </div>
        <div ref="lossRadarChartRef" class="w-full h-76"></div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 第三行: 配给吞吐流转走势 (渐变折线图) -->
    <!-- ======================================================== -->
    <div class="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>配给流转吞吐动销走势</span>
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">
            中心仓出库发运、网点签收核销的流转趋势
          </p>
        </div>
        <div class="flex items-center gap-3 text-xs font-mono">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block"></span>
            <span class="text-slate-600 text-[11px]">中心仓出库</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>
            <span class="text-slate-600 text-[11px]">网点签收</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span>
            <span class="text-slate-600 text-[11px]">家庭核销</span>
          </div>
        </div>
      </div>
      <div ref="dailyThroughputChartRef" class="w-full h-80"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import * as echarts from 'echarts';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');
import { DataAnalysis, Box, Checked, CircleCheckFilled, Bottom, Top, Coin } from '@element-plus/icons-vue';
import {
  getWarehouseStockList,
  getLossAuditStats
} from '../../../api/warehouse.js';
import { getAgentDashboardStats } from '../../../api/dashboard.js';

const props = defineProps({
  timeRange: {
    type: String,
    default: 'quarter'
  }
});

const kpiData = ref({
  outboundRate: 80.0,
  receivedRate: 64.0,
  claimedRate: 50.0,
  availableStock: 378000,
  lockedStock: 25920,
  frozenStock: 400,
  complianceRate: 99.8,
  blockedCount: 1,
  matchRate: 99.88,
  lossRate: 0.48
});

// 进销存统计数据
const inventoryStats = ref({
  totalInbound: 12580,
  plannedInbound: 15000,
  inboundRate: 83.9,
  totalOutbound: 9870,
  plannedOutbound: 12000,
  outboundDispatchRate: 82.3,
  endingStock: 2710,
  stockHealthRate: 88,
  turnoverDays: 18,
  stockChangeRate: -3.2
});

// 图表 DOM 引用
const fulfillmentChartRef = ref(null);
const inventoryStatusChartRef = ref(null);
const warehouseCapacityChartRef = ref(null);
const lossRadarChartRef = ref(null);
const dailyThroughputChartRef = ref(null);

// ECharts 实例
let fulfillmentChart = null;
let inventoryStatusChart = null;
let warehouseCapacityChart = null;
let lossRadarChart = null;
let dailyThroughputChart = null;

// 缓存原始接口数据
let rawStockList = [];
let rawLossStats = {};
let currentFulfillmentReports = [];

/**
 * 1. 履约比对图表
 */
function renderFulfillmentChart(reports = []) {
  if (!fulfillmentChartRef.value) return;
  if (!fulfillmentChart) {
    fulfillmentChart = echarts.init(fulfillmentChartRef.value);
  }

  const provinces = reports.length ? reports.map(r => r.province.replace(' (宪法第140号决议区)', '')) : ['巴格达省', '尼尼微省', '巴士拉省', '迪亚拉省', '基尔库克省', '安巴尔省'];
  const allocated = reports.length ? reports.map(r => r.totalAllocatedTon) : [15000, 8500, 9200, 4800, 6000, 5200];
  const outbound = reports.length ? reports.map(r => r.outboundTon) : [12000, 6800, 7500, 3900, 4800, 4100];
  const received = reports.length ? reports.map(r => r.receivedTon) : [9600, 5440, 6000, 3120, 3840, 3280];
  const claimed = reports.length ? reports.map(r => r.claimedTon) : [7500, 4250, 4600, 2400, 3000, 2600];
  const rates = reports.length ? reports.map(r => r.fulfillmentRate) : [80.0, 80.0, 81.5, 81.25, 80.0, 78.8];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['计划总指标 (吨)', '中心仓已出库', '网点已签收', '家庭实际核销', '综合履约率 (%)'],
      top: 0,
      textStyle: { fontSize: 11 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '14%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: provinces,
      axisLabel: { interval: 0, rotate: 12, fontSize: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '物资吨数 (吨)',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      {
        type: 'value',
        name: '履约率 (%)',
        min: 60,
        max: 100,
        interval: 10,
        axisLabel: { formatter: '{value}%' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '计划总指标 (吨)',
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: { color: '#cbd5e1', borderRadius: [3, 3, 0, 0] },
        data: allocated
      },
      {
        name: '中心仓已出库',
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: { color: '#3b82f6', borderRadius: [3, 3, 0, 0] },
        data: outbound
      },
      {
        name: '网点已签收',
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: { color: '#f59e0b', borderRadius: [3, 3, 0, 0] },
        data: received
      },
      {
        name: '家庭实际核销',
        type: 'bar',
        barMaxWidth: 14,
        itemStyle: { color: '#10b981', borderRadius: [3, 3, 0, 0] },
        data: claimed
      },
      {
        name: '综合履约率 (%)',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        data: rates
      }
    ]
  };

  fulfillmentChart.setOption(option);
}

/**
 * 2. 库存状态堆叠图
 */
function renderInventoryStatusChart(stocks = []) {
  if (!inventoryStatusChartRef.value) return;
  if (!inventoryStatusChart) {
    inventoryStatusChart = echarts.init(inventoryStatusChartRef.value);
  }

  const itemMap = {};
  if (stocks.length > 0) {
    stocks.forEach(s => {
      const name = s.itemName || '其他物资';
      if (!itemMap[name]) {
        itemMap[name] = { available: 0, locked: 0, frozen: 0 };
      }
      itemMap[name].available += (s.availableQty || 0);
      itemMap[name].locked += (s.lockedQty || 0);
      itemMap[name].frozen += (s.frozenQty || 0);
    });
  } else {
    itemMap['大米'] = { available: 160000, locked: 12000, frozen: 0 };
    itemMap['小麦粉'] = { available: 110000, locked: 8000, frozen: 0 };
    itemMap['食用油'] = { available: 50000, locked: 3000, frozen: 0 };
    itemMap['细白糖'] = { available: 32000, locked: 2000, frozen: 0 };
    itemMap['奶粉'] = { available: 16000, locked: 800, frozen: 400 };
    itemMap['食用盐'] = { available: 10000, locked: 120, frozen: 0 };
  }

  const categories = Object.keys(itemMap);
  const availableData = categories.map(k => Math.round(itemMap[k].available / 1000));
  const lockedData = categories.map(k => Math.round(itemMap[k].locked / 1000));
  const frozenData = categories.map(k => Math.round(itemMap[k].frozen / 1000));

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        let text = `<div class="font-bold">${params[0].name}</div>`;
        params.forEach(p => {
          text += `<div>${p.marker} ${p.seriesName}: <strong>${p.value} 吨</strong></div>`;
        });
        return text;
      }
    },
    legend: {
      data: ['可用库存', '在途锁定', '异常冻结'],
      top: 0,
      textStyle: { fontSize: 11 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '14%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { interval: 0, rotate: 15, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '千吨 (k-Tons)',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: '可用库存',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 18,
        itemStyle: { color: '#0d9488' },
        data: availableData
      },
      {
        name: '在途锁定',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 18,
        itemStyle: { color: '#f59e0b' },
        data: lockedData
      },
      {
        name: '异常冻结',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 18,
        itemStyle: { color: '#e11d48', borderRadius: [3, 3, 0, 0] },
        data: frozenData
      }
    ]
  };

  inventoryStatusChart.setOption(option);
}

/**
 * 3. 物理库容玫瑰图
 */
function renderWarehouseCapacityChart() {
  if (!warehouseCapacityChartRef.value) return;
  if (!warehouseCapacityChart) {
    warehouseCapacityChart = echarts.init(warehouseCapacityChartRef.value);
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <strong>{c} 吨</strong> ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { fontSize: 10 }
    },
    series: [
      {
        name: '战略储备物理库容',
        type: 'pie',
        radius: ['24%', '68%'],
        center: ['50%', '45%'],
        roseType: 'area',
        itemStyle: { borderRadius: 6 },
        data: [
          { value: 160, name: '巴格达第一国家储备粮库 (中心总仓)', itemStyle: { color: '#3b82f6' } },
          { value: 110, name: '卡尔赫面粉战略储备仓', itemStyle: { color: '#06b6d4' } },
          { value: 75, name: '鲁萨法物资配送总站 (枢纽前置仓)', itemStyle: { color: '#10b981' } },
          { value: 33, name: '迪亚拉哈奈根前置保供仓', itemStyle: { color: '#f59e0b' } }
        ]
      }
    ]
  };

  warehouseCapacityChart.setOption(option);
}

/**
 * 4. 流通三节点损耗雷达
 */
function renderLossRadarChart(lossStats = {}) {
  if (!lossRadarChartRef.value) return;
  if (!lossRadarChart) {
    lossRadarChart = echarts.init(lossRadarChartRef.value);
  }

  const storageLoss = lossStats.storageLossRate || 0.12;
  const transportLoss = lossStats.transportLossRate || 0.28;
  const agentLoss = lossStats.agentDeliveryLossRate || 0.08;
  const compliantRate = lossStats.totalCompliantRate || 99.88;

  const option = {
    tooltip: { trigger: 'item' },
    legend: {
      data: ['实测供应链表现', '国标公差红线基准'],
      top: 0,
      textStyle: { fontSize: 11 }
    },
    radar: {
      center: ['50%', '52%'],
      radius: '65%',
      indicator: [
        { name: '仓储存储损耗率 (%)', max: 0.3 },
        { name: '干线运输损耗率 (%)', max: 0.4 },
        { name: '网点交付损耗率 (%)', max: 0.2 },
        { name: '账实相符对账率 (%)', max: 100 },
        { name: '云端同步合规率 (%)', max: 100 }
      ],
      axisName: { color: '#64748b', fontSize: 10 },
      splitArea: {
        areaStyle: {
          color: ['#f8fafc', '#ffffff', '#f8fafc', '#ffffff']
        }
      }
    },
    series: [
      {
        name: '损耗合规比对',
        type: 'radar',
        data: [
          {
            value: [storageLoss, transportLoss, agentLoss, compliantRate, 99.9],
            name: '实测供应链表现',
            lineStyle: { color: '#0d9488', width: 2 },
            areaStyle: { color: 'rgba(13, 148, 136, 0.25)' },
            itemStyle: { color: '#0d9488' }
          },
          {
            value: [0.15, 0.20, 0.10, 98.0, 95.0],
            name: '国标公差红线基准',
            lineStyle: { color: '#f43f5e', width: 2, type: 'dashed' },
            areaStyle: { color: 'rgba(244, 63, 94, 0.1)' },
            itemStyle: { color: '#f43f5e' }
          }
        ]
      }
    ]
  };

  lossRadarChart.setOption(option);
}

/**
 * 5. 吞吐走势面积图 (根据选定时间范围自适应展示天数/周期)
 */
function renderDailyThroughputChart(daysCount = 30) {
  if (!dailyThroughputChartRef.value) return;
  if (!dailyThroughputChart) {
    dailyThroughputChart = echarts.init(dailyThroughputChartRef.value);
  }

  const days = [];
  const outboundData = [];
  const receivedData = [];
  const claimedData = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(2026, 9, 12);
    d.setDate(d.getDate() - i);
    days.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);

    const cycle = Math.sin(i / 3.5);
    const outBase = Math.round(520 + cycle * 120 + (i % 5) * 35);
    const recBase = Math.round(480 + Math.sin((i - 1) / 3.5) * 110 + (i % 4) * 28);
    const clmBase = Math.round(430 + Math.sin((i - 2) / 3.5) * 105 + (i % 6) * 32);

    outboundData.push(outBase);
    receivedData.push(recBase);
    claimedData.push(clmBase);
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisLabel: { fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '流转吞吐 (吨)',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: '中心仓出库',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#6366f1' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.4)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.02)' }
          ])
        },
        itemStyle: { color: '#6366f1' },
        data: outboundData
      },
      {
        name: '网点签收',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#f59e0b' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.35)' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.02)' }
          ])
        },
        itemStyle: { color: '#f59e0b' },
        data: receivedData
      },
      {
        name: '家庭核销',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.35)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
          ])
        },
        itemStyle: { color: '#10b981' },
        data: claimedData
      }
    ]
  };

  dailyThroughputChart.setOption(option);
}

function handleResize() {
  fulfillmentChart?.resize();
  inventoryStatusChart?.resize();
  warehouseCapacityChart?.resize();
  lossRadarChart?.resize();
  dailyThroughputChart?.resize();
}

/**
 * 加载并联动时间范围
 */
async function loadData() {
  try {
    const [agentOverview, stockList, loss] = await Promise.all([
      getAgentDashboardStats(props.timeRange),
      getWarehouseStockList(),
      getLossAuditStats()
    ]);

    rawStockList = stockList || [];
    rawLossStats = loss || {};

    if (agentOverview?.kpi) {
      kpiData.value = { ...agentOverview.kpi };
    }
    if (agentOverview?.inventoryStats) {
      inventoryStats.value = { ...agentOverview.inventoryStats };
    }
    currentFulfillmentReports = agentOverview?.fulfillmentReports || [];

    await nextTick();
    renderFulfillmentChart(currentFulfillmentReports);
    renderInventoryStatusChart(rawStockList);
    renderWarehouseCapacityChart();
    renderLossRadarChart(rawLossStats);
    renderDailyThroughputChart(agentOverview?.throughputDays || (props.timeRange === 'week' ? 7 : 30));
  } catch (e) {
    console.error('加载配给代理看板数据失败:', e);
  }
}

// 监听时间范围改变，即时重绘与切换数据
watch(() => props.timeRange, () => {
  loadData();
});

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  fulfillmentChart?.dispose();
  inventoryStatusChart?.dispose();
  warehouseCapacityChart?.dispose();
  lossRadarChart?.dispose();
  dailyThroughputChart?.dispose();
});

defineExpose({
  refresh: loadData
});
</script>

<style scoped>
</style>
