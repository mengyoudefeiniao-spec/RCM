<template>
  <main class="mx-auto w-full max-w-4xl space-y-4 p-3 pb-6 text-start sm:p-6">
    <button type="button" class="inline-flex items-center gap-2 text-sm font-semibold text-[#2F6D49]" @click="goBack">
      <el-icon class="rtl:scale-x-[-1]"><ArrowLeft /></el-icon>
      {{ $t('citizenOrder.backToRecords') }}
    </button>

    <div v-loading="loading" class="min-h-64 space-y-4">
      <div v-if="error" class="rounded-xl border border-[#E9D9D6] bg-white p-6 text-[#A53A2D]">{{ error }}</div>
      <template v-else-if="order">
        <!-- 订单概览 -->
        <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h1 class="text-lg font-bold text-[#183B28] sm:text-xl">{{ $t('citizenOrder.title') }}</h1>
              <bdi dir="ltr" class="mt-1 block break-all font-mono text-sm text-[#607368]">{{ order.orderId }}</bdi>
            </div>
            <span class="rounded-full bg-[#E9F3EB] px-3 py-1 text-xs font-semibold text-[#276141]">{{ statusLabel }}</span>
          </div>
          <div class="mt-4 grid gap-3 border-t border-[#E5EEE7] pt-4 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="font-semibold text-[#183B28]">{{ order.headName || '—' }}</span>
                <bdi dir="ltr" class="font-mono text-[#526A59]">{{ order.phone || '—' }}</bdi>
              </div>
              <p class="mt-1 break-words text-[#526A59]">{{ order.deliveryAddress || '—' }}</p>
            </div>
            <div class="text-xs text-[#718277] sm:text-end">
              <span class="block">{{ $t('citizenOrder.householdSize') }}</span>
              <span class="mt-1 block"><bdi class="font-mono font-bold text-[#183B28]">{{ order.memberCount ?? '—' }}</bdi></span>
            </div>
          </div>
          <div v-if="order.deliveryType === 'PICKUP' && order.pickupCode" class="mt-4 rounded-lg border border-[#C7DED0] bg-[#F3F8F4] p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs text-[#526A59]">{{ $t('citizenOrder.pickupCode') }}</div>
                <bdi dir="ltr" class="mt-0.5 block break-all font-mono text-base font-bold tracking-wider text-[#1B3123]">{{ order.pickupCode }}</bdi>
              </div>
              <el-button size="small" type="primary" plain @click="copyPickupCode">
                <el-icon class="me-1"><CopyDocument /></el-icon>{{ $t('citizenOrder.copyCode') }}
              </el-button>
            </div>
            <p class="mt-1.5 text-[11px] text-[#718277]">{{ $t('citizenOrder.pickupCodeHint') }}</p>
          </div>
        </section>

        <!-- 配送进度时间线 -->
        <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm sm:p-6">
          <h2 class="mb-4 font-bold text-[#183B28]">{{ $t('citizenOrder.progressTitle') }}</h2>
          <ol class="space-y-0">
            <li v-for="(step, index) in progressSteps" :key="step.labelKey" class="flex gap-3">
              <div class="flex flex-col items-center">
                <span class="flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors" :class="stepRingClass(step.state)">
                  <el-icon v-if="step.state === 'done'" :size="14"><Check /></el-icon>
                  <span v-else class="size-2 rounded-full" :class="step.state === 'current' ? 'bg-[#2F7A50]' : 'bg-[#A7B6AB]'"></span>
                </span>
                <span
                  v-if="index < progressSteps.length - 1"
                  class="my-1 w-0.5 flex-1 rounded-full"
                  :class="step.state === 'done' ? 'bg-[#2F7A50]' : 'bg-[#E5EEE7]'"
                ></span>
              </div>
              <div class="min-w-0 flex-1" :class="index === progressSteps.length - 1 ? 'pb-0' : 'pb-4'">
                <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                  <span class="text-sm font-semibold" :class="step.state === 'pending' ? 'text-[#8A9A8F]' : 'text-[#1F3326]'">{{ $t(step.labelKey) }}</span>
                  <bdi v-if="step.time" dir="ltr" class="text-[11px] text-[#8A9A8F]">{{ formatDateTime(step.time) }}</bdi>
                </div>
                <p class="mt-0.5 text-xs leading-relaxed" :class="step.state === 'pending' ? 'text-[#A7B6AB]' : 'text-[#58685D]'">{{ $t(step.hintKey) }}</p>
              </div>
            </li>
          </ol>
        </section>

        <!-- 物资明细与订单信息 -->
        <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm sm:p-6">
          <h2 class="mb-4 font-bold text-[#183B28]">{{ $t('citizenOrder.itemList') }}</h2>
          <div class="divide-y divide-[#E5EEE7]">
            <div v-for="item in order.items || []" :key="item.itemCode || item.itemName" class="flex items-center justify-between gap-3 py-2 text-sm">
              <span class="min-w-0 break-words">{{ formatRationItem(item) }}</span>
              <bdi dir="ltr" class="shrink-0 font-mono font-semibold">{{ item.qty }} {{ item.unit }}</bdi>
            </div>
          </div>
          <dl class="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-[#E5EEE7] pt-4 text-sm">
            <dt class="text-[#718277]">{{ $t('citizenOrder.rationCard') }}</dt>
            <dd class="min-w-0 break-all"><bdi dir="ltr">{{ order.cardNo || '—' }}</bdi></dd>
            <dt class="text-[#718277]">{{ $t('citizenOrder.deliveryMethod') }}</dt>
            <dd>{{ $t(order.deliveryType === 'HOME_DELIVERY' ? 'citizenOrder.typeDelivery' : 'citizenOrder.typePickup') }}</dd>
            <dt class="text-[#718277]">{{ $t('citizenOrder.orderTime') }}</dt>
            <dd><bdi dir="ltr">{{ formatText(order.createdAt) }}</bdi></dd>
            <template v-if="order.totalWeightKg">
              <dt class="text-[#718277]">{{ $t('citizenOrder.totalWeight') }}</dt>
              <dd><bdi dir="ltr">{{ order.totalWeightKg }} kg</bdi></dd>
            </template>
            <dt class="text-[#718277]">{{ $t('citizenOrder.paymentAmount') }}</dt>
            <dd><bdi dir="ltr">{{ Number(order.selfPayAmount || order.amount || 0).toLocaleString() }} IQD</bdi></dd>
            <template v-if="order.subsidyAmount">
              <dt class="text-[#718277]">{{ $t('citizenOrder.subsidyAmount') }}</dt>
              <dd><bdi dir="ltr">{{ Number(order.subsidyAmount).toLocaleString() }} IQD</bdi></dd>
            </template>
            <template v-if="order.notes">
              <dt class="text-[#718277]">{{ $t('citizenOrder.orderNotes') }}</dt>
              <dd class="break-words">{{ order.notes }}</dd>
            </template>
            <template v-if="order.dispatchInfo">
              <dt class="text-[#718277]">{{ $t('citizenOrder.courier') }}</dt>
              <dd class="break-words">{{ order.dispatchInfo.deliveryPerson || '—' }}</dd>
              <dt class="text-[#718277]">{{ $t('citizenOrder.vehicle') }}</dt>
              <dd><bdi dir="ltr">{{ order.dispatchInfo.vehicleNo || '—' }}</bdi></dd>
            </template>
            <template v-if="order.deliveredAt">
              <dt class="text-[#718277]">{{ $t('citizenOrder.deliveredAt') }}</dt>
              <dd><bdi dir="ltr">{{ formatText(order.deliveredAt) }}</bdi></dd>
            </template>
            <template v-if="order.claimVoucherNo">
              <dt class="text-[#718277]">{{ $t('citizenOrder.claimVoucher') }}</dt>
              <dd class="min-w-0 break-all"><bdi dir="ltr">{{ order.claimVoucherNo }}</bdi></dd>
            </template>
          </dl>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Check, CopyDocument } from '@element-plus/icons-vue';
