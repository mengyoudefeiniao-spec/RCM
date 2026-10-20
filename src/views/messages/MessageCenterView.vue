<template>
  <section class="mx-auto max-w-[1320px] space-y-4 p-3 sm:p-5">
    <div class="rounded-xl border border-[#C7E0CE] bg-white p-5 shadow-sm"><h1 class="text-xl font-bold text-[#24483A]">{{ t('messages.title') }}</h1><p class="mt-1 text-sm text-[#68796E]">{{ t('messages.subtitle') }}</p></div>
    <el-tabs v-model="tab" class="rounded-xl border border-[#D9E5DB] bg-white px-4 pt-2 shadow-sm" @tab-change="load">
      <el-tab-pane :label="t('messages.inbox')" name="inbox"/><el-tab-pane v-if="authStore.isAdmin" :label="t('messages.compose')" name="compose"/><el-tab-pane v-if="authStore.isAdmin" :label="t('messages.sent')" name="sent"/>
      <div v-if="tab === 'compose'" class="max-w-3xl py-4">
        <el-form :model="form" label-position="top">
          <el-form-item :label="t('messages.category')"><el-select v-model="form.category" class="w-full"><el-option value="admin" :label="t('messages.admin')"/><el-option value="system" :label="t('messages.system')"/></el-select></el-form-item>
          <el-form-item :label="t('messages.recipient')"><el-select v-model="form.recipient" class="w-full"><el-option value="citizens" :label="t('messages.allCitizens')"/><el-option value="agents" :label="t('messages.allAgents')"/><el-option value="web" :label="t('messages.allWebUsers')"/><el-option value="everyone" :label="t('messages.everyone')"/></el-select></el-form-item>
          <el-form-item :label="t('messages.subject')"><el-input v-model="form.subject" maxlength="120" show-word-limit/></el-form-item>
          <el-form-item :label="t('messages.body')"><el-input v-model="form.body" type="textarea" :rows="6" maxlength="4000" show-word-limit/></el-form-item>
          <el-button type="primary" :loading="sending" @click="submit">{{ t('messages.send') }}</el-button>
        </el-form>
      </div>
      <div v-else class="py-4">
        <el-table :data="items" v-loading="loading" row-key="id" @row-click="openDetail">
          <el-table-column :label="t('messages.category')" width="175"><template #default="{ row }">{{ categoryLabel(row) }}</template></el-table-column>
          <el-table-column :label="t('messages.subject')" min-width="220"><template #default="{ row }"><span :class="!row.read && tab === 'inbox' ? 'font-bold text-[#24483A]' : ''">{{ titleOf(row) }}</span><el-tag v-if="!row.read && tab === 'inbox'" class="ms-2" size="small" type="danger">{{ t('messages.unread') }}</el-tag></template></el-table-column>
          <el-table-column :label="t('messages.sender')" prop="sender" min-width="140"/><el-table-column :label="t('messages.sentAt')" min-width="170"><template #default="{ row }">{{ formatTime(row.createdAt) }}</template></el-table-column>
          <el-table-column :label="t('common.actions')" width="130"><template #default="{ row }"><el-button link type="primary" @click.stop="openDetail(row)">{{ t('common.detail') }}</el-button></template></el-table-column>
          <template #empty><el-empty :description="t('messages.empty')"/></template>
        </el-table>
      </div>
    </el-tabs>
    <el-dialog v-model="detailVisible" :title="t('messages.detail')" width="min(620px, 94vw)">
      <template v-if="selected"><div class="space-y-4"><div class="flex flex-wrap gap-2"><el-tag>{{ categoryLabel(selected) }}</el-tag><el-tag v-if="selected.read" type="success">{{ t('messages.read') }}</el-tag></div><h2 class="text-lg font-bold text-[#24483A]">{{ titleOf(selected) }}</h2><p class="whitespace-pre-wrap leading-7 text-[#46584D]">{{ bodyOf(selected) }}</p><div class="border-t pt-3 text-xs text-[#829087]">{{ selected.sender }} · {{ formatTime(selected.createdAt) }}</div></div></template>
      <template #footer><el-button @click="detailVisible = false">{{ t('messages.close') }}</el-button><el-button type="primary" @click="goRecord">{{ t('messages.viewDetails') }}</el-button></template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { getMessages, sendMessage } from '../../api/adminCenter.js';
import { useAuthStore } from '../../stores/auth.js';
import { useMessageCenterStore } from '../../stores/messageCenter.js';
const { t } = useI18n(), route = useRoute(), router = useRouter(), authStore = useAuthStore(), messageStore = useMessageCenterStore();
const tab = ref('inbox'), items = ref([]), loading = ref(false), sending = ref(false), selected = ref(null), detailVisible = ref(false);
const form = ref({ category: 'admin', recipient: 'citizens', subject: '', body: '' });
function titleOf(item) { return item.subjectKey ? t(item.subjectKey) : item.subject; }
function bodyOf(item) { return item.bodyKey ? t(item.bodyKey) : item.body; }
function categoryLabel(item) { return t(item.category === 'system' ? 'messages.system' : 'messages.admin'); }
function formatTime(value) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
async function load() { if (tab.value === 'compose') return; loading.value = true; try { items.value = await getMessages(tab.value); if (tab.value === 'inbox') { messageStore.inbox = items.value; } } finally { loading.value = false; } }
async function openDetail(item) { selected.value = item; detailVisible.value = true; if (tab.value === 'inbox' && !item.read) { await messageStore.markRead(item.id); item.read = true; } }
function goRecord() { if (!selected.value) return; const id = selected.value.id; detailVisible.value = false; router.push({ path: '/messages', query: { detail: id } }); }
async function submit() { if (!form.value.subject.trim() || !form.value.body.trim()) { ElMessage.warning(t('messages.required')); return; } sending.value = true; try { await sendMessage({ ...form.value, subject: form.value.subject.trim(), body: form.value.body.trim() }); ElMessage.success(t('messages.sentSuccess')); form.value = { category: 'admin', recipient: 'citizens', subject: '', body: '' }; tab.value = 'sent'; await load(); } finally { sending.value = false; } }
watch(() => route.query.detail, async (id) => { if (!id) return; await load(); const found = items.value.find((item) => item.id === id); if (found) openDetail(found); }, { immediate: true });
onMounted(load);
</script>
