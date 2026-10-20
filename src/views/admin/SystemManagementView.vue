<template>
  <section class="mx-auto max-w-[1720px] p-3 sm:p-5">
    <div class="rounded-xl border border-[#D9E5DB] bg-white p-3 shadow-sm sm:p-5">
      <el-tabs v-model="section" @tab-change="changeSection">
        <el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key" :label="t('system.' + tab.label)" />
      </el-tabs>
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <el-input v-model="keyword" :placeholder="t('systemExtras.keyword')" clearable class="!w-full sm:!w-80" @keyup.enter="runSearch" />
        <el-button type="primary" @click="runSearch">{{ t('systemExtras.query') }}</el-button>
        <el-button @click="resetSearch">{{ t('common.reset') }}</el-button>
        <el-button v-if="section !== 'audit-logs' && section !== 'permissions'" type="success" class="ms-auto" @click="openCreate"><el-icon><Plus /></el-icon>{{ t('system.add') }}</el-button>
      </div>
      <el-table :data="filteredRows" stripe v-loading="loading" class="w-full">
        <el-table-column v-for="column in columns" :key="column.key" :prop="column.key" :label="columnLabel(column)" :min-width="column.width || 145">
          <template v-if="column.key === 'status'" #default="{ row }"><el-tag :type="row.status === 'disabled' ? 'info' : 'success'">{{ row.status === 'disabled' ? t('system.disabled') : t('system.active') }}</el-tag></template>
          <template v-else-if="column.key === 'roleId'" #default="{ row }">{{ roleLabel(row) }}</template>
          <template v-else-if="column.key === 'permissionCodes'" #default="{ row }"><div class="flex flex-wrap gap-1"><el-tag v-for="code in row.permissionCodes || []" :key="code" size="small">{{ permissionLabel(code) }}</el-tag><span v-if="!row.permissionCodes?.length" class="text-xs text-[#89978E]">{{ t('systemExtras.noPermissions') }}</span></div></template>
          <template v-else-if="column.key === 'moduleKey'" #default="{ row }">{{ t('systemExtras.' + row.moduleKey) }}</template>
          <template v-else-if="column.key === 'featureKey'" #default="{ row }">{{ t('systemExtras.' + row.featureKey) }}</template>
          <template v-else-if="column.key === 'time'" #default="{ row }">{{ formatTime(row.time) }}</template>
        </el-table-column>
        <el-table-column v-if="section === 'users'" :label="t('common.actions')" width="245" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-button link type="primary" @click="openEdit(row)">{{ t('system.edit') }}</el-button>
              <el-button link :type="row.status === 'disabled' ? 'success' : 'warning'" @click="toggleUser(row)">{{ t(row.status === 'disabled' ? 'systemExtras.enable' : 'systemExtras.disable') }}</el-button>
              <el-button link type="danger" @click="removeRecord(row)">{{ t('systemExtras.delete') }}</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-else-if="section === 'roles' || section === 'organizations'" :label="t('common.actions')" width="100" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">{{ t('system.edit') }}</el-button></template></el-table-column>
        <template #empty><el-empty :description="t('system.noData')" /></template>
      </el-table>
    </div>

    <el-dialog v-model="dialog" :title="editing ? t('system.edit') : t('system.add')" width="min(680px, 95vw)">
      <el-form :model="form" label-position="top" class="max-h-[68vh] overflow-y-auto px-1">
        <template v-if="section === 'users'">
          <el-form-item :label="t('system.username')"><el-input v-model="form.username" /></el-form-item>
          <el-form-item :label="t('system.name')"><el-input v-model="form.name" /></el-form-item>
          <el-form-item :label="t('system.email')"><el-input v-model="form.email" /></el-form-item>
          <el-form-item :label="t('system.role')"><el-select v-model="form.roleId" class="w-full"><el-option v-for="role in roleRows" :key="role.id" :value="role.id" :label="role.name + ' (' + role.code + ')'" /></el-select></el-form-item>
          <el-form-item :label="t('system.organization')"><el-input v-model="form.organization" /></el-form-item>
          <el-form-item :label="t('system.status')"><el-switch v-model="form.enabled" /></el-form-item>
        </template>
        <template v-else-if="section === 'roles'">
          <el-form-item :label="t('system.name')"><el-input v-model="form.name" /></el-form-item>
          <el-form-item :label="t('system.code')"><el-input v-model="form.code" /></el-form-item>
          <el-form-item :label="t('system.description')"><el-input v-model="form.description" type="textarea" /></el-form-item>
          <el-form-item :label="t('systemExtras.rolePermissions')">
            <div class="w-full space-y-3 rounded-lg border border-[#E3ECE5] p-3">
              <div v-for="group in permissionGroups" :key="group.moduleKey">
                <div class="mb-1 text-sm font-semibold">{{ t('systemExtras.' + group.moduleKey) }}</div>
                <el-checkbox-group v-model="form.permissionCodes"><el-checkbox v-for="permission in group.items" :key="permission.code" :value="permission.code">{{ t('systemExtras.' + permission.featureKey) }}</el-checkbox></el-checkbox-group>
              </div>
            </div>
          </el-form-item>
        </template>
        <template v-else-if="section === 'organizations'">
          <el-form-item :label="t('system.name')"><el-input v-model="form.name" /></el-form-item>
          <el-form-item :label="t('system.code')"><el-input v-model="form.code" /></el-form-item>
          <el-form-item :label="t('systemExtras.address')"><div class="flex w-full gap-2"><el-input v-model="form.address"/><el-button @click="locationDialog = true">{{ t('systemExtras.locate') }}</el-button></div></el-form-item>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><el-form-item :label="t('systemExtras.latitude')"><el-input v-model="form.latitude" /></el-form-item><el-form-item :label="t('systemExtras.longitude')"><el-input v-model="form.longitude" /></el-form-item></div>
          <el-form-item :label="t('systemExtras.contact')"><el-input v-model="form.contact" /></el-form-item>
          <el-form-item :label="t('systemExtras.phone')"><el-input v-model="form.phone" /></el-form-item>
          <el-form-item :label="t('system.description')"><el-input v-model="form.parent" /></el-form-item>
        </template>
      </el-form>
      <template #footer><el-button @click="dialog = false">{{ t('system.cancel') }}</el-button><el-button type="primary" @click="save">{{ t('system.save') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="locationDialog" :title="t('systemExtras.locate')" width="min(520px, 94vw)">
      <el-form label-position="top"><el-form-item :label="t('systemExtras.address')"><el-input v-model="form.address" /></el-form-item><div class="grid grid-cols-2 gap-3"><el-form-item :label="t('systemExtras.latitude')"><el-input v-model="form.latitude" /></el-form-item><el-form-item :label="t('systemExtras.longitude')"><el-input v-model="form.longitude" /></el-form-item></div></el-form>
      <template #footer><el-button @click="locateCurrentPosition">{{ t('systemExtras.useLocation') }}</el-button><el-button type="primary" @click="locationDialog = false">{{ t('common.confirm') }}</el-button></template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteSystemRecord, getSystemRecords, saveSystemRecord } from '../../api/adminCenter.js';
