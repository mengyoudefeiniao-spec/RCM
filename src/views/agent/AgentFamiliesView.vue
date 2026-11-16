<template>
  <div class="agent-families-view" :class="isAppMode ? 'space-y-2.5 px-4 pt-3 pb-4' : 'space-y-3'">
    <!-- 花名册概览：极简三段式统计，与主题白卡 + 绿色强调保持一致 -->
    <section class="rounded-2xl border border-[#e7e9eb] bg-white px-3.5 py-3 shadow-[var(--rcm-shadow-card)]">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h1 class="text-sm font-bold text-[#202326] leading-snug">{{ $t('agentFamilies.title') }}</h1>
          <p class="mt-0.5 text-[11px] text-[#89929f] leading-snug">{{ $t('agentFamilies.subtitle') }}</p>
        </div>
        <span class="shrink-0 rounded-full border border-[#cbe9d9] bg-[#eaf8f1] px-2 py-0.5 text-[10px] font-bold font-mono text-[#118653]">
          <bdi dir="ltr">{{ siteId }}</bdi>
        </span>
      </div>

      <div class="mt-3 grid grid-cols-3 border-t border-[#eef0f2] pt-2.5 text-center">
        <div class="pe-1">
          <div class="text-base font-bold font-mono text-[#202326]">{{ formatNumber(totals.families) }}</div>
          <div class="mt-0.5 text-[10px] text-[#89929f] leading-tight">{{ $t('agentFamilies.totalFamilies') }}</div>
        </div>
        <div class="border-s border-e border-[#eef0f2] px-1">
          <div class="text-base font-bold font-mono text-[#202326]">{{ formatNumber(totals.members) }}</div>
          <div class="mt-0.5 text-[10px] text-[#89929f] leading-tight">{{ $t('agentFamilies.totalMembers') }}</div>
        </div>
        <div class="ps-1">
          <div class="text-base font-bold font-mono text-[#15975a]">{{ formatNumber(totals.quotaKg) }}</div>
          <div class="mt-0.5 text-[10px] text-[#89929f] leading-tight">{{ $t('agentFamilies.totalQuota') }}</div>
        </div>
      </div>
    </section>

    <!-- 搜索：单一输入框 + 结果计数，不做多余筛选器 -->
    <section class="rounded-2xl border border-[#e7e9eb] bg-white px-3 py-2.5 shadow-[var(--rcm-shadow-card)] space-y-1.5">
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
      <div class="flex items-center justify-between gap-2 text-[11px] text-[#89929f]">
        <span>{{ $t('agentFamilies.resultCount', { count: filteredRows.length }) }}</span>
        <button
          v-if="keyword"
          type="button"
          class="font-semibold text-[#15975a] active:opacity-70"
          @click="keyword = ''"
        >
          {{ $t('agentFamilies.clearSearch') }}
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

      <el-empty v-else :description="keyword ? $t('agentFamilies.emptyFiltered') : $t('agentFamilies.empty')" />
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
const siteId = computed(() => rows.value[0]?.agentId || AGENT_FAMILY_DEMO_SITE_ID);

const STATUS_KEYS = { ACTIVE: 'statusActive', REVIEW: 'statusReview', SUSPENDED: 'statusSuspended' };
const STATUS_CLASSES = {
  ACTIVE: 'border-[#cbe9d9] bg-[#eaf8f1] text-[#118653]',
  REVIEW: 'border-[#f0dfb6] bg-[#fdf6e7] text-[#9a7420]',
  SUSPENDED: 'border-[#f3cccc] bg-[#fdecec] text-[#c04442]'
};

function statusKey(code) {
  return `agentFamilies.${STATUS_KEYS[code] || STATUS_KEYS.ACTIVE}`;
}

function statusClass(code) {
  return STATUS_CLASSES[code] || STATUS_CLASSES.ACTIVE;
}

function formatNumber(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

// Names and addresses are localized by the API for the active language, while
// every stored language stays searchable so a roster query is never lost.
const filteredRows = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  if (!query) return rows.value;
  return rows.value.filter((family) => {
    const fields = [
      family.headName,
      family.address,
      family.cardNo,
      family.familyCode,
      family.nationalId,
      family.phone,
      ...Object.values(family.headNames || {}),
      ...Object.values(family.addresses || {})
    ];
    return fields.some((value) => String(value || '').toLowerCase().includes(query));
  });
});

const totals = computed(() => ({
  families: rows.value.length,
  members: rows.value.reduce((sum, family) => sum + (Number(family.memberCount) || 0), 0),
  quotaKg: rows.value.reduce(
    (sum, family) => sum + (Number(family.quota?.flourKg) || 0) + (Number(family.quota?.riceKg) || 0),
    0
  )
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
