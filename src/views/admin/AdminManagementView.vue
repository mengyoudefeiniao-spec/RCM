<template>
  <div class="admin-management-view space-y-4">
    <!-- 顶部后台管理综合调度栏 (采用 ht.iq 官方绿色系与矢量 Logo) -->
    <div class="bg-[#FBFDFB] px-4 py-3 rounded-lg border border-[#C7E0CE] shadow-2xs flex items-center justify-between">
      <ModuleDescTip
        :title="$t('admin.pageTitle') || '全国配给系统后台综合治理与调度中心'"
        :content="$t('admin.pageSubtitle') || '负责全国电子配给卡发卡监管、家庭关系档案治理、网格代销网点全生命周期准入与战略仓储调度。'"
        :badge="$t('admin.centralSupervision') || '中央监管'"
        badge-type="success"
        title-class="text-sm font-bold text-[#326445]"
      >
        <template #icon>
          <div class="w-8 h-8 rounded-lg bg-white border border-[#C7E0CE] p-1 flex items-center justify-center shrink-0 shadow-2xs">
            <img src="/logo.svg" alt="ht.iq Logo" class="w-full h-full object-contain" />
          </div>
        </template>
        <template #extra>
          <div class="flex items-center gap-2">
            <el-tag size="small" type="success" effect="dark" class="font-bold !bg-[#326445] !border-[#326445]">
              {{ currentRoleTitle }}
            </el-tag>
            <el-button
              size="small"
              class="font-bold text-xs shrink-0 ht-btn-secondary"
              @click="activeTab = 'regulations'"
            >
              <span>📜 {{ $t('admin.tabRegulations') || '官方业务法规指南' }}</span>
            </el-button>
            <el-button
              size="small"
              class="font-bold text-xs shrink-0 ht-btn-primary"
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
    <div class="bg-white rounded-lg shadow-2xs border border-[#D9E5DB] overflow-hidden">
      <el-tabs v-model="activeTab" class="custom-admin-tabs px-2.5 sm:px-5 pt-2 sm:pt-3" @tab-change="handleTabChange">
        
        <!-- ========================================== -->
        <!-- Tab 1: 公民（电子配给卡）管理 -->
        <!-- ========================================== -->
        <el-tab-pane name="cards">
          <template #label>
            <span class="flex items-center gap-1.5">
              <span>{{ $t('admin.tabCards') || '公民配给卡管理' }}</span>
              <el-tag size="small" type="primary" effect="plain" class="scale-90 origin-left rtl:origin-right">{{ $t('admin.electronicCard') || '电子卡' }}</el-tag>
            </span>
          </template>
          <div class="py-3.5 space-y-3.5">
            <!-- 视图模式切换与状态栏 -->
            <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#D9E5DB] shadow-2xs">
              <div class="flex items-center gap-2">
                <el-radio-group v-model="cardViewMode" size="small">
                  <el-radio-button value="cards">
                    <span class="flex items-center gap-1.5 font-medium">
                      <el-icon><CreditCard /></el-icon>
                      <span>{{ $t('admin.viewModeCards') || '配给卡总账' }}</span>
                      <span class="ms-1 px-1.5 py-0.2 rounded-full bg-[#E9F1EB] text-[#58685D] text-[11px] font-mono">{{ filteredCards.length }}</span>
                    </span>
                  </el-radio-button>
                  <el-radio-button value="members">
                    <span class="flex items-center gap-1.5 font-medium">
                      <el-icon><User /></el-icon>
                      <span>{{ $t('admin.viewModeMembers') || '在册家庭成员清单' }}</span>
                      <span class="ms-1 px-1.5 py-0.2 rounded-full bg-[#E1F4E4] text-[#24483A] text-[11px] font-mono">{{ currentFamilyMembers.length }}</span>
                    </span>
                  </el-radio-button>
                </el-radio-group>
              </div>

              <!-- 实时联通徽章 -->
              <div class="flex items-center gap-2 text-xs">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF5F1] text-[#2F5B44] border border-[#C7E0CE] font-medium">
                  <span class="w-2 h-2 rounded-full bg-[#3E9B68] animate-pulse"></span>
                  {{ $t('admin.syncedWithCitizenApp') || '与公民APP家庭成员实时联通' }}
                </span>
                <span class="text-[#8A9A8F] font-mono text-[11px]">{{ currentCardFamily?.cardNo || currentCardFamily?.rationCardNo || '—' }}</span>
              </div>
            </div>

            <!-- 模式 1: 配给卡总账 (Cards) -->
            <div v-show="cardViewMode === 'cards'" class="space-y-3.5">
              <!-- 检索筛选栏 -->
              <div class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#E9F1EB] flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div class="flex flex-wrap items-center gap-2.5">
                  <el-input
                    v-model="cardQuery.cardNo"
                    class="bidi-ltr"
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

                <div class="text-xs text-[#58685D] font-mono">
                  {{ $t('admin.matchCards', { count: filteredCards.length }) }}
                </div>
              </div>

              <!-- 配给卡数据表格 (自适应占比优化) -->
              <el-table :data="paginatedCards" v-loading="cardsLoading" border stripe style="width: 100%" size="small" class="text-xs card-ledger-table" @row-click="openCardDetailDrawer">
                <el-table-column prop="cardNo" :label="$t('admin.cardNo') || '配给卡号'" width="160" fixed>
                  <template #default="{ row }">
                    <span class="font-mono font-bold text-[#326445]">{{ row.cardNo }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('admin.cardUserName') || '配给卡用户名称'" min-width="190">
                  <template #default="{ row }">
                    <div class="font-medium text-[#1F3326]">{{ formatHeadName(row.headName) }}</div>
                    <div class="text-[11px] text-[#8A9A8F] font-mono">{{ row.nationalId }}</div>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('admin.regionInfo') || '所属行政省市/基层区'" min-width="220">
                  <template #default="{ row }">
                    <div class="text-xs text-[#43554B] font-medium">{{ formatProvince(row.province) }}</div>
                    <div class="text-[11px] text-[#8A9A8F]">{{ formatDistrict(row.district) }}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="memberCount" :label="$t('admin.population') || '人口'" width="90" align="center">
                  <template #default="{ row }">
                    <span class="font-bold font-mono text-[#2F5B44]">{{ row.memberCount }}</span> {{ $t('admin.personUnit') || '人' }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('admin.monthlyQuotaAudit') || '本月配额外核'" min-width="260">
                  <template #default="{ row }">
                    <div class="flex items-center gap-1.5 text-[11px] flex-wrap">
                      <span class="bg-[#EFF5F1] text-[#2A5440] px-1.5 py-0.5 rounded border border-[#C7DED0]">{{ $t('admin.flour') || '面粉' }}: {{ row.quotas?.flour ?? 0 }}kg</span>
                      <span class="bg-[#FDF3E0] text-[#7A5F21] px-1.5 py-0.5 rounded border border-[#F2E3C6]">{{ $t('admin.rice') || '大米' }}: {{ row.quotas?.rice ?? 0 }}kg</span>
                      <span class="bg-[#EFF5F1] text-[#2F5B44] px-1.5 py-0.5 rounded border border-[#C7E0CE]">{{ $t('admin.oil') || '油' }}: {{ row.quotas?.oil ?? 0 }}L</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="status" :label="$t('admin.cardStatus') || '状态'" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.status === '正常' || row.status === 'Active'" type="success" size="small">{{ formatCardStatus('正常') }}</el-tag>
                    <el-tag v-else-if="row.status === '已冻结' || row.status === 'Frozen'" type="danger" size="small">{{ formatCardStatus('已冻结') }}</el-tag>
                    <el-tag v-else-if="row.status === '审核中' || row.status === 'Under Review'" type="warning" size="small">{{ formatCardStatus('审核中') }}</el-tag>
                    <el-tag v-else type="warning" size="small">{{ formatCardStatus(row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('admin.actions') || '操作'" width="130" fixed="right" align="center">
                  <template #default="{ row }">
                    <div class="flex items-center justify-center gap-1.5">
                      <!-- 查看家庭成员存根 (与公民端 Family Members 完全联动) -->
                      <el-tooltip :content="$t('admin.viewFamilyMembers') || '查看家庭成员清单'" placement="top" :show-after="200">
                        <el-button
                          circle
                          size="small"
                          type="info"
                          plain
                          class="hover:scale-110 transition-transform shadow-2xs"
                          @click.stop="openCardMembersDrawer(row)"
                        >
                          <el-icon><User /></el-icon>
                        </el-button>
                      </el-tooltip>

                      <!-- 冻结家庭成员图标按钮 (弹出成员列表及状态，支持选择成员与原因) -->
                      <el-tooltip
                        :content="$t('admin.memberFreezeAction') || '家庭成员冻结管控'"
                        placement="top"
                        :show-after="200"
                      >
                        <el-button
                          circle
                          size="small"
                          type="danger"
                          plain
                          class="hover:scale-110 transition-transform shadow-2xs"
                          @click.stop="openMemberFreezeDialog(row)"
                        >
                          <el-icon><Lock /></el-icon>
                        </el-button>
                      </el-tooltip>

                      <!-- 换发图标按钮 -->
                      <el-tooltip :content="$t('admin.reissue') || '换发新卡 / 重置NFC'" placement="top" :show-after="200">
                        <el-button
                          circle
                          size="small"
                          type="warning"
                          plain
                          class="hover:scale-110 transition-transform shadow-2xs"
                          @click.stop="handleReissueCard(row)"
                        >
                          <el-icon class="rtl-mirror-icon"><RefreshRight /></el-icon>
                        </el-button>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="p-2.5 bg-[#F3F8F4] border-t border-[#D9E5DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
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

            <!-- 模式 2: 在册家庭成员名册 (Members) (与公民 APP 移动视口 Family Members 1:1 镜像) -->
            <div v-show="cardViewMode === 'members'" class="space-y-3.5">
              <!-- 顶部当前家庭信息摘要横幅 -->
              <div class="bg-gradient-to-r rtl:bg-gradient-to-l from-[#EFF5F1] via-[#EFF5F1] to-[#F3F8F4] p-3.5 rounded-lg border border-[#E1F4E4] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-[#2F5B44] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    <el-icon><UserFilled /></el-icon>
                  </div>
                  <div>
                    <div class="font-bold text-[#1F3326] text-sm flex items-center gap-2">
                      <span>{{ formatHeadName(currentCardFamily?.headName) || '—' }}</span>
                      <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono">
                        {{ currentCardFamily?.cardNo || currentCardFamily?.rationCardNo || '—' }}
                      </el-tag>
                      <span v-if="currentCardFamily?.familyCode" class="text-xs font-normal text-[#58685D] font-mono">({{ currentCardFamily.familyCode }})</span>
                    </div>
                    <div class="text-[11px] text-[#58685D] mt-0.5">
                      {{ $t('admin.linkedAgentBranch') || '所属定点分部' }}: {{ formatDistrict(currentCardFamily?.district) }} · {{ formatProvince(currentCardFamily?.province) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <div class="bg-white px-3 py-1.5 rounded-lg border border-[#D9E5DB] text-center shadow-2xs">
                    <span class="text-[10px] text-[#8A9A8F] block">{{ $t('admin.currentMembersCount') || '在册保障人口' }}</span>
                    <span class="font-bold font-mono text-[#2F5B44] text-sm">{{ currentFamilyMembers.length }} {{ $t('admin.personUnit') || '人' }}</span>
                  </div>
                  <div class="bg-white px-3 py-1.5 rounded-lg border border-[#D9E5DB] text-center shadow-2xs">
                    <span class="text-[10px] text-[#8A9A8F] block">{{ $t('admin.syncStatus') || '与公民APP同步' }}</span>
                    <span class="font-bold text-[#2F7A50] text-xs flex items-center justify-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#3E9B68] animate-pulse"></span>
                      {{ $t('admin.liveSynced') || '实时同步中' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 家庭成员数据表格 (与公民 APP Family Members 1:1 镜像) -->
              <el-table :data="paginatedMembers" border stripe style="width: 100%" size="small" class="text-xs">
                <el-table-column prop="nationalId" :label="$t('admin.nationalId') || '国民身份证号'" width="160" fixed>
                  <template #default="{ row }">
                    <span class="font-mono font-bold text-[#43554B]">{{ row.nationalId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="name" :label="$t('admin.name') || '姓名'" min-width="160">
                  <template #default="{ row }">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-[#1F3326]">{{ formatMemberName(row.name) }}</span>
                      <el-tag v-if="sameLabel(row.relation, '户主')" size="small" type="warning" effect="dark" class="scale-75 origin-left rtl:origin-right">
                        {{ w('户主') }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="relation" :label="$t('admin.relation') || '与户主关系'" width="130" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" type="info">{{ formatMemberRelation(row.relation) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="gender" :label="$t('admin.gender') || '性别'" width="80" align="center">
                  <template #default="{ row }">
                    <span>{{ formatMemberGender(row.gender) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="birthDate" :label="$t('admin.birthDate') || '出生日期'" width="110" align="center">
                  <template #default="{ row }">
                    <span class="font-mono text-[#58685D]">{{ row.birthDate }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('admin.quotaShare') || '人均口粮保障定额'" min-width="230">
                  <template #default>
                    <div class="flex items-center gap-1.5 text-[11px] flex-wrap">
                      <span class="bg-[#EFF5F1] text-[#2A5440] px-1.5 py-0.5 rounded border border-[#C7DED0]">{{ $t('admin.flour') || '面粉' }}: 9kg</span>
                      <span class="bg-[#FDF3E0] text-[#7A5F21] px-1.5 py-0.5 rounded border border-[#F2E3C6]">{{ $t('admin.rice') || '大米' }}: 3kg</span>
                      <span class="bg-[#EFF5F1] text-[#2F5B44] px-1.5 py-0.5 rounded border border-[#C7E0CE]">{{ $t('admin.oil') || '油' }}: 1L</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="status" :label="$t('admin.cardStatus') || '状态'" width="140" align="center">
                  <template #default="{ row }">
                    <div class="flex flex-col items-center gap-0.5">
                      <el-tag v-if="row.status === '正常' || row.status === 'Active'" type="success" size="small">{{ formatCardStatus('正常') }}</el-tag>
                      <el-tag v-else type="danger" size="small">{{ formatCardStatus('已冻结') }}</el-tag>
                      <span v-if="(row.status === '已冻结' || row.status === 'Frozen') && row.freezeReason" class="text-[10px] text-[#C04442] font-semibold bg-[#FBEAE9] px-1.5 py-0.2 rounded border border-[#F2D5D4]">
                        {{ formatFreezeReason(row.freezeReason) }}
                      </span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('admin.actions') || '操作'" width="150" align="center" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" type="primary" link @click="viewMemberRegistration(row)">{{ $t('memberRegistration.view') }}</el-button>
                    <el-button
                      size="small"
                      :type="row.status === '已冻结' || row.status === 'Frozen' ? 'success' : 'danger'"
                      link
                      class="font-medium"
                      @click="openMemberFreezeDialogFromMember(row)"
                    >
                      {{ row.status === '已冻结' || row.status === 'Frozen' ? ($t('admin.unfreezeCard') || '解冻') : ($t('admin.freezeCard') || '冻结') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 (与公民端成员总数完全一致) -->
              <div class="p-2.5 bg-[#F3F8F4] border-t border-[#D9E5DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
                <span>{{ $t('admin.totalRecords', { count: currentFamilyMembers.length }) }}</span>
                <el-pagination
                  v-model:current-page="memberPage"
                  v-model:page-size="memberPageSize"
                  :page-sizes="[5, 10, 20]"
                  layout="total, sizes, prev, pager, next"
                  :total="currentFamilyMembers.length"
                  size="small"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- ========================================== -->
        <!-- Tab 2: 家庭户籍档案管理 -->
        <!-- ========================================== -->
        <el-tab-pane :label="$t('admin.tabFamilies') || '家庭户籍档案管理'" name="families">
          <div class="py-3.5 space-y-3.5">
            <div class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#E9F1EB] flex flex-wrap items-center justify-between gap-2.5 text-xs">
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
                  <span class="font-mono font-bold text-[#1F3326]">{{ row.familyCode }}</span>
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
                  <div class="text-[#1F3326] font-medium">{{ row.adminBranch || '供应分部' }}</div>
                  <div class="text-[11px] text-[#8A9A8F]">{{ row.address }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.actions') || '操作'" width="150" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1.5">
                    <el-tooltip :content="$t('admin.membersCountBtn', { count: row.memberCount })" placement="top">
                      <el-button size="small" type="info" :icon="User" @click="openMembersDrawer(row)" />
                    </el-tooltip>
                    <el-tooltip :content="$t('common.edit') || '编辑'" placement="top">
                      <el-button size="small" type="primary" :icon="Edit" @click="openEditFamilyDialog(row)" />
                    </el-tooltip>
                    <el-tooltip :content="$t('common.delete') || '注销'" placement="top">
                      <el-button size="small" type="danger" :icon="Delete" @click="handleDeleteFamily(row)" />
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="p-2.5 bg-[#F3F8F4] border-t border-[#D9E5DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
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
            <div class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#E9F1EB] flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div class="flex flex-wrap items-center gap-2.5">
                <el-input
                  v-model="agentQuery.code"
                  :placeholder="$t('admin.agentQueryCode')"
                  style="width: 160px"
                  size="small"
                  clearable
                  @keyup.enter="handleAgentSearch"
                />
                <el-input
                  v-model="agentQuery.name"
                  :placeholder="$t('admin.agentQueryName')"
                  style="width: 170px"
                  size="small"
                  clearable
                  @keyup.enter="handleAgentSearch"
                />
                <!-- 省市筛选 -->
                <el-select v-model="agentQuery.province" :placeholder="$t('admin.allProvinces') || '全部省市'" style="width: 130px" size="small" @change="handleAgentProvinceChange">
                  <el-option :label="$t('admin.allProvinces') || '全部省市'" value="全部" />
                  <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                </el-select>
                <!-- 中心筛选 -->
                <el-select v-model="agentQuery.center" :placeholder="$t('admin.allCenters') || '全部中心'" style="width: 170px" size="small" @change="handleAgentSearch">
                  <el-option :label="$t('admin.allCenters') || '全部中心'" value="全部" />
                  <el-option v-for="c in currentAgentCenterOptions" :key="c" :label="c" :value="c" />
                </el-select>
                <el-select v-model="agentQuery.status" :placeholder="$t('admin.opStatus') || '运营状态'" style="width: 120px" size="small" @change="handleAgentSearch">
                  <el-option :label="$t('admin.allStatuses') || '全部状态'" value="全部" />
                  <el-option :label="$t('admin.opStatusNormal')" value="正常营业" />
                  <el-option :label="$t('admin.opStatusSuspended')" value="停业整顿" />
                  <el-option :label="$t('admin.opStatusRevoked')" value="已注销(空置)" />
                  <el-option :label="$t('admin.opStatusLicenseRevoked')" value="吊销资质" />
                </el-select>
                <el-button type="primary" size="small" :icon="Search" @click="handleAgentSearch">{{ $t('admin.btnSearch') }}</el-button>
                <el-button size="small" :icon="Refresh" @click="resetAgentQuery">{{ $t('admin.btnReset') }}</el-button>
              </div>

              <!-- 表头快捷操作栏：根据当前用户角色动态融入专属法定职权入口 -->
              <div class="flex items-center gap-2 flex-wrap">
                <!-- 部长专属：设立代理权、统一代理权 -->
                <template v-if="authStore.isMinisterCenter || authStore.currentRole === 'admin'">
                  <el-button type="success" size="small" :icon="Plus" @click="openEstablishAgencyModal">
                    {{ $t('admin.establishAgency') }}
                  </el-button>
                  <el-button type="primary" plain size="small" @click="openUnifyAgencyModal">
                    {{ $t('admin.unifyAgencyRules') }}
                  </el-button>
                </template>

                <!-- 行政次长：快速轮替/恢复入口提示 -->
                <template v-if="authStore.isDeputyMinister">
                  <el-tag type="danger" effect="plain" class="font-bold">
                    {{ $t('admin.deputySeatActive') }}
                  </el-tag>
                </template>

                <!-- 规划总干事：轮替/转移申报通道 -->
                <template v-if="authStore.isDirectorPlanning">
                  <el-button type="warning" plain size="small" @click="openRotateTransferModal">
                    {{ $t('admin.rotateTransferApproval') }}
                  </el-button>
                </template>
              </div>
            </div>

            <!-- 代理网点表格 (自适应占比优化) -->
            <el-table :data="paginatedAgents" v-loading="agentsLoading" border stripe style="width: 100%" size="small" class="text-xs">
              <el-table-column prop="code" :label="$t('admin.agentCode') || '网点代号'" width="120" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-[#7A5F21]">{{ row.code }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('admin.agentNameArea') || '网点名称与片区'" min-width="260">
                <template #default="{ row }">
                  <div class="font-bold text-[#1F3326]">{{ row.name }}</div>
                  <div class="text-[11px] text-[#8A9A8F]">{{ row.province }} · {{ row.district || row.address }}</div>
                  <div v-if="row.planningConfirmed" class="text-[10px] text-[#2F7A50] font-bold flex items-center gap-0.5 mt-0.5">
                    <el-icon><Check /></el-icon> {{ $t('admin.planningConfirmedNote') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.manager') || '负责人'" min-width="160">
                <template #default="{ row }">
                  <div class="font-medium text-[#43554B]">{{ row.manager }}</div>
                  <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.phone }}</div>
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
                    <span class="font-mono font-bold" :class="row.servedHouseholds > 1500 ? 'text-[#C04442]' : 'text-[#43554B]'">
                      {{ row.servedHouseholds }} {{ $t('admin.householdsUnit') }}
                    </span>
                    <div v-if="row.servedHouseholds > 1500" class="text-[10px] text-[#C04442] font-bold">
                      {{ $t('admin.over1500Redline') }}
                    </div>
                    <div v-else-if="row.servedHouseholds <= 750" class="text-[10px] text-[#C9A13B] font-medium">
                      {{ $t('admin.under750Small') }}
                    </div>
                  </div>
                </template>
              </el-table-column>

              <!-- 代理网点专属管辖职权操作列 (图标化 + 悬停提示，避免长词条挤压布局) -->
              <el-table-column :label="$t('admin.governanceActions') || '专属管辖职权操作'" width="150" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1 flex-wrap">
                    <!-- 1. 【配给中心部长专属】：拆分大网点 + 授予代理权 -->
                    <template v-if="authStore.isMinisterCenter || authStore.currentRole === 'admin'">
                      <el-tooltip :content="$t('admin.splitLargeOutlet')" placement="top">
                        <el-button
                          v-if="row.servedHouseholds > 1500"
                          size="small"
                          type="danger"
                          :icon="Scissor"
                          @click="handleDirectSplit(row)"
                        />
                      </el-tooltip>
                      <el-tooltip :content="$t('admin.grantAgency')" placement="top">
                        <el-button
                          size="small"
                          type="primary"
                          :icon="Stamp"
                          @click="openGrantAgencyModal(row)"
                        />
                      </el-tooltip>
                    </template>

                    <!-- 2. 【行政次长专属】：已故轮替终审 + 恢复代理权 -->
                    <template v-if="authStore.isDeputyMinister || authStore.currentRole === 'admin'">
                      <el-tooltip :content="$t('admin.deceasedRotation')" placement="top">
                        <el-button
                          size="small"
                          type="danger"
                          :icon="ChatDotRound"
                          @click="openDeceasedRotationModal(row)"
                        />
                      </el-tooltip>
                      <el-tooltip :content="$t('admin.restoreAgency')" placement="top">
                        <el-button
                          v-if="row.status.includes('注销')"
                          size="small"
                          type="danger"
                          :icon="RefreshRight"
                          @click="handleRestoreWithCheck(row)"
                        />
                      </el-tooltip>
                    </template>

                    <!-- 3. 【规划跟进司总干事专属】：调查确认 + 合并网点 + 处罚 + 注销 -->
                    <template v-if="authStore.isDirectorPlanning || authStore.currentRole === 'admin'">
                      <el-tooltip :content="$t('admin.planningConfirm')" placement="top">
                        <el-button
                          v-if="row.status.includes('注销') && !row.planningConfirmed"
                          size="small"
                          type="warning"
                          :icon="ScaleToOriginal"
                          @click="handleConfirmPlanning(row)"
                        />
                      </el-tooltip>
                      <el-tooltip :content="$t('admin.mergeOutlets')" placement="top">
                        <el-button
                          v-if="row.servedHouseholds <= 750 && row.status === '正常营业'"
                          size="small"
                          type="warning"
                          :icon="Connection"
                          @click="handleMergePrompt(row)"
                        />
                      </el-tooltip>
                      <el-tooltip :content="$t('admin.penalize')" placement="top">
                        <el-button
                          size="small"
                          type="danger"
                          :icon="WarningFilled"
                          @click="handlePenalizePrompt(row)"
                        />
                      </el-tooltip>
                      <el-tooltip :content="$t('admin.revokeAgency')" placement="top">
                        <el-button
                          v-if="row.status === '正常营业'"
                          size="small"
                          type="danger"
                          :icon="CircleClose"
                          @click="handleCancelAgencyPrompt(row)"
                        />
                      </el-tooltip>
                    </template>

                    <!-- 通用信息编辑 -->
                    <el-tooltip :content="$t('common.edit') || '编辑'" placement="top">
                      <el-button size="small" type="primary" :icon="Edit" @click="openEditAgentDialog(row)" />
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="p-2.5 bg-[#F3F8F4] border-t border-[#D9E5DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
              <span>{{ $t('admin.totalRecords', { count: filteredAgents.length }) }}</span>
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
            <div class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#E9F1EB] flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div class="flex flex-wrap items-center gap-2.5">
                <el-input
                  v-model="warehouseQuery.keyword"
                  :placeholder="$t('admin.warehouseQueryKeyword')"
                  style="width: 190px"
                  size="small"
                  clearable
                  @keyup.enter="handleWarehouseSearch"
                />
                <!-- 省市筛选 -->
                <el-select v-model="warehouseQuery.province" :placeholder="$t('admin.allProvinces') || '全部省市'" style="width: 130px" size="small" @change="handleWarehouseProvinceChange">
                  <el-option :label="$t('admin.allProvinces') || '全部省市'" value="全部" />
                  <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                </el-select>
                <!-- 中心筛选 -->
                <el-select v-model="warehouseQuery.center" :placeholder="$t('admin.allCenters') || '全部中心'" style="width: 170px" size="small" @change="handleWarehouseSearch">
                  <el-option :label="$t('admin.allCenters') || '全部中心'" value="全部" />
                  <el-option v-for="c in currentWarehouseCenterOptions" :key="c" :label="c" :value="c" />
                </el-select>
                <!-- 类型筛选 -->
                <el-select v-model="warehouseQuery.type" :placeholder="$t('admin.whTypeAll')" style="width: 130px" size="small" @change="handleWarehouseSearch">
                  <el-option :label="$t('admin.whTypeAll')" value="全部" />
                  <el-option :label="$t('admin.whTypeStrategic')" value="战略储备总仓" />
                  <el-option :label="$t('admin.whTypeRegional')" value="区域中心仓" />
                  <el-option :label="$t('admin.whTypeHub')" value="枢纽前置仓" />
                  <el-option :label="$t('admin.whTypeEmergency')" value="应急保供仓" />
                </el-select>

                <el-button type="primary" size="small" :icon="Search" @click="handleWarehouseSearch">{{ $t('admin.btnSearch') }}</el-button>
                <el-button size="small" :icon="Refresh" @click="resetWarehouseQuery">{{ $t('admin.btnReset') }}</el-button>
              </div>

              <div>
                <el-button type="primary" size="small" :icon="Plus" @click="openCreateWarehouseDialog">
                  {{ $t('admin.createWarehouse') || '新建储备仓库' }}
                </el-button>
              </div>
            </div>

            <!-- 仓储中心表格 (自适应占比优化) -->
            <el-table :data="paginatedWarehouses" v-loading="warehousesLoading" border stripe style="width: 100%" size="small" class="text-xs">
              <el-table-column prop="code" :label="$t('admin.warehouseCode') || '仓库编号'" width="130" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-[#2F5B44]">{{ row.code }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" :label="$t('admin.warehouseName') || '储备仓库名称'" min-width="260">
                <template #default="{ row }">
                  <div class="font-bold text-[#1F3326]">{{ row.name }}</div>
                  <div class="text-[11px] text-[#8A9A8F]">{{ row.province }} · {{ row.center }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="type" :label="$t('admin.warehouseType') || '仓库功能类型'" width="130" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.type.includes('总仓') ? 'danger' : row.type.includes('中心') ? 'primary' : 'success'" effect="plain">
                    {{ row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.capacityStockCol')" min-width="220">
                <template #default="{ row }">
                  <div class="space-y-0.5 text-xs">
                    <div class="flex justify-between font-mono">
                      <span class="text-[#8A9A8F]">{{ $t('admin.approvedCapacity', { val: (row.capacity || 0).toLocaleString() }) }}</span>
                      <span class="font-bold text-[#1F3326]">{{ $t('admin.currentStockLabel', { val: (row.currentStock || 0).toLocaleString() }) }}</span>
                    </div>
                    <div class="w-full bg-[#E9F1EB] rounded-full h-1.5 overflow-hidden">
                      <div
                        class="h-1.5 rounded-full"
                        :class="Math.round((row.currentStock / (row.capacity || 1)) * 100) > 90 ? 'bg-[#D3AF62]' : 'bg-[#3E9B68]'"
                        :style="{ width: `${Math.min(100, Math.round((row.currentStock / (row.capacity || 1)) * 100))}%` }"
                      ></div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.manager') || '负责人'" min-width="160">
                <template #default="{ row }">
                  <div class="font-medium text-[#43554B]">{{ row.manager }}</div>
                  <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.phone }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="status" :label="$t('admin.opStatus') || '运营状态'" width="110" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.status === '正常运转' ? 'success' : 'warning'">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('admin.actions') || '操作'" width="110" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1.5">
                    <el-tooltip :content="$t('common.edit') || '编辑'" placement="top">
                      <el-button size="small" type="primary" :icon="Edit" @click="openEditWarehouseDialog(row)" />
                    </el-tooltip>
                    <el-tooltip :content="$t('common.delete') || '删除'" placement="top">
                      <el-button size="small" type="danger" :icon="Delete" @click="handleDeleteWarehouse(row)" />
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="p-2.5 bg-[#F3F8F4] border-t border-[#D9E5DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
              <span>{{ $t('admin.warehouseTotalCount', { count: filteredWarehouses.length }) }}</span>
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
              <el-tag size="small" type="success" effect="dark" class="scale-90 origin-left rtl:origin-right font-mono">{{ $t('reconciliation.balancedTag') || '100% 平衡' }}</el-tag>
            </span>
          </template>
          <div class="py-2">
            <ReconciliationTab />
          </div>
        </el-tab-pane>

        <!-- ========================================== -->
        <!-- Tab 6: ht.iq 官方业务制度与政策问答指南 (FAQ) -->
        <!-- ========================================== -->
        <el-tab-pane name="regulations">
          <template #label>
            <span class="flex items-center gap-1.5">
              <span>{{ $t('admin.tabRegulations') || '官方业务法规指南' }}</span>
              <el-tag size="small" type="success" effect="plain" class="scale-90 origin-left rtl:origin-right font-mono font-bold">FAQ</el-tag>
            </span>
          </template>
          <div class="py-2">
            <OfficialRegulationsTab />
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
        <div class="p-3 bg-[#FBEAE9] border border-[#F2D5D4] rounded-lg text-[#6E2F2E] leading-relaxed">
          <strong>法定红线依据</strong>：依据单店 1,500 户容量红线，网点<strong>【{{ activeSplitAgent?.name }}】</strong>当前签约户数已达 <strong>{{ activeSplitAgent?.servedHouseholds }} 户</strong>，超出法定承载力。
        </div>
        <div class="bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB] space-y-1.5">
          <div class="flex justify-between">
            <span class="text-[#58685D]">拆分方案：</span>
            <span class="font-bold text-[#1F3326]">一分为二 (拆分设立第一网点 / 第二网点)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#58685D]">拆分后各网点户数：</span>
            <span class="font-mono font-bold text-[#2F7A50]">约 {{ Math.floor((activeSplitAgent?.servedHouseholds || 1800) / 2) }} 户 / 店</span>
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
            <el-input class="bidi-ltr" v-model="establishForm.phone" placeholder="+964 770 000 0000" />
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

    <!-- 3.4 家庭成员纳保与冻结状态管控对话框 -->
    <el-dialog
      v-model="memberFreezeDialogVisible"
      :title="$t('admin.memberFreezeDialogTitle') || '家庭成员纳保与冻结状态管控'"
      width="700px"
      align-center
      destroy-on-close
    >
      <div v-if="selectedCardForFreeze" class="space-y-3.5 text-xs">
        <!-- 顶部家庭基础卡片信息提示 -->
        <div class="bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB] flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <div class="font-bold text-[#1F3326] text-sm flex items-center gap-2">
              <span>{{ formatHeadName(selectedCardForFreeze.headName) }}</span>
              <span class="text-xs font-mono text-[#326445] bg-[#EFF5F1] px-2 py-0.5 rounded border border-[#C7DED0] font-bold">{{ selectedCardForFreeze.cardNo }}</span>
            </div>
            <div class="text-[11px] text-[#58685D] mt-1">
              {{ $t('admin.regionInfo') || '辖区分部' }}: {{ formatDistrict(selectedCardForFreeze.district) }} · {{ formatProvince(selectedCardForFreeze.province) }}
            </div>
          </div>
          <div class="text-end">
            <span class="text-[10px] text-[#8A9A8F] block">{{ $t('admin.currentMembersCount') || '在册成员总数' }}</span>
            <span class="font-bold font-mono text-[#2F5B44] text-sm">{{ getFreezeTargetMembers().length }} {{ $t('admin.personUnit') || '人' }}</span>
          </div>
        </div>

        <div class="p-2.5 bg-[#FDF3E0] rounded-lg border border-[#F2E3C6] text-[#6B5321] text-[11px] flex items-center gap-2">
          <el-icon class="text-[#C9A13B] text-sm shrink-0"><InfoFilled /></el-icon>
          <span>{{ $t('admin.freezeDialogTip') || '依据第140号行政法令与保供合规规程，您可以选择特定家庭成员冻结其配给资格或解除冻结。冻结后，公民移动端视口将实时同步呈现。' }}</span>
        </div>

        <!-- 家庭成员明细列表 -->
        <div>
          <div class="font-bold text-[#1F3326] mb-2 flex items-center justify-between">
            <span>{{ $t('admin.familyMembersList') || '家庭成员清单及状态' }}</span>
            <span class="text-[11px] font-normal text-[#58685D]">{{ $t('admin.selectMemberHint') || '请点击对应成员进行状态管控' }}</span>
          </div>

          <el-table
            :data="getFreezeTargetMembers()"
            border
            stripe
            size="small"
            highlight-current-row
            @current-change="handleSelectMemberForFreeze"
          >
            <el-table-column width="45" align="center">
              <template #default="{ row }">
                <el-radio
                  :model-value="selectedMemberToFreeze?.id"
                  :label="row.id"
                  @change="() => handleSelectMemberForFreeze(row)"
                >
                  &nbsp;
                </el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="name" :label="$t('admin.name') || '姓名'" min-width="130">
              <template #default="{ row }">
                <span class="font-bold text-[#1F3326]">{{ formatMemberName(row.name) }}</span>
                <el-tag v-if="sameLabel(row.relation, '户主')" size="small" type="warning" effect="dark" class="scale-75 origin-left rtl:origin-right ms-1">
                  {{ w('户主') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="relation" :label="$t('admin.relation') || '关系'" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ formatMemberRelation(row.relation) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="nationalId" :label="$t('admin.nationalId') || '国民卡号'" width="140" align="center" />
            <el-table-column prop="status" :label="$t('admin.cardStatus') || '纳保状态'" width="95" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.status === '正常' || row.status === 'Active'" type="success" size="small">{{ formatCardStatus('正常') }}</el-tag>
                <el-tag v-else type="danger" size="small">{{ formatCardStatus('已冻结') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.freezeReasonCol') || '冻结原因 / 经办说明'" min-width="140">
              <template #default="{ row }">
                <span v-if="row.status === '已冻结' || row.status === 'Frozen'" class="text-[#C04442] font-medium bg-[#FBEAE9] px-1.5 py-0.5 rounded border border-[#F2D5D4]">
                  {{ formatFreezeReason(row.freezeReason) }}
                </span>
                <span v-else class="text-[#8A9A8F]">—</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.actions') || '操作'" width="90" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === '已冻结' || row.status === 'Frozen'"
                  size="small"
                  type="success"
                  link
                  :loading="freezeLoading && selectedMemberToFreeze?.id === row.id"
                  @click.stop="handleDirectUnfreeze(row)"
                >
                  {{ $t('admin.unfreezeCard') || '解冻' }}
                </el-button>
                <el-button
                  v-else
                  size="small"
                  type="danger"
                  link
                  @click.stop="handleSelectMemberForFreeze(row)"
                >
                  {{ $t('admin.freezeCard') || '冻结' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 冻结原因选择配置区 (当选中的成员处于正常状态时展开) -->
        <div v-if="selectedMemberToFreeze && (selectedMemberToFreeze.status === '正常' || selectedMemberToFreeze.status === 'Active')" class="p-3.5 bg-[#FBEAE9]/50 rounded-lg border border-[#F2D5D4] space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F7E3E2]">
            <span class="font-bold text-[#6E2F2E] text-xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#C04442]"></span>
              {{ $t('admin.freezeConfigTitle') || '冻结原因配置' }}: {{ formatMemberName(selectedMemberToFreeze.name) }} ({{ formatMemberRelation(selectedMemberToFreeze.relation) }})
            </span>
            <span class="text-[11px] text-[#58685D] font-mono">{{ selectedMemberToFreeze.nationalId }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-[#43554B] mb-1">
                {{ $t('admin.selectFreezeReason') || '官方冻结原因 (参考解冻法定分类)' }} <span class="text-[#C04442]">*</span>
              </label>
              <el-select v-model="freezeForm.reasonType" class="w-full" size="small">
                <el-option :label="$t('unfreeze.caseCommercial') || '商业 (拥有商业注册/执照)'" value="commercial" />
                <el-option :label="$t('unfreeze.caseTravel') || '旅行 (出国或长期境外滞留)'" value="travel" />
                <el-option :label="$t('unfreeze.caseHighIncome') || '高收入 (月收入超保供救济上限)'" value="highIncome" />
                <el-option :label="$t('unfreeze.caseUnknownAddress') || '住址不明 (户籍居住地址核验失联)'" value="unknownAddress" />
                <el-option :label="$t('unfreeze.caseUpdate') || '更新 (户籍核心资料待更新)'" value="update" />
                <el-option :label="$t('unfreeze.caseDuplicate') || '重复 (存在跨省/跨卡重复申报)'" value="duplicate" />
                <el-option :label="$t('unfreeze.caseTemporary') || '临时 (未按期完成人脸/生物识别年检)'" value="temporary" />
                <el-option :label="$t('unfreeze.caseGeoLocation') || '地理位置 (申领基站与归属分部不符)'" value="geoLocation" />
              </el-select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-[#43554B] mb-1">
                {{ $t('admin.freezeNotes') || '经办行政公文备注 (可选)' }}
              </label>
              <el-input
                v-model="freezeForm.customReason"
                :placeholder="$t('admin.freezeNotesPlaceholder') || '如: 第140号行政法令例行比对'"
                size="small"
              />
            </div>
          </div>
        </div>

        <div v-else-if="selectedMemberToFreeze" class="p-3 bg-[#EFF5F1] rounded-lg border border-[#C7E0CE] text-xs text-[#24483A] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon class="text-[#2F7A50]"><CircleCheckFilled /></el-icon>
            <span>{{ $t('admin.memberCurrentlyFrozen', { name: formatMemberName(selectedMemberToFreeze.name), reason: formatFreezeReason(selectedMemberToFreeze.freezeReason) }) }}</span>
          </div>
          <el-button type="success" size="small" :loading="freezeLoading" @click="handleDirectUnfreeze(selectedMemberToFreeze)">
            {{ $t('admin.unfreezeCard') || '立即解除冻结' }}
          </el-button>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <div class="text-[11px] text-[#8A9A8F]">
            {{ $t('admin.freezeAuditNotice') || '操作将记录于贸易部审计日志并实时推送至公民移动端' }}
          </div>
          <div class="flex items-center gap-2">
            <el-button size="small" @click="memberFreezeDialogVisible = false">{{ $t('common.cancel') || '关闭' }}</el-button>
            <el-button
              v-if="selectedMemberToFreeze && (selectedMemberToFreeze.status === '正常' || selectedMemberToFreeze.status === 'Active')"
              type="danger"
              size="small"
              :loading="freezeLoading"
              @click="handleConfirmFreezeMember"
            >
              {{ $t('admin.confirmFreezeBtn') || '确认执行冻结' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 3.5 家庭成员明细抽屉 (与公民端 Family Members 保持一致) -->
    <el-dialog v-model="membersDialogVisible" :title="$t('admin.familyMembersDetail') || '家庭在册成员存根档案'" width="650px" align-center destroy-on-close>
      <div v-if="selectedFamilyForMembers" class="space-y-3 text-xs">
        <div class="flex items-center justify-between bg-[#F3F8F4] p-2.5 rounded-lg border border-[#E9F1EB]">
          <div>{{ $t('admin.familyCode') || '户籍编号' }}：<span class="font-mono font-bold text-[#1F3326]">{{ selectedFamilyForMembers.familyCode }}</span></div>
          <div>{{ $t('admin.headInfo') || '法定户主' }}：<span class="font-bold text-[#326445]">{{ formatHeadName(selectedFamilyForMembers.headName) }}</span></div>
        </div>
        <el-table :data="selectedFamilyForMembers.members || []" border stripe size="small">
          <el-table-column prop="name" :label="$t('admin.name') || '姓名'" min-width="140" />
          <el-table-column prop="relation" :label="$t('admin.relation') || '关系'" width="90" align="center" />
          <el-table-column prop="gender" :label="$t('admin.gender') || '性别'" width="70" align="center" />
          <el-table-column prop="birthDate" :label="$t('admin.birthDate') || '出生日期'" width="110" align="center" />
          <el-table-column prop="nationalId" :label="$t('admin.nationalId') || '国民卡号'" min-width="160" />
        </el-table>
      </div>
      <template #footer><el-button @click="membersDialogVisible = false">{{ $t('common.close') || '关闭' }}</el-button></template>
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
        <el-form-item label="联系电话"><el-input class="bidi-ltr" v-model="agentForm.phone" size="small" /></el-form-item>
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
            <el-input class="bidi-ltr" v-model="warehouseForm.phone" placeholder="+964 780 000 0000" size="small" />
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
    <!-- ========================================== -->
    <!-- 配给卡用户档案二级抽屉 (点击总账列表记录弹出) -->
    <!-- 配额快照 / 申请历史 / 领取流水 / 冻结标记 / 异常记录 -->
    <!-- ========================================== -->
    <el-drawer
      v-model="cardDetailVisible"
      :title="$t('adminCardDetail.title') || '配给卡用户档案'"
      size="760px"
      append-to-body
      class="card-detail-drawer"
      @closed="handleCardDetailClosed"
    >
      <div v-loading="cardDetailLoading" class="space-y-4 text-xs">
        <!-- 头部摘要 -->
        <div v-if="cardDetailRow" class="bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[#2F5B44] text-white flex items-center justify-center">
              <el-icon class="text-lg"><CreditCard /></el-icon>
            </div>
            <div>
              <div class="font-bold text-[#1F3326] text-sm flex items-center gap-2">
                <span>{{ formatHeadName(cardDetailRow.headName) }}</span>
                <el-tag
                  size="small"
                  effect="plain"
                  :type="cardDetailRow.status === '正常' || cardDetailRow.status === 'Active' ? 'success' : (cardDetailRow.status === '已冻结' || cardDetailRow.status === 'Frozen' ? 'danger' : 'warning')"
                >
                  {{ formatCardStatus(cardDetailRow.status) }}
                </el-tag>
              </div>
              <div class="text-[11px] text-[#58685D] font-mono mt-0.5">{{ cardDetailRow.cardNo }} · {{ cardDetailRow.nationalId }}</div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-[11px] text-[#58685D]">
            <span>{{ $t('adminCardDetail.issueDate') }}: <strong class="font-mono text-[#1F3326]">{{ cardDetailRow.issueDate || '—' }}</strong></span>
            <span>{{ $t('adminCardDetail.lastVerified') }}: <strong class="font-mono text-[#1F3326]">{{ cardDetailRow.lastVerifiedAt || '—' }}</strong></span>
            <span>{{ $t('adminCardDetail.nfcUid') }}: <strong class="font-mono text-[#1F3326]">{{ cardDetailRow.rfidChipUid || '—' }}</strong></span>
          </div>
        </div>

        <!-- 1. 配额快照 -->
        <div class="bg-white border border-[#D9E5DB] rounded-lg p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="font-bold text-[#1F3326] flex items-center gap-1.5">
              <el-icon class="text-[#326445]"><ScaleToOriginal /></el-icon>
              {{ $t('adminCardDetail.sectionQuota') || '配额快照' }}
            </div>
            <span class="text-[11px] text-[#8A9A8F]">
              {{ $t('adminCardDetail.eligibleMembers') || '符合资格成员' }}:
              <strong class="text-[#2F5B44] font-mono">{{ cardDetailEligibleMembers }}</strong> / {{ cardDetailRow?.memberCount ?? 0 }}
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-2.5 rounded-lg bg-[#EFF5F1] border border-[#C7DED0] text-center">
              <div class="text-[10px] text-[#58685D]">{{ $t('adminCardDetail.quotaFlour') || '面粉 (KG)' }}</div>
              <div class="font-mono font-bold text-[#2F5B44] text-base">{{ cardDetailRow?.quotas?.flour ?? 0 }}</div>
            </div>
            <div class="p-2.5 rounded-lg bg-[#FDF3E0] border border-[#F2E3C6] text-center">
              <div class="text-[10px] text-[#7A5F21]">{{ $t('adminCardDetail.quotaRice') || '大米 (KG)' }}</div>
              <div class="font-mono font-bold text-[#7A5F21] text-base">{{ cardDetailRow?.quotas?.rice ?? 0 }}</div>
            </div>
            <div class="p-2.5 rounded-lg bg-[#EFF5F1] border border-[#C7DED0] text-center">
              <div class="text-[10px] text-[#58685D]">{{ $t('adminCardDetail.quotaOil') || '食用油 (L)' }}</div>
              <div class="font-mono font-bold text-[#2F5B44] text-base">{{ cardDetailRow?.quotas?.oil ?? 0 }}</div>
            </div>
            <div class="p-2.5 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB] text-center">
              <div class="text-[10px] text-[#58685D]">{{ $t('adminCardDetail.quotaSugar') || '白糖 (KG)' }}</div>
              <div class="font-mono font-bold text-[#2F5B44] text-base">{{ cardDetailRow?.quotas?.sugar ?? 0 }}</div>
            </div>
          </div>
          <div class="text-[11px] text-[#58685D]">
            {{ $t('adminCardDetail.claimedThisPeriod') || '本期已核销' }}:
            <strong class="font-mono text-[#2A5440]">{{ cardDetailClaimedSummary || '—' }}</strong>
          </div>
        </div>

        <!-- 2. 申请历史 -->
        <div class="bg-white border border-[#D9E5DB] rounded-lg p-3.5 space-y-2.5">
          <div class="font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#326445]"><Tickets /></el-icon>
            {{ $t('adminCardDetail.sectionApplications') || '申请历史' }}
          </div>
          <el-table :data="cardDetailData.applications" border size="small" :empty-text="$t('adminCardDetail.noApplications') || '暂无申请记录'">
            <el-table-column prop="source" :label="$t('adminCardDetail.appType') || '申请类型'" width="110" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="primary" effect="plain">{{ w(row.source) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="applicantName" :label="$t('adminCardDetail.applicant') || '申请人'" min-width="130" show-overflow-tooltip>
              <template #default="{ row }">{{ w(row.applicantName) }}</template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('adminCardDetail.status') || '状态'" width="110" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === '已批准' || row.status === 'Approved' ? 'success' : (row.status.includes('驳回') || row.status.includes('拒绝') ? 'danger' : 'warning')" effect="plain">
                  {{ w(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submittedAt" :label="$t('adminCardDetail.submittedAt') || '提交时间'" width="140" align="center" />
            <el-table-column prop="reason" :label="$t('adminCardDetail.summary') || '摘要'" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">{{ w(row.reason) }}</template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 3. 领取流水 -->
        <div class="bg-white border border-[#D9E5DB] rounded-lg p-3.5 space-y-2.5">
          <div class="font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#326445]"><List /></el-icon>
            {{ $t('adminCardDetail.sectionClaims') || '领取流水' }}
          </div>
          <el-table :data="cardDetailData.claims" border size="small" :empty-text="$t('adminCardDetail.noClaims') || '暂无领取流水'">
            <el-table-column prop="claimVoucherNo" :label="$t('adminCardDetail.voucherNo') || '核销凭证号'" width="170">
              <template #default="{ row }">
                <span class="font-mono font-bold text-[#2A5440]">{{ row.claimVoucherNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="claimPeriod" :label="$t('adminCardDetail.claimPeriod') || '核销周期'" width="140" align="center" />
            <el-table-column prop="claimTime" :label="$t('adminCardDetail.claimTime') || '核销时间'" width="150" align="center" />
            <el-table-column :label="$t('adminCardDetail.claimedItems') || '核销物资'" min-width="220">
              <template #default="{ row }">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(it, idx) in (row.claimedItems || [])"
                    :key="idx"
                    class="bg-[#F3F8F4] border border-[#D9E5DB] px-1.5 py-0.5 rounded text-[10px] text-[#43554B]"
                  >
                    {{ w(it.itemName) }}: <strong>{{ it.qty }}{{ it.unit }}</strong>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('adminCardDetail.syncLatency') || '云端同步'" width="110" align="center">
              <template #default="{ row }">
                <span class="font-mono text-[#2F7A50]">{{ row.cloudSyncLatencyMs ?? 0 }}ms</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 4. 冻结标记 -->
        <div class="bg-white border border-[#D9E5DB] rounded-lg p-3.5 space-y-2.5">
          <div class="font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#C04442]"><Lock /></el-icon>
            {{ $t('adminCardDetail.sectionFreeze') || '冻结标记' }}
          </div>
          <!-- 卡片级冻结 -->
          <div class="flex items-start gap-2 p-2.5 rounded-lg border" :class="cardDetailRow && (cardDetailRow.status === '已冻结' || cardDetailRow.status === 'Frozen') ? 'bg-[#FBEAEA] border-[#E5B8B8]' : 'bg-[#F3F8F4] border-[#D9E5DB]'">
            <el-tag size="small" :type="cardDetailRow && (cardDetailRow.status === '已冻结' || cardDetailRow.status === 'Frozen') ? 'danger' : 'success'" effect="plain">
              {{ $t('adminCardDetail.cardFreeze') || '卡片级冻结' }}
            </el-tag>
            <span v-if="cardDetailRow && (cardDetailRow.status === '已冻结' || cardDetailRow.status === 'Frozen')" class="text-[#A03E3C] font-medium">
              {{ cardDetailRow.freezeReason ? localizeFreezeReason(cardDetailRow.freezeReason, t) : $t('adminCardDetail.noFreeze') }}
            </span>
            <span v-else class="text-[#2F5B44]">{{ $t('adminCardDetail.noFreeze') || '无冻结标记' }}</span>
          </div>
          <!-- 成员级冻结 -->
          <div class="space-y-1.5">
            <div class="text-[11px] font-semibold text-[#58685D]">{{ $t('adminCardDetail.memberFreeze') || '成员级冻结' }}</div>
            <div v-if="cardDetailData.members.length === 0" class="text-[11px] text-[#8A9A8F]">—</div>
            <div
              v-for="m in cardDetailData.members"
              :key="m.id"
              class="flex items-center justify-between gap-2 p-2 rounded-lg border text-[11px]"
              :class="m.isFrozen || m.status === '冻结' ? 'bg-[#FBEAEA] border-[#E5B8B8]' : 'bg-[#F7FAF8] border-[#E9F1EB]'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <el-tag size="small" :type="m.isFrozen || m.status === '冻结' ? 'danger' : 'success'" effect="plain" class="scale-90 origin-left rtl:origin-right">
                  {{ m.isFrozen || m.status === '冻结' ? ($t('adminCardDetail.frozenTag') || '已冻结') : ($t('adminCardDetail.normalTag') || '正常') }}
                </el-tag>
                <span class="font-medium text-[#1F3326] truncate">{{ w(m.name) }}</span>
                <span class="text-[#8A9A8F]">{{ w(m.relation) }}</span>
              </div>
              <span v-if="(m.isFrozen || m.status === '冻结') && m.freezeReason" class="text-[#A03E3C] truncate">
                {{ localizeFreezeReason(m.freezeReason, t) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 5. 异常记录 -->
        <div class="bg-white border border-[#D9E5DB] rounded-lg p-3.5 space-y-2.5">
          <div class="font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#C04442]"><WarningFilled /></el-icon>
            {{ $t('adminCardDetail.sectionExceptions') || '异常记录' }}
          </div>
          <el-table :data="cardDetailData.exceptions" border size="small" :empty-text="$t('adminCardDetail.noExceptions') || '暂无异常记录'">
            <el-table-column prop="timestamp" :label="$t('adminCardDetail.exceptionTime') || '发生时间'" width="150" align="center" />
            <el-table-column prop="operatorName" :label="$t('adminCardDetail.operator') || '操作人'" width="150" show-overflow-tooltip>
              <template #default="{ row }">{{ w(row.operatorName) }}</template>
            </el-table-column>
            <el-table-column prop="riskLevel" :label="$t('adminCardDetail.riskLevel') || '风险等级'" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.riskLevel === 'HIGH' ? 'danger' : (row.riskLevel === 'MEDIUM' ? 'warning' : 'info')" effect="plain">
                  {{ row.riskLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="actionDesc" :label="$t('adminCardDetail.exceptionDesc') || '异常描述'" min-width="240" show-overflow-tooltip>
              <template #default="{ row }">{{ w(row.actionDesc) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
    <MemberRegistrationDialog
      v-model="memberRegistrationVisible"
      :member="selectedRegistrationMember"
      :family="currentCardFamily"
    />
  </div>
</template>

<script setup>
import { useWarehouseI18n } from '../../utils/warehouseI18n.js';
const { w, sameLabel } = useWarehouseI18n();
import { isEnNow } from '../../utils/langHint.js';
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { localizeFreezeReason, resolveFreezeReasonCode } from '../../utils/freezeReason.js';
import { useAuthStore } from '../../stores/auth.js';
import ReconciliationTab from './components/ReconciliationTab.vue';
import OfficialRegulationsTab from './components/OfficialRegulationsTab.vue';
import MemberRegistrationDialog from './components/MemberRegistrationDialog.vue';
import { onTabMessage } from '../../utils/crossTabBus.js';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const districtZhToEnMap = {
  '卡尔赫第一配给中心 (#04)': 'Karkh 1st Ration Center (#04)',
  '卡尔赫第一粮食供应分部': 'Karkh 1st Food Supply Branch',
  '卡尔赫区 (Al-Karkh)': 'Al-Karkh District',
  '鲁萨法区 (Al-Rusafa)': 'Al-Rusafa District',
  '鲁萨法区 (Al Rusafa)': 'Al-Rusafa District',
  '鲁萨法第二粮食供应分部': 'Al-Rusafa 2nd Food Supply Branch',
  '阿沙尔区 (Al-Ashar)': 'Al-Ashar District',
  '摩苏尔老城区 (Old Mosul)': 'Old Mosul District',
  '安卡瓦区 (Ainkawa)': 'Ainkawa District'
};

const provinceZhToEnMap = {
  '巴格达省': 'Baghdad Province',
  '巴士拉省': 'Basra Province',
  '尼尼微省': 'Nineveh Province',
  '迪亚拉省': 'Diyala Province',
  '基尔库克省': 'Kirkuk Province',
  '安巴尔省': 'Anbar Province',
  '埃尔比勒省': 'Erbil Province',
  '苏莱曼尼亚省': 'Sulaymaniyah Province'
};

function formatHeadName(name) {
  if (!name) return '';
  return w(name);
}

function formatDistrict(dist) {
  if (!dist) return '';
  if (isEn.value && districtZhToEnMap[dist]) return districtZhToEnMap[dist];
  return dist;
}

function formatProvince(prov) {
  if (!prov) return '';
  if (isEn.value && provinceZhToEnMap[prov]) return provinceZhToEnMap[prov];
  return prov;
}

function isFrozenCard(row) {
  return row?.status === '已冻结' || row?.status === 'Frozen';
}

function formatMemberName(name) {
  if (!name) return '';
  return w(name);
}

function formatMemberRelation(relation) {
  return w(relation);
}

function formatMemberGender(gender) {
  return w(gender);
}

function openCardMembersDrawer(row) {
  selectedCardNo.value = row.cardNo;
  memberPage.value = 1;
  memberRegistrationVisible.value = false;
  selectedRegistrationMember.value = null;
  cardViewMode.value = 'members';
}

// ----------------------------------------------------
// 0. 配给卡用户档案二级抽屉
// (点击总账列表记录弹出：配额快照 / 申请历史 / 领取流水 / 冻结标记 / 异常记录)
// ----------------------------------------------------
const cardDetailVisible = ref(false);
const cardDetailLoading = ref(false);
const cardDetailRow = ref(null);
const cardDetailData = reactive({
  members: [],
  applications: [],
  claims: [],
  exceptions: []
});

// 符合领取资格的成员数（剔除冻结成员）
const cardDetailEligibleMembers = computed(() => {
  const members = cardDetailData.members;
  if (!members || members.length === 0) return cardDetailRow.value?.memberCount ?? 0;
  return members.filter((m) => !m.isFrozen && m.status !== '冻结').length;
});

// 本期已核销物资汇总（按品名聚合数量）
const cardDetailClaimedSummary = computed(() => {
  const totals = new Map();
  cardDetailData.claims.forEach((c) => {
    (c.claimedItems || []).forEach((it) => {
      const key = String(it.itemName || '');
      if (!key) return;
      totals.set(key, (totals.get(key) || 0) + Number(it.qty || 0));
    });
  });
  if (totals.size === 0) return '';
  return [...totals.entries()].map(([name, qty]) => `${w(name)} ${qty}`).join(' · ');
});

async function openCardDetailDrawer(row) {
  if (!row) return;
  cardDetailRow.value = row;
  cardDetailData.members = [];
  cardDetailData.applications = [];
  cardDetailData.claims = [];
  cardDetailData.exceptions = [];
  cardDetailVisible.value = true;
  cardDetailLoading.value = true;
  const cardNo = String(row.cardNo || '');
  try {
    // 家庭成员（冻结标记）：优先匹配家庭档案，回退卡片自带成员
    const fam = familiesList.value.find((f) => (f.cardNo || f.rationCardNo) === cardNo);
    cardDetailData.members = fam?.members || row.members || [];

    // 申请历史：电子审核工单池按卡号过滤
    const ticketRes = await getReviewTicketList();
    const tickets = Array.isArray(ticketRes) ? ticketRes : (ticketRes?.data || []);
    cardDetailData.applications = tickets.filter((tk) => tk.cardNo === cardNo);

    // 领取流水：末端核销凭证记录按卡号过滤
    const claimRes = await getCitizenClaimRecords();
    const claims = Array.isArray(claimRes) ? claimRes : (claimRes?.data || []);
    cardDetailData.claims = claims.filter((c) => c.rationCardNo === cardNo);

    // 异常记录：安全审计日志中涉及该卡的操作留痕
    const auditRes = await getAuditLogs();
    const audits = Array.isArray(auditRes) ? auditRes : (auditRes?.data || []);
    cardDetailData.exceptions = audits.filter((a) =>
      String(a.actionDesc || '').includes(cardNo) ||
      String(a.beforeSnapshot || '').includes(cardNo) ||
      String(a.afterSnapshot || '').includes(cardNo)
    );
  } catch (e) {
    console.error('加载配给卡用户档案失败', e);
    ElMessage.error((isEnNow() ? 'Failed to load ration card profile' : '加载配给卡用户档案失败'));
  } finally {
    cardDetailLoading.value = false;
  }
}

function handleCardDetailClosed() {
  cardDetailRow.value = null;
  cardDetailData.members = [];
  cardDetailData.applications = [];
  cardDetailData.claims = [];
  cardDetailData.exceptions = [];
}

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
  if (status === '正常' || status === 'Active') return t('admin.statusNormal') || (isEn.value ? 'Normal' : '正常');
  if (status === '已冻结' || status === 'Frozen') return t('admin.statusFrozen') || (isEn.value ? 'Frozen' : '已冻结');
  if (status === '审核中' || status === 'Under Review') return t('admin.statusReviewing') || (isEn.value ? 'Under Review' : '审核中');
  return status;
}

// 冻结原因统一处理：稳定代码持久化 + 词根 i18n 展示（兼容历史中英文持久化值）
function formatFreezeReason(reason) {
  if (!reason) return '—';
  return localizeFreezeReason(reason, t) || String(reason);
}

// ----------------------------------------------------
// 家庭成员纳保与冻结状态管控状态与方法
// ----------------------------------------------------
const memberFreezeDialogVisible = ref(false);
const selectedCardForFreeze = ref(null);
const selectedMemberToFreeze = ref(null);
const freezeLoading = ref(false);
const freezeForm = reactive({
  reasonType: 'commercial',
  customReason: ''
});

function openMemberFreezeDialog(row) {
  selectedCardForFreeze.value = row;
  const targetMembers = getFreezeTargetMembers();
  const firstActive = targetMembers.find(m => m.status === '正常' || m.status === 'Active');
  selectedMemberToFreeze.value = firstActive || targetMembers[0] || null;
  freezeForm.reasonType = 'commercial';
  freezeForm.customReason = '';
  memberFreezeDialogVisible.value = true;
}

function openMemberFreezeDialogFromMember(memberRow) {
  const currentCard = cardsList.value.find(c => c.cardNo === currentCardFamily.value?.cardNo);
  selectedCardForFreeze.value = currentCard;
  selectedMemberToFreeze.value = memberRow;
  freezeForm.reasonType = resolveFreezeReasonCode(memberRow.freezeReason) || memberRow.freezeReason || 'commercial';
  freezeForm.customReason = '';
  memberFreezeDialogVisible.value = true;
}

function getFreezeTargetMembers() {
  if (!selectedCardForFreeze.value) return [];
  const cardNo = selectedCardForFreeze.value.cardNo;
  const matchedCard = cardsList.value.find(c => c.cardNo === cardNo);
  const matchedFam = familiesList.value.find(f => f.cardNo === cardNo || f.familyCode === selectedCardForFreeze.value.familyCode);
  if (matchedCard && matchedCard.members && matchedCard.members.length > 0) {
    return matchedCard.members;
  }
  if (matchedFam && matchedFam.members && matchedFam.members.length > 0) {
    return matchedFam.members;
  }
  if (selectedCardForFreeze.value.members && selectedCardForFreeze.value.members.length > 0) {
    return selectedCardForFreeze.value.members;
  }
  return [];
}

function handleSelectMemberForFreeze(row) {
  if (!row) return;
  selectedMemberToFreeze.value = row;
  if (row.freezeReason) {
    freezeForm.reasonType = resolveFreezeReasonCode(row.freezeReason) || row.freezeReason;
  }
}

async function handleConfirmFreezeMember() {
  if (!selectedMemberToFreeze.value) {
    ElMessage.warning((isEnNow() ? 'Please select a family member to freeze' : '请选择需要冻结的家庭成员'));
    return;
  }
  const member = selectedMemberToFreeze.value;
  const en = isEnNow();
  // 持久化稳定原因代码 (展示端按语言翻译)，备注保留原文
  const reasonBase = resolveFreezeReasonCode(freezeForm.reasonType) || freezeForm.reasonType;
  const targetReason = freezeForm.customReason ? `${reasonBase} (${freezeForm.customReason})` : reasonBase;

  freezeLoading.value = true;
  try {
    const payload = {
      status: en ? 'Frozen' : '已冻结',
      freezeReason: targetReason,
      freezeDate: new Date().toISOString().slice(0, 10)
    };
    await updateMemberInfo(member.id || member.nationalId, payload);

    // 同步本地对象
    member.status = payload.status;
    member.freezeReason = targetReason;
    member.freezeDate = payload.freezeDate;

    // 重新拉取以确保各视图状态完全一致
    await loadCards();
    await loadFamilies();

    ElMessage.success((isEnNow() ? `Family member [${formatMemberName(member.name)}] has been frozen successfully (Reason: ${formatFreezeReason(targetReason)})` : `家庭成员【${formatMemberName(member.name)}】已成功执行资格冻结 (原因: ${formatFreezeReason(targetReason)})`));
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Freeze operation failed, please retry' : '冻结操作失败，请重试'));
  } finally {
    freezeLoading.value = false;
  }
}

async function handleDirectUnfreeze(member) {
  freezeLoading.value = true;
  try {
    const payload = {
      status: isEnNow() ? 'Active' : '正常',
      freezeReason: '',
      freezeDate: ''
    };
    await updateMemberInfo(member.id || member.nationalId, payload);

    member.status = payload.status;
    member.freezeReason = '';
    member.freezeDate = '';

    await loadCards();
    await loadFamilies();

    ElMessage.success((isEnNow() ? `Family member [${formatMemberName(member.name)}] has been unfrozen and restored to normal coverage!` : `家庭成员【${formatMemberName(member.name)}】已解除冻结，恢复正常纳保！`));
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Unfreeze operation failed, please retry' : '解除冻结失败，请重试'));
  } finally {
    freezeLoading.value = false;
  }
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
import { updateMemberInfo } from '../../api/citizen.js';
import { getReviewTicketList } from '../../api/review.js';
import { getCitizenClaimRecords, getAuditLogs } from '../../api/warehouse.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  Check,
  Tools,
  Operation,
  Lock,
  Unlock,
  RefreshRight,
  User,
  CreditCard,
  UserFilled,
  InfoFilled,
  CircleCheckFilled,
  Edit,
  Delete,
  Scissor,
  Stamp,
  ChatDotRound,
  ScaleToOriginal,
  Connection,
  WarningFilled,
  CircleClose,
  Tickets,
  List
} from '@element-plus/icons-vue';
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

// ----------------------------------------------------
// 1.1 在册家庭成员清单（与公民端移动视口 Family Members 1:1 镜像联动）
// ----------------------------------------------------
const cardViewMode = ref('cards'); // 'cards' | 'members'
const selectedCardNo = ref('');
const memberRegistrationVisible = ref(false);
const selectedRegistrationMember = ref(null);
const memberPage = ref(1);
const memberPageSize = ref(10);

const currentCardFamily = computed(() => {
  const currentCard = cardsList.value.find(c => c.cardNo === selectedCardNo.value) || cardsList.value[0];
  if (!currentCard) return null;
  const matchedFam = familiesList.value.find(f => (f.cardNo || f.rationCardNo) === currentCard.cardNo);
  return { ...matchedFam, ...currentCard, familyCode: matchedFam?.familyCode || currentCard.familyCode };
});

const currentFamilyMembers = computed(() => {
  const cardNo = currentCardFamily.value?.cardNo;
  const targetCard = cardsList.value.find(c => c.cardNo === cardNo);
  const targetFam = familiesList.value.find(f => (f.cardNo || f.rationCardNo) === cardNo);
  if (targetCard && targetCard.members && targetCard.members.length > 0) {
    return targetCard.members;
  }
  if (targetFam && targetFam.members && targetFam.members.length > 0) {
    return targetFam.members;
  }
  return [];
});

function viewMemberRegistration(member) {
  selectedRegistrationMember.value = { ...member, name: formatMemberName(member.name), relation: formatMemberRelation(member.relation), gender: formatMemberGender(member.gender) };
  memberRegistrationVisible.value = true;
}

const paginatedMembers = computed(() => {
  const start = (memberPage.value - 1) * memberPageSize.value;
  return currentFamilyMembers.value.slice(start, start + memberPageSize.value);
});

async function loadCards() {
  cardsLoading.value = true;
  try {
    const res = await getCitizenCards();
    cardsList.value = res || [];
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Failed to load ration card list' : '加载配给卡列表失败'));
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
    ElMessage.error((isEnNow() ? 'Failed to load family file list' : '加载家庭档案列表失败'));
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
    ElMessage.error((isEnNow() ? 'Failed to load agent station list' : '加载代理网点列表失败'));
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
    ElMessage.error((isEnNow() ? 'Failed to load reserve warehouse list' : '加载储备仓库列表失败'));
  } finally {
    warehousesLoading.value = false;
  }
}

// ----------------------------------------------------
// 头部角色动态标识计算属性
// ----------------------------------------------------
const roleBadgeClasses = computed(() => {
  if (authStore.isMinisterCenter) return 'bg-[#5C8A6B]/20 text-[#AECBB8] border-[#7FA48C]/30';
  if (authStore.isDeputyMinister) return 'bg-[#C04442]/20 text-[#E8B7B5] border-[#D0827F]/30';
  if (authStore.isDirectorPlanning) return 'bg-[#D3AF62]/20 text-[#E5CEA1] border-[#DFC08B]/30';
  return 'bg-[#D3AF62]/20 text-[#E5CEA1] border-[#DFC08B]/30';
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
    ElMessage.success((isEnNow() ? `[Ministerial Order Effective]: Station [${activeSplitAgent.value.name}] has been successfully split and reorganized!` : `【部长令已生效】：网点【${activeSplitAgent.value.name}】已成功分立重组！`));
    splitDialogVisible.value = false;
    await loadAgents();
  } catch (e) {
    ElMessage.error(e.message || (isEnNow() ? 'Split failed' : '拆分失败'));
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
    ElMessage.success((isEnNow() ? '[Ministerial Order Effective]: The district agency standardization rectification plan has been signed and executed!' : '【部长令已生效】：辖区代理权标准化整顿方案已签发执行！'));
    unifyDialogVisible.value = false;
  } catch (e) {
    ElMessage.error(e.message || (isEnNow() ? 'Standardization failed' : '统一规程失败'));
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
    ElMessage.warning((isEnNow() ? 'Please fill in the new station name and manager' : '请填写新设网点名称与负责人'));
    return;
  }
  establishSubmitting.value = true;
  try {
    await establishAgency(establishForm);
    ElMessage.success((isEnNow() ? `[Ministerial Order Effective]: The new agent station [${establishForm.name}] has been approved successfully!` : `【部长令已生效】：已成功批准新设代理网点【${establishForm.name}】！`));
    establishDialogVisible.value = false;
    await loadAgents();
  } catch (e) {
    ElMessage.error(e.message || (isEnNow() ? 'Establishment failed' : '设立失败'));
  } finally {
    establishSubmitting.value = false;
  }
}

// 授予代理权
function openGrantAgencyModal(row) {
  ElMessageBox.prompt((isEnNow() ? `Granting the official ration distribution license to station [${row.name}]. Please enter the license number to issue:` : `正在为网点【${row.name}】授予官方口粮代销许可。请输入核发许可证号：`), (isEnNow() ? 'Minister of Ration Center - Agency Grant Approval' : '【配给中心部长】核准授予代理权'), {
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
      ElMessage.success((isEnNow() ? `[Ministerial Order]: Agency has been officially granted to [${row.name}] with license issued!` : `【部长令】：已成功向【${row.name}】正式授予代理权并颁发许可！`));
      await loadAgents();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Grant failed' : '授予失败'));
    }
  });
}

// 已故轮替终审批复
function openDeceasedRotationModal(row) {
  ElMessageBox.confirm((isEnNow() ? `Confirm signing the final approval for deceased-agent kinship rotation for station [${row?.name || 'the designated station'}]? Rotation follows the three-generation direct kinship order per religious law.` : `确认针对网点【${row?.name || '指定网点'}】签署代理人已故继承轮替终审批复？依据教法三代直系亲属顺位轮替。`), (isEnNow() ? 'Deputy Minister - Final Signing of Deceased Rotation' : '【行政次长】终审签署已故继承轮替'), {
    type: 'warning',
    confirmButtonText: '签发终审批复',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await approveDeceasedRotation(`TICK-ROT-${Date.now().toString().slice(-4)}`, {
        successorRelation: '法定第一顺位直系继承人'
      });
      ElMessage.success((isEnNow() ? '[Deputy Ministerial Order]: The deceased agent rotation application has completed final adjudication with approval issued!' : '【行政次长令】：已故代理轮替申请已完成终审裁决并核发批复！'));
      await loadAgents();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Approval failed' : '审批失败'));
    }
  });
}

// 恢复代理权
function handleRestoreWithCheck(row) {
  if (!row.planningConfirmed) {
    ElMessageBox.alert((isEnNow() ? '[Statutory Mandatory Pre-Interception]: Per Ministry of Trade Order No. 402, before restoring a deregistered agency, the Planning & Follow-up Directorate must first issue the [Joint Investigation Confirmation Letter]. This station has not completed the directorate confirmation; the Deputy Minister is legally prohibited from approval!' : '【法定强制前置拦截】：依据贸易部第402号令，已注销代理权恢复前，必须由规划与跟进司先行出具【联合调查确认书】。当前网点尚未完成规划司确认，行政次长依法禁止核准！'), (isEnNow() ? 'Compliance Precondition Not Met' : '合规前置未达标'), {
      type: 'error',
      confirmButtonText: '知晓'
    });
    return;
  }
  ElMessageBox.confirm((isEnNow() ? `The Planning & Follow-up Directorate has completed on-site verification. Confirm restoring the agency qualification of [${row.name}]?` : `规划与跟进司已完成实地核查，确认恢复【${row.name}】的代理权资格？`), (isEnNow() ? 'Deputy Minister - Restore Deregistered Agency' : '【行政次长】恢复已注销代理权'), {
    type: 'warning',
    confirmButtonText: '签署恢复令',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await restoreRevokedAgency(row.id, { reason: '规划司联合入户调查符合复权指标，特批恢复' });
      ElMessage.success((isEnNow() ? `[Deputy Ministerial Order]: The agency operation right of station [${row.name}] has been officially approved for restoration!` : `【行政次长令】：网点【${row.name}】代理经营权已正式核准恢复！`));
      await loadAgents();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Restoration failed' : '恢复失败'));
    }
  });
}

// 规划司确认
function handleConfirmPlanning(row) {
  ElMessageBox.confirm((isEnNow() ? `Confirm completing the joint on-site household survey of station [${row.name}] and issuing the legal compliance confirmation letter?` : `确认完成对网点【${row.name}】的联合实地入户调查，并出具法务合规确认书？`), (isEnNow() ? 'Planning & Follow-up Directorate - Household Survey Confirmation' : '【规划与跟进司】入户调查确认'), {
    confirmButtonText: '出具确认书',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await confirmPlanningReview(row.id, { inspectionPassed: true });
      ElMessage.success((isEnNow() ? '[Planning & Follow-up Directorate]: The joint on-site household survey confirmation letter has been signed and filed!' : '【规划与跟进司】：联合实地入户调查确认书已签发入卷！'));
      await loadAgents();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Confirmation failed' : '确认失败'));
    }
  });
}

// 合并代理权
function handleMergePrompt(row) {
  ElMessageBox.prompt((isEnNow() ? `Station [${row.name}] serves ${row.servedHouseholds} households (≤750). Please enter the code of the nearby small station to be merged in (e.g. FA-00389):` : `网点【${row.name}】服务户数为 ${row.servedHouseholds} 户（≤750户），请输入待吸收合并的邻近小型网点编号（如 FA-00389）：`), (isEnNow() ? 'Planning & Follow-up Directorate - Merge & Optimize Small Stations' : '【规划与跟进司】合并优化小型代理点'), {
    confirmButtonText: '合并重组',
    cancelButtonText: '取消',
    inputValue: 'FA-00389'
  }).then(async ({ value }) => {
    try {
      await mergeAgencies({
        primaryAgentId: row.id,
        secondaryAgentId: value
      });
      ElMessage.success((isEnNow() ? '[Director-General Resolution]: Small station merger and reorganization succeeded!' : '【总干事决议】：小型网点合并重组成功！'));
      await loadAgents();
    } catch (e) {
      ElMessage.error(e.message || (isEnNow() ? 'Merge failed' : '合并失败'));
    }
  });
}

// 行政处罚
function handlePenalizePrompt(row) {
  ElMessageBox.prompt((isEnNow() ? `Issuing an administrative punishment order for the violating station [${row.name}]. Please enter the adjudication grounds:` : `对违规违纪网点【${row.name}】下达行政处罚令。请输入处罚裁决事由：`), (isEnNow() ? 'Planning & Follow-up Directorate - Administrative Punishment Adjudication' : '【规划与跟进司】下达行政处罚裁决'), {
    confirmButtonText: '下达处罚令',
    cancelButtonText: '取消',
    inputValue: '责令停业整顿15天，扣减年度信用分10分'
  }).then(async ({ value }) => {
    try {
      await penalizeAgency(row.id, {
        penaltyType: '停业整顿',
        reason: value
      });
      ElMessage.success((isEnNow() ? `[Planning & Follow-up Directorate]: The punishment adjudication for station [${row.name}] has taken effect!` : `【规划与跟进司】：对网点【${row.name}】的处罚裁决已生效！`));
      await loadAgents();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Punishment failed' : '处罚失败'));
    }
  });
}

// 代理注销
function handleCancelAgencyPrompt(row) {
  ElMessageBox.confirm((isEnNow() ? `Confirm clearing and officially deregistering the distribution operation right of station [${row.name}]? After deregistration the station will be released as a vacant publicly-listed status.` : `确认清退并正式注销网点【${row.name}】的代销经营权？注销后网点将释放为空置公示状态。`), (isEnNow() ? 'Planning & Follow-up Directorate - Agency Deregistration' : '【规划与跟进司】代理权清退注销'), {
    type: 'warning',
    confirmButtonText: '执行注销',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await cancelAgency(row.id, { reason: '主动清退注销' });
      ElMessage.success((isEnNow() ? `Station [${row.name}] has been successfully cleared and deregistered!` : `网点【${row.name}】已成功清退注销！`));
      await loadAgents();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Deregistration failed' : '注销失败'));
    }
  });
}

// 轮替转移审批入口
function openRotateTransferModal() {
  ElMessageBox.confirm((isEnNow() ? 'Retrieve all voluntary rotation and regional relocation transfer application tickets under the current Planning Directorate?' : '是否调阅当前规划司名下所有代理人自愿轮替与区域迁居转移申请工单？'), (isEnNow() ? 'Planning & Follow-up Directorate - Rotation & Transfer Approval' : '【规划与跟进司】代理轮替与转移审批'), {
    confirmButtonText: '进入批量核批',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await rotateTransferAgency('TICK-TRF-001', { approved: true });
      ElMessage.success((isEnNow() ? 'The Planning & Follow-up Directorate has completed voluntary rotation transfer and legal liquidation approval!' : '规划与跟进司已完成自愿轮替转移与法务清算核准！'));
      await loadAgents();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Approval failed' : '审批失败'));
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
    ElMessage.success((isEnNow() ? 'Monthly ration quota adjustment has taken effect' : '月度口粮定额调整已生效'));
    quotaDialogVisible.value = false;
    await loadCards();
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Adjustment failed' : '调整失败'));
  } finally {
    quotaSaving.value = false;
  }
}

// 冻结/解冻配给卡
async function handleToggleCardStatus(row) {
  const newStatus = row.status === '已冻结' ? '正常' : '已冻结';
  try {
    await updateCitizenCardStatus(row.id, { status: newStatus });
    ElMessage.success((isEnNow() ? `Ration card status has been switched to [${newStatus}]` : `配给卡状态已切换为【${newStatus}】`));
    await loadCards();
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Update failed' : '更新失败'));
  }
}

// 补换发卡
async function handleReissueCard(row) {
  ElMessageBox.confirm((isEnNow() ? `Confirm reissuing a new card for head of household [${row.headName}]? The system will rewrite the secure chip.` : `确认对户主【${row.headName}】换发新卡？系统将重新写入安全芯片。`), (isEnNow() ? 'Ration Card Reissue' : '补换发配给卡'), {
    confirmButtonText: '确认换发',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await reissueCitizenCard(row.id);
      ElMessage.success((isEnNow() ? 'The new electronic ration card chip has been re-bound and issued!' : '新电子配给卡芯片已重新绑定下发！'));
      await loadCards();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Reissue failed' : '换发失败'));
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
    ElMessage.warning((isEnNow() ? 'Please fill in the head name and national card number' : '请填写户主姓名与国民卡号'));
    return;
  }
  familySaving.value = true;
  try {
    if (isEditFamily.value) {
      await updateFamily(familyForm.id, familyForm);
      ElMessage.success((isEnNow() ? 'Family file updated' : '家庭档案已更新'));
    } else {
      await createFamily(familyForm);
      ElMessage.success((isEnNow() ? 'Family file created successfully' : '家庭档案建档成功'));
    }
    familyDialogVisible.value = false;
    await loadFamilies();
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Save failed' : '保存失败'));
  } finally {
    familySaving.value = false;
  }
}

async function handleDeleteFamily(row) {
  ElMessageBox.confirm((isEnNow() ? `Confirm deregistering the household file of head [${row.headName}]?` : `确认注销户主【${row.headName}】的家庭户籍档案？`), (isEnNow() ? 'Deregister Family File' : '注销家庭档案'), {
    type: 'warning',
    confirmButtonText: '确认注销',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteFamily(row.id);
      ElMessage.success((isEnNow() ? 'Household file has been deregistered' : '家庭户籍档案已注销'));
      await loadFamilies();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Deregistration failed' : '注销失败'));
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
    ElMessage.success((isEnNow() ? 'Station profile updated' : '网点资料已更新'));
    agentDialogVisible.value = false;
    await loadAgents();
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Update failed' : '更新失败'));
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
    ElMessage.warning((isEnNow() ? 'Please fill in the warehouse code and official name' : '请填写仓库编号与仓库官方名称'));
    return;
  }
  warehouseSaving.value = true;
  try {
    if (isEditWarehouse.value) {
      await updateAdminWarehouse(warehouseForm.id, warehouseForm);
      ElMessage.success((isEnNow() ? `Warehouse [${warehouseForm.name}] information updated!` : `仓库【${warehouseForm.name}】信息已更新！`));
    } else {
      await createAdminWarehouse(warehouseForm);
      ElMessage.success((isEnNow() ? `Strategic reserve warehouse [${warehouseForm.name}] has been successfully registered!` : `战略储备仓库【${warehouseForm.name}】已成功建档录入！`));
    }
    warehouseDialogVisible.value = false;
    await loadWarehouses();
  } catch (e) {
    ElMessage.error((isEnNow() ? 'Failed to save warehouse' : '保存仓库失败'));
  } finally {
    warehouseSaving.value = false;
  }
}

async function handleDeleteWarehouse(row) {
  ElMessageBox.confirm((isEnNow() ? `Confirm clearing and deregistering reserve warehouse [${row.name} (${row.code})]? This will remove the physical storage file.` : `确认清退注销储备仓库【${row.name} (${row.code})】？此操作将移除该物理库容档案。`), (isEnNow() ? 'Deregister Reserve Warehouse' : '注销储备仓库'), {
    type: 'warning',
    confirmButtonText: '确认注销',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteAdminWarehouse(row.id);
      ElMessage.success((isEnNow() ? `Warehouse [${row.name}] has been successfully deregistered and deleted!` : `仓库【${row.name}】已成功注销删除！`));
      await loadWarehouses();
    } catch (e) {
      ElMessage.error((isEnNow() ? 'Delete failed' : '删除失败'));
    }
  });
}

let offFamilyUpdated = null;

function handleFamilyUpdateEvent() {
  loadCards();
  if (typeof loadFamilies === 'function') {
    loadFamilies();
  }
}

watch(locale, () => {
  loadCards();
  loadFamilies();
  loadAgents();
  loadWarehouses();
});

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
  loadCards();
  loadFamilies();
  offFamilyUpdated = onTabMessage('FAMILY_UPDATED', handleFamilyUpdateEvent);
  window.addEventListener('rcm-family-updated', handleFamilyUpdateEvent);
  window.addEventListener('rcm-language-changed', handleFamilyUpdateEvent);
});

onUnmounted(() => {
  if (offFamilyUpdated) {
    offFamilyUpdated();
  }
  window.removeEventListener('rcm-family-updated', handleFamilyUpdateEvent);
  window.removeEventListener('rcm-language-changed', handleFamilyUpdateEvent);
});
</script>

<style scoped>
.card-ledger-table :deep(.el-table__row) {
  cursor: pointer;
}
/* ========================================================
 * ht.iq 官方绿色系 UI 风格定制
 * ======================================================== */
:deep(.custom-admin-tabs .el-tabs__item) {
  font-weight: 600;
  color: #58685D;
  transition: all 0.2s ease;
}

:deep(.custom-admin-tabs .el-tabs__item:hover) {
  color: #3E8A5E;
}

:deep(.custom-admin-tabs .el-tabs__item.is-active) {
  color: #326445 !important;
  font-weight: 800;
}

:deep(.custom-admin-tabs .el-tabs__active-bar) {
  background-color: #326445 !important;
  height: 3px;
  border-radius: 9999px;
}

:deep(.custom-admin-tabs .el-tabs__nav-wrap::after) {
  background-color: #E9F1EB;
  height: 1px;
}

/* 单选切换胶囊 (Radio Group) */
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #326445 !important;
  border-color: #326445 !important;
  box-shadow: -1px 0 0 0 #326445 !important;
  color: #ffffff !important;
  font-weight: 700;
}

:deep(.el-radio-button__inner:hover) {
  color: #326445;
}

/* 表格头部与边框 */
:deep(.el-table th.el-table__cell) {
  background-color: #F3F9F5 !important;
  color: #1F3326 !important;
  font-weight: 700;
  border-bottom: 1px solid #D9E5DB !important;
}

/* 分页激活态 */
:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #326445 !important;
  color: #ffffff !important;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  color: #326445;
}
</style>
