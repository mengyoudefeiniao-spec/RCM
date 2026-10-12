<template>
  <div class="agent-mgmt-view space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <el-icon class="text-amber-600"><Shop /></el-icon>
            <span>代理管理与网点容积率监管</span>
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            执行单店 1,500 户容量红线监控、合并网点不超过 750 户限制以及经营面积实地抽检考核。
          </p>
        </div>
        <el-button size="small" @click="fetchAgents">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新代销点列表
        </el-button>
      </div>

      <el-table :data="agents" v-loading="loading" border style="width: 100%" class="text-xs">
        <el-table-column prop="id" label="网点许可编号" width="110">
          <template #default="{ row }">
            <span class="font-mono font-bold text-slate-800">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="网点官方名称" min-width="180">
          <template #default="{ row }">
            <span class="font-semibold text-slate-800">{{ row.name }}</span>
            <div class="text-[11px] text-slate-400">{{ row.address }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="agentType" label="经营品类" width="120" />
        <el-table-column prop="ownerName" label="经营负责人" width="120" />
        <el-table-column prop="storeAreaSqM" label="营业面积" width="100" align="right">
          <template #default="{ row }">
            <span class="font-mono">{{ row.storeAreaSqM }} ㎡</span>
          </template>
        </el-table-column>
        <el-table-column label="服务户数 / 容积率警戒" min-width="180">
          <template #default="{ row }">
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-mono font-bold">{{ row.householdsCount }} / {{ row.maxCap }} 户</span>
                <span class="font-mono">{{ ((row.householdsCount / row.maxCap) * 100).toFixed(1) }}%</span>
              </div>
              <el-progress
                :percentage="Math.min(100, (row.householdsCount / row.maxCap) * 100)"
                :status="row.householdsCount >= 1400 ? 'warning' : 'primary'"
                :show-text="false"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="营业状态" width="140" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.status.includes('预警') ? 'warning' : 'success'"
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
import { getAgentList } from '../../api/agent.js';
import { Shop, Refresh } from '@element-plus/icons-vue';

const agents = ref([]);
const loading = ref(false);

async function fetchAgents() {
  loading.value = true;
  try {
    const data = await getAgentList();
    agents.value = data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchAgents();
});
</script>
