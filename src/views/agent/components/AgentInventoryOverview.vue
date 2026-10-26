<template>
  <div class="agent-inventory-ledger" :class="isAppMode ? 'space-y-3' : 'space-y-4 text-xs'">
    <!-- 指标卡片行 (针对 Pixel 9 412px 视口微调内边距与字体阶梯) -->
    <div class="grid" :class="isAppMode ? 'grid-cols-2 gap-2.5' : 'grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4'">
      <div class="p-2.5 sm:p-3.5 bg-white rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-1.5 min-w-0">
        <div class="flex items-start justify-between gap-1 text-[#58685D] text-[10px] sm:text-[11px]">
          <span class="leading-tight min-w-0">{{ $t('agentInventoryLedger.bookInventory') }}</span>
          <span class="shrink-0">🏦</span>
        </div>
        <div class="text-sm sm:text-xl font-bold font-mono text-[#1B3123] truncate">
          <bdi dir="ltr">132,500 <span class="text-[9px] sm:text-xs font-normal">KG/L</span></bdi>
        </div>
        <div class="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span class="truncate min-w-0">{{ $t('agentInventoryLedger.registeredCategories') }} <b class="text-[#43554B] font-mono">4</b> {{ $t('agentInventoryLedger.categoriesUnit') }}</span>
          <span class="text-[#2F7A50] font-bold shrink-0">{{ $t('agentInventoryLedger.bookRealMatched') }}</span>
        </div>
      </div>

      <div class="p-2.5 sm:p-3.5 bg-white rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-1.5 min-w-0">
        <div class="flex items-start justify-between gap-1 text-[#58685D] text-[10px] sm:text-[11px]">
          <span class="leading-tight min-w-0">{{ $t('agentInventoryLedger.weighingErrorRate') }}</span>
          <span class="shrink-0">⚖️</span>
        </div>
        <div class="text-sm sm:text-xl font-bold font-mono text-[#7A5F21] truncate">
          <bdi dir="ltr">±0.38%</bdi>
        </div>
        <div class="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span class="truncate min-w-0">{{ $t('agentInventoryLedger.allowedDeviation') }}</span>
          <span class="text-[#2F7A50] font-bold shrink-0">{{ $t('agentInventoryLedger.meteringQualified') }}</span>
        </div>
      </div>

      <div class="p-2.5 sm:p-3.5 bg-white rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-1.5 min-w-0">
        <div class="flex items-start justify-between gap-1 text-[#58685D] text-[10px] sm:text-[11px]">
          <span class="leading-tight min-w-0">{{ $t('agentInventoryLedger.totalShortage') }}</span>
          <span class="shrink-0">📉</span>
        </div>
        <div class="text-sm sm:text-xl font-bold font-mono text-[#C04442] truncate">
          <bdi dir="ltr">-1,860 <span class="text-[9px] sm:text-xs font-normal">KG</span></bdi>
        </div>
        <div class="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span class="truncate min-w-0">{{ $t('agentInventoryLedger.shortageRateNote') }}</span>
          <span class="text-[#2F7A50] font-bold shrink-0">{{ $t('agentInventoryLedger.withinQuota') }}</span>
        </div>
      </div>

      <div class="p-2.5 sm:p-3.5 bg-white rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-1.5 min-w-0">
        <div class="flex items-start justify-between gap-1 text-[#58685D] text-[10px] sm:text-[11px]">
          <span class="leading-tight min-w-0">{{ $t('agentInventoryLedger.totalSurplus') }}</span>
          <span class="shrink-0">📈</span>
        </div>
        <div class="text-sm sm:text-xl font-bold font-mono text-[#2F5B44] truncate">
          <bdi dir="ltr">+420 <span class="text-[9px] sm:text-xs font-normal">KG</span></bdi>
        </div>
        <div class="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span class="truncate min-w-0">{{ $t('agentInventoryLedger.surplusNote') }}</span>
          <span class="text-[#2F7A50] font-bold shrink-0">{{ $t('agentInventoryLedger.surplusHandled') }}</span>
        </div>
      </div>
    </div>

    <!-- 公民服务统计 (新增模块: 网点服务的公民侧核心指标) -->
    <div class="bg-white p-2.5 sm:p-3.5 rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-2.5">
      <div class="flex items-center gap-2 border-b border-[#E9F1EB] pb-2">
        <span class="w-2 h-2 rounded-full bg-[#C9A13B] shrink-0"></span>
        <h3 class="text-xs sm:text-sm font-bold text-[#1F3326] truncate min-w-0">{{ $t('agentInventoryLedger.citizenStatsTitle') }}</h3>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div class="p-2 rounded-lg bg-[#F3F8F4]/60 border border-[#E9F1EB] space-y-0.5 min-w-0">
          <div class="text-[9px] sm:text-[10px] text-[#8A9A8F] leading-tight">{{ $t('agentInventoryLedger.citizenFamilies') }}</div>
          <div class="text-sm sm:text-base font-bold font-mono text-[#1B3123]">1,860 <span class="text-[9px] font-normal">{{ $t('agentInventoryLedger.familiesUnit') }}</span></div>
        </div>
        <div class="p-2 rounded-lg bg-[#F3F8F4]/60 border border-[#E9F1EB] space-y-0.5 min-w-0">
          <div class="text-[9px] sm:text-[10px] text-[#8A9A8F] leading-tight">{{ $t('agentInventoryLedger.citizenClaims') }}</div>
          <div class="text-sm sm:text-base font-bold font-mono text-[#2A5440]">2,140 <span class="text-[9px] font-normal">{{ $t('agentInventoryLedger.claimsUnit') }}</span></div>
        </div>
        <div class="p-2 rounded-lg bg-[#F3F8F4]/60 border border-[#E9F1EB] space-y-0.5 min-w-0">
          <div class="text-[9px] sm:text-[10px] text-[#8A9A8F] leading-tight">{{ $t('agentInventoryLedger.citizenBioRate') }}</div>
          <div class="text-sm sm:text-base font-bold font-mono text-[#2F5B44]"><bdi dir="ltr">99.2%</bdi></div>
        </div>
        <div class="p-2 rounded-lg bg-[#F3F8F4]/60 border border-[#E9F1EB] space-y-0.5 min-w-0">
          <div class="text-[9px] sm:text-[10px] text-[#8A9A8F] leading-tight">{{ $t('agentInventoryLedger.citizenAvgFreq') }}</div>
          <div class="text-sm sm:text-base font-bold font-mono text-[#7A5F21]">3.2 <span class="text-[9px] font-normal">{{ $t('agentInventoryLedger.freqUnit') }}</span></div>
        </div>
      </div>
    </div>

    <!-- 可视化图表网格 (APP 视口上下堆叠、全宽对齐) -->
    <div class="grid" :class="isAppMode ? 'grid-cols-1 !gap-2.5' : 'grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'">
      <!-- 图表 1: 各品类称重误差对比 -->
      <div class="bg-white rounded-lg border border-[#D9E5DB]/90 shadow-2xs min-w-0 h-full flex flex-col" :class="isAppMode ? 'p-3 space-y-2.5' : 'p-3 sm:p-4 space-y-3'">
        <div class="flex items-center justify-between gap-2 border-b border-[#E9F1EB] pb-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2 h-2 rounded-full bg-[#326445] shrink-0"></span>
            <h3 class="text-xs sm:text-sm font-bold text-[#1F3326] truncate min-w-0">{{ $t('agentInventoryLedger.weighingChartTitle') }}</h3>
          </div>
          <span class="text-[10px] text-[#8A9A8F] font-mono shrink-0">{{ $t('agentInventoryLedger.weighingChartUnit') }}</span>
        </div>

        <div class="space-y-2.5 pt-1 flex-1">
          <div v-for="item in weighingData" :key="item.nameKey" class="space-y-1 text-xs bg-[#F3F8F4]/60 p-2 rounded-lg border border-[#E9F1EB]/80">
            <div class="flex items-center justify-between gap-2 text-[#43554B]">
              <span class="font-bold text-[#1F3326] text-[11px] sm:text-xs leading-tight min-w-0">{{ $t(`agentInventoryLedger.${item.nameKey}`) }}</span>
              <bdi dir="ltr"
                class="font-mono font-bold text-[10px] sm:text-xs shrink-0"
                :class="item.level === 'warn' ? 'text-[#C9A13B]' : 'text-[#2A5440]'"
              >{{ item.rateText }}</bdi>
            </div>
            <div class="w-full bg-[#D9E5DB]/60 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="item.level === 'warn' ? 'bg-gradient-to-r rtl:bg-gradient-to-l from-[#C9A13B] to-[#C9A13B]' : 'bg-gradient-to-r rtl:bg-gradient-to-l from-[#5C8A6B] to-[#5C8A6B]'"
                :style="{ width: `${item.barWidth}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表 2: 近月盘盈盘亏台账 (损耗归因追溯) -->
      <div class="bg-white rounded-lg border border-[#D9E5DB]/90 shadow-2xs min-w-0 h-full flex flex-col" :class="isAppMode ? 'p-2.5 space-y-2' : 'p-3 sm:p-4 space-y-3'">
        <div class="flex items-center justify-between gap-2 border-b border-[#E9F1EB] pb-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2 h-2 rounded-full bg-[#2F7A50] shrink-0"></span>
            <h3 class="text-xs sm:text-sm font-bold text-[#1F3326] truncate min-w-0">{{ $t('agentInventoryLedger.ledgerListTitle') }}</h3>
          </div>
          <span class="text-[10px] text-[#8A9A8F] font-mono shrink-0">{{ $t('agentInventoryLedger.ledgerListUnit') }}</span>
        </div>

        <div class="space-y-2 pt-1 flex-1">
          <div
            v-for="(row, idx) in ledgerRecords"
            :key="idx"
            class="p-2 rounded-lg bg-[#F3F8F4]/60 border border-[#E9F1EB]/80 space-y-1.5 min-w-0"
          >
            <!-- 行 1: 月份 + 盘盈/盘亏 + 差异量 -->
            <div class="flex items-center justify-between gap-1.5 min-w-0">
              <div class="flex items-center gap-1.5 min-w-0">
                <bdi dir="ltr" class="text-[10px] sm:text-[11px] font-mono font-bold text-[#43554B] shrink-0">{{ row.month }}</bdi>
                <el-tag size="small" :type="row.type === 'surplus' ? 'success' : 'danger'" effect="plain" class="scale-90 origin-left rtl:origin-right shrink-0">
                  {{ row.type === 'surplus' ? $t('agentInventoryLedger.typeSurplus') : $t('agentInventoryLedger.typeShortage') }}
                </el-tag>
              </div>
              <bdi dir="ltr"
                class="font-mono font-bold text-[10px] sm:text-xs shrink-0"
                :class="row.type === 'surplus' ? 'text-[#2F5B44]' : 'text-[#C04442]'"
              >{{ row.amountText }} {{ $t('agentInventoryLedger.kgUnit') }}</bdi>
            </div>
            <!-- 行 2: 损耗归因 (允许换行，不再截断) -->
            <div class="text-[9px] sm:text-[10px] text-[#8A9A8F] leading-snug min-w-0">🏷️ {{ $t(`agentInventoryLedger.${row.causeKey}`) }}</div>
            <!-- 行 3: 处理状态 -->
            <div>
              <el-tag size="small" type="info" effect="plain" class="scale-90 origin-left rtl:origin-right">{{ $t(`agentInventoryLedger.${row.status}`) }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 台账风控结论横幅 (APP 模式纵向堆叠，避免与右侧徽标重叠) -->
    <div
      class="p-2.5 rounded-lg bg-[#EFF5F1]/80 border border-[#C7E0CE] text-[#12241A] gap-1.5 text-[11px]"
      :class="isAppMode ? 'flex flex-col items-stretch space-y-1' : 'flex flex-col sm:flex-row sm:items-center justify-between'"
    >
      <span class="leading-snug min-w-0">{{ $t('agentInventoryLedger.riskLabel') }}{{ $t('agentInventoryLedger.riskConclusion') }}</span>
      <span class="text-[#2F5B44] font-mono font-bold shrink-0" :class="isAppMode ? 'self-start' : 'sm:self-auto'">{{ $t('agentInventoryLedger.riskOk') }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isAppMode = computed(() => {
  if (route.query.layout === 'app') return true;
  if (route.query.layout === 'web') return false;
  return sessionStorage.getItem('rcm_layout_mode') === 'app';
});

// Restore the previous demonstration overview; the Web procurement ledger remains live.
const weighingData = [
  { nameKey: 'itemFlour', rateText: '+0.32%', barWidth: 64, level: 'ok' },
  { nameKey: 'itemRice', rateText: '-0.18%', barWidth: 36, level: 'ok' },
  { nameKey: 'itemOil', rateText: '+0.44%', barWidth: 88, level: 'warn' },
  { nameKey: 'itemSugar', rateText: '-0.12%', barWidth: 24, level: 'ok' }
];

// 近月盘盈盘亏台账记录 (损耗归因追溯)
const ledgerRecords = [
  { month: '2026-09', type: 'shortage', amountText: '-820', causeKey: 'causeTransit', status: 'statusWritten' },
  { month: '2026-09', type: 'surplus', amountText: '+185', causeKey: 'causeWeighing', status: 'statusSubmitted' },
  { month: '2026-08', type: 'shortage', amountText: '-1,040', causeKey: 'causePackaging', status: 'statusWritten' },
  { month: '2026-08', type: 'shortage', amountText: '-560', causeKey: 'causeEvaporation', status: 'statusPending' },
  { month: '2026-07', type: 'surplus', amountText: '+235', causeKey: 'causeWeighing', status: 'statusSubmitted' }
];
</script>

<style scoped>
</style>
