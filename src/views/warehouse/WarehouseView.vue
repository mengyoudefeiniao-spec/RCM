<template>
  <div class="warehouse-view space-y-4">
    <!-- ============================================== -->
    <!-- 公民端：配给份额 (签约网点与历史批次申领记录，直接呈现，无选项卡) -->
    <!-- ============================================== -->
    <CitizenShareTab v-if="isCitizen" />

    <!-- ============================================== -->
    <!-- 代理端 APP 视口：配给配送 (仅呈现订单配送页，不显示选项卡与标题) -->
    <!-- ============================================== -->
    <OrderDispatchTab v-else-if="isAgent && isAppMode" />

    <!-- ============================================== -->
    <!-- 管理/代理端 (Web)：仅保留配给计划与配给仓库库存管理 -->
    <!-- ============================================== -->
    <div v-else class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
      <el-tabs v-model="activeTab" class="warehouse-custom-tabs px-3 sm:px-6">
        <el-tab-pane name="rationPlan">
          <template #label>
            <div class="flex items-center gap-2 py-1">
              <span class="h-6 w-6 rounded-md bg-[#E9F3EC] text-[#326445] flex items-center justify-center">
                <el-icon :size="14"><Calendar /></el-icon>
              </span>
              <span class="font-bold">{{ $t('warehouse.adminTitle') }}</span>
            </div>
          </template>
          <div class="py-4"><RationPlanTab /></div>
        </el-tab-pane>

        <el-tab-pane name="warehouseInventory">
          <template #label>
            <div class="flex items-center gap-2 py-1">
              <span class="h-6 w-6 rounded-md bg-[#FDF3E0] text-[#8A6818] flex items-center justify-center">
                <el-icon :size="14"><Warehouse /></el-icon>
              </span>
              <span class="font-bold">{{ $t('warehouseInventory.title') }}</span>
            </div>
          </template>
          <div class="py-4"><WarehouseInventoryTab /></div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Calendar, Warehouse } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/auth.js';
import RationPlanTab from './components/RationPlanTab.vue';
import CitizenShareTab from './components/CitizenShareTab.vue';
import OrderDispatchTab from './components/OrderDispatchTab.vue';
import WarehouseInventoryTab from './components/WarehouseInventoryTab.vue';

const route = useRoute();
const authStore = useAuthStore();
const isAgent = computed(() => authStore.currentRole === 'agent');
const isCitizen = computed(() => authStore.currentRole === 'citizen');

// APP 仿真视口判定 (与 AppLayout/AppMobileNav 保持一致的三级判定)
const isAppMode = computed(() => {
  if (route.query.layout === 'app') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

function resolveInitialTab(tabQuery) {
  if (['inventory', 'inventoryLedger', 'warehouseInventory'].includes(tabQuery)) return 'warehouseInventory';
  return 'rationPlan';
}

const activeTab = ref(resolveInitialTab(route.query.tab));

watch(() => route.query.tab, (newTab) => {
  activeTab.value = resolveInitialTab(newTab);
});
</script>

<style scoped>
.warehouse-custom-tabs :deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 16px;
  height: 44px;
}
</style>
