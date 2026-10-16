<template>
  <div class="family-agent-view space-y-4" :class="isAppMode ? '!space-y-3' : ''">
    <!-- 家庭代理：本人家庭签约代理与月度物资配送额度 (拆分后的公民独立大模块) -->
    <RationPlanTab @go-purchase="goPurchase" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RationPlanTab from '../warehouse/components/RationPlanTab.vue';

const route = useRoute();
const router = useRouter();

// 与 AgentInventoryLedger 等模块保持一致的 APP 视口判定
const isAppMode = computed(() => route.query.layout === 'app' || sessionStorage.getItem('rcm_layout_mode') === 'app');

// 跳转到「配给购买」模块下单 (保留 layout/role 等 APP 模式参数)
function goPurchase() {
  const query = { ...route.query, tab: 'purchase' };
  router.push({ path: '/warehouse', query });
}
</script>
