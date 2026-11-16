<template>
  <div class="citizen-applications-view" :class="isAppMode ? 'space-y-2.5' : 'space-y-3'">
    <section class="overflow-hidden rounded-lg border border-[#D9E5DB]/80 bg-white shadow-xs" aria-labelledby="citizen-applications-title">
      <header class="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9F1EB] p-3">
        <h1 id="citizen-applications-title" class="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-[#1B3123]">
          <el-icon class="shrink-0 text-[#326445]"><DocumentChecked /></el-icon>
          <span class="truncate">{{ $t('my.applicationRecords.title') }}</span>
          <span class="shrink-0 font-mono text-[11px] font-semibold text-[#8A9A8F]">{{ filteredRecords.length }}</span>
        </h1>
        <el-button text circle size="small" :aria-label="$t('common.refresh')" @click="loadRecords">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </header>

      <!-- 过滤参数：类型 / 状态 / 申请编号 -->
      <div
        class="grid grid-cols-2 gap-2 border-b border-[#E9F1EB] p-3"
        :class="isAppMode ? '' : 'sm:flex sm:flex-wrap sm:items-center'"
      >
        <el-select
          v-model="typeFilter"
          size="small"
          class="w-full"
          :class="isAppMode ? '' : 'sm:w-36'"
          :aria-label="$t('my.applicationFilterType')"
          :placeholder="$t('my.applicationFilterType')"
        >
          <el-option :label="$t('my.applicationAnyType')" value="" />
          <el-option v-for="code in APPLICATION_SOURCE_CODES" :key="code" :label="$t(`my.applicationTypes.${code}`)" :value="code" />
        </el-select>
        <el-select
          v-model="statusFilter"
          size="small"
          class="w-full"
          :class="isAppMode ? '' : 'sm:w-32'"
          :aria-label="$t('my.applicationFilterStatus')"
          :placeholder="$t('my.applicationFilterStatus')"
        >
          <el-option :label="$t('my.applicationAnyStatus')" value="" />
          <el-option v-for="status in statusOptions" :key="status" :label="$t(`my.applicationStatuses.${status}`)" :value="status" />
        </el-select>
        <el-input
          v-model.trim="search"
          size="small"
          class="col-span-2 w-full"
          :class="isAppMode ? '' : 'sm:col-span-1 sm:w-44'"
          clearable
          :placeholder="$t('my.applicationSearchNumber')"
        />
        <el-button
          v-if="hasFilters"
          text
          size="small"
          class="col-span-2 justify-self-end"
          :class="isAppMode ? '' : 'sm:col-span-1 sm:justify-self-auto'"
          @click="clearFilters"
        >
          {{ $t('my.applicationClearFilters') }}
        </el-button>
      </div>

      <p v-if="!records.length" class="px-3 py-10 text-center text-xs text-[#8A9A8F]">{{ $t('my.applicationRecords.empty') }}</p>
      <p v-else-if="!filteredRecords.length" class="px-3 py-10 text-center text-xs text-[#8A9A8F]">{{ $t('my.applicationNoMatches') }}</p>
      <div
        v-else
        class="grid gap-2 p-3"
        :class="isAppMode ? 'grid-cols-1' : 'lg:grid-cols-2'"
        @touchstart.passive="startSwipe"
        @touchend.passive="endSwipe"
        @touchcancel.passive="cancelSwipe"
      >
        <article v-for="record in pagedRecords" :key="record.id" class="rounded-lg border border-[#D9E5DB] bg-white p-3 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#E9F1EB] pb-2">
            <h2 class="text-[12px] font-bold text-[#1F3326]">{{ $t(`my.applicationTypes.${record.sourceCode}`) }}</h2>
            <div class="flex flex-wrap items-center gap-1 shrink-0">
              <el-tag size="small" effect="plain">{{ $t(`my.${applicationReviewMode(record)}Review`) }}</el-tag>
              <el-tag size="small" :type="statusTagType(record)" effect="dark">{{ $t(`my.applicationStatuses.${statusKey(record)}`) }}</el-tag>
            </div>
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

      <!-- 滑动分页 + 页码指示器 -->
      <footer v-if="pageCount > 1" class="flex flex-wrap items-center justify-between gap-2 border-t border-[#E9F1EB] p-3">
        <span class="text-[11px] text-[#8A9A8F]">{{ $t('my.listTotal', { count: filteredRecords.length }) }}</span>
        <nav class="flex items-center gap-1" :aria-label="$t('my.pagination')">
          <button
            v-for="page in visiblePageIndicators"
            :key="page"
            type="button"
            class="page-dot"
            :class="{ 'is-current': page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            :aria-label="$t('my.pageIndicator', { page, total: pageCount })"
            @click="goToPage(page)"
          >
            <span />
          </button>
        </nav>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { DocumentChecked, Refresh } from '@element-plus/icons-vue';
