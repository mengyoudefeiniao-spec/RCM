<template>
  <section class="chat-complaint-panel flex-1 min-h-0 flex flex-col bg-[#F8FBF8]" :aria-label="t(mode === 'create' ? 'chatComplaint.fileComplaint' : 'chatComplaint.progress')">
    <div class="flex items-center justify-between gap-2 p-3 border-b border-[#D9E5DB] bg-white shrink-0">
      <h3 class="text-sm font-bold text-[#1F3326]">{{ t(mode === 'create' ? 'chatComplaint.fileComplaint' : 'chatComplaint.progress') }}</h3>
      <button type="button" class="text-xs text-[#326445] underline" @click="emit('close')">{{ t('chatComplaint.back') }}</button>
    </div>
    <div class="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs">
      <div v-if="mode === 'create' && draft?.responseKey" class="complaint-reassurance rounded-lg border border-[#E5CEA1] bg-[#FDF3E0] p-3 space-y-2 leading-relaxed" role="status">
        <p class="font-medium text-[#326445]">{{ t(draft.responseKey) }}</p>
        <p class="text-[#7A5F21]">{{ t('chatComplaint.draftNote') }}</p>
      </div>
      <el-form v-if="mode === 'create'" label-position="top" :model="form" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-x-2">
          <el-form-item :label="t('complaint.citizenName')" required>
            <el-input v-model="form.applicantName" :aria-label="t('complaint.citizenName')" maxlength="100" />
          </el-form-item>
          <el-form-item :label="t('common.phone')" required>
            <el-input v-model="form.callPhone" :aria-label="t('common.phone')" type="tel" maxlength="20" dir="ltr" />
          </el-form-item>
        </div>
        <ComplaintLocationFields v-model:province="form.province" v-model:center="form.center" v-model:agent-name="form.agentName" :disabled="saving" />
        <el-form-item :label="t('complaint.appealType')" required>
          <el-select v-model="form.typeCode" class="w-full" :aria-label="t('complaint.appealType')">
            <el-option v-for="(entry, code) in COMPLAINT_TYPES" :key="code" :value="code" :label="t('complaint.' + entry[2])" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('chatComplaint.subject')" required>
          <el-input v-model="form.title" :aria-label="t('chatComplaint.subject')" :placeholder="t('chatComplaint.subjectPlaceholder')" maxlength="160" />
        </el-form-item>
        <el-form-item :label="t('complaint.mainContent')" required>
          <el-input v-model="form.content" :aria-label="t('complaint.mainContent')" type="textarea" :rows="4" maxlength="5000" show-word-limit :placeholder="t('chatComplaint.contentPlaceholder')" />
        </el-form-item>
        <div class="rounded-lg border border-[#D9E5DB] bg-white p-2.5 space-y-2 mb-3">
          <HoldToTalkInput :disabled="saving" @active-change="recording = $event" @transcript="appendVoiceTranscript" />
        </div>
        <section class="complaint-photo-upload mb-4 rounded-xl border border-[#C7DCCB] bg-gradient-to-b from-white to-[#F0F7F2] p-3 shadow-sm" :aria-label="t('chatOrders.photos')">
          <div class="flex items-start justify-between gap-2">
            <h4 class="flex min-w-0 items-start gap-2 text-sm font-bold leading-snug text-[#244D35]">
              <el-icon class="mt-0.5 shrink-0 text-lg"><Picture /></el-icon>
              <span>{{ t('chatOrders.photos') }}</span>
            </h4>
            <span class="shrink-0 rounded-full border border-[#C7DCCB] bg-white px-2 py-1 text-[11px] font-semibold text-[#326445]" role="status"><bdi dir="ltr">{{ t('chatOrders.photoCount', { count: photos.length, max: 5 }) }}</bdi></span>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-[#58685D]">{{ t('chatOrders.photoTip') }}</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <button type="button" class="complaint-photo-action complaint-photo-action--camera" :aria-label="t('chatOrders.camera')" :aria-describedby="photoHintId" :disabled="saving || validatingPhotos || photos.length >= 5" @click="cameraInput.click()">
              <el-icon class="text-2xl"><Camera /></el-icon>
              <span>{{ t('chatOrders.camera') }}</span>
            </button>
            <button type="button" class="complaint-photo-action complaint-photo-action--upload" :aria-label="t('chatOrders.upload')" :aria-describedby="photoHintId" :disabled="saving || validatingPhotos || photos.length >= 5" @click="photoInput.click()">
              <el-icon class="text-2xl"><UploadFilled /></el-icon>
              <span>{{ t('chatOrders.upload') }}</span>
            </button>
          </div>
          <input ref="cameraInput" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden @change="addPhotos" />
          <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden @change="addPhotos" />
          <p :id="photoHintId" class="mt-3 text-[11px] leading-relaxed text-[#58685D]">{{ t('chatOrders.photoHint') }}</p>
          <div v-if="photos.length" class="mt-3 grid grid-cols-3 gap-2">
            <figure v-for="(photo, index) in photos" :key="photo.url" class="min-w-0 rounded-lg border border-[#D9E5DB] bg-white p-1.5">
              <img :src="photo.url" :alt="photo.file.name" class="aspect-square w-full rounded-md object-cover" />
              <button type="button" class="mt-1 flex min-h-8 w-full items-center justify-center gap-1 text-[11px] leading-snug text-[#B74040] underline disabled:opacity-50" :disabled="saving" @click="removePhoto(index)"><el-icon class="shrink-0"><Delete /></el-icon><span>{{ t('chatOrders.remove') }}</span></button>
            </figure>
          </div>
        </section>
        <el-form-item :label="t('chatOrders.associate')">
          <el-select v-model="selectedOrderId" clearable filterable :loading="ordersLoading" :placeholder="t('chatOrders.none')" :aria-label="t('chatOrders.associate')" class="w-full" :disabled="saving">
            <el-option v-for="order in orders" :key="order.orderId" :value="order.orderId" :label="order.orderId" />
          </el-select>
          <el-button v-if="ordersFailed" size="small" @click="loadOrders">{{ t('common.refresh') }}</el-button>
        </el-form-item>
        <CustomerOrderCard v-if="selectedOrder" :order="selectedOrder" class="mb-3" />
        <el-button type="primary" native-type="submit" class="w-full" :loading="saving" :disabled="recording || validatingPhotos">{{ t('chatComplaint.submit') }}</el-button>
      </el-form>
      <template v-else>
        <div class="flex items-center justify-between gap-2">
          <el-button size="small" :loading="loading" @click="load">{{ t('common.refresh') }}</el-button>
          <el-button size="small" plain @click="enableNotifications">{{ t('chatComplaint.enableNotifications') }}</el-button>
        </div>
        <div v-if="loadError" role="alert" class="text-[#C04442]">{{ t('chatComplaint.refreshFailed') }}</div>
        <el-empty v-else-if="!loading && !tickets.length" :description="t('chatComplaint.noComplaints')" :image-size="54" />
        <article v-for="ticket in tickets" :key="ticket.id" class="rounded-lg bg-white border p-3 space-y-2" :class="selectedId === ticket.id ? 'border-[#D3AF62]' : 'border-[#D9E5DB]'" :data-complaint-id="ticket.id">
          <button type="button" class="w-full text-start space-y-2" :aria-expanded="selectedId === ticket.id" @click="selectedId = selectedId === ticket.id ? '' : ticket.id">
            <span class="flex justify-between items-start gap-2">
              <span class="font-bold text-[#1F3326] break-words min-w-0">{{ ticket.title }}</span>
              <span class="shrink-0 rounded-full px-2 py-1 text-[10px]" :class="ticket.statusCode === 'RESOLVED' ? 'bg-[#E1F4E4] text-[#326445]' : 'bg-[#FDF3E0] text-[#7A5F21]'">{{ statusLabel(ticket.statusCode) }}</span>
            </span>
            <bdi class="block font-mono text-[10px] text-[#8A9A8F] break-all" dir="ltr">{{ ticket.id }}</bdi>
            <span class="block text-[11px] text-[#58685D]">{{ t('chatComplaint.latestUpdate') }}: {{ formatTime(ticket.handledAt || ticket.submittedAt) }}</span>
          </button>
          <div v-if="selectedId === ticket.id" class="border-t border-[#E9F1EB] pt-2 space-y-3">
            <p class="whitespace-pre-wrap break-words text-[#58685D]">{{ ticket.content }}</p>
            <p class="text-[#8A9A8F]">{{ ticket.province }} · {{ ticket.agentName }}</p>
            <ComplaintEvidence :ticket="ticket" />
            <ComplaintRating :ticket="ticket" allow-rate @updated="updateRating" />
            <h4 class="font-bold text-[#326445]">{{ t('chatComplaint.timeline') }}</h4>
            <ol class="border-s-2 border-[#D9E5DB] ps-3 space-y-3">
              <li v-for="(entry, index) in ticket.history || []" :key="entry.id || index" class="space-y-1">
                <p class="font-semibold text-[#326445]">{{ statusLabel(entry.statusCode) }}</p>
                <p class="text-[10px] text-[#8A9A8F]">{{ formatTime(entry.createdAt) }}<span v-if="entry.handlerName"> · {{ entry.handlerNameKey ? t(entry.handlerNameKey) : entry.handlerName }}</span></p>
                <p class="whitespace-pre-wrap break-words text-[#43554B]">{{ entry.result || t('chatComplaint.awaiting') }}</p>
              </li>
            </ol>
            <div v-if="ticket.result" class="bg-[#F3F8F4] p-2 rounded-lg space-y-1">
              <h4 class="font-bold text-[#326445]">{{ t('complaint.handlingResult') }}</h4>
              <p class="whitespace-pre-wrap break-words">{{ ticket.result }}</p>
            </div>
          </div>
        </article>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Camera, UploadFilled, Picture, Delete } from '@element-plus/icons-vue';
