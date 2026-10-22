<template>
  <section class="review-page p-2 sm:p-4">
    <MessageCenterNav :can-view="canViewMessages" :can-review="canReview" />

    <header class="review-header rcm-card">
      <div class="review-heading">
        <span class="rcm-icon-box rcm-icon-box--primary review-heading-icon"><el-icon><Stamp /></el-icon></span>
        <div class="min-w-0">
          <h1>{{ t('mail.reviewPageTitle') }}<span v-if="messageStore.unreadReviewCount" class="review-unread-badge" :aria-label="t('mail.unreadCount', { count: messageStore.unreadReviewCount })">{{ messageStore.unreadReviewCount > 99 ? '99+' : messageStore.unreadReviewCount }}</span></h1>
          <p>{{ t('mail.reviewPageSubtitle') }}</p>
        </div>
      </div>
      <el-button :aria-label="t('mail.refresh')" :title="t('mail.refresh')" :loading="loading" @click="loadMessages">
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
        <span class="review-stat-icon review-stat-icon--total"><el-icon><Message /></el-icon></span>
        <div><span class="review-stat-label">{{ t('mail.reviewStatTotal') }}</span><strong>{{ reviewMessages.length }}</strong></div>
      </article>
    </div>

    <section v-if="canReview" class="review-workspace rcm-card">
      <div class="review-toolbar">
        <el-radio-group v-model="statusFilter" class="review-status-filter" :aria-label="t('mail.reviewFilter')">
          <el-radio-button value="pending">{{ t('mail.reviewFilterPending') }}<span class="filter-count">{{ pendingCount }}</span></el-radio-button>
          <el-radio-button value="processed">{{ t('mail.reviewFilterProcessed') }}<span class="filter-count">{{ processedCount }}</span></el-radio-button>
          <el-radio-button value="all">{{ t('mail.reviewFilterAll') }}<span class="filter-count">{{ reviewMessages.length }}</span></el-radio-button>
        </el-radio-group>
        <el-input v-model="search" :placeholder="t('mail.reviewSearch')" :aria-label="t('mail.reviewSearch')" clearable class="review-search">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table v-loading="loading" :data="filteredMessages" row-key="id" class="review-table" :max-height="tableMaxHeight" @row-click="openDetails">
        <el-table-column prop="id" :label="t('mail.reviewMessageId')" min-width="145">
          <template #default="{ row }"><span class="font-mono text-xs">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewMessageSubject')" min-width="200">
          <template #default="{ row }"><span class="font-medium">{{ messageSubject(row) || t('mail.emptyBody') }}</span></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewMessageSender')" min-width="150">
          <template #default="{ row }">{{ row.sender || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewMessageRecipients')" min-width="150">
          <template #default="{ row }">{{ recipientSummary(row) }}</template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewMessageCategory')" min-width="145">
          <template #default="{ row }">{{ t(row.category === 'system' ? 'mail.system' : 'mail.admin') }}</template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewSubmittedAt')" min-width="170">
          <template #default="{ row }"><time :datetime="row.createdAt">{{ formatDate(row.createdAt) }}</time></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewStatus')" min-width="130">
          <template #default="{ row }"><el-tag size="small" :type="statusTagType(row.reviewStatus)">{{ statusLabel(row.reviewStatus) }}</el-tag></template>
        </el-table-column>
        <el-table-column :label="t('mail.reviewActions')" fixed="right" width="145" align="end">
          <template #default="{ row }"><el-button link type="primary" @click.stop="openDetails(row)">{{ t('mail.reviewViewDetails') }}</el-button></template>
        </el-table-column>
        <template #empty><el-empty :description="emptyDescription" :image-size="72" /></template>
      </el-table>
      <footer class="review-scope-note"><el-icon><InfoFilled /></el-icon><span>{{ t('mail.reviewScopeHint') }}</span></footer>
    </section>

    <el-empty v-else class="review-no-access rcm-card" :description="t('mail.reviewNoAccess')" :image-size="96" />

    <el-drawer v-model="detailsVisible" :title="t('mail.reviewDetails')" :size="drawerSize" append-to-body>
      <template v-if="selectedMessage">
        <div class="drawer-message-heading">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <el-tag size="small" effect="plain">{{ t(selectedMessage.category === 'system' ? 'mail.system' : 'mail.admin') }}</el-tag>
            <el-tag size="small" :type="statusTagType(selectedMessage.reviewStatus)">{{ statusLabel(selectedMessage.reviewStatus) }}</el-tag>
          </div>
          <span class="font-mono text-xs text-[var(--el-text-color-secondary)]">{{ selectedMessage.id }}</span>
        </div>

        <h2 class="review-message-title">{{ messageSubject(selectedMessage) || t('mail.emptyBody') }}</h2>
        <el-descriptions :column="1" border class="review-descriptions">
          <el-descriptions-item :label="t('mail.reviewMessageSender')">{{ selectedMessage.sender || '—' }}</el-descriptions-item>
          <el-descriptions-item :label="t('mail.reviewMessageRecipients')">{{ recipientSummary(selectedMessage) }}</el-descriptions-item>
          <el-descriptions-item :label="t('mail.reviewSubmittedAt')">{{ formatDate(selectedMessage.createdAt, true) }}</el-descriptions-item>
        </el-descriptions>

        <section class="drawer-section">
          <h3>{{ t('mail.reviewMessageContent') }}</h3>
          <article v-if="selectedMessage.bodyHtml" class="review-message-body mail-content" v-html="safeMessageBody(selectedMessage.bodyHtml)" />
          <p v-else class="review-message-body">{{ messageBody(selectedMessage) || '—' }}</p>
        </section>

        <section v-if="selectedMessage.attachments?.length" class="drawer-section">
          <h3>{{ t('mail.reviewAttachments') }} <span>({{ selectedMessage.attachments.length }})</span></h3>
          <ul class="review-attachments">
            <li v-for="(attachment, index) in selectedMessage.attachments" :key="attachment.id || attachment.name || index">
              <el-icon><Paperclip /></el-icon><span>{{ attachment.name }}</span>
              <el-button v-if="attachment.id" link type="primary" @click="downloadAttachment(attachment)">{{ t('mail.download') }}</el-button>
            </li>
          </ul>
        </section>

        <section v-if="selectedMessage.reviewNotes" class="drawer-section">
          <h3>{{ t('mail.reviewHistory') }}</h3>
          <div class="review-history-entry">
            <b>{{ statusLabel(selectedMessage.reviewStatus) }}</b>
            <p>{{ selectedMessage.reviewNotes }}</p>
            <small>{{ [selectedMessage.reviewedBy, selectedMessage.reviewedAt && formatDate(selectedMessage.reviewedAt, true)].filter(Boolean).join(' · ') }}</small>
          </div>
        </section>

        <div v-if="selectedMessage.reviewStatus === 'pending'" class="review-detail-actions">
          <el-button type="danger" plain @click="openDecision('rejected')">{{ t('mail.reviewActionReject') }}</el-button>
          <el-button type="primary" @click="openDecision('approved')">{{ t('mail.reviewActionApprove') }}</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="reviewActionVisible" :title="actionTitle" width="min(520px, 94vw)" append-to-body>
      <el-input v-model="reviewNotes" type="textarea" :rows="5" maxlength="1000" show-word-limit :placeholder="t('mail.reviewNotePlaceholder')" />
      <template #footer>
        <el-button @click="reviewActionVisible = false">{{ t('mail.reviewClose') }}</el-button>
        <el-button :type="reviewDecision === 'rejected' ? 'danger' : 'primary'" :loading="reviewSubmitting" @click="submitDecision">
          {{ reviewDecision === 'rejected' ? t('mail.reviewActionReject') : t('mail.reviewActionApprove') }}
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { CircleCheck, Clock, InfoFilled, Message, Paperclip, Refresh, Search, Stamp } from '@element-plus/icons-vue';
import { decideMessageReview, getMessageAttachment, getMessages } from '../../api/adminCenter.js';
import { useAuthStore } from '../../stores/auth.js';
import { useMessageCenterStore } from '../../stores/messageCenter.js';
import { isMessageInReviewScope, resolveMessageAccess } from '../../utils/messagePermissions.js';
import MessageCenterNav from './MessageCenterNav.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const messageStore = useMessageCenterStore();
const messageAccess = computed(() => resolveMessageAccess(authStore.userProfile));
const canReview = computed(() => messageAccess.value.canReview);
const canViewMessages = computed(() => authStore.hasPermission('messages.view'));
const loading = ref(false);
const reviewMessages = ref([]);
const statusFilter = ref('pending');
const search = ref('');
const detailsVisible = ref(false);
const selectedMessage = ref(null);
const reviewActionVisible = ref(false);
const reviewSubmitting = ref(false);
const reviewDecision = ref('approved');
const reviewNotes = ref('');
const tableMaxHeight = 'min(560px, 58dvh)';
const drawerSize = 'min(600px, 96vw)';

