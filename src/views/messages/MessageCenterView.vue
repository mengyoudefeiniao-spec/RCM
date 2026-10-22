<template>
  <section class="mail-shell p-2 sm:p-4">
    <div class="mail-toolbar flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-[#DCE5DF] bg-white px-4 py-3">
      <div class="flex items-center gap-3"><h1 class="text-lg font-bold text-[#24372C]">{{ t('mail.title') }}</h1><el-tag v-if="messageStore.unreadCount" size="small" round>{{ t('mail.unreadCount', { count: messageStore.unreadCount }) }}</el-tag></div>
      <div class="flex w-full items-center gap-2 sm:w-auto"><el-input v-model="search" :placeholder="t('mail.search')" :aria-label="t('mail.search')" clearable class="!w-full sm:!w-64" @keyup.enter="load"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-button circle :title="t('mail.refresh')" :aria-label="t('mail.refresh')" @click="load"><el-icon><Refresh /></el-icon></el-button><el-button v-if="canSend" type="primary" @click="openCompose"><el-icon><EditPen /></el-icon>{{ t('mail.compose') }}</el-button></div>
    </div>

    <div class="mail-grid overflow-hidden rounded-b-xl border-x border-b border-[#DCE5DF] bg-white">
      <aside class="mail-folders" :aria-label="t('mail.title')">
        <button v-for="folder in folders" :key="folder.id" type="button" class="folder-button" :class="{ 'is-active': activeFolder === folder.id }" :aria-current="activeFolder === folder.id ? 'page' : undefined" @click="switchFolder(folder.id)">
          <el-icon><component :is="folder.icon" /></el-icon><span class="flex-1">{{ t('mail.' + folder.id) }}</span><span v-if="folder.id === 'inbox' && receivedUnreadCount" class="folder-count">{{ receivedUnreadCount }}</span><span v-if="folder.id === 'review' && pendingReviewCount" class="folder-count">{{ pendingReviewCount }}</span><span v-if="folder.id === 'favorites' && favoriteCount" class="folder-count">{{ favoriteCount }}</span>
        </button>
      </aside>

      <div class="mail-list">
        <div class="mail-list-heading">
          <h2>{{ t('mail.' + activeFolder) }}</h2>
          <el-select v-if="activeFolder === 'review'" v-model="reviewStatusFilter" size="small" style="width: 116px">
            <el-option value="pending" :label="t('mail.reviewFilterPending')" />
            <el-option value="processed" :label="t('mail.reviewFilterProcessed')" />
            <el-option value="all" :label="t('mail.reviewFilterAll')" />
          </el-select>
          <span v-else>{{ t('mail.totalCount', { count: filteredItems.length }) }}</span>
        </div>
        <div v-if="loading" class="p-4"><el-skeleton :rows="5" animated /></div>
        <div v-else-if="filteredItems.length" class="mail-list-items">
          <div v-for="item in filteredItems" :key="item.id" class="notification-item" :class="{ 'is-selected': selected?.id === item.id }">
            <button type="button" class="notification-content" :aria-pressed="selected?.id === item.id" @click="selectMessage(item)">
              <div class="flex min-w-0 items-center justify-between gap-2"><span class="min-w-0 truncate text-xs text-[#75837A]">{{ isIncoming(item) ? item.sender : t('mail.to') + ': ' + recipientSummary(item) }}</span><time class="shrink-0 text-[11px] text-[#8A9890]">{{ shortDate(item.createdAt) }}</time></div>
              <div class="mt-1.5 flex items-center gap-2"><span v-if="!item.read && isIncoming(item)" class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3D8A58]" :title="t('mail.unread')"/><span class="min-w-0 flex-1 truncate text-sm" :class="!item.read && isIncoming(item) ? 'font-semibold text-[#24372C]' : 'font-medium text-[#53635A]'">{{ titleOf(item) || t('mail.emptyBody') }}</span><el-icon v-if="item.attachments?.length" class="shrink-0 text-[#819087]" :title="t('mail.attachments')"><Paperclip /></el-icon></div>
              <p class="mt-1 line-clamp-2 text-xs leading-5 text-[#839087]">{{ previewText(item) }}</p>
            </button>
            <button v-if="item.kind !== 'review'" type="button" class="favorite-toggle" :class="{ 'is-favorite': item.favorite }" :disabled="favoritePending.includes(item.id)" :aria-pressed="!!item.favorite" :title="t(item.favorite ? 'mail.removeFavorite' : 'mail.addFavorite')" :aria-label="t(item.favorite ? 'mail.removeFavorite' : 'mail.addFavorite')" @click.stop="toggleFavorite(item)"><el-icon><component :is="item.favorite ? 'FolderChecked' : 'FolderAdd'" /></el-icon></button>
          </div>
        </div>
        <el-empty v-else :description="search ? t('mail.noResults') : activeFolder === 'review' ? (reviewStatusFilter.value === 'pending' ? t('mail.reviewEmptyPending') : t('mail.reviewEmptyAll')) : activeFolder === 'favorites' ? t('mail.noFavorites') : t('mail.noMail')" :image-size="76" />
      </div>

      <main v-if="activeFolder !== 'review'" class="mail-reader min-w-0 p-4 sm:p-6">
        <template v-if="selected">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EDEA] pb-4">
            <div class="flex flex-wrap items-center gap-2"><el-tag size="small" effect="plain">{{ categoryLabel(selected) }}</el-tag><el-tag v-if="!selected.read && isIncoming(selected)" size="small" type="success">{{ t('mail.unread') }}</el-tag></div>
            <div class="flex flex-wrap items-center gap-2"><el-button size="small" :loading="favoritePending.includes(selected.id)" :type="selected.favorite ? 'primary' : 'default'" :plain="selected.favorite" :aria-pressed="!!selected.favorite" @click="toggleFavorite(selected)"><el-icon><component :is="selected.favorite ? 'FolderChecked' : 'FolderAdd'" /></el-icon>{{ t(selected.favorite ? 'mail.removeFavorite' : 'mail.addFavorite') }}</el-button><el-button v-if="canSend && isIncoming(selected)" size="small" @click="replyTo(selected)"><el-icon><Promotion /></el-icon>{{ t('mail.reply') }}</el-button></div>
          </div>
          <h2 class="mb-5 break-words text-xl font-bold leading-8 text-[#26382D]">{{ titleOf(selected) }}</h2>
          <div class="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#75837A]"><span><b class="me-1 font-medium text-[#526258]">{{ t('mail.from') }}:</b>{{ selected.sender }}</span><span><b class="me-1 font-medium text-[#526258]">{{ t('mail.to') }}:</b>{{ recipientSummary(selected) }}</span><span>{{ fullDate(selected.createdAt) }}</span></div>
          <article class="mail-content min-h-24 break-words text-sm leading-7 text-[#34473A]" v-html="safeBody(selected)" />
          <div v-if="selected.attachments?.length" class="mt-8 border-t border-[#E8EDEA] pt-4"><h3 class="mb-3 text-sm font-semibold text-[#43564A]">{{ t('mail.attachments') }} ({{ selected.attachments.length }})</h3><div class="flex flex-wrap gap-2"><button v-for="attachment in selected.attachments" :key="attachment.id" type="button" class="flex max-w-full items-center gap-2 rounded-lg border border-[#DCE5DF] px-3 py-2 text-start text-sm hover:bg-[#F5F8F5]" @click="downloadAttachment(attachment)"><el-icon class="shrink-0 text-[#548163]"><Paperclip /></el-icon><span class="max-w-64 truncate">{{ attachment.name }}</span><span class="shrink-0 text-xs text-[#86938B]">{{ formatSize(attachment.size) }}</span><el-icon class="shrink-0"><Download /></el-icon></button></div></div>
        </template>
        <div v-else class="flex min-h-[300px] items-center justify-center text-sm text-[#8A9890]">{{ t('mail.selectMail') }}</div>
      </main>

      <!-- 待审核消息：审核工单详情与两级审批操作 -->
      <main v-if="activeFolder === 'review'" class="mail-reader min-w-0 p-4 sm:p-6">
        <template v-if="selected">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EDEA] pb-4">
            <div class="flex flex-wrap items-center gap-2">
              <el-tag size="small" effect="plain">{{ reviewSourceLabel(selected) }}</el-tag>
              <el-tag size="small" :type="reviewStatusType(selected)">{{ reviewStatusLabel(selected) }}</el-tag>
            </div>
            <el-button v-if="reviewStageOf(selected)" size="small" type="primary" @click="openReviewAction(selected)">
              <el-icon><Stamp /></el-icon>{{ reviewStageOf(selected) === 'manager' ? t('mail.reviewManagerAction') : t('mail.reviewStaffAction') }}
            </el-button>
          </div>
          <h2 class="mb-5 break-words text-xl font-bold leading-8 text-[#26382D]">{{ titleOf(selected) }}</h2>
          <div class="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#75837A]">
            <span><b class="me-1 font-medium text-[#526258]">{{ t('mail.reviewTicketId') }}:</b><span class="font-mono">{{ selected.ticket.id }}</span></span>
            <span><b class="me-1 font-medium text-[#526258]">{{ t('mail.reviewApplicant') }}:</b>{{ selected.ticket.applicantName || '—' }}</span>
            <span><b class="me-1 font-medium text-[#526258]">{{ t('mail.reviewCardNo') }}:</b><span class="font-mono">{{ selected.ticket.cardNo || '—' }}</span></span>
            <span><b class="me-1 font-medium text-[#526258]">{{ t('mail.reviewSubmittedAt') }}:</b>{{ fullDate(selected.createdAt) }}</span>
          </div>
          <div class="mb-6 space-y-2 text-sm leading-7 text-[#34473A]">
            <div><b class="me-1 font-medium text-[#526258]">{{ t('mail.reviewTargetMember') }}:</b>{{ selected.ticket.targetMemberName || '—' }}</div>
            <div><b class="me-1 font-medium text-[#526258]">{{ t('mail.reviewRegion') }}:</b>{{ [selected.ticket.province, selected.ticket.center].filter(Boolean).join(' · ') || '—' }}</div>
            <div><b class="me-1 font-medium text-[#526258]">{{ t('mail.reviewReason') }}:</b>{{ selected.ticket.reason || '—' }}</div>
          </div>
          <div v-if="selected.ticket.staffOpinion || selected.ticket.managerNotes" class="mb-6 space-y-2 rounded-lg border border-[#E8EDEA] bg-[#F7FAF8] p-3 text-xs leading-6">
            <div v-if="selected.ticket.staffOpinion"><b class="text-[#43564A]">{{ t('review.stage1Title') }}:</b> {{ selected.ticket.staffOpinion }}<span class="ms-1 text-[#8A9890]">({{ selected.ticket.staffName }} · {{ selected.ticket.staffReviewedAt }})</span></div>
            <div v-if="selected.ticket.managerNotes"><b class="text-[#43564A]">{{ t('review.stage2Title', { title: reviewSourceLabel(selected) }) }}:</b> {{ selected.ticket.managerNotes }}<span class="ms-1 text-[#8A9890]">({{ selected.ticket.managerName }} · {{ selected.ticket.managerDecidedAt }})</span></div>
          </div>
          <div v-if="selected.ticket.attachments?.length" class="border-t border-[#E8EDEA] pt-4">
            <h3 class="mb-3 text-sm font-semibold text-[#43564A]">{{ t('mail.reviewAttachments') }} ({{ selected.ticket.attachments.length }})</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="(att, ai) in selected.ticket.attachments" :key="ai" class="flex max-w-full items-center gap-2 rounded-lg border border-[#DCE5DF] px-3 py-2 text-start text-sm">
                <el-icon class="shrink-0 text-[#548163]"><Paperclip /></el-icon>
                <span class="max-w-64 truncate">{{ att.name }}</span>
                <el-tag v-if="att.verified" size="small" type="success" effect="plain">{{ t('review.sealValid') }}</el-tag>
              </span>
            </div>
          </div>
          <div class="mt-8 rounded-lg border border-[#E8EDEA] bg-[#F7FAF8] p-3 text-xs leading-6 text-[#75837A]">{{ t('mail.reviewScopeHint') }}</div>
        </template>
        <div v-else class="flex min-h-[300px] items-center justify-center text-sm text-[#8A9890]">{{ t('mail.selectMail') }}</div>
      </main>
    </div>

    <el-dialog v-model="composeVisible" :title="t('mail.newMessage')" width="min(1180px, 97vw)" top="5vh" class="compose-dialog" modal-class="notification-compose-overlay" @opened="focusEditor">
      <div class="compose-form compose-canvas">
        <div class="compose-actions">
          <div class="flex flex-wrap items-center gap-2">
            <el-button type="primary" :loading="sending" @click="sendDraft"><el-icon><Promotion/></el-icon>{{ t('mail.send') }}</el-button>
            <el-button @click="previewVisible = true"><el-icon><View/></el-icon>{{ t('mail.preview') }}</el-button>
            <el-button @click="saveDraft"><el-icon><FolderChecked/></el-icon>{{ t('mail.saveDraft') }}</el-button>
            <el-button @click="composeVisible = false">{{ t('mail.discard') }}</el-button>
          </div>
          <el-select v-model="draft.category" class="!w-48" :aria-label="t('mail.category')"><el-option value="admin" :label="t('mail.admin')"/><el-option value="system" :label="t('mail.system')"/></el-select>
        </div>
        <div class="compose-row recipient-line"><label class="compose-label">{{ t('mail.to') }}</label><el-select v-model="draft.recipientType" class="compose-control" @change="resetTarget"><el-option value="citizens" :label="t('mail.citizenUsers')"/><el-option value="agents" :label="t('mail.agents')"/><el-option value="web" :label="t('mail.webUsers')"/><el-option value="everyone" :label="t('mail.everyone')"/></el-select></div>
        <div v-if="['citizens','agents'].includes(draft.recipientType)" class="recipient-fields">
          <el-form label-position="top" class="recipient-grid">
            <el-form-item :label="t('mail.region')" class="!mb-0"><el-select v-model="draft.regionId" class="w-full" :placeholder="t('mail.chooseRegion')" @change="changeRegion"><el-option v-for="region in regionOptions" :key="region.id" :value="region.id" :label="region.province || region.name"/></el-select></el-form-item>
            <el-form-item :label="t('mail.agent')" class="!mb-0"><el-select v-model="draft.agentId" class="w-full" :placeholder="t('mail.chooseAgent')" @change="changeAgent"><el-option v-for="agent in agentOptions" :key="agent.id" :value="agent.id" :label="agent.name"/></el-select></el-form-item>
            <el-form-item :label="t('mail.rationSite')" class="!mb-0"><el-select v-model="draft.siteId" class="w-full" :placeholder="t('mail.chooseSite')" @change="loadFamilies"><el-option v-for="site in siteOptions" :key="site.id" :value="site.id" :label="site.storeName || site.centerName || site.name"/></el-select></el-form-item>
            <el-form-item v-if="draft.recipientType === 'citizens'" :label="t('mail.selectRecipients')" class="!mb-0 recipient-users"><el-select v-model="draft.recipientIds" class="w-full" multiple filterable collapse-tags collapse-tags-tooltip :placeholder="t('mail.chooseUsers')"><el-option v-for="family in familyOptions" :key="family.rationCardNo" :value="family.rationCardNo" :label="family.headName + ' · ' + family.rationCardNo"/></el-select><el-checkbox v-model="draft.allAtSite" class="mt-2" @change="toggleAllFamilies">{{ t('mail.allAtSite') }}</el-checkbox></el-form-item>
            <el-form-item v-else :label="t('mail.selectRecipients')" class="!mb-0 recipient-users"><div class="flex min-h-8 items-center gap-2"><el-tag v-if="draft.siteId">{{ selectedSiteLabel }}</el-tag><el-tag v-else-if="draft.agentId">{{ selectedAgentLabel }}</el-tag><span v-else class="text-sm text-[#89958E]">{{ t('mail.chooseAgent') }}</span></div></el-form-item>
          </el-form>
        </div>
        <div class="compose-row subject-line"><label class="compose-label">{{ t('mail.subject') }}</label><el-input v-model="draft.subject" maxlength="160" :placeholder="t('mail.subjectPlaceholder')" show-word-limit class="compose-control"/></div>
        <div class="attachment-row"><el-button text @click="fileInput?.click()"><el-icon><Paperclip/></el-icon>{{ t('mail.attach') }}</el-button><span class="compose-hint">{{ t('mail.attachmentLimit') }}</span><input ref="fileInput" class="hidden" type="file" multiple @change="addFiles"/><div class="attachment-files"><el-tag v-for="(file,index) in draft.attachments" :key="file.name + file.size" closable @close="draft.attachments.splice(index,1)"><span class="attachment-filename">{{ file.name }}</span> · {{ formatSize(file.size) }}</el-tag></div></div>
        <div class="rich-toolbar flex flex-wrap items-center gap-1 border-x border-t border-[#DFE7E1] bg-[#F7F9F7] p-2">
          <el-tooltip v-for="tool in editorTools" :key="tool.command" :content="t('mail.' + tool.label)"><el-button size="small" text class="editor-tool" :aria-label="t('mail.' + tool.label)" @click="formatText(tool.command)"><span v-if="tool.glyph" class="editor-glyph" :class="tool.glyphClass">{{ tool.glyph }}</span><el-icon v-else><component :is="tool.icon"/></el-icon></el-button></el-tooltip>
        </div>
        <div ref="editor" class="rich-editor border border-[#DFE7E1] px-5 py-3 text-sm leading-7 outline-none" contenteditable="true" role="textbox" aria-multiline="true" :data-placeholder="t('mail.richTextHint')" @input="updateDraftBody" @paste="pastePlainText" />
      </div>
    </el-dialog>
    <el-dialog v-model="previewVisible" :title="t('mail.preview')" width="min(900px, 94vw)" append-to-body>
      <div class="mb-3 border-b border-[#E8EDEA] pb-3 text-sm"><div class="mb-2"><b>{{ t('mail.subject') }}:</b> {{ draft.subject || t('mail.subjectPlaceholder') }}</div><div><b>{{ t('mail.to') }}:</b> {{ recipientPayload().recipientLabel || t('mail.' + draft.recipientType) }}</div></div>
      <article class="mail-content min-h-48 break-words text-sm leading-7 text-[#34473A]" v-html="previewHtml" />
      <template #footer><el-button @click="previewVisible = false">{{ t('mail.closePreview') }}</el-button><el-button type="primary" @click="previewVisible = false">{{ t('mail.continueEditing') }}</el-button></template>
    </el-dialog>

    <!-- 待审核消息：初审意见 / 终审裁决 -->
    <el-dialog v-model="reviewActionVisible" :title="reviewStage === 'manager' ? t('mail.reviewManagerAction') : t('mail.reviewStaffAction')" width="min(640px, 95vw)" append-to-body>
      <el-form label-position="top">
        <el-form-item v-if="reviewStage === 'manager'" :label="t('mail.reviewDecision')">
          <el-radio-group v-model="reviewDecision">
            <el-radio value="accept">{{ t('mail.reviewAccept') }}</el-radio>
            <el-radio value="reject">{{ t('mail.reviewReject') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="reviewStage === 'manager' ? t('mail.reviewNotes') : t('mail.reviewOpinion')">
          <el-input v-model="reviewActionText" type="textarea" :rows="4" maxlength="500" show-word-limit :placeholder="reviewStage === 'manager' ? t('review.managerPlaceholder') : t('review.staffPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="reviewActionVisible = false">{{ t('system.cancel') }}</el-button><el-button type="primary" :loading="reviewSubmitting" @click="submitReviewAction">{{ t('mail.reviewSubmit') }}</el-button></template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { getAgentFamilies } from '../../api/agent.js';
import { getMessageAttachment, getMessageRecipientTree, getMessages, sendMessage, setMessageFavorite } from '../../api/adminCenter.js';
import { useAuthStore } from '../../stores/auth.js';
import { useMessageCenterStore } from '../../stores/messageCenter.js';
import { useReviewStore } from '../../stores/review.js';
import { resolveReviewAccess, isTicketInReviewScope } from '../../utils/reviewPermission.js';

const { t, locale } = useI18n(), route = useRoute(), authStore = useAuthStore(), messageStore = useMessageCenterStore(), reviewStore = useReviewStore();
const activeFolder = ref('inbox'), items = ref([]), selected = ref(null), search = ref(''), loading = ref(false), composeVisible = ref(false), previewVisible = ref(false), sending = ref(false);
const recipientTree = ref([]), recipientsLoading = ref(false), families = ref([]), editor = ref(null), fileInput = ref(null);
const favoriteCount = ref(0), favoritePending = ref([]);
const receivedUnreadCount = computed(() => messageStore.inbox.filter((item) => !item.read && !item.favorite).length);
// 待审核消息（审核流程）：按当前账号的审核权限（业务类型 + 关联角色/区域）过滤工单
const reviewAccess = computed(() => resolveReviewAccess(authStore.userProfile));
const canReview = computed(() => reviewAccess.value.canView && reviewAccess.value.canProcess);
const reviewTickets = ref([]);
const reviewStatusFilter = ref('pending');
const reviewActionVisible = ref(false), reviewSubmitting = ref(false), reviewStage = ref('staff'), reviewActionText = ref(''), reviewDecision = ref('accept');
const pendingReviewCount = computed(() => reviewTickets.value.filter(isReviewPending).length);
let loadVersion = 0;
const draft = ref({ category: 'admin', recipientType: 'citizens', regionId: '', agentId: '', siteId: '', recipientIds: [], allAtSite: false, subject: '', bodyHtml: '', attachments: [] });
const canSend = computed(() => authStore.hasPermission('messages.send'));
const folders = computed(() => [{ id: 'inbox', icon: 'MessageBox' }, ...(canReview.value ? [{ id: 'review', icon: 'Stamp' }] : []), ...(canSend.value ? [{ id: 'sent', icon: 'Promotion' }] : []), { id: 'favorites', icon: 'FolderChecked' }]);
const regionOptions = computed(() => recipientTree.value);
const agentOptions = computed(() => regionOptions.value.find((item) => item.id === draft.value.regionId)?.children || []);
const siteOptions = computed(() => agentOptions.value.find((item) => item.id === draft.value.agentId)?.children || []);
const familyOptions = computed(() => families.value);
const selectedAgentLabel = computed(() => agentOptions.value.find((item) => item.id === draft.value.agentId)?.name || '');
const selectedSiteLabel = computed(() => siteOptions.value.find((item) => item.id === draft.value.siteId)?.storeName || siteOptions.value.find((item) => item.id === draft.value.siteId)?.name || '');
const filteredItems = computed(() => {
  if (activeFolder.value === 'review') {
    const keyword = search.value.trim().toLocaleLowerCase(locale.value);
    return reviewTickets.value
      .filter((ticket) => (reviewStatusFilter.value === 'all' || (reviewStatusFilter.value === 'pending' ? isReviewPending(ticket) : !isReviewPending(ticket))))
      .filter((ticket) => !keyword || [ticket.source, ticket.applicantName, ticket.cardNo, ticket.reason, ticket.id].some((value) => String(value || '').toLocaleLowerCase(locale.value).includes(keyword)))
      .map(toReviewItem);
  }
  return items.value.filter((item) => (activeFolder.value === 'favorites' ? item.favorite : !item.favorite) && (!search.value.trim() || [titleOf(item), item.sender, previewText(item), recipientSummary(item)].some((value) => String(value || '').toLocaleLowerCase(locale.value).includes(search.value.trim().toLocaleLowerCase(locale.value)))));
});
const previewHtml = computed(() => sanitizeHtml(draft.value.bodyHtml));
const editorTools = [{ command: 'undo', icon: 'Back', label: 'undo' }, { command: 'redo', icon: 'Right', label: 'redo' }, { command: 'bold', glyph: 'B', glyphClass: 'font-bold', label: 'bold' }, { command: 'italic', glyph: 'I', glyphClass: 'italic', label: 'italic' }, { command: 'underline', glyph: 'U', glyphClass: 'underline', label: 'underline' }, { command: 'strikeThrough', glyph: 'S', glyphClass: 'line-through', label: 'strikeThrough' }, { command: 'insertUnorderedList', icon: 'List', label: 'bulletList' }, { command: 'insertOrderedList', icon: 'Sort', label: 'numberedList' }, { command: 'formatBlock:h2', icon: 'Document', label: 'heading' }, { command: 'justifyLeft', glyph: '≡', glyphClass: 'align-left', label: 'alignLeft' }, { command: 'justifyCenter', glyph: '≡', glyphClass: 'align-center', label: 'alignCenter' }, { command: 'justifyRight', glyph: '≡', glyphClass: 'align-right', label: 'alignRight' }, { command: 'createLink', icon: 'Link', label: 'link' }, { command: 'removeFormat', icon: 'CircleClose', label: 'clearFormat' }];

function titleOf(item) { return item.subjectKey ? t(item.subjectKey) : item.subject || ''; }
function previewText(item) { return item.bodyText || item.body || item.subjectKey && t(item.bodyKey) || ''; }
function safeBody(item) {
  const html = item.bodyHtml || (item.bodyKey ? `<p>${t(item.bodyKey)}</p>` : item.body ? `<p>${item.body}</p>` : '');
  return sanitizeHtml(html);
}
function categoryLabel(item) { return t(item.category === 'system' ? 'mail.system' : 'mail.admin'); }
function recipientSummary(item) { return item.recipientLabel || (item.recipientType ? t('mail.' + item.recipientType) : t('mail.everyone')); }
function shortDate(value) { return value ? new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }).format(new Date(value)) : ''; }
function fullDate(value) { return value ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)) : ''; }
function formatSize(size = 0) { return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`; }
function sanitizeHtml(html) {
  const parsed = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const allowed = new Set(['P','BR','B','STRONG','I','EM','U','UL','OL','LI','BLOCKQUOTE','H2','H3','A']);
  const walk = (node) => [...node.children].forEach((child) => {
    if (['SCRIPT','STYLE','IFRAME','OBJECT','SVG','MATH'].includes(child.tagName)) { child.remove(); return; }
    walk(child);
    if (!allowed.has(child.tagName)) { child.replaceWith(...child.childNodes); return; }
    [...child.attributes].forEach((attribute) => {
      if (child.tagName !== 'A' || !['href','title'].includes(attribute.name.toLowerCase())) child.removeAttribute(attribute.name);
      else if (attribute.name.toLowerCase() === 'href' && !/^(https?:|mailto:)/i.test(attribute.value)) child.removeAttribute(attribute.name);
    });
    if (child.tagName === 'A') { child.setAttribute('target','_blank'); child.setAttribute('rel','noopener noreferrer'); }
  });
  walk(parsed.body);
  return parsed.body.innerHTML;
}
async function load() {
  if (activeFolder.value === 'review') { await loadReviewTickets(); return; }
  const version = ++loadVersion, folder = activeFolder.value;
  loading.value = true;
  try {
    const [rows, favorites] = await Promise.all([getMessages(folder), folder === 'favorites' ? Promise.resolve(null) : getMessages('favorites')]);
    if (version !== loadVersion) return;
    items.value = rows;
    favoriteCount.value = (favorites || rows).length;
    if (folder === 'inbox') messageStore.inbox = rows;
    if (selected.value) selected.value = filteredItems.value.find((item) => item.id === selected.value.id) || null;
  } finally { if (version === loadVersion) loading.value = false; }
}
// 待审核消息：按审核权限加载工单池（业务类型 + 关联角色/区域过滤）
async function loadReviewTickets() {
  loading.value = true;
  try {
    await reviewStore.fetchTickets('全部');
    reviewTickets.value = reviewStore.tickets.filter((ticket) => isTicketInReviewScope(ticket, reviewAccess.value));
    if (selected.value && !filteredItems.value.some((item) => item.id === selected.value.id)) selected.value = null;
  } finally { loading.value = false; }
}
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
function reviewSourceLabel(item) {
  const source = item?.ticket?.source || item?.source || '';
  const key = REVIEW_SOURCE_KEYS[source];
  return key ? t(key) : source || '—';
}
function reviewStatusLabel(item) {
  const status = String(item?.ticket?.status || '');
  if (status.includes('初审') || status === 'Pending Staff Review') return t('review.statusPendingStaff');
  if (status.includes('终审') || status === 'Pending Manager Review') return t('review.statusPendingManager');
  if (status.includes('批准') || status === 'Approved') return t('review.statusApproved');
  if (status.includes('驳回') || status === 'Rejected') return t('review.statusRejected');
  return status || '—';
}
function reviewStatusType(item) {
  const status = String(item?.ticket?.status || '');
  if (status.includes('批准') || status === 'Approved') return 'success';
  if (status.includes('驳回') || status === 'Rejected') return 'danger';
  return 'warning';
}
function reviewStageOf(item) {
  const status = String(item?.ticket?.status || '');
  if (status.includes('初审') || status === 'Pending Staff Review') return 'staff';
  if (status.includes('终审') || status === 'Pending Manager Review') return 'manager';
  return '';
}
function normalizeTicketTime(value) {
  const raw = String(value || '');
  const iso = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
function toReviewItem(ticket) {
  const pending = isReviewPending(ticket);
  return {
    id: ticket.id,
    kind: 'review',
    ticket,
    sender: ticket.applicantName || '—',
    createdAt: normalizeTicketTime(ticket.submittedAt),
    subject: `${reviewSourceLabel({ ticket })} · ${ticket.applicantName || ''}`,
    bodyText: ticket.reason || '',
    read: !pending,
    favorite: false,
    attachments: []
  };
}
function openReviewAction(item) {
  reviewStage.value = reviewStageOf(item) || 'staff';
  reviewActionText.value = '';
  reviewDecision.value = 'accept';
  reviewActionVisible.value = true;
}
async function submitReviewAction() {
  const ticket = selected.value?.ticket;
  if (!ticket) return;
  if (!reviewActionText.value.trim()) { ElMessage.warning(t('mail.reviewTextRequired')); return; }
  reviewSubmitting.value = true;
  try {
    if (reviewStage.value === 'manager') {
      const isEn = locale.value === 'en';
      await reviewStore.reviewManager(ticket.id, reviewDecision.value === 'accept' ? (isEn ? 'Approved' : '接受') : (isEn ? 'Rejected' : '拒绝'), reviewActionText.value.trim());
    } else {
      await reviewStore.reviewStaff(ticket.id, reviewActionText.value.trim());
    }
    reviewActionVisible.value = false;
    await loadReviewTickets();
    const refreshed = filteredItems.value.find((item) => item.id === ticket.id);
    if (refreshed) selected.value = refreshed;
  } finally { reviewSubmitting.value = false; }
}
async function switchFolder(folder) { activeFolder.value = folder; selected.value = null; await load(); }
function isIncoming(item) { return item.sourceFolder ? item.sourceFolder === 'inbox' : activeFolder.value !== 'sent'; }
async function selectMessage(item) { selected.value = item; if (item.kind !== 'review' && isIncoming(item) && !item.read) { await messageStore.markRead(item.id); item.read = true; } }
async function toggleFavorite(item) {
  if (item.kind === 'review') return;
  if (favoritePending.value.includes(item.id)) return;
  favoritePending.value.push(item.id);
  try {
    const favorite = !item.favorite;
    await setMessageFavorite(item.id, favorite);
    item.favorite = favorite;
    const inboxItem = messageStore.inbox.find((entry) => entry.id === item.id);
    if (inboxItem) inboxItem.favorite = favorite;
    favoriteCount.value = Math.max(0, favoriteCount.value + (favorite ? 1 : -1));
    if (selected.value?.id === item.id) selected.value = null;
    await load();
    ElMessage.success(t(favorite ? 'mail.favoriteAdded' : 'mail.favoriteRemoved'));
  } finally { favoritePending.value = favoritePending.value.filter((id) => id !== item.id); }
}
async function loadTree() { recipientsLoading.value = true; try { recipientTree.value = await getMessageRecipientTree(); } finally { recipientsLoading.value = false; } }
function openCompose() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('rcm_message_draft') || '{}'); } catch { saved = {}; }
  draft.value = { category: 'admin', recipientType: 'citizens', regionId: '', agentId: '', siteId: '', recipientIds: [], allAtSite: false, subject: '', bodyHtml: '', ...saved, attachments: [] };
  composeVisible.value = true;
  if (!recipientTree.value.length) loadTree();
  if (draft.value.siteId) loadFamilies();
}
function resetTarget() { Object.assign(draft.value, { regionId: '', agentId: '', siteId: '', recipientIds: [], allAtSite: false }); families.value = []; }
function changeRegion() { draft.value.agentId = ''; draft.value.siteId = ''; draft.value.recipientIds = []; families.value = []; }
function changeAgent() { draft.value.siteId = ''; draft.value.recipientIds = []; families.value = []; }
async function loadFamilies() {
  draft.value.recipientIds = []; families.value = [];
  if (!draft.value.siteId) return;
  const familyRows = await getAgentFamilies(draft.value.siteId);
  const site = siteOptions.value.find((item) => item.id === draft.value.siteId);
  families.value = familyRows.map((family) => ({ ...family, siteId: draft.value.siteId, siteName: site?.storeName || site?.name }));
}
function toggleAllFamilies(enabled) { draft.value.recipientIds = enabled ? families.value.map((item) => item.rationCardNo) : []; }
function focusEditor() { nextTick(() => { if (editor.value) { editor.value.innerHTML = draft.value.bodyHtml || ''; editor.value.focus(); } }); }
function formatText(command) {
  editor.value?.focus();
  const [action, value] = command.split(':');
  if (action === 'createLink') { const url = window.prompt(t('mail.linkPrompt')); if (!url) return; document.execCommand(action, false, url); }
  else document.execCommand(action, false, value);
  updateDraftBody();
}
function updateDraftBody() { if (editor.value) draft.value.bodyHtml = editor.value.innerHTML; }
function pastePlainText(event) { event.preventDefault(); const plain = event.clipboardData?.getData('text/plain') || ''; document.execCommand('insertText', false, plain); updateDraftBody(); }
function addFiles(event) {
  const selectedFiles = [...(event.target.files || [])];
  selectedFiles.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) { ElMessage.warning(t('mail.attachmentTooLarge')); return; }
    if (!draft.value.attachments.some((current) => current.name === file.name && current.size === file.size)) draft.value.attachments.push(file);
  });
  event.target.value = '';
}
function recipientPayload() {
  let recipientIds = draft.value.recipientIds;
  let recipientLabel = '';
  if (draft.value.recipientType === 'agents') {
    recipientIds = draft.value.siteId ? [draft.value.siteId] : draft.value.agentId ? [draft.value.agentId] : [];
    recipientLabel = draft.value.siteId ? selectedSiteLabel.value : selectedAgentLabel.value;
  } else if (draft.value.recipientType === 'citizens') {
    recipientLabel = selectedSiteLabel.value;
    if (draft.value.allAtSite) recipientIds = families.value.map((family) => family.rationCardNo);
  } else recipientLabel = t('mail.' + draft.value.recipientType);
  return { recipientIds, recipientLabel };
}
function saveDraft() {
  const { attachments, ...draftData } = draft.value;
  localStorage.setItem('rcm_message_draft', JSON.stringify(draftData));
  ElMessage.success(t('mail.draftSaved'));
}
async function sendDraft() {
  const cleanHtml = sanitizeHtml(draft.value.bodyHtml);
  const probe = document.createElement('div'); probe.innerHTML = cleanHtml;
  const bodyText = probe.textContent.trim();
  const { recipientIds, recipientLabel } = recipientPayload();
  if (!draft.value.subject.trim() || !bodyText) { ElMessage.warning(t('mail.subjectRequired')); return; }
  if (['citizens','agents'].includes(draft.value.recipientType) && !recipientIds.length) { ElMessage.warning(t('mail.recipientsRequired')); return; }
  sending.value = true;
  try {
    await sendMessage({ category: draft.value.category, recipientType: draft.value.recipientType, regionId: draft.value.regionId, agentId: draft.value.agentId, siteId: draft.value.siteId, recipientIds, recipientLabel, subject: draft.value.subject.trim(), bodyHtml: cleanHtml, bodyText, attachments: draft.value.attachments });
    localStorage.removeItem('rcm_message_draft');
    ElMessage.success(t('mail.sentSuccess')); composeVisible.value = false; previewVisible.value = false; await switchFolder('sent');
  } finally { sending.value = false; }
}
function replyTo(item) { openCompose(); draft.value.recipientType = 'web'; draft.value.subject = `${t('mail.reply')}: ${titleOf(item)}`; }
async function downloadAttachment(attachment) { const result = await getMessageAttachment(attachment.id); if (!result?.dataUrl) return; const link = document.createElement('a'); link.href = result.dataUrl; link.download = result.name || attachment.name; link.click(); URL.revokeObjectURL(link.href); }
async function revealMessage(id) {
  const inbox = await getMessages('inbox');
  messageStore.inbox = inbox;
  const found = inbox.find((item) => item.id === id);
  if (!found) return;
  search.value = '';
  await switchFolder(found.favorite ? 'favorites' : 'inbox');
  const detail = items.value.find((item) => item.id === id);
  if (detail) await selectMessage(detail);
}
watch(() => route.query.detail, (id) => { if (id) revealMessage(Array.isArray(id) ? id[0] : id); });
onMounted(async () => { if (route.query.detail) await revealMessage(String(route.query.detail)); else await load(); if (canSend.value) loadTree().catch(() => {}); });
</script>

<style scoped>
.mail-grid { display: grid; grid-template-columns: minmax(0, 1fr); }
.mail-folders { display: flex; gap: .375rem; overflow-x: auto; border-bottom: 1px solid #e7ece8; background: #f7f9f7; padding: .75rem; }
.folder-button { display: flex; flex-shrink: 0; align-items: center; gap: .625rem; border-radius: .5rem; padding: .75rem; text-align: start; font-size: .875rem; color: #526258; transition: background-color .15s; }
.folder-button:hover { background: #edf2ee; }
.folder-button.is-active { background: #e6f1e9; color: #28563b; font-weight: 600; }
.folder-count { display: inline-flex; align-items: center; justify-content: center; min-width: 1.375rem; border-radius: .375rem; background: #e3ebe5; padding-inline: .25rem; font-size: .75rem; }
.mail-list { display: flex; flex-direction: column; min-width: 0; min-height: 0; border-bottom: 1px solid #e7ece8; }
.mail-list-heading { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: .5rem; min-height: 3.25rem; border-bottom: 1px solid #e7ece8; padding: .75rem 1rem; }
.mail-list-heading h2 { color: #43564a; font-size: .875rem; font-weight: 600; }
.mail-list-heading > span { color: #839087; font-size: .75rem; }
.mail-list-items { flex: 1; min-height: 0; max-height: 320px; overflow-y: auto; }
.notification-item { display: grid; grid-template-columns: minmax(0, 1fr) 2rem; gap: .25rem; border-bottom: 1px solid #eef1ef; border-inline-start: 3px solid transparent; padding: .25rem .625rem; padding-inline-start: calc(1rem - 3px); }
.notification-item:hover { background: #f6f9f6; }
.notification-item.is-selected { border-inline-start-color: #609272; background: #eef5f0; }
.notification-content { display: block; min-width: 0; padding-block: .75rem; text-align: start; }
.favorite-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; margin-top: .375rem; border-radius: .375rem; color: #86968c; font-size: 1rem; }
.favorite-toggle:hover { background: #e5eee7; color: #356e49; }
.favorite-toggle.is-favorite { background: #e6f1e9; color: #356e49; }
.favorite-toggle:disabled { cursor: wait; opacity: .5; }
.folder-button:focus-visible, .notification-content:focus-visible, .favorite-toggle:focus-visible { outline: 2px solid #548163; outline-offset: -2px; }
.mail-reader { min-width: 0; min-height: 320px; overflow-y: auto; }
:global(.notification-compose-overlay .compose-dialog) { --compose-inset: clamp(24px, 5dvh, 48px); display: flex; flex-direction: column; height: min(720px, calc(100dvh - 2 * var(--compose-inset))); margin: var(--compose-inset) auto; }
:global(.notification-compose-overlay .compose-dialog .el-dialog__header) { flex-shrink: 0; }
:global(.notification-compose-overlay .compose-dialog .el-dialog__body) { flex: 1; min-height: 0; overflow: hidden; padding-top: .5rem; }
.compose-row { display: grid; grid-template-columns: 5.5rem minmax(0, 1fr); align-items: center; gap: .75rem; margin-bottom: .5rem; border-bottom: 1px solid #edf0ee; padding-bottom: .5rem; }
.compose-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .5rem; border-bottom: 1px solid #e8ede9; padding-bottom: .5rem; }
.attachment-row { display: flex; min-height: 2.5rem; align-items: center; gap: .5rem; padding-bottom: .375rem; }
.attachment-files { display: flex; flex: 1; min-width: 0; gap: .5rem; overflow-x: auto; }
.attachment-files :deep(.el-tag) { flex-shrink: 0; }
.attachment-filename { display: inline-block; max-width: 12rem; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom; }
.compose-canvas { display: flex; flex-direction: column; height: 100%; min-height: 0; padding: .25rem .125rem; }
.compose-canvas > :not(.rich-editor) { flex-shrink: 0; }
.compose-canvas > .rich-editor { flex: 1; min-height: 100px; overflow-y: auto; }
.compose-label { color: #526258; font-size: .875rem; font-weight: 500; line-height: 1.25rem; }
.compose-control { width: min(100%, 24rem); }
.recipient-fields { margin-bottom: .5rem; border-bottom: 1px solid #edf0ee; padding-bottom: .5rem; }
.recipient-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .25rem 1rem; }
.recipient-grid :deep(.el-form-item__label) { color: #526258; font-size: .875rem; font-weight: 500; line-height: 1.25rem; padding-bottom: .375rem; }
.compose-form :deep(.el-input__wrapper), .compose-form :deep(.el-select__wrapper) { min-height: 2.125rem; }
.subject-line .compose-control { width: 100%; }
.recipient-users { grid-column: 1 / -1; }
.editor-tool { min-width: 2rem; font-size: 1rem; }
.editor-tool :deep(.el-icon) { font-size: 1rem; }
.rich-toolbar { min-height: 2.5rem; padding-block: .25rem; }
.rich-toolbar :deep(.el-button + .el-button) { margin-inline-start: 0; }
.editor-glyph { display: inline-block; min-width: 1rem; text-align: center; }
.editor-glyph.align-left { text-align: start; }
.editor-glyph.align-center { text-align: center; }
.editor-glyph.align-right { text-align: end; }
.compose-form { color: #34473a; font-size: .875rem; }
.rich-editor:empty::before { color: #9aa69e; content: attr(data-placeholder); pointer-events: none; }
.mail-content :deep(p) { margin: 0 0 .75rem; }
.mail-content :deep(ul) { list-style: disc; padding-inline-start: 1.5rem; }
.mail-content :deep(ol) { list-style: decimal; padding-inline-start: 1.5rem; }
.mail-content :deep(blockquote) { border-inline-start: 3px solid #b6c8bb; margin: .75rem 0; padding-inline-start: 1rem; color: #66756b; }
.mail-content :deep(a) { color: #2f7650; text-decoration: underline; }
@media (min-width: 768px) { .mail-grid { grid-template-columns: minmax(260px, 34%) minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); height: clamp(440px, calc(100dvh - 208px), 900px); } .mail-folders { grid-column: 1 / -1; } .mail-list { border-bottom: 0; border-inline-end: 1px solid #e7ece8; } .mail-list-items { max-height: none; } .mail-reader { min-height: 0; } }
@media (min-width: 1024px) { .mail-grid { grid-template-columns: 184px minmax(280px, 320px) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); } .mail-folders { display: block; grid-column: auto; border-bottom: 0; border-inline-end: 1px solid #e7ece8; } .folder-button { width: 100%; margin-bottom: .375rem; } }
@media (min-width: 1024px) { .recipient-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } .recipient-users { grid-column: auto; } .recipient-users :deep(.el-checkbox) { margin-top: .125rem; } }
@media (max-width: 640px), (max-height: 560px) { :global(.notification-compose-overlay .compose-dialog .el-dialog__body) { max-height: none !important; overflow-y: auto !important; } .compose-canvas { height: auto; min-height: 100%; } .compose-canvas > .rich-editor { flex: none; min-height: 160px; max-height: 240px; } }
@media (max-width: 640px) { .recipient-grid { grid-template-columns: minmax(0, 1fr); } .recipient-users { grid-column: auto; } .compose-row { grid-template-columns: 4.5rem minmax(0, 1fr); } .compose-actions { align-items: stretch; flex-direction: column; } .compose-actions > .el-select { width: 100%; } .attachment-row { flex-wrap: wrap; } .attachment-files { flex-basis: 100%; } }
</style>
