<template>
  <div class="citizen-claim-tab space-y-4">
    <!-- 标头与快捷信息 (简洁化，去除冗长介绍) -->
    <div class="flex items-center justify-between bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB]">
      <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
        <el-icon class="text-[#2F7A50]"><Tickets /></el-icon>
        <span>{{ $t('warehouse.claimHistoryTitle') || '家庭末端核销历史流水记录' }}</span>
      </h3>

      <div class="flex items-center gap-2">
        <el-button size="small" @click="loadData">
          <el-icon class="me-1"><Refresh /></el-icon>
          {{ $t('common.refresh') || '刷新' }}
        </el-button>
      </div>
    </div>

    <!-- 筛选搜索与统计摘要栏 (针对 Google Pixel 9 412px 视口优化控件自适应排布) -->
    <div class="bg-white p-3 sm:p-4 rounded-lg border border-[#D9E5DB]/80 shadow-xs space-y-3 text-xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div class="flex flex-wrap items-center gap-2 flex-1">
          <el-input
            v-model="searchQuery"
            :placeholder="$t('warehouse.searchPlaceholder') || '搜索卡号 (RC-...) / 凭证号 / 户主'"
            clearable
            class="w-full sm:max-w-xs"
            @input="resetPage"
          >
            <template #prefix>
              <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
            </template>
          </el-input>

          <!-- 可选开始、结束时间点的日期时间范围控件 (移动端自适应全宽) -->
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            :range-separator="$t('warehouse.timeSeparator') || '至'"
            :start-placeholder="$t('warehouse.startTime') || '开始时间'"
            :end-placeholder="$t('warehouse.endTime') || '结束时间'"
            value-format="YYYY-MM-DD HH:mm:ss"
            size="small"
            class="w-full sm:!w-72"
            @change="resetPage"
          />

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <el-select v-model="filterPeriod" :placeholder="$t('warehouse.quotaPeriod') || '配额周期'" clearable class="flex-1 sm:w-44" size="small" @change="resetPage">
              <el-option :label="isEn ? 'October 2026 Quota' : '2026年10月份配额'" value="2026年10月" />
              <el-option :label="isEn ? 'September 2026 Quota' : '2026年9月份配额'" value="2026年9月" />
            </el-select>

            <el-button size="small" link type="primary" @click="resetFilters">{{ $t('common.reset') || '重置' }}</el-button>
          </div>
        </div>

        <div class="text-[11px] text-[#58685D] flex items-center justify-between sm:justify-start gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E9F1EB]">
          <span>{{ isEn ? 'Filtered:' : '筛选:' }} <strong class="text-[#1F3326]">{{ filteredRecords.length }}</strong> {{ isEn ? 'records' : '笔' }}</span>
          <span class="text-[#2F7A50] font-mono">{{ $t('warehouse.syncLatency') || '同步延迟 38ms' }}</span>
        </div>
      </div>
    </div>

    <!-- 末端配给核销历史流水单 (移动端卡片流与传统表格双视图) -->
    <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden p-3 sm:p-0">
      <div class="sm:hidden flex items-center justify-between pb-2 mb-2 border-b border-[#E9F1EB] text-xs">
        <span class="font-bold text-[#1F3326]">{{ isEn ? 'Claim List' : '流水列表' }} ({{ filteredRecords.length }})</span>
        <div class="flex items-center bg-[#E9F1EB] p-0.5 rounded-lg text-[10px]">
          <button
            type="button"
            class="px-2 py-0.5 rounded-md font-medium transition-all"
            :class="viewMode === 'card' ? 'bg-white text-[#2F5B44] shadow-2xs font-bold' : 'text-[#58685D]'"
            @click="viewMode = 'card'"
          >
            {{ $t('warehouse.cardView') || '卡片' }}
          </button>
          <button
            type="button"
            class="px-2 py-0.5 rounded-md font-medium transition-all"
            :class="viewMode === 'table' ? 'bg-white text-[#2F5B44] shadow-2xs font-bold' : 'text-[#58685D]'"
            @click="viewMode = 'table'"
          >
            {{ $t('warehouse.tableView') || '表格' }}
          </button>
        </div>
      </div>

      <!-- 视图 1: 移动端专属流水卡片流 (Pixel 9 412px 视口) -->
      <div v-if="viewMode === 'card'" class="sm:hidden space-y-2.5">
        <div
          v-for="row in paginatedRecords"
          :key="row.claimVoucherNo"
          class="p-3 rounded-lg border border-[#D9E5DB] bg-white shadow-2xs space-y-2"
        >
          <div class="flex items-center justify-between pb-1.5 border-b border-[#E9F1EB]">
            <span class="font-mono font-bold text-[#2F5B44] text-xs bg-[#EFF5F1] px-1.5 py-0.5 rounded border border-[#E1F4E4]">
              {{ row.claimVoucherNo }}
            </span>
            <el-tag size="small" type="success" effect="dark" class="scale-90 origin-right rtl:origin-left">{{ getStatusLabel(row.status) }}</el-tag>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-[11px]">
            <div>
              <span class="text-[#8A9A8F] block text-[10px]">{{ $t('warehouse.headAndCard') || '户主姓名 / 卡号' }}</span>
              <span class="font-bold text-[#1F3326]">{{ row.headName }}</span>
              <span class="font-mono text-[#58685D] block text-[10px]">{{ row.rationCardNo }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block text-[10px]">{{ $t('warehouse.claimPeriodCol') || '核销配给周期' }}</span>
              <span class="text-[#326445] font-semibold">{{ formatPeriod(row.claimPeriod) }}</span>
              <span class="text-[#8A9A8F] block text-[10px]">{{ isEn ? `Eligible: ${row.eligibleMembers} persons` : `享受人数: ${row.eligibleMembers}人` }}</span>
            </div>
          </div>

          <!-- 物资清单 -->
          <div class="p-2 rounded-lg bg-[#F3F8F4] border border-[#E9F1EB]">
            <span class="text-[#8A9A8F] block text-[10px] mb-1">{{ $t('warehouse.actualGoods') || '实发口粮物资：' }}</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="item in row.claimedItems"
                :key="item.itemName"
                class="px-1.5 py-0.5 rounded bg-white text-[#43554B] text-[10px] font-mono border border-[#D9E5DB]"
              >
                {{ getItemName(item.itemName) }}: <strong>{{ item.qty }}</strong> {{ getItemUnit(item.unit) }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-[#8A9A8F] pt-1 font-mono">
            <span>{{ row.claimTime }}</span>
            <span class="text-[#58685D] font-sans truncate max-w-[160px]">{{ row.agentName }}</span>
          </div>
        </div>
      </div>

      <!-- 视图 2: 经典表格视图 (桌面端显示，移动端可手动切换) -->
      <div v-show="viewMode === 'table' || isDesktop" class="overflow-x-auto">
        <el-table :data="paginatedRecords" v-loading="loading" border style="width: 100%" class="text-xs">
          <el-table-column prop="claimVoucherNo" :label="$t('warehouse.voucherNo') || '数字核销凭据号'" min-width="190">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#2F5B44] bg-[#EFF5F1] px-2 py-0.5 rounded border border-[#E1F4E4]">
                {{ row.claimVoucherNo }}
              </span>
              <div class="text-[10px] text-[#8A9A8F] font-mono mt-1 truncate" :title="row.digitalVoucherHash">
                Hash: {{ row.digitalVoucherHash }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="headName" :label="$t('warehouse.headAndCard') || '受领家庭户主 / 卡号'" min-width="170">
            <template #default="{ row }">
              <div class="font-bold text-[#1F3326]">{{ row.headName }}</div>
              <div class="font-mono text-[#58685D] text-[11px]">{{ row.rationCardNo }}</div>
              <div class="text-[10px] text-[#8A9A8F] font-mono">{{ isEn ? `Quota Verified: ${row.eligibleMembers} persons` : `核定享受口粮人: ${row.eligibleMembers} 人` }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="claimPeriod" :label="$t('warehouse.claimPeriodCol') || '核销配给月份'" width="150" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="primary" effect="plain">{{ formatPeriod(row.claimPeriod) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('warehouse.actualGoodsList') || '本期实发口粮物资清单'" min-width="240">
            <template #default="{ row }">
              <div class="flex flex-wrap gap-1.5 py-0.5">
                <el-tag
                  v-for="item in row.claimedItems"
                  :key="item.itemName"
                  size="small"
                  type="info"
                  effect="plain"
                  class="font-mono text-[11px]"
                >
                  {{ getItemName(item.itemName) }}: <strong>{{ item.qty }}</strong> {{ getItemUnit(item.unit) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="claimTime" :label="$t('warehouse.claimTimestamp') || '核销交付时间戳'" width="180">
            <template #default="{ row }">
              <div class="font-mono text-[#43554B] text-[11px]">{{ row.claimTime }}</div>
              <div class="text-[10px] text-[#2F7A50] font-mono font-medium mt-0.5">
                ● {{ $t('warehouse.cloudSync') || '云端同步' }}: {{ row.cloudSyncLatencyMs }}ms
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="agentName" :label="$t('warehouse.agentStation') || '承运核销网点'" min-width="160">
            <template #default="{ row }">
              <div class="text-[#1F3326] font-medium">{{ row.agentName }}</div>
              <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.agentCenterId }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="$t('warehouse.deliveryStatus') || '交付状态'" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success" effect="dark">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 独立分页组件 -->
      <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
        <span class="text-[#8A9A8F] text-[11px]">
          {{ isEn ? `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredRecords.length)} of ${filteredRecords.length}` : `显示第 ${(currentPage - 1) * pageSize + 1} 到 ${Math.min(currentPage * pageSize, filteredRecords.length)} 条，共 ${filteredRecords.length} 条` }}
        </span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="filteredRecords.length"
          layout="total, sizes, prev, pager, next"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCitizenClaimRecords } from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import { Refresh, Search, Tickets } from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

function getItemName(name) {
  if (isEn.value) {
    const map = {
      '小麦面粉': 'Wheat Flour',
      '大米': 'White Rice',
      '植物食用油': 'Cooking Oil',
      '精制白糖': 'Refined Sugar',
      '食盐': 'Table Salt',
      '全脂奶粉': 'Milk Powder',
      '红茶': 'Black Tea'
    };
    return map[name] || name;
  }
  return name;
}

function getItemUnit(unit) {
  if (isEn.value) {
    if (unit === '公斤' || unit === 'kg') return 'kg';
    if (unit === '升' || unit === 'L') return 'L';
    if (unit === '包') return 'bags';
  }
  return unit;
}

function formatPeriod(period) {
  if (isEn.value && period) {
    return period
      .replace('2026年10月', 'Oct 2026')
      .replace('2026年9月', 'Sep 2026')
      .replace('2026年', '2026-');
  }
  return period;
}

function getStatusLabel(status) {
  if (isEn.value && status) {
    if (status.includes('核销') || status.includes('签收') || status.includes('完成')) return 'Claimed ✓';
    if (status.includes('待')) return 'Pending';
    return 'Completed';
  }
  return status;
}

const loading = ref(false);
const claimRecords = ref([]);
const searchQuery = ref('');
const filterPeriod = ref('');
const dateRange = ref(null);

// 移动端视图控制：针对 Google Pixel 9 (412x924px) 视口
const viewMode = ref('card');
const isDesktop = ref(false);

function handleResize() {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth >= 640;
    if (isDesktop.value) {
      viewMode.value = 'table';
    }
  }
}

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);

const filteredRecords = computed(() => {
  return claimRecords.value.filter((r) => {
    if (filterPeriod.value && !r.claimPeriod.includes(filterPeriod.value)) return false;
    
    // 日期范围（开始时间点 - 结束时间点）过滤
    if (dateRange.value && Array.isArray(dateRange.value) && dateRange.value.length === 2) {
      const [start, end] = dateRange.value;
      if (start && r.claimTime < start) return false;
      if (end && r.claimTime > end) return false;
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchCard = (r.rationCardNo || '').toLowerCase().includes(q);
      const matchVoucher = (r.claimVoucherNo || '').toLowerCase().includes(q);
      const matchHead = (r.headName || '').toLowerCase().includes(q);
      if (!matchCard && !matchVoucher && !matchHead) return false;
    }
    return true;
  });
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRecords.value.slice(start, start + pageSize.value);
});

function resetPage() {
  currentPage.value = 1;
}

function resetFilters() {
  searchQuery.value = '';
  filterPeriod.value = '';
  dateRange.value = null;
  currentPage.value = 1;
}

async function loadData() {
  loading.value = true;
  try {
    const list = await getCitizenClaimRecords();
    claimRecords.value = list || [];
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Failed to load verification history' : '加载核销历史记录失败'));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
  handleResize();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
});
</script>