import { useCitizenStore } from '../../stores/citizen.js';
import { useAppMode } from '../../composables/useCompactDialog.js';
import {
  APPLICATION_SOURCE_CODES,
  applicationReviewMode,
  applicationStatusKey,
  listCitizenApplications
} from '../../utils/citizenApplications.js';

const { t, locale } = useI18n();
const isAppMode = useAppMode();
const citizenStore = useCitizenStore();

const PAGE_SIZE = 5;
const records = ref([]);
const typeFilter = ref('');
const statusFilter = ref('');
const search = ref('');
const currentPage = ref(1);
const statusOptions = ['pending', 'approved', 'rejected'];

const family = computed(() => citizenStore.currentFamily || citizenStore.families[0] || null);
const cardNo = computed(() => family.value?.rationCardNo || 'RC-10029381');
const hasFilters = computed(() => Boolean(typeFilter.value || statusFilter.value || search.value));
const isRtl = computed(() => ['ar', 'ckb', 'ku'].includes(locale.value));

const filteredRecords = computed(() => {
  const keyword = search.value.toLowerCase();
  return records.value.filter(record => (
    (!typeFilter.value || record.sourceCode === typeFilter.value)
    && (!statusFilter.value || applicationStatusKey(record) === statusFilter.value)
    && (!keyword || String(record.id || '').toLowerCase().includes(keyword))
  ));
});

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / PAGE_SIZE)));
const pagedRecords = computed(() => filteredRecords.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE));
// Keep the indicators within narrow phone screens, even for long histories.
const visiblePageIndicators = computed(() => {
  const count = Math.min(7, pageCount.value);
  const start = Math.max(1, Math.min(currentPage.value - 3, pageCount.value - count + 1));
  return Array.from({ length: count }, (_, index) => start + index);
});

watch([typeFilter, statusFilter, search], () => { currentPage.value = 1; });
watch(pageCount, count => { if (currentPage.value > count) currentPage.value = count; });

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
  search.value = '';
}

function goToPage(page) {
  currentPage.value = Math.max(1, Math.min(pageCount.value, page));
}

// Swipe left/right flips pages on touch devices; vertical scrolling stays untouched.
let swipeStart = null;

function startSwipe(event) {
  swipeStart = null;
  if (pageCount.value <= 1 || event.touches.length !== 1) return;
  const touch = event.touches[0];
  swipeStart = { id: touch.identifier, x: touch.clientX, y: touch.clientY, time: Date.now() };
}

function cancelSwipe() { swipeStart = null; }

function endSwipe(event) {
  const start = swipeStart;
  swipeStart = null;
  if (!start || event.touches.length) return;
  const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
  if (!touch) return;
  const dx = touch.clientX - start.x;
  const dy = touch.clientY - start.y;
  if (Date.now() - start.time > 1000 || Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  const forward = isRtl.value ? dx > 0 : dx < 0;
  goToPage(currentPage.value + (forward ? 1 : -1));
}

function loadRecords() {
  records.value = listCitizenApplications(cardNo.value);
  currentPage.value = 1;
}

onMounted(async () => {
  if (!citizenStore.families.length) {
    try { await citizenStore.fetchFamilies(); } catch { /* the record list falls back to the demo card */ }
  }
  loadRecords();
});
</script>

<style scoped>
.page-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0 3px;
  border-radius: 8px;
  cursor: pointer;
}
.page-dot span {
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: #D1D5D8;
  transition: background-color 160ms;
}
.page-dot.is-current span {
  background: #326445;
}
</style>
