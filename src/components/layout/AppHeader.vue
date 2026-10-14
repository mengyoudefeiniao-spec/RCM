<template>
  <header class="bg-[#1E3F35] text-white border-b border-[#295447] shadow-md sticky top-0 z-40 w-full">
    <!-- 全宽顶栏：针对 Google Pixel 9 手机优化高度与右侧控件排列 -->
    <div class="w-full px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
      <!-- 左侧区域：Logo 固定在左上角，模块导航紧随其后靠左对齐 -->
      <div class="flex items-center gap-2 sm:gap-3 lg:gap-5 min-w-0">
        <!-- 平台标识与名称 (固定左上角，APP 视口内禁用点击跳转) -->
        <div
          class="flex items-center gap-2.5 shrink-0"
          :class="isAppMode ? 'cursor-default select-none' : 'cursor-pointer'"
          @click="handleLogoClick"
        >
          <!-- App 移动端模式：仅显示 Logo 方块图标，去除文字，节省宝贵视口宽度 -->
          <AppLogo size="sm" class="sm:hidden" />
          <!-- 桌面端模式：显示中号 Logo 方块图标 -->
          <AppLogo size="md" class="hidden sm:flex" />

          <!-- 文字排印：在 App 移动端或 APP 仿真模式下隐藏，桌面 Web 端显示 RCM 标识 -->
          <div v-if="!isAppMode" class="shrink-0 hidden sm:block">
            <div class="text-xs sm:text-sm font-black tracking-wider flex items-center gap-1.5 text-white">
              <span>RCM</span>
            </div>
            <div class="text-[9px] text-[#C59D5F] font-mono tracking-wider font-semibold">
              REPUBLIC OF IRAQ · MINISTRY OF TRADE
            </div>
          </div>
        </div>

        <!-- 分隔浅竖线 -->
        <div v-if="!isAppMode" class="hidden xl:block h-5 w-px bg-[#2E5E50] shrink-0"></div>

        <!-- 核心系统快捷导航 (桌面端且非 APP 模式) -->
        <nav v-if="!isAppMode" class="hidden md:flex items-center gap-1 text-xs shrink-0">
          <!-- 1. 数据看板：配给代理或管理角色可见 -->
          <router-link
            v-if="canViewDashboard"
            to="/dashboard"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/dashboard' ? 'bg-[#C59D5F] text-[#1E3F35] font-bold shadow-xs' : 'text-[#DFE8E3] hover:text-white hover:bg-[#285246]'"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('nav.dashboard') }}</span>
          </router-link>

          <!-- 2. 公民服务：仅 Citizen 可见 -->
          <router-link
            v-if="authStore.currentRole === 'citizen'"
            to="/citizen"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/citizen') ? 'bg-[#C59D5F] text-[#1E3F35] font-bold shadow-xs' : 'text-[#DFE8E3] hover:text-white hover:bg-[#285246]'"
          >
            <el-icon><User /></el-icon>
            <span>{{ $t('nav.citizen') }}</span>
          </router-link>

          <!-- 3. 审核工作台：仅 Admin 管理角色可见 -->
          <router-link
            v-if="authStore.isAdmin"
            to="/review"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/review' ? 'bg-[#C59D5F] text-[#1E3F35] font-bold shadow-xs' : 'text-[#DFE8E3] hover:text-white hover:bg-[#285246]'"
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
            :class="$route.path.startsWith('/complaint') ? 'bg-[#C59D5F] text-[#1E3F35] font-bold shadow-xs' : 'text-[#DFE8E3] hover:text-white hover:bg-[#285246]'"
          >
            <el-icon><Service /></el-icon>
            <span>{{ $t('nav.complaint') }}</span>
          </router-link>

          <!-- 5. 配给管理 (统一显示为配给管理) -->
          <router-link
            to="/warehouse"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/warehouse' ? 'bg-[#C59D5F] text-[#1E3F35] font-bold shadow-xs' : 'text-[#DFE8E3] hover:text-white hover:bg-[#285246]'"
          >
            <el-icon><Box /></el-icon>
            <span>{{ $t('nav.rationMgmt') || '配给管理' }}</span>
          </router-link>

          <!-- 6. 代理管理：管理角色与 Agent 配给代理可见 -->
          <router-link
            v-if="authStore.isAdmin || authStore.currentRole === 'agent'"
            to="/agent"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/agent' ? 'bg-[#C59D5F] text-[#1E3F35] font-bold shadow-xs' : 'text-[#DFE8E3] hover:text-white hover:bg-[#285246]'"
          >
            <el-icon><Shop /></el-icon>
            <span>{{ $t('nav.agent') }}</span>
          </router-link>

          <!-- 7. 后台管理：仅 Admin 管理角色可见 -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/admin') ? 'bg-[#C59D5F] text-[#1E3F35] font-bold shadow-xs' : 'text-[#DFE8E3] hover:text-white hover:bg-[#285246]'"
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

        <!-- 角色身份切换下拉 (公民app和代理app视口内彻底隐藏) -->
        <el-dropdown v-if="!isAppMode" trigger="click" @command="handleRoleCommand">
          <!-- 桌面端普通模式：显示小圆点、角色名称与下拉箭头 -->
          <span
            class="hidden sm:flex items-center gap-1 text-xs text-[#DFE8E3] hover:text-white cursor-pointer px-2.5 py-1.5 rounded-lg bg-[#16332B] border border-[#295447]"
          >
            <span class="w-2 h-2 rounded-full shrink-0" :class="roleDotColor"></span>
            <span class="whitespace-nowrap font-medium">{{ roleLabel }}</span>
            <el-icon class="text-[10px]"><ArrowDown /></el-icon>
          </span>

          <!-- 移动端非APP小屏：简化为一个精巧图标按钮 (带身份指示光点) -->
          <button
            type="button"
            class="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#16332B] border border-[#295447] text-[#DFE8E3] hover:text-white active:scale-95 transition-all relative cursor-pointer"
            :title="roleLabel"
          >
            <el-icon :size="15"><UserFilled /></el-icon>
            <!-- 角色小圆点徽标 -->
            <span class="absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-[#16332B]" :class="roleDotColor"></span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                {{ $t('roles.adminRoles') }}
              </div>
              <el-dropdown-item command="minister_center">
                <span class="font-bold text-[#1E3F35]">● {{ $t('roles.ministerCenter') }}</span>
                <span class="text-[11px] text-slate-400 block ml-3">{{ $t('roles.ministerDuty') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="deputy_minister">
                <span class="font-bold text-[#D34545]">● {{ $t('roles.deputyMinister') }}</span>
                <span class="text-[11px] text-slate-400 block ml-3">{{ $t('roles.deputyDuty') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="director_planning">
                <span class="font-bold text-[#C59D5F]">● {{ $t('roles.directorPlanning') }}</span>
                <span class="text-[11px] text-slate-400 block ml-3">{{ $t('roles.directorDuty') }}</span>
              </el-dropdown-item>
              <div class="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-t border-b border-slate-100 mt-1">
                {{ $t('roles.businessRoles') }}
              </div>
              <el-dropdown-item command="citizen">
                <span class="text-[#2C6E49]">● {{ $t('roles.citizen') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="agent">
                <span class="text-[#1E3F35] font-bold">● {{ $t('roles.agent') }}</span>
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
  UserFilled,
  Stamp,
  Box,
  Shop,
  Setting,
  ArrowDown,
  SwitchButton,
  Service,
  Compass,
  ShoppingCart,
  Van,
  FullScreen
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();
const reviewStore = useReviewStore();

const isAppMode = computed(() => {
  if (route.query.layout === 'app' || route.query.mode === 'mobile') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

function getNavTarget(path) {
  if (isAppMode.value) {
    return { path, query: { layout: 'app' } };
  }
  return path;
}

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
  if (isAppMode.value) return; // APP 视口内 logo 禁用点击
  const defaultPath = getDefaultPathByRole(authStore.currentRole);
  router.push(defaultPath);
}

function handleRoleCommand(role) {
  authStore.switchRole(role);
  const targetPath = getDefaultPathByRole(role);
  router.push(targetPath);
}

async function handleLogout() {
  const wasAppMode = isAppMode.value;
  await authStore.logout();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('rcm_auth_token');
    localStorage.removeItem('rcm_user_profile');
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('rcm_auth_token');
    sessionStorage.removeItem('rcm_user_profile');
  }
  if (wasAppMode) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('rcm_layout_mode', 'app');
    await router.replace({ path: '/login', query: { layout: 'app' } });
  } else {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('rcm_layout_mode');
    await router.replace('/login');
  }
}
</script>

<style scoped>
/* 移动端底部导航安全区适配 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 8px);
}
</style>
