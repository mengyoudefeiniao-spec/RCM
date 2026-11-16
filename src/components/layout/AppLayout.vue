<template>
  <div
    class="app-shell flex flex-col font-sans text-[#1F3326]"
    :class="[
      isAppMode
        ? 'h-screen max-h-screen overflow-hidden bg-[#1B3123]/10 py-1 sm:py-2.5 justify-center items-center'
        : 'min-h-screen'
    ]"
  >
    <!-- 仿真视口容器：APP 模式下桌面端自动限制在浏览器窗口内 (自适应高度不超过 924px)，全量在 app 内下滑 -->
    <div
      class="w-full flex flex-col transition-all duration-300 relative min-h-0"
      :class="[
        isAppMode
          ? 'sm:w-[412px] sm:max-w-[412px] sm:mx-auto sm:bg-white sm:rounded-[28px] sm:shadow-2xl sm:overflow-hidden sm:border sm:border-[#E5CEA1]'
          : 'flex-1 w-full'
      ]"
      :style="isAppMode ? { height: 'min(924px, calc(100vh - 20px))', maxHeight: 'calc(100vh - 20px)' } : {}"
    >
      <!-- 1. 全局顶部导航 (固定在手机顶部) -->
      <AppHeader class="shrink-0" />

      <!-- 2. 主工作区：仅在 app 内下滑，完全不滚动外层浏览器 -->
      <main
        class="app-workspace flex-1 w-full mx-auto min-h-0 custom-pixel-scrollbar"
        :class="[
          isAppMode ? 'overflow-y-auto overflow-x-hidden px-0 py-0 pb-16' : '',
          !isAppMode
            ? (isWideLayout ? 'max-w-[1720px] px-0 sm:px-6 py-0 sm:py-6 pb-20 sm:pb-8' : 'max-w-7xl px-0 sm:px-6 py-0 sm:py-6 pb-20 sm:pb-8')
            : ''
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
        class="hidden sm:block border-t border-[#E5CEA1] bg-white py-3 text-center text-xs text-[#58685D]"
      >
        <div
          class="w-full mx-auto px-6 flex items-center justify-between gap-2"
          :class="isWideLayout ? 'max-w-[1720px]' : 'max-w-7xl'"
        >
          <div class="flex items-center gap-2">
            <span class="font-bold text-[#326445]">RCM</span>
            <span class="text-[#2F7A50] font-mono font-bold">● ONLINE</span>
          </div>
          <div class="font-mono text-[#8A9A8F] text-[11px]">
            © 2026 Republic of Iraq · Ministry of Trade · All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { useMyNotificationsStore } from '../../stores/myNotifications.js';
import AppHeader from './AppHeader.vue';
import AppMobileNav from './AppMobileNav.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const myNotifications = useMyNotificationsStore();
watch(() => authStore.currentRole, (role) => myNotifications.start(role), { immediate: true });
onBeforeUnmount(() => myNotifications.stop());

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
  return ['/admin', '/system-management', '/dashboard', '/cockpit', '/stats', '/warehouse', '/agent', '/complaint', '/review'].some(p => route.path.startsWith(p));
});
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
  background-color: rgba(50, 100, 69, 0.2);
  border-radius: 4px;
}
.custom-pixel-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
