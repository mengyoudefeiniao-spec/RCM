<template>
  <div class="admin-dashboard space-y-4">
    <!-- ======================================================== -->
    <!-- 顶部 5 大核心维度 KPI 指标概览卡片 -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
      <!-- 维度 1: 公民 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-blue-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.enrolledCitizens') || '在册持卡公民' }}</span>
          <el-icon class="text-blue-600 text-sm sm:text-base"><User /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {{ formatWan(dashboardData.citizens?.totalCitizens) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-slate-400">{{ isEn ? 'persons' : '人' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <div class="bg-blue-600 h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.citizens?.biometricVerifiedRate || 95}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
          <span>{{ isEn ? 'Verified:' : '核验:' }} <strong class="text-blue-700 font-mono">{{ dashboardData.citizens?.biometricVerifiedRate }}%</strong></span>
          <span class="text-emerald-600 font-medium">+{{ formatNumber(dashboardData.citizens?.newRegistered) }}</span>
        </div>
      </div>

      <!-- 维度 2: 家庭 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-indigo-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.enrolledFamilies') || '建档保障家庭' }}</span>
          <el-icon class="text-indigo-600 text-sm sm:text-base"><House /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {{ formatWan(dashboardData.families?.totalFamilies) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-slate-400">{{ isEn ? 'families' : '户' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <div class="bg-indigo-600 h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.families?.activeRate || 96}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
          <span>{{ isEn ? 'Avg:' : '户均:' }} <strong class="text-indigo-700 font-mono">{{ dashboardData.families?.avgFamilySize }}{{ isEn ? 'p' : '人' }}</strong></span>
          <span class="text-slate-600">{{ isEn ? 'Active ' : '正常' }}{{ dashboardData.families?.activeRate }}%</span>
        </div>
      </div>

      <!-- 维度 3: 地区代理商 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-xl border border-teal-100 shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-teal-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.contractedAgents') || '全国签约代理商' }}</span>
          <el-icon class="text-teal-600 text-sm sm:text-base"><Shop /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {{ formatNumber(dashboardData.agents?.totalAgents) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-slate-400">{{ isEn ? 'agents' : '家' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <div class="bg-teal-600 h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.agents?.complianceRate || 90}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
          <span>{{ isEn ? 'Compliance:' : '考核:' }} <strong class="text-teal-700 font-mono">{{ dashboardData.agents?.complianceRate }}%</strong></span>
          <span class="text-amber-600 font-medium">{{ dashboardData.agents?.overloadedAgents }} {{ isEn ? 'Alerts' : '预警' }}</span>
        </div>
      </div>

      <!-- 维度 4: 实际配给情况 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-xl border border-emerald-100 shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-emerald-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.actualDistribution') || '实际配发总量' }}</span>
          <el-icon class="text-emerald-600 text-sm sm:text-base"><Box /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-emerald-700">
            {{ formatWan(dashboardData.distribution?.totalDistributedTons) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-slate-400">{{ isEn ? 'Tons' : '吨' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <div class="bg-emerald-600 h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.distribution?.targetFulfillmentRate || 98}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
          <span>{{ isEn ? 'Fulfillment:' : '履约:' }} <strong class="text-emerald-700 font-mono">{{ dashboardData.distribution?.targetFulfillmentRate }}%</strong></span>
          <span class="text-slate-600">{{ isEn ? 'On-time ' : '准时' }}{{ dashboardData.distribution?.onTimeDeliveryRate }}%</span>
        </div>
      </div>

      <!-- 维度 5: 投诉和处理 (在 412px 屏幕下独占一行通栏展示，对称饱满) -->
      <div class="col-span-2 sm:col-span-1 p-3 sm:p-3.5 bg-white rounded-xl border border-rose-100 shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-rose-900 text-xs">
          <span class="font-medium text-slate-700 text-[11px] sm:text-xs">{{ $t('dashboard.complaintEfficiency') || '群众投诉与办结' }}</span>
          <el-icon class="text-rose-600 text-sm sm:text-base"><Service /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {{ formatNumber(dashboardData.complaints?.totalComplaints) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-slate-400">{{ isEn ? 'cases' : '件' }}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <div class="bg-rose-500 h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.complaints?.resolvedRate || 95}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
          <span>{{ isEn ? 'Resolved:' : '办结:' }} <strong class="text-rose-600 font-mono">{{ dashboardData.complaints?.resolvedRate }}%</strong></span>
          <span class="text-slate-600">{{ isEn ? 'Avg ' : '均时 ' }}{{ dashboardData.complaints?.avgResolutionHours }}h</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 1: 公民与家庭数据统计分析 (2张图表并排) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 图表 1: 公民年龄构成与新增核验走势 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>公民人口结构与登记走势</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              各年龄段受助比例及本期新增登记动态
            </p>
          </div>
          <el-tag size="small" type="primary" effect="plain" class="font-mono">公民统计</el-tag>
        </div>
        <div ref="citizenTrendChartRef" class="w-full h-72"></div>
      </div>

      <!-- 图表 2: 家庭规模分布与民生业务办理统计 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>家庭规模与民生业务办结</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              家庭户型构成及分户/解冻/变更等业务受理量
            </p>
          </div>
          <el-tag size="small" type="primary" effect="plain" class="font-mono">家庭统计</el-tag>
        </div>
        <div ref="familyBusinessChartRef" class="w-full h-72"></div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 2: 各地区代理商与实际配给情况统计分析 (2张图表并排) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 图表 3: 各省区代理商网点分布与负荷度比对 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>各地区代理商分布与服务负荷</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              各省网点数量与网点平均服务家庭规模比对
            </p>
          </div>
          <el-tag size="small" type="success" effect="plain" class="font-mono">代理商网络</el-tag>
        </div>
        <div ref="agentRegionChartRef" class="w-full h-72"></div>
      </div>

      <!-- 图表 4: 实际配给情况与战略物资达成进度 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>核心战略物资实际配给完成进度</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              计划指标下发与实际终端核销发放量比对
            </p>
          </div>
          <el-tag size="small" type="success" effect="plain" class="font-mono">配给履约</el-tag>
        </div>
        <div ref="rationDistributionChartRef" class="w-full h-72"></div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 3: 投诉和处理数据统计分析与重点督办清单 -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 图表 5: 投诉诉求类型分布 (南丁格尔玫瑰图) -->
      <div class="lg:col-span-4 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>投诉诉求成因分类</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              代销短缺、服务态度、收费违规等投诉构成
            </p>
          </div>
          <el-tag size="small" type="danger" effect="plain" class="font-mono">类型构成</el-tag>
        </div>
        <div ref="complaintPieChartRef" class="w-full h-72"></div>
      </div>

      <!-- 图表 6: 投诉受理与办结趋势 (折线走势图) -->
      <div class="lg:col-span-8 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>投诉受理量与办结销单走势</span>
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              各阶段投诉接报量、处置办结量及平均解决时效
            </p>
          </div>
          <el-tag size="small" type="warning" effect="plain" class="font-mono">处置走势</el-tag>
        </div>
        <div ref="complaintTrendChartRef" class="w-full h-72"></div>
      </div>
    </div>

    <!-- 模块 4: 重点督办投诉案件简明清单 -->
    <div class="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-slate-700"></span>
          <h3 class="text-xs font-bold text-slate-800">近期群众维权与诉求处置案件速览</h3>
          <el-tag size="small" type="info" class="font-mono">共 {{ (dashboardData.complaints?.recentComplaints || []).length }} 笔重点督办</el-tag>
        </div>
        <span class="text-[11px] text-slate-400">已全面落实行政裁决与即时整改</span>
      </div>

      <el-table :data="dashboardData.complaints?.recentComplaints || []" size="small" stripe border class="text-xs">
        <el-table-column prop="id" label="工单编号" width="130">
          <template #default="{ row }">
            <span class="font-mono font-bold text-blue-600">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="诉求类型" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="province" label="所属地区" min-width="140" />
        <el-table-column prop="agent" label="涉及网点" min-width="150" />
        <el-table-column prop="applicant" label="投诉群众" width="120" />
        <el-table-column prop="result" label="核处结果与整改措施" min-width="220">
          <template #default="{ row }">
            <span class="text-slate-700">{{ row.result }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="办理状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已办结' ? 'success' : 'warning'" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="登记日期" width="100" align="center" class-name="font-mono text-slate-400" />
      </el-table>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 5: 公民配给订单需求统计与 AI 扩容预测看板 (需求 1 联动数据看板) -->
    <!-- ======================================================== -->
    <div class="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>{{ $t('dashboard.orderDemandInsightTitle') }}</span>
            <el-tag size="small" type="primary" effect="plain" class="font-mono">{{ $t('dashboard.demandPenetrationTag') }}</el-tag>
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">
            {{ $t('dashboard.orderDemandInsightSub') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <el-tag size="small" type="success" effect="dark" class="font-mono">
            {{ $t('dashboard.aiModelActive') }}
          </el-tag>
          <el-button size="small" type="primary" plain @click="$router.push('/warehouse?tab=orderStats')">
            {{ $t('dashboard.drillDownOrderStatsBtn') }}
          </el-button>
        </div>
      </div>

      <!-- 四大核心口粮汇总卡片 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <div class="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
          <div class="flex justify-between text-blue-900 text-[11px]">
            <span>{{ $t('dashboard.flourDemand') }}</span>
            <span class="font-bold">🌾</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-blue-700">286,500 KG</div>
          <div class="text-[10px] text-slate-400">{{ $t('dashboard.flourDemandMoM') }}</div>
        </div>
        <div class="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-1">
          <div class="flex justify-between text-teal-900 text-[11px]">
            <span>{{ $t('dashboard.riceDemand') }}</span>
            <span class="font-bold">🍚</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-teal-700">118,200 KG</div>
          <div class="text-[10px] text-slate-400">{{ $t('dashboard.riceDemandMoM') }}</div>
        </div>
        <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-100 space-y-1">
          <div class="flex justify-between text-amber-900 text-[11px]">
            <span>{{ $t('dashboard.oilDemand') }}</span>
            <span class="font-bold">🌻</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-amber-700">42,300 L</div>
          <div class="text-[10px] text-slate-400">{{ $t('dashboard.oilDemandMoM') }}</div>
        </div>
        <div class="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
          <div class="flex justify-between text-indigo-900 text-[11px]">
            <span>{{ $t('dashboard.sugarDemand') }}</span>
            <span class="font-bold">🍬</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-indigo-700">49,800 KG</div>
          <div class="text-[10px] text-slate-400">{{ $t('dashboard.sugarDemandMoM') }}</div>
        </div>
      </div>

      <!-- AI 扩容需求决策建议 -->
      <div class="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-slate-50 border border-indigo-100 text-xs space-y-2">
        <div class="flex items-center gap-2 font-bold text-indigo-950">
          <span class="text-base">🤖</span>
          <span>{{ $t('dashboard.aiExpansionConclusionTitle') }}</span>
        </div>
        <p class="text-slate-600 leading-relaxed text-[11px]">
          {{ $t('dashboard.aiExpansionConclusionText') }}
        </p>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 6: 代理商订单统计分析全景看板 (需求 5 联动数据看板) -->
    <!-- ======================================================== -->
    <div class="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>{{ $t('dashboard.agentOrdersOverviewTitle') }}</span>
            <el-tag size="small" type="success" effect="plain" class="font-mono">{{ $t('dashboard.wholesaleAnalyticsTag') }}</el-tag>
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">
            {{ $t('dashboard.agentOrdersOverviewSub') }}
          </p>
        </div>
        <el-button size="small" type="success" plain @click="$router.push('/agent?tab=orderAnalytics')">
          {{ $t('dashboard.enterAgentAnalyticsBtn') }}
        </el-button>
      </div>

      <AgentOrderStatsChart />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import AgentOrderStatsChart from '../../agent/components/AgentOrderStatsChart.vue';
import * as echarts from 'echarts';
import { User, House, Shop, Box, Service } from '@element-plus/icons-vue';
import { getAdminDashboardStats } from '../../../api/dashboard.js';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const props = defineProps({
  timeRange: {
    type: String,
    default: 'quarter'
  }
});

const dashboardData = ref({});

// 图表 DOM 引用
const citizenTrendChartRef = ref(null);
const familyBusinessChartRef = ref(null);
const agentRegionChartRef = ref(null);
const rationDistributionChartRef = ref(null);
const complaintPieChartRef = ref(null);
const complaintTrendChartRef = ref(null);

// ECharts 实例
let citizenTrendChart = null;
let familyBusinessChart = null;
let agentRegionChart = null;
let rationDistributionChart = null;
let complaintPieChart = null;
let complaintTrendChart = null;

function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString();
}

function formatWan(num) {
  if (!num) return '0';
  if (isEn.value) {
    return (Number(num) / 1000).toFixed(1) + ' k';
  }
  return (Number(num) / 10000).toFixed(1) + ' 万';
}

function getTypeTag(type) {
  if (type.includes('收费')) return 'danger';
  if (type.includes('品质')) return 'warning';
  if (type.includes('少发')) return 'danger';
  return 'info';
}

/**
 * 1. 公民结构与新增走势 (柱折混合图)
 */
function renderCitizenTrendChart(citizens = {}) {
  const el = citizenTrendChartRef.value;
  if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
  if (!citizenTrendChart) {
    citizenTrendChart = echarts.init(el);
  }

  const trend = citizens.growthTrend || { dates: [], newRegistered: [], biometricVerified: [] };

  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['新增登记公民', '生物核验完成'],
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
      data: trend.dates,
      axisLabel: { fontSize: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '新增登记 (人)',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      {
        type: 'value',
        name: '生物核验 (人)',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '新增登记公民',
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#3b82f6', borderRadius: [3, 3, 0, 0] },
        data: trend.newRegistered
      },
      {
        name: '生物核验完成',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        data: trend.biometricVerified
      }
    ]
  };

  citizenTrendChart.setOption(option);
}

/**
 * 2. 家庭规模与业务办理统计 (双柱状图)
 */
function renderFamilyBusinessChart(families = {}) {
  const el = familyBusinessChartRef.value;
  if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
  if (!familyBusinessChart) {
    familyBusinessChart = echarts.init(el);
  }

  const bStats = families.businessStats || [];
  const types = bStats.map(b => b.type);
  const applies = bStats.map(b => b.applyCount);
  const approved = bStats.map(b => b.approvedCount);

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['业务申请受理量', '办结通过量'],
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
      data: types,
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '工单件数',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: '业务申请受理量',
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#818cf8', borderRadius: [3, 3, 0, 0] },
        data: applies
      },
      {
        name: '办结通过量',
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#4f46e5', borderRadius: [3, 3, 0, 0] },
        data: approved
      }
    ]
  };

  familyBusinessChart.setOption(option);
}

/**
 * 3. 代理商分布与服务负荷 (柱折混合图)
 */
function renderAgentRegionChart(agents = {}) {
  const el = agentRegionChartRef.value;
  if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
  if (!agentRegionChart) {
    agentRegionChart = echarts.init(el);
  }

  const regions = agents.regionDistribution || [];
  const provinces = regions.map(r => r.province);
  const agentCounts = regions.map(r => r.agentCount);
  const avgHouseholds = regions.map(r => r.avgHouseholds);

  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['网点总数 (家)', '户均服务负荷 (户/网点)'],
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
      axisLabel: { interval: 0, rotate: 15, fontSize: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '网点数 (家)',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      {
        type: 'value',
        name: '户/网点',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '网点总数 (家)',
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#0d9488', borderRadius: [3, 3, 0, 0] },
        data: agentCounts
      },
      {
        name: '户均服务负荷 (户/网点)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        data: avgHouseholds
      }
    ]
  };

  agentRegionChart.setOption(option);
}

/**
 * 4. 实际配给完成进度 (横向对比柱状图)
 */
function renderRationDistributionChart(distribution = {}) {
  const el = rationDistributionChartRef.value;
  if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
  if (!rationDistributionChart) {
    rationDistributionChart = echarts.init(el);
  }

  const commodities = distribution.commodities || [];
  const names = commodities.map(c => c.name);
  const planned = commodities.map(c => c.plannedTon);
  const actual = commodities.map(c => c.actualTon);

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['计划配给指标 (吨)', '实际终端核发 (吨)'],
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
      data: names,
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '吨 (Tons)',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: '计划配给指标 (吨)',
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#94a3b8', borderRadius: [3, 3, 0, 0] },
        data: planned
      },
      {
        name: '实际终端核发 (吨)',
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#10b981', borderRadius: [3, 3, 0, 0] },
        data: actual
      }
    ]
  };

  rationDistributionChart.setOption(option);
}

