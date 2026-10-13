<template>
  <div class="ration-plan-tab space-y-5">
    <!-- 顶部快捷操作栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 gap-2.5">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-800">
          {{
            isCitizen
              ? ($t('warehouse.citizenTitle') || '配给管理与履约交付跟进')
              : isAdmin
              ? ($t('warehouse.adminTitle') || '国家物资配给计划制定与调度中心')
              : '月度配给计划与三级代理配额排程中心'
          }}
        </span>
        <el-tag size="small" type="primary" effect="plain">
          {{ isCitizen ? '个人月度份额' : '三级代理自动核算' }}
        </el-tag>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 上级代理根据贸易部计划生成自己和下级代理的月度配给计划 (省级/区域/街道三层，按户数自动分配，不能手动分配) -->
        <el-button v-if="!isCitizen" type="success" size="small" @click="openDecomposeDialog">
          <el-icon class="mr-1"><Share /></el-icon>
          <span>依据贸易部计划生成月度排程</span>
        </el-button>
        <el-button v-if="isAdmin" type="primary" size="small" @click="openCreatePlanDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          <span>制定贸易部总计划</span>
        </el-button>
        <el-button size="small" @click="loadData">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ $t('common.refresh') || '刷新' }}
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 1. 公民专属视角：显示和自己家庭相关的签约代理网点及每月配给额度 -->
    <!-- ======================================================== -->
    <div v-if="isCitizen" class="space-y-4">
      <div class="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 rounded-2xl p-5 border border-blue-200/80 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100/80 pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <el-icon><Shop /></el-icon>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-slate-900">
                  {{ citizenFamilyInfo?.agentName || (isEn ? 'Baghdad Karkh No.1 Station (Mohammed Jabbar)' : '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)') }}
                </h3>
                <el-tag size="small" type="success" effect="dark" class="font-bold">{{ $t('warehouse.contractedAgent') || '签约保供代销站' }}</el-tag>
              </div>
              <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono flex-wrap">
                <span>{{ $t('warehouse.agentIdLabel') || '代理站编号' }}: {{ citizenFamilyInfo?.agentId || 'FA-00128' }}</span>
                <span>·</span>
                <span>{{ $t('warehouse.centerLabel') || '配给中心' }}: {{ citizenFamilyInfo?.district || (isEn ? 'Karkh No.1 Center (#04)' : '卡尔赫第一配给中心 (#04)') }}</span>
                <span>·</span>
                <span>{{ $t('warehouse.provinceLabel') || '省份' }}: {{ citizenFamilyInfo?.province || (isEn ? 'Baghdad Governorate' : '巴格达省 (Baghdad)') }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 whitespace-nowrap">{{ $t('warehouse.periodLabel') || '配给月份' }}:</span>
            <el-date-picker
              v-model="citizenSelectedMonth"
              type="month"
              value-format="YYYY-MM"
              placeholder="选择月份"
              size="small"
              class="!w-32"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div class="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs space-y-0.5">
            <span class="text-slate-400 text-[11px]">{{ $t('citizen.rationCardNo') || '家庭配给卡号' }}</span>
            <div class="font-mono font-bold text-blue-600">{{ citizenFamilyInfo?.rationCardNo || 'RC-10029381' }}</div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs space-y-0.5">
            <span class="text-slate-400 text-[11px]">{{ $t('warehouse.registeredMembers') || '登记人口' }}</span>
            <div class="font-bold text-slate-800">{{ citizenFamilyInfo?.headName || (isEn ? 'Ahmed Hassan' : '艾哈迈德·哈桑') }} ({{ memberCount }} 人)</div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs space-y-0.5">
            <span class="text-slate-400 text-[11px]">本月指导配额限价总值</span>
            <div class="font-mono font-bold text-amber-600">{{ (memberCount * 13450).toLocaleString() }} IQD</div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs space-y-0.5">
            <span class="text-slate-400 text-[11px]">{{ $t('warehouse.stockStatus') || '代销站备货状态' }}</span>
            <div class="font-bold text-emerald-600 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>现货在店 · 随时可提</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <el-icon class="text-blue-600"><Goods /></el-icon>
            <span>{{ citizenSelectedMonth }} 月度家庭口粮配给份额明细</span>
          </h4>
          <span class="text-[11px] text-slate-400 font-mono">
            国家官方指导平价限价保供机制
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            v-for="item in citizenQuotaItems"
            :key="item.itemCode"
            class="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
          >
            <div class="flex items-start justify-between">
              <div>
                <span class="text-sm font-bold text-slate-900 block">{{ item.itemName }}</span>
                <span class="text-[11px] text-slate-400">标准: {{ item.standardPerPerson }} {{ item.unit }}/人/月</span>
              </div>
              <el-tag size="small" type="success" effect="plain" class="font-bold">
                {{ item.status }}
              </el-tag>
            </div>

            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span class="text-[11px] text-slate-500">本户月度核定配额：</span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl font-bold font-mono text-blue-600">{{ item.totalHouseholdQuota }}</span>
                <span class="text-xs text-slate-600 font-bold">{{ item.unit }}</span>
              </div>
              <div class="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-200/50">
                <span>官方指导限价:</span>
                <span class="font-mono text-slate-600">{{ item.guidePriceIQD }} IQD/{{ item.unit }}</span>
              </div>
            </div>

            <div class="text-[11px] text-slate-500 space-y-1">
              <div class="flex justify-between">
                <span>签约代销网点：</span>
                <span class="font-medium text-slate-700 truncate max-w-[130px]">{{ citizenFamilyInfo?.agentName?.split(' ')[0] || '卡尔赫第一代销站' }}</span>
              </div>
              <div class="flex justify-between">
                <span>到货与交付：</span>
                <span class="font-bold text-emerald-600">已入库待核销 ({{ item.totalHouseholdQuota }} {{ item.unit }})</span>
              </div>
              <div class="flex justify-between">
                <span>指导折算金额：</span>
                <span class="font-mono font-bold text-amber-700">{{ (Number(item.totalHouseholdQuota) * item.guidePriceIQD).toLocaleString() }} IQD</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-0.5">
            <span class="font-bold block">核销提货指引：</span>
            <span>请户主或代领人持本人配给卡（实体卡或电子卡凭证）至签约代销站扫码核销即可全额领取。</span>
          </div>
          <el-button type="warning" size="small" class="shrink-0 font-bold" @click="$router.push('/citizen')">
            出示我的配给卡
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 管理角色与代理商视角：贸易部月度总计划与各级排程任务单 -->
    <!-- ======================================================== -->
    <div v-else class="space-y-6">
      <!-- 贸易部月度配给总计划卡片 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <el-icon class="text-blue-600"><Calendar /></el-icon>
            <span>贸易部战略口粮月度物资配给总计划 (SCM / BPM)</span>
          </h3>
          <span class="text-[11px] text-slate-400">
            按月下发 · 依据签约户数自动排程 · 实行国家保供指导限价
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="p-4.5 rounded-2xl border transition-all space-y-3"
            :class="plan.status === '执行中' ? 'bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border-blue-200 shadow-xs' : 'bg-white border-slate-200'"
          >
            <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-bold text-slate-900 text-sm">{{ plan.title }}</span>
                  <el-tag size="small" :type="plan.status === '执行中' ? 'success' : plan.status === '已完成' ? 'info' : 'warning'" effect="dark">
                    {{ plan.status }}
                  </el-tag>
                </div>
                <div class="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                  <span>编号: {{ plan.planNo }}</span>
                  <span>·</span>
                  <span>周期: {{ plan.periodName }}</span>
                </div>
              </div>
              <el-tag size="small" type="primary" effect="plain" class="shrink-0 text-[10px]">
                {{ plan.allocationStatus }}
              </el-tag>
            </div>

            <!-- 目标指标网格 -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <span class="text-slate-400 text-[10px] block">全国保供家庭</span>
                <span class="font-mono font-bold text-slate-800 text-xs">{{ plan.targetHouseholds.toLocaleString() }} 户</span>
              </div>
              <div class="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <span class="text-slate-400 text-[10px] block">月度保供总重</span>
                <span class="font-mono font-bold text-blue-600 text-xs">{{ (plan.overallProgress?.totalPlanWeightTon || 0).toLocaleString() }} 吨</span>
              </div>
            </div>

            <!-- 月度人均配额与国家保供指导价格标准 -->
            <div class="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-700 text-[11px]">口粮配额与国家指导限价：</span>
                <span class="text-[10px] font-mono font-bold text-amber-700">标准户: 53,800 IQD/月</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5">
                <div
                  v-for="q in plan.quotaStandards"
                  :key="q.itemCode"
                  class="bg-white px-2 py-1 rounded border border-slate-200/60 flex items-center justify-between text-[11px]"
                >
                  <span class="text-slate-600 truncate mr-1">{{ q.itemName }}</span>
                  <div class="text-right shrink-0">
                    <span class="font-mono font-bold text-slate-900 block">{{ q.quotaPerPerson }} {{ q.unit.split('/')[0] }}</span>
                    <span class="text-[9px] text-amber-600 font-mono">{{ q.guidePriceIQD }} IQD</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 执行进度条 -->
            <div class="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-slate-500">履约全链路进度：</span>
                <span class="text-emerald-600 font-bold">家庭核销: {{ plan.overallProgress?.claimedRate || 0 }}%</span>
              </div>
              <el-progress
                :percentage="plan.overallProgress?.claimedRate || 0"
                :stroke-width="8"
                color="#10b981"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 网格配额分解与排程任务单列表 (三级代理层级架构) -->
      <!-- ======================================================== -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <el-icon class="text-indigo-600"><Shop /></el-icon>
              <span>代理中心网格配额分解与月度排程任务单</span>
            </h3>
            <el-tag size="small" type="info" effect="plain" class="text-[11px]">
              省级 / 区域 / 街道三级联动
            </el-tag>
          </div>
          <span class="text-[11px] text-slate-400">
            共查询到 <strong class="text-slate-800">{{ filteredTasks.length }}</strong> 笔任务排程单
          </span>
        </div>

        <!-- 多维度与日期查询栏 -->
        <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
          <div class="flex flex-wrap items-center gap-2.5">
            <el-input
              v-model="taskSearch"
              placeholder="搜索任务单号 / 代理网点 / 负责人"
              clearable
              size="small"
              class="max-w-xs"
              @input="resetTaskPage"
            >
              <template #prefix>
                <el-icon class="text-slate-400"><Search /></el-icon>
              </template>
            </el-input>

            <!-- 代理层级快捷筛选 -->
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <span>代理层级:</span>
              <el-select
                v-model="taskLevelFilter"
                placeholder="全部层级"
                clearable
                size="small"
                class="!w-28"
                @change="resetTaskPage"
              >
                <el-option label="全部层级" value="" />
                <el-option label="省级代理" value="PROVINCE" />
                <el-option label="区域代理" value="DISTRICT" />
                <el-option label="街道代理" value="STREET" />
              </el-select>
            </div>

            <!-- 月份周期筛选 (默认按月查询，可手动切换) -->
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <span>月份周期:</span>
              <el-date-picker
                v-model="taskMonth"
                type="month"
                value-format="YYYY-MM"
                placeholder="默认按月查询"
                size="small"
                class="!w-32"
                @change="handleMonthChange"
              />
            </div>

            <!-- 精确日期范围选择 -->
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <span>精确日期:</span>
              <el-date-picker
                v-model="taskDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                class="!w-56"
                @change="handleDateRangeChange"
              />
            </div>

            <!-- 状态筛选 -->
            <el-select
              v-model="taskStatusFilter"
              placeholder="履约状态"
              clearable
              size="small"
              class="!w-28"
              @change="resetTaskPage"
            >
              <el-option label="正常履约中" value="正常履约中" />
              <el-option label="履约滞后预警" value="履约滞后预警" />
              <el-option label="短缺风险预警" value="短缺风险预警" />
              <el-option label="已完结" value="已完结" />
            </el-select>

            <el-button size="small" link type="primary" @click="resetTaskFilters">重置</el-button>
          </div>
        </div>

        <!-- 任务单表格 (增加指导价格、三级层级Tag、服务户数与总货值) -->
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <el-table :data="paginatedTasks" v-loading="loading" border style="width: 100%" class="text-xs">
            <!-- 1. 排程编号 -->
            <el-table-column prop="taskNo" label="排程任务编号" min-width="165">
              <template #default="{ row }">
                <span class="font-mono font-bold text-blue-700 block">{{ row.taskNo }}</span>
                <div class="text-[10px] text-slate-400 font-mono">{{ row.planNo }}</div>
                <div class="text-[10px] text-slate-500 font-mono">{{ row.periodMonth }} 月度</div>
              </template>
            </el-table-column>

            <!-- 2. 代理层级与网点名称 -->
            <el-table-column label="代理层级 / 目标网点" min-width="210">
              <template #default="{ row }">
                <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                  <el-tag
                    size="small"
                    :type="row.agentLevel === 'PROVINCE' ? 'danger' : row.agentLevel === 'DISTRICT' ? 'primary' : 'success'"
                    effect="dark"
                    class="font-bold scale-90"
                  >
                    {{ row.agentLevelName || (row.agentLevel === 'PROVINCE' ? '省级代理' : row.agentLevel === 'DISTRICT' ? '区域代理' : '街道代理') }}
                  </el-tag>
                  <span v-if="row.isSelf" class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                    本人直营
                  </span>
                  <span v-if="row.isArticle140" class="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                    第140号争议区
                  </span>
                </div>
                <div class="font-bold text-slate-800 text-xs">{{ row.centerName }}</div>
                <div class="text-[10px] text-slate-400">
                  负责人: {{ row.responsiblePerson || row.ownerName || '代销主管' }} · 代码: {{ row.agentCenterId }}
                </div>
              </template>
            </el-table-column>

            <!-- 3. 服务签约户数 (算法基准) -->
            <el-table-column label="服务签约户数 / 人口" min-width="145" align="center">
              <template #default="{ row }">
                <div class="font-mono font-bold text-slate-900 text-sm">
                  {{ (row.registeredHouseholds || 0).toLocaleString() }} <span class="text-xs font-normal text-slate-500">户</span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono">
                  覆盖人口: {{ (row.coveredCitizens || row.registeredHouseholds * 4 || 0).toLocaleString() }} 人
                </div>
                <div class="text-[9px] text-emerald-600 mt-0.5">
                  算法根据户数锁定分配
                </div>
              </template>
            </el-table-column>

            <!-- 4. 国家保供指导限价与总货值 -->
            <el-table-column label="国家保供指导总货值" min-width="170">
              <template #default="{ row }">
                <div class="font-mono font-bold text-amber-700 text-sm">
                  {{ (row.totalGuideAmountIQD || row.registeredHouseholds * 53800 || 0).toLocaleString() }} <span class="text-[10px] font-sans">IQD</span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono">
                  户均保供基准: 53,800 IQD/户
                </div>
                <div class="text-[9px] text-slate-400">
                  米 1000 · 面 750 · 油 2500 · 糖 1200
                </div>
              </template>
            </el-table-column>

            <!-- 5. 排程配送物资与配额 (按户数自动分配) -->
            <el-table-column label="排程保供物资与配额明细" min-width="230">
              <template #default="{ row }">
                <div class="space-y-1">
                  <div
                    v-for="item in (row.items || []).slice(0, 3)"
                    :key="item.itemCode"
                    class="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
                  >
                    <span class="text-slate-600 truncate">{{ item.itemName }}</span>
                    <div class="font-mono text-right shrink-0">
                      <span class="font-bold text-slate-800">{{ item.allocatedQtyTon ? item.allocatedQtyTon + ' 吨' : (item.plannedQty?.toLocaleString() + ' ' + item.unit) }}</span>
                      <span class="text-[9px] text-amber-600 block">限价: {{ item.guidePriceIQD || (item.itemCode.includes('RICE') ? 1000 : 750) }} IQD</span>
                    </div>
                  </div>
                  <div v-if="row.items && row.items.length > 3" class="text-[10px] text-slate-400 text-right">
                    等共 {{ row.items.length }} 种战略保供物资...
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 6. 计划起止与交接期 -->
            <el-table-column prop="scheduleDate" label="执行起止周期" min-width="145">
              <template #default="{ row }">
                <div class="font-mono text-slate-700 text-[11px]">
                  {{ row.scheduleStartDate || '2026-10-01' }}
                </div>
                <div class="font-mono text-slate-400 text-[10px]">
                  至 {{ row.scheduleEndDate || '2026-10-31' }}
                </div>
                <div class="text-[10px] text-blue-600 font-mono">
                  排程交付: {{ row.scheduledDeliveryDate || '2026-10-15' }}
                </div>
              </template>
            </el-table-column>

            <!-- 7. 任务状态 -->
            <el-table-column prop="taskStatus" label="履约状态" width="115" align="center">
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
                  {{ row.taskStatus || row.status }}
                </el-tag>
                <div v-if="row.riskReason" class="text-[9px] text-red-500 truncate max-w-[100px] mt-0.5" :title="row.riskReason">
                  {{ row.riskReason }}
                </div>
              </template>
            </el-table-column>

            <!-- 8. 操作 -->
            <el-table-column label="操作" width="110" align="center" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="handleViewTask(row)">
                  全链详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 -->
          <div class="p-3 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
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
        <div class="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 space-y-1">
          <div class="font-bold flex items-center gap-1.5 text-blue-800">
            <el-icon class="text-blue-600"><Check /></el-icon>
            <span>系统硬性约束：基于三级代理架构与签约实名家庭户数自动核算</span>
          </div>
          <div class="text-[11px] leading-relaxed text-blue-700">
            代理体系涵盖<strong>省级代理（宏观统筹） $\rightarrow$ 区域代理（区级调度） $\rightarrow$ 街道代理（终端门店）</strong>三层。
            各级配额严格根据网点实名挂靠的<strong>签约户数（户数 × 4人/户 × 国家月度配额指标）</strong>由系统公式自动分配，
            <strong>严禁人工干预或手动调整输入</strong>，确保战略物资与指导限价精准透传到户，杜绝克扣截留！
          </div>
        </div>

        <!-- 计划与月份选择 -->
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="font-bold text-slate-700 block mb-1">选择贸易部月度总计划：</span>
              <el-select v-model="selectedDecomposePlanId" class="w-full" size="small" @change="handlePlanSelectChange">
                <el-option
                  v-for="p in plans"
                  :key="p.id"
                  :label="`${p.title} (${p.periodName})`"
                  :value="p.id"
                />
              </el-select>
            </div>
            <div>
              <span class="font-bold text-slate-700 block mb-1">目标排程月份周期：</span>
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

          <div class="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200/60 font-mono">
            <span>国家保供指导限价标准：</span>
            <span class="text-amber-700 font-bold">大米 1000 IQD · 面粉 750 IQD · 食用油 2500 IQD · 白糖 1200 IQD</span>
          </div>
        </div>

        <!-- 三级代理层级自动分配测算预览列表 (只读，公式锁定) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800">三级代理层级自动排程测算预览 (系统公式锁定计算，不可篡改)：</span>
            <span class="text-[11px] text-slate-400">共将生成 8 个层级排程单据</span>
          </div>

          <div class="max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="p-2">层级</th>
                  <th class="p-2">代理网点 / 负责人</th>
                  <th class="p-2 text-center">核定签约户数</th>
                  <th class="p-2 text-right">自动核算大米/面粉(吨)</th>
                  <th class="p-2 text-right">指导总货值(IQD)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-mono">
                <!-- 1. 省级代理 -->
                <tr class="bg-purple-50/40">
                  <td class="p-2">
                    <el-tag size="small" type="danger" effect="dark" class="scale-90 font-sans">省级代理</el-tag>
                  </td>
                  <td class="p-2 font-sans font-bold text-slate-800">
                    巴格达省配给运营总代理 (穆罕默德·贾巴尔)
                  </td>
                  <td class="p-2 text-center font-bold text-slate-900">7,650 户</td>
                  <td class="p-2 text-right text-blue-700">91.8 吨 / 275.4 吨</td>
                  <td class="p-2 text-right font-bold text-amber-700">411,570,000</td>
                </tr>
                <!-- 2. 区域代理 -->
                <tr class="bg-blue-50/30">
                  <td class="p-2">
                    <el-tag size="small" type="primary" effect="dark" class="scale-90 font-sans">区域代理</el-tag>
                  </td>
                  <td class="p-2 font-sans text-slate-800">
                    卡尔赫区区域代理运营部 (海德尔·法蒂赫)
                  </td>
                  <td class="p-2 text-center font-bold text-slate-900">4,100 户</td>
                  <td class="p-2 text-right text-blue-700">49.2 吨 / 147.6 吨</td>
                  <td class="p-2 text-right font-bold text-amber-700">220,580,000</td>
                </tr>
                <tr class="bg-blue-50/30">
                  <td class="p-2">
                    <el-tag size="small" type="primary" effect="dark" class="scale-90 font-sans">区域代理</el-tag>
                  </td>
                  <td class="p-2 font-sans text-slate-800">
                    鲁萨法区区域代理运营部 (扎伊德·卡西姆)
                  </td>
                  <td class="p-2 text-center font-bold text-slate-900">3,550 户</td>
                  <td class="p-2 text-right text-blue-700">42.6 吨 / 127.8 吨</td>
                  <td class="p-2 text-right font-bold text-amber-700">190,990,000</td>
                </tr>
                <!-- 3. 街道代理网点 -->
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">街道代理</el-tag>
                  </td>
                  <td class="p-2 font-sans text-slate-700">
                    卡尔赫第一配给中心综合代销站 (曼苏尔)
                  </td>
                  <td class="p-2 text-center font-bold text-slate-800">1,120 户</td>
                  <td class="p-2 text-right text-blue-700">13.4 吨 / 40.3 吨</td>
                  <td class="p-2 text-right text-amber-700">60,256,000</td>
                </tr>
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">街道代理</el-tag>
                  </td>
                  <td class="p-2 font-sans text-slate-700">
                    亚尔穆克第3街道便民配给站 (奥马尔)
                  </td>
                  <td class="p-2 text-center font-bold text-slate-800">1,480 户</td>
                  <td class="p-2 text-right text-blue-700">17.8 吨 / 53.3 吨</td>
                  <td class="p-2 text-right text-amber-700">79,624,000</td>
                </tr>
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">街道代理</el-tag>
                  </td>
                  <td class="p-2 font-sans text-slate-700">
                    多拉区第12配给便民站 (哈立德·瓦利德)
                  </td>
                  <td class="p-2 text-center font-bold text-slate-800">1,500 户</td>
                  <td class="p-2 text-right text-blue-700">18.0 吨 / 54.0 吨</td>
                  <td class="p-2 text-right text-amber-700">80,700,000</td>
                </tr>
                <tr>
                  <td class="p-2">
                    <el-tag size="small" type="success" effect="dark" class="scale-90 font-sans">街道代理</el-tag>
                  </td>
                  <td class="p-2 font-sans text-slate-700">
                    哈奈根第一边境综合代销保供站 (第140号区)
                  </td>
                  <td class="p-2 text-center font-bold text-slate-800">890 户</td>
                  <td class="p-2 text-right text-blue-700">10.7 吨 / 32.0 吨</td>
                  <td class="p-2 text-right text-amber-700">47,882,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-between w-full">
          <span class="text-[11px] text-slate-400 font-mono">
            分配算法：户数 × 4人 × 月度标准配额指标 (只读锁定)
          </span>
          <div class="flex items-center gap-2">
            <el-button @click="decomposeDialogVisible = false">取消</el-button>
            <el-button type="success" :loading="decomposing" @click="submitAutoDecompose">
              确认并自动生成三级配额排程单
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 制定贸易部配给新总计划对话框 (管理角色专属) -->
    <el-dialog v-model="createDialogVisible" title="制定并下发贸易部物资配给月度总计划 (SCM / BPM)" width="640px" destroy-on-close>
      <el-form :model="newPlanForm" label-width="130px" class="space-y-3 text-xs">
        <el-form-item label="计划编号" required>
          <el-input v-model="newPlanForm.planNo" placeholder="如 PLAN-2026-11-001" />
        </el-form-item>
        <el-form-item label="计划标题名称" required>
          <el-input v-model="newPlanForm.title" placeholder="如 2026年11月全国战略口粮保供计划" />
        </el-form-item>
        <el-form-item label="月度周期起止" required>
          <div class="flex items-center gap-2 w-full">
            <el-date-picker v-model="newPlanForm.startDate" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" class="w-full" />
            <span class="text-slate-400">至</span>
            <el-date-picker v-model="newPlanForm.endDate" type="date" value-format="YYYY-MM-DD" placeholder="截止日期" class="w-full" />
          </div>
        </el-form-item>
        <el-form-item label="保供对象范围" required>
          <el-input v-model="newPlanForm.scope" placeholder="如 全国18省全域 (重点倾斜第140号决议区)" />
        </el-form-item>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-slate-700 text-xs">人均标准配额与国家指导限价：</span>
            <span class="text-[11px] text-amber-700 font-mono">标准户总额: 53,800 IQD/户</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <span class="text-[11px] text-slate-500">精制大米 (KG/人, 1,000 IQD)</span>
              <el-input-number v-model="newPlanForm.riceQuota" :min="1" :max="10" :precision="1" size="small" class="w-full mt-1" />
            </div>
            <div>
              <span class="text-[11px] text-slate-500">特级面粉 (KG/人, 750 IQD)</span>
              <el-input-number v-model="newPlanForm.flourQuota" :min="1" :max="20" :precision="1" size="small" class="w-full mt-1" />
            </div>
            <div>
              <span class="text-[11px] text-slate-500">食用植物油 (L/人, 2,500 IQD)</span>
              <el-input-number v-model="newPlanForm.oilQuota" :min="0.5" :max="5" :precision="1" size="small" class="w-full mt-1" />
            </div>
            <div>
              <span class="text-[11px] text-slate-500">纯精白糖 (KG/人, 1,200 IQD)</span>
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
        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-slate-900 font-mono">{{ activeTask.taskNo }}</span>
            <el-tag
              size="small"
              :type="activeTask.agentLevel === 'PROVINCE' ? 'danger' : activeTask.agentLevel === 'DISTRICT' ? 'primary' : 'success'"
              effect="dark"
            >
              {{ activeTask.agentLevelName || '街道代理' }}
            </el-tag>
          </div>
          <div class="text-slate-500 font-mono text-[11px]">所属贸易部计划: {{ activeTask.planNo }}</div>
          <div class="text-slate-500 font-mono text-[11px]">排程月度周期: {{ activeTask.periodMonth }}</div>
        </div>

        <!-- 刚性算法分配约束提示 -->
        <div class="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900 space-y-1">
          <div class="font-bold flex items-center gap-1">
            <el-icon><Check /></el-icon>
            <span>算法原子分配公式 (严禁手动修改)：</span>
          </div>
          <div class="font-mono text-[11px] text-blue-800">
            {{ activeTask.autoAllocatedFormula || `签约户数 ${(activeTask.registeredHouseholds || 0).toLocaleString()} 户 × 4人/户 × 国家月度保供配额指标` }}
          </div>
        </div>

        <!-- 受援代理网点信息 -->
        <div class="space-y-2">
          <span class="font-bold text-slate-700">代理网点基本档案：</span>
          <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">网点名称:</span>
              <span class="font-bold text-slate-800">{{ activeTask.centerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">代销编码:</span>
              <span class="font-mono text-slate-700">{{ activeTask.agentCenterId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">负责人:</span>
              <span class="text-slate-800 font-medium">{{ activeTask.responsiblePerson || activeTask.ownerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">签约户籍户数:</span>
              <span class="font-mono font-bold text-blue-700">{{ (activeTask.registeredHouseholds || 0).toLocaleString() }} 户</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">覆盖受益人口:</span>
              <span class="font-mono text-slate-800">{{ (activeTask.coveredCitizens || activeTask.registeredHouseholds * 4 || 0).toLocaleString() }} 人</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-slate-100">
              <span class="text-slate-400">国家保供指导总货值:</span>
              <span class="font-mono font-bold text-amber-700 text-sm">
                {{ (activeTask.totalGuideAmountIQD || activeTask.registeredHouseholds * 53800 || 0).toLocaleString() }} IQD
              </span>
            </div>
          </div>
        </div>

        <!-- 物资分配清单与指导价格 -->
        <div class="space-y-2">
          <span class="font-bold text-slate-700">物资分配清单与国家保供指导价：</span>
          <div class="space-y-2">
            <div
              v-for="item in activeTask.items"
              :key="item.itemCode"
              class="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-slate-800">{{ item.itemName }}</span>
                  <span class="text-[10px] text-slate-400 font-mono ml-1.5">{{ item.itemCode }}</span>
                </div>
                <div class="font-mono font-bold text-slate-900 text-sm">
                  {{ item.allocatedQtyTon ? item.allocatedQtyTon + ' 吨' : (item.plannedQty?.toLocaleString() + ' ' + item.unit) }}
                </div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>国家指导限价: {{ item.guidePriceIQD || (item.itemCode.includes('RICE') ? 1000 : 750) }} IQD/{{ item.unit }}</span>
                <span class="text-amber-700 font-bold">指导分项金额: {{ (item.subtotalIQD || 0).toLocaleString() }} IQD</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                <span>已出库: {{ item.outboundQty?.toLocaleString() }} {{ item.unit }}</span>
                <span>已签收: {{ item.receivedQty?.toLocaleString() }} {{ item.unit }}</span>
                <span class="text-emerald-600 font-bold">家庭已领: {{ item.claimedQty?.toLocaleString() }} {{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 履约合规提示 -->
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 space-y-1 text-xs">
          <div class="font-bold">全链路履约风控与追溯提示：</div>
          <div>若代理网点实收数量与交付流水不一致，系统将即刻触发 P3 差异预警并阻断该批次异常货物的后续发放流转。</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
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
import { Plus, Share, Refresh, Calendar, Shop, Search, Goods, Check } from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');
const authStore = useAuthStore();
const citizenStore = useCitizenStore();

const isAdmin = computed(() => authStore.isAdmin);
const isCitizen = computed(() => authStore.currentRole === 'citizen');

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
    memberCount: 5
  };
});

const memberCount = computed(() => citizenFamilyInfo.value?.memberCount || 5);

const citizenQuotaItems = computed(() => {
  const n = memberCount.value;
  return [
    {
      itemCode: 'RICE-02',
      itemName: isEn.value ? 'Premium Long Grain Rice' : '精制大米 (Rice)',
      standardPerPerson: 3.0,
      totalHouseholdQuota: (3.0 * n).toFixed(1),
      guidePriceIQD: 1000,
      unit: 'KG',
      status: '本月已足额调配'
    },
    {
      itemCode: 'FLOUR-01',
      itemName: isEn.value ? 'Wheat Flour (Grade A)' : '特级面粉 (Flour)',
      standardPerPerson: 9.0,
      totalHouseholdQuota: (9.0 * n).toFixed(1),
      guidePriceIQD: 750,
      unit: 'KG',
      status: '本月已足额调配'
    },
    {
      itemCode: 'OIL-03',
      itemName: isEn.value ? 'Vegetable Cooking Oil' : '食用植物油 (Oil)',
      standardPerPerson: 1.0,
      totalHouseholdQuota: (1.0 * n).toFixed(1),
      guidePriceIQD: 2500,
      unit: 'L',
      status: '本月已足额调配'
    },
    {
      itemCode: 'SUGAR-04',
      itemName: isEn.value ? 'Refined White Sugar' : '纯精白糖 (Sugar)',
      standardPerPerson: 1.0,
      totalHouseholdQuota: (1.0 * n).toFixed(1),
      guidePriceIQD: 1200,
      unit: 'KG',
      status: '本月已足额调配'
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
  scope: '全国18省全域 (重点倾斜覆盖第140号决议区与受损安置点)',
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
    ElMessage.error('加载配给计划数据失败');
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
    ElMessage.error('自动分解排程失败');
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
    ElMessage.warning('请填写计划名称');
    return;
  }
  submitting.value = true;
  try {
    await createRationPlan({ ...newPlanForm.value });
    ElMessage.success('成功签署并下发贸易部月度物资配给总计划！');
    createDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error('创建计划失败');
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
</script>

<style scoped>
:deep(.el-table .cell) {
  padding: 6px 8px;
}
</style>
