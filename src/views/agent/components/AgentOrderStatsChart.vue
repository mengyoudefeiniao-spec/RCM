<template>
  <div class="agent-order-stats-chart space-y-4 text-xs">
    <!-- 指标卡片行 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 text-[11px]">
          <span>{{ $t('agentOrderAnalytics.totalWholesaleAmount') }}</span>
          <span class="text-blue-600 font-bold">🏦</span>
        </div>
        <div class="text-lg sm:text-xl font-bold font-mono text-slate-900">
          IQD 428,500,000
        </div>
        <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>{{ $t('agentOrderAnalytics.cumulativeOrders') }} <b class="text-slate-700 font-mono">158</b> {{ $t('reconciliation.unitsOrder') }}</span>
          <span class="text-emerald-600 font-bold">{{ $t('reconciliation.treasury100') }}</span>
        </div>
      </div>

      <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 text-[11px]">
          <span>{{ $t('agentOrderAnalytics.totalStrategicTransfer') }}</span>
          <span class="text-amber-600 font-bold">📦</span>
        </div>
        <div class="text-lg sm:text-xl font-bold font-mono text-amber-700">
          290,000 <span class="text-xs font-normal">KG/L</span>
        </div>
        <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>{{ $t('agentOrderAnalytics.coveredAgentsCount') }} <b class="text-slate-700 font-mono">32</b> {{ isEn ? 'stations' : '家' }}</span>
          <span class="text-blue-600 font-bold">{{ $t('agentOrderAnalytics.balancedSupply') }}</span>
        </div>
      </div>

      <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 text-[11px]">
          <span>{{ $t('agentOrderAnalytics.fulfillmentRate') }}</span>
          <span class="text-emerald-600 font-bold">⚡</span>
        </div>
        <div class="text-lg sm:text-xl font-bold font-mono text-emerald-700">
          98.6%
        </div>
        <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>{{ $t('agentOrderAnalytics.deliveryLeadTime') }} <b class="text-slate-700 font-mono">{{ $t('agentOrderAnalytics.within24Hours') }}</b></span>
          <span class="text-emerald-600 font-bold">{{ $t('agentOrderAnalytics.efficientTimely') }}</span>
        </div>
      </div>

      <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 text-[11px]">
          <span>{{ $t('agentOrderAnalytics.inventoryTurnover') }}</span>
          <span class="text-indigo-600 font-bold">🔄</span>
        </div>
        <div class="text-lg sm:text-xl font-bold font-mono text-indigo-700">
          7.2 <span class="text-xs font-normal">{{ $t('agentOrderAnalytics.daysPerRound') }}</span>
        </div>
        <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>{{ $t('agentOrderAnalytics.stockHealth') }}</span>
          <span class="text-emerald-600 font-bold">{{ $t('agentOrderAnalytics.excellentNoShortage') }}</span>
        </div>
      </div>
    </div>

    <!-- 可视化图表网格 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 图表 1: 各重点代销网点批发订货规模对比 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span>
            <h3 class="text-xs sm:text-sm font-bold text-slate-800">{{ $t('agentOrderAnalytics.rankingChartTitle') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">{{ $t('agentOrderAnalytics.settlementWanUnit') }}</span>
        </div>

        <div class="space-y-3 pt-1">
          <div v-for="agent in agentRankingData" :key="agent.name" class="space-y-1 text-xs">
            <div class="flex justify-between items-center text-slate-700">
              <span class="font-medium truncate max-w-[220px]">{{ agent.name }}</span>
              <div class="font-mono flex items-center gap-2">
                <span class="font-bold text-slate-900">IQD {{ agent.amountWan }}{{ isEn ? '0k' : '万' }}</span>
                <span class="text-[10px] text-slate-400">({{ agent.orders }} {{ $t('reconciliation.unitsOrder') }})</span>
              </div>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                :style="{ width: `${agent.barWidth}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表 2: 代理采购品类结构与履约指标 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            <h3 class="text-xs sm:text-sm font-bold text-slate-800">{{ $t('agentOrderAnalytics.structureChartTitle') }}</h3>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">{{ $t('agentOrderAnalytics.structureChartSub') }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div class="flex justify-between text-slate-500 text-[11px]">
              <span>{{ $t('dashboard.flourDemand') }}</span>
              <span class="font-bold text-blue-700 font-mono">41.4%</span>
            </div>
            <div class="text-base font-bold font-mono text-slate-900">120,000 KG</div>
            <div class="text-[10px] text-slate-400">{{ isEn ? 'Avg 2.5 orders/wk' : '平均订货频次 2.5次/周' }}</div>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div class="flex justify-between text-slate-500 text-[11px]">
              <span>{{ $t('dashboard.riceDemand') }}</span>
              <span class="font-bold text-teal-700 font-mono">25.9%</span>
            </div>
            <div class="text-base font-bold font-mono text-slate-900">75,000 KG</div>
            <div class="text-[10px] text-slate-400">{{ isEn ? 'Optimal shelf life & turnover' : '保质期与周转良好' }}</div>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div class="flex justify-between text-slate-500 text-[11px]">
              <span>{{ $t('dashboard.oilDemand') }}</span>
              <span class="font-bold text-amber-700 font-mono">15.5%</span>
            </div>
            <div class="text-base font-bold font-mono text-slate-900">45,000 L</div>
            <div class="text-[10px] text-slate-400">{{ isEn ? 'Summer loss rate 0.02%' : '夏季损耗率 0.02%' }}</div>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div class="flex justify-between text-slate-500 text-[11px]">
              <span>{{ $t('dashboard.sugarDemand') }}</span>
              <span class="font-bold text-indigo-700 font-mono">17.2%</span>
            </div>
            <div class="text-base font-bold font-mono text-slate-900">50,000 KG</div>
            <div class="text-[10px] text-slate-400">{{ isEn ? 'Ample strategic reserve' : '战略储备充沛' }}</div>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-emerald-900">
          <span>🛡️ <strong>{{ isEn ? 'Risk Control: ' : '履约风控结论：' }}</strong>{{ $t('agentOrderAnalytics.complianceConclusion') }}</span>
          <span class="text-emerald-700 font-mono font-bold shrink-0 ml-2">{{ $t('agentOrderAnalytics.compliance100') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const agentRankingData = computed(() => {
  if (isEn.value) {
    return [
      { name: 'Karkh 1st Central Distribution Station', amountWan: 1875, orders: 42, barWidth: 88 },
      { name: 'Rusafa 2nd Food Security Cooperative', amountWan: 1420, orders: 35, barWidth: 68 },
      { name: 'Basra Port Fair-Price Ration Store', amountWan: 2260, orders: 48, barWidth: 95 },
      { name: 'Mosul Old City Security Agency', amountWan: 1380, orders: 31, barWidth: 64 },
      { name: 'Diyala Khanaqin Border Station (Art. 140)', amountWan: 1150, orders: 26, barWidth: 52 }
    ];
  }
  return [
    { name: '卡尔赫第一配给中心综合代销站', amountWan: 1875, orders: 42, barWidth: 88 },
    { name: '鲁萨法第二配给保障供销社', amountWan: 1420, orders: 35, barWidth: 68 },
    { name: '巴士拉港口平价配给便利店', amountWan: 2260, orders: 48, barWidth: 95 },
    { name: '摩苏尔老城保供代销中心', amountWan: 1380, orders: 31, barWidth: 64 },
    { name: '迪亚拉哈奈根边境保供站 (第140号区)', amountWan: 1150, orders: 26, barWidth: 52 }
  ];
});
</script>

<style scoped>
</style>
