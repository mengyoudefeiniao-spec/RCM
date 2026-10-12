<template>
  <header class="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <!-- 左侧区域：平台Logo与模块栏靠左排版 -->
      <div class="flex items-center gap-6 lg:gap-8 flex-1 min-w-0">
        <!-- 平台标识与名称 -->
        <div class="flex items-center gap-3 cursor-pointer shrink-0" @click="handleLogoClick">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            RC
          </div>
          <div>
            <div class="text-sm font-bold tracking-wide flex items-center gap-2">
              <span>国家数字配给卡平台</span>
              <el-tag size="small" effect="dark" type="primary" class="font-mono">RCM-V2</el-tag>
            </div>
            <div class="text-[10px] text-slate-400 font-mono">
              REPUBLIC OF IRAQ · MINISTRY OF TRADE
            </div>
          </div>
        </div>

        <!-- 核心系统快捷导航 (靠左紧贴Logo，靠左对齐) -->
        <nav class="hidden md:flex items-center gap-1 text-xs">
          <!-- 1. 数据看板：Admin 与 Agent 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'agent'])"
            to="/dashboard"
            class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            :class="$route.path === '/dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span>数据看板</span>
          </router-link>

          <!-- 2. 公民服务：Admin 与 Citizen 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'citizen'])"
            to="/citizen"
            class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            :class="$route.path.startsWith('/citizen') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><User /></el-icon>
            <span>公民服务</span>
          </router-link>

          <!-- 3. 审核工作台：仅 Admin 可见 -->
          <router-link
            v-if="hasAccess(['admin'])"
            to="/review"
            class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            :class="$route.path === '/review' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Stamp /></el-icon>
            <span>审核工作台</span>
            <span v-if="pendingReviewCount > 0" class="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {{ pendingReviewCount }}
            </span>
          </router-link>

          <!-- 4. 仓储管理：Admin 与 Agent 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'agent'])"
            to="/warehouse"
            class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            :class="$route.path === '/warehouse' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Box /></el-icon>
            <span>仓储管理</span>
          </router-link>

          <!-- 5. 代理管理：Admin 与 Agent 可见 -->
          <router-link
            v-if="hasAccess(['admin', 'agent'])"
            to="/agent"
            class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            :class="$route.path === '/agent' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Shop /></el-icon>
            <span>代理管理</span>
          </router-link>

          <!-- 6. 后台管理：仅 Admin 监督官可见 -->
          <router-link
            v-if="hasAccess(['admin'])"
            to="/admin"
            class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            :class="$route.path.startsWith('/admin') ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white hover:bg-slate-800'"
          >
            <el-icon><Setting /></el-icon>
            <span>后台管理</span>
          </router-link>
        </nav>
      </div>

      <!-- 用户信息与角色切换 -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- 角色切换下拉 -->
        <el-dropdown trigger="click" @command="handleRoleCommand">
          <span class="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            <span class="w-2 h-2 rounded-full" :class="roleDotColor"></span>
            <span>{{ roleLabel }}</span>
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
        <el-button size="small" type="danger" plain @click="handleLogout">
          <el-icon class="mr-1"><SwitchButton /></el-icon>
          退出
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

// 权限匹配判定
function hasAccess(roles) {
  return roles.includes(authStore.currentRole);
}

const pendingReviewCount = computed(() => {
  return reviewStore.tickets.filter((t) => t.status === '待分部初审' || t.status === '待经理终审').length;
});

const roleLabel = computed(() => {
  const r = authStore.currentRole;
  if (r === 'admin') return '督察官 (Admin)';
  if (r === 'citizen') return '公民 (Citizen)';
  if (r === 'agent') return '代理 (Agent)';
  return r;
});

const roleDotColor = computed(() => {
  const r = authStore.currentRole;
  if (r === 'admin') return 'bg-indigo-400';
  if (r === 'citizen') return 'bg-blue-400';
  if (r === 'agent') return 'bg-amber-400';
  return 'bg-emerald-400';
});

function handleLogoClick() {
  const target = getDefaultPathByRole(authStore.currentRole);
  router.push(target);
}

function handleRoleCommand(command) {
  authStore.switchRole(command);
  // 检查当前所在路径新角色是否有权访问，若无权则跳转至其默认首页
  const defaultPath = getDefaultPathByRole(command);
  if (command === 'citizen') {
    if (!route.path.startsWith('/citizen')) {
      router.push(defaultPath);
    }
  } else if (command === 'agent') {
    const allowed = ['/agent', '/dashboard', '/warehouse'];
    if (!allowed.some((p) => route.path.startsWith(p))) {
      router.push(defaultPath);
    }
  }
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>
