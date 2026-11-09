<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <el-button type="primary" :loading="probing" @click="$emit('reprobe')">
        {{ probe ? $t('verification.reprobe') : $t('verification.probeButton') }}
      </el-button>
      <el-button v-if="flat" @click="save">{{ $t('verification.env.saveProbe') }}</el-button>
      <el-button v-if="flat" text @click="copyAll">{{ copied ? $t('verification.env.copied') : $t('verification.env.copy') }}</el-button>
    </div>

    <p v-if="!hasBridge" class="rounded-lg bg-[#FDF3E0] px-3 py-2 text-xs text-[#7A5F21]">
      {{ $t('verification.noBridge') }} · {{ $t('verification.noBridgeHint') }}
    </p>
    <p v-if="probeError" class="rounded-lg bg-[#FBEAEA] px-3 py-2 text-xs text-[#A33A38]">{{ probeError }}</p>
    <p v-if="!flat && !probing" class="text-xs text-[#8A9A8F]">{{ $t('verification.env.notProbed') }}</p>

    <div v-if="flat" class="space-y-3">
      <section class="rounded-lg border border-[#D9E5DB] bg-[#FBFDFB] p-3">
        <h4 class="mb-1.5 text-xs font-bold text-[#326445]">{{ $t('verification.env.device') }}</h4>
        <dl class="grid grid-cols-1 gap-1 text-xs">
          <div v-for="row in deviceRows" :key="row.label" class="flex min-w-0 items-start justify-between gap-2 border-b border-dashed border-[#E7EFE9] py-0.5 last:border-0">
            <dt class="shrink-0 text-[#8A9A8F]">{{ row.label }}</dt>
            <dd class="min-w-0 break-all text-end font-medium text-[#1F3326]">{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-[#D9E5DB] bg-[#FBFDFB] p-3">
        <h4 class="mb-1.5 text-xs font-bold text-[#326445]">{{ $t('verification.env.security') }}</h4>
        <dl class="grid grid-cols-1 gap-1 text-xs">
          <div v-for="row in securityRows" :key="row.label" class="flex min-w-0 items-start justify-between gap-2 border-b border-dashed border-[#E7EFE9] py-0.5 last:border-0">
            <dt class="shrink-0 text-[#8A9A8F]">{{ row.label }}</dt>
            <dd class="min-w-0 break-all text-end font-medium text-[#1F3326]" :class="row.warn ? 'text-[#A33A38]' : ''">{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-[#D9E5DB] bg-[#FBFDFB] p-3">
        <h4 class="mb-1.5 text-xs font-bold text-[#326445]">{{ $t('verification.env.network') }}</h4>
        <p class="text-xs" :class="networkClass">
          <span v-if="network.state === 'checking'">{{ $t('verification.env.networkChecking') }}</span>
          <span v-else-if="network.state === 'ok'">{{ $t('verification.env.networkOk') }} · {{ $t('verification.env.latency', { ms: network.ms }) }}</span>
          <span v-else-if="network.state === 'fail'">{{ $t('verification.env.networkFail') }}</span>
          <span v-else>{{ network.hint || '—' }}</span>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { flattenProbe } from '../../utils/verificationDevice.js';
import { formatBytes } from '../../utils/verificationImage.js';
import { hasVerificationBridge } from '../../utils/verificationNative.js';

const props = defineProps({
  probe: { type: Object, default: null },
  probing: { type: Boolean, default: false },
  probeError: { type: String, default: '' },
  network: { type: Object, default: () => ({ state: 'idle' }) },
});
const emit = defineEmits(['reprobe', 'record']);
const { t } = useI18n();
const hasBridge = hasVerificationBridge();
const copied = ref(false);

const flat = computed(() => flattenProbe(props.probe));
const yesNo = value => (value === null || value === undefined || value === '' ? '-' : value ? t('verification.yes') : t('verification.no'));

const deviceRows = computed(() => {
  const data = flat.value;
  if (!data) return [];
  return [
    { label: t('verification.env.model'), value: `${data.manufacturer || '-'} ${data.model || ''}`.trim() },
    { label: t('verification.env.android'), value: `${data.androidRelease || '-'} / API ${data.sdkInt ?? '-'}` },
    { label: t('verification.env.cores'), value: data.cpuCores ?? '-' },
    { label: t('verification.env.abis'), value: props.probe?.device?.abis || '-' },
    { label: t('verification.env.memoryTotal'), value: formatBytes(data.totalMemBytes) },
    { label: t('verification.env.memoryFree'), value: formatBytes(data.availMemBytes) },
    { label: t('verification.env.lowRam'), value: yesNo(data.lowRamDevice) },
    { label: t('verification.env.storageFree'), value: formatBytes(data.storageFreeBytes) },
    { label: t('verification.env.storageTotal'), value: formatBytes(data.storageTotalBytes) },
    { label: t('verification.env.screen'), value: `${data.screen || '-'} @ ${data.densityDpi ?? '-'} dpi` },
    { label: t('verification.env.cameras'), value: data.cameras ?? '-' },
    { label: t('verification.env.nfcCap'), value: yesNo(data.nfc === 'yes') },
    { label: t('verification.env.nfcOn'), value: yesNo(props.probe?.nfc?.enabled) },
    { label: t('verification.env.installed'), value: `${data.packageName || '-'} · ${data.appVersion || '-'} · ${data.role || '-'}` },
    { label: t('verification.env.webviewVersion'), value: data.webview || '-' },
    { label: t('verification.env.uptime'), value: props.probe?.device?.localTime || '-' },
  ];
});

const securityRows = computed(() => {
  const data = flat.value;
  if (!data) return [];
  return [
    { label: t('verification.env.playStore'), value: yesNo(data.playStore), warn: data.playStore === false },
    { label: t('verification.env.playServices'), value: yesNo(data.playServices), warn: data.playServices === false },
    { label: t('verification.env.signature'), value: data.signature || '-', warn: !data.signature },
    { label: t('verification.env.root'), value: yesNo(data.root), warn: data.root === true },
    { label: t('verification.env.emulator'), value: yesNo(data.emulator), warn: data.emulator === true },
  ];
});

const networkClass = computed(() => {
  if (props.network.state === 'ok') return 'text-[#326445] font-medium';
  if (props.network.state === 'fail') return 'text-[#A33A38] font-medium';
  return 'text-[#8A9A8F]';
});

function save() {
  const data = flat.value;
  if (!data) return;
  emit('record', { metrics: data, input: {} });
  ElMessage.success(t('verification.env.probeSaved'));
}

async function copyAll() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.probe, null, 2));
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    ElMessage.warning(t('verification.exportFailed'));
  }
}
</script>
