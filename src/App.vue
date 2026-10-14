<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
    <!-- 全局智能客服助手：严格限制必须拥有用户 Token 鉴权认证通过方可显示与使用；在 portal 调度门户页面禁止使用智能客服 -->
    <FloatingCustomerService v-if="authStore.isAuthenticated && isNotPortalPage" />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElConfigProvider } from 'element-plus';
import { elementLocale } from './locales/index.js';
import FloatingCustomerService from './components/chat/FloatingCustomerService.vue';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();
const route = useRoute();

// portal 页面不允许使用智能客服
const isNotPortalPage = computed(() => {
  return route.path !== '/portal';
});
</script>
