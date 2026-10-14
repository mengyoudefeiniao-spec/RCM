<template>
  <div
    class="bg-[#F8F7F3] flex flex-col font-sans text-slate-800"
    :class="[
      isAppMode && !forceFullWidth
        ? 'h-screen max-h-screen overflow-hidden bg-slate-900/10 py-1 sm:py-2.5 justify-center items-center'
        : 'min-h-screen'
    ]"
  >
    <!-- 当在大屏幕以 APP 模式打开时，顶部提供轻量 Pixel 9 仿真视口控制条 -->
    <div
      v-if="isAppMode && !forceFullWidth"
      class="hidden sm:flex max-w-[412px] mx-auto w-full items-center justify-between px-3 py-1 mb-1.5 bg-[#1E3F35] text-white rounded-lg text-xs shadow-md select-none shrink-0"
    >
      <div class="flex items-center gap-1.5 font-medium">
        <span class="w-2 h-2 rounded-full bg-[#C59D5F] animate-pulse"></span>
        <span>Google Pixel 9 (412 × 924) 移动 APP 视口</span>
      </div>
      <button
        type="button"
        class="text-[11px] text-[#C59D5F] hover:text-white underline cursor-pointer"
        @click="toggleFullWidth"
      >
        {{ forceFullWidth ? '恢复 412px' : '展开全宽' }}
      </button>
    </div>

    <!-- 仿真视口容器：APP 模式下桌面端自动限制在浏览器窗口内 (自适应高度不超过 924px)，全量在 app 内下滑 -->
    <div
      class="w-full flex flex-col transition-all duration-300 relative min-h-0"
      :class="[
        isAppMode && !forceFullWidth
          ? 'sm:w-[412px] sm:max-w-[412px] sm:mx-auto sm:bg-white sm:rounded-[28px] sm:shadow-2xl sm:overflow-hidden sm:border sm:border-[#ECE7DE]'
          : 'flex-1 w-full'
      ]"
      :style="isAppMode && !forceFullWidth ? { height: 'min(924px, calc(100vh - 46px))', maxHeight: 'calc(100vh - 46px)' } : {}"
    >
      <!-- 1. 全局顶部导航 (固定在手机顶部) -->
      <AppHeader class="shrink-0" />

      <!-- 2. 主工作区：仅在 app 内下滑，完全不滚动外层浏览器 -->
      <main
        class="flex-1 w-full mx-auto overflow-y-auto overflow-x-hidden min-h-0 custom-pixel-scrollbar"
        :class="[
          isAppMode
            ? 'px-0 py-0 pb-2'
            : (isWideLayout ? 'max-w-[1720px] px-0 sm:px-6 py-0 sm:py-6 pb-20 sm:pb-8' : 'max-w-7xl px-0 sm:px-6 py-0 sm:py-6 pb-20 sm:pb-8')
        ]"
      >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- 3. 最底部操作模块栏 (永远稳固在 APP 视口最下方) -->
      <AppMobileNav class="shrink-0" />

      <!-- 页脚备案与状态 (仅在桌面端且非 APP 模式下显示) -->
      <footer
        v-if="!isAppMode"
        class="hidden sm:block border-t border-[#ECE7DE] bg-white py-3 text-center text-xs text-[#5E6862]"
      >
        <div
          class="w-full mx-auto px-6 flex items-center justify-between gap-2"
          :class="isWideLayout ? 'max-w-[1720px]' : 'max-w-7xl'"
        >
          <div class="flex items-center gap-2">
            <span class="font-bold text-[#1E3F35]">RCM</span>
            <span class="text-[#2C6E49] font-mono font-bold">● ONLINE</span>
          </div>
          <div class="font-mono text-[#8C958F] text-[11px]">
            © 2026 Republic of Iraq · Ministry of Trade · All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from './AppHeader.vue';
import AppMobileNav from './AppMobileNav.vue';

const route = useRoute();
const router = useRouter();

const forceFullWidth = ref(false);

const isAppMode = computed(() => {
  if (route.query.layout === 'app') {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('rcm_layout_mode', 'app');
    return true;
  }
  if (route.query.layout === 'web') {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('rcm_layout_mode', 'web');
    return false;
  }
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

const isWideLayout = computed(() => {
  return ['/admin', '/dashboard', '/warehouse', '/agent', '/complaint', '/review'].some(p => route.path.startsWith(p));
});

function toggleFullWidth() {
  forceFullWidth.value = !forceFullWidth.value;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-pixel-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-pixel-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(30, 63, 53, 0.2);
  border-radius: 4px;
}
.custom-pixel-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
