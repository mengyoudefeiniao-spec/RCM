<template>
  <section class="mail-shell p-2 sm:p-4">
    <div class="mail-toolbar flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-[#DCE5DF] bg-white px-4 py-3">
      <div class="flex items-center gap-3"><h1 class="text-lg font-bold text-[#24372C]">{{ t('mail.title') }}</h1><el-tag v-if="messageStore.unreadCount" size="small" round>{{ t('mail.unreadCount', { count: messageStore.unreadCount }) }}</el-tag></div>
      <div class="flex w-full items-center gap-2 sm:w-auto"><el-input v-model="search" :placeholder="t('mail.search')" clearable class="!w-full sm:!w-64" @keyup.enter="load"/><el-button circle :title="t('mail.refresh')" @click="load"><el-icon><Refresh /></el-icon></el-button><el-button v-if="canSend" type="primary" @click="openCompose"><el-icon><EditPen /></el-icon>{{ t('mail.compose') }}</el-button></div>
    </div>

    <div class="mail-grid overflow-hidden rounded-b-xl border-x border-b border-[#DCE5DF] bg-white">
      <aside class="mail-folders border-b border-[#E7ECE8] bg-[#F7F9F7] p-3 lg:border-b-0 lg:border-e">
        <div class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#819087]">{{ t('mail.title') }}</div>
        <button v-for="folder in folders" :key="folder.id" type="button" class="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors" :class="activeFolder === folder.id ? 'bg-[#E6F1E9] font-semibold text-[#28563B]' : 'text-[#526258] hover:bg-[#EDF2EE]'" @click="switchFolder(folder.id)">
          <el-icon><component :is="folder.icon" /></el-icon><span class="flex-1">{{ t('mail.' + folder.id) }}</span><span v-if="folder.id === 'inbox' && messageStore.unreadCount" class="text-xs font-bold">{{ messageStore.unreadCount }}</span>
        </button>
      </aside>

      <div class="mail-list border-b border-[#E7ECE8] lg:border-b-0 lg:border-e">
        <div v-if="loading" class="p-4"><el-skeleton :rows="5" animated /></div>
        <div v-else-if="filteredItems.length" class="max-h-[calc(100vh-230px)] overflow-y-auto">
          <button v-for="item in filteredItems" :key="item.id" type="button" class="w-full border-b border-[#EEF1EF] px-4 py-3.5 text-start transition-colors hover:bg-[#F6F9F6]" :class="selected?.id === item.id ? 'bg-[#F0F6F1]' : ''" @click="selectMessage(item)">
            <div class="flex items-start justify-between gap-2"><div class="min-w-0 truncate text-sm" :class="!item.read && activeFolder === 'inbox' ? 'font-bold text-[#24372C]' : 'font-medium text-[#46584D]'">{{ activeFolder === 'sent' ? t('mail.to') + ': ' + recipientSummary(item) : item.sender }}</div><time class="shrink-0 text-[11px] text-[#8A9890]">{{ shortDate(item.createdAt) }}</time></div>
            <div class="mt-1 flex items-center gap-2"><span class="min-w-0 flex-1 truncate text-sm text-[#53635A]">{{ titleOf(item) || t('mail.emptyBody') }}</span><span v-if="item.attachments?.length" class="text-[#819087]" :title="t('mail.attachments')"><el-icon><Paperclip /></el-icon></span><span v-if="!item.read && activeFolder === 'inbox'" class="h-2 w-2 shrink-0 rounded-full bg-[#3D8A58]"/></div>
            <p class="mt-1 line-clamp-2 text-xs leading-5 text-[#839087]">{{ previewText(item) }}</p>
          </button>
        </div>
        <el-empty v-else :description="t('mail.noMail')" :image-size="76" />
      </div>

      <main class="mail-reader min-w-0 p-4 sm:p-6">
        <template v-if="selected">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EDEA] pb-4">
            <div class="flex flex-wrap items-center gap-2"><el-tag size="small" effect="plain">{{ categoryLabel(selected) }}</el-tag><el-tag v-if="!selected.read && activeFolder === 'inbox'" size="small" type="success">{{ t('mail.unread') }}</el-tag></div>
            <div class="flex items-center gap-2"><el-button v-if="canSend && activeFolder === 'inbox'" size="small" @click="replyTo(selected)"><el-icon><Promotion /></el-icon>{{ t('mail.reply') }}</el-button></div>
          </div>
          <h2 class="mb-5 break-words text-xl font-bold leading-8 text-[#26382D]">{{ titleOf(selected) }}</h2>
          <div class="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#75837A]"><span><b class="me-1 font-medium text-[#526258]">{{ t('mail.from') }}:</b>{{ selected.sender }}</span><span><b class="me-1 font-medium text-[#526258]">{{ t('mail.to') }}:</b>{{ recipientSummary(selected) }}</span><span>{{ fullDate(selected.createdAt) }}</span></div>
          <article class="mail-content min-h-24 break-words text-sm leading-7 text-[#34473A]" v-html="safeBody(selected)" />
          <div v-if="selected.attachments?.length" class="mt-8 border-t border-[#E8EDEA] pt-4"><h3 class="mb-3 text-sm font-semibold text-[#43564A]">{{ t('mail.attachments') }} ({{ selected.attachments.length }})</h3><div class="flex flex-wrap gap-2"><button v-for="attachment in selected.attachments" :key="attachment.id" type="button" class="flex max-w-full items-center gap-2 rounded-lg border border-[#DCE5DF] px-3 py-2 text-start text-sm hover:bg-[#F5F8F5]" @click="downloadAttachment(attachment)"><el-icon class="shrink-0 text-[#548163]"><Paperclip /></el-icon><span class="max-w-64 truncate">{{ attachment.name }}</span><span class="shrink-0 text-xs text-[#86938B]">{{ formatSize(attachment.size) }}</span><el-icon class="shrink-0"><Download /></el-icon></button></div></div>
        </template>
        <div v-else class="flex min-h-[300px] items-center justify-center text-sm text-[#8A9890]">{{ t('mail.selectMail') }}</div>
      </main>
    </div>

    <el-dialog v-model="composeVisible" :title="t('mail.newMessage')" width="min(1180px, 97vw)" top="2vh" class="compose-dialog" @opened="focusEditor">
      <div class="compose-form compose-canvas max-h-[88vh] overflow-y-auto">
        <div class="compose-actions">
          <div class="flex flex-wrap items-center gap-2">
            <el-button type="primary" :loading="sending" @click="sendDraft"><el-icon><Promotion/></el-icon>{{ t('mail.send') }}</el-button>
            <el-button @click="previewVisible = true"><el-icon><View/></el-icon>{{ t('mail.preview') }}</el-button>
            <el-button @click="saveDraft"><el-icon><FolderChecked/></el-icon>{{ t('mail.saveDraft') }}</el-button>
            <el-button @click="composeVisible = false">{{ t('mail.discard') }}</el-button>
          </div>
          <el-select v-model="draft.category" class="!w-48" :aria-label="t('mail.category')"><el-option value="admin" :label="t('mail.admin')"/><el-option value="system" :label="t('mail.system')"/></el-select>
        </div>
        <div class="compose-row recipient-line"><label class="compose-label">{{ t('mail.to') }}</label><el-select v-model="draft.recipientType" class="compose-control" @change="resetTarget"><el-option value="citizens" :label="t('mail.citizenUsers')"/><el-option value="agents" :label="t('mail.agents')"/><el-option value="web" :label="t('mail.webUsers')"/><el-option value="everyone" :label="t('mail.everyone')"/></el-select><span class="compose-hint">{{ t('mail.category') }}: {{ t('mail.' + draft.category) }}</span></div>
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
        <div class="attachment-row"><el-button text @click="fileInput?.click()"><el-icon><Paperclip/></el-icon>{{ t('mail.attach') }}</el-button><span class="compose-hint">{{ t('mail.attachmentLimit') }}</span><input ref="fileInput" class="hidden" type="file" multiple @change="addFiles"/><div class="flex flex-wrap gap-2"><el-tag v-for="(file,index) in draft.attachments" :key="file.name + file.size" closable @close="draft.attachments.splice(index,1)">{{ file.name }} · {{ formatSize(file.size) }}</el-tag></div></div>
        <div class="rich-toolbar flex flex-wrap items-center gap-1 border-x border-t border-[#DFE7E1] bg-[#F7F9F7] p-2">
          <el-tooltip v-for="tool in editorTools" :key="tool.command" :content="t('mail.' + tool.label)"><el-button size="small" text class="editor-tool" :aria-label="t('mail.' + tool.label)" @click="formatText(tool.command)"><span v-if="tool.glyph" class="editor-glyph" :class="tool.glyphClass">{{ tool.glyph }}</span><el-icon v-else><component :is="tool.icon"/></el-icon></el-button></el-tooltip>
        </div>
        <div ref="editor" class="rich-editor min-h-[22rem] border border-[#DFE7E1] px-5 py-4 text-sm leading-7 outline-none" contenteditable="true" role="textbox" aria-multiline="true" :data-placeholder="t('mail.richTextHint')" @input="updateDraftBody" @paste="pastePlainText" />
      </div>
    </el-dialog>
    <el-dialog v-model="previewVisible" :title="t('mail.preview')" width="min(900px, 94vw)" append-to-body>
      <div class="mb-3 border-b border-[#E8EDEA] pb-3 text-sm"><div class="mb-2"><b>{{ t('mail.subject') }}:</b> {{ draft.subject || t('mail.subjectPlaceholder') }}</div><div><b>{{ t('mail.to') }}:</b> {{ recipientPayload().recipientLabel || t('mail.' + draft.recipientType) }}</div></div>
      <article class="mail-content min-h-48 break-words text-sm leading-7 text-[#34473A]" v-html="previewHtml" />
      <template #footer><el-button @click="previewVisible = false">{{ t('mail.closePreview') }}</el-button><el-button type="primary" @click="previewVisible = false">{{ t('mail.continueEditing') }}</el-button></template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { getAgentFamilies, getAgentHierarchyTree } from '../../api/agent.js';
