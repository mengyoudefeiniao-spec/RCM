<template>
  <section class="system-management mx-auto max-w-[1720px] space-y-4 p-3 sm:p-5">
    <div class="system-card system-workspace">
      <el-tabs v-model="section" class="system-tabs" @tab-change="changeSection">
        <el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key">
          <template #label><span class="system-tab-label"><el-icon><component :is="tab.icon" /></el-icon>{{ t('system.' + tab.label) }}<span v-if="tabCount(tab.key) !== null" class="system-tab-count">{{ tabCount(tab.key) }}</span></span></template>
        </el-tab-pane>
      </el-tabs>
      <div class="system-list-heading">
        <div class="system-filter-actions"><el-button :loading="loading" @click="refreshAll"><el-icon><Refresh /></el-icon>{{ t('common.refresh') }}</el-button><el-button v-if="section === 'audit-logs'" type="primary" plain @click="exportAuditLogs"><el-icon><Download /></el-icon>{{ t('system.auditExport') }}</el-button><el-button v-else-if="section !== 'permissions'" type="primary" @click="openCreate"><el-icon><Plus /></el-icon>{{ dialogCreateTitle }}</el-button></div>
      </div>
      <div v-if="section !== 'audit-logs'" class="system-filters system-search-filters">
        <label class="system-filter-field"><span>{{ t('systemUi.keyword') }}</span><el-input v-model="keyword" :placeholder="searchPlaceholder" clearable @keyup.enter="runSearch"><template #prefix><el-icon><Search /></el-icon></template></el-input></label>
        <label v-if="section === 'users'" class="system-filter-field"><span>{{ t('system.status') }}</span><el-select v-model="statusFilter" clearable :placeholder="t('systemUi.allStatuses')" @change="currentPage = 1"><el-option value="active" :label="t('system.active')" /><el-option value="disabled" :label="t('system.disabled')" /></el-select></label>
        <div class="system-filter-actions"><el-button type="primary" @click="runSearch"><el-icon><Search /></el-icon>{{ t('systemExtras.query') }}</el-button><el-button @click="resetSearch"><el-icon><RefreshRight /></el-icon>{{ t('common.reset') }}</el-button></div>
      </div>
      <div v-else class="system-filters system-audit-filters">
        <label class="system-filter-field"><span>{{ t('system.auditActor') }}</span><el-input v-model="auditFilters.actor" :placeholder="t('system.auditActor')" clearable @keyup.enter="load" /></label>
        <label class="system-filter-field audit-date-filter"><span>{{ t('system.time') }}</span><el-date-picker v-model="auditFilters.range" type="datetimerange" value-format="YYYY-MM-DDTHH:mm:ss" :start-placeholder="t('system.auditFrom')" :end-placeholder="t('system.auditTo')" class="!w-full" /></label>
        <label class="system-filter-field"><span>{{ t('system.auditType') }}</span><el-select v-model="auditFilters.type" clearable :placeholder="t('system.auditType')"><el-option v-for="type in auditTypes" :key="type" :value="type" :label="auditTypeLabel(type)" /></el-select></label>
        <label class="system-filter-field"><span>{{ t('system.auditBusinessNo') }}</span><el-input v-model="auditFilters.businessNo" :placeholder="t('system.auditBusinessNo')" clearable @keyup.enter="load" /></label>
        <div class="system-filter-actions"><el-button type="primary" @click="load"><el-icon><Search /></el-icon>{{ t('system.auditSearch') }}</el-button><el-button @click="resetAuditFilters"><el-icon><RefreshRight /></el-icon>{{ t('common.reset') }}</el-button></div>
      </div>
      <div v-if="section === 'audit-logs'" class="system-audit-note"><span><el-icon><Lock /></el-icon>{{ t('system.auditAppendOnly') }}</span><span>{{ t('system.auditRetention') }}</span></div>
      <el-table :data="pagedRows" border row-key="id" v-loading="loading" class="system-table w-full" :max-height="600">
        <el-table-column v-for="column in columns" :key="column.key" :prop="column.key" :label="columnLabel(column)" :min-width="column.width || 145" :show-overflow-tooltip="!['name', 'permissionCodes', 'status'].includes(column.key)">
          <template v-if="column.key === 'status'" #default="{ row }"><el-tag :type="row.status === 'disabled' ? 'info' : 'success'">{{ row.status === 'disabled' ? t('system.disabled') : t('system.active') }}</el-tag></template>
          <template v-else-if="column.key === 'roleId'" #default="{ row }">{{ roleLabel(row) }}</template>
          <template v-else-if="column.key === 'name' && section === 'roles'" #default="{ row }"><div class="system-identity"><span class="system-row-icon"><el-icon><Key /></el-icon></span><span class="font-semibold">{{ localizedRoleName(row) }}</span></div></template>
          <template v-else-if="column.key === 'name' && section === 'users'" #default="{ row }"><div class="system-identity"><span class="system-avatar">{{ (row.name || row.username || '?').slice(0, 1).toUpperCase() }}</span><span class="font-semibold">{{ row.name }}</span></div></template>
          <template v-else-if="column.key === 'description' && section === 'roles'" #default="{ row }">{{ localizedRoleDescription(row) }}</template>
          <template v-else-if="column.key === 'province'" #default="{ row }">{{ provinceLabel(row.province) }}</template>
          <template v-else-if="column.key === 'organization'" #default="{ row }">{{ localizedCenterName(row.organization) }}</template>
          <template v-else-if="column.key === 'name' && section === 'organizations'" #default="{ row }"><div class="system-identity"><span class="system-row-icon"><el-icon><OfficeBuilding /></el-icon></span><span class="font-semibold">{{ localizedCenterName(row.name) }}</span></div></template>
          <template v-else-if="column.key === 'permissionCodes'" #default="{ row }"><div class="system-permission-summary"><el-tag v-for="code in (row.permissionCodes || []).slice(0, 2)" :key="code" size="small" effect="plain">{{ permissionLabel(code) }}</el-tag><el-popover v-if="row.permissionCodes?.length > 2" placement="top" :width="360" trigger="hover"><div class="system-permission-popover"><el-tag v-for="code in row.permissionCodes" :key="code" size="small" effect="plain">{{ permissionLabel(code) }}</el-tag></div><template #reference><el-tag size="small" type="info" :aria-label="t('systemUi.permissionCount', { count: row.permissionCodes.length })">+{{ row.permissionCodes.length - 2 }}</el-tag></template></el-popover><span v-if="!row.permissionCodes?.length" class="text-xs text-[#89978E]">{{ t('systemExtras.noPermissions') }}</span></div></template>
          <template v-else-if="['username', 'code', 'ip'].includes(column.key)" #default="{ row }"><span class="system-code" dir="ltr">{{ row[column.key] || '—' }}</span></template>
          <template v-else-if="column.key === 'reviewScope'" #default="{ row }"><span class="text-xs leading-5">{{ reviewScopeSummary(row) }}</span></template>
          <template v-else-if="column.key === 'moduleKey'" #default="{ row }">{{ t('systemExtras.' + row.moduleKey) }}</template>
          <template v-else-if="column.key === 'featureKey'" #default="{ row }">{{ row.entityKind ? permissionItemLabel(row) : t('systemExtras.' + row.featureKey) }}</template>
          <template v-else-if="column.key === 'type'" #default="{ row }"><el-tag effect="plain" size="small">{{ auditTypeLabel(row.type) }}</el-tag></template>
          <template v-else-if="column.key === 'terminal'" #default="{ row }">{{ row.terminal || '—' }}</template>
          <template v-else-if="column.key === 'businessNo'" #default="{ row }">{{ row.businessNo || '—' }}</template>
          <template v-else-if="column.key === 'object'" #default="{ row }">{{ row.object || '—' }}</template>
          <template v-else-if="column.key === 'before' || column.key === 'after'" #default="{ row }"><pre class="max-h-28 max-w-[300px] overflow-auto whitespace-pre-wrap break-all text-xs">{{ formatSnapshot(row[column.key]) }}</pre></template>
          <template v-else-if="column.key === 'time'" #default="{ row }">{{ formatTime(row.time || row.timestamp) }}</template>
        </el-table-column>
        <el-table-column v-if="section === 'users'" :label="t('common.actions')" width="245" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-button link type="primary" @click="openEdit(row)"><el-icon><EditPen /></el-icon>{{ t('system.edit') }}</el-button>
              <el-button link :type="row.status === 'disabled' ? 'success' : 'warning'" @click="toggleUser(row)">{{ t(row.status === 'disabled' ? 'systemExtras.enable' : 'systemExtras.disable') }}</el-button>
              <el-button link type="danger" @click="removeRecord(row)">{{ t('systemExtras.delete') }}</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-else-if="section === 'roles' || section === 'organizations'" :label="t('common.actions')" width="110" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)"><el-icon><EditPen /></el-icon>{{ t('system.edit') }}</el-button></template></el-table-column>
        <el-table-column v-else-if="section === 'audit-logs'" :label="t('common.actions')" width="125" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="selectedAudit = row; auditDialog = true"><el-icon><View /></el-icon>{{ t('systemUi.viewDetails') }}</el-button></template></el-table-column>
        <template #empty><el-empty :description="t('system.noData')" /></template>
      </el-table>
      <div v-if="showPagination" class="system-pagination">
        <span class="text-xs text-[#718077]">{{ t('system.paginationSummary', { total: filteredRows.length }) }}</span>
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="filteredRows.length" background layout="prev, pager, next, sizes" />
      </div>
    </div>

    <el-dialog v-model="dialog" :title="dialogTitle" :width="section === 'roles' ? 'min(1040px, 96vw)' : 'min(820px, 96vw)'" top="5vh" class="system-editor" :close-on-click-modal="false" :close-on-press-escape="!saving" :show-close="!saving" destroy-on-close @closed="clearEditor">
      <template #header="{ titleId }"><div class="system-dialog-heading"><span class="system-row-icon"><el-icon><component :is="sectionIcon" /></el-icon></span><div><p>{{ sectionTitle }}</p><h2 :id="titleId">{{ dialogTitle }}</h2></div></div></template>
      <el-form ref="editorForm" :model="form" :rules="formRules" label-position="top" class="system-editor-form" @submit.prevent="save">
        <template v-if="section === 'users'">
          <h3 class="system-form-heading"><el-icon><User /></el-icon>{{ t('systemUi.accountDetails') }}</h3>
          <div class="system-form-grid">
            <el-form-item prop="username" :label="t('system.username')"><el-input v-model="form.username" :placeholder="fieldPlaceholder('system.username')" maxlength="64" autocomplete="off" /></el-form-item>
            <el-form-item prop="name" :label="t('system.name')"><el-input v-model="form.name" :placeholder="fieldPlaceholder('system.name')" maxlength="120" /></el-form-item>
            <el-form-item prop="email" :label="t('system.email')" class="system-form-wide"><el-input v-model="form.email" :placeholder="fieldPlaceholder('system.email')" type="email" autocomplete="email" /></el-form-item>
          </div>
          <h3 class="system-form-heading"><el-icon><Key /></el-icon>{{ t('systemUi.assignments') }}</h3>
          <div class="system-form-grid">
            <el-form-item prop="roleId" :label="t('system.role')"><el-select v-model="form.roleId" class="w-full" filterable :placeholder="fieldPlaceholder('system.role', true)"><el-option v-for="role in roleRows" :key="role.id" :value="role.id" :label="localizedRoleName(role) + ' (' + role.code + ')'" /></el-select></el-form-item>
            <el-form-item :label="t('system.rationCenter')"><el-select v-model="form.organization" class="w-full" filterable clearable :placeholder="fieldPlaceholder('system.rationCenter', true)"><el-option v-for="center in centerRows" :key="center.id" :value="center.name" :label="rationCenterOptionLabel(center)" /></el-select></el-form-item>
          </div>
          <h3 class="system-form-heading"><el-icon><Lock /></el-icon>{{ t('systemUi.security') }}</h3>
          <p class="system-form-hint">{{ t(editing ? 'systemUi.editPasswordHint' : 'systemUi.passwordHint') }}</p>
          <div class="system-form-grid">
            <el-form-item prop="password" :label="t('systemUi.password')"><el-input v-model="form.password" type="password" show-password maxlength="128" autocomplete="new-password" :placeholder="fieldPlaceholder('systemUi.password')" /></el-form-item>
            <el-form-item prop="passwordConfirm" :label="t('systemUi.confirmPassword')"><el-input v-model="form.passwordConfirm" type="password" show-password maxlength="128" autocomplete="new-password" :placeholder="fieldPlaceholder('systemUi.confirmPassword')" @keyup.enter="save" /></el-form-item>
          </div>
        </template>
        <template v-else-if="section === 'roles'">
          <h3 class="system-form-heading"><el-icon><Key /></el-icon>{{ t('systemUi.roleDetails') }}</h3>
          <div class="system-form-grid">
            <el-form-item prop="name" :label="t('system.roleName')"><el-input v-model="formRoleName" :placeholder="fieldPlaceholder('system.roleName')" /></el-form-item>
            <el-form-item prop="code" :label="t('system.roleCode')"><el-input v-model="form.code" :placeholder="fieldPlaceholder('system.roleCode')" /></el-form-item>
            <el-form-item :label="t('system.description')" class="system-form-wide"><el-input v-model="formRoleDescription" type="textarea" :rows="2" :placeholder="fieldPlaceholder('system.description')" /></el-form-item>
          </div>
          <div class="system-form-heading flex-wrap"><el-icon><Checked /></el-icon><h3>{{ t('systemExtras.rolePermissions') }}</h3><el-tag size="small" effect="plain">{{ t('systemUi.permissionCount', { count: (form.permissionCodes || []).length }) }}</el-tag></div>
          <p class="system-form-hint">{{ t('systemUi.permissionsHint') }}</p>
          <el-form-item>
            <div class="system-permission-panel w-full">
              <div v-for="module in permissionTree" :key="module.moduleKey" class="system-permission-module">
                <div class="system-permission-title">{{ t('systemExtras.' + module.moduleKey) }}</div>
                <div class="flex flex-wrap items-start gap-2 ps-3">
                <div v-for="feature in module.features" :key="feature.code" :class="feature.children.length || isWarehouseScopedPermission(feature.code) ? 'w-full' : 'rounded-md border border-[#E8EDEA] px-3 py-1.5'">
                  <template v-if="isWarehouseScopedPermission(feature.code)">
                    <el-checkbox
                      :model-value="(form.permissionCodes || []).includes(feature.code)"
                      @change="(checked) => toggleWarehousePermission(feature.code, checked)"
                    >{{ t('systemExtras.' + feature.featureKey) }} <el-tag size="small" type="warning">PRO</el-tag></el-checkbox>
                    <div v-if="(form.permissionCodes || []).includes(feature.code)" class="mt-1 border-s-2 border-[#D9E5DB] ps-5">
                      <div class="mb-1 text-xs text-[#75837A]">{{ t('systemExtras.reviewScopeRegions') }}</div>
                      <el-select
                        :model-value="regionsForPermission(feature.code)"
                        class="w-full"
                        multiple
                        filterable
                        collapse-tags
                        collapse-tags-tooltip
                        :placeholder="t('systemExtras.reviewScopeRegionsPlaceholder')"
                        @change="(regions) => setPermissionRegions(feature.code, regions)"
                      >
                        <el-option v-for="region in reviewRegionOptions" :key="region.value" :value="region.value" :label="region.label" />
                      </el-select>
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
                          <el-select
                            :model-value="reviewRegionsFor(type.code)"
                            class="w-full"
                            multiple
                            filterable
                            collapse-tags
                            collapse-tags-tooltip
                            :placeholder="t('systemExtras.reviewScopeRegionsPlaceholder')"
                            @change="(regions) => setReviewRegions(type.code, regions)"
                          >
                            <el-option v-for="region in reviewRegionOptions" :key="region.value" :value="region.value" :label="region.label" />
                          </el-select>
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
                        <div v-if="scope.children.length" class="mt-1 border-s-2 border-[#D9E5DB] ps-5">
                          <el-select
                            :model-value="selectedPermissionChildren(scope)"
                            class="w-full"
                            multiple
                            filterable
                            collapse-tags
                            collapse-tags-tooltip
                            :placeholder="t('systemExtras.messagePermissionOptionsPlaceholder')"
                            @change="(codes) => setPermissionChildren(scope, codes)"
                          >
                            <el-option v-for="target in scope.children" :key="target.code" :value="target.code" :label="permissionItemLabel(target)" />
                          </el-select>
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
          <h3 class="system-form-heading"><el-icon><OfficeBuilding /></el-icon>{{ t('systemUi.centerDetails') }}</h3>
          <div class="system-form-grid">
            <el-form-item prop="name" :label="t('systemUi.centerName')"><el-input v-model="form.name" :placeholder="fieldPlaceholder('systemUi.centerName')" /></el-form-item>
            <el-form-item prop="code" :label="t('systemUi.centerCode')"><el-input v-model="form.code" :placeholder="fieldPlaceholder('systemUi.centerCode')" /></el-form-item>
            <el-form-item prop="province" :label="t('system.province')" class="system-form-wide"><el-select v-model="form.province" class="w-full" clearable filterable :placeholder="fieldPlaceholder('system.province', true)"><el-option v-for="province in provinceOptions" :key="province.code" :value="province.code" :label="t('systemExtras.' + province.labelKey)" /></el-select></el-form-item>
          </div>
          <h3 class="system-form-heading"><el-icon><Location /></el-icon>{{ t('systemUi.location') }}</h3>
          <el-form-item :label="t('systemExtras.address')"><div class="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2"><el-input v-model="form.address" :placeholder="fieldPlaceholder('systemExtras.address')" /><el-button plain @click="locationDialog = true"><el-icon><Location /></el-icon>{{ t('systemExtras.locate') }}</el-button></div></el-form-item>
          <div class="system-form-grid"><el-form-item :label="t('systemExtras.latitude')"><el-input v-model="form.latitude" inputmode="decimal" /></el-form-item><el-form-item :label="t('systemExtras.longitude')"><el-input v-model="form.longitude" inputmode="decimal" /></el-form-item></div>
          <h3 class="system-form-heading"><el-icon><Phone /></el-icon>{{ t('systemUi.contacts') }}</h3>
          <div class="system-form-grid"><el-form-item :label="t('systemExtras.contact')"><el-input v-model="form.contact" :placeholder="fieldPlaceholder('systemExtras.contact')" /></el-form-item><el-form-item :label="t('systemExtras.phone')"><el-input v-model="form.phone" type="tel" :placeholder="fieldPlaceholder('systemExtras.phone')" /></el-form-item></div>
        </template>
      </el-form>
      <template #footer><el-button :disabled="saving" @click="dialog = false">{{ t('system.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="save"><el-icon><Check /></el-icon>{{ t(editing ? 'systemUi.saveChanges' : 'systemUi.createRecord') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="auditDialog" :title="t('systemUi.auditDetail')" width="min(980px, 96vw)" top="5vh" class="system-editor system-audit-dialog" destroy-on-close>
      <template v-if="selectedAudit"><h3 class="system-form-heading"><el-icon><Document /></el-icon>{{ t('systemUi.recordDetails') }}</h3><dl class="system-audit-metadata"><div v-for="field in auditDetailFields" :key="field.label"><dt>{{ field.label }}</dt><dd>{{ field.value || '—' }}</dd></div></dl><div class="system-audit-content"><h3>{{ t('system.auditDetails') }}</h3><p>{{ selectedAudit.details || '—' }}</p></div><div class="system-snapshots"><section v-for="key in ['before', 'after']" :key="key"><h3>{{ t(key === 'before' ? 'system.auditBefore' : 'system.auditAfter') }}</h3><pre dir="auto">{{ formatSnapshot(selectedAudit[key]) }}</pre></section></div></template>
      <template #footer><el-button type="primary" plain @click="auditDialog = false">{{ t('messages.close') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="locationDialog" :title="t('systemExtras.locate')" width="min(820px, 96vw)" top="5vh" class="system-editor" @opened="initializeLocationMap">
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
import { Checked, Check, Document, Download, EditPen, Key, Location, Lock, OfficeBuilding, Phone, Plus, Refresh, RefreshRight, Search, Tools, User, View } from '@element-plus/icons-vue';
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
import { publicAdminAccount } from '../../utils/adminCredentials.js';
const { t, locale } = useI18n();
const tabs = [{ key: 'users', label: 'adminAccounts', icon: User }, { key: 'roles', label: 'roles', icon: Key }, { key: 'organizations', label: 'rationCenters', icon: OfficeBuilding }, { key: 'audit-logs', label: 'logs', icon: Document }];
const section = ref('users'), rows = ref([]), roleRows = ref([]), centerRows = ref([]), adminUserRows = ref([]), permissionRows = ref([]), loading = ref(false), keyword = ref(''), appliedQuery = ref(''), dialog = ref(false), locationDialog = ref(false), editing = ref(false), form = ref({});
const editorForm = ref(null), saving = ref(false), statusFilter = ref(''), auditDialog = ref(false), selectedAudit = ref(null);
const sectionTitle = computed(() => t('system.' + tabs.find((tab) => tab.key === section.value)?.label));
const sectionIcon = computed(() => tabs.find((tab) => tab.key === section.value)?.icon || Tools);
const dialogCreateTitle = computed(() => t('systemUi.create_' + section.value));
const dialogTitle = computed(() => section.value === 'audit-logs' ? t('systemUi.auditDetail') : t('systemUi.' + (editing.value ? 'edit_' : 'create_') + section.value));
function tabCount(key) { return key === section.value ? rows.value.length : key === 'users' ? adminUserRows.value.length : key === 'roles' ? roleRows.value.length : key === 'organizations' ? centerRows.value.length : null; }
function fieldPlaceholder(key, select = false) { return t(select ? 'systemUi.selectField' : 'systemUi.enterField', { field: t(key) }); }
const formRules = computed(() => {
  const required = (key, select = false) => ({ required: true, whitespace: !select, message: fieldPlaceholder(key, select), trigger: select ? 'change' : 'blur' });
  if (section.value === 'users') return {
    username: [required('system.username'), { validator: (_rule, value, callback) => callback(adminUserRows.value.some((row) => row.id !== form.value.id && String(row.username || '').toLowerCase() === String(value || '').trim().toLowerCase()) ? new Error(t('systemUi.usernameTaken')) : undefined), trigger: 'blur' }],
    name: [required('system.name')], roleId: [required('system.role', true)],
    email: [{ type: 'email', message: t('systemUi.invalidEmail'), trigger: 'blur' }],
    password: [{ required: !editing.value, validator: (_rule, value, callback) => callback((!editing.value || form.value.passwordConfirm) && !value ? new Error(t('systemUi.passwordRequired')) : undefined), trigger: 'blur' }],
    passwordConfirm: [{ required: !editing.value, validator: (_rule, value, callback) => {
      if ((!editing.value || form.value.password) && !value) return callback(new Error(t('systemUi.confirmationRequired')));
      if (value !== form.value.password) return callback(new Error(t('systemUi.passwordMismatch')));
      callback();
    }, trigger: 'blur' }]
  };
  return { name: [required(section.value === 'roles' ? 'system.roleName' : 'systemUi.centerName')], code: [required(section.value === 'roles' ? 'system.roleCode' : 'systemUi.centerCode')], ...(section.value === 'organizations' ? { province: [required('system.province', true)] } : {}) };
});
const auditDetailFields = computed(() => {
  const row = selectedAudit.value || {};
  return [['auditActor', row.actor || row.operatorName], ['time', formatTime(row.time || row.timestamp)], ['auditType', auditTypeLabel(row.type)], ['auditBusinessNo', row.businessNo], ['auditObject', row.object], ['auditIp', row.ip], ['auditTerminal', row.terminal]].map(([key, value]) => ({ label: t('system.' + key), value }));
});
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
const legacyMessagePermission = (code) => /^messages\.(send|review)\.(region|agent|site|cardAppUser|web)\./.test(code) || /^messages\.(send|review)\.everyone$/.test(code);
function resolveRolePermissionCodes(codes = []) {
  const cardAppGroups = new Set(codes.map((code) => String(code).match(/^(messages\.(?:send|review)\.cardAppUser)\./)?.[1]).filter(Boolean));
  const normalized = codes.filter((code) => !/^messages\.(send|review)\.cardAppUser\./.test(String(code)));
  return resolveEffectiveCodes([...normalized, ...cardAppGroups], permissionCatalog.value);
}
const dynamicProvinceOptions = computed(() => {
  const options = new Map();
  for (const root of messageRecipientTree.value || []) {
    const code = String(root.regionCode || '').trim();
    if (!code) continue;
    const known = REVIEW_SCOPE_REGIONS.find((region) => region.code === code);
    const rawName = String(root.province || root.name || code).split(/[（(]/)[0].trim();
    const value = known?.value || rawName;
    options.set(code, { code, value, labelKey: known?.labelKey, label: known ? t('systemExtras.' + known.labelKey) : rawName });
  }
  for (const center of centerRows.value || []) {
    const raw = String(center.province || '').trim();
    if (!raw) continue;
    const known = REVIEW_SCOPE_REGIONS.find((region) => region.code.toLowerCase() === raw.toLowerCase() || region.value.toLowerCase() === raw.toLowerCase());
    const lowerCode = raw.toLowerCase();
    const province = provinceOptions.find((option) => option.code.toLowerCase() === lowerCode);
    if (!known && !province) continue;
    const rootMatch = (messageRecipientTree.value || []).find((root) => {
      const rootName = String(root.province || '').split(/[（(]/)[0].trim().toLowerCase();
      return String(root.regionCode || '').toLowerCase() === lowerCode || (rootName && (rootName.includes(lowerCode) || lowerCode.includes(rootName)));
    });
    const code = known?.code || rootMatch?.regionCode || ({ baghdad: 'BAG', basra: 'BAS' }[lowerCode] || raw);
    const canonical = known || REVIEW_SCOPE_REGIONS.find((region) => region.code === code);
    const value = canonical?.value || String(rootMatch?.province || raw).split(/[（(]/)[0].trim();
    options.set(code, { code, value, labelKey: canonical?.labelKey || province?.labelKey, label: canonical ? t('systemExtras.' + canonical.labelKey) : province ? t('systemExtras.' + province.labelKey) : raw });
  }
  return [...options.values()];
});
const permissionCatalog = computed(() => {
  const base = (permissionRows.value.length ? permissionRows.value : catalog).filter((item) => !legacyMessagePermission(item.code));
  const dynamic = buildMessagePermissionEntries(messageRecipientTree.value, dynamicProvinceOptions.value, adminUserRows.value).map((item) => ({ ...item, id: 'perm-' + item.code }));
  const dynamicCodes = new Set(dynamic.map((item) => item.code));
  return [...base.filter((item) => !dynamicCodes.has(item.code)), ...dynamic];
});
const bySection = {
  users: [['username','username'],['name','name'],['email','email'],['roleId','role'],['organization','organization'],['status','status']],
  roles: [['name','name'],['code','code'],['reviewScope','reviewPermission'],['permissionCodes','assignedPermissions'],['description','description']],
  permissions: [['moduleKey','permissionModule'],['featureKey','permissionFeature'],['code','code']],
  organizations: [['name','name'],['code','code'],['province','province'],['address','address'],['contact','contact'],['phone','phone']],
  'audit-logs': [['actor','auditActor'],['time','time'],['type','auditType'],['object','auditObject'],['businessNo','auditBusinessNo'],['ip','auditIp'],['details','auditDetails']]
};
const columns = computed(() => bySection[section.value].map(([key,label]) => ({ key,label, width: ({ name: section.value === 'organizations' ? 260 : 210, username: 160, email: 215, permissionCodes: 340, reviewScope: 180, description: 250, address: 230, organization: 230, actor: 170, time: 180, type: 140, object: 200, businessNo: 165, details: 300 })[key] })));
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
    if (section.value === 'users' && statusFilter.value && (row.status || 'active') !== statusFilter.value) return false;
    if (!appliedQuery.value) return true;
    const extra = section.value === 'organizations' ? [provinceLabel(row.province), localizedCenterName(row.name)] : section.value === 'users' ? [roleLabel(row), localizedCenterName(row.organization)] : section.value === 'roles' ? [localizedRoleName(row), localizedRoleDescription(row)] : [];
    return [...Object.values(row), ...extra].some((value) => String(JSON.stringify(value) ?? value ?? '').toLowerCase().includes(appliedQuery.value.toLowerCase()));
  });
});
const permissionTree = computed(() => buildPermissionTree(permissionCatalog.value));
const reviewRegionOptions = computed(() => dynamicProvinceOptions.value);
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
function selectedPermissionChildren(node) { return node.children.filter((child) => (form.value.permissionCodes || []).includes(child.code)).map((child) => child.code); }
function setPermissionChildren(node, selectedCodes) {
  const selected = new Set(selectedCodes);
  const codes = new Set(form.value.permissionCodes || []);
  node.children.forEach((child) => { if (selected.has(child.code)) codes.add(child.code); else codes.delete(child.code); });
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
  if (column.key === 'name' && section.value === 'roles') return t('system.roleName');
  if (column.key === 'name' && section.value === 'organizations') return t('systemUi.centerName');
  if (column.key === 'code' && section.value === 'roles') return t('system.roleCode');
  if (column.key === 'code' && section.value === 'organizations') return t('systemUi.centerCode');
  if (column.key === 'organization') return t('system.rationCenter');
  if (column.key === 'province') return t('system.province');
  return column.key === 'permissionCodes' || column.key === 'reviewScope' || column.key === 'details' || column.key === 'ip' || column.key === 'moduleKey' || column.key === 'featureKey' || column.key === 'address' || column.key === 'contact' || column.key === 'phone' ? t('systemExtras.' + column.label) : t('system.' + column.label);
}
function entityLetter(index = 0) { let value = Math.max(0, Number(index) || 0), result = ''; do { result = String.fromCharCode(65 + (value % 26)) + result; value = Math.floor(value / 26) - 1; } while (value >= 0); return result; }
function permissionItemLabel(item) {
  if (item.entityKind === 'agent') return `${t('systemExtras.messageAgentEntry', { letter: entityLetter(item.displayIndex) })} · ${item.entityId}`;
  if (item.entityKind === 'site') return `${t('systemExtras.messageSiteEntry', { letter: entityLetter(item.displayIndex) })} · ${item.entityId}`;
  if (item.entityKind === 'adminUser' || item.entityKind === 'region') return item.displayName || (item.featureKey ? t('systemExtras.' + item.featureKey) : item.entityId);
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
function formatTime(value) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(date); }
async function load() { loading.value = true; currentPage.value = 1; try { rows.value = section.value === 'permissions' ? permissionCatalog.value : await getSystemRecords(section.value, section.value === 'audit-logs' ? { actor: auditFilters.value.actor || undefined, type: auditFilters.value.type || undefined, businessNo: auditFilters.value.businessNo || undefined, from: auditFilters.value.range?.[0], to: auditFilters.value.range?.[1] } : undefined); } finally { loading.value = false; } }
async function loadReferences() { [roleRows.value, permissionRows.value, centerRows.value, adminUserRows.value, messageRecipientTree.value] = await Promise.all([getSystemRecords('roles'), getSystemRecords('permissions'), getSystemRecords('organizations'), getSystemRecords('users').catch(() => []), getMessageRecipientTree().catch(() => [])]); if (!permissionRows.value.length) permissionRows.value = catalog; if (!roleRows.value.length) roleRows.value = [{ id: 'role-admin', code: 'admin', name: t('system.adminRole'), permissionCodes: catalog.map((p) => p.code), reviewScope: { types: [...REVIEW_TYPE_CODES], regionsByType: {} } }]; }
async function refreshAll() { await loadReferences(); await load(); }
async function changeSection() { keyword.value = ''; appliedQuery.value = ''; statusFilter.value = ''; await load(); }
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
function resetSearch() { keyword.value = ''; appliedQuery.value = ''; statusFilter.value = ''; currentPage.value = 1; }
function clearEditor() { editorForm.value?.clearValidate(); form.value = {}; }
function openCreate() { editing.value = false; roleNameEdited.value = true; roleDescriptionEdited.value = true; form.value = section.value === 'roles' ? { name: '', code: '', permissionCodes: [], reviewScope: emptyReviewScope() } : section.value === 'users' ? { username: '', name: '', email: '', password: '', passwordConfirm: '', status: 'active' } : section.value === 'organizations' ? { name: '', code: '', province: '', latitude: '', longitude: '' } : {}; dialog.value = true; }
function openEdit(row) { editing.value = true; roleNameEdited.value = false; roleDescriptionEdited.value = false; const source = JSON.parse(JSON.stringify(section.value === 'users' ? publicAdminAccount(row) : row)); const permissionCodes = resolveRolePermissionCodes(source.permissionCodes || []); form.value = { ...source, password: '', passwordConfirm: '', permissionCodes, reviewScope: normalizeReviewScope(source.reviewScope || {}, permissionCodes, source.code) }; dialog.value = true; }
function auditMessage(key, entityKey, name, extra = {}) { return t('systemExtras.' + key, { actor: actor(), entity: t('systemExtras.' + entityKey), name, ...extra }); }
async function save() {
  if (saving.value || !editorForm.value || !await editorForm.value.validate().catch(() => false)) return;
  saving.value = true;
  try {
    const name = form.value.name || form.value.username || form.value.code;
    const oldName = rows.value.find((row) => row.id === form.value.id)?.name;
    const value = { ...form.value, status: form.value.status || 'active' };
    if (section.value !== 'users' || (editing.value && !value.password)) { delete value.password; delete value.passwordConfirm; }
    if (section.value === 'users') { const role = roleRows.value.find((item) => item.id === value.roleId); value.role = role?.code || value.role; value.permissionCodes = role?.permissionCodes || []; value.reviewScope = role?.reviewScope || null; }
    const entityKey = section.value === 'users' ? 'entityUser' : section.value === 'roles' ? 'entityRole' : section.value === 'permissions' ? 'entityPermission' : 'entityOrganization';
    const isRename = editing.value && oldName && oldName !== value.name;
    value.auditDetails = isRename ? auditMessage('auditRenamed', entityKey, value.name, { oldName, newName: value.name }) : auditMessage(editing.value ? 'auditUpdated' : 'auditCreated', entityKey, name);
    value.auditType = 'configuration';
    await saveSystemRecord(section.value, value); form.value.password = ''; form.value.passwordConfirm = ''; dialog.value = false; await refreshAll();
    const successKey = section.value === 'users' ? (editing.value ? 'userUpdated' : 'userCreated') : section.value === 'roles' ? (editing.value ? 'roleUpdated' : 'roleCreated') : section.value === 'permissions' ? 'permissionCreated' : (editing.value ? 'rationCenterUpdated' : 'rationCenterCreated');
    ElMessage.success(t('system.' + successKey));
  } finally { saving.value = false; }
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

<style scoped>
.system-management { color: #1f3326; }
.system-card { border: 1px solid #d9e5db; border-radius: .625rem; background: #fff; box-shadow: 0 2px 6px rgb(31 51 38 / 3%); }
.system-workspace { overflow: hidden; padding: .5rem 1.5rem 0; }
.system-tabs :deep(.el-tabs__header) { margin-bottom: 0; }
.system-tabs :deep(.el-tabs__item) { height: 3.25rem; }
.system-tabs :deep(.el-tabs__nav-wrap::after) { height: 1px; background: #e9f1eb; }
.system-tab-label { display: inline-flex; align-items: center; gap: .5rem; font-weight: 600; }
.system-tab-count { min-width: 1.375rem; padding: .1rem .375rem; border-radius: .35rem; background: #f0f5f1; color: #6c7e71; font-size: .6875rem; line-height: 1.4; }
.system-list-heading { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: .875rem; padding: 1rem 0; }
.system-filters { display: grid; align-items: end; gap: .875rem; margin-bottom: 1rem; padding: 1rem; border: 1px solid #d9e5db; border-radius: .5rem; background: #f3f8f4; }
.system-search-filters { grid-template-columns: minmax(230px, 1fr) auto auto; }
.system-search-filters .system-filter-field:first-child { max-width: 42rem; }
.system-search-filters .system-filter-field:nth-child(2) { min-width: 150px; }
.system-audit-filters { grid-template-columns: minmax(130px, 1fr) minmax(290px, 2fr) minmax(130px, 1fr) minmax(140px, 1fr) auto; }
.system-filter-field { display: flex; min-width: 0; flex-direction: column; gap: .375rem; }
.system-filter-field > span { color: #58685d; font-size: .75rem; font-weight: 600; }
.system-filter-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.system-filter-actions :deep(.el-button + .el-button) { margin-inline-start: 0; }
.system-filter-actions .el-icon, .system-list-heading .el-button .el-icon { margin-inline-end: .375rem; }
.system-audit-note { display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; margin-bottom: .875rem; color: #718077; font-size: .75rem; }
.system-audit-note > span { display: inline-flex; align-items: center; gap: .375rem; }
.system-table { --el-table-header-bg-color: #f3f8f4; --el-table-header-text-color: #53675a; --el-table-row-hover-bg-color: #f6f9f6; --el-table-border-color: #e2ebe4; font-size: .8125rem; }
.system-table :deep(th.el-table__cell) { padding-block: .75rem; font-size: .75rem; font-weight: 600; }
.system-table :deep(td.el-table__cell) { padding-block: .875rem; }
.system-table :deep(.cell) { line-height: 1.6; }
.system-table :deep(.el-button .el-icon) { margin-inline-end: .25rem; }
.system-identity { display: flex; align-items: center; gap: .625rem; }
.system-avatar, .system-row-icon { display: inline-flex; width: 2rem; height: 2rem; flex: 0 0 auto; align-items: center; justify-content: center; border: 1px solid #d9e5db; border-radius: .5rem; background: #f0f6f1; color: #326445; font-weight: 700; }
.system-avatar { border-radius: 50%; font-size: .8125rem; }
.system-code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .75rem; font-weight: 600; }
.system-permission-summary { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.system-permission-summary :deep(.el-tag) { max-width: 100%; }
.system-permission-summary :deep(.el-tag__content) { overflow: hidden; text-overflow: ellipsis; }
.system-permission-popover { display: flex; max-height: 280px; flex-wrap: wrap; gap: .375rem; overflow: auto; }
.system-pagination { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; padding: 1rem 0; }
.system-dialog-heading { display: flex; align-items: center; gap: .75rem; }
.system-dialog-heading .system-row-icon { width: 2.5rem; height: 2.5rem; font-size: 1.25rem; }
.system-dialog-heading p { margin: 0 0 .125rem; color: #819087; font-size: .6875rem; }
.system-dialog-heading h2 { margin: 0; color: #1f3326; font-size: 1.0625rem; font-weight: 700; }
.system-form-heading { display: flex; align-items: center; gap: .5rem; margin: .375rem 0 1rem; border-bottom: 1px solid #e9f1eb; padding-bottom: .625rem; color: #326445; font-size: .8125rem; font-weight: 700; }
.system-form-heading h3 { margin: 0; font-size: inherit; }
.system-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 1.25rem; }
.system-form-wide { grid-column: 1 / -1; }
.system-form-hint { margin: -.375rem 0 1rem; color: #819087; font-size: .75rem; line-height: 1.7; }
.system-editor-form :deep(.el-form-item__label) { margin-bottom: .375rem; color: #58685d; font-size: .8125rem; font-weight: 500; }
.system-editor-form :deep(.el-form-item) { margin-bottom: 1.375rem; }
.system-permission-panel { display: grid; gap: .875rem; }
.system-permission-module { overflow: hidden; border: 1px solid #e0e9e2; border-radius: .5rem; padding: 0 1rem .875rem; }
.system-permission-title { margin: 0 -1rem .75rem; border-bottom: 1px solid #e5ede7; background: #f4f8f4; padding: .625rem 1rem; color: #326445; font-size: .8125rem; font-weight: 700; }
.system-permission-module :deep(.el-checkbox) { height: auto; min-height: 1.75rem; margin-inline-end: .5rem; }
.system-permission-module :deep(.el-checkbox__label) { white-space: normal; line-height: 1.5; }
.system-audit-metadata { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.5rem; margin: 0 0 1.25rem; }
.system-audit-metadata dt { margin-bottom: .25rem; color: #819087; font-size: .75rem; }
.system-audit-metadata dd { margin: 0; color: #34473a; font-size: .8125rem; overflow-wrap: anywhere; }
.system-audit-content { margin-bottom: 1.25rem; border: 1px solid #e1eae3; border-radius: .5rem; background: #f6f9f6; padding: 1rem; }
.system-audit-content h3, .system-snapshots h3 { margin: 0 0 .625rem; color: #52675a; font-size: .8125rem; font-weight: 600; }
.system-audit-content p { margin: 0; color: #34473a; font-size: .8125rem; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.system-snapshots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.system-snapshots section { min-width: 0; }
.system-snapshots pre { max-height: 320px; min-height: 140px; margin: 0; overflow: auto; border: 1px solid #e1eae3; border-radius: .5rem; background: #f8faf8; padding: .875rem; color: #52675a; font-size: .75rem; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
:global(.system-editor.el-dialog) { display: flex; max-height: 90dvh; flex-direction: column; overflow: hidden; border-radius: .75rem; padding: 0; }
:global(.system-editor .el-dialog__header) { flex-shrink: 0; margin: 0; border-bottom: 1px solid #e4ece6; padding: 1.25rem 1.5rem; padding-inline-end: 3rem; }
:global(.system-editor .el-dialog__headerbtn) { top: 1rem; inset-inline-end: 1rem; }
:global(.system-editor .el-dialog__body) { min-height: 0; overflow: auto; padding: 1.25rem 1.5rem .75rem; }
:global(.system-editor .el-dialog__footer) { flex-shrink: 0; border-top: 1px solid #e4ece6; background: #fafcfb; padding: 1rem 1.5rem; }
:global(.system-editor .el-dialog__footer .el-button .el-icon) { margin-inline-end: .375rem; }
@media (max-width: 1280px) { .system-audit-filters { grid-template-columns: repeat(3, minmax(0, 1fr)); } .audit-date-filter { grid-column: span 2; } }
@media (max-width: 768px) {
  .system-workspace { padding-inline: 1rem; }
  .system-tabs :deep(.el-tabs__nav-wrap) { overflow: visible; padding: 0; }
  .system-tabs :deep(.el-tabs__nav-scroll) { overflow: visible; }
  .system-tabs :deep(.el-tabs__nav) { display: grid; width: 100%; float: none; grid-template-columns: repeat(2, minmax(0, 1fr)); transform: none !important; }
  .system-tabs :deep(.el-tabs__nav-prev), .system-tabs :deep(.el-tabs__nav-next), .system-tabs :deep(.el-tabs__active-bar) { display: none; }
  .system-tabs :deep(.el-tabs__item) { min-width: 0; height: auto; min-height: 3rem; justify-content: center; border-radius: .375rem; padding: .5rem .25rem; white-space: normal; scroll-margin-top: 4.5rem; }
  .system-tabs :deep(.el-tabs__item.is-active) { background: #f0f6f1; }
  .system-tab-label { flex-wrap: wrap; justify-content: center; gap: .3rem; font-size: .75rem; }
  .system-search-filters, .system-audit-filters { grid-template-columns: minmax(0, 1fr); }
  .audit-date-filter { grid-column: auto; }
  .system-search-filters .system-filter-field:first-child { max-width: none; }
  .system-form-grid, .system-audit-metadata, .system-snapshots { grid-template-columns: minmax(0, 1fr); }
  .system-pagination { align-items: flex-start; flex-direction: column; overflow: auto; }
  :global(.system-editor .el-dialog__header), :global(.system-editor .el-dialog__body), :global(.system-editor .el-dialog__footer) { padding-inline: 1rem; }
}
</style>
