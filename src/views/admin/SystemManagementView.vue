<template>
  <section class="mx-auto max-w-[1720px] p-3 sm:p-5">
    <div class="rounded-xl border border-[#D9E5DB] bg-white p-3 shadow-sm sm:p-5">
      <el-tabs v-model="section" @tab-change="changeSection">
        <el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key" :label="t('system.' + tab.label)" />
      </el-tabs>
      <div v-if="section !== 'audit-logs'" class="mb-4 flex flex-wrap items-center gap-2">
        <el-input v-model="keyword" :placeholder="t('systemExtras.keyword')" clearable class="!w-full sm:!w-80" @keyup.enter="runSearch" />
        <el-button type="primary" @click="runSearch">{{ t('systemExtras.query') }}</el-button>
        <el-button @click="resetSearch">{{ t('common.reset') }}</el-button>
        <el-button v-if="section !== 'audit-logs' && section !== 'permissions'" type="success" class="ms-auto" @click="openCreate"><el-icon><Plus /></el-icon>{{ t('system.add') }}</el-button>
      </div>
      <div v-else class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
        <el-input v-model="auditFilters.actor" :placeholder="t('system.auditActor')" clearable @keyup.enter="load" />
        <el-date-picker v-model="auditFilters.range" type="datetimerange" value-format="YYYY-MM-DDTHH:mm:ss" :start-placeholder="t('system.auditFrom')" :end-placeholder="t('system.auditTo')" class="!w-full" />
        <el-select v-model="auditFilters.type" clearable :placeholder="t('system.auditType')"><el-option v-for="type in auditTypes" :key="type" :value="type" :label="auditTypeLabel(type)" /></el-select>
        <el-input v-model="auditFilters.businessNo" :placeholder="t('system.auditBusinessNo')" clearable @keyup.enter="load" />
        <div class="flex gap-2"><el-button type="primary" @click="load">{{ t('system.auditSearch') }}</el-button><el-button @click="resetAuditFilters">{{ t('common.reset') }}</el-button></div>
        <el-button type="success" @click="exportAuditLogs">{{ t('system.auditExport') }}</el-button>
      </div>
      <div v-if="section === 'audit-logs'" class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F3F8F4] px-3 py-2 text-xs text-[#52675A]">
        <span>{{ t('system.auditRetention') }}</span><span>{{ t('system.auditAppendOnly') }}</span>
      </div>
      <el-table :data="filteredRows" stripe v-loading="loading" class="w-full">
        <el-table-column v-for="column in columns" :key="column.key" :prop="column.key" :label="columnLabel(column)" :min-width="column.width || 145">
          <template v-if="column.key === 'status'" #default="{ row }"><el-tag :type="row.status === 'disabled' ? 'info' : 'success'">{{ row.status === 'disabled' ? t('system.disabled') : t('system.active') }}</el-tag></template>
          <template v-else-if="column.key === 'roleId'" #default="{ row }">{{ roleLabel(row) }}</template>
          <template v-else-if="column.key === 'permissionCodes'" #default="{ row }"><div class="flex flex-wrap gap-1"><el-tag v-for="code in row.permissionCodes || []" :key="code" size="small">{{ permissionLabel(code) }}</el-tag><span v-if="!row.permissionCodes?.length" class="text-xs text-[#89978E]">{{ t('systemExtras.noPermissions') }}</span></div></template>
          <template v-else-if="column.key === 'reviewScope'" #default="{ row }"><span class="text-xs leading-5">{{ reviewScopeSummary(row) }}</span></template>
          <template v-else-if="column.key === 'moduleKey'" #default="{ row }">{{ t('systemExtras.' + row.moduleKey) }}</template>
          <template v-else-if="column.key === 'featureKey'" #default="{ row }">{{ t('systemExtras.' + row.featureKey) }}</template>
          <template v-else-if="column.key === 'type'" #default="{ row }">{{ auditTypeLabel(row.type) }}</template>
          <template v-else-if="column.key === 'terminal'" #default="{ row }">{{ row.terminal || '—' }}</template>
          <template v-else-if="column.key === 'businessNo'" #default="{ row }">{{ row.businessNo || '—' }}</template>
          <template v-else-if="column.key === 'object'" #default="{ row }">{{ row.object || '—' }}</template>
          <template v-else-if="column.key === 'before' || column.key === 'after'" #default="{ row }"><pre class="max-h-28 max-w-[300px] overflow-auto whitespace-pre-wrap break-all text-xs">{{ formatSnapshot(row[column.key]) }}</pre></template>
          <template v-else-if="column.key === 'time'" #default="{ row }">{{ formatTime(row.time || row.timestamp) }}</template>
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
              <div v-for="module in permissionTree" :key="module.moduleKey" class="space-y-1.5">
                <div class="text-sm font-semibold text-[#1F3326]">{{ t('systemExtras.' + module.moduleKey) }}</div>
                <div v-for="feature in module.features" :key="feature.code" class="ps-3">
                  <!-- 二级功能：无子级为可勾选权限项 -->
                  <el-checkbox
                    v-if="!feature.children.length"
                    :model-value="(form.permissionCodes || []).includes(feature.code)"
                    @change="(checked) => togglePermission(feature.code, checked)"
                  >
                    {{ t('systemExtras.' + feature.featureKey) }}
                  </el-checkbox>
                  <!-- 二级功能：有子级时作为三级权限分组开关 -->
                  <template v-else>
                    <el-checkbox
                      :model-value="isFeatureFullyChecked(feature)"
                      :indeterminate="isFeatureIndeterminate(feature)"
                      @change="(checked) => toggleFeature(feature, checked)"
                    >
                      {{ t('systemExtras.' + feature.featureKey) }}
                    </el-checkbox>
                    <div class="ps-6 space-y-1">
                      <el-checkbox
                        v-for="leaf in feature.children"
                        :key="leaf.code"
                        :model-value="(form.permissionCodes || []).includes(leaf.code)"
                        @change="(checked) => togglePermission(leaf.code, checked)"
                      >
                        {{ t('systemExtras.' + leaf.featureKey) }}
                      </el-checkbox>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </el-form-item>
          <!-- 审核权限划分：按业务类型授权，并限定关联角色或区域 -->
          <el-form-item :label="t('systemExtras.reviewPermission')">
            <div class="w-full space-y-3 rounded-lg border border-[#E3ECE5] p-3">
              <div>
                <div class="mb-1 text-sm font-semibold text-[#1F3326]">{{ t('systemExtras.reviewTypes') }}</div>
                <el-checkbox-group v-model="reviewScopeTypes">
                  <el-checkbox v-for="type in reviewTypeOptions" :key="type.code" :value="type.code">{{ t('systemExtras.' + type.featureKey) }}</el-checkbox>
                </el-checkbox-group>
              </div>
              <div>
                <div class="mb-1 text-sm font-semibold text-[#1F3326]">{{ t('systemExtras.reviewScopeMode') }}</div>
                <el-radio-group v-model="reviewScopeMode">
                  <el-radio value="role">{{ t('systemExtras.reviewScopeByRole') }}</el-radio>
                  <el-radio value="region">{{ t('systemExtras.reviewScopeByRegion') }}</el-radio>
                </el-radio-group>
              </div>
              <div v-if="reviewScopeMode === 'role'">
                <div class="mb-1 text-sm font-semibold text-[#1F3326]">{{ t('systemExtras.reviewScopeRoles') }}</div>
                <el-select v-model="reviewScopeRoles" multiple clearable class="w-full" :placeholder="t('systemExtras.reviewScopeRolesPlaceholder')">
                  <el-option v-for="role in roleRows" :key="role.id" :value="role.id" :label="role.name + ' (' + role.code + ')'" />
                </el-select>
              </div>
              <div v-else>
                <div class="mb-1 text-sm font-semibold text-[#1F3326]">{{ t('systemExtras.reviewScopeRegions') }}</div>
                <el-select v-model="reviewScopeRegions" multiple clearable class="w-full" :placeholder="t('systemExtras.reviewScopeRegionsPlaceholder')">
                  <el-option v-for="region in reviewRegionOptions" :key="region" :value="region" :label="region" />
                </el-select>
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

    <el-dialog v-model="locationDialog" :title="t('systemExtras.locate')" width="min(720px, 96vw)" @opened="initializeLocationMap">
      <el-form label-position="top"><el-form-item :label="t('systemExtras.address')"><el-input v-model="form.address" /></el-form-item><div class="grid grid-cols-2 gap-3"><el-form-item :label="t('systemExtras.latitude')"><el-input v-model="form.latitude" /></el-form-item><el-form-item :label="t('systemExtras.longitude')"><el-input v-model="form.longitude" /></el-form-item></div></el-form>
      <div ref="locationMap" class="h-[340px] w-full rounded-lg border border-[#D9E5DB]" />
      <template #footer><el-button @click="locateCurrentPosition">{{ t('systemExtras.useLocation') }}</el-button><el-button type="primary" @click="locationDialog = false">{{ t('common.confirm') }}</el-button></template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { deleteSystemRecord, getSystemRecords, logAuditExport, saveSystemRecord } from '../../api/adminCenter.js';
import {
  PERMISSION_CATALOG,
  buildPermissionTree,
  resolveEffectiveCodes,
  REVIEW_TYPE_CODES,
  REVIEW_SCOPE_REGIONS,
  summarizeReviewScope
} from '../../utils/reviewPermission.js';
const { t } = useI18n();
const tabs = [{ key: 'users', label: 'users' }, { key: 'roles', label: 'roles' }, { key: 'organizations', label: 'organizations' }, { key: 'audit-logs', label: 'logs' }];
const section = ref('users'), rows = ref([]), roleRows = ref([]), permissionRows = ref([]), loading = ref(false), keyword = ref(''), appliedQuery = ref(''), dialog = ref(false), locationDialog = ref(false), editing = ref(false), form = ref({});
const auditFilters = ref({ actor: '', range: null, type: '', businessNo: '' });
const auditTypes = ['login', 'application', 'review', 'status_change', 'payment', 'configuration', 'data_export'];
const locationMap = ref(null);
let mapInstance, locationMarker;
const actor = () => JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}').name || 'System Administrator';
const catalog = PERMISSION_CATALOG.map((item) => ({ id: 'perm-' + item.code, moduleKey: item.moduleKey, code: item.code, featureKey: item.featureKey, parentCode: item.parentCode || '' }));
const bySection = {
  users: [['username','username'],['name','name'],['email','email'],['roleId','role'],['organization','organization'],['status','status']],
  roles: [['name','name'],['code','code'],['reviewScope','reviewPermission'],['permissionCodes','assignedPermissions'],['description','description']],
  permissions: [['moduleKey','permissionModule'],['featureKey','permissionFeature'],['code','code']],
  organizations: [['name','name'],['code','code'],['parent','organization'],['address','address'],['contact','contact'],['phone','phone']],
  'audit-logs': [['actor','auditActor'],['time','time'],['terminal','auditTerminal'],['ip','auditIp'],['type','auditType'],['businessNo','auditBusinessNo'],['object','auditObject'],['details','auditDetails'],['before','auditBefore'],['after','auditAfter']]
};
const columns = computed(() => bySection[section.value].map(([key,label]) => ({ key,label, width: key === 'permissionCodes' || key === 'details' ? 260 : undefined })));
const filteredRows = computed(() => {
  if (section.value === 'audit-logs') {
    const [from, to] = auditFilters.value.range || [];
    return rows.value.filter((row) => {
      const time = new Date(row.time || row.timestamp).getTime();
      return (!auditFilters.value.actor || String(row.actor || row.operatorName || '').toLowerCase().includes(auditFilters.value.actor.toLowerCase()))
        && (!auditFilters.value.type || row.type === auditFilters.value.type)
        && (!auditFilters.value.businessNo || String(row.businessNo || '').toLowerCase().includes(auditFilters.value.businessNo.toLowerCase()))
        && (!from || time >= new Date(from).getTime())
        && (!to || time <= new Date(to).getTime() + 999);
    });
  }
  return rows.value.filter((row) => !appliedQuery.value || Object.values(row).some((value) => String(JSON.stringify(value) ?? value ?? '').toLowerCase().includes(appliedQuery.value.toLowerCase())));
});
const permissionTree = computed(() => buildPermissionTree(permissionRows.value.length ? permissionRows.value : catalog));
const reviewTypeOptions = computed(() => permissionRows.value.filter((item) => REVIEW_TYPE_CODES.includes(item.code)));
const reviewRegionOptions = computed(() => REVIEW_SCOPE_REGIONS);
// 审核权限划分表单绑定（读写均落至 form.reviewScope）
const reviewScopeTypes = computed({
  get: () => form.value.reviewScope?.types || [],
  set: (value) => { form.value.reviewScope = { ...(form.value.reviewScope || {}), types: value }; }
});
const reviewScopeMode = computed({
  get: () => form.value.reviewScope?.mode || 'role',
  set: (value) => { form.value.reviewScope = { ...(form.value.reviewScope || {}), mode: value }; }
});
const reviewScopeRoles = computed({
  get: () => form.value.reviewScope?.roles || [],
  set: (value) => { form.value.reviewScope = { ...(form.value.reviewScope || {}), roles: value }; }
});
const reviewScopeRegions = computed({
  get: () => form.value.reviewScope?.regions || [],
  set: (value) => { form.value.reviewScope = { ...(form.value.reviewScope || {}), regions: value }; }
});
function emptyReviewScope() { return { types: [], mode: 'role', roles: [], regions: [] }; }
function togglePermission(code, checked) {
  const codes = new Set(form.value.permissionCodes || []);
  if (checked) codes.add(code); else codes.delete(code);
  form.value.permissionCodes = [...codes];
}
function isFeatureFullyChecked(feature) {
  const codes = form.value.permissionCodes || [];
  return feature.children.length > 0 && feature.children.every((child) => codes.includes(child.code));
}
function isFeatureIndeterminate(feature) {
  const codes = form.value.permissionCodes || [];
  const checked = feature.children.filter((child) => codes.includes(child.code)).length;
  return checked > 0 && checked < feature.children.length;
}
function toggleFeature(feature, checked) {
  const codes = new Set(form.value.permissionCodes || []);
  feature.children.forEach((child) => { if (checked) codes.add(child.code); else codes.delete(child.code); });
  form.value.permissionCodes = [...codes];
}
function reviewScopeSummary(row) {
  const summary = summarizeReviewScope(row.reviewScope);
  if (!summary.typeCount) return t('systemExtras.reviewScopeNone');
  const typeText = t('systemExtras.reviewTypesShort', { count: summary.typeCount });
  if (summary.mode === 'region') {
    return `${typeText} · ${t('systemExtras.reviewScopeByRegion')}${summary.regionCount ? ` (${summary.regionCount})` : ` (${t('systemExtras.reviewScopeAllRegions')})`}`;
  }
  return `${typeText} · ${t('systemExtras.reviewScopeByRole')}${summary.roleCount ? ` (${summary.roleCount})` : ''}`;
}
function columnLabel(column) { return column.key === 'permissionCodes' || column.key === 'reviewScope' || column.key === 'details' || column.key === 'ip' || column.key === 'moduleKey' || column.key === 'featureKey' || column.key === 'address' || column.key === 'contact' || column.key === 'phone' ? t('systemExtras.' + column.label) : t('system.' + column.label); }
function permissionLabel(code) { const item = permissionRows.value.find((permission) => permission.code === code); return item ? t('systemExtras.' + item.moduleKey) + ' · ' + t('systemExtras.' + item.featureKey) : code; }
function roleLabel(user) { const role = roleRows.value.find((item) => item.id === user.roleId || item.code === user.role); return role?.name || user.role || '—'; }
function formatTime(value) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
async function load() { loading.value = true; try { rows.value = section.value === 'permissions' ? permissionRows.value : await getSystemRecords(section.value, section.value === 'audit-logs' ? { actor: auditFilters.value.actor || undefined, type: auditFilters.value.type || undefined, businessNo: auditFilters.value.businessNo || undefined, from: auditFilters.value.range?.[0], to: auditFilters.value.range?.[1] } : undefined); } finally { loading.value = false; } }
async function loadReferences() { [roleRows.value, permissionRows.value] = await Promise.all([getSystemRecords('roles'), getSystemRecords('permissions')]); if (!permissionRows.value.length) permissionRows.value = catalog; if (!roleRows.value.length) roleRows.value = [{ id: 'role-admin', code: 'admin', name: t('system.adminRole'), permissionCodes: catalog.map((p) => p.code), reviewScope: { types: [...REVIEW_TYPE_CODES], mode: 'role', roles: [], regions: [] } }]; }
async function changeSection() { keyword.value = ''; appliedQuery.value = ''; await load(); }
function resetAuditFilters() { auditFilters.value = { actor: '', range: null, type: '', businessNo: '' }; load(); }
function auditTypeLabel(type) { return type ? t('system.auditType_' + type) : '—'; }
function formatSnapshot(value) { if (value == null || value === '') return '—'; try { return typeof value === 'string' ? JSON.stringify(JSON.parse(value), null, 2) : JSON.stringify(value, null, 2); } catch { return String(value); } }
async function exportAuditLogs() {
  await logAuditExport({ ...auditFilters.value });
  const columns = ['actor', 'time', 'terminal', 'ip', 'type', 'businessNo', 'object', 'details', 'before', 'after'];
  const cell = (value) => `"${String(value ?? '').replaceAll('"', '""').replaceAll('\r', ' ').replaceAll('\n', ' ')}"`;
  const lines = [columns.map((key) => cell(t('system.' + (key === 'actor' ? 'auditActor' : key === 'type' ? 'auditType' : key === 'businessNo' ? 'auditBusinessNo' : key === 'object' ? 'auditObject' : key === 'before' ? 'auditBefore' : key === 'after' ? 'auditAfter' : key === 'terminal' ? 'auditTerminal' : key === 'ip' ? 'auditIp' : key === 'details' ? 'auditDetails' : 'time')))).join(','), ...filteredRows.value.map((row) => columns.map((key) => cell(key === 'time' ? row.time || row.timestamp : key === 'type' ? auditTypeLabel(row.type) : key === 'before' || key === 'after' ? formatSnapshot(row[key]) : row[key] ?? row.operatorName)).join(','))];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
}
function runSearch() { appliedQuery.value = keyword.value.trim(); }
function resetSearch() { keyword.value = ''; appliedQuery.value = ''; }
function openCreate() { editing.value = false; form.value = section.value === 'roles' ? { permissionCodes: [], reviewScope: emptyReviewScope() } : section.value === 'users' ? { status: 'active', enabled: true } : {}; dialog.value = true; }
function openEdit(row) { editing.value = true; form.value = { ...row, enabled: row.status !== 'disabled', permissionCodes: resolveEffectiveCodes(row.permissionCodes || []), reviewScope: { ...emptyReviewScope(), ...(row.reviewScope || {}) } }; dialog.value = true; }
function auditMessage(key, entityKey, name, extra = {}) { return t('systemExtras.' + key, { actor: actor(), entity: t('systemExtras.' + entityKey), name, ...extra }); }
async function save() {
  const name = form.value.name || form.value.username || form.value.code;
  if (!name) return;
  const oldName = rows.value.find((row) => row.id === form.value.id)?.name;
  const value = { ...form.value, status: form.value.enabled === false ? 'disabled' : (form.value.status || 'active') };
  delete value.enabled;
  if (section.value === 'users') { const role = roleRows.value.find((item) => item.id === value.roleId); value.role = role?.code || value.role; value.permissionCodes = role?.permissionCodes || []; value.reviewScope = role?.reviewScope || null; }
  const entityKey = section.value === 'users' ? 'entityUser' : section.value === 'roles' ? 'entityRole' : section.value === 'permissions' ? 'entityPermission' : 'entityOrganization';
  const isRename = editing.value && oldName && oldName !== value.name;
  value.auditDetails = isRename ? auditMessage('auditRenamed', entityKey, value.name, { oldName, newName: value.name }) : auditMessage(editing.value ? 'auditUpdated' : 'auditCreated', entityKey, name);
  value.auditType = 'configuration';
  await saveSystemRecord(section.value, value); dialog.value = false; await load();
  ElMessage.success(t('system.' + (editing.value ? 'userUpdated' : section.value === 'roles' ? 'roleCreated' : section.value === 'permissions' ? 'permissionCreated' : section.value === 'organizations' ? 'orgCreated' : 'userCreated')));
}
async function toggleUser(row) { const enabling = row.status === 'disabled', nextStatus = enabling ? 'active' : 'disabled'; const details = auditMessage(enabling ? 'auditEnabled' : 'auditDisabled', 'entityUser', row.name || row.username); await saveSystemRecord('users', { ...row, status: nextStatus, auditDetails: details, auditType: 'status_change' }); await load(); ElMessage.success(t('systemExtras.statusUpdated')); }
async function removeRecord(row) { try { await ElMessageBox.confirm(t('systemExtras.confirmDelete'), t('systemExtras.delete'), { type: 'warning' }); } catch { return; } const entityKey = section.value === 'users' ? 'entityUser' : section.value === 'roles' ? 'entityRole' : 'entityOrganization'; await deleteSystemRecord(section.value, row.id, { auditDetails: auditMessage('auditDeleted', entityKey, row.name || row.username || row.code) }); await load(); ElMessage.success(t(section.value === 'users' ? 'systemExtras.userDeleted' : 'systemExtras.recordDeleted')); }
function setMapLocation(latitude, longitude, pan = true) {
  const point = [Number(latitude), Number(longitude)];
  if (!point.every(Number.isFinite)) return;
  form.value.latitude = point[0].toFixed(6); form.value.longitude = point[1].toFixed(6);
  if (!mapInstance) return;
  if (!locationMarker) {
    locationMarker = L.marker(point, { draggable: true }).addTo(mapInstance);
    locationMarker.on('dragend', () => { const position = locationMarker.getLatLng(); setMapLocation(position.lat, position.lng, false); });
  } else locationMarker.setLatLng(point);
  if (pan) mapInstance.setView(point, Math.max(mapInstance.getZoom(), 14));
}
function initializeLocationMap() {
  if (!locationMap.value) return;
  const latitude = Number(form.value.latitude), longitude = Number(form.value.longitude);
  const hasCoordinates = form.value.latitude !== '' && form.value.longitude !== '' && Number.isFinite(latitude) && Number.isFinite(longitude);
  const start = hasCoordinates ? [latitude, longitude] : [33.3152, 44.3661];
  if (!mapInstance) {
    mapInstance = L.map(locationMap.value, { scrollWheelZoom: false }).setView(start, hasCoordinates ? 14 : 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapInstance);
    mapInstance.on('click', (event) => setMapLocation(event.latlng.lat, event.latlng.lng, false));
  }
  setTimeout(() => { mapInstance?.invalidateSize(); if (form.value.latitude && form.value.longitude) setMapLocation(form.value.latitude, form.value.longitude, false); }, 0);
}
function locateCurrentPosition() { if (!navigator.geolocation) { ElMessage.warning(t('systemExtras.locationFailed')); return; } navigator.geolocation.getCurrentPosition(({ coords }) => setMapLocation(coords.latitude, coords.longitude), () => ElMessage.warning(t('systemExtras.locationFailed'))); }
onMounted(async () => { await loadReferences(); await load(); });
onBeforeUnmount(() => { mapInstance?.remove(); mapInstance = undefined; });
</script>
