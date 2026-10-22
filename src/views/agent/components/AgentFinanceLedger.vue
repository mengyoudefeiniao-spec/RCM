<template>
  <div v-loading="loading" class="py-4 space-y-4 text-[#1F3326]">
    <!-- 页头与筛选 -->
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-bold text-[#183B28]">{{ $t('agentFinance.title') }}</h2>
          <p class="mt-1 max-w-3xl text-xs leading-relaxed text-[#8A9A8F]">{{ $t('agentFinance.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap items-end gap-2">
          <label class="text-[11px] font-semibold text-[#58685D]">
            <span class="mb-1 block">{{ $t('agentFinance.periodLabel') }}</span>
            <el-select v-model="period" size="small" class="!w-32">
              <el-option :label="$t('agentFinance.period30')" :value="30" />
              <el-option :label="$t('agentFinance.period90')" :value="90" />
              <el-option :label="$t('agentFinance.periodAll')" :value="0" />
            </el-select>
          </label>
          <label class="text-[11px] font-semibold text-[#58685D]">
            <span class="mb-1 block">{{ $t('agentFinance.centerLabel') }}</span>
            <el-select v-model="centerFilter" size="small" filterable class="!w-52">
              <el-option :label="$t('agentFinance.centerAll')" value="ALL" />
              <el-option v-for="center in centers" :key="center.id || center.centerId" :label="centerOptionLabel(center)" :value="String(center.id || center.agentId || center.centerId)" />
            </el-select>
          </label>
          <el-button size="small" :loading="loading" @click="loadAll">
            <el-icon class="me-1"><Refresh /></el-icon>{{ $t('agentFinance.refresh') }}
          </el-button>
        </div>
      </div>
      <p v-if="!centers.length && !loading" class="mt-3 rounded-lg bg-[#FDF3E0] px-3 py-1.5 text-[11px] font-semibold text-[#7A5F21]">{{ $t('agentFinance.noCenters') }}</p>
    </section>

    <!-- KPI -->
    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-[#C7E0CE] bg-[#EFF5F1] p-4">
        <div class="flex items-center justify-between text-[11px] font-semibold text-[#24483A]">
          <span>{{ $t('agentFinance.kpiIncome') }}</span>
          <el-icon :size="16" class="text-[#2F7A50]"><TrendCharts /></el-icon>
        </div>
        <div class="mt-2 font-mono text-xl font-bold text-[#2F5B44]">{{ money(incomeTotal) }}</div>
        <div class="mt-1 text-[11px] text-[#24483A]/80">{{ $t('agentFinance.kpiIncomeHint', { self: money(incomeSelf), subsidy: money(incomeSubsidy) }) }}</div>
      </div>
      <div class="rounded-xl border border-[#F2E3C6] bg-[#FDF3E0]/70 p-4">
        <div class="flex items-center justify-between text-[11px] font-semibold text-[#6B5321]">
          <span>{{ $t('agentFinance.kpiExpense') }}</span>
          <el-icon :size="16" class="text-[#C9A13B]"><ShoppingCart /></el-icon>
        </div>
        <div class="mt-2 font-mono text-xl font-bold text-[#7A5F21]">{{ money(expenseTotal) }}</div>
        <div class="mt-1 text-[11px] text-[#6B5321]/80">{{ $t('agentFinance.kpiExpenseHint', { count: paidExpenseCount }) }}</div>
      </div>
      <div class="rounded-xl border border-[#D9E5DB] bg-white p-4">
        <div class="flex items-center justify-between text-[11px] font-semibold text-[#58685D]">
          <span>{{ $t('agentFinance.kpiNet') }}</span>
          <el-icon :size="16" class="text-[#1F6842]"><Coin /></el-icon>
        </div>
        <div class="mt-2 font-mono text-xl font-bold" :class="netBalance >= 0 ? 'text-[#1F6842]' : 'text-[#C04442]'">{{ money(netBalance) }}</div>
        <div class="mt-1 text-[11px] text-[#8A9A8F]">{{ $t('agentFinance.kpiNetHint', { rate: netRateLabel }) }}</div>
      </div>
      <div class="rounded-xl border border-[#E9D9D6] bg-white p-4">
        <div class="flex items-center justify-between text-[11px] font-semibold text-[#58685D]">
          <span>{{ $t('agentFinance.kpiPayable') }}</span>
          <el-icon :size="16" class="text-[#C04442]"><Wallet /></el-icon>
        </div>
        <div class="mt-2 font-mono text-xl font-bold text-[#C04442]">{{ money(payableTotal) }}</div>
        <div class="mt-1 text-[11px] text-[#8A9A8F]">{{ $t('agentFinance.kpiPayableHint', { count: payableCount }) }}</div>
      </div>
    </section>

    <!-- 收支趋势 -->
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm">
      <h3 class="font-bold text-[#183B28]">{{ $t('agentFinance.trendTitle') }}</h3>
      <div ref="trendChartRef" class="mt-2 h-[300px] w-full" />
    </section>

    <!-- 结构分析 -->
    <section class="grid gap-3 lg:grid-cols-2">
      <div class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm">
        <h3 class="font-bold text-[#183B28]">{{ $t('agentFinance.structExpenseTitle') }}</h3>
        <div ref="expenseChartRef" class="mt-2 h-[280px] w-full" />
      </div>
      <div class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm">
        <h3 class="font-bold text-[#183B28]">{{ $t('agentFinance.structIncomeTitle') }}</h3>
        <div ref="incomeChartRef" class="mt-2 h-[280px] w-full" />
      </div>
    </section>

    <!-- 品种经营分析与采购建议 -->
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="min-w-0">
          <h3 class="font-bold text-[#183B28]">{{ $t('agentFinance.itemTitle') }}</h3>
          <p class="mt-1 max-w-4xl text-[11px] leading-relaxed text-[#8A9A8F]">{{ $t('agentFinance.itemHint') }}</p>
        </div>
      </div>
      <el-table :data="itemStats" size="small" class="mt-3" :empty-text="$t('agentFinance.ledgerEmpty')">
        <el-table-column :label="$t('agentFinance.colItem')" min-width="140">
          <template #default="{ row }"><span class="font-semibold">{{ itemLabel(row) }}</span></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colSoldQty')" width="110" align="right">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono">{{ qty(row.soldQty, row.unit) }}</bdi></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colSalesAmount')" width="130" align="right">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono">{{ money(row.salesAmount) }}</bdi></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colPurchaseQty')" width="110" align="right">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono">{{ qty(row.purchaseQty, row.unit) }}</bdi></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colPurchaseAmount')" width="130" align="right">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono">{{ money(row.purchaseAmount) }}</bdi></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colStock')" width="110" align="right">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono">{{ qty(row.stock, row.unit) }}</bdi></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colTurnover')" width="110" align="right">
          <template #default="{ row }">
            <bdi v-if="row.turnoverDays !== null" dir="ltr" class="font-mono">{{ row.turnoverDays.toFixed(1) }}</bdi>
            <span v-else>{{ $t('agentFinance.none') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colSuggestedQty')" width="130" align="right">
          <template #default="{ row }">
            <span class="font-mono font-bold" :class="row.suggestedQty > 0 ? 'text-[#C04442]' : 'text-[#8A9A8F]'">{{ qty(row.suggestedQty, row.unit) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colSuggestedCost')" width="130" align="right">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono">{{ money(row.suggestedCost) }}</bdi></template>
        </el-table-column>
      </el-table>

      <div class="mt-3 rounded-lg bg-[#F3F8F4] p-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold text-[#2F5B44]">{{ $t('agentFinance.suggestTitle') }}</span>
          <span v-if="suggestionTotal > 0" class="font-mono text-xs font-bold text-[#1F6842]">{{ $t('agentFinance.suggestTotal', { amount: money(suggestionTotal) }) }}</span>
        </div>
        <ul v-if="suggestions.length" class="mt-1.5 space-y-1 text-[11px] text-[#43554B]">
          <li v-for="line in suggestions" :key="line.itemCode" class="flex items-center gap-1.5">
            <span class="size-1.5 shrink-0 rounded-full bg-[#C9A13B]"></span>
            <span>{{ $t('agentFinance.suggestLine', { item: itemLabel(line), qty: formatNumber(line.suggestedQty), unit: line.unit, amount: money(line.suggestedCost) }) }}</span>
          </li>
        </ul>
        <p v-else class="mt-1.5 text-[11px] text-[#2F7A50]">{{ $t('agentFinance.suggestEmpty') }}</p>
        <p class="mt-1.5 text-[10px] text-[#8A9A8F]">{{ $t('agentFinance.suggestNote') }}</p>
      </div>
    </section>

    <!-- 资金流水 -->
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="font-bold text-[#183B28]">{{ $t('agentFinance.ledgerTitle') }}</h3>
        <div class="flex flex-wrap items-center gap-2">
          <el-input v-model.trim="keyword" size="small" clearable :placeholder="$t('agentFinance.ledgerSearch')" class="!w-64">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-radio-group v-model="typeFilter" size="small">
            <el-radio-button value="ALL">{{ $t('agentFinance.ledgerAll') }}</el-radio-button>
            <el-radio-button value="income">{{ $t('agentFinance.typeIncome') }}</el-radio-button>
            <el-radio-button value="expense">{{ $t('agentFinance.typeExpense') }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <el-table :data="pagedEntries" size="small" class="mt-3" :empty-text="$t('agentFinance.ledgerEmpty')">
        <el-table-column :label="$t('agentFinance.colDate')" width="140">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono text-[11px]">{{ formatDate(row.time) }}</bdi></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colType')" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'income' ? 'success' : 'warning'" effect="plain">{{ row.type === 'income' ? $t('agentFinance.typeIncome') : $t('agentFinance.typeExpense') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colNo')" width="180">
          <template #default="{ row }"><bdi dir="ltr" class="font-mono text-[11px] font-bold">{{ row.no }}</bdi></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colSummary')" min-width="220">
          <template #default="{ row }">
            <div class="truncate text-xs">{{ row.title }}</div>
            <div class="text-[10px] text-[#8A9A8F]">{{ row.summary }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colAmount')" width="140" align="right">
          <template #default="{ row }">
            <bdi dir="ltr" class="font-mono font-bold" :class="row.type === 'income' ? 'text-[#1F6842]' : 'text-[#A53A2D]'">
              {{ row.type === 'income' ? '+' : '-' }}{{ money(row.amount) }}
            </bdi>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colStatus')" width="110" align="center">
          <template #default="{ row }"><span class="text-[11px]">{{ row.status }}</span></template>
        </el-table-column>
        <el-table-column :label="$t('agentFinance.colChannel')" width="110" align="center">
          <template #default="{ row }"><span class="text-[11px]">{{ row.channel }}</span></template>
        </el-table-column>
      </el-table>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E9F1EB] pt-3 text-[11px] text-[#8A9A8F]">
        <span>{{ $t('agentFinance.pageTotal', { count: filteredEntries.length }) }}</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[8, 15, 30]"
          :total="filteredEntries.length"
          layout="sizes, prev, pager, next"
          size="small"
          background
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Coin, Refresh, Search, ShoppingCart, TrendCharts, Wallet } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getAgentCitizenOrders, getAgentLocalStocks, getG2BPurchaseOrders, getMyAgentCenters } from '../../../api/agent.js';

const { t, locale } = useI18n();

const centers = ref([]);
const centerFilter = ref('ALL');
const period = ref(30);
const loading = ref(false);

const expenseAll = ref([]);
const incomeAll = ref([]);
const stocks = ref([]);

const keyword = ref('');
const typeFilter = ref('ALL');
const currentPage = ref(1);
const pageSize = ref(8);

const numberFormat = new Intl.NumberFormat('en-US');
const money = (value) => `${numberFormat.format(Math.round(Number(value) || 0))} IQD`;
const formatNumber = (value) => numberFormat.format(Number(value) || 0);

function toArray(value) {
  return Array.isArray(value) ? value : (value?.data || []);
}

function toTime(value) {
  if (!value) return 0;
  const time = Date.parse(String(value).replace(' ', 'T'));
  return Number.isFinite(time) ? time : 0;
}

function dateLocale() {
  return { zh: 'zh-CN', en: 'en-GB', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-GB';
}

function formatDate(value) {
  const time = toTime(value);
  if (!time) return '—';
  return new Intl.DateTimeFormat(dateLocale(), { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(time);
}

function displayUnit(unit) {
  const text = String(unit || '');
  if (/kg|公斤|كغم|کیلۆ/i.test(text)) return 'kg';
  if (/^l$|^L$|升|لتر|لیتر/i.test(text)) return 'L';
  return text || '';
}

function qty(value, unit) {
  const number = Number(value) || 0;
  const text = numberFormat.format(Number.isInteger(number) ? number : Number(number.toFixed(1)));
  return unit ? `${text} ${unit}` : text;
}

const itemLabels = computed(() => ({
  'FLOUR-WHT-02': t('businessRules.items.FLOUR-WHT-02'),
  'RICE-BAS-01': t('businessRules.items.RICE-BAS-01'),
  'OIL-SUN-03': t('businessRules.items.OIL-SUN-03'),
  'SUGAR-WHT-04': t('businessRules.items.SUGAR-WHT-04')
}));

function itemLabel(item) {
  return itemLabels.value[item.itemCode] || item.itemName || item.itemCode;
}

const agentIds = computed(() => new Set(centers.value.map((center) => String(center.id || center.agentId || center.centerId))));

const selectedAgentId = computed(() => (centerFilter.value === 'ALL' ? '' : String(centerFilter.value)));

function centerOptionLabel(center) {
  return center.name || center.centerName || center.id || center.centerId;
}

function belongsToAgent(order) {
  const id = String(order.agentId || order.centerId || '');
  if (selectedAgentId.value) return id === selectedAgentId.value;
  return agentIds.value.size === 0 || agentIds.value.has(id) || !id;
}

const cutoff = computed(() => (period.value ? Date.now() - period.value * 86400000 : 0));

function inPeriod(order) {
  if (!cutoff.value) return true;
  const time = toTime(order.createdAt || order.paidAt || order.payTime);
  return time >= cutoff.value;
}

const incomeOrders = computed(() => incomeAll.value.filter(belongsToAgent).filter(inPeriod));
const expenseOrders = computed(() => expenseAll.value.filter(belongsToAgent).filter(inPeriod));

const incomeSelf = computed(() => incomeOrders.value.reduce((sum, order) => sum + Number(order.selfPayAmount || order.amount || 0), 0));
const incomeSubsidy = computed(() => incomeOrders.value.reduce((sum, order) => sum + Number(order.subsidyAmount || 0), 0));
const incomeTotal = computed(() => incomeSelf.value + incomeSubsidy.value);

const paidExpenseOrders = computed(() => expenseOrders.value.filter((order) => order.payStatus === 'PAID' || Boolean(order.payTime)));
const paidExpenseCount = computed(() => paidExpenseOrders.value.length);
const expenseTotal = computed(() => paidExpenseOrders.value.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0));

const payableOrders = computed(() => expenseOrders.value.filter((order) => order.payStatus !== 'PAID' && !order.payTime && order.status !== 'REJECTED'));
const payableCount = computed(() => payableOrders.value.length);
const payableTotal = computed(() => payableOrders.value.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0));

const netBalance = computed(() => incomeTotal.value - expenseTotal.value);
// 收支规模差异较大时按较大一侧计算比例，避免出现数千个百分点
const netRateLabel = computed(() => {
  const base = Math.max(incomeTotal.value, expenseTotal.value);
  return base > 0 ? `${((netBalance.value / base) * 100).toFixed(1)}%` : '—';
});

// 计算日均销量所用的实际区间（天）
const effectiveDays = computed(() => {
  if (period.value) return period.value;
  const times = [...incomeOrders.value, ...expenseOrders.value].map((order) => toTime(order.createdAt || order.paidAt)).filter(Boolean);
  if (!times.length) return 30;
  const span = Math.ceil((Date.now() - Math.min(...times)) / 86400000);
  return Math.min(365, Math.max(7, span));
});

// 品种维度：销量/销售金额来自公民配给订单，采购量/采购支出与库存来自采购订单与本地库存
const itemStats = computed(() => {
  const map = new Map();
  const ensure = (item) => {
    const code = item.itemCode || item.itemName;
    if (!map.has(code)) {
      map.set(code, {
        itemCode: code,
        itemName: item.itemName,
        unit: displayUnit(item.unit),
        soldQty: 0,
        salesAmount: 0,
        purchaseQty: 0,
        purchaseAmount: 0,
        stock: 0
      });
    }
    return map.get(code);
  };

  for (const order of incomeOrders.value) {
    for (const item of order.items || []) {
      const row = ensure(item);
      const itemQty = Number(item.qty || 0);
      row.soldQty += itemQty;
      row.salesAmount += Number(item.subtotal ?? itemQty * Number(item.unitPrice || 0));
    }
  }
  for (const order of expenseOrders.value) {
    for (const item of order.items || []) {
      const row = ensure(item);
      const itemQty = Number(item.qty || 0);
      row.purchaseQty += itemQty;
      row.purchaseAmount += Number(item.subtotal ?? itemQty * Number(item.unitPrice || 0));
    }
  }
  for (const stock of stocks.value) {
    const row = ensure(stock);
    row.stock = Number(stock.currentOnHand || 0);
  }

  const days = effectiveDays.value;
  return [...map.values()]
    .map((row) => {
      const daily = row.soldQty / days;
      const suggestedQty = Math.max(0, Math.ceil(daily * 30 * 1.2 - row.stock));
      const avgCost = row.purchaseQty > 0 ? row.purchaseAmount / row.purchaseQty : 0;
      return {
        ...row,
        avgSalesPrice: row.soldQty > 0 ? row.salesAmount / row.soldQty : 0,
        avgCost,
        turnoverDays: daily > 0 ? row.stock / daily : null,
        suggestedQty,
        suggestedCost: suggestedQty * avgCost
      };
    })
    .sort((a, b) => (b.salesAmount + b.purchaseAmount) - (a.salesAmount + a.purchaseAmount));
});

const suggestions = computed(() => itemStats.value.filter((row) => row.suggestedQty > 0).slice(0, 6));
const suggestionTotal = computed(() => suggestions.value.reduce((sum, row) => sum + row.suggestedCost, 0));

// 收支趋势（30 天按日，其余按月聚合）
const trendData = computed(() => {
  const byMonth = period.value !== 30;
  const bucketKey = (value) => {
    const time = toTime(value);
    if (!time) return '';
    const date = new Date(time);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return byMonth ? `${date.getFullYear()}-${month}` : `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const buckets = new Map();
  const ensureBucket = (key) => {
    if (!key) return null;
    if (!buckets.has(key)) buckets.set(key, { income: 0, expense: 0 });
    return buckets.get(key);
  };
  for (const order of incomeOrders.value) {
    const bucket = ensureBucket(bucketKey(order.createdAt || order.paidAt));
    if (bucket) bucket.income += Number(order.selfPayAmount || order.amount || 0) + Number(order.subsidyAmount || 0);
  }
  for (const order of paidExpenseOrders.value) {
    const bucket = ensureBucket(bucketKey(order.createdAt || order.payTime));
    if (bucket) bucket.expense += Number(order.totalAmount || 0);
  }
  const keys = [...buckets.keys()].sort();
  return {
    keys,
    income: keys.map((key) => buckets.get(key).income),
    expense: keys.map((key) => buckets.get(key).expense),
    net: keys.map((key) => buckets.get(key).income - buckets.get(key).expense)
  };
});

const expenseBreakdown = computed(() => {
  const rows = itemStats.value.filter((row) => row.purchaseAmount > 0);
  const sorted = [...rows].sort((a, b) => b.purchaseAmount - a.purchaseAmount);
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5).reduce((sum, row) => sum + row.purchaseAmount, 0);
  const result = top.map((row) => ({ name: itemLabel(row), value: Math.round(row.purchaseAmount) }));
  if (rest > 0) result.push({ name: t('agentFinance.ledgerAll'), value: Math.round(rest) });
  return result;
});

const incomeBreakdown = computed(() => {
  let pickup = 0;
  let delivery = 0;
  for (const order of incomeOrders.value) {
    const amount = Number(order.selfPayAmount || order.amount || 0) + Number(order.subsidyAmount || 0);
    if (order.deliveryType === 'PICKUP') pickup += amount;
    else delivery += amount;
  }
  return [
    { name: t('agentFinance.modePickup'), value: Math.round(pickup) },
    { name: t('agentFinance.modeDelivery'), value: Math.round(delivery) }
  ].filter((row) => row.value > 0);
});

// 统一资金流水
function incomeStatusLabel(order) {
  if (order.status === 'DELIVERED') return t('citizenOrder.statusDelivered');
  if (order.status === 'DISPATCHED') return t('citizenOrder.statusDispatched');
  if (order.status === 'READY_FOR_PICKUP') return t('citizenOrder.statusReadyPickup');
  if (order.status === 'CANCELLED') return t('agentFinance.cancelled');
  return t(order.deliveryType === 'PICKUP' ? 'citizenOrder.statusPendingPickup' : 'citizenOrder.statusPendingDelivery');
}

function expenseStatusLabel(order) {
  if (order.status === 'COMPLETED') return t('agentG2B.statusShortCompleted');
  if (order.status === 'IN_TRANSIT') return t('agentG2B.statusShortInTransit');
  if (order.status === 'PAID_WMS_PICKING') return t('agentG2B.statusShortPicking');
  if (order.status === 'REJECTED') return t('agentFinance.rejected');
  return t('agentG2B.statusShortPending');
}

const ledgerEntries = computed(() => {
  const rows = [];
  for (const order of incomeOrders.value) {
    const items = order.items || [];
    rows.push({
      id: `in-${order.orderId}`,
      type: 'income',
      time: order.createdAt || order.paidAt,
      no: order.orderId,
      title: `${order.headName || order.cardNo || '—'} · ${order.deliveryType === 'PICKUP' ? t('agentFinance.modePickup') : t('agentFinance.modeDelivery')}`,
      summary: t('agentFinance.incomeSummary', { count: items.length, mode: order.deliveryType === 'PICKUP' ? t('agentFinance.modePickup') : t('agentFinance.modeDelivery') }),
      search: [order.orderId, order.headName, order.cardNo, ...items.map((item) => item.itemName)].join(' ').toLowerCase(),
      amount: Number(order.selfPayAmount || order.amount || 0) + Number(order.subsidyAmount || 0),
      status: incomeStatusLabel(order),
      channel: order.payStatus === 'PAID' ? t('agentFinance.paid') : t('agentFinance.unpaid')
    });
  }
  for (const order of expenseOrders.value) {
    const items = order.items || [];
    rows.push({
      id: `ex-${order.orderNo}`,
      type: 'expense',
      time: order.createdAt || order.payTime,
      no: order.orderNo,
      title: order.centerName || order.agentName || '—',
      summary: t('agentFinance.expenseSummary', { count: items.length, mode: order.logisticsMode === 'PICKUP' ? t('agentFinance.modePickup') : t('agentFinance.modeDispatch') }),
      search: [order.orderNo, order.centerName, order.agentName, ...items.map((item) => item.itemName)].join(' ').toLowerCase(),
      amount: Number(order.totalAmount || 0),
      status: expenseStatusLabel(order),
      channel: order.payStatus === 'PAID' ? t('agentFinance.paid') : t('agentFinance.unpaid')
    });
  }
  return rows.sort((a, b) => toTime(b.time) - toTime(a.time));
});

const filteredEntries = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return ledgerEntries.value.filter((row) => {
    if (typeFilter.value !== 'ALL' && row.type !== typeFilter.value) return false;
    if (kw && !row.search.includes(kw)) return false;
    return true;
  });
});

const pagedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredEntries.value.slice(start, start + pageSize.value);
});

watch([filteredEntries, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(filteredEntries.value.length / pageSize.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
});
watch([period, centerFilter], () => {
  currentPage.value = 1;
});

// ---------------- ECharts ----------------
const trendChartRef = ref(null);
const expenseChartRef = ref(null);
const incomeChartRef = ref(null);
let trendChart = null;
let expenseChart = null;
let incomeChart = null;

const chartTextColor = '#58685D';
const chartAxisLine = '#D9E5DB';

function compactMoney(value) {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (Math.abs(number) >= 1000) return `${(number / 1000).toFixed(0)}K`;
  return String(Math.round(number));
}

function renderTrendChart() {
  const el = trendChartRef.value;
  if (!el || el.clientWidth === 0) return;
  if (!trendChart) trendChart = echarts.init(el);
  const data = trendData.value;
  trendChart.setOption({
    tooltip: { trigger: 'axis', valueFormatter: (value) => money(value) },
    legend: { bottom: 0, textStyle: { color: chartTextColor, fontSize: 11 } },
    grid: { left: 12, right: 18, top: 24, bottom: 42, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.keys,
      axisLabel: { color: chartTextColor, fontSize: 10, formatter: (value) => (period.value === 30 ? String(value).slice(5) : value) },
      axisLine: { lineStyle: { color: chartAxisLine } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: chartTextColor, fontSize: 10, formatter: (value) => compactMoney(value) },
      splitLine: { lineStyle: { color: '#F1F5F2' } }
    },
    series: [
      { name: t('agentFinance.trendIncome'), type: 'bar', barMaxWidth: 18, itemStyle: { color: '#2F7A50', borderRadius: [4, 4, 0, 0] }, data: data.income },
      { name: t('agentFinance.trendExpense'), type: 'bar', barMaxWidth: 18, itemStyle: { color: '#C9A13B', borderRadius: [4, 4, 0, 0] }, data: data.expense },
      { name: t('agentFinance.trendNet'), type: 'line', smooth: true, symbolSize: 5, itemStyle: { color: '#1F6842' }, lineStyle: { width: 2 }, data: data.net }
    ]
  }, true);
}

function renderPie(chart, el, rows) {
  if (!el || el.clientWidth === 0) return null;
  const instance = chart || echarts.init(el);
  instance.setOption({
    tooltip: { trigger: 'item', valueFormatter: (value) => money(value) },
    legend: { bottom: 0, textStyle: { color: chartTextColor, fontSize: 11 } },
    color: ['#2F7A50', '#C9A13B', '#1F6842', '#8A9A8F', '#D3AF62', '#B7C9BC'],
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '44%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { color: chartTextColor, fontSize: 11, formatter: '{b}\n{d}%' },
      data: rows
    }]
  }, true);
  return instance;
}

function renderCharts() {
  renderTrendChart();
  expenseChart = renderPie(expenseChart, expenseChartRef.value, expenseBreakdown.value) || expenseChart;
  incomeChart = renderPie(incomeChart, incomeChartRef.value, incomeBreakdown.value) || incomeChart;
}

function handleResize() {
  trendChart?.resize();
  expenseChart?.resize();
  incomeChart?.resize();
}

watch([trendData, expenseBreakdown, incomeBreakdown], () => nextTick(renderCharts), { deep: true });
watch(locale, () => nextTick(() => {
  renderCharts();
  handleResize();
}));

// ---------------- 数据 ----------------
async function loadAll() {
  loading.value = true;
  try {
    const [centerList, g2bOrders, citizenOrders, stockList] = await Promise.all([
      getMyAgentCenters(),
      getG2BPurchaseOrders({}),
      getAgentCitizenOrders({}),
      getAgentLocalStocks()
    ]);
    centers.value = toArray(centerList);
    expenseAll.value = toArray(g2bOrders);
    incomeAll.value = toArray(citizenOrders);
    stocks.value = toArray(stockList);
    await nextTick();
    renderCharts();
  } catch {
    ElMessage.error(t('agentFinance.loadFailed'));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadAll();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  expenseChart?.dispose();
  incomeChart?.dispose();
  trendChart = null;
  expenseChart = null;
  incomeChart = null;
});
</script>
