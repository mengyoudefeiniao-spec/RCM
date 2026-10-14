<template>
  <div ref="processContainerRef" class="citizen-purchase-tab space-y-4">
    <!-- ======================================================== -->
    <!-- 1. 优化点3：极简户主信息胶囊栏 (释放 APP 移动端首屏宝贵空间) -->
    <!-- ======================================================== -->
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-xs border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
      <!-- 左侧：户主、卡号与人数徽章 -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="w-6 h-6 rounded-lg bg-blue-600/80 flex items-center justify-center text-white shrink-0">
          <el-icon :size="13"><UserFilled /></el-icon>
        </div>
        <div class="flex items-center gap-1.5 font-bold">
          <span>{{ quotaInfo.headName || '艾哈迈德·哈桑' }}</span>
          <span class="text-slate-400 font-normal">({{ $t('citizenPurchase.compactHead') }})</span>
        </div>
        <span class="text-slate-500 font-mono">·</span>
        <span class="font-mono text-blue-300 font-bold tracking-tight">
          {{ quotaInfo.cardNo || 'RC-10029381' }}
        </span>
        <el-tag size="small" type="success" effect="dark" class="scale-90 font-mono font-bold origin-left">
          {{ quotaInfo.memberCount || 5 }} {{ $t('citizenPurchase.compactMembers') }}
        </el-tag>
      </div>

      <!-- 右侧：签约网点与快速刷新 -->
      <div class="flex items-center gap-2 ml-auto text-[11px] text-slate-300">
        <div class="hidden sm:flex items-center gap-1 text-slate-300">
          <el-icon class="text-amber-400"><Shop /></el-icon>
          <span class="truncate max-w-[190px]">{{ quotaInfo.agentName || '卡尔赫第一代销站' }}</span>
        </div>
        <span class="hidden sm:inline text-slate-500 font-mono">·</span>
        <span class="font-mono text-amber-300 text-[10px]">{{ displayQuotaPeriod }}</span>
        <el-tooltip :content="$t('citizenPurchase.refreshTooltip')" placement="top">
          <button
            type="button"
            class="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
            @click="loadQuotaData"
          >
            <el-icon :size="14"><Refresh /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 优化点2：拆分为 3 步流程导航指示器 (选购 -> 配送 -> 付款) -->
    <!-- ======================================================== -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-2.5 sm:p-3 shadow-2xs">
      <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
        <!-- 步骤 1 -->
        <button
          type="button"
          class="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border"
          :class="
            currentProcessStep === 1
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : currentProcessStep > 1
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          "
          @click="currentProcessStep = 1; scrollToTop()"
        >
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
            :class="currentProcessStep === 1 ? 'bg-white text-blue-600 font-bold' : currentProcessStep > 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'"
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
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : currentProcessStep > 2
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          "
          :disabled="totalSelectedWeight <= 0"
          @click="handleJumpToStep(2)"
        >
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
            :class="currentProcessStep === 2 ? 'bg-white text-blue-600 font-bold' : currentProcessStep > 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'"
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
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          "
          :disabled="totalSelectedWeight <= 0"
          @click="handleJumpToStep(3)"
        >
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
            :class="currentProcessStep === 3 ? 'bg-white text-blue-600 font-bold' : 'bg-slate-200 text-slate-500'"
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
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <!-- 步骤 1 顶栏操作 -->
        <div
          class="pb-3 border-b border-slate-100"
          :class="isAppMode ? 'flex flex-col gap-2.5 items-start' : 'flex flex-col sm:flex-row sm:items-center justify-between gap-2.5'"
        >
          <div class="w-full">
            <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <el-icon class="text-blue-600"><GoodsFilled /></el-icon>
              <span>{{ $t('citizenPurchase.step1Title') }}</span>
            </h4>
            <p class="text-[11px] text-slate-400 mt-0.5">
              {{ $t('citizenPurchase.step1Subtitle') }}
            </p>
          </div>

          <div :class="isAppMode ? 'grid grid-cols-2 gap-2 w-full' : 'flex items-center gap-2'">
            <el-button size="small" type="primary" plain class="!m-0 w-full" @click="handleFillAllQuota">
              <el-icon class="mr-1"><Check /></el-icon>
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
            class="rounded-xl border transition-all p-3.5 flex flex-col justify-between space-y-3"
            :class="
              selectedMap[item.itemCode] > 0
                ? 'border-blue-500 bg-blue-50/20 shadow-xs ring-1 ring-blue-400/30'
                : 'border-slate-200 bg-white hover:border-slate-300'
            "
          >
            <!-- 头部品名与价格 -->
            <div class="space-y-1.5">
              <div class="flex items-start justify-between gap-1">
                <div>
                  <span class="font-bold text-slate-900 text-xs sm:text-sm block">{{ formatItemName(item.itemName) }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">{{ formatOriginPack(item) }}</span>
                </div>
                <el-tag size="small" type="success" effect="plain" class="scale-90 origin-right font-bold">
                  {{ formatStockStatus(item.stockStatus) }}
                </el-tag>
              </div>

              <!-- 价格卡片 -->
              <div class="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 text-[11px]">{{ $t('citizenPurchase.priceSelfPay') }}:</span>
                  <span class="font-mono font-bold text-blue-600 text-sm">
                    {{ item.guidePriceIQD.toLocaleString() }} IQD<span class="text-[10px] text-slate-400">/{{ item.unit }}</span>
                  </span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{{ $t('citizenPurchase.priceMarket') }}:</span>
                  <span class="line-through font-mono">{{ item.marketPriceIQD.toLocaleString() }} IQD</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-emerald-700 font-semibold pt-0.5 border-t border-slate-200/50">
                  <span>{{ $t('citizenPurchase.priceSubsidy') }}:</span>
                  <span class="font-mono">+{{ item.subsidyIQD.toLocaleString() }} IQD/{{ item.unit }}</span>
                </div>
              </div>
            </div>

            <!-- 配额与限额 -->
            <div class="space-y-1 text-xs">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-slate-500">{{ $t('citizenPurchase.householdQuota') }}:</span>
                <span class="font-mono font-bold text-slate-800">{{ item.totalHouseholdQuota }} {{ item.unit }}</span>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-slate-500">{{ $t('citizenPurchase.remainingQuota') }}:</span>
                <span
                  class="font-mono font-bold"
                  :class="item.remainingQuota > 0 ? 'text-emerald-600' : 'text-slate-400'"
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

            <!-- 数量输入框 (严格限制 :max="item.remainingQuota") -->
            <div class="pt-2 border-t border-slate-100 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-700">{{ $t('citizenPurchase.selectedQty') }}:</span>
                <button
                  type="button"
                  class="text-[11px] text-blue-600 hover:underline cursor-pointer font-medium"
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
                <span class="text-xs text-slate-500 font-bold shrink-0 w-6">{{ item.unit }}</span>
              </div>

              <div v-if="selectedMap[item.itemCode] >= item.remainingQuota && item.remainingQuota > 0" class="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                <el-icon><Warning /></el-icon>
                <span>{{ $t('citizenPurchase.maxLimitReached') }}</span>
              </div>
              <div v-if="item.remainingQuota <= 0" class="text-[10px] text-slate-400">
                {{ $t('citizenPurchase.quotaExhausted') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 1 底部统计与下一步按钮 -->
        <div
          class="pt-3 border-t border-slate-100"
          :class="isAppMode ? 'flex flex-col gap-3 w-full' : 'flex flex-col sm:flex-row sm:items-center justify-between gap-3'"
        >
          <!-- 统计摘要行 (APP 模式下双列两端对齐，避免挤压折行) -->
          <div
            :class="isAppMode ? 'flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60' : 'flex items-center gap-3 text-xs text-slate-600 flex-wrap'"
          >
            <span>
              {{ $t('citizenPurchase.totalWeight') }}:
              <strong class="font-mono text-slate-900 text-sm ml-1">{{ totalSelectedWeight }} kg/L</strong>
            </span>
            <span v-if="!isAppMode">·</span>
            <span>
              {{ $t('citizenPurchase.goodsAmount') }}:
              <strong class="font-mono text-blue-600 text-sm ml-1">{{ totalGoodsAmount.toLocaleString() }} IQD</strong>
            </span>
          </div>

          <el-button
            type="primary"
            size="large"
            class="font-bold shadow-xs !h-11 rounded-xl"
            :class="isAppMode ? 'w-full !m-0 text-sm' : 'px-6'"
            :disabled="totalSelectedWeight <= 0"
            @click="handleProceedToStep2"
          >
            <span>{{ $t('citizenPurchase.nextStepDelivery') }}</span>
            <el-icon class="ml-1"><Right /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 流程第二步：选择配送方式 (Step 2) -->
    <!-- ======================================================== -->
    <div v-else-if="currentProcessStep === 2" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <!-- 步骤 2 顶栏 -->
        <div class="pb-3 border-b border-slate-100">
          <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <el-icon class="text-indigo-600"><Van /></el-icon>
            <span>{{ $t('citizenPurchase.step2Title') }}</span>
          </h4>
          <p class="text-[11px] text-slate-400 mt-0.5">
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
            class="border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
            :class="
              deliveryType === 'PICKUP'
                ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            "
            @click="deliveryType = 'PICKUP'"
          >
            <!-- 头部：图标、标题与费用标签 -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition shrink-0"
                  :class="deliveryType === 'PICKUP' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
                >
                  <el-icon><Shop /></el-icon>
                </div>
                <span class="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">{{ $t('citizenPurchase.pickupTitle') }}</span>
              </div>
              <el-tag size="small" type="success" effect="dark" class="font-bold shrink-0">
                {{ $t('citizenPurchase.pickupFree') }}
              </el-tag>
            </div>

            <!-- 说明文本通栏展开 -->
            <p class="text-[11px] text-slate-500 leading-relaxed">
              {{ $t('citizenPurchase.pickupSub') }}
            </p>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-400 shrink-0">{{ $t('citizenPurchase.pickupStationLabel') }}:</span>
                <span class="font-bold text-slate-800 truncate text-right">{{ quotaInfo.agentName || '巴格达卡尔赫第一代销站' }}</span>
              </div>
              <div class="flex items-center justify-between gap-2 text-slate-500">
                <span class="text-slate-400 shrink-0">{{ $t('citizenPurchase.pickupHoursLabel') }}:</span>
                <span class="text-slate-600 text-right font-medium">{{ $t('citizenPurchase.pickupHoursVal') }}</span>
              </div>
            </div>
          </div>

          <!-- 方式 B: 送货上门 -->
          <div
            class="border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3"
            :class="
              deliveryType === 'HOME_DELIVERY'
                ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            "
            @click="deliveryType = 'HOME_DELIVERY'"
          >
            <!-- 头部：图标、标题与费用标签 (左右两侧均防换行和溢出) -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition shrink-0"
                  :class="deliveryType === 'HOME_DELIVERY' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'"
                >
                  <el-icon><Van /></el-icon>
                </div>
                <span class="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">{{ $t('citizenPurchase.deliveryTitle') }}</span>
              </div>
              <el-tag size="small" type="warning" effect="dark" class="font-bold font-mono shrink-0">
                {{ $t('citizenPurchase.deliveryFee') }}
              </el-tag>
            </div>

            <!-- 说明文本通栏展开，绝不挤压折行 -->
            <p class="text-[11px] text-slate-500 leading-relaxed">
              {{ $t('citizenPurchase.deliverySub') }}
            </p>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-400 shrink-0">{{ $t('citizenPurchase.deliverySlaLabel') }}</span>
                <span class="font-bold text-indigo-700 text-right">{{ $t('citizenPurchase.deliverySlaValue') }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-400 shrink-0">{{ $t('citizenPurchase.verifyHandover') }}</span>
                <span class="font-medium text-slate-700 text-right">{{ $t('citizenPurchase.verifyHandoverHint') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 送货上门收货信息编辑表单 -->
        <div v-if="deliveryType === 'HOME_DELIVERY'" class="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-3">
          <div class="flex items-center justify-between text-indigo-900 font-bold">
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
              <span class="text-slate-500 mb-1 block">{{ $t('citizenPurchase.deliveryStreet') }}:</span>
              <el-input v-model="deliveryAddress" :placeholder="$t('citizenPurchase.addressPlaceholder')" size="small" />
            </div>
            <div>
              <span class="text-slate-500 mb-1 block">{{ $t('citizenPurchase.deliveryPhone') }}:</span>
              <el-input v-model="contactPhone" placeholder="+964 780 123 4567" size="small" />
            </div>
          </div>

          <div>
            <span class="text-slate-500 mb-1 block">{{ $t('citizenPurchase.deliveryNotes') }}:</span>
            <el-input v-model="orderNotes" :placeholder="$t('citizenPurchase.notesPlaceholder')" size="small" />
          </div>
        </div>

        <!-- 步骤 2 底部操作栏 (等宽自适应网格防挤压) -->
        <div class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2" :class="isAppMode ? 'pb-2' : ''">
          <el-button class="w-full font-medium rounded-xl" @click="currentProcessStep = 1; scrollToTop()">
            <el-icon class="mr-1"><Back /></el-icon>
            <span>{{ $t('citizenPurchase.prevStep') }}</span>
          </el-button>

          <el-button type="primary" size="large" class="w-full font-bold shadow-xs rounded-xl" @click="handleProceedToStep3">
            <span>{{ $t('citizenPurchase.nextStepPay') }}</span>
            <el-icon class="ml-1"><Right /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 流程第三步：核对清单与付款 (Step 3) -->
    <!-- ======================================================== -->
    <div v-else-if="currentProcessStep === 3" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <!-- 步骤 3 顶栏 -->
        <div class="pb-3 border-b border-slate-100">
          <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <el-icon class="text-emerald-600"><CreditCard /></el-icon>
            <span>{{ $t('citizenPurchase.step3Title') }}</span>
          </h4>
          <p class="text-[11px] text-slate-400 mt-0.5">
            {{ $t('citizenPurchase.step3Subtitle') }}
          </p>
        </div>

        <!-- 订单清单核对卡片 -->
        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
          <div class="font-bold text-slate-800 flex items-center justify-between">
            <span>{{ $t('citizenPurchase.orderSummary') }}</span>
            <el-tag size="small" :type="deliveryType === 'PICKUP' ? 'primary' : 'warning'" effect="light" class="font-bold">
              {{ deliveryType === 'PICKUP' ? $t('citizenPurchase.pickupTitle') : $t('citizenPurchase.deliveryTitle') }}
            </el-tag>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div
              v-for="it in activeSelectedSummary"
              :key="it.itemCode"
              class="p-2 rounded-lg bg-white border border-slate-200/60 flex items-center justify-between"
            >
              <div>
                <span class="font-semibold text-slate-800">{{ it.name }}</span>
                <span class="text-[10px] text-slate-400 block">{{ it.unitPrice.toLocaleString() }} IQD/{{ it.unit }}</span>
              </div>
              <span class="font-mono font-bold text-blue-600">{{ it.qty }} {{ it.unit }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200/60 flex flex-wrap justify-between text-[11px] text-slate-500">
            <span>{{ $t('citizenPurchase.agentStationLabel') }} {{ quotaInfo.agentName }}</span>
            <span v-if="deliveryType === 'HOME_DELIVERY'">{{ $t('citizenPurchase.deliveryAddrLabel') }} {{ deliveryAddress }}</span>
          </div>
        </div>

        <!-- 费用明细卡与国家直补横幅 -->
        <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="space-y-0.5">
              <span class="text-slate-400 text-[11px]">{{ $t('citizenPurchase.goodsAmount') }}</span>
              <div class="font-mono font-bold text-lg text-white">{{ totalGoodsAmount.toLocaleString() }} IQD</div>
            </div>
            <div class="space-y-0.5">
              <span class="text-slate-400 text-[11px]">{{ $t('citizenPurchase.deliveryFeeLabel') }}</span>
              <div class="font-mono font-bold text-lg text-amber-300">
                {{ deliveryType === 'HOME_DELIVERY' ? '1,000 IQD' : $t('citizenPurchase.freePickupFee') }}
              </div>
            </div>
            <div class="space-y-0.5">
              <span class="text-slate-400 text-[11px]">{{ $t('citizenPurchase.finalPayLabel') }}</span>
              <div class="font-mono font-black text-2xl text-emerald-400">{{ finalTotalPayAmount.toLocaleString() }} IQD</div>
            </div>
          </div>

          <!-- 国家财政直补效益标签 -->
          <div class="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <el-icon class="text-emerald-400 text-base"><CircleCheckFilled /></el-icon>
            <div>
              <span>{{ $t('citizenPurchase.subsidyAmount') }}：<strong class="font-mono text-white text-sm">+{{ totalSubsidyAmount.toLocaleString() }} IQD</strong></span>
              <span class="text-[10px] text-emerald-400/80 block">({{ $t('citizenPurchase.subsidyBanner') }})</span>
            </div>
          </div>
        </div>

        <!-- 步骤 3 底部操作栏 (等宽自适应网格防截断) -->
        <div class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <el-button class="w-full font-medium rounded-xl" @click="currentProcessStep = 2; scrollToTop()">
            <el-icon class="mr-1"><Back /></el-icon>
            <span>{{ $t('citizenPurchase.prevStep') }}</span>
          </el-button>

          <el-button
            type="success"
            size="large"
            class="w-full font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 border-none text-white rounded-xl px-2"
            :loading="submitting"
            @click="handleStartPayment"
          >
            <el-icon class="mr-1"><CreditCard /></el-icon>
            <span>{{ $t('citizenPurchase.payBtn') }} ({{ finalTotalPayAmount.toLocaleString() }} IQD)</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 4. 我的历史购买与提货流水 (附随时出示二维码) -->
    <!-- ======================================================== -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div class="flex items-center gap-1.5 min-w-0">
          <el-icon class="text-emerald-600 shrink-0"><Tickets /></el-icon>
          <h4 class="text-xs sm:text-sm font-bold text-slate-800 truncate">
            {{ $t('citizenPurchase.orderHistoryTitle') }} ({{ myOrders.length }})
          </h4>
        </div>
        <el-button size="small" circle text @click="loadOrders" :title="$t('common.refresh') || '刷新'">
          <el-icon class="text-slate-500"><Refresh /></el-icon>
        </el-button>
      </div>

      <div v-if="myOrders.length === 0" class="py-8 text-center text-slate-400 text-xs">
        {{ $t('citizenPurchase.noHistory') }}
      </div>

      <div v-else class="space-y-2.5">
        <div
          v-for="ord in myOrders"
          :key="ord.orderId"
          class="p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition space-y-2 text-xs shadow-2xs"
        >
          <!-- 头部：左侧单号与时间，右侧履约模式与状态标签 -->
          <div class="flex items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
            <div class="min-w-0 flex-1">
              <div class="font-mono font-bold text-slate-900 text-xs sm:text-sm truncate">
                #{{ ord.orderId }}
              </div>
              <div class="text-slate-400 font-mono text-[10px]">
                {{ (ord.createdAt || ord.paidAt || '').replace('T', ' ').slice(5, 16) }}
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                :class="ord.deliveryType === 'PICKUP' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'"
              >
                {{ ord.deliveryType === 'PICKUP' ? '🏬 ' + $t('citizenPurchase.pickupTitle') : '🚚 ' + $t('citizenPurchase.deliveryTitle') }}
              </span>
              <el-tag size="small" :type="getOrderStatusTagType(ord.status)" effect="dark" class="scale-95 origin-right">
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
                class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/60 whitespace-nowrap"
              >
                {{ formatItemShort(it) }} <b class="font-mono text-slate-900">×{{ it.qty }}{{ it.unit }}</b>
              </span>
            </div>

            <!-- 金额与提货二维码按钮 -->
            <div class="flex items-center gap-2 shrink-0 ml-auto">
              <span class="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                IQD {{ (ord.selfPayAmount || ord.amount || 0).toLocaleString() }}
              </span>
              <el-button
                type="primary"
                size="small"
                class="font-bold rounded-xl px-2.5 flex items-center gap-1"
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
      :applicant-name="quotaInfo.headName || '持卡公民'"
      :description="`购买2026年10月配给口粮(${totalSelectedWeight}kg/L)`"
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
      <div v-if="currentQrOrder" class="p-2 sm:p-4 space-y-4 select-none text-center">
        <!-- 抬头 -->
        <div class="space-y-1 border-b border-slate-100 pb-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mx-auto border border-emerald-100 shadow-xs">
            <el-icon :size="24"><CircleCheckFilled /></el-icon>
          </div>
          <h3 class="text-base font-bold text-slate-900">{{ $t('citizenPurchase.qrVoucherTitle') }}</h3>
          <p class="text-xs text-emerald-700 font-medium">{{ $t('citizenPurchase.qrVoucherSub') }}</p>
          <div class="text-[10px] text-slate-400 font-mono">
            {{ currentQrOrder.orderId }}
          </div>
        </div>

        <!-- 核心动态二维码 -->
        <div class="relative w-60 h-60 mx-auto p-3.5 rounded-2xl bg-white border-2 border-slate-800 shadow-xl flex flex-col items-center justify-center overflow-hidden">
          <div class="absolute inset-x-2 h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981] animate-scan-qr z-20"></div>

          <!-- SVG 高保真二维码矩阵 -->
          <svg viewBox="0 0 200 200" class="w-full h-full text-slate-900" fill="currentColor">
            <rect width="200" height="200" fill="#ffffff" />
            <rect x="15" y="15" width="45" height="45" fill="#0f172a" rx="6" />
            <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="4" />
            <rect x="29" y="29" width="17" height="17" fill="#0f172a" rx="2" />
            <rect x="140" y="15" width="45" height="45" fill="#0f172a" rx="6" />
            <rect x="148" y="23" width="29" height="29" fill="#ffffff" rx="4" />
            <rect x="154" y="29" width="17" height="17" fill="#0f172a" rx="2" />
            <rect x="15" y="140" width="45" height="45" fill="#0f172a" rx="6" />
            <rect x="23" y="148" width="29" height="29" fill="#ffffff" rx="4" />
            <rect x="29" y="154" width="17" height="17" fill="#0f172a" rx="2" />
            <rect x="75" y="20" width="12" height="12" />
            <rect x="95" y="20" width="12" height="12" />
            <rect x="115" y="20" width="12" height="12" />
            <rect x="75" y="40" width="12" height="12" />
            <rect x="105" y="45" width="12" height="12" />
            <rect x="20" y="75" width="12" height="12" />
            <rect x="40" y="75" width="12" height="12" />
            <rect x="60" y="75" width="12" height="12" />
            <rect x="80" y="75" width="12" height="12" />
            <rect x="100" y="75" width="12" height="12" />
            <rect x="120" y="75" width="12" height="12" />
            <rect x="140" y="75" width="12" height="12" />
            <rect x="160" y="75" width="12" height="12" />
            <rect x="20" y="95" width="12" height="12" />
            <rect x="45" y="105" width="12" height="12" />
            <rect x="75" y="100" width="12" height="12" />
            <rect x="115" y="95" width="12" height="12" />
            <rect x="145" y="105" width="12" height="12" />
            <rect x="165" y="95" width="12" height="12" />
            <rect x="25" y="120" width="12" height="12" />
            <rect x="65" y="120" width="12" height="12" />
            <rect x="85" y="120" width="12" height="12" />
            <rect x="125" y="120" width="12" height="12" />
            <rect x="155" y="120" width="12" height="12" />
            <rect x="75" y="145" width="12" height="12" />
            <rect x="105" y="145" width="12" height="12" />
            <rect x="135" y="145" width="12" height="12" />
            <rect x="165" y="145" width="12" height="12" />
            <rect x="75" y="165" width="12" height="12" />
            <rect x="95" y="165" width="12" height="12" />
            <rect x="125" y="165" width="12" height="12" />
            <rect x="155" y="165" width="12" height="12" />
            <rect x="82" y="82" width="36" height="36" fill="#0f172a" rx="8" />
            <rect x="86" y="86" width="28" height="28" fill="#10b981" rx="6" />
            <text x="100" y="105" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="monospace">RCM</text>
          </svg>

          <div class="absolute bottom-1 inset-x-2 text-[9px] font-mono text-slate-500 bg-white/90 py-0.5 rounded">
            {{ liveTimerString }}
          </div>
        </div>

        <!-- 提货核验码 -->
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div class="text-[11px] text-slate-500">{{ $t('citizenPurchase.pickupCodeLabel') }}:</div>
          <div class="flex items-center justify-center gap-2">
            <span class="font-mono font-black text-slate-900 text-base sm:text-lg tracking-wider">
              {{ currentQrOrder.pickupCode }}
            </span>
            <el-button size="small" type="primary" link @click="copyPickupCode(currentQrOrder.pickupCode)">
              {{ $t('citizenPurchase.copyCode') }}
            </el-button>
          </div>
          <div class="text-[10px] text-slate-400">
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
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

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
import { addSharedOrder } from '../../../utils/sharedSession.js';
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
  Right,
  Back
} from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

function formatItemName(name) {
  if (!name) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'Special Wheat Flour (Grade 1)';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'Long-Grain Rice (Imported)';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'Pure Refined Vegetable Oil';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'Refined Pure White Sugar';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'Full Cream Milk Powder';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'Selected Black Tea';
  } else if (lang === 'ar') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'طحين قمح ممتاز (درجة 1)';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'أرز بسمتي طويل الحبة';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'زيت نباتي مكرر نقي';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'سكر أبيض نقي مكرر';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'حليب مجفف كامل الدسم';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'شاي أسود فاخر';
  } else if (lang === 'ku') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'ئاردی گەنمی پلە یەک';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'برنجی دەنک درێژ';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'ڕۆنی ڕووەکی پاڵاوتە';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'شەکری سپی پاڵاوتە';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'شیری وشککراوی پڕ چەوری';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'چای ڕەشی هەڵبژێردراو';
  } else {
    if (name.includes('Flour') || name.includes('طحين') || name.includes('ئارد')) return '特级小麦面粉 (一等粉)';
    if (name.includes('Rice') || name.includes('أرز') || name.includes('برنج')) return '进口长粒大米';
    if (name.includes('Oil') || name.includes('زيت') || name.includes('ڕۆن')) return '精炼食用植物油';
    if (name.includes('Sugar') || name.includes('سكر') || name.includes('شەکر')) return '精制纯白细砂糖';
    if (name.includes('Milk') || name.includes('حليب') || name.includes('شیر')) return '全脂强化配方奶粉';
    if (name.includes('Tea') || name.includes('شاي') || name.includes('چای')) return '特选高山红茶';
  }
  return name;
}

function formatItemShort(it) {
  if (!it) return '';
  const name = it.itemName || '';
  if (name) {
    if (name.includes('面粉') || name.toLowerCase().includes('flour') || name.includes('طحين')) return isEn.value ? 'Flour' : '面粉';
    if (name.includes('米') || name.toLowerCase().includes('rice') || name.includes('أرز')) return isEn.value ? 'Rice' : '大米';
    if (name.includes('油') || name.toLowerCase().includes('oil') || name.includes('زيت')) return isEn.value ? 'Oil' : '食用油';
    if (name.includes('糖') || name.toLowerCase().includes('sugar') || name.includes('سكر')) return isEn.value ? 'Sugar' : '白糖';
    return name;
  }
  const code = (it.itemCode || '').toUpperCase();
  if (code.includes('FLOUR')) return isEn.value ? 'Flour' : '面粉';
  if (code.includes('RICE')) return isEn.value ? 'Rice' : '大米';
  if (code.includes('OIL')) return isEn.value ? 'Oil' : '食用油';
  if (code.includes('SUGAR')) return isEn.value ? 'Sugar' : '白糖';
  return isEn.value ? 'Ration' : '口粮';
}

function formatStockStatus(status) {
  if (isEn.value) {
    if (!status || status === '有现货' || status === '充足') return 'In Stock';
    if (status === '紧缺' || status === '紧张') return 'Low Stock';
    return 'In Stock';
  }
  return status || '有现货';
}

function formatOriginPack(item) {
  if (!item) return '';
  if (isEn.value) {
    const originMap = {
      '伊拉克中央保供面粉厂': 'Iraq Central Strategic Flour Mill',
      '国家粮食进出口总局': 'National Grain Import & Export Directorate',
      '米桑粮油制糖企业国库': 'Maysan Grain & Sugar State Reserve',
      '底格里斯食用油脂厂': 'Tigris Edible Oil Refinery'
    };
    const packMap = {
      '50kg/袋': '50kg/Bag',
      '25kg/袋': '25kg/Bag',
      '10kg/袋': '10kg/Bag',
      '1L/瓶': '1L/Bottle',
      '5L/桶': '5L/Can'
    };
    const origin = originMap[item.origin] || item.origin || 'Ministry of Trade Mill';
    const pack = packMap[item.packSize] || item.packSize || '';
    return pack ? `${origin} · ${pack}` : origin;
  }
  return `${item.origin || ''} · ${item.packSize || ''}`;
}

const displayQuotaPeriod = computed(() => {
  const p = quotaInfo.quotaPeriod || '2026-10';
  if (isEn.value) {
    if (p.includes('年') || p.includes('月')) {
      return 'Oct 2026';
    }
  }
  return p;
});

// 核心流程步骤控制: 1=选购 -> 2=配送方式 -> 3=付款
const currentProcessStep = ref(1);

// 基础数据状态
const loading = ref(false);
const submitting = ref(false);

const quotaInfo = reactive({
  cardNo: 'RC-10029381',
  headName: '艾哈迈德·哈桑·萨利赫',
  memberCount: 5,
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
  } else if (val === 'ku') {
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
const myOrders = ref([]);

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

  // 跨标签页监听代理端核销通知
  const unsubVerified = onTabMessage('ORDER_VERIFIED', (verifiedOrder) => {
    loadOrders();
    loadQuotaData();
    if (currentQrOrder.value && (currentQrOrder.value.orderId === verifiedOrder.orderId || currentQrOrder.value.pickupCode === verifiedOrder.pickupCode)) {
      currentQrOrder.value.status = 'DELIVERED';
      currentQrOrder.value.deliveredAt = verifiedOrder.deliveredAt;
    }
    ElMessage.success(`【核销通知】您的配给订单 ${verifiedOrder.orderId} 已由代销网点现场成功核销发放！`);
  });

  const unsubUpdated = onTabMessage('ORDER_UPDATED', (updatedOrder) => {
    loadOrders();
    if (currentQrOrder.value && (currentQrOrder.value.orderId === updatedOrder.orderId || currentQrOrder.value.pickupCode === updatedOrder.pickupCode)) {
      Object.assign(currentQrOrder.value, updatedOrder);
    }
  });

  crossTabUnsubs.push(unsubVerified, unsubUpdated);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  crossTabUnsubs.forEach((fn) => fn && fn());
});

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
        if (selectedMap[item.itemCode] === undefined) {
          selectedMap[item.itemCode] = 0;
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
}

// 推进到步骤 3
function handleProceedToStep3() {
  if (deliveryType.value === 'HOME_DELIVERY' && !deliveryAddress.value) {
    ElMessage.warning(t('citizenPurchase.addressRequired'));
    return;
  }
  currentProcessStep.value = 3;
  scrollToTop();
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

    // 跨标签页数据同步与广播：代理网点APP与政府端实时收到新配给订单
    addSharedOrder({
      cardNo: quotaInfo.cardNo,
      headName: quotaInfo.headName,
      items: activeSelectedSummary.value,
      deliveryType: deliveryType.value,
      deliveryAddress: deliveryAddress.value,
      amount: finalTotalPayAmount.value,
      agentName: quotaInfo.agentName
    });

    ElMessage.success(res.message || '配给品下单成功并完成电子缴费！');

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
    ElMessage.error(err.message || '下单提交异常');
  } finally {
    submitting.value = false;
  }
}

// 打开某个订单的二维码弹窗
function openQrModal(order) {
  currentQrOrder.value = order;
  showQrDialog.value = true;
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
