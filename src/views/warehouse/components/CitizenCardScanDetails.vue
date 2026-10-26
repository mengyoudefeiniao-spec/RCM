<template>
  <section class="citizen-card-scan-details space-y-3">
    <div class="rounded-xl bg-[#E1F4E4] border border-[#C7E0CE] p-4 text-center">
      <div class="text-lg font-bold text-[#1F3326]">{{ card.headName || $t('citizenCard.legalHeadName') }}</div>
      <bdi dir="ltr" class="block text-xs text-[#58685D] font-mono mt-1">{{ card.cardNo }}</bdi>
      <div class="text-xs text-[#326445] mt-1">{{ $t('citizenCard.totalMembersRegistered', { count: card.memberCount || 0 }) }}</div>
    </div>
    <dl class="rounded-xl bg-white border border-[#D9E5DB] divide-y divide-[#E9F1EB] text-xs">
      <div v-for="field in fields" :key="field.label" class="p-3 flex justify-between gap-3">
        <dt class="text-[#8A9A8F] shrink-0">{{ $t(field.label) }}</dt>
        <dd class="text-end break-words min-w-0"><bdi :dir="field.ltr ? 'ltr' : 'auto'">{{ field.value || '—' }}</bdi></dd>
      </div>
    </dl>
  </section>
</template>
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getSharedFamily } from '../../../utils/sharedSession.js';
import { verifiedCitizenCardPayload } from '../../../utils/citizenCardScan.js';
const props = defineProps({ card: { type: Object, required: true } });
const { locale } = useI18n();
const card = computed(() => {
  const family = getSharedFamily(props.card.cardNo, locale.value);
  return family ? verifiedCitizenCardPayload(props.card, { family }) : props.card;
});
const fields = computed(() => [
  { label: 'citizenCard.linkedPaperBook', value: card.value.paperCardNo, ltr: true },
  { label: 'citizen.province', value: [card.value.province, card.value.district].filter(Boolean).join(' · ') },
  { label: 'citizenCard.agentStore', value: card.value.agentName },
  { label: 'citizenCard.agentCodePrefix', value: card.value.agentId, ltr: true },
  { label: 'citizenCard.securityCipherLabel', value: card.value.verificationCode, ltr: true },
  { label: 'citizenCard.recordActive', value: card.value.status }
]);
</script>
