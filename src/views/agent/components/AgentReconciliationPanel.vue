<template>
  <div class="agent-reconciliation-panel space-y-4">
    <!-- 顶部对账看板卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
      <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
        <div class="flex items-center justify-between text-emerald-800">
          <span>账实双向自核相符率</span>
          <el-icon class="text-emerald-600 text-base"><CircleCheckFilled /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-emerald-700">100.0%</span>
        </div>
        <div class="text-[11px] text-emerald-700">G2B进货 vs B2C销售零差额</div>
      </div>

      <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
        <div class="flex items-center justify-between text-blue-800">
          <span>G2B 累计集中批发进货</span>
          <el-icon class="text-blue-600 text-base"><TopRight /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold font-mono text-blue-700">41,600</span>
          <span class="text-slate-400">KG/L</span>
        </div>
        <div class="text-[11px] text-blue-700">已全额结算入专管国库</div>
      </div>

      <div class="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
        <div class="flex items-center justify-between text-indigo-800">
          <span>B2C 累计社区核销交付</span>
          <el-icon class="text-indigo-600 text-base"><BottomLeft /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold font-mono text-indigo-700">20,860</span>
          <span class="text-slate-400">KG/L</span>
        </div>
        <div class="text-[11px] text-indigo-700">已逐笔核验提货码/读卡</div>
      </div>

      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
        <div class="flex items-center justify-between text-slate-700">
          <span>合法残损报损定额</span>
          <el-icon class="text-slate-500 text-base"><DeleteFilled /></el-icon>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold font-mono text-slate-800">120</span>
          <span class="text-slate-400">KG/L</span>
        </div>
        <div class="text-[11px] text-slate-500">报损率 0.28%（远低于 0.5% 警戒线）</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <el-icon class="text-blue-600"><DataAnalysis /></el-icon>
        <span class="font-bold text-slate-800">街道代理本地进销存与双向自核台账</span>
        <el-tag size="small" type="success" effect="plain" class="font-mono">实时日清</el-tag>
      </div>

      <div class="flex items-center gap-2">
        <el-button size="small" type="primary" plain @click="loadStocks">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新台账
        </el-button>
      </div>
    </div>

    <!-- 库存与对账表格 -->
    <el-table
      :data="stocks"
      v-loading="loading"
      border
      style="width: 100%"
      class="text-xs"
    >
      <el-table-column prop="itemCode" label="物资编码" width="140">
        <template #default="{ row }">
          <span class="font-mono font-bold text-slate-800">{{ row.itemCode }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="itemName" label="配给战略物资品名" min-width="180">
        <template #default="{ row }">
          <span class="font-bold text-slate-900">{{ row.itemName }}</span>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ row.batchNo }}</div>
        </template>
      </el-table-column>

      <el-table-column label="代理本地现货 (OnHand)" width="150" align="right">
        <template #default="{ row }">
          <div class="font-mono font-bold text-blue-700 text-sm">
            {{ row.currentOnHand.toLocaleString() }}
          </div>
          <div class="text-[10px] text-slate-400">{{ row.unit }}</div>
        </template>
      </el-table-column>

      <el-table-column label="G2B 累计批发进货" width="130" align="right">
        <template #default="{ row }">
          <span class="font-mono font-bold text-slate-800">{{ row.g2bTotalIn.toLocaleString() }}</span>
          <span class="text-[10px] text-slate-400 ml-1">{{ row.unit }}</span>
        </template>
      </el-table-column>

      <el-table-column label="B2C 累计核销发货" width="130" align="right">
        <template #default="{ row }">
          <span class="font-mono font-bold text-emerald-700">{{ row.b2cTotalSold.toLocaleString() }}</span>
          <span class="text-[10px] text-slate-400 ml-1">{{ row.unit }}</span>
        </template>
      </el-table-column>

      <el-table-column label="运输/储存损耗" width="110" align="right">
        <template #default="{ row }">
          <span class="font-mono font-bold text-amber-700">{{ row.lossDamaged }}</span>
          <span class="text-[10px] text-slate-400 ml-1">{{ row.unit }}</span>
        </template>
      </el-table-column>

      <el-table-column label="账实自核状态" width="140" align="center">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="row.reconciledStatus === 'BALANCED' ? 'success' : 'danger'"
            effect="dark"
          >
            {{ row.reconciledStatus === 'BALANCED' ? '账实完全吻合' : '存在差异' }}
          </el-tag>
          <div class="text-[10px] text-slate-400 mt-0.5 font-mono">差异: {{ row.bookDiscrepancy }}</div>
        </template>
      </el-table-column>

      <el-table-column label="盘点与校准" width="130" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="openInventoryModal(row)">
            实物盘点/报损
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 盘点与损耗申报模态框 -->
    <el-dialog
      v-model="inventoryModalVisible"
      title="本地实物库存盘点校准与残损申报"
      width="500px"
      destroy-on-close
    >
      <div v-if="selectedRow" class="space-y-4 text-xs">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div class="font-bold text-slate-800">{{ selectedRow.itemName }} ({{ selectedRow.itemCode }})</div>
          <div class="text-slate-500 text-[11px]">当前账面现货库存：<strong>{{ selectedRow.currentOnHand }} {{ selectedRow.unit }}</strong></div>
        </div>

        <div>
          <span class="block text-slate-600 mb-1 font-semibold">实地盘点实际数量 ({{ selectedRow.unit }}) <span class="text-rose-500">*</span></span>
          <el-input-number v-model="inventoryForm.actualCount" :min="0" :max="50000" class="w-full" />
        </div>

        <div>
          <span class="block text-slate-600 mb-1 font-semibold">申报残损报损量 ({{ selectedRow.unit }})</span>
          <el-input-number v-model="inventoryForm.lossAmount" :min="0" :max="500" class="w-full" />
        </div>

        <div>
          <span class="block text-slate-600 mb-1 font-semibold">损耗原因说明</span>
          <el-select v-model="inventoryForm.lossReason" class="w-full">
            <el-option label="长途公路颠簸包装自然磨损" value="PACKING_ATTRITION" />
            <el-option label="夏季高温干燥自然风干失重" value="NATURAL_WEIGHT_LOSS" />
            <el-option label="装卸搬运破袋漏损" value="HANDLING_DAMAGE" />
          </el-select>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <el-button @click="inventoryModalVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmitInventory">
            提交盘点并自动校准
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  CircleCheckFilled,
  TopRight,
  BottomLeft,
  DeleteFilled,
  DataAnalysis,
  Refresh
} from '@element-plus/icons-vue';
import { getAgentLocalStocks, submitStockInventory } from '../../../api/agent.js';

