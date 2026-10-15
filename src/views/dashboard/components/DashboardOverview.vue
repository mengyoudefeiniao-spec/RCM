<template>
  <div class="dashboard-overview-container font-sans text-slate-800 space-y-6" ref="overviewRootRef">
    <!-- ======================================================== -->
    <!-- 1. 顶部 Header Banner：典雅阿拉伯拱门建筑遮罩 + 深墨绿大标题 -->
    <!-- ======================================================== -->
    <div
      ref="headerBannerRef"
      class="header-banner relative overflow-hidden rounded-2xl border border-[#ECE7DE] shadow-xs flex items-center justify-end min-h-[160px] sm:min-h-[190px] md:min-h-[210px]"
      style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.05);"
    >
      <!-- 背景图图层：使用用户截图无痕去字后的高品质真实建筑全景底图 -->
      <img
        src="/images/dashboard-banner.png"
        alt="National Ration Card System Background"
        class="absolute inset-0 w-full h-full object-cover object-left md:object-center select-none pointer-events-none"
        loading="eager"
      />

      <!-- 柔和微弱渐变保护层：确保在不同屏幕分辨率下文字图层均拥有顶级可读性 -->
      <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#FBF9F5]/20 to-[#FAF8F5]/80 pointer-events-none"></div>

      <!-- 文字内容图层：加在图片图层上方 (relative z-10)，支持独立排版与交互 -->
      <div class="relative z-10 w-full md:w-3/5 lg:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col justify-center items-start md:items-end text-left md:text-right">
        <!-- 顶部金色服务标识 (含 ht.iq 官方矢量 Logo) -->
        <div class="text-[#B58542] text-xs sm:text-sm font-semibold tracking-wide mb-1 flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-white/95 p-0.5 border border-[#C3E6D2] shadow-2xs flex items-center justify-center shrink-0">
            <img src="/logo.svg" alt="ht.iq Logo" class="w-full h-full object-contain" />
          </div>
          <span>{{ $t('dashboardOverview.serviceTag') }}</span>
        </div>

        <!-- 核心大标题 -->
        <h1 class="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#007A3D] tracking-tight leading-tight">
          {{ $t('dashboardOverview.mainTitle') }}
        </h1>

        <!-- 战略大盘副标题 -->
        <div class="text-xs sm:text-sm font-bold text-[#1FA35E] mt-1 font-sans">
          {{ $t('dashboardOverview.subTitle') }}
        </div>

        <!-- 底部说明文案 -->
        <p class="text-xs text-[#5E7368] mt-2 max-w-md font-medium leading-relaxed">
          {{ $t('dashboardOverview.bannerDescription') }}
        </p>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 次级业务总览控制栏：日期/时间指示 + 实时刷新操作 -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-[#18231E] flex items-center gap-2">
          <span>{{ $t('dashboardOverview.operationsOverview') }}</span>
        </h2>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- 伊斯兰与公历日期指示胶囊 -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ECE7DE] text-xs text-[#5E6862] shadow-2xs font-mono">
          <el-icon class="text-[#C59D5F]"><Calendar /></el-icon>
          <span>{{ $t('dashboardOverview.hijriCalendarDate') }}</span>
        </div>

        <!-- 刷新数据按钮 (采用 ht.iq 官方绿色圆角药丸按钮) -->
        <el-button
          type="primary"
          size="default"
          class="ht-btn-primary !px-4 text-xs font-bold"
          :loading="isRefreshing"
          @click="handleManualRefresh"
        >
          <el-icon class="mr-1"><Refresh /></el-icon>
          <span>{{ $t('dashboardOverview.refreshData') }}</span>
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. 指标监控卡片矩阵 (Metric Cards 3x2 网格，完全对标参考图) -->
    <!-- ======================================================== -->
    <div
      ref="cardsContainerRef"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
    >
      <!-- ======================================================== -->
      <!-- 卡片 1: 申请与审核事项 -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <!-- 卡片头部：小标题与浅砂金底线性图标 -->
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span class="font-serif font-bold">الطلبات</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ {{ $t('dashboardOverview.cardOrdersTitle') }}</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Document /></el-icon>
          </div>
        </div>

        <!-- 键值对数据行清单 (平滑数字滚动 + 右侧标签) -->
        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: 申请总量 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.totalOrders') }}</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countTotalOrders.displayValue }}
            </span>
          </div>

          <!-- 行 2: 在审待办 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.underReview') }}</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countUnderReview.displayValue }}
            </span>
          </div>

          <!-- 行 3: 待补公文 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.waitingDocs') }}</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countWaitingDocs.displayValue }}
            </span>
          </div>

          <!-- 行 4: 平均办结用时 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.avgProcessingDays') }}</span>
            <span class="font-mono font-semibold text-sm text-[#18231E]">
              {{ countAvgProcessingDays.displayValue }}
              <span class="text-xs font-normal text-[#5E6862] ml-0.5">{{ $t('dashboardOverview.daysUnit') }}</span>
            </span>
          </div>

          <!-- 行 5: 超时滞后 > 7 天 -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.overdueOrders') }}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countOverdueOrders.displayValue }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#D34545] animate-pulse"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 2: 受益公民与家庭 -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span class="font-serif font-bold">المواطنون والأسر</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ {{ $t('dashboardOverview.cardCitizensTitle') }}</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><House /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: 在保公民总数 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.enrolledCitizens') }}</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countEnrolledCitizens.displayValue }}
            </span>
          </div>

          <!-- 行 2: 纳保登记家庭 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.enrolledFamilies') }}</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countEnrolledFamilies.displayValue }}
            </span>
          </div>

          <!-- 行 3: 已配给受惠家庭 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.benefitedFamilies') }}</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countBenefitedFamilies.displayValue }}
            </span>
          </div>

          <!-- 行 4: 当月变动申报 -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.monthlyChanges') }}</span>
            <span class="font-mono font-bold text-sm text-[#2C6E49] bg-[#EDF6F1] px-2 py-0.5 rounded-md">
              +{{ countMonthlyChanges.displayValue }}
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 3: 身份与生物核验 -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span class="font-serif font-bold">التحقق من الهوية</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ {{ $t('dashboardOverview.cardVerificationTitle') }}</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Avatar /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: 核验总批次 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.totalVerifications') }}</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countTotalVerifications.displayValue }}
            </span>
          </div>

          <!-- 行 2: 活体核验通过率 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.successRate') }}</span>
            <span class="font-mono font-bold text-sm text-[#1E3F35]">
              {{ countSuccessRate.displayValue }}
            </span>
          </div>

          <!-- 行 3: 主要重核原因 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.topFailureReason') }}</span>
            <span class="text-xs font-semibold text-[#8C958F] bg-[#FAF7F2] px-2 py-0.5 rounded">
              {{ $t('dashboardOverview.weakLightReason') }}
            </span>
          </div>

          <!-- 行 4: 待人工兜底复核 -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.manualReview') }}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E6] border border-[#E8D9BF] text-[#966C2E] font-mono font-bold text-xs">
              <span>{{ countManualReviews.displayValue }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#C59D5F]"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 4: 战略物资配给履约 -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span class="font-serif font-bold">توزيع الغذاء</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ {{ $t('dashboardOverview.cardDistributionTitle') }}</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Box /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: 当期应保家庭 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.eligibleFamilies') }}</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countEligibleFamilies.displayValue }}
            </span>
          </div>

          <!-- 行 2: 已签收领讫家庭 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.receivedFamilies') }}</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countReceivedFamilies.displayValue }}
            </span>
          </div>

          <!-- 行 3: 物资兑付履约率 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.completionRate') }}</span>
            <span class="font-mono font-bold text-sm text-[#1E3F35]">
              {{ countCompletionRate.displayValue }}
            </span>
          </div>

          <!-- 行 4: 尚未提货家庭 -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.pendingClaims') }}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E6] border border-[#E8D9BF] text-[#966C2E] font-mono font-bold text-xs">
              <span>{{ countPendingClaims.displayValue }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#C59D5F]"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 5: 签约网点保供运行 -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span class="font-serif font-bold">عمليات الوكلاء</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ {{ $t('dashboardOverview.cardAgentsTitle') }}</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Shop /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: 在任活跃网点 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.activeAgents') }}</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countActiveAgents.displayValue }}
            </span>
          </div>

          <!-- 行 2: 今日物资发货单 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.todayDispatches') }}</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countTodayDispatches.displayValue }}
            </span>
          </div>

          <!-- 行 3: 行政网格覆盖 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.coverageAreas') }}</span>
            <span class="font-mono font-semibold text-sm text-[#18231E]">
              18/18 {{ $t('dashboardOverview.provincesUnit') }}
            </span>
          </div>

          <!-- 行 4: 异常履约稽查 -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.exceptionCases') }}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countExceptionCases.displayValue }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#D34545] animate-pulse"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 6: 中枢底账联网同步 -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span class="font-serif font-bold">النظام والربط</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ {{ $t('dashboardOverview.cardSystemTitle') }}</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Connection /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: 接口调用成功率 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.apiSuccessRate') }}</span>
            <span class="font-mono font-bold text-base text-[#1E3F35]">
              {{ countApiSuccessRate.displayValue }}
            </span>
          </div>

          <!-- 行 2: 实时底账同频状态 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.syncStatus') }}</span>
            <span class="font-semibold text-xs text-[#2C6E49] bg-[#EDF6F1] px-2 py-0.5 rounded">
              {{ $t('dashboardOverview.syncStatusValue') }}
            </span>
          </div>

          <!-- 行 3: 阻断重试队列 -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.failedTasks') }}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countFailedTasks.displayValue }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#D34545]"></span>
            </span>
          </div>

          <!-- 行 4: 待对账差额单据 -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">{{ $t('dashboardOverview.pendingDiscrepancies') }}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countPendingDiscrepancies.displayValue }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#D34545]"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElLoading, ElMessage, ElNotification } from 'element-plus';
