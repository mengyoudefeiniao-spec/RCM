<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="dialogWidth"
    align-center
    destroy-on-close
    class="verify-case-dialog rcm-compact-dialog"
    @update:model-value="value => $emit('update:modelValue', value)"
  >
    <div class="space-y-4 text-[#1F3326]">
      <div class="flex flex-wrap items-center gap-1.5 text-[10px]">
        <span class="rounded-full bg-[#EFF5F1] px-2 py-0.5 font-mono font-bold text-[#326445]">{{ caseDef.id }}</span>
        <span class="rounded-full bg-[#FDF3E0] px-2 py-0.5 font-semibold text-[#7A5F21]">{{ $t('verification.priority') }} {{ caseDef.priority }}</span>
        <span class="rounded-full bg-[#F1F4F8] px-2 py-0.5 font-semibold text-[#3A5A8A]">{{ $t('verification.checklistRef') }} {{ caseDef.tv }}</span>
        <span class="rounded-full bg-[#F4F1F8] px-2 py-0.5 font-semibold text-[#5B4A7A]">{{ $t(`verification.groups.${caseDef.group}`) }}</span>
      </div>

      <section class="space-y-1 rounded-lg bg-[#FBFDFB] p-3 text-xs">
        <p><b class="text-[#326445]">{{ $t('verification.purpose') }}：</b>{{ $t(`verification.case.${caseDef.id}.purpose`) }}</p>
        <p><b class="text-[#326445]">{{ $t('verification.criteria') }}：</b>{{ $t(`verification.case.${caseDef.id}.criteria`) }}</p>
      </section>

      <section class="text-xs">
        <h4 class="mb-1 font-bold text-[#43554B]">{{ $t('verification.steps') }}</h4>
        <ol class="list-decimal space-y-0.5 ps-5 text-[#58685D]">
          <li v-for="(step, index) in steps" :key="index">{{ step }}</li>
        </ol>
      </section>

      <section class="rounded-lg border border-[#D9E5DB] p-3">
        <VerifyEnvPanel
          v-if="caseDef.kind === 'env'"
          :probe="probe"
          :probing="probing"
          :probe-error="probeError"
          :network="network"
          @reprobe="$emit('reprobe')"
          @record="$emit('record', $event)"
        />
        <VerifyNfcPanel v-else-if="caseDef.kind === 'nfc'" @record="$emit('record', $event)" />
        <VerifyQrPanel v-else-if="caseDef.kind === 'qr'" @record="$emit('record', $event)" />
        <div v-else-if="caseDef.kind === 'capture'" class="space-y-2">
          <p class="rounded-lg bg-[#EFF5F1] px-3 py-2 text-xs text-[#326445]">{{ $t(`verification.cap.${caseDef.captureType}Hint`) }}</p>
          <VerifyCapturePanel :case-def="caseDef" @record="$emit('record', $event)" />
        </div>
        <div v-else class="space-y-2">
          <p class="rounded-lg bg-[#EFF5F1] px-3 py-2 text-xs text-[#326445]">{{ $t('verification.manual.hint') }}</p>
          <p class="text-[10px] text-[#8A9A8F]">{{ $t('verification.manual.verdictHint') }}</p>
          <div class="pt-1">
            <p class="mb-1 text-xs font-semibold text-[#43554B]">{{ $t('verification.manual.evidence') }}</p>
            <VerifyCapturePanel :case-def="caseDef" photo-only @record="$emit('record', $event)" />
          </div>
        </div>
      </section>

      <section>
        <div class="mb-1.5 flex items-center justify-between">
          <h4 class="text-xs font-bold text-[#43554B]">{{ $t('verification.recordsTitle') }}</h4>
          <span class="text-[10px] text-[#8A9A8F]">{{ $t('verification.recordCount', { count: records.length }) }}</span>
        </div>
        <p v-if="!records.length" class="rounded-lg border border-dashed border-[#D9E5DB] px-3 py-4 text-center text-xs text-[#8A9A8F]">
          {{ $t('verification.emptyRecords') }}
        </p>
        <ul v-else class="max-h-56 space-y-1.5 overflow-y-auto pe-1">
          <li v-for="record in records" :key="record.id" class="rounded-lg border border-[#D9E5DB] bg-white p-2 text-[11px]">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="truncate font-semibold">{{ recordSummary(record) }}</div>
                <div class="text-[10px] text-[#8A9A8F]">{{ new Date(record.createdAt).toLocaleString() }}</div>
              </div>
              <button type="button" class="shrink-0 text-[10px] text-[#C04442]" @click="remove(record)">
                {{ $t('verification.deleteRecord') }}
              </button>
            </div>
            <div v-if="thumbs[record.id]?.length" class="mt-1.5 flex gap-1.5 overflow-x-auto">
              <img v-for="url in thumbs[record.id]" :key="url" :src="url" alt="" class="h-14 w-14 shrink-0 rounded border border-[#E5CEA1] object-cover" />
            </div>
            <p v-if="record.note" class="mt-1 text-[10px] text-[#58685D]">{{ record.note }}</p>
          </li>
        </ul>
      </section>

      <section class="space-y-2">
        <h4 class="text-xs font-bold text-[#43554B]">{{ $t('verification.verdictLabel') }}</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in verdictOptions"
            :key="option.value"
            type="button"
            class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="verdict === option.value ? option.active : 'border-[#D9E5DB] text-[#58685D]'"
            @click="$emit('verdict', option.value)"
          >
            {{ $t(`verification.status.${option.value}`) }}
          </button>
          <button v-if="verdict" type="button" class="px-2 text-[10px] text-[#8A9A8F] underline" @click="$emit('verdict', '')">
            {{ $t('common.reset') }}
          </button>
        </div>
        <el-input
          v-model="noteDraft"
          type="textarea"
          :rows="2"
          maxlength="500"
          :placeholder="$t('verification.notePlaceholder')"
          @input="$emit('note', noteDraft)"
        />
      </section>
    </div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ $t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { imageUrl } from '../../utils/verificationStore.js';
