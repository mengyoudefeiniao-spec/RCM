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
        <article
          v-for="record in pagedRecords"
          :key="record.id"
          class="record-card"
          :class="[expandedId === record.id ? 'is-open' : '', isRejected(record) ? 'is-rejected' : '']"
        >
          <!-- 记录摘要：点击展开详情 -->
          <button
            type="button"
            class="record-head"
            :aria-expanded="expandedId === record.id"
            :aria-label="$t('my.applicationRecords.details')"
            @click="toggleRecord(record)"
          >
            <span class="min-w-0 flex-1 text-start">
              <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span class="text-[12px] font-bold text-[#1F3326]">{{ $t(`my.applicationTypes.${record.sourceCode}`) }}</span>
                <el-tag size="small" :type="statusTagType(record)" effect="dark">{{ $t(`my.applicationStatuses.${statusKey(record)}`) }}</el-tag>
              </span>
              <span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#58685D]">
                <span>{{ $t('my.applicationRecords.reference') }} <bdi dir="ltr" class="font-mono font-semibold text-[#1F3326]">{{ record.id }}</bdi></span>
                <bdi dir="ltr" class="font-mono">{{ record.submittedAt }}</bdi>
              </span>
            </span>
            <el-icon class="rtl-mirror-icon shrink-0 text-[#8A9A8F] transition-transform" :class="{ 'rotate-90': expandedId === record.id }">
              <ArrowRight />
            </el-icon>
          </button>

          <!-- 驳回原因（申请人可见） -->
          <p v-if="isRejected(record) && rejectReason(record)" class="mt-2 rounded-md border border-[#F0D4D0] bg-[#FDF5F4] p-2 text-[11px] leading-relaxed text-[#A53A2D]">
            <span class="font-bold">{{ $t('my.applicationRecords.rejectReason') }}: </span>{{ rejectReason(record) }}
          </p>

          <!-- 展开详情 -->
          <div v-if="expandedId === record.id" class="mt-2 space-y-2.5 border-t border-[#E9F1EB] pt-2.5 text-[11px] text-[#58685D]">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span>{{ $t('my.applicationRecords.submittedAt') }}</span>
              <bdi dir="ltr" class="font-mono text-[#1F3326]">{{ record.submittedAt }}</bdi>
            </div>
            <div v-if="localizedText(record.center)" class="flex flex-wrap items-center justify-between gap-2">
              <span>{{ $t('my.applicationRecords.center') }}</span>
              <span class="min-w-0 truncate text-end font-medium text-[#1F3326]">{{ localizedText(record.center) }}</span>
            </div>
            <div v-if="localizedText(record.targetMemberName)" class="flex flex-wrap items-center justify-between gap-2">
              <span>{{ $t('my.applicationRecords.targetMember') }}</span>
              <span class="min-w-0 truncate text-end font-medium text-[#1F3326]">{{ localizedText(record.targetMemberName) }}</span>
            </div>

            <!-- 电子支付记录 -->
            <div class="rounded-lg border border-[#E9F1EB] bg-[#FAFCFB] p-2 space-y-1.5">
              <div class="text-[11px] font-bold text-[#43554B]">{{ $t('my.applicationRecords.paymentTitle') }}</div>
              <template v-if="paymentOf(record)">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span>{{ $t('my.applicationRecords.paymentAmount') }}</span>
                  <bdi dir="ltr" class="font-mono font-semibold text-[#326445]">{{ Number(paymentOf(record).paidAmount || paymentOf(record).amount || 0).toLocaleString() }} IQD</bdi>
                </div>
                <div v-if="paymentOf(record).channel" class="flex flex-wrap items-center justify-between gap-2">
                  <span>{{ $t('my.applicationRecords.paymentChannel') }}</span>
                  <span class="min-w-0 truncate text-end text-[#1F3326]">{{ paymentOf(record).channel }}</span>
                </div>
                <div v-if="paymentReference(record)" class="flex flex-wrap items-center justify-between gap-2">
                  <span>{{ $t('my.applicationRecords.paymentTxn') }}</span>
                  <bdi dir="ltr" class="min-w-0 truncate font-mono text-[#1F3326]">{{ paymentReference(record) }}</bdi>
                </div>
                <div v-if="paymentOf(record).paidAt" class="flex flex-wrap items-center justify-between gap-2">
                  <span>{{ $t('my.applicationRecords.paymentTime') }}</span>
                  <bdi dir="ltr" class="font-mono text-[#1F3326]">{{ String(paymentOf(record).paidAt).replace('T', ' ').slice(0, 16) }}</bdi>
                </div>
              </template>
              <p v-else class="text-[#8A9A8F]">{{ $t('my.applicationRecords.paymentEmpty') }}</p>
            </div>

            <!-- 上传的文件 -->
            <div class="rounded-lg border border-[#E9F1EB] bg-[#FAFCFB] p-2 space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-bold text-[#43554B]">{{ $t('my.applicationRecords.filesTitle') }}</span>
                <el-button v-if="canUpload(record)" text size="small" type="primary" :loading="uploading" @click.stop="pickFile(record, null)">
                  {{ $t('my.applicationRecords.addFile') }}
                </el-button>
              </div>
              <p v-if="!(record.attachments || []).length" class="text-[#8A9A8F]">{{ $t('my.applicationRecords.filesEmpty') }}</p>
              <div
                v-for="(file, index) in record.attachments || []"
                :key="`${file.name}-${index}`"
                class="flex items-center justify-between gap-2 border-t border-[#E9F1EB] pt-1.5 first:border-t-0 first:pt-0"
              >
                <span class="min-w-0 flex items-center gap-1.5">
                  <span class="truncate text-[#1F3326]">{{ file.name }}</span>
                  <el-tag v-if="file.verified" size="small" type="success" effect="plain" class="shrink-0">{{ $t('my.verified') }}</el-tag>
                </span>
                <el-button v-if="canUpload(record)" text size="small" :loading="uploading" @click.stop="pickFile(record, index)">
                  {{ $t('my.applicationRecords.replaceFile') }}
                </el-button>
              </div>
            </div>
          </div>
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

    <input ref="fileInputRef" type="file" accept=".pdf,.jpg,.jpeg,.png,image/*" class="hidden" @change="handleFilePicked" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { ArrowRight, DocumentChecked, Refresh } from '@element-plus/icons-vue';