import {
  Document,
  House,
  Avatar,
  Box,
  Shop,
  Connection,
  Calendar,
  Refresh,
  Check
} from '@element-plus/icons-vue';
import gsap from 'gsap';
import { useNumberCounter } from '../../../composables/useNumberCounter.js';
import { onTabMessage } from '../../../utils/crossTabBus.js';

const { t } = useI18n();

// DOM 元素引用
const overviewRootRef = ref(null);
const headerBannerRef = ref(null);
const cardsContainerRef = ref(null);

const isRefreshing = ref(false);

// ====================================================================
// 使用 useNumberCounter 初始化参考图中的 6 大核心卡片动态滚动数值
// ====================================================================

// 卡片 1: 申请与审核事项
const countTotalOrders = useNumberCounter(48210, { duration: 1.6, delay: 0.1 });
const countUnderReview = useNumberCounter(3920, { duration: 1.4, delay: 0.15 });
const countWaitingDocs = useNumberCounter(1145, { duration: 1.5, delay: 0.2 });
const countAvgProcessingDays = useNumberCounter(2.4, { duration: 1.2, delay: 0.25, decimals: 1 });
const countOverdueOrders = useNumberCounter(312, { duration: 1.3, delay: 0.3 });

// 卡片 2: 受益公民与家庭
const countEnrolledCitizens = useNumberCounter(5902114, { duration: 1.8, delay: 0.15 });
const countEnrolledFamilies = useNumberCounter(1284302, { duration: 1.6, delay: 0.2 });
const countBenefitedFamilies = useNumberCounter(1196480, { duration: 1.7, delay: 0.25 });
const countMonthlyChanges = useNumberCounter(8731, { duration: 1.4, delay: 0.3 });

