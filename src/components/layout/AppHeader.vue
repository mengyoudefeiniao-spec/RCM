<template>
  <header class="app-header bg-white text-[#1F3326] border-b border-[#E5CEA1] shadow-[0_3px_18px_-6px_rgba(58,77,62,0.12)] sticky top-0 z-40 w-full">
    <!-- 全宽顶栏：针对 Google Pixel 9 手机优化高度与右侧控件排列 -->
    <div class="w-full px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
      <!-- 左侧区域：Logo 固定在左上角，模块导航紧随其后靠左对齐 -->
      <div class="flex flex-1 items-center gap-2 sm:gap-3 lg:gap-5 min-w-0">
        <!-- 平台标识与名称 (固定左上角，APP 视口内禁用点击跳转) -->
        <div
          class="flex items-center gap-2.5 shrink-0"
          :class="isAppMode ? 'cursor-default select-none' : 'cursor-pointer'"
          @click="handleLogoClick"
        >
          <!-- 参考站风格国徽印章容器：浅砂金底 + 砂金描边 + 金棕徽标 -->
          <div class="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-[10px] bg-[#FDF3E0] border border-[#E5CEA1] text-[#7A5F21] shadow-[0_3px_18px_-6px_rgba(58,77,62,0.12)]">
            <!-- App 移动端模式：仅显示 Logo 方块图标，去除文字，节省宝贵视口宽度 -->
            <AppLogo size="sm" theme="light" class="sm:hidden" />
            <!-- 桌面端模式：显示中号 Logo 方块图标 -->
            <AppLogo size="md" theme="light" class="hidden sm:flex" />
          </div>

          <!-- 文字排印：在 App 移动端或 APP 仿真模式下隐藏，桌面 Web 端显示 RCM 标识 -->
          <div v-if="!isAppMode" class="shrink-0 hidden sm:block">
            <div class="text-[10px] text-[#7A5F21] font-semibold tracking-wide">
              REPUBLIC OF IRAQ · MINISTRY OF TRADE
            </div>
            <div class="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 text-[#1F3326]">
              <span>RCM</span>
            </div>
          </div>
        </div>

        <!-- 分隔浅竖线 -->
        <div v-if="!isAppMode" class="hidden xl:block h-5 w-px bg-[#E5CEA1] shrink-0"></div>

        <!-- 核心系统快捷导航 (桌面端且非 APP 模式) -->
        <nav v-if="!isAppMode" class="app-module-nav hidden md:flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-xs">
          <!-- 1. 数据看板：配给代理或管理角色可见 -->
          <router-link
            v-if="canViewDashboard && authStore.hasPermission('dashboard.view')"
            to="/dashboard"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/dashboard' ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('nav.dashboard') }}</span>
          </router-link>

          <!-- 2. 公民服务：仅 Citizen 可见 -->
          <router-link
            v-if="authStore.currentRole === 'citizen'"
            to="/citizen"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/citizen') ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><User /></el-icon>
            <span>{{ $t('nav.citizen') }}</span>
          </router-link>

          <!-- 3. 审核工作台：仅 Admin 管理角色可见 -->
          <router-link
            v-if="canViewReview"
            to="/review"
            :title="`${$t('nav.review')} · ${$t('review.pendingCountLabel', { count: pendingReviewCount })}`"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/review' ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><Stamp /></el-icon>
            <span>{{ $t('nav.review') }}</span>
            <span class="review-nav-count inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums" :class="pendingReviewCount > 0 ? 'bg-[#C04442] text-white' : 'bg-[#E9F1EB] text-[#58685D]'" :aria-label="$t('review.pendingCountLabel', { count: pendingReviewCount })" role="status">
              <bdi dir="ltr">{{ pendingReviewCount > 99 ? '99+' : pendingReviewCount }}</bdi>
            </span>
          </router-link>

          <!-- 4. 投诉和处理：仅 Admin 管理角色可见 -->
          <router-link
            v-if="authStore.hasPermission('complaints.view') && (authStore.isAdmin || authStore.userProfile?.permissionCodes?.includes('complaints.view'))"
            to="/complaint"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/complaint') ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><Service /></el-icon>
            <span>{{ $t('nav.complaint') }}</span>
          </router-link>

          <!-- 5. 配给管理 (统一显示为配给管理) -->
          <router-link
            to="/warehouse"
            v-if="authStore.hasPermission('ration.view')"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/warehouse' ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><Box /></el-icon>
            <span>{{ $t('nav.rationMgmt') || '配给管理' }}</span>
          </router-link>

          <!-- 6. 代理管理：管理角色与 Agent 配给代理可见 -->
          <router-link
            v-if="(authStore.isAdmin || authStore.currentRole === 'agent' || authStore.userProfile?.permissionCodes?.includes('agents.view')) && authStore.hasPermission('agents.view')"
            to="/agent"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/agent' ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><Shop /></el-icon>
            <span>{{ $t('nav.agent') }}</span>
          </router-link>

          <!-- 6.1 代理家庭：代理端花名册（已代理家庭清单与检索） -->
          <router-link
            v-if="authStore.currentRole === 'agent' && authStore.hasPermission('agents.view')"
            to="/agent-families"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path === '/agent-families' ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><House /></el-icon>
            <span>{{ $t('nav.agentFamilies') }}</span>
          </router-link>

          <!-- 7. 后台管理：仅 Admin 管理角色可见 -->
          <router-link
            v-if="authStore.isAdmin && authStore.hasPermission('system.users')"
            to="/admin"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
            :class="$route.path.startsWith('/admin') ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1] shadow-sm' : 'text-[#58685D] border border-transparent hover:text-[#326445] hover:bg-[#E2F4E4]'"
          >
            <el-icon><Setting /></el-icon>
            <span>{{ $t('nav.admin') }}</span>
          </router-link>

          <router-link v-if="authStore.hasPermission('system.users')" to="/system-management" class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap" :class="$route.path.startsWith('/system-management') ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1]' : 'text-[#58685D] hover:text-[#326445] hover:bg-[#E2F4E4]'">
            <el-icon><Tools /></el-icon><span>{{ $t('system.title') }}</span>
          </router-link>
          <router-link v-if="canAccessMessageCenter" :to="canViewMessages || canSendMessages ? '/messages' : '/messages/review'" class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap" :class="$route.path.startsWith('/messages') ? 'bg-[#E2F4E4] text-[#326445] font-semibold border border-[#E5CEA1]' : 'text-[#58685D] hover:text-[#326445] hover:bg-[#E2F4E4]'">
            <el-icon><Bell /></el-icon><span>{{ $t('messages.title') }}</span>
          </router-link>
        </nav>
      </div>

      <!-- 右侧区域：语言切换、用户信息与退出系统 (针对移动端自适应紧凑化) -->
      <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ms-auto">
        <!-- 国际化语言切换选择器 -->
        <LanguageSwitcher />

        <el-tooltip v-if="canViewMessageNotifications" :content="$t('messages.notification')" placement="bottom">
          <el-badge :value="messageStore.unreadCount" :hidden="messageStore.unreadCount === 0" :max="99" class="cursor-pointer">
            <el-button circle size="small" plain @click="openNotifications"><el-icon><Bell /></el-icon></el-button>
          </el-badge>
        </el-tooltip>

        <!-- 角色身份切换下拉 (公民app和代理app视口内彻底隐藏) -->
        <el-dropdown v-if="!isAppMode && !authStore.userProfile?.permissionCodes" trigger="click" @command="handleRoleCommand">
          <!-- 统一单一根容器，杜绝 ElementPlusError: [ElOnlyChild] requires exact only one valid child -->
          <div class="inline-flex items-center cursor-pointer select-none">
            <!-- 桌面端普通模式：显示小圆点、角色名称与下拉箭头 -->
            <span
              class="hidden sm:flex items-center gap-1 text-xs text-[#7A5F21] hover:text-[#326445] px-2.5 py-1.5 rounded-lg bg-[#FDF3E0] border border-[#E5CEA1] transition-colors"
            >
              <span class="w-2 h-2 rounded-full shrink-0" :class="roleDotColor"></span>
              <span class="whitespace-nowrap font-medium">{{ roleLabel }}</span>
              <el-icon class="text-[10px]"><ArrowDown /></el-icon>
            </span>

            <!-- 移动端非APP小屏：简化为一个精巧图标按钮 (带身份指示光点) -->
            <button
              type="button"
              class="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#FDF3E0] border border-[#E5CEA1] text-[#7A5F21] hover:text-[#326445] active:scale-95 transition-all relative"
              :title="roleLabel"
            >
              <el-icon :size="15"><UserFilled /></el-icon>
              <!-- 角色小圆点徽标 -->
              <span class="absolute top-0.5 end-0.5 w-2 h-2 rounded-full border border-[#FDF3E0]" :class="roleDotColor"></span>
            </button>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="px-3 py-1.5 text-[11px] font-bold text-[#8A9A8F] border-b border-[#E9F1EB]">
                {{ $t('roles.adminRoles') }}
              </div>
              <el-dropdown-item command="minister_center">
                <span class="font-bold text-[#326445]">● {{ $t('roles.ministerCenter') }}</span>
                <span class="text-[11px] text-[#8A9A8F] block ms-3">{{ $t('roles.ministerDuty') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="deputy_minister">
                <span class="font-bold text-[#C04442]">● {{ $t('roles.deputyMinister') }}</span>
                <span class="text-[11px] text-[#8A9A8F] block ms-3">{{ $t('roles.deputyDuty') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="director_planning">
                <span class="font-bold text-[#D3AF62]">● {{ $t('roles.directorPlanning') }}</span>
                <span class="text-[11px] text-[#8A9A8F] block ms-3">{{ $t('roles.directorDuty') }}</span>
              </el-dropdown-item>
              <div class="px-3 py-1.5 text-[11px] font-bold text-[#8A9A8F] border-t border-b border-[#E9F1EB] mt-1">
                {{ $t('roles.businessRoles') }}
              </div>
              <el-dropdown-item command="citizen">
                <span class="text-[#2F7A50]">● {{ $t('roles.citizen') }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="agent">
                <span class="text-[#326445] font-bold">● {{ $t('roles.agent') }}</span>
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
    <el-dialog v-model="notificationsVisible" :title="$t('messages.notification')" width="min(520px, 94vw)">
      <div v-if="messageStore.inbox.length" class="max-h-[55vh] space-y-2 overflow-y-auto">
        <button v-for="item in messageStore.inbox" :key="item.id" type="button" class="w-full rounded-lg border p-3 text-start transition-colors hover:bg-[#F4F8F4]" :class="item.read ? 'border-[#E5ECE7]' : 'border-[#C7E0CE] bg-[#F5FAF5]'" @click="previewMessage(item)">
          <div class="flex items-center justify-between gap-2"><span class="font-semibold text-[#24483A]">{{ item.subjectKey ? $t(item.subjectKey) : item.subject }}</span><span v-if="!item.read" class="h-2 w-2 shrink-0 rounded-full bg-[#C04442]"></span></div>
          <p class="mt-1 line-clamp-2 text-sm text-[#68796E]">{{ item.bodyKey ? $t(item.bodyKey) : (item.bodyText || item.body || '') }}</p>
        </button>
      </div>
      <el-empty v-else :description="$t('messages.empty')" />
    </el-dialog>
    <el-dialog v-model="messageVisible" :title="$t('messages.detail')" width="min(520px, 94vw)">
      <template v-if="selectedMessage"><el-tag>{{ $t(selectedMessage.category === 'system' ? 'messages.system' : 'messages.admin') }}</el-tag><h3 class="my-4 text-lg font-bold">{{ selectedMessage.subjectKey ? $t(selectedMessage.subjectKey) : selectedMessage.subject }}</h3><p class="whitespace-pre-wrap leading-7">{{ selectedMessage.bodyKey ? $t(selectedMessage.bodyKey) : (selectedMessage.bodyText || selectedMessage.body || '') }}</p></template>
      <template #footer><el-button @click="messageVisible = false">{{ $t('messages.close') }}</el-button><el-button type="primary" @click="viewMessageDetails">{{ $t('messages.viewDetails') }}</el-button></template>
    </el-dialog>
  </header>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.js';
import { useReviewStore } from '../../stores/review.js';
import { useMessageCenterStore } from '../../stores/messageCenter.js';
import { resolveMessageAccess } from '../../utils/messagePermissions.js';
import { getDefaultPathByRole } from '../../router/index.js';
import { getNativeAppRole, getLoginPathForRole } from '../../utils/appRole.js';
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
  FullScreen,
  Bell,
  Tools,
  House
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const reviewStore = useReviewStore();
const canViewReview = computed(() => authStore.hasPermission('review.view') && (authStore.isAdmin || authStore.userProfile?.permissionCodes?.includes('review.view')));
watch([locale, canViewReview], () => { if (canViewReview.value) reviewStore.fetchTickets(reviewStore.filterSource); }, { immediate: true });
const messageStore = useMessageCenterStore();
const notificationsVisible = ref(false), messageVisible = ref(false), selectedMessage = ref(null);
const messageAccess = computed(() => resolveMessageAccess(authStore.userProfile));
const canViewMessages = computed(() => messageAccess.value.canView);
const canSendMessages = computed(() => messageAccess.value.canSend);
const canAccessMessageCenter = computed(() => canViewMessages.value || canSendMessages.value || messageAccess.value.canReview);
const canViewMessageNotifications = computed(() => canViewMessages.value || messageAccess.value.canReview);
let messageTimer;

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
  if (canViewMessageNotifications.value) {
    refreshMessageCounts();
    messageTimer = setInterval(refreshMessageCounts, 30000);
  }
});
onBeforeUnmount(() => clearInterval(messageTimer));

function refreshMessageCounts() {
  return messageStore.refresh({
    includeInbox: canViewMessages.value,
    includeReview: messageAccess.value.canReview
  }).catch(() => {});
}
async function openNotifications() {
  if (!canViewMessages.value) {
    if (messageAccess.value.canReview) router.push('/messages/review');
    return;
  }
  notificationsVisible.value = true;
  await messageStore.refresh({ includeInbox: true }).catch(() => {});
}
async function previewMessage(item) { selectedMessage.value = item; messageVisible.value = true; if (!item.read) await messageStore.markRead(item.id); }
function viewMessageDetails() { if (!selectedMessage.value) return; const id = selectedMessage.value.id; messageVisible.value = false; notificationsVisible.value = false; router.push({ path: '/messages', query: { detail: id } }); }

const pendingReviewCount = computed(() => {
  return reviewStore.pendingCount;
});

// 数据看板仅限配给代理或者任意管理角色可见
const canViewDashboard = computed(() => {
  return authStore.isAdmin || authStore.currentRole === 'agent' || authStore.hasPermission('dashboard.view');
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
      return 'bg-[#7FA48C]';
    case 'deputy_minister':
      return 'bg-[#D0827F]';
    case 'director_planning':
      return 'bg-[#DFC08B]';
    case 'admin':
      return 'bg-[#DFC08B]';
    case 'citizen':
      return 'bg-[#7FA48C]';
    case 'agent':
      return 'bg-[#6FBF92]';
    default:
      return 'bg-[#8A9A8F]';
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
  // Keep the app identity before the auth store is cleared; a portal-launched
  // agent app must return to the agent login, not the citizen default.
  const appRole = getNativeAppRole() || authStore.currentRole;
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
  } else if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('rcm_layout_mode');
  }
  await router.replace(getLoginPathForRole(appRole, wasAppMode));
}
</script>

<style scoped>
.app-module-nav { scrollbar-width: none; }
.app-module-nav::-webkit-scrollbar { display: none; }
.app-module-nav > a { flex-shrink: 0; }
/* 移动端底部导航安全区适配 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 8px);
}
</style>