import { useCitizenStore } from '../../stores/citizen.js';
import { useAppMode } from '../../composables/useCompactDialog.js';
import { updateSharedTicket } from '../../utils/sharedSession.js';
import { onTabMessage } from '../../utils/crossTabBus.js';
import { saveMockMaterial } from '../../utils/mockMaterialFiles.js';
import {
  APPLICATION_SOURCE_CODES,
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
const expandedId = ref('');
const uploading = ref(false);
const fileInputRef = ref(null);
const statusOptions = ['pending', 'approved', 'rejected'];

const family = computed(() => citizenStore.currentFamily || citizenStore.families[0] || null);
const cardNo = computed(() => family.value?.rationCardNo || 'RC-10029381');
const hasFilters = computed(() => Boolean(typeFilter.value || statusFilter.value || search.value));
const isRtl = computed(() => ['ar', 'ckb', 'ku'].includes(locale.value));

// Rejected applications come first so the applicant sees what needs action.
const orderedRecords = computed(() => [...records.value].sort((a, b) => {
  const rank = record => (applicationStatusKey(record) === 'rejected' ? 0 : 1);
  const byStatus = rank(a) - rank(b);
  if (byStatus) return byStatus;
  return new Date(String(b.submittedAt || '').replace(' ', 'T')) - new Date(String(a.submittedAt || '').replace(' ', 'T'));
}));

const filteredRecords = computed(() => {
  const keyword = search.value.toLowerCase();
  return orderedRecords.value.filter(record => (
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

function isRejected(record) {
  return statusKey(record) === 'rejected';
}

// Only the rejection reason is applicant-facing; approval opinions from staff stay hidden.
function rejectReason(record) {
  if (!isRejected(record)) return '';
  return String(record.managerNotes || record.managerOpinion || record.auditNotes || record.staffOpinion || '').trim();
}

// Arabic and Kurdish catalogs fall back to the source demo tickets, so only stable localized labels are shown there.
function localizedText(value) {
  if (!value) return '';
  return locale.value === 'zh' || locale.value === 'en' ? String(value) : '';
}

function paymentOf(record) {
  return record?.paymentInfo || record?.payload?.paymentInfo || null;
}

function paymentReference(record) {
  const payment = paymentOf(record);
  return payment?.txnNo || payment?.orderId || '';
}

// Approved applications are closed, so their files can no longer be replaced.
function canUpload(record) {
  return statusKey(record) !== 'approved';
}

function toggleRecord(record) {
  if (Date.now() < suppressClickUntil) return;
  expandedId.value = expandedId.value === record.id ? '' : record.id;
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
let suppressClickUntil = 0;

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
  suppressClickUntil = Date.now() + 400;
  const forward = isRtl.value ? dx > 0 : dx < 0;
  goToPage(currentPage.value + (forward ? 1 : -1));
}

let pendingUpload = null;

function pickFile(record, index) {
  pendingUpload = { record, index };
  fileInputRef.value?.click();
}

async function handleFilePicked(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  const target = pendingUpload;
  pendingUpload = null;
  if (!file || !target) return;
  uploading.value = true;
  try {
    const fileId = await saveMockMaterial('citizen', `ticket-${target.record.id}-${Date.now()}`, file);
    const attachments = [...(target.record.attachments || [])];
    const uploaded = {
      name: file.name,
      type: target.index === null ? 'optional' : (attachments[target.index]?.type || 'optional'),
      verified: false,
      fileId,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    if (target.index === null) attachments.push(uploaded);
    else attachments[target.index] = { ...attachments[target.index], ...uploaded };
    const updated = updateSharedTicket(target.record.id, { attachments });
    if (updated) Object.assign(target.record, { attachments });
    ElMessage.success(t('my.applicationRecords.fileUploaded'));
  } catch {
    ElMessage.error(t('my.applicationRecords.fileUploadFailed'));
  } finally {
    uploading.value = false;
  }
}

function loadRecords() {
  records.value = listCitizenApplications(cardNo.value);
  currentPage.value = 1;
}

// 其他页面提交申请后立即刷新列表，无需手动点刷新
function handleTicketAdded(event) {
  const addedCardNo = event?.detail?.cardNo;
  if (addedCardNo && cardNo.value && addedCardNo !== cardNo.value) return;
  loadRecords();
}

let offTicketSubmitted = null;
let offTicketUpdated = null;

onMounted(async () => {
  if (!citizenStore.families.length) {
    try { await citizenStore.fetchFamilies(); } catch { /* the record list falls back to the demo card */ }
  }
  loadRecords();
  window.addEventListener('rcm-ticket-added', handleTicketAdded);
  offTicketSubmitted = onTabMessage('TICKET_SUBMITTED', handleTicketAdded);
  offTicketUpdated = onTabMessage('TICKET_UPDATED', handleTicketAdded);
});

onBeforeUnmount(() => {
  window.removeEventListener('rcm-ticket-added', handleTicketAdded);
  if (offTicketSubmitted) offTicketSubmitted();
  if (offTicketUpdated) offTicketUpdated();
});
</script>

<style scoped>
.record-card {
  border: 1px solid #D9E5DB;
  border-radius: 10px;
  background: #FFFFFF;
  padding: 10px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.record-card:hover {
  border-color: #C9DBCE;
}
.record-card.is-open {
  border-color: #C7DED0;
  background: #FCFDFC;
}
.record-card.is-rejected {
  border-color: #EBD3CF;
}
.record-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-width: 0;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.record-head:focus-visible {
  outline: none;
  border-radius: 8px;
  box-shadow: 0 0 0 2px rgba(211, 175, 98, .35);
}
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
