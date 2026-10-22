<template>
  <main class="mx-auto w-full max-w-7xl space-y-4 p-3 sm:p-6 text-start">
    <button type="button" class="inline-flex items-center gap-2 text-sm font-semibold text-[#2F6D49]" @click="goBack">
      <el-icon class="rtl:scale-x-[-1]"><ArrowLeft /></el-icon>
      {{ $t('agentDelivery.backToOrders') }}
    </button>

    <div v-loading="loading" class="min-h-64 space-y-4">
      <div v-if="error" class="rounded-xl border border-[#E9D9D6] bg-white p-6 text-[#A53A2D]">{{ error }}</div>
      <template v-else-if="order">
        <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 class="text-xl font-bold text-[#183B28]">{{ $t('agentDelivery.detailTitle') }}</h1>
              <bdi dir="ltr" class="mt-1 block font-mono text-sm text-[#607368]">{{ order.orderId }}</bdi>
            </div>
            <div class="rounded-full bg-[#E9F3EB] px-3 py-1 text-xs font-semibold text-[#276141]">{{ statusLabel }}</div>
          </div>
          <div class="mt-4 grid gap-3 border-t border-[#E5EEE7] pt-4 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="font-semibold text-[#183B28]">{{ localizedField('recipient', order.headName) }}</span>
                <bdi dir="ltr" class="font-mono text-[#526A59]">{{ order.phone || '—' }}</bdi>
              </div>
              <p class="mt-1 break-words text-[#526A59]">{{ localizedField('address', order.deliveryAddress) }}</p>
            </div>
            <div class="text-xs text-[#718277] sm:text-end">
              <span class="block">{{ $t('agentDelivery.householdSize') }}</span>
              <bdi dir="ltr" class="mt-1 block font-mono font-bold text-[#183B28]">{{ order.memberCount ?? '—' }}</bdi>
            </div>
          </div>
          <div v-if="priority.rank <= 1" class="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#FFF1E8] p-3 text-sm font-bold text-[#A53A2D]">
            <span>{{ $t(priority.rank === 0 ? 'agentDelivery.priorityOverdue' : 'agentDelivery.prioritySoon') }}</span>
            <bdi v-if="priority.dueAt" dir="ltr">{{ formatDate(priority.dueAt) }}</bdi>
          </div>
          <div v-if="priority.dueAt" class="mt-3 text-xs text-[#76877C]">
            {{ $t('agentDelivery.expectedBy') }}: <bdi dir="ltr">{{ formatDate(priority.dueAt) }}</bdi>
            <span v-if="priority.estimated"> · {{ $t('agentDelivery.estimatedDeadline') }}</span>
          </div>
        </section>

        <section class="rounded-xl border border-[#D9E5DB] bg-white p-2 shadow-sm sm:p-4">
          <div class="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 sm:px-1">
            <h2 class="font-bold text-[#183B28]">{{ $t('agentDelivery.mapTitle') }}</h2>
            <span class="text-xs text-[#607368]">{{ $t(hasExactLocation ? 'agentDelivery.exactLocation' : hasLocation ? 'agentDelivery.approximateLocation' : 'agentDelivery.mapUnavailable') }}</span>
          </div>
          <div ref="mapElement" dir="ltr" class="h-[54vh] min-h-[360px] w-full overflow-hidden rounded-lg bg-[#E9F1EB] sm:h-[64vh] lg:h-[68vh] lg:max-h-[760px]" />
          <p v-if="hasExactLocation" class="px-2 pt-2 text-xs text-[#607368]">{{ $t('agentDelivery.coordinates') }}: <bdi dir="ltr">{{ mapPosition.lat.toFixed(5) }}, {{ mapPosition.lng.toFixed(5) }}</bdi></p>
        </section>

        <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm sm:p-6">
          <h2 class="mb-4 font-bold text-[#183B28]">{{ $t('agentDelivery.orderItems') }}</h2>
          <div class="divide-y divide-[#E5EEE7]">
            <div v-for="item in order.items || []" :key="item.itemCode || item.itemName" class="flex items-center justify-between gap-3 py-2 text-sm">
              <span>{{ formatItem(item) }}</span><bdi dir="ltr" class="shrink-0 font-mono font-semibold">{{ item.qty }} {{ item.unit }}</bdi>
            </div>
          </div>
          <dl class="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-[#E5EEE7] pt-4 text-sm">
            <dt class="text-[#718277]">{{ $t('agentDelivery.rationCard') }}</dt><dd><bdi dir="ltr">{{ order.cardNo || '—' }}</bdi></dd>
            <dt class="text-[#718277]">{{ $t('agentDelivery.orderNotes') }}</dt><dd class="break-words">{{ displayNotes }}</dd>
            <dt class="text-[#718277]">{{ $t('agentDelivery.orderTime') }}</dt><dd><bdi dir="ltr">{{ order.createdAt || '—' }}</bdi></dd>
            <dt class="text-[#718277]">{{ $t('agentDelivery.deliveryMethod') }}</dt><dd>{{ $t(order.deliveryType === 'HOME_DELIVERY' ? 'agentOrders.typeDelivery' : 'agentOrders.typePickup') }}</dd>
            <dt class="text-[#718277]">{{ $t('agentDelivery.paymentAmount') }}</dt><dd><bdi dir="ltr">{{ Number(order.selfPayAmount || 0).toLocaleString() }} IQD</bdi></dd>
            <template v-if="order.dispatchInfo">
              <dt class="text-[#718277]">{{ $t('agentDelivery.courier') }}</dt><dd>{{ localizedField('courier', order.dispatchInfo.deliveryPerson) }}</dd>
              <dt class="text-[#718277]">{{ $t('agentDelivery.vehicle') }}</dt><dd><bdi dir="ltr">{{ order.dispatchInfo.vehicleNo || '—' }}</bdi></dd>
            </template>
          </dl>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowLeft } from '@element-plus/icons-vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAgentCitizenOrder } from '@/api/agent';