import { getMessageAttachment, getMessageRecipientTree, getMessages, sendMessage } from '../../api/adminCenter.js';
import { useAuthStore } from '../../stores/auth.js';
import { useMessageCenterStore } from '../../stores/messageCenter.js';

const { t } = useI18n(), route = useRoute(), authStore = useAuthStore(), messageStore = useMessageCenterStore();
const activeFolder = ref('inbox'), items = ref([]), selected = ref(null), search = ref(''), loading = ref(false), composeVisible = ref(false), previewVisible = ref(false), sending = ref(false);
const recipientTree = ref([]), recipientsLoading = ref(false), families = ref([]), editor = ref(null), fileInput = ref(null);
const draft = ref({ category: 'admin', recipientType: 'citizens', regionId: '', agentId: '', siteId: '', recipientIds: [], allAtSite: false, subject: '', bodyHtml: '', attachments: [] });
const canSend = computed(() => authStore.isAdmin || authStore.userProfile?.permissionCodes?.includes('messages.send'));
const folders = computed(() => [{ id: 'inbox', icon: 'MessageBox' }, ...(canSend.value ? [{ id: 'sent', icon: 'Promotion' }] : [])]);
const regionOptions = computed(() => recipientTree.value);
const agentOptions = computed(() => regionOptions.value.find((item) => item.id === draft.value.regionId)?.children || []);
const siteOptions = computed(() => agentOptions.value.find((item) => item.id === draft.value.agentId)?.children || []);
const familyOptions = computed(() => families.value);
const selectedAgentLabel = computed(() => agentOptions.value.find((item) => item.id === draft.value.agentId)?.name || '');
const selectedSiteLabel = computed(() => siteOptions.value.find((item) => item.id === draft.value.siteId)?.storeName || siteOptions.value.find((item) => item.id === draft.value.siteId)?.name || '');
const filteredItems = computed(() => items.value.filter((item) => !search.value || [item.subject, item.sender, item.bodyText, item.recipientLabel].some((value) => String(value || '').toLowerCase().includes(search.value.toLowerCase()))));
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
function shortDate(value) { return value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value)) : ''; }
function fullDate(value) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)) : ''; }
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
async function load() { loading.value = true; try { items.value = await getMessages(activeFolder.value); if (activeFolder.value === 'inbox') messageStore.inbox = items.value; if (selected.value) selected.value = items.value.find((item) => item.id === selected.value.id) || null; } finally { loading.value = false; } }
async function switchFolder(folder) { activeFolder.value = folder; selected.value = null; await load(); }
async function selectMessage(item) { selected.value = item; if (activeFolder.value === 'inbox' && !item.read) { await messageStore.markRead(item.id); item.read = true; } }
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
watch(() => route.query.detail, async (id) => { if (!id) return; activeFolder.value = 'inbox'; await load(); const found = items.value.find((item) => item.id === id); if (found) selectMessage(found); }, { immediate: true });
onMounted(async () => { await load(); loadTree().catch(() => {}); });
</script>