/**
 * 5. 投诉类型分类 (南丁格尔玫瑰图)
 */
function renderComplaintPieChart(complaints = {}) {
  const el = complaintPieChartRef.value;
  if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
  if (!complaintPieChart) {
    complaintPieChart = echarts.init(el);
  }

  const list = complaints.categoryDistribution || [];
  const data = list.map(item => ({
    name: item.name,
    value: item.count
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <strong>{c} 件</strong> ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { fontSize: 10 }
    },
    series: [
      {
        name: '诉求类型',
        type: 'pie',
        radius: ['22%', '68%'],
        center: ['50%', '42%'],
        roseType: 'area',
        itemStyle: { borderRadius: 6 },
        data: data.length ? data : [
          { value: 1098, name: '缺斤短两/克扣' },
          { value: 941, name: '服务态度/排队' },
          { value: 706, name: '物资品质异议' },
          { value: 627, name: '私自加价收费' },
          { value: 548, name: '份额核算有误' }
        ]
      }
    ]
  };

  complaintPieChart.setOption(option);
}

/**
 * 6. 投诉受理与办结趋势 (折线图)
 */
function renderComplaintTrendChart(complaints = {}) {
  const el = complaintTrendChartRef.value;
  if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
  if (!complaintTrendChart) {
    complaintTrendChart = echarts.init(el);
  }

  const trend = complaints.trend || { dates: [], received: [], resolved: [], avgHours: [] };

  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['接报受理量', '办结销单量', '平均处置耗时 (小时)'],
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
      data: trend.dates,
      axisLabel: { fontSize: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '工单件数',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      {
        type: 'value',
        name: '耗时 (小时)',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '接报受理量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#f43f5e' },
        itemStyle: { color: '#f43f5e' },
        data: trend.received
      },
      {
        name: '办结销单量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        data: trend.resolved
      },
      {
        name: '平均处置耗时 (小时)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { width: 2, color: '#f59e0b', type: 'dashed' },
        itemStyle: { color: '#f59e0b' },
        data: trend.avgHours
      }
    ]
  };

  complaintTrendChart.setOption(option);
}