// 卡片 3: 身份与生物核验
const countTotalVerifications = useNumberCounter(412880, { duration: 1.6, delay: 0.2 });
const countSuccessRate = useNumberCounter(96.8, { duration: 1.5, delay: 0.25, decimals: 1, suffix: '%' });
const countManualReviews = useNumberCounter(1904, { duration: 1.4, delay: 0.3 });

// 卡片 4: 战略物资配给履约
const countEligibleFamilies = useNumberCounter(1196480, { duration: 1.7, delay: 0.25 });
const countReceivedFamilies = useNumberCounter(938040, { duration: 1.6, delay: 0.3 });
const countCompletionRate = useNumberCounter(78.4, { duration: 1.5, delay: 0.35, decimals: 1, suffix: '%' });
const countPendingClaims = useNumberCounter(258440, { duration: 1.6, delay: 0.4 });

// 卡片 5: 签约网点保供运行
const countActiveAgents = useNumberCounter(4817, { duration: 1.5, delay: 0.3 });
const countTodayDispatches = useNumberCounter(62310, { duration: 1.6, delay: 0.35 });
const countExceptionCases = useNumberCounter(47, { duration: 1.2, delay: 0.4 });

// 卡片 6: 中枢底账联网同步
const countApiSuccessRate = useNumberCounter(99.2, { duration: 1.4, delay: 0.35, decimals: 1, suffix: '%' });
const countFailedTasks = useNumberCounter(1, { duration: 1.0, delay: 0.4 });
const countPendingDiscrepancies = useNumberCounter(2, { duration: 1.0, delay: 0.45 });

// ====================================================================
// 跨标签页业务事件监听与实时指标联动
// ====================================================================
let unsubTicket = null;
let unsubOrder = null;

