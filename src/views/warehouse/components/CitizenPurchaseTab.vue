<template>
  <div ref="processContainerRef" class="citizen-purchase-tab space-y-4">
    <!-- 本月配额摘要：用实际剩余额度替代户主信息栏 -->
    <section class="rounded-lg border border-[#C7DED0] bg-gradient-to-r rtl:bg-gradient-to-l from-[#EFF5F1] to-white p-3.5 shadow-xs" aria-labelledby="monthly-quota-title">
      <div class="flex items-center justify-between gap-2 mb-3">
        <h3 id="monthly-quota-title" class="text-sm font-bold text-[#1B3123] flex items-center gap-1.5">
          <el-icon class="text-[#326445]"><GoodsFilled /></el-icon>
          {{ $t('citizenPurchase.monthlyQuotaTitle') }}
        </h3>
        <span class="text-xs font-mono font-bold text-[#326445]">{{ displayQuotaPeriod }}</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div v-for="item in quotaItems" :key="item.itemCode" class="rounded-md border border-[#E1F4E4] bg-white px-2.5 py-2">
          <div class="text-[11px] font-semibold text-[#43554B] truncate">{{ formatItemName(item.itemName) }}</div>
          <div class="mt-1 flex items-baseline gap-1 text-xs">
            <span class="font-mono font-bold text-[#2F7A50]">{{ item.remainingQuota }}</span>
            <span class="text-[#8A9A8F]">/ {{ item.totalHouseholdQuota }} {{ item.unit }}</span>
          </div>
          <div class="text-[10px] text-[#8A9A8F]">{{ $t('citizenPurchase.remainingOfTotal') }}</div>
        </div>
      </div>
      <div class="flex justify-end mt-2">
        <el-tooltip :content="$t('citizenPurchase.refreshTooltip')" placement="top">
          <button type="button" class="text-[#326445] hover:text-[#1B3123] transition-colors cursor-pointer p-1 rounded-md hover:bg-[#E1F4E4]" @click="loadQuotaData">
            <el-icon :size="14"><Refresh /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. 优化点2：拆分为 3 步流程导航指示器 (选购 -> 配送 -> 付款) -->
    <!-- ======================================================== -->
    <div class="bg-white rounded-lg border border-[#D9E5DB]/80 p-2.5 sm:p-3 shadow-2xs">
      <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
        <!-- 步骤 1 -->
        <button
          type="button"
          class="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border"
          :class="
            currentProcessStep === 1
              ? 'bg-[#326445] text-white border-[#326445] shadow-xs'
              : currentProcessStep > 1
              ? 'bg-[#EFF5F1] text-[#2A5440] border-[#C7DED0] hover:bg-[#E1F4E4]'
              : 'bg-[#F3F8F4] text-[#8A9A8F] border-[#D9E5DB]'
          "
          @click="currentProcessStep = 1; scrollToTop()"
        >
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
            :class="currentProcessStep === 1 ? 'bg-white text-[#326445] font-bold' : currentProcessStep > 1 ? 'bg-[#326445] text-white' : 'bg-[#D9E5DB] text-[#58685D]'"
          >
            {{ currentProcessStep > 1 ? '✓' : '1' }}
          </span>
          <span class="truncate">{{ $t('citizenPurchase.step1') }}</span>
        </button>

        <!-- 步骤 2 -->
        <button
          type="button"
          class="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border"
          :class="
            currentProcessStep === 2
              ? 'bg-[#326445] text-white border-[#326445] shadow-xs'
              : currentProcessStep > 2
              ? 'bg-[#EFF5F1] text-[#2A5440] border-[#C7DED0] hover:bg-[#E1F4E4]'
              : 'bg-[#F3F8F4] text-[#8A9A8F] border-[#D9E5DB]'
          "
          :disabled="totalSelectedWeight <= 0"
          @click="handleJumpToStep(2)"
        >
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
            :class="currentProcessStep === 2 ? 'bg-white text-[#326445] font-bold' : currentProcessStep > 2 ? 'bg-[#326445] text-white' : 'bg-[#D9E5DB] text-[#58685D]'"
          >
            {{ currentProcessStep > 2 ? '✓' : '2' }}
          </span>
          <span class="truncate">{{ $t('citizenPurchase.step2') }}</span>
        </button>

        <!-- 步骤 3 -->
        <button
          type="button"
          class="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border"
          :class="
            currentProcessStep === 3
              ? 'bg-[#326445] text-white border-[#326445] shadow-xs'
              : 'bg-[#F3F8F4] text-[#8A9A8F] border-[#D9E5DB]'
          "
          :disabled="totalSelectedWeight <= 0"
          @click="handleJumpToStep(3)"
        >
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
            :class="currentProcessStep === 3 ? 'bg-white text-[#326445] font-bold' : 'bg-[#D9E5DB] text-[#58685D]'"
          >
            3
          </span>
          <span class="truncate">{{ $t('citizenPurchase.step3') }}</span>
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 流程第一步：选购口粮商品 (Step 1) -->
    <!-- ======================================================== -->
    <div v-if="currentProcessStep === 1" class="space-y-4">
      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 p-4 sm:p-5 shadow-xs space-y-4">
        <!-- 步骤 1 顶栏操作 -->
        <div
          class="pb-3 border-b border-[#E9F1EB]"
          :class="isAppMode ? 'flex flex-col gap-2.5 items-start' : 'flex flex-col sm:flex-row sm:items-center justify-between gap-2.5'"
        >
          <div class="w-full">
            <h4 class="text-sm font-bold text-[#1B3123] flex items-center gap-1.5">
              <el-icon class="text-[#326445]"><GoodsFilled /></el-icon>
              <span>{{ $t('citizenPurchase.step1Title') }}</span>
            </h4>
            <p class="text-[11px] text-[#8A9A8F] mt-0.5">
              {{ $t('citizenPurchase.step1Subtitle') }}
            </p>
          </div>

          <div :class="isAppMode ? 'grid grid-cols-2 gap-2 w-full' : 'flex items-center gap-2'">
            <el-button size="small" type="primary" plain class="!m-0 w-full" data-demo-target="btn-fill-quota" @click="handleFillAllQuota">
              <el-icon class="me-1"><Check /></el-icon>
              {{ $t('citizenPurchase.fillAllQuota') }}
            </el-button>
            <el-button size="small" class="!m-0 w-full" @click="handleClearSelected">
              {{ $t('citizenPurchase.clearAll') }}
            </el-button>
          </div>
        </div>

        <!-- 四大战略口粮卡片网格 (APP模式下单列通栏展开，避免被挤扁为竖排字) -->
        <div
          class="grid"
          :class="isAppMode ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5'"
        >
          <div
            v-for="item in quotaItems"
            :key="item.itemCode"
            class="rounded-lg border transition-all p-3.5 flex flex-col justify-between space-y-3"
            :class="
              selectedMap[item.itemCode] > 0
                ? 'border-[#5C8A6B] bg-[#EFF5F1]/20 shadow-xs ring-1 ring-[#7FA48C]/30'
                : 'border-[#D9E5DB] bg-white hover:border-[#C9DBCE]'
            "
          >
            <!-- 头部品名与价格 -->
            <div class="space-y-1.5">
              <div class="flex items-start justify-between gap-1">
                <div>
                  <span class="font-bold text-[#1B3123] text-xs sm:text-sm block">{{ formatItemName(item.itemName) }}</span>
                  <span class="text-[10px] text-[#8A9A8F] font-mono">{{ formatOriginPack(item) }}</span>
                </div>
                <el-tag size="small" type="success" effect="plain" class="scale-90 origin-right rtl:origin-left font-bold">
                  {{ formatStockStatus(item.stockStatus) }}
                </el-tag>
              </div>

              <!-- 价格卡片 -->
              <div class="p-2 rounded-lg bg-[#F3F8F4] border border-[#E9F1EB] space-y-1 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-[#58685D] text-[11px]">{{ $t('citizenPurchase.priceSelfPay') }}:</span>
                  <span class="font-mono font-bold text-[#326445] text-sm">
                    {{ item.guidePriceIQD.toLocaleString() }} IQD<span class="text-[10px] text-[#8A9A8F]">/{{ item.unit }}</span>
                  </span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-[#8A9A8F]">
                  <span>{{ $t('citizenPurchase.priceMarket') }}:</span>
                  <span class="line-through font-mono">{{ item.marketPriceIQD.toLocaleString() }} IQD</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-[#2F5B44] font-semibold pt-0.5 border-t border-[#D9E5DB]/50">
                  <span>{{ $t('citizenPurchase.priceSubsidy') }}:</span>
                  <span class="font-mono">+{{ item.subsidyIQD.toLocaleString() }} IQD/{{ item.unit }}</span>
                </div>
              </div>
            </div>

            <!-- 配额与限额 -->
            <div class="space-y-1 text-xs">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-[#58685D]">{{ $t('citizenPurchase.householdQuota') }}:</span>
                <span class="font-mono font-bold text-[#1F3326]">{{ item.totalHouseholdQuota }} {{ item.unit }}</span>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-[#58685D]">{{ $t('citizenPurchase.remainingQuota') }}:</span>
                <span
                  class="font-mono font-bold"
                  :class="item.remainingQuota > 0 ? 'text-[#2F7A50]' : 'text-[#8A9A8F]'"
                >
                  {{ item.remainingQuota }} {{ item.unit }}
                </span>
              </div>
              <el-progress
                :percentage="item.totalHouseholdQuota > 0 ? Math.min(100, Math.round(((item.totalHouseholdQuota - item.remainingQuota) / item.totalHouseholdQuota) * 100)) : 0"
                :stroke-width="4"
                :show-text="false"
                status="success"
              />
            </div>

            <!-- 数量输入框 (严格限制 :max="item.remainingQuota"；剩余额度为0时整块禁用，不可点击/输入) -->
            <div
              class="pt-2 border-t border-[#E9F1EB] space-y-2"
              :class="item.remainingQuota <= 0 ? 'pointer-events-none select-none' : ''"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-[#43554B]">{{ $t('citizenPurchase.selectedQty') }}:</span>
                <button
                  type="button"
                  class="text-[11px] text-[#326445] hover:underline cursor-pointer font-medium"
                  :disabled="item.remainingQuota <= 0"
                  @click="selectedMap[item.itemCode] = item.remainingQuota"
                >
                  {{ $t('citizenPurchase.maxAllSingle') }} ({{ item.remainingQuota }}{{ item.unit }})
                </button>
              </div>

              <div class="flex items-center gap-1.5">
                <el-input-number
                  v-model="selectedMap[item.itemCode]"
                  :min="0"
                  :max="item.remainingQuota"
                  :step="1"
                  :precision="0"
                  class="w-full"
                  size="default"
                  :disabled="item.remainingQuota <= 0"
                />
                <span class="text-xs text-[#58685D] font-bold shrink-0 w-6">{{ item.unit }}</span>
              </div>

              <div v-if="selectedMap[item.itemCode] >= item.remainingQuota && item.remainingQuota > 0" class="text-[10px] text-[#C9A13B] font-semibold flex items-center gap-1">
                <el-icon><Warning /></el-icon>
                <span>{{ $t('citizenPurchase.maxLimitReached') }}</span>
              </div>
              <div v-if="item.remainingQuota <= 0" class="text-[10px] text-[#8A9A8F]">
                {{ $t('citizenPurchase.quotaExhausted') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 1 底部统计与下一步按钮 -->
        <div
          class="pt-3 border-t border-[#E9F1EB]"
          :class="isAppMode ? 'flex flex-col gap-3 w-full' : 'flex flex-col sm:flex-row sm:items-center justify-between gap-3'"
        >
          <!-- 统计摘要行 (APP 模式下双列两端对齐，避免挤压折行) -->
          <div
            :class="isAppMode ? 'flex items-center justify-between text-xs text-[#43554B] bg-[#F3F8F4] px-3 py-2 rounded-lg border border-[#D9E5DB]/60' : 'flex items-center gap-3 text-xs text-[#58685D] flex-wrap'"
          >
            <span>
              {{ $t('citizenPurchase.totalWeight') }}:
              <strong class="font-mono text-[#1B3123] text-sm ms-1">{{ totalSelectedWeight }} kg/L</strong>
            </span>
            <span v-if="!isAppMode">·</span>
            <span>
              {{ $t('citizenPurchase.goodsAmount') }}:
              <strong class="font-mono text-[#326445] text-sm ms-1">{{ totalGoodsAmount.toLocaleString() }} IQD</strong>
            </span>
          </div>

          <el-button
            type="primary"
            size="large"
            class="font-bold shadow-xs !h-11 rounded-lg"
            data-demo-target="btn-next-delivery"
            :class="isAppMode ? 'w-full !m-0 text-sm' : 'px-6'"
            :disabled="totalSelectedWeight <= 0"
            @click="handleProceedToStep2"
          >
            <span>{{ $t('citizenPurchase.nextStepDelivery') }}</span>
            <el-icon class="rtl-mirror-icon ms-1"><Right /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 流程第二步：选择配送方式 (Step 2) -->
    <!-- ======================================================== -->
    <div v-else-if="currentProcessStep === 2" class="space-y-4">
      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 p-4 sm:p-5 shadow-xs space-y-4">
        <!-- 步骤 2 顶栏 -->
        <div class="pb-3 border-b border-[#E9F1EB]">
          <h4 class="text-sm font-bold text-[#1B3123] flex items-center gap-1.5">
            <el-icon class="text-[#326445]"><Van /></el-icon>
            <span>{{ $t('citizenPurchase.step2Title') }}</span>
          </h4>
          <p class="text-[11px] text-[#8A9A8F] mt-0.5">
            {{ $t('citizenPurchase.step2Subtitle') }}
          </p>
        </div>

        <!-- 两种配送方式卡片 (APP模式下单列排布) -->
        <div
          class="grid"
          :class="isAppMode ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-3.5'"
        >
          <!-- 方式 A: 到店自提 -->
          <div
            class="border rounded-lg p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
            :class="
              deliveryType === 'PICKUP'
                ? 'border-[#5C8A6B] bg-[#EFF5F1]/40 ring-2 ring-[#5C8A6B]/20 shadow-xs'
                : 'border-[#D9E5DB] hover:border-[#C9DBCE] bg-white'
            "
            @click="deliveryType = 'PICKUP'"
          >
            <!-- 头部：图标、标题与费用标签 -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base transition shrink-0"
                  :class="deliveryType === 'PICKUP' ? 'bg-[#326445] text-white' : 'bg-[#E9F1EB] text-[#58685D]'"
                >
                  <el-icon><Shop /></el-icon>
                </div>
                <span class="text-xs sm:text-sm font-bold text-[#1B3123] whitespace-nowrap">{{ $t('citizenPurchase.pickupTitle') }}</span>
              </div>
              <el-tag size="small" type="success" effect="dark" class="font-bold shrink-0">
                {{ $t('citizenPurchase.pickupFree') }}
              </el-tag>
            </div>

            <!-- 说明文本通栏展开 -->
            <p class="text-[11px] text-[#58685D] leading-relaxed">
              {{ $t('citizenPurchase.pickupSub') }}
            </p>

            <div class="p-2.5 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB]/60 text-[11px] text-[#58685D] space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[#8A9A8F] shrink-0">{{ $t('citizenPurchase.pickupStationLabel') }}:</span>
                <span class="font-bold text-[#1F3326] truncate text-end">{{ quotaInfo.agentName || '巴格达卡尔赫第一代销站' }}</span>
              </div>
              <div class="flex items-center justify-between gap-2 text-[#58685D]">
                <span class="text-[#8A9A8F] shrink-0">{{ $t('citizenPurchase.pickupHoursLabel') }}:</span>
                <span class="text-[#58685D] text-end font-medium">{{ $t('citizenPurchase.pickupHoursVal') }}</span>
              </div>
            </div>
          </div>

          <!-- 方式 B: 送货上门 -->
          <div
            class="border rounded-lg p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
            data-demo-target="card-home-delivery"
            :class="
              deliveryType === 'HOME_DELIVERY'
                ? 'border-[#5C8A6B] bg-[#EFF5F1]/40 ring-2 ring-[#5C8A6B]/20 shadow-xs'
                : 'border-[#D9E5DB] hover:border-[#C9DBCE] bg-white'
            "
            @click="handleSelectHomeDelivery"
          >
            <!-- 头部：图标、标题与费用标签 (左右两侧均防换行和溢出) -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base transition shrink-0"
                  :class="deliveryType === 'HOME_DELIVERY' ? 'bg-[#326445] text-white' : 'bg-[#E9F1EB] text-[#58685D]'"
                >
                  <el-icon><Van /></el-icon>
                </div>
                <span class="text-xs sm:text-sm font-bold text-[#1B3123] whitespace-nowrap">{{ $t('citizenPurchase.deliveryTitle') }}</span>
              </div>
              <el-tag size="small" type="warning" effect="dark" class="font-bold font-mono shrink-0">
                {{ $t('citizenPurchase.deliveryFee') }}
              </el-tag>
            </div>

            <!-- 说明文本通栏展开，绝不挤压折行 -->
            <p class="text-[11px] text-[#58685D] leading-relaxed">
              {{ $t('citizenPurchase.deliverySub') }}
            </p>

            <div class="p-2.5 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB]/60 text-[11px] text-[#58685D] space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[#8A9A8F] shrink-0">{{ $t('citizenPurchase.deliverySlaLabel') }}</span>
                <span class="font-bold text-[#2A5440] text-end">{{ $t('citizenPurchase.deliverySlaValue') }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-[#8A9A8F] shrink-0">{{ $t('citizenPurchase.verifyHandover') }}</span>
                <span class="font-medium text-[#43554B] text-end">{{ $t('citizenPurchase.verifyHandoverHint') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 送货上门收货信息编辑表单 -->
        <div v-if="deliveryType === 'HOME_DELIVERY'" class="p-3.5 bg-[#EFF5F1]/50 rounded-lg border border-[#E1F4E4] text-xs space-y-3">
          <div class="flex items-center justify-between text-[#1F3326] font-bold">
            <span class="flex items-center gap-1.5">
              <el-icon><LocationFilled /></el-icon>
              <span>{{ $t('citizenPurchase.deliveryInfoTitle') }}</span>
            </span>
          </div>

          <div
            class="grid"
            :class="isAppMode ? 'grid-cols-1 gap-2.5' : 'grid-cols-1 sm:grid-cols-2 gap-3'"
          >
            <div>
              <span class="text-[#58685D] mb-1 block">{{ $t('citizenPurchase.deliveryStreet') }}:</span>
              <el-input v-model="deliveryAddress" :placeholder="$t('citizenPurchase.addressPlaceholder')" size="small" />
            </div>
            <div>
              <span class="text-[#58685D] mb-1 block">{{ $t('citizenPurchase.deliveryPhone') }}:</span>
              <el-input class="bidi-ltr" v-model="contactPhone" placeholder="+964 780 123 4567" size="small" />
            </div>
          </div>

          <div>
            <span class="text-[#58685D] mb-1 block">{{ $t('citizenPurchase.deliveryNotes') }}:</span>
            <el-input v-model="orderNotes" :placeholder="$t('citizenPurchase.notesPlaceholder')" size="small" />
          </div>
        </div>

        <!-- 步骤 2 底部操作栏 (等宽自适应网格防挤压) -->
        <div class="pt-3 border-t border-[#E9F1EB] grid grid-cols-2 gap-2" :class="isAppMode ? 'pb-2' : ''">
          <el-button class="w-full font-medium rounded-lg" @click="currentProcessStep = 1; scrollToTop()">
            <el-icon class="rtl-mirror-icon me-1"><Back /></el-icon>
            <span>{{ $t('citizenPurchase.prevStep') }}</span>
          </el-button>

          <el-button type="primary" size="large" class="w-full font-bold shadow-xs rounded-lg" data-demo-target="btn-next-pay" @click="handleProceedToStep3">
            <span>{{ $t('citizenPurchase.nextStepPay') }}</span>
            <el-icon class="rtl-mirror-icon ms-1"><Right /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 流程第三步：核对清单与付款 (Step 3) -->
    <!-- ======================================================== -->
    <div v-else-if="currentProcessStep === 3" class="space-y-4">
      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 p-4 sm:p-5 shadow-xs space-y-4">
        <!-- 步骤 3 顶栏 -->
        <div class="pb-3 border-b border-[#E9F1EB]">
          <h4 class="text-sm font-bold text-[#1B3123] flex items-center gap-1.5">
            <el-icon class="text-[#2F7A50]"><CreditCard /></el-icon>
            <span>{{ $t('citizenPurchase.step3Title') }}</span>
          </h4>
          <p class="text-[11px] text-[#8A9A8F] mt-0.5">
            {{ $t('citizenPurchase.step3Subtitle') }}
          </p>
        </div>

        <!-- 订单清单核对卡片 -->
        <div class="p-3.5 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/80 space-y-2.5 text-xs">
          <div class="font-bold text-[#1F3326] flex items-center justify-between">
            <span>{{ $t('citizenPurchase.orderSummary') }}</span>
            <el-tag size="small" :type="deliveryType === 'PICKUP' ? 'primary' : 'warning'" effect="light" class="font-bold">
              {{ deliveryType === 'PICKUP' ? $t('citizenPurchase.pickupTitle') : $t('citizenPurchase.deliveryTitle') }}
            </el-tag>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div
              v-for="it in activeSelectedSummary"
              :key="it.itemCode"
              class="p-2 rounded-lg bg-white border border-[#D9E5DB]/60 flex items-center justify-between"
            >
              <div>
                <span class="font-semibold text-[#1F3326]">{{ formatItemName(it.name) }}</span>
                <span class="text-[10px] text-[#8A9A8F] block">{{ it.unitPrice.toLocaleString() }} IQD/{{ it.unit }}</span>
              </div>
              <span class="font-mono font-bold text-[#326445]">{{ it.qty }} {{ it.unit }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-[#D9E5DB]/60 flex flex-wrap justify-between text-[11px] text-[#58685D]">
            <span>{{ $t('citizenPurchase.agentStationLabel') }} {{ quotaInfo.agentName }}</span>
            <span v-if="deliveryType === 'HOME_DELIVERY'">{{ $t('citizenPurchase.deliveryAddrLabel') }} {{ deliveryAddress }}</span>
          </div>
        </div>

        <!-- 费用明细卡与国家直补横幅 -->
        <div class="bg-gradient-to-br from-[#1B3123] to-[#12241A] text-white rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="space-y-0.5">
              <span class="text-[#8A9A8F] text-[11px]">{{ $t('citizenPurchase.goodsAmount') }}</span>
              <div class="font-mono font-bold text-lg text-white">{{ totalGoodsAmount.toLocaleString() }} IQD</div>
            </div>
            <div class="space-y-0.5">
              <span class="text-[#8A9A8F] text-[11px]">{{ $t('citizenPurchase.deliveryFeeLabel') }}</span>
              <div class="font-mono font-bold text-lg text-[#E5CEA1]">
                {{ deliveryType === 'HOME_DELIVERY' ? '1,000 IQD' : $t('citizenPurchase.freePickupFee') }}
              </div>
            </div>
            <div class="space-y-0.5">
              <span class="text-[#8A9A8F] text-[11px]">{{ $t('citizenPurchase.finalPayLabel') }}</span>
              <div class="font-mono font-black text-2xl text-[#6FBF92]">{{ finalTotalPayAmount.toLocaleString() }} IQD</div>
            </div>
          </div>

          <!-- 国家财政直补效益标签 -->
          <div class="p-2.5 rounded-lg bg-[#12241A]/70 border border-[#3E9B68]/40 text-[#A7D9BC] text-xs flex items-center gap-2">
            <el-icon class="text-[#6FBF92] text-base"><CircleCheckFilled /></el-icon>
            <div>
              <span>{{ $t('citizenPurchase.subsidyAmount') }}：<strong class="font-mono text-white text-sm">+{{ totalSubsidyAmount.toLocaleString() }} IQD</strong></span>
              <span class="text-[10px] text-[#6FBF92]/80 block">({{ $t('citizenPurchase.subsidyBanner') }})</span>
            </div>
          </div>
        </div>

        <!-- 步骤 3 底部操作栏 (等宽自适应网格防截断) -->
        <div class="pt-3 border-t border-[#E9F1EB] grid grid-cols-2 gap-2">
          <el-button class="w-full font-medium rounded-lg" @click="currentProcessStep = 2; scrollToTop()">
            <el-icon class="rtl-mirror-icon me-1"><Back /></el-icon>
            <span>{{ $t('citizenPurchase.prevStep') }}</span>
          </el-button>

          <el-button
            type="success"
            size="large"
            class="w-full font-bold shadow-md bg-[#2F7A50] hover:bg-[#2F5B44] border-none text-white rounded-lg px-2"
            data-demo-target="btn-pay"
            :loading="submitting"
            @click="handleStartPayment"
          >
            <el-icon class="me-1"><CreditCard /></el-icon>
            <span>{{ $t('citizenPurchase.payBtn') }} ({{ finalTotalPayAmount.toLocaleString() }} IQD)</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 4. 我的历史购买与提货流水 (附随时出示二维码) -->
    <!-- ======================================================== -->
    <div class="bg-white rounded-lg border border-[#D9E5DB]/80 p-4 sm:p-5 shadow-xs space-y-3">
      <div class="flex items-center justify-between pb-2.5 border-b border-[#E9F1EB]">
        <div class="flex items-center gap-1.5 min-w-0">
          <el-icon class="text-[#2F7A50] shrink-0"><Tickets /></el-icon>
          <h4 class="text-xs sm:text-sm font-bold text-[#1F3326] truncate">
            {{ $t('citizenPurchase.orderHistoryTitle') }} ({{ myOrders.length }})
          </h4>
        </div>
        <el-button size="small" circle text @click="loadOrders" :title="$t('common.refresh') || '刷新'">
          <el-icon class="text-[#58685D]"><Refresh /></el-icon>
        </el-button>
      </div>

      <div v-if="myOrders.length === 0" class="py-8 text-center text-[#8A9A8F] text-xs">
        {{ $t('citizenPurchase.noHistory') }}
      </div>

      <div v-else class="space-y-2.5">
        <div
          v-for="ord in myOrders"
          :key="ord.orderId"
          class="p-3 sm:p-3.5 rounded-lg border border-[#D9E5DB]/90 bg-white hover:border-[#C9DBCE] transition space-y-2 text-xs shadow-2xs"
        >
          <!-- 头部：左侧单号与时间，右侧履约模式与状态标签 -->
          <div class="flex items-center justify-between gap-1.5 border-b border-[#E9F1EB] pb-2">
            <div class="min-w-0 flex-1">
              <div class="font-mono font-bold text-[#1B3123] text-xs sm:text-sm truncate">
                #{{ ord.orderId }}
              </div>
              <div class="text-[#8A9A8F] font-mono text-[10px]">
                {{ (ord.createdAt || ord.paidAt || '').replace('T', ' ').slice(5, 16) }}
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                :class="ord.deliveryType === 'PICKUP' ? 'bg-[#EFF5F1] text-[#2A5440] border border-[#C7DED0]/60' : 'bg-[#EFF5F1] text-[#2A5440] border border-[#C7DED0]/60'"
              >
                {{ ord.deliveryType === 'PICKUP' ? '🏬 ' + $t('citizenPurchase.pickupTitle') : '🚚 ' + $t('citizenPurchase.deliveryTitle') }}
              </span>
              <el-tag size="small" :type="getOrderStatusTagType(ord.status)" effect="dark" class="scale-95 origin-right rtl:origin-left">
                {{ getOrderStatusLabel(ord.status, ord.deliveryType) }}
              </el-tag>
            </div>
          </div>

          <!-- 物资明细与底部操作/金额行 -->
          <div class="flex items-center justify-between gap-2 pt-0.5">
            <!-- 物资清单 -->
            <div class="flex flex-wrap items-center gap-1 flex-1 min-w-0">
              <span
                v-for="(it, idx) in ord.items"
                :key="idx"
                class="px-1.5 py-0.5 rounded bg-[#E9F1EB] text-[#43554B] text-[10px] font-medium border border-[#D9E5DB]/60 whitespace-nowrap"
              >
                {{ formatItemShort(it) }} <b class="font-mono text-[#1B3123]">×{{ it.qty }}{{ it.unit }}</b>
              </span>
            </div>

            <!-- 金额与提货二维码按钮 -->
            <div class="flex items-center gap-2 shrink-0 ms-auto">
              <span class="currency-amount font-mono font-bold text-[#2F5B44] text-xs sm:text-sm">
                IQD {{ (ord.selfPayAmount || ord.amount || 0).toLocaleString() }}
              </span>
              <el-button
                type="primary"
                size="small"
                class="font-bold rounded-lg px-2.5 flex items-center gap-1"
                data-demo-target="btn-show-qr"
                @click="openQrModal(ord)"
              >
                <el-icon><FullScreen /></el-icon>
                <span>{{ $t('citizenPurchase.showQrBtn') }}</span>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 5. 弹窗：已有的第三方电子支付对话框 -->
    <!-- ======================================================== -->
    <ElectronicPaymentDialog
      v-model="showPaymentDialog"
      :title="$t('citizenPurchase.paymentTitle')"
      :amount="finalTotalPayAmount"
      currency="IQD"
      :business-no="quotaInfo.cardNo || 'RC-10029381'"
      :applicant-name="w(quotaInfo.headName) || w('持卡公民')"
      :description="w('购买{period}配给口粮（{quantity}kg/L）', { period: displayQuotaPeriod, quantity: totalSelectedWeight })"
      @success="handlePaymentSuccess"
      @cancel="showPaymentDialog = false"
    />

    <!-- ======================================================== -->
    <!-- 6. 弹窗：下单成功与高清防伪取货二维码凭证 -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="showQrDialog"
      :title="null"
      width="340px"
      align-center
      :close-on-click-modal="false"
      class="qr-voucher-dialog"
    >
      <div v-if="currentQrOrder" class="p-2 sm:p-4 space-y-4 select-none text-center" data-demo-target="qr-voucher">
        <!-- 抬头 -->
        <div class="space-y-1 border-b border-[#E9F1EB] pb-3">
          <div class="w-12 h-12 rounded-lg bg-[#EFF5F1] text-[#2F7A50] flex items-center justify-center font-bold mx-auto border border-[#E1F4E4] shadow-xs">
            <el-icon :size="24"><CircleCheckFilled /></el-icon>
          </div>
          <h3 class="text-base font-bold text-[#1B3123]">{{ $t('citizenPurchase.qrVoucherTitle') }}</h3>
          <p class="text-xs text-[#2F5B44] font-medium">{{ $t('citizenPurchase.qrVoucherSub') }}</p>
          <div class="text-[10px] text-[#8A9A8F] font-mono">
            {{ currentQrOrder.orderId }}
          </div>
        </div>

        <!-- 核心动态二维码 -->
        <div class="w-60 h-60 mx-auto p-3.5 rounded-lg bg-white border-2 border-[#1F3326] shadow-xl flex items-center justify-center">
          <img
            v-if="pickupQrDataUrl"
            :src="pickupQrDataUrl"
            :alt="$t('citizenPurchase.qrVoucherTitle')"
            class="w-full h-full object-contain"
          />
          <el-icon v-else class="text-3xl text-[#8A9A8F] is-loading"><Loading /></el-icon>
        </div>
        <div class="text-[10px] text-[#8A9A8F] font-mono">{{ liveTimerString }}</div>

        <!-- 提货核验码 -->
        <div class="p-3 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB] text-xs space-y-1">
          <div class="text-[11px] text-[#58685D]">{{ $t('citizenPurchase.pickupCodeLabel') }}:</div>
          <div class="flex items-center justify-center gap-2">
            <span class="font-mono font-black text-[#1B3123] text-base sm:text-lg tracking-wider">
              {{ currentQrOrder.pickupCode }}
            </span>
            <el-button size="small" type="primary" link @click="copyPickupCode(currentQrOrder.pickupCode)">
              {{ $t('citizenPurchase.copyCode') }}
            </el-button>
          </div>
          <div class="text-[10px] text-[#8A9A8F]">
            {{ $t('citizenPurchase.qrScanHint') }}
          </div>
        </div>

        <el-button type="primary" class="w-full font-bold" @click="showQrDialog = false">
          {{ $t('common.confirm') || '确定' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRationI18n } from '../../../utils/rationI18n.js';
import { isEnNow } from '../../../utils/langHint.js';
import { isDemoActive, demoSubStep, setDemoStep, activateDemo } from '../../../utils/demoState.js';
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import QRCode from 'qrcode';
import { createPickupOrderQrPayload } from '../../../utils/qrPayload.js';

const processContainerRef = ref(null);
const route = useRoute();
const isAppMode = computed(() => {
  return route.query.layout === 'app' || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app');
});

function scrollToTop() {
  nextTick(() => {
    if (processContainerRef.value?.scrollIntoView) {
      processContainerRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const appViewport = document.querySelector('.pixel-screen') || document.querySelector('.app-scroll-container') || document.querySelector('.app-viewport') || window;
    if (appViewport && typeof appViewport.scrollTo === 'function') {
      appViewport.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
import {
  getCitizenQuotaBalance,
  getCitizenPurchaseOrders,
  purchaseRationItems
} from '../../../api/citizen.js';
import { onTabMessage } from '../../../utils/crossTabBus.js';
import ElectronicPaymentDialog from '../../../components/common/ElectronicPaymentDialog.vue';
import {
  UserFilled,
  Refresh,
  Shop,
  GoodsFilled,
  Check,
  Warning,
  Van,
  LocationFilled,
  CircleCheckFilled,
  CreditCard,
  Tickets,
  FullScreen,
  Loading,
  Right,
  Back
} from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const { w, formatRationItem, formatQuotaPeriod } = useRationI18n();

function formatItemName(name) {
  return formatRationItem(name);
}

function formatItemShort(item) {
  return formatRationItem(item, true);
}

function formatStockStatus(status) {
  if (!status || ['充足', '有现货', 'In Stock'].includes(status)) return w('有现货');
  if (['紧缺', '紧张', 'Low Stock'].includes(status)) return w('紧缺');
  if (['缺货', '无货', 'Out of Stock'].includes(status)) return w('缺货');
  return w(status);
}

function formatOriginPack(item) {
  if (!item) return '';
  const origin = w(item.origin);
  const rawPack = item.packSize || '';
  const match = /^\s*([\d.]+)\s*(kg|l)\s*\/\s*(袋|bag|瓶|bottle|桶|can)\s*$/i.exec(rawPack);
  const pack = match
    ? w(/^(袋|bag)$/i.test(match[3]) ? '{quantity}kg/袋' : /^(瓶|bottle)$/i.test(match[3]) ? '{quantity}L/瓶' : '{quantity}L/桶', { quantity: match[1] })
    : w(rawPack);
  return [origin, pack].filter(Boolean).join(' · ');
}

const displayQuotaPeriod = computed(() => formatQuotaPeriod(quotaInfo.quotaPeriod || '2026-10'));

// 核心流程步骤控制: 1=选购 -> 2=配送方式 -> 3=付款
const currentProcessStep = ref(1);

// 基础数据状态
const loading = ref(false);
const submitting = ref(false);

const quotaInfo = reactive({
  cardNo: 'RC-10029381',
  headName: '艾哈迈德·哈桑·萨利赫',
  memberCount: 4,
  agentId: 'FA-00128',
  agentName: '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
  province: '巴格达省',
  district: '卡尔赫区',
  defaultAddress: '巴格达省卡尔赫区海法街88号 3号楼201',
  phone: '+964 780 123 4567',
  quotaPeriod: '2026年10月'
});

const quotaItems = ref([]);

// 选购数量映射
const selectedMap = reactive({});

// 配送方式: 'PICKUP' (自提) | 'HOME_DELIVERY' (送货上门)
const deliveryType = ref('PICKUP');
const deliveryAddress = ref('巴格达省卡尔赫区海法街88号 3号楼201');
const contactPhone = ref('+964 780 123 4567');
const orderNotes = ref('');

watch(locale, (val) => {
  if (val === 'en') {
    quotaInfo.headName = 'Ahmed Hassan Saleh';
    quotaInfo.agentName = 'Baghdad Karkh 1st Station (Mohammed Jabbar)';
    quotaInfo.province = 'Baghdad';
    quotaInfo.district = 'Karkh';
    quotaInfo.defaultAddress = 'Bldg 3, Apt 201, Haifa St 88, Karkh, Baghdad';
    quotaInfo.quotaPeriod = 'Oct 2026';
    deliveryAddress.value = 'Bldg 3, Apt 201, Haifa St 88, Karkh, Baghdad';
  } else if (val === 'ar') {
    quotaInfo.headName = 'أحمد حسن صالح';
    quotaInfo.agentName = 'محطة الكرخ الأولى ببغداد (محمد جبار)';
    quotaInfo.province = 'محافظة بغداد';
    quotaInfo.district = 'قضاء الكرخ';
    quotaInfo.defaultAddress = 'عمارة 3، شقة 201، شارع حيفا 88، الكرخ، بغداد';
    quotaInfo.quotaPeriod = 'أكتوبر 2026';
    deliveryAddress.value = 'عمارة 3، شقة 201، شارع حيفا 88، الكرخ، بغداد';
  } else if (val === 'ckb') {
    quotaInfo.headName = 'ئەحمەد حەسەن ساڵح';
    quotaInfo.agentName = 'وێستگەی یەکەمی کەرخی بەغدا (محەممەد جەبار)';
    quotaInfo.province = 'پارێزگای بەغدا';
    quotaInfo.district = 'قەزای کەرخ';
    quotaInfo.defaultAddress = 'باڵەخانەی 3، شوقەی 201، شەقامی حەیفا 88، کەرخ، بەغدا';
    quotaInfo.quotaPeriod = 'تشرینی یەکەمی 2026';
    deliveryAddress.value = 'باڵەخانەی 3، شوقەی 201، شەقامی حەیفا 88، کەرخ، بەغدا';
  } else {
    quotaInfo.headName = '艾哈迈德·哈桑·萨利赫';
    quotaInfo.agentName = '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)';
    quotaInfo.province = '巴格达省';
    quotaInfo.district = '卡尔赫区';
    quotaInfo.defaultAddress = '巴格达省卡尔赫区海法街88号 3号楼201';
    quotaInfo.quotaPeriod = '2026年10月';
    deliveryAddress.value = '巴格达省卡尔赫区海法街88号 3号楼201';
  }
  loadQuotaData();
  loadOrders();
}, { immediate: true });


// 电子支付与凭证控制
const showPaymentDialog = ref(false);
const showQrDialog = ref(false);
const currentQrOrder = ref(null);
const pickupQrDataUrl = ref('');
const myOrders = ref([]);

let pickupQrGeneration = 0;
watch([showQrDialog, () => currentQrOrder.value?.pickupCode], async ([visible, pickupCode]) => {
  const generation = ++pickupQrGeneration;
  pickupQrDataUrl.value = '';
  if (!visible || !pickupCode) return;

  try {
    const dataUrl = await QRCode.toDataURL(createPickupOrderQrPayload(pickupCode), {
      width: 480,
      margin: 3,
      errorCorrectionLevel: 'M',
      color: { dark: '#1B3123', light: '#FFFFFF' }
    });
    if (generation === pickupQrGeneration) pickupQrDataUrl.value = dataUrl;
  } catch (error) {
    console.error('生成提货二维码失败', error);
    ElMessage.error(t('citizenPurchase.orderError'));
  }
});

// 动态防伪时钟
const liveTimerString = ref('');
let clockTimer = null;

// 计算选购清单
const activeSelectedSummary = computed(() => {
  return quotaItems.value
    .filter((it) => (selectedMap[it.itemCode] || 0) > 0)
    .map((it) => ({
      itemCode: it.itemCode,
      name: it.itemName,
      qty: selectedMap[it.itemCode],
      unit: it.unit,
      unitPrice: it.guidePriceIQD,
      marketPrice: it.marketPriceIQD,
      subsidyPrice: it.subsidyIQD
    }));
});

// 计算总重
const totalSelectedWeight = computed(() => {
  return activeSelectedSummary.value.reduce((acc, curr) => acc + Number(curr.qty || 0), 0);
});

// 计算物资自付小计
const totalGoodsAmount = computed(() => {
  return activeSelectedSummary.value.reduce(
    (acc, curr) => acc + Number(curr.qty || 0) * curr.unitPrice,
    0
  );
});

// 计算国家补贴总额
const totalSubsidyAmount = computed(() => {
  return activeSelectedSummary.value.reduce(
    (acc, curr) => acc + Number(curr.qty || 0) * curr.subsidyPrice,
    0
  );
});

// 最终实付金额 (商品规费 + 配送费)
const finalTotalPayAmount = computed(() => {
  const deliveryFee = deliveryType.value === 'HOME_DELIVERY' ? 1000 : 0;
  return totalGoodsAmount.value + deliveryFee;
});

const crossTabUnsubs = [];

onMounted(() => {
  loadQuotaData();
  loadOrders();
  startLiveClock();

  // 全流程演示 02 阶段：URL 携带 demo=true 时激活引导（支持 demoStep 指定起始节点）
  if (route.query.demo === 'true') {
    activateDemo(String(route.query.demoStep || 'step2_1'));
  }

  // 跨标签页监听代理端核销通知
  const unsubVerified = onTabMessage('ORDER_VERIFIED', (verifiedOrder) => {
    loadOrders();
    loadQuotaData();
    if (currentQrOrder.value && (currentQrOrder.value.orderId === verifiedOrder.orderId || currentQrOrder.value.pickupCode === verifiedOrder.pickupCode)) {
      currentQrOrder.value.status = 'DELIVERED';
      currentQrOrder.value.deliveredAt = verifiedOrder.deliveredAt;
    }
    ElMessage.success((isEnNow() ? `[Verification Notice] Your ration order ${verifiedOrder.orderId} has been verified and released on-site by the distribution station!` : `【核销通知】您的配给订单 ${verifiedOrder.orderId} 已由代销网点现场成功核销发放！`));
  });

  const unsubUpdated = onTabMessage('ORDER_UPDATED', (updatedOrder) => {
    loadOrders();
    if (currentQrOrder.value && (currentQrOrder.value.orderId === updatedOrder.orderId || currentQrOrder.value.pickupCode === updatedOrder.pickupCode)) {
      Object.assign(currentQrOrder.value, updatedOrder);
    }
  });

  crossTabUnsubs.push(unsubVerified, unsubUpdated);

  // 家庭档案变更（添加/移除成员、分户、转移等）时同步刷新家庭配给额度
  // （mock 层添加成员后 memberCount 与额度已重算，此处仅负责同标签页内即时刷新）
  window.addEventListener('rcm-family-updated', handleFamilyUpdated);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  crossTabUnsubs.forEach((fn) => fn && fn());
  window.removeEventListener('rcm-family-updated', handleFamilyUpdated);
});

function handleFamilyUpdated() {
  loadQuotaData();
}

function startLiveClock() {
  clockTimer = setInterval(() => {
    const now = new Date();
    liveTimerString.value = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
  }, 100);
}

// 加载配额数据
async function loadQuotaData() {
  loading.value = true;
  try {
    const res = await getCitizenQuotaBalance(quotaInfo.cardNo);
    if (res) {
      Object.assign(quotaInfo, res);
      quotaItems.value = res.quotas || [];
      if (!deliveryAddress.value) {
        deliveryAddress.value = res.defaultAddress || '';
      }
      if (!contactPhone.value) {
        contactPhone.value = res.phone || '';
      }
      quotaItems.value.forEach((item) => {
        // 剩余额度归零后强制清零已选数量，且不允许超出剩余额度
        const maxQty = Math.max(0, Number(item.remainingQuota) || 0);
        const current = Number(selectedMap[item.itemCode]);
        if (selectedMap[item.itemCode] === undefined || Number.isNaN(current) || current > maxQty) {
          selectedMap[item.itemCode] = maxQty;
        }
      });
    }
  } catch (err) {
    console.error('加载配额失败', err);
  } finally {
    loading.value = false;
  }
}

// 加载历史订单
async function loadOrders() {
  try {
    const res = await getCitizenPurchaseOrders({ cardNo: quotaInfo.cardNo });
    if (Array.isArray(res)) {
      myOrders.value = res;
    }
    // 若路由指定查看取货码或记录，自动打开最新订单的二维码
    if (route.query.action === 'showQr' || route.query.subTab === 'records') {
      nextTick(() => {
        if (myOrders.value.length > 0 && !showQrDialog.value) {
          openQrModal(myOrders.value[0]);
        }
      });
    }
  } catch (e) {
    console.error('加载订单历史失败', e);
  }
}

// 一键填满本月配额
function handleFillAllQuota() {
  quotaItems.value.forEach((item) => {
    selectedMap[item.itemCode] = item.remainingQuota;
  });
  ElMessage.success(t('citizenPurchase.fillAllQuota'));
  // 演示模式：推进至 02-2 选择配送方式
  if (isDemoActive.value) setDemoStep('step2_2');
}

// 清空所选
function handleClearSelected() {
  quotaItems.value.forEach((item) => {
    selectedMap[item.itemCode] = 0;
  });
}

// 步骤跳转校验
function handleJumpToStep(targetStep) {
  if (totalSelectedWeight.value <= 0) {
    ElMessage.warning(t('citizenPurchase.selectRequired'));
    return;
  }
  if (targetStep === 3 && deliveryType.value === 'HOME_DELIVERY' && !deliveryAddress.value) {
    ElMessage.warning(t('citizenPurchase.addressRequired'));
    return;
  }
  currentProcessStep.value = targetStep;
  scrollToTop();
}

// 推进到步骤 2
function handleProceedToStep2() {
  if (totalSelectedWeight.value <= 0) {
    ElMessage.warning(t('citizenPurchase.selectRequired'));
    return;
  }
  currentProcessStep.value = 2;
  scrollToTop();
  // 演示模式：推进至 02-3 选择送货上门
  if (isDemoActive.value) setDemoStep('step2_3');
}

// 选择送货上门配送方式
function handleSelectHomeDelivery() {
  deliveryType.value = 'HOME_DELIVERY';
  // 演示模式：自动预填档案默认收货信息，保证演示流程可无中断推进
  if (isDemoActive.value) {
    if (!deliveryAddress.value) deliveryAddress.value = quotaInfo.defaultAddress;
    if (!contactPhone.value) contactPhone.value = quotaInfo.phone;
    setDemoStep('step2_4');
  }
}

// 推进到步骤 3
function handleProceedToStep3() {
  if (deliveryType.value === 'HOME_DELIVERY' && !deliveryAddress.value) {
    ElMessage.warning(t('citizenPurchase.addressRequired'));
    return;
  }
  currentProcessStep.value = 3;
  scrollToTop();
  // 演示模式：推进至 02-5 确认支付金额并支付
  if (isDemoActive.value) setDemoStep('step2_5');
}

// 唤起第三方电子支付
function handleStartPayment() {
  if (totalSelectedWeight.value <= 0) {
    ElMessage.warning(t('citizenPurchase.selectRequired'));
    return;
  }
  if (deliveryType.value === 'HOME_DELIVERY' && !deliveryAddress.value) {
    ElMessage.warning(t('citizenPurchase.addressRequired'));
    return;
  }
  showPaymentDialog.value = true;
  // 演示模式：推进至 02-6 输入支付密码确认支付
  if (isDemoActive.value) setDemoStep('step2_6');
}

// 电子支付成功回调
async function handlePaymentSuccess(payResult) {
  showPaymentDialog.value = false;
  submitting.value = true;

  try {
    const payload = {
      cardNo: quotaInfo.cardNo,
      headName: quotaInfo.headName,
      phone: contactPhone.value || quotaInfo.phone,
      deliveryType: deliveryType.value,
      deliveryAddress: deliveryAddress.value,
      notes: orderNotes.value,
      selectedItems: activeSelectedSummary.value,
      paymentInfo: {
        channel: payResult.channel || 'Qi Card 电子钱包',
        txnNo: `TXN-${Math.floor(100000 + Math.random() * 900000)}-CBI`,
        paidAmount: finalTotalPayAmount.value,
        paidAt: payResult.paidAt || new Date().toISOString()
      }
    };

    const res = await purchaseRationItems(payload);

    // 订单持久化由 mock adapter 统一完成 (citizenPurchaseOrdersStore + addSharedOrder
    // + broadcastTabMessage ORDER_PURCHASED)；此处不再重复写入共享池，
    // 否则会产生一条无 orderId 的重复订单 (三端各多出一条幽灵订单)

    ElMessage.success(t('citizenPurchase.orderSuccess', { code: res.order?.pickupCode || res.pickupCode || '' }));

    // 清空当前所选并重置回步骤 1
    handleClearSelected();
    currentProcessStep.value = 1;

    // 重新拉取配额与订单
    await loadQuotaData();
    await loadOrders();

    // 自动打开取货二维码凭证
    if (res.order) {
      currentQrOrder.value = res.order;
      showQrDialog.value = true;
    }
  } catch (err) {
    ElMessage.error(t('citizenPurchase.orderError'));
  } finally {
    submitting.value = false;
  }
}

// 打开某个订单的二维码弹窗
function openQrModal(order) {
  currentQrOrder.value = order;
  showQrDialog.value = true;
  // 演示模式 05-1：点击「提货码」弹出二维码凭证后，推进至 05-2（将二维码交配送人员扫描确认收货）
  if (isDemoActive.value && demoSubStep.value === 'step5_1') setDemoStep('step5_2');
}

// 复制提货码
function copyPickupCode(code) {
  if (!code) return;
  navigator.clipboard?.writeText(code).then(() => {
    ElMessage.success(t('citizenPurchase.copySuccess'));
  }).catch(() => {
    ElMessage.info(code);
  });
}

function getOrderStatusTagType(status) {
  if (status === 'DELIVERED') return 'success';
  if (status === 'DISPATCHED') return 'primary';
  return 'warning';
}

function getOrderStatusLabel(status, type) {
  if (status === 'DELIVERED') return t('citizenPurchase.statusDelivered');
  if (status === 'DISPATCHED') return t('citizenPurchase.statusDispatched');
  return type === 'PICKUP' ? t('citizenPurchase.statusPendingPickup') : t('citizenPurchase.statusPendingDelivery');
}
</script>

<style scoped>
@keyframes scanQrAnimation {
  0% {
    top: 4%;
    opacity: 0.9;
  }
  50% {
    top: 92%;
    opacity: 1;
  }
  100% {
    top: 4%;
    opacity: 0.9;
  }
}

.animate-scan-qr {
  animation: scanQrAnimation 2.4s ease-in-out infinite;
}

:deep(.el-dialog.qr-voucher-dialog) {
  border-radius: 20px;
  overflow: hidden;
  max-width: 94vw !important;
}
</style>
