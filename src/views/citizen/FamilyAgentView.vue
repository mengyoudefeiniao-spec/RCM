<template>
  <div class="family-agent-view space-y-4" :class="isAppMode ? '!space-y-3' : ''">
    <!-- 家庭代理：本人家庭签约代理与月度物资配送额度 (拆分后的公民独立大模块) -->
    <RationPlanTab :show-citizen-quota-details="false" @go-purchase="goPurchase" />

    <section class="rounded-lg border border-[#D9E5DB]/80 bg-white p-4 shadow-xs space-y-3" aria-labelledby="citizen-promotions-title">
      <div>
        <h2 id="citizen-promotions-title" class="text-sm font-bold text-[#1B3123]">{{ $t('citizenPurchase.promotionsTitle') }}</h2>
        <p class="mt-0.5 text-[11px] text-[#8A9A8F]">{{ $t('citizenPurchase.promotionsSubtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article v-for="promotion in promotions" :key="promotion.title" class="rounded-lg border p-3.5 space-y-2" :class="promotion.government ? 'border-[#C7DED0] bg-[#F3F8F4]' : 'border-[#F2E3C6] bg-[#FDF9F0]'">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wide" :class="promotion.government ? 'text-[#326445]' : 'text-[#8A6828]'">{{ $t(promotion.government ? 'citizenPurchase.governmentPromotion' : 'citizenPurchase.agentPromotion') }}</span>
            <span class="text-[10px] text-[#8A9A8F]">{{ $t(promotion.validity) }}</span>
          </div>
          <h3 class="text-xs font-bold text-[#1B3123]">{{ $t(promotion.title) }}</h3>
          <p class="text-[11px] leading-relaxed text-[#58685D]">{{ $t(promotion.description) }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RationPlanTab from '../warehouse/components/RationPlanTab.vue';

const route = useRoute();
const router = useRouter();
const promotions = [
  { government: false, title: 'citizenPurchase.agentPromotion1Title', description: 'citizenPurchase.agentPromotion1Description', validity: 'citizenPurchase.agentPromotionValidity' },
  { government: true, title: 'citizenPurchase.governmentPromotionTitle', description: 'citizenPurchase.governmentPromotionDescription', validity: 'citizenPurchase.governmentPromotionValidity' }
];

// 与 AgentInventoryLedger 等模块保持一致的 APP 视口判定
const isAppMode = computed(() => route.query.layout === 'app' || sessionStorage.getItem('rcm_layout_mode') === 'app');

// 跳转到「配给购买」模块下单 (保留 layout/role 等 APP 模式参数)
function goPurchase() {
  const query = { ...route.query, tab: 'purchase' };
  router.push({ path: '/warehouse', query });
}
</script>
