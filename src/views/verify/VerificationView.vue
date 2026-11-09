<template>
  <div class="verify-view mx-auto w-full max-w-3xl space-y-4 px-3 py-4 pb-16 text-[#1F3326] sm:px-5">
    <header class="space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <button type="button" class="mb-1 inline-flex items-center gap-1 text-xs text-[#58685D]" @click="goBack">
            <el-icon><ArrowLeft class="rtl-mirror-icon" /></el-icon>{{ $t('common.back') }}
          </button>
          <h1 class="text-xl font-bold leading-tight">{{ $t('verification.title') }}</h1>
          <p class="mt-0.5 text-xs text-[#58685D]">{{ $t('verification.subtitle') }}</p>
        </div>
        <LanguageSwitcher class="shrink-0" />
      </div>

      <section class="rounded-xl border border-[#E5CEA1] bg-[#FDF3E0] p-3">
        <h2 class="text-xs font-bold text-[#7A5F21]">{{ $t('verification.noticeTitle') }}</h2>
        <p class="mt-1 text-[11px] leading-relaxed text-[#5A4718]">{{ $t('verification.noticeBody') }}</p>
      </section>

      <section class="space-y-2 rounded-xl border border-[#D9E5DB] bg-white p-3">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label class="space-y-1 text-[11px] font-semibold text-[#43554B]">
            {{ $t('verification.tester') }}
            <el-input v-model="meta.tester" size="small" :placeholder="$t('verification.testerPlaceholder')" maxlength="40" />
          </label>
          <label class="space-y-1 text-[11px] font-semibold text-[#43554B]">
            {{ $t('verification.site') }}
            <el-input v-model="meta.site" size="small" :placeholder="$t('verification.sitePlaceholder')" maxlength="60" />
          </label>
        </div>
        <el-input
          v-model="meta.notes"
          type="textarea"
          :rows="2"
          maxlength="300"
          :placeholder="$t('verification.siteNotesPlaceholder')"
        />
      </section>
    </header>

    <!-- Device + progress -->
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h2 class="text-xs font-bold text-[#326445]">{{ $t('verification.deviceTitle') }}</h2>
          <p v-if="deviceFlat" class="mt-0.5 break-all text-[11px] text-[#58685D]">
            {{ deviceFlat.manufacturer }} {{ deviceFlat.model }} · Android {{ deviceFlat.androidRelease }} (API {{ deviceFlat.sdkInt ?? '-' }})
          </p>
          <p v-else class="mt-0.5 text-[11px] text-[#8A9A8F]">{{ probing ? $t('verification.probing') : $t('verification.env.notProbed') }}</p>
          <p v-if="probeError" class="mt-0.5 text-[11px] text-[#A33A38]">{{ probeError }}</p>
        </div>
        <el-button size="small" :loading="probing" @click="runProbe">{{ probe ? $t('verification.reprobe') : $t('verification.probeButton') }}</el-button>
      </div>

      <div class="mt-3 space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-semibold text-[#43554B]">{{ $t('verification.progressLabel') }}</span>
          <span class="font-mono">{{ doneCount }}/{{ cases.length }}</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-[#EFF5F1]">
          <div class="h-full rounded-full bg-[#326445] transition-all" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="flex flex-wrap gap-1.5 pt-1 text-[10px]">
          <span v-for="item in verdictChips" :key="item.value" class="rounded-full px-2 py-0.5 font-semibold" :class="item.className">
            {{ $t(`verification.status.${item.value}`) }} {{ item.count }}
          </span>
        </div>
        <p class="text-[10px] text-[#8A9A8F]">{{ $t('verification.storageHint', { count: storage.images, size: formatBytes(storage.bytes) }) }} · {{ $t('verification.dataLocalNote') }}</p>
      </div>
    </section>

    <!-- Cases by group -->
    <section v-for="group in groups" :key="group.id" class="space-y-2">
      <div class="flex items-center gap-1.5">
        <el-icon class="text-[#326445]"><component :is="group.icon" /></el-icon>
        <h2 class="text-sm font-bold">{{ $t(`verification.groups.${group.id}`) }}</h2>
      </div>

      <button
        v-for="caseDef in group.cases"
        :key="caseDef.id"
        type="button"
        class="flex w-full items-start gap-2 rounded-xl border border-[#D9E5DB] bg-white p-3 text-start transition-shadow hover:shadow-sm"
        @click="openCase(caseDef)"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span class="rounded-full bg-[#EFF5F1] px-2 py-0.5 font-mono font-bold text-[#326445]">{{ caseDef.id }}</span>
            <span class="rounded-full bg-[#FDF3E0] px-2 py-0.5 font-semibold text-[#7A5F21]">{{ caseDef.priority }}</span>
            <span class="text-[#8A9A8F]">{{ caseDef.tv }}</span>
          </div>
          <h3 class="mt-1 truncate text-sm font-bold">{{ $t(`verification.case.${caseDef.id}.title`) }}</h3>
          <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#58685D]">{{ $t(`verification.case.${caseDef.id}.purpose`) }}</p>
          <p class="mt-1 text-[10px] text-[#8A9A8F]">{{ $t('verification.recordCount', { count: recordsByCase[caseDef.id]?.length || 0 }) }}</p>
        </div>
        <span class="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold" :class="statusClass(caseDef.id)">
          {{ statusLabel(caseDef.id) }}
        </span>
      </button>
    </section>

    <!-- Export -->
    <section class="space-y-2 rounded-xl border border-[#D9E5DB] bg-white p-3">
      <div class="flex flex-wrap items-center gap-2">
        <el-button type="primary" :loading="exporting" @click="exportReport">{{ $t('verification.exportButton') }}</el-button>
        <el-button text type="danger" @click="clearAllData">{{ $t('verification.clearButton') }}</el-button>
      </div>
      <p class="text-[10px] text-[#8A9A8F]">{{ $t('verification.exportHint') }}</p>
      <p v-if="!hasBridge" class="text-[10px] text-[#8A5A2B]">{{ $t('verification.noBridgeHint') }}</p>
    </section>

    <VerifyCaseDialog
      v-model="dialogVisible"
      :case-def="activeCase"
      :records="activeRecords"
      :verdict="activeState.verdict"
      :note="activeState.note"
      :probe="probe"
      :probing="probing"
      :probe-error="probeError"
      :network="network"
      @record="handleRecord"
      @delete="handleDelete"
      @reprobe="runProbe"
      @verdict="setVerdict"
      @note="setNote"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Monitor, Postcard, Camera, Tickets } from '@element-plus/icons-vue';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.vue';
import VerifyCaseDialog from '../../components/verify/VerifyCaseDialog.vue';
import { VERIFICATION_CASES, VERIFICATION_GROUPS } from '../../utils/verificationCases.js';
import {
  clearAll, deleteRecord, getImage, listRecords, saveImage, saveRecord, storageSummary,
} from '../../utils/verificationStore.js';
import { blobToBase64, formatBytes } from '../../utils/verificationImage.js';
import { browserProbe, flattenProbe } from '../../utils/verificationDevice.js';
import { hasVerificationBridge, probeDevice, finishExport, writeExportFile } from '../../utils/verificationNative.js';
import { buildVerificationReport, exportFolderName } from '../../utils/verificationReport.js';

const { t, locale } = useI18n();
const router = useRouter();
const hasBridge = hasVerificationBridge();

const cases = VERIFICATION_CASES;
const groupIcons = { device: Monitor, credential: Postcard, biometric: Camera, flow: Tickets };
const groups = VERIFICATION_GROUPS.map(group => ({ ...group, icon: groupIcons[group.id] || Monitor, cases: cases.filter(item => item.group === group.id) }));

const meta = reactive({ tester: '', site: '', notes: '' });
const caseState = reactive({});
const records = ref([]);
const probe = ref(null);
const probing = ref(false);
const probeError = ref('');
const network = ref({ state: 'idle' });
const storage = ref({ images: 0, bytes: 0 });
const exporting = ref(false);
const dialogVisible = ref(false);
const activeCaseId = ref(cases[0].id);

const activeCase = computed(() => cases.find(item => item.id === activeCaseId.value) || cases[0]);
const activeRecords = computed(() => recordsByCase.value[activeCaseId.value] || []);
const activeState = computed(() => caseState[activeCaseId.value] || { verdict: '', note: '' });
const deviceFlat = computed(() => flattenProbe(probe.value));

const recordsByCase = computed(() => {
  const map = {};
  for (const record of records.value) (map[record.caseId] ||= []).push(record);
  return map;
});

const doneCount = computed(() => cases.filter(item => caseState[item.id]?.verdict).length);
const progressPercent = computed(() => Math.round((doneCount.value / cases.length) * 100));

const verdictChips = computed(() => {
  const counts = { pass: 0, partial: 0, fail: 0, untested: 0 };
  for (const item of cases) {
    const verdict = caseState[item.id]?.verdict;
    counts[verdict && verdict in counts ? verdict : 'untested'] += 1;
  }
  return [
    { value: 'pass', count: counts.pass, className: 'bg-[#E2F4E4] text-[#326445]' },
    { value: 'partial', count: counts.partial, className: 'bg-[#FDF3E0] text-[#7A5F21]' },
    { value: 'fail', count: counts.fail, className: 'bg-[#FBEAEA] text-[#A33A38]' },
    { value: 'untested', count: counts.untested, className: 'bg-[#EFF5F1] text-[#58685D]' },
  ];
});

function statusLabel(caseId) {
  const verdict = caseState[caseId]?.verdict;
  return verdict ? t(`verification.status.${verdict}`) : t('verification.status.untested');
}

function statusClass(caseId) {
  const verdict = caseState[caseId]?.verdict;
  if (verdict === 'pass') return 'bg-[#E2F4E4] text-[#326445]';
  if (verdict === 'partial') return 'bg-[#FDF3E0] text-[#7A5F21]';
  if (verdict === 'fail') return 'bg-[#FBEAEA] text-[#A33A38]';
  return 'bg-[#EFF5F1] text-[#58685D]';
}

function openCase(caseDef) {
  activeCaseId.value = caseDef.id;
  dialogVisible.value = true;
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/login');
}

// ---------------------------------------------------------------- persistence

const META_KEY = 'rcm_verify_meta';
const CASE_KEY = 'rcm_verify_cases';

function loadLocalState() {
  try {
    Object.assign(meta, JSON.parse(localStorage.getItem(META_KEY) || '{}'));
  } catch {
    // Ignore corrupted local state.
  }
  try {
    Object.assign(caseState, JSON.parse(localStorage.getItem(CASE_KEY) || '{}'));
  } catch {
    // Ignore corrupted local state.
  }
}

function persistLocalState() {
  localStorage.setItem(META_KEY, JSON.stringify({ tester: meta.tester, site: meta.site, notes: meta.notes }));
  localStorage.setItem(CASE_KEY, JSON.stringify(caseState));
}

watch(meta, persistLocalState, { deep: true });
watch(caseState, persistLocalState, { deep: true });

function setVerdict(verdict) {
  const id = activeCaseId.value;
  caseState[id] = { ...(caseState[id] || {}), verdict };
  ElMessage.success(t('verification.verdictSaved'));
}

function setNote(note) {
  const id = activeCaseId.value;
  caseState[id] = { ...(caseState[id] || {}), note };
}

// ---------------------------------------------------------------- device + network

async function runProbe() {
  probing.value = true;
  probeError.value = '';
  try {
    probe.value = hasBridge ? await probeDevice() : await browserProbe();
  } catch {
    probeError.value = t('verification.probeFailed');
  } finally {
    probing.value = false;
  }
}

async function checkNetwork() {
  const base = String(import.meta.env.VITE_POCKETBASE_URL || '').replace(/\/+$/, '');
  if (!base) {
    network.value = { state: 'idle' };
    return;
  }
  network.value = { state: 'checking' };
  const started = performance.now();
  try {
    const response = await fetch(`${base}/api/health`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    network.value = { state: response.ok ? 'ok' : 'fail', ms: Math.round(performance.now() - started) };
  } catch {
    network.value = { state: 'fail' };
  }
}

// ---------------------------------------------------------------- records

async function reload() {
  records.value = await listRecords();
  storage.value = await storageSummary();
}

async function handleRecord(payload) {
  const caseDef = activeCase.value;
  if (!caseDef) return;
  const metrics = { ...(payload.metrics || {}) };
  if (caseDef.kind === 'env' && network.value.state === 'ok') metrics.networkMs = network.value.ms;
  if (caseDef.kind === 'env' && network.value.state) metrics.network = network.value.state;
  let imageIds = [];
  if (payload.photo) {
    const image = await saveImage(payload.photo, {
      caseId: caseDef.id,
      label: caseDef.captureType || 'evidence',
      width: payload.photoMeta?.width,
      height: payload.photoMeta?.height,
    });
    imageIds = [image.id];
  }
  const saved = await saveRecord({
    caseId: caseDef.id,
    kind: caseDef.kind,
    metrics,
    input: payload.input || {},
    imageIds,
    device: deviceFlat.value?.model || '',
  });
  records.value = [...records.value, saved];
  storage.value = await storageSummary();
}

async function handleDelete(record) {
  try {
    await ElMessageBox.confirm(t('verification.deleteConfirm'), t('verification.deleteRecord'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    });
  } catch {
    return;
  }
  await deleteRecord(record.id);
  records.value = records.value.filter(item => item.id !== record.id);
  storage.value = await storageSummary();
}

async function clearAllData() {
  try {
    await ElMessageBox.confirm(t('verification.clearConfirm'), t('verification.clearButton'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    });
  } catch {
    return;
  }
  await clearAll();
  records.value = [];
  storage.value = { images: 0, bytes: 0 };
  for (const key of Object.keys(caseState)) delete caseState[key];
  Object.assign(meta, { tester: '', site: '', notes: '' });
  ElMessage.success(t('verification.clearDone'));
}

// ---------------------------------------------------------------- export

function textToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

async function collectEntries() {
  const files = [];
  const entries = [];
  for (const caseDef of cases) {
    const prepared = [];
    const source = records.value.filter(record => record.caseId === caseDef.id);
    for (const [index, record] of source.entries()) {
      const imageFiles = [];
      for (const [position, imageId] of (record.imageIds || []).entries()) {
        const image = await getImage(imageId);
        if (!image?.blob) continue;
        const path = `evidence/${caseDef.id}/${String(index + 1).padStart(3, '0')}-${position + 1}.jpg`;
        files.push({ path, blob: image.blob });
        imageFiles.push(path);
      }
      prepared.push({ ...record, imageFiles });
    }
    const state = caseState[caseDef.id] || {};
    entries.push({
      caseDef,
      title: t(`verification.case.${caseDef.id}.title`),
      purpose: t(`verification.case.${caseDef.id}.purpose`),
      criteria: t(`verification.case.${caseDef.id}.criteria`),
      verdict: state.verdict || '',
      note: state.note || '',
      records: prepared,
    });
  }
  return { files, entries };
}

function downloadFile(name, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function exportReport() {
  if (!records.value.length) {
    ElMessage.warning(t('verification.exportEmpty'));
    return;
  }
  if (!meta.tester.trim() || !meta.site.trim()) {
    ElMessage.warning(t('verification.exportNeedMeta'));
    return;
  }
  exporting.value = true;
  const folder = exportFolderName();
  try {
    const { files, entries } = await collectEntries();
    const report = buildVerificationReport({
      meta: { ...meta, locale: locale.value },
      device: deviceFlat.value,
      entries,
    });
    const textFiles = [
      { path: 'report.md', text: report.markdown },
      { path: 'report.json', text: JSON.stringify(report.payload, null, 2) },
      ...report.csvFiles,
    ];

    if (hasBridge) {
      for (const file of textFiles) {
        await writeExportFile(folder, file.path, textToBase64(file.text));
      }
      for (const file of files) {
        await writeExportFile(folder, file.path, await blobToBase64(file.blob));
      }
      const info = await finishExport(folder);
      ElMessage.success(info?.shared ? t('verification.exportDone') : t('verification.exportFailed'));
    } else {
      for (const file of textFiles) {
        downloadFile(file.path.split('/').pop(), new Blob([file.text], { type: 'text/plain;charset=utf-8' }));
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      for (const file of files) {
        downloadFile(file.path.split('/').pop(), file.blob);
        await new Promise(resolve => setTimeout(resolve, 180));
      }
      ElMessage.success(t('verification.exportDone'));
    }
  } catch {
    ElMessage.error(t('verification.exportFailed'));
  } finally {
    exporting.value = false;
  }
}

onMounted(async () => {
  loadLocalState();
  await reload();
  runProbe();
  checkNetwork();
});
</script>