const pendingCount = computed(() => reviewMessages.value.filter((message) => message.reviewStatus === 'pending').length);
const processedCount = computed(() => reviewMessages.value.filter((message) => ['approved', 'rejected'].includes(message.reviewStatus)).length);
const filteredMessages = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase(locale.value);
  return reviewMessages.value
    .filter((message) => statusFilter.value === 'all'
      || (statusFilter.value === 'pending' && message.reviewStatus === 'pending')
      || (statusFilter.value === 'processed' && ['approved', 'rejected'].includes(message.reviewStatus)))
    .filter((message) => !keyword || [messageSubject(message), messageBody(message), message.sender, message.recipientLabelKey && t(message.recipientLabelKey), message.recipientLabel, recipientSummary(message), message.id]
      .some((value) => String(value || '').toLocaleLowerCase(locale.value).includes(keyword)));
});
const emptyDescription = computed(() => {
  if (search.value.trim()) return t('mail.noResults');
  if (statusFilter.value === 'pending') return t('mail.reviewEmptyPending');
  if (statusFilter.value === 'processed') return t('mail.reviewEmptyProcessed');
  return t('mail.reviewEmptyAll');
});
const actionTitle = computed(() => reviewDecision.value === 'rejected' ? t('mail.reviewActionReject') : t('mail.reviewActionApprove'));

