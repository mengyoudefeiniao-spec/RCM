<template>
  <div class="dashboard-view space-y-4">
    <!-- ======================================================== -->
    <!-- 顶部控制栏 (简洁干练介绍词，支持根据时间范围联动切换查询) -->
    <!-- ======================================================== -->
    <div class="bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" :class="isAgentRole ? 'bg-teal-600' : 'bg-blue-600'">
          <el-icon class="text-base"><DataAnalysis /></el-icon>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-slate-900">
              {{ isAgentRole ? ($t('dashboard.agentTitle') || '配给代理保供大盘') : ($t('dashboard.adminTitle') || '全国配给综合数据看板') }}
            </h2>
            <el-tag size="small" :type="isAgentRole ? 'success' : 'primary'" effect="plain" class="font-medium text-[11px]">
              {{ roleTitle }}
            </el-tag>
          </div>
          <span class="text-[11px] text-slate-400">
            {{ isAgentRole ? ($t('dashboard.agentSubtitle') || '战略物资在库余量与供应链全链路履约监控') : ($t('dashboard.adminSubtitle') || '涵盖公民、家庭、各地区代理商、实际配给及投诉处置') }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- 时间范围单选器 -->
        <el-radio-group v-model="selectedTimeRange" size="small" @change="handleTimeRangeChange">
          <el-radio-button label="quarter">{{ $t('dashboard.quarter') || '本季度' }}</el-radio-button>
          <el-radio-button label="month">{{ $t('dashboard.month') || '近30天' }}</el-radio-button>
          <el-radio-button label="week">{{ $t('dashboard.week') || '近7天' }}</el-radio-button>
          <el-radio-button label="day">{{ $t('dashboard.day') || '近1天' }}</el-radio-button>
        </el-radio-group>

        <!-- 配给代理专属：P1 ~ P5 规则实体验证抽屉入口 -->
        <el-button v-if="isAgentRole" type="success" size="small" @click="openVerificationDrawer">
          <el-icon class="mr-1"><Checked /></el-icon>
          {{ $t('dashboard.p1p5Verify') || 'P1 ~ P5 规则验证' }}
        </el-button>

        <!-- 刷新按钮 -->
        <el-button size="small" @click="handleRefresh" :loading="refreshing">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ $t('dashboard.refresh') || '刷新数据' }}
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 业务视角分发 -->
    <!-- 1. 配给代理：保持原有保供与仓储流转大盘 (介绍词已精简) -->
    <!-- 2. 管理角色：针对于 公民、家庭、各地区代理商、实际配给情况、投诉和处理 -->
    <!-- 3. 非授权角色 (如公民)：友好提示引导 -->
    <!-- ======================================================== -->
    <div v-if="isAgentRole">
      <AgentDashboard ref="agentDashboardRef" :timeRange="selectedTimeRange" />
    </div>

    <div v-else-if="isAdminRole">
      <AdminDashboard ref="adminDashboardRef" :timeRange="selectedTimeRange" />
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
      <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-xl">
        <el-icon><Lock /></el-icon>
      </div>
      <h3 class="text-sm font-bold text-slate-800">{{ $t('dashboard.accessRestricted') || '数据看板访问受限' }}</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto">
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

    <!-- P1 ~ P5 阶段规则实体验证抽屉 (配给代理可用) -->
    <P1P5VerificationDrawer ref="verificationDrawerRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { ElMessage } from 'element-plus';
import { DataAnalysis, Checked, Refresh, Lock } from '@element-plus/icons-vue';
import AgentDashboard from './components/AgentDashboard.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import P1P5VerificationDrawer from '../warehouse/components/P1P5VerificationDrawer.vue';

const authStore = useAuthStore();
const selectedTimeRange = ref('quarter');
const refreshing = ref(false);

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
  ElMessage.success(`已切换至【${map[val] || val}】统计数据透视`);
}

async function handleRefresh() {
  refreshing.value = true;
  try {
    if (isAgentRole.value) {
      await agentDashboardRef.value?.refresh();
    } else if (isAdminRole.value) {
      await adminDashboardRef.value?.refresh();
    }
    ElMessage.success('看板数据已刷新！');
  } catch (e) {
    ElMessage.error('刷新数据失败');
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