const loading = ref(false);
const submitting = ref(false);
const stocks = ref([]);
const inventoryModalVisible = ref(false);
const selectedRow = ref(null);

const inventoryForm = ref({
  actualCount: 0,
  lossAmount: 0,
  lossReason: 'PACKING_ATTRITION'
});

const loadStocks = async () => {
  loading.value = true;
  try {
    const res = await getAgentLocalStocks('FA-00128');
    stocks.value = res.data || [];
  } catch (error) {
    ElMessage.error((isEnNow() ? 'Failed to load local inventory' : '加载本地库存失败'));
  } finally {
    loading.value = false;
  }
};

const openInventoryModal = (row) => {
  selectedRow.value = row;
  inventoryForm.value = {
    actualCount: row.currentOnHand,
    lossAmount: 0,
    lossReason: 'PACKING_ATTRITION'
  };
  inventoryModalVisible.value = true;
};

const handleSubmitInventory = async () => {
  if (!selectedRow.value) return;
  submitting.value = true;
  try {
    const payload = {
      itemCode: selectedRow.value.itemCode,
      actualCount: inventoryForm.value.actualCount,
      lossAmount: inventoryForm.value.lossAmount,
      lossReason: inventoryForm.value.lossReason
    };
    const res = await submitStockInventory(payload);
    ElMessage.success(res.message || (isEnNow() ? 'Stocktake has taken effect' : '盘点已生效'));
    inventoryModalVisible.value = false;
    await loadStocks();
  } catch (error) {
    ElMessage.error((isEnNow() ? 'Submit failed' : '提交失败'));
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadStocks();
});
</script>
