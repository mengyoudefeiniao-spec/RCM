<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <el-button v-if="!reading" type="primary" @click="start">{{ $t('verification.nfc.start') }}</el-button>
      <el-button v-else type="danger" plain @click="stop">{{ $t('verification.nfc.stop') }}</el-button>
      <span class="text-xs font-semibold" :class="reading ? 'text-[#326445]' : 'text-[#8A9A8F]'">
        {{ statusText }}
      </span>
    </div>

    <p v-if="!hasBridge" class="rounded-lg bg-[#FDF3E0] px-3 py-2 text-xs text-[#7A5F21]">
      {{ $t('verification.noBridge') }}
    </p>
    <div v-else-if="errorKey" class="rounded-lg bg-[#FBEAEA] px-3 py-2 text-xs text-[#A33A38]">
      <p>{{ $t(`verification.nfc.${errorKey}`) }}</p>
      <el-button v-if="errorKey === 'disabled'" size="small" text type="primary" @click="openSettings">
        {{ $t('verification.nfc.openSettings') }}
      </el-button>
    </div>
    <p v-else-if="reading" class="rounded-lg bg-[#EFF5F1] px-3 py-2 text-xs text-[#326445]">{{ $t('verification.nfc.tapHint') }}</p>

    <div class="flex items-center gap-2">
      <el-input v-model="batch" size="small" maxlength="40" :placeholder="$t('verification.nfc.attempts')" class="max-w-[220px]" />
      <el-button v-if="attempts.length" size="small" @click="saveAll">{{ $t('verification.nfc.save') }}</el-button>
    </div>

    <p v-if="!attempts.length" class="text-xs text-[#8A9A8F]">{{ $t('verification.nfc.noAttempts') }}</p>

    <ul class="space-y-2">
      <li v-for="(attempt, index) in attempts" :key="attempt.localId" class="rounded-lg border border-[#D9E5DB] bg-white p-3 text-xs">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="font-mono font-bold text-[#1F3326] break-all">{{ attempt.uid || '-' }}</div>
            <div class="mt-0.5 text-[10px] text-[#8A9A8F]">{{ new Date(attempt.at || Date.now()).toLocaleString() }}</div>
          </div>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="attempt.ok ? 'bg-[#E2F4E4] text-[#326445]' : 'bg-[#FBEAEA] text-[#A33A38]'">
            {{ attempt.ok ? $t('verification.nfc.ok') : $t('verification.nfc.failed') }}
          </span>
        </div>
        <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          <div v-for="row in attemptRows(attempt)" :key="row.label" class="flex min-w-0 justify-between gap-2">
            <dt class="shrink-0 text-[#8A9A8F]">{{ row.label }}</dt>
            <dd class="min-w-0 break-all text-end font-medium">{{ row.value }}</dd>
          </div>
        </dl>
        <div class="mt-2 flex justify-end">
          <el-button size="small" text type="primary" @click="saveOne(attempt, index)">{{ $t('verification.nfc.save') }}</el-button>
        </div>
      </li>
    </ul>

    <p v-if="attempts.length" class="text-[10px] leading-relaxed text-[#8A9A8F]">{{ $t('verification.nfc.swHint') }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { hasVerificationBridge, nfcOpenSettings, nfcStart, nfcStop, onNfcEvent } from '../../utils/verificationNative.js';

const emit = defineEmits(['record']);
const { t } = useI18n();
const hasBridge = hasVerificationBridge();
const reading = ref(false);
const errorKey = ref('');
const attempts = ref([]);
const batch = ref('');
let unsubscribe = () => {};

const statusText = computed(() => {
  if (reading.value) return t('verification.nfc.stateReading');
  if (attempts.value.length) return t('verification.nfc.stateStopped');
  return t('verification.nfc.stateIdle');
});

function attemptRows(attempt) {
  return [
    { label: t('verification.nfc.techs'), value: (attempt.techs || []).join(', ') || '-' },
    { label: t('verification.nfc.isoDep'), value: attempt.isoDep ? t('verification.yes') : t('verification.no') },
    { label: t('verification.nfc.atqa'), value: attempt.atqa || '-' },
    { label: t('verification.nfc.sak'), value: attempt.sak || '-' },
    { label: t('verification.nfc.aid'), value: attempt.aidSw ? `${attempt.aidSw} · ${attempt.aidMs ?? '-'} ms` : '-' },
    { label: t('verification.nfc.efCom'), value: attempt.efComSw || '-' },
    { label: t('verification.nfc.elapsed'), value: attempt.isoDepMs != null ? `${attempt.isoDepMs} ms` : '-' },
    ...(attempt.error ? [{ label: 'error', value: attempt.error }] : []),
  ];
}

function onEvent(event) {
  if (event.type === 'stopped') {
    reading.value = false;
    return;
  }
  if (event.type !== 'tag') return;
  attempts.value.unshift({
    localId: `${event.uid || 'tag'}-${event.at || Date.now()}`,
    uid: event.uid || '',
    techs: event.techs || [],
    atqa: event.atqa || '',
    sak: event.sak || '',
    isoDep: event.isoDep === true,
    aidSw: event.aidSelect?.sw || '',
    aidMs: event.aidSelect?.ms ?? null,
    efComSw: event.efCom?.sw || '',
    isoDepMs: event.isoDepMs ?? null,
    ok: event.ok === true,
    error: event.error || '',
    at: event.at || Date.now(),
  });
  attempts.value = attempts.value.slice(0, 40);
}

async function start() {
  errorKey.value = '';
  try {
    const data = await nfcStart();
    reading.value = data.reading !== false;
  } catch (error) {
    reading.value = false;
    const code = String(error?.message || '');
    errorKey.value = code.includes('unsupported') ? 'unsupported'
      : code.includes('disabled') ? 'disabled' : 'startFailed';
  }
}

async function stop() {
  await nfcStop();
  reading.value = false;
}

function openSettings() {
  nfcOpenSettings();
}

function payloadFor(attempt) {
  return {
    metrics: {
      uid: attempt.uid,
      techs: (attempt.techs || []).join(','),
      atqa: attempt.atqa,
      sak: attempt.sak,
      isoDep: attempt.isoDep,
      aidSw: attempt.aidSw,
      aidMs: attempt.aidMs,
      efComSw: attempt.efComSw,
      isoDepMs: attempt.isoDepMs,
      ok: attempt.ok,
      error: attempt.error,
    },
    input: { batch: batch.value.trim(), uid: attempt.uid },
  };
}

function saveOne(attempt) {
  emit('record', payloadFor(attempt));
  ElMessage.success(t('verification.nfc.saved'));
}

function saveAll() {
  if (!attempts.value.length) {
    ElMessage.warning(t('verification.nfc.needAttempt'));
    return;
  }
  for (const attempt of attempts.value) emit('record', payloadFor(attempt));
  ElMessage.success(t('verification.nfc.saved'));
  attempts.value = [];
}

onMounted(() => {
  unsubscribe = onNfcEvent(onEvent);
});

onBeforeUnmount(() => {
  unsubscribe();
  nfcStop();
});
</script>
