<template>
  <div class="citizen-applications-view space-y-3">
    <section class="overflow-hidden rounded-lg border border-[#D9E5DB]/80 bg-white shadow-xs" aria-labelledby="citizen-applications-title">
      <header class="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9F1EB] p-3.5">
        <h1 id="citizen-applications-title" class="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-[#1B3123]">
          <el-icon class="shrink-0 text-[#326445]"><DocumentChecked /></el-icon>
          <span class="truncate">{{ $t('my.applicationRecords.title') }}</span>
          <span class="shrink-0 font-mono text-[11px] font-semibold text-[#8A9A8F]">{{ filteredRecords.length }}</span>
        </h1>
        <div class="flex items-center gap-1.5">
          <el-select v-model="typeFilter" size="small" class="w-28 sm:w-36" :aria-label="$t('my.applicationRecords.filterType')">
            <el-option :label="$t('my.applicationAnyType')" value="" />
            <el-option v-for="code in APPLICATION_SOURCE_CODES" :key="code" :label="$t(`my.applicationTypes.${code}`)" :value="code" />
          </el-select>
          <el-select v-model="statusFilter" size="small" class="w-24 sm:w-32" :aria-label="$t('my.applicationRecords.filterStatus')">
            <el-option :label="$t('my.applicationAnyStatus')" value="" />
            <el-option v-for="status in statusOptions" :key="status" :label="$t(`my.applicationStatuses.${status}`)" :value="status" />
          </el-select>
          <el-button v-if="typeFilter || statusFilter" text size="small" @click="clearFilters">{{ $t('my.applicationRecords.clearFilters') }}</el-button>
          <el-button text circle size="small" :aria-label="$t('common.refresh')" @click="loadRecords">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </header>

      <p v-if="!records.length" class="px-3.5 py-10 text-center text-xs text-[#8A9A8F]">{{ $t('my.applicationRecords.empty') }}</p>
      <p v-else-if="!filteredRecords.length" class="px-3.5 py-10 text-center text-xs text-[#8A9A8F]">{{ $t('my.applicationNoMatches') }}</p>
      <div v-else class="space-y-2 p-3.5">
        <article v-for="record in filteredRecords" :key="record.id" class="rounded-lg border border-[#D9E5DB] bg-white p-3 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#E9F1EB] pb-2">
            <h2 class="text-[12px] font-bold text-[#1F3326]">{{ $t(`my.applicationTypes.${record.sourceCode}`) }}</h2>
            <el-tag size="small" :type="statusTagType(record)" effect="dark" class="shrink-0">
              {{ $t(`my.applicationStatuses.${statusKey(record)}`) }}
            </el-tag>
          </div>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#58685D]">
            <span>{{ $t('my.applicationRecords.reference') }} <bdi dir="ltr" class="font-mono font-semibold text-[#1F3326]">{{ record.id }}</bdi></span>
            <span>{{ $t('my.applicationRecords.submittedAt') }} <bdi dir="ltr" class="font-mono">{{ record.submittedAt }}</bdi></span>
          </div>

          <div v-if="localizedText(record.center)" class="text-[11px] text-[#58685D]">
            {{ $t('my.applicationRecords.center') }}: <span class="font-semibold text-[#1F3326]">{{ localizedText(record.center) }}</span>
          </div>
          <div v-if="localizedText(record.targetMemberName)" class="text-[11px] text-[#58685D]">
            {{ $t('my.applicationRecords.targetMember') }}: <span class="font-semibold text-[#1F3326]">{{ localizedText(record.targetMemberName) }}</span>
          </div>

          <p v-if="recordOutcome(record)" class="text-[11px] leading-relaxed text-[#58685D] break-words">{{ recordOutcome(record) }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { DocumentChecked, Refresh } from '@element-plus/icons-vue';
import { useCitizenStore } from '../../stores/citizen.js';
import {
  APPLICATION_SOURCE_CODES,
  applicationStatusKey,
  listCitizenApplications
} from '../../utils/citizenApplications.js';

const { t, locale } = useI18n();
const citizenStore = useCitizenStore();

const records = ref([]);
const typeFilter = ref('');
const statusFilter = ref('');
const statusOptions = ['pending', 'approved', 'rejected'];

const family = computed(() => citizenStore.currentFamily || citizenStore.families[0] || null);
const cardNo = computed(() => family.value?.rationCardNo || 'RC-10029381');

const filteredRecords = computed(() => records.value.filter(record => (
  (!typeFilter.value || record.sourceCode === typeFilter.value)
  && (!statusFilter.value || applicationStatusKey(record) === statusFilter.value)
)));

function statusKey(record) {
  return applicationStatusKey(record);
}

function statusTagType(record) {
  return { approved: 'success', pending: 'warning', rejected: 'danger' }[statusKey(record)];
}

// Arabic and Kurdish catalogs fall back to the source demo tickets, so only stable localized labels are shown there.
function localizedText(value) {
  if (!value) return '';
  return locale.value === 'zh' || locale.value === 'en' ? String(value) : '';
}

function recordOutcome(record) {
  const status = statusKey(record);
  if (locale.value === 'ar' || locale.value === 'ckb') return t(`my.applicationStatuses.${status}`);
  return localizedText(record.managerNotes || record.auditNotes || record.managerOpinion || record.staffOpinion)
    || t(`my.applicationStatuses.${status}`);
}

function clearFilters() {
  typeFilter.value = '';
  statusFilter.value = '';
}

function loadRecords() {
  records.value = listCitizenApplications(cardNo.value);
}

onMounted(async () => {
  if (!citizenStore.families.length) {
    try { await citizenStore.fetchFamilies(); } catch { /* the record list falls back to the demo card */ }
  }
  loadRecords();
});
</script>
