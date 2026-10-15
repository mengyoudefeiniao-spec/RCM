<template>
  <div class="dashboard-view space-y-3 sm:space-y-6">
    <!-- 模式 1: 下滑式配给数据主页 (参考 Iraq Census GeoPortal 交互式下滑布局) -->
    <div v-if="dashboardMode === 'overview'" class="animate-fadeIn">
      <ScrollHome @switch-mode="dashboardMode = $event" />
    </div>

    <!-- 模式 2: 现场核销作业 APP (基于 Google Pixel 9 深度适配) -->
    <div v-else-if="dashboardMode === 'mobile'" class="animate-fadeIn">
      <MobileAgentDashboard @switch-mode="dashboardMode = $event" />
    </div>

    <!-- 模式 3: 原角色专属细化业务大盘 (保供/管理) -->
    <div v-else-if="dashboardMode === 'operational'" class="space-y-4 animate-fadeIn">
      <!-- 原顶部控制栏 -->
      <div class="bg-white px-4 py-3 rounded-lg border border-[#D9E5DB]/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" :class="isAgentRole ? 'bg-[#2F7A50]' : 'bg-[#326445]'">
            <el-icon class="text-base"><DataAnalysis /></el-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-[#1B3123]">
                {{ isAgentRole ? ($t('dashboard.agentTitle') || '配给代理保供大盘') : ($t('dashboard.adminTitle') || '全国配给综合数据看板') }}
              </h2>
              <el-tag size="small" :type="isAgentRole ? 'success' : 'primary'" effect="plain" class="font-medium text-[11px]">
                {{ roleTitle }}
              </el-tag>
            </div>
            <span class="text-[11px] text-[#8A9A8F]">
              {{ isAgentRole ? ($t('dashboard.agentSubtitle') || '战略物资在库余量与供应链全链路履约监控') : ($t('dashboard.adminSubtitle') || '涵盖公民、家庭、各地区代理商、实际配给及投诉处置') }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- 时间范围单选器 -->
          <el-radio-group v-model="selectedTimeRange" size="small" @change="handleTimeRangeChange">
            <el-radio-button value="quarter">{{ $t('dashboard.quarter') || '本季度' }}</el-radio-button>
            <el-radio-button value="month">{{ $t('dashboard.month') || '近30天' }}</el-radio-button>
            <el-radio-button value="week">{{ $t('dashboard.week') || '近7天' }}</el-radio-button>
            <el-radio-button value="day">{{ $t('dashboard.day') || '近1天' }}</el-radio-button>
          </el-radio-group>

          <!-- 刷新按钮 -->
          <el-button size="small" @click="handleRefresh" :loading="refreshing">
            <el-icon class="mr-1"><Refresh /></el-icon>
            {{ $t('dashboard.refresh') || '刷新数据' }}
          </el-button>
        </div>
      </div>

      <!-- 业务视角分发 -->
      <div v-if="isAgentRole">
        <AgentDashboard ref="agentDashboardRef" :timeRange="selectedTimeRange" />
      </div>
      <div v-else-if="isAdminRole">
        <AdminDashboard ref="adminDashboardRef" :timeRange="selectedTimeRange" />
      </div>
      <div v-else class="bg-white rounded-lg border border-[#D9E5DB] p-8 text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-[#E9F1EB] flex items-center justify-center mx-auto text-[#8A9A8F] text-xl">
          <el-icon><Lock /></el-icon>
        </div>
        <h3 class="text-sm font-bold text-[#1F3326]">{{ $t('dashboard.accessRestricted') || '数据看板访问受限' }}</h3>
        <p class="text-xs text-[#58685D] max-w-md mx-auto">
          {{ $t('dashboard.restrictedTip', { role: authStore.userProfile?.title || '普通公民' }) || `当前为【${authStore.userProfile?.title || '普通公民'}】角色。数据看板仅对配给代理网点或管理监督官开放查看。` }}
        </p>
        <div class="pt-2 flex justify-center gap-2">
          <el-button size="small" type="primary" @click="$router.push('/citizen')">
            {{ $t('dashboard.goToCitizen') || '前往公民服务' }}
          </el-button>
          <el-button size="small" @click="authStore.switchRole('agent')">
            {{ $t('dashboard.switchToAgent') || '切换至配给代理' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- P1 ~ P5 阶段规则实体验证抽屉 (配给代理可用) -->
    <P1P5VerificationDrawer ref="verificationDrawerRef" />
  </div>
</template>

<script setup>
import { isEnNow } from '../../utils/langHint.js';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { DataAnalysis, Checked, Refresh, Lock, Operation, Cellphone } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/auth.js';
import MobileAgentDashboard from './components/MobileAgentDashboard.vue';
import ScrollHome from './components/ScrollHome.vue';
import AgentDashboard from './components/AgentDashboard.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import P1P5VerificationDrawer from '../warehouse/components/P1P5VerificationDrawer.vue';

const route = useRoute();
const authStore = useAuthStore();
const dashboardMode = ref('overview'); // 默认展示现代中东高端政务风格看板
const selectedTimeRange = ref('quarter');
const refreshing = ref(false);

const isAppMode = computed(() => route.query.layout === 'app');

// 模式初始化：优先读取 URL query.mode (支持门户新标签页直达)，其次根据视口自适应或角色自适应
onMounted(() => {
  if (route.query.mode) {
    dashboardMode.value = String(route.query.mode);
  } else if (isAppMode.value && authStore.currentRole === 'agent') {
    dashboardMode.value = 'mobile';
  }
});

watch(
  () => route.query.mode,
  (mode) => {
    if (mode) {
      dashboardMode.value = String(mode);
    }
  }
);

// 保持移动端原生全局底栏常驻显示，各端协同呈现
onMounted(() => {
  authStore.setMobileVerificationActive(false);
});

onUnmounted(() => {
  authStore.setMobileVerificationActive(false);
});

const agentDashboardRef = ref(null);
const adminDashboardRef = ref(null);
const verificationDrawerRef = ref(null);

const isAgentRole = computed(() => authStore.currentRole === 'agent');
const isAdminRole = computed(() => authStore.isAdmin);

const roleTitle = computed(() => {
  switch (authStore.currentRole) {
    case 'minister_center':
      return '配给中心部长视角';
    case 'deputy_minister':
      return '行政次长视角';
    case 'director_planning':
      return '规划与跟进司总干事视角';
    case 'admin':
      return '管理监督官视角';
    case 'agent':
      return '配给代理视角';
    default:
      return '业务人员视角';
  }
});

function handleTimeRangeChange(val) {
  const map = {
    quarter: '本季度',
    month: '近30天',
    week: '近7天',
    day: '近1天'
  };
  ElMessage.success((isEnNow() ? `Switched to the [${map[val] || val}] statistics pivot` : `已切换至【${map[val] || val}】统计数据透视`));
}

async function handleRefresh() {
  refreshing.value = true;
  try {
    if (isAgentRole.value) {
      await agentDashboardRef.value?.refresh();
    } else if (isAdminRole.value) {
      await adminDashboardRef.value?.refresh();
    }
    ElMessage.success((isEnNow() ? 'Dashboard data refreshed!' : '看板数据已刷新！'));
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Failed to refresh data' : '刷新数据失败'));
  } finally {
    refreshing.value = false;
  }
}

function openVerificationDrawer() {
  verificationDrawerRef.value?.open();
}
</script>

<style scoped>
</style>