import HoldToTalkInput from './HoldToTalkInput.vue';
import CustomerOrderCard from './CustomerOrderCard.vue';
import ComplaintLocationFields from './ComplaintLocationFields.vue';
import ComplaintEvidence from './ComplaintEvidence.vue';
import ComplaintRating from './ComplaintRating.vue';
import { validComplaintPhoto } from '../../utils/customerOrders.js';
import { createComplaintTicket, getComplaintList, getCustomerOrders } from '../../api/complaint.js';
import { getMyProfile } from '../../api/my.js';
import { useAuthStore } from '../../stores/auth.js';
import { useMyNotificationsStore } from '../../stores/myNotifications.js';
import { COMPLAINT_STATUSES, COMPLAINT_TYPES, COMPLAINT_STORAGE_PREFIX } from '../../utils/complaints.js';
import { onTabMessage } from '../../utils/crossTabBus.js';

const props = defineProps({ mode: { type: String, default: 'create' }, complaintId: { type: String, default: '' }, draft: { type: Object, default: null }, orderId: { type: String, default: '' } });
const emit = defineEmits(['close', 'submitted']);
const { t, locale } = useI18n();
const auth = useAuthStore();
const notices = useMyNotificationsStore();
const form = reactive({ applicantName: auth.userProfile?.displayNameKey ? t(auth.userProfile.displayNameKey) : (auth.userProfile?.name || ''), callPhone: '', province: '', center: '', agentName: '', typeCode: 'SERVICE', title: '', content: '' });
const saving = ref(false);
const loading = ref(false);
const loadError = ref(false);
const tickets = ref([]);
const selectedId = ref(props.complaintId);
const recording = ref(false);
const orders = ref([]), ordersLoading = ref(false), ordersFailed = ref(false);
const selectedOrderId = ref(props.orderId), photos = ref([]), validatingPhotos = ref(false);
const cameraInput = ref(null), photoInput = ref(null);
const photoHintId = useId();
const selectedOrder = computed(() => orders.value.find(order => order.orderId === selectedOrderId.value));
let ordersVersion = 0;
async function loadOrders() {
  const version = ++ordersVersion;
  ordersLoading.value = true; ordersFailed.value = false;
  try { const rows = await getCustomerOrders(); if (alive && version === ordersVersion) orders.value = rows; }
  catch { if (alive && version === ordersVersion) ordersFailed.value = true; }
  finally { if (alive && version === ordersVersion) ordersLoading.value = false; }
}
async function addPhotos(event) {
  const files = [...(event.target.files || [])];
  event.target.value = '';
  if (saving.value || validatingPhotos.value) return;
  validatingPhotos.value = true;
  try {
    if (photos.value.length + files.length > 5 || !(await Promise.all(files.map(validComplaintPhoto))).every(Boolean)) { ElMessage.warning(t('chatOrders.invalidPhoto')); return; }
    if (alive) photos.value.push(...files.map(file => ({ file, url: URL.createObjectURL(file) })));
  } catch { ElMessage.warning(t('chatOrders.invalidPhoto')); }
  finally { validatingPhotos.value = false; }
}
function removePhoto(index) { URL.revokeObjectURL(photos.value[index].url); photos.value.splice(index, 1); }
function updateRating(ticket) { tickets.value = tickets.value.map(row => row.id === ticket.id ? ticket : row); }

