<template>
  <div class="app-logo flex items-center select-none" :class="[gapClass, inline ? 'inline-flex' : 'flex']">
    <!-- SVG 核心 Logo 图标 -->
    <div
      class="logo-icon relative shrink-0 transition-transform duration-300 hover:scale-105"
      :style="{ width: `${sizePx}px`, height: `${sizePx}px` }"
    >
      <svg
        viewBox="0 0 48 48"
        class="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient :id="`rcmGrad-${uniqueId}`" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="50%" stop-color="#1d4ed8" />
            <stop offset="100%" stop-color="#4338ca" />
          </linearGradient>
        </defs>

        <!-- 外层圆角卡片底座 (保留 RCM 背景框以及底色) -->
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12"
          :fill="`url(#rcmGrad-${uniqueId})`"
          stroke="#93c5fd"
          stroke-width="1.2"
          stroke-opacity="0.35"
        />

        <!-- 纯粹的核心 RCM 字母造型，完美居中 -->
        <text
          x="24"
          y="24"
          text-anchor="middle"
          dominant-baseline="central"
          fill="#ffffff"
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          font-weight="900"
          font-size="14.5"
          letter-spacing="1"
        >
          RCM
        </text>
      </svg>
    </div>

    <!-- 文字排印区域 -->
    <div v-if="showText" class="logo-text shrink-0" :class="textWrapperClass">
      <div class="flex items-center gap-1.5 leading-none">
        <span
          class="font-black tracking-tight"
          :class="[titleClass, isDark ? 'text-white' : 'text-slate-900']"
        >
          Ration Card Management
        </span>
        <span
          v-if="showBadge"
          class="px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase shadow-2xs tracking-wider"
          :class="isDark ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30' : 'bg-blue-100 text-blue-700 border border-blue-200'"
        >
          RCM
        </span>
      </div>
      <div
        v-if="showSubtitle"
        class="text-[9px] font-mono tracking-widest mt-1 opacity-80"
        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
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
    default: 'md' // 'sm'(32), 'md'(38), 'lg'(48), 'xl'(60) 或直接数字像素
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
  theme: {
    type: String,
    default: 'dark' // 'dark' | 'light'
  },
  inline: {
    type: Boolean,
    default: false
  }
});

const uniqueId = Math.random().toString(36).substring(2, 9);
const isDark = computed(() => props.theme === 'dark');

const sizePx = computed(() => {
  if (typeof props.size === 'number') return props.size;
  switch (props.size) {
    case 'sm': return 32;
    case 'md': return 38;
    case 'lg': return 52;
    case 'xl': return 64;
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
