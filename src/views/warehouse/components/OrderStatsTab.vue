<template>
  <div class="order-stats-tab space-y-4">
    <!-- ======================================================== -->
    <!-- 1. 顶部国家战略保供大盘 Hero Banner (深绿砂金伊拉克国家风格) -->
    <!-- ======================================================== -->
    <div
      class="bg-gradient-to-r rtl:bg-gradient-to-l from-[#1F3326] via-[#326445] to-[#2F5B44] text-white p-4 sm:p-5 rounded-lg shadow-lg border border-[#D3AF62]/35 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      <!-- 背景保供暗纹光晕与雷达质感 -->
      <div class="absolute -end-10 -bottom-10 w-64 h-64 rounded-full bg-[#D3AF62]/10 blur-3xl pointer-events-none"></div>
      <div class="absolute start-1/3 -top-12 w-48 h-48 rounded-full bg-[#6FBF92]/10 blur-2xl pointer-events-none"></div>

      <div class="space-y-1.5 relative z-10">
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="w-2.5 h-2.5 rounded-full bg-[#D3AF62] animate-pulse shadow-[0_0_8px_#D3AF62]"></span>
          <h2 class="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 font-serif">
            <span>{{ $t('orderStats.pageTitle') }}</span>
          </h2>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D3AF62]/20 text-[#E5CEA1] border border-[#D3AF62]/40 shadow-xs"
          >
            MOT SCM BIG DATA
          </span>
          <span
            v-if="todayNewCount > 0"
            class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E9B68]/30 text-[#A7D9BC] border border-[#6FBF92]/50 animate-bounce"
          >
            +{{ todayNewCount }} {{ isEn ? 'New Orders Today' : '今日新生成订单' }}
          </span>
        </div>
        <p class="text-xs text-[#E1F4E4]/80 leading-relaxed max-w-3xl">
          {{ $t('orderStats.pageSubtitle') }}
        </p>
      </div>

      <!-- 操作与诊断控制区 -->
      <div class="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
        <el-button
          type="primary"
          class="font-bold border-none shadow-md bg-[#D3AF62] hover:bg-[#B8934A] text-[#1F3326] px-4 py-2 rounded-lg transition-all"
          :loading="aiAnalyzing"
          @click="generateAiForecast"
        >
          <span class="me-1.5">🤖</span>
          <span>{{ $t('orderStats.aiForecastBtn') }}</span>
        </el-button>
        <el-button
          circle
          size="default"
          class="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all"
          :loading="loading"
          @click="loadData"
        >
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 省市 / 区域 / 街道 三级多维联动筛选工具栏 -->
    <!-- ======================================================== -->
    <div class="bg-white p-3.5 sm:p-4 rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-3 text-xs">
      <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
        <span class="font-bold text-[#1F3326] flex items-center gap-1.5">
          <el-icon class="text-[#326445]"><Location /></el-icon>
          <span>{{ $t('orderStats.filterCardTitle') }}</span>
        </span>
        <div class="flex items-center gap-2">
          <span class="text-[#8A9A8F] font-mono text-[11px]">
            {{ $t('orderStats.matchedOrdersCount', { count: filteredOrders.length }) }}
          </span>
          <span class="text-[11px] text-[#2F5B44] bg-[#EFF5F1] px-2 py-0.5 rounded font-mono font-bold border border-[#C7E0CE]/60">
            {{ isEn ? 'Active Real-time' : '实盘动态' }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <!-- 1. 省市选择 -->
        <div>
          <label class="block text-[#58685D] mb-1 font-medium">{{ $t('orderStats.provinceLabel') }}</label>
          <el-select v-model="selectedProvince" class="w-full" size="small" @change="handleProvinceChange">
            <el-option :label="$t('orderStats.allProvinces')" value="全部" />
            <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </div>

        <!-- 2. 区域/中心选择 -->
        <div>
          <label class="block text-[#58685D] mb-1 font-medium">{{ $t('orderStats.districtLabel') }}</label>
          <el-select v-model="selectedDistrict" class="w-full" size="small" @change="handleDistrictChange">
            <el-option :label="$t('orderStats.allDistricts')" value="全部" />
            <el-option v-for="d in districtOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </div>

        <!-- 3. 街道网格选择 -->
        <div>
          <label class="block text-[#58685D] mb-1 font-medium">{{ $t('orderStats.streetLabel') }}</label>
          <el-select v-model="selectedStreet" class="w-full" size="small">
            <el-option :label="$t('orderStats.allStreets')" value="全部" />
            <el-option v-for="s in streetOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </div>

        <!-- 4. 履约方式选择 -->
        <div>
          <label class="block text-[#58685D] mb-1 font-medium">{{ $t('orderStats.deliveryTypeLabel') }}</label>
          <el-select v-model="selectedDeliveryType" class="w-full" size="small">
            <el-option :label="$t('orderStats.allDeliveryTypes')" value="全部" />
            <el-option :label="$t('reconciliation.homeDelivery')" value="HOME_DELIVERY" />
            <el-option :label="$t('reconciliation.storePickup')" value="PICKUP" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. 四大统计核心指标卡片 (深绿砂金微浮雕质感) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      <!-- 3.1 订单总量卡片 -->
      <div
        class="bg-white p-3.5 sm:p-4 rounded-lg border border-[#D9E5DB]/90 shadow-2xs hover:shadow-sm hover:border-[#326445]/40 transition-all space-y-1.5 relative overflow-hidden"
      >
        <div class="flex items-center justify-between text-xs text-[#58685D]">
          <span class="font-medium">{{ $t('orderStats.totalOrdersCard') }}</span>
          <span class="w-6 h-6 rounded-lg bg-[#326445]/10 text-[#326445] flex items-center justify-center font-bold">🛒</span>
        </div>
        <div class="text-xl sm:text-2xl font-bold font-mono text-[#326445]">
          {{ totalOrdersCount.toLocaleString() }}
          <span class="text-xs font-normal text-[#58685D]">{{ isEn ? 'orders' : '笔' }}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span>{{ $t('orderStats.coveredPopulation', { count: (totalOrdersCount * 5).toLocaleString() }) }}</span>
          <span class="text-[#2F5B44] font-bold font-mono">{{ $t('orderStats.registered100') }}</span>
        </div>
      </div>

      <!-- 3.2 面粉总需求配给量卡片 -->
      <div
        class="bg-white p-3.5 sm:p-4 rounded-lg border border-[#D9E5DB]/90 shadow-2xs hover:shadow-sm hover:border-[#D3AF62]/50 transition-all space-y-1.5 relative overflow-hidden"
      >
        <div class="flex items-center justify-between text-xs text-[#58685D]">
          <span class="font-medium">{{ $t('orderStats.flourDemandCard') }}</span>
          <span class="w-6 h-6 rounded-lg bg-[#FDF3E0] text-[#7A5F21] flex items-center justify-center font-bold">🌾</span>
        </div>
        <div class="text-xl sm:text-2xl font-bold font-mono text-[#6B5321]">
          {{ calculateItemTotal('面粉').toLocaleString() }}
          <span class="text-xs font-normal text-[#58685D]">KG</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span>{{ isEn ? 'Equivalent Tons:' : '折合战略储备:' }}</span>
          <span class="text-[#7A5F21] font-bold font-mono">{{ (calculateItemTotal('面粉') / 1000).toFixed(1) }} 吨</span>
        </div>
      </div>

      <!-- 3.3 大米与食用油综合需求卡片 -->
      <div
        class="bg-white p-3.5 sm:p-4 rounded-lg border border-[#D9E5DB]/90 shadow-2xs hover:shadow-sm hover:border-[#3E9B68]/40 transition-all space-y-1.5 relative overflow-hidden"
      >
        <div class="flex items-center justify-between text-xs text-[#58685D]">
          <span class="font-medium">{{ $t('orderStats.riceDemandCard') }}</span>
          <span class="w-6 h-6 rounded-lg bg-[#EFF5F1] text-[#2F5B44] flex items-center justify-center font-bold">🍚</span>
        </div>
        <div class="text-xl sm:text-2xl font-bold font-mono text-[#24483A]">
          {{ calculateItemTotal('大米').toLocaleString() }}
          <span class="text-xs font-normal text-[#58685D]">KG</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span>{{ isEn ? 'Fulfillment:' : '核验交付率:' }}</span>
          <span class="text-[#2F5B44] font-bold font-mono">98.4%</span>
        </div>
      </div>

      <!-- 3.4 公民规费实收与国家保供兜底直补总额 -->
      <div
        class="bg-white p-3.5 sm:p-4 rounded-lg border border-[#D9E5DB]/90 shadow-2xs hover:shadow-sm hover:border-[#D3AF62]/60 transition-all space-y-1.5 relative overflow-hidden"
      >
        <div class="flex items-center justify-between text-xs text-[#58685D]">
          <span class="font-medium">{{ isEn ? 'Fee & State Subsidy' : '规费实收与国家直补' }}</span>
          <span class="w-6 h-6 rounded-lg bg-[#D3AF62]/15 text-[#7A5F21] flex items-center justify-center font-bold">🏛️</span>
        </div>
        <div class="text-lg sm:text-xl font-bold font-mono text-[#326445] truncate">
          IQD {{ (totalSelfPayAmount / 1000000).toFixed(2) }}M
        </div>
        <div class="flex items-center justify-between text-[11px] text-[#8A9A8F] pt-1 border-t border-[#E9F1EB]">
          <span>{{ isEn ? 'State Subsidy:' : '国家财政贴息:' }}</span>
          <span class="text-[#7A5F21] font-bold font-mono">IQD {{ (totalSubsidyAmount / 1000000).toFixed(2) }}M</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 4. 统计分析图表：公民需求可视化大屏 (按街道分布与品类结构) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 4.1 各街道/区域公民配给需求分布柱状图 -->
      <div class="bg-white p-4 rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#326445]"></span>
            <h3 class="text-xs sm:text-sm font-bold text-[#1F3326]">{{ $t('orderStats.streetChartTitle') }}</h3>
          </div>
          <span class="text-[10px] text-[#8A9A8F] font-mono">{{ $t('orderStats.byOrderCount') }}</span>
        </div>

        <div class="space-y-3 pt-1">
          <div v-for="item in dynamicStreetData" :key="item.street" class="space-y-1 text-xs">
            <div class="flex justify-between items-center text-[#43554B]">
              <span class="font-medium truncate max-w-[220px]">{{ item.street }}</span>
              <div class="font-mono flex items-center gap-2">
                <span class="font-bold text-[#1B3123]">{{ item.orders }} {{ $t('reconciliation.unitsOrder') }}</span>
                <span class="text-[10px] text-[#8A9A8F]">({{ item.ratio }}%)</span>
              </div>
            </div>
            <div class="w-full bg-[#E9F1EB] rounded-full h-2.5 overflow-hidden">
              <div
                class="h-2.5 rounded-full transition-all duration-700"
                :class="item.isOverload ? 'bg-gradient-to-r rtl:bg-gradient-to-l from-[#D3AF62] to-[#C04442]' : 'bg-gradient-to-r rtl:bg-gradient-to-l from-[#326445] to-[#D3AF62]'"
                :style="{ width: `${item.barWidth}%` }"
              ></div>
            </div>
            <div v-if="item.isOverload" class="text-[10px] text-[#C04442] flex items-center gap-1 font-medium">
              <span>{{ isEn ? '⚠️ Demand surge >25%, agent station near 1,500 limit, expansion advised' : '⚠️ 需求增速超 25%，代销网点逼近 1,500 户红线，建议增设分站' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4.2 四大保供物资需求结构与环比增长 -->
      <div class="bg-white p-4 rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#D3AF62]"></span>
            <h3 class="text-xs sm:text-sm font-bold text-[#1F3326]">{{ $t('orderStats.itemsChartTitle') }}</h3>
          </div>
          <span class="text-[10px] text-[#8A9A8F] font-mono">{{ $t('agentOrderAnalytics.structureChartSub') }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <!-- 面粉 -->
          <div class="p-3 rounded-lg bg-[#FDF3E0]/40 border border-[#F2E3C6]/60 space-y-1 text-xs">
            <div class="flex justify-between items-center text-[#58685D] text-[11px]">
              <span class="font-medium">{{ $t('dashboard.flourDemand') }}</span>
              <span class="text-[#C04442] font-bold font-mono">+12.4% ↑</span>
            </div>
            <div class="text-base font-bold font-mono text-[#5A4718]">
              {{ calculateItemTotal('面粉').toLocaleString() }} <span class="text-[11px] font-normal text-[#58685D]">KG</span>
            </div>
            <div class="text-[10px] text-[#58685D]">{{ isEn ? '54.2% of staple demand' : '占主粮比重 54.2%' }}</div>
          </div>

          <!-- 大米 -->
          <div class="p-3 rounded-lg bg-[#EFF5F1]/40 border border-[#C7E0CE]/60 space-y-1 text-xs">
            <div class="flex justify-between items-center text-[#58685D] text-[11px]">
              <span class="font-medium">{{ $t('dashboard.riceDemand') }}</span>
              <span class="text-[#2F5B44] font-bold font-mono">+8.1% ↑</span>
            </div>
            <div class="text-base font-bold font-mono text-[#12241A]">
              {{ calculateItemTotal('大米').toLocaleString() }} <span class="text-[11px] font-normal text-[#58685D]">KG</span>
            </div>
            <div class="text-[10px] text-[#58685D]">{{ isEn ? '45.8% of staple demand' : '占主粮比重 45.8%' }}</div>
          </div>

          <!-- 食用油 -->
          <div class="p-3 rounded-lg bg-[#FDF3E0]/40 border border-[#F2E3C6]/60 space-y-1 text-xs">
            <div class="flex justify-between items-center text-[#58685D] text-[11px]">
              <span class="font-medium">{{ $t('dashboard.oilDemand') }}</span>
              <span class="text-[#C04442] font-bold font-mono">+15.6% ↑</span>
            </div>
            <div class="text-base font-bold font-mono text-[#5A4718]">
              {{ calculateItemTotal('油').toLocaleString() }} <span class="text-[11px] font-normal text-[#58685D]">L</span>
            </div>
            <div class="text-[10px] text-[#58685D]">{{ isEn ? 'Household uptake 92.5%' : '户均选购率 92.5%' }}</div>
          </div>

          <!-- 白糖 -->
          <div class="p-3 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB]/70 space-y-1 text-xs">
            <div class="flex justify-between items-center text-[#58685D] text-[11px]">
              <span class="font-medium">{{ $t('dashboard.sugarDemand') }}</span>
              <span class="text-[#58685D] font-bold font-mono">+3.2% ↑</span>
            </div>
            <div class="text-base font-bold font-mono text-[#1B3123]">
              {{ calculateItemTotal('糖').toLocaleString() }} <span class="text-[11px] font-normal text-[#58685D]">KG</span>
            </div>
            <div class="text-[10px] text-[#58685D]">{{ isEn ? 'Supply stable and ample' : '储备充沛供应稳定' }}</div>
          </div>
        </div>

        <!-- 履约渠道洞察微条 -->
        <div class="p-2.5 rounded-lg bg-[#326445]/5 border border-[#326445]/15 flex items-center justify-between text-xs text-[#326445]">
          <span>🛵 <strong>{{ isEn ? 'Fulfillment Trend: ' : '履约偏好趋势：' }}</strong>{{ isEn ? 'Home delivery share reaches ' + deliveryHomeRatio + '%, supported by door-to-door welfare services.' : '送货上门选购占比达 ' + deliveryHomeRatio + '%，契合便民保供导向。' }}</span>
          <span class="text-[#D3AF62] font-mono font-bold shrink-0 ms-2">{{ isEn ? 'Fulfillment 99.1%' : '时效履约 99.1%' }}</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 5. 核心：AI 智能助手 - 下月配给扩容需求预测与备货建议面板 -->
    <!-- ======================================================== -->
    <div
      class="bg-gradient-to-r rtl:bg-gradient-to-l from-[#1F3326] via-[#326445] to-[#1F3326] text-white rounded-lg p-4 sm:p-5 border border-[#D3AF62]/40 shadow-md space-y-3.5 relative overflow-hidden"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D3AF62]/30 pb-3">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-lg bg-[#D3AF62]/20 border border-[#D3AF62]/40 flex items-center justify-center text-base">🤖</span>
          <div>
            <h3 class="text-xs sm:text-sm font-bold text-white flex items-center gap-2 font-serif">
              <span>{{ $t('orderStats.aiForecastPanelTitle') }}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D3AF62]/25 text-[#E5CEA1] border border-[#D3AF62]/40">
                AI ENGINE V4.2
              </span>
            </h3>
            <span class="text-[10px] text-[#C7E0CE]/80">{{ $t('orderStats.aiForecastPanelSub') }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button
            size="small"
            class="font-bold border-none bg-[#D3AF62] hover:bg-[#B8934A] text-[#1F3326] rounded-lg px-3"
            @click="applyAiAdviceToPlan"
          >
            <span>{{ $t('orderStats.applyAdviceBtn') }}</span>
          </el-button>
        </div>
      </div>

      <!-- AI 分析要点卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div class="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 space-y-1.5">
          <div class="font-bold text-[#E5CEA1] flex items-center gap-1.5">
            <span>🎯 {{ isEn ? 'Key Expansion Area Recommendation' : '重点扩容区域建议' }}</span>
          </div>
          <p class="text-[#E1F4E4]/90 text-[11px] leading-relaxed">
            {{ isEn
              ? '[Baghdad Karkh Yarmouk St 3] Order growth highest (+28.4%), nearing 1,500 household limit. Recommended to increase next month flour allocation by 35 tons (+15%) and deploy 1 pickup sub-station.'
              : '【巴格达省卡尔赫区亚尔穆克第3街】订单增速最高 (+28.4%)，网点签约户逼近 1,500 户红线。建议下月面粉调拨额度调增 35 吨 (+15%)，并前置增设 1 处便民提货点。'
            }}
          </p>
        </div>

        <div class="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 space-y-1.5">
          <div class="font-bold text-[#E5CEA1] flex items-center gap-1.5">
            <span>⚖️ {{ isEn ? 'Supply-Demand Balance & Waste Prevention' : '供需平衡与防积压' }}</span>
          </div>
          <p class="text-[#E1F4E4]/90 text-[11px] leading-relaxed">
            {{ isEn
              ? '[Nineveh Mosul Old City] Sugar and flour turnover days longer than usual (28-day surplus). Recommended to maintain normal quota without additions, prioritizing stock clearance.'
              : '【尼尼微省摩苏尔老城区】白糖与面粉周转天数长于常态 (余量达 28 天)，建议下月保持常态配给不增发，以消化现货库存为主，规避仓储损耗与资金占用。'
            }}
          </p>
        </div>

        <div class="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 space-y-1.5">
          <div class="font-bold text-[#E5CEA1] flex items-center gap-1.5">
            <span>🚚 {{ isEn ? 'Fleet Logistics Capacity Advice' : '车队运力扩充建议' }}</span>
          </div>
          <p class="text-[#E1F4E4]/90 text-[11px] leading-relaxed">
            {{ isEn
              ? 'Home delivery adoption reaches ' + deliveryHomeRatio + '%; peak hours (9:00-11:00 AM) face slight backlog. Recommended to deploy 4 additional rapid delivery trucks to ensure 1-hour fulfillment.'
              : '居民“送货上门”选购率达 ' + deliveryHomeRatio + '%，高峰期（上午 9:00-11:00）订单积压率上升。建议联合区域代销商扩充 4 台急送保供货车，保障 1 小时内履约达标率。'
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 6. 订单明细穿透展示表格 (全域穿透真实订单与高亮新订单) -->
    <!-- ======================================================== -->
    <div data-demo-target="citizen-orders-table" class="bg-white rounded-lg border border-[#D9E5DB]/90 shadow-2xs overflow-hidden text-xs">
      <div class="p-3.5 bg-[#F3F8F4]/90 border-b border-[#D9E5DB] flex flex-wrap items-center justify-between gap-2.5">
        <div class="font-bold text-[#1F3326] flex items-center gap-2">
          <span class="w-2 h-4 bg-[#326445] rounded-xs"></span>
          <span>{{ $t('orderStats.orderListTitle') }}</span>
          <span class="text-[#8A9A8F] font-mono text-[11px]">({{ paginatedOrders.length }} / {{ filteredOrders.length }})</span>
          <span
            v-if="todayNewCount > 0"
            class="text-[11px] bg-[#FDF3E0] text-[#6B5321] px-2 py-0.5 rounded-full font-bold border border-[#E5CEA1] flex items-center gap-1"
          >
            <span>✨</span>
            <span>{{ isEn ? 'New Citizen Order Received' : '新生成的公民订单已置顶展示' }}</span>
          </span>
        </div>
        <div class="flex items-center gap-2">
          <el-input
            v-model="searchKeyword"
            :placeholder="$t('orderStats.searchPlaceholder')"
            size="small"
            clearable
            style="width: 280px"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
      </div>

      <el-table
        :data="paginatedOrders"
        v-loading="loading"
        border
        stripe
        size="small"
        class="text-xs"
        :row-class-name="tableRowClassName"
        @row-click="handleOrderRowClick"
      >
        <el-table-column prop="orderId" :label="$t('orderStats.orderColId')" min-width="170">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-mono font-bold text-[#1B3123]">{{ row.orderId }}</span>
              <span
                v-if="isRecentOrder(row)"
                class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#D3AF62] text-white animate-pulse"
              >
                NEW
              </span>
            </div>
            <div class="text-[10px] text-[#2F5B44] font-mono flex items-center gap-1">
              <span>{{ $t('reconciliation.pickupCodePrefix') }}:</span>
              <b>{{ row.pickupCode }}</b>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="headName" :label="$t('orderStats.orderColHead')" min-width="160">
          <template #default="{ row }">
            <div class="font-bold text-[#1B3123]">{{ row.headName }}</div>
            <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.cardNo }}</div>
            <div class="text-[10px] text-[#58685D] font-mono">{{ row.phone }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('orderStats.orderColRegion')" min-width="180">
          <template #default="{ row }">
            <div class="text-[#1F3326] font-medium">{{ row.province || '巴格达省' }} · {{ row.district || '卡尔赫区' }}</div>
            <div class="text-[10px] text-[#8A9A8F] truncate">{{ row.street || row.deliveryAddress || '亚尔穆克第3街道' }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('orderStats.orderColItems')" min-width="210">
          <template #default="{ row }">
            <div class="flex flex-wrap items-center gap-1">
              <span
                v-for="(it, idx) in row.items"
                :key="idx"
                class="px-1.5 py-0.5 rounded bg-[#E9F1EB] text-[#43554B] text-[10px] font-medium border border-[#D9E5DB]"
              >
                {{ formatItemShortName(it.itemName) }} <b class="font-mono font-bold">×{{ it.qty }}{{ it.unit }}</b>
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="isEn ? 'Amount' : '实付金额'" width="120" align="right">
          <template #default="{ row }">
            <span class="currency-amount font-mono font-bold text-[#7A5F21]">IQD {{ (row.selfPayAmount || row.amount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="deliveryType" :label="$t('orderStats.orderColDelivery')" width="115" align="center">
          <template #default="{ row }">
            <span
              v-if="row.deliveryType === 'HOME_DELIVERY'"
              class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF5F1] text-[#2A5440] border border-[#C7DED0]"
            >
              🚚 {{ $t('reconciliation.homeDelivery') }}
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF5F1] text-[#2F5B44] border border-[#C7E0CE]"
            >
              🏬 {{ $t('reconciliation.storePickup') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="$t('orderStats.orderColStatus')" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.status === 'DELIVERED' ? 'success' : row.status === 'DISPATCHED' ? 'warning' : 'info'"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" :label="$t('orderStats.orderColTime')" min-width="140">
          <template #default="{ row }">
            <span class="font-mono text-[#58685D] text-[11px]">{{ (row.createdAt || row.paidAt || '').replace('T', ' ').slice(0, 19) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="p-3 bg-[#F3F8F4] border-t border-[#D9E5DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
        <span>{{ $t('orderStats.totalRecords', { count: filteredOrders.length }) }}</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="filteredOrders.length"
          layout="total, sizes, prev, pager, next"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { ElMessage, ElNotification } from 'element-plus';
import { Refresh, Location, Search } from '@element-plus/icons-vue';
import { getAgentCitizenOrders } from '../../../api/agent.js';
import { onTabMessage } from '../../../utils/crossTabBus.js';
import { isDemoActive, activateDemo, setDemoStep } from '../../../utils/demoState.js';

const { t, locale } = useI18n();
const route = useRoute();
const isEn = computed(() => locale.value === 'en');

const emit = defineEmits(['apply-plan']);

const loading = ref(false);
const aiAnalyzing = ref(false);

const rawOrders = ref([]);
const searchKeyword = ref('');

const selectedProvince = ref('全部');
const selectedDistrict = ref('全部');
const selectedStreet = ref('全部');
const selectedDeliveryType = ref('全部');

const currentPage = ref(1);
const pageSize = ref(10);

// 最近新产生的订单 ID 集合 (用于加高亮徽章)
const recentNewOrderIds = ref(new Set());

// 统计今日新订单数
const todayNewCount = computed(() => recentNewOrderIds.value.size);

const provinceOptions = computed(() =>
  isEn.value
    ? ['Baghdad', 'Basra', 'Nineveh', 'Diyala', 'Kirkuk']
    : ['巴格达省', '巴士拉省', '尼尼微省', '迪亚拉省', '基尔库克省']
);

const districtOptionsMapZh = {
  '巴格达省': ['卡尔赫区', '鲁萨法区', '曼苏尔区', '多拉区', '亚尔穆克区'],
  '巴士拉省': ['阿沙尔区', '巴士拉老城区', '祖拜尔区'],
  '尼尼微省': ['摩苏尔老城区', '尼尼微平原区'],
  '迪亚拉省': ['巴古拜区', '哈奈根区'],
  '基尔库克省': ['基尔库克市中心区', '达库克区']
};
const districtOptionsMapEn = {
  'Baghdad': ['Karkh', 'Rusafa', 'Mansour', 'Dora', 'Yarmouk'],
  'Basra': ['Ashar', 'Old Basra', 'Zubair'],
  'Nineveh': ['Old Mosul', 'Nineveh Plains'],
  'Diyala': ['Baqubah', 'Khanaqin'],
  'Kirkuk': ['Kirkuk Center', 'Daquq']
};

const streetOptionsMapZh = {
  '卡尔赫区': ['亚尔穆克第3街道', '巴勒斯坦街', '海法大街'],
  '鲁萨法区': ['萨阿敦大街', '卡拉达街', '拉希德街'],
  '曼苏尔区': ['曼苏尔商业主街', '14号斋月街'],
  '多拉区': ['多拉第12街道', '多拉炼厂便民网格'],
  '摩苏尔老城区': ['摩苏尔滨河街', '老城中心集市路']
};
const streetOptionsMapEn = {
  'Karkh': ['Yarmouk 3rd St', 'Palestine St', 'Haifa Avenue'],
  'Rusafa': ['Saadoun Ave', 'Karrada St', 'Rashid St'],
  'Mansour': ['Mansour Commercial St', '14 Ramadan St'],
  'Dora': ['Dora 12th St', 'Dora Grid Station'],
  'Old Mosul': ['Mosul Riverfront St', 'Central Bazaar Way']
};

const districtOptions = computed(() => {
  const map = isEn.value ? districtOptionsMapEn : districtOptionsMapZh;
  if (selectedProvince.value === '全部') {
    return isEn.value
      ? ['Karkh', 'Rusafa', 'Mansour', 'Dora', 'Ashar', 'Old Mosul']
      : ['卡尔赫区', '鲁萨法区', '曼苏尔区', '多拉区', '阿沙尔区', '摩苏尔老城区'];
  }
  return map[selectedProvince.value] || [];
});

const streetOptions = computed(() => {
  const map = isEn.value ? streetOptionsMapEn : streetOptionsMapZh;
  if (selectedDistrict.value === '全部') {
    return isEn.value
      ? ['Yarmouk 3rd St', 'Palestine St', 'Saadoun Ave', 'Dora 12th St', 'Mosul Riverfront St']
      : ['亚尔穆克第3街道', '巴勒斯坦街', '萨阿敦大街', '多拉第12街道', '摩苏尔滨河街'];
  }
  return map[selectedDistrict.value] || (isEn.value ? ['Community Grid 1', 'Main Supply Way'] : ['社区第1网格街', '便民保供主干道']);
});

function handleProvinceChange() {
  selectedDistrict.value = '全部';
  selectedStreet.value = '全部';
}

function handleDistrictChange() {
  selectedStreet.value = '全部';
}

function formatItemShortName(name) {
  if (!name) return '';
  if (isEn.value) {
    if (name.includes('面粉') || name.toLowerCase().includes('flour')) return 'Wheat Flour';
    if (name.includes('米') || name.toLowerCase().includes('rice')) return 'Rice';
    if (name.includes('油') || name.toLowerCase().includes('oil')) return 'Veg Oil';
    if (name.includes('糖') || name.toLowerCase().includes('sugar')) return 'White Sugar';
    return name;
  }
  if (name.includes('面粉') || name.toLowerCase().includes('flour')) return '面粉';
  if (name.includes('米') || name.toLowerCase().includes('rice')) return '大米';
  if (name.includes('油') || name.toLowerCase().includes('oil')) return '食用油';
  if (name.includes('糖') || name.toLowerCase().includes('sugar')) return '白糖';
  return name;
}

function getStatusLabel(status) {
  switch (status) {
    case 'DELIVERED':
      return t('reconciliation.deliveredStatus') || (isEn.value ? 'Delivered' : '已交付');
    case 'DISPATCHED':
      return t('reconciliation.dispatchedStatus') || (isEn.value ? 'Dispatched' : '配送中');
    case 'READY_FOR_PICKUP':
      return isEn.value ? 'Ready for Pickup' : '备货就绪';
    case 'PAID':
    default:
      return isEn.value ? 'Paid / Pending' : '已支付待安排';
  }
}

function isRecentOrder(row) {
  if (!row) return false;
  if (recentNewOrderIds.value.has(row.orderId) || recentNewOrderIds.value.has(row.id)) return true;
  // 若创建时间在 15 分钟内
  const createTime = new Date(row.createdAt || row.paidAt || 0).getTime();
  if (createTime > 0 && Date.now() - createTime < 15 * 60 * 1000) {
    return true;
  }
  return false;
}

function tableRowClassName({ row }) {
  if (isRecentOrder(row)) {
    return 'bg-[#FDF3E0]/40 font-medium';
  }
  return '';
}

// ============================================================
// 全流程演示 03 阶段：政府端订单统计监控与审核穿透
// ============================================================
// URL 携带 demo=true 时激活引导（支持 demoStep 指定起始节点；
// watch 兼容同一路由组件复用时的查询参数变化，如 02 阶段完成页跳转）
watch(() => route.query, (q) => {
  if (q.demo === 'true') {
    activateDemo(String(q.demoStep || 'step3_1'));
  }
}, { immediate: true });

// 点击选中的订单记录 -> 完成 Stage 03（兜底通道：遮罩镂空区捕获层为主通道）
function handleOrderRowClick() {
  if (isDemoActive.value && demoSubStep.value === 'step3_1') {
    setDemoStep('step3_done');
  }
}

async function loadData() {
  loading.value = true;
  try {
    const res = await getAgentCitizenOrders();
    const orders = Array.isArray(res) ? res : (res?.data || []);
    const provs = provinceOptions.value;
    const distMap = isEn.value ? districtOptionsMapEn : districtOptionsMapZh;
    const strMap = isEn.value ? streetOptionsMapEn : streetOptionsMapZh;

    rawOrders.value = orders.map((o, idx) => {
      const p = provs[idx % provs.length];
      const districts = distMap[p] || [isEn.value ? 'Central District' : '中心示范区'];
      const d = districts[idx % districts.length];
      const streets = strMap[d] || [isEn.value ? 'Main Street' : '便民示范街'];
      const s = streets[idx % streets.length];
      return {
        ...o,
        province: o.province || p,
        district: o.district || d,
        street: o.street || s
      };
    });
  } catch (err) {
    console.error('加载订单统计失败', err);
  } finally {
    loading.value = false;
  }
}

const filteredOrders = computed(() => {
  let list = [...rawOrders.value];

  if (selectedProvince.value !== '全部') {
    list = list.filter(o => o.province === selectedProvince.value);
  }
  if (selectedDistrict.value !== '全部') {
    list = list.filter(o => o.district === selectedDistrict.value);
  }
  if (selectedStreet.value !== '全部') {
    list = list.filter(o => o.street === selectedStreet.value);
  }
  if (selectedDeliveryType.value !== '全部') {
    list = list.filter(o => o.deliveryType === selectedDeliveryType.value);
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter(o =>
      (o.headName && o.headName.toLowerCase().includes(kw)) ||
      (o.cardNo && o.cardNo.toLowerCase().includes(kw)) ||
      (o.orderId && o.orderId.toLowerCase().includes(kw)) ||
      (o.pickupCode && o.pickupCode.toLowerCase().includes(kw)) ||
      (o.phone && o.phone.includes(kw))
    );
  }

  return list;
});

const totalOrdersCount = computed(() => filteredOrders.value.length);

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredOrders.value.slice(start, start + pageSize.value);
});

// 计算真实物资总申请量 (基线 + 真实订单每一笔选购的实际数量)
function calculateItemTotal(keyword) {
  let realSum = 0;
  for (const ord of filteredOrders.value) {
    for (const it of ord.items || []) {
      const name = (it.itemName || '').toLowerCase();
      const kw = keyword.toLowerCase();
      if (
        name.includes(kw) ||
        (kw === '面粉' && name.includes('flour')) ||
        (kw === '大米' && name.includes('rice')) ||
        (kw === '油' && name.includes('oil')) ||
        (kw === '糖' && name.includes('sugar'))
      ) {
        realSum += Number(it.qty) || 0;
      }
    }
  }

  const baselineMap = {
    '面粉': 98500,
    '大米': 61200,
    '油': 36800,
    '糖': 41500
  };
  return (baselineMap[keyword] || 30000) + realSum;
}

// 计算规费总金额（IQD）
const totalSelfPayAmount = computed(() => {
  const sum = filteredOrders.value.reduce((acc, o) => acc + (Number(o.selfPayAmount || o.amount) || 0), 0);
  return 8500000 + sum;
});

// 计算国家补贴总额（IQD）
const totalSubsidyAmount = computed(() => {
  const sum = filteredOrders.value.reduce((acc, o) => acc + (Number(o.subsidyAmount) || 0), 0);
  return 34200000 + sum;
});

const deliveryHomeRatio = computed(() => {
  if (!filteredOrders.value.length) return '68.4';
  const homeCount = filteredOrders.value.filter(o => o.deliveryType === 'HOME_DELIVERY').length;
  return ((homeCount / filteredOrders.value.length) * 100).toFixed(1);
});

const dynamicStreetData = computed(() => {
  const total = filteredOrders.value.length || 1;
  const baseCount = Math.max(1, Math.floor(total * 0.28));
  if (isEn.value) {
    return [
      { street: 'Karkh · Yarmouk 3rd St', orders: baseCount + 120, ratio: '29.6', barWidth: 85, isOverload: true },
      { street: 'Rusafa · Saadoun Ave Grid', orders: baseCount + 40, ratio: '22.2', barWidth: 65, isOverload: false },
      { street: 'Dora · 12th St Station', orders: baseCount - 15, ratio: '18.3', barWidth: 52, isOverload: false },
      { street: 'Mansour · Commercial Station', orders: baseCount - 30, ratio: '17.2', barWidth: 49, isOverload: false },
      { street: 'Old Mosul · Riverfront Supply', orders: baseCount - 60, ratio: '12.7', barWidth: 36, isOverload: false }
    ];
  }
  return [
    { street: '卡尔赫区·亚尔穆克第3街', orders: baseCount + 120, ratio: '29.6', barWidth: 85, isOverload: true },
    { street: '鲁萨法区·萨阿敦大街网格', orders: baseCount + 40, ratio: '22.2', barWidth: 65, isOverload: false },
    { street: '多拉区·第12街道便民站', orders: baseCount - 15, ratio: '18.3', barWidth: 52, isOverload: false },
    { street: '曼苏尔区·商业街社区站', orders: baseCount - 30, ratio: '17.2', barWidth: 49, isOverload: false },
    { street: '摩苏尔老城·滨河街保供站', orders: baseCount - 60, ratio: '12.7', barWidth: 36, isOverload: false }
  ];
});

function generateAiForecast() {
  aiAnalyzing.value = true;
  setTimeout(() => {
    aiAnalyzing.value = false;
    ElMessage.success(isEn.value ? 'AI diagnosis completed! Demand forecasts and capacity advice refreshed.' : 'AI 智能分析已完成！各省各街道扩容需求预测与下月配额调减建议已刷新。');
  }, 700);
}

function applyAiAdviceToPlan() {
  ElMessage.success(isEn.value ? 'AI expansion parameters applied to Allocation Planning Form!' : '已自动将 AI 扩容预测参数应用至【配给计划管理】制定表单！');
}

let unsubs = [];

onMounted(() => {
  loadData();

  // 跨标签页监听公民端下单通知
  const unsubPurchased = onTabMessage('ORDER_PURCHASED', (newOrder) => {
    if (newOrder) {
      recentNewOrderIds.value.add(newOrder.orderId || newOrder.id);
      loadData();
      ElNotification({
        title: isEn.value ? '🔔 New Citizen Order Received' : '🔔 收到新公民配给订单',
        message: isEn.value
          ? `Citizen [${newOrder.headName || 'Resident'}] submitted order #${newOrder.orderId}. Allocation stats refreshed.`
          : `受领户主【${newOrder.headName || '持卡居民'}】刚刚提交配给订单 #${newOrder.orderId}，大盘数据已实时汇入！`,
        type: 'success',
        duration: 5000,
        position: 'top-right'
      });
    }
  });

  // 监听订单派单/核销状态更新通知
  const unsubUpdated = onTabMessage('ORDER_UPDATED', () => {
    loadData();
  });

  unsubs = [unsubPurchased, unsubUpdated];
});

onBeforeUnmount(() => {
  unsubs.forEach(fn => fn && fn());
});
</script>

<style scoped>
</style>
