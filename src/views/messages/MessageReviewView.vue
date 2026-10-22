<template>
  <section class="review-page p-2 sm:p-4">
    <MessageCenterNav :can-review="canReview" />

    <header class="review-header rcm-card">
      <div class="review-heading">
        <span class="rcm-icon-box rcm-icon-box--primary review-heading-icon"><el-icon><Stamp /></el-icon></span>
        <div class="min-w-0">
          <h1>{{ t('mail.reviewPageTitle') }}</h1>
          <p>{{ t('mail.reviewPageSubtitle') }}</p>
        </div>
      </div>
      <el-button :aria-label="t('mail.refresh')" :title="t('mail.refresh')" :loading="loading" @click="loadTickets">
        <el-icon><Refresh /></el-icon><span class="hidden sm:inline">{{ t('mail.refresh') }}</span>
      </el-button>
    </header>

    <div v-if="canReview" class="review-summary">
      <article class="review-stat rcm-card">
        <span class="review-stat-icon review-stat-icon--pending"><el-icon><Clock /></el-icon></span>
        <div><span class="review-stat-label">{{ t('mail.reviewStatPending') }}</span><strong>{{ pendingCount }}</strong></div>
      </article>
      <article class="review-stat rcm-card">
        <span class="review-stat-icon review-stat-icon--processed"><el-icon><CircleCheck /></el-icon></span>
        <div><span class="review-stat-label">{{ t('mail.reviewStatProcessed') }}</span><strong>{{ processedCount }}</strong></div>
      </article>
      <article class="review-stat rcm-card">
        <span class="review-stat-icon review-stat-icon--total"><el-icon><Tickets /></el-icon></span>
        <div><span class="review-stat-label">{{ t('mail.reviewStatTotal') }}</span><strong>{{ reviewTickets.length }}</strong></div>
      </article>
    </div>

    <section v-if="canReview" class="review-workspace rcm-card">
      <div class="review-toolbar">
        <el-radio-group v-model="statusFilter" class="review-status-filter" :aria-label="t('mail.reviewFilter')">
          <el-radio-button value="pending">{{ t('mail.reviewFilterPending') }}<span class="filter-count">{{ pendingCount }}</span></el-radio-button>
          <el-radio-button value="processed">{{ t('mail.reviewFilterProcessed') }}<span class="filter-count">{{ processedCount }}</span></el-radio-button>
          <el-radio-button value="all">{{ t('mail.reviewFilterAll') }}<span class="filter-count">{{ reviewTickets.length }}</span></el-radio-button>
        </el-radio-group>
        <el-input v-model="search" :placeholder="t('mail.reviewSearch')" :aria-label="t('mail.reviewSearch')" clearable class="review-search">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table v-loading="loading" :data="filteredTickets" row-key="id" class="review-table" :max-height="tableMaxHeight" @row-click="openDetails">
        <el-table-column prop="id" :label="t('mail.reviewTicketId')" min-width="145">
          <template #default="{ row }"><span class="font-mono text-xs">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewType')" min-width="150">
          <template #default="{ row }"><span class="font-medium">{{ reviewSourceLabel(row) }}</span></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewApplicant')" min-width="140">
          <template #default="{ row }"><span>{{ row.applicantName || '—' }}</span></template>
        </el-table-column>
        <el-table-column prop="cardNo" :label="t('mail.reviewCardNo')" min-width="145">
          <template #default="{ row }"><span class="font-mono text-xs">{{ row.cardNo || '—' }}</span></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewRegion')" min-width="160">
          <template #default="{ row }">{{ [row.province, row.center].filter(Boolean).join(' · ') || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewSubmittedAt')" min-width="170">
          <template #default="{ row }"><time :datetime="row.submittedAt">{{ formatDate(row.submittedAt) }}</time></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewStatus')" min-width="155">
          <template #default="{ row }"><el-tag size="small" :type="reviewStatusType(row)" effect="light">{{ reviewStatusLabel(row) }}</el-tag></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewActions')" fixed="right" width="150" align="end">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openDetails(row)">{{ t('mail.reviewViewDetails') }}</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty :description="emptyDescription" :image-size="72" /></template>
      </el-table>
      <footer class="review-scope-note"><el-icon><InfoFilled /></el-icon><span>{{ t('mail.reviewScopeHint') }}</span></footer>
    </section>

    <el-empty v-else class="review-no-access rcm-card" :description="t('mail.reviewNoAccess')" :image-size="96" />

    <el-drawer v-model="detailsVisible" :title="t('mail.reviewDetails')" :size="drawerSize" class="review-drawer" append-to-body>
      <template v-if="selectedTicket">
        <div class="drawer-ticket-heading">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <el-tag size="small" effect="plain">{{ reviewSourceLabel(selectedTicket) }}</el-tag>
            <el-tag size="small" :type="reviewStatusType(selectedTicket)">{{ reviewStatusLabel(selectedTicket) }}</el-tag>
          </div>
          <el-button v-if="reviewStageOf(selectedTicket)" type="primary" size="small" @click="openReviewAction(selectedTicket)">
            <el-icon><Stamp /></el-icon>{{ reviewActionLabel(selectedTicket) }}
          </el-button>
        </div>

        <el-descriptions :column="1" border class="review-descriptions">
          <el-descriptions-item :label="t('mail.reviewTicketId')"><bdi dir="ltr" class="font-mono">{{ selectedTicket.id }}</bdi></el-descriptions-item>
          <el-descriptions-item :label="t('mail.reviewApplicant')">{{ selectedTicket.applicantName || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('mail.reviewCardNo')"><bdi dir="ltr" class="font-mono">{{ selectedTicket.cardNo || '—' }}</bdi></el-descriptions-item>
          <el-descriptions-item :label="t('mail.reviewTargetMember')">{{ selectedTicket.targetMemberName || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('mail.reviewRegion')">{{ [selectedTicket.province, selectedTicket.center].filter(Boolean).join(' · ') || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('mail.reviewSubmittedAt')">{{ formatDate(selectedTicket.submittedAt, true) }}</el-descriptions-item>
        </el-descriptions>

        <section class="drawer-section">
          <h3>{{ t('mail.reviewReason') }}</h3>
          <p class="review-reason">{{ selectedTicket.reason || '—' }}</p>
        </section>

        <section v-if="selectedTicket.staffOpinion || selectedTicket.managerNotes" class="drawer-section">
          <h3>{{ t('mail.reviewHistory') }}</h3>
          <div v-if="selectedTicket.staffOpinion" class="review-history-entry">
            <b>{{ t('review.stage1Title') }}</b>
            <p>{{ selectedTicket.staffOpinion }}</p>
            <small>{{ [selectedTicket.staffName, selectedTicket.staffReviewedAt].filter(Boolean).join(' · ') }}</small>
          </div>
          <div v-if="selectedTicket.managerNotes" class="review-history-entry">
            <b>{{ t('review.stage2Title', { title: reviewSourceLabel(selectedTicket) }) }}</b>
            <p>{{ selectedTicket.managerNotes }}</p>
            <small>{{ [selectedTicket.managerName, selectedTicket.managerDecidedAt].filter(Boolean).join(' · ') }}</small>
          </div>
        </section>

        <section v-if="selectedTicket.attachments?.length" class="drawer-section">
          <h3>{{ t('mail.reviewAttachments') }} <span>({{ selectedTicket.attachments.length }})</span></h3>
          <ul class="review-attachments">
            <li v-for="(attachment, index) in selectedTicket.attachments" :key="attachment.id || attachment.name || index">
              <el-icon><Paperclip /></el-icon><span>{{ attachment.name }}</span>
              <el-tag v-if="attachment.verified" size="small" type="success" effect="plain">{{ t('review.sealValid') }}</el-tag>
            </li>
          </ul>
        </section>
      </template>
    </el-drawer>

    <el-dialog v-model="reviewActionVisible" :title="reviewActionTitle" width="min(520px, 94vw)" append-to-body>
      <el-form label-position="top">
        <el-form-item v-if="reviewStage === 'manager'" :label="t('mail.reviewDecision')">
          <el-radio-group v-model="reviewDecision">
            <el-radio value="accept">{{ t('mail.reviewAccept') }}</el-radio>
            <el-radio value="reject">{{ t('mail.reviewReject') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="reviewStage === 'manager' ? t('mail.reviewNotes') : t('mail.reviewOpinion')">
          <el-input v-model="reviewActionText" type="textarea" :rows="5" maxlength="1000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewActionVisible = false">{{ t('mail.reviewClose') }}</el-button>
        <el-button type="primary" :loading="reviewSubmitting" @click="submitReviewAction">{{ t('mail.reviewSubmit') }}</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { CircleCheck, Clock, InfoFilled, Paperclip, Refresh, Search, Stamp, Tickets } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/auth.js';
import { useReviewStore } from '../../stores/review.js';
import { isTicketInReviewScope, resolveReviewAccess } from '../../utils/reviewPermission.js';
import MessageCenterNav from './MessageCenterNav.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const reviewStore = useReviewStore();
const reviewAccess = computed(() => resolveReviewAccess(authStore.userProfile));
const canReview = computed(() => reviewAccess.value.canView && reviewAccess.value.canProcess);
const loading = ref(false);
const reviewTickets = ref([]);
const statusFilter = ref('pending');
const search = ref('');
const detailsVisible = ref(false);
const selectedTicket = ref(null);
const reviewActionVisible = ref(false);
const reviewSubmitting = ref(false);
const reviewStage = ref('staff');
const reviewActionText = ref('');
const reviewDecision = ref('accept');
const tableMaxHeight = 'min(560px, 58dvh)';
const drawerSize = 'min(600px, 96vw)';

const pendingCount = computed(() => reviewTickets.value.filter(isReviewPending).length);
const processedCount = computed(() => reviewTickets.value.length - pendingCount.value);
const filteredTickets = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase(locale.value);
  return reviewTickets.value
    .filter((ticket) => statusFilter.value === 'all' || (statusFilter.value === 'pending' ? isReviewPending(ticket) : !isReviewPending(ticket)))
    .filter((ticket) => !keyword || [ticket.source, ticket.applicantName, ticket.cardNo, ticket.reason, ticket.id, ticket.province, ticket.center].some((value) => String(value || '').toLocaleLowerCase(locale.value).includes(keyword)));
});
const emptyDescription = computed(() => {
  if (search.value.trim()) return t('mail.noResults');
  if (statusFilter.value === 'pending') return t('mail.reviewEmptyPending');
  if (statusFilter.value === 'processed') return t('mail.reviewEmptyProcessed');
  return t('mail.reviewEmptyAll');
});
const reviewActionTitle = computed(() => reviewStage.value === 'manager' ? t('mail.reviewManagerAction') : t('mail.reviewStaffAction'));

function isReviewPending(ticket) {
  const status = String(ticket?.status || '');
  return status.includes('初审') || status.includes('终审') || status.includes('Pending');
}

const REVIEW_SOURCE_KEYS = {
  '申请解冻': 'review.sourceUnfreeze', 'Unfreeze Card': 'review.sourceUnfreeze',
  '申请分户': 'review.sourceSplit', 'Split Household': 'review.sourceSplit',
  '变更户主': 'review.sourceChangeHead', 'Change Head': 'review.sourceChangeHead',
  '成员录入': 'review.sourceMemberEntry', 'Member Entry': 'review.sourceMemberEntry',
  '成员转移': 'review.sourceMemberTransfer', 'Transfer Member': 'review.sourceMemberTransfer',
  '申请代理转移': 'review.sourceTransferAgent', 'Transfer Agent': 'review.sourceTransferAgent'
};

function reviewSourceLabel(ticket) {
  const source = ticket?.source || '';
  const key = REVIEW_SOURCE_KEYS[source];
  return key ? t(key) : source || '—';
}

function reviewStatusLabel(ticket) {
  const status = String(ticket?.status || '');
  if (status.includes('初审') || status === 'Pending Staff Review') return t('review.statusPendingStaff');
  if (status.includes('终审') || status === 'Pending Manager Review') return t('review.statusPendingManager');
  if (status.includes('批准') || status === 'Approved') return t('review.statusApproved');
  if (status.includes('驳回') || status === 'Rejected') return t('review.statusRejected');
  return status || '—';
}

function reviewStatusType(ticket) {
  const status = String(ticket?.status || '');
  if (status.includes('批准') || status === 'Approved') return 'success';
  if (status.includes('驳回') || status === 'Rejected') return 'danger';
  return 'warning';
}

function reviewStageOf(ticket) {
  const status = String(ticket?.status || '');
  if (status.includes('初审') || status === 'Pending Staff Review') return 'staff';
  if (status.includes('终审') || status === 'Pending Manager Review') return 'manager';
  return '';
}

function reviewActionLabel(ticket) {
  return reviewStageOf(ticket) === 'manager' ? t('mail.reviewManagerAction') : t('mail.reviewStaffAction');
}

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const raw = String(value);
  const date = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat(locale.value, withTime
    ? { dateStyle: 'long', timeStyle: 'short' }
    : { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

async function loadTickets() {
  if (!canReview.value) return;
  loading.value = true;
  try {
    await reviewStore.fetchTickets('全部');
    reviewTickets.value = reviewStore.tickets.filter((ticket) => isTicketInReviewScope(ticket, reviewAccess.value));
    if (selectedTicket.value) selectedTicket.value = reviewTickets.value.find((ticket) => ticket.id === selectedTicket.value.id) || selectedTicket.value;
  } finally {
    loading.value = false;
  }
}

function openDetails(ticket) {
  selectedTicket.value = ticket;
  detailsVisible.value = true;
}

function openReviewAction(ticket) {
  selectedTicket.value = ticket;
  reviewStage.value = reviewStageOf(ticket) || 'staff';
  reviewActionText.value = '';
  reviewDecision.value = 'accept';
  reviewActionVisible.value = true;
}

async function submitReviewAction() {
  const ticket = selectedTicket.value;
  if (!ticket) return;
  if (!reviewActionText.value.trim()) {
    ElMessage.warning(t('mail.reviewTextRequired'));
    return;
  }
  reviewSubmitting.value = true;
  try {
    if (reviewStage.value === 'manager') {
      const isEn = locale.value === 'en';
      const decision = reviewDecision.value === 'accept' ? (isEn ? 'Approved' : '接受') : (isEn ? 'Rejected' : '拒绝');
      await reviewStore.reviewManager(ticket.id, decision, reviewActionText.value.trim());
    } else {
      await reviewStore.reviewStaff(ticket.id, reviewActionText.value.trim());
    }
    reviewActionVisible.value = false;
    await loadTickets();
    selectedTicket.value = reviewTickets.value.find((item) => item.id === ticket.id) || ticket;
  } finally {
    reviewSubmitting.value = false;
  }
}

onMounted(loadTickets);
</script>

<style scoped>
.review-page { color: var(--el-text-color-primary); }
.review-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.125rem 1.25rem; }
.review-heading { display: flex; min-width: 0; align-items: center; gap: .875rem; }
.review-heading-icon { width: 2.75rem; height: 2.75rem; font-size: 1.25rem; }
.review-heading h1 { margin: 0; color: var(--el-text-color-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.5; }
.review-heading p { margin: .25rem 0 0; color: var(--el-text-color-secondary); font-size: .8125rem; line-height: 1.5; }
.review-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .875rem; margin-top: .875rem; }
.review-stat { display: flex; align-items: center; gap: .75rem; padding: 1rem 1.125rem; }
.review-stat-icon { display: inline-flex; width: 2.5rem; height: 2.5rem; flex: 0 0 auto; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: .625rem; font-size: 1.125rem; }
.review-stat-icon--pending { border-color: var(--gold-border); background: var(--gold-soft); color: var(--gold-ink); }
.review-stat-icon--processed { border-color: var(--el-color-success-light-7); background: var(--el-color-success-light-9); color: var(--el-color-success); }
.review-stat-icon--total { border-color: var(--el-border-color); background: var(--muted); color: var(--primary); }
.review-stat-label { display: block; color: var(--el-text-color-secondary); font-size: .75rem; }
.review-stat strong { display: block; margin-top: .125rem; color: var(--el-text-color-primary); font-size: 1.25rem; line-height: 1.35; }
.review-workspace { margin-top: .875rem; overflow: hidden; }
.review-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; border-bottom: 1px solid var(--el-border-color-light); padding: .875rem 1rem; }
.review-search { width: min(100%, 20rem); }
.review-status-filter { max-width: 100%; overflow-x: auto; }
.filter-count { display: inline-flex; min-width: 1.125rem; height: 1.125rem; align-items: center; justify-content: center; margin-inline-start: .375rem; border-radius: 999px; background: var(--el-fill-color-light); padding-inline: .25rem; color: var(--el-text-color-secondary); font-size: .6875rem; line-height: 1; }
.review-table { width: 100%; }
.review-table :deep(.el-table__row) { cursor: pointer; }
.review-table :deep(.el-table__row:hover) { color: var(--el-color-primary); }
.review-scope-note { display: flex; align-items: flex-start; gap: .5rem; border-top: 1px solid var(--el-border-color-light); background: var(--el-fill-color-lighter); padding: .75rem 1rem; color: var(--el-text-color-secondary); font-size: .75rem; line-height: 1.6; }
.review-scope-note :deep(.el-icon) { flex: 0 0 auto; margin-top: .125rem; color: var(--el-color-primary); }
.review-no-access { min-height: 280px; margin-top: .875rem; }
.drawer-ticket-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; margin-bottom: 1rem; border-bottom: 1px solid var(--el-border-color-light); padding-bottom: 1rem; }
.review-descriptions { margin-bottom: 1.25rem; }
.drawer-section { margin-top: 1.25rem; }
.drawer-section h3 { margin: 0 0 .625rem; color: var(--el-text-color-primary); font-size: .875rem; font-weight: 600; }
.drawer-section h3 span { color: var(--el-text-color-secondary); font-weight: 400; }
.review-reason { margin: 0; border: 1px solid var(--el-border-color-light); border-radius: var(--el-border-radius-base); background: var(--el-fill-color-lighter); padding: .875rem; color: var(--el-text-color-regular); font-size: .875rem; line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
.review-history-entry { margin-top: .5rem; border: 1px solid var(--el-border-color-light); border-inline-start: 3px solid var(--el-color-primary-light-5); border-radius: var(--el-border-radius-base); background: var(--el-fill-color-lighter); padding: .75rem; }
.review-history-entry b { color: var(--el-text-color-primary); font-size: .8125rem; }
.review-history-entry p { margin: .375rem 0; color: var(--el-text-color-regular); font-size: .8125rem; line-height: 1.6; white-space: pre-wrap; }
.review-history-entry small { color: var(--el-text-color-secondary); font-size: .75rem; }
.review-attachments { display: grid; gap: .5rem; margin: 0; padding: 0; list-style: none; }
.review-attachments li { display: flex; min-width: 0; align-items: center; gap: .5rem; border: 1px solid var(--el-border-color-light); border-radius: var(--el-border-radius-base); padding: .625rem .75rem; color: var(--el-text-color-regular); font-size: .8125rem; }
.review-attachments li > span { min-width: 0; flex: 1; overflow-wrap: anywhere; }
.review-attachments .el-icon { flex: 0 0 auto; color: var(--el-color-primary); }
@media (max-width: 767px) {
  .review-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
  .review-stat { gap: .5rem; padding: .75rem .625rem; }
  .review-stat-icon { width: 2rem; height: 2rem; font-size: 1rem; }
  .review-stat-label { font-size: .6875rem; }
  .review-stat strong { font-size: 1.125rem; }
  .review-toolbar { align-items: stretch; }
  .review-status-filter { width: 100%; }
  .review-status-filter :deep(.el-radio-button) { flex: 1; }
  .review-status-filter :deep(.el-radio-button__inner) { width: 100%; padding-inline: .5rem; }
  .review-search { width: 100%; }
}
</style>
