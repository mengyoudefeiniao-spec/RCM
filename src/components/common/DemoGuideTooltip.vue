<template>
  <div
    class="demo-guide-tooltip inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white shadow-xl border select-none transition-all duration-300 z-50 pointer-events-auto"
    :class="[
      positionClass,
      customClass || 'bg-[#1E3F35] border-[#C59D5F] text-xs'
    ]"
    style="box-shadow: 0 10px 30px -4px rgba(15, 35, 29, 0.45);"
  >
    <!-- 指示手势小图标 (带轻微呼吸跳动动效) -->
    <div class="w-6 h-6 rounded-lg bg-[#C59D5F] text-[#1E3F35] flex items-center justify-center shrink-0 font-black text-sm shadow-inner animate-bounce">
      👉
    </div>

    <!-- 文本说明区 -->
    <div class="flex-1 min-w-0 pr-1">
      <div v-if="stepBadge" class="text-[10px] font-mono font-bold text-[#E8D9BF] tracking-wider uppercase">
        {{ stepBadge }}
      </div>
      <div class="font-bold text-[11px] sm:text-xs text-[#FAF7F2] leading-snug">
        <slot>{{ text }}</slot>
      </div>
    </div>

    <!-- 可选退出演示按钮 -->
    <button
      v-if="allowExit"
      type="button"
      class="text-[#C59D5F] hover:text-white transition-colors text-[10px] px-1.5 py-0.5 rounded border border-[#C59D5F]/40 hover:bg-[#C59D5F]/20 cursor-pointer shrink-0"
      @click.stop="$emit('exit')"
    >
      退出
    </button>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  stepBadge: {
    type: String,
    default: ''
  },
  positionClass: {
    type: String,
    default: 'relative'
  },
  customClass: {
    type: String,
    default: ''
  },
  allowExit: {
    type: Boolean,
    default: false
  }
});

defineEmits(['exit']);
</script>

<style scoped>
.demo-guide-tooltip {
  animation: guideFadeSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes guideFadeSlide {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
