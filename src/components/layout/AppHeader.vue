<template>
  <header class="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-40 w-full">
    <!-- 全宽顶栏：针对 Google Pixel 9 手机优化高度与右侧控件排列 -->
    <div class="w-full px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
      <!-- 左侧区域：Logo 固定在左上角，模块导航紧随其后靠左对齐 -->
      <div class="flex items-center gap-2 sm:gap-3 lg:gap-5 min-w-0">
        <!-- 平台标识与名称 (固定左上角) -->
        <div class="flex items-center gap-2 cursor-pointer shrink-0" @click="handleLogoClick">
          <!-- App 移动端模式：仅显示 Logo 方块图标，去除文字，节省宝贵视口宽度 -->
          <AppLogo size="sm" class="sm:hidden" />
          <!-- 桌面端模式：显示中号 Logo 方块图标 -->
          <AppLogo size="md" class="hidden sm:flex" />

          <!-- 文字排印：在 App 移动端隐藏，在桌面端正常展示 -->
          <div class="shrink-0 hidden sm:block">
            <div class="text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5">
              <span class="font-semibold">Ration Card Management</span>
              <el-tag size="small" effect="dark" type="primary" class="font-mono font-bold scale-90 origin-left">RCM</el-tag>
            </div>
            <div class="text-[9px] text-slate-400 font-mono">
              REPUBLIC OF IRAQ · MINISTRY OF TRADE
            </div>
          </div>
        </div>

        <!-- 分隔浅竖线 -->
        <div class="hidden xl:block h-5 w-px bg-slate-800 shrink-0"></div>

        <!-- 核心系统快捷导航 (桌面端) -->
        <nav class="hidden md:flex items-center gap-1 text-xs shrink-0">
          <!-- 1. 数据看板：配给代理或管理角色可见 -->
          <router-link
            v-if="canViewDashboard"
            to="/dashboard"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('nav.dashboard') }}</span>
          </router-link>

          <!-- 2. 公民服务：仅 Citizen 可见 -->
          <router-link
            v-if="authStore.currentRole === 'citizen'"
            to="/citizen"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/citizen') ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><User /></el-icon>
            <span>{{ $t('nav.citizen') }}</span>
          </router-link>

          <!-- 3. 审核工作台：仅 Admin 管理角色可见 -->
          <router-link
            v-if="authStore.isAdmin"
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

          <!-- 4. 投诉和处理：仅 Admin 管理角色可见 -->
          <router-link
            v-if="authStore.isAdmin"
            to="/complaint"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/complaint') ? 'bg-rose-600 text-white font-bold' : 'text-rose-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Service /></el-icon>
            <span>{{ $t('nav.complaint') }}</span>
          </router-link>

          <!-- 5. 配给管理 (公民与配给代理角色均显示为配给管理，管理角色显示为仓储管理) -->
          <router-link
            to="/warehouse"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/warehouse' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Box /></el-icon>
            <span>{{ (authStore.currentRole === 'citizen' || authStore.currentRole === 'agent') ? ($t('nav.rationMgmt') || '配给管理') : $t('nav.warehouse') }}</span>
          </router-link>

          <!-- 6. 代理管理：管理角色与 Agent 配给代理可见 -->
          <router-link
            v-if="authStore.isAdmin || authStore.currentRole === 'agent'"
            to="/agent"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/agent' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Shop /></el-icon>
            <span>{{ $t('nav.agent') }}</span>
          </router-link>

          <!-- 7. 后台管理：仅 Admin 管理角色可见 -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/admin') ? 'bg-indigo-600 text-white font-bold' : 'text-indigo-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Setting /></el-icon>
            <span>{{ $t('nav.admin') }}</span>
          </router-link>
        </nav>
      </div>

      <!-- 右侧区域：语言切换、用户信息与退出系统 (针对移动端自适应紧凑化) -->
      <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
        <!-- 国际化语言切换选择器 -->
        <LanguageSwitcher />

        <!-- 角色身份切换下拉 -->
        <el-dropdown trigger="click" @command="handleRoleCommand">
          <span class="flex items-center gap-1 text-[11px] sm:text-xs text-slate-300 hover:text-white cursor-pointer px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span class="w-2 h-2 rounded-full shrink-0" :class="roleDotColor"></span>
            <span class="whitespace-nowrap font-medium max-w-[72px] sm:max-w-none truncate">{{ roleLabel }}</span>
            <el-icon class="text-[10px]"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                {{ $t('roles.adminRoles') }}
              </div>
              <el-dropdown-item command="minister_center">
                <span class="font-bold text-indigo-600">● {{ $t('roles.ministerCenter') }}</span>
                <span class="text-[11px] text-slate-400 block ml-3">{{ $t('roles.ministerDuty') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="deputy_minister">
                <span class="font-bold text-rose-600">● {{ $t('roles.deputyMinister') }}</span>
                <span class="text-[11px] text-slate-400 block ml-3">{{ $t('roles.deputyDuty') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="director_planning">
                <span class="font-bold text-amber-600">● {{ $t('roles.directorPlanning') }}</span>
                <span class="text-[11px] text-slate-400 block ml-3">{{ $t('roles.directorDuty') }}</span>
              </el-dropdown-item>
              <div class="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-t border-b border-slate-100 mt-1">
                {{ $t('roles.businessRoles') }}
              </div>
              <el-dropdown-item command="citizen">
                <span class="text-blue-600">● {{ $t('roles.citizen') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="agent">
                <span class="text-emerald-600">● {{ $t('roles.agent') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 退出登录按钮 -->
        <el-tooltip :content="$t('nav.logout')" placement="bottom">
          <el-button circle size="small" type="danger" plain class="scale-90 sm:scale-100" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 移动端底部原生级导航栏 (适配 Google Pixel 9 412x924px 视口与 Android 底部手势栏) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 py-1 flex items-center justify-around safe-area-bottom shadow-2xl">
      <!-- 1. 看板 (代理与管理可见) -->
      <router-link
        v-if="canViewDashboard"
        to="/dashboard"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl text-[10px] min-w-[46px] transition-all"
        :class="$route.path === '/dashboard' ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-slate-400 active:scale-95'"
      >
        <el-icon :size="19"><DataAnalysis /></el-icon>
        <span>看板</span>
      </router-link>

      <!-- 2. 公民 (仅公民可见) -->
      <router-link
        v-if="authStore.currentRole === 'citizen'"
        to="/citizen"
        class="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] min-w-[46px] transition-all"
        :class="$route.path.startsWith('/citizen') ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-slate-400 active:scale-95'"
      >
        <el-icon :size="19"><User /></el-icon>
        <span>公民</span>
      </router-link>

      <!-- 3. 审核 (仅管理可见) -->
      <router-link
        v-if="authStore.isAdmin"
        to="/review"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl text-[10px] min-w-[46px] relative transition-all"
        :class="$route.path === '/review' ? 'text-amber-400 font-bold bg-amber-950/60' : 'text-slate-400 active:scale-95'"
      >
        <el-icon :size="19"><Stamp /></el-icon>
        <span>审核</span>
        <span v-if="pendingReviewCount > 0" class="absolute 0 top-0.5 right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center font-bold">{{ pendingReviewCount }}</span>
      </router-link>

      <!-- 4. 投诉 (仅管理可见) -->
      <router-link
        v-if="authStore.isAdmin"
        to="/complaint"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl text-[10px] min-w-[46px] transition-all"
        :class="$route.path.startsWith('/complaint') ? 'text-rose-400 font-bold bg-rose-950/60' : 'text-slate-400 active:scale-95'"
      >
        <el-icon :size="19"><Service /></el-icon>
        <span>投诉</span>
      </router-link>

      <!-- 5. 配给/仓储 (公民与代理均显示为配给) -->
      <router-link
        to="/warehouse"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl text-[10px] min-w-[46px] transition-all"
        :class="$route.path === '/warehouse' ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-slate-400 active:scale-95'"
      >
        <el-icon :size="19"><Box /></el-icon>
        <span>{{ (authStore.currentRole === 'citizen' || authStore.currentRole === 'agent') ? '配给' : '仓储' }}</span>
      </router-link>

      <!-- 6. 代理 (管理与代理可见) -->
      <router-link
        v-if="authStore.isAdmin || authStore.currentRole === 'agent'"
        to="/agent"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl text-[10px] min-w-[46px] transition-all"
        :class="$route.path === '/agent' ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-slate-400 active:scale-95'"
      >
        <el-icon :size="19"><Shop /></el-icon>
        <span>代理</span>
      </router-link>

      <!-- 7. 后台管理 (仅管理可见) -->
      <router-link
        v-if="authStore.isAdmin"
        to="/admin"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl text-[10px] min-w-[46px] transition-all"
        :class="$route.path.startsWith('/admin') ? 'text-indigo-400 font-bold bg-indigo-950/60' : 'text-slate-400 active:scale-95'"
      >
        <el-icon :size="19"><Setting /></el-icon>
        <span>管理</span>
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.js';
import { useReviewStore } from '../../stores/review.js';
import { getDefaultPathByRole } from '../../router/index.js';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';
import AppLogo from '../common/AppLogo.vue';
import {
  DataAnalysis,
  User,
  Stamp,
  Box,
  Shop,
  Setting,
  ArrowDown,
  SwitchButton,
  Service
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();
const reviewStore = useReviewStore();

onMounted(() => {
  if (authStore.isAdmin) {
    reviewStore.fetchTickets('全部');
  }
});

const pendingReviewCount = computed(() => {
  return reviewStore.tickets.filter((t) => t.status.includes('待')).length;
});

// 数据看板仅限配给代理或者任意管理角色可见
const canViewDashboard = computed(() => {
  return authStore.isAdmin || authStore.currentRole === 'agent';
});

const roleLabel = computed(() => {
  switch (authStore.currentRole) {
    case 'minister_center':
      return t('roles.ministerCenter');
    case 'deputy_minister':
      return t('roles.deputyMinister');
    case 'directorPlanning':
    case 'director_planning':
      return t('roles.directorPlanning');
    case 'admin':
      return t('roles.admin');
    case 'citizen':
      return t('roles.citizen');
    case 'agent':
      return t('roles.agent');
    default:
      return t('roles.user');
  }
});

const roleDotColor = computed(() => {
  switch (authStore.currentRole) {
    case 'minister_center':
      return 'bg-indigo-400';
    case 'deputy_minister':
      return 'bg-rose-400';
    case 'director_planning':
      return 'bg-amber-400';
    case 'admin':
      return 'bg-purple-400';
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
  // 管理员角色自动继承 admin 权限
  if (roles.includes('admin') && authStore.isAdmin) {
    return true;
  }
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

async function handleLogout() {
  await authStore.logout();
  await router.replace('/login');
}
</script>

<style scoped>
/* 移动端底部导航安全区适配 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 8px);
}
</style>
