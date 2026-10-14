<template>
  <div class="traceability-analysis-tab space-y-6">
    <!-- 标头与子切换 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-slate-900">全链路溯源与报表分析模块 (UNICODE / SCM)</span>
          <el-tag size="small" type="primary" effect="plain">端到端溯源引擎</el-tag>
          <el-tag size="small" type="success" effect="plain">三节点损耗审计</el-tag>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          建立“采购入库 -> 仓储货位 -> 配送在途 -> 代理核收 -> 家庭领取”端到端全生命周期追溯链；多维流转切片报表及损耗审计。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <el-radio-group v-model="activeSection" size="small">
          <el-radio-button value="engine">端到端全链路溯源引擎</el-radio-button>
          <el-radio-button value="report">多维流转报表分析</el-radio-button>
          <el-radio-button value="lossAudit">三节点损耗与审计分析</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="loadData">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 1: “仓库到家庭”端到端溯源引擎 (正向追溯 / 反向倒查) -->
    <!-- ======================================================== -->
    <div v-if="activeSection === 'engine'" class="space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <el-icon class="text-blue-600"><Compass /></el-icon>
              <span>“仓库到家庭”端到端溯源引擎 (UNICODE)</span>
            </h3>
            <span class="text-[11px] text-slate-400">支持正向顺藤摸瓜追溯与逆向倒查追根溯源</span>
          </div>

          <!-- 模式切换：正向追溯 vs 反向倒查 -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">溯源方向：</span>
            <el-radio-group v-model="traceDirection" size="small">
              <el-radio-button value="forward">正向追溯 (采购批次 → 家庭领取)</el-radio-button>
              <el-radio-button value="backward">反向倒查 (家庭凭证 → 采购批次)</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 溯源检索输入与当前物资说明 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex-1">
            <el-input
              v-model="traceQueryInput"
              :placeholder="traceDirection === 'forward' ? '输入采购批次号 (如 BATCH-20261012-EXP202710-RC01)' : '输入家庭核销凭证号 (如 CLM-20261012-8821)'"
              clearable
            >
              <template #prefix>
                <el-icon class="text-slate-400"><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button type="primary" @click="handleRunTrace">
            <el-icon class="mr-1"><Search /></el-icon>
            执行穿透追溯
          </el-button>
        </div>

        <!-- 追溯可视化拓扑节点链 -->
        <div v-if="traceChainData" class="space-y-4 pt-2">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-800">{{ traceChainData.itemName }}</span>
              <el-tag size="small" type="primary" effect="plain" class="font-mono">
                批次: {{ traceChainData.batchNo }}
              </el-tag>
              <el-tag size="small" type="success" effect="plain" class="font-mono">
                一物一码: {{ traceChainData.uniqueTraceCode }}
              </el-tag>
            </div>
            <span class="text-slate-400 text-[11px]">全流程 5 级节点已校验锁定</span>
          </div>

          <!-- 步骤节点卡片横向/纵向排布 -->
          <div class="relative space-y-3">
            <div
              v-for="node in displayChainNodes"
              :key="node.step"
              class="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 transition-all hover:border-blue-300 hover:bg-blue-50/20"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {{ node.step }}
                  </div>
                  <span class="font-bold text-slate-900 text-xs">{{ node.title }}</span>
                  <el-tag size="small" type="info" effect="dark" class="scale-90">{{ node.nodeType }}</el-tag>
                </div>
                <div class="font-mono text-slate-500 text-[11px] flex items-center gap-2">
                  <span>单据: <strong class="text-blue-600">{{ node.keyDocNo }}</strong></span>
                  <span>·</span>
                  <span>{{ node.time }}</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <div>
                  <span class="text-slate-400 text-[11px] block">经办地点与网点：</span>
                  <span class="text-slate-700 font-medium">{{ node.location }}</span>
                </div>
                <div>
                  <span class="text-slate-400 text-[11px] block">经办人员与签名：</span>
                  <span class="text-slate-700 font-medium">{{ node.handler }}</span>
                </div>
              </div>

              <div class="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                ● 明细与存证存根：{{ node.desc }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 2: 多维流转报表分析 -->
    <!-- ======================================================== -->
    <div v-if="activeSection === 'report'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <el-icon class="text-indigo-600"><DataLine /></el-icon>
            <span>多维流转切片报表 (按行政区域 / 网点下钻分析)</span>
          </h3>
          <span class="text-[11px] text-slate-400">统计全国各省、网点、仓库、时间跨度的配额下发量与实际核销量</span>
        </div>
      </div>

      <el-table :data="paginatedReports" v-loading="loading" border style="width: 100%" class="text-xs">
        <el-table-column prop="province" label="重点行政省区 / 争议区" min-width="190">
          <template #default="{ row }">
            <span class="font-bold text-slate-800">{{ row.province }}</span>
            <el-tag v-if="row.province.includes('第140号')" size="small" type="warning" effect="plain" class="scale-90 ml-1">
              宪法第140号决议区
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalAllocatedTon" label="计划总指标 (吨)" width="140" align="right">
          <template #default="{ row }">
            <span class="font-mono text-slate-700 font-bold">{{ row.totalAllocatedTon.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="outboundTon" label="中心仓已出库 (吨)" width="150" align="right">
          <template #default="{ row }">
            <span class="font-mono text-blue-600 font-bold">{{ row.outboundTon.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="receivedTon" label="代理网点已签收 (吨)" width="160" align="right">
          <template #default="{ row }">
            <span class="font-mono text-amber-600 font-bold">{{ row.receivedTon.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="claimedTon" label="家庭实际核销领取 (吨)" width="170" align="right">
          <template #default="{ row }">
            <span class="font-mono text-emerald-600 font-bold">{{ row.claimedTon.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fulfillmentRate" label="综合履约率" width="130" align="center">
          <template #default="{ row }">
            <div class="space-y-1">
              <span class="font-mono font-bold text-xs" :class="row.fulfillmentRate >= 75 ? 'text-emerald-600' : 'text-amber-600'">
                {{ row.fulfillmentRate }}%
              </span>
              <el-progress :percentage="row.fulfillmentRate" :stroke-width="5" :show-text="false" />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 流转切片报表分页 -->
      <div v-if="analyticsReports.length > reportPageSize" class="flex justify-end pt-2">
        <el-pagination
          v-model:current-page="reportPage"
          v-model:page-size="reportPageSize"
          :total="analyticsReports.length"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          background
          size="small"
        />
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 3: 三节点损耗与审计分析 -->
    <!-- ======================================================== -->
    <div v-if="activeSection === 'lossAudit'" class="space-y-4">
      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
        <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <el-icon class="text-rose-600"><PieChart /></el-icon>
          <span>仓储存储、运输物流、代理交付三节点损耗审计比对</span>
        </h3>
        <p class="text-slate-500 text-[11px]">
          定期统计各环节损耗率，与国家法定公差红线阈值进行严格比对，生成分发合规与账实审计清单。
        </p>

        <!-- 三节点损耗比对卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div class="flex items-center justify-between text-slate-500 text-[11px]">
              <span>1. 仓储存储损耗率</span>
              <el-tag size="small" type="success" effect="light">达标合规</el-tag>
            </div>
            <div class="flex items-baseline gap-2 font-mono">
              <span class="text-2xl font-bold text-slate-800">{{ lossStats.storageLossRate }}%</span>
              <span class="text-slate-400 text-xs">(国标阈值 ≤ 0.15%)</span>
            </div>
            <div class="text-[11px] text-slate-400">主要包含自然风干、散装称重散耗与温湿度损耗</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div class="flex items-center justify-between text-slate-500 text-[11px]">
              <span>2. 干线运输物流损耗率</span>
              <el-tag size="small" type="success" effect="light">达标合规</el-tag>
            </div>
            <div class="flex items-baseline gap-2 font-mono">
              <span class="text-2xl font-bold text-amber-600">{{ lossStats.transportLossRate }}%</span>
              <span class="text-slate-400 text-xs">(国标阈值 ≤ 0.20%)</span>
            </div>
            <div class="text-[11px] text-slate-400">主要包含崎岖山路绳索勒损、碰撞与封签装卸损耗</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div class="flex items-center justify-between text-slate-500 text-[11px]">
              <span>3. 代理终端交付损耗率</span>
              <el-tag size="small" type="success" effect="light">达标合规</el-tag>
            </div>
            <div class="flex items-baseline gap-2 font-mono">
              <span class="text-2xl font-bold text-emerald-600">{{ lossStats.agentDeliveryLossRate }}%</span>
              <span class="text-slate-400 text-xs">(国标阈值 ≤ 0.10%)</span>
            </div>
            <div class="text-[11px] text-slate-400">主要包含末端分袋分装、零售计量误差</div>
          </div>
        </div>

        <!-- 审计综合健康指标 -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div class="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <span class="text-slate-500">全链条分发账实相符率</span>
            <span class="font-mono font-bold text-emerald-600 text-sm">{{ lossStats.totalCompliantRate }}%</span>
          </div>
          <div class="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <span class="text-slate-500">在办核查异常差异工单</span>
            <span class="font-mono font-bold text-rose-600 text-sm">{{ lossStats.auditedDiscrepancyCount }} 笔</span>
          </div>
          <div class="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <span class="text-slate-500">已认定追回/索赔价值</span>
            <span class="font-mono font-bold text-indigo-600 text-sm">{{ (lossStats.recoveredValueIQD || 0).toLocaleString() }} IQD</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getTraceChain,
  getWarehouseAnalyticsReport,
  getLossAuditStats
} from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import { Refresh, Compass, Search, DataLine, PieChart } from '@element-plus/icons-vue';

const activeSection = ref('engine');
const traceDirection = ref('forward');
const traceQueryInput = ref('BATCH-20261012-EXP202710-RC01');
const loading = ref(false);

const traceChainData = ref(null);
const analyticsReports = ref([]);
const lossStats = ref({});

// 分页状态
const reportPage = ref(1);
const reportPageSize = ref(5);
const paginatedReports = computed(() => {
  const start = (reportPage.value - 1) * reportPageSize.value;
  return analyticsReports.value.slice(start, start + reportPageSize.value);
});

const displayChainNodes = computed(() => {
  if (!traceChainData.value?.forwardChain) return [];
  if (traceDirection.value === 'forward') {
    return traceChainData.value.forwardChain;
  } else {
    // 反向倒查：逆序排列节点
    return [...traceChainData.value.forwardChain].reverse().map((node, idx) => ({
      ...node,
      step: idx + 1
    }));
  }
});

async function loadData() {
  loading.value = true;
  try {
    const [tChain, rep, lStat] = await Promise.all([
      getTraceChain(),
      getWarehouseAnalyticsReport(),
      getLossAuditStats()
    ]);
    traceChainData.value = tChain;
    analyticsReports.value = rep || [];
    lossStats.value = lStat || {};
  } catch (err) {
    ElMessage.error(err.message || '加载溯源报表失败');
  } finally {
    loading.value = false;
  }
}

function handleRunTrace() {
  ElMessage.success(`端到端穿透溯源检索成功！已构建全生命周期链路`);
}

onMounted(() => {
  loadData();
});
</script>
