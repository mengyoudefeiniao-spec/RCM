<template>
  <div class="warehouse-view space-y-4">
    <!-- 配给管理业务模块选项卡 (去除旧版大标题横幅，列表顶格上移，支持横向平滑响应) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <el-tabs v-model="activeTab" class="warehouse-custom-tabs px-3 sm:px-6">
        <!-- 1. 配给计划管理 (月度计划制定与上级/下级三层配额自动排程) -->
        <el-tab-pane name="rationPlan">
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><Calendar /></el-icon>
              <span class="font-bold">
                {{ isAdmin ? ($t('warehouse.adminTitle') || '配给计划管理') : isCitizen ? ($t('warehouse.citizenTitle') || '我的配给份额') : '配给计划管理' }}
              </span>
            </div>
          </template>
          <div class="py-4">
            <RationPlanTab ref="rationPlanTabRef" />
          </div>
        </el-tab-pane>

        <!-- 2. 配送与交付 (代理网点收货、配送流水追踪、扫码签收) -->
        <el-tab-pane name="delivery">
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><Checked /></el-icon>
              <span class="font-bold">配送与交付</span>
            </div>
          </template>
          <div class="py-4">
            <DeliveryVerificationTab />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- P1 ~ P5 阶段规则实体验证抽屉 (代理可用) -->
    <P1P5VerificationDrawer v-if="isAgent" ref="verificationDrawerRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth.js';
import {
  Refresh,
  Checked,
  Calendar
} from '@element-plus/icons-vue';

// 仅保留配给计划管理与配送交付两个核心子模块
import RationPlanTab from './components/RationPlanTab.vue';
import DeliveryVerificationTab from './components/DeliveryVerificationTab.vue';

// P1~P5 阶段规则实体验证看板抽屉
import P1P5VerificationDrawer from './components/P1P5VerificationDrawer.vue';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);
const isAgent = computed(() => authStore.currentRole === 'agent');
const isCitizen = computed(() => authStore.currentRole === 'citizen');

const activeTab = ref('rationPlan');
const verificationDrawerRef = ref(null);
const rationPlanTabRef = ref(null);

function openVerificationDrawer() {
  verificationDrawerRef.value?.open();
}

function refreshAll() {
  rationPlanTabRef.value?.loadData?.();
  ElMessage.success('配给计划与供应链履约数据已同步更新！');
}
</script>

<style scoped>
.warehouse-custom-tabs :deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 16px;
  height: 44px;
}
</style>
