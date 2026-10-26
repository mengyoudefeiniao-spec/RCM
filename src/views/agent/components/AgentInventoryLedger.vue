<template>
  <div v-loading="loading" class="agent-inventory-ledger space-y-4 text-xs text-[#1F3326]">
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 space-y-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div><h2 class="text-base font-bold">{{ t('agentProcurement.title') }}</h2><p class="mt-1 max-w-3xl text-xs leading-relaxed text-[#58685D]">{{ t('agentProcurement.hint') }}</p></div>
        <div class="flex flex-wrap items-center gap-2">
          <el-select v-model="agentId" filterable class="!w-52" :aria-label="t('agentFinance.centerLabel')">
            <el-option value="ALL" :label="t('agentProcurement.allOutlets')" />
            <el-option v-for="center in centers" :key="center.id" :value="center.id" :label="outletName(center)" />
          </el-select>
          <el-button :loading="loading" @click="load">{{ t('common.refresh') }}</el-button>
        </div>
      </div>
      <p class="text-[11px] text-[#58685D]">{{ t('agentProcurement.orders', { count: summary.orderCount }) }}</p>
    </section>
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <section class="rounded-xl border border-[#D9E5DB] bg-white p-3 space-y-2" data-ledger-kpi="purchases"><h3 class="text-[#58685D]">{{ t('agentProcurement.ordered') }}</h3><bdi class="block text-lg font-bold" dir="ltr">{{ number(summary.purchaseAmount) }} IQD</bdi></section>
      <section class="rounded-xl border border-[#D9E5DB] bg-white p-3 space-y-2" data-ledger-kpi="paid"><h3 class="text-[#58685D]">{{ t('agentProcurement.paid') }}</h3><bdi class="block text-lg font-bold text-[#326445]" dir="ltr">{{ number(summary.paidAmount) }} IQD</bdi><p>{{ t('agentProcurement.payable') }}: <bdi>{{ number(summary.payableAmount) }} IQD</bdi></p></section>
      <section class="rounded-xl border border-[#D9E5DB] bg-white p-3 space-y-2" data-ledger-kpi="on-hand"><h3 class="text-[#58685D]">{{ t('agentProcurement.onHand') }}</h3><bdi class="block text-lg font-bold" dir="ltr">{{ number(total('currentOnHand', 'KG')) }} KG</bdi><bdi dir="ltr">{{ number(total('currentOnHand', 'L')) }} L</bdi></section>
      <section class="rounded-xl border border-[#D9E5DB] bg-white p-3 space-y-2" data-ledger-kpi="pending"><h3 class="text-[#58685D]">{{ t('agentProcurement.pending') }}</h3><bdi class="block text-lg font-bold text-[#7A5F21]" dir="ltr">{{ number(total('pendingReceipt', 'KG')) }} KG</bdi><bdi dir="ltr">{{ number(total('pendingReceipt', 'L')) }} L</bdi></section>
    </div>
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-3 sm:p-4">
      <el-table :data="rows" border class="w-full" :empty-text="t('agentProcurement.noRecords')">
        <el-table-column :label="t('agentProcurement.item')" min-width="155"><template #default="{ row }">{{ t('businessRules.items.' + row.itemCode) }}</template></el-table-column>
        <el-table-column v-for="column in columns" :key="column.field" :label="t('agentProcurement.' + column.label)" min-width="130" align="right"><template #default="{ row }"><bdi dir="ltr">{{ number(row[column.field]) }} {{ row.unit }}</bdi></template></el-table-column>
      </el-table>
    </section>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { getG2BPurchaseOrders, getAgentLocalStocks, getMyAgentCenters } from '../../../api/agent.js';
import { procurementSummary } from '../../../utils/agentProcurement.js';
import { useAgentDataRefresh } from '../../../composables/useAgentDataRefresh.js';
const { t, locale } = useI18n();
const orders = ref([]), stocks = ref([]), centers = ref([]), loading = ref(false), agentId = ref('ALL');
const filteredOrders = computed(() => orders.value.filter(order => agentId.value === 'ALL' || order.agentId === agentId.value));
const summary = computed(() => procurementSummary(filteredOrders.value));
const columns = [{ field: 'orderedQty', label: 'quantity' }, { field: 'pendingReceipt', label: 'pending' }, { field: 'g2bTotalIn', label: 'received' }, { field: 'currentOnHand', label: 'onHand' }, { field: 'b2cTotalSold', label: 'sold' }, { field: 'lossDamaged', label: 'losses' }];
const rows = computed(() => {
  const result = new Map();
  for (const stock of stocks.value.filter(stock => agentId.value === 'ALL' || stock.agentId === agentId.value)) {
    if (!result.has(stock.itemCode)) result.set(stock.itemCode, { itemCode: stock.itemCode, unit: stock.itemCode === 'OIL-SUN-03' ? 'L' : 'KG', ...Object.fromEntries(columns.map(column => [column.field, 0])) });
    const row = result.get(stock.itemCode);
    for (const column of columns) row[column.field] += Number(stock[column.field] || 0);
  }
  return [...result.values()];
});
const total = (field, unit) => rows.value.filter(row => row.unit === unit).reduce((sum, row) => sum + Number(row[field] || 0), 0);
const number = value => Number(value || 0).toLocaleString(locale.value);
const outletName = center => center.id === 'FA-00128' ? t('my.demoOutletName') : center.id === 'FD-00129' ? t('agentDelivery.demoSecondOutletName') : center.name;
let alive = true, version = 0;
async function load() {
  const request = ++version;
  loading.value = true;
  try {
    const [purchaseOrders, stockRows, outletRows] = await Promise.all([getG2BPurchaseOrders({}), getAgentLocalStocks(), getMyAgentCenters()]);
    if (!alive || request !== version) return;
    orders.value = purchaseOrders; stocks.value = stockRows; centers.value = outletRows;
  } catch { if (alive) ElMessage.error(t('agentProcurement.loadFailed')); }
  finally { if (alive && request === version) loading.value = false; }
}
useAgentDataRefresh(load);
watch(locale, load);
onMounted(load);
onBeforeUnmount(() => { alive = false; version++; });
</script>
