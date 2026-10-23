<template>
  <section class="customer-order-card rounded-lg border border-[#D9E5DB] bg-[#F3F8F4] p-3 text-xs space-y-2 text-[#1F3326]" :data-order-id="order.orderId">
    <p class="font-bold"><span>{{ t('chatOrders.order') }}: </span><bdi dir="ltr">{{ order.orderId }}</bdi></p>
    <dl class="grid grid-cols-2 gap-2">
      <div><dt class="text-[#58685D]">{{ t('chatOrders.status') }}</dt><dd>{{ t('chatOrders.' + orderStatusKey(order)) }}</dd></div>
      <div><dt class="text-[#58685D]">{{ t('chatOrders.payment') }}</dt><dd>{{ t('chatOrders.' + (order.payStatus === 'PAID' ? 'paid' : order.payStatus === 'UNPAID' ? 'unpaid' : 'unknown')) }}</dd></div>
      <div><dt class="text-[#58685D]">{{ t('chatOrders.amount') }}</dt><dd dir="ltr">{{ orderPaidAmount(order) === null ? '—' : orderPaidAmount(order).toLocaleString(locale) + ' IQD' }}</dd></div>
      <div><dt class="text-[#58685D]">{{ t('chatOrders.delivery') }}</dt><dd>{{ t('chatOrders.' + (order.deliveryType === 'HOME_DELIVERY' ? 'home' : 'pickup')) }}</dd></div>
    </dl>
    <p>{{ t('chatOrders.outlet') }}: {{ order.agentId === 'FA-00128' ? t('chatOrders.station') : order.agentName }}</p>
    <ul class="space-y-1 border-t border-[#D9E5DB] pt-2">
      <li v-for="(item, index) in order.items || []" :key="index" class="flex justify-between gap-2"><span>{{ orderItemKey(item.itemCode) ? t('chatOrders.' + orderItemKey(item.itemCode)) : item.itemName || item.itemCode }}</span><bdi dir="ltr">{{ item.qty }} {{ item.unit }}</bdi></li>
    </ul>
    <p v-if="order.createdAt" class="text-[10px] text-[#58685D]">{{ t('chatOrders.created') }}: <bdi>{{ order.createdAt }}</bdi></p>
  </section>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
import { orderItemKey, orderStatusKey, orderPaidAmount } from '../../utils/customerOrders.js';
defineProps({ order: { type: Object, required: true } });
const { t, locale } = useI18n();
</script>
