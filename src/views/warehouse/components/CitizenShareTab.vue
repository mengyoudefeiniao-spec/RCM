<template>
  <div class="ration-share-tab space-y-3">
    <div class="grid gap-3 lg:grid-cols-5">
      <!-- 家庭代理签约网点 -->
      <section class="rounded-lg border border-[#C7DED0] bg-white p-3 shadow-xs lg:col-span-2" aria-labelledby="ration-share-station-title">
        <div class="flex items-start gap-2.5">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#C7DED0] bg-[#EFF5F1] text-[#326445]">
            <el-icon :size="16"><Shop /></el-icon>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <h2 id="ration-share-station-title" class="text-[13px] font-bold leading-snug text-[#1B3123] break-words">{{ station.agentName }}</h2>
              <el-tag size="small" type="success" effect="dark" class="shrink-0 font-bold">{{ $t('rationShare.contractedStation') }}</el-tag>
            </div>
            <div class="mt-1.5 space-y-1 text-[11px] text-[#58685D]">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span>{{ $t('rationShare.agentCode') }}</span>
                <bdi dir="ltr" class="font-mono font-semibold text-[#1F3326]">{{ station.agentId }}</bdi>
              </div>
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span>{{ $t('rationShare.center') }}</span>
                <span class="min-w-0 truncate text-end font-medium text-[#1F3326]">{{ station.district }}</span>
              </div>
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span>{{ $t('rationShare.province') }}</span>
                <span class="min-w-0 truncate text-end font-medium text-[#1F3326]">{{ station.province }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 本批配额 -->
      <section class="rounded-lg border border-[#D9E5DB]/80 bg-white p-3 shadow-xs lg:col-span-3" aria-labelledby="ration-share-quota-title">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h2 id="ration-share-quota-title" class="flex items-center gap-1.5 text-[13px] font-bold text-[#1B3123]">
              <el-icon class="shrink-0 text-[#326445]"><GoodsFilled /></el-icon>
              <span class="truncate">{{ $t('rationShare.quotaTitle') }}</span>
            </h2>
            <p v-if="batchWindowLabel" class="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-[#8A9A8F]">
              <span>{{ $t('rationShare.batchWindow') }}</span>
              <bdi dir="ltr" class="font-mono text-[#58685D]">{{ batchWindowLabel }}</bdi>
            </p>
          </div>
          <el-button text circle size="small" :loading="quotaLoading" :aria-label="$t('rationShare.refresh')" @click="loadQuota">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>

        <div v-if="quotaLoading && !quotaItems.length" class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div v-for="i in 4" :key="i" class="h-14 animate-pulse rounded-md border border-[#E1F4E4] bg-[#F8FBF9]" />
        </div>
        <div v-else-if="quotaItems.length" class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div v-for="item in quotaItems" :key="item.itemCode" class="rounded-md border border-[#E1F4E4] bg-[#F8FBF9] px-2 py-1.5">
            <div class="truncate text-[11px] font-semibold text-[#43554B]">{{ formatRationItem(item) }}</div>
            <div class="mt-0.5 flex items-baseline gap-1 text-xs">
              <span class="font-mono font-bold text-[#2F7A50]">{{ item.remainingQuota }}</span>
              <span class="text-[10px] text-[#8A9A8F]">/ {{ item.totalHouseholdQuota }} {{ item.unit }}</span>
            </div>
            <div class="text-[10px] text-[#8A9A8F]">{{ $t('rationShare.quotaRemaining') }}</div>
          </div>
        </div>
        <p v-else class="py-4 text-center text-xs text-[#8A9A8F]">{{ $t('rationShare.quotaEmpty') }}</p>
      </section>
    </div>

    <!-- 申领记录：按历史批次查询 -->
    <section class="overflow-hidden rounded-lg border border-[#D9E5DB]/80 bg-white shadow-xs" aria-labelledby="ration-share-records-title">
      <header class="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9F1EB] p-3">
        <h2 id="ration-share-records-title" class="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-[#1B3123]">
          <el-icon class="shrink-0 text-[#326445]"><Tickets /></el-icon>
          <span class="truncate">{{ $t('rationShare.recordsTitle') }}</span>
          <span class="shrink-0 font-mono text-[11px] font-semibold text-[#8A9A8F]">{{ filteredRecords.length }}</span>
        </h2>
        <div class="flex items-center gap-1.5">
          <el-select v-model="selectedBatch" size="small" class="w-32 sm:w-40" :aria-label="$t('rationShare.allBatches')">
            <el-option :label="$t('rationShare.allBatches')" value="" />
            <el-option v-for="batch in batchOptions" :key="batch.key" :label="batch.label" :value="batch.key" />
          </el-select>
          <el-button text circle size="small" :loading="loading" :aria-label="$t('rationShare.refresh')" @click="loadRecords">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </header>

      <div v-if="loading" class="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="i in 2" :key="i" class="h-20 animate-pulse rounded-lg border border-[#E9F1EB] bg-[#F3F8F4]" />
      </div>
      <p v-else-if="!filteredRecords.length" class="px-3 py-10 text-center text-xs text-[#8A9A8F]">{{ $t('rationShare.empty') }}</p>
      <div v-else class="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="record in filteredRecords"
          :key="record.id || record.claimVoucherNo"
          type="button"
          class="record-card"
          @click="openRecord(record)"
        >
          <div class="flex items-center justify-between gap-2 border-b border-[#E9F1EB] pb-2">
            <span class="min-w-0 truncate text-[11px] font-bold text-[#326445]">{{ batchLabel(record) }}</span>
            <el-tag size="small" type="success" effect="dark" class="shrink-0">{{ $t('rationShare.statusClaimed') }}</el-tag>
          </div>
          <div class="flex flex-wrap gap-1 pt-2">
            <span v-for="item in record.claimedItems || []" :key="item.itemName" class="record-chip">
              {{ formatRationItem(item, true) }} <b class="font-mono">×{{ item.qty }}{{ item.unit }}</b>
            </span>
          </div>
          <div class="flex items-center justify-between gap-2 pt-1.5 text-[10px] text-[#8A9A8F]">
            <bdi dir="ltr" class="min-w-0 truncate font-mono">{{ record.claimVoucherNo }}</bdi>
            <bdi dir="ltr" class="shrink-0 font-mono">{{ record.claimTime }}</bdi>
          </div>
        </button>
      </div>
    </section>

    <!-- 线下核销领取记录 -->
    <el-dialog
      v-model="detailVisible"
      :title="$t('rationShare.detailTitle')"
      :width="dialogWidth"
      align-center
      :class="{ 'rcm-compact-dialog': isCompact }"
    >
      <div v-if="detailRecord" class="space-y-3 text-xs">
        <div class="flex items-center gap-2 rounded-lg border border-[#C7DED0] bg-[#F3F8F4] p-2.5">
          <el-icon class="shrink-0 text-[#326445]"><CircleCheckFilled /></el-icon>
          <span class="font-bold text-[#1B3123]">{{ $t('rationShare.statusClaimed') }}</span>
          <bdi dir="ltr" class="ms-auto min-w-0 truncate font-mono text-[11px] text-[#58685D]">{{ detailRecord.claimVoucherNo }}</bdi>
        </div>

        <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5">
          <dt class="text-[#8A9A8F]">{{ $t('rationShare.batch') }}</dt>
          <dd class="font-semibold text-[#1F3326]">{{ batchLabel(detailRecord) }}</dd>
          <dt class="text-[#8A9A8F]">{{ $t('rationShare.claimTime') }}</dt>
          <dd><bdi dir="ltr" class="font-mono text-[#43554B]">{{ detailRecord.claimTime || '—' }}</bdi></dd>
          <dt class="text-[#8A9A8F]">{{ $t('rationShare.station') }}</dt>
          <dd class="break-words text-[#1F3326]">
            {{ stripAgentCode(detailRecord.agentName) || '—' }}
            <bdi v-if="stationCode(detailRecord.agentName, detailRecord.agentCenterId)" dir="ltr" class="ms-1 font-mono text-[11px] text-[#8A9A8F]">
              {{ stationCode(detailRecord.agentName, detailRecord.agentCenterId) }}
            </bdi>
          </dd>
          <dt class="text-[#8A9A8F]">{{ $t('rationShare.eligibleMembers') }}</dt>
          <dd class="text-[#1F3326]">{{ detailRecord.eligibleMembers != null ? $t('rationShare.unitSuffix', { count: detailRecord.eligibleMembers }) : '—' }}</dd>
          <dt class="text-[#8A9A8F]">{{ $t('rationShare.claimMethod') }}</dt>
          <dd class="text-[#1F3326]">{{ methodLabel(detailRecord.cardReadMethod) }}</dd>
        </dl>

        <div class="space-y-1.5 rounded-lg border border-[#D9E5DB] p-2.5">
          <div class="text-[11px] font-bold text-[#43554B]">{{ $t('rationShare.items') }}</div>
          <div v-for="item in detailRecord.claimedItems || []" :key="item.itemName" class="flex items-center justify-between gap-2">
            <span class="min-w-0 truncate">{{ formatRationItem(item) }}</span>
            <bdi dir="ltr" class="shrink-0 font-mono font-semibold text-[#326445]">{{ item.qty }} {{ item.unit }}</bdi>
          </div>
        </div>

        <p class="text-[10px] leading-relaxed text-[#8A9A8F]">{{ $t('rationShare.offlineNote') }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">{{ $t('common.close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Shop, Tickets, Refresh, CircleCheckFilled, GoodsFilled } from '@element-plus/icons-vue';
import { useCitizenStore } from '../../../stores/citizen.js';
import { getCitizenQuotaBalance } from '../../../api/citizen.js';
import { getCitizenClaimRecords } from '../../../api/warehouse.js';
import { useRationI18n } from '../../../utils/rationI18n.js';
import { useCompactDialog } from '../../../composables/useCompactDialog.js';

const { t, locale } = useI18n();
const { formatRationItem, formatQuotaPeriod } = useRationI18n();
const { isCompact, dialogWidth } = useCompactDialog(480);
const citizenStore = useCitizenStore();

const loading = ref(false);
const records = ref([]);
const selectedBatch = ref('');
const detailVisible = ref(false);
const detailRecord = ref(null);
const quota = ref({});
const quotaItems = ref([]);
const quotaLoading = ref(false);

const family = computed(() => citizenStore.currentFamily || citizenStore.families[0] || null);
const cardNo = computed(() => family.value?.rationCardNo || 'RC-10029381');
const station = computed(() => ({
  agentName: stripAgentCode(family.value?.agentName) || '—',
  agentId: family.value?.agentId || '—',
  district: family.value?.district || '—',
  province: family.value?.province || '—'
}));
const displayQuotaPeriod = computed(() => formatQuotaPeriod(String(quota.value?.quotaPeriod || '')));

// Station codes may already be embedded in the agent name; show them once only.
const AGENT_CODE_SUFFIX = /\s*[（(]\s*(?:F[AD]-[0-9A-Za-z-]+)\s*[)）]\s*$/;
const AGENT_CODE_ANYWHERE = /(?:F[AD]-[0-9A-Za-z-]+)/;

function stripAgentCode(name) {
  return String(name || '').replace(AGENT_CODE_SUFFIX, '').trim();
}

function stationCode(name, fallbackCode) {
  const embedded = AGENT_CODE_ANYWHERE.exec(String(name || ''));
  return embedded ? '' : String(fallbackCode || '');
}

function formatBatchDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(value || '');
  const language = { zh: 'zh-CN', en: 'en-GB', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-GB';
  return new Intl.DateTimeFormat(language, {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC', calendar: 'gregory'
  }).format(date);
}

// Each batch runs on its own window (not a 30-day calendar month).
const batchWindowLabel = computed(() => {
  const start = quota.value?.batchStartDate;
  const end = quota.value?.batchEndDate;
  if (start && end) return `${formatBatchDate(start)} — ${formatBatchDate(end)}`;
  return displayQuotaPeriod.value;
});

// The quota period identifies the batch a claim belongs to; the claim time is only a fallback.
function batchKeyOf(record) {
  const periodMatch = /(\d{4})\D{0,3}(\d{1,2})/.exec(String(record?.claimPeriod || ''));
  const match = periodMatch || /^(\d{4})[-/](\d{1,2})/.exec(String(record?.claimTime || ''));
  return match ? `${match[1]}-${String(match[2]).padStart(2, '0')}` : '';
}

function batchLabelText(key) {
  return key ? formatQuotaPeriod(key) : '—';
}

function batchLabel(record) {
  return batchLabelText(batchKeyOf(record)) || record?.claimPeriod || '—';
}

const batchOptions = computed(() => [...new Set(records.value.map(batchKeyOf).filter(Boolean))]
  .sort((a, b) => b.localeCompare(a))
  .map(key => ({ key, label: batchLabelText(key) })));

const filteredRecords = computed(() => (selectedBatch.value
  ? records.value.filter(record => batchKeyOf(record) === selectedBatch.value)
  : records.value));

// Known verification methods are translated; unknown values stay as supplied by the station record.
const METHOD_KEYS = [
  [/nfc/i, 'methodNfc'],
  [/扫码|scan|مسح|سکان/i, 'methodQr'],
  [/生物|biometric|حيوي|بایۆ/i, 'methodBiometric'],
  [/芯片|chip|شريحة|چیپ/i, 'methodChip'],
  [/身份|identity|هوية|ناسنامە/i, 'methodIdentity']
];

function methodLabel(value) {
  const text = String(value || '');
  if (!text) return '—';
  const matched = METHOD_KEYS.find(([pattern]) => pattern.test(text));
  return matched ? t(`rationShare.${matched[1]}`) : text;
}

function openRecord(record) {
  detailRecord.value = record;
  detailVisible.value = true;
}

async function ensureFamily() {
  if (citizenStore.families.length) return;
  try { await citizenStore.fetchFamilies(); } catch { /* the station card falls back to placeholders */ }
}

async function loadRecords() {
  if (loading.value) return;
  loading.value = true;
  try {
    const list = await getCitizenClaimRecords({ cardNo: cardNo.value });
    const rows = Array.isArray(list) ? list : [];
    records.value = rows
      .filter(row => row && row.rationCardNo === cardNo.value)
      .sort((a, b) => String(b.claimTime || '').localeCompare(String(a.claimTime || '')));
  } catch {
    records.value = [];
    ElMessage.error(t('rationShare.loadFailed'));
  } finally {
    loading.value = false;
  }
}

// The quota balance endpoint returns the currently effective batch and its per-household allocation.
async function loadQuota() {
  if (quotaLoading.value) return;
  quotaLoading.value = true;
  try {
    const result = await getCitizenQuotaBalance(cardNo.value);
    quota.value = result || {};
    quotaItems.value = Array.isArray(result?.quotas) ? result.quotas : [];
  } catch {
    quota.value = {};
    quotaItems.value = [];
  } finally {
    quotaLoading.value = false;
  }
}

onMounted(async () => {
  await ensureFamily();
  await Promise.all([loadQuota(), loadRecords()]);
});
</script>

<style scoped>
.record-card {
  display: block;
  width: 100%;
  min-width: 0;
  padding: 10px;
  border: 1px solid #D9E5DB;
  border-radius: 10px;
  background: #FFFFFF;
  text-align: start;
  cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
}
.record-card:hover {
  border-color: #C9DBCE;
  background: #F8FBF9;
}
.record-card:focus-visible {
  outline: none;
  border-color: #D3AF62;
  box-shadow: 0 0 0 2px rgba(211, 175, 98, .25);
}
.record-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border: 1px solid #D9E5DB;
  border-radius: 6px;
  background: #F3F8F4;
  color: #43554B;
  font-size: 10px;
  white-space: nowrap;
}
</style>
