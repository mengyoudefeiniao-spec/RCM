<template>
  <section class="mx-auto max-w-[1720px] space-y-4 p-3 sm:p-5">
    <div class="rounded-xl border border-[#C7E0CE] bg-white p-5 shadow-sm"><h1 class="text-xl font-bold text-[#24483A]">{{ t('system.title') }}</h1><p class="mt-1 text-sm text-[#68796E]">{{ t('system.subtitle') }}</p></div>
    <div class="rounded-xl border border-[#D9E5DB] bg-white p-3 sm:p-5 shadow-sm">
      <el-tabs v-model="section" @tab-change="load"><el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key" :label="t('system.' + tab.label)" /></el-tabs>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3"><el-input v-model="query" :placeholder="t('system.search')" clearable class="!w-full sm:!w-72" /><el-button v-if="section !== 'audit-logs'" type="primary" @click="openCreate"><el-icon><Plus /></el-icon>{{ t('system.add') }}</el-button></div>
      <el-table :data="filteredRows" stripe v-loading="loading" class="w-full">
        <el-table-column v-for="column in columns" :key="column.key" :prop="column.key" :label="t('system.' + column.label)" min-width="145">
          <template v-if="column.key === 'status'" #default="{ row }"><el-tag :type="row.status === 'disabled' ? 'info' : 'success'">{{ row.status === 'disabled' ? t('system.disabled') : t('system.active') }}</el-tag></template>
          <template v-else-if="column.key === 'role'" #default="{ row }">{{ roleName(row.role) }}</template>
          <template v-else-if="column.key === 'time'" #default="{ row }">{{ formatTime(row.time) }}</template>
        </el-table-column>
        <el-table-column v-if="section === 'users'" :label="t('common.actions')" width="100" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">{{ t('system.edit') }}</el-button></template></el-table-column>
        <template #empty><el-empty :description="t('system.noData')" /></template>
      </el-table>
    </div>
    <el-dialog v-model="dialog" :title="editing ? t('system.edit') : t('system.add')" width="min(520px, 94vw)">
      <el-form :model="form" label-position="top">
        <template v-if="section === 'users'"><el-form-item :label="t('system.username')"><el-input v-model="form.username" /></el-form-item><el-form-item :label="t('system.name')"><el-input v-model="form.name" /></el-form-item><el-form-item :label="t('system.email')"><el-input v-model="form.email" /></el-form-item><el-form-item :label="t('system.role')"><el-select v-model="form.role" class="w-full"><el-option value="admin" :label="t('system.adminRole')"/><el-option value="operator" :label="t('system.operatorRole')"/><el-option value="auditor" :label="t('system.auditorRole')"/></el-select></el-form-item><el-form-item :label="t('system.organization')"><el-input v-model="form.organization" /></el-form-item><el-form-item :label="t('system.status')"><el-switch v-model="form.enabled" /></el-form-item></template>
        <template v-else><el-form-item :label="t('system.name')"><el-input v-model="form.name" /></el-form-item><el-form-item :label="section === 'permissions' ? t('system.code') : t('system.description')"><el-input v-model="form.code" /></el-form-item><el-form-item v-if="section !== 'permissions'" :label="t('system.description')"><el-input v-model="form.description" type="textarea" /></el-form-item></template>
      </el-form>
      <template #footer><el-button @click="dialog = false">{{ t('system.cancel') }}</el-button><el-button type="primary" @click="save">{{ t('system.save') }}</el-button></template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { getSystemRecords, saveSystemRecord } from '../../api/adminCenter.js';
const { t } = useI18n();
const tabs = [{ key: 'users', label: 'users' }, { key: 'roles', label: 'roles' }, { key: 'permissions', label: 'permissions' }, { key: 'organizations', label: 'organizations' }, { key: 'audit-logs', label: 'logs' }];
const section = ref('users'), rows = ref([]), loading = ref(false), query = ref(''), dialog = ref(false), editing = ref(false), form = ref({});
const bySection = { users: [['username','username'],['name','name'],['email','email'],['role','role'],['organization','organization'],['status','status']], roles: [['name','name'],['code','code'],['description','description']], permissions: [['name','name'],['code','code'],['description','description']], organizations: [['name','name'],['code','code'],['parent','organization'],['status','status']], 'audit-logs': [['actor','name'],['action','action'],['target','target'],['time','time']] };
const columns = computed(() => bySection[section.value].map(([key,label]) => ({ key,label })));
const filteredRows = computed(() => rows.value.filter((row) => !query.value || Object.values(row).some((value) => String(value).toLowerCase().includes(query.value.toLowerCase()))));
async function load() { loading.value = true; try { rows.value = await getSystemRecords(section.value); } finally { loading.value = false; } }
function openCreate() { editing.value = false; form.value = { enabled: true, status: 'active' }; dialog.value = true; }
function openEdit(row) { editing.value = true; form.value = { ...row, enabled: row.status !== 'disabled' }; dialog.value = true; }
async function save() { if (!(form.value.name || form.value.username)) return; const value = { ...form.value, status: form.value.enabled === false ? 'disabled' : (form.value.status || 'active') }; delete value.enabled; await saveSystemRecord(section.value, value); dialog.value = false; await load(); const key = editing.value ? 'userUpdated' : section.value === 'roles' ? 'roleCreated' : section.value === 'permissions' ? 'permissionCreated' : section.value === 'organizations' ? 'orgCreated' : 'userCreated'; ElMessage.success(t('system.' + key)); }
function roleName(role) { return ({ admin: t('system.adminRole'), operator: t('system.operatorRole'), auditor: t('system.auditorRole') })[role] || role; }
function formatTime(value) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
onMounted(load);
</script>
