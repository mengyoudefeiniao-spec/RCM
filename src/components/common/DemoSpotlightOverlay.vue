<template>
  <!-- 全局顶层演示引导遮罩：只在演示模式下激活，置于应用最顶层，严格划分「可操作区域」与「不可操作区域」 -->
  <teleport to="body">
    <div
      v-if="isDemoActive && currentStepConfig"
      class="demo-spotlight-root fixed inset-0 select-none"
      style="z-index: 99999; pointer-events: none;"
    >
      <!-- ======================================================== -->
      <!-- 场景 A：步骤进行中（4 块不可操作阻挡层 + 中间可操作镂空视口） -->
      <!-- 根容器 pointer-events:none：镂空区域内点击可穿透到真实按钮 -->
      <!-- ======================================================== -->
      <template v-if="!currentStepConfig.isDone && targetRect">
        <!-- 1. 不可操作阻挡层：上遮罩 -->
        <div
          class="demo-block-mask absolute bg-[#1B3123]/35 transition-all duration-200 cursor-not-allowed pointer-events-auto"
          :style="{
            top: '0px',
            left: '0px',
            width: '100vw',
            height: Math.max(0, targetRect.top) + 'px'
          }"
          @click.stop.prevent="handleBlockClick"
        />

        <!-- 2. 不可操作阻挡层：下遮罩 -->
        <div
          class="demo-block-mask absolute bg-[#1B3123]/35 transition-all duration-200 cursor-not-allowed pointer-events-auto"
          :style="{
            top: Math.min(windowHeight, targetRect.bottom) + 'px',
            left: '0px',
            width: '100vw',
            height: Math.max(0, windowHeight - targetRect.bottom) + 'px'
          }"
          @click.stop.prevent="handleBlockClick"
        />

        <!-- 3. 不可操作阻挡层：左遮罩 -->
        <div
          class="demo-block-mask absolute bg-[#1B3123]/35 transition-all duration-200 cursor-not-allowed pointer-events-auto"
          :style="{
            top: targetRect.top + 'px',
            left: '0px',
            width: Math.max(0, targetRect.left) + 'px',
            height: targetRect.height + 'px'
          }"
          @click.stop.prevent="handleBlockClick"
        />

        <!-- 4. 不可操作阻挡层：右遮罩 -->
        <div
          class="demo-block-mask absolute bg-[#1B3123]/35 transition-all duration-200 cursor-not-allowed pointer-events-auto"
          :style="{
            top: targetRect.top + 'px',
            left: targetRect.right + 'px',
            width: Math.max(0, windowWidth - targetRect.right) + 'px',
            height: targetRect.height + 'px'
          }"
          @click.stop.prevent="handleBlockClick"
        />

        <!-- 5. 可操作镂空区域高亮线框（无拦截，pointer-events: none，鼠标可直达下层真实目标按钮） -->
        <div
          class="absolute rounded-lg pointer-events-none transition-all duration-200"
          :class="[
            shakeActive ? 'animate-shake' : '',
            'border-2 border-[#D3AF62] shadow-[0_0_0_1px_rgba(255,255,255,0.7),0_0_16px_rgba(211, 175, 98,0.55)] bg-[#D3AF62]/5'
          ]"
          :style="{
            top: targetRect.top + 'px',
            left: targetRect.left + 'px',
            width: targetRect.width + 'px',
            height: targetRect.height + 'px'
          }"
        >
          <!-- 四角金色雷达准星装饰 -->
          <span class="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#D3AF62]" />
          <span class="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#D3AF62]" />
          <span class="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#D3AF62]" />
          <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#D3AF62]" />

          <!-- 动态呼吸光圈 -->
          <div class="absolute inset-0 rounded-lg animate-ping opacity-20 border-2 border-[#D3AF62]" />
        </div>

        <!-- 5.5 镂空区点击推进捕获层（advanceTo 配置时启用）：点击镂空区直接推进步骤，
             不依赖下层元素自身的事件绑定（如 el-table 行点击） -->
        <div
          v-if="currentStepConfig.advanceTo"
          class="absolute rounded-lg pointer-events-auto cursor-pointer"
          :style="{
            top: targetRect.top + 'px',
            left: targetRect.left + 'px',
            width: targetRect.width + 'px',
            height: targetRect.height + 'px'
          }"
          @click.stop="handleAdvanceClick"
        />

        <!-- 6. 顶层说明卡片（根据目标元素自适应定位在上方或下方） -->
        <div
          class="demo-floating-tooltip absolute z-50 pointer-events-auto transition-all duration-300 ease-out"
          :style="tooltipStyle"
        >
          <div
            class="relative rounded-lg bg-white/95 backdrop-blur-sm text-[#326445] p-4 border border-[#D9E5DB] max-w-[360px] min-w-[280px]"
            style="box-shadow: 0 12px 32px -10px rgba(50, 100, 69, 0.18), 0 0 0 1px rgba(232, 217, 191, 0.5);"
          >
            <!-- 顶部状态栏：步骤标号 + 退出按钮 -->
            <div class="flex items-center justify-between pb-2.5 border-b border-[#E9F1EB] gap-2">
              <div class="flex items-center gap-1.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FDF3E0] text-[#B8934A] border border-[#E5CEA1] tracking-wide">
                  {{ currentStepConfig.badge }}
                </span>
                <span class="text-xs font-bold text-[#326445] tracking-tight">
                  {{ currentStepConfig.title }}
                </span>
              </div>
              <button
                type="button"
                class="text-[11px] text-[#8A9A8F] hover:text-[#326445] px-2 py-0.5 rounded-lg border border-[#D9E5DB] hover:bg-[#F8FBF8] cursor-pointer transition-colors shrink-0"
                :title="t('demo.exitTitle')"
                @click="handleExitDemo"
              >
                {{ t('demo.exit') }}
              </button>
            </div>

            <!-- 说明主体内容 -->
            <div class="py-2.5 flex items-start gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-[#FDF3E0] border border-[#E5CEA1] text-[#B8934A] flex items-center justify-center shrink-0 text-sm animate-bounce">
                👉
              </div>
              <div class="text-xs sm:text-[13px] text-[#43554B] font-medium leading-relaxed">
                {{ currentStepConfig.desc }}
              </div>
            </div>

            <!-- 点击非高亮区域的拦截警告信息 -->
            <div
              v-if="showBlockTip"
              class="mt-1 p-2 rounded-lg bg-[#FDF3E0] border border-[#E5CEA1] text-[11px] text-[#7A5F21] flex items-center gap-1.5"
            >
              <span>⚠️</span>
              <span>{{ t('demo.blockTip') }}</span>
            </div>

            <!-- 底部指引角标 -->
            <div class="pt-2 border-t border-[#E9F1EB] flex items-center justify-between text-[10px] text-[#8A9A8F]">
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-[#3E9B68] animate-ping" />
                <span>{{ t('demo.footerActive') }}</span>
              </span>
              <span>{{ t('demo.footerHint') }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ======================================================== -->
      <!-- 场景 B：元素加载等待中（全屏阻挡，等待弹窗或页面渲染完毕） -->
      <!-- ======================================================== -->
      <template v-else-if="!currentStepConfig.isDone && !targetRect">
        <div
          class="absolute inset-0 bg-[#1B3123]/30 flex items-center justify-center pointer-events-auto cursor-wait"
        >
          <div class="p-4 rounded-lg bg-white/95 text-[#326445] border border-[#E5CEA1] shadow-lg flex items-center gap-3">
            <div class="w-5 h-5 border-2 border-[#D3AF62] border-t-transparent rounded-full animate-spin" />
            <span class="text-xs font-medium text-[#43554B]">{{ t('demo.locating') }}</span>
          </div>
        </div>
      </template>

      <!-- ======================================================== -->
      <!-- 场景 C：阶段完成（居中展示成就卡片，引导演示用户） -->
      <!-- ======================================================== -->
      <template v-else-if="currentStepConfig.isDone">
        <div class="absolute inset-0 bg-[#1B3123]/40 backdrop-blur-[1px] flex items-center justify-center p-4 pointer-events-auto">
          <div
            class="w-full max-w-lg rounded-3xl bg-[#F3F9F5] text-[#326445] p-6 sm:p-8 border-2 border-[#E5CEA1] space-y-5 animate-scaleUp"
            style="box-shadow: 0 25px 60px -12px rgba(50, 100, 69, 0.25), 0 0 0 1px rgba(232, 217, 191, 0.6);"
          >
            <!-- 头部成就徽章 -->
            <div class="flex items-center gap-3 pb-4 border-b border-[#E9F1EB]">
              <div class="w-12 h-12 rounded-lg bg-[#326445] text-[#D3AF62] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                ✓
              </div>
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FDF3E0] text-[#B8934A] border border-[#E5CEA1]">
                  {{ doneTexts.badge }}
                </span>
                <h3 class="text-base sm:text-lg font-bold text-[#326445] mt-1">
                  🎉 {{ doneTexts.title }}
                </h3>
              </div>
            </div>

            <!-- 详细正文介绍 -->
            <div class="space-y-3 text-xs sm:text-sm text-[#43554B] leading-relaxed">
              <p>{{ doneTexts.body }}</p>
              <div class="p-3 rounded-lg bg-[#F8FBF8] border border-[#D9E5DB] flex items-center gap-2.5 text-xs text-[#58685D]">
                <span class="text-lg">📱</span>
                <span>{{ doneTexts.note }}</span>
              </div>
            </div>

            <!-- 操作选项按钮组 -->
            <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-[#E9F1EB]">
              <button
                type="button"
                class="px-4 py-2.5 rounded-lg border border-[#D9E5DB] hover:bg-[#F8FBF8] text-[#326445] text-xs font-semibold cursor-pointer transition-colors"
                @click="handleStayAndExplore"
              >
                {{ doneTexts.btnExplore }}
              </button>
              <button
                type="button"
                class="px-5 py-2.5 rounded-lg bg-[#326445] hover:bg-[#2F5B44] text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                @click="handleEnterNextStage()"
              >
                <span>{{ doneTexts.btnNext }}</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { isDemoActive, demoSubStep, setDemoStep, deactivateDemo, activateDemo } from '../../utils/demoState.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// 视口尺寸监听
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800);

// 目标元素尺寸矩形
const targetRect = ref(null);

// 交互反馈状态
const shakeActive = ref(false);
const showBlockTip = ref(false);
let blockTipTimeout = null;

// 定位轮询定时器
let pollTimer = null;
let pollCount = 0;

/**
 * 01 阶段所有节点的配置注册表（文案走 i18n）
 */
const STEP_CONFIGS = {
  'step1_1': {
    selector: '[data-demo-target="btn-register"]',
    titleKey: 'demo.steps.step1_1.title',
    descKey: 'demo.steps.step1_1.desc',
    stepNo: 1,
    padding: 6
  },
  'step1_2': {
    selector: '[data-demo-target="btn-capture"]',
    titleKey: 'demo.steps.step1_2.title',
    descKey: 'demo.steps.step1_2.desc',
    stepNo: 2,
    padding: 4
  },
  'step1_3': {
    selector: '[data-demo-target="input-head-name"]',
    titleKey: 'demo.steps.step1_3.title',
    descKey: 'demo.steps.step1_3.desc',
    stepNo: 3,
    padding: 4
  },
  'step1_4': {
    selector: '[data-demo-target="btn-get-sms"]',
    titleKey: 'demo.steps.step1_4.title',
    descKey: 'demo.steps.step1_4.desc',
    stepNo: 4,
    padding: 4
  },
  'step1_5': {
    selector: '[data-demo-target="btn-fill-sms"]',
    titleKey: 'demo.steps.step1_5.title',
    descKey: 'demo.steps.step1_5.desc',
    stepNo: 5,
    padding: 4
  },
  'step1_6': {
    selector: '[data-demo-target="btn-next-auth"]',
    titleKey: 'demo.steps.step1_6.title',
    descKey: 'demo.steps.step1_6.desc',
    stepNo: 6,
    padding: 4
  },
  'step1_7': {
    selector: '[data-demo-target="btn-start-bio"]',
    titleKey: 'demo.steps.step1_7.title',
    descKey: 'demo.steps.step1_7.desc',
    stepNo: 7,
    padding: 4
  },
  'step1_7a': {
    selector: '[data-demo-target="btn-bio-face"]',
    titleKey: 'demo.steps.step1_7a.title',
    descKey: 'demo.steps.step1_7a.desc',
    stepNo: 8,
    padding: 4,
    preferBelow: true
  },
  'step1_7b': {
    selector: '[data-demo-target="btn-bio-front"]',
    titleKey: 'demo.steps.step1_7b.title',
    descKey: 'demo.steps.step1_7b.desc',
    stepNo: 9,
    padding: 4,
    preferAbove: true
  },
  'step1_7c': {
    selector: '[data-demo-target="btn-bio-chip"]',
    titleKey: 'demo.steps.step1_7c.title',
    descKey: 'demo.steps.step1_7c.desc',
    stepNo: 10,
    padding: 4,
    preferAbove: true
  },
  'step1_8': {
    selector: '[data-demo-target="btn-confirm-bio"]',
    titleKey: 'demo.steps.step1_8.title',
    descKey: 'demo.steps.step1_8.desc',
    stepNo: 11,
    padding: 4,
    preferAbove: true
  },
  'step1_9': {
    selector: '[data-demo-target="btn-finish-reg"]',
    titleKey: 'demo.steps.step1_9.title',
    descKey: 'demo.steps.step1_9.desc',
    stepNo: 12,
    padding: 4
  },
  'step1_done': {
    isDone: true,
    title: '01',
    desc: 'done'
  },

  /**
   * 02 阶段：配给购买与取货（公民 APP · 配给购买与取货页）
   */
  'step2_1': {
    selector: '[data-demo-target="btn-fill-quota"]',
    titleKey: 'demo.steps.step2_1.title',
    descKey: 'demo.steps.step2_1.desc',
    stepNo: 1,
    total: 7,
    padding: 4
  },
  'step2_2': {
    selector: '[data-demo-target="btn-next-delivery"]',
    titleKey: 'demo.steps.step2_2.title',
    descKey: 'demo.steps.step2_2.desc',
    stepNo: 2,
    total: 7,
    padding: 4
  },
  'step2_3': {
    selector: '[data-demo-target="card-home-delivery"]',
    titleKey: 'demo.steps.step2_3.title',
    descKey: 'demo.steps.step2_3.desc',
    stepNo: 3,
    total: 7,
    padding: 4
  },
  'step2_4': {
    selector: '[data-demo-target="btn-next-pay"]',
    titleKey: 'demo.steps.step2_4.title',
    descKey: 'demo.steps.step2_4.desc',
    stepNo: 4,
    total: 7,
    padding: 4
  },
  'step2_5': {
    selector: '[data-demo-target="btn-pay"]',
    titleKey: 'demo.steps.step2_5.title',
    descKey: 'demo.steps.step2_5.desc',
    stepNo: 5,
    total: 7,
    padding: 4
  },
  'step2_6': {
    selector: '[data-demo-target="pin-area"]',
    titleKey: 'demo.steps.step2_6.title',
    descKey: 'demo.steps.step2_6.desc',
    stepNo: 6,
    total: 7,
    padding: 4
  },
  'step2_7': {
    isDone: true,
    title: '02',
    desc: 'done'
  },

  /**
   * 03 阶段：政府端订单统计监控与审核穿透（管理端 Web · 订单统计页）
   */
  'step3_1': {
    selector: '[data-demo-target="citizen-orders-table"] tbody tr',
    titleKey: 'demo.steps.step3_1.title',
    descKey: 'demo.steps.step3_1.desc',
    stepNo: 1,
    total: 1,
    padding: 4,
    scrollBlock: 'center',
    advanceTo: 'step3_done'
  },
  'step3_done': {
    isDone: true,
    title: '03',
    desc: 'done'
  },

  /**
   * 04 阶段：代理端发货履约（代理端 APP · 订单配送页）
   * 确认出车发货（04-3）后即完成阶段演示；扫码核销交货由配送员线下执行，不在引导范围内
   */
  'step4_1': {
    selector: '[data-demo-target="btn-dispatch"]',
    titleKey: 'demo.steps.step4_1.title',
    descKey: 'demo.steps.step4_1.desc',
    stepNo: 1,
    total: 3,
    padding: 4
  },
  'step4_2': {
    selector: '[data-demo-target="btn-quick-driver"]',
    titleKey: 'demo.steps.step4_2.title',
    descKey: 'demo.steps.step4_2.desc',
    stepNo: 2,
    total: 3,
    padding: 4
  },
  'step4_3': {
    selector: '[data-demo-target="btn-confirm-dispatch"]',
    titleKey: 'demo.steps.step4_3.title',
    descKey: 'demo.steps.step4_3.desc',
    stepNo: 3,
    total: 3,
    padding: 4
  },
  'step4_done': {
    isDone: true,
    title: '04',
    desc: 'done'
  },

  /**
   * 05 阶段：公民出示防伪取货码（公民 APP · 配给购买与取货页）
   */
  'step5_1': {
    selector: '[data-demo-target="btn-show-qr"]',
    titleKey: 'demo.steps.step5_1.title',
    descKey: 'demo.steps.step5_1.desc',
    stepNo: 1,
    total: 2,
    padding: 4,
    scrollBlock: 'center'
  },
  'step5_2': {
    selector: '[data-demo-target="qr-voucher"]',
    titleKey: 'demo.steps.step5_2.title',
    descKey: 'demo.steps.step5_2.desc',
    stepNo: 2,
    total: 2,
    padding: 4,
    advanceTo: 'step5_done'
  },
  'step5_done': {
    isDone: true,
    title: '05',
    desc: 'done'
  },

  /**
   * 06 阶段：代理端扫码核销（代理端 APP · 现场核销页）—— 全流程最终阶段
   */
  'step6_1': {
    selector: '[data-demo-target="btn-scan-verify"]',
    titleKey: 'demo.steps.step6_1.title',
    descKey: 'demo.steps.step6_1.desc',
    stepNo: 1,
    total: 2,
    padding: 4
  },
  'step6_2': {
    selector: '[data-demo-target="scan-viewfinder"]',
    titleKey: 'demo.steps.step6_2.title',
    descKey: 'demo.steps.step6_2.desc',
    stepNo: 2,
    total: 2,
    padding: 4,
    advanceTo: 'step6_done'
  },
  'step6_done': {
    isDone: true,
    title: '06',
    desc: 'done'
  }
};

const currentStepConfig = computed(() => {
  if (!isDemoActive.value) return null;
  const step = demoSubStep.value || 'step1_1';
  const config = STEP_CONFIGS[step];
  if (!config) return null;
  if (config.isDone) {
    return config;
  }
  return {
    ...config,
    title: t(config.titleKey),
    desc: t(config.descKey),
    badge: t('demo.stepBadge', { cur: config.stepNo, total: config.total || 12 })
  };
});

// 当前是否处于阶段完成态（完成卡文案与按钮按阶段区分）
// 当前完成的阶段编号（'' 表示非完成态，即 01 阶段完成）
const doneStage = computed(() => {
  if (!currentStepConfig.value?.isDone) return '';
  const s = String(demoSubStep.value || '');
  if (s.startsWith('step6')) return '6';
  if (s.startsWith('step5')) return '5';
  if (s.startsWith('step4')) return '4';
  if (s.startsWith('step3')) return '3';
  if (s.startsWith('step2')) return '2';
  return '';
});

// 完成卡阶段感知文案
const doneTexts = computed(() => {
  const prefix = doneStage.value;
  return {
    badge: t(`demo.doneBadge${prefix}`),
    title: t(`demo.doneTitle${prefix}`),
    body: t(`demo.doneBody${prefix}`),
    note: t(`demo.doneAppNote${prefix}`),
    btnExplore: prefix === '6' ? t('demo.btnStayAgent') : t('demo.btnExplore'),
    btnNext: prefix === '6' ? t('demo.btnFinishAll') : prefix === '5' ? t('demo.btnNextStage6') : prefix === '4' ? t('demo.btnNextStage5') : prefix === '3' ? t('demo.btnNextStage4') : prefix === '2' ? t('demo.btnNextStage') : t('demo.btnBackPortal')
  };
});

/**
 * 计算说明卡片的浮动自适应位置
 */
const tooltipStyle = computed(() => {
  if (!targetRect.value) return {};

  const rect = targetRect.value;
  const tooltipWidth = 340;
  const margin = 12;
  const tooltipEstHeight = 190;

  // 水平方向：居中对齐目标，两端防溢出
  const targetCenterX = rect.left + rect.width / 2;
  let left = targetCenterX - tooltipWidth / 2;
  left = Math.max(16, Math.min(windowWidth.value - tooltipWidth - 16, left));

  // 垂直方向：preferAbove 强制放上方（避免遮挡下方待操作按钮）；
  // preferBelow 强制放下方（避免遮挡上方弹窗，如人脸活体核验小窗）；
  // 其余保持"空间充足则放下方"策略
  const spaceBelow = windowHeight.value - rect.bottom;
  const spaceAbove = rect.top;
  let top;
  const cfg = currentStepConfig.value || {};
  if (cfg.preferAbove && spaceAbove > tooltipEstHeight + margin + 8) {
    // 放在上方
    top = Math.max(16, rect.top - tooltipEstHeight - margin);
  } else if (cfg.preferBelow && spaceBelow > tooltipEstHeight + margin + 8) {
    // 放在下方
    top = rect.bottom + margin;
  } else if (spaceBelow > 180 || rect.top < 180) {
    // 放在下方
    top = rect.bottom + margin;
  } else {
    // 放在上方
    top = Math.max(16, rect.top - tooltipEstHeight - margin);
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${tooltipWidth}px`
  };
});

/**
 * 向上查找最近的可滚动父容器（含 window 兜底）
 */
function getScrollParent(el) {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

/**
 * 遮挡感知滚动定位：
 * 1. 以滚动父容器可视区与窗口的交集作为「有效可视区」，上下各保留安全边距；
 * 2. 目标未完整落入有效可视区时，将目标平滑滚动至滚动容器可视区中部；
 * 3. 相比 scrollIntoView，可避免手机仿真框（内容底部不在窗口底部）与底部固定操作栏遮挡造成的定位死区。
 */
function revealTarget(el) {
  const rect = el.getBoundingClientRect();
  const container = getScrollParent(el);
  const cRect = container ? container.getBoundingClientRect() : null;

  const safeTop = Math.max(0, cRect ? cRect.top : 0) + 24;
  const safeBottom = Math.min(windowHeight.value, cRect ? cRect.bottom : windowHeight.value) - 24;

  // 已完整落入有效可视区，无需滚动
  if (rect.top >= safeTop && rect.bottom <= safeBottom) {
    return;
  }

  const isWindowScroll = !container || container === document.scrollingElement || container === document.documentElement;

  if (isWindowScroll) {
    const desired = Math.max(0, rect.top + window.pageYOffset - (windowHeight.value - rect.height) / 2);
    window.scrollTo({ top: desired, behavior: 'smooth' });
    return;
  }

  // 目标在容器内容中的绝对偏移，滚动至容器可视区居中（钳制在可滚动范围内）
  const targetOffsetInContent = rect.top - cRect.top + container.scrollTop;
  const maxScroll = container.scrollHeight - container.clientHeight;
  const desired = Math.max(0, Math.min(maxScroll, targetOffsetInContent - (container.clientHeight - rect.height) / 2));
  container.scrollTo({ top: desired, behavior: 'smooth' });
}

/**
 * 寻找并测量目标元素
 */
function updateTarget() {
  if (!isDemoActive.value || !currentStepConfig.value) {
    targetRect.value = null;
    return;
  }

  if (currentStepConfig.value.isDone) {
    targetRect.value = null;
    return;
  }

  const selector = currentStepConfig.value.selector;
  if (!selector) {
    targetRect.value = null;
    return;
  }

  const el = document.querySelector(selector);
  if (!el || el.offsetParent === null) {
    targetRect.value = null;
    return;
  }

  // 遮挡感知滚动：以滚动父容器的「有效可视区」为准（而非整个窗口），
  // 目标未完整落入安全区时平滑滚动至容器可视区中部，避免被底部固定操作栏遮挡
  revealTarget(el);

  const rect = el.getBoundingClientRect();
  const pad = currentStepConfig.value.padding || 4;

  targetRect.value = {
    top: Math.max(0, rect.top - pad),
    left: Math.max(0, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    bottom: Math.min(windowHeight.value, rect.bottom + pad),
    right: Math.min(windowWidth.value, rect.right + pad)
  };
}

/**
 * 轮询目标元素出现（处理弹窗打开等异步动画渲染延迟）
 */
function startPollingTarget() {
  stopPollingTarget();
  pollCount = 0;

  function tick() {
    updateTarget();
    if (targetRect.value) {
      // 找到了，继续低频校准 5 次以防动画抖动
      if (pollCount < 10) {
        pollCount++;
        pollTimer = setTimeout(tick, 80);
      }
      return;
    }

    pollCount++;
    if (pollCount < 80) {
      pollTimer = setTimeout(tick, 75);
    }
  }

  tick();
}

function stopPollingTarget() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

/**
 * 用户点击不可操作区域时的拦截提醒与微反馈
 */
function handleBlockClick() {
  shakeActive.value = true;
  showBlockTip.value = true;

  if (blockTipTimeout) clearTimeout(blockTipTimeout);
  blockTipTimeout = setTimeout(() => {
    shakeActive.value = false;
    showBlockTip.value = false;
  }, 1800);
}

/**
 * 镂空区点击推进（advanceTo 配置）：点击即推进到指定步骤
 */
function handleAdvanceClick() {
  const next = currentStepConfig.value?.advanceTo;
  if (next) {
    setDemoStep(next);
  }
}

/**
 * 退出演示
 */
function handleExitDemo() {
  deactivateDemo();
}

/**
 * 完成页：留在公民 APP 自由体验 —— 显式关闭 Stage 01 Completed 完成窗口
 */
function handleStayAndExplore() {
  deactivateDemo();
  ElMessage.success(t('demo.exitToast'));
}

/**
 * 完成页：继续 02 阶段 —— 跳转至公民 APP「配给购买与取货」页面并从 02 阶段第 1 步继续引导
 */
function handleBackToPortal() {
  setDemoStep('step2_1');
  router.push('/warehouse?role=citizen&layout=app&tab=purchase&demo=true&demoStep=step2_1');
}

/**
 * 阶段完成页：进入下一阶段（阶段感知）
 * - 01 完成 -> 02 阶段：跳转公民 APP「配给购买与取货」并激活 02 阶段引导
 * - 02 完成 -> 03 阶段：跳转政府端「订单统计监控」大屏并激活 03 阶段引导
 * - 03 完成 -> 04 阶段：跳转代理端 APP「订单配送」页并激活 04 阶段引导
 * - 04 完成 -> 05 阶段：跳转公民 APP「配给购买与取货」申领记录并激活 05 阶段引导
 * - 05 完成 -> 06 阶段：跳转代理端 APP「现场核销」页并激活 06 阶段引导
 * - 06 完成 -> 全流程演示完成：返回门户
 */
function handleEnterNextStage() {
  const stage = doneStage.value;
  if (stage === '' || stage === '1') {
    // 01 阶段完成：保持演示态续接 02 阶段
    setDemoStep('step2_1');
    router.push('/warehouse?role=citizen&layout=app&tab=purchase&demo=true&demoStep=step2_1');
    return;
  }
  deactivateDemo();
  if (stage === '2') {
    router.push('/warehouse?role=minister_center&layout=web&tab=orderStats&demo=true&demoStep=step3_1');
  } else if (stage === '3') {
    router.push('/warehouse?role=agent&layout=app&tab=orderStats&demo=true&demoStep=step4_1');
  } else if (stage === '4') {
    router.push('/warehouse?role=citizen&layout=app&tab=purchase&demo=true&demoStep=step5_1');
  } else if (stage === '5') {
    router.push('/dashboard?role=agent&mode=mobile&layout=app&demo=true&demoStep=step6_1');
  } else if (stage === '6') {
    router.push('/portal');
  } else {
    router.push('/portal');
  }
}

/**
 * 监听视口变化
 */
function handleResize() {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
    updateTarget();
  }
}

function handleScroll() {
  updateTarget();
}

// 监听子步骤与活跃状态变化
watch([isDemoActive, demoSubStep], () => {
  nextTick(() => {
    startPollingTarget();
  });
}, { immediate: true });

watch(() => route.path, () => {
  nextTick(() => {
    startPollingTarget();
  });
});

/**
 * 跨阶段跳转校正：
 * 路由守卫中的角色切换是响应式的，目标页面组件可能在导航确认前挂载（此时 route.query 仍为旧路由），
 * 导致组件 onMounted 以旧 demoStep 激活演示、覆盖完成卡状态。
 * 此观察器在导航确认后以 URL 携带的演示参数为准纠正演示状态（对 01→06 所有跨阶段跳转统一生效）。
 * 注意：仅在 URL 显式携带 demoStep 时纠正，避免覆盖无 demoStep 参数的页面
 * （如 01 阶段注册完成页 /citizen?...&done=true 的 step1_done 完成态）。
 */
watch(() => route.fullPath, () => {
  const q = route.query;
  if (q.demo !== 'true' || !q.demoStep) return;
  const target = String(q.demoStep);
  if (!isDemoActive.value) {
    activateDemo(target);
  } else if (demoSubStep.value !== target) {
    setDemoStep(target);
  }
});

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, true);
  startPollingTarget();
});

onUnmounted(() => {
  stopPollingTarget();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  if (blockTipTimeout) clearTimeout(blockTipTimeout);
});
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scaleUp {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
