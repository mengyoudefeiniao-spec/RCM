<template>
  <div class="dashboard-view space-y-6">
    <!-- 顶部欢迎与系统状态 -->
    <div class="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span>国家数字配给卡综合调度大盘</span>
          <el-tag size="small" effect="dark" type="success" class="font-bold">实时运行中</el-tag>
        </h1>
        <p class="text-xs text-blue-100 mt-1">
          连接全国 18 省粮食配送网点、民政统一国民卡数据库及跨部门反欺诈风控集群
        </p>
      </div>

      <div class="flex items-center gap-2">
        <el-button type="primary" plain class="bg-white/10 text-white border-white/20" @click="fetchData">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新大盘数据
        </el-button>
        <el-button type="warning" @click="$router.push('/review')">
          <el-icon class="mr-1"><Stamp /></el-icon>
          处理电子审核工单
        </el-button>
      </div>
    </div>

    <!-- GSAP 数字滚动关键指标卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>全国配给家庭建档总数</span>
          <el-tag size="small" type="info">户数</el-tag>
        </div>
        <div class="text-2xl font-bold text-slate-900 text-blue-600">
          <AnimatedNumber :value="stats.totalFamilies" :duration="1.4" />
        </div>
        <div class="text-[11px] text-slate-400">
          覆盖全国 18 省卡尔赫/鲁萨法等核心区
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>本月累计物资配给吨数</span>
          <el-tag size="small" type="success">吨 (Tons)</el-tag>
        </div>
        <div class="text-2xl font-bold text-slate-900 text-emerald-600">
          <AnimatedNumber :value="stats.monthlyDistributedTons" :duration="1.6" />
        </div>
        <div class="text-[11px] text-slate-400">
          履约保障率达 {{ stats.supplyFulfillmentRate }}%
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>审核工作台待办工单</span>
          <el-tag size="small" type="warning">待办</el-tag>
        </div>
        <div class="text-2xl font-bold text-slate-900 text-amber-600">
          <AnimatedNumber :value="stats.pendingReviewTickets" :duration="1.0" />
        </div>
        <div class="text-[11px] text-slate-400">
          涵盖分户、解冻、变更户主及成员复核
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>今日已审批放行申请</span>
          <el-tag size="small" type="primary">单量</el-tag>
        </div>
        <div class="text-2xl font-bold text-slate-900 text-indigo-600">
          <AnimatedNumber :value="stats.todayApprovedOrders" :duration="1.2" />
        </div>
        <div class="text-[11px] text-slate-400">
          自动识别路径通过率达 91.2%
        </div>
      </div>
    </div>

    <!-- 快捷功能矩阵直达 -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-600"></span>
          <span>高频业务协同工作台入口</span>
        </h3>
        <span class="text-xs text-slate-400">企业级微服务解耦架构</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 卡片 1: 申请分户 -->
        <div
          class="p-4 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 transition-colors cursor-pointer space-y-2"
          @click="$router.push('/citizen/split-household')"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-900">家庭分户服务</span>
            <el-tag size="small" type="purple" effect="light">智能判别</el-tag>
          </div>
          <p class="text-xs text-slate-600">
            支持结婚证明等双材料独立上传，优先系统智能判别，失败一键提交电子审核。
          </p>
        </div>

        <!-- 卡片 2: 变更户主 -->
        <div
          class="p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-colors cursor-pointer space-y-2"
          @click="$router.push('/citizen/change-head')"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-blue-900">户主继承与变更</span>
            <el-tag size="small" type="primary" effect="light">法医证明核验</el-tag>
          </div>
          <p class="text-xs text-slate-600">
            户主身故死亡公函独立上传、预览与删除，指定替代家庭户主并提交工单。
          </p>
        </div>

        <!-- 卡片 3: 审核工作台 -->
        <div
          class="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors cursor-pointer space-y-2"
          @click="$router.push('/review')"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-900">审核工作台</span>
            <el-tag size="small" type="warning" effect="light">分来源待办</el-tag>
          </div>
          <p class="text-xs text-slate-600">
            统一受理分户、解冻、变更户主、成员录入等工单，支持分部两级在线审批。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDashboardOverviewStats } from '../../api/dashboard.js';
import AnimatedNumber from '../../components/common/AnimatedNumber.vue';
import { Refresh, Stamp } from '@element-plus/icons-vue';

const stats = ref({
  totalFamilies: 0,
  activeCards: 0,
  monthlyDistributedTons: 0,
  pendingReviewTickets: 0,
  todayApprovedOrders: 0,
  fraudAlertsCount: 0,
  supplyFulfillmentRate: 0
});

async function fetchData() {
  const data = await getDashboardOverviewStats();
  stats.value = data;
}

onMounted(() => {
  fetchData();
});
</script>
