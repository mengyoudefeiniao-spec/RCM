<template>
  <section class="complaint-rating rounded-lg border border-[#D9E5DB] p-3 text-xs space-y-2" :aria-label="t('chatOrders.rating')">
    <h4 class="font-bold text-[#326445]">{{ t('chatOrders.rating') }}</h4>
    <template v-if="ticket.rating">
      <p class="font-bold text-[#7A5F21]">{{ t('chatOrders.stars', { score: ticket.rating.score }) }}</p>
      <p v-if="ticket.rating.comment" class="whitespace-pre-wrap break-words">{{ ticket.rating.comment }}</p>
      <p class="text-[#58685D]">{{ ticket.rating.ratedAt }}</p>
    </template>
    <form v-else-if="allowRate && ticket.statusCode === 'RESOLVED'" @submit.prevent="submit" class="space-y-2">
      <p>{{ t('chatOrders.rateHint') }}</p>
      <div class="flex gap-1" role="group" :aria-label="t('chatOrders.rating')">
        <button v-for="star in 5" :key="star" type="button" :aria-label="t('chatOrders.stars', { score: star })" :aria-pressed="score === star" :disabled="saving" @click="score = star" class="text-3xl px-1" :class="star <= score ? 'text-[#B78C31]' : 'text-[#8A9A8F]'">{{ star <= score ? '★' : '☆' }}</button>
      </div>
      <el-input v-model="comment" type="textarea" :rows="2" maxlength="1000" :placeholder="t('chatOrders.rateComment')" :aria-label="t('chatOrders.rateComment')" :disabled="saving" />
      <el-button native-type="submit" type="primary" size="small" :loading="saving" :disabled="!score">{{ t('chatOrders.rate') }}</el-button>
    </form>
    <p v-else class="text-[#58685D]">{{ t('chatOrders.ratingPending') }}</p>
  </section>
</template>
<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { rateComplaintTicket } from '../../api/complaint.js';
const props = defineProps({ ticket: { type: Object, required: true }, allowRate: Boolean });
const emit = defineEmits(['updated']);
const { t } = useI18n();
const score = ref(0), comment = ref(''), saving = ref(false);
watch(() => props.ticket.id, () => { score.value = 0; comment.value = ''; });
async function submit() {
  if (!score.value || saving.value) return;
  saving.value = true;
  try { const ticket = await rateComplaintTicket(props.ticket.id, { score: score.value, comment: comment.value }); emit('updated', ticket); ElMessage.success(t('chatOrders.rated')); }
  catch { /* Keep the user's rating draft when saving fails. */ }
  finally { saving.value = false; }
}
</script>