let alive = true;
let requestVersion = 0;
let timer;
let unsubscribe;

const statusLabel = code => t('complaint.' + (COMPLAINT_STATUSES[code] || COMPLAINT_STATUSES.PENDING)[2]);
function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale.value === 'ckb' ? 'ckb-IQ' : locale.value);
}

async function load() {
  if (!alive || props.mode !== 'progress') return;
  const version = ++requestVersion;
  loading.value = true;
  loadError.value = false;
  try {
    const rows = await getComplaintList({ mine: true });
    if (!alive || version !== requestVersion) return;
    tickets.value = rows;
    if (!selectedId.value && rows.length) selectedId.value = rows[0].id;
    await markSelectedRead(selectedId.value);
  } catch { if (alive && version === requestVersion) loadError.value = true; }
  finally { if (alive && version === requestVersion) loading.value = false; }
}

async function markSelectedRead(id) {
  if (!alive || props.mode !== 'progress' || !id) return;
  try {
    await notices.refresh();
    const ids = notices.items.filter(item => item.complaintId === id && !item.read).map(item => item.id);
    if (alive && ids.length) await notices.markRead(ids);
  } catch { /* Progress remains readable if notification updates are unavailable. */ }
}

async function submit() {
  if (saving.value || recording.value || validatingPhotos.value) return;
  const data = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
  if (!data.applicantName || !/^\+?[\d\s-]{7,20}$/.test(data.callPhone) || !data.province || !data.agentName || !data.title || !data.content) {
    ElMessage.warning(t('chatComplaint.invalidForm'));
    return;
  }
  saving.value = true;
  try {
    const payload = new FormData();
    Object.entries(data).forEach(([key, value]) => payload.append(key, value));
    if (selectedOrderId.value) payload.append('orderId', selectedOrderId.value);
    if (props.draft?.id) payload.append('sourceMessageId', props.draft.id);
    photos.value.forEach(photo => payload.append('photos', photo.file));
    const ticket = await createComplaintTicket(payload);
    if (!alive) return;
    form.title = '';
    form.content = '';
    while (photos.value.length) removePhoto(0);
    ElMessage.success(t('chatComplaint.submitted'));
    emit('submitted', ticket.id);
  } catch { /* Request layer displays the server error; preserve the draft. */ }
  finally { saving.value = false; }
}