const RECIPIENT_LABEL_KEYS = {
  citizens: 'mail.cardAppUsers',
  agents: 'mail.agents',
  web: 'mail.webUsers'
};

function recipientSummary(message) {
  const typeLabel = t(RECIPIENT_LABEL_KEYS[message?.recipientType] || 'mail.webUsers');
  const recipientLabel = message?.recipientLabelKey ? t(message.recipientLabelKey) : message?.recipientLabel;
  return recipientLabel && ['citizens', 'agents'].includes(message?.recipientType)
    ? `${typeLabel} · ${recipientLabel}`
    : typeLabel;
}

function messageSubject(message) { return message?.subjectKey ? t(message.subjectKey) : message?.subject || ''; }
function messageBody(message) { return message?.bodyText || (message?.bodyKey ? t(message.bodyKey) : ''); }

function statusLabel(status) {
  if (status === 'approved') return t('mail.reviewStatusApproved');
  if (status === 'rejected') return t('mail.reviewStatusRejected');
  return t('mail.reviewStatusPending');
}

function statusTagType(status) { return status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'; }

async function downloadAttachment(attachment) {
  const result = await getMessageAttachment(attachment.id);
  if (!result?.dataUrl) return;
  const link = document.createElement('a');
  link.href = result.dataUrl;
  link.download = result.name || attachment.name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale.value, withTime
    ? { dateStyle: 'long', timeStyle: 'short' }
    : { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function safeMessageBody(html) {
  const parsed = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'H2', 'H3', 'A']);
  const walk = (node) => [...node.children].forEach((child) => {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH'].includes(child.tagName)) { child.remove(); return; }
    walk(child);
    if (!allowed.has(child.tagName)) { child.replaceWith(...child.childNodes); return; }
    [...child.attributes].forEach((attribute) => {
      if (child.tagName !== 'A' || !['href', 'title'].includes(attribute.name.toLowerCase())) child.removeAttribute(attribute.name);
      else if (attribute.name.toLowerCase() === 'href' && !/^(https?:|mailto:)/i.test(attribute.value)) child.removeAttribute('href');
    });
    if (child.tagName === 'A') { child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener noreferrer'); }
  });
  walk(parsed.body);
  return parsed.body.innerHTML;
}

async function loadMessages() {
  if (!canReview.value) return;
  loading.value = true;
  try {
    const messages = await getMessages('review');
    reviewMessages.value = messageStore.setReviewQueue((messages || []).filter((message) => isMessageInReviewScope(message, messageAccess.value)));
    if (selectedMessage.value) selectedMessage.value = reviewMessages.value.find((message) => message.id === selectedMessage.value.id) || selectedMessage.value;
  } finally {
    loading.value = false;
  }
}

async function openDetails(message) {
  selectedMessage.value = message;
  detailsVisible.value = true;
  if (message.reviewStatus === 'pending' && !message.read) {
    try { await messageStore.markRead(message.id); } catch { /* Keep the item unread when it cannot be marked on the server. */ }
  }
}

function openDecision(decision) {
  reviewDecision.value = decision;
  reviewNotes.value = '';
  reviewActionVisible.value = true;
}

async function submitDecision() {
  if (!selectedMessage.value) return;
  if (reviewDecision.value === 'rejected' && !reviewNotes.value.trim()) {
    ElMessage.warning(t('mail.reviewRejectRequired'));
    return;
  }
  reviewSubmitting.value = true;
  try {
    await decideMessageReview(selectedMessage.value.id, reviewDecision.value, reviewNotes.value.trim());
    reviewActionVisible.value = false;
    await loadMessages();
    selectedMessage.value = reviewMessages.value.find((message) => message.id === selectedMessage.value?.id) || selectedMessage.value;
    ElMessage.success(t(reviewDecision.value === 'approved' ? 'mail.reviewStatusApproved' : 'mail.reviewStatusRejected'));
  } finally {
    reviewSubmitting.value = false;
  }
}

onMounted(loadMessages);
</script>

<style scoped>
.review-page { color: var(--el-text-color-primary); }
.review-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.125rem 1.25rem; }
.review-heading { display: flex; min-width: 0; align-items: center; gap: .875rem; }
.review-heading-icon { width: 2.75rem; height: 2.75rem; font-size: 1.25rem; }
.review-heading h1 { margin: 0; color: var(--el-text-color-primary); font-size: 1.125rem; font-weight: 700; line-height: 1.5; }
.review-unread-badge { display: inline-flex; min-width: 1.25rem; height: 1.25rem; align-items: center; justify-content: center; margin-inline-start: .5rem; border-radius: 9999px; background: #c04442; padding-inline: .35rem; color: #fff; font-size: .6875rem; font-weight: 700; line-height: 1; vertical-align: middle; }
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
.drawer-message-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; margin-bottom: 1rem; border-bottom: 1px solid var(--el-border-color-light); padding-bottom: 1rem; }
.review-message-title { margin: 0 0 1.25rem; color: var(--el-text-color-primary); font-size: 1.25rem; font-weight: 700; line-height: 1.5; overflow-wrap: anywhere; }
.review-descriptions { margin-bottom: 1.25rem; }
.drawer-section { margin-top: 1.25rem; }
.drawer-section h3 { margin: 0 0 .625rem; color: var(--el-text-color-primary); font-size: .875rem; font-weight: 600; }
.drawer-section h3 span { color: var(--el-text-color-secondary); font-weight: 400; }
.review-message-body { margin: 0; border: 1px solid var(--el-border-color-light); border-radius: var(--el-border-radius-base); background: var(--el-fill-color-lighter); padding: .875rem; color: var(--el-text-color-regular); font-size: .875rem; line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
.mail-content :deep(p) { margin: 0 0 .75rem; }
.mail-content :deep(p:last-child) { margin-bottom: 0; }
.mail-content :deep(ul) { list-style: disc; padding-inline-start: 1.5rem; }
.mail-content :deep(ol) { list-style: decimal; padding-inline-start: 1.5rem; }
.mail-content :deep(blockquote) { border-inline-start: 3px solid var(--el-color-primary-light-5); margin: .75rem 0; padding-inline-start: 1rem; }
.mail-content :deep(a) { color: var(--el-color-primary); text-decoration: underline; }
.review-history-entry { margin-top: .5rem; border: 1px solid var(--el-border-color-light); border-inline-start: 3px solid var(--el-color-primary-light-5); border-radius: var(--el-border-radius-base); background: var(--el-fill-color-lighter); padding: .75rem; }
.review-history-entry b { color: var(--el-text-color-primary); font-size: .8125rem; }
.review-history-entry p { margin: .375rem 0; color: var(--el-text-color-regular); font-size: .8125rem; line-height: 1.6; white-space: pre-wrap; }
.review-history-entry small { color: var(--el-text-color-secondary); font-size: .75rem; }
.review-attachments { display: grid; gap: .5rem; margin: 0; padding: 0; list-style: none; }
.review-attachments li { display: flex; min-width: 0; align-items: center; gap: .5rem; border: 1px solid var(--el-border-color-light); border-radius: var(--el-border-radius-base); padding: .625rem .75rem; color: var(--el-text-color-regular); font-size: .8125rem; }
.review-attachments li > span { min-width: 0; flex: 1; overflow-wrap: anywhere; }
.review-attachments .el-icon { flex: 0 0 auto; color: var(--el-color-primary); }
.review-detail-actions { display: flex; justify-content: flex-end; gap: .5rem; margin-top: 1.5rem; border-top: 1px solid var(--el-border-color-light); padding-top: 1rem; }
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