<style scoped>
.mail-grid { display: grid; grid-template-columns: minmax(0, 1fr); min-height: calc(100vh - 190px); }
.compose-row { display: grid; grid-template-columns: 5.5rem minmax(0, 1fr); align-items: center; gap: .75rem; margin-bottom: .75rem; border-bottom: 1px solid #edf0ee; padding-bottom: .75rem; }
.compose-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: -.5rem 0 .75rem; border-bottom: 1px solid #e8ede9; padding-bottom: .875rem; }
.recipient-line .compose-hint { margin-inline-start: auto; }
.attachment-row { display: flex; min-height: 2.75rem; flex-wrap: wrap; align-items: center; gap: .75rem; border-bottom: 1px solid #edf0ee; padding: .25rem 0 .625rem; }
.compose-canvas { padding: .25rem .125rem; }
.compose-dialog :deep(.el-dialog__body) { padding-top: .5rem; }
.compose-label { color: #526258; font-size: .875rem; font-weight: 500; line-height: 1.25rem; }
.compose-control { width: min(100%, 24rem); }
.recipient-fields { margin-bottom: .75rem; border-bottom: 1px solid #edf0ee; padding-bottom: 1rem; }
.recipient-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .25rem 1rem; }
.recipient-grid :deep(.el-form-item__label) { color: #526258; font-size: .875rem; font-weight: 500; line-height: 1.25rem; padding-bottom: .375rem; }
.recipient-grid :deep(.el-input__wrapper), .recipient-grid :deep(.el-select__wrapper), .compose-form :deep(.el-input__wrapper), .compose-form :deep(.el-select__wrapper) { min-height: 2.5rem; }
.recipient-users { grid-column: 1 / -1; }
.editor-tool { min-width: 2rem; font-size: 1rem; }
.editor-tool :deep(.el-icon) { font-size: 1rem; }
.rich-toolbar { min-height: 3rem; }
.editor-glyph { display: inline-block; min-width: 1rem; text-align: center; }
.editor-glyph.align-left { text-align: start; }
.editor-glyph.align-center { text-align: center; }
.editor-glyph.align-right { text-align: end; }
.compose-form { color: #34473a; font-size: .875rem; }
.mail-list { min-height: 280px; }
.mail-reader { min-height: 320px; }
.rich-editor:empty::before { color: #9aa69e; content: attr(data-placeholder); pointer-events: none; }
.mail-content :deep(p) { margin: 0 0 .75rem; }
.mail-content :deep(ul) { list-style: disc; padding-inline-start: 1.5rem; }
.mail-content :deep(ol) { list-style: decimal; padding-inline-start: 1.5rem; }
.mail-content :deep(blockquote) { border-inline-start: 3px solid #b6c8bb; margin: .75rem 0; padding-inline-start: 1rem; color: #66756b; }
.mail-content :deep(a) { color: #2f7650; text-decoration: underline; }
@media (min-width: 1024px) { .mail-grid { grid-template-columns: 210px 330px minmax(0, 1fr); } .mail-list,.mail-reader { min-height: calc(100vh - 190px); } }
@media (max-width: 640px) { .recipient-grid { grid-template-columns: minmax(0, 1fr); } .recipient-users { grid-column: auto; } .compose-row { grid-template-columns: 4.5rem minmax(0, 1fr); } .compose-actions { align-items: stretch; flex-direction: column; } .compose-actions > .el-select { width: 100%; } .recipient-line .compose-hint { margin-inline-start: 5.25rem; } }
</style>
