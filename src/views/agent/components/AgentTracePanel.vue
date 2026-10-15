<template>
  <div class="agent-trace-panel space-y-4">
    <!-- 顶部功能简介与搜索框 -->
    <div class="p-5 bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-2xl space-y-3 shadow-xs">
      <div class="flex items-center gap-2">
        <el-icon class="text-xl text-blue-400"><Compass /></el-icon>
        <h3 class="font-bold text-sm tracking-wide">{{ isEn ? 'Multi-Dimensional Flow & Audit Traceability Engine (Full-Lifecycle Penetration Lookup)' : '多维流转与审计追溯引擎 (全生命周期穿透倒查)' }}</h3>
      </div>
      <p class="text-[12px] text-slate-300 leading-relaxed max-w-3xl">
        <template v-if="isEn">
          Covers the end-to-end full chain of "Government National Central Warehouse → Street Agent Station → Resident Households". Supports bidirectional penetration lookup by <strong>material batch number</strong>, <strong>G2B/B2C order number</strong> or <strong>citizen national ID</strong>.
        </template>
        <template v-else>
          涵盖“政府国家中心仓 → 街道代理网点 → 辖区居民家庭”的端到端完整链路。支持使用<strong>物资批次号</strong>、<strong>G2B/B2C订单号</strong>或<strong>公民身份证号</strong>进行双向穿透倒查。
        </template>
      </p>

      <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <el-input
          v-model="keyword"
          :placeholder="isEn ? 'Enter Batch No. / G2B Order No. / B2C Reservation No. / National ID' : '请输入批次号 (BatchNo) / G2B订单号 / B2C预约单号 / 国民身份证号 (National ID)'"
          size="large"
          clearable
          class="flex-1"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon class="text-slate-400"><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" size="large" class="font-bold shrink-0" :loading="loading" @click="handleSearch">
          <el-icon class="mr-1"><Search /></el-icon>
          {{ isEn ? 'Full-Chain Penetration Lookup' : '全链路穿透倒查' }}
        </el-button>
      </div>

      <!-- 快捷示范查询标签 -->
      <div class="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
        <span>{{ isEn ? 'Quick Test Chains:' : '快捷测试链条：' }}</span>
        <el-tag size="small" type="info" effect="plain" class="cursor-pointer hover:text-white" @click="fillQuickSearch('BATCH-20261012-EXP202710-RC01')">
          {{ isEn ? 'By Batch: BATCH-20261012-RC01 (Rice)' : '按批次: BATCH-20261012-RC01 (大米)' }}
        </el-tag>
        <el-tag size="small" type="info" effect="plain" class="cursor-pointer hover:text-white" @click="fillQuickSearch('198504110023')">
          {{ isEn ? 'By National ID: 198504110023 (Ahmed)' : '按身份证: 198504110023 (艾哈迈德)' }}
        </el-tag>
        <el-tag size="small" type="info" effect="plain" class="cursor-pointer hover:text-white" @click="fillQuickSearch('G2B-ORD-20261012-004')">
          {{ isEn ? 'By Purchase Order: G2B-ORD-20261012-004' : '按采购单: G2B-ORD-20261012-004' }}
        </el-tag>
      </div>
    </div>

    <!-- 追溯链条卡片展示 -->
    <div v-if="traceList.length > 0" class="space-y-4">
      <div
        v-for="chain in traceList"
        :key="chain.traceId"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
      >
        <!-- 链条卡片头部 -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <el-tag type="primary" effect="dark" size="small" class="font-mono">{{ chain.traceId }}</el-tag>
              <span class="font-bold text-slate-900 text-sm">{{ chain.itemName }}</span>
              <span class="text-slate-400 font-mono text-[11px]">({{ chain.itemCode }})</span>
            </div>
            <div class="text-slate-500 text-[11px] font-mono">
              {{ isEn ? 'National Strategic Reserve Batch:' : '国家战略储备批次：' }}<strong class="text-slate-800">{{ chain.batchNo }}</strong>
            </div>
          </div>

          <!-- 三大节点实体徽章 -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-semibold text-[11px]">
              {{ isEn ? 'WH:' : '仓：' }}{{ chain.centerWarehouse }}
            </div>
            <el-icon class="text-slate-400"><Right /></el-icon>
            <div class="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 font-semibold text-[11px]">
              {{ isEn ? 'Shop:' : '店：' }}{{ chain.agentShop }}
            </div>
            <el-icon class="text-slate-400"><Right /></el-icon>
            <div class="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-[11px]">
              {{ isEn ? 'Family:' : '户：' }}{{ chain.citizenName }} ({{ chain.cardNo }})
            </div>
          </div>
        </div>

        <!-- 全生命周期流转时间线 -->
        <div class="pt-2 px-2">
          <el-timeline>
            <el-timeline-item
              v-for="(t, idx) in chain.timeline"
              :key="idx"
              :timestamp="t.time"
              placement="top"
              :type="idx === chain.timeline.length - 1 ? 'success' : 'primary'"
              :hollow="idx < chain.timeline.length - 1"
            >
              <div class="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
                <div class="font-bold text-slate-800 text-[12px] flex items-center justify-between">
                  <span>{{ t.title }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">{{ isEn ? `Node #${idx + 1}` : `节点 #${idx + 1}` }}</span>
                </div>
                <div class="text-[11px] text-slate-600 leading-relaxed">{{ t.detail }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>

    <!-- 无结果空态 -->
    <div v-else-if="!loading" class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
      <el-empty :description="isEn ? 'No traceability records found; please retry with a different batch number, order number or national ID' : '未检索到流转追溯记录，请更换批次号、订单号或身份证号重试'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Compass, Search, Right } from '@element-plus/icons-vue';
import { traceFullPipeline } from '../../../api/agent.js';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const keyword = ref('BATCH-20261012-EXP202710-RC01');
const loading = ref(false);
const traceList = ref([]);

const handleSearch = async () => {
  loading.value = true;
  try {
    const res = await traceFullPipeline(keyword.value);
    traceList.value = res.data || [];
  } catch (error) {
    ElMessage.error(t('agent.traceQueryFailed'));
  } finally {
    loading.value = false;
  }
};

const fillQuickSearch = (kw) => {
  keyword.value = kw;
  handleSearch();
};

onMounted(() => {
  handleSearch();
});
</script>