import { getCitizenPurchaseOrder } from '../../api/citizen.js';
import { useRationI18n } from '../../utils/rationI18n.js';

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { formatRationItem } = useRationI18n();

const loading = ref(true);
const error = ref('');
const order = ref(null);

// 状态口径与「申领记录」列表保持一致：完成/配送中/备货就绪单独显示，其余按履约方式显示待提货或待配送
const statusLabel = computed(() => {
  const status = order.value?.status;
  if (status === 'DELIVERED') return t('citizenOrder.statusDelivered');
  if (status === 'DISPATCHED') return t('citizenOrder.statusDispatched');
  if (status === 'READY_FOR_PICKUP') return t('citizenOrder.statusReadyPickup');
  return t(order.value?.deliveryType === 'PICKUP' ? 'citizenOrder.statusPendingPickup' : 'citizenOrder.statusPendingDelivery');
});

// 四个阶段：下单 → 备货 → 交接（待提货/配送中）→ 完成（已提货/已送达）
const stepStates = computed(() => {
  switch (order.value?.status) {
    case 'DELIVERED':
      return ['done', 'done', 'done', 'done'];
    case 'DISPATCHED':
    case 'READY_FOR_PICKUP':
      return ['done', 'done', 'current', 'pending'];
    case 'PAID':
    case 'PENDING_PICKUP':
    case 'PENDING_DELIVERY':
    default:
      return ['done', 'current', 'pending', 'pending'];
  }
});

