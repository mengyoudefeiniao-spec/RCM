<template>
  <div class="warehouse-view space-y-4">
    <!-- ============================================== -->
    <!-- 公民端：配给购买 (拆分后独立大模块，直接呈现，无选项卡) -->
    <!-- ============================================== -->
    <CitizenPurchaseTab v-if="isCitizen" />

    <!-- ============================================== -->
    <!-- 代理端 APP 视口：配给配送 (仅呈现订单配送页，不显示选项卡与标题) -->
    <!-- ============================================== -->
    <OrderDispatchTab v-else-if="isAgent && isAppMode" />

    <!-- ============================================== -->
    <!-- 管理/代理端 (Web)：配给管理业务模块选项卡 -->
    <!-- ============================================== -->
    <div v-else class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
      <el-tabs v-model="activeTab" class="warehouse-custom-tabs px-3 sm:px-6">
        <!-- 1. 配给计划管理 (月度计划制定与上级/下级三层配额自动排程) -->
        <el-tab-pane name="rationPlan">
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><Calendar /></el-icon>
              <span class="font-bold">{{ $t('warehouse.adminTitle') || '配给计划管理' }}</span>
            </div>
          </template>
          <div class="py-4">
            <RationPlanTab ref="rationPlanTabRef" @go-purchase="activeTab = 'purchase'" />
          </div>
        </el-tab-pane>

        <!-- 2. 订单统计 (管理角色) 或 订单配送 (代理角色) -->
        <el-tab-pane name="orderStats">
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><DataAnalysis v-if="isAdmin" /><Van v-else /></el-icon>
              <span class="font-bold">
                {{ isAdmin ? ($t('warehouse.orderStats') || '订单统计') : ($t('agentOrders.tabTitle') || '订单配送') }}
              </span>
              <el-tag v-if="!isAdmin" size="small" type="danger" effect="plain" class="scale-90 origin-left">{{ $t('agentOrders.badgeNew') }}</el-tag>
            </div>
          </template>
          <div class="py-4">
            <OrderStatsTab v-if="isAdmin" />
            <OrderDispatchTab v-else />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- P1 ~ P5 阶段规则实体验证抽屉 (代理可用) -->
    <P1P5VerificationDrawer v-if="isAgent" ref="verificationDrawerRef" />
  </div>
</template>

<script setup>
import { isEnNow } from '../../utils/langHint.js';
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth.js';
import {
  Refresh,
  Calendar,
  ShoppingCart,
  Van,
  DataAnalysis
} from '@element-plus/icons-vue';

// 核心子模块
import RationPlanTab from './components/RationPlanTab.vue';
import CitizenPurchaseTab from './components/CitizenPurchaseTab.vue';
import OrderDispatchTab from './components/OrderDispatchTab.vue';
import OrderStatsTab from './components/OrderStatsTab.vue';

// P1~P5 阶段规则实体验证看板抽屉
import P1P5VerificationDrawer from './components/P1P5VerificationDrawer.vue';

const route = useRoute();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);
const isAgent = computed(() => authStore.currentRole === 'agent');
const isCitizen = computed(() => authStore.currentRole === 'citizen');

// APP 仿真视口判定 (与 AppLayout/AppMobileNav 保持一致的三级判定)
const isAppMode = computed(() => {
  if (route.query.layout === 'app') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

function resolveInitialTab(tabQuery) {
  if (tabQuery) {
    if (['delivery', 'dispatch', 'orders'].includes(tabQuery)) return 'orderStats';
    return tabQuery;
  }
  return isCitizen.value ? 'purchase' : 'rationPlan';
}

const activeTab = ref(resolveInitialTab(route.query.tab));

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = resolveInitialTab(newTab);
  }
});
const verificationDrawerRef = ref(null);
const rationPlanTabRef = ref(null);

function openVerificationDrawer() {
  verificationDrawerRef.value?.open();
}

function refreshAll() {
  rationPlanTabRef.value?.loadData?.();
  ElMessage.success((isEnNow() ? 'Ration plan and supply chain fulfillment data synchronized!' : '配给计划与供应链履约数据已同步更新！'));
}
</script>

<style scoped>
.warehouse-custom-tabs :deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 16px;
  height: 44px;
}
</style>
