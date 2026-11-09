<template>
  <el-config-provider :locale="elementLocale">
    <!-- 全局冷启动过渡闪屏：在应用初次加载时展示官方徽标与中东政务绿主题背景，短暂过渡后优雅淡出 -->
    <SplashScreen
      v-if="showColdStartSplash"
      :duration="1200"
      @finish="handleSplashFinish"
    />

    <router-view />
    <!-- 智能助手仅在登录后的业务页面显示 -->
    <FloatingCustomerService v-if="authStore.isAuthenticated && isAssistantPage" />

    <!-- 全局演示引导遮罩：提供非侵入式聚焦高亮与可操作/不可操作区域拦截 -->
    <DemoSpotlightOverlay />
  </el-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElConfigProvider } from 'element-plus';
import { elementLocale } from './locales/index.js';
import FloatingCustomerService from './components/chat/FloatingCustomerService.vue';
import SplashScreen from './components/common/SplashScreen.vue';
import DemoSpotlightOverlay from './components/common/DemoSpotlightOverlay.vue';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();
const route = useRoute();

// 控制冷启动过渡页的显示与隐藏
const showColdStartSplash = ref(true);

function handleSplashFinish() {
  showColdStartSplash.value = false;
}

const isAssistantPage = computed(() => {
  // 现场技术验证页为独立采集界面，不叠加业务助手入口
  return route.path !== '/portal' && route.path !== '/login' && route.path !== '/verify';
});
</script>