const progressSteps = computed(() => {
  if (!order.value) return [];
  const isPickup = order.value.deliveryType === 'PICKUP';
  const isDelivered = order.value.status === 'DELIVERED';
  const definitions = [
    { labelKey: 'citizenOrder.stepOrdered', hintKey: 'citizenOrder.hintOrdered', time: order.value.createdAt },
    { labelKey: 'citizenOrder.stepPacking', hintKey: 'citizenOrder.hintPacking', time: null },
    isPickup
      ? { labelKey: 'citizenOrder.stepReadyPickup', hintKey: 'citizenOrder.hintReadyPickup', time: order.value.dispatchInfo?.dispatchedAt }
      : { labelKey: 'citizenOrder.stepDelivering', hintKey: 'citizenOrder.hintDelivering', time: order.value.dispatchInfo?.dispatchedAt },
    isPickup
      ? { labelKey: 'citizenOrder.stepPickedUp', hintKey: 'citizenOrder.hintPickedUp', time: isDelivered ? order.value.deliveredAt : null }
      : { labelKey: 'citizenOrder.stepDelivered', hintKey: 'citizenOrder.hintDelivered', time: isDelivered ? order.value.deliveredAt : null }
  ];
  return definitions.map((step, index) => ({ ...step, state: stepStates.value[index] }));
});

function stepRingClass(state) {
  if (state === 'done') return 'border-[#2F7A50] bg-[#2F7A50] text-white';
  if (state === 'current') return 'border-[#2F7A50] bg-white';
  return 'border-[#D9E5DB] bg-white';
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return String(value);
  const language = { zh: 'zh-CN', en: 'en-GB', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-GB';
  return new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function formatText(value) {
  return String(value || '').replace('T', ' ').slice(0, 16);
}

async function copyPickupCode() {
  const code = order.value?.pickupCode;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    ElMessage.success(t('citizenOrder.copySuccess'));
  } catch {
    ElMessage.info(code);
  }
}

async function loadOrder() {
  loading.value = true;
  error.value = '';
  try {
    order.value = await getCitizenPurchaseOrder(route.params.orderId);
    if (!order.value) throw new Error('Order not found');
  } catch {
    order.value = null;
    error.value = t('citizenOrder.loadFailed');
  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.replace({ path: '/warehouse', query: { role: 'citizen', layout: route.query.layout || 'app' } });
}

onMounted(loadOrder);
watch(() => route.params.orderId, loadOrder);
</script>
