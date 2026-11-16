<template>
  <div class="agent-families-view" :class="isAppMode ? 'space-y-2.5 px-4 pt-3 pb-4' : 'space-y-3'">
    <!-- 花名册概览：家庭/成员数量 + 按品类拆分的月度配额 -->
    <section class="rounded-2xl border border-[#e7e9eb] bg-white px-3.5 py-3 shadow-[var(--rcm-shadow-card)]">
      <div class="flex items-center justify-between gap-2">
        <h1 class="min-w-0 text-sm font-bold text-[#202326]">{{ $t('agentFamilies.title') }}</h1>
        <span class="shrink-0 rounded-full border border-[#cbe9d9] bg-[#eaf8f1] px-2 py-0.5 text-[10px] font-bold font-mono text-[#118653]">
          <bdi dir="ltr">{{ siteId }}</bdi>
        </span>
      </div>

      <div class="mt-3 grid grid-cols-2 border-t border-[#eef0f2] pt-2.5 text-center">
        <div class="pe-1">
          <div class="text-base font-bold font-mono text-[#202326]">{{ formatNumber(totals.families) }}</div>
          <div class="mt-0.5 text-[10px] text-[#89929f] leading-tight">{{ $t('agentFamilies.totalFamilies') }}</div>
        </div>
        <div class="border-s border-[#eef0f2] ps-1">
          <div class="text-base font-bold font-mono text-[#202326]">{{ formatNumber(totals.members) }}</div>
          <div class="mt-0.5 text-[10px] text-[#89929f] leading-tight">{{ $t('agentFamilies.totalMembers') }}</div>
        </div>
      </div>

      <div class="mt-2.5 border-t border-[#eef0f2] pt-2">
        <div class="text-[10px] font-semibold text-[#89929f]">{{ $t('agentFamilies.monthlyQuota') }}</div>
        <div class="mt-1 grid grid-cols-4 text-center">
          <div class="pe-1">
            <div class="text-sm font-bold font-mono text-[#15975a]">{{ formatNumber(totals.flourKg) }}<span class="text-[9px] font-normal text-[#89929f] ms-0.5">kg</span></div>
            <div class="mt-0.5 text-[10px] text-[#89929f]">{{ $t('agentFamilies.flour') }}</div>
          </div>
          <div class="border-s border-e border-[#eef0f2] px-1">
            <div class="text-sm font-bold font-mono text-[#15975a]">{{ formatNumber(totals.riceKg) }}<span class="text-[9px] font-normal text-[#89929f] ms-0.5">kg</span></div>
            <div class="mt-0.5 text-[10px] text-[#89929f]">{{ $t('agentFamilies.rice') }}</div>
          </div>
          <div class="border-s border-e border-[#eef0f2] px-1">
            <div class="text-sm font-bold font-mono text-[#15975a]">{{ formatNumber(totals.oilL) }}<span class="text-[9px] font-normal text-[#89929f] ms-0.5">L</span></div>
            <div class="mt-0.5 text-[10px] text-[#89929f]">{{ $t('agentFamilies.oil') }}</div>
          </div>
          <div class="ps-1">
            <div class="text-sm font-bold font-mono text-[#15975a]">{{ formatNumber(totals.sugarKg) }}<span class="text-[9px] font-normal text-[#89929f] ms-0.5">kg</span></div>
            <div class="mt-0.5 text-[10px] text-[#89929f]">{{ $t('agentFamilies.sugar') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 搜索与过滤：关键字 + 当前批次领取状态 + 家庭在册状态 -->
    <section class="rounded-2xl border border-[#e7e9eb] bg-white px-3 py-2.5 shadow-[var(--rcm-shadow-card)] space-y-2">
      <el-input
        v-model="keyword"
        :placeholder="$t('agentFamilies.searchPlaceholder')"
        clearable
        size="large"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div class="grid grid-cols-2 gap-2">
        <div class="min-w-0">
          <div class="mb-1 text-[10px] text-[#89929f]">{{ $t('agentFamilies.claimFilterLabel') }}</div>
          <el-select v-model="claimFilter" class="w-full" size="default">
            <el-option
              v-for="option in claimOptions"
              :key="option.value"
              :value="option.value"
              :label="$t(option.labelKey)"
            />
          </el-select>
        </div>
        <div class="min-w-0">
          <div class="mb-1 text-[10px] text-[#89929f]">{{ $t('agentFamilies.cardFilterLabel') }}</div>
          <el-select v-model="cardFilter" class="w-full" size="default">
            <el-option
              v-for="option in cardOptions"
              :key="option.value"
              :value="option.value"
              :label="$t(option.labelKey)"
            />
          </el-select>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 text-[11px] text-[#89929f]">
        <span>{{ $t('agentFamilies.resultCount', { count: filteredRows.length }) }}</span>
        <button
          v-if="hasFilters"
          type="button"
          class="font-semibold text-[#15975a] active:opacity-70"
          @click="resetFilters"
        >
          {{ $t('agentFamilies.resetFilters') }}
        </button>
      </div>
    </section>

    <!-- 已代理家庭花名册 -->
    <section class="space-y-2">
      <template v-if="loading">
        <div
          v-for="index in 3"
          :key="index"
          class="h-[92px] animate-pulse rounded-2xl border border-[#eef0f2] bg-white"
        ></div>
      </template>

      <template v-else-if="filteredRows.length">
        <article
          v-for="family in filteredRows"
          :key="family.id || family.cardNo"
          class="rounded-2xl border border-[#e7e9eb] bg-white px-3.5 py-3 shadow-[var(--rcm-shadow-card)]"
        >
          <div class="flex items-start justify-between gap-2">
            <h2 class="min-w-0 text-[13px] font-bold text-[#202326] leading-snug">{{ family.headName }}</h2>
            <span
              class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight"
              :class="statusClass(family.cardStatus)"
            >
              {{ $t(statusKey(family.cardStatus)) }}
            </span>
          </div>

          <div class="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-mono text-[#89929f]">
            <bdi dir="ltr">{{ family.cardNo }}</bdi>
            <span class="text-[#d5d8dc]">·</span>
            <bdi dir="ltr">{{ family.familyCode }}</bdi>
          </div>

          <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
            <span class="text-[#89929f]">
              {{ $t('agentFamilies.currentBatch') }} <bdi dir="ltr" class="font-mono">{{ family.currentBatch }}</bdi>
            </span>
            <span class="rounded-full border px-2 py-0.5 font-semibold leading-tight" :class="claimClass(family.claimStatus)">
              {{ $t(claimKey(family.claimStatus)) }}
            </span>
          </div>

          <div class="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-[#67717e]">
            <span>{{ $t('agentFamilies.memberCount', { count: family.memberCount }) }}</span>
            <bdi dir="ltr" class="font-mono">{{ family.phone }}</bdi>
          </div>

          <p class="mt-1 line-clamp-2 text-[11px] leading-snug text-[#89929f]">{{ family.address }}</p>

          <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#eef0f2] pt-2 text-[10px] text-[#67717e]">
            <span class="text-[#89929f]">{{ $t('agentFamilies.monthlyQuota') }}</span>
            <span>{{ $t('agentFamilies.flour') }} <b class="font-mono font-bold text-[#202326]">{{ formatNumber(family.quota?.flourKg) }}</b> kg</span>
            <span>{{ $t('agentFamilies.rice') }} <b class="font-mono font-bold text-[#202326]">{{ formatNumber(family.quota?.riceKg) }}</b> kg</span>
            <span>{{ $t('agentFamilies.oil') }} <b class="font-mono font-bold text-[#202326]">{{ formatNumber(family.quota?.oilL) }}</b> L</span>
            <span>{{ $t('agentFamilies.sugar') }} <b class="font-mono font-bold text-[#202326]">{{ formatNumber(family.quota?.sugarKg) }}</b> kg</span>
          </div>

          <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#89929f]">
            <span>{{ $t('agentFamilies.assignedDate') }} <bdi dir="ltr" class="font-mono">{{ family.assignedDate }}</bdi></span>
            <span class="text-[#d5d8dc]">·</span>
            <span>{{ $t('agentFamilies.lastVerified') }} <bdi dir="ltr" class="font-mono">{{ family.lastVerifiedAt }}</bdi></span>
            <span v-if="family.complianceStatus === 'PENDING'" class="font-semibold text-[#9a7420]">
              {{ $t('agentFamilies.pendingReview') }}
            </span>
          </div>
        </article>
      </template>

      <el-empty v-else :description="hasFilters ? $t('agentFamilies.emptyFiltered') : $t('agentFamilies.empty')" />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getAgentFamilyRoster } from '../../api/agent.js';
import { AGENT_FAMILY_DEMO_SITE_ID } from '../../utils/agentFamilyRoster.js';

const { t, locale } = useI18n();
const route = useRoute();

const isAppMode = computed(() => {
  if (route.query.layout === 'app') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

const rows = ref([]);
const loading = ref(true);
const keyword = ref('');
const claimFilter = ref('ALL');
const cardFilter = ref('ALL');
const siteId = computed(() => rows.value[0]?.agentId || AGENT_FAMILY_DEMO_SITE_ID);

const STATUS_KEYS = { ACTIVE: 'statusActive', REVIEW: 'statusReview', SUSPENDED: 'statusSuspended' };
const STATUS_CLASSES = {
  ACTIVE: 'border-[#cbe9d9] bg-[#eaf8f1] text-[#118653]',
  REVIEW: 'border-[#f0dfb6] bg-[#fdf6e7] text-[#9a7420]',
  SUSPENDED: 'border-[#f3cccc] bg-[#fdecec] text-[#c04442]'
};

const CLAIM_KEYS = { CLAIMED: 'claimClaimed', PARTIAL: 'claimPartial', PENDING: 'claimPending' };
const CLAIM_CLASSES = {
  CLAIMED: 'border-[#cbe9d9] bg-[#eaf8f1] text-[#118653]',
  PARTIAL: 'border-[#d9e6f0] bg-[#eef5fb] text-[#356a94]',
  PENDING: 'border-[#f0dfb6] bg-[#fdf6e7] text-[#9a7420]'
};

const claimOptions = [
  { value: 'ALL', labelKey: 'agentFamilies.filterAll' },
  { value: 'CLAIMED', labelKey: 'agentFamilies.claimClaimed' },
  { value: 'PARTIAL', labelKey: 'agentFamilies.claimPartial' },
  { value: 'PENDING', labelKey: 'agentFamilies.claimPending' }
];
const cardOptions = [
  { value: 'ALL', labelKey: 'agentFamilies.filterAll' },
  { value: 'ACTIVE', labelKey: 'agentFamilies.statusActive' },
  { value: 'REVIEW', labelKey: 'agentFamilies.statusReview' },
  { value: 'SUSPENDED', labelKey: 'agentFamilies.statusSuspended' }
];

function statusKey(code) {
  return `agentFamilies.${STATUS_KEYS[code] || STATUS_KEYS.ACTIVE}`;
}

function statusClass(code) {
  return STATUS_CLASSES[code] || STATUS_CLASSES.ACTIVE;
}

function claimKey(code) {
  return `agentFamilies.${CLAIM_KEYS[code] || CLAIM_KEYS.PENDING}`;
}

function claimClass(code) {
  return CLAIM_CLASSES[code] || CLAIM_CLASSES.PENDING;
}

function formatNumber(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

const hasFilters = computed(() =>
  Boolean(keyword.value.trim()) || claimFilter.value !== 'ALL' || cardFilter.value !== 'ALL');

function resetFilters() {
  keyword.value = '';
  claimFilter.value = 'ALL';
  cardFilter.value = 'ALL';
}

// Names and addresses are localized by the API for the active language, while
// every stored language stays searchable so a roster query is never lost.
const filteredRows = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  return rows.value.filter((family) => {
    if (claimFilter.value !== 'ALL' && family.claimStatus !== claimFilter.value) return false;
    if (cardFilter.value !== 'ALL' && family.cardStatus !== cardFilter.value) return false;
    if (!query) return true;
    const fields = [
      family.headName,
      family.address,
      family.cardNo,
      family.familyCode,
      family.nationalId,
      family.phone,
      family.currentBatch,
      ...Object.values(family.headNames || {}),
      ...Object.values(family.addresses || {})
    ];
    return fields.some((value) => String(value || '').toLowerCase().includes(query));
  });
});

const totals = computed(() => ({
  families: rows.value.length,
  members: rows.value.reduce((sum, family) => sum + (Number(family.memberCount) || 0), 0),
  flourKg: rows.value.reduce((sum, family) => sum + (Number(family.quota?.flourKg) || 0), 0),
  riceKg: rows.value.reduce((sum, family) => sum + (Number(family.quota?.riceKg) || 0), 0),
  oilL: rows.value.reduce((sum, family) => sum + (Number(family.quota?.oilL) || 0), 0),
  sugarKg: rows.value.reduce((sum, family) => sum + (Number(family.quota?.sugarKg) || 0), 0)
}));

async function loadRoster() {
  loading.value = true;
  try {
    const data = await getAgentFamilyRoster();
    rows.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    rows.value = [];
    ElMessage.error(t('agentFamilies.loadFailed'));
  } finally {
    loading.value = false;
  }
}

onMounted(loadRoster);
watch(locale, loadRoster);
</script>
