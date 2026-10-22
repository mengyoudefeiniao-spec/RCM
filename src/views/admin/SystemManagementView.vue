<template>
  <section class="mx-auto max-w-[1720px] p-3 sm:p-5">
    <div class="rounded-xl border border-[#D9E5DB] bg-white p-3 shadow-sm sm:p-5">
      <el-tabs v-model="section" @tab-change="changeSection">
        <el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key" :label="t('system.' + tab.label)" />
      </el-tabs>
      <div v-if="section !== 'audit-logs'" class="mb-4 grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <el-input v-model="keyword" :placeholder="searchPlaceholder" clearable class="w-full" @keyup.enter="runSearch" />
        <el-button type="primary" @click="runSearch">{{ t('systemExtras.query') }}</el-button>
        <el-button @click="resetSearch">{{ t('common.reset') }}</el-button>
        <el-button v-if="section !== 'permissions'" type="success" class="md:ms-4" @click="openCreate"><el-icon><Plus /></el-icon>{{ t('system.add') }}</el-button>
      </div>
      <div v-else class="mb-4 grid grid-cols-1 items-center gap-2 sm:grid-cols-2 xl:grid-cols-12">
        <el-input v-model="auditFilters.actor" :placeholder="t('system.auditActor')" clearable class="xl:col-span-2" @keyup.enter="load" />
        <el-date-picker v-model="auditFilters.range" type="datetimerange" value-format="YYYY-MM-DDTHH:mm:ss" :start-placeholder="t('system.auditFrom')" :end-placeholder="t('system.auditTo')" class="!w-full xl:col-span-4" />
        <el-select v-model="auditFilters.type" clearable :placeholder="t('system.auditType')" class="xl:col-span-2"><el-option v-for="type in auditTypes" :key="type" :value="type" :label="auditTypeLabel(type)" /></el-select>
        <el-input v-model="auditFilters.businessNo" :placeholder="t('system.auditBusinessNo')" clearable class="xl:col-span-2" @keyup.enter="load" />
        <div class="flex flex-wrap gap-2 xl:col-span-2"><el-button type="primary" @click="load">{{ t('system.auditSearch') }}</el-button><el-button @click="resetAuditFilters">{{ t('common.reset') }}</el-button><el-button type="success" @click="exportAuditLogs">{{ t('system.auditExport') }}</el-button></div>
      </div>
      <div v-if="section === 'audit-logs'" class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F3F8F4] px-3 py-2 text-xs text-[#52675A]">
        <span>{{ t('system.auditRetention') }}</span><span>{{ t('system.auditAppendOnly') }}</span>
      </div>
      <el-table :data="pagedRows" stripe v-loading="loading" class="w-full">
        <el-table-column v-for="column in columns" :key="column.key" :prop="column.key" :label="columnLabel(column)" :min-width="column.width || 145">
          <template v-if="column.key === 'status'" #default="{ row }"><el-tag :type="row.status === 'disabled' ? 'info' : 'success'">{{ row.status === 'disabled' ? t('system.disabled') : t('system.active') }}</el-tag></template>
          <template v-else-if="column.key === 'roleId'" #default="{ row }">{{ roleLabel(row) }}</template>
          <template v-else-if="column.key === 'name' && section === 'roles'" #default="{ row }">{{ localizedRoleName(row) }}</template>
          <template v-else-if="column.key === 'description' && section === 'roles'" #default="{ row }">{{ localizedRoleDescription(row) }}</template>
          <template v-else-if="column.key === 'province'" #default="{ row }">{{ provinceLabel(row.province) }}</template>
          <template v-else-if="column.key === 'organization'" #default="{ row }">{{ localizedCenterName(row.organization) }}</template>
          <template v-else-if="column.key === 'name' && section === 'organizations'" #default="{ row }">{{ localizedCenterName(row.name) }}</template>
          <template v-else-if="column.key === 'permissionCodes'" #default="{ row }"><div class="flex flex-wrap gap-1"><el-tag v-for="code in row.permissionCodes || []" :key="code" size="small">{{ permissionLabel(code) }}</el-tag><span v-if="!row.permissionCodes?.length" class="text-xs text-[#89978E]">{{ t('systemExtras.noPermissions') }}</span></div></template>
          <template v-else-if="column.key === 'reviewScope'" #default="{ row }"><span class="text-xs leading-5">{{ reviewScopeSummary(row) }}</span></template>
          <template v-else-if="column.key === 'moduleKey'" #default="{ row }">{{ t('systemExtras.' + row.moduleKey) }}</template>
          <template v-else-if="column.key === 'featureKey'" #default="{ row }">{{ row.entityKind ? permissionItemLabel(row) : t('systemExtras.' + row.featureKey) }}</template>
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
      <div v-if="showPagination" class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span class="text-xs text-[#718077]">{{ t('system.paginationSummary', { total: filteredRows.length }) }}</span>
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="filteredRows.length" background layout="prev, pager, next, sizes" />
      </div>
    </div>

    <el-dialog v-model="dialog" :title="editing ? t('system.edit') : t('system.add')" width="min(680px, 95vw)">
      <el-form :model="form" label-position="top" class="max-h-[68vh] overflow-y-auto px-1">
        <template v-if="section === 'users'">
          <el-form-item :label="t('system.username')"><el-input v-model="form.username" /></el-form-item>
          <el-form-item :label="t('system.name')"><el-input v-model="form.name" /></el-form-item>
          <el-form-item :label="t('system.email')"><el-input v-model="form.email" /></el-form-item>
          <el-form-item :label="t('system.role')"><el-select v-model="form.roleId" class="w-full"><el-option v-for="role in roleRows" :key="role.id" :value="role.id" :label="localizedRoleName(role) + ' (' + role.code + ')'" /></el-select></el-form-item>
          <el-form-item :label="t('system.rationCenter')"><el-select v-model="form.organization" class="w-full" filterable><el-option v-for="center in centerRows" :key="center.id" :value="center.name" :label="rationCenterOptionLabel(center)" /></el-select></el-form-item>
        </template>
        <template v-else-if="section === 'roles'">
          <el-form-item :label="t('system.name')"><el-input v-model="formRoleName" /></el-form-item>
          <el-form-item :label="t('system.code')"><el-input v-model="form.code" /></el-form-item>
          <el-form-item :label="t('system.description')"><el-input v-model="formRoleDescription" type="textarea" /></el-form-item>
          <el-form-item :label="t('systemExtras.rolePermissions')">
            <div class="w-full space-y-3 rounded-lg border border-[#E3ECE5] p-3">
              <div v-for="module in permissionTree" :key="module.moduleKey" class="space-y-1.5">
                <div class="text-sm font-semibold text-[#1F3326]">{{ t('systemExtras.' + module.moduleKey) }}</div>
                <div class="flex flex-wrap items-start gap-2 ps-3">
                <div v-for="feature in module.features" :key="feature.code" :class="feature.children.length || isWarehouseScopedPermission(feature.code) ? 'w-full' : 'rounded-md border border-[#E8EDEA] px-3 py-1.5'">
                  <template v-if="isWarehouseScopedPermission(feature.code)">
                    <el-checkbox
                      :model-value="(form.permissionCodes || []).includes(feature.code)"
                      @change="(checked) => toggleWarehousePermission(feature.code, checked)"
                    >{{ t('systemExtras.' + feature.featureKey) }} <el-tag size="small" type="warning">PRO</el-tag></el-checkbox>
                    <div v-if="(form.permissionCodes || []).includes(feature.code)" class="mt-1 border-s-2 border-[#D9E5DB] ps-5">
                      <div class="mb-1 text-xs text-[#75837A]">{{ t('systemExtras.reviewScopeRegions') }}</div>
                      <el-checkbox-group
                        :model-value="regionsForPermission(feature.code)"
                        class="flex flex-wrap gap-x-4 gap-y-1"
                        @change="(regions) => setPermissionRegions(feature.code, regions)"
                      >
                        <el-checkbox v-for="region in reviewRegionOptions" :key="region.value" :value="region.value">{{ t('systemExtras.' + region.labelKey) }}</el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </template>
                  <!-- 二级功能：无子级为可勾选权限项 -->
                  <el-checkbox
                    v-else-if="!feature.children.length"
                    :model-value="(form.permissionCodes || []).includes(feature.code)"
                    @change="(checked) => togglePermission(feature.code, checked)"
                  >
                    {{ t('systemExtras.' + feature.featureKey) }}
                  </el-checkbox>
                  <!-- 审核权限按当前角色直接展开为：审核事项 → 授权区域 -->
                  <template v-else-if="module.moduleKey === 'moduleReview' && feature.code === 'review.process'">
                    <div class="space-y-2 ps-3">
                      <div v-for="type in feature.children" :key="type.code" class="rounded-md border border-[#E8EDEA] px-3 py-2">
                        <el-checkbox
                          :model-value="(form.permissionCodes || []).includes(type.code)"
                          @change="(checked) => toggleReviewType(type.code, checked)"
                        >{{ t('systemExtras.' + type.featureKey) }}</el-checkbox>
                        <div v-if="(form.permissionCodes || []).includes(type.code)" class="mt-1 border-s-2 border-[#D9E5DB] ps-5">
                          <div class="mb-1 text-xs text-[#75837A]">{{ t('systemExtras.reviewScopeRegions') }}</div>
                          <el-checkbox-group
                            :model-value="reviewRegionsFor(type.code)"
                            class="flex flex-wrap gap-x-4 gap-y-1"
                            @change="(regions) => setReviewRegions(type.code, regions)"
                          >
                            <el-checkbox v-for="region in reviewRegionOptions" :key="region.value" :value="region.value">{{ t('systemExtras.' + region.labelKey) }}</el-checkbox>
                          </el-checkbox-group>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- 消息权限按接收范围（区域、代理、站点）嵌套消息对象（公民、代理、Web、全部用户） -->
                  <template v-else-if="module.moduleKey === 'moduleMessages' && feature.children.length">
                    <el-checkbox
                      :model-value="isFeatureFullyChecked(feature)"
                      :indeterminate="isFeatureIndeterminate(feature)"
                      @change="(checked) => toggleFeature(feature, checked)"
                    >{{ t('systemExtras.' + feature.featureKey) }}</el-checkbox>
                    <div class="space-y-1 ps-6">
                      <div v-for="scope in feature.children" :key="scope.code" class="rounded-md border border-[#E8EDEA] px-3 py-2">
                        <el-checkbox
                          v-if="scope.children.length"
                          :model-value="isPermissionNodeFullyChecked(scope)"
                          :indeterminate="isPermissionNodeIndeterminate(scope)"
                          @change="(checked) => togglePermissionNode(scope, checked)"
                        >{{ permissionItemLabel(scope) }}</el-checkbox>
                        <el-checkbox
                          v-else
                          :model-value="(form.permissionCodes || []).includes(scope.code)"
                          @change="(checked) => togglePermission(scope.code, checked)"
                        >{{ t('systemExtras.' + scope.featureKey) }}</el-checkbox>
                        <div v-if="scope.children.length" class="mt-1 flex flex-wrap gap-x-4 gap-y-1 border-s-2 border-[#D9E5DB] ps-5">
                          <el-checkbox
                            v-for="target in scope.children"
                            :key="target.code"
                            :model-value="(form.permissionCodes || []).includes(target.code)"
                            @change="(checked) => togglePermission(target.code, checked)"
                          >{{ permissionItemLabel(target) }}</el-checkbox>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- 其他二级功能：有子级时作为分组开关 -->
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
            </div>
          </el-form-item>
        </template>
        <template v-else-if="section === 'organizations'">
          <el-form-item :label="t('system.name')"><el-input v-model="form.name" /></el-form-item>
          <el-form-item :label="t('system.code')"><el-input v-model="form.code" /></el-form-item>
          <el-form-item :label="t('system.province')"><el-select v-model="form.province" class="w-full" clearable><el-option v-for="province in provinceOptions" :key="province.code" :value="province.code" :label="t('systemExtras.' + province.labelKey)" /></el-select></el-form-item>
          <el-form-item :label="t('systemExtras.address')"><div class="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2"><el-input v-model="form.address"/><el-button @click="locationDialog = true">{{ t('systemExtras.locate') }}</el-button></div></el-form-item>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><el-form-item :label="t('systemExtras.latitude')"><el-input v-model="form.latitude" /></el-form-item><el-form-item :label="t('systemExtras.longitude')"><el-input v-model="form.longitude" /></el-form-item></div>
          <el-form-item :label="t('systemExtras.contact')"><el-input v-model="form.contact" /></el-form-item>
          <el-form-item :label="t('systemExtras.phone')"><el-input v-model="form.phone" /></el-form-item>
        </template>
      </el-form>
      <template #footer><el-button @click="dialog = false">{{ t('system.cancel') }}</el-button><el-button type="primary" @click="save">{{ t('system.save') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="locationDialog" :title="t('systemExtras.locate')" width="min(720px, 96vw)" @opened="initializeLocationMap">
      <el-form label-position="top"><el-form-item :label="t('systemExtras.address')"><el-input v-model="form.address" /></el-form-item><el-form-item :label="t('system.province')"><el-select v-model="form.province" class="w-full"><el-option v-for="province in provinceOptions" :key="province.code" :value="province.code" :label="t('systemExtras.' + province.labelKey)" /></el-select></el-form-item><p class="mb-3 text-xs text-[#718077]">{{ t('system.mapProvinceHint') }}</p><div class="grid grid-cols-2 gap-3"><el-form-item :label="t('systemExtras.latitude')"><el-input v-model="form.latitude" /></el-form-item><el-form-item :label="t('systemExtras.longitude')"><el-input v-model="form.longitude" /></el-form-item></div></el-form>
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
import { deleteSystemRecord, getMessageRecipientTree, getSystemRecords, logAuditExport, saveSystemRecord } from '../../api/adminCenter.js';
import {
  PERMISSION_CATALOG,
  buildPermissionTree,
  resolveEffectiveCodes,
  REVIEW_TYPE_CODES,
  REVIEW_SCOPE_REGIONS,
  WAREHOUSE_PERMISSION_CODES,
  summarizeReviewScope
} from '../../utils/reviewPermission.js';
import { buildMessagePermissionEntries } from '../../utils/messagePermissions.js';
const { t } = useI18n();
const tabs = [{ key: 'users', label: 'adminAccounts' }, { key: 'roles', label: 'roles' }, { key: 'organizations', label: 'rationCenters' }, { key: 'audit-logs', label: 'logs' }];
const section = ref('users'), rows = ref([]), roleRows = ref([]), centerRows = ref([]), permissionRows = ref([]), loading = ref(false), keyword = ref(''), appliedQuery = ref(''), dialog = ref(false), locationDialog = ref(false), editing = ref(false), form = ref({});
const currentPage = ref(1), pageSize = ref(10);
const roleNameEdited = ref(false), roleDescriptionEdited = ref(false);
const auditFilters = ref({ actor: '', range: null, type: '', businessNo: '' });
const auditTypes = ['login', 'application', 'review', 'status_change', 'payment', 'configuration', 'data_export'];
const locationMap = ref(null);
let mapInstance, locationMarker;
const provinceOptions = [
  { code: 'baghdad', labelKey: 'regionBaghdad', point: [33.3152, 44.3661] },
  { code: 'basra', labelKey: 'regionBasra', point: [30.5085, 47.7804] },
  { code: 'nineveh', labelKey: 'regionNineveh', point: [36.34, 43.13] },
  { code: 'diyala', labelKey: 'regionDiyala', point: [33.75, 44.64] },
  { code: 'kirkuk', labelKey: 'regionKirkuk', point: [35.47, 44.39] },
  { code: 'anbar', labelKey: 'regionAnbar', point: [33.42, 43.3] },
  { code: 'erbil', labelKey: 'regionErbil', point: [36.19, 44.01] },
  { code: 'sulaymaniyah', labelKey: 'regionSulaymaniyah', point: [35.56, 45.44] },
  { code: 'dhiQar', labelKey: 'regionDhiQar', point: [31.05, 46.26] },
  { code: 'babil', labelKey: 'regionBabil', point: [32.48, 44.43] },
  { code: 'wasit', labelKey: 'regionWasit', point: [32.5, 45.82] },
  { code: 'karbala', labelKey: 'regionKarbala', point: [32.61, 44.02] },
  { code: 'najaf', labelKey: 'regionNajaf', point: [32, 44.33] },
  { code: 'qadisiyyah', labelKey: 'regionQadisiyyah', point: [31.99, 44.93] },
  { code: 'maysan', labelKey: 'regionMaysan', point: [31.84, 47.14] },
  { code: 'muthanna', labelKey: 'regionMuthanna', point: [31.31, 45.28] },
  { code: 'salahAlDin', labelKey: 'regionSalahAlDin', point: [34.61, 43.68] },
  { code: 'duhok', labelKey: 'regionDuhok', point: [36.87, 43] },
  { code: 'halabja', labelKey: 'regionHalabja', point: [35.18, 45.99] }
];
const actor = () => JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}').name || 'System Administrator';
const catalog = PERMISSION_CATALOG.map((item) => ({ id: 'perm-' + item.code, moduleKey: item.moduleKey, code: item.code, featureKey: item.featureKey, parentCode: item.parentCode || '' }));
const messageRecipientTree = ref([]);
const legacyMessagePermission = (code) => /^messages\.(send|review)\.(region|agent|site|cardAppUser)\./.test(code) || /^messages\.(send|review)\.everyone$/.test(code);
const permissionCatalog = computed(() => {
  const base = (permissionRows.value.length ? permissionRows.value : catalog).filter((item) => !legacyMessagePermission(item.code));
  const dynamic = buildMessagePermissionEntries(messageRecipientTree.value).map((item) => ({ ...item, id: 'perm-' + item.code }));
  const dynamicCodes = new Set(dynamic.map((item) => item.code));
  return [...base.filter((item) => !dynamicCodes.has(item.code)), ...dynamic];
});
const bySection = {
  users: [['username','username'],['name','name'],['email','email'],['roleId','role'],['organization','organization'],['status','status']],
  roles: [['name','name'],['code','code'],['reviewScope','reviewPermission'],['permissionCodes','assignedPermissions'],['description','description']],
  permissions: [['moduleKey','permissionModule'],['featureKey','permissionFeature'],['code','code']],
  organizations: [['name','name'],['code','code'],['province','province'],['address','address'],['contact','contact'],['phone','phone']],
  'audit-logs': [['actor','auditActor'],['time','time'],['terminal','auditTerminal'],['ip','auditIp'],['type','auditType'],['businessNo','auditBusinessNo'],['object','auditObject'],['details','auditDetails'],['before','auditBefore'],['after','auditAfter']]
};
const columns = computed(() => bySection[section.value].map(([key,label]) => ({ key,label, width: key === 'permissionCodes' || key === 'details' ? 260 : undefined })));
const showPagination = computed(() => ['users', 'roles', 'organizations', 'audit-logs'].includes(section.value));
const searchPlaceholder = computed(() => section.value === 'users' ? t('system.adminAccountKeyword') : section.value === 'roles' ? t('system.roleKeyword') : section.value === 'organizations' ? t('system.centerKeyword') : t('systemExtras.keyword'));
const pagedRows = computed(() => {
  if (!showPagination.value) return filteredRows.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});
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
  return rows.value.filter((row) => {
    if (!appliedQuery.value) return true;
    const extra = section.value === 'organizations' ? [provinceLabel(row.province), localizedCenterName(row.name)] : section.value === 'users' ? [roleLabel(row), localizedCenterName(row.organization)] : section.value === 'roles' ? [localizedRoleName(row), localizedRoleDescription(row)] : [];
    return [...Object.values(row), ...extra].some((value) => String(JSON.stringify(value) ?? value ?? '').toLowerCase().includes(appliedQuery.value.toLowerCase()));
  });
});
const permissionTree = computed(() => buildPermissionTree(permissionCatalog.value));
const reviewRegionOptions = computed(() => REVIEW_SCOPE_REGIONS);
function emptyReviewScope() { return { types: [], regionsByType: {} }; }
function normalizeReviewScope(scope = {}, permissionCodes = [], roleCode = '') {
  const types = Array.isArray(scope.types)
    ? scope.types.filter((type) => REVIEW_TYPE_CODES.includes(type))
    : permissionCodes.filter((type) => REVIEW_TYPE_CODES.includes(type));
  const legacyRegions = Array.isArray(scope.regions) ? scope.regions : [];
  const regionsByType = scope.regionsByType && typeof scope.regionsByType === 'object'
    ? { ...scope.regionsByType }
    : Object.fromEntries(types.map((type) => [type, legacyRegions.length ? legacyRegions : roleCode === 'admin' ? reviewRegionOptions.value.map((region) => region.value) : []]));
  return { types, regionsByType };
}
function reviewRegionsFor(type) { return form.value.reviewScope?.regionsByType?.[type] || []; }
function regionsForPermission(code) { return form.value.reviewScope?.regionsByType?.[code] || []; }
function setReviewRegions(type, regions) {
  const scope = normalizeReviewScope(form.value.reviewScope);
  scope.regionsByType[type] = [...regions];
  form.value.reviewScope = scope;
}
function setPermissionRegions(code, regions) {
  const scope = normalizeReviewScope(form.value.reviewScope);
  scope.regionsByType[code] = [...regions];
  form.value.reviewScope = scope;
}
function isWarehouseScopedPermission(code) { return WAREHOUSE_PERMISSION_CODES.includes(code); }
function toggleWarehousePermission(code, checked) {
  togglePermission(code, checked);
  const scope = normalizeReviewScope(form.value.reviewScope);
  if (!checked) delete scope.regionsByType[code];
  form.value.reviewScope = scope;
}
function toggleReviewType(type, checked) {
  const codes = new Set(form.value.permissionCodes || []);
  const scope = normalizeReviewScope(form.value.reviewScope);
  const types = new Set(scope.types);
  if (checked) { codes.add(type); types.add(type); }
  else { codes.delete(type); types.delete(type); delete scope.regionsByType[type]; }
  form.value.permissionCodes = [...codes];
  form.value.reviewScope = { ...scope, types: [...types] };
}
function togglePermission(code, checked) {
  const codes = new Set(form.value.permissionCodes || []);
  if (checked) codes.add(code); else codes.delete(code);
  form.value.permissionCodes = [...codes];
}
function permissionLeafCodes(node) {
  if (!node.children?.length) return [node.code];
  return node.children.flatMap(permissionLeafCodes);
}
function isPermissionNodeFullyChecked(node) {
  const codes = form.value.permissionCodes || [];
  const leaves = permissionLeafCodes(node);
  return leaves.length > 0 && leaves.every((code) => codes.includes(code));
}
function isPermissionNodeIndeterminate(node) {
  const codes = form.value.permissionCodes || [];
  const leaves = permissionLeafCodes(node);
  const checkedCount = leaves.filter((code) => codes.includes(code)).length;
  return checkedCount > 0 && checkedCount < leaves.length;
}
function togglePermissionNode(node, checked) {
  const codes = new Set(form.value.permissionCodes || []);
  permissionLeafCodes(node).forEach((code) => { if (checked) codes.add(code); else codes.delete(code); });
  form.value.permissionCodes = [...codes];
}
function isFeatureFullyChecked(feature) {
  return isPermissionNodeFullyChecked(feature);
}
function isFeatureIndeterminate(feature) {
  return isPermissionNodeIndeterminate(feature);
}
function toggleFeature(feature, checked) {
  const codes = new Set(form.value.permissionCodes || []);
  permissionLeafCodes(feature).forEach((code) => { if (checked) codes.add(code); else codes.delete(code); });
  form.value.permissionCodes = [...codes];
}
function reviewScopeSummary(row) {
  const summary = summarizeReviewScope(normalizeReviewScope(row.reviewScope || {}, resolveEffectiveCodes(row.permissionCodes || []), row.code));
  if (!summary.typeCount) return t('systemExtras.reviewScopeNone');
  const typeText = t('systemExtras.reviewTypesShort', { count: summary.typeCount });
  return `${typeText} · ${t('systemExtras.reviewRegionCount', { count: summary.regionCount })}`;
}
function columnLabel(column) {
  if (column.key === 'organization') return t('system.rationCenter');
  if (column.key === 'province') return t('system.province');
  return column.key === 'permissionCodes' || column.key === 'reviewScope' || column.key === 'details' || column.key === 'ip' || column.key === 'moduleKey' || column.key === 'featureKey' || column.key === 'address' || column.key === 'contact' || column.key === 'phone' ? t('systemExtras.' + column.label) : t('system.' + column.label);
}
function entityLetter(index = 0) { let value = Math.max(0, Number(index) || 0), result = ''; do { result = String.fromCharCode(65 + (value % 26)) + result; value = Math.floor(value / 26) - 1; } while (value >= 0); return result; }
function permissionItemLabel(item) {
  if (item.entityKind === 'agent') return `${t('systemExtras.messageAgentEntry', { letter: entityLetter(item.displayIndex) })} · ${item.entityId}`;
  if (item.entityKind === 'site') return `${t('systemExtras.messageSiteEntry', { letter: entityLetter(item.displayIndex) })} · ${item.entityId}`;
  return t('systemExtras.' + item.featureKey);
}
function permissionLabel(code) { const item = permissionCatalog.value.find((permission) => permission.code === code); return item ? t('systemExtras.' + item.moduleKey) + ' · ' + permissionItemLabel(item) : code; }
function localizedRoleName(role) {
  const key = ({ admin: 'adminRole', operator: 'operatorRole', auditor: 'auditorRole' })[role?.code];
  return key ? t('system.' + key) : role?.name || role?.code || '—';
}
function localizedRoleDescription(role) {
  const key = ({ admin: 'adminRoleDescription', operator: 'operatorRoleDescription', auditor: 'auditorRoleDescription' })[role?.code];
  if (!key) return role?.description || '—';
  const defaults = {
    admin: ['Manage system settings and access', '管理系统设置和访问权限'],
    operator: ['Manage daily operations', '办理日常业务', '办理日常运营'],
    auditor: ['Read audit records', '查看审计记录', '审查系统审计记录']
  };
  return defaults[role.code].includes(role.description) ? t('system.' + key) : role.description || t('system.' + key);
}
const formRoleName = computed({
  get: () => editing.value && !roleNameEdited.value ? localizedRoleName(form.value) : (form.value.name || ''),
  set: (value) => { roleNameEdited.value = true; form.value.name = value; }
});
const formRoleDescription = computed({
  get: () => editing.value && !roleDescriptionEdited.value ? localizedRoleDescription(form.value) : (form.value.description || ''),
  set: (value) => { roleDescriptionEdited.value = true; form.value.description = value; }
});
function roleLabel(user) { const role = roleRows.value.find((item) => item.id === user.roleId || item.code === user.role); return role ? localizedRoleName(role) : user.role || '—'; }
const provinceAliases = {
  baghdad: ['baghdad', 'baghdad province', 'بغداد', 'بغداد省', '巴格达', '巴格达省'],
  basra: ['basra', 'basrah', 'البصرة', 'بەسرە', '巴士拉', '巴士拉省'],
  nineveh: ['nineveh', 'ninawa', 'نينوى', 'نەینەوا', '尼尼微', '尼尼微省'],
  diyala: ['diyala', 'ديالى', 'دیالە', '迪亚拉', '迪亚拉省'],
  kirkuk: ['kirkuk', 'كركوك', 'کەرکووک', '基尔库克', '基尔库克省'],
  anbar: ['anbar', 'الأنبار', 'ئەنبار', '安巴尔', '安巴尔省'],
  erbil: ['erbil', 'arbīl', 'أربيل', 'هەولێر', '埃尔比勒', '埃尔比勒省'],
  sulaymaniyah: ['sulaymaniyah', 'السليمانية', 'سلێمانی', '苏莱曼尼亚', '苏莱曼尼亚省'],
  dhiQar: ['dhi qar', 'thi qar', 'ذي قار', 'زیقار', '济加尔', '济加尔省'],
  babil: ['babil', 'babylon', 'بابل', 'بابِل', '巴比伦', '巴比伦省'],
  wasit: ['wasit', 'واسط', 'واست', '瓦西特', '瓦西特省'],
  karbala: ['karbala', 'كربلاء', 'کەربەلا', '卡尔巴拉', '卡尔巴拉省'],
  najaf: ['najaf', 'النجف', 'نەجەف', '纳杰夫', '纳杰夫省'],
  qadisiyyah: ['qadisiyyah', 'al-qadisiyyah', 'القادسية', 'قادسیە', '卡迪西亚', '卡迪西亚省'],
  maysan: ['maysan', 'ميسان', 'مەیسان', '迈桑', '迈桑省'],
  muthanna: ['muthanna', 'al-muthanna', 'المثنى', 'موسەننا', '穆萨纳', '穆萨纳省'],
  salahAlDin: ['salah al-din', 'saladin', 'صلاح الدين', 'سەلاحەدین', '萨拉赫丁', '萨拉赫丁省'],
  duhok: ['duhok', 'دهوك', 'دهۆک', '杜胡克', '杜胡克省'],
  halabja: ['halabja', 'حلبجة', 'هەڵەبجە', '哈莱卜杰', '哈莱卜杰省']
};
function provinceLabel(value) {
  if (!value) return '—';
  const normalized = String(value).trim().toLowerCase();
  const province = provinceOptions.find((option) => option.code.toLowerCase() === normalized || provinceAliases[option.code].some((alias) => alias.toLowerCase() === normalized));
  return province ? t('systemExtras.' + province.labelKey) : value;
}
function rationCenterOptionLabel(center) {
  const centerName = localizedCenterName(center.name);
  return center.province ? `${centerName} · ${provinceLabel(center.province)}` : centerName;
}
function localizedCenterName(name) {
  if (name === 'Baghdad Karkh Ration Center') return t('system.demoBaghdadCenter');
  if (name === 'Basra Central Ration Center') return t('system.demoBasraCenter');
  return name || '—';
}
function formatTime(value) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
async function load() { loading.value = true; currentPage.value = 1; try { rows.value = section.value === 'permissions' ? permissionCatalog.value : await getSystemRecords(section.value, section.value === 'audit-logs' ? { actor: auditFilters.value.actor || undefined, type: auditFilters.value.type || undefined, businessNo: auditFilters.value.businessNo || undefined, from: auditFilters.value.range?.[0], to: auditFilters.value.range?.[1] } : undefined); } finally { loading.value = false; } }
async function loadReferences() { [roleRows.value, permissionRows.value, centerRows.value, messageRecipientTree.value] = await Promise.all([getSystemRecords('roles'), getSystemRecords('permissions'), getSystemRecords('organizations'), getMessageRecipientTree().catch(() => [])]); if (!permissionRows.value.length) permissionRows.value = catalog; if (!roleRows.value.length) roleRows.value = [{ id: 'role-admin', code: 'admin', name: t('system.adminRole'), permissionCodes: catalog.map((p) => p.code), reviewScope: { types: [...REVIEW_TYPE_CODES], regionsByType: {} } }]; }
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
function runSearch() { appliedQuery.value = keyword.value.trim(); currentPage.value = 1; }
function resetSearch() { keyword.value = ''; appliedQuery.value = ''; currentPage.value = 1; }
function openCreate() { editing.value = false; roleNameEdited.value = true; roleDescriptionEdited.value = true; form.value = section.value === 'roles' ? { permissionCodes: [], reviewScope: emptyReviewScope() } : section.value === 'users' ? { status: 'active' } : section.value === 'organizations' ? { province: '', latitude: '', longitude: '' } : {}; dialog.value = true; }
function openEdit(row) { editing.value = true; roleNameEdited.value = false; roleDescriptionEdited.value = false; const permissionCodes = resolveEffectiveCodes(row.permissionCodes || [], permissionCatalog.value).filter((code) => !legacyMessagePermission(code)); form.value = { ...row, permissionCodes, reviewScope: normalizeReviewScope(row.reviewScope || {}, permissionCodes, row.code) }; dialog.value = true; }
function auditMessage(key, entityKey, name, extra = {}) { return t('systemExtras.' + key, { actor: actor(), entity: t('systemExtras.' + entityKey), name, ...extra }); }
async function save() {
  const name = form.value.name || form.value.username || form.value.code;
  if (!name) return;
  const oldName = rows.value.find((row) => row.id === form.value.id)?.name;
  const value = { ...form.value, status: form.value.status || 'active' };
  if (section.value === 'users') { const role = roleRows.value.find((item) => item.id === value.roleId); value.role = role?.code || value.role; value.permissionCodes = role?.permissionCodes || []; value.reviewScope = role?.reviewScope || null; }
  const entityKey = section.value === 'users' ? 'entityUser' : section.value === 'roles' ? 'entityRole' : section.value === 'permissions' ? 'entityPermission' : 'entityOrganization';
  const isRename = editing.value && oldName && oldName !== value.name;
  value.auditDetails = isRename ? auditMessage('auditRenamed', entityKey, value.name, { oldName, newName: value.name }) : auditMessage(editing.value ? 'auditUpdated' : 'auditCreated', entityKey, name);
  value.auditType = 'configuration';
  await saveSystemRecord(section.value, value); dialog.value = false; await load();
  const successKey = section.value === 'users' ? (editing.value ? 'userUpdated' : 'userCreated') : section.value === 'roles' ? (editing.value ? 'roleUpdated' : 'roleCreated') : section.value === 'permissions' ? 'permissionCreated' : (editing.value ? 'rationCenterUpdated' : 'rationCenterCreated');
  ElMessage.success(t('system.' + successKey));
}
async function toggleUser(row) { const enabling = row.status === 'disabled', nextStatus = enabling ? 'active' : 'disabled'; const details = auditMessage(enabling ? 'auditEnabled' : 'auditDisabled', 'entityUser', row.name || row.username); await saveSystemRecord('users', { ...row, status: nextStatus, auditDetails: details, auditType: 'status_change' }); await load(); ElMessage.success(t('systemExtras.statusUpdated')); }
async function removeRecord(row) { try { await ElMessageBox.confirm(t('systemExtras.confirmDelete'), t('systemExtras.delete'), { type: 'warning' }); } catch { return; } const entityKey = section.value === 'users' ? 'entityUser' : section.value === 'roles' ? 'entityRole' : 'entityOrganization'; await deleteSystemRecord(section.value, row.id, { auditDetails: auditMessage('auditDeleted', entityKey, row.name || row.username || row.code) }); await load(); ElMessage.success(t(section.value === 'users' ? 'systemExtras.userDeleted' : 'systemExtras.recordDeleted')); }
function setMapLocation(latitude, longitude, pan = true) {
  const point = [Number(latitude), Number(longitude)];
  if (!point.every(Number.isFinite)) return;
  form.value.latitude = point[0].toFixed(6); form.value.longitude = point[1].toFixed(6);
  form.value.province = nearestProvince(point[0], point[1]);
  if (!mapInstance) return;
  if (!locationMarker) {
    locationMarker = L.marker(point, { draggable: true }).addTo(mapInstance);
    locationMarker.on('dragend', () => { const position = locationMarker.getLatLng(); setMapLocation(position.lat, position.lng, false); });
  } else locationMarker.setLatLng(point);
  if (pan) mapInstance.setView(point, Math.max(mapInstance.getZoom(), 14));
}
function nearestProvince(latitude, longitude) {
  const radians = (degrees) => degrees * Math.PI / 180;
  let nearest = null;
  for (const province of provinceOptions) {
    const [targetLat, targetLng] = province.point;
    const dLat = radians(targetLat - latitude), dLng = radians(targetLng - longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(latitude)) * Math.cos(radians(targetLat)) * Math.sin(dLng / 2) ** 2;
    const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (!nearest || distance < nearest.distance) nearest = { code: province.code, distance };
  }
  return nearest && nearest.distance <= 250 ? nearest.code : '';
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
