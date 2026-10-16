<template>
  <div class="ration-plan-tab" :class="isAppMode ? '!space-y-2.5' : 'space-y-5'">
    <!-- 顶部快捷操作栏 -->
    <div
      class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#D9E5DB] gap-2.5"
      :class="isAppMode ? 'flex items-center justify-between gap-2 !p-3' : 'flex flex-col sm:flex-row sm:items-center justify-between'"
    >
      <div :class="isAppMode ? 'min-w-0 flex items-center gap-2' : 'flex items-center gap-2'">
        <span class="text-xs font-bold text-[#1F3326]" :class="isAppMode ? 'truncate' : ''">
          {{
            isCitizen
              ? ($t('warehouse.citizenTitle') || '配给管理与履约交付跟进')
              : isAdmin
              ? ($t('warehouse.adminTitle') || '国家物资配给计划制定与调度中心')
              : ($t('warehouse.agentScheduleCenterTitle') || '月度配给计划与三级代理配额排程中心')
          }}
        </span>
        <el-tag v-if="!isAppMode" size="small" type="primary" effect="plain" class="shrink-0">
          {{ isCitizen ? ($t('warehouse.personalMonthlyShare') || '个人月度份额') : ($t('warehouse.threeTierAutoCalculation') || '三级代理自动核算') }}
        </el-tag>
      </div>
      <div class="flex items-center gap-2 flex-wrap" :class="isAppMode ? 'shrink-0 !flex-nowrap' : ''">
        <!-- 上级代理根据贸易部计划生成自己和下级代理的月度配给计划 (省级/区域/街道三层，按户数自动分配，不能手动分配) -->
        <el-button v-if="!isCitizen" type="success" size="small" @click="openDecomposeDialog">
          <el-icon class="mr-1"><Share /></el-icon>
          <span>{{ $t('warehouse.generateMonthlySchedule') || '依据贸易部计划生成月度排程' }}</span>
        </el-button>
        <el-button v-if="isAdmin" type="primary" size="small" @click="openCreatePlanDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          <span>{{ $t('warehouse.makePlan') || '制定计划' }}</span>
        </el-button>
        <el-button size="small" @click="loadData" :title="$t('common.refresh') || '刷新'">
          <el-icon :class="isAppMode ? '' : 'mr-1'"><Refresh /></el-icon>
          <span v-if="!isAppMode">{{ $t('common.refresh') || '刷新' }}</span>
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 1. 公民专属视角：显示和自己家庭相关的签约代理网点及每月配给额度 -->
    <!-- ======================================================== -->
    <div v-if="isCitizen" class="space-y-4" :class="isAppMode ? '!space-y-2.5' : ''">
      <div
        class="bg-gradient-to-r from-[#EFF5F1]/70 via-[#EFF5F1]/40 to-[#F3F8F4] rounded-lg border border-[#C7DED0]/80 shadow-xs"
        :class="isAppMode ? 'p-3.5 space-y-2.5' : 'p-5 space-y-4'"
      >
        <div
          class="flex justify-between gap-3 border-b border-[#E1F4E4]/80 pb-3.5"
          :class="isAppMode ? 'flex-col items-stretch gap-2.5 pb-3' : 'flex-col sm:flex-row sm:items-center'"
        >
          <div class="flex items-center gap-3" :class="isAppMode ? 'gap-2.5' : ''">
            <div
              class="rounded-lg bg-[#326445] text-white flex items-center justify-center font-bold shadow-xs shrink-0"
              :class="isAppMode ? 'w-9 h-9 text-base' : 'w-10 h-10 text-lg'"
            >
              <el-icon><Shop /></el-icon>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap" :class="isAppMode ? 'gap-1.5' : ''">
                <h3 class="text-sm font-bold text-[#1B3123]" :class="isAppMode ? 'text-[13px] leading-snug' : ''">
                  {{ citizenFamilyInfo?.agentName || (isEn ? 'Baghdad Karkh No.1 Station (Mohammed Jabbar)' : '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)') }}
                </h3>
                <el-tag size="small" type="success" effect="dark" class="font-bold">{{ $t('warehouse.contractedAgent') || '签约保供代销站' }}</el-tag>
              </div>
              <div
                class="text-[11px] text-[#58685D] mt-0.5 font-mono"
                :class="isAppMode ? 'flex flex-col items-start gap-y-0.5 pt-1' : 'flex items-center gap-2 flex-wrap'"
              >
                <span class="truncate max-w-full">{{ $t('warehouse.agentIdLabel') || '代理站编号' }}: {{ citizenFamilyInfo?.agentId || 'FA-00128' }}</span>
                <span v-if="!isAppMode">·</span>
                <span class="truncate max-w-full">{{ $t('warehouse.centerLabel') || '配给中心' }}: {{ citizenFamilyInfo?.district || (isEn ? 'Karkh No.1 Center (#04)' : '卡尔赫第一配给中心 (#04)') }}</span>
                <span v-if="!isAppMode">·</span>
                <span class="truncate max-w-full">{{ $t('warehouse.provinceLabel') || '省份' }}: {{ citizenFamilyInfo?.province || (isEn ? 'Baghdad Governorate' : '巴格达省 (Baghdad)') }}</span>
              </div>
            </div>
          </div>

          <!-- 配给月份周期：APP 视口内独占一行并靠左排列，日期控件远离右边界，弹层不再越界 -->
          <div
            class="flex items-center gap-2 min-w-0 justify-start"
            :class="isAppMode ? 'w-full' : 'justify-end'"
          >
            <span class="text-xs text-[#58685D] whitespace-nowrap">{{ $t('warehouse.periodLabel') || '配给月份' }}:</span>
            <el-date-picker
              v-model="citizenSelectedMonth"
              type="month"
              value-format="YYYY-MM"
              :placeholder="$t('warehouse.selectMonth') || (isEn ? 'Select Month' : '选择月份')"
              size="small"
              class="!w-36 max-w-[calc(100%-90px)]"
              popper-class="rcm-date-popper"
              :popper-options="datePopperOptions"
              :teleported="false"
            />
          </div>
        </div>

        <div
          class="grid gap-2 text-xs"
          :class="isAppMode ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'"
        >
          <div class="bg-white p-2.5 sm:p-3 rounded-lg border border-[#E1F4E4] shadow-2xs space-y-0.5">
            <span class="text-[#8A9A8F] text-[10px] sm:text-[11px] block">{{ $t('citizen.rationCardNo') || '家庭配给卡号' }}</span>
            <div class="font-mono font-bold text-[#326445] text-xs sm:text-sm truncate">{{ citizenFamilyInfo?.rationCardNo || 'RC-10029381' }}</div>
          </div>
          <div class="bg-white p-2.5 sm:p-3 rounded-lg border border-[#E1F4E4] shadow-2xs space-y-0.5">
            <span class="text-[#8A9A8F] text-[10px] sm:text-[11px] block">{{ $t('warehouse.registeredMembers') || '登记人口' }}</span>
            <div class="font-bold text-[#1F3326] text-xs sm:text-sm truncate">
              {{ citizenFamilyInfo?.headName || (isEn ? 'Ahmed Hassan' : '艾哈迈德·哈桑') }}
              <span class="text-[10px] text-[#58685D] font-mono">({{ memberCount }} {{ isEn ? 'P' : '人' }})</span>
            </div>
          </div>
          <div class="bg-white p-2.5 sm:p-3 rounded-lg border border-[#E1F4E4] shadow-2xs space-y-0.5">
            <span class="text-[#8A9A8F] text-[10px] sm:text-[11px] block">{{ $t('warehouse.guidelineTotalValue') || '本月指导配额限价总值' }}</span>
            <div class="font-mono font-bold text-[#C9A13B] text-xs sm:text-sm">{{ (memberCount * 13450).toLocaleString() }} IQD</div>
          </div>
          <div class="bg-white p-2.5 sm:p-3 rounded-lg border border-[#E1F4E4] shadow-2xs space-y-0.5">
            <span class="text-[#8A9A8F] text-[10px] sm:text-[11px] block">{{ $t('warehouse.stockStatus') || '代销站备货状态' }}</span>
            <div class="font-bold text-[#2F7A50] flex items-center gap-1 text-[11px] sm:text-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-[#3E9B68] animate-pulse shrink-0"></span>
              <span class="truncate">{{ $t('warehouse.stockReady') || '现货在店 · 随时可提' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3" :class="isAppMode ? '!space-y-2' : ''">
        <div class="flex items-center justify-between flex-wrap gap-2" :class="isAppMode ? 'flex-col items-start gap-1' : ''">
          <h4
            class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5"
            :class="isAppMode ? 'text-[11px] tracking-normal' : 'uppercase tracking-wider'"
          >
            <el-icon class="text-[#326445]"><Goods /></el-icon>
            <span class="min-w-0" :class="isAppMode ? 'truncate' : ''">{{ citizenSelectedMonth }} {{ $t('warehouse.rationDetailsTitle') || '月度家庭口粮配给份额明细' }}</span>
          </h4>
          <span v-if="!isAppMode" class="text-[11px] text-[#8A9A8F] font-mono">
            {{ $t('warehouse.priceStabilizedMechanism') || '国家官方指导平价限价保供机制' }}
          </span>
        </div>

        <div
          class="grid gap-3.5"
          :class="isAppMode ? 'grid-cols-1 !gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'"
        >
          <div
            v-for="item in citizenQuotaItems"
            :key="item.itemCode"
            class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs hover:shadow-md transition"
            :class="isAppMode ? 'p-3 space-y-2' : 'p-4.5 space-y-3'"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <span class="text-sm font-bold text-[#1B3123] block" :class="isAppMode ? 'text-[13px]' : ''">{{ item.itemName }}</span>
                <span class="text-[11px] text-[#8A9A8F]">
                  {{ $t('warehouse.standardPerPersonLabel', { quota: item.standardPerPerson, unit: item.unit }) || `标准: ${item.standardPerPerson} ${item.unit}/人/月` }}
                </span>
              </div>
              <el-tag size="small" type="success" effect="plain" class="font-bold shrink-0">
                {{ $t('warehouse.fullyAllocated') || item.status }}
              </el-tag>
            </div>

            <div class="bg-[#F3F8F4] rounded-lg border border-[#E9F1EB] space-y-1" :class="isAppMode ? 'p-2.5' : 'p-3'">
              <span class="text-[11px] text-[#58685D]">{{ $t('warehouse.householdQuotaLabel') || '本户月度核定配额：' }}</span>
              <div class="flex items-baseline gap-1.5">
                <span class="font-bold font-mono text-[#326445]" :class="isAppMode ? 'text-xl' : 'text-2xl'">{{ item.totalHouseholdQuota }}</span>
                <span class="text-xs text-[#58685D] font-bold">{{ item.unit }}</span>
              </div>
              <div class="text-[10px] text-[#8A9A8F] flex justify-between pt-1 border-t border-[#D9E5DB]/50">
                <span>{{ $t('warehouse.guidePriceLabel') || '官方指导限价:' }}</span>
                <span class="font-mono text-[#58685D]">{{ item.guidePriceIQD }} IQD/{{ item.unit }}</span>
              </div>
            </div>

            <div class="text-[11px] text-[#58685D] space-y-1">
              <div class="flex justify-between">
                <span>{{ $t('warehouse.contractedAgentLabel') || '签约代销网点：' }}</span>
                <span class="font-medium text-[#43554B] truncate max-w-[150px]">{{ citizenFamilyInfo?.agentName?.split(' ')[0] || (isEn ? 'Karkh 1st Station' : '卡尔赫第一代销站') }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('warehouse.arrivalDelivery') || '到货与交付：' }}</span>
                <span class="font-bold text-[#2F7A50]">{{ $t('warehouse.inStockPendingVerify') || '已入库待核销' }} ({{ item.totalHouseholdQuota }} {{ item.unit }})</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('warehouse.guideCalculatedAmount') || '指导折算金额：' }}</span>
                <span class="font-mono font-bold text-[#7A5F21]">{{ (Number(item.totalHouseholdQuota) * item.guidePriceIQD).toLocaleString() }} IQD</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-[#FDF3E0]/70 rounded-lg border border-[#F2E3C6] text-xs text-[#5A4718] transition-all"
          :class="isAppMode ? 'p-3 flex flex-col gap-2.5 shadow-xs' : 'p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3'"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-[#3F3017] text-xs">
              <el-icon class="text-[#C9A13B] shrink-0"><InfoFilled /></el-icon>
              <span>{{ $t('warehouse.claimPickGuide') || '核销提货与申领指引：' }}</span>
            </div>
            <p class="text-[11px] text-[#5A4718]/85 leading-relaxed text-left">
              {{ $t('warehouse.claimPickDesc') || '请户主或代领人在本模块选购所需配额并完成自付规费结算，生成二维码后至签约代销站扫码核销即可全额领取。' }}
            </p>
          </div>

          <div
            :class="isAppMode ? 'grid grid-cols-2 gap-2 pt-2 border-t border-[#F2E3C6]/60' : 'flex items-center gap-2 shrink-0'"
          >
            <el-button
              type="primary"
              size="small"
              class="font-bold !m-0 !h-8 rounded-lg flex items-center justify-center shadow-xs"
              :class="isAppMode ? '!w-full' : ''"
              style="background: #326445; border-color: #326445; color: #FFFFFF;"
              :title="$t('warehouse.buyThisMonthRation')"
              @click="emit('go-purchase')"
            >
              <el-icon class="mr-1 text-sm"><ShoppingCart /></el-icon>
              <span class="text-xs truncate">{{ isAppMode ? ($t('warehouse.buyThisMonthRationShort') || '选购配额') : ($t('warehouse.buyThisMonthRation') || '立即选购本月配给品') }}</span>
            </el-button>

            <el-button
              type="warning"
              plain
              size="small"
              class="font-bold shadow-xs !m-0 !h-8 rounded-lg flex items-center justify-center bg-white"
              :class="isAppMode ? '!w-full' : ''"
              style="color: #9A7A2F; border-color: #DFBE7C;"
              :title="$t('warehouse.showMyCard')"
              @click="openRationCardModal"
            >
              <el-icon class="mr-1 text-sm"><Tickets /></el-icon>
              <span class="text-xs truncate">{{ isAppMode ? ($t('warehouse.showMyCardShort') || '出示卡片') : ($t('warehouse.showMyCard') || '出示我的配给卡') }}</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 管理角色与代理商视角：贸易部月度总计划与各级排程任务单 -->
    <!-- ======================================================== -->
    <div v-else class="space-y-6">
      <!-- 贸易部月度配给总计划卡片 -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
            <el-icon class="text-[#326445]"><Calendar /></el-icon>
            <span>{{ $t('warehouse.ministryPlanTitle') || '贸易部战略口粮月度物资配给总计划 (SCM / BPM)' }}</span>
          </h3>
          <span class="text-[11px] text-[#8A9A8F]">
            {{ $t('warehouse.ministryPlanSubtitle') || '按月下发 · 依据签约户数自动排程 · 实行国家保供指导限价' }}
          </span>
        </div>

        <div
          class="grid gap-3.5"
          :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'"
        >
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="p-4 rounded-lg border transition-all space-y-3"
            :class="plan.status === '执行中' ? 'bg-gradient-to-br from-[#EFF5F1]/50 via-white to-[#F3F8F4] border-[#C7DED0] shadow-xs' : 'bg-white border-[#D9E5DB]'"
          >
            <div class="flex items-start justify-between gap-2 border-b border-[#E9F1EB] pb-2.5">
              <div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-bold text-[#1B3123] text-sm">{{ formatPlanTitle(plan.title) }}</span>
                  <el-tag size="small" :type="plan.status === '执行中' ? 'success' : plan.status === '已完成' ? 'info' : 'warning'" effect="dark">
                    {{ formatPlanStatus(plan.status) }}
                  </el-tag>
                </div>
                <div class="text-[11px] text-[#58685D] font-mono mt-0.5 flex items-center gap-2">
                  <span>{{ $t('warehouse.planNoPrefix') || '编号: ' }}{{ plan.planNo }}</span>
                  <span>·</span>
                  <span>{{ $t('warehouse.cyclePrefix') || '周期: ' }}{{ formatPeriodName(plan.periodName) }}</span>
                </div>
              </div>
              <el-tag size="small" type="primary" effect="plain" class="shrink-0 text-[10px]">
                {{ formatPlanStatus(plan.allocationStatus) }}
              </el-tag>
            </div>

            <!-- 目标指标网格 -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-[#F3F8F4]/80 p-2 rounded-lg border border-[#E9F1EB]">
                <span class="text-[#8A9A8F] text-[10px] block">{{ $t('warehouse.targetHouseholds') || '全国保供家庭' }}</span>
                <span class="font-mono font-bold text-[#1F3326] text-xs">{{ plan.targetHouseholds.toLocaleString() }} {{ $t('warehouse.householdUnit') || '户' }}</span>
              </div>
              <div class="bg-[#F3F8F4]/80 p-2 rounded-lg border border-[#E9F1EB]">
                <span class="text-[#8A9A8F] text-[10px] block">{{ $t('warehouse.totalWeight') || '月度保供总重' }}</span>
                <span class="font-mono font-bold text-[#326445] text-xs">{{ (plan.overallProgress?.totalPlanWeightTon || 0).toLocaleString() }} {{ $t('warehouse.tonUnit') || '吨' }}</span>
              </div>
            </div>

            <!-- 月度人均配额与国家保供指导价格标准 -->
            <div class="bg-[#F3F8F4] rounded-lg p-2.5 border border-[#E9F1EB] space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-[#43554B] text-[11px]">{{ $t('warehouse.quotaAndGuidePrice') || '口粮配额与国家指导限价：' }}</span>
                <span class="text-[10px] font-mono font-bold text-[#7A5F21]">{{ $t('warehouse.standardHouseholdGuide') || '标准户: 53,800 IQD/月' }}</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5">
                <div
                  v-for="q in plan.quotaStandards"
                  :key="q.itemCode"
                  class="bg-white px-2 py-1 rounded border border-[#D9E5DB]/60 flex items-center justify-between text-[11px]"
                >
                  <span class="text-[#58685D] truncate mr-1">{{ formatItemName(q.itemName) }}</span>
                  <div class="text-right shrink-0">
                    <span class="font-mono font-bold text-[#1B3123] block">{{ q.quotaPerPerson }} {{ q.unit.split('/')[0] }}</span>
                    <span class="text-[9px] text-[#C9A13B] font-mono">{{ q.guidePriceIQD }} IQD</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 执行进度条 -->
            <div class="pt-2 border-t border-[#E9F1EB] space-y-1 text-xs">
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-[#58685D]">{{ $t('warehouse.fullChainProgress') || '履约全链路进度：' }}</span>
                <span class="text-[#2F7A50] font-bold">{{ $t('warehouse.householdClaimed') || '家庭核销:' }} {{ plan.overallProgress?.claimedRate || 0 }}%</span>
              </div>
              <el-progress
                :percentage="plan.overallProgress?.claimedRate || 0"
                :stroke-width="8"
                color="#3E9B68"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 网格配额分解与排程任务单列表 (三级代理层级架构) -->
      <!-- ======================================================== -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
              <el-icon class="text-[#326445]"><Shop /></el-icon>
              <span>{{ $t('warehouse.agentQuotaTaskTitle') || '代理中心网格配额分解与月度排程任务单' }}</span>
            </h3>
            <el-tag size="small" type="info" effect="plain" class="text-[10px]">
              {{ $t('warehouse.threeTierLinkage') || '省级 / 区域 / 街道三级联动' }}
            </el-tag>
          </div>
          <span class="text-[11px] text-[#8A9A8F]">
            {{ $t('warehouse.foundTasksCount', { count: filteredTasks.length }) || `共查询到 ${filteredTasks.length} 笔任务排程单` }}
          </span>
        </div>

        <!-- 多维度与日期查询栏 (针对 APP 模式优雅排版) -->
        <div class="bg-white p-3 sm:p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs text-xs space-y-2">
          <!-- APP 模式下采用纵向自适应分层布局，Web 模式下保持横向弹性行 -->
          <div :class="isAppMode ? 'space-y-2' : 'flex flex-wrap items-center gap-2.5'">
            <el-input
              v-model="taskSearch"
              :placeholder="$t('warehouse.searchTaskPlaceholder') || '搜索任务单号 / 代理网点 / 负责人'"
              clearable
              size="small"
              :class="isAppMode ? 'w-full' : 'max-w-xs'"
              @input="resetTaskPage"
            >
              <template #prefix>
                <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
              </template>
            </el-input>

            <div :class="isAppMode ? 'grid grid-cols-2 gap-2' : 'flex items-center gap-2.5'">
              <!-- 代理层级快捷筛选 -->
              <div class="flex items-center gap-1 text-[11px] text-[#58685D]">
                <span class="shrink-0">{{ $t('warehouse.agentLevelLabel') || '代理层级:' }}</span>
                <el-select
                  v-model="taskLevelFilter"
                  :placeholder="$t('warehouse.levelAll') || '全部层级'"
                  clearable
                  size="small"
                  class="w-full sm:!w-28"
                  @change="resetTaskPage"
                >
                  <el-option :label="$t('warehouse.levelAll') || '全部层级'" value="" />
                  <el-option :label="$t('warehouse.levelProvince') || '省级代理'" value="PROVINCE" />
                  <el-option :label="$t('warehouse.levelDistrict') || '区域代理'" value="DISTRICT" />
                  <el-option :label="$t('warehouse.levelStreet') || '街道代理'" value="STREET" />
                </el-select>
              </div>

              <!-- 状态筛选 -->
              <div class="flex items-center gap-1 text-[11px] text-[#58685D]">
                <span class="shrink-0">{{ $t('warehouse.fulfillmentStatusLabel') || '状态:' }}</span>
                <el-select
                  v-model="taskStatusFilter"
                  :placeholder="$t('warehouse.fulfillmentStatusLabel') || '履约状态'"
                  clearable
                  size="small"
                  class="w-full sm:!w-28"
                  @change="resetTaskPage"
                >
                  <el-option :label="$t('warehouse.levelAll') || '全部状态'" value="" />
                  <el-option :label="$t('warehouse.statusNormalFulfilling') || '正常履约中'" value="正常履约中" />
                  <el-option :label="$t('warehouse.statusLagAlert') || '履约滞后预警'" value="履约滞后预警" />
                  <el-option :label="$t('warehouse.statusShortageRisk') || '短缺风险预警'" value="短缺风险预警" />
                  <el-option :label="$t('warehouse.statusFinished') || '已完结'" value="已完结" />
                </el-select>
              </div>
            </div>

            <div :class="isAppMode ? 'grid grid-cols-2 gap-2 pt-1 border-t border-[#E9F1EB]' : 'flex items-center gap-2.5'">
              <!-- 月份周期筛选 -->
              <div class="flex items-center gap-1 text-[11px] text-[#58685D]">
                <span class="shrink-0">{{ $t('warehouse.monthPeriodLabel') || '月份:' }}</span>
                <el-date-picker
                  v-model="taskMonth"
                  type="month"
                  value-format="YYYY-MM"
                  :placeholder="$t('warehouse.defaultMonthSearch') || '按月查询'"
                  size="small"
                  class="w-full sm:!w-32"
                  popper-class="rcm-date-popper"
                  :popper-options="datePopperOptions"
                  :teleported="false"
                  @change="handleMonthChange"
                />
              </div>

              <div class="flex items-center justify-end">
                <el-button size="small" type="primary" plain class="w-full sm:w-auto" @click="resetTaskFilters">
                  {{ $t('common.reset') || '重置' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 任务单列表展示：APP 模式下展示原生移动端卡片流，Web 模式下展示完整表格 -->
        <!-- 移动端 APP 专用卡片流视图 -->
        <div v-if="isAppMode" class="space-y-3" v-loading="loading">
          <div v-if="paginatedTasks.length === 0" class="py-8 text-center text-[#8A9A8F] bg-white rounded-lg border border-[#D9E5DB]">
            <el-icon class="text-3xl mb-1 text-[#C9DBCE]"><Document /></el-icon>
            <p class="text-xs">{{ $t('common.noData') || '暂无排程任务单' }}</p>
          </div>

          <div
            v-for="task in paginatedTasks"
            :key="task.taskNo"
            class="bg-white rounded-lg p-3.5 border border-[#D9E5DB]/90 shadow-2xs space-y-2.5"
          >
            <!-- 卡片头部：编号与状态 -->
            <div class="flex items-start justify-between gap-2 border-b border-[#E9F1EB] pb-2">
              <div>
                <span class="font-mono font-bold text-[#2A5440] text-xs block">#{{ task.taskNo }}</span>
                <div class="text-[10px] text-[#8A9A8F] font-mono">{{ task.periodMonth }}</div>
              </div>
              <div class="flex items-center gap-1">
                <el-tag
                  size="small"
                  :type="task.agentLevel === 'PROVINCE' ? 'danger' : task.agentLevel === 'DISTRICT' ? 'primary' : 'success'"
                  effect="dark"
                  class="font-bold scale-90"
                >
                  {{ formatAgentLevel(task) }}
                </el-tag>
                <el-tag
                  size="small"
                  :type="task.taskStatus === '已完结' ? 'info' : task.taskStatus === '正常履约中' ? 'success' : 'danger'"
                  class="scale-90"
                >
                  {{ formatTaskStatus(task.taskStatus || task.status) }}
                </el-tag>
              </div>
            </div>

            <!-- 网点名称与负责人 (国际化绑定) -->
            <div class="space-y-0.5">
              <div class="font-bold text-[#1F3326] text-xs flex items-center gap-1.5 flex-wrap">
                <span>{{ formatTaskCenterName(task.centerName) }}</span>
                <span v-if="task.isSelf" class="text-[9px] text-[#2F7A50] font-bold bg-[#EFF5F1] px-1 py-0.2 rounded border border-[#C7E0CE]">
                  {{ $t('warehouse.isSelfDirect') || '本人直营' }}
                </span>
                <span v-if="task.isArticle140" class="text-[9px] text-[#7A5F21] font-bold bg-[#FDF3E0] px-1 py-0.2 rounded border border-[#F2E3C6]">
                  {{ $t('warehouse.isArticle140Zone') || '第140号争议区' }}
                </span>
              </div>
              <div class="text-[10px] text-[#58685D]">
                {{ $t('warehouse.responsiblePersonPrefix') || '负责人: ' }}{{ formatTaskResponsible(task.responsiblePerson || task.ownerName) }} · {{ $t('warehouse.agentCodePrefix') || '代码: ' }}{{ task.agentCenterId }}
              </div>
            </div>

            <!-- 指标网格：户数与总货值 -->
            <div class="grid grid-cols-2 gap-2 text-xs bg-[#F3F8F4] p-2 rounded-lg border border-[#E9F1EB]">
              <div>
                <span class="text-[#8A9A8F] text-[10px] block">{{ $t('warehouse.targetHouseholds') || '签约保供户数' }}</span>
                <span class="font-mono font-bold text-[#1F3326] text-xs">{{ (task.registeredHouseholds || 0).toLocaleString() }} {{ $t('warehouse.householdUnit') || '户' }}</span>
                <span class="text-[9px] text-[#8A9A8F] block font-mono">{{ $t('warehouse.coveredPopulation', { count: (task.coveredCitizens || task.registeredHouseholds * 4 || 0).toLocaleString() }) || `覆盖人口: ${(task.coveredCitizens || task.registeredHouseholds * 4 || 0).toLocaleString()} 人` }}</span>
              </div>
              <div class="text-right">
                <span class="text-[#8A9A8F] text-[10px] block">{{ $t('warehouse.totalGuideValueTitle') || '指导总货值' }}</span>
                <span class="font-mono font-bold text-[#7A5F21] text-xs">{{ (task.totalGuideAmountIQD || task.registeredHouseholds * 53800 || 0).toLocaleString() }} IQD</span>
                <span class="text-[9px] text-[#2F7A50] block">{{ $t('warehouse.algorithmHouseholdLocked') || '按户锁定' }}</span>
              </div>
            </div>

            <!-- 物资清单微标签 -->
            <div class="flex flex-wrap items-center gap-1 pt-0.5">
              <span
                v-for="item in (task.items || []).slice(0, 3)"
                :key="item.itemCode"
                class="px-1.5 py-0.5 rounded bg-[#E9F1EB] text-[#43554B] text-[10px] font-medium border border-[#D9E5DB]/60"
              >
                {{ formatItemName(item.itemName) }} <b class="font-mono font-bold text-[#1B3123]">{{ item.allocatedQtyTon ? item.allocatedQtyTon + (isEn ? ' Tons' : ' 吨') : (item.plannedQty + ' ' + (item.unit === '吨' ? (isEn ? 'Tons' : '吨') : item.unit)) }}</b>
              </span>
              <span v-if="task.items && task.items.length > 3" class="text-[10px] text-[#8A9A8F]">
                +{{ task.items.length - 3 }}
              </span>
            </div>

            <!-- 卡片底栏：起止交付期与操作按钮 -->
            <div class="flex items-center justify-between pt-2 border-t border-[#E9F1EB] text-[10px] text-[#58685D]">
              <div class="font-mono">
                <span>{{ $t('warehouse.scheduledDeliveryDate') || '排程交付: ' }}</span>
                <strong class="text-[#326445]">{{ task.scheduledDeliveryDate || '2026-10-15' }}</strong>
              </div>
              <el-button size="small" type="primary" plain class="!h-7 text-xs" @click="handleViewTask(task)">
                {{ $t('warehouse.taskDetailBtn') || '全链详情' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 桌面端 Web 表格视图 (保留原有丰富列) -->
        <div v-else class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
          <el-table :data="paginatedTasks" v-loading="loading" border style="width: 100%" class="text-xs">
            <!-- 1. 排程编号 -->
            <el-table-column prop="taskNo" :label="$t('warehouse.planNo') || '排程任务编号'" min-width="165">
              <template #default="{ row }">
                <span class="font-mono font-bold text-[#2A5440] block">{{ row.taskNo }}</span>
                <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.planNo }}</div>
                <div class="text-[10px] text-[#58685D] font-mono">{{ row.periodMonth }}</div>
              </template>
            </el-table-column>

            <!-- 2. 代理层级与网点名称 -->
            <el-table-column :label="$t('warehouse.agentLevelLabel') || '代理层级 / 目标网点'" min-width="210">
              <template #default="{ row }">
                <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                  <el-tag
                    size="small"
                    :type="row.agentLevel === 'PROVINCE' ? 'danger' : row.agentLevel === 'DISTRICT' ? 'primary' : 'success'"
                    effect="dark"
                    class="font-bold scale-90"
                  >
                    {{ formatAgentLevel(row) }}
                  </el-tag>
                  <span v-if="row.isSelf" class="text-[10px] text-[#2F7A50] font-bold bg-[#EFF5F1] px-1 py-0.5 rounded border border-[#C7E0CE]">
                    {{ $t('warehouse.isSelfDirect') || '本人直营' }}
                  </span>
                  <span v-if="row.isArticle140" class="text-[10px] text-[#7A5F21] font-bold bg-[#FDF3E0] px-1 py-0.5 rounded border border-[#F2E3C6]">
                    {{ $t('warehouse.isArticle140Zone') || '第140号争议区' }}
                  </span>
                </div>
                <div class="font-bold text-[#1F3326] text-xs">{{ formatTaskCenterName(row.centerName) }}</div>
                <div class="text-[10px] text-[#8A9A8F]">
                  {{ $t('warehouse.responsiblePersonPrefix') || '负责人: ' }}{{ formatTaskResponsible(row.responsiblePerson || row.ownerName) }} · {{ $t('warehouse.agentCodePrefix') || '代码: ' }}{{ row.agentCenterId }}
                </div>
              </template>
            </el-table-column>

            <!-- 3. 服务签约户数 (算法基准) -->
            <el-table-column :label="$t('warehouse.targetHouseholds') || '服务签约户数 / 人口'" min-width="145" align="center">
              <template #default="{ row }">
                <div class="font-mono font-bold text-[#1B3123] text-sm">
                  {{ (row.registeredHouseholds || 0).toLocaleString() }} <span class="text-xs font-normal text-[#58685D]">{{ $t('warehouse.householdUnit') || '户' }}</span>
                </div>
                <div class="text-[10px] text-[#8A9A8F] font-mono">
                  {{ $t('warehouse.coveredPopulation', { count: (row.coveredCitizens || row.registeredHouseholds * 4 || 0).toLocaleString() }) || `覆盖人口: ${(row.coveredCitizens || row.registeredHouseholds * 4 || 0).toLocaleString()} 人` }}
                </div>
                <div class="text-[9px] text-[#2F7A50] mt-0.5">
                  {{ $t('warehouse.algorithmHouseholdLocked') || '算法根据户数锁定分配' }}
                </div>
              </template>
            </el-table-column>

            <!-- 4. 国家保供指导限价与总货值 -->
            <el-table-column :label="$t('warehouse.totalGuideValueTitle') || '国家保供指导总货值'" min-width="170">
              <template #default="{ row }">
                <div class="font-mono font-bold text-[#7A5F21] text-sm">
                  {{ (row.totalGuideAmountIQD || row.registeredHouseholds * 53800 || 0).toLocaleString() }} <span class="text-[10px] font-sans">IQD</span>
                </div>
                <div class="text-[10px] text-[#8A9A8F] font-mono">
                  {{ $t('warehouse.householdAverageGuide') || '户均保供基准: 53,800 IQD/户' }}
                </div>
                <div class="text-[9px] text-[#8A9A8F]">
                  {{ $t('warehouse.guidelinePriceMicro') || '米 1000 · 面 750 · 油 2500 · 糖 1200' }}
                </div>
              </template>
            </el-table-column>

            <!-- 5. 排程配送物资与配额 (按户数自动分配) -->
            <el-table-column :label="$t('warehouse.itemsAndQuotasTitle') || '排程保供物资与配额明细'" min-width="230">
              <template #default="{ row }">
                <div class="space-y-1">
                  <div
                    v-for="item in (row.items || []).slice(0, 3)"
                    :key="item.itemCode"
                    class="flex items-center justify-between text-[11px] bg-[#F3F8F4] px-2 py-0.5 rounded border border-[#E9F1EB]"
                  >
                    <span class="text-[#58685D] truncate">{{ formatItemName(item.itemName) }}</span>
                    <div class="font-mono text-right shrink-0">
                      <span class="font-bold text-[#1F3326]">{{ item.allocatedQtyTon ? item.allocatedQtyTon + (isEn ? ' Tons' : ' 吨') : (item.plannedQty?.toLocaleString() + ' ' + (item.unit === '吨' ? (isEn ? 'Tons' : '吨') : item.unit)) }}</span>
                      <span class="text-[9px] text-[#C9A13B] block">{{ $t('warehouse.priceCapPrefix') || '限价: ' }}{{ item.guidePriceIQD || (item.itemCode.includes('RICE') ? 1000 : 750) }} IQD</span>
                    </div>
                  </div>
                  <div v-if="row.items && row.items.length > 3" class="text-[10px] text-[#8A9A8F] text-right">
                    {{ $t('warehouse.moreItemsCount', { count: row.items.length }) || `等共 ${row.items.length} 种战略保供物资...` }}
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 6. 计划起止与交接期 -->
            <el-table-column prop="scheduleDate" :label="$t('warehouse.executionCycleTitle') || '执行起止周期'" min-width="145">
              <template #default="{ row }">
                <div class="font-mono text-[#43554B] text-[11px]">
                  {{ row.scheduleStartDate || '2026-10-01' }}
                </div>
                <div class="font-mono text-[#8A9A8F] text-[10px]">
                  {{ $t('warehouse.dateSeparator') || '至' }} {{ row.scheduleEndDate || '2026-10-31' }}
                </div>
                <div class="text-[10px] text-[#326445] font-mono">
                  {{ $t('warehouse.scheduledDeliveryDate') || '排程交付: ' }}{{ row.scheduledDeliveryDate || '2026-10-15' }}
                </div>
              </template>
            </el-table-column>

            <!-- 7. 任务状态 -->
            <el-table-column prop="taskStatus" :label="$t('warehouse.fulfillmentStatusLabel') || '履约状态'" width="115" align="center">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="
                    row.taskStatus === '已完结'
                      ? 'info'
                      : row.taskStatus === '正常履约中'
                      ? 'success'
                      : row.taskStatus === '履约滞后预警'
                      ? 'warning'
                      : 'danger'
                  "
                >
                  {{ formatTaskStatus(row.taskStatus || row.status) }}
                </el-tag>
                <div v-if="row.riskReason" class="text-[9px] text-[#C04442] truncate max-w-[100px] mt-0.5" :title="row.riskReason">
                  {{ row.riskReason }}
                </div>
              </template>
            </el-table-column>

            <!-- 8. 操作 -->
            <el-table-column :label="$t('common.actions') || '操作'" width="110" align="center" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="handleViewTask(row)">
                  {{ $t('warehouse.taskDetailBtn') || '全链详情' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 -->
          <div class="p-3 bg-[#F3F8F4]/80 border-t border-[#D9E5DB]/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
            <span>
              第 {{ taskCurrentPage }} / {{ Math.ceil(filteredTasks.length / taskPageSize) || 1 }} 页 · 共 {{ filteredTasks.length }} 项
            </span>
            <el-pagination
              v-model:current-page="taskCurrentPage"
              v-model:page-size="taskPageSize"
              :page-sizes="[5, 10, 20, 50]"
              :total="filteredTasks.length"
              layout="total, sizes, prev, pager, next"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 依据贸易部计划自动生成下级配额计划 对话框 (禁止手动分配，严格按户数公式排程) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="decomposeDialogVisible"
      title="依据贸易部月度计划自动排程生成下级配额计划"
      width="780px"
      destroy-on-close
    >
      <div class="space-y-4 text-xs">
        <!-- 核心系统刚性规则提示 -->
        <div class="p-3.5 bg-[#EFF5F1]/80 rounded-lg border border-[#C7DED0] text-[#1F3326] space-y-1">
          <div class="font-bold flex items-center gap-1.5 text-[#24483A]">
            <el-icon class="text-[#326445]"><Check /></el-icon>
            <span>系统硬性约束：基于三级代理架构与签约实名家庭户数自动核算</span>
          </div>
          <div class="text-[11px] leading-relaxed text-[#2A5440]">
            代理体系涵盖<strong>省级代理（宏观统筹） $\rightarrow$ 区域代理（区级调度） $\rightarrow$ 街道代理（终端门店）</strong>三层。
            各级配额严格根据网点实名挂靠的<strong>签约户数（户数 × 4人/户 × 国家月度配额指标）</strong>由系统公式自动分配，
            <strong>严禁人工干预或手动调整输入</strong>，确保战略物资与指导限价精准透传到户，杜绝克扣截留！
          </div>
        </div>

        <!-- 计划与月份选择 -->
        <div class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#D9E5DB]/80 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="font-bold text-[#43554B] block mb-1">{{ isEn ? 'Select Ministry Strategic Plan:' : '选择贸易部月度总计划：' }}</span>
              <el-select v-model="selectedDecomposePlanId" class="w-full" size="small" @change="handlePlanSelectChange">
                <el-option
                  v-for="p in plans"
                  :key="p.id"
                  :label="`${formatPlanTitle(p.title)} (${formatPeriodName(p.periodName)})`"
                  :value="p.id"
                />
              </el-select>
            </div>
            <div>
              <span class="font-bold text-[#43554B] block mb-1">{{ isEn ? 'Target Scheduled Month:' : '目标排程月份周期：' }}</span>
              <el-date-picker
                v-model="targetDecomposeMonth"
                type="month"
                value-format="YYYY-MM"
                placeholder="选择月份"
                size="small"
                class="!w-full"
              />
            </div>
          </div>

          <div class="text-[11px] text-[#58685D] flex items-center justify-between pt-2 border-t border-[#D9E5DB]/60 font-mono">
            <span>国家保供指导限价标准：</span>
            <span class="text-[#7A5F21] font-bold">大米 1000 IQD · 面粉 750 IQD · 食用油 2500 IQD · 白糖 1200 IQD</span>
          </div>
        </div>

        <!-- 三级代理层级自动分配测算预览列表 (只读，公式锁定) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-[#1F3326]">{{ isEn ? '3-Tier Agent Quota Auto-Decompose Simulation (System Algorithm Locked):' : '三级代理层级自动排程测算预览 (系统公式锁定计算，不可篡改)：' }}</span>
            <span class="text-[11px] text-[#8A9A8F]">{{ isEn ? '8 hierarchical dispatch manifests to be generated' : '共将生成 8 个层级排程单据' }}</span>
          </div>

          <div class="max-h-56 overflow-y-auto border border-[#D9E5DB] rounded-lg">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-[#F3F8F4] text-[#58685D] font-bold border-b border-[#D9E5DB]">
                <tr>
                  <th class="p-2">{{ isEn ? 'Level' : '层级' }}</th>
                  <th class="p-2">{{ isEn ? 'Agency Station / Manager' : '代理网点 / 负责人' }}</th>
                  <th class="p-2 text-center">{{ isEn ? 'Quota Households' : '核定签约户数' }}</th>
                  <th class="p-2 text-right">{{ isEn ? 'Rice / Flour (Tons)' : '自动核算大米/面粉(吨)' }}</th>
                  <th class="p-2 text-right">{{ isEn ? 'Guide Cap (IQD)' : '指导总货值(IQD)' }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E9F1EB] font-mono">
                <!-- 1. 省级代理 -->
                <tr class="bg-[#FDF3E0]/40">
                  <td class="p-2">
                    <el-tag size="small" type="danger" effect="dark" class="scale-90 font-sans">{{ formatAgentLevel('PROVINCE') }}</el-tag>
                  </td>
                  <td class="p-2 font-sans font-bold text-[#1F3326]">
                    {{ isEn ? 'Baghdad Provincial Ration General Operations Agency (Mohammed Jabbar)' : '巴格达省配给运营总代理 (穆罕默德·贾巴尔)' }}
                  </td>
                  <td class="p-2 text-center font-bold text-[#1B3123]">7,650 {{ isEn ? 'HH' : '户' }}</td>
                  <td class="p-2 text-right text-[#2A5440]">91.8 {{ isEn ? 'T' : '吨' }} / 275.4 {{ isEn ? 'T' : '吨' }}</td>
                  <td class="p-2 text-right font-bold text-[#7A5F21]">411,570,000</td>
                </tr>
                <!-- 2. 区域代理 -->
                <tr class="bg-[#EFF5F1]/30">
                  <td class="p-2">
                    <el-tag size="small" type="primary" effect="dark" class="scale-90 font-sans">{{ formatAgentLevel('DISTRICT') }}</el-tag>
                  </td>
                  <td class="p-2 font-sans text-[#1F3326]">
                    {{ isEn ? 'Karkh District Regional Operations Dept (Haider Fatih)' : '卡尔赫区区域代理运营部 (海德尔·法蒂赫)' }}
                  </td>
                  <td class="p-2 text-center font-bold text-[#1B3123]">4,100 {{ isEn ? 'HH' : '户' }}</td>
                  <td class="p-2 text-right text-[#2A5440]">49.2 {{ isEn ? 'T' : '吨' }} / 147.6 {{ isEn ? 'T' : '吨' }}</td>
                  <td class="p-2 text-right font-bold text-[#7A5F21]">220,580,000</td>
                </tr>
                <tr class="bg-[#EFF5F1]/30">
                  <td class="p-2">
                    <el-tag size="small" type="primary" effect="dark" class="scale-90 font-sans">{{ formatAgentLevel('DISTRICT') }}</el-tag>
                  </td>
                  <td class="p-2 font-sans text-[#1F3326]">
                    {{ isEn ? 'Rusafa District Regional Operations Dept (Zaid Qasim)' : '鲁萨法区区域代理运营部 (扎伊德·卡西姆)' }}
                  </td>
                  <td class="p-2 text-center font-bold text-[#1B3123]">3,550 {{ isEn ? 'HH' : '户' }}</td>
                  <td class="p-2 text-right text-[#2A5440]">42.6 {{ isEn ? 'T' : '吨' }} / 127.8 {{ isEn ? 'T' : '吨' }}</td>
                  <td class="p-2 text-right font-bold text-[#7A5F21]">190,990,000</td>
                </tr>
                <!-- 3. 街道代理网点 -->
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">{{ formatAgentLevel('STREET') }}</el-tag>
                  </td>
                  <td class="p-2 font-sans text-[#43554B]">
                    {{ isEn ? 'Karkh 1st Ration Center Comprehensive Store (Mansour)' : '卡尔赫第一配给中心综合代销站 (曼苏尔)' }}
                  </td>
                  <td class="p-2 text-center font-bold text-[#1F3326]">1,120 {{ isEn ? 'HH' : '户' }}</td>
                  <td class="p-2 text-right text-[#2A5440]">13.4 {{ isEn ? 'T' : '吨' }} / 40.3 {{ isEn ? 'T' : '吨' }}</td>
                  <td class="p-2 text-right text-[#7A5F21]">60,256,000</td>
                </tr>
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">{{ formatAgentLevel('STREET') }}</el-tag>
                  </td>
                  <td class="p-2 font-sans text-[#43554B]">
                    {{ isEn ? 'Yarmouk 3rd Street Service Station (Omar)' : '亚尔穆克第3街道便民配给站 (奥马尔)' }}
                  </td>
                  <td class="p-2 text-center font-bold text-[#1F3326]">1,480 {{ isEn ? 'HH' : '户' }}</td>
                  <td class="p-2 text-right text-[#2A5440]">17.8 {{ isEn ? 'T' : '吨' }} / 53.3 {{ isEn ? 'T' : '吨' }}</td>
                  <td class="p-2 text-right text-[#7A5F21]">79,624,000</td>
                </tr>
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">{{ formatAgentLevel('STREET') }}</el-tag>
                  </td>
                  <td class="p-2 font-sans text-[#43554B]">
                    {{ isEn ? 'Dora 12th District Ration Station (Khalid Waleed)' : '多拉区第12配给便民站 (哈立德·瓦利德)' }}
                  </td>
                  <td class="p-2 text-center font-bold text-[#1F3326]">1,500 {{ isEn ? 'HH' : '户' }}</td>
                  <td class="p-2 text-right text-[#2A5440]">18.0 {{ isEn ? 'T' : '吨' }} / 54.0 {{ isEn ? 'T' : '吨' }}</td>
                  <td class="p-2 text-right text-[#7A5F21]">80,700,000</td>
                </tr>
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">{{ formatAgentLevel('STREET') }}</el-tag>
                  </td>
                  <td class="p-2 font-sans text-[#43554B]">
                    {{ isEn ? 'Khanaqin 1st Border Supply Station (Art. 140 Zone)' : '哈奈根第一边境综合代销保供站 (第140号区)' }}
                  </td>
                  <td class="p-2 text-center font-bold text-[#1F3326]">890 {{ isEn ? 'HH' : '户' }}</td>
                  <td class="p-2 text-right text-[#2A5440]">10.7 {{ isEn ? 'T' : '吨' }} / 32.0 {{ isEn ? 'T' : '吨' }}</td>
                  <td class="p-2 text-right text-[#7A5F21]">47,882,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <span class="text-[11px] text-[#8A9A8F] font-mono">
            {{ isEn ? 'Algorithm Formula: Households × 4 Persons × Monthly Quota (Read-Only Locked)' : '分配算法：户数 × 4人 × 月度标准配额指标 (只读锁定)' }}
          </span>
          <div class="flex items-center gap-2">
            <el-button @click="decomposeDialogVisible = false">{{ $t('common.cancel') || '取消' }}</el-button>
            <el-button type="success" :loading="decomposing" @click="submitAutoDecompose">
              {{ isEn ? 'Confirm & Generate 3-Tier Manifests' : '确认并自动生成三级配额排程单' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 制定配给计划对话框 (管理角色专属) -->
    <el-dialog v-model="createDialogVisible" :title="$t('warehouse.makePlanTitle') || '制定计划 (SCM / BPM)'" width="640px" destroy-on-close>
      <el-form :model="newPlanForm" label-width="130px" class="space-y-3 text-xs">
        <el-form-item :label="$t('warehouse.planNo') || '计划编号'" required>
          <el-input v-model="newPlanForm.planNo" placeholder="如 PLAN-2026-11-001" />
        </el-form-item>
        <el-form-item :label="$t('warehouse.planTitle') || '计划标题名称'" required>
          <el-input v-model="newPlanForm.title" placeholder="如 2026年11月全国战略口粮月度配给计划" />
        </el-form-item>
        <el-form-item :label="$t('warehouse.cyclePeriod') || '月度周期起止'" required>
          <div class="flex items-center gap-2 w-full">
            <el-date-picker v-model="newPlanForm.startDate" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" class="w-full" />
            <span class="text-[#8A9A8F]">至</span>
            <el-date-picker v-model="newPlanForm.endDate" type="date" value-format="YYYY-MM-DD" placeholder="截止日期" class="w-full" />
          </div>
        </el-form-item>
        <el-form-item :label="$t('warehouse.targetScope') || '供应对象范围'" required>
          <el-select
            v-model="newPlanForm.provinces"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :placeholder="$t('warehouse.selectProvinces') || '请选择供应省市 (支持多选，制定每月配给计划)'"
            class="w-full"
          >
            <el-option label="全国所有省份 (全境统筹)" value="全国所有省市" />
            <el-option label="巴格达省 (Baghdad)" value="巴格达省" />
            <el-option label="巴士拉省 (Basra)" value="巴士拉省" />
            <el-option label="尼尼微省 (Nineveh)" value="尼尼微省" />
            <el-option label="迪亚拉省 (Diyala)" value="迪亚拉省" />
            <el-option label="基尔库克省 (Kirkuk)" value="基尔库克省" />
            <el-option label="安巴尔省 (Anbar)" value="安巴尔省" />
            <el-option label="埃尔比勒省 (Erbil)" value="埃尔比勒省" />
            <el-option label="苏莱曼尼亚省 (Sulaymaniyah)" value="苏莱曼尼亚省" />
          </el-select>
        </el-form-item>
        <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/70 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-[#43554B] text-xs">人均标准配额与国家指导限价：</span>
            <span class="text-[11px] text-[#7A5F21] font-mono">标准户总额: 53,800 IQD/户</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <span class="text-[11px] text-[#58685D]">精制大米 (KG/人, 1,000 IQD)</span>
              <el-input-number v-model="newPlanForm.riceQuota" :min="1" :max="10" :precision="1" size="small" class="w-full mt-1" />
            </div>
            <div>
              <span class="text-[11px] text-[#58685D]">特级面粉 (KG/人, 750 IQD)</span>
              <el-input-number v-model="newPlanForm.flourQuota" :min="1" :max="20" :precision="1" size="small" class="w-full mt-1" />
            </div>
            <div>
              <span class="text-[11px] text-[#58685D]">食用植物油 (L/人, 2,500 IQD)</span>
              <el-input-number v-model="newPlanForm.oilQuota" :min="0.5" :max="5" :precision="1" size="small" class="w-full mt-1" />
            </div>
            <div>
              <span class="text-[11px] text-[#58685D]">纯精白糖 (KG/人, 1,200 IQD)</span>
              <el-input-number v-model="newPlanForm.sugarQuota" :min="1" :max="10" :precision="1" size="small" class="w-full mt-1" />
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCreatePlan">签署并下发月度总计划</el-button>
      </template>
    </el-dialog>

    <!-- 任务单全链路追溯抽屉 -->
    <el-drawer v-model="drawerVisible" title="排程任务单全链路详情与算法审计" size="540px">
      <div v-if="activeTask" class="space-y-4 text-xs">
        <div class="p-3.5 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-[#1B3123] font-mono">{{ activeTask.taskNo }}</span>
            <el-tag
              size="small"
              :type="activeTask.agentLevel === 'PROVINCE' ? 'danger' : activeTask.agentLevel === 'DISTRICT' ? 'primary' : 'success'"
              effect="dark"
            >
              {{ formatAgentLevel(activeTask) }}
            </el-tag>
          </div>
          <div class="text-[#58685D] font-mono text-[11px]">{{ isEn ? 'Ministry Plan: ' : '所属贸易部计划: ' }}{{ activeTask.planNo }}</div>
          <div class="text-[#58685D] font-mono text-[11px]">{{ isEn ? 'Scheduled Month: ' : '排程月度周期: ' }}{{ activeTask.periodMonth }}</div>
        </div>

        <!-- 刚性算法分配约束提示 -->
        <div class="p-3 bg-[#EFF5F1]/70 rounded-lg border border-[#C7DED0] text-[#1F3326] space-y-1">
          <div class="font-bold flex items-center gap-1">
            <el-icon><Check /></el-icon>
            <span>{{ isEn ? 'Atomic Allocation Algorithm Formula (Manual Edit Prohibited):' : '算法原子分配公式 (严禁手动修改)：' }}</span>
          </div>
          <div class="font-mono text-[11px] text-[#24483A]">
            {{ activeTask.autoAllocatedFormula || (isEn ? `Registered: ${(activeTask.registeredHouseholds || 0).toLocaleString()} households × 4 members × National monthly quota standard` : `签约户数 ${(activeTask.registeredHouseholds || 0).toLocaleString()} 户 × 4人/户 × 国家月度保供配额指标`) }}
          </div>
        </div>

        <!-- 受援代理网点信息 -->
        <div class="space-y-2">
          <span class="font-bold text-[#43554B]">{{ isEn ? 'Agency Outlet Profile:' : '代理网点基本档案：' }}</span>
          <div class="p-3 bg-white rounded-lg border border-[#D9E5DB] space-y-2">
            <div class="flex justify-between">
              <span class="text-[#8A9A8F]">{{ isEn ? 'Station Name:' : '网点名称:' }}</span>
              <span class="font-bold text-[#1F3326]">{{ formatTaskCenterName(activeTask.centerName) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8A9A8F]">{{ isEn ? 'Agent Code:' : '代销编码:' }}</span>
              <span class="font-mono text-[#43554B]">{{ activeTask.agentCenterId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8A9A8F]">{{ isEn ? 'Manager:' : '负责人:' }}</span>
              <span class="text-[#1F3326] font-medium">{{ formatTaskResponsible(activeTask.responsiblePerson || activeTask.ownerName) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8A9A8F]">{{ isEn ? 'Registered Households:' : '签约户籍户数:' }}</span>
              <span class="font-mono font-bold text-[#2A5440]">{{ (activeTask.registeredHouseholds || 0).toLocaleString() }} {{ $t('warehouse.householdUnit') || '户' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8A9A8F]">{{ isEn ? 'Beneficiaries:' : '覆盖受益人口:' }}</span>
              <span class="font-mono text-[#1F3326]">{{ (activeTask.coveredCitizens || activeTask.registeredHouseholds * 4 || 0).toLocaleString() }} {{ isEn ? 'people' : '人' }}</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-[#E9F1EB]">
              <span class="text-[#8A9A8F]">{{ isEn ? 'Official Total Price Cap:' : '国家保供指导总货值:' }}</span>
              <span class="font-mono font-bold text-[#7A5F21] text-sm">
                {{ (activeTask.totalGuideAmountIQD || activeTask.registeredHouseholds * 53800 || 0).toLocaleString() }} IQD
              </span>
            </div>
          </div>
        </div>

        <!-- 物资分配清单与指导价格 -->
        <div class="space-y-2">
          <span class="font-bold text-[#43554B]">{{ isEn ? 'Commodity Allocation & Official Price Caps:' : '物资分配清单与国家保供指导价：' }}</span>
          <div class="space-y-2">
            <div
              v-for="item in activeTask.items"
              :key="item.itemCode"
              class="p-3 bg-white rounded-lg border border-[#D9E5DB] space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-[#1F3326]">{{ formatItemName(item.itemName) }}</span>
                  <span class="text-[10px] text-[#8A9A8F] font-mono ml-1.5">{{ item.itemCode }}</span>
                </div>
                <div class="font-mono font-bold text-[#1B3123] text-sm">
                  {{ item.allocatedQtyTon ? item.allocatedQtyTon + (isEn ? ' Tons' : ' 吨') : (item.plannedQty?.toLocaleString() + ' ' + item.unit) }}
                </div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-[#58685D] font-mono">
                <span>{{ isEn ? 'Official Cap: ' : '国家指导限价: ' }}{{ item.guidePriceIQD || (item.itemCode.includes('RICE') ? 1000 : 750) }} IQD/{{ item.unit }}</span>
                <span class="text-[#7A5F21] font-bold">{{ isEn ? 'Subtotal: ' : '指导分项金额: ' }}{{ (item.subtotalIQD || 0).toLocaleString() }} IQD</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-[#8A9A8F] font-mono pt-1 border-t border-[#E9F1EB]">
                <span>{{ isEn ? 'Outbound: ' : '已出库: ' }}{{ item.outboundQty?.toLocaleString() }} {{ item.unit }}</span>
                <span>{{ isEn ? 'Received: ' : '已签收: ' }}{{ item.receivedQty?.toLocaleString() }} {{ item.unit }}</span>
                <span class="text-[#2F7A50] font-bold">{{ isEn ? 'Claimed: ' : '家庭已领: ' }}{{ item.claimedQty?.toLocaleString() }} {{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 履约合规提示 -->
        <div class="p-3 bg-[#FDF3E0] rounded-lg border border-[#F2E3C6] text-[#6B5321] space-y-1 text-xs">
          <div class="font-bold">{{ isEn ? 'Fulfillment Risk & Traceability Notice:' : '全链路履约风控与追溯提示：' }}</div>
          <div>{{ isEn ? 'If verified quantities deviate from dispatch manifests, the system triggers a P3 discrepancy alert and halts downstream distribution.' : '若代理网点实收数量与交付流水不一致，系统将即刻触发 P3 差异预警并阻断该批次异常货物的后续发放流转。' }}</div>
        </div>
      </div>
    </el-drawer>

    <!-- ======================================================== -->
    <!-- 3. 公民出示电子配给卡与核验二维码弹窗 (Google Pixel 9 适配) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="cardModalVisible"
      :title="null"
      :width="isAppMode ? 'min(92vw, 386px)' : '420px'"
      align-center
      class="citizen-card-verify-dialog"
      :show-close="true"
      @closed="handleCardModalClosed"
    >
      <div class="space-y-4 p-1">
        <!-- 弹窗顶栏 -->
        <div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#326445] text-[#D3AF62] flex items-center justify-center text-xs">
              <el-icon><Tickets /></el-icon>
            </div>
            <div>
              <div class="text-xs font-bold text-[#1F3326]">{{ $t('citizenCard.voucherTitle') || '法定电子配给卡档案凭证' }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ $t('citizenCard.voucherSubtitle') || '供代销网点专员现场终端扫描核验' }}</div>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F4E4] text-[#2F7A50] border border-[#C7E0CE] flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[#2F7A50] animate-pulse"></span>
            <span>{{ $t('citizenCard.recordActive') || '档案在册' }}</span>
          </span>
        </div>

        <!-- 1. 典雅电子配给卡主体 (严格参考 app 公民视口 公民服务 页面最上面的配给卡风格) -->
        <div
          class="relative overflow-hidden rounded-lg p-4 text-white bg-gradient-to-br from-[#326445] via-[#2F5B44] to-[#1F3326] shadow-md border border-[#D3AF62]/35 select-none"
        >
          <!-- 金色装饰弧线纹理 -->
          <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-[#D3AF62]/20 pointer-events-none"></div>
          <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border border-[#D3AF62]/15 pointer-events-none"></div>

          <div class="relative z-10 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-white/10">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#2F7A50] animate-pulse"></span>
                <span class="text-[11px] font-semibold text-[#D3AF62] tracking-wider uppercase">
                  {{ $t('citizenCard.cardTitle') || '伊拉克共和国贸易部 · 电子配给卡' }}
                </span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D3AF62]/20 text-[#D3AF62] border border-[#D3AF62]/40">
                {{ citizenFamilyInfo?.status || $t('citizenCard.statusActive') || '正常在册' }}
              </span>
            </div>

            <div class="space-y-0.5">
              <span class="text-[9px] text-white/60 tracking-wider uppercase">
                {{ $t('citizenCard.rationCardNoLabel') || '国家统一电子配给卡编码' }}
              </span>
              <div class="text-lg font-extrabold tracking-widest font-mono text-[#FBFDFB]">
                {{ citizenFamilyInfo?.rationCardNo || 'RC-10029381' }}
              </div>
              <div class="text-[10px] text-[#D3AF62] font-mono">
                {{ $t('citizenCard.linkedPaperBook') || '关联纸质配给卡本号' }}：{{ citizenFamilyInfo?.oldPaperCardNo || 'IQ-P-1994-082194' }}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span class="text-[9px] text-white/50 block">{{ $t('citizenCard.legalHeadName') || '法定户主姓名' }}</span>
                <span class="font-bold text-white text-xs">{{ citizenFamilyInfo?.headName || '艾哈迈德·哈桑' }}</span>
                <span class="text-[10px] text-[#A7D9BC] font-mono block">{{ $t('citizenCard.totalMembersRegistered', { count: memberCount }) || `（全户在册 ${memberCount} 人）` }}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-white/50 block">{{ $t('citizenCard.agentStore') || '签约保供代销网点' }}</span>
                <span class="text-[11px] text-[#E5CEA1] font-medium truncate block" :title="citizenFamilyInfo?.agentName">
                  {{ citizenFamilyInfo?.agentName || '巴格达卡尔赫第一代销站' }}
                </span>
                <span class="text-[10px] text-white/50 font-mono">{{ $t('citizenCard.agentCodePrefix') || '代码: ' }}{{ citizenFamilyInfo?.agentId || 'FA-00128' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 可扫描验证配给卡的防伪动态二维码 -->
        <div class="bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB] text-center space-y-2.5">
          <div class="flex items-center justify-between text-[11px] text-[#58685D] px-1">
            <span class="font-bold text-[#326445] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#D3AF62]"></span>
              <span>{{ $t('citizenCard.qrVerifyTitle') || '现场扫码验证凭证' }}</span>
            </span>
            <span class="font-mono text-[10px] text-[#D3AF62] bg-[#FDF3E0] px-2 py-0.5 rounded-full border border-[#E5CEA1]">
              {{ $t('citizenCard.antiCounterfeitActive') || '动态防伪中' }}
            </span>
          </div>

          <!-- 高保真防伪二维码容器 -->
          <div class="relative w-48 h-48 mx-auto p-2.5 rounded-lg bg-white border-2 border-[#326445] shadow-md flex flex-col items-center justify-center overflow-hidden">
            <!-- 动态扫描光束 -->
            <div class="absolute inset-x-2 h-0.5 bg-[#D3AF62] shadow-[0_0_12px_#D3AF62] animate-scan-card-qr z-20"></div>

            <!-- SVG 矢量精细二维码 -->
            <svg viewBox="0 0 200 200" class="w-full h-full text-[#326445]" fill="currentColor">
              <rect width="200" height="200" fill="#ffffff" />
              <!-- 三个定位角标 -->
              <rect x="14" y="14" width="46" height="46" fill="#326445" rx="6" />
              <rect x="22" y="22" width="30" height="30" fill="#ffffff" rx="4" />
              <rect x="28" y="28" width="18" height="18" fill="#326445" rx="2" />
              <rect x="140" y="14" width="46" height="46" fill="#326445" rx="6" />
              <rect x="148" y="22" width="30" height="30" fill="#ffffff" rx="4" />
              <rect x="154" y="28" width="18" height="18" fill="#326445" rx="2" />
              <rect x="14" y="140" width="46" height="46" fill="#326445" rx="6" />
              <rect x="22" y="148" width="30" height="30" fill="#ffffff" rx="4" />
              <rect x="28" y="154" width="18" height="18" fill="#326445" rx="2" />
              <!-- 数据伪码点阵 -->
              <rect x="74" y="18" width="12" height="12" />
              <rect x="94" y="18" width="12" height="12" />
              <rect x="114" y="18" width="12" height="12" />
              <rect x="74" y="38" width="12" height="12" />
              <rect x="104" y="44" width="12" height="12" />
              <rect x="18" y="74" width="12" height="12" />
              <rect x="38" y="74" width="12" height="12" />
              <rect x="58" y="74" width="12" height="12" />
              <rect x="78" y="74" width="12" height="12" />
              <rect x="98" y="74" width="12" height="12" />
              <rect x="118" y="74" width="12" height="12" />
              <rect x="138" y="74" width="12" height="12" />
              <rect x="158" y="74" width="12" height="12" />
              <rect x="18" y="94" width="12" height="12" />
              <rect x="44" y="104" width="12" height="12" />
              <rect x="74" y="100" width="12" height="12" />
              <rect x="114" y="94" width="12" height="12" />
              <rect x="144" y="104" width="12" height="12" />
              <rect x="164" y="94" width="12" height="12" />
              <rect x="24" y="118" width="12" height="12" />
              <rect x="64" y="118" width="12" height="12" />
              <rect x="84" y="118" width="12" height="12" />
              <rect x="124" y="118" width="12" height="12" />
              <rect x="154" y="118" width="12" height="12" />
              <rect x="74" y="144" width="12" height="12" />
              <rect x="104" y="144" width="12" height="12" />
              <rect x="134" y="144" width="12" height="12" />
              <rect x="164" y="144" width="12" height="12" />
              <rect x="74" y="164" width="12" height="12" />
              <rect x="94" y="164" width="12" height="12" />
              <rect x="124" y="164" width="12" height="12" />
              <rect x="154" y="164" width="12" height="12" />
              <!-- 中心徽章 -->
              <rect x="80" y="80" width="40" height="40" fill="#326445" rx="8" />
              <rect x="84" y="84" width="32" height="32" fill="#D3AF62" rx="6" />
              <text x="100" y="104" font-size="11" font-weight="900" fill="#326445" text-anchor="middle" font-family="monospace">RCM</text>
            </svg>

            <!-- 动态时间戳水印 -->
            <div class="absolute bottom-1 inset-x-2 text-[9px] font-mono text-[#58685D] bg-white/95 py-0.5 rounded border border-[#D9E5DB]">
              {{ liveCardClock }}
            </div>
          </div>

          <!-- 动态验证密文与刷新控制 -->
          <div class="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-[#D9E5DB]">
            <div class="text-left font-mono">
              <span class="text-[10px] text-[#8A9A8F] block">{{ $t('citizenCard.securityCipherLabel') || '防伪安全校验密文：' }}</span>
              <span class="font-bold text-[#326445] text-[11px]">{{ dynamicCardCode }}</span>
            </div>
            <button
              type="button"
              class="text-[11px] text-[#D3AF62] hover:text-[#326445] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              @click="refreshDynamicCode"
            >
              <el-icon><Refresh /></el-icon>
              <span>{{ $t('citizenCard.refreshCipher') || '刷新密文' }}</span>
            </button>
          </div>

          <div class="text-[10px] text-[#8A9A8F] leading-tight">
            {{ $t('citizenCard.qrScanNotice') || '请保持手机屏幕常亮并调高亮度 · 网点专员扫码即可核查配额与办理核销发放' }}
          </div>
        </div>

        <!-- 底部完成按钮 -->
        <el-button
          type="primary"
          class="w-full font-bold shadow-xs !rounded-lg"
          style="background: #326445; border-color: #326445; color: #FFFFFF;"
          @click="cardModalVisible = false"
        >
          {{ $t('citizenCard.closeVoucher') || '完成出示 / 关闭' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.js';
import { useCitizenStore } from '../../../stores/citizen.js';
import {
  getRationPlanList,
  createRationPlan,
  getAgentAllocationTasks,
  decomposePlanToAgents
} from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { Plus, Share, Refresh, Calendar, Shop, Search, Goods, Check, ShoppingCart, Tickets, InfoFilled } from '@element-plus/icons-vue';

const emit = defineEmits(['go-purchase']);

const route = useRoute();
const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');
const authStore = useAuthStore();
const citizenStore = useCitizenStore();

// 日期弹层防越界：弹层改为组件内渲染 (teleported=false)，
// 以最近滚动/裁剪祖先 (APP 仿真视口外壳) 为边界自动平移翻转，多语言切换后标签变长也不会把面板挤出屏幕
const datePopperOptions = {
  strategy: 'fixed',
  modifiers: [
    { name: 'preventOverflow', options: { boundary: 'clippingParents', padding: 8 } },
    { name: 'flip', options: { boundary: 'clippingParents', padding: 8, fallbackPlacements: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] } },
  ],
};

// 自动检测是否处于 APP 视口模式 (优先检查 query，兼容会话记忆)
const isAppMode = computed(() => {
  if (route?.query?.layout === 'app') return true;
  if (route?.query?.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

const isAdmin = computed(() => authStore.isAdmin);
const isCitizen = computed(() => authStore.currentRole === 'citizen');

function formatTaskStatus(status) {
  if (!status) return '';
  const s = String(status).trim();
  if (s === '正常履约中' || s === 'Normal Progress' || s === 'قيد التوزيع الطبيعي' || s === 'لە جێبەجێکردنی ئاسایی') {
    return t('warehouse.statusNormalFulfilling') || (isEn.value ? 'Normal Progress' : '正常履约中');
  }
  if (s === '履约滞后预警' || s === 'Lag Alert' || s === 'تنبيه تأخير التوزيع' || s === 'هۆشداری دواکەوتن') {
    return t('warehouse.statusLagAlert') || (isEn.value ? 'Lag Alert' : '履约滞后预警');
  }
  if (s === '短缺风险预警' || s === 'Shortage Risk' || s === 'مخاطر نقص المخزون' || s === 'مەترسی کورتهێنان') {
    return t('warehouse.statusShortageRisk') || (isEn.value ? 'Shortage Risk' : '短缺风险预警');
  }
  if (s === '已完结' || s === 'Completed' || s === 'مكتمل' || s === 'تەواوکراو') {
    return t('warehouse.statusFinished') || (isEn.value ? 'Completed' : '已完结');
  }
  return status;
}

function formatItemName(name) {
  if (!name) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'Wheat Flour';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'Rice (Imported)';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'Vegetable Oil';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'Refined Sugar';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'Milk Powder';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'Black Tea';
  } else if (lang === 'ar') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'طحين الحنطة';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'أرز مستورد';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'زيت نباتي مكرر';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'سكر أبيض نقي';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'حليب مجفف';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'شاي أسود نخب';
  } else if (lang === 'ku') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'ئاردی گەنم';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'برنجی هاوردەکراو';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'ڕۆنی ڕووەکی پاڵاوتە';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'شەکری سپی';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'شیری وشککراو';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'چای ڕەش';
  }
  return name;
}

function formatTaskCenterName(name) {
  if (!name) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (name.includes('巴格达省配给运营总代理')) return 'Baghdad Provincial Ration General Operations Agency';
    if (name.includes('卡尔赫区区域代理运营部')) return 'Karkh District Regional Ration Operations Dept';
    if (name.includes('鲁萨法区区域代理运营部')) return 'Rusafa District Regional Ration Operations Dept';
    if (name.includes('卡尔赫第一配给中心综合代销站')) return 'Karkh 1st Ration Center Comprehensive Store (Mansour)';
    if (name.includes('亚尔穆克第3街道')) return 'Yarmouk 3rd Street Ration Service Station';
    if (name.includes('多拉区第12配给便民站')) return 'Dora 12th District Ration Station (Full Load)';
    if (name.includes('萨德尔城中央第5面粉代销网点')) return 'Sadr City Central 5th Flour Agency Outlet';
    if (name.includes('哈奈根第一边境综合代销保供站')) return 'Khanaqin 1st Border Supply Station (Art. 140)';
    if (name.includes('基尔库克城堡区第2保供代销中心')) return 'Kirkuk Citadel 2nd Ration Center (Art. 140)';
    if (name.includes('摩苏尔老城区区域代理配给调度中心')) return 'Mosul Old City Regional Ration Dispatch Center';
    if (name.includes('祖拜尔自贸港区便民配给保供网点')) return 'Zubair Free Port Community Supply Station';
    if (name.includes('曼苏尔商业区便民第6配给代销站')) return 'Mansour Commercial 6th Ration Agency';
    if (name.includes('费卢杰第1战略保供便民服务网点')) return 'Fallujah 1st Strategic Supply Service Station';
    if (name.includes('巴士拉阿舒尔港口直营代销联络处')) return 'Basra Ashur Port Direct Agency Office';
  } else if (lang === 'ar') {
    if (name.includes('巴格达省配给运营总代理')) return 'وكالة العمليات العامة للتموين بمحافظة بغداد';
    if (name.includes('卡尔赫区区域代理运营部')) return 'إدارة العمليات التموينية لمنطقة الكرخ';
    if (name.includes('鲁萨法区区域代理运营部')) return 'إدارة العمليات التموينية لمنطقة الرصافة';
    if (name.includes('卡尔赫第一配给中心综合代销站')) return 'منفذ الكرخ الأول لتوزيع التموين (المنصور)';
    if (name.includes('亚尔穆克第3街道')) return 'محطة تموين شارع اليرموك الثالثة';
    if (name.includes('多拉区第12配给便民站')) return 'محطة الدورة التموينية الثانية عشرة';
    if (name.includes('萨德尔城中央第5面粉代销网点')) return 'منفذ مدينة الصدر المركزي الخامس للطحين';
    if (name.includes('哈奈根第一边境综合代销保供站')) return 'محطة خانقين الأولى الحدودية (المادة 140)';
    if (name.includes('基尔库克城堡区第2保供代销中心')) return 'مركز قلعة كركوك الثاني للتموين (المادة 140)';
    if (name.includes('摩苏尔老城区区域代理配给调度中心')) return 'مركز توزيع تموين منطقة الموصل القديمة';
    if (name.includes('祖拜尔自贸港区便民配给保供网点')) return 'منفذ ميناء الزبير الحر للسلع التموينية';
    if (name.includes('曼苏尔商业区便民第6配给代销站')) return 'منفذ المنصور التجاري السادس للتموين';
    if (name.includes('费卢杰第1战略保供便民服务网点')) return 'منفذ الفلوجة الاستراتيجي الأول للتموين';
    if (name.includes('巴士拉阿舒尔港口直营代销联络处')) return 'مكتب الارتباط المباشر للتموين بميناء البصرة';
  } else if (lang === 'ku') {
    if (name.includes('巴格达省配给运营总代理')) return 'ئاژانسی گشتی ئۆپەراسیۆنەکانی پارێزگای بەغدا';
    if (name.includes('卡尔赫区区域代理运营部')) return 'بەشی ئۆپەراسیۆنی ناوچەیی کەرخ';
    if (name.includes('鲁萨法区区域代理运营部')) return 'بەشی ئۆپەراسیۆنی ناوچەیی ڕەسافە';
    if (name.includes('卡尔赫第一配给中心综合代销站')) return 'بنکەی یەکەمی دابەشکردنی کەرخ (مەنسوور)';
    if (name.includes('亚尔穆克第3街道')) return 'بنکەی گەڕەکی یەرموک ٣';
    if (name.includes('多拉区第12配给便民站')) return 'بنکەی دەورە ١٢';
    if (name.includes('萨德尔城中央第5面粉代销网点')) return 'بنکەی ئاردی شاری سەدر ٥';
    if (name.includes('哈奈根第一边境综合代销保供站')) return 'بنکەی سنووری خانەقین ١ (ماددەی ١٤٠)';
    if (name.includes('基尔库克城堡区第2保供代销中心')) return 'بنکەی قەڵای کەرکووک ٢ (ماددەی ١٤٠)';
    if (name.includes('摩苏尔老城区区域代理配给调度中心')) return 'ناوەندی بەشەخۆراکی کۆنەشاری موسڵ';
    if (name.includes('祖拜尔自贸港区便民配给保供网点')) return 'بنکەی بەندەری زوبەیر';
    if (name.includes('曼苏尔商业区便民第6配给代销站')) return 'بنکەی بازرگانی مەنسوور ٦';
    if (name.includes('费卢杰第1战略保供便民服务网点')) return 'بنکەی ستراتیژی فەلووجە ١';
    if (name.includes('巴士拉阿舒尔港口直营代销联络处')) return 'نووسینگەی بەندەری بەسرە';
  }
  return name;
}

function formatTaskResponsible(name) {
  if (!name) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (name.includes('穆罕默德·贾巴尔')) return name.includes('运营总监') ? 'Mohammed Jabbar Al-Rasheed (Director)' : 'Mohammed Jabbar Al-Rasheed (Owner)';
    if (name.includes('海德尔')) return 'Haider Fatih Najim (Regional Mgr)';
    if (name.includes('扎伊德')) return 'Zaid Qasim Al-Saadi (Regional Mgr)';
    if (name.includes('奥马尔')) return 'Omar Sabah Al-Nasir';
    if (name.includes('哈立德·瓦利德')) return 'Khalid Waleed Al-Dulaimi';
    if (name.includes('哈桑·阿里')) return 'Hassan Ali Al-Mousawi';
    if (name.includes('卡里姆')) return 'Karim Sadiq Kurdi';
    if (name.includes('阿兰·卡迪尔')) return 'Alan Qadir Barzanji';
    if (name.includes('尤尼斯')) return 'Younis Mahmoud Mousuli';
    if (name.includes('哈立德·阿卜杜勒')) return 'Khalid Abdul Rahman';
    if (name.includes('萨米·易卜拉欣')) return 'Sami Ibrahim Hashimi';
    if (name.includes('马尔万')) return 'Marwan Qasim Falluji';
    if (name.includes('贾西姆')) return 'Jasim Mohammed Basrawi';
  } else if (lang === 'ar') {
    if (name.includes('穆罕默德·贾巴尔')) return name.includes('运营总监') ? 'محمد جبار الرشيد (مدير العمليات)' : 'محمد جبار الرشيد (الوكيل المعتمد)';
    if (name.includes('海德尔')) return 'حيدر فالح نجم (مدير المنطقة)';
    if (name.includes('扎伊德')) return 'زيد قاسم السعدي (مدير المنطقة)';
    if (name.includes('奥马尔')) return 'عمر صباح الناصر';
    if (name.includes('哈立德·瓦利德')) return 'خالد وليد الدليمي';
    if (name.includes('哈桑·阿里')) return 'حسن علي الموسوي';
    if (name.includes('卡里姆')) return 'كريم صادق الكردي';
    if (name.includes('阿兰·卡迪尔')) return 'آلان قادر البرزنجي';
    if (name.includes('尤尼斯')) return 'يونس محمود الموصلي';
    if (name.includes('哈立德·阿卜杜勒')) return 'خالد عبد الرحمن';
    if (name.includes('萨米·易卜拉欣')) return 'سامي إبراهيم الهاشمي';
    if (name.includes('马尔万')) return 'مروان قاسم الفلوجي';
    if (name.includes('贾西姆')) return 'جاسم محمد البصراوي';
  } else if (lang === 'ku') {
    if (name.includes('穆罕默德·贾巴尔')) return name.includes('运营总监') ? 'محەممەد جەبار ڕەشید (بەڕێوەبەری ئۆپەراسیۆن)' : 'محەممەد جەبار ڕەشید';
    if (name.includes('海德尔')) return 'حەیدەر فاتیح نەجم';
    if (name.includes('扎伊德')) return 'زەید قاسم سەعدی';
    if (name.includes('奥马尔')) return 'عومەر سەباح ناسر';
    if (name.includes('哈立德·瓦利德')) return 'خالید وەلید دلێمی';
    if (name.includes('哈桑·阿里')) return 'حەسەن عەلی مووسەوی';
    if (name.includes('卡里姆')) return 'کەریم سادق کوردی';
    if (name.includes('阿兰·卡迪尔')) return 'ئالان قادر بەرزنجی';
    if (name.includes('尤尼斯')) return 'یونس مەحموود مووسڵی';
    if (name.includes('哈立德·阿卜杜勒')) return 'خالید عەبدولڕەحمان';
    if (name.includes('萨米·易卜拉欣')) return 'سامی ئیبراهیم هاشمی';
    if (name.includes('马尔万')) return 'مەروان قاسم فەلووجی';
    if (name.includes('贾西姆')) return 'جاسم محەممەد بەسراوی';
  }
  return name;
}

function formatPlanTitle(title) {
  if (!title) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (title.includes('第四季度') || title.includes('Q4')) return 'Q4 2026 National Strategic Grain & Oil Ration Plan';
    if (title.includes('第三季度') || title.includes('Q3')) return 'Q3 2026 Summer Strategic Food Ration Plan';
    if (title.includes('第二季度') || title.includes('Q2')) return 'Q2 2026 National Strategic Food Ration Plan';
    if (title.includes('第一季度') || title.includes('Q1')) return 'Q1 2026 National Strategic Food Ration Plan';
    if (title.includes('2026年10月')) return 'October 2026 National Strategic Ration Plan';
    if (title.includes('2026年09月') || title.includes('2026年9月')) return 'September 2026 National Strategic Ration Plan';
    if (title.includes('2026年11月')) return 'November 2026 National Strategic Ration Plan';
    if (title.includes('2026年12月')) return 'December 2026 National Strategic Ration Plan';
    if (title.includes('新增战略物资口粮保供计划')) return 'New Strategic Food Ration Supply Plan';
  } else if (lang === 'ar') {
    if (title.includes('第四季度') || title.includes('Q4')) return 'خطة التموين الاستراتيجية للربع الرابع 2026';
    if (title.includes('第三季度') || title.includes('Q3')) return 'خطة التموين الصيفية للربع الثالث 2026';
    if (title.includes('第二季度') || title.includes('Q2')) return 'خطة التموين الاستراتيجية للربع الثاني 2026';
    if (title.includes('第一季度') || title.includes('Q1')) return 'خطة التموين الاستراتيجية للربع الأول 2026';
    if (title.includes('2026年10月')) return 'خطة البطاقة التموينية الوطنية الاستراتيجية لشهر تشرين الأول 2026';
    if (title.includes('2026年09月') || title.includes('2026年9月')) return 'خطة البطاقة التموينية الوطنية الاستراتيجية لشهر أيلول 2026';
    if (title.includes('2026年11月')) return 'خطة البطاقة التموينية الوطنية الاستراتيجية لشهر تشرين الثاني 2026';
    if (title.includes('新增战略物资口粮保供计划')) return 'خطة إمدادات الحصص الاستراتيجية الجديدة';
  } else if (lang === 'ku') {
    if (title.includes('第四季度') || title.includes('Q4')) return 'پلانی بەشەخۆراکی وەرزی چوارەمی ٢٠٢٦';
    if (title.includes('第三季度') || title.includes('Q3')) return 'پلانی بەشەخۆراکی هاوینەی وەرزی سێیەمی ٢٠٢٦';
    if (title.includes('第二季度') || title.includes('Q2')) return 'پلانی بەشەخۆراکی وەرزی دووەمی ٢٠٢٦';
    if (title.includes('第一季度') || title.includes('Q1')) return 'پلانی بەشەخۆراکی وەرزی یەکەمی ٢٠٢٦';
    if (title.includes('2026年10月')) return 'پلانی ستراتیژی بەشەخۆراکی نیشتمانی بۆ تشرینی یەکەمی ٢٠٢٦';
    if (title.includes('2026年09月') || title.includes('2026年9月')) return 'پلانی ستراتیژی بەشەخۆراکی نیشتمانی بۆ ئەیلوولی ٢٠٢٦';
    if (title.includes('2026年11月')) return 'پلانی ستراتیژی بەشەخۆراکی نیشتمانی بۆ تشرینی دووەمی ٢٠٢٦';
    if (title.includes('新增战略物资口粮保供计划')) return 'پلانی نوێی بەشەخۆراکی ستراتیژی';
  } else {
    if (title.includes('Q4 2026')) return '2026年第四季度全员战略粮油口粮保供计划';
    if (title.includes('Q3 2026')) return '2026年第三季度夏季保供配给计划';
  }
  return title;
}

function formatPeriodName(period) {
  if (!period) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (period.includes('第3季度') || period.includes('第三季度') || period.includes('Q3')) return 'Q3 2026 (Jul - Sep)';
    if (period.includes('第4季度') || period.includes('第四季度') || period.includes('Q4')) return 'Q4 2026 (Oct - Dec)';
    if (period.includes('第1季度') || period.includes('第一季度') || period.includes('Q1')) return 'Q1 2026 (Jan - Mar)';
    if (period.includes('第2季度') || period.includes('第二季度') || period.includes('Q2')) return 'Q2 2026 (Apr - Jun)';
    if (period.includes('10月度') || period.includes('2026-10') || period.includes('2026年10月')) return 'October 2026';
    if (period.includes('09月度') || period.includes('9月度') || period.includes('2026-09') || period.includes('2026年09月')) return 'September 2026';
    if (period.includes('11月度') || period.includes('2026-11') || period.includes('2026年11月')) return 'November 2026';
    if (period.includes('12月度') || period.includes('2026-12') || period.includes('2026年12月')) return 'December 2026';
    if (period.includes('保供周期')) return '2026 Ration Cycle';
  } else if (lang === 'ar') {
    if (period.includes('第3季度') || period.includes('第三季度') || period.includes('Q3')) return 'الربع الثالث 2026 (تموز - أيلول)';
    if (period.includes('第4季度') || period.includes('第四季度') || period.includes('Q4')) return 'الربع الرابع 2026 (تشرين الأول - كانون الأول)';
    if (period.includes('第1季度') || period.includes('第一季度') || period.includes('Q1')) return 'الربع الأول 2026 (كانون الثاني - آذار)';
    if (period.includes('第2季度') || period.includes('第二季度') || period.includes('Q2')) return 'الربع الثاني 2026 (نيسان - حزيران)';
    if (period.includes('10月度') || period.includes('2026-10') || period.includes('2026年10月')) return 'دورة تشرين الأول 2026';
    if (period.includes('09月度') || period.includes('9月度') || period.includes('2026-09') || period.includes('2026年09月')) return 'دورة أيلول 2026';
    if (period.includes('11月度') || period.includes('2026-11') || period.includes('2026年11月')) return 'دورة تشرين الثاني 2026';
  } else if (lang === 'ku') {
    if (period.includes('第3季度') || period.includes('第三季度') || period.includes('Q3')) return 'وەرزی سێیەمی ٢٠٢٦ (تەمووز - ئەیلوول)';
    if (period.includes('第4季度') || period.includes('第四季度') || period.includes('Q4')) return 'وەرزی چوارەمی ٢٠٢٦ (تشرینی یەکەم - کانوونی یەکەم)';
    if (period.includes('第1季度') || period.includes('第一季度') || period.includes('Q1')) return 'وەرزی یەکەمی ٢٠٢٦ (کانوونی دووەم - ئازار)';
    if (period.includes('第2季度') || period.includes('第二季度') || period.includes('Q2')) return 'وەرزی دووەمی ٢٠٢٦ (نیسان - حوزەیران)';
    if (period.includes('10月度') || period.includes('2026-10') || period.includes('2026年10月')) return 'خولی تشرینی یەکەمی ٢٠٢٦';
    if (period.includes('09月度') || period.includes('9月度') || period.includes('2026-09') || period.includes('2026年09月')) return 'خولی ئەیلوولی ٢٠٢٦';
    if (period.includes('11月度') || period.includes('2026-11') || period.includes('2026年11月')) return 'خولی تشرینی دووەمی ٢٠٢٦';
  } else {
    if (period.includes('Q3 2026')) return '2026年第3季度 (7月-9月)';
    if (period.includes('Q4 2026')) return '2026年第4季度 (10月-12月)';
  }
  return period;
}

function formatPlanStatus(st) {
  if (!st) return '';
  const s = String(st).trim();
  const lang = locale.value;
  if (lang === 'en') {
    if (s === '执行中' || s === 'ACTIVE' || s === 'Active' || s === 'In Progress' || s === 'Active / In Progress') return 'Active';
    if (s === '已完成' || s === 'COMPLETED' || s === 'Completed') return 'Completed';
    if (s === '已完结归档' || s === '已归档' || s === '已完结' || s === 'ARCHIVED' || s === 'Archived') return 'Archived';
    if (s === '已排程' || s === '已完成三级代理排程' || s === '已自动分解排程' || s === 'SCHEDULED' || s === 'Auto-Scheduled') return 'Scheduled';
    if (s === '待排程' || s === '待下发' || s === '待分解排程' || s === '待三级代理排程' || s === 'PENDING' || s === 'Pending Schedule') return 'Pending Schedule';
  } else if (lang === 'ar') {
    if (s === '执行中' || s === 'ACTIVE' || s === 'Active' || s === 'In Progress' || s === 'Active / In Progress') return 'قيد التنفيذ';
    if (s === '已完成' || s === 'COMPLETED' || s === 'Completed') return 'مكتمل';
    if (s === '已完结归档' || s === '已归档' || s === '已完结' || s === 'ARCHIVED' || s === 'Archived') return 'مؤرشف';
    if (s === '已排程' || s === '已完成三级代理排程' || s === '已自动分解排程' || s === 'SCHEDULED' || s === 'Auto-Scheduled') return 'تمت الجدولة';
    if (s === '待排程' || s === '待下发' || s === '待分解排程' || s === '待三级代理排程' || s === 'PENDING' || s === 'Pending Schedule') return 'بانتظار الجدولة';
  } else if (lang === 'ku') {
    if (s === '执行中' || s === 'ACTIVE' || s === 'Active' || s === 'In Progress' || s === 'Active / In Progress') return 'لە جێبەجێکردندا';
    if (s === '已完成' || s === 'COMPLETED' || s === 'Completed') return 'تەواوکراو';
    if (s === '已完结归档' || s === '已归档' || s === '已完结' || s === 'ARCHIVED' || s === 'Archived') return 'ئەرشیڤکراو';
    if (s === '已排程' || s === '已完成三级代理排程' || s === '已自动分解排程' || s === 'SCHEDULED' || s === 'Auto-Scheduled') return 'خشتەکراو';
    if (s === '待排程' || s === '待下发' || s === '待分解排程' || s === '待三级代理排程' || s === 'PENDING' || s === 'Pending Schedule') return 'چاوەڕوانی خشتەکردن';
  } else {
    if (s === 'Active' || s === 'In Progress') return '执行中';
    if (s === 'Completed') return '已完成';
    if (s === 'Archived') return '已完结归档';
    if (s === 'Auto-Scheduled' || s === 'Scheduled') return '已完成排程';
    if (s === 'Pending Schedule') return '待排程';
  }
  return st;
}

function formatAgentLevel(item) {
  if (!item) return '';
  const level = typeof item === 'string' ? item : (item.agentLevel || '');
  const name = typeof item === 'object' ? (item.agentLevelName || '') : '';
  if (level === 'PROVINCE' || name.includes('省级') || name.toLowerCase().includes('provinc')) {
    return t('warehouse.levelProvince') || (isEn.value ? 'Provincial Agent' : '省级代理');
  }
  if (level === 'DISTRICT' || name.includes('区域') || name.toLowerCase().includes('district')) {
    return t('warehouse.levelDistrict') || (isEn.value ? 'District Agent' : '区域代理');
  }
  if (level === 'STREET' || name.includes('街道') || name.toLowerCase().includes('street') || name.toLowerCase().includes('local')) {
    return t('warehouse.levelStreet') || (isEn.value ? 'Local Station' : '街道代理');
  }
  return name || level;
}
const cardModalVisible = ref(false);
const liveCardClock = ref('');
let cardClockTimer = null;
const dynamicCardCode = ref('');

function openRationCardModal() {
  refreshDynamicCode();
  cardModalVisible.value = true;
  startCardClock();
}

function handleCardModalClosed() {
  if (cardClockTimer) {
    clearInterval(cardClockTimer);
    cardClockTimer = null;
  }
}

function refreshDynamicCode() {
  const stamp = Date.now().toString().slice(-4);
  const cardPart = (citizenFamilyInfo.value?.rationCardNo || 'RC-10029381').replace('RC-', '');
  dynamicCardCode.value = `VERIFY-${cardPart}-${stamp}`;
}

function startCardClock() {
  if (cardClockTimer) clearInterval(cardClockTimer);
  const updateTime = () => {
    const now = new Date();
    liveCardClock.value = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
  };
  updateTime();
  cardClockTimer = setInterval(updateTime, 100);
}

const plans = ref([]);
const tasks = ref([]);
const loading = ref(false);
const decomposing = ref(false);
const submitting = ref(false);

const citizenSelectedMonth = ref('2026-10');
const citizenFamilyInfo = computed(() => {
  return citizenStore.currentFamily || citizenStore.families[0] || {
    agentName: isEn.value ? 'Baghdad Karkh No.1 Station (Mohammed Jabbar)' : '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
    agentId: 'FA-00128',
    district: isEn.value ? 'Karkh No.1 Center (#04)' : '卡尔赫第一配给中心 (#04)',
    province: isEn.value ? 'Baghdad Governorate' : '巴格达省 (Baghdad)',
    rationCardNo: 'RC-10029381',
    headName: isEn.value ? 'Ahmed Hassan Saleh' : '艾哈迈德·哈桑·萨利赫',
    phone: '07701234567',
    memberCount: 4
  };
});

const memberCount = computed(() => citizenFamilyInfo.value?.memberCount || 4);

const citizenQuotaItems = computed(() => {
  const n = memberCount.value;
  return [
    {
      itemCode: 'RICE-02',
      itemName: isEn.value ? 'Premium Rice' : '精制大米',
      standardPerPerson: 3.0,
      totalHouseholdQuota: (3.0 * n).toFixed(1),
      guidePriceIQD: 1000,
      unit: 'KG',
      status: isEn.value ? 'Fully Allocated' : '本月已足额调配'
    },
    {
      itemCode: 'FLOUR-01',
      itemName: isEn.value ? 'Premium Flour' : '特级面粉',
      standardPerPerson: 9.0,
      totalHouseholdQuota: (9.0 * n).toFixed(1),
      guidePriceIQD: 750,
      unit: 'KG',
      status: isEn.value ? 'Fully Allocated' : '本月已足额调配'
    },
    {
      itemCode: 'OIL-03',
      itemName: isEn.value ? 'Edible Vegetable Oil' : '食用植物油',
      standardPerPerson: 1.0,
      totalHouseholdQuota: (1.0 * n).toFixed(1),
      guidePriceIQD: 2500,
      unit: 'L',
      status: isEn.value ? 'Fully Allocated' : '本月已足额调配'
    },
    {
      itemCode: 'SUGAR-04',
      itemName: isEn.value ? 'Refined White Sugar' : '纯精白糖',
      standardPerPerson: 1.0,
      totalHouseholdQuota: (1.0 * n).toFixed(1),
      guidePriceIQD: 1200,
      unit: 'KG',
      status: isEn.value ? 'Fully Allocated' : '本月已足额调配'
    }
  ];
});

// 筛选与分页
const taskSearch = ref('');
const taskLevelFilter = ref('');
const taskMonth = ref('2026-10');
const taskDateRange = ref(null);
const taskStatusFilter = ref('');
const taskCurrentPage = ref(1);
const taskPageSize = ref(5);

const activeTask = ref(null);
const drawerVisible = ref(false);
const createDialogVisible = ref(false);
const decomposeDialogVisible = ref(false);
const selectedDecomposePlanId = ref('');
const targetDecomposeMonth = ref('2026-10');

const newPlanForm = ref({
  planNo: '',
  title: '',
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  provinces: ['巴格达省', '巴士拉省', '尼尼微省', '迪亚拉省', '基尔库克省'],
  scope: '巴格达省、巴士拉省、尼尼微省、迪亚拉省、基尔库克省',
  riceQuota: 3.0,
  flourQuota: 9.0,
  oilQuota: 1.0,
  sugarQuota: 1.0
});

async function loadData() {
  loading.value = true;
  try {
    if (isCitizen.value) {
      await citizenStore.fetchFamilies();
    } else {
      const [plansData, tasksData] = await Promise.all([
        getRationPlanList(),
        getAgentAllocationTasks()
      ]);
      plans.value = plansData;
      tasks.value = tasksData;
      if (plansData && plansData.length > 0 && !selectedDecomposePlanId.value) {
        selectedDecomposePlanId.value = plansData[0].id;
      }
    }
  } catch (err) {
    ElMessage.error((isEnNow() ? 'Failed to load ration plan data' : '加载配给计划数据失败'));
  } finally {
    loading.value = false;
  }
}

// 筛选逻辑
const filteredTasks = computed(() => {
  return tasks.value.filter((t) => {
    const q = (taskSearch.value || '').trim().toLowerCase();
    const matchSearch =
      !q ||
      (t.taskNo && t.taskNo.toLowerCase().includes(q)) ||
      (t.centerName && t.centerName.toLowerCase().includes(q)) ||
      (t.targetCenter && t.targetCenter.toLowerCase().includes(q)) ||
      (t.responsiblePerson && t.responsiblePerson.toLowerCase().includes(q)) ||
      (t.agentCenterId && t.agentCenterId.toLowerCase().includes(q));

    const matchLevel = !taskLevelFilter.value || t.agentLevel === taskLevelFilter.value;

    const matchStatus =
      !taskStatusFilter.value ||
      t.taskStatus === taskStatusFilter.value ||
      t.status === taskStatusFilter.value;

    let matchDate = true;
    if (taskDateRange.value && taskDateRange.value.length === 2) {
      const [start, end] = taskDateRange.value;
      const tStart = t.scheduleStartDate || '2026-10-01';
      const tEnd = t.scheduleEndDate || '2026-10-31';
      matchDate = tStart >= start && tEnd <= end;
    } else if (taskMonth.value) {
      matchDate =
        (t.periodMonth && t.periodMonth === taskMonth.value) ||
        (t.scheduleStartDate && t.scheduleStartDate.startsWith(taskMonth.value));
    }

    return matchSearch && matchLevel && matchStatus && matchDate;
  });
});

const paginatedTasks = computed(() => {
  const start = (taskCurrentPage.value - 1) * taskPageSize.value;
  return filteredTasks.value.slice(start, start + taskPageSize.value);
});

function handleMonthChange() {
  taskDateRange.value = null;
  resetTaskPage();
}

function handleDateRangeChange() {
  taskMonth.value = '';
  resetTaskPage();
}

function resetTaskPage() {
  taskCurrentPage.value = 1;
}

function resetTaskFilters() {
  taskSearch.value = '';
  taskLevelFilter.value = '';
  taskMonth.value = '2026-10';
  taskDateRange.value = null;
  taskStatusFilter.value = '';
  resetTaskPage();
}

function handleViewTask(row) {
  activeTask.value = row;
  drawerVisible.value = true;
}

// 自动排程弹窗
function openDecomposeDialog() {
  if (plans.value && plans.value.length > 0) {
    selectedDecomposePlanId.value = plans.value[0].id;
    targetDecomposeMonth.value = plans.value[0].periodMonth || '2026-10';
  }
  decomposeDialogVisible.value = true;
}

function handlePlanSelectChange(val) {
  const plan = plans.value.find((p) => p.id === val);
  if (plan) {
    targetDecomposeMonth.value = plan.periodMonth || '2026-10';
  }
}

async function submitAutoDecompose() {
  decomposing.value = true;
  try {
    const selectedPlan = plans.value.find((p) => p.id === selectedDecomposePlanId.value) || plans.value[0];
    await decomposePlanToAgents({
      planId: selectedPlan?.id,
      planNo: selectedPlan?.planNo,
      targetMonth: targetDecomposeMonth.value
    });
    ElMessage.success(
      `系统已成功依据贸易部【${selectedPlan?.title}】及三级代理架构签约户数，自动完成 ${targetDecomposeMonth.value} 月度配额排程！`
    );
    decomposeDialogVisible.value = false;
    taskMonth.value = targetDecomposeMonth.value;
    await loadData();
  } catch (err) {
    ElMessage.error((isEnNow() ? 'Automatic breakdown scheduling failed' : '自动分解排程失败'));
  } finally {
    decomposing.value = false;
  }
}

// 创建计划
function openCreatePlanDialog() {
  const nextMonthNum = 11;
  newPlanForm.value.planNo = `PLAN-2026-${nextMonthNum}-001`;
  newPlanForm.value.title = `2026年${nextMonthNum}月全国战略口粮月度保供计划`;
  createDialogVisible.value = true;
}

async function submitCreatePlan() {
  if (!newPlanForm.value.title) {
    ElMessage.warning((isEnNow() ? 'Please fill in the plan name' : '请填写计划名称'));
    return;
  }
  newPlanForm.value.scope = newPlanForm.value.provinces?.length
    ? newPlanForm.value.provinces.join('、')
    : '全国所有省市';
  submitting.value = true;
  try {
    await createRationPlan({ ...newPlanForm.value });
    ElMessage.success((isEnNow() ? 'Monthly material ration plan signed and issued successfully!' : '成功签署并下发月度物资配给计划！'));
    createDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error((isEnNow() ? 'Plan creation failed' : '创建计划失败'));
  } finally {
    submitting.value = false;
  }
}

defineExpose({
  loadData
});

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  if (cardClockTimer) {
    clearInterval(cardClockTimer);
    cardClockTimer = null;
  }
});
</script>

<style scoped>
:deep(.el-table .cell) {
  padding: 6px 8px;
}

@keyframes scanCardQrAnimation {
  0% {
    top: 5%;
    opacity: 0.8;
  }
  50% {
    top: 90%;
    opacity: 1;
  }
  100% {
    top: 5%;
    opacity: 0.8;
  }
}

.animate-scan-card-qr {
  animation: scanCardQrAnimation 2s ease-in-out infinite;
}

:deep(.citizen-card-verify-dialog) {
  border-radius: 18px !important;
  overflow: hidden !important;
}

:deep(.citizen-card-verify-dialog .el-dialog__body) {
  padding: 12px 14px 16px !important;
  max-height: 86vh;
  overflow-y: auto;
}
</style>