const { t } = useI18n();
const tabs = [{ key: 'users', label: 'users' }, { key: 'roles', label: 'roles' }, { key: 'organizations', label: 'organizations' }, { key: 'audit-logs', label: 'logs' }];
const section = ref('users'), rows = ref([]), roleRows = ref([]), permissionRows = ref([]), loading = ref(false), keyword = ref(''), appliedQuery = ref(''), dialog = ref(false), locationDialog = ref(false), editing = ref(false), form = ref({});
const actor = () => JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}').name || 'System Administrator';
const catalog = [
  ['moduleDashboard','dashboard.view','view'],
  ['moduleAgents','agents.view','view'],['moduleAgents','agents.create','create'],['moduleAgents','agents.edit','editFeature'],['moduleAgents','agents.delete','remove'],
  ['moduleRation','ration.view','view'],['moduleRation','ration.dispatch','dispatch'],
  ['moduleReview','review.view','view'],['moduleReview','review.process','process'],
  ['moduleComplaints','complaints.view','view'],['moduleComplaints','complaints.process','process'],
  ['moduleSystem','system.users','manage'],['moduleSystem','system.roles','manage'],['moduleSystem','system.permissions','manage'],['moduleSystem','system.organizations','manage'],['moduleSystem','system.audit','view'],
  ['moduleMessages','messages.view','view'],['moduleMessages','messages.send','send']
].map(([moduleKey, code, featureKey]) => ({ id: 'perm-' + code, moduleKey, code, featureKey }));
const bySection = {
  users: [['username','username'],['name','name'],['email','email'],['roleId','role'],['organization','organization'],['status','status']],
  roles: [['name','name'],['code','code'],['permissionCodes','assignedPermissions'],['description','description']],
  permissions: [['moduleKey','permissionModule'],['featureKey','permissionFeature'],['code','code']],
  organizations: [['name','name'],['code','code'],['parent','organization'],['address','address'],['contact','contact'],['phone','phone']],
  'audit-logs': [['actor','name'],['details','auditDetails'],['ip','auditIp'],['time','time']]
};
const columns = computed(() => bySection[section.value].map(([key,label]) => ({ key,label, width: key === 'permissionCodes' || key === 'details' ? 260 : undefined })));
const filteredRows = computed(() => rows.value.filter((row) => !appliedQuery.value || Object.values(row).some((value) => String(JSON.stringify(value) ?? value ?? '').toLowerCase().includes(appliedQuery.value.toLowerCase()))));
const permissionGroups = computed(() => [...new Set(permissionRows.value.map((item) => item.moduleKey))].map((moduleKey) => ({ moduleKey, items: permissionRows.value.filter((item) => item.moduleKey === moduleKey) })));
function columnLabel(column) { return column.key === 'permissionCodes' ? t('systemExtras.' + column.label) : column.key === 'details' || column.key === 'ip' || column.key === 'moduleKey' || column.key === 'featureKey' || column.key === 'address' || column.key === 'contact' || column.key === 'phone' ? t('systemExtras.' + column.label) : t('system.' + column.label); }
function permissionLabel(code) { const item = permissionRows.value.find((permission) => permission.code === code); return item ? t('systemExtras.' + item.moduleKey) + ' · ' + t('systemExtras.' + item.featureKey) : code; }
function roleLabel(user) { const role = roleRows.value.find((item) => item.id === user.roleId || item.code === user.role); return role?.name || user.role || '—'; }
function formatTime(value) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
async function load() { loading.value = true; try { rows.value = section.value === 'permissions' ? permissionRows.value : await getSystemRecords(section.value); } finally { loading.value = false; } }
async function loadReferences() { [roleRows.value, permissionRows.value] = await Promise.all([getSystemRecords('roles'), getSystemRecords('permissions')]); if (!permissionRows.value.length) permissionRows.value = catalog; if (!roleRows.value.length) roleRows.value = [{ id: 'role-admin', code: 'admin', name: t('system.adminRole'), permissionCodes: catalog.map((p) => p.code) }]; }
async function changeSection() { keyword.value = ''; appliedQuery.value = ''; await load(); }
function runSearch() { appliedQuery.value = keyword.value.trim(); }
function resetSearch() { keyword.value = ''; appliedQuery.value = ''; }
function openCreate() { editing.value = false; form.value = section.value === 'roles' ? { permissionCodes: [] } : section.value === 'users' ? { status: 'active', enabled: true } : {}; dialog.value = true; }
function openEdit(row) { editing.value = true; form.value = { ...row, enabled: row.status !== 'disabled', permissionCodes: [...(row.permissionCodes || [])] }; dialog.value = true; }
function auditMessage(key, entityKey, name, extra = {}) { return t('systemExtras.' + key, { actor: actor(), entity: t('systemExtras.' + entityKey), name, ...extra }); }
async function save() {
  const name = form.value.name || form.value.username || form.value.code;
  if (!name) return;
  const oldName = rows.value.find((row) => row.id === form.value.id)?.name;
  const value = { ...form.value, status: form.value.enabled === false ? 'disabled' : (form.value.status || 'active') };
  delete value.enabled;
  if (section.value === 'users') { const role = roleRows.value.find((item) => item.id === value.roleId); value.role = role?.code || value.role; value.permissionCodes = role?.permissionCodes || []; }
  const entityKey = section.value === 'users' ? 'entityUser' : section.value === 'roles' ? 'entityRole' : section.value === 'permissions' ? 'entityPermission' : 'entityOrganization';
  const isRename = editing.value && oldName && oldName !== value.name;
  value.auditDetails = isRename ? auditMessage('auditRenamed', entityKey, value.name, { oldName, newName: value.name }) : auditMessage(editing.value ? 'auditUpdated' : 'auditCreated', entityKey, name);
  await saveSystemRecord(section.value, value); dialog.value = false; await load();
  ElMessage.success(t('system.' + (editing.value ? 'userUpdated' : section.value === 'roles' ? 'roleCreated' : section.value === 'permissions' ? 'permissionCreated' : section.value === 'organizations' ? 'orgCreated' : 'userCreated')));
}
async function toggleUser(row) { const enabling = row.status === 'disabled', nextStatus = enabling ? 'active' : 'disabled'; const details = auditMessage(enabling ? 'auditEnabled' : 'auditDisabled', 'entityUser', row.name || row.username); await saveSystemRecord('users', { ...row, status: nextStatus, auditDetails: details }); await load(); ElMessage.success(t('systemExtras.statusUpdated')); }
async function removeRecord(row) { try { await ElMessageBox.confirm(t('systemExtras.confirmDelete'), t('systemExtras.delete'), { type: 'warning' }); } catch { return; } const entityKey = section.value === 'users' ? 'entityUser' : section.value === 'roles' ? 'entityRole' : 'entityOrganization'; await deleteSystemRecord(section.value, row.id, { auditDetails: auditMessage('auditDeleted', entityKey, row.name || row.username || row.code) }); await load(); ElMessage.success(t(section.value === 'users' ? 'systemExtras.userDeleted' : 'systemExtras.recordDeleted')); }
function locateCurrentPosition() { if (!navigator.geolocation) { ElMessage.warning(t('systemExtras.locationFailed')); return; } navigator.geolocation.getCurrentPosition(({ coords }) => { form.value.latitude = coords.latitude.toFixed(6); form.value.longitude = coords.longitude.toFixed(6); }, () => ElMessage.warning(t('systemExtras.locationFailed'))); }
onMounted(async () => { await loadReferences(); await load(); });
</script>