import VerifyEnvPanel from './VerifyEnvPanel.vue';
import VerifyNfcPanel from './VerifyNfcPanel.vue';
import VerifyQrPanel from './VerifyQrPanel.vue';
import VerifyCapturePanel from './VerifyCapturePanel.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  caseDef: { type: Object, required: true },
  records: { type: Array, default: () => [] },
  verdict: { type: String, default: '' },
  note: { type: String, default: '' },
  probe: { type: Object, default: null },
  probing: { type: Boolean, default: false },
  probeError: { type: String, default: '' },
  network: { type: Object, default: () => ({ state: 'idle' }) },
});
const emit = defineEmits(['update:modelValue', 'record', 'delete', 'reprobe', 'verdict', 'note']);
const { t, tm } = useI18n();
const { dialogWidth } = useCompactDialog(720);

const title = computed(() => `${props.caseDef.id} · ${t(`verification.case.${props.caseDef.id}.title`)}`);
const steps = computed(() => tm(`verification.case.${props.caseDef.id}.steps`) || []);

const verdictOptions = [
  { value: 'pass', active: 'border-[#326445] bg-[#E2F4E4] text-[#326445]' },
  { value: 'partial', active: 'border-[#D3AF62] bg-[#FDF3E0] text-[#7A5F21]' },
  { value: 'fail', active: 'border-[#C04442] bg-[#FBEAEA] text-[#A33A38]' },
];

const noteDraft = ref(props.note);
watch(() => props.note, value => { noteDraft.value = value; });
watch(() => props.caseDef.id, () => { noteDraft.value = props.note; });

const thumbs = ref({});

function recordSummary(record) {
  const input = record.input || {};
  const metrics = record.metrics || {};
  if (input.householdNo) return input.householdNo;
  if (input.subjectId) return `${input.subjectId}${input.pose ? ` · ${t(`verification.options.${input.pose}`)}` : ''}`;
  if (input.attackType) return t(`verification.options.${input.attackType}`);
  if (metrics.uid) return metrics.uid;
  if (metrics.scanMs != null) return `${metrics.scanMs} ms`;
  if (metrics.model) return metrics.model;
  if (record.imageIds?.length) return t('verification.manual.evidence');
  return record.id.slice(0, 8);
}

async function loadThumbs() {
  const next = {};
  for (const record of props.records) {
    if (!record.imageIds?.length) continue;
    const urls = [];
    for (const id of record.imageIds) {
      const url = await imageUrl(id).catch(() => '');
      if (url) urls.push(url);
    }
    if (urls.length) next[record.id] = urls;
  }
  thumbs.value = next;
}

watch(() => props.records, loadThumbs, { immediate: true, deep: false });
watch(() => props.modelValue, value => { if (value) loadThumbs(); });

function remove(record) {
  emit('delete', record);
}
</script>
