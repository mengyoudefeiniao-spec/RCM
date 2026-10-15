<template>
  <Transition name="splash-fade">
    <div
      v-if="visible"
      class="splash-screen fixed inset-0 z-[999999] flex flex-col items-center justify-between select-none overflow-hidden"
      aria-label="Application Loading Splash Screen"
    >
      <!-- 1. 深度沉浸式背景：深邃中东政务绿与微金氛围光，无缝融合矢量图 -->
      <div class="absolute inset-0 bg-gradient-radial from-[#005a2d] via-[#004221] to-[#0a1f17] pointer-events-none"></div>
      
      <!-- 2. 极微弱的麦穗金色暗纹点阵 -->
      <div class="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#C59D5F_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"></div>

      <!-- 顶栏留白安全区 -->
      <div class="h-10 sm:h-16 w-full shrink-0"></div>

      <!-- 3. 中心核心品牌区 (矢量图标 + 平台标题，彻底去除白底卡片) -->
      <div class="relative z-10 flex flex-col items-center px-6 text-center max-w-sm -mt-6">
        <!-- 官方徽标容器：完全与背景结合的无白边设计 -->
        <div class="relative mb-4 flex items-center justify-center">
          <!-- 环形金色与翡翠绿双层氛围呼吸光晕 -->
          <div class="absolute w-44 h-44 rounded-full bg-gradient-to-r from-[#1FA35E]/30 to-[#C59D5F]/25 blur-2xl animate-pulse pointer-events-none"></div>

          <!-- 官方矢量徽标：直接与深绿背景融合，自然呈现其原生绿金圆角底座与国徽细节 -->
          <div class="w-32 h-32 sm:w-36 sm:h-36 relative flex items-center justify-center transform transition-transform duration-700 animate-splash-pop">
            <img
              src="/logo.svg"
              alt="Iraq Electronic Ration Card Official Logo"
              class="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)] drop-shadow-[0_0_24px_rgba(31,163,94,0.35)] select-none pointer-events-none"
              draggable="false"
            />
          </div>
        </div>

        <!-- 阿拉伯文主标 (采用 SomarSans 字体) -->
        <h1 class="text-2xl sm:text-3xl font-black text-[#F4E8D1] tracking-wide mb-1 drop-shadow-sm font-sans" dir="rtl">
          البطاقة التموينية
        </h1>

        <!-- 英文品牌名 -->
        <h2 class="text-sm sm:text-base font-bold text-white/90 tracking-wider uppercase mb-2">
          Ration Card Management
        </h2>

        <!-- 官方权威所属机构注记 -->
        <p class="text-[11px] sm:text-xs text-[#C59D5F] font-semibold tracking-wide opacity-95 max-w-[280px]">
          جمهورية العراق · وزارة التجارة
        </p>
        <p class="text-[9px] text-[#A6C4BA] tracking-widest uppercase mt-0.5 font-mono">
          Republic of Iraq · Ministry of Trade
        </p>
      </div>

      <!-- 4. 底部平滑加载指示区 -->
      <div class="relative z-10 w-full flex flex-col items-center pb-10 sm:pb-14 px-8">
        <!-- 金绿渐变流动加载进度条 -->
        <div class="w-40 sm:w-48 h-1 rounded-full bg-[#0a2318] overflow-hidden mb-3 border border-[#C59D5F]/20">
          <div class="h-full bg-gradient-to-r from-[#007A3D] via-[#E2C38E] to-[#1FA35E] rounded-full animate-splash-progress"></div>
        </div>

        <!-- 极简系统初始化状态提示 -->
        <div class="flex items-center gap-2 text-[11px] text-[#9EB5AC] tracking-wider font-mono">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#1FA35E] animate-ping"></span>
          <span>System Initializing...</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  // 过渡展示持续时长（毫秒），默认 1000ms
  duration: {
    type: Number,
    default: 1000
  }
});

const emit = defineEmits(['finish']);
const visible = ref(true);

onMounted(() => {
  const timer = setTimeout(() => {
    visible.value = false;
    emit('finish');
  }, props.duration);

  return () => clearTimeout(timer);
});
</script>

<style scoped>
.splash-screen {
  background-color: #004221;
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-fade-leave-active {
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-fade-leave-to {
  opacity: 0;
  transform: scale(1.03);
  pointer-events: none;
}

@keyframes splashPop {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  60% {
    opacity: 1;
    transform: scale(1.03);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-splash-pop {
  animation: splashPop 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes splashProgress {
  0% {
    width: 0%;
    transform: translateX(-30%);
  }
  50% {
    width: 75%;
    transform: translateX(0%);
  }
  100% {
    width: 100%;
    transform: translateX(0%);
  }
}

.animate-splash-progress {
  animation: splashProgress 0.95s ease-in-out forwards;
}
</style>
