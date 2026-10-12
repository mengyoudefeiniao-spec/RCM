<template>
  <header class="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-40 w-full">
    <!-- 全宽顶栏：Logo贴左上角，模块紧贴左侧靠齐，操作栏固定右上角，彻底移除横向滚动条 -->
    <div class="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
      <!-- 左侧区域：Logo 固定在左上角，模块导航紧随其后靠左对齐 -->
      <div class="flex items-center gap-3 lg:gap-5 min-w-0">
        <!-- 平台标识与名称 (固定左上角) -->
        <div class="flex items-center gap-2.5 cursor-pointer shrink-0" @click="handleLogoClick">
          <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            RC
          </div>
          <div class="shrink-0">
            <div class="text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5">
              <span>国家数字配给卡平台</span>
              <el-tag size="small" effect="dark" type="primary" class="font-mono scale-90 origin-left">RCM-V2</el-tag>
            </div>
            <div class="text-[9px] text-slate-400 font-mono hidden sm:block">
              REPUBLIC OF IRAQ · MINISTRY OF TRADE
            </div>
          </div>
        </div>

        <!-- 分隔浅竖线 -->
        <div class="hidden xl:block h-5 w-px bg-slate-800 shrink-0"></div>

        <!-- 核心系统快捷导航 (动态往左侧靠齐，不产生任何滚动条) -->
        <nav class="hidden md:flex items-center gap-1 text-xs shrink-0">
          <!-- 1. 数据看板：Admin 与 Agent 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'agent'])"
            to="/dashboard"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('nav.dashboard') }}</span>
          </router-link>

          <!-- 2. 公民服务：Admin 与 Citizen 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'citizen'])"
            to="/citizen"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/citizen') ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><User /></el-icon>
            <span>{{ $t('nav.citizen') }}</span>
          </router-link>

          <!-- 3. 审核工作台：仅 Admin 可见 -->
          <router-link
            v-if="hasAccess(['admin'])"
            to="/review"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/review' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Stamp /></el-icon>
            <span>{{ $t('nav.review') }}</span>
            <span v-if="pendingReviewCount > 0" class="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {{ pendingReviewCount }}
            </span>
          </router-link>

          <!-- 4. 仓储管理：Admin 与 Agent 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'agent'])"
            to="/warehouse"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/warehouse' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Box /></el-icon>
            <span>{{ $t('nav.warehouse') }}</span>
          </router-link>

          <!-- 5. 代理管理：Admin 与 Agent 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'agent'])"
            to="/agent"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/agent' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Shop /></el-icon>
            <span>{{ $t('nav.agent') }}</span>
          </router-link>

          <!-- 6. 后台管理：仅 Admin 监督官可见 -->
          <router-link
            v-if="hasAccess(['admin'])"
            to="/admin"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/admin') ? 'bg-indigo-600 text-white font-bold' : 'text-indigo-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Setting /></el-icon>
            <span>{{ $t('nav.admin') }}</span>
          </router-link>
        </nav>
      </div>

      <!-- 右侧区域：语言切换、用户信息与退出系统 (固定右上角) -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <!-- 国际化语言切换选择器 (4种语言) -->
        <LanguageSwitcher />

        <!-- 角色身份切换下拉 -->
        <el-dropdown trigger="click" @command="handleRoleCommand">
          <span class="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
            <span class="w-2 h-2 rounded-full" :class="roleDotColor"></span>
            <span class="whitespace-nowrap">{{ roleLabel }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="admin">切换为：国家督察官 (Admin)</el-dropdown-item>
              <el-dropdown-item command="citizen">切换为：配给卡公民 (Citizen)</el-dropdown-item>
              <el-dropdown-item command="agent">切换为：配给代理网点 (Agent)</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 退出登录按钮 -->
        <el-button size="small" type="danger" plain @click="handleLogout" class="whitespace-nowrap">
          <el-icon class="mr-1"><SwitchButton /></el-icon>
          {{ $t('nav.logout') }}
        </el-button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { useReviewStore } from '../../stores/review.js';
import { getDefaultPathByRole } from '../../router/index.js';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';
import {
  DataAnalysis,
  User,
  Stamp,
  Box,
  Shop,
  Setting,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const reviewStore = useReviewStore();

onMounted(() => {
  if (authStore.currentRole === 'admin') {
    reviewStore.fetchTickets('全部');
  }
});

const pendingReviewCount = computed(() => {
  return reviewStore.tickets.filter((t) => t.status.includes('待')).length;
});

const roleLabel = computed(() => {
  switch (authStore.currentRole) {
    case 'admin':
      return '国家督察官';
    case 'citizen':
      return '持卡公民';
    case 'agent':
      return '配给代理';
    default:
      return '访客';
  }
});

const roleDotColor = computed(() => {
  switch (authStore.currentRole) {
    case 'admin':
      return 'bg-amber-400';
    case 'citizen':
      return 'bg-blue-400';
    case 'agent':
      return 'bg-emerald-400';
    default:
      return 'bg-slate-400';
  }
});

function hasAccess(roles) {
  if (!roles || roles.length === 0) return true;
  return roles.includes(authStore.currentRole);
}

function handleLogoClick() {
  const defaultPath = getDefaultPathByRole(authStore.currentRole);
  router.push(defaultPath);
}

function handleRoleCommand(role) {
  authStore.switchRole(role);
  const targetPath = getDefaultPathByRole(role);
  router.push(targetPath);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
