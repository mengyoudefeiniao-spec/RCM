<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
    <!-- 全局顶部导航 -->
    <AppHeader />

    <!-- 主工作区 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-6 sm:py-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚备案与状态 -->
    <footer class="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span>伊拉克共和国贸易部食品配给署 · 国家数字配给卡综合服务平台</span>
          <span class="text-emerald-600 font-mono">● 企业级前后端规范化架构</span>
        </div>
        <div class="font-mono text-slate-400">
          © 2026 Republic of Iraq · Ministry of Trade · All Rights Reserved
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue';
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