function handleResize() {
  citizenTrendChart?.resize();
  familyBusinessChart?.resize();
  agentRegionChart?.resize();
  rationDistributionChart?.resize();
  complaintPieChart?.resize();
  complaintTrendChart?.resize();
}

/**
 * 远程加载数据并重绘
 */
async function loadData() {
  try {
    const res = await getAdminDashboardStats(props.timeRange);
    dashboardData.value = res || {};

    await nextTick();
    setTimeout(() => {
      renderCitizenTrendChart(dashboardData.value.citizens);
      renderFamilyBusinessChart(dashboardData.value.families);
      renderAgentRegionChart(dashboardData.value.agents);
      renderRationDistributionChart(dashboardData.value.distribution);
      renderComplaintPieChart(dashboardData.value.complaints);
      renderComplaintTrendChart(dashboardData.value.complaints);
      handleResize();
    }, 120);
  } catch (err) {
    console.error('加载管理角色数据看板失败:', err);
  }
}

watch(() => props.timeRange, () => {
  loadData();
});

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  citizenTrendChart?.dispose();
  familyBusinessChart?.dispose();
  agentRegionChart?.dispose();
  rationDistributionChart?.dispose();
  complaintPieChart?.dispose();
  complaintTrendChart?.dispose();
});

defineExpose({
  refresh: loadData
});
</script>

<style scoped>
</style>