import { deliveryPriority } from '@/utils/deliveryPriority';
import { resolveOrderNote } from '@/utils/orderNotes';

const route = useRoute();
const router = useRouter();
const { t, te, locale } = useI18n();
const loading = ref(true);
const error = ref('');
const order = ref(null);
const mapElement = ref(null);
let map;
const priority = computed(() => order.value ? deliveryPriority(order.value) : { rank: 3 });
const hasLocation = computed(() => Number.isFinite(Number(order.value?.deliveryLocation?.lat)) && Number.isFinite(Number(order.value?.deliveryLocation?.lng)) && order.value?.deliveryLocation?.lat != null && order.value?.deliveryLocation?.lng != null);
const hasExactLocation = computed(() => order.value?.deliveryLocation?.accuracy === 'exact');
const mapPosition = computed(() => {
  const location = order.value?.deliveryLocation;
  return hasLocation.value ? { lat: Number(location.lat), lng: Number(location.lng) } : { lat: 33.2232, lng: 43.6793 };
});
function localizedField(field, fallback) {
  const demoId = String(order.value?.orderId || '').match(/^PO-20261013-(100[123])$/)?.[1];
  const key = demoId ? `agentDelivery.demoOrders.${demoId}.${field}` : '';
  return key && te(key) ? t(key) : fallback || '—';
}
// 系统默认备注按当前界面语言渲染（演示订单优先使用专属词条）
const displayNotes = computed(() => {
  const demoId = String(order.value?.orderId || '').match(/^PO-20261013-(100[123])$/)?.[1];
  const key = demoId ? `agentDelivery.demoOrders.${demoId}.notes` : '';
  if (key && te(key)) return t(key);
  return resolveOrderNote(order.value, t) || '—';
});
const statusLabel = computed(() => {
  const key = { PAID: 'filterPending', PENDING_DELIVERY: 'filterPending', PENDING_PICKUP: 'filterPending', DISPATCHED: 'filterDispatched', READY_FOR_PICKUP: 'filterReadyPickup', DELIVERED: 'filterDelivered' }[order.value?.status] || 'filterPending';
  return t(`agentOrders.${key}`);
});
const itemLabels = {
  'FLOUR-WHT-02': { zh: '小麦面粉', en: 'Wheat flour', ar: 'طحين القمح', ckb: 'ئاردی گەنم' },
  'RICE-BAS-01': { zh: '长粒大米', en: 'Long-grain rice', ar: 'أرز طويل الحبة', ckb: 'برنجی دەنک درێژ' },
  'OIL-SUN-03': { zh: '食用油', en: 'Cooking oil', ar: 'زيت الطعام', ckb: 'ڕۆنی خواردن' }
};
function formatItem(item) { return itemLabels[item.itemCode]?.[locale.value] || item.itemName; }
function formatDate(value) { return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : locale.value === 'ckb' ? 'ckb-IQ' : locale.value === 'ar' ? 'ar-IQ' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(value); }
function goBack() {
  if (window.history.length > 1) router.back();
  else router.replace({ path: '/warehouse', query: { role: 'agent', layout: route.query.layout || 'app' } });
}
function renderMap() {
  if (!mapElement.value || !order.value) return;
  map?.remove();
  map = L.map(mapElement.value, { attributionControl: true }).setView([mapPosition.value.lat, mapPosition.value.lng], hasLocation.value ? hasExactLocation.value ? 15 : 12 : 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  if (hasLocation.value) L.circleMarker([mapPosition.value.lat, mapPosition.value.lng], { radius: 9, color: '#1F6842', fillColor: '#2F7A50', fillOpacity: 0.9 }).addTo(map);
  window.setTimeout(() => map?.invalidateSize(), 0);
}
async function loadOrder() {
  loading.value = true;
  error.value = '';
  try {
    order.value = await getAgentCitizenOrder(route.params.orderId);
    await nextTick();
    renderMap();
  } catch {
    order.value = null;
    error.value = t('agentDelivery.detailLoadFailed');
  } finally {
    loading.value = false;
  }
}
onMounted(loadOrder);
watch(() => route.params.orderId, loadOrder);
onBeforeUnmount(() => { map?.remove(); map = null; });
</script>
