<template>
  <div class="family-agent-view space-y-4" :class="isAppMode ? '!space-y-3' : ''">
    <!-- 家庭代理：本人家庭签约代理与月度物资配送额度 (拆分后的公民独立大模块) -->
    <RationPlanTab
      :show-citizen-quota-details="false"
      :show-citizen-month-selector="false"
      :show-agent-transfer-action="true"
      @go-purchase="goPurchase"
      @request-agent-transfer="goAgentTransfer"
    />

    <section class="rounded-lg border border-[#C7DED0] bg-gradient-to-r rtl:bg-gradient-to-l from-[#EFF5F1] to-white p-3.5 shadow-xs" aria-labelledby="family-agent-monthly-quota-title">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 id="family-agent-monthly-quota-title" class="flex items-center gap-1.5 text-sm font-bold text-[#1B3123]">
          <el-icon class="text-[#326445]"><GoodsFilled /></el-icon>
          {{ $t('citizenPurchase.monthlyQuotaTitle') }}
        </h2>
        <div class="flex shrink-0 items-center gap-1">
          <span class="text-xs font-mono font-bold text-[#326445]">{{ displayQuotaPeriod }}</span>
          <el-tooltip :content="$t('citizenPurchase.refreshTooltip')" placement="top">
            <el-button text circle size="small" :loading="quotaLoading" :aria-label="$t('citizenPurchase.refreshTooltip')" @click="loadQuotaData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div v-if="quotaLoading && !quotaItems.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-hidden="true">
        <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-md border border-[#E1F4E4] bg-white" />
      </div>
      <div v-else-if="quotaItems.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div v-for="item in quotaItems" :key="item.itemCode" class="rounded-md border border-[#E1F4E4] bg-white px-2.5 py-2">
          <div class="truncate text-[11px] font-semibold text-[#43554B]">{{ quotaItemLabel(item) }}</div>
          <div class="mt-1 flex items-baseline gap-1 text-xs">
            <span class="font-mono font-bold text-[#2F7A50]">{{ formatQuota(item.remainingQuota) }}</span>
            <span class="text-[#8A9A8F]">/ {{ formatQuota(item.totalHouseholdQuota) }} {{ item.unit }}</span>
          </div>
          <div class="text-[10px] text-[#8A9A8F]">{{ $t('citizenPurchase.remainingOfTotal') }}</div>
        </div>
      </div>
      <div v-else class="rounded-md bg-white/80 px-3 py-4 text-center text-xs text-[#8A9A8F]">
        {{ quotaLoadFailed ? $t('citizenPurchase.quotaSummaryLoadFailed') : $t('citizenPurchase.quotaSummaryEmpty') }}
      </div>
    </section>

    <section class="rounded-lg border border-[#D9E5DB]/80 bg-white p-4 shadow-xs space-y-3" aria-labelledby="citizen-promotions-title">
      <div>
        <h2 id="citizen-promotions-title" class="text-sm font-bold text-[#1B3123]">{{ $t('citizenPurchase.promotionsTitle') }}</h2>
        <p class="mt-0.5 text-[11px] text-[#8A9A8F]">{{ $t('citizenPurchase.promotionsSubtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article v-for="promotion in promotions" :key="promotion.title" class="rounded-lg border p-3.5 space-y-2" :class="promotion.government ? 'border-[#C7DED0] bg-[#F3F8F4]' : 'border-[#F2E3C6] bg-[#FDF9F0]'">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wide" :class="promotion.government ? 'text-[#326445]' : 'text-[#8A6828]'">{{ $t(promotion.government ? 'citizenPurchase.governmentPromotion' : 'citizenPurchase.agentPromotion') }}</span>
            <span class="text-[10px] text-[#8A9A8F]">{{ $t(promotion.validity) }}</span>
          </div>
          <h3 class="text-xs font-bold text-[#1B3123]">{{ $t(promotion.title) }}</h3>
          <p class="text-[11px] leading-relaxed text-[#58685D]">{{ $t(promotion.description) }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RationPlanTab from '../warehouse/components/RationPlanTab.vue';
import { getCitizenQuotaBalance } from '../../api/citizen.js';
import { useCitizenStore } from '../../stores/citizen.js';
import { useI18n } from 'vue-i18n';
import { GoodsFilled, Refresh } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const citizenStore = useCitizenStore();
const { t, locale } = useI18n();
const quotaItems = ref([]);
const quotaInfo = ref({});
const quotaLoading = ref(false);
const quotaLoadFailed = ref(false);
const quotaCardNo = computed(() => citizenStore.currentFamily?.rationCardNo || citizenStore.families[0]?.rationCardNo || 'RC-10029381');
const promotions = [
  { government: false, title: 'citizenPurchase.agentPromotion1Title', description: 'citizenPurchase.agentPromotion1Description', validity: 'citizenPurchase.agentPromotionValidity' },
  { government: true, title: 'citizenPurchase.governmentPromotionTitle', description: 'citizenPurchase.governmentPromotionDescription', validity: 'citizenPurchase.governmentPromotionValidity' }
];

// 与 AgentInventoryLedger 等模块保持一致的 APP 视口判定
const isAppMode = computed(() => route.query.layout === 'app' || sessionStorage.getItem('rcm_layout_mode') === 'app');
const displayQuotaPeriod = computed(() => {
  const period = String(quotaInfo.value.quotaPeriod || '');
  const parts = period.match(/(20\d{2})\D{0,5}(\d{1,2})/);
  if (!parts) return period;
  const date = new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, 1));
  const intlLocale = { zh: 'zh-CN', en: 'en-US', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-US';
  return new Intl.DateTimeFormat(intlLocale, { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
});

function quotaItemLabel(item) {
  const key = {
    'FLOUR-WHT-02': 'quotaItemFlour',
    'RICE-BAS-01': 'quotaItemRice',
    'SUGAR-WHT-04': 'quotaItemSugar',
    'OIL-SUN-03': 'quotaItemOil'
  }[item.itemCode];
  return key ? t(`citizenPurchase.${key}`) : item.itemName;
}

function formatQuota(value) {
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(Number(value) || 0);
}

async function loadQuotaData() {
  quotaLoading.value = true;
  quotaLoadFailed.value = false;
  try {
    const result = await getCitizenQuotaBalance(quotaCardNo.value);
    quotaInfo.value = result || {};
    quotaItems.value = result?.quotas || [];
  } catch {
    quotaLoadFailed.value = true;
  } finally {
    quotaLoading.value = false;
  }
}

// 跳转到「配给购买」模块下单 (保留 layout/role 等 APP 模式参数)
function goPurchase() {
  const query = { ...route.query, tab: 'purchase' };
  router.push({ path: '/warehouse', query });
}

function goAgentTransfer() {
  router.push({ path: '/citizen/transfer-agent', query: route.query.layout === 'app' ? { layout: 'app' } : {} });
}

watch(quotaCardNo, loadQuotaData);
onMounted(loadQuotaData);
</script>