function appendVoiceTranscript(text) {
  form.content = [form.content, text].filter(Boolean).join(' ').slice(0, 5000);
}

async function enableNotifications() {
  const enabled = await notices.enableDeviceNotifications();
  ElMessage[enabled ? 'success' : 'info'](t(enabled ? 'chatComplaint.notificationsEnabled' : 'chatComplaint.notificationsUnavailable'));
}
function onStorage(event) { if (event.key?.startsWith(COMPLAINT_STORAGE_PREFIX)) load(); }
watch(() => props.draft, draft => {
  if (!draft?.id) return;
  form.content = draft.content || '';
  form.title = draft.title || '';
  form.typeCode = Object.hasOwn(COMPLAINT_TYPES, draft.typeCode) ? draft.typeCode : 'SERVICE';
}, { immediate: true });
watch(() => [props.mode, props.complaintId], () => { selectedId.value = props.complaintId; load(); });
watch(selectedId, markSelectedRead);
watch(locale, () => { load(); loadOrders(); });
watch(() => [props.mode, props.orderId], () => { if (props.mode === 'create') selectedOrderId.value = props.orderId; });
onMounted(() => {
  loadOrders();
  getMyProfile().then(profile => { if (alive && !form.callPhone) form.callPhone = profile.phone || ''; }).catch(() => {});
  load();
  timer = setInterval(load, 15000);
  unsubscribe = onTabMessage('COMPLAINT_CHANGED', load);
  window.addEventListener('storage', onStorage);
  window.addEventListener('rcm:complaints-changed', load);
  window.addEventListener('focus', load);
});
onBeforeUnmount(() => {
  alive = false;
  while (photos.value.length) removePhoto(0);
  clearInterval(timer);
  unsubscribe?.();
  window.removeEventListener('storage', onStorage);
  window.removeEventListener('rcm:complaints-changed', load);
  window.removeEventListener('focus', load);
});
</script>

<style scoped>
.chat-complaint-panel :deep(.el-form-item) { margin-bottom: 12px; }
.chat-complaint-panel :deep(.el-form-item__label) { font-size: 12px; line-height: 18px; margin-bottom: 4px; }
.complaint-photo-action {
  display: flex;
  min-width: 0;
  min-height: 88px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  border: 1px solid #326445;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: background-color .15s, box-shadow .15s;
}
.complaint-photo-action--camera { background: #326445; color: white; box-shadow: 0 2px 5px #244d3520; }
.complaint-photo-action .el-icon { font-size: 24px; }
.complaint-photo-action--upload { background: white; color: #244d35; border-color: #8eb49a; }
.complaint-photo-action--camera:hover:not(:disabled) { background: #244d35; }
.complaint-photo-action--upload:hover:not(:disabled) { background: #e7f2e9; border-color: #326445; }
.complaint-photo-action:focus-visible { outline: 3px solid #d3af62; outline-offset: 3px; }
.complaint-photo-action:disabled { cursor: not-allowed; opacity: .5; box-shadow: none; }
</style>
