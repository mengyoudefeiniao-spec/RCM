<template>
  <div class="agent-mgmt-view" :class="isAppMode ? 'space-y-3 pb-8' : 'space-y-6'">
    <!-- ======================================================== -->
    <!-- 1. 顶部代理商身份看板与第 140 号决议监管总览 (仅管理视察角色可见，代理角色已去除) -->
    <!-- ======================================================== -->
    <div v-if="isAdmin" class="bg-white rounded-lg p-6 border border-[#D9E5DB]/80 shadow-xs space-y-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E9F1EB] pb-5">
        <div class="flex items-start sm:items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[#C9A13B] flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <el-icon class="text-xl"><Shop /></el-icon>
          </div>
          <ModuleDescTip
            :title="$t('agent.title')"
            :content="$t('agent.subtitle')"
            badge-type="warning"
            title-class="text-lg font-bold text-[#1B3123]"
          >
            <template #extra>
              <el-tag size="small" type="warning" effect="dark" class="scale-95 ms-1">
                {{ $t('agent.article140Tag') }}
              </el-tag>
            </template>
          </ModuleDescTip>
        </div>

        <!-- 顶部快捷操作栏：管理角色仅提供视察和跳转后台管理，代理角色展示四大申报按钮 -->
        <div class="flex flex-wrap items-center gap-2.5">
          <template v-if="!isAdmin">
            <el-button type="primary" @click="handleOpenApply()">
              <el-icon class="me-1"><Plus /></el-icon>
              {{ $t('agent.applyGrant') }}
            </el-button>
            <el-button type="warning" @click="handleOpenRotation()">
              <el-icon class="me-1"><Switch /></el-icon>
              {{ $t('agent.applyRotation') }}
            </el-button>
            <el-button type="danger" plain @click="handleOpenRestoration()">
              <el-icon class="rtl-mirror-icon me-1"><RefreshRight /></el-icon>
              {{ $t('agent.applyRestoration') }}
            </el-button>
          </template>
          <template v-else>
            <el-tag type="info" size="small" effect="plain" class="font-bold">
              {{ $t('agent.inspectorMode') || '监督视察模式：仅供查阅网格代理分布' }}
            </el-tag>
            <el-button type="primary" size="small" @click="$router.push('/admin')">
              {{ $t('agent.goToAdmin') || '前往后台管理行使专属法定职权' }}
            </el-button>
          </template>
          <el-button @click="loadAllData">
            <el-icon class="me-1"><Refresh /></el-icon>
            {{ $t('common.refresh') }}
          </el-button>
        </div>
      </div>

      <!-- 统计指标与当前账号资质卡片 (针对 Pixel 9 412px 视口优化: 2x2 规整网格) -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
        <!-- 指标 1: 名下代理中心总数 -->
        <div class="p-3 sm:p-4 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB]/70 space-y-1 sm:space-y-1.5">
          <div class="flex items-center justify-between text-[#58685D] text-[10px] sm:text-[11px]">
            <span>{{ $t('agent.contractedStations') || '已签约网点' }}</span>
            <el-icon class="text-[#326445] text-sm sm:text-base"><OfficeBuilding /></el-icon>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl sm:text-2xl font-bold font-mono text-[#1B3123]">{{ myCenters.length }}</span>
            <span class="text-[10px] sm:text-xs text-[#8A9A8F]">{{ $t('agent.stationUnit') || '个' }}</span>
          </div>
          <div class="text-[11px] text-[#58685D] flex items-center gap-1">
            <span>{{ $t('agent.authorizedAccount') || '持权账号' }}：</span>
            <span class="font-bold text-[#1F3326]">{{ formatOwnerName(agentProfile?.name || '穆罕默德·贾巴尔') }}</span>
          </div>
        </div>

        <!-- 指标 2: 全国19省与第140号决议网点覆盖 -->
        <div class="p-3 sm:p-4 rounded-lg bg-[#FDF3E0]/70 border border-[#F2E3C6]/80 space-y-1 sm:space-y-1.5">
          <div class="flex items-center justify-between text-[#6B5321] text-[10px] sm:text-[11px]">
            <span>{{ $t('agent.summaryCoverage') }}</span>
            <el-icon class="text-[#C9A13B] text-sm sm:text-base"><LocationFilled /></el-icon>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl sm:text-2xl font-bold font-mono text-[#7A5F21]">104</span>
            <span class="text-[10px] sm:text-xs text-[#6B5321]/80">{{ $t('agent.summaryArticle140') }}</span>
          </div>
          <div class="text-[11px] text-[#7A5F21] font-medium truncate">
            {{ $t('agent.summaryPriorityRegions') }}
          </div>
        </div>

        <!-- 指标 3: 签约服务户数与容量健康度 -->
        <div class="p-4 rounded-lg bg-[#EFF5F1]/70 border border-[#C7E0CE]/80 space-y-1.5">
          <div class="flex items-center justify-between text-[#24483A] text-[11px]">
            <span>{{ $t('agent.summaryContractedHouseholds') }}</span>
            <el-icon class="text-[#2F7A50]"><UserFilled /></el-icon>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono text-[#2F5B44]">{{ totalHouseholdsServed.toLocaleString() }}</span>
            <span class="text-[#24483A]/80">{{ $t('agent.householdUnit') || '户' }}</span>
          </div>
          <div class="text-[11px] text-[#2F5B44]">
            {{ $t('agent.summaryHouseholdLimit') }}
          </div>
        </div>

        <!-- 指标 4: 进行中的业务申请工单 -->
        <div class="p-4 rounded-lg bg-[#EFF5F1]/70 border border-[#C7DED0]/80 space-y-1.5">
          <div class="flex items-center justify-between text-[#24483A] text-[11px]">
            <span>{{ $t('agent.summaryLicensingWorkorders') }}</span>
            <el-icon class="text-[#326445]"><Document /></el-icon>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono text-[#2A5440]">{{ activeApplicationsCount }}</span>
            <span class="text-[#24483A]/80">{{ $t('agent.summaryActive') }}</span>
          </div>
          <div class="text-[11px] text-[#2A5440]">
            {{ $t('agent.summaryAuditsFees') }}
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 主体选项卡：我的中心列表、140号决议中心库、业务工单流水 -->
    <!-- ======================================================== -->
    <!-- ======================================================== -->
    <!-- 2. 主体选项卡：所有代理列表、代理订单记录、代理订单统计分析、业务工单流水、全国中心库 -->
    <!-- ======================================================== -->
    <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
      <el-tabs v-model="activeTab" class="agent-custom-tabs px-3 sm:px-6 pt-2 sm:pt-3">
        <!-- ======================================================== -->
        <!-- TAB 1: 代理列表 / 代销商网点名录 (支持多条件过滤与分页) -->
        <!-- ======================================================== -->
        <el-tab-pane v-if="!hideCenterTabs" name="myCenters">
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><Shop /></el-icon>
              <span class="font-bold">{{ isAdmin ? $t('agent.adminCentersList') : $t('agent.myCenters') }}</span>
              <el-badge :value="filteredAgents.length" type="primary" class="ms-1" />
            </div>
          </template>

          <div class="py-3 sm:py-4 space-y-3 sm:space-y-4">
            <!-- 代理快捷业务申报与刷新操作栏 -->
            <div
              class="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#E9F1EB]"
              :class="isAppMode ? 'flex-col items-start gap-2' : ''"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#326445]"></span>
                <span class="font-bold text-[#1F3326] text-xs sm:text-sm">
                  {{ isAdmin ? $t('agent.adminCentersBanner') : $t('agent.agentCentersBanner') }}
                </span>
                <el-tag v-if="isAdmin" size="small" type="success" effect="plain" class="font-mono">
                  {{ $t('agent.fullGridSupervision') }}
                </el-tag>
              </div>
              <div class="flex flex-wrap items-center gap-2" :class="isAppMode ? 'w-full justify-end' : ''">
                <el-button type="primary" size="small" @click="handleOpenApply()">
                  <el-icon class="me-1"><Plus /></el-icon>
                  {{ $t('agent.applyGrant') }}
                </el-button>
              </div>
            </div>

            <!-- 过滤查询条件工具栏 (自适应 APP 模式) -->
            <div
              class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/80 gap-2.5 text-xs"
              :class="isAppMode ? 'flex flex-col space-y-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'"
            >
              <div>
                <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.filterKeyword') }}</span>
                <el-input
                  v-model="myCenterKeyword"
                  :placeholder="$t('agent.filterKeywordPlaceholder')"
                  clearable
                  size="small"
                  @input="myCentersCurrentPage = 1"
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>

              <div :class="isAppMode ? 'grid grid-cols-2 gap-2' : 'contents'">
                <div>
                  <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.filterProvince') }}</span>
                  <el-select v-model="myCenterProvinceFilter" class="w-full" size="small" @change="myCentersCurrentPage = 1">
                    <el-option :label="$t('agent.allProvinces')" value="全部" />
                    <el-option v-for="province in ['巴格达省', '迪亚拉省', '基尔库克省', '尼尼微省', '巴士拉省']" :key="province" :label="formatProvince(province)" :value="province" />
                  </el-select>
                </div>
                <div>
                  <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.filterStatus') }}</span>
                  <el-select v-model="myCenterStatusFilter" class="w-full" size="small" @change="myCentersCurrentPage = 1">
                    <el-option :label="$t('agent.allStatuses')" value="全部" />
                    <el-option :label="$t('agent.statusNormal')" value="正常" />
                    <el-option :label="$t('agent.statusCancelled')" value="注销" />
                  </el-select>
                </div>
              </div>

              <div v-if="!isAppMode">
                <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.filterCategory') }}</span>
                <el-select v-model="myCenterCategoryFilter" class="w-full" size="small" @change="myCentersCurrentPage = 1">
                  <el-option :label="$t('agent.allCategories')" value="全部" />
                  <el-option :label="$t('agent.catComprehensive')" value="综合" />
                  <el-option :label="$t('agent.catFood')" value="食品" />
                  <el-option :label="$t('agent.catFlour')" value="面粉" />
                </el-select>
              </div>

              <div class="flex items-end gap-2" :class="isAppMode ? 'pt-1' : ''">
                <el-button size="small" type="primary" class="flex-1" @click="myCentersCurrentPage = 1">
                  <el-icon class="me-1"><Search /></el-icon>
                  {{ $t('common.search') }}
                </el-button>
                <el-button size="small" class="flex-1" @click="handleResetMyCentersFilter">
                  {{ $t('common.reset') }}
                </el-button>
              </div>
            </div>

            <!-- 列表信息与精简提示 -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs px-1 text-[#58685D] gap-1">
              <span class="text-[11px]">
                {{ isAdmin ? $t('agent.noticeAdminGrid') : $t('agent.noticeDeconflict') }}
              </span>
              <span class="text-[11px] font-mono shrink-0">
                {{ $t('agent.matchedStationsCount', { count: filteredAgents.length }) }}
              </span>
            </div>

            <!-- ============================================== -->
            <!-- 视图 A: 移动端流式网点卡片视图 (针对 Pixel 9 412px 优化) -->
            <!-- ============================================== -->
            <div v-if="isAppMode" class="space-y-3" v-loading="loadingAllAgents || loadingMyCenters">
              <div
                v-for="row in pagedAgents"
                :key="row.id"
                class="p-3.5 bg-white rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-2.5"
              >
                <!-- 头部：许可编号、营业状态与决议 Tag -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-mono font-bold text-[#1F3326]">#{{ row.id }}</span>
                    <span class="text-[10px] text-[#8A9A8F] font-mono">({{ row.licenseNo }})</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <el-tag
                      v-if="row.isArticle140"
                      size="small"
                      type="warning"
                      effect="dark"
                      class="scale-90"
                    >
                      {{ $t('agent.article140Tag') }}
                    </el-tag>
                    <el-tag
                      size="small"
                      :type="isNormalAgentStatus(row.status) ? 'success' : 'danger'"
                      effect="light"
                    >
                      {{ formatAgentStatus(row.status) }}
                    </el-tag>
                  </div>
                </div>

                <!-- 网点中心与网点名称 (国际化绑定) -->
                <div>
                  <div class="text-sm font-bold text-[#1B3123] leading-snug">{{ formatCenterName(row.centerName) }}</div>
                  <div class="text-xs text-[#58685D] font-medium mt-0.5">{{ formatStoreName(row.name) }}</div>
                  <div class="text-[11px] text-[#8A9A8F] flex items-center gap-1 mt-1">
                    <el-icon><LocationFilled class="text-[#8A9A8F]" /></el-icon>
                    <span class="truncate">{{ formatAddress(row.address) }}</span>
                  </div>
                </div>

                <!-- 所属省份、负责人、经营品类与面积 (国际化绑定) -->
                <div class="grid grid-cols-2 gap-2 p-2 bg-[#F3F8F4] rounded-lg text-[11px] border border-[#E9F1EB]">
                  <div>
                    <span class="text-[#8A9A8F] block">{{ $t('agent.colProvince') }}</span>
                    <span class="font-medium text-[#43554B]">{{ formatProvince(row.province) }} · {{ formatBranchName(row.branchName) }}</span>
                  </div>
                  <div>
                    <span class="text-[#8A9A8F] block">{{ $t('agent.colOwnerContact') }}</span>
                    <span class="font-medium text-[#43554B]">{{ formatOwnerName(row.ownerName) }} (<bdi dir="ltr">{{ row.phone || '07701122339' }}</bdi>)</span>
                  </div>
                  <div>
                    <span class="text-[#8A9A8F] block">{{ $t('agent.colCategory') }}</span>
                    <el-tag size="small" type="info" effect="plain" class="scale-90 origin-left rtl:origin-right">{{ formatCategory(row.agentType) }}</el-tag>
                  </div>
                  <div>
                    <span class="text-[#8A9A8F] block">{{ $t('agent.colStoreArea') }}</span>
                    <span class="font-mono font-medium text-[#43554B]">{{ row.storeAreaSqM }} ㎡</span>
                  </div>
                </div>

                <!-- 服务户数与 1500 户上限进度条 -->
                <div class="space-y-1 pt-1 border-t border-[#E9F1EB]">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-[#58685D]">{{ $t('agent.colHouseholdQuota') }}:</span>
                    <span class="font-mono font-bold text-[#1F3326]">{{ row.householdsCount }} / 1,500 {{ $t('agent.householdUnit') }}</span>
                  </div>
                  <el-progress
                    :percentage="Math.min(100, (row.householdsCount / 1500) * 100)"
                    :status="row.householdsCount >= 1500 ? 'exception' : (row.householdsCount >= 1400 ? 'warning' : 'primary')"
                    :show-text="false"
                    :stroke-width="5"
                  />
                  <div v-if="row.householdsCount >= 1500" class="text-[10px] text-[#C04442] font-medium">
                    {{ $t('agent.quotaLocked') }} - {{ $t('agent.quotaV1Rule') }}
                  </div>
                </div>

                <!-- 底部操作按钮 -->
                <div class="pt-2 border-t border-[#E9F1EB] flex items-center justify-end gap-2">
                  <template v-if="isAdmin">
                    <el-button size="small" type="primary" link @click="$router.push('/admin')">
                      {{ $t('agent.actionLegalSupervision') }}
                    </el-button>
                    <el-button size="small" type="info" link @click="openWorkflowOverview">
                      {{ $t('agent.actionComplianceTrace') }}
                    </el-button>
                  </template>
                  <template v-else>
                    <template v-if="row.isCurrentActive || row.status === '正常营业'">
                      <el-button
                        size="small"
                        type="warning"
                        plain
                        class="!h-7 text-xs flex-1"
                        @click="handleOpenRotation(row.centerId)"
                      >
                        {{ $t('agent.actionHandleRotation') }}
                      </el-button>
                      <el-button
                        size="small"
                        type="danger"
                        plain
                        class="!h-7 text-xs flex-1"
                        @click="handleOpenCancellation(row)"
                      >
                        {{ $t('agent.actionHandleCancellation') }}
                      </el-button>
                    </template>
                    <template v-else>
                      <el-button
                        size="small"
                        type="primary"
                        plain
                        class="!h-7 text-xs flex-1"
                        @click="handleOpenRestoration(row.centerId)"
                      >
                        {{ $t('agent.actionHandleRestoration') }}
                      </el-button>
                      <el-button
                        size="small"
                        type="success"
                        plain
                        class="!h-7 text-xs flex-1"
                        @click="handleOpenApply(row.centerId)"
                      >
                        {{ $t('agent.actionHandleReapply') }}
                      </el-button>
                    </template>
                  </template>
                </div>
              </div>

              <div v-if="filteredAgents.length === 0" class="text-center py-8 text-[#8A9A8F] text-xs">
                {{ $t('agent.noMatchedStations') || '暂无符合条件的代销网点' }}
              </div>
            </div>

            <!-- ============================================== -->
            <!-- 视图 B: 桌面 Web 宽表格视图 (全量国际化绑定) -->
            <!-- ============================================== -->
            <el-table
              v-else
              :data="pagedAgents"
              v-loading="loadingAllAgents || loadingMyCenters"
              border
              style="width: 100%"
              class="text-xs"
            >
              <el-table-column prop="id" :label="$t('agent.colLicenseId')" width="120">
                <template #default="{ row }">
                  <span class="font-mono font-bold text-[#1F3326]">{{ row.id }}</span>
                  <div class="text-[10px] text-[#8A9A8F]">{{ row.licenseNo }}</div>
                </template>
              </el-table-column>

              <el-table-column :label="$t('agent.colCenterName')" min-width="220">
                <template #default="{ row }">
                  <div class="font-bold text-[#1B3123] flex items-center gap-1.5">
                    <span>{{ formatCenterName(row.centerName) }}</span>
                    <el-tag
                      v-if="row.isArticle140"
                      size="small"
                      type="warning"
                      effect="dark"
                      class="scale-90 origin-left rtl:origin-right"
                    >
                      {{ $t('agent.article140Tag') }}
                    </el-tag>
                  </div>
                  <div class="text-[11px] text-[#58685D] mt-0.5">{{ formatStoreName(row.name) }}</div>
                  <div class="text-[10px] text-[#8A9A8F]">{{ formatAddress(row.address) }}</div>
                </template>
              </el-table-column>

              <el-table-column prop="province" :label="$t('agent.colProvince')" width="170">
                <template #default="{ row }">
                  <span class="font-medium text-[#1F3326]">{{ formatProvince(row.province) }}</span>
                  <div class="text-[10px] text-[#8A9A8F]">{{ formatBranchName(row.branchName) }}</div>
                </template>
              </el-table-column>

              <el-table-column :label="$t('agent.colOwnerContact')" width="160">
                <template #default="{ row }">
                  <div class="font-bold text-[#1F3326]">{{ formatOwnerName(row.ownerName) }}</div>
                  <div class="text-[10px] text-[#58685D] font-mono">{{ row.phone || '07701122339' }}</div>
                </template>
              </el-table-column>

              <el-table-column prop="agentType" :label="$t('agent.colCategory')" width="104">
                <template #default="{ row }">
                  <el-tooltip :content="formatCategory(row.agentType)" placement="top">
                    <el-tag size="small" type="info" effect="plain">{{ formatCategoryShort(row.agentType) }}</el-tag>
                  </el-tooltip>
                </template>
              </el-table-column>

              <el-table-column :label="$t('agent.colHouseholdQuota')" min-width="210">
                <template #default="{ row }">
                  <div v-if="row.status !== '已注销'" class="space-y-1">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="font-mono font-bold">{{ row.householdsCount }} / 1,500 {{ $t('agent.householdUnit') }}</span>
                      <span v-if="row.householdsCount >= 1500" class="text-[#C04442] font-bold flex items-center gap-0.5">
                        <el-tag size="small" type="danger" effect="dark" class="scale-90">{{ $t('agent.quotaLocked') }}</el-tag>
                      </span>
                      <span v-else-if="row.householdsCount >= 1400" class="text-[#C9A13B] font-bold">
                        {{ $t('agent.quotaWarning', { pct: ((row.householdsCount / 1500) * 100).toFixed(1) }) }}
                      </span>
                      <span v-else class="text-[#58685D] font-mono">
                        {{ ((row.householdsCount / 1500) * 100).toFixed(1) }}%
                      </span>
                    </div>
                    <el-progress
                      :percentage="Math.min(100, (row.householdsCount / 1500) * 100)"
                      :status="row.householdsCount >= 1500 ? 'exception' : (row.householdsCount >= 1400 ? 'warning' : 'primary')"
                      :show-text="false"
                      :stroke-width="6"
                    />
                    <div v-if="row.householdsCount >= 1500" class="text-[10px] text-[#C04442]">
                      {{ $t('agent.quotaV1Rule') }}
                    </div>
                    <div v-else class="text-[10px] text-[#8A9A8F]">
                      {{ $t('agent.singleCenterBound', { center: formatCenterName(row.centerName) }) }}
                    </div>
                  </div>
                  <div v-else class="text-[11px] text-[#8A9A8F]">
                    {{ $t('agent.stationCancelledNotice') }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="storeAreaSqM" :label="$t('agent.colStoreArea')" width="95" align="right">
                <template #default="{ row }">
                  <span class="font-mono font-medium">{{ row.storeAreaSqM }} ㎡</span>
                </template>
              </el-table-column>

              <el-table-column prop="status" :label="$t('agent.colStatus')" width="130" align="center">
                <template #default="{ row }">
                  <el-tag
                    size="small"
                    :type="isNormalAgentStatus(row.status) ? 'success' : 'danger'"
                    effect="light"
                  >
                    {{ formatAgentStatus(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- 操作列：管理角色支持监管与查看，代理商支持轮替转移/注销 (图标按钮 + tooltip) -->
              <el-table-column :label="$t('agent.colActions')" width="104" fixed="right" align="center">
                <template #default="{ row }">
                  <div v-if="isAdmin" class="flex items-center justify-center gap-1">
                    <el-tooltip :content="$t('agent.actionLegalSupervision')" placement="top">
                      <el-button size="small" type="primary" plain circle @click="$router.push('/admin')">
                        <el-icon><View /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="$t('agent.actionComplianceTrace')" placement="top">
                      <el-button size="small" type="info" plain circle @click="openWorkflowOverview">
                        <el-icon><Compass /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>
                  <div v-else class="flex items-center justify-center gap-1">
                    <!-- 正常营业状态：支持轮替或注销 -->
                    <template v-if="row.isCurrentActive || row.status === '正常营业'">
                      <el-tooltip :content="$t('agent.actionHandleRotation')" placement="top">
                        <el-button size="small" type="warning" plain circle @click="handleOpenRotation(row.centerId)">
                          <el-icon><Switch /></el-icon>
                        </el-button>
                      </el-tooltip>
                      <el-tooltip :content="$t('agent.actionHandleCancellation')" placement="top">
                        <el-button size="small" type="danger" plain circle @click="handleOpenCancellation(row)">
                          <el-icon><CircleClose /></el-icon>
                        </el-button>
                      </el-tooltip>
                    </template>

                    <!-- 已注销状态：支持恢复或重新申请 -->
                    <template v-else>
                      <el-tooltip :content="$t('agent.actionHandleRestoration')" placement="top">
                        <el-button size="small" type="primary" plain circle @click="handleOpenRestoration(row.centerId)">
                          <el-icon class="rtl-mirror-icon"><RefreshRight /></el-icon>
                        </el-button>
                      </el-tooltip>
                      <el-tooltip :content="$t('agent.actionHandleReapply')" placement="top">
                        <el-button size="small" type="success" plain circle @click="handleOpenApply(row.centerId)">
                          <el-icon><Plus /></el-icon>
                        </el-button>
                      </el-tooltip>
                    </template>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页控件 -->
            <div
              class="flex items-center justify-between pt-3 text-xs border-t border-[#E9F1EB]"
              :class="isAppMode ? 'flex-col gap-2 items-center' : ''"
            >
              <div class="text-[#8A9A8F] text-[11px]">
                {{ $t('agent.pageInfo', { current: myCentersCurrentPage, total: Math.ceil(filteredAgents.length / myCentersPageSize) || 1 }) }}
              </div>
              <el-pagination
                v-model:current-page="myCentersCurrentPage"
                v-model:page-size="myCentersPageSize"
                :page-sizes="[5, 10, 20]"
                :total="filteredAgents.length"
                :layout="isAppMode ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                size="small"
                background
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- ======================================================== -->
        <!-- TAB 2: 代理订单记录 (集中采购订货流水) -->
        <!-- ======================================================== -->
        <el-tab-pane name="g2bOrders" lazy>
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><Van /></el-icon>
              <span class="font-bold">{{ $t('agent.tabAgentOrders') || '代理订单' }}</span>
              <el-tag size="small" type="primary" effect="plain" class="scale-90 origin-left rtl:origin-right">{{ $t('agent.tagWholesaleOrders') || '集中采购' }}</el-tag>
            </div>
          </template>
          <div class="py-4">
            <AgentOrdersView />
          </div>
        </el-tab-pane>

        <!-- ======================================================== -->
        <!-- TAB 3: 代理订单统计分析 (根据代理订单统计分析生成图表) -->
        <!-- ======================================================== -->
        <el-tab-pane name="orderAnalytics" lazy>
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><DataAnalysis /></el-icon>
              <span class="font-bold">{{ $t('agent.tabOrderAnalytics') || '库存台账' }}</span>
              <el-tag size="small" type="success" effect="plain" class="scale-90 origin-left rtl:origin-right">{{ $t('agent.tagAnalyticsCharts') || '分析图表' }}</el-tag>
            </div>
          </template>
          <div class="py-4 space-y-4">
            <div class="p-3.5 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/80 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#2F7A50]"></span>
                <span class="font-bold text-[#1F3326]">{{ $t('agent.orderAnalyticsBannerTitle') }}</span>
              </div>
              <span class="text-[11px] text-[#8A9A8F]">{{ $t('agent.orderAnalyticsBannerSub') }}</span>
            </div>
            <AgentInventoryLedger />
          </div>
        </el-tab-pane>

        <!-- ======================================================== -->
        <!-- TAB 3: 支付凭据 (支持多条件过滤与分页) -->
        <!-- ======================================================== -->
        <el-tab-pane v-if="!hideCenterTabs" name="applications">
          <template #label>
            <div class="flex items-center gap-1.5 py-1">
              <el-icon><DocumentChecked /></el-icon>
              <span class="font-bold">{{ $t('agent.applications') }}</span>
              <el-badge :value="filteredApplications.length" type="info" class="ms-1" />
            </div>
          </template>

          <div class="py-4 space-y-4">
            <!-- 过滤查询条件工具栏 (需求 3) -->
            <div class="p-3.5 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.receipts.filterKeywordLabel') }}</span>
                <el-input
                  v-model="appKeyword"
                  :placeholder="$t('agent.receipts.filterKeywordPlaceholder')"
                  clearable
                  size="small"
                  @input="applicationsCurrentPage = 1"
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
              <div>
                <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.receipts.filterTypeLabel') }}</span>
                <el-select v-model="appTypeFilter" class="w-full" size="small" @change="applicationsCurrentPage = 1">
                  <el-option :label="$t('agent.receipts.filterTypeAll')" value="全部" />
                  <el-option :label="$t('agent.receipts.typeGrant')" value="GRANT" />
                  <el-option :label="$t('agent.receipts.typeRotation')" value="ROTATION" />
                  <el-option :label="$t('agent.receipts.typeRestoration')" value="RESTORATION" />
                  <el-option :label="$t('agent.receipts.typeCancellation')" value="CANCELLATION" />
                </el-select>
              </div>
              <div>
                <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.receipts.filterPayLabel') }}</span>
                <el-select v-model="appPayStatusFilter" class="w-full" size="small" @change="applicationsCurrentPage = 1">
                  <el-option :label="$t('agent.receipts.filterPayAll')" value="全部" />
                  <el-option :label="$t('agent.receipts.payPaid')" value="PAID" />
                  <el-option :label="$t('agent.receipts.payUnpaid')" value="UNPAID" />
                  <el-option :label="$t('agent.receipts.payFree')" value="FREE" />
                </el-select>
              </div>
              <div>
                <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agent.receipts.filterArticleLabel') }}</span>
                <el-select v-model="appArticle140Filter" class="w-full" size="small" @change="applicationsCurrentPage = 1">
                  <el-option :label="$t('agent.receipts.filterArticleAll')" value="全部" />
                  <el-option :label="$t('agent.receipts.article140')" value="true" />
                  <el-option :label="$t('agent.receipts.articleNormal')" value="false" />
                </el-select>
              </div>
              <div class="flex items-end gap-2">
                <el-button size="small" type="primary" class="flex-1" @click="applicationsCurrentPage = 1">
                  <el-icon class="me-1"><Search /></el-icon>
                  {{ $t('agent.receipts.btnSearch') }}
                </el-button>
                <el-button size="small" class="flex-1" @click="handleResetAppFilter">
                  {{ $t('agent.receipts.btnReset') }}
                </el-button>
              </div>
            </div>

            <!-- 列表信息与精简介绍词 -->
            <div class="flex items-center justify-between text-xs px-1 text-[#58685D]">
              <span class="text-[11px]">{{ $t('agent.receipts.listIntro') }}</span>
              <span class="text-[11px] font-mono">{{ $t('agent.receipts.matchCount', { count: filteredApplications.length }) }}</span>
            </div>

            <!-- 支付凭据工单表格 -->
            <el-table
              :data="pagedApplications"
              v-loading="loadingApplications"
              border
              style="width: 100%"
              class="text-xs"
            >
              <el-table-column prop="ticketNo" :label="$t('agent.receipts.colTicketNo')" width="180">
                <template #default="{ row }">
                  <span class="font-mono font-bold text-[#1F3326]">{{ row.ticketNo }}</span>
                  <div class="text-[10px] text-[#8A9A8F]">{{ row.submitTime }}</div>
                </template>
              </el-table-column>

              <el-table-column prop="typeName" :label="$t('agent.receipts.colType')" width="150">
                <template #default="{ row }">
                  <el-tooltip :content="row.typeName" placement="top">
                    <div class="font-bold text-[#1F3326] truncate">{{ formatReceiptTypeShort(row.typeName) }}</div>
                  </el-tooltip>
                  <div class="text-[10px]" :class="row.isArticle140 ? 'text-[#C9A13B] font-semibold' : 'text-[#8A9A8F]'">
                    {{ row.isArticle140 ? $t('agent.receipts.tagArticle140Short') : $t('agent.receipts.articleNormalShort') }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column :label="$t('agent.receipts.colCenter')" min-width="190">
                <template #default="{ row }">
                  <span class="font-semibold text-[#1F3326]">{{ row.centerName }}</span>
                  <div class="text-[10px] text-[#8A9A8F]">{{ row.province }} · {{ $t('agent.receipts.categoryLabel', { category: row.category }) }}</div>
                </template>
              </el-table-column>

              <el-table-column prop="applicantName" :label="$t('agent.receipts.colApplicant')" width="140" />

              <el-table-column :label="$t('agent.receipts.colFee')" width="130" align="right">
                <template #default="{ row }">
                  <div v-if="row.feeAmount > 0">
                    <span class="font-mono font-bold text-[#1F3326]">{{ row.feeAmount.toLocaleString() }} IQD</span>
                    <div>
                      <el-tag size="small" :type="row.feePaid ? 'success' : 'warning'" effect="plain">
                        {{ row.feePaid ? $t('agent.receipts.tagPaid') : $t('agent.receipts.tagUnpaid') }}
                      </el-tag>
                    </div>
                  </div>
                  <div v-else class="text-[#8A9A8F] text-[11px]">{{ $t('agent.receipts.freeFee') }}</div>
                </template>
              </el-table-column>

              <el-table-column prop="status" :label="$t('agent.receipts.colStatus')" width="140" align="center">
                <template #default="{ row }">
                  <el-tag
                    size="small"
                    :type="isCompletedStatus(row.status) ? 'success' : (isPendingStatus(row.status) ? 'warning' : 'primary')"
                    effect="light"
                  >
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column :label="$t('agent.receipts.colAction')" width="88" fixed="right" align="center">
                <template #default="{ row }">
                  <el-tooltip
                    v-if="!row.feePaid && isPayPendingStatus(row.status)"
                    :content="$t('agent.receipts.btnPayNow')"
                    placement="top"
                  >
                    <el-button size="small" type="success" circle @click="handlePayExistingTicket(row)">
                      <el-icon><Money /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip v-else :content="$t('agent.receipts.btnDetail')" placement="top">
                    <el-button size="small" type="primary" plain circle @click="handleViewTicketDetail(row)">
                      <el-icon><View /></el-icon>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页控件 -->
            <div class="flex items-center justify-between pt-3 text-xs border-t border-[#E9F1EB]">
              <div class="text-[#8A9A8F] text-[11px]">
                {{ $t('agent.receipts.pageInfo', { page: applicationsCurrentPage, total: Math.ceil(filteredApplications.length / applicationsPageSize) || 1 }) }}
              </div>
              <el-pagination
                v-model:current-page="applicationsCurrentPage"
                v-model:page-size="applicationsPageSize"
                :page-sizes="[5, 10, 20]"
                :total="filteredApplications.length"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                background
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ======================================================== -->
    <!-- 3. 弹窗组件挂载 -->
    <!-- ======================================================== -->
    <!-- 1. 申请代理权 (新授予) 向导弹窗 -->
    <AgentApplyModal
      ref="applyModalRef"
      :center-options="article140Centers"
      @success="handleBusinessSuccess"
    />

    <!-- 2. 代理权轮替 (转移) 向导弹窗 -->
    <AgentRotationModal
      ref="rotationModalRef"
      :center-options="article140Centers"
      @success="handleBusinessSuccess"
    />

    <!-- 3. 恢复已注销代理权向导弹窗 -->
    <AgentRestorationModal
      ref="restorationModalRef"
      :center-options="article140Centers"
      @success="handleBusinessSuccess"
    />

    <!-- 4. 注销代理中心确认弹窗 (满足中心已被代理需先注销才能申请) -->
    <AgentCancellationModal
      ref="cancellationModalRef"
      @success="handleBusinessSuccess"
    />

    <!-- 5. 业务全景时序与约束规则全貌抽屉 -->
    <AgentWorkflowOverviewDrawer ref="workflowDrawerRef" />

    <!-- 工单详情查看抽屉 -->
    <el-drawer v-model="drawerVisible" title="代理审批工单与联合委员会审查报告" size="520px">
      <div v-if="selectedTicket" class="space-y-4 text-xs">
        <div class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] space-y-2">
          <div class="flex justify-between">
            <span class="text-[#58685D]">工单编号：</span>
            <span class="font-mono font-bold text-[#1F3326]">{{ selectedTicket.ticketNo }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#58685D]">业务类型：</span>
            <span class="font-bold text-[#1F3326]">{{ selectedTicket.typeName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#58685D]">关联中心：</span>
            <span class="font-medium text-[#1F3326]">{{ selectedTicket.centerName }} ({{ selectedTicket.province }})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#58685D]">法定规费：</span>
            <span class="font-mono font-bold text-[#2F7A50]">{{ selectedTicket.feeAmount.toLocaleString() }} IQD</span>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-bold text-[#1F3326]">审查与推进批注：</h4>
          <div class="p-3 bg-[#EFF5F1] border border-[#C7DED0] rounded-lg text-[#1F3326] leading-relaxed text-[11px]">
            {{ selectedTicket.auditNotes || '已按法定程序进入数字化两级审批与现场联合抽查环节。' }}
          </div>
        </div>

        <div v-if="selectedTicket.committeeMembers?.length" class="space-y-2">
          <h4 class="font-bold text-[#1F3326]">联合实地检查委员会成员意见：</h4>
          <div class="space-y-1.5">
            <div
              v-for="(member, idx) in selectedTicket.committeeMembers"
              :key="idx"
              class="p-2.5 rounded-lg border border-[#D9E5DB] flex items-center justify-between"
            >
              <div>
                <span class="font-medium text-[#1F3326]">{{ member.dept }}</span>
                <span class="text-[10px] text-[#8A9A8F] ms-1">({{ member.officer }})</span>
              </div>
              <el-tag size="small" type="success" effect="plain">{{ member.status }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { isEnNow } from '../../utils/langHint.js';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';

const { t, locale } = useI18n();
const route = useRoute();

// 语言无关的工单状态判断（zh/en mock 数据源状态值均可达；ar/ku 回退 en）
const isCompletedStatus = (status) => /已完成|Completed/i.test(status || '');
const isPendingStatus = (status) => /待|Pending/i.test(status || '');
const isPayPendingStatus = (status) => /待电子支付|待支付|Pending/i.test(status || '');
// 网点营业状态（zh「正常」/ en Active·Operational·Assigned）
const isNormalAgentStatus = (status) => /正常|Active|Operational|Assigned/i.test(status || '');
const router = useRouter();
const isEn = computed(() => locale.value === 'en');
const isAr = computed(() => locale.value === 'ar');
const isKu = computed(() => locale.value === 'ckb');
const isAppMode = computed(() => {
  return route.query.layout === 'app' ||
    sessionStorage.getItem('rcm_layout_mode') === 'app' ||
    window.innerWidth <= 768;
});

// 列表数据字段四语国际化函数
const formatCenterName = (centerName) => {
  if (!centerName) return '';
  if (isEn.value) {
    if (centerName.includes('卡尔赫第一') || centerName.includes('曼苏尔')) return 'Mansour Central Ration Center';
    if (centerName.includes('哈奈根') || centerName.includes('Khanaqin')) return 'Khanaqin 1st Ration Center';
    if (centerName.includes('卡拉达第一')) return 'Karrada 1st Ration Center';
    if (centerName.includes('鲁萨法第二')) return 'Rusafa 2nd Food Security Center';
    if (centerName.includes('巴士拉港口') || centerName.includes('阿沙尔')) return 'Basra Port Fair-Price Ration Center';
    if (centerName.includes('迪亚拉')) return 'Diyala Khanaqin Supply Station';
    if (centerName.includes('摩苏尔')) return 'Mosul Old City Security Agency';
    if (centerName.includes('亚尔穆克')) return 'Yarmouk 3rd Community Station';
    if (centerName.includes('萨德尔城')) return 'Sadr City Flour Distribution Center';
    if (centerName.includes('卡达米亚')) return 'Kadhimiya 2nd Ration Center';
  } else if (isAr.value) {
    if (centerName.includes('卡尔赫第一') || centerName.includes('曼苏尔') || centerName.includes('Mansour')) return 'مركز المنصور المركزي للتموين';
    if (centerName.includes('哈奈根') || centerName.includes('Khanaqin')) return 'مركز خانقين الأول للتموين (المادة 140)';
    if (centerName.includes('卡拉达第一')) return 'مركز توزيع الكرادة الأول';
    if (centerName.includes('鲁萨法第二')) return 'مركز الرصافة الثاني للأمن الغذائي';
    if (centerName.includes('巴士拉港口') || centerName.includes('阿沙尔')) return 'مركز ميناء البصرة للسلع التموينية';
    if (centerName.includes('迪亚拉')) return 'منفذ خانقين التمويني بديالى';
    if (centerName.includes('摩苏尔')) return 'وكالة الموصل القديمة للضمان الغذائي';
    if (centerName.includes('亚尔穆克')) return 'مركز اليرموك التمويني الثالث';
    if (centerName.includes('萨德尔城') || centerName.includes('Sadr City')) return 'مركز مدينة الصدر لتوزيع الطحين';
    if (centerName.includes('卡达米亚')) return 'مركز الكاظمية الثاني للتموين';
  } else if (isKu.value) {
    if (centerName.includes('卡尔赫第一') || centerName.includes('曼苏尔') || centerName.includes('Mansour')) return 'ناوەندی بەشەخۆراکی مەنسوور';
    if (centerName.includes('哈奈根') || centerName.includes('Khanaqin')) return 'ناوەندی یەکەمی بەشەخۆراکی خانەقین';
    if (centerName.includes('卡拉达第一')) return 'ناوەندی یەکەمی دابەشکردنی کەرادە';
    if (centerName.includes('鲁萨法第二')) return 'ناوەندی دووەمی ئاسایشی خۆراک لە ڕەصافە';
    if (centerName.includes('巴士拉港口') || centerName.includes('阿沙尔')) return 'ناوەندی بەشەخۆراکی بەندەری بەسرە';
    if (centerName.includes('迪亚拉')) return 'بنکەی بەشەخۆراکی خانەقین لە دیالە';
    if (centerName.includes('摩苏尔')) return 'بنکەی دابینکردنی خۆراک لە مووسڵی کۆن';
    if (centerName.includes('亚尔穆克')) return 'بنکەی سێیەمی بەشەخۆراکی یەرمووک';
    if (centerName.includes('萨德尔城') || centerName.includes('Sadr City')) return 'ناوەندی دابەشکردنی ئارد لە شاری سەدر';
    if (centerName.includes('卡达米亚')) return 'ناوەندی دووەمی بەشەخۆراکی کازمیە';
  }
  return centerName;
};

const formatStoreName = (name) => {
  if (!name) return '';
  if (isEn.value) {
    if (name.includes('卡尔赫第一') || name.includes('101')) return 'Karkh 1st Distribution Station';
    if (name.includes('哈奈根第一') || name.includes('496')) return 'Khanaqin 1st Border Supply Station';
    if (name.includes('萨德尔城') || name.includes('108')) return 'Sadr City 5th Flour Agency Outlet';
    if (name.includes('鲁萨法') || name.includes('102')) return 'Rusafa Flour Special Agency Outlet';
    if (name.includes('巴士拉') || name.includes('201')) return 'Basra Ashar Port Joint Agency Station';
    if (name.includes('拉希德')) return 'Al-Rasheed Community Supply Outlet';
    return name.replace(/便民/g, 'Community ').replace(/代销点/g, ' Agency Outlet').replace(/综合代销站/g, ' Distribution Station').replace(/保供站/g, ' Supply Station');
  } else if (isAr.value) {
    if (name.includes('卡尔赫第一') || name.includes('101') || name.includes('Karkh 1st')) return 'منفذ توزيع الكرخ الأول الشامل';
    if (name.includes('哈奈根第一') || name.includes('496') || name.includes('Khanaqin 1st')) return 'محطة خانقين الأولى الحدودية';
    if (name.includes('萨德尔城') || name.includes('108') || name.includes('Sadr City')) return 'منفذ مدينة الصدر المركزي الخامس للطحين';
    if (name.includes('鲁萨法') || name.includes('102')) return 'منفذ الرصافة التمويني للطحين';
    if (name.includes('巴士拉') || name.includes('201')) return 'محطة ميناء البصرة المشتركة';
    if (name.includes('拉希德')) return 'منفذ الرشيد للتموين الميسر';
  } else if (isKu.value) {
    if (name.includes('卡尔赫第一') || name.includes('101') || name.includes('Karkh 1st')) return 'بنکەی یەکەمی دابەشکردنی کەرخ';
    if (name.includes('哈奈根第一') || name.includes('496') || name.includes('Khanaqin 1st')) return 'بنکەی سنووری یەکەمی خانەقین';
    if (name.includes('萨德尔城') || name.includes('108') || name.includes('Sadr City')) return 'بنکەی پێنجەمی ئارد لە شاری سەدر';
    if (name.includes('鲁萨法') || name.includes('102')) return 'بنکەی ئاردی ڕەصافە';
    if (name.includes('巴士拉') || name.includes('201')) return 'بنکەی بەندەری بەسرە';
    if (name.includes('拉希德')) return 'بنکەی خزمەتگوزاری ڕەشید';
  }
  return name;
};

const formatAddress = (address) => {
  if (!address) return '';
  if (isEn.value) {
    if (address.includes('曼苏尔商业街18号')) return '18 Mansour Commercial St, Karkh, Baghdad';
    if (address.includes('粮库路12号')) return '12 Granary Rd, Old Town, Khanaqin';
    if (address.includes('中央大道第5区综合楼')) return 'Bldg 5, Central Blvd, Sadr City, Baghdad';
    if (address.includes('工业路9号')) return '9 Industry Rd, Rusafa, Baghdad';
    if (address.includes('阿夏尔码头大道77号')) return '77 Ashar Port Blvd, Basra';
    if (address.includes('贾劳拉')) return 'Near Jalawla Main Transit Hub, Diyala';
    if (address.includes('萨阿迪耶')) return 'Block 3, Saadiya Oasis Blvd, Diyala';
    if (address.includes('曼德利')) return '15 Market St, Mandali, Diyala';
  } else if (isAr.value) {
    if (address.includes('曼苏尔商业街18号') || address.includes('Mansour Commercial')) return 'شارع المنصور التجاري 18، الكرخ، بغداد';
    if (address.includes('粮库路12号')) return 'شارع مستودع الحبوب 12، خانقين';
    if (address.includes('中央大道第5区综合楼')) return 'مبنى 5، شارع الصدر المركزي، بغداد';
    if (address.includes('工业路9号')) return 'شارع الصناعة 9، الرصافة، بغداد';
    if (address.includes('阿夏尔码头大道77号')) return 'شارع رصيف العشار 77، البصرة';
  } else if (isKu.value) {
    if (address.includes('曼苏尔商业街18号') || address.includes('Mansour Commercial')) return 'شەقامی بازرگانی مەنسوور ١٨، بەغدا';
    if (address.includes('粮库路12号')) return 'شەقامی کۆگای دانەوێڵە ١٢، خانەقین';
    if (address.includes('中央大道第5区综合楼')) return 'بینای ٥، شەقامی ناوەندی شاری سەدر، بەغدا';
  }
  return address;
};

const formatProvince = (province) => {
  if (!province) return '';
  if (isAr.value || isKu.value) {
    const localized = provinceLabel(t, locale.value, province);
    if (localized !== province) return localized;
  }
  if (province.includes('巴格达')) return isEn.value ? 'Baghdad Province' : isAr.value ? 'محافظة بغداد' : isKu.value ? 'Parêzgeha Bexdayê' : '巴格达省';
  if (province.includes('迪亚拉')) return isEn.value ? 'Diyala Province' : isAr.value ? 'محافظة ديالى' : isKu.value ? 'Parêzgeha Diyala' : '迪亚拉省';
  if (province.includes('基尔库克')) return isEn.value ? 'Kirkuk Province' : isAr.value ? 'محافظة كركوك' : isKu.value ? 'Parêzgeha Kerkûkê' : '基尔库克省';
  if (province.includes('尼尼微')) return isEn.value ? 'Nineveh Province' : isAr.value ? 'محافظة نينوى' : isKu.value ? 'Parêzgeha Nînewa' : '尼尼微省';
  if (province.includes('巴士拉')) return isEn.value ? 'Basra Province' : isAr.value ? 'محافظة البصرة' : isKu.value ? 'Parêzgeha Besrayê' : '巴士拉省';
  if (province.includes('安巴尔')) return isEn.value ? 'Anbar Province' : isAr.value ? 'محافظة الأنبار' : isKu.value ? 'Parêzgeha Enbarê' : '安巴尔省';
  return province;
};

const formatBranchName = (branch) => {
  if (!branch) return '';
  if (isEn.value) {
    if (branch.includes('卡尔赫第一') || branch.includes('卡尔赫')) return 'Karkh 1st Grain Supply Branch';
    if (branch.includes('迪亚拉')) return 'Diyala Eastern Grain Supply Branch';
    if (branch.includes('鲁萨法第二') || branch.includes('鲁萨法')) return 'Rusafa 2nd Grain Supply Branch';
    if (branch.includes('卡拉达')) return 'Karrada Branch';
    if (branch.includes('曼苏尔')) return 'Mansour Branch';
    if (branch.includes('巴士拉')) return 'Basra Port Grain Supply Branch';
    if (branch.includes('粮食供应') || branch.includes('粮食保障')) return 'Grain Supply Branch';
  } else if (isAr.value) {
    if (branch.includes('卡尔赫第一') || branch.includes('卡尔赫') || branch.includes('Karkh')) return 'فرع الكرخ الأول للإمداد الغذائي';
    if (branch.includes('迪亚拉')) return 'فرع شرق ديالى للإمداد الغذائي';
    if (branch.includes('鲁萨法第二') || branch.includes('鲁萨法') || branch.includes('Rusafa')) return 'فرع الرصافة الثاني للإمداد الغذائي';
    if (branch.includes('卡拉达')) return 'فرع الكرادة';
    if (branch.includes('曼苏尔')) return 'فرع المنصور';
    if (branch.includes('巴士拉')) return 'فرع ميناء البصرة للإمداد الغذائي';
  } else if (isKu.value) {
    if (branch.includes('卡尔赫') || branch.includes('Karkh')) return 'لقی دابینکردنی خۆراکی کەرخ';
    if (branch.includes('迪亚拉')) return 'لقی دابینکردنی خۆراکی دیالە';
    if (branch.includes('鲁萨法') || branch.includes('Rusafa')) return 'لقی دابینکردنی خۆراکی ڕەصافە';
    if (branch.includes('卡拉达')) return 'لقی کەرادە';
    if (branch.includes('曼苏尔')) return 'لقی مەنسوور';
    if (branch.includes('巴士拉')) return 'لقی دابینکردنی خۆراکی بەسرە';
  }
  return branch;
};

// 品类短标签 (完整词条 tooltip 展示)
const formatCategoryShort = (cat) => {
  const full = formatCategory(cat);
  if (full.includes('综合') || full.includes('General')) return t('agent.catComprehensiveShort');
  if (full.includes('食品') || full.includes('Food')) return t('agent.catFoodShort');
  if (full.includes('面粉') || full.includes('Flour')) return t('agent.catFlourShort');
  return full;
};

// 支付凭据类型短名 (去掉费用后缀，全称 tooltip 展示)
const formatReceiptTypeShort = (name) => (name ? String(name).replace(/\s*[(（].*?[)）]\s*$/, '') : '');

const formatCategory = (cat) => {
  if (!cat) return '';
  if (cat.includes('综合') || cat.toLowerCase().includes('compre') || cat.toLowerCase().includes('general')) {
    return t('agent.catComprehensive') || (isEn.value ? 'General (Food + Flour)' : isAr.value ? 'عام' : isKu.value ? 'Gشتی' : '综合');
  }
  if (cat.includes('食品') || cat.toLowerCase().includes('food')) {
    return t('agent.catFood') || (isEn.value ? 'Food' : isAr.value ? 'مواد غذائية' : isKu.value ? 'Xwarin' : '食品');
  }
  if (cat.includes('面粉') || cat.toLowerCase().includes('flour')) {
    return t('agent.catFlour') || (isEn.value ? 'Flour' : isAr.value ? 'طحين' : isKu.value ? 'Arv' : '面粉');
  }
  return cat;
};

const formatOwnerName = (name) => {
  if (!name) return isEn.value ? 'Authorized Agent' : isAr.value ? 'الوكيل المعتمد' : isKu.value ? 'بریکاری ڕێپێدراو' : '代销专员';
  if (name.includes('穆罕默德') || name.includes('贾巴尔') || name.includes('拉希德') || /Mohammed.*Jabbar/i.test(name)) {
    return isEn.value ? 'Mohammed Jabbar Al-Rasheed' : isAr.value ? 'محمد جبار الرشيد' : isKu.value ? 'محەمەد جەبار ڕەشید' : '穆罕默德·贾巴尔·拉希德';
  }
  if (name.includes('扎伊德')) return isEn.value ? 'Zaid Qasim Al-Saadi' : isAr.value ? 'زيد قاسم السعدي' : isKu.value ? 'زەید قاسم سەعدی' : name;
  if (name.includes('奥马尔')) return isEn.value ? 'Omar Sabah Al-Nasir' : isAr.value ? 'عمر صباح الناصر' : isKu.value ? 'عومەر سەباح ناسر' : name;
  return name;
};

const formatAgentStatus = (st) => {
  if (!st) return '';
  const s = String(st).trim();
  if (s.includes('正常') || s.includes('Active') || s.includes('Operational') || s.includes('Assigned')) {
    return t('agent.statusNormal') || (isEn.value ? 'Normal' : isAr.value ? 'تشغيل عادي' : isKu.value ? 'Çalak' : '正常营业');
  }
  if (s.includes('注销') || s.includes('Cancelled') || s.includes('Revoked') || s.includes('Deregistered')) {
    return t('agent.statusCancelled') || (isEn.value ? 'Cancelled' : isAr.value ? 'ملغى' : isKu.value ? 'Hatiye betalkirin' : '已注销');
  }
  if (s.includes('容量') || s.includes('Capacity')) {
    return isEn.value ? 'Capacity Warning' : isAr.value ? 'تحذير السعة' : isKu.value ? 'هۆشداری بارستایی' : '容量预警';
  }
  return st;
};
import { ElMessage } from 'element-plus';
import { provinceLabel } from '../../utils/dataLabels.js';
import {
  getMyAgentCenters,
  getArticle140Centers,
  getAgentProfile,
  getAgentApplications,
  getAgentList,
  payAgentApplicationFee
} from '../../api/agent.js';
import {
  IRAQ_19_PROVINCES,
  IRAQ_PROVINCE_CITIES
} from '../../mock/data/iraqRegionWarehouses.js';

// 子组件导入
import AgentApplyModal from './components/AgentApplyModal.vue';
import AgentRotationModal from './components/AgentRotationModal.vue';
import AgentRestorationModal from './components/AgentRestorationModal.vue';
import AgentCancellationModal from './components/AgentCancellationModal.vue';
import AgentOrdersView from './AgentOrdersView.vue';
import AgentInventoryLedger from './components/AgentInventoryLedger.vue';
import AgentWorkflowOverviewDrawer from './components/AgentWorkflowOverviewDrawer.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';

// 图标导入
import {
  Shop,
  Plus,
  Switch,
  RefreshRight,
  Share,
  Refresh,
  OfficeBuilding,
  LocationFilled,
  UserFilled,
  Document,
  DocumentChecked,
  Compass,
  InfoFilled,
  Search,
  Guide,
  Van,
  FullScreen,
  DataAnalysis,
  Connection,
  View,
  CircleClose,
  Money
} from '@element-plus/icons-vue';

// 响应式数据
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);
const workflowDrawerRef = ref(null);

const openWorkflowOverview = () => {
  workflowDrawerRef.value?.open();
};

// 代理端 APP 视口：隐藏「已代理中心」「支付凭据」2 个选项卡 (代理订单记录/统计分析已拆分为独立大模块)
const hideCenterTabs = computed(() => isAppMode.value && !isAdmin.value);
const validTabs = computed(() =>
  hideCenterTabs.value
    ? ['g2bOrders', 'orderAnalytics']
    : ['myCenters', 'g2bOrders', 'orderAnalytics', 'applications']
);
const activeTab = ref(validTabs.value.includes(route.query.tab) ? route.query.tab : validTabs.value[0]);
const myCenters = ref([]);
const allAgents = ref([]);
const article140Centers = ref([]);
const applications = ref([]);
const agentProfile = ref(null);

// 加载状态
const loadingMyCenters = ref(false);
const loadingAllAgents = ref(false);
const loadingArticle140 = ref(false);
const loadingApplications = ref(false);

// 筛选条件与分页状态 (已代理中心，需求 2)
const myCenterKeyword = ref('');
const myCenterProvinceFilter = ref('全部');
const myCenterCategoryFilter = ref('全部');
const myCenterStatusFilter = ref('全部');
const myCentersCurrentPage = ref(1);
const myCentersPageSize = ref(5);

// 筛选条件与分页状态 (省份与中心：19省、300+市、600仓库，支持第140号决议标识)
const filterProvince = ref('全部');
const filterCity = ref('全部');
const filterArticle140 = ref('');
const filterCenterStatus = ref('全部');
const searchKeyword = ref('');
const provinceCentersCurrentPage = ref(1);
const provinceCentersPageSize = ref(10);

// 筛选条件与分页状态 (支付凭据，需求 3)
const appKeyword = ref('');
const appTypeFilter = ref('全部');
const appPayStatusFilter = ref('全部');
const appArticle140Filter = ref('全部');
const applicationsCurrentPage = ref(1);
const applicationsPageSize = ref(5);
const applicationTypeFilter = ref('全部');

// 弹窗组件引用
const applyModalRef = ref(null);
const rotationModalRef = ref(null);
const restorationModalRef = ref(null);
const cancellationModalRef = ref(null);

// 工单详情抽屉
const drawerVisible = ref(false);
const selectedTicket = ref(null);

// 计算属性
const myArticle140Count = computed(() => {
  return myCenters.value.filter((c) => c.isArticle140).length;
});

const totalHouseholdsServed = computed(() => {
  const source = isAdmin.value && allAgents.value.length ? allAgents.value : myCenters.value;
  return source.reduce((acc, cur) => acc + (cur.householdsCount || 0), 0);
});

const activeApplicationsCount = computed(() => {
  return applications.value.filter((a) => !a.feePaid || a.status.includes('中')).length;
});

// 代销网点列表数据源 (支持管理员查看全部代理网点，代理商查看名下网点)
const currentAgentsSource = computed(() => {
  if (isAdmin.value && allAgents.value.length) {
    return allAgents.value;
  }
  return myCenters.value.length ? myCenters.value : allAgents.value;
});

// 代理列表过滤 (所有代理列表 / 已代理中心)
const filteredAgents = computed(() => {
  return currentAgentsSource.value.filter((c) => {
    // 关键字过滤
    if (myCenterKeyword.value.trim()) {
      const kw = myCenterKeyword.value.trim().toLowerCase();
      const matchName = (c.centerName || '').toLowerCase().includes(kw);
      const matchStore = (c.name || '').toLowerCase().includes(kw);
      const matchId = (c.id || '').toLowerCase().includes(kw);
      const matchAddr = (c.address || '').toLowerCase().includes(kw);
      const matchOwner = (c.ownerName || '').toLowerCase().includes(kw);
      const matchPhone = (c.phone || '').toLowerCase().includes(kw);
      if (!matchName && !matchStore && !matchId && !matchAddr && !matchOwner && !matchPhone) return false;
    }
    // 所属省份
    if (myCenterProvinceFilter.value !== '全部') {
      if (!c.province?.includes(myCenterProvinceFilter.value)) return false;
    }
    // 经营品类
    if (myCenterCategoryFilter.value !== '全部') {
      if (!c.agentType?.includes(myCenterCategoryFilter.value)) return false;
    }
    // 营业状态
    if (myCenterStatusFilter.value !== '全部') {
      if (!c.status?.includes(myCenterStatusFilter.value)) return false;
    }
    return true;
  });
});

// 代理列表分页切片
const pagedAgents = computed(() => {
  const start = (myCentersCurrentPage.value - 1) * myCentersPageSize.value;
  return filteredAgents.value.slice(start, start + myCentersPageSize.value);
});

// 兼容别名
const filteredMyCenters = filteredAgents;
const pagedMyCenters = pagedAgents;

function handleResetMyCentersFilter() {
  myCenterKeyword.value = '';
  myCenterProvinceFilter.value = '全部';
  myCenterCategoryFilter.value = '全部';
  myCenterStatusFilter.value = '全部';
  myCentersCurrentPage.value = 1;
  fetchAllAgents();
}

// 支付凭据过滤 (需求 3)
const filteredApplications = computed(() => {
  return applications.value.filter((app) => {
    // 关键字过滤
    if (appKeyword.value.trim()) {
      const kw = appKeyword.value.trim().toLowerCase();
      const matchNo = (app.ticketNo || '').toLowerCase().includes(kw);
      const matchCenter = (app.centerName || '').toLowerCase().includes(kw);
      const matchApplicant = (app.applicantName || '').toLowerCase().includes(kw);
      if (!matchNo && !matchCenter && !matchApplicant) return false;
    }
    // 业务申报类型
    if (appTypeFilter.value !== '全部') {
      if (app.type !== appTypeFilter.value) return false;
    }
    // 支付状态
    if (appPayStatusFilter.value === 'PAID') {
      if (!app.feePaid) return false;
    } else if (appPayStatusFilter.value === 'UNPAID') {
      if (app.feePaid || app.feeAmount <= 0) return false;
    } else if (appPayStatusFilter.value === 'FREE') {
      if (app.feeAmount > 0) return false;
    }
    // 第140号决议属性
    if (appArticle140Filter.value === 'true') {
      if (!app.isArticle140) return false;
    } else if (appArticle140Filter.value === 'false') {
      if (app.isArticle140) return false;
    }
    return true;
  });
});

// 支付凭据分页切片 (需求 3)
const pagedApplications = computed(() => {
  const start = (applicationsCurrentPage.value - 1) * applicationsPageSize.value;
  return filteredApplications.value.slice(start, start + applicationsPageSize.value);
});

function handleResetAppFilter() {
  appKeyword.value = '';
  appTypeFilter.value = '全部';
  appPayStatusFilter.value = '全部';
  appArticle140Filter.value = '全部';
  applicationsCurrentPage.value = 1;
}

// 数据获取方法
async function fetchMyCenters() {
  loadingMyCenters.value = true;
  try {
    const res = await getMyAgentCenters();
    myCenters.value = res || [];
  } finally {
    loadingMyCenters.value = false;
  }
}

async function fetchAllAgents() {
  loadingAllAgents.value = true;
  try {
    const res = await getAgentList({
      province: myCenterProvinceFilter.value,
      category: myCenterCategoryFilter.value,
      status: myCenterStatusFilter.value,
      keyword: myCenterKeyword.value
    });
    allAgents.value = res || [];
  } catch (e) {
    allAgents.value = [];
  } finally {
    loadingAllAgents.value = false;
  }
}

// 省份与中心计算属性与联动 (19省、300+市、600仓库)
const article140CentersCount = computed(() => {
  return article140Centers.value.filter((c) => c.isArticle140).length;
});

const regularCentersCount = computed(() => {
  return article140Centers.value.filter((c) => !c.isArticle140).length;
});

const availableCities = computed(() => {
  if (filterProvince.value === '全部' || !filterProvince.value) {
    return [];
  }
  const provKey = filterProvince.value.split(' ')[0];
  const cities = IRAQ_PROVINCE_CITIES[provKey] || [];
  return cities.map((c) => c.replace('*', ''));
});

// 省份与中心分页切片 (600所中心)
const pagedProvinceCenters = computed(() => {
  const start = (provinceCentersCurrentPage.value - 1) * provinceCentersPageSize.value;
  return article140Centers.value.slice(start, start + provinceCentersPageSize.value);
});

function handleProvinceChange() {
  filterCity.value = '全部';
  provinceCentersCurrentPage.value = 1;
  fetchArticle140Centers();
}

function handleResetProvinceCenterFilter() {
  filterProvince.value = '全部';
  filterCity.value = '全部';
  filterArticle140.value = '';
  filterCenterStatus.value = '全部';
  searchKeyword.value = '';
  provinceCentersCurrentPage.value = 1;
  fetchArticle140Centers();
}

async function fetchArticle140Centers() {
  loadingArticle140.value = true;
  try {
    const params = {
      province: filterProvince.value,
      city: filterCity.value,
      isArticle140: filterArticle140.value,
      status: filterCenterStatus.value,
      keyword: searchKeyword.value
    };
    const res = await getArticle140Centers(params);
    article140Centers.value = res || [];
  } finally {
    loadingArticle140.value = false;
  }
}

async function fetchApplications() {
  loadingApplications.value = true;
  try {
    const params = {
      type: applicationTypeFilter.value
    };
    const res = await getAgentApplications(params);
    applications.value = res || [];
  } finally {
    loadingApplications.value = false;
  }
}

async function fetchProfile() {
  try {
    const res = await getAgentProfile();
    agentProfile.value = res;
  } catch (e) {
    // ignore
  }
}

function loadAllData() {
  fetchMyCenters();
  fetchAllAgents();
  fetchArticle140Centers();
  fetchApplications();
  fetchProfile();
}

// 弹窗打开交互
function handleOpenApply(presetCenterId = '') {
  applyModalRef.value?.open(presetCenterId);
}

function handleOpenRotation(presetCenterId = '') {
  rotationModalRef.value?.open(presetCenterId);
}

function handleOpenRestoration(presetCenterId = '') {
  restorationModalRef.value?.open(presetCenterId);
}

function handleOpenCancellation(center) {
  cancellationModalRef.value?.open(center);
}

function handleViewTicketDetail(ticket) {
  selectedTicket.value = ticket;
  drawerVisible.value = true;
}

async function handlePayExistingTicket(ticket) {
  try {
    await payAgentApplicationFee(ticket.ticketNo, { channel: 'QI_CARD' });
    ElMessage.success((isEnNow() ? `Electronic fee payment for ticket ${ticket.ticketNo} succeeded!` : `工单 ${ticket.ticketNo} 电子规费缴纳成功！`));
    loadAllData();
  } catch (err) {
    // handled
  }
}

function handleBusinessSuccess() {
  loadAllData();
}

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.agent-custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid #D9E5DB;
}
.agent-custom-tabs :deep(.el-tabs__item) {
  padding: 0 16px;
  height: 48px;
  font-size: 13px;
}
</style>
