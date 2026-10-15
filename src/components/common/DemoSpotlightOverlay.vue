<template>
  <!-- 全局顶层演示引导遮罩：只在演示模式下激活，置于应用最顶层，严格划分「可操作区域」与「不可操作区域」 -->
  <teleport to="body">
    <div
      v-if="isDemoActive && currentStepConfig"
      class="demo-spotlight-root fixed inset-0 select-none"
      style="z-index: 99999;"
    >
      <!-- ======================================================== -->
      <!-- 场景 A：步骤进行中（4 块不可操作阻挡层 + 中间可操作镂空视口） -->
      <!-- ======================================================== -->
      <template v-if="!currentStepConfig.isDone && targetRect">
        <!-- 1. 不可操作阻挡层：上遮罩 -->
        <div
          class="demo-block-mask absolute bg-slate-950/70 backdrop-blur-[1px] transition-all duration-200 cursor-not-allowed pointer-events-auto"
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
          class="demo-block-mask absolute bg-slate-950/70 backdrop-blur-[1px] transition-all duration-200 cursor-not-allowed pointer-events-auto"
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
          class="demo-block-mask absolute bg-slate-950/70 backdrop-blur-[1px] transition-all duration-200 cursor-not-allowed pointer-events-auto"
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
          class="demo-block-mask absolute bg-slate-950/70 backdrop-blur-[1px] transition-all duration-200 cursor-not-allowed pointer-events-auto"
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
          class="absolute rounded-xl pointer-events-none transition-all duration-200"
          :class="[
            shakeActive ? 'animate-shake' : '',
            'border-2 border-[#C59D5F] shadow-[0_0_0_2px_rgba(30,63,53,0.8),0_0_28px_rgba(197,157,95,0.9)]'
          ]"
          :style="{
            top: targetRect.top + 'px',
            left: targetRect.left + 'px',
            width: targetRect.width + 'px',
            height: targetRect.height + 'px'
          }"
        >
          <!-- 四角金色雷达准星装饰 -->
          <span class="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300" />
          <span class="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300" />
          <span class="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300" />
          <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300" />

          <!-- 动态呼吸光圈 -->
          <div class="absolute inset-0 rounded-xl animate-ping opacity-25 border-2 border-[#C59D5F]" />
        </div>

        <!-- 6. 顶层说明卡片（根据目标元素自适应定位在上方或下方） -->
        <div
          class="demo-floating-tooltip absolute z-50 pointer-events-auto transition-all duration-300 ease-out"
          :style="tooltipStyle"
        >
          <div
            class="relative rounded-2xl bg-gradient-to-br from-[#1E3F35] via-[#244C40] to-[#142C25] text-white p-4 shadow-2xl border border-[#C59D5F]/80 max-w-[360px] min-w-[280px]"
            style="box-shadow: 0 16px 40px -8px rgba(10, 25, 20, 0.7), 0 0 0 1px rgba(197, 157, 95, 0.4);"
          >
            <!-- 顶部状态栏：步骤标号 + 退出按钮 -->
            <div class="flex items-center justify-between pb-2.5 border-b border-white/15 gap-2">
              <div class="flex items-center gap-1.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C59D5F] text-[#1E3F35] tracking-wide shadow-xs">
                  {{ currentStepConfig.badge || '全流程演示' }}
                </span>
                <span class="text-xs font-bold text-[#E8D9BF] tracking-tight">
                  {{ currentStepConfig.title }}
                </span>
              </div>
              <button
                type="button"
                class="text-[11px] text-[#D4AA6A] hover:text-white px-2 py-0.5 rounded-lg border border-[#C59D5F]/40 hover:bg-[#C59D5F]/20 cursor-pointer transition-colors"
                title="退出全流程演示模式"
                @click="handleExitDemo"
              >
                退出演示
              </button>
            </div>

            <!-- 说明主体内容 -->
            <div class="py-2.5 flex items-start gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-[#C59D5F]/20 border border-[#C59D5F]/60 text-amber-300 flex items-center justify-center shrink-0 text-sm animate-bounce">
                👉
              </div>
              <div class="text-xs sm:text-[13px] text-slate-100 font-medium leading-relaxed">
                {{ currentStepConfig.desc }}
              </div>
            </div>

            <!-- 点击非高亮区域的拦截警告信息 -->
            <div
              v-if="showBlockTip"
              class="mt-1 p-2 rounded-lg bg-amber-500/20 border border-amber-400/50 text-[11px] text-amber-200 flex items-center gap-1.5 animate-pulse"
            >
              <span>⚠️</span>
              <span>演示模式下仅允许操作金色框内的指定功能！</span>
            </div>

            <!-- 底部指引角标 -->
            <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#A6B2AB]">
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>引导聚焦进行中</span>
              </span>
              <span>根据指示点击即可继续</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ======================================================== -->
      <!-- 场景 B：元素加载等待中（全屏阻挡，等待弹窗或页面渲染完毕） -->
      <!-- ======================================================== -->
      <template v-else-if="!currentStepConfig.isDone && !targetRect">
        <div
          class="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-auto cursor-wait"
        >
          <div class="p-4 rounded-2xl bg-[#1E3F35] text-white border border-[#C59D5F] shadow-2xl flex items-center gap-3">
            <div class="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
            <span class="text-xs font-medium text-[#FAF7F2]">正在定位演示操作节点，请稍候...</span>
          </div>
        </div>
      </template>

      <!-- ======================================================== -->
      <!-- 场景 C：01 阶段完成（居中展示成就卡片，引导演示用户） -->
      <!-- ======================================================== -->
      <template v-else-if="currentStepConfig.isDone">
        <div class="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex items-center justify-center p-4 pointer-events-auto">
          <div
            class="w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#1E3F35] via-[#244C40] to-[#142C25] text-white p-6 sm:p-8 shadow-2xl border-2 border-[#C59D5F] space-y-5 animate-scaleUp"
            style="box-shadow: 0 25px 60px -12px rgba(10, 25, 20, 0.8), 0 0 0 1px rgba(197, 157, 95, 0.4);"
          >
            <!-- 头部成就徽章 -->
            <div class="flex items-center gap-3 pb-4 border-b border-white/15">
              <div class="w-12 h-12 rounded-2xl bg-[#C59D5F] text-[#1E3F35] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                ✓
              </div>
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#C59D5F]/20 text-[#D4AA6A] border border-[#C59D5F]/40">
                  STAGE 01 COMPLETED
                </span>
                <h3 class="text-base sm:text-lg font-bold text-white mt-1">
                  🎉 【01 阶段完成】公民配给卡建档成功！
                </h3>
              </div>
            </div>

            <!-- 详细正文介绍 -->
            <div class="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <p>
                公民纸质配给卡已通过拍照 OCR 采集、信息补充、多源生物核验，成功在数字化配给账本中完成建档并签发电子配给卡！
              </p>
              <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-[#E8D9BF]">
                <span class="text-lg">📱</span>
                <span>当前页面已无缝切换至最新的<strong>移动端 Citizen APP 界面</strong>，您可在手机视口中查看已签发的家庭配给卡与在册成员。</span>
              </div>
            </div>

            <!-- 操作选项按钮组 -->
            <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-white/15">
              <button
                type="button"
                class="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer transition-colors"
                @click="handleStayAndExplore"
              >
                在公民 APP 自由体验
              </button>
              <button
                type="button"
                class="px-5 py-2.5 rounded-xl bg-[#C59D5F] hover:bg-[#B38C4F] text-[#1E3F35] text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                @click="handleBackToPortal"
              >
                <span>返回政务调度门户（继续 02 阶段）</span>
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
import { useRouter, useRoute } from 'vue-router';
import { isDemoActive, demoSubStep, deactivateDemo, setDemoStep } from '../../utils/demoState.js';

const router = useRouter();
const route = useRoute();

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
 * 01 阶段所有节点的配置注册表
 */
const STEP_CONFIGS = {
  'step1_1': {
    selector: '[data-demo-target="btn-register"]',
    title: '全流程演示 · 步骤 01-1',
    badge: '步骤 1/9',
    desc: '请点击下方金色框内的「注册」按钮，开启纸质配给卡数字化建档与电子卡申请流程',
    padding: 6
  },
  'step1_2': {
    selector: '[data-demo-target="btn-capture"]',
    title: '全流程演示 · 步骤 01-2',
    badge: '步骤 2/9',
    desc: '请点击高亮「拍照上传」按钮，扫描采集纸质配给卡底根并自动启动 OCR 存根比对',
    padding: 4
  },
  'step1_3': {
    selector: '[data-demo-target="input-head-name"]',
    title: '全流程演示 · 步骤 01-3',
    badge: '步骤 3/9',
    desc: '请点击「户主姓名」输入框（无需键盘打字，点击自动填入预设户主姓名与公民信息）',
    padding: 4
  },
  'step1_4': {
    selector: '[data-demo-target="btn-get-sms"]',
    title: '全流程演示 · 步骤 01-4',
    badge: '步骤 4/9',
    desc: '请点击「获取验证码」按钮，发送安全短信核验验证码',
    padding: 4
  },
  'step1_5': {
    selector: '[data-demo-target="btn-fill-sms"]',
    title: '全流程演示 · 步骤 01-5',
    badge: '步骤 5/9',
    desc: '请点击短信提示卡中的「一键填入」按钮，自动将短信验证码录入表单',
    padding: 4
  },
  'step1_6': {
    selector: '[data-demo-target="btn-next-auth"]',
    title: '全流程演示 · 步骤 01-6',
    badge: '步骤 6/9',
    desc: '身份基础信息校验通过，请点击「选择身份认证方式」进入多源核验环节',
    padding: 4
  },
  'step1_7': {
    selector: '[data-demo-target="btn-start-bio"]',
    title: '全流程演示 · 步骤 01-7',
    badge: '步骤 7/9',
    desc: '请点击「立即启动人脸与国民卡核验」，启动人脸自拍与芯片多源比对',
    padding: 4
  },
  'step1_8': {
    selector: '[data-demo-target="btn-confirm-bio"]',
    title: '全流程演示 · 步骤 01-8',
    badge: '步骤 8/9',
    desc: '生物核验特征与卡芯片对碰成功，请点击「确认核验并放行进入」',
    padding: 4
  },
  'step1_9': {
    selector: '[data-demo-target="btn-finish-reg"]',
    title: '全流程演示 · 步骤 01-9',
    badge: '步骤 9/9',
    desc: '所有核验已就绪！请点击「完成注册并签发电子配给卡」完成建档并签发电子卡',
    padding: 4
  },
  'step1_done': {
    isDone: true,
    title: '01 阶段完成',
    desc: '恭喜！公民纸质配给卡已成功数字化建档并签发电子配给卡。'
  }
};

const currentStepConfig = computed(() => {
  if (!isDemoActive.value) return null;
  const step = demoSubStep.value || 'step1_1';
  return STEP_CONFIGS[step] || null;
});

/**
 * 计算说明卡片的浮动自适应位置
 */
const tooltipStyle = computed(() => {
  if (!targetRect.value) return {};

  const rect = targetRect.value;
  const tooltipWidth = 340;
  const margin = 12;

  // 水平方向：居中对齐目标，两端防溢出
  const targetCenterX = rect.left + rect.width / 2;
  let left = targetCenterX - tooltipWidth / 2;
  left = Math.max(16, Math.min(windowWidth.value - tooltipWidth - 16, left));

  // 垂直方向：判断下方还是上方空间更足
  const spaceBelow = windowHeight.value - rect.bottom;
  let top;
  if (spaceBelow > 180 || rect.top < 180) {
    // 放在下方
    top = rect.bottom + margin;
  } else {
    // 放在上方
    top = Math.max(16, rect.top - 180 - margin);
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${tooltipWidth}px`
  };
});

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

  // 若元素不在当前可视区域内，自动平滑滚入视野
  const rawRect = el.getBoundingClientRect();
  if (rawRect.top < 20 || rawRect.bottom > windowHeight.value - 20) {
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

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
    if (pollCount < 40) {
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
 * 退出演示
 */
function handleExitDemo() {
  deactivateDemo();
}

/**
 * 完成页：留在公民 APP 自由体验
 */
function handleStayAndExplore() {
  deactivateDemo();
}

/**
 * 完成页：返回政务调度门户
 */
function handleBackToPortal() {
  deactivateDemo();
  router.push('/portal');
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
