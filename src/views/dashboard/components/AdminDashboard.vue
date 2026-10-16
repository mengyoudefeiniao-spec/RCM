<template>
  <div class="admin-dashboard space-y-4">
    <!-- ======================================================== -->
    <!-- 顶部 5 大核心维度 KPI 指标概览卡片 -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
      <!-- 维度 1: 公民 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-lg border border-[#E1F4E4] shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-[#1F3326] text-xs">
          <span class="font-medium text-[#43554B] text-[11px] sm:text-xs">{{ $t('dashboard.enrolledCitizens') || '在册持卡公民' }}</span>
          <el-icon class="text-[#326445] text-sm sm:text-base"><User /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-[#1B3123]">
            {{ formatWan(dashboardData.citizens?.totalCitizens) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-[#8A9A8F]">{{ $t('dashboard.admin.unitPersons') }}</span>
        </div>
        <div class="w-full bg-[#E9F1EB] rounded-full h-1 overflow-hidden">
          <div class="bg-[#326445] h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.citizens?.biometricVerifiedRate || 95}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-[#58685D] flex items-center justify-between pt-0.5">
          <span>{{ $t('dashboard.admin.verifiedLabel') }} <strong class="text-[#2A5440] font-mono">{{ dashboardData.citizens?.biometricVerifiedRate }}%</strong></span>
          <span class="text-[#2F7A50] font-medium">+{{ formatNumber(dashboardData.citizens?.newRegistered) }}</span>
        </div>
      </div>

      <!-- 维度 2: 家庭 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-lg border border-[#E1F4E4] shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-[#1F3326] text-xs">
          <span class="font-medium text-[#43554B] text-[11px] sm:text-xs">{{ $t('dashboard.enrolledFamilies') || '建档保障家庭' }}</span>
          <el-icon class="text-[#326445] text-sm sm:text-base"><House /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-[#1B3123]">
            {{ formatWan(dashboardData.families?.totalFamilies) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-[#8A9A8F]">{{ $t('dashboard.admin.unitFamilies') }}</span>
        </div>
        <div class="w-full bg-[#E9F1EB] rounded-full h-1 overflow-hidden">
          <div class="bg-[#326445] h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.families?.activeRate || 96}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-[#58685D] flex items-center justify-between pt-0.5">
          <span>{{ $t('dashboard.admin.avgLabel') }} <strong class="text-[#2A5440] font-mono">{{ dashboardData.families?.avgFamilySize }}{{ $t('dashboard.admin.unitPersonShort') }}</strong></span>
          <span class="text-[#58685D]">{{ $t('dashboard.admin.activePrefix') }}{{ dashboardData.families?.activeRate }}%</span>
        </div>
      </div>

      <!-- 维度 3: 地区代理商 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-lg border border-[#E1F4E4] shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-[#12241A] text-xs">
          <span class="font-medium text-[#43554B] text-[11px] sm:text-xs">{{ $t('dashboard.contractedAgents') || '全国签约代理商' }}</span>
          <el-icon class="text-[#2F7A50] text-sm sm:text-base"><Shop /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-[#1B3123]">
            {{ formatNumber(dashboardData.agents?.totalAgents) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-[#8A9A8F]">{{ $t('dashboard.admin.unitAgents') }}</span>
        </div>
        <div class="w-full bg-[#E9F1EB] rounded-full h-1 overflow-hidden">
          <div class="bg-[#2F7A50] h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.agents?.complianceRate || 90}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-[#58685D] flex items-center justify-between pt-0.5">
          <span>{{ $t('dashboard.admin.complianceLabel') }} <strong class="text-[#2F5B44] font-mono">{{ dashboardData.agents?.complianceRate }}%</strong></span>
          <span class="text-[#C9A13B] font-medium">{{ dashboardData.agents?.overloadedAgents }} {{ $t('dashboard.admin.alertsSuffix') }}</span>
        </div>
      </div>

      <!-- 维度 4: 实际配给情况 -->
      <div class="p-3 sm:p-3.5 bg-white rounded-lg border border-[#E1F4E4] shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-[#12241A] text-xs">
          <span class="font-medium text-[#43554B] text-[11px] sm:text-xs">{{ $t('dashboard.actualDistribution') || '实际配发总量' }}</span>
          <el-icon class="text-[#2F7A50] text-sm sm:text-base"><Box /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-[#2F5B44]">
            {{ formatWan(dashboardData.distribution?.totalDistributedTons) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-[#8A9A8F]">{{ $t('dashboard.admin.unitTons') }}</span>
        </div>
        <div class="w-full bg-[#E9F1EB] rounded-full h-1 overflow-hidden">
          <div class="bg-[#2F7A50] h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.distribution?.targetFulfillmentRate || 98}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-[#58685D] flex items-center justify-between pt-0.5">
          <span>{{ $t('dashboard.admin.fulfillmentLabel') }} <strong class="text-[#2F5B44] font-mono">{{ dashboardData.distribution?.targetFulfillmentRate }}%</strong></span>
          <span class="text-[#58685D]">{{ $t('dashboard.admin.onTimePrefix') }}{{ dashboardData.distribution?.onTimeDeliveryRate }}%</span>
        </div>
      </div>

      <!-- 维度 5: 投诉和处理 (在 412px 屏幕下独占一行通栏展示，对称饱满) -->
      <div class="col-span-2 sm:col-span-1 p-3 sm:p-3.5 bg-white rounded-lg border border-[#F7E3E2] shadow-2xs hover:shadow-sm transition-shadow space-y-1 sm:space-y-1.5">
        <div class="flex items-center justify-between text-[#6E2F2E] text-xs">
          <span class="font-medium text-[#43554B] text-[11px] sm:text-xs">{{ $t('dashboard.complaintEfficiency') || '群众投诉与办结' }}</span>
          <el-icon class="text-[#C04442] text-sm sm:text-base"><Service /></el-icon>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-lg sm:text-xl font-bold font-mono text-[#1B3123]">
            {{ formatNumber(dashboardData.complaints?.totalComplaints) }}
          </span>
          <span class="text-[10px] sm:text-[11px] text-[#8A9A8F]">{{ $t('dashboard.admin.unitCases') }}</span>
        </div>
        <div class="w-full bg-[#E9F1EB] rounded-full h-1 overflow-hidden">
          <div class="bg-[#C04442] h-1 rounded-full transition-all duration-500" :style="{ width: `${dashboardData.complaints?.resolvedRate || 95}%` }"></div>
        </div>
        <div class="text-[10px] sm:text-[11px] text-[#58685D] flex items-center justify-between pt-0.5">
          <span>{{ $t('dashboard.admin.resolvedLabel') }} <strong class="text-[#C04442] font-mono">{{ dashboardData.complaints?.resolvedRate }}%</strong></span>
          <span class="text-[#58685D]">{{ $t('dashboard.admin.avgTimePrefix') }}{{ dashboardData.complaints?.avgResolutionHours }}h</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 1: 公民与家庭数据统计分析 (2张图表并排) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 图表 1: 公民年龄构成与新增核验走势 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-[#1F3326] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#326445]"></span>
              <span>{{ $t('dashboard.admin.titleCitizenChart') }}</span>
            </h3>
            <p class="text-[11px] text-[#8A9A8F] mt-0.5">
              {{ $t('dashboard.admin.subCitizenChart') }}
            </p>
          </div>
          <el-tag size="small" type="primary" effect="plain" class="font-mono">{{ $t('dashboard.admin.tagCitizen') }}</el-tag>
        </div>
        <div ref="citizenTrendChartRef" class="w-full h-72"></div>
      </div>

      <!-- 图表 2: 家庭规模分布与民生业务办理统计 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-[#1F3326] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#326445]"></span>
              <span>{{ $t('dashboard.admin.titleFamilyChart') }}</span>
            </h3>
            <p class="text-[11px] text-[#8A9A8F] mt-0.5">
              {{ $t('dashboard.admin.subFamilyChart') }}
            </p>
          </div>
          <el-tag size="small" type="primary" effect="plain" class="font-mono">{{ $t('dashboard.admin.tagFamily') }}</el-tag>
        </div>
        <div ref="familyBusinessChartRef" class="w-full h-72"></div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 2: 各地区代理商与实际配给情况统计分析 (2张图表并排) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 图表 3: 各省区代理商网点分布与负荷度比对 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-[#1F3326] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#2F7A50]"></span>
              <span>{{ $t('dashboard.admin.titleAgentChart') }}</span>
            </h3>
            <p class="text-[11px] text-[#8A9A8F] mt-0.5">
              {{ $t('dashboard.admin.subAgentChart') }}
            </p>
          </div>
          <el-tag size="small" type="success" effect="plain" class="font-mono">{{ $t('dashboard.admin.tagAgentNetwork') }}</el-tag>
        </div>
        <div ref="agentRegionChartRef" class="w-full h-72"></div>
      </div>

      <!-- 图表 4: 实际配给情况与战略物资达成进度 -->
      <div class="lg:col-span-6 bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-[#1F3326] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#2F7A50]"></span>
              <span>{{ $t('dashboard.admin.titleRationChart') }}</span>
            </h3>
            <p class="text-[11px] text-[#8A9A8F] mt-0.5">
              {{ $t('dashboard.admin.subRationChart') }}
            </p>
          </div>
          <el-tag size="small" type="success" effect="plain" class="font-mono">{{ $t('dashboard.admin.tagRationFulfillment') }}</el-tag>
        </div>
        <div ref="rationDistributionChartRef" class="w-full h-72"></div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 3: 投诉和处理数据统计分析与重点督办清单 -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 图表 5: 投诉诉求类型分布 (南丁格尔玫瑰图) -->
      <div class="lg:col-span-4 bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-[#1F3326] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#C04442]"></span>
              <span>{{ $t('dashboard.admin.titleComplaintType') }}</span>
            </h3>
            <p class="text-[11px] text-[#8A9A8F] mt-0.5">
              {{ $t('dashboard.admin.subComplaintType') }}
            </p>
          </div>
          <el-tag size="small" type="danger" effect="plain" class="font-mono">{{ $t('dashboard.admin.tagTypeComposition') }}</el-tag>
        </div>
        <div ref="complaintPieChartRef" class="w-full h-72"></div>
      </div>

      <!-- 图表 6: 投诉受理与办结趋势 (折线走势图) -->
      <div class="lg:col-span-8 bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div>
            <h3 class="text-xs font-bold text-[#1F3326] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#C9A13B]"></span>
              <span>{{ $t('dashboard.admin.titleComplaintTrend') }}</span>
            </h3>
            <p class="text-[11px] text-[#8A9A8F] mt-0.5">
              {{ $t('dashboard.admin.subComplaintTrend') }}
            </p>
          </div>
          <el-tag size="small" type="warning" effect="plain" class="font-mono">{{ $t('dashboard.admin.tagResolutionTrend') }}</el-tag>
        </div>
        <div ref="complaintTrendChartRef" class="w-full h-72"></div>
      </div>
    </div>

    <!-- 模块 4: 重点督办投诉案件简明清单 -->
    <div class="bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
      <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#43554B]"></span>
          <h3 class="text-xs font-bold text-[#1F3326]">{{ $t('dashboard.admin.titleRecentComplaints') }}</h3>
          <el-tag size="small" type="info" class="font-mono">{{ $t('dashboard.admin.tagFocusCount', { count: (dashboardData.complaints?.recentComplaints || []).length }) }}</el-tag>
        </div>
        <span class="text-[11px] text-[#8A9A8F]">{{ $t('dashboard.admin.subFullyImplemented') }}</span>
      </div>

      <el-table :data="dashboardData.complaints?.recentComplaints || []" size="small" stripe border class="text-xs">
        <el-table-column prop="id" :label="$t('dashboard.admin.colTicketId')" width="130">
          <template #default="{ row }">
            <span class="font-mono font-bold text-[#326445]">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" :label="$t('dashboard.admin.colComplaintType')" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="province" :label="$t('dashboard.admin.colRegion')" min-width="140" />
        <el-table-column prop="agent" :label="$t('dashboard.admin.colAgentInvolved')" min-width="150" />
        <el-table-column prop="applicant" :label="$t('dashboard.admin.colComplainant')" width="120" />
        <el-table-column prop="result" :label="$t('dashboard.admin.colResult')" min-width="220">
          <template #default="{ row }">
            <span class="text-[#43554B]">{{ row.result }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('dashboard.admin.colStatus')" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="isResolvedStatus(row.status) ? 'success' : 'warning'" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" :label="$t('dashboard.admin.colRegDate')" width="100" align="center" class-name="font-mono text-[#8A9A8F]" />
      </el-table>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 5: 公民配给订单需求统计与 AI 扩容预测看板 (需求 1 联动数据看板) -->
    <!-- ======================================================== -->
    <div class="bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9F1EB] pb-3">
        <div>
          <h3 class="text-xs sm:text-sm font-bold text-[#1F3326] flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#326445]"></span>
            <span>{{ $t('dashboard.orderDemandInsightTitle') }}</span>
            <el-tag size="small" type="primary" effect="plain" class="font-mono">{{ $t('dashboard.demandPenetrationTag') }}</el-tag>
          </h3>
          <p class="text-[11px] text-[#8A9A8F] mt-0.5">
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
        <div class="p-3 bg-[#EFF5F1]/60 rounded-lg border border-[#E1F4E4] space-y-1">
          <div class="flex justify-between text-[#1F3326] text-[11px]">
            <span>{{ $t('dashboard.flourDemand') }}</span>
            <span class="font-bold">🌾</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-[#2A5440]">286,500 KG</div>
          <div class="text-[10px] text-[#8A9A8F]">{{ $t('dashboard.flourDemandMoM') }}</div>
        </div>
        <div class="p-3 bg-[#EFF5F1]/60 rounded-lg border border-[#E1F4E4] space-y-1">
          <div class="flex justify-between text-[#12241A] text-[11px]">
            <span>{{ $t('dashboard.riceDemand') }}</span>
            <span class="font-bold">🍚</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-[#2F5B44]">118,200 KG</div>
          <div class="text-[10px] text-[#8A9A8F]">{{ $t('dashboard.riceDemandMoM') }}</div>
        </div>
        <div class="p-3 bg-[#FDF3E0]/60 rounded-lg border border-[#FDF3E0] space-y-1">
          <div class="flex justify-between text-[#5A4718] text-[11px]">
            <span>{{ $t('dashboard.oilDemand') }}</span>
            <span class="font-bold">🌻</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-[#7A5F21]">42,300 L</div>
          <div class="text-[10px] text-[#8A9A8F]">{{ $t('dashboard.oilDemandMoM') }}</div>
        </div>
        <div class="p-3 bg-[#EFF5F1]/60 rounded-lg border border-[#E1F4E4] space-y-1">
          <div class="flex justify-between text-[#1F3326] text-[11px]">
            <span>{{ $t('dashboard.sugarDemand') }}</span>
            <span class="font-bold">🍬</span>
          </div>
          <div class="text-base sm:text-lg font-bold font-mono text-[#2A5440]">49,800 KG</div>
          <div class="text-[10px] text-[#8A9A8F]">{{ $t('dashboard.sugarDemandMoM') }}</div>
        </div>
      </div>

      <!-- AI 扩容需求决策建议 -->
      <div class="p-3.5 rounded-lg bg-gradient-to-r from-[#EFF5F1]/80 via-[#EFF5F1]/60 to-[#F3F8F4] border border-[#E1F4E4] text-xs space-y-2">
        <div class="flex items-center gap-2 font-bold text-[#12241A]">
          <span class="text-base">🤖</span>
          <span>{{ $t('dashboard.aiExpansionConclusionTitle') }}</span>
        </div>
        <p class="text-[#58685D] leading-relaxed text-[11px]">
          {{ $t('dashboard.aiExpansionConclusionText') }}
        </p>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模块 6: 代理商订单统计分析全景看板 (需求 5 联动数据看板) -->
    <!-- ======================================================== -->
    <div class="bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9F1EB] pb-3">
        <div>
          <h3 class="text-xs sm:text-sm font-bold text-[#1F3326] flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#2F7A50]"></span>
            <span>{{ $t('dashboard.agentOrdersOverviewTitle') }}</span>
            <el-tag size="small" type="success" effect="plain" class="font-mono">{{ $t('dashboard.wholesaleAnalyticsTag') }}</el-tag>
          </h3>
          <p class="text-[11px] text-[#8A9A8F] mt-0.5">
            {{ $t('dashboard.agentOrdersOverviewSub') }}
          </p>
        </div>
        <el-button size="small" type="success" plain @click="$router.push('/agent?tab=orderAnalytics')">
          {{ $t('dashboard.enterAgentAnalyticsBtn') }}
        </el-button>
      </div>

      <AgentInventoryLedger />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import AgentInventoryLedger from '../../agent/components/AgentInventoryLedger.vue';
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
  // 万位缩写按当前语言渲染（zh: 万 / en: k / ar·ku: ×10K 近似）
  return t('dashboard.admin.formatWan', { num: isEn.value ? (Number(num) / 1000).toFixed(1) : (Number(num) / 10000).toFixed(1) });
}

function getTypeTag(type) {
  // 语言无关关键词匹配（中文/英文 mock 数据源均可达）
  if (/收费|加价|Overcharge/i.test(type)) return 'danger';
  if (/品质|Quality/i.test(type)) return 'warning';
  if (/少发|缺斤|Short/i.test(type)) return 'danger';
  return 'info';
}

function isResolvedStatus(status) {
  // 语言无关的办结状态判断（zh/en mock 数据源状态值均可达）
  return ['已办结', 'Resolved', 'Closed'].includes(status);
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
      data: [t('dashboard.admin.legendNewCitizens'), t('dashboard.admin.legendBioVerified')],
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
        name: t('dashboard.admin.yAxisNewPersons'),
        splitLine: { lineStyle: { type: 'dashed', color: '#EFF5F1' } }
      },
      {
        type: 'value',
        name: t('dashboard.admin.yAxisBioVerified'),
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: t('dashboard.admin.legendNewCitizens'),
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#5C8A6B', borderRadius: [3, 3, 0, 0] },
        data: trend.newRegistered
      },
      {
        name: t('dashboard.admin.legendBioVerified'),
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#3E9B68' },
        itemStyle: { color: '#3E9B68' },
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
      data: [t('dashboard.admin.legendIntake'), t('dashboard.admin.legendCompleted')],
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
      name: t('dashboard.admin.legendCaseCount'),
      splitLine: { lineStyle: { type: 'dashed', color: '#EFF5F1' } }
    },
    series: [
      {
        name: t('dashboard.admin.legendIntake'),
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#DFC08B', borderRadius: [3, 3, 0, 0] },
        data: applies
      },
      {
        name: t('dashboard.admin.legendCompleted'),
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#B8934A', borderRadius: [3, 3, 0, 0] },
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
      data: [t('dashboard.admin.radarOutletTotal'), t('dashboard.admin.radarLoadPerOutlet')],
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
        name: t('dashboard.admin.yAxisOutlets'),
        splitLine: { lineStyle: { type: 'dashed', color: '#EFF5F1' } }
      },
      {
        type: 'value',
        name: t('dashboard.admin.yAxisLoad'),
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: t('dashboard.admin.radarOutletTotal'),
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#34856B', borderRadius: [3, 3, 0, 0] },
        data: agentCounts
      },
      {
        name: t('dashboard.admin.radarLoadPerOutlet'),
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#D9B567' },
        itemStyle: { color: '#D9B567' },
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
      data: [t('dashboard.admin.legendPlannedTon'), t('dashboard.admin.legendActualTon')],
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
      name: t('dashboard.admin.yAxisTonUnit'),
      splitLine: { lineStyle: { type: 'dashed', color: '#EFF5F1' } }
    },
    series: [
      {
        name: t('dashboard.admin.legendPlannedTon'),
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#8A9A8F', borderRadius: [3, 3, 0, 0] },
        data: planned
      },
      {
        name: t('dashboard.admin.legendActualTon'),
        type: 'bar',
        barMaxWidth: 16,
        itemStyle: { color: '#3E9B68', borderRadius: [3, 3, 0, 0] },
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
    // 参考站图表色板：鼠尾草绿 / 麦芽金 / 薄荷绿 / 砖红 / 灰绿
    color: ['#326445', '#DABD81', '#4A9266', '#C04442', '#58685D'],
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: <strong>${p.value} ${t('dashboard.admin.unitCases')}</strong> (${p.percent}%)`
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { fontSize: 10 }
    },
    series: [
      {
        name: t('dashboard.admin.colComplaintType'),
        type: 'pie',
        radius: ['22%', '68%'],
        center: ['50%', '42%'],
        roseType: 'area',
        itemStyle: { borderRadius: 6 },
        // 演示回退数据：类型名按当前语言渲染
        data: data.length ? data : [
          { value: 1098, name: t('dashboard.admin.typeShortfall') },
          { value: 941, name: t('dashboard.admin.typeService') },
          { value: 706, name: t('dashboard.admin.typeQuality') },
          { value: 627, name: t('dashboard.admin.typeOvercharge') },
          { value: 548, name: t('dashboard.admin.typeQuotaError') }
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
      data: [t('dashboard.admin.legendIntake2'), t('dashboard.admin.legendClosed'), t('dashboard.admin.legendAvgHours')],
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
        name: t('dashboard.admin.legendCaseCount'),
        splitLine: { lineStyle: { type: 'dashed', color: '#EFF5F1' } }
      },
      {
        type: 'value',
        name: t('dashboard.admin.yAxisHours'),
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: t('dashboard.admin.legendIntake2'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#C04442' },
        itemStyle: { color: '#C04442' },
        data: trend.received
      },
      {
        name: t('dashboard.admin.legendClosed'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#3E9B68' },
        itemStyle: { color: '#3E9B68' },
        data: trend.resolved
      },
      {
        name: t('dashboard.admin.legendAvgHours'),
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { width: 2, color: '#D9B567', type: 'dashed' },
        itemStyle: { color: '#D9B567' },
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

// 语言切换时重绘全部图表（图例/轴名/回退演示数据随语言刷新）
watch(locale, () => {
  nextTick(() => {
    renderCitizenTrendChart(dashboardData.value.citizens);
    renderFamilyBusinessChart(dashboardData.value.families);
    renderAgentRegionChart(dashboardData.value.agents);
    renderRationDistributionChart(dashboardData.value.distribution);
    renderComplaintPieChart(dashboardData.value.complaints);
    renderComplaintTrendChart(dashboardData.value.complaints);
  });
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
