<template>
  <div class="admin-management-view space-y-4">
    <!-- 顶部后台管理综合调度栏 -->
    <div class="bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
      <ModuleDescTip
        :title="$t('admin.pageTitle') || '全国配给系统后台综合治理与调度中心'"
        :content="$t('admin.pageSubtitle') || '负责全国电子配给卡发卡监管、家庭关系档案治理、网格代销网点全生命周期准入与战略仓储调度。'"
        :badge="$t('admin.centralSupervision') || '中央监管'"
        badge-type="primary"
        title-class="text-sm font-bold text-slate-900"
      >
        <template #icon>
          <div class="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <el-icon :size="16"><Tools /></el-icon>
          </div>
        </template>
        <template #extra>
          <div class="flex items-center gap-2">
            <el-tag size="small" type="primary" effect="dark" class="font-bold">
              {{ currentRoleTitle }}
            </el-tag>
            <el-button
              size="small"
              type="success"
              plain
              class="font-bold text-xs shrink-0"
              @click="activeTab = 'reconciliation'"
            >
              <span>💳 {{ $t('admin.tabReconciliation') || '财政对账与清算' }}</span>
            </el-button>
          </div>
        </template>
      </ModuleDescTip>
    </div>

    <!-- 下方管理模块选项卡 (公民卡、家庭、代理网点、仓储管理) -->
    <!-- 专属职权已直接融入各模块操作栏中；全部列表均含省市/中心筛选与分页 -->
    <div class="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
      <el-tabs v-model="activeTab" class="custom-admin-tabs px-2.5 sm:px-5 pt-2 sm:pt-3" @tab-change="handleTabChange">
        
        <!-- ========================================== -->
        <!-- Tab 1: 公民（电子配给卡）管理 -->
        <!-- ========================================== -->
        <el-tab-pane name="cards">
          <template #label>
            <span class="flex items-center gap-1.5">
              <span>{{ $t('admin.tabCards') || '公民配给卡管理' }}</span>
              <el-tag size="small" type="primary" effect="plain" class="scale-90 origin-left">{{ $t('admin.electronicCard') || '电子卡' }}</el-tag>
            </span>
          </template>
          <div class="py-3.5 space-y-3.5">
            <!-- 检索筛选栏 -->
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div class="flex flex-wrap items-center gap-2.5">
                <el-input
                  v-model="cardQuery.cardNo"
                  :placeholder="$t('admin.cardNoPlaceholder') || '配给卡号 (RC-...)'"
                  style="width: 170px"
                  size="small"
                  clearable
                  @keyup.enter="handleCardSearch"
                />
                <el-input
                  v-model="cardQuery.headName"
                  :placeholder="$t('admin.headNamePlaceholder') || '户主姓名'"
                  style="width: 150px"
                  size="small"
                  clearable
                  @keyup.enter="handleCardSearch"
                />
                <!-- 省市筛选 -->
                <el-select v-model="cardQuery.province" :placeholder="$t('admin.provincePlaceholder') || '所属省市'" style="width: 130px" size="small" @change="handleCardProvinceChange">
                  <el-option :label="$t('admin.allProvinces') || '全部省市'" value="全部" />
                  <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                </el-select>
                <!-- 中心筛选 -->
                <el-select v-model="cardQuery.center" :placeholder="$t('admin.centerPlaceholder') || '服务中心'" style="width: 170px" size="small" @change="handleCardSearch">
                  <el-option :label="$t('admin.allCenters') || '全部中心'" value="全部" />
                  <el-option v-for="c in currentCardCenterOptions" :key="c" :label="c" :value="c" />
                </el-select>
                <!-- 状态筛选 -->
                <el-select v-model="cardQuery.status" :placeholder="$t('admin.statusPlaceholder') || '状态'" style="width: 110px" size="small" @change="handleCardSearch">
                  <el-option :label="$t('admin.allStatuses') || '全部状态'" value="全部" />
                  <el-option :label="$t('admin.statusNormal') || '正常'" value="正常" />
                  <el-option :label="$t('admin.statusFrozen') || '已冻结'" value="已冻结" />
                  <el-option :label="$t('admin.statusReviewing') || '审核中'" value="审核中" />
                </el-select>

                <el-button type="primary" size="small" :icon="Search" @click="handleCardSearch">{{ $t('admin.searchQuery') || '查询' }}</el-button>
                <el-button size="small" :icon="Refresh" @click="resetCardQuery">{{ $t('admin.resetQuery') || '重置' }}</el-button>
              </div>

              <div class="text-xs text-slate-500 font-mono">
                {{ $t('admin.matchCards', { count: filteredCards.length }) }}
              </div>
            </div>

            <!-- 配给卡数据表格 (自适应占比优化) -->
            <el-table :data="paginatedCards" v-loading="cardsLoading" border stripe style="width: 100%" size="small" class="text-xs">
              <el-table-column prop="cardNo" :label="$t('admin.cardNo') || '配给卡号'" width="160" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-blue-600">{{ row.cardNo }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.headInfo') || '户主信息'" min-width="190">
                <template #default="{ row }">
                  <div class="font-medium text-slate-800">{{ row.headName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ row.nationalId }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.regionInfo') || '所属行政省市/基层区'" min-width="220">
                <template #default="{ row }">
                  <div class="text-xs text-slate-700 font-medium">{{ row.province }}</div>
                  <div class="text-[11px] text-slate-400">{{ row.district }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="memberCount" :label="$t('admin.population') || '人口'" width="80" align="center">
                <template #default="{ row }">
                  <span class="font-bold font-mono">{{ row.memberCount }}</span> {{ $t('admin.personUnit') || '人' }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.monthlyQuotaAudit') || '本月配额外核'" min-width="260">
                <template #default="{ row }">
                  <div class="flex items-center gap-1.5 text-[11px] flex-wrap">
                    <span class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">{{ $t('admin.flour') || '面粉' }}: {{ row.quotas?.flour ?? 0 }}kg</span>
                    <span class="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">{{ $t('admin.rice') || '大米' }}: {{ row.quotas?.rice ?? 0 }}kg</span>
                    <span class="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">{{ $t('admin.oil') || '油' }}: {{ row.quotas?.oil ?? 0 }}L</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" :label="$t('admin.cardStatus') || '状态'" width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.status === '正常'" type="success" size="small">{{ formatCardStatus('正常') }}</el-tag>
                  <el-tag v-else-if="row.status === '已冻结'" type="danger" size="small">{{ formatCardStatus('已冻结') }}</el-tag>
                  <el-tag v-else-if="row.status === '审核中'" type="warning" size="small">{{ formatCardStatus('审核中') }}</el-tag>
                  <el-tag v-else type="warning" size="small">{{ formatCardStatus(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.actions') || '操作'" width="230" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1.5">
                    <el-button size="small" type="primary" plain @click="openQuotaDialog(row)">{{ $t('admin.adjustQuota') || '调额' }}</el-button>
                    <el-button
                      size="small"
                      :type="row.status === '已冻结' ? 'success' : 'danger'"
                      plain
                      @click="handleToggleCardStatus(row)"
                    >
                      {{ row.status === '已冻结' ? ($t('admin.unfreezeCard') || '解冻') : ($t('admin.freezeCard') || '冻结') }}
                    </el-button>
                    <el-button size="small" type="info" plain @click="handleReissueCard(row)">{{ $t('admin.reissue') || '换发' }}</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>{{ $t('admin.totalRecords', { count: filteredCards.length }) }}</span>
              <el-pagination
                v-model:current-page="cardPage"
                v-model:page-size="cardPageSize"
                :page-sizes="[5, 10, 20]"
                layout="total, sizes, prev, pager, next"
                :total="filteredCards.length"
                size="small"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- ========================================== -->
        <!-- Tab 2: 家庭户籍档案管理 -->
        <!-- ========================================== -->
        <el-tab-pane :label="$t('admin.tabFamilies') || '家庭户籍档案管理'" name="families">
          <div class="py-3.5 space-y-3.5">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div class="flex flex-wrap items-center gap-2.5">
                <el-input
                  v-model="familyQuery.familyCode"
                  :placeholder="$t('admin.familyCodePlaceholder') || '户籍编码 (FAM-...)'"
                  style="width: 170px"
                  size="small"
                  clearable
                  @keyup.enter="handleFamilySearch"
                />
                <el-input
                  v-model="familyQuery.headName"
                  :placeholder="$t('admin.headNamePlaceholder') || '户主姓名'"
                  style="width: 150px"
                  size="small"
                  clearable
                  @keyup.enter="handleFamilySearch"
                />
                <!-- 省市筛选 -->
                <el-select v-model="familyQuery.province" :placeholder="$t('admin.provincePlaceholder') || '所属省市'" style="width: 130px" size="small" @change="handleFamilyProvinceChange">
                  <el-option :label="$t('admin.allProvinces') || '全部省市'" value="全部" />
                  <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                </el-select>
                <!-- 中心筛选 -->
                <el-select v-model="familyQuery.center" :placeholder="$t('admin.centerPlaceholder') || '保障分部/中心'" style="width: 170px" size="small" @change="handleFamilySearch">
                  <el-option :label="$t('admin.allCenters') || '全部中心'" value="全部" />
                  <el-option v-for="c in currentFamilyCenterOptions" :key="c" :label="c" :value="c" />
                </el-select>

                <el-button type="primary" size="small" :icon="Search" @click="handleFamilySearch">{{ $t('admin.searchQuery') || '查询' }}</el-button>
                <el-button size="small" :icon="Refresh" @click="resetFamilyQuery">{{ $t('admin.resetQuery') || '重置' }}</el-button>
              </div>

              <div>
                <el-button type="primary" size="small" :icon="Plus" @click="openCreateFamilyDialog">
                  {{ $t('admin.addFamily') || '新增家庭建档' }}
                </el-button>
              </div>
            </div>

            <!-- 家庭档案表格 (自适应占比优化) -->
            <el-table :data="paginatedFamilies" v-loading="familiesLoading" border stripe style="width: 100%" size="small" class="text-xs">
              <el-table-column prop="familyCode" :label="$t('admin.familyCode') || '户籍档案编号'" width="160" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-slate-800">{{ row.familyCode }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="headName" :label="$t('admin.headInfo') || '法定户主'" min-width="160" />
              <el-table-column prop="memberCount" :label="$t('admin.population') || '人口'" width="90" align="center">
                <template #default="{ row }">
                  <span class="font-bold font-mono">{{ row.memberCount }}</span> {{ $t('admin.personUnit') || '人' }}
                </template>
              </el-table-column>
              <el-table-column prop="category" :label="$t('admin.category') || '保障类型'" width="130" align="center">
                <template #default="{ row }">
                  <el-tag size="small" type="info">{{ row.category }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.regionInfo') || '所属省市与分部'" min-width="320">
                <template #default="{ row }">
                  <div class="text-slate-800 font-medium">{{ row.adminBranch || '供应分部' }}</div>
                  <div class="text-[11px] text-slate-400">{{ row.address }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.actions') || '操作'" width="220" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1.5">
                    <el-button size="small" type="info" plain @click="openMembersDrawer(row)">{{ $t('admin.membersCountBtn', { count: row.memberCount }) }}</el-button>
                    <el-button size="small" type="primary" plain @click="openEditFamilyDialog(row)">{{ $t('common.edit') || '编辑' }}</el-button>
                    <el-button size="small" type="danger" plain @click="handleDeleteFamily(row)">{{ $t('common.delete') || '注销' }}</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>{{ $t('admin.totalRecords', { count: filteredFamilies.length }) }}</span>
              <el-pagination
                v-model:current-page="familyPage"
                v-model:page-size="familyPageSize"
                :page-sizes="[5, 10, 20]"
                layout="total, sizes, prev, pager, next"
                :total="filteredFamilies.length"
                size="small"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- ========================================== -->
        <!-- Tab 3: 代理网点治理管理 (专属管辖职权直接融入操作栏) -->
        <!-- ========================================== -->
        <el-tab-pane :label="$t('admin.tabAgents') || '代理网点治理管理'" name="agents">
          <div class="py-3.5 space-y-3.5">
            <!-- 检索筛选栏 -->
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div class="flex flex-wrap items-center gap-2.5">
                <el-input
                  v-model="agentQuery.code"
                  placeholder="代理代号 (FA-...)"
                  style="width: 160px"
                  size="small"
                  clearable
                  @keyup.enter="handleAgentSearch"
                />
                <el-input
                  v-model="agentQuery.name"
                  placeholder="网点名称"
                  style="width: 170px"
                  size="small"
                  clearable
                  @keyup.enter="handleAgentSearch"
                />
                <!-- 省市筛选 -->
                <el-select v-model="agentQuery.province" placeholder="所属省市" style="width: 130px" size="small" @change="handleAgentProvinceChange">
                  <el-option label="全部省市" value="全部" />
                  <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                </el-select>
                <!-- 中心筛选 -->
                <el-select v-model="agentQuery.center" placeholder="服务中心/网格" style="width: 170px" size="small" @change="handleAgentSearch">
                  <el-option label="全部中心" value="全部" />
                  <el-option v-for="c in currentAgentCenterOptions" :key="c" :label="c" :value="c" />
                </el-select>
                <el-select v-model="agentQuery.status" placeholder="运营状态" style="width: 120px" size="small" @change="handleAgentSearch">
                  <el-option label="全部状态" value="全部" />
                  <el-option label="正常营业" value="正常营业" />
                  <el-option label="停业整顿" value="停业整顿" />
                  <el-option label="已注销(空置)" value="已注销(空置)" />
                  <el-option label="吊销资质" value="吊销资质" />
                </el-select>
                <el-button type="primary" size="small" :icon="Search" @click="handleAgentSearch">查询</el-button>
                <el-button size="small" :icon="Refresh" @click="resetAgentQuery">重置</el-button>
              </div>

              <!-- 表头快捷操作栏：根据当前用户角色动态融入专属法定职权入口 -->
              <div class="flex items-center gap-2 flex-wrap">
                <!-- 部长专属：设立代理权、统一代理权 -->
                <template v-if="authStore.isMinisterCenter || authStore.currentRole === 'admin'">
                  <el-button type="success" size="small" :icon="Plus" @click="openEstablishAgencyModal">
                    设立新代理网点 (部长令)
                  </el-button>
                  <el-button type="primary" plain size="small" @click="openUnifyAgencyModal">
                    统一代理权规范 (部长令)
                  </el-button>
                </template>

                <!-- 行政次长：快速轮替/恢复入口提示 -->
                <template v-if="authStore.isDeputyMinister">
                  <el-tag type="danger" effect="plain" class="font-bold">
                    已激活行政次长终审签批席
                  </el-tag>
                </template>

                <!-- 规划总干事：轮替/转移申报通道 -->
                <template v-if="authStore.isDirectorPlanning">
                  <el-button type="warning" plain size="small" @click="openRotateTransferModal">
                    轮替与转移审批
                  </el-button>
                </template>
              </div>
            </div>

            <!-- 代理网点表格 (自适应占比优化) -->
            <el-table :data="paginatedAgents" v-loading="agentsLoading" border stripe style="width: 100%" size="small" class="text-xs">
              <el-table-column prop="code" :label="$t('admin.agentCode') || '网点代号'" width="120" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-amber-700">{{ row.code }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('admin.agentNameArea') || '网点名称与片区'" min-width="260">
                <template #default="{ row }">
                  <div class="font-bold text-slate-800">{{ row.name }}</div>
                  <div class="text-[11px] text-slate-400">{{ row.province }} · {{ row.district || row.address }}</div>
                  <div v-if="row.planningConfirmed" class="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                    <el-icon><Check /></el-icon> 规划跟进司已完成联合调查确认
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.manager') || '负责人'" min-width="160">
                <template #default="{ row }">
                  <div class="font-medium text-slate-700">{{ row.manager }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ row.phone }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="status" :label="$t('admin.opStatus') || '运营状态'" width="110" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.status === '正常营业'" type="success" size="small">正常营业</el-tag>
                  <el-tag v-else-if="row.status === '停业整顿'" type="warning" size="small">停业整顿</el-tag>
                  <el-tag v-else-if="row.status.includes('注销')" type="danger" effect="plain" size="small">{{ row.status }}</el-tag>
                  <el-tag v-else type="danger" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.servedHouseholdsCap') || '服务户数 / 法定承载'" min-width="180" align="center">
                <template #default="{ row }">
                  <div class="space-y-0.5">
                    <span class="font-mono font-bold" :class="row.servedHouseholds > 1500 ? 'text-rose-600' : 'text-slate-700'">
                      {{ row.servedHouseholds }} 户
                    </span>
                    <div v-if="row.servedHouseholds > 1500" class="text-[10px] text-rose-600 font-bold">
                      ⚠ 超1500户红线 (部长待拆分)
                    </div>
                    <div v-else-if="row.servedHouseholds <= 750" class="text-[10px] text-amber-600 font-medium">
                      ● ≤750户小型 (允许合并)
                    </div>
                  </div>
                </template>
              </el-table-column>

              <!-- 代理网点专属管辖职权操作列 (直接根据当前角色动态融入操作栏) -->
              <el-table-column :label="$t('admin.governanceActions') || '专属管辖职权操作'" width="320" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1 flex-wrap">
                    <!-- 1. 【配给中心部长专属】：拆分大网点 + 授予代理权 -->
                    <template v-if="authStore.isMinisterCenter || authStore.currentRole === 'admin'">
                      <el-button
                        v-if="row.servedHouseholds > 1500"
                        size="small"
                        type="danger"
                        @click="handleDirectSplit(row)"
                      >
                        拆分大网点
                      </el-button>
                      <el-button
                        size="small"
                        type="primary"
                        plain
                        @click="openGrantAgencyModal(row)"
                      >
                        授予代理权
                      </el-button>
                    </template>

                    <!-- 2. 【行政次长专属】：已故轮替终审 + 恢复代理权 -->
                    <template v-if="authStore.isDeputyMinister || authStore.currentRole === 'admin'">
                      <el-button
                        size="small"
                        type="danger"
                        plain
                        @click="openDeceasedRotationModal(row)"
                      >
                        已故轮替批复
                      </el-button>
                      <el-button
                        v-if="row.status.includes('注销')"
                        size="small"
                        type="danger"
                        @click="handleRestoreWithCheck(row)"
                      >
                        核准恢复代理权
                      </el-button>
                    </template>

                    <!-- 3. 【规划跟进司总干事专属】：调查确认 + 合并网点 + 处罚 + 注销 -->
                    <template v-if="authStore.isDirectorPlanning || authStore.currentRole === 'admin'">
                      <el-button
                        v-if="row.status.includes('注销') && !row.planningConfirmed"
                        size="small"
                        type="warning"
                        @click="handleConfirmPlanning(row)"
                      >
                        规划司确认
                      </el-button>
                      <el-button
                        v-if="row.servedHouseholds <= 750 && row.status === '正常营业'"
                        size="small"
                        type="warning"
                        plain
                        @click="handleMergePrompt(row)"
                      >
                        合并网点
                      </el-button>
                      <el-button
                        size="small"
                        type="danger"
                        plain
                        @click="handlePenalizePrompt(row)"
                      >
                        行政处罚
                      </el-button>
                      <el-button
                        v-if="row.status === '正常营业'"
                        size="small"
                        type="danger"
                        link
                        @click="handleCancelAgencyPrompt(row)"
                      >
                        注销
                      </el-button>
                    </template>

                    <!-- 通用信息编辑 -->
                    <el-button size="small" type="primary" link @click="openEditAgentDialog(row)">
                      编辑
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>共 {{ filteredAgents.length }} 笔记录</span>
              <el-pagination
                v-model:current-page="agentPage"
                v-model:page-size="agentPageSize"
                :page-sizes="[5, 10, 20]"
                layout="total, sizes, prev, pager, next"
                :total="filteredAgents.length"
                size="small"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- ========================================== -->
        <!-- Tab 4: 仓储中心管理 (全新增加，支持增删改查储备仓库) -->
        <!-- ========================================== -->
        <el-tab-pane :label="$t('admin.tabWarehouse') || '仓储中心管理'" name="warehouses">
          <div class="py-3.5 space-y-3.5">
            <!-- 检索筛选栏 -->
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div class="flex flex-wrap items-center gap-2.5">
                <el-input
                  v-model="warehouseQuery.keyword"
                  placeholder="仓库代号/名称/责任人"
                  style="width: 190px"
                  size="small"
                  clearable
                  @keyup.enter="handleWarehouseSearch"
                />
                <!-- 省市筛选 -->
                <el-select v-model="warehouseQuery.province" placeholder="所属省市" style="width: 130px" size="small" @change="handleWarehouseProvinceChange">
                  <el-option label="全部省市" value="全部" />
                  <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                </el-select>
                <!-- 中心筛选 -->
                <el-select v-model="warehouseQuery.center" placeholder="供应中心/枢纽" style="width: 170px" size="small" @change="handleWarehouseSearch">
                  <el-option label="全部中心" value="全部" />
                  <el-option v-for="c in currentWarehouseCenterOptions" :key="c" :label="c" :value="c" />
                </el-select>
                <!-- 类型筛选 -->
                <el-select v-model="warehouseQuery.type" placeholder="仓库类型" style="width: 130px" size="small" @change="handleWarehouseSearch">
                  <el-option label="全部类型" value="全部" />
                  <el-option label="战略储备总仓" value="战略储备总仓" />
                  <el-option label="区域中心仓" value="区域中心仓" />
                  <el-option label="枢纽前置仓" value="枢纽前置仓" />
                  <el-option label="应急保供仓" value="应急保供仓" />
                </el-select>

                <el-button type="primary" size="small" :icon="Search" @click="handleWarehouseSearch">查询</el-button>
                <el-button size="small" :icon="Refresh" @click="resetWarehouseQuery">重置</el-button>
              </div>

              <div>
                <el-button type="primary" size="small" :icon="Plus" @click="openCreateWarehouseDialog">
                  新建储备仓库
                </el-button>
              </div>
            </div>

            <!-- 仓储中心表格 (自适应占比优化) -->
            <el-table :data="paginatedWarehouses" v-loading="warehousesLoading" border stripe style="width: 100%" size="small" class="text-xs">
              <el-table-column prop="code" label="仓库编号" width="130" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-teal-700">{{ row.code }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="储备仓库名称" min-width="260">
                <template #default="{ row }">
                  <div class="font-bold text-slate-800">{{ row.name }}</div>
                  <div class="text-[11px] text-slate-400">{{ row.province }} · {{ row.center }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="仓库功能类型" width="130" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.type.includes('总仓') ? 'danger' : row.type.includes('中心') ? 'primary' : 'success'" effect="plain">
                    {{ row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="核定库容与余量" min-width="220">
                <template #default="{ row }">
                  <div class="space-y-0.5 text-xs">
                    <div class="flex justify-between font-mono">
                      <span class="text-slate-400">核定: {{ (row.capacity || 0).toLocaleString() }} 吨</span>
                      <span class="font-bold text-slate-800">在库: {{ (row.currentStock || 0).toLocaleString() }} 吨</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        class="h-1.5 rounded-full"
                        :class="Math.round((row.currentStock / (row.capacity || 1)) * 100) > 90 ? 'bg-amber-500' : 'bg-emerald-500'"
                        :style="{ width: `${Math.min(100, Math.round((row.currentStock / (row.capacity || 1)) * 100))}%` }"
                      ></div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="负责人" min-width="160">
                <template #default="{ row }">
                  <div class="font-medium text-slate-700">{{ row.manager }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ row.phone }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="运营状态" width="110" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.status === '正常运转' ? 'success' : 'warning'">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1.5">
                    <el-button size="small" type="primary" plain @click="openEditWarehouseDialog(row)">编辑</el-button>
                    <el-button size="small" type="danger" plain @click="handleDeleteWarehouse(row)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>共 {{ filteredWarehouses.length }} 处储备仓库</span>
              <el-pagination
                v-model:current-page="warehousePage"
                v-model:page-size="warehousePageSize"
                :page-sizes="[5, 10, 20]"
                layout="total, sizes, prev, pager, next"
                :total="filteredWarehouses.length"
                size="small"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- ========================================== -->
        <!-- Tab 5: 阶段 5 核心：财政对账与清算管理中心 -->
        <!-- ========================================== -->
        <el-tab-pane name="reconciliation">
          <template #label>
            <span class="flex items-center gap-1.5">
              <span>{{ $t('admin.tabReconciliation') || '财政对账与清算' }}</span>
              <el-tag size="small" type="success" effect="dark" class="scale-90 origin-left font-mono">{{ $t('reconciliation.balancedTag') || '100% 平衡' }}</el-tag>
            </span>
          </template>
          <div class="py-2">
            <ReconciliationTab />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ======================================================== -->
    <!-- 3. 模态对话框集 (专属职权交互与仓储增删改) -->
    <!-- ======================================================== -->

    <!-- 3.1 拆分大型代理权对话框 (配给中心部长) -->
    <el-dialog v-model="splitDialogVisible" title="【配给中心部长】拆分大型代理权执行令" width="540px" align-center destroy-on-close>
      <div class="space-y-3 text-xs">
        <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 leading-relaxed">
          <strong>法定红线依据</strong>：依据单店 1,500 户容量红线，网点<strong>【{{ activeSplitAgent?.name }}】</strong>当前签约户数已达 <strong>{{ activeSplitAgent?.servedHouseholds }} 户</strong>，超出法定承载力。
        </div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
          <div class="flex justify-between">
            <span class="text-slate-500">拆分方案：</span>
            <span class="font-bold text-slate-800">一分为二 (拆分设立第一网点 / 第二网点)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">拆分后各网点户数：</span>
            <span class="font-mono font-bold text-emerald-600">约 {{ Math.floor((activeSplitAgent?.servedHouseholds || 1800) / 2) }} 户 / 店</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="splitDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="splitSubmitting" @click="confirmExecuteSplit">
          签发部长令并执行拆分
        </el-button>
      </template>
    </el-dialog>

    <!-- 3.2 统一代理权对话框 (配给中心部长) -->
    <el-dialog v-model="unifyDialogVisible" title="【配给中心部长】统筹统一代理权标准化决定" width="500px" align-center destroy-on-close>
      <el-form label-position="top" class="space-y-2 text-xs">
        <el-form-item label="统筹整顿目标辖区">
          <el-input v-model="unifyForm.district" placeholder="例如：巴格达省卡尔赫区全境" />
        </el-form-item>
        <el-form-item label="统一代销标准化规程">
          <el-input v-model="unifyForm.standard" type="textarea" :rows="3" placeholder="统一实施电子配给卡划扣、统一双人双锁仓储规范..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unifyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="unifySubmitting" @click="confirmExecuteUnify">签发统一代理权决议</el-button>
      </template>
    </el-dialog>

    <!-- 3.3 设立代理权对话框 (配给中心部长) -->
    <el-dialog v-model="establishDialogVisible" title="【配给中心部长】新设配给代销站批准书" width="520px" align-center destroy-on-close>
      <el-form label-position="top" class="space-y-2 text-xs">
        <el-form-item label="新设网点官方名称" required>
          <el-input v-model="establishForm.name" placeholder="例如：曼苏尔新城区第二配给代销站" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="指定经办责任人" required>
            <el-input v-model="establishForm.manager" placeholder="姓名" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="establishForm.phone" placeholder="+964 770 000 0000" />
          </el-form-item>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="核定保障服务户数">
            <el-input-number v-model="establishForm.servedHouseholds" :min="100" :max="1500" class="w-full" />
          </el-form-item>
          <el-form-item label="规划仓储容积 (吨)">
            <el-input-number v-model="establishForm.storageCapacity" :min="10" :max="200" class="w-full" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="establishDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="establishSubmitting" @click="confirmExecuteEstablish">签署部长令并设立</el-button>
      </template>
    </el-dialog>

    <!-- 3.4 调整配额对话框 -->
    <el-dialog v-model="quotaDialogVisible" title="调整配给卡月度物资定额" width="500px" align-center destroy-on-close>
      <div v-if="currentEditingCard" class="space-y-3 text-xs">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between">
          <div>卡号：<span class="font-mono font-bold text-blue-600">{{ currentEditingCard.cardNo }}</span></div>
          <div>户主：<span class="font-bold text-slate-800">{{ currentEditingCard.headName }}</span></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><span class="block mb-1">精制面粉 (kg)</span><el-input-number v-model="quotaForm.flour" :min="0" :max="200" class="w-full" size="small" /></div>
          <div><span class="block mb-1">一级大米 (kg)</span><el-input-number v-model="quotaForm.rice" :min="0" :max="100" class="w-full" size="small" /></div>
          <div><span class="block mb-1">食用植物油 (L)</span><el-input-number v-model="quotaForm.oil" :precision="1" :step="0.5" :min="0" :max="50" class="w-full" size="small" /></div>
          <div><span class="block mb-1">白砂糖 (kg)</span><el-input-number v-model="quotaForm.sugar" :min="0" :max="50" class="w-full" size="small" /></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="quotaDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="quotaSaving" @click="saveQuotaChange">确认保存定额</el-button>
      </template>
    </el-dialog>

    <!-- 3.5 家庭成员明细抽屉 -->
    <el-dialog v-model="membersDialogVisible" title="家庭成员户籍存根明细" width="650px" align-center destroy-on-close>
      <div v-if="selectedFamilyForMembers" class="space-y-3 text-xs">
        <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div>户籍编号：<span class="font-mono font-bold">{{ selectedFamilyForMembers.familyCode }}</span></div>
          <div>户主：<span class="font-bold">{{ selectedFamilyForMembers.headName }}</span></div>
        </div>
        <el-table :data="selectedFamilyForMembers.members || []" border size="small">
          <el-table-column prop="name" label="姓名" min-width="130" />
          <el-table-column prop="relation" label="关系" width="90" align="center" />
          <el-table-column prop="gender" label="性别" width="60" align="center" />
          <el-table-column prop="birthDate" label="出生日期" width="110" />
          <el-table-column prop="nationalId" label="国民卡号" min-width="160" />
        </el-table>
      </div>
      <template #footer><el-button @click="membersDialogVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 3.6 新增/编辑家庭对话框 -->
    <el-dialog v-model="familyDialogVisible" :title="isEditFamily ? '编辑家庭户籍档案' : '新增家庭户籍建档'" width="500px" align-center destroy-on-close>
      <el-form label-position="top" :model="familyForm" class="space-y-2 text-xs">
        <el-form-item label="户主姓名" required><el-input v-model="familyForm.headName" size="small" /></el-form-item>
        <el-form-item label="户主国民卡号" required><el-input v-model="familyForm.headNationalId" size="small" /></el-form-item>
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="类别">
            <el-select v-model="familyForm.category" class="w-full" size="small">
              <el-option label="普通保障家庭" value="普通保障家庭" />
              <el-option label="特困供养家庭" value="特困供养家庭" />
            </el-select>
          </el-form-item>
          <el-form-item label="人口"><el-input-number v-model="familyForm.memberCount" :min="1" :max="20" class="w-full" size="small" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="familyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="familySaving" @click="saveFamily">提交</el-button>
      </template>
    </el-dialog>

    <!-- 3.7 编辑代理网点对话框 -->
    <el-dialog v-model="agentDialogVisible" title="编辑代理网点档案" width="500px" align-center destroy-on-close>
      <el-form label-position="top" :model="agentForm" class="space-y-2 text-xs">
        <el-form-item label="网点名称" required><el-input v-model="agentForm.name" size="small" /></el-form-item>
        <el-form-item label="负责人" required><el-input v-model="agentForm.manager" size="small" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="agentForm.phone" size="small" /></el-form-item>
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="服务户数"><el-input-number v-model="agentForm.servedHouseholds" :min="10" :max="2500" class="w-full" size="small" /></el-form-item>
          <el-form-item label="仓储容积 (吨)"><el-input-number v-model="agentForm.storageCapacity" :min="5" :max="200" class="w-full" size="small" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="agentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="agentSaving" @click="saveAgent">保存</el-button>
      </template>
    </el-dialog>

    <!-- 3.8 新增/编辑仓储中心对话框 (全新增加) -->
    <el-dialog v-model="warehouseDialogVisible" :title="isEditWarehouse ? '编辑战略储备仓库' : '新建战略储备仓库'" width="560px" align-center destroy-on-close>
      <el-form label-position="top" :model="warehouseForm" class="space-y-2.5 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="仓库编号" required>
            <el-input v-model="warehouseForm.code" placeholder="如：WH-BAG-05" :disabled="isEditWarehouse" size="small" />
          </el-form-item>
          <el-form-item label="仓库名称" required>
            <el-input v-model="warehouseForm.name" placeholder="如：卡尔赫应急口粮战略总仓" size="small" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="仓库功能类型" required>
            <el-select v-model="warehouseForm.type" class="w-full" size="small">
              <el-option label="战略储备总仓" value="战略储备总仓" />
              <el-option label="区域中心仓" value="区域中心仓" />
              <el-option label="枢纽前置仓" value="枢纽前置仓" />
              <el-option label="应急保供仓" value="应急保供仓" />
            </el-select>
          </el-form-item>
          <el-form-item label="运营状态" required>
            <el-select v-model="warehouseForm.status" class="w-full" size="small">
              <el-option label="正常运转" value="正常运转" />
              <el-option label="警戒储备" value="警戒储备" />
              <el-option label="检修维护" value="检修维护" />
            </el-select>
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="所属省市" required>
            <el-select v-model="warehouseForm.province" class="w-full" size="small">
              <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>
          <el-form-item label="归属分部/中心" required>
            <el-input v-model="warehouseForm.center" placeholder="如：卡尔赫第一粮食供应分部" size="small" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="设计总库容 (吨)" required>
            <el-input-number v-model="warehouseForm.capacity" :min="1000" :max="500000" :step="5000" class="w-full" size="small" />
          </el-form-item>
          <el-form-item label="当前在库余量 (吨)">
            <el-input-number v-model="warehouseForm.currentStock" :min="0" :max="warehouseForm.capacity" :step="1000" class="w-full" size="small" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="责任主管人">
            <el-input v-model="warehouseForm.manager" placeholder="姓名" size="small" />
          </el-form-item>
          <el-form-item label="联络电话">
            <el-input v-model="warehouseForm.phone" placeholder="+964 780 000 0000" size="small" />
          </el-form-item>
        </div>

        <el-form-item label="常设库区详细地址">
          <el-input v-model="warehouseForm.address" placeholder="库区地理位置、街区及门牌号" size="small" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="warehouseDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="warehouseSaving" @click="saveWarehouse">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.js';
import ReconciliationTab from './components/ReconciliationTab.vue';
import { onTabMessage } from '../../utils/crossTabBus.js';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const currentRoleTitle = computed(() => {
  switch (authStore.currentRole) {
    case 'minister_center':
      return t('roles.ministerCenter') || t('admin.ministerCenter') || 'Minister of Ration Centers';
    case 'deputy_minister':
      return t('roles.deputyMinister') || t('admin.deputyMinister') || 'Deputy Minister';
    case 'directorPlanning':
    case 'director_planning':
      return t('roles.directorPlanning') || t('admin.directorPlanning') || 'Director General';
    case 'admin':
      return t('roles.admin') || 'System Administrator';
    default:
      if (authStore.userProfile?.title === '配给中心部长') return t('roles.ministerCenter') || t('admin.ministerCenter');
      if (authStore.userProfile?.title === '行政次长') return t('roles.deputyMinister') || t('admin.deputyMinister');
      if (authStore.userProfile?.title === '规划与跟进司总干事') return t('roles.directorPlanning') || t('admin.directorPlanning');
      return authStore.userProfile?.title || t('admin.systemDirector') || 'System Director';
  }
});

function formatCardStatus(status) {
  if (status === '正常') return t('admin.statusNormal') || (isEn.value ? 'Normal' : '正常');
  if (status === '已冻结') return t('admin.statusFrozen') || (isEn.value ? 'Frozen' : '已冻结');
  if (status === '审核中') return t('admin.statusReviewing') || (isEn.value ? 'Under Review' : '审核中');
  return status;
}

const route = useRoute();
import {
  getCitizenCards,
  updateCitizenCardStatus,
  updateCitizenCardQuota,
  reissueCitizenCard,
  getFamilyList,
  createFamily,
  updateFamily,
  deleteFamily,
  getAdminAgentList,
  createAdminAgent,
  updateAdminAgent,
  grantAgency,
  unifyAgency,
  establishAgency,
  splitLargeAgency,
  approveDeceasedRotation,
  restoreRevokedAgency,
  cancelAgency,
  rotateTransferAgency,
  mergeAgencies,
  penalizeAgency,
  confirmPlanningReview,
  getAdminWarehouses,
  createAdminWarehouse,
  updateAdminWarehouse,
  deleteAdminWarehouse
} from '../../api/admin.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Plus, Check, Tools } from '@element-plus/icons-vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';

const authStore = useAuthStore();
const activeTab = ref('cards');

const provinceOptions = [
  '巴格达省',
  '巴士拉省',
  '尼尼微省',
  '迪亚拉省',
  '基尔库克省',
  '安巴尔省',
  '埃尔比勒省',
  '苏莱曼尼亚省'
];

const centerMap = {
  '巴格达省': ['卡尔赫第一粮食供应分部', '鲁萨法第二粮食供应分部', '曼苏尔配给中心'],
  '巴士拉省': ['巴士拉港口配给保障站', '阿沙尔滨海服务中心'],
  '尼尼微省': ['摩苏尔老城配给管理中心', '尼尼微平原调拨站'],
  '迪亚拉省': ['迪亚拉哈奈根前置保供仓服务分部', '巴古拜物资中心'],
  '基尔库克省': ['基尔库克第一配给服务中心'],
  '安巴尔省': ['费卢杰粮食供应站', '拉马迪保障中心'],
  '埃尔比勒省': ['埃尔比勒中心粮食调拨总站', '安卡瓦惠民站'],
  '苏莱曼尼亚省': ['苏莱曼尼亚中心配发处']
};

// ----------------------------------------------------
// 1. 公民配给卡列表与分页
// ----------------------------------------------------
const cardsList = ref([]);
const cardsLoading = ref(false);
const cardPage = ref(1);
const cardPageSize = ref(10);
const cardQuery = reactive({
  cardNo: '',
  headName: '',
  status: '全部',
  province: '全部',
  center: '全部'
});

const currentCardCenterOptions = computed(() => {
  if (cardQuery.province && cardQuery.province !== '全部') {
    return centerMap[cardQuery.province] || [];
  }
  return Object.values(centerMap).flat();
});

function handleCardProvinceChange() {
  cardQuery.center = '全部';
  handleCardSearch();
}

function handleCardSearch() {
  cardPage.value = 1;
}

function resetCardQuery() {
  cardQuery.cardNo = '';
  cardQuery.headName = '';
  cardQuery.status = '全部';
  cardQuery.province = '全部';
  cardQuery.center = '全部';
  cardPage.value = 1;
}

const filteredCards = computed(() => {
  let list = [...cardsList.value];
  if (cardQuery.cardNo) {
    list = list.filter(c => c.cardNo.toLowerCase().includes(cardQuery.cardNo.trim().toLowerCase()));
  }
  if (cardQuery.headName) {
    list = list.filter(c => c.headName.toLowerCase().includes(cardQuery.headName.trim().toLowerCase()));
  }
  if (cardQuery.status && cardQuery.status !== '全部') {
    list = list.filter(c => c.status === cardQuery.status);
  }
  if (cardQuery.province && cardQuery.province !== '全部') {
    list = list.filter(c => c.province && c.province.includes(cardQuery.province));
  }
  if (cardQuery.center && cardQuery.center !== '全部') {
    list = list.filter(c => c.district && c.district.includes(cardQuery.center));
  }
  return list;
});

const paginatedCards = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize.value;
  return filteredCards.value.slice(start, start + cardPageSize.value);
});

async function loadCards() {
  cardsLoading.value = true;
  try {
    const res = await getCitizenCards();
    cardsList.value = res || [];
  } catch (e) {
    ElMessage.error('加载配给卡列表失败');
  } finally {
    cardsLoading.value = false;
  }
}

// ----------------------------------------------------
// 2. 家庭户籍档案列表与分页
// ----------------------------------------------------
const familiesList = ref([]);
const familiesLoading = ref(false);
const familyPage = ref(1);
const familyPageSize = ref(10);
const familyQuery = reactive({
  familyCode: '',
  headName: '',
  province: '全部',
  center: '全部'
});

const currentFamilyCenterOptions = computed(() => {
  if (familyQuery.province && familyQuery.province !== '全部') {
    return centerMap[familyQuery.province] || [];
  }
  return Object.values(centerMap).flat();
});

function handleFamilyProvinceChange() {
  familyQuery.center = '全部';
  handleFamilySearch();
}

function handleFamilySearch() {
  familyPage.value = 1;
}

function resetFamilyQuery() {
  familyQuery.familyCode = '';
  familyQuery.headName = '';
  familyQuery.province = '全部';
  familyQuery.center = '全部';
  familyPage.value = 1;
}

const filteredFamilies = computed(() => {
  let list = [...familiesList.value];
  if (familyQuery.familyCode) {
    list = list.filter(f => f.familyCode.toLowerCase().includes(familyQuery.familyCode.trim().toLowerCase()));
  }
  if (familyQuery.headName) {
    list = list.filter(f => f.headName.toLowerCase().includes(familyQuery.headName.trim().toLowerCase()));
  }
  if (familyQuery.province && familyQuery.province !== '全部') {
    list = list.filter(f => (f.address && f.address.includes(familyQuery.province)) || (f.adminBranch && f.adminBranch.includes(familyQuery.province)));
  }
  if (familyQuery.center && familyQuery.center !== '全部') {
    list = list.filter(f => f.adminBranch && f.adminBranch.includes(familyQuery.center));
  }
  return list;
});

const paginatedFamilies = computed(() => {
  const start = (familyPage.value - 1) * familyPageSize.value;
  return filteredFamilies.value.slice(start, start + familyPageSize.value);
});

async function loadFamilies() {
  familiesLoading.value = true;
  try {
    const res = await getFamilyList();
    familiesList.value = res || [];
  } catch (e) {
    ElMessage.error('加载家庭档案列表失败');
  } finally {
    familiesLoading.value = false;
  }
}

// ----------------------------------------------------
// 3. 代理网点治理列表与分页
// ----------------------------------------------------
const agentsList = ref([]);
const agentsLoading = ref(false);
const agentPage = ref(1);
const agentPageSize = ref(10);
const agentQuery = reactive({
  code: '',
  name: '',
  status: '全部',
  province: '全部',
  center: '全部'
});

const currentAgentCenterOptions = computed(() => {
  if (agentQuery.province && agentQuery.province !== '全部') {
    return centerMap[agentQuery.province] || [];
  }
  return Object.values(centerMap).flat();
});

function handleAgentProvinceChange() {
  agentQuery.center = '全部';
  handleAgentSearch();
}

function handleAgentSearch() {
  agentPage.value = 1;
}

function resetAgentQuery() {
  agentQuery.code = '';
  agentQuery.name = '';
  agentQuery.status = '全部';
  agentQuery.province = '全部';
  agentQuery.center = '全部';
  agentPage.value = 1;
}

const filteredAgents = computed(() => {
  let list = [...agentsList.value];
  if (agentQuery.code) {
    list = list.filter(a => a.code.toLowerCase().includes(agentQuery.code.trim().toLowerCase()));
  }
  if (agentQuery.name) {
    list = list.filter(a => a.name.toLowerCase().includes(agentQuery.name.trim().toLowerCase()));
  }
  if (agentQuery.status && agentQuery.status !== '全部') {
    list = list.filter(a => a.status === agentQuery.status);
  }
  if (agentQuery.province && agentQuery.province !== '全部') {
    list = list.filter(a => a.province && a.province.includes(agentQuery.province));
  }
  if (agentQuery.center && agentQuery.center !== '全部') {
    list = list.filter(a => (a.district && a.district.includes(agentQuery.center)) || (a.address && a.address.includes(agentQuery.center)));
  }
  return list;
});

const paginatedAgents = computed(() => {
  const start = (agentPage.value - 1) * agentPageSize.value;
  return filteredAgents.value.slice(start, start + agentPageSize.value);
});

async function loadAgents() {
  agentsLoading.value = true;
  try {
    const res = await getAdminAgentList();
    agentsList.value = res || [];
  } catch (e) {
    ElMessage.error('加载代理网点列表失败');
  } finally {
    agentsLoading.value = false;
  }
}

// ----------------------------------------------------
// 4. 仓储中心管理列表与增删改 (全新增加)
// ----------------------------------------------------
const warehousesList = ref([]);
const warehousesLoading = ref(false);
const warehousePage = ref(1);
const warehousePageSize = ref(10);
const warehouseQuery = reactive({
  keyword: '',
  province: '全部',
  center: '全部',
  type: '全部'
});

const currentWarehouseCenterOptions = computed(() => {
  if (warehouseQuery.province && warehouseQuery.province !== '全部') {
    return centerMap[warehouseQuery.province] || [];
  }
  return Object.values(centerMap).flat();
});

function handleWarehouseProvinceChange() {
  warehouseQuery.center = '全部';
  handleWarehouseSearch();
}

function handleWarehouseSearch() {
  warehousePage.value = 1;
}

function resetWarehouseQuery() {
  warehouseQuery.keyword = '';
  warehouseQuery.province = '全部';
  warehouseQuery.center = '全部';
  warehouseQuery.type = '全部';
  warehousePage.value = 1;
}

const filteredWarehouses = computed(() => {
  let list = [...warehousesList.value];
  if (warehouseQuery.keyword.trim()) {
    const kw = warehouseQuery.keyword.trim().toLowerCase();
    list = list.filter(w =>
      w.code.toLowerCase().includes(kw) ||
      w.name.toLowerCase().includes(kw) ||
      (w.manager && w.manager.toLowerCase().includes(kw))
    );
  }
  if (warehouseQuery.province && warehouseQuery.province !== '全部') {
    list = list.filter(w => w.province && w.province.includes(warehouseQuery.province));
  }
  if (warehouseQuery.center && warehouseQuery.center !== '全部') {
    list = list.filter(w => w.center && w.center.includes(warehouseQuery.center));
  }
  if (warehouseQuery.type && warehouseQuery.type !== '全部') {
    list = list.filter(w => w.type === warehouseQuery.type);
  }
  return list;
});

const paginatedWarehouses = computed(() => {
  const start = (warehousePage.value - 1) * warehousePageSize.value;
  return filteredWarehouses.value.slice(start, start + warehousePageSize.value);
});

async function loadWarehouses() {
  warehousesLoading.value = true;
  try {
    const res = await getAdminWarehouses();
    warehousesList.value = res || [];
  } catch (e) {
    ElMessage.error('加载储备仓库列表失败');
  } finally {
    warehousesLoading.value = false;
  }
}

// ----------------------------------------------------
// 头部角色动态标识计算属性
// ----------------------------------------------------
const roleBadgeClasses = computed(() => {
  if (authStore.isMinisterCenter) return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30';
  if (authStore.isDeputyMinister) return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
  if (authStore.isDirectorPlanning) return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
  return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
});

const currentRoleBadgeText = computed(() => {
  if (authStore.isMinisterCenter) return '中心总长 (MINISTER)';
  if (authStore.isDeputyMinister) return '行政次长 (DEPUTY)';
  if (authStore.isDirectorPlanning) return '规划总干事 (DIRECTOR)';
  return '系统最高监督长官';
});

const roleTagType = computed(() => {
  if (authStore.isMinisterCenter) return 'primary';
  if (authStore.isDeputyMinister) return 'danger';
  if (authStore.isDirectorPlanning) return 'warning';
  return 'info';
});

const adminTitleSubtitle = computed(() => {
  if (authStore.isMinisterCenter) return '网点准入与准出长官裁决席';
  if (authStore.isDeputyMinister) return '已故继承轮替与复权终审席';
  if (authStore.isDirectorPlanning) return '区域规划网格合并与整顿席';
  return '全境总督管理席';
});

function handleTabChange(tab) {
  if (tab === 'cards' && cardsList.value.length === 0) loadCards();
  if (tab === 'families' && familiesList.value.length === 0) loadFamilies();
  if (tab === 'agents' && agentsList.value.length === 0) loadAgents();
  if (tab === 'warehouses' && warehousesList.value.length === 0) loadWarehouses();
}

// ----------------------------------------------------
// 专属职权弹窗表单与业务逻辑
// ----------------------------------------------------

// 拆分代理权
const splitDialogVisible = ref(false);
const activeSplitAgent = ref(null);
const splitSubmitting = ref(false);

function handleDirectSplit(row) {
  activeSplitAgent.value = row;
  splitDialogVisible.value = true;
}

async function confirmExecuteSplit() {
  if (!activeSplitAgent.value) return;
  splitSubmitting.value = true;
  try {
    await splitLargeAgency(activeSplitAgent.value.id, {
      subdivisionCount: 2,
      splitReason: '单网点突破 1,500 户容量红线，执行行政分流重组'
    });
    ElMessage.success(`【部长令已生效】：网点【${activeSplitAgent.value.name}】已成功分立重组！`);
    splitDialogVisible.value = false;
    await loadAgents();
  } catch (e) {
    ElMessage.error(e.message || '拆分失败');
  } finally {
    splitSubmitting.value = false;
  }
}

// 统一代理权
const unifyDialogVisible = ref(false);
const unifySubmitting = ref(false);
const unifyForm = reactive({
  district: '巴格达省卡尔赫区全境',
  standard: '统一执行电子配给卡即时验卡划扣，统一配粮双签闭环。'
});

function openUnifyAgencyModal() {
  unifyDialogVisible.value = true;
}

async function confirmExecuteUnify() {
  unifySubmitting.value = true;
  try {
    await unifyAgency(unifyForm);
    ElMessage.success('【部长令已生效】：辖区代理权标准化整顿方案已签发执行！');
    unifyDialogVisible.value = false;
  } catch (e) {
    ElMessage.error(e.message || '统一规程失败');
  } finally {
    unifySubmitting.value = false;
  }
}

// 设立代理权
const establishDialogVisible = ref(false);
const establishSubmitting = ref(false);
const establishForm = reactive({
  name: '',
  manager: '',
  phone: '',
  servedHouseholds: 600,
  storageCapacity: 50
});

function openEstablishAgencyModal() {
  establishForm.name = '';
  establishForm.manager = '';
  establishForm.phone = '+964 770 123 8899';
  establishForm.servedHouseholds = 600;
  establishForm.storageCapacity = 60;
  establishDialogVisible.value = true;
}

async function confirmExecuteEstablish() {
  if (!establishForm.name || !establishForm.manager) {
    ElMessage.warning('请填写新设网点名称与负责人');
    return;
  }
  establishSubmitting.value = true;
  try {
    await establishAgency(establishForm);
    ElMessage.success(`【部长令已生效】：已成功批准新设代理网点【${establishForm.name}】！`);
    establishDialogVisible.value = false;
    await loadAgents();
  } catch (e) {
    ElMessage.error(e.message || '设立失败');
  } finally {
    establishSubmitting.value = false;
  }
}

// 授予代理权
function openGrantAgencyModal(row) {
  ElMessageBox.prompt(`正在为网点【${row.name}】授予官方口粮代销许可。请输入核发许可证号：`, '【配给中心部长】核准授予代理权', {
    confirmButtonText: '核发许可',
    cancelButtonText: '取消',
    inputValue: `LIC-MIN-BAG-${Date.now().toString().slice(-4)}`
  }).then(async ({ value }) => {
    try {
      await grantAgency({
        targetAgentId: row.id,
        licenseNo: value,
        approvedHouseholds: row.servedHouseholds || 800
      });
      ElMessage.success(`【部长令】：已成功向【${row.name}】正式授予代理权并颁发许可！`);
      await loadAgents();
    } catch (e) {
      ElMessage.error('授予失败');
    }
  });
}

// 已故轮替终审批复
function openDeceasedRotationModal(row) {
  ElMessageBox.confirm(`确认针对网点【${row?.name || '指定网点'}】签署代理人已故继承轮替终审批复？依据教法三代直系亲属顺位轮替。`, '【行政次长】终审签署已故继承轮替', {
    type: 'warning',
    confirmButtonText: '签发终审批复',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await approveDeceasedRotation(`TICK-ROT-${Date.now().toString().slice(-4)}`, {
        successorRelation: '法定第一顺位直系继承人'
      });
      ElMessage.success('【行政次长令】：已故代理轮替申请已完成终审裁决并核发批复！');
      await loadAgents();
    } catch (e) {
      ElMessage.error('审批失败');
    }
  });
}

// 恢复代理权
function handleRestoreWithCheck(row) {
  if (!row.planningConfirmed) {
    ElMessageBox.alert('【法定强制前置拦截】：依据贸易部第402号令，已注销代理权恢复前，必须由规划与跟进司先行出具【联合调查确认书】。当前网点尚未完成规划司确认，行政次长依法禁止核准！', '合规前置未达标', {
      type: 'error',
      confirmButtonText: '知晓'
    });
    return;
  }
  ElMessageBox.confirm(`规划与跟进司已完成实地核查，确认恢复【${row.name}】的代理权资格？`, '【行政次长】恢复已注销代理权', {
    type: 'warning',
    confirmButtonText: '签署恢复令',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await restoreRevokedAgency(row.id, { reason: '规划司联合入户调查符合复权指标，特批恢复' });
      ElMessage.success(`【行政次长令】：网点【${row.name}】代理经营权已正式核准恢复！`);
      await loadAgents();
    } catch (e) {
      ElMessage.error('恢复失败');
    }
  });
}

// 规划司确认
function handleConfirmPlanning(row) {
  ElMessageBox.confirm(`确认完成对网点【${row.name}】的联合实地入户调查，并出具法务合规确认书？`, '【规划与跟进司】入户调查确认', {
    confirmButtonText: '出具确认书',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await confirmPlanningReview(row.id, { inspectionPassed: true });
      ElMessage.success('【规划与跟进司】：联合实地入户调查确认书已签发入卷！');
      await loadAgents();
    } catch (e) {
      ElMessage.error('确认失败');
    }
  });
}

// 合并代理权
function handleMergePrompt(row) {
  ElMessageBox.prompt(`网点【${row.name}】服务户数为 ${row.servedHouseholds} 户（≤750户），请输入待吸收合并的邻近小型网点编号（如 FA-00389）：`, '【规划与跟进司】合并优化小型代理点', {
    confirmButtonText: '合并重组',
    cancelButtonText: '取消',
    inputValue: 'FA-00389'
  }).then(async ({ value }) => {
    try {
      await mergeAgencies({
        primaryAgentId: row.id,
        secondaryAgentId: value
      });
      ElMessage.success('【总干事决议】：小型网点合并重组成功！');
      await loadAgents();
    } catch (e) {
      ElMessage.error(e.message || '合并失败');
    }
  });
}

// 行政处罚
function handlePenalizePrompt(row) {
  ElMessageBox.prompt(`对违规违纪网点【${row.name}】下达行政处罚令。请输入处罚裁决事由：`, '【规划与跟进司】下达行政处罚裁决', {
    confirmButtonText: '下达处罚令',
    cancelButtonText: '取消',
    inputValue: '责令停业整顿15天，扣减年度信用分10分'
  }).then(async ({ value }) => {
    try {
      await penalizeAgency(row.id, {
        penaltyType: '停业整顿',
        reason: value
      });
      ElMessage.success(`【规划与跟进司】：对网点【${row.name}】的处罚裁决已生效！`);
      await loadAgents();
    } catch (e) {
      ElMessage.error('处罚失败');
    }
  });
}

// 代理注销
function handleCancelAgencyPrompt(row) {
  ElMessageBox.confirm(`确认清退并正式注销网点【${row.name}】的代销经营权？注销后网点将释放为空置公示状态。`, '【规划与跟进司】代理权清退注销', {
    type: 'warning',
    confirmButtonText: '执行注销',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await cancelAgency(row.id, { reason: '主动清退注销' });
      ElMessage.success(`网点【${row.name}】已成功清退注销！`);
      await loadAgents();
    } catch (e) {
      ElMessage.error('注销失败');
    }
  });
}

// 轮替转移审批入口
function openRotateTransferModal() {
  ElMessageBox.confirm('是否调阅当前规划司名下所有代理人自愿轮替与区域迁居转移申请工单？', '【规划与跟进司】代理轮替与转移审批', {
    confirmButtonText: '进入批量核批',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await rotateTransferAgency('TICK-TRF-001', { approved: true });
      ElMessage.success('规划与跟进司已完成自愿轮替转移与法务清算核准！');
      await loadAgents();
    } catch (e) {
      ElMessage.error('审批失败');
    }
  });
}

// 配给卡调整定额
const quotaDialogVisible = ref(false);
const currentEditingCard = ref(null);
const quotaSaving = ref(false);
const quotaForm = reactive({ flour: 0, rice: 0, oil: 0, sugar: 0 });

function openQuotaDialog(row) {
  currentEditingCard.value = row;
  quotaForm.flour = row.quotas.flour;
  quotaForm.rice = row.quotas.rice;
  quotaForm.oil = row.quotas.oil;
  quotaForm.sugar = row.quotas.sugar;
  quotaDialogVisible.value = true;
}

async function saveQuotaChange() {
  quotaSaving.value = true;
  try {
    await updateCitizenCardQuota(currentEditingCard.value.id, { quotas: quotaForm });
    ElMessage.success('月度口粮定额调整已生效');
    quotaDialogVisible.value = false;
    await loadCards();
  } catch (e) {
    ElMessage.error('调整失败');
  } finally {
    quotaSaving.value = false;
  }
}

// 冻结/解冻配给卡
async function handleToggleCardStatus(row) {
  const newStatus = row.status === '已冻结' ? '正常' : '已冻结';
  try {
    await updateCitizenCardStatus(row.id, { status: newStatus });
    ElMessage.success(`配给卡状态已切换为【${newStatus}】`);
    await loadCards();
  } catch (e) {
    ElMessage.error('更新失败');
  }
}

// 补换发卡
async function handleReissueCard(row) {
  ElMessageBox.confirm(`确认对户主【${row.headName}】换发新卡？系统将重新写入安全芯片。`, '补换发配给卡', {
    confirmButtonText: '确认换发',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await reissueCitizenCard(row.id);
      ElMessage.success('新电子配给卡芯片已重新绑定下发！');
      await loadCards();
    } catch (e) {
      ElMessage.error('换发失败');
    }
  });
}

// 家庭成员抽屉
const membersDialogVisible = ref(false);
const selectedFamilyForMembers = ref(null);
function openMembersDrawer(row) {
  selectedFamilyForMembers.value = row;
  membersDialogVisible.value = true;
}

// 新增/编辑家庭
const familyDialogVisible = ref(false);
const isEditFamily = ref(false);
const familySaving = ref(false);
const familyForm = reactive({
  id: '',
  headName: '',
  headNationalId: '',
  category: '普通保障家庭',
  memberCount: 4
});

function openCreateFamilyDialog() {
  isEditFamily.value = false;
  familyForm.id = '';
  familyForm.headName = '';
  familyForm.headNationalId = '';
  familyForm.category = '普通保障家庭';
  familyForm.memberCount = 4;
  familyDialogVisible.value = true;
}

function openEditFamilyDialog(row) {
  isEditFamily.value = true;
  familyForm.id = row.id;
  familyForm.headName = row.headName;
  familyForm.headNationalId = row.headNationalId;
  familyForm.category = row.category;
  familyForm.memberCount = row.memberCount;
  familyDialogVisible.value = true;
}

async function saveFamily() {
  if (!familyForm.headName || !familyForm.headNationalId) {
    ElMessage.warning('请填写户主姓名与国民卡号');
    return;
  }
  familySaving.value = true;
  try {
    if (isEditFamily.value) {
      await updateFamily(familyForm.id, familyForm);
      ElMessage.success('家庭档案已更新');
    } else {
      await createFamily(familyForm);
      ElMessage.success('家庭档案建档成功');
    }
    familyDialogVisible.value = false;
    await loadFamilies();
  } catch (e) {
    ElMessage.error('保存失败');
  } finally {
    familySaving.value = false;
  }
}

async function handleDeleteFamily(row) {
  ElMessageBox.confirm(`确认注销户主【${row.headName}】的家庭户籍档案？`, '注销家庭档案', {
    type: 'warning',
    confirmButtonText: '确认注销',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteFamily(row.id);
      ElMessage.success('家庭户籍档案已注销');
      await loadFamilies();
    } catch (e) {
      ElMessage.error('注销失败');
    }
  });
}

// 编辑代理网点通用信息
const agentDialogVisible = ref(false);
const agentSaving = ref(false);
const agentForm = reactive({
  id: '',
  name: '',
  manager: '',
  phone: '',
  servedHouseholds: 500,
  storageCapacity: 50
});

function openEditAgentDialog(row) {
  agentForm.id = row.id;
  agentForm.name = row.name;
  agentForm.manager = row.manager;
  agentForm.phone = row.phone;
  agentForm.servedHouseholds = row.servedHouseholds;
  agentForm.storageCapacity = row.storageCapacity;
  agentDialogVisible.value = true;
}

async function saveAgent() {
  agentSaving.value = true;
  try {
    await updateAdminAgent(agentForm.id, agentForm);
    ElMessage.success('网点资料已更新');
    agentDialogVisible.value = false;
    await loadAgents();
  } catch (e) {
    ElMessage.error('更新失败');
  } finally {
    agentSaving.value = false;
  }
}

// ----------------------------------------------------
// 仓储中心管理模态弹窗与增删改操作 (新增)
// ----------------------------------------------------
const warehouseDialogVisible = ref(false);
const isEditWarehouse = ref(false);
const warehouseSaving = ref(false);
const warehouseForm = reactive({
  id: '',
  code: '',
  name: '',
  type: '战略储备总仓',
  province: '巴格达省',
  center: '卡尔赫第一粮食供应分部',
  capacity: 100000,
  currentStock: 80000,
  manager: '',
  phone: '',
  status: '正常运转',
  address: ''
});

function openCreateWarehouseDialog() {
  isEditWarehouse.value = false;
  warehouseForm.id = '';
  warehouseForm.code = `WH-BAG-${Math.floor(10 + Math.random() * 89)}`;
  warehouseForm.name = '';
  warehouseForm.type = '战略储备总仓';
  warehouseForm.province = '巴格达省';
  warehouseForm.center = '卡尔赫第一粮食供应分部';
  warehouseForm.capacity = 100000;
  warehouseForm.currentStock = 0;
  warehouseForm.manager = '';
  warehouseForm.phone = '+964 780 123 4567';
  warehouseForm.status = '正常运转';
  warehouseForm.address = '';
  warehouseDialogVisible.value = true;
}

function openEditWarehouseDialog(row) {
  isEditWarehouse.value = true;
  warehouseForm.id = row.id;
  warehouseForm.code = row.code;
  warehouseForm.name = row.name;
  warehouseForm.type = row.type;
  warehouseForm.province = row.province;
  warehouseForm.center = row.center;
  warehouseForm.capacity = row.capacity;
  warehouseForm.currentStock = row.currentStock;
  warehouseForm.manager = row.manager;
  warehouseForm.phone = row.phone;
  warehouseForm.status = row.status;
  warehouseForm.address = row.address;
  warehouseDialogVisible.value = true;
}

async function saveWarehouse() {
  if (!warehouseForm.name || !warehouseForm.code) {
    ElMessage.warning('请填写仓库编号与仓库官方名称');
    return;
  }
  warehouseSaving.value = true;
  try {
    if (isEditWarehouse.value) {
      await updateAdminWarehouse(warehouseForm.id, warehouseForm);
      ElMessage.success(`仓库【${warehouseForm.name}】信息已更新！`);
    } else {
      await createAdminWarehouse(warehouseForm);
      ElMessage.success(`战略储备仓库【${warehouseForm.name}】已成功建档录入！`);
    }
    warehouseDialogVisible.value = false;
    await loadWarehouses();
  } catch (e) {
    ElMessage.error('保存仓库失败');
  } finally {
    warehouseSaving.value = false;
  }
}

async function handleDeleteWarehouse(row) {
  ElMessageBox.confirm(`确认清退注销储备仓库【${row.name} (${row.code})】？此操作将移除该物理库容档案。`, '注销储备仓库', {
    type: 'warning',
    confirmButtonText: '确认注销',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteAdminWarehouse(row.id);
      ElMessage.success(`仓库【${row.name}】已成功注销删除！`);
      await loadWarehouses();
    } catch (e) {
      ElMessage.error('删除失败');
    }
  });
}

let offFamilyUpdated = null;
onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
  loadCards();
  offFamilyUpdated = onTabMessage('FAMILY_UPDATED', () => {
    loadCards();
    if (typeof loadFamilies === 'function') {
      loadFamilies();
    }
  });
});

onUnmounted(() => {
  if (offFamilyUpdated) {
    offFamilyUpdated();
  }
});
</script>

<style scoped>
</style>
