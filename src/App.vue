<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
    <!-- 全局智能客服助手：严格限制必须拥有用户 Token 鉴权认证通过方可显示与使用；未登录/退出后完全隐藏 -->
    <FloatingCustomerService v-if="authStore.isAuthenticated" />
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus';
import { elementLocale } from './locales/index.js';
import FloatingCustomerService from './components/chat/FloatingCustomerService.vue';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();
</script>
