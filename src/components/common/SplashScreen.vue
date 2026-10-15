<template>
  <Transition name="splash-fade">
    <div
      v-if="visible"
      class="splash-screen fixed inset-0 z-[999999] flex flex-col items-center justify-between select-none overflow-hidden"
      :class="isAppMode ? 'splash-screen--app' : ''"
      aria-label="Application Loading Splash Screen"
    >
      <!-- 背景光晕装饰层 -->
      <div class="absolute inset-0 bg-gradient-radial from-[#29594B]/70 via-[#1E3F35] to-[#122720] pointer-events-none"></div>
      
      <!-- 极浅中东几何金色纹理微光 -->
      <div class="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#C59D5F_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <!-- 顶栏留白占位 (移动端安全区) -->
      <div class="h-10 sm:h-16 w-full shrink-0"></div>

      <!-- 中心核心品牌区 (图标 + 平台标题) -->
      <div class="relative z-10 flex flex-col items-center px-6 text-center max-w-sm -mt-6">
        <!-- 官方徽标容器 (国徽麦穗配给卡徽标) -->
        <div class="relative mb-5 flex items-center justify-center">
          <!-- 环形金色呼吸外光晕 -->
          <div class="absolute -inset-4 rounded-full bg-[#C59D5F]/20 blur-xl animate-pulse"></div>

          <!-- 圆形白金背衬卡底，衬托国徽与麦穗细节 -->
          <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-white/95 p-3 shadow-2xl border-2 border-[#C59D5F]/40 flex items-center justify-center backdrop-blur-md transform transition-transform duration-700 animate-splash-pop">
            <img
              src="/logo.png"
              alt="Iraq Ration Card Management Logo"
              class="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
              draggable="false"
            />
          </div>
        </div>

        <!-- 阿拉伯文主标 -->
        <h1 class="text-2xl sm:text-3xl font-black text-[#F4E8D1] tracking-wide mb-1 drop-shadow-sm font-sans" dir="rtl">
          البطاقة التموينية
        </h1>

        <!-- 英文品牌名 -->
        <h2 class="text-sm sm:text-base font-bold text-white/90 tracking-wider uppercase mb-2">
          Ration Card Management
        </h2>

        <!-- 官方权威所属机构注记 -->
        <p class="text-[11px] sm:text-xs text-[#C59D5F] font-medium tracking-wide opacity-90 max-w-[280px]">
          جمهورية العراق · وزارة التجارة
        </p>
        <p class="text-[9px] text-[#A6C4BA] tracking-widest uppercase mt-0.5 font-mono">
          Republic of Iraq · Ministry of Trade
        </p>
      </div>

      <!-- 底部平滑加载指示区 -->
      <div class="relative z-10 w-full flex flex-col items-center pb-10 sm:pb-14 px-8">
        <!-- 金色流动加载进度条 -->
        <div class="w-40 sm:w-48 h-1 rounded-full bg-[#17332A] overflow-hidden mb-3 border border-[#C59D5F]/20">
          <div class="h-full bg-gradient-to-r from-[#8E703E] via-[#E2C38E] to-[#C59D5F] rounded-full animate-splash-progress"></div>
        </div>

        <!-- 极简系统初始化状态提示 -->
        <div class="flex items-center gap-2 text-[11px] text-[#9EB5AC] tracking-wider font-mono">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#C59D5F] animate-ping"></span>
          <span>System Initializing...</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  // 过渡展示持续时长（毫秒），默认 1100ms 保证视觉清晰且轻快
  duration: {
    type: Number,
    default: 1100
  },
  // 是否仅在 APP 移动端仿真视口内展现（若为 true 则在仿真手机壳内部居中）
  isAppMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['finish']);
const visible = ref(true);

onMounted(() => {
  // 冷启动过渡持续预定时间后平滑隐藏
  const timer = setTimeout(() => {
    visible.value = false;
    emit('finish');
  }, props.duration);

  return () => clearTimeout(timer);
});
</script>

<style scoped>
.splash-screen {
  background-color: #1E3F35;
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
  animation: splashProgress 1.05s ease-in-out forwards;
}
</style>
