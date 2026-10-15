<template>
  <div class="family-agent-view space-y-4">
    <!-- 家庭代理：本人家庭签约代理与月度物资配送额度 (拆分后的公民独立大模块) -->
    <RationPlanTab @go-purchase="goPurchase" />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import RationPlanTab from '../warehouse/components/RationPlanTab.vue';

const route = useRoute();
const router = useRouter();

// 跳转到「配给购买」模块下单 (保留 layout/role 等 APP 模式参数)
function goPurchase() {
  const query = { ...route.query, tab: 'purchase' };
  router.push({ path: '/warehouse', query });
}
</script>
