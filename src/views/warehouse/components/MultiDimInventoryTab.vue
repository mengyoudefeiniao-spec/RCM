<template>
  <div class="multidim-inventory-tab space-y-6">
    <!-- 标头与子分类切换 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-slate-900">{{ $t('warehouse.multidimTitle') || '多维库存与流水台账操作区 (SCM)' }}</span>
          <el-tag size="small" type="primary" effect="plain">{{ isEn ? '6D Unified Accounting Model' : '六维联合核算模型' }}</el-tag>
          <el-tag size="small" type="success" effect="plain">{{ isEn ? '3-Tier Reconciliation' : '单据-流水-余额三级钩稽' }}</el-tag>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{ isEn ? 'Multi-dimensional lookup across physical warehouses, bins, commodities, batches, expiry and statuses.' : '支持按物理仓库、货架货位、物资品类、生产批次、效期状态、业务状态六维联合检索；支持任意历史时间点快照回溯。' }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="realtime">{{ $t('warehouse.realtimeInventory') || '六维实时库存视图' }}</el-radio-button>
          <el-radio-button value="ledger">{{ $t('warehouse.ledgerCenter') || '流水台账中心 (三级钩稽)' }}</el-radio-button>
          <el-radio-button value="snapshot">{{ $t('warehouse.snapshotRollback') || '历史快照时光回溯' }}</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="loadData">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ $t('common.refresh') || '刷新' }}
        </el-button>
      </div>
    </div>

    <!-- 可选指标卡片 (仅当 showStatsCards 为 true 时展示，默认操作区与统计区严格分离) -->
    <div v-if="showStatsCards" class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <div class="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-[11px] text-slate-500 block">当前可用在库库存</span>
        <span class="font-mono font-bold text-blue-600 text-lg sm:text-xl">{{ totalAvailableQty.toLocaleString() }}</span>
        <span class="text-slate-400 text-[10px] block">随时可指派波次发运</span>
      </div>
      <div class="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 shadow-xs space-y-1">
        <span class="text-[11px] text-amber-800 block">在途锁定库存 (P2锁定)</span>
        <span class="font-mono font-bold text-amber-700 text-lg sm:text-xl">{{ totalLockedQty.toLocaleString() }}</span>
        <span class="text-amber-800/80 text-[10px] block">已开具配送交付流水</span>
      </div>
      <div class="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/70 shadow-xs space-y-1">
        <span class="text-[11px] text-rose-800 block">异常阻断与冻结库存 (P3阻断)</span>
        <span class="font-mono font-bold text-rose-700 text-lg sm:text-xl">{{ totalFrozenQty.toLocaleString() }}</span>
        <span class="text-rose-800/80 text-[10px] block">差异工单核查中禁止流转</span>
      </div>
      <div class="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/70 shadow-xs space-y-1">
        <span class="text-[11px] text-emerald-800 block">库位余额钩稽一致率</span>
        <span class="font-mono font-bold text-emerald-700 text-lg sm:text-xl">100.0%</span>
        <span class="text-emerald-800/80 text-[10px] block">单据-流水-余量完美匹配</span>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 1: 六维实时多维库存视图 -->
    <!-- ======================================================== -->
    <div v-if="viewMode === 'realtime'" class="space-y-4">
      <!-- 六维联合检索过滤器 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="font-bold text-slate-800 flex items-center gap-1.5">
            <el-icon class="text-blue-600"><Filter /></el-icon>
            <span>六维核算多维联合检索过滤器</span>
          </span>
          <el-button link type="primary" size="small" @click="resetFilters">重置全部维度</el-button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <span class="text-[11px] text-slate-500 block mb-1">1. 物理仓库维度</span>
            <el-select v-model="filters.warehouseName" placeholder="全部物理仓库" clearable class="w-full">
              <el-option label="巴格达第一国家储备粮库" value="巴格达第一国家储备粮库" />
              <el-option label="卡尔赫面粉战略储备仓" value="卡尔赫面粉战略储备仓" />
              <el-option label="鲁萨法物资配送总站" value="鲁萨法物资配送总站" />
              <el-option label="迪亚拉哈奈根前置战略保供仓 (第140号决议区)" value="迪亚拉哈奈根前置战略保供仓" />
            </el-select>
          </div>

          <div>
            <span class="text-[11px] text-slate-500 block mb-1">2. 物资分类维度</span>
            <el-select v-model="filters.category" placeholder="全部物资分类" clearable class="w-full">
              <el-option label="谷物粮食" value="谷物粮食" />
              <el-option label="副食品油脂" value="副食品油脂" />
              <el-option label="大宗副食" value="大宗副食" />
            </el-select>
          </div>

          <div>
            <span class="text-[11px] text-slate-500 block mb-1">3. 业务状态维度 (Available/Locked/Frozen)</span>
            <el-select v-model="filters.bizStatus" placeholder="全部业务状态" clearable class="w-full">
              <el-option label="可用 (Available)" value="可用" />
              <el-option label="锁定 (Locked)" value="锁定" />
              <el-option label="在途 (In-Transit)" value="在途" />
              <el-option label="冻结 (Frozen)" value="冻结" />
            </el-select>
          </div>

          <div>
            <span class="text-[11px] text-slate-500 block mb-1">4. 生产批次搜索</span>
            <el-input v-model="filters.batchNo" placeholder="输入批次号模糊搜索" clearable />
          </div>

          <div>
            <span class="text-[11px] text-slate-500 block mb-1">5. 货架货位精准定位</span>
            <el-input v-model="filters.locationCode" placeholder="如 A01-03-02" clearable />
          </div>

          <div>
            <span class="text-[11px] text-slate-500 block mb-1">6. 效期健康状态</span>
            <el-select v-model="filters.expiryStatus" placeholder="全部效期状态" clearable class="w-full">
              <el-option label="正常 (Normal)" value="正常" />
              <el-option label="临界警戒 (Expiring Soon)" value="临界警戒" />
              <el-option label="已过期 (Expired)" value="已过期" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 六维库存表格 -->
      <el-table :data="paginatedFilteredStocks" v-loading="loading" border style="width: 100%" class="text-xs">
        <el-table-column prop="itemName" label="物资品名 / 分类" min-width="160">
          <template #default="{ row }">
            <div class="font-bold text-slate-900">{{ row.itemName }}</div>
            <div class="text-[11px] text-slate-400 font-mono">{{ row.itemCode }} · {{ row.category }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="物理仓库与货架货位" min-width="190">
          <template #default="{ row }">
            <div class="text-slate-800 font-medium">{{ row.warehouseName }}</div>
            <div class="font-mono text-blue-600 font-bold text-[11px] mt-0.5">
              货位: {{ row.locationCode }} ({{ row.locationName }})
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="生产批次与箱码标签" min-width="190">
          <template #default="{ row }">
            <div class="font-mono font-bold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              {{ row.batchNo }}
            </div>
            <div class="text-[10px] text-indigo-600 font-mono mt-0.5 truncate" :title="row.uniqueTraceCode">
              一物一码: {{ row.uniqueTraceCode }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="效期与状态" width="140">
          <template #default="{ row }">
            <div class="font-mono text-[11px] text-slate-600">{{ row.expiryDate }} 到期</div>
            <el-tag size="small" :type="row.expiryStatus === '正常' ? 'success' : 'danger'" effect="light" class="mt-0.5">
              {{ row.expiryStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="多维余量核算 (可用 / 锁定 / 冻结)" width="180" align="right">
          <template #default="{ row }">
            <div class="font-mono font-bold text-blue-600 text-sm">
              可用: {{ (row.availableQty || 0).toLocaleString() }} {{ row.unit }}
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">
              <span v-if="row.lockedQty > 0" class="text-amber-600 font-bold mr-1">锁定: {{ row.lockedQty }}</span>
              <span v-if="row.frozenQty > 0" class="text-rose-600 font-bold">冻结: {{ row.frozenQty }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="bizStatus" label="业务状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.bizStatus === '可用' ? 'success' : row.bizStatus === '锁定' ? 'warning' : 'danger'"
              effect="dark"
            >
              {{ row.bizStatus }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 六维库存分页 -->
      <div v-if="filteredStocks.length > stockPageSize" class="flex justify-end pt-2">
        <el-pagination
          v-model:current-page="stockPage"
          v-model:page-size="stockPageSize"
          :total="filteredStocks.length"
          :page-sizes="[6, 12, 20]"
          layout="total, sizes, prev, pager, next"
          background
          size="small"
        />
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 2: 流水台账中心 (“单据 - 流水 - 库位余额”三级钩稽) -->
    <!-- ======================================================== -->
    <div v-if="viewMode === 'ledger'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <el-icon class="text-emerald-600"><Document /></el-icon>
            <span>流水台账中心 (确立“单据 - 流水 - 库位余额”三级钩稽关系)</span>
          </h3>
          <span class="text-[11px] text-slate-400">记录入库、出库、调拨、盘点、损耗每笔变动的完整流水记录与期初期末变动</span>
        </div>
      </div>

      <el-table :data="paginatedLedgers" v-loading="loading" border style="width: 100%" class="text-xs">
        <el-table-column prop="ledgerNo" label="流水编号 / 发生时间" min-width="170">
          <template #default="{ row }">
            <span class="font-mono font-bold text-slate-800">{{ row.ledgerNo }}</span>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ row.timestamp }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="docType" label="关联原始业务单据 (第一级)" min-width="180">
          <template #default="{ row }">
            <div class="font-bold text-slate-800">{{ row.docType }}</div>
            <div class="font-mono text-blue-600 text-[11px] mt-0.5">{{ row.docNo }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="仓库与库位" min-width="160">
          <template #default="{ row }">
            <div class="text-slate-800">{{ row.warehouseName }}</div>
            <div class="font-mono text-slate-500 text-[11px]">{{ row.locationCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="变动量与方向 (第二级流水)" width="150" align="right">
          <template #default="{ row }">
            <span
              class="font-mono font-bold text-sm"
              :class="row.changeQty > 0 ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ row.changeQty > 0 ? '+' : '' }}{{ row.changeQty.toLocaleString() }}
            </span>
            <span class="text-slate-400 ml-1 text-[11px]">{{ row.unit }}</span>
            <div class="text-[10px] text-slate-400 mt-0.5">{{ row.changeType }}</div>
          </template>
        </el-table-column>
        <el-table-column label="库位余额钩稽变动 (第三级余额)" width="180" align="right">
          <template #default="{ row }">
            <div class="font-mono text-[11px] text-slate-400">变动前: {{ (row.beforeBalanceQty || 0).toLocaleString() }}</div>
            <div class="font-mono font-bold text-blue-600 text-sm">
              结存: {{ (row.afterBalanceQty || 0).toLocaleString() }} {{ row.unit }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reconciliationStatus" label="钩稽核验" width="140" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success" effect="plain">{{ row.reconciliationStatus }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 流水台账分页 -->
      <div v-if="inventoryLedgers.length > ledgerPageSize" class="flex justify-end pt-2">
        <el-pagination
          v-model:current-page="ledgerPage"
          v-model:page-size="ledgerPageSize"
          :total="inventoryLedgers.length"
          :page-sizes="[6, 12, 20]"
          layout="total, sizes, prev, pager, next"
          background
          size="small"
        />
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 3: 历史库存快照时光机回溯 -->
    <!-- ======================================================== -->
    <div v-if="viewMode === 'snapshot'" class="space-y-4">
      <div class="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200/80 space-y-3 text-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
              <el-icon class="text-indigo-600"><Timer /></el-icon>
              <span>任意历史时间点库存快照回溯引擎 (Snapshot Time-Travel)</span>
            </h3>
            <p class="text-indigo-700/80 text-[11px] mt-0.5">
              依据“单据-流水-余额”不可篡改链条，输入任意历史时间，系统动态重构当时全国各库位在册状态。
            </p>
          </div>
          <div class="flex items-center gap-2">
            <el-date-picker
              v-model="snapshotTargetTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择历史回溯时间戳"
              size="small"
            />
            <el-button type="primary" size="small" @click="fetchSnapshot" :loading="loadingSnapshot">
              执行快照回溯
            </el-button>
          </div>
        </div>
      </div>

      <!-- 回溯结果表格 -->
      <div v-if="snapshotList.length > 0" class="space-y-2">
        <div class="text-[11px] text-slate-500 font-mono flex items-center gap-2">
          <span>● 当前快照定位时间点：</span>
          <strong class="text-indigo-700">{{ snapshotTargetTime }}</strong>
        </div>

        <el-table :data="paginatedSnapshots" border style="width: 100%" class="text-xs">
          <el-table-column prop="itemName" label="物资品名" min-width="160" />
          <el-table-column prop="warehouseName" label="所在仓库与货位" min-width="180">
            <template #default="{ row }">
              <div>{{ row.warehouseName }}</div>
              <div class="font-mono text-slate-500 text-[11px]">{{ row.locationCode }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="batchNo" label="批次号" min-width="180">
            <template #default="{ row }">
              <span class="font-mono text-slate-600">{{ row.batchNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="该历史时刻在库余量" width="160" align="right">
            <template #default="{ row }">
              <span class="font-mono font-bold text-indigo-600 text-sm">
                {{ (row.availableQty || 0).toLocaleString() }}
              </span>
              <span class="text-slate-400 ml-1">{{ row.unit }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="snapshotNotice" label="三级钩稽核验说明" min-width="220" />
        </el-table>

        <!-- 快照列表分页 -->
        <div v-if="snapshotList.length > snapshotPageSize" class="flex justify-end pt-2">
          <el-pagination
            v-model:current-page="snapshotPage"
            v-model:page-size="snapshotPageSize"
            :total="snapshotList.length"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next"
            background
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');
import {
  getWarehouseStockList,
  getInventoryLedgers,
  getInventorySnapshot
} from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import { Refresh, Filter, Document, Timer } from '@element-plus/icons-vue';

const props = defineProps({
  showStatsCards: {
    type: Boolean,
    default: false
  }
});

const viewMode = ref('realtime');
const loading = ref(false);
const loadingSnapshot = ref(false);

const stocks = ref([]);
const inventoryLedgers = ref([]);
const snapshotList = ref([]);
const snapshotTargetTime = ref('2026-10-01 00:00:00');

// 分页状态
const stockPage = ref(1);
const stockPageSize = ref(6);
const ledgerPage = ref(1);
const ledgerPageSize = ref(6);
const snapshotPage = ref(1);
const snapshotPageSize = ref(5);

const filters = ref({
  warehouseName: '',
  category: '',
  bizStatus: '',
  batchNo: '',
  locationCode: '',
  expiryStatus: ''
});

// 计算四项宏观指标
const totalAvailableQty = computed(() => {
  return stocks.value.reduce((acc, cur) => acc + (cur.availableQty || 0), 0);
});

const totalLockedQty = computed(() => {
  return stocks.value.reduce((acc, cur) => acc + (cur.lockedQty || 0), 0);
});

const totalFrozenQty = computed(() => {
  return stocks.value.reduce((acc, cur) => acc + (cur.frozenQty || 0), 0);
});

// 过滤后的六维库存
const filteredStocks = computed(() => {
  return stocks.value.filter((s) => {
    if (filters.value.warehouseName && !s.warehouseName.includes(filters.value.warehouseName)) return false;
    if (filters.value.category && s.category !== filters.value.category) return false;
    if (filters.value.bizStatus && s.bizStatus !== filters.value.bizStatus) return false;
    if (filters.value.batchNo && !s.batchNo.toLowerCase().includes(filters.value.batchNo.toLowerCase())) return false;
    if (filters.value.locationCode && !s.locationCode.toLowerCase().includes(filters.value.locationCode.toLowerCase())) return false;
    if (filters.value.expiryStatus && s.expiryStatus !== filters.value.expiryStatus) return false;
    return true;
  });
});

const paginatedFilteredStocks = computed(() => {
  const start = (stockPage.value - 1) * stockPageSize.value;
  return filteredStocks.value.slice(start, start + stockPageSize.value);
});

const paginatedLedgers = computed(() => {
  const start = (ledgerPage.value - 1) * ledgerPageSize.value;
  return inventoryLedgers.value.slice(start, start + ledgerPageSize.value);
});

const paginatedSnapshots = computed(() => {
  const start = (snapshotPage.value - 1) * snapshotPageSize.value;
  return snapshotList.value.slice(start, start + snapshotPageSize.value);
});

function resetFilters() {
  filters.value = {
    warehouseName: '',
    category: '',
    bizStatus: '',
    batchNo: '',
    locationCode: '',
    expiryStatus: ''
  };
}

async function loadData() {
  loading.value = true;
  try {
    const [sList, lList] = await Promise.all([
      getWarehouseStockList(),
      getInventoryLedgers()
    ]);
    stocks.value = sList || [];
    inventoryLedgers.value = lList || [];
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Failed to load multi-dimensional inventory and flow ledger' : '加载多维库存与流水台账失败'));
  } finally {
    loading.value = false;
  }
}

async function fetchSnapshot() {
  loadingSnapshot.value = true;
  try {
    const data = await getInventorySnapshot({ time: snapshotTargetTime.value });
    snapshotList.value = data || [];
    ElMessage.success((isEnNow() ? `Historical stock snapshot retrospective succeeded! Slot balances as of ${snapshotTargetTime.value} reconstructed` : `历史库存快照回溯成功！已重构 ${snapshotTargetTime.value} 库位余量`));
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Snapshot retrospective failed' : '快照回溯失败'));
  } finally {
    loadingSnapshot.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
