<template>
  <!-- 移动端底部原生级操作模块导航栏 (永远稳固在 APP 视口的最下方) -->
  <nav
    v-if="!authStore.isMobileVerificationActive"
    class="app-mobile-nav w-full z-50 bg-white border-t border-[#E5CEA1] px-2 py-1.5 items-center safe-area-bottom shadow-[0_-4px_20px_-2px_rgba(58,77,62,0.08)] transition-all duration-300 shrink-0"
    :class="[
      authStore.currentRole === 'agent' ? 'grid grid-cols-5' : 'flex justify-around',
      isAppMode
        ? 'rounded-b-[24px]'
        : 'fixed bottom-0 start-0 end-0 md:hidden'
    ]"
  >
    <!-- ============================================== -->
    <!-- 模式 A: 公民端专属功能模块 (仅公民可见) -->
    <!-- ============================================== -->
    <template v-if="authStore.currentRole === 'citizen'">
      <!-- 1. 公民服务 (家庭配给卡与在册成员) -->
      <router-link
        :to="getNavTarget('/citizen')"
        class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] min-w-[70px] transition-all"
        :class="$route.path.startsWith('/citizen') ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="20"><User /></el-icon>
        <span>{{ $t('nav.citizen') || '公民服务' }}</span>
      </router-link>

      <!-- 2. 配给购买 (配给购买与提货兑付) -->
      <router-link
        :to="getNavTarget('/warehouse')"
        class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] min-w-[70px] transition-all"
        :class="$route.path === '/warehouse' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="20"><ShoppingCart /></el-icon>
        <span>{{ $t('citizenPurchase.moduleTitle') || '配给购买' }}</span>
      </router-link>

      <!-- 3. 家庭代理 (本人家庭签约代理与月度物资配送额度) -->
      <router-link
        :to="getNavTarget('/family-agent')"
        class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] min-w-[70px] transition-all"
        :class="$route.path === '/family-agent' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="20"><House /></el-icon>
        <span>{{ $t('warehouse.familyAgent') || '家庭代理' }}</span>
      </router-link>
      <router-link
        :to="getNavTarget('/my')"
        class="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] min-w-[64px] transition-all"
        :class="$route.path === '/my' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <span class="relative"><el-icon :size="20"><UserFilled /></el-icon><span v-if="myNotifications.unreadCount" class="absolute -top-1 -end-1 size-2 rounded-full bg-red-500 ring-2 ring-white" /></span>
        <span>{{ $t('my.nav') }}</span>
      </router-link>
    </template>

    <!-- ============================================== -->
    <!-- 模式 B: 代理端专属功能模块 (仅代理网点可见) -->
    <!-- ============================================== -->
    <template v-else-if="authStore.currentRole === 'agent'">
      <!-- 1. 现场核销 (扫码核销作业看板) -->
      <router-link
        :to="getNavTarget('/dashboard')"
        class="w-full min-w-0 flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-[10px] transition-all"
        :class="$route.path === '/dashboard' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="20"><FullScreen /></el-icon>
        <span class="w-full min-h-[2.5em] flex items-center justify-center text-center leading-tight break-words">{{ $t('nav.agentScanVerify') || '运营概览' }}</span>
      </router-link>

      <!-- 2. 配给配送 (物资排程与计划) -->
      <router-link
        :to="getNavTarget('/warehouse')"
        class="w-full min-w-0 flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-[10px] transition-all"
        :class="$route.path === '/warehouse' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="20"><Van /></el-icon>
        <span class="w-full min-h-[2.5em] flex items-center justify-center text-center leading-tight break-words">{{ $t('nav.agentDistribution') || '配给交货' }}</span>
      </router-link>

      <!-- 3. 代理订单记录 (拆分后的代理端独立大模块：集中采购订货流水) -->
      <router-link
        :to="getNavTarget('/agent-orders')"
        class="w-full min-w-0 flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-[10px] transition-all"
        :class="$route.path === '/agent-orders' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="20"><Tickets /></el-icon>
        <span class="w-full min-h-[2.5em] flex items-center justify-center text-center leading-tight break-words">{{ $t('agent.tabAgentOrders') || '代理订单' }}</span>
      </router-link>

      <!-- 4. 代理订单统计分析 (拆分后的代理端独立大模块：订单分析图表) -->
      <router-link
        :to="getNavTarget('/agent-analytics')"
        class="w-full min-w-0 flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-[10px] transition-all"
        :class="$route.path === '/agent-analytics' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="20"><DataAnalysis /></el-icon>
        <span class="w-full min-h-[2.5em] flex items-center justify-center text-center leading-tight break-words">{{ $t('agent.tabOrderAnalytics') || '库存台账' }}</span>
      </router-link>
      <router-link
        :to="getNavTarget('/my')"
        class="w-full min-w-0 flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-[10px] transition-all"
        :class="$route.path === '/my' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <span class="relative"><el-icon :size="20"><UserFilled /></el-icon><span v-if="myNotifications.unreadCount" class="absolute -top-1 -end-1 size-2 rounded-full bg-red-500 ring-2 ring-white" /></span>
        <span class="w-full min-h-[2.5em] flex items-center justify-center text-center leading-tight break-words">{{ $t('my.nav') }}</span>
      </router-link>
    </template>

    <!-- ============================================== -->
    <!-- 模式 C: 政府监督管理端功能模块 (仅管理角色可见) -->
    <!-- ============================================== -->
    <template v-else>
      <!-- 1. 看板 -->
      <router-link
        :to="getNavTarget('/dashboard')"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] min-w-[46px] transition-all"
        :class="$route.path === '/dashboard' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="19"><DataAnalysis /></el-icon>
        <span>{{ $t('nav.dashboard') }}</span>
      </router-link>

      <!-- 2. 审核 -->
      <router-link
        :to="getNavTarget('/review')"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] min-w-[46px] relative transition-all"
        :class="$route.path === '/review' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="19"><Stamp /></el-icon>
        <span>{{ $t('nav.review') }}</span>
        <span v-if="pendingReviewCount > 0" class="absolute top-0.5 end-1.5 w-3.5 h-3.5 rounded-full bg-[#C04442] text-white text-[8px] flex items-center justify-center font-bold">{{ pendingReviewCount }}</span>
      </router-link>

      <!-- 3. 配给管理 -->
      <router-link
        :to="getNavTarget('/warehouse')"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] min-w-[46px] transition-all"
        :class="$route.path === '/warehouse' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="19"><Box /></el-icon>
        <span>{{ $t('nav.rationShort') || '配给' }}</span>
      </router-link>

      <!-- 4. 代理视察 -->
      <router-link
        :to="getNavTarget('/agent')"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] min-w-[46px] transition-all"
        :class="$route.path === '/agent' ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="19"><Shop /></el-icon>
        <span>{{ $t('nav.agent') }}</span>
      </router-link>

      <!-- 5. 投诉管理 -->
      <router-link
        :to="getNavTarget('/complaint')"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] min-w-[46px] transition-all"
        :class="$route.path.startsWith('/complaint') ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="19"><Service /></el-icon>
        <span>{{ $t('nav.complaint') }}</span>
      </router-link>

      <!-- 6. 后台管理 -->
      <router-link
        :to="getNavTarget('/admin')"
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] min-w-[46px] transition-all"
        :class="$route.path.startsWith('/admin') ? 'text-[#326445] font-bold bg-[#E2F4E4] border-t-2 border-[#D3AF62]' : 'text-[#58685D] border-t-2 border-transparent active:scale-95'"
      >
        <el-icon :size="19"><Setting /></el-icon>
        <span>{{ $t('nav.admin') }}</span>
      </router-link>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { useReviewStore } from '../../stores/review.js';
import { useMyNotificationsStore } from '../../stores/myNotifications.js';
import {
  DataAnalysis,
  User,
  UserFilled,
  Stamp,
  Box,
  Shop,
  Setting,
  Service,
  ShoppingCart,
  Van,
  FullScreen,
  House,
  Tickets
} from '@element-plus/icons-vue';

const route = useRoute();
const authStore = useAuthStore();
const reviewStore = useReviewStore();
const myNotifications = useMyNotificationsStore();

// 与 AppLayout 保持完全一致的三级判定：URL query 优先，其次会话记忆兜底，
// 防止应用内路由丢失 layout=app 参数后底部导航误降级为 fixed 悬浮遮挡内容
const isAppMode = computed(() => {
  if (route.query.layout === 'app') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

function getNavTarget(path) {
  if (isAppMode.value) {
    return { path, query: { layout: 'app', role: authStore.currentRole } };
  }
  return path;
}

const pendingReviewCount = computed(() => {
  return reviewStore.tickets?.filter((t) => t.status.includes('待')).length || 0;
});
</script>
