<template>
  <div class="agent-orders-view space-y-4">
    <section class="rounded-xl border border-[#D9E5DB] bg-gradient-to-br from-[#F3F8F4] to-white p-4 shadow-sm sm:p-5 text-start">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-base font-bold text-[#1B432C]">{{ $t('agentDelivery.centerInfo') }}</h1>
        <span v-if="activeCenter" class="rounded-full bg-[#E0F0E4] px-2.5 py-1 text-xs font-semibold text-[#276141]">{{ $t('agentDelivery.activeCenter') }}</span>
      </div>
      <div v-if="activeCenter" class="space-y-3">
        <div>
          <p class="text-xs text-[#718277]">{{ $t('agentDelivery.outletInfo') }}</p>
          <p class="mt-0.5 font-semibold text-[#183B28]">{{ outletName }}</p>
          <p class="mt-1 text-sm text-[#526A59]">{{ centerName }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3 border-t border-[#DFEAE1] pt-3 text-xs sm:grid-cols-4">
          <div><span class="block text-[#718277]">{{ $t('agentDelivery.centerCode') }}</span><bdi dir="ltr" class="mt-1 block font-mono font-bold text-[#183B28]">{{ activeCenter.centerId }}</bdi></div>
          <div><span class="block text-[#718277]">{{ $t('agentDelivery.centerPhone') }}</span><bdi dir="ltr" class="mt-1 block font-mono font-bold text-[#183B28]">{{ activeCenter.phone || '—' }}</bdi></div>
          <div><span class="block text-[#718277]">{{ $t('agentDelivery.centerHouseholds') }}</span><bdi dir="ltr" class="mt-1 block font-mono font-bold text-[#183B28]">{{ activeCenter.householdsCount ?? '—' }}</bdi></div>
          <div><span class="block text-[#718277]">{{ $t('agentDelivery.centerCapacity') }}</span><bdi dir="ltr" class="mt-1 block font-mono font-bold text-[#183B28]">{{ activeCenter.maxCap ?? '—' }}</bdi></div>
        </div>
        <p class="text-xs text-[#526A59]">{{ $t('agentDelivery.centerAddress') }}: {{ centerAddress }}</p>
      </div>
      <p v-else class="text-sm text-[#718277]">{{ $t('agentDelivery.noCenter') }}</p>
    </section>
    <!-- 代理订单：拆分后的代理端独立大模块 (集中采购订货流水) -->
    <AgentG2BPanel />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMyAgentCenters } from '@/api/agent';
import AgentG2BPanel from './components/AgentG2BPanel.vue';

const { t, locale } = useI18n();
const centers = ref([]);
const activeCenter = computed(() => centers.value.find((center) => center.isCurrentActive) || centers.value[0] || null);
const isDemoCenter = computed(() => activeCenter.value?.id === 'FA-00128');
const outletName = computed(() => isDemoCenter.value ? t('my.demoOutletName') : activeCenter.value?.name || '');
const centerName = computed(() => isDemoCenter.value ? t('my.demoCenterName') : activeCenter.value?.centerName || '');
const centerAddress = computed(() => isDemoCenter.value ? t('my.demoAgentAddress') : activeCenter.value?.address || '');
async function loadCenters() {
  try {
    const result = await getMyAgentCenters();
    centers.value = Array.isArray(result) ? result : (result?.data || []);
  } catch { centers.value = []; }
}
onMounted(loadCenters);
watch(locale, loadCenters);
</script>
