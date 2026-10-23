<template>
  <div class="complaint-evidence space-y-3">
    <div v-if="ticket.relatedOrder" class="space-y-2"><h4 class="text-xs font-bold text-[#326445]">{{ t('chatOrders.related') }}</h4><CustomerOrderCard :order="ticket.relatedOrder" /></div>
    <div v-if="ticket.photos?.length" class="space-y-2">
      <h4 class="text-xs font-bold text-[#326445]">{{ t('chatOrders.evidence') }}</h4>
      <div v-loading="loading" class="flex flex-wrap gap-2 min-h-14">
        <el-image v-for="photo in photos" :key="photo.id" :src="photo.dataUrl" :alt="photo.name" :preview-src-list="photos.map(item => item.dataUrl)" :initial-index="photos.indexOf(photo)" preview-teleported fit="cover" class="w-20 h-20 rounded-lg border border-[#D9E5DB]" />
      </div>
      <div v-if="failed" role="alert" class="text-xs"><span>{{ t('chatOrders.photoFailed') }}</span> <el-button size="small" @click="load">{{ t('chatOrders.retry') }}</el-button></div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { getComplaintPhoto } from '../../api/complaint.js';
import CustomerOrderCard from './CustomerOrderCard.vue';
const props = defineProps({ ticket: { type: Object, required: true } });
const { t } = useI18n();
const photos = ref([]), failed = ref(false), loading = ref(false);
let alive = true, version = 0;
async function load() {
  const current = ++version;
  const ticket = props.ticket;
  loading.value = true; failed.value = false;
  const results = await Promise.allSettled((ticket.photos || []).map(async photo => ({ ...photo, ...await getComplaintPhoto(ticket.id, photo.id) })));
  if (!alive || current !== version) return;
  photos.value = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  failed.value = results.some(result => result.status === 'rejected'); loading.value = false;
}
watch(() => JSON.stringify([props.ticket.id, props.ticket.photos?.map(photo => photo.id)]), () => { photos.value = []; load(); }, { immediate: true });
onBeforeUnmount(() => { alive = false; });
</script>
