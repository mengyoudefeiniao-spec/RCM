<template>
  <div class="warehouse-view space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <el-icon class="text-teal-600"><Box /></el-icon>
            <span>国家食品配给战略物资储备与批次追溯 (SCM)</span>
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            大米、面粉、食用油、白糖等战略配给物资中央粮库出入库批次管控与安全库存预警。
          </p>
        </div>
        <el-button size="small" @click="fetchStocks">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新库存数据
        </el-button>
      </div>

      <el-table :data="stocks" v-loading="loading" border style="width: 100%" class="text-xs">
        <el-table-column prop="itemName" label="配给物资品名" min-width="160">
          <template #default="{ row }">
            <span class="font-bold text-slate-800">{{ row.itemName }}</span>
            <div class="text-[11px] text-slate-400 font-mono">{{ row.itemCode }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="物资品类" width="120" />
        <el-table-column prop="warehouseName" label="所在战略储备仓库" min-width="180" />
        <el-table-column prop="currentQty" label="当前在库余量" width="140" align="right">
          <template #default="{ row }">
            <span class="font-mono font-bold text-blue-600">
              {{ row.currentQty.toLocaleString() }}
            </span>
            <span class="text-slate-400 ml-1 text-[11px]">{{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="质检入库批次号" width="180">
          <template #default="{ row }">
            <span class="font-mono text-slate-600">{{ row.batchNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="库存保障状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.status === '库存充沛' ? 'success' : row.status === '正常配给' ? 'primary' : 'warning'"
              effect="light"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getWarehouseStockList } from '../../api/warehouse.js';
import { Box, Refresh } from '@element-plus/icons-vue';

const stocks = ref([]);
const loading = ref(false);

async function fetchStocks() {
  loading.value = true;
  try {
    const data = await getWarehouseStockList();
    stocks.value = data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchStocks();
});
</script>
