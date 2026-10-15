<template>
  <el-config-provider :locale="elementLocale">
    <!-- 全局冷启动过渡闪屏：在应用初次加载时展示官方徽标与中东政务绿主题背景，短暂过渡后优雅淡出 -->
    <SplashScreen
      v-if="showColdStartSplash"
      :duration="1200"
      @finish="handleSplashFinish"
    />

    <router-view />
    <!-- 全局智能客服助手：严格限制必须拥有用户 Token 鉴权认证通过方可显示与使用；在 portal 调度门户页面禁止使用智能客服 -->
    <FloatingCustomerService v-if="authStore.isAuthenticated && isNotPortalPage" />
  </el-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElConfigProvider } from 'element-plus';
import { elementLocale } from './locales/index.js';
import FloatingCustomerService from './components/chat/FloatingCustomerService.vue';
import SplashScreen from './components/common/SplashScreen.vue';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();
const route = useRoute();

// 控制冷启动过渡页的显示与隐藏
const showColdStartSplash = ref(true);

function handleSplashFinish() {
  showColdStartSplash.value = false;
}

// portal 页面不允许使用智能客服
const isNotPortalPage = computed(() => {
  return route.path !== '/portal';
});
</script>