onMounted(async () => {
  await nextTick();

  // 1. 跨标签页业务事件监听：公民提交业务申请工单
  unsubTicket = onTabMessage('TICKET_SUBMITTED', (ticket) => {
    // 动态增加大盘申请与待审指标
    const curTotal = typeof countTotalOrders.currentValue === 'number' ? countTotalOrders.currentValue : (countTotalOrders.currentValue?.value || 48210);
    const curReview = typeof countUnderReview.currentValue === 'number' ? countUnderReview.currentValue : (countUnderReview.currentValue?.value || 3920);
    countTotalOrders.animateTo(curTotal + 1);
    countUnderReview.animateTo(curReview + 1);

    // 优雅通知提醒
    ElNotification({
      title: t('dashboardOverview.crossTabTicketTitle'),
      message: t('dashboardOverview.crossTabTicketMsg', { source: ticket.source || 'RCM', id: ticket.id }),
      type: 'info',
      duration: 4000,
      position: 'bottom-right'
    });
  });

  // 2. 跨标签页业务事件监听：公民完成配给选购支付
  unsubOrder = onTabMessage('ORDER_PURCHASED', (order) => {
    // 动态增加今日派发与领取家庭指标
    const curDispatch = typeof countTodayDispatches.currentValue === 'number' ? countTodayDispatches.currentValue : (countTodayDispatches.currentValue?.value || 62310);
    const curReceived = typeof countReceivedFamilies.currentValue === 'number' ? countReceivedFamilies.currentValue : (countReceivedFamilies.currentValue?.value || 938040);
    countTodayDispatches.animateTo(curDispatch + 1);
    countReceivedFamilies.animateTo(curReceived + 1);

    ElNotification({
      title: t('dashboardOverview.crossTabOrderTitle'),
      message: t('dashboardOverview.crossTabOrderMsg', { cardNo: order.cardNo || 'Card', amount: order.amount }),
      type: 'success',
      duration: 4000,
      position: 'bottom-right'
    });
  });
});

onBeforeUnmount(() => {
  if (unsubTicket) {
    unsubTicket();
    unsubTicket = null;
  }
  if (unsubOrder) {
    unsubOrder();
    unsubOrder = null;
  }
});

// 卡片 Hover 微交互：极轻微 y: -3px 悬浮与大扩散柔和阴影过渡
function onCardMouseEnter(event) {
  const card = event.currentTarget;
  gsap.to(card, {
    y: -3,
    boxShadow: '0 12px 28px -4px rgba(30, 63, 53, 0.08), 0 4px 10px -2px rgba(30, 63, 53, 0.04)',
    borderColor: '#D4AA6A',
    duration: 0.25,
    ease: 'power1.out'
  });
}

function onCardMouseLeave(event) {
  const card = event.currentTarget;
  gsap.to(card, {
    y: 0,
    boxShadow: '0 4px 20px -2px rgba(60, 48, 25, 0.04)',
    borderColor: '#ECE7DE',
    duration: 0.25,
    ease: 'power1.out'
  });
}

// ====================================================================
// 模拟异步数据刷新事件 (演示 ElLoading 遮罩与刷新后的数值平滑滚动)
// ====================================================================
async function handleManualRefresh() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;

  const loadingInstance = ElLoading.service({
    target: overviewRootRef.value || document.body,
    text: t('dashboardOverview.refreshLoadingText'),
    background: 'rgba(248, 247, 243, 0.85)',
    customClass: 'rcm-government-loading'
  });

  try {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 随机微幅波动刷新演示，重启计数动画
    countTotalOrders.animateTo(48210 + Math.floor(Math.random() * 20));
    countUnderReview.animateTo(3920 + Math.floor(Math.random() * 15));
    countWaitingDocs.animateTo(1145 + Math.floor(Math.random() * 8));
    countOverdueOrders.animateTo(310 + Math.floor(Math.random() * 6));

    countEnrolledCitizens.animateTo(5902114 + Math.floor(Math.random() * 80));
    countEnrolledFamilies.animateTo(1284302 + Math.floor(Math.random() * 30));
    countBenefitedFamilies.animateTo(1196480 + Math.floor(Math.random() * 40));

    countTotalVerifications.animateTo(412880 + Math.floor(Math.random() * 50));
    countTodayDispatches.animateTo(62310 + Math.floor(Math.random() * 45));

    ElMessage.closeAll();
    ElMessage({
      message: t('dashboardOverview.refreshSuccess'),
      type: 'success',
      duration: 1800,
      showClose: true
    });
  } catch (err) {
    ElMessage.error(t('dashboardOverview.refreshError'));
  } finally {
    loadingInstance.close();
    isRefreshing.value = false;
  }
}
</script>

<style scoped>
.dashboard-overview-container {
  /* 确保画布整体温暖大气 */
  background-color: var(--el-bg-color-page, #F8F7F3);
}

@keyframes rcmCardEntrance {
  0% {
    opacity: 0;
    transform: translateY(14px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-banner {
  opacity: 1;
  animation: rcmCardEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.rcm-metric-card {
  opacity: 1 !important;
  animation: rcmCardEntrance 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.rcm-metric-card:hover {
  border-color: #1fa35e !important;
  box-shadow: 0 10px 28px -4px rgba(0, 122, 61, 0.08) !important;
  transform: translateY(-2px);
}

/* 优雅加载遮罩风格微调 */
:deep(.rcm-government-loading .el-loading-spinner .el-loading-text) {
  color: #007A3D !important;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
}

:deep(.rcm-government-loading .el-loading-spinner .path) {
  stroke: #1FA35E !important;
  stroke-width: 3;
}
</style>
