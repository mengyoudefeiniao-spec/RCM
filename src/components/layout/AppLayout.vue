<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
    <!-- 全局顶部导航 -->
    <AppHeader />

    <!-- 主工作区：针对 Google Pixel 9 (412x924px) 优化，底部留出 76px+ 安全距离防止被固定底栏遮挡 -->
    <main
      class="flex-1 w-full mx-auto px-3 pt-3 pb-24 sm:px-6 sm:py-6 transition-all duration-300"
      :class="isWideLayout ? 'max-w-[1720px]' : 'max-w-7xl'"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚备案与状态 (移动端精简紧凑) -->
    <footer class="border-t border-slate-200 bg-white py-2 sm:py-3 text-center text-[10px] sm:text-xs text-slate-500 pb-20 sm:pb-3">
      <div
        class="w-full mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5"
        :class="isWideLayout ? 'max-w-[1720px]' : 'max-w-7xl'"
      >
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-700">Ration Card Management (RCM)</span>
          <span class="text-emerald-600 font-mono font-bold">● ONLINE</span>
        </div>
        <div class="font-mono text-slate-400 text-[10px]">
          © 2026 Republic of Iraq · Ministry of Trade · All Rights Reserved
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './AppHeader.vue';

const route = useRoute();
const isWideLayout = computed(() => {
  return ['/admin', '/dashboard', '/warehouse', '/agent', '/complaint', '/review'].some(p => route.path.startsWith(p));
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
</style>
