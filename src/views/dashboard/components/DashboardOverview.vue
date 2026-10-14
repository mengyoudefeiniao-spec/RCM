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
        alt="National Food Support Platform Background"
        class="absolute inset-0 w-full h-full object-cover object-left md:object-center select-none pointer-events-none"
        loading="eager"
      />

      <!-- 柔和微弱渐变保护层：确保在不同屏幕分辨率下文字图层均拥有顶级可读性 -->
      <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#FBF9F5]/20 to-[#FAF8F5]/80 pointer-events-none"></div>

      <!-- 文字内容图层：加在图片图层上方 (relative z-10)，支持独立排版与交互 -->
      <div class="relative z-10 w-full md:w-3/5 lg:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col justify-center items-start md:items-end text-left md:text-right">
        <!-- 顶部金色服务标识 -->
        <div class="text-[#B58542] text-xs sm:text-sm font-semibold tracking-wide mb-1 flex items-center gap-1.5">
          <span>خدمات الدعم الغذائي</span>
          <span class="text-[10px] text-[#CBB28A]">· 国家食品支持服务</span>
        </div>

        <!-- 核心大标题：阿拉伯语国家食品支持平台 -->
        <h1 class="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#1E3F35] tracking-tight leading-tight">
          منصة الدعم الغذائي الوطنية
        </h1>

        <!-- 战略大盘双语副标题 -->
        <div class="text-xs sm:text-sm font-bold text-[#3D6357] mt-1 font-sans">
          配给综合战略监控大盘 (RCM Operations Dashboard)
        </div>

        <!-- 底部说明文案：每一份口粮精准送达 -->
        <p class="text-xs text-[#62706A] mt-2 max-w-md font-medium leading-relaxed">
          كل حصة غذائية تصل إلى مستحقيها · 伊拉克贸易部数字化配给流转监测中枢：保障全国每一份战略口粮精准直达。
        </p>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 次级业务总览控制栏：日期/时间指示 + 实时刷新操作 -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-[#18231E] flex items-center gap-2">
          <span>نظرة عامة على العمليات</span>
          <span class="text-xs font-medium text-[#5E6862] font-mono">/ 业务运行与配给履约总览</span>
        </h2>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- 伊斯兰与公历日期指示胶囊 -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ECE7DE] text-xs text-[#5E6862] shadow-2xs font-mono">
          <el-icon class="text-[#C59D5F]"><Calendar /></el-icon>
          <span>1448 ربيع الأول · 2026-10-14</span>
        </div>

        <!-- 刷新数据按钮 (带加载动画与触发效果) -->
        <el-button
          type="primary"
          size="default"
          class="!bg-[#1E3F35] !border-[#1E3F35] hover:!bg-[#2B5749] text-white shadow-xs font-semibold"
          :loading="isRefreshing"
          @click="handleManualRefresh"
        >
          <el-icon class="mr-1"><Refresh /></el-icon>
          <span>刷新数据</span>
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
      <!-- 卡片 1: الطلبات (配给申请与审核事项) -->
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
            <span>الطلبات</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ 申请与待办事项</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Document /></el-icon>
          </div>
        </div>

        <!-- 键值对数据行清单 (平滑数字滚动 + 右侧标签) -->
        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: إجمالي الطلبات (申请总量) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">إجمالي الطلبات (申请总量)</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countTotalOrders.displayValue.value }}
            </span>
          </div>

          <!-- 行 2: قيد المراجعة (审核中事项) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">قيد المراجعة (在审待办)</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countUnderReview.displayValue.value }}
            </span>
          </div>

          <!-- 行 3: بانتظار الاستكمال (待补充材料) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">بانتظار الاستكمال (待补公文)</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countWaitingDocs.displayValue.value }}
            </span>
          </div>

          <!-- 行 4: متوسط المعالجة (平均办结用时) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">متوسط المعالجة (平均办结)</span>
            <span class="font-mono font-semibold text-sm text-[#18231E]">
              {{ countAvgProcessingDays.displayValue.value }}
            </span>
          </div>

          <!-- 行 5: متأخرة > 7 أيام (超时滞后 > 7 天，带告警粉红胶囊与呼吸红点) -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">متأخرة > 7 أيام (超时预警)</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countOverdueOrders.displayValue.value }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#D34545] animate-pulse"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 2: المواطنون والأسر (保障家庭与受益公民) -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span>المواطنون والأسر</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ 受益公民与家庭</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><House /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: المسجلون (在保受益公民数) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">المسجلون (在保公民总数)</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countEnrolledCitizens.displayValue.value }}
            </span>
          </div>

          <!-- 行 2: الأسر المسجلة (登记保障家庭) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">الأسر المسجلة (纳保登记家庭)</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countEnrolledFamilies.displayValue.value }}
            </span>
          </div>

          <!-- 行 3: الأسر المستفيدة (本期已配给受惠家庭) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">الأسر المستفيدة (已配给受惠家庭)</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countBenefitedFamilies.displayValue.value }}
            </span>
          </div>

          <!-- 行 4: تغييرات الشهر (当月变动申报备案) -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">تغييرات الشهر (当月变动申报)</span>
            <span class="font-mono font-bold text-sm text-[#2C6E49] bg-[#EDF6F1] px-2 py-0.5 rounded-md">
              +{{ countMonthlyChanges.displayValue.value }}
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 3: التحقق من الهوية (身份核验与生物识别) -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span>التحقق من الهوية</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ 身份与生物核验</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Avatar /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: عمليات التحقق (核验操作总批次) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">عمليات التحقق (核验总批次)</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countTotalVerifications.displayValue.value }}
            </span>
          </div>

          <!-- 行 2: نسبة النجاح (人脸/活体核验通过率) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">نسبة النجاح (活体核验通过率)</span>
            <span class="font-mono font-bold text-sm text-[#1E3F35]">
              {{ countSuccessRate.displayValue.value }}
            </span>
          </div>

          <!-- 行 3: أبرز سبب فشل (主要复验原因说明) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">أبرز سبب فشل (主要重核原因)</span>
            <span class="text-xs font-semibold text-[#8C958F] bg-[#FAF7F2] px-2 py-0.5 rounded">
              إضاءة ضعيفة / 环境弱光
            </span>
          </div>

          <!-- 行 4: مراجعة يدوية (需人工兜底复核胶囊) -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">مراجعة يدوية (待人工复核)</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E6] border border-[#E8D9BF] text-[#966C2E] font-mono font-bold text-xs">
              <span>{{ countManualReviews.displayValue.value }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#C59D5F]"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 4: توزيع الغذاء (战略物资配给交付) -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span>توزيع الغذاء</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ 战略物资配给履约</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Box /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: الأسر المستحقة (应保家庭户额) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">الأسر المستحقة (当期应保家庭)</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countEligibleFamilies.displayValue.value }}
            </span>
          </div>

          <!-- 行 2: الأسر المستلمة (已签收领讫家庭) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">الأسر المستلمة (已签收领讫家庭)</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countReceivedFamilies.displayValue.value }}
            </span>
          </div>

          <!-- 行 3: نسبة الإنجاز (全国配给兑付率) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">نسبة الإنجاز (物资兑付履约率)</span>
            <span class="font-mono font-bold text-sm text-[#1E3F35]">
              {{ countCompletionRate.displayValue.value }}
            </span>
          </div>

          <!-- 行 4: لم تستلم (尚未提货家庭胶囊) -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">لم تستلم (尚未提货家庭)</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E6] border border-[#E8D9BF] text-[#966C2E] font-mono font-bold text-xs">
              <span>{{ countPendingClaims.displayValue.value }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#C59D5F]"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 5: عمليات الوكلاء (基层代销网点运行) -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span>عمليات الوكلاء</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ 签约网点保供运行</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Shop /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: الوكلاء النشطون (在任活跃代销点) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">الوكلاء النشطون (在任活跃网点)</span>
            <span class="font-mono font-bold text-base text-[#18231E]">
              {{ countActiveAgents.displayValue.value }}
            </span>
          </div>

          <!-- 行 2: توزيع اليوم (今日提货派发单) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">توزيع اليوم (今日物资发货单)</span>
            <span class="font-mono font-bold text-sm text-[#18231E]">
              {{ countTodayDispatches.displayValue.value }}
            </span>
          </div>

          <!-- 行 3: تغطية المناطق (全域行政网格覆盖) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">تغطية المناطق (行政网格覆盖)</span>
            <span class="font-mono font-semibold text-sm text-[#18231E]">
              18/18 省区
            </span>
          </div>

          <!-- 行 4: سجلات استثنائية (异常履约稽查记录，带告警粉红胶囊) -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">سجلات استثنائية (异常稽查)</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countExceptionCases.displayValue.value }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#D34545] animate-pulse"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 卡片 6: النظام والربط (中枢联网与接口同步) -->
      <!-- ======================================================== -->
      <div
        class="rcm-metric-card bg-white p-5 rounded-2xl border border-[#ECE7DE] flex flex-col justify-between"
        style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
      >
        <div class="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
          <h3 class="text-sm font-bold text-[#18231E] flex items-center gap-1.5">
            <span>النظام والربط</span>
            <span class="text-xs font-medium text-[#8C958F] font-sans">/ 中枢底账联网同步</span>
          </h3>
          <div class="rcm-icon-box">
            <el-icon :size="16"><Connection /></el-icon>
          </div>
        </div>

        <div class="space-y-3 pt-4 text-xs">
          <!-- 行 1: نجاح الواجهات (网关 API 成功率) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">نجاح الواجهات (接口调用成功率)</span>
            <span class="font-mono font-bold text-base text-[#1E3F35]">
              {{ countApiSuccessRate.displayValue.value }}
            </span>
          </div>

          <!-- 行 2: حالة المزامنة (实时底账同频状态) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">حالة المزامنة (实时底账状态)</span>
            <span class="font-semibold text-xs text-[#2C6E49] bg-[#EDF6F1] px-2 py-0.5 rounded">
              منتظمة 3/4 · 正常同频
            </span>
          </div>

          <!-- 行 3: مهام فاشلة (接口阻断重试) -->
          <div class="flex items-center justify-between">
            <span class="text-[#5E6862]">مهام فاشلة (阻断重试队列)</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countFailedTasks.displayValue.value }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#D34545]"></span>
            </span>
          </div>

          <!-- 行 4: فروقات معلقة (待对账挂账单据) -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[#5E6862]">فروقات معلقة (待对账差额)</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD5D5] text-[#D34545] font-mono font-bold text-xs">
              <span>{{ countPendingDiscrepancies.displayValue.value }}</span>
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
import { ElLoading, ElMessage } from 'element-plus';
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
import { ElNotification } from 'element-plus';

// DOM 元素引用
const overviewRootRef = ref(null);
const headerBannerRef = ref(null);
const cardsContainerRef = ref(null);

const isRefreshing = ref(false);

// ====================================================================
// 使用 useNumberCounter 初始化参考图中的 6 大核心卡片动态滚动数值
// ====================================================================

// 卡片 1: الطلبات
const countTotalOrders = useNumberCounter(48210, { duration: 1.6, delay: 0.1 });
const countUnderReview = useNumberCounter(3920, { duration: 1.4, delay: 0.15 });
const countWaitingDocs = useNumberCounter(1145, { duration: 1.5, delay: 0.2 });
const countAvgProcessingDays = useNumberCounter(2.4, { duration: 1.2, delay: 0.25, decimals: 1, suffix: ' 天' });
const countOverdueOrders = useNumberCounter(312, { duration: 1.3, delay: 0.3 });

// 卡片 2: المواطنون والأسر
const countEnrolledCitizens = useNumberCounter(5902114, { duration: 1.8, delay: 0.15 });
const countEnrolledFamilies = useNumberCounter(1284302, { duration: 1.6, delay: 0.2 });
const countBenefitedFamilies = useNumberCounter(1196480, { duration: 1.7, delay: 0.25 });
const countMonthlyChanges = useNumberCounter(8731, { duration: 1.4, delay: 0.3 });

// 卡片 3: التحقق من الهوية
const countTotalVerifications = useNumberCounter(412880, { duration: 1.6, delay: 0.2 });
const countSuccessRate = useNumberCounter(96.8, { duration: 1.5, delay: 0.25, decimals: 1, suffix: '%' });
const countManualReviews = useNumberCounter(1904, { duration: 1.4, delay: 0.3 });

// 卡片 4: توزيع الغذاء
const countEligibleFamilies = useNumberCounter(1196480, { duration: 1.7, delay: 0.25 });
const countReceivedFamilies = useNumberCounter(938040, { duration: 1.6, delay: 0.3 });
const countCompletionRate = useNumberCounter(78.4, { duration: 1.5, delay: 0.35, decimals: 1, suffix: '%' });
const countPendingClaims = useNumberCounter(258440, { duration: 1.6, delay: 0.4 });

// 卡片 5: عمليات الوكلاء
const countActiveAgents = useNumberCounter(4817, { duration: 1.5, delay: 0.3 });
const countTodayDispatches = useNumberCounter(62310, { duration: 1.6, delay: 0.35 });
const countExceptionCases = useNumberCounter(47, { duration: 1.2, delay: 0.4 });

// 卡片 6: النظام والربط
const countApiSuccessRate = useNumberCounter(99.2, { duration: 1.4, delay: 0.35, decimals: 1, suffix: '%' });
const countFailedTasks = useNumberCounter(1, { duration: 1.0, delay: 0.4 });
const countPendingDiscrepancies = useNumberCounter(2, { duration: 1.0, delay: 0.45 });

// ====================================================================
// GSAP 进场动画与悬停微交互
// ====================================================================
let pageTimeline = null;
let unsubTicket = null;
let unsubOrder = null;

onMounted(async () => {
  await nextTick();

  // 1. 顶部 Header Banner 与 卡片矩阵进场错落动效 (Stagger)
  pageTimeline = gsap.timeline();

  if (headerBannerRef.value) {
    pageTimeline.from(headerBannerRef.value, {
      opacity: 0,
      y: 25,
      duration: 0.9,
      ease: 'power3.out'
    });
  }

  if (cardsContainerRef.value) {
    const cards = cardsContainerRef.value.querySelectorAll('.rcm-metric-card');
    pageTimeline.from(
      cards,
      {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out'
      },
      '-=0.5'
    );
  }

  // 2. 跨标签页业务事件监听：公民提交业务申请工单
  unsubTicket = onTabMessage('TICKET_SUBMITTED', (ticket) => {
    // 动态增加大盘申请与待审指标
    countTotalOrders.animateTo(countTotalOrders.currentValue.value + 1);
    countUnderReview.animateTo(countUnderReview.currentValue.value + 1);

    // 优雅通知提醒
    ElNotification({
      title: '跨端实时业务提醒 (Cross-Tab Sync)',
      message: `检测到公民新提交申请 [${ticket.source || '业务公文'}]，单号: ${ticket.id}，监控大盘指标已实时同步递增。`,
      type: 'info',
      duration: 4000,
      position: 'bottom-right'
    });
  });

  // 3. 跨标签页业务事件监听：公民完成配给选购支付
  unsubOrder = onTabMessage('ORDER_PURCHASED', (order) => {
    // 动态增加今日派发与领取家庭指标
    countTodayDispatches.animateTo(countTodayDispatches.currentValue.value + 1);
    countReceivedFamilies.animateTo(countReceivedFamilies.currentValue.value + 1);

    ElNotification({
      title: '跨端实时配给核销通知',
      message: `公民 [${order.cardNo || '家庭'}] 已完成当月配给物资兑付，金额: ${order.amount} IQD，大盘今日发放流水已动态更新。`,
      type: 'success',
      duration: 4000,
      position: 'bottom-right'
    });
  });
});

onBeforeUnmount(() => {
  if (pageTimeline) {
    pageTimeline.kill();
    pageTimeline = null;
  }
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
    text: '正在同步伊拉克贸易部与内政部国家底账实时数据...',
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
      message: '国家食品配给底账数据同步完成，指标大盘已更新至最新状态',
      type: 'success',
      duration: 1800,
      showClose: true
    });
  } catch (err) {
    ElMessage.error('数据同步失败，请检查网关连接');
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

.rcm-metric-card {
  transition: border-color 0.25s ease;
}

/* 优雅加载遮罩风格微调 */
:deep(.rcm-government-loading .el-loading-spinner .el-loading-text) {
  color: #1E3F35 !important;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
}

:deep(.rcm-government-loading .el-loading-spinner .path) {
  stroke: #C59D5F !important;
  stroke-width: 3;
}
</style>
