<template>
  <section class="chat-order-picker flex-1 min-h-0 flex flex-col bg-[#F8FBF8]" :aria-label="t('chatOrders.orders')">
    <div class="flex justify-between items-center gap-2 p-3 bg-white border-b border-[#D9E5DB]">
      <h3 class="font-bold text-sm">{{ t('chatOrders.choose') }}</h3><button type="button" class="underline text-xs text-[#326445]" @click="emit('close')">{{ t('chatComplaint.back') }}</button>
    </div>
    <div class="flex-1 overflow-y-auto min-h-0 p-3 space-y-3">
      <el-input v-model="keyword" :placeholder="t('chatOrders.search')" :aria-label="t('chatOrders.search')" clearable />
      <el-button size="small" :loading="loading" @click="load">{{ t('common.refresh') }}</el-button>
      <p v-if="failed" role="alert">{{ t('citizenOrder.loadFailed') }}</p>
      <el-empty v-else-if="!loading && !filtered.length" :description="t('chatOrders.empty')" :image-size="48" />
      <article v-for="order in filtered" :key="order.orderId" class="space-y-2">
        <CustomerOrderCard :order="order" />
        <el-button type="primary" size="small" class="w-full" :disabled="busy" @click="emit('select', order)">{{ t('chatOrders.send') }}</el-button>
      </article>
    </div>
  </section>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCustomerOrders } from '../../api/complaint.js';
import CustomerOrderCard from './CustomerOrderCard.vue';
defineProps({ busy: Boolean });
const emit = defineEmits(['close', 'select']);
const { t, locale } = useI18n();
const rows = ref([]), keyword = ref(''), loading = ref(false), failed = ref(false);
const filtered = computed(() => rows.value.filter(order => order.orderId.toLowerCase().includes(keyword.value.trim().toLowerCase())));
let alive = true, version = 0;
async function load() {
  const current = ++version;
  loading.value = true; failed.value = false;
  try { const result = await getCustomerOrders(); if (alive && current === version) rows.value = result; }
  catch { if (alive && current === version) failed.value = true; }
  finally { if (alive && current === version) loading.value = false; }
}
watch(locale, load);
onMounted(load);
onBeforeUnmount(() => { alive = false; });
</script>
