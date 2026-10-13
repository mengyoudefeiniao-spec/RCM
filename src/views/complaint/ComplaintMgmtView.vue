<template>
  <div class="complaint-mgmt-view space-y-4">
    <!-- 头部简要概览 -->
    <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-start sm:items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0">
          <el-icon class="text-base"><Service /></el-icon>
        </div>
        <ModuleDescTip
          :title="$t('complaint.title')"
          :content="$t('complaint.subtitle')"
          badge="双轨督办接入"
          badge-type="danger"
          title-class="text-sm font-bold text-slate-900"
        >
          <template #extra>
            <el-tag size="small" type="danger" effect="plain" class="font-bold ml-1">
              {{ $t('complaint.supervision') }}
            </el-tag>
          </template>
        </ModuleDescTip>
      </div>

      <div class="flex items-center gap-2">
        <el-button type="primary" size="small" @click="openCreateComplaintDialog">
          <el-icon class="mr-1"><Phone /></el-icon>
          {{ $t('complaint.registerPhone') }}
        </el-button>
        <el-button size="small" @click="loadComplaints" :loading="loading">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- 顶部 KPI 卡片 (针对 Google Pixel 9 412px 视口优化: 前4项2列对称排列，第5项通栏展示) -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
      <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-slate-400">{{ $t('complaint.totalComplaints') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-slate-900">{{ complaintsList.length }}</div>
        <div class="text-[10px] text-slate-500">{{ $t('complaint.channelDual') }}</div>
      </div>
      <div class="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-sky-600">{{ $t('complaint.aiOnline') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-sky-700">{{ aiChannelCount }}</div>
        <div class="text-[10px] text-slate-400">{{ $t('complaint.channelAiDesc') }}</div>
      </div>
      <div class="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-amber-600">{{ $t('complaint.phoneHotline') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-amber-700">{{ phoneChannelCount }}</div>
        <div class="text-[10px] text-slate-400">{{ $t('complaint.channelPhoneDesc') }}</div>
      </div>
      <div class="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-rose-600">{{ $t('complaint.pendingHandling') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-rose-700">{{ pendingCount }}</div>
        <div class="text-[10px] text-rose-500 font-medium">{{ $t('complaint.pendingFollowup') }}</div>
      </div>
      <div class="col-span-2 sm:col-span-1 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-emerald-600">{{ $t('complaint.resolvedRate') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-emerald-700">{{ resolvedRate }}%</div>
        <div class="text-[10px] text-emerald-600">{{ $t('complaint.resolvedRateDesc') }}</div>
      </div>
    </div>

    <!-- 检索筛选区 (移动端支持折叠，保持首屏整洁) -->
    <div class="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-700 text-xs">条件筛选与搜索</span>
        <button
          type="button"
          class="sm:hidden text-blue-600 text-[11px] underline"
          @click="showMobileFilter = !showMobileFilter"
        >
          {{ showMobileFilter ? '收起高级筛选' : '展开多维筛选' }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- 移动端可折叠的高级下拉框 -->
        <div
          class="w-full sm:w-auto flex flex-wrap items-center gap-2"
          :class="{ 'hidden sm:flex': !showMobileFilter }"
        >
          <!-- 渠道来源 -->
          <el-select v-model="query.channel" :placeholder="$t('complaint.channelSource')" class="w-full sm:w-[140px]" size="small" @change="handleSearch">
            <el-option :label="$t('complaint.allChannels')" value="全部" />
            <el-option :label="$t('complaint.aiOnline')" value="AI智能客服助手" />
            <el-option :label="$t('complaint.phoneHotline')" value="1919政务热线电话" />
          </el-select>

          <!-- 诉求类型 -->
          <el-select v-model="query.type" :placeholder="$t('complaint.appealType')" class="w-full sm:w-[150px]" size="small" @change="handleSearch">
            <el-option :label="$t('complaint.allTypes')" value="全部" />
            <el-option :label="$t('complaint.typeOvercharge')" value="私自加价/违规收费" />
            <el-option :label="$t('complaint.typeShortage')" value="缺斤短两/克扣" />
            <el-option :label="$t('complaint.typeQuality')" value="物资品质口感异议" />
            <el-option :label="$t('complaint.typeService')" value="服务态度差/排队耗时" />
            <el-option :label="$t('complaint.typeQuota')" value="配给份额核定有误" />
          </el-select>

          <!-- 办理状态 -->
          <el-select v-model="query.status" :placeholder="$t('complaint.handleStatus')" class="w-full sm:w-[120px]" size="small" @change="handleSearch">
            <el-option :label="$t('complaint.allStatuses')" value="全部" />
            <el-option :label="$t('complaint.statusPendingAssign')" value="待分配" />
            <el-option :label="$t('complaint.statusInvestigating')" value="核查中" />
            <el-option :label="$t('complaint.statusSupervising')" value="督办整改中" />
            <el-option :label="$t('complaint.statusResolved')" value="已办结" />
          </el-select>

          <!-- 省市 -->
          <el-select v-model="query.province" :placeholder="$t('common.province')" class="w-full sm:w-[130px]" size="small" @change="handleProvinceChange">
            <el-option :label="$t('complaint.allProvinces')" value="全部" />
            <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
          </el-select>

          <!-- 中心 -->
          <el-select v-model="query.center" :placeholder="$t('common.center')" class="w-full sm:w-[150px]" size="small" @change="handleSearch">
            <el-option :label="$t('complaint.allCenters')" value="全部" />
            <el-option v-for="c in currentCenterOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>

        <!-- 关键词搜索与按钮行 (小屏幕下全宽) -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <el-input
            v-model="query.keyword"
            :placeholder="$t('complaint.searchHint')"
            class="flex-1 sm:w-[200px]"
            size="small"
            clearable
            @keyup.enter="handleSearch"
          />

          <el-button type="primary" size="small" :icon="Search" @click="handleSearch">{{ $t('complaint.queryBtn') }}</el-button>
          <el-button size="small" :icon="Refresh" @click="resetQuery">{{ $t('complaint.resetBtn') }}</el-button>
        </div>
      </div>
    </div>

    <!-- 列表数据区 (移动端提供卡片流与传统表格双视图) -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-3 sm:p-0">
      <div class="sm:hidden flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
        <span class="text-xs font-bold text-slate-800">工单列表 ({{ filteredList.length }})</span>
        <div class="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px]">
          <button
            type="button"
            class="px-2 py-0.5 rounded-md font-medium transition-all"
            :class="viewMode === 'card' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-500'"
            @click="viewMode = 'card'"
          >
            卡片
          </button>
          <button
            type="button"
            class="px-2 py-0.5 rounded-md font-medium transition-all"
            :class="viewMode === 'table' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-500'"
            @click="viewMode = 'table'"
          >
            表格
          </button>
        </div>
      </div>

      <!-- 视图 1: 移动端专属工单卡片流 (Pixel 9 412px 视口流畅滑动) -->
      <div v-if="viewMode === 'card'" class="sm:hidden space-y-2.5">
        <div
          v-for="item in paginatedList"
          :key="item.id"
          class="p-3 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2 active:scale-[0.99] transition-transform"
        >
          <!-- 头部: 编号、渠道、状态 -->
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold text-blue-600 text-xs">{{ item.id }}</span>
              <el-tag size="small" :type="item.channel.includes('AI') ? 'primary' : 'warning'" effect="plain" class="scale-90 origin-left">
                {{ item.channel.includes('AI') ? 'AI渠道' : '1919热线' }}
              </el-tag>
            </div>
            <el-tag size="small" :type="getStatusTag(item.status)" effect="light">
              {{ item.status }}
            </el-tag>
          </div>

          <!-- 主体诉求与类型 -->
          <div>
            <div class="font-bold text-slate-800 text-xs leading-snug">{{ item.title }}</div>
            <div class="mt-1 flex items-center gap-1.5">
              <el-tag size="small" :type="getTypeTag(item.type)" class="scale-90 origin-left">{{ item.type }}</el-tag>
              <span class="text-[10px] text-slate-400 font-mono">{{ item.createdAt?.slice(0, 16) }}</span>
            </div>
          </div>

          <!-- 市民信息与归属网点 -->
          <div class="p-2 rounded-lg bg-slate-50 text-[11px] grid grid-cols-2 gap-1.5">
            <div>
              <span class="text-slate-400 block text-[10px]">反映群众</span>
              <span class="font-medium text-slate-700">{{ item.applicantName }} ({{ item.callPhone || '—' }})</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">涉事辖区与网点</span>
              <span class="text-slate-700 truncate block">{{ item.province }} · {{ item.agentName }}</span>
            </div>
          </div>

          <!-- 操作按钮行 -->
          <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <el-button size="small" plain @click="openDetail(item)">查看详情</el-button>
            <el-button
              size="small"
              :type="item.status === '已办结' || item.status === 'Resolved' ? 'info' : 'danger'"
              :plain="item.status === '已办结' || item.status === 'Resolved'"
              @click="openHandleModal(item)"
            >
              {{ item.status === '已办结' || item.status === 'Resolved' ? '查阅处置' : '督办整改' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 视图 2: 经典表格视图 (桌面端显示，移动端可手动切换) -->
      <div v-show="viewMode === 'table' || isDesktop" class="overflow-x-auto">
        <el-table :data="paginatedList" v-loading="loading" size="small" stripe border class="text-xs">
          <el-table-column prop="id" :label="$t('review.ticketId')" width="130" fixed>
            <template #default="{ row }">
              <span class="font-mono font-bold text-blue-600">{{ row.id }}</span>
            </template>
          </el-table-column>

        <el-table-column prop="channel" :label="$t('complaint.channelSource')" width="140">
          <template #default="{ row }">
            <el-tag size="small" :type="row.channel.includes('AI') ? 'primary' : 'warning'" effect="plain" class="font-medium">
              <el-icon class="mr-1"><ChatDotRound v-if="row.channel.includes('AI')" /><Phone v-else /></el-icon>
              {{ row.channel }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="type" :label="$t('complaint.appealType')" width="160">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="title" :label="$t('complaint.mainContent')" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('complaint.citizenName')" width="160">
          <template #default="{ row }">
            <div class="text-slate-800 font-medium">{{ row.applicantName }}</div>
            <div class="text-[10px] text-slate-400 font-mono">{{ row.callPhone }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('complaint.targetArea')" min-width="200">
          <template #default="{ row }">
            <div class="text-slate-700 font-medium">{{ row.province }} · {{ row.center }}</div>
            <div class="text-[11px] text-slate-500">{{ row.agentName }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="$t('complaint.handleStatus')" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.status === '已办结' || row.status === 'Resolved' ? 'success' : (row.status === '待分配' || row.status === 'Pending Assignment' ? 'danger' : 'warning')"
              effect="light"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="submittedAt" :label="$t('complaint.registerTime')" width="130" align="center" class-name="font-mono text-slate-400" />

        <el-table-column :label="$t('common.action')" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1.5">
              <el-button size="small" type="primary" plain @click="openDetail(row)">{{ $t('complaint.viewDetail') }}</el-button>
              <el-button
                size="small"
                :type="row.status === '已办结' || row.status === 'Resolved' ? 'info' : 'danger'"
                :plain="row.status === '已办结' || row.status === 'Resolved'"
                @click="openHandleModal(row)"
              >
                {{ row.status === '已办结' || row.status === 'Resolved' ? $t('complaint.viewHandling') : $t('complaint.handleSupervise') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- 分页栏 -->
      <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          {{ $t('complaint.filterCount', { count: filteredList.length }) }}
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          :total="filteredList.length"
          size="small"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="$t('complaint.detailModalTitle')" width="620px" destroy-on-close>
      <div v-if="currentDetail" class="space-y-4 text-xs">
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <div class="text-[11px] text-slate-400">{{ $t('review.ticketId') }}</div>
            <div class="text-sm font-mono font-bold text-blue-600">{{ currentDetail.id }}</div>
          </div>
          <el-tag :type="currentDetail.status === '已办结' || currentDetail.status === 'Resolved' ? 'success' : 'warning'">{{ currentDetail.status }}</el-tag>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <span class="text-slate-400">{{ $t('complaint.channelSource') }}:</span>
            <span class="ml-2 font-medium text-slate-800">{{ currentDetail.channel }}</span>
          </div>
          <div>
            <span class="text-slate-400">{{ $t('complaint.appealType') }}:</span>
            <span class="ml-2 font-medium text-slate-800">{{ currentDetail.type }}</span>
          </div>
          <div>
            <span class="text-slate-400">{{ $t('complaint.citizenName') }}:</span>
            <span class="ml-2 font-medium text-slate-800">{{ currentDetail.applicantName }}</span>
          </div>
          <div>
            <span class="text-slate-400">{{ $t('common.phone') }}:</span>
            <span class="ml-2 font-mono text-slate-800">{{ currentDetail.callPhone }}</span>
          </div>
          <div>
            <span class="text-slate-400">{{ $t('common.province') }}:</span>
            <span class="ml-2 text-slate-800">{{ currentDetail.province }} · {{ currentDetail.center }}</span>
          </div>
          <div>
            <span class="text-slate-400">{{ $t('nav.agent') }}:</span>
            <span class="ml-2 text-slate-800">{{ currentDetail.agentName }}</span>
          </div>
        </div>

        <div>
          <div class="text-slate-400 mb-1">{{ $t('complaint.mainContent') }}:</div>
          <div class="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-100">
            {{ currentDetail.content }}
          </div>
        </div>

        <div v-if="currentDetail.result" class="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800 space-y-1">
          <div class="font-bold flex items-center justify-between">
            <span>{{ $t('complaint.handlingResult') }}</span>
            <span class="text-[11px] font-normal text-emerald-600">{{ currentDetail.handledAt }}</span>
          </div>
          <p class="leading-relaxed">{{ currentDetail.result }}</p>
          <div class="text-[11px] text-emerald-700 pt-1">
            <span>{{ $t('complaint.handler') }}: {{ currentDetail.handlerName }}</span>
            <span class="ml-3">{{ $t('complaint.satisfaction') }}: {{ currentDetail.satisfaction }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 督办处理弹窗 -->
    <el-dialog v-model="handleVisible" :title="$t('complaint.handleModalTitle')" width="580px" destroy-on-close>
      <div v-if="currentHandling" class="space-y-4 text-xs">
        <div class="bg-rose-50/50 p-3 rounded-lg border border-rose-100 space-y-1">
          <div class="font-bold text-rose-800">{{ currentHandling.title }}</div>
          <p class="text-slate-600 leading-relaxed">{{ currentHandling.content }}</p>
        </div>

        <div class="space-y-2">
          <label class="block font-medium text-slate-700">{{ $t('complaint.handlingResult') }}：</label>
          <el-input
            v-model="handleForm.result"
            type="textarea"
            :rows="3"
            placeholder="填写核查事实与责令整改/行政处罚结论..."
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-slate-700 mb-1">{{ $t('complaint.handleStatus') }}：</label>
            <el-select v-model="handleForm.status" class="w-full" size="small">
              <el-option :label="$t('complaint.statusResolved')" value="已办结" />
              <el-option :label="$t('complaint.statusSupervising')" value="督办整改中" />
            </el-select>
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">{{ $t('complaint.satisfaction') }}：</label>
            <el-select v-model="handleForm.satisfaction" class="w-full" size="small">
              <el-option label="非常满意" value="非常满意" />
              <el-option label="满意" value="满意" />
              <el-option label="基本满意" value="基本满意" />
            </el-select>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="handleVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="small" type="primary" :loading="handlingLoading" @click="submitHandle">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 登记电话来电弹窗 -->
    <el-dialog v-model="createVisible" :title="$t('complaint.phoneModalTitle')" width="580px" destroy-on-close>
      <div class="space-y-3 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-slate-700 mb-1">{{ $t('complaint.citizenName') }}：</label>
            <el-input v-model="createForm.applicantName" placeholder="来电公民姓名" size="small" />
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">{{ $t('common.phone') }}：</label>
            <el-input v-model="createForm.callPhone" placeholder="+964 7XX XXX XXXX" size="small" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-slate-700 mb-1">{{ $t('common.province') }}：</label>
            <el-select v-model="createForm.province" class="w-full" size="small">
              <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">{{ $t('complaint.appealType') }}：</label>
            <el-select v-model="createForm.type" class="w-full" size="small">
              <el-option :label="$t('complaint.typeOvercharge')" value="私自加价/违规收费" />
              <el-option :label="$t('complaint.typeShortage')" value="缺斤短两/克扣" />
              <el-option :label="$t('complaint.typeQuality')" value="物资品质口感异议" />
              <el-option :label="$t('complaint.typeService')" value="服务态度差/排队耗时" />
              <el-option :label="$t('complaint.typeQuota')" value="配给份额核定有误" />
            </el-select>
          </div>
        </div>

        <div>
          <label class="block font-medium text-slate-700 mb-1">{{ $t('complaint.targetArea') }}：</label>
          <el-input v-model="createForm.agentName" placeholder="网点名称" size="small" />
        </div>

        <div>
          <label class="block font-medium text-slate-700 mb-1">{{ $t('complaint.mainContent') }}：</label>
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="3"
            placeholder="记录来电群众反映的具体事实、时间、地点与诉求..."
          />
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="createVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="small" type="primary" :loading="createLoading" @click="submitCreateComplaint">
          {{ $t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, Refresh, Service, Phone, ChatDotRound } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import { getComplaintList, createComplaintTicket, handleComplaintTicket } from '../../api/complaint.js';
import { useAuthStore } from '../../stores/auth.js';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const loading = ref(false);
const complaintsList = ref([]);

// 移动端视图控制：针对 Google Pixel 9 (412x924px) 视口
const viewMode = ref('card');
const isDesktop = ref(false);
const showMobileFilter = ref(false);

function handleResize() {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth >= 640;
    if (isDesktop.value) {
      viewMode.value = 'table';
    }
  }
}

const isEn = computed(() => locale.value === 'en');

const provinceOptions = computed(() => {
  return isEn.value ? [
    'Baghdad Province',
    'Basra Province',
    'Nineveh Province',
    'Diyala Province',
    'Kirkuk Province',
    'Anbar Province',
    'Erbil Province',
    'Sulaymaniyah Province'
  ] : [
    '巴格达省',
    '巴士拉省',
    '尼尼微省',
    '迪亚拉省',
    '基尔库克省',
    '安巴尔省',
    '埃尔比勒省',
    '苏莱曼尼亚省'
  ];
});

const centerMap = {
  '巴格达省': ['卡尔赫第一粮食供应分部', '鲁萨法第二粮食供应分部', '曼苏尔配给中心'],
  '巴士拉省': ['巴士拉港口配给保障站', '阿沙尔滨海服务中心'],
  '尼尼微省': ['摩苏尔老城配给管理中心', '尼尼微平原调拨站'],
  '迪亚拉省': ['迪亚拉哈奈根前置保供仓服务分部', '巴古拜物资中心'],
  '基尔库克省': ['基尔库克第一配给服务中心'],
  '安巴尔省': ['费卢杰粮食供应站', '拉马迪保障中心'],
  '埃尔比勒省': ['埃尔比勒中心粮食调拨总站', '安卡瓦惠民站'],
  '苏莱曼尼亚省': ['苏莱曼尼亚中心配发处'],
  'Baghdad Province': ['Karkh 1st Food Supply Branch', 'Rusafa 2nd Food Supply Branch', 'Mansour Core Ration Center'],
  'Basra Province': ['Basra Port Ration Support Station', 'Ashar Portside Ration Center'],
  'Nineveh Province': ['Old Mosul Ration Management Center', 'Nineveh Plains Hub'],
  'Diyala Province': ['Khanaqin Forward Supply Warehouse Branch', 'Baquba Center'],
  'Kirkuk Province': ['Kirkuk Citadel Core Ration Center'],
  'Anbar Province': ['Fallujah Grain Station', 'Ramadi Support Center'],
  'Erbil Province': ['Erbil Central Grain Transfer Hub', 'Ainkawa Food Station'],
  'Sulaymaniyah Province': ['Sulaymaniyah Central Dispatch Center']
};

const query = ref({
  channel: '全部',
  type: '全部',
  status: '全部',
  province: '全部',
  center: '全部',
  keyword: ''
});

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

const currentCenterOptions = computed(() => {
  if (query.value.province && query.value.province !== '全部') {
    return centerMap[query.value.province] || [];
  }
  const relevantKeys = isEn.value
    ? Object.keys(centerMap).filter(k => k.includes('Province'))
    : Object.keys(centerMap).filter(k => k.includes('省'));
  return relevantKeys.flatMap(k => centerMap[k] || []);
});

const aiChannelCount = computed(() => complaintsList.value.filter(c => c.channel.includes('AI')).length);
const phoneChannelCount = computed(() => complaintsList.value.filter(c => c.channel.includes('1919')).length);
const pendingCount = computed(() => complaintsList.value.filter(c => c.status !== '已办结' && c.status !== 'Resolved').length);
const resolvedRate = computed(() => {
  if (!complaintsList.value.length) return 100;
  const done = complaintsList.value.filter(c => c.status === '已办结' || c.status === 'Resolved').length;
  return Math.round((done / complaintsList.value.length) * 100);
});

// 前端联合多维筛选
const filteredList = computed(() => {
  let list = [...complaintsList.value];
  if (query.value.channel !== '全部') {
    list = list.filter(item => item.channel.includes(query.value.channel) || (query.value.channel.includes('AI') && item.channel.includes('AI')));
  }
  if (query.value.type !== '全部') {
    list = list.filter(item => item.type === query.value.type);
  }
  if (query.value.status !== '全部') {
    list = list.filter(item => item.status === query.value.status);
  }
  if (query.value.province !== '全部') {
    const pVal = query.value.province.replace(/省| Province/g, '');
    list = list.filter(item => item.province.includes(pVal));
  }
  if (query.value.center !== '全部') {
    list = list.filter(item => item.center.includes(query.value.center));
  }
  if (query.value.keyword.trim()) {
    const kw = query.value.keyword.trim().toLowerCase();
    list = list.filter(item =>
      (item.id && item.id.toLowerCase().includes(kw)) ||
      (item.applicantName && item.applicantName.toLowerCase().includes(kw)) ||
      (item.callPhone && item.callPhone.includes(kw)) ||
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.agentName && item.agentName.toLowerCase().includes(kw))
    );
  }
  return list;
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

function handleProvinceChange() {
  query.value.center = '全部';
  handleSearch();
}

function handleSearch() {
  currentPage.value = 1;
}

function resetQuery() {
  query.value = {
    channel: '全部',
    type: '全部',
    status: '全部',
    province: '全部',
    center: '全部',
    keyword: ''
  };
  currentPage.value = 1;
}

function getTypeTag(type) {
  if (type.includes('收费') || type.includes('Fee')) return 'danger';
  if (type.includes('品质') || type.includes('Quality')) return 'warning';
  if (type.includes('克扣') || type.includes('Weight')) return 'danger';
  if (type.includes('排队') || type.includes('Service')) return 'info';
  return 'primary';
}

async function loadComplaints() {
  loading.value = true;
  try {
    const res = await getComplaintList();
    complaintsList.value = res || [];
  } catch (e) {
    ElMessage.error(t('common.failed'));
  } finally {
    loading.value = false;
  }
}

// 详情弹窗
const detailVisible = ref(false);
const currentDetail = ref(null);
function openDetail(row) {
  currentDetail.value = row;
  detailVisible.value = true;
}

// 督办处理弹窗
const handleVisible = ref(false);
const currentHandling = ref(null);
const handlingLoading = ref(false);
const handleForm = ref({
  status: '已办结',
  result: '',
  satisfaction: '非常满意'
});

function openHandleModal(row) {
  currentHandling.value = row;
  handleForm.value = {
    status: isEn.value ? 'Resolved' : '已办结',
    result: row.result || (isEn.value ? 'Investigation verified the complaint. Ordered the outlet to rectify immediately and recorded in credit file.' : '经属地联合核查属实，责令网点立即纠正整改并记入信用档案。'),
    satisfaction: row.satisfaction || (isEn.value ? 'Very Satisfied' : '非常满意')
  };
  handleVisible.value = true;
}

async function submitHandle() {
  if (!currentHandling.value) return;
  handlingLoading.value = true;
  try {
    await handleComplaintTicket(currentHandling.value.id, {
      ...handleForm.value,
      handlerName: authStore.userProfile?.title || (isEn.value ? 'Director General' : '规划与跟进司总干事')
    });
    ElMessage.success(t('common.success'));
    handleVisible.value = false;
    await loadComplaints();
  } catch (e) {
    ElMessage.error(t('common.failed'));
  } finally {
    handlingLoading.value = false;
  }
}

// 登记电话投诉弹窗
const createVisible = ref(false);
const createLoading = ref(false);
const createForm = ref({
  applicantName: '',
  callPhone: '',
  province: '巴格达省',
  agentName: '',
  type: '私自加价/违规收费',
  content: ''
});

function openCreateComplaintDialog() {
  createForm.value = {
    applicantName: '',
    callPhone: '',
    province: isEn.value ? 'Baghdad Province' : '巴格达省',
    agentName: '',
    type: isEn.value ? 'Unauthorized Overcharge / Illegal Fees' : '私自加价/违规收费',
    content: ''
  };
  createVisible.value = true;
}

async function submitCreateComplaint() {
  if (!createForm.value.applicantName || !createForm.value.content) {
    ElMessage.warning(t('common.input'));
    return;
  }
  createLoading.value = true;
  try {
    await createComplaintTicket({
      ...createForm.value,
      channel: isEn.value ? '1919 Government Hotline' : '1919政务热线电话',
      title: `${createForm.value.applicantName} - ${createForm.value.type}`
    });
    ElMessage.success(t('common.success'));
    createVisible.value = false;
    await loadComplaints();
  } catch (e) {
    ElMessage.error(t('common.failed'));
  } finally {
    createLoading.value = false;
  }
}

const handleLangChanged = () => {
  loadComplaints();
};

onMounted(() => {
  loadComplaints();
  handleResize();
  if (typeof window !== 'undefined') {
    window.addEventListener('rcm-language-changed', handleLangChanged);
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('rcm-language-changed', handleLangChanged);
    window.removeEventListener('resize', handleResize);
  }
});
</script>

<style scoped>
</style>
