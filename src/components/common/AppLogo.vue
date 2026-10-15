<template>
  <div class="app-logo flex items-center select-none" :class="[gapClass, inline ? 'inline-flex' : 'flex']">
    <!-- 官方核心 Logo 徽标 (用户上传伊拉克配给卡国徽麦穗图徽) -->
    <div
      class="logo-icon relative shrink-0 transition-transform duration-300 hover:scale-105 flex items-center justify-center"
      :style="{ width: `${sizePx}px`, height: `${sizePx}px` }"
    >
      <!-- 高清徽标图片容器，自适应大小并带有精致光影 -->
      <div
        class="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-white/95 shadow-xs border border-[#C59D5F]/30"
        :class="isDark ? 'ring-1 ring-[#C59D5F]/40' : 'ring-1 ring-slate-200/80'"
      >
        <img
          src="/logo.png"
          alt="Ration Card Management Logo"
          class="w-full h-full object-contain p-0.5 select-none pointer-events-none"
          draggable="false"
        />
      </div>
    </div>

    <!-- 文字排印区域：全称与缩写不并存，仅呈现品牌名称 -->
    <div v-if="showText" class="logo-text shrink-0" :class="textWrapperClass">
      <div class="flex items-center gap-1.5 leading-none">
        <span
          class="font-black tracking-tight"
          :class="[titleClass, isDark ? 'text-white' : 'text-[#1E3F35]']"
        >
          {{ brandTitle || 'RCM' }}
        </span>
      </div>
      <div
        v-if="showSubtitle"
        class="text-[9px] font-mono tracking-widest mt-1 opacity-85"
        :class="isDark ? 'text-[#C59D5F]' : 'text-[#8C958F]'"
      >
        {{ subtitleText || 'REPUBLIC OF IRAQ · MINISTRY OF TRADE' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: [String, Number],
    default: 'md' // 'sm'(32), 'md'(38), 'lg'(52), 'xl'(64) 或直接数字像素
  },
  showText: {
    type: Boolean,
    default: false
  },
  showBadge: {
    type: Boolean,
    default: true
  },
  showSubtitle: {
    type: Boolean,
    default: true
  },
  subtitleText: {
    type: String,
    default: ''
  },
  brandTitle: {
    type: String,
    default: 'RCM'
  },
  theme: {
    type: String,
    default: 'dark' // 'dark' | 'light'
  },
  inline: {
    type: Boolean,
    default: false
  }
});

const isDark = computed(() => props.theme === 'dark');

const sizePx = computed(() => {
  if (typeof props.size === 'number') return props.size;
  switch (props.size) {
    case 'xs': return 26;
    case 'sm': return 32;
    case 'md': return 38;
    case 'lg': return 56;
    case 'xl': return 72;
    default: return parseInt(props.size) || 38;
  }
});

const gapClass = computed(() => {
  if (sizePx.value <= 32) return 'gap-2';
  if (sizePx.value <= 40) return 'gap-2.5';
  return 'gap-3.5';
});

const titleClass = computed(() => {
  if (sizePx.value <= 32) return 'text-xs sm:text-sm';
  if (sizePx.value <= 40) return 'text-sm sm:text-base';
  if (sizePx.value <= 52) return 'text-base sm:text-lg';
  return 'text-lg sm:text-xl';
});

const textWrapperClass = computed(() => {
  return '';
});
</script>

<style scoped>
.app-logo {
  transition: opacity 0.2s ease;
}
</style>
