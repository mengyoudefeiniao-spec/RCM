<template>
  <div class="agent-orders-view space-y-4">
    <section class="rounded-xl border border-[#D9E5DB] bg-gradient-to-br from-[#F3F8F4] to-white p-4 shadow-sm sm:p-5 text-start">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-base font-bold text-[#1B432C]">{{ $t('agentDelivery.centerInfo') }}</h1>
        <div v-if="activeCenter" class="flex items-center gap-2">
          <span class="rounded-full bg-[#E0F0E4] px-2.5 py-1 text-xs font-semibold text-[#276141]">{{ $t('agentDelivery.activeCenter') }}</span>
          <el-dropdown v-if="availableCenters.length > 1" trigger="click" @command="selectCenter">
            <el-button size="small" type="primary" plain class="!m-0 !h-8" :aria-label="$t('agentDelivery.switchCenter')">
              {{ $t('agentDelivery.switchCenter') }} <el-icon class="ms-1"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="center in availableCenters" :key="center.id" :command="center.id" :disabled="center.id === activeCenter.id">
                  <span class="block max-w-64 truncate text-start">{{ displayCenterName(center) }}</span>
                  <bdi dir="ltr" class="ms-2 text-xs text-[#718277]">{{ center.centerId }}</bdi>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
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
    <AgentG2BPanel v-if="activeCenter" :selected-center="activeCenter" :selected-center-name="centerName" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowDown } from '@element-plus/icons-vue';
import { getMyAgentCenters } from '@/api/agent';
import AgentG2BPanel from './components/AgentG2BPanel.vue';

const { t, locale } = useI18n();
const centers = ref([]);
const savedCenterId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('rcm_agent_order_center_id') : null;
const selectedCenterId = ref(savedCenterId);
const availableCenters = computed(() => centers.value.filter((center) => center.isCurrentActive));
const activeCenter = computed(() => availableCenters.value.find((center) => center.id === selectedCenterId.value) || availableCenters.value[0] || null);
const isDemoCenter = computed(() => activeCenter.value?.id === 'FA-00128');
function displayCenterName(center) {
  if (center.id === 'FA-00128') return t('my.demoCenterName');
  if (center.id === 'FD-00129') return t('agentDelivery.demoSecondCenterName');
  return center.centerName || center.name;
}
const outletName = computed(() => isDemoCenter.value ? t('my.demoOutletName') : activeCenter.value?.id === 'FD-00129' ? t('agentDelivery.demoSecondOutletName') : activeCenter.value?.name || '');
const centerName = computed(() => activeCenter.value ? displayCenterName(activeCenter.value) : '');
const centerAddress = computed(() => isDemoCenter.value ? t('my.demoAgentAddress') : activeCenter.value?.id === 'FD-00129' ? t('agentDelivery.demoSecondAddress') : activeCenter.value?.address || '');
function selectCenter(centerId) {
  if (!availableCenters.value.some((center) => center.id === centerId)) return;
  selectedCenterId.value = centerId;
  sessionStorage.setItem('rcm_agent_order_center_id', centerId);
}
async function loadCenters() {
  try {
    const result = await getMyAgentCenters();
    centers.value = Array.isArray(result) ? result : (result?.data || []);
    if (activeCenter.value && selectedCenterId.value !== activeCenter.value.id) selectCenter(activeCenter.value.id);
  } catch { centers.value = []; }
}
onMounted(loadCenters);
watch(locale, loadCenters);
</script>
