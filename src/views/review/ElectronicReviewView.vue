<template>
  <div class="electronic-review-view space-y-4">
    <!-- 头部说明 (已简化介绍词) -->
    <div class="bg-white rounded-lg p-4 border border-[#D9E5DB]/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <ModuleDescTip
          :title="$t('review.title')"
          :content="$t('review.subtitle')"
          :badge="$t('review.badgeFullProcess')"
          badge-type="warning"
          title-class="text-sm font-bold text-[#1B3123]"
        >
          <template #icon>
            <el-icon class="text-[#D3AF62] text-base"><Stamp /></el-icon>
          </template>
          <template #extra>
            <el-tag :type="authStore.isMinisterCenter ? 'primary' : authStore.isDeputyMinister ? 'danger' : 'warning'" effect="dark" size="small" class="font-bold ml-1">
              {{ authStore.userProfile?.title || $t('common.adminFallback') }}
            </el-tag>
          </template>
        </ModuleDescTip>
      </div>

      <div class="flex items-center gap-2">
        <el-button size="small" @click="handleRefresh">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ $t('review.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- 主体双栏：在 Google Pixel 9 等移动端下支持“列表 / 详情”智能切换，桌面端保持双栏并排 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- 左侧：待办清单 (在移动端处于详情模式时隐藏，列表模式时全宽显示) -->
      <div
        class="lg:col-span-5 space-y-3"
        :class="{ 'hidden lg:block': mobileTab === 'detail' }"
      >
        <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB] shadow-2xs space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-[#43554B]">
            <span class="flex items-center gap-1.5">
              <span>{{ $t('review.filterTitle') }}</span>
              <button
                type="button"
                class="lg:hidden text-[11px] text-[#326445] font-normal underline ml-1"
                @click="showMobileFilter = !showMobileFilter"
              >
                {{ showMobileFilter ? $t('review.collapseFilters') : $t('review.expandFilters') }}
              </button>
            </span>
            <span class="text-[11px] text-[#8A9A8F] font-mono">
              {{ $t('review.filterMatch', { count: filteredTickets.length, total: reviewStore.tickets.length }) }}
            </span>
          </div>

          <!-- 组合过滤参数表单 (移动端可折叠) -->
          <div
            class="space-y-2 text-xs bg-[#F3F8F4] p-2.5 rounded-lg border border-[#E9F1EB]"
            :class="{ 'hidden sm:block': !showMobileFilter }"
          >
            <!-- 关键词过滤 -->
            <div>
              <el-input
                v-model="filterKeyword"
                :placeholder="$t('review.searchPlaceholder')"
                size="small"
                clearable
                :prefix-icon="Search"
              />
            </div>

            <!-- 省市与中心过滤 -->
            <div class="grid grid-cols-2 gap-2">
              <el-select
                v-model="filterProvince"
                :placeholder="$t('review.selectProvince')"
                size="small"
                clearable
                @change="handleProvinceChange"
              >
                <el-option :label="$t('review.allProvinces')" value="全部" />
                <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
              </el-select>

              <el-select
                v-model="filterCenter"
                :placeholder="$t('review.selectCenter')"
                size="small"
                clearable
              >
                <el-option :label="$t('review.allCenters')" value="全部" />
                <el-option v-for="c in currentCenterOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </div>

            <!-- 日期范围过滤 -->
            <div>
              <el-date-picker
                v-model="filterDateRange"
                type="daterange"
                :range-separator="$t('review.dateSeparator')"
                :start-placeholder="$t('review.startDate')"
                :end-placeholder="$t('review.endDate')"
                value-format="YYYY-MM-DD"
                size="small"
                style="width: 100%"
              />
            </div>

            <!-- 重置按钮 -->
            <div class="flex justify-end pt-0.5">
              <el-button size="small" text type="primary" @click="resetFilters">
                {{ $t('review.clearFilters') }}
              </el-button>
            </div>
          </div>

          <!-- 来源类型快速切换 -->
          <div class="flex flex-wrap gap-1 p-1 bg-[#E9F1EB] rounded-lg text-xs">
            <button
              v-for="source in sourceList"
              :key="source"
              type="button"
              class="px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
              :class="
                isSourceActive(source)
                  ? 'bg-white text-[#C9A13B] shadow-2xs font-bold'
                  : 'text-[#58685D] hover:text-[#1F3326]'
              "
              @click="changeSourceFilter(source)"
            >
              <span>{{ getSourceDisplayName(source) }}</span>
              <span
                class="text-[9px] px-1 rounded-full"
                :class="
                  isSourceActive(source)
                    ? 'bg-[#FDF3E0] text-[#C9A13B]'
                    : 'bg-[#D9E5DB] text-[#58685D]'
                "
              >
                {{ getSourceCount(source) }}
              </span>
            </button>
          </div>

          <!-- 工单卡片列表 -->
          <div class="space-y-2 max-h-[580px] overflow-y-auto pr-0.5">
            <div
              v-if="filteredTickets.length === 0"
              class="p-6 text-center text-xs text-[#8A9A8F] border border-dashed border-[#D9E5DB] rounded-lg"
            >
              {{ $t('review.noTickets') }}
            </div>

            <div
              v-for="tk in filteredTickets"
              :key="tk.id"
              class="p-3 rounded-lg border text-xs cursor-pointer transition-all active:scale-[0.99]"
              :class="
                reviewStore.selectedTicket?.id === tk.id
                  ? 'border-[#D3AF62] bg-[#FDF3E0]/40 shadow-2xs'
                  : 'border-[#D9E5DB] hover:border-[#C9DBCE] bg-white'
              "
              @click="handleSelectTicket(tk)"
            >
              <div class="flex items-center justify-between gap-1 mb-1">
                <div class="flex items-center gap-1.5">
                  <el-tag size="small" :type="getSourceTagType(tk.source)" effect="plain" class="font-bold">
                    {{ getSourceDisplayName(tk.source) }}
                  </el-tag>
                  <span class="font-bold font-mono text-[#1B3123]">{{ tk.id }}</span>
                </div>

                <el-tag
                  size="small"
                  :type="getStatusTagType(tk.status)"
                >
                  {{ getStatusDisplayName(tk.status) }}
                </el-tag>
              </div>

              <div class="font-semibold text-[#1F3326] truncate">{{ tk.appType }}</div>
              
              <div class="text-[11px] text-[#58685D] mt-1 flex items-center justify-between">
                <span class="truncate">{{ $t('review.targetPrefix') }}{{ tk.targetMemberName }}</span>
                <span class="font-mono text-[#8A9A8F] shrink-0">{{ tk.submittedAt?.slice(5) }}</span>
              </div>

              <div v-if="tk.province || tk.center" class="text-[10px] text-[#8A9A8F] mt-1 flex items-center gap-1.5">
                <span class="truncate">{{ $t('review.regionPrefix') }}{{ tk.province }} {{ tk.center ? '· ' + tk.center : '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：工单工作台详情与两级审批 (移动端列表模式时隐藏，详情模式时全宽显示) -->
      <div
        class="lg:col-span-7 space-y-4"
        :class="{ 'hidden lg:block': mobileTab === 'list' }"
      >
        <!-- 移动端专属：返回待审工单列表操作条 (Pixel 9 专属便捷导航) -->
        <div class="lg:hidden flex items-center justify-between bg-gradient-to-r from-[#FDF3E0] to-[#FDF3E0] px-3.5 py-2.5 rounded-lg border border-[#F2E3C6] shadow-2xs">
          <button
            type="button"
            class="flex items-center gap-1.5 text-xs text-[#5A4718] font-bold active:scale-95 transition-transform"
            @click="mobileTab = 'list'"
          >
            <el-icon class="text-sm"><Back /></el-icon>
            <span>{{ $t('review.backToList') }} ({{ filteredTickets.length }})</span>
          </button>
          <span class="text-[11px] font-mono font-semibold text-[#6B5321]">{{ reviewStore.selectedTicket?.id }}</span>
        </div>

        <div v-if="!reviewStore.selectedTicket" class="bg-white p-12 rounded-lg border border-[#D9E5DB] text-center text-[#8A9A8F] text-xs">
          {{ $t('review.selectTicketHint') }}
        </div>

        <div v-else class="space-y-4">
          <!-- 工单基础信息面板 -->
          <div class="bg-white p-4.5 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3 text-xs">
            <div class="flex items-center justify-between pb-2.5 border-b border-[#E9F1EB]">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-[#1B3123] font-mono">
                  {{ $t('review.ticketIdLabel') }}{{ reviewStore.selectedTicket.id }}
                </span>
                <el-tag size="small" :type="getSourceTagType(reviewStore.selectedTicket.source)" effect="dark" class="font-bold">
                  {{ $t('review.sourceLabel') }}{{ getSourceDisplayName(reviewStore.selectedTicket.source) }}
                </el-tag>
              </div>
              <span class="text-[#8A9A8F] font-mono">{{ reviewStore.selectedTicket.submittedAt }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">{{ $t('review.businessTypeLabel') }}</span>
                <span class="font-bold text-[#1F3326]">{{ reviewStore.selectedTicket.appType }}</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">{{ $t('review.cardNoLabel') }}</span>
                <span class="font-mono font-bold text-[#1F3326]">{{ reviewStore.selectedTicket.cardNo }}</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">{{ $t('review.targetPersonLabel') }}</span>
                <span class="font-bold text-[#1F3326]">{{ reviewStore.selectedTicket.targetMemberName }}</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">{{ $t('review.currentStatusLabel') }}</span>
                <span class="font-bold text-[#C9A13B]">{{ getStatusDisplayName(reviewStore.selectedTicket.status) }}</span>
              </div>
              <div v-if="reviewStore.selectedTicket.province">
                <span class="text-[#8A9A8F] block text-[11px]">{{ $t('review.centerLabel') }}</span>
                <span class="text-[#1F3326]">{{ reviewStore.selectedTicket.province }} · {{ reviewStore.selectedTicket.center }}</span>
              </div>
            </div>

            <!-- 触发电子审核原因 -->
            <div class="p-3 bg-[#FBEAE9] rounded-lg border border-[#F2D5D4] text-[#A93B39] text-xs">
              <span class="font-bold">{{ $t('review.triggerReasonLabel') }}</span>
              {{ reviewStore.selectedTicket.reason }}
            </div>

            <!-- 附件材料一览 -->
            <div v-if="reviewStore.selectedTicket.attachments?.length" class="space-y-1.5 pt-1">
              <div class="text-[11px] font-bold text-[#43554B]">{{ $t('review.attachmentListLabel') }}</div>
              <div
                v-for="att in reviewStore.selectedTicket.attachments"
                :key="att.name"
                class="p-2 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB] flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2">
                  <el-icon class="text-[#326445]"><Document /></el-icon>
                  <span class="font-mono text-[#1F3326]">{{ att.name }}</span>
                </div>
                <el-tag size="small" type="success">{{ $t('review.sealValid') }}</el-tag>
              </div>
            </div>
          </div>

          <!-- 第一级：分部员工审核 (资格与数据查验) -->
          <div class="bg-white p-4.5 rounded-lg border border-[#C7DED0] shadow-2xs space-y-3 text-xs">
            <div class="flex items-center justify-between font-bold text-[#2A5440]">
              <span class="flex items-center gap-1.5">
                <el-icon><Check /></el-icon>
                <span>{{ $t('review.stage1Title') }}</span>
              </span>
              <span v-if="reviewStore.selectedTicket.staffReviewedAt" class="text-[#2F7A50] font-normal">
                {{ $t('review.stage1Done', { time: reviewStore.selectedTicket.staffReviewedAt }) }}
              </span>
            </div>

            <div v-if="reviewStore.selectedTicket.staffOpinion" class="p-3 bg-[#EFF5F1]/40 rounded-lg border border-[#E1F4E4] space-y-1">
              <div class="text-[11px] text-[#8A9A8F]">{{ $t('review.staffReviewerLabel') }}{{ reviewStore.selectedTicket.staffName }}</div>
              <div class="text-[#1F3326]">{{ reviewStore.selectedTicket.staffOpinion }}</div>
            </div>

            <div v-else class="space-y-2">
              <el-input
                v-model="staffOpinionInput"
                type="textarea"
                :rows="2"
                :placeholder="$t('review.staffPlaceholder')"
              />
              <el-button
                type="primary"
                size="small"
                :loading="staffSubmitting"
                @click="handleStaffSubmit"
              >
                {{ $t('review.staffSubmit') }}
              </el-button>
            </div>
          </div>

          <!-- 第二级：分部经理/长官终审裁决 -->
          <div class="bg-white p-4.5 rounded-lg border border-[#F2E3C6] shadow-2xs space-y-3 text-xs">
            <div class="flex items-center justify-between font-bold text-[#7A5F21]">
              <span class="flex items-center gap-1.5">
                <el-icon><Stamp /></el-icon>
                <span>{{ $t('review.stage2Title', { title: authStore.userProfile?.title || $t('common.branchManager') }) }}</span>
              </span>
              <span v-if="reviewStore.selectedTicket.managerDecidedAt" class="font-normal" :class="isDecisionApproved(reviewStore.selectedTicket.managerDecision) ? 'text-[#2F7A50]' : 'text-[#C04442]'">
                {{ $t('review.stage2Result', { decision: reviewStore.selectedTicket.managerDecision, time: reviewStore.selectedTicket.managerDecidedAt }) }}
              </span>
            </div>

            <div v-if="reviewStore.selectedTicket.managerNotes && reviewStore.selectedTicket.managerDecision !== '待决' && reviewStore.selectedTicket.managerDecision !== 'Pending'" class="p-3 bg-[#FDF3E0]/40 rounded-lg border border-[#FDF3E0] space-y-1">
              <div class="text-[11px] text-[#8A9A8F]">{{ $t('review.managerReviewerLabel') }}{{ reviewStore.selectedTicket.managerName }}</div>
              <div class="text-[#1F3326]">{{ reviewStore.selectedTicket.managerNotes }}</div>
            </div>

            <div v-else-if="isWaitingManager(reviewStore.selectedTicket.status)" class="space-y-2">
              <el-input
                v-model="managerNotesInput"
                type="textarea"
                :rows="2"
                :placeholder="$t('review.managerPlaceholder')"
              />
              <div class="flex items-center gap-2">
                <el-button
                  type="success"
                  size="small"
                  :loading="managerSubmitting"
                  @click="handleManagerDecision('接受')"
                >
                  {{ $t('review.managerApprove') }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  plain
                  :loading="managerSubmitting"
                  @click="handleManagerDecision('拒绝')"
                >
                  {{ $t('review.managerReject') }}
                </el-button>
              </div>
            </div>

            <div v-else class="text-[#8A9A8F] text-[11px]">
              {{ $t('review.stage2WaitStage1') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReviewStore } from '../../stores/review.js';
import { useAuthStore } from '../../stores/auth.js';
import { Stamp, Refresh, Document, Check, Search, Back } from '@element-plus/icons-vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';

const { t, locale } = useI18n();
const reviewStore = useReviewStore();
const authStore = useAuthStore();

// 移动端视图控制：针对 Google Pixel 9 (412x924px) 优化待审列表与工单详情切换
const mobileTab = ref('list'); // 'list' | 'detail'
const showMobileFilter = ref(false);

function handleSelectTicket(tk) {
  reviewStore.selectTicket(tk);
  mobileTab.value = 'detail';
}

const sourceList = ['全部', '申请分户', '申请解冻', '变更户主', '代理转移', '成员录入', '成员转移'];

const sourceKeyMap = {
  '全部': 'sourceAll',
  'All': 'sourceAll',
  '申请分户': 'sourceSplit',
  'Split Household': 'sourceSplit',
  '申请解冻': 'sourceUnfreeze',
  'Unfreeze Card': 'sourceUnfreeze',
  '变更户主': 'sourceChangeHead',
  'Change Head': 'sourceChangeHead',
  '代理转移': 'sourceTransferAgent',
  'Transfer Agent': 'sourceTransferAgent',
  '成员录入': 'sourceMemberEntry',
  'Member Entry': 'sourceMemberEntry',
  '成员转移': 'sourceMemberTransfer',
  'Transfer Member': 'sourceMemberTransfer'
};

function getSourceDisplayName(src) {
  const key = sourceKeyMap[src];
  return key ? t(`review.${key}`) : src;
}

function isSourceActive(source) {
  const current = reviewStore.filterSource;
  if (!current || current === '全部' || current === 'All') {
    return source === '全部' || source === 'All';
  }
  const currentKey = sourceKeyMap[current];
  const itemKey = sourceKeyMap[source];
  return currentKey && itemKey && currentKey === itemKey;
}

const statusKeyMap = {
  '待分部初审': 'statusPendingStaff',
  'Pending Staff Review': 'statusPendingStaff',
  '待经理终审': 'statusPendingManager',
  'Pending Manager Review': 'statusPendingManager',
  '已批准': 'statusApproved',
  'Approved': 'statusApproved',
  '已驳回': 'statusRejected',
  '已拒绝': 'statusRejected',
  'Rejected': 'statusRejected'
};

function getStatusDisplayName(st) {
  const key = statusKeyMap[st];
  return key ? t(`review.${key}`) : st;
}

function getStatusTagType(st) {
  if (st === '待分部初审' || st === 'Pending Staff Review') return 'warning';
  if (st === '待经理终审' || st === 'Pending Manager Review') return 'primary';
  if (st === '已批准' || st === 'Approved') return 'success';
  return 'danger';
}

function isWaitingManager(st) {
  return st === '待经理终审' || st === 'Pending Manager Review';
}

function isDecisionApproved(dec) {
  return dec === '接受' || dec === 'Approved';
}

// 过滤参数
const filterKeyword = ref('');
const filterProvince = ref('全部');
const filterCenter = ref('全部');
const filterDateRange = ref(null);

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

const currentCenterOptions = computed(() => {
  if (filterProvince.value && filterProvince.value !== '全部' && filterProvince.value !== 'All') {
    return centerMap[filterProvince.value] || [];
  }
  const relevantKeys = isEn.value
    ? Object.keys(centerMap).filter(k => k.includes('Province'))
    : Object.keys(centerMap).filter(k => k.includes('省'));
  return relevantKeys.flatMap(k => centerMap[k] || []);
});

function handleProvinceChange() {
  filterCenter.value = '全部';
}

function resetFilters() {
  filterKeyword.value = '';
  filterProvince.value = '全部';
  filterCenter.value = '全部';
  filterDateRange.value = null;
  reviewStore.filterSource = '全部';
}

// 复合计算过滤结果列表
const filteredTickets = computed(() => {
  let list = reviewStore.tickets || [];

  // 1. 来源筛选 (双语容错匹配)
  if (reviewStore.filterSource && reviewStore.filterSource !== '全部' && reviewStore.filterSource !== 'All') {
    const filterKey = sourceKeyMap[reviewStore.filterSource];
    list = list.filter(t => {
      if (t.source === reviewStore.filterSource) return true;
      const tKey = sourceKeyMap[t.source];
      return filterKey && tKey && filterKey === tKey;
    });
  }

  // 2. 关键词模糊匹配
  if (filterKeyword.value.trim()) {
    const kw = filterKeyword.value.trim().toLowerCase();
    list = list.filter(t =>
      (t.id && t.id.toLowerCase().includes(kw)) ||
      (t.applicantName && t.applicantName.toLowerCase().includes(kw)) ||
      (t.targetMemberName && t.targetMemberName.toLowerCase().includes(kw)) ||
      (t.cardNo && t.cardNo.toLowerCase().includes(kw)) ||
      (t.reason && t.reason.toLowerCase().includes(kw)) ||
      (t.appType && t.appType.toLowerCase().includes(kw))
    );
  }

  // 3. 省市筛选
  if (filterProvince.value && filterProvince.value !== '全部' && filterProvince.value !== 'All') {
    const pVal = filterProvince.value.replace(/省| Province/g, '');
    list = list.filter(t => t.province && t.province.includes(pVal));
  }

  // 4. 中心筛选
  if (filterCenter.value && filterCenter.value !== '全部' && filterCenter.value !== 'All') {
    list = list.filter(t => t.center && t.center.includes(filterCenter.value));
  }

  // 5. 日期范围筛选
  if (filterDateRange.value && filterDateRange.value.length === 2) {
    const [start, end] = filterDateRange.value;
    list = list.filter(t => {
      if (!t.submittedAt) return true;
      const subDate = t.submittedAt.slice(0, 10);
      return subDate >= start && subDate <= end;
    });
  }

  return list;
});

const staffOpinionInput = ref(t('review.defaultStaffOpinion'));
const managerNotesInput = ref(t('review.defaultManagerNotes'));

// 随语言切换更新默认意见文案
watch(locale, () => {
  staffOpinionInput.value = t('review.defaultStaffOpinion');
  managerNotesInput.value = t('review.defaultManagerNotes');
});

const staffSubmitting = ref(false);
const managerSubmitting = ref(false);

function handleRefresh() {
  reviewStore.fetchTickets(reviewStore.filterSource);
}

function handleLangChanged() {
  handleRefresh();
}

onMounted(() => {
  reviewStore.fetchTickets('全部');
  if (typeof window !== 'undefined') {
    window.addEventListener('rcm-language-changed', handleLangChanged);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('rcm-language-changed', handleLangChanged);
  }
});

function changeSourceFilter(source) {
  reviewStore.fetchTickets(source);
}

function getSourceCount(source) {
  if (source === '全部' || source === 'All') {
    return reviewStore.tickets.length;
  }
  const targetKey = sourceKeyMap[source];
  return reviewStore.tickets.filter((t) => {
    if (t.source === source) return true;
    const tKey = sourceKeyMap[t.source];
    return targetKey && tKey && targetKey === tKey;
  }).length;
}

function getSourceTagType(source) {
  const key = sourceKeyMap[source] || source;
  switch (key) {
    case 'sourceSplit':
    case '申请分户':
      return 'purple';
    case 'sourceUnfreeze':
    case '申请解冻':
      return 'warning';
    case 'sourceChangeHead':
    case '变更户主':
      return 'primary';
    case 'sourceTransferAgent':
    case '代理转移':
      return 'warning';
    case 'sourceMemberEntry':
    case '成员录入':
      return 'success';
    case 'sourceMemberTransfer':
    case '成员转移':
      return 'info';
    default:
      return 'info';
  }
}

async function handleStaffSubmit() {
  if (!reviewStore.selectedTicket) return;
  staffSubmitting.value = true;
  try {
    await reviewStore.reviewStaff(reviewStore.selectedTicket.id, staffOpinionInput.value);
  } finally {
    staffSubmitting.value = false;
  }
}

async function handleManagerDecision(decision) {
  if (!reviewStore.selectedTicket) return;
  managerSubmitting.value = true;
  try {
    const actDecision = isEn.value ? (decision === '接受' ? 'Approved' : 'Rejected') : decision;
    await reviewStore.reviewManager(
      reviewStore.selectedTicket.id,
      actDecision,
      managerNotesInput.value
    );
  } finally {
    managerSubmitting.value = false;
  }
}
</script>

<style scoped>
</style>
