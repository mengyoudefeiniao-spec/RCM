<template>
  <div
    class="mobile-agent-dashboard w-full bg-[#F8FBF8] flex flex-col font-sans pb-4 text-[#1F3326] transition-all duration-300"
    :class="[
      isStandaloneLayout
        ? 'min-h-full'
        : 'sm:max-w-[412px] sm:h-[924px] sm:max-h-[924px] sm:mx-auto sm:rounded-3xl sm:shadow-2xl sm:border sm:border-[#D9E5DB] sm:overflow-y-auto sm:relative'
    ]"
  >
    <!-- ======================================================== -->
    <!-- 1. Hero Banner 头部：沉浸式石拱门建筑纹理背景 + 业务大标题 (100% 满宽流式适配) -->
    <!-- ======================================================== -->
    <div class="relative w-full h-44 sm:h-52 overflow-hidden select-none shrink-0 border-b border-[#D9E5DB]">
      <!-- 背景图图层：真实截图处理后的无字背景大图 -->
      <img
        src="/images/dashboard-banner.png"
        alt="National Ration Card System Background"
        class="absolute inset-0 w-full h-full object-cover object-left sm:object-center select-none pointer-events-none"
        loading="eager"
      />

      <!-- 柔和微弱渐变保护层：确保在移动端窄屏下文字对比度与清晰度 -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#F8FBF8]/90 via-[#F3F8F4]/30 to-black/5 pointer-events-none"></div>

      <!-- 头部文字排版：位于图片图层上方 (relative z-10)，不要直接加在图片里面 -->
      <div class="relative z-10 h-full p-4 flex flex-col justify-between items-end text-right">
        <!-- 右上角小副标签与安全盾牌小图标 -->
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E5CEA1] shadow-xs">
          <span class="text-xs font-bold text-[#7A5F21] font-sans">
            {{ $t('mobileAgent.foodSupportService') }}
          </span>
          <el-icon :size="13" class="text-[#7A5F21]"><CircleCheck /></el-icon>
        </div>

        <!-- 主标题：今日配给发放 -->
        <div class="pb-1">
          <h1 class="text-2xl sm:text-3xl font-black text-[#326445] tracking-tight">
            {{ $t('mobileAgent.todayDistribution') }}
          </h1>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 核心业务卡片流 (标准移动端内边距: px-4, 卡片间距: space-y-3) -->
    <!-- ======================================================== -->
    <div class="flex-1 px-4 space-y-3 pt-2" ref="contentContainerRef">
      
      <!-- ======================================================== -->
      <!-- 2. 汇总状态卡片 (淡灰绿微底 #E2F4E4, 浅绿细描边 #C7E0CE) -->
      <!-- ======================================================== -->
      <div class="rcm-summary-card rcm-stagger-item space-y-3">
        <!-- 卡片右上角网点标识与浮层规则说明 -->
        <div class="flex items-center justify-between text-xs">
          <ModuleDescTip
            :title="$t('mobileAgent.siteOverviewTitle')"
            :desc="$t('mobileAgent.siteOverviewDesc')"
            :badge="$t('mobileAgent.siteMonitoring')"
            badge-type="success"
          />
          
          <div class="flex items-center gap-1 text-[#326445] font-medium font-sans">
            <span class="font-mono text-xs font-bold text-[#326445]">AG-0217#</span>
            <span>·</span>
            <span>{{ $t('mobileAgent.siteBadgeName') }}</span>
          </div>
        </div>

        <!-- 3 列核心统计数字 -->
        <div class="grid grid-cols-3 gap-2 text-center pt-1">
          <!-- 列 1: 今日发放 -->
          <div class="space-y-1">
            <div class="text-2xl sm:text-3xl font-black font-mono text-[#326445] tracking-tight">
              {{ countDispatched.displayValue.value }}
            </div>
            <div class="text-xs font-bold text-[#58685D] leading-tight">
              {{ $t('mobileAgent.todayDistribution') }}
            </div>
          </div>

          <!-- 列 2: 剩余户数 -->
          <div class="space-y-1 border-x border-[#C7E0CE]/80">
            <div class="text-2xl sm:text-3xl font-black font-mono text-[#326445] tracking-tight">
              {{ countRemaining.displayValue.value }}
            </div>
            <div class="text-xs font-bold text-[#58685D] leading-tight">
              {{ $t('mobileAgent.remainingHouseholds') }}
            </div>
          </div>

          <!-- 列 3: 待办预警 -->
          <div class="space-y-1">
            <div class="text-2xl sm:text-3xl font-black font-mono text-[#C04442] tracking-tight">
              {{ countAlerts.displayValue.value }}
            </div>
            <div class="text-xs font-bold text-[#C04442] leading-tight">
              {{ $t('mobileAgent.pendingAlerts') }}
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 3. 全宽砂金扫码主按钮 (CTA)：带 GSAP 按压弹性微缩放动效 -->
      <!-- ======================================================== -->
      <div class="rcm-stagger-item">
        <button
          ref="scanCtaBtnRef"
          type="button"
          class="rcm-btn-cta-gold relative overflow-hidden group shadow-md"
          data-demo-target="btn-scan-verify"
          @click="handleTriggerScan"
        >
          <!-- 几何暗纹装饰底纹 -->
          <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#1E3F35_1px,transparent_1px)] [background-size:12px_12px]"></div>

          <div class="relative z-10 flex items-center justify-center gap-2.5">
            <!-- 扫码取景框图标 [ - ] -->
            <span class="inline-flex items-center justify-center text-xl font-bold">
              <el-icon :size="22"><FullScreen /></el-icon>
            </span>
            <!-- 文本 -->
            <span class="tracking-wide">{{ $t('mobileAgent.scanVerifyBtn') }}</span>
          </div>
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- 3.5 网点经营统计卡片 (发放量 / 库存 / 每日收益) -->
      <!-- ======================================================== -->
      <div class="rcm-list-card rcm-stagger-item space-y-3">
        <!-- 头部：左侧标题与指标说明，右侧网点标识 -->
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <div class="flex items-center gap-1">
            <ModuleDescTip
              :title="$t('mobileAgent.bizStatsTitle')"
              :desc="$t('mobileAgent.bizStatsDesc')"
              :badge="$t('mobileAgent.bizStatsBadge')"
              badge-type="success"
            />
          </div>
          <span class="text-[11px] text-[#8A9A8F] font-medium font-mono">AG-0217#</span>
        </div>

        <!-- 3 列经营指标 (与下方台账数据保持一致) -->
        <div class="grid grid-cols-3 gap-2 pt-1">
          <!-- 发放量: 当日核销出库累计 (与台账已发合计一致) -->
          <div class="p-2.5 rounded-lg bg-[#F3F9F5] border border-[#D9E5DB] text-center space-y-1">
            <div class="text-base sm:text-lg font-black font-mono text-[#326445] tracking-tight">
              2,450<span class="text-[10px] font-sans font-normal text-[#8A9A8F] ml-0.5">kg</span>
            </div>
            <div class="text-[10px] font-bold text-[#58685D] leading-tight">{{ $t('mobileAgent.bizStatsIssued') }}</div>
          </div>

          <!-- 库存: 台账理论应存余量 -->
          <div class="p-2.5 rounded-lg bg-[#F3F9F5] border border-[#D9E5DB] text-center space-y-1">
            <div class="text-base sm:text-lg font-black font-mono text-[#1F3326] tracking-tight">
              1,250<span class="text-[10px] font-sans font-normal text-[#8A9A8F] ml-0.5">kg</span>
            </div>
            <div class="text-[10px] font-bold text-[#58685D] leading-tight">{{ $t('mobileAgent.bizStatsStock') }}</div>
          </div>

          <!-- 每日收益: 当日核销配给折算收益 -->
          <div class="p-2.5 rounded-lg bg-[#FDF9EF] border border-[#EED9AE] text-center space-y-1">
            <div class="text-base sm:text-lg font-black font-mono text-[#B8934A] tracking-tight">
              428,000<span class="text-[10px] font-sans font-normal text-[#B8934A]/70 ml-0.5">IQD</span>
            </div>
            <div class="text-[10px] font-bold text-[#58685D] leading-tight">{{ $t('mobileAgent.bizStatsDailyIncome') }}</div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 4. 周期台账核验卡片 (本期库存台账) -->
      <!-- ======================================================== -->
      <div class="rcm-list-card rcm-stagger-item space-y-3.5">
        <!-- 头部标题区：左侧辅助公式说明，右侧主标题 -->
        <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2.5">
          <!-- 左侧公式说明：台账平衡稽查公式 -->
          <div class="flex items-center gap-1">
            <ModuleDescTip
              :title="$t('mobileAgent.balanceFormulaTitle')"
              :desc="$t('mobileAgent.balanceFormulaDesc')"
              :badge="$t('mobileAgent.balanceFormulaBadge')"
              badge-type="warning"
            />
          </div>

          <!-- 右侧标题 -->
          <div class="flex items-center gap-1.5 text-right">
            <h3 class="text-sm font-bold text-[#1F3326]">{{ $t('mobileAgent.periodInventoryTitle') }}</h3>
          </div>
        </div>

        <!-- 物料明细子卡片列表 -->
        <div class="space-y-3" ref="materialsListRef">
          
          <!-- 物料 1: 面粉 -->
          <div class="p-3 rounded-lg border border-[#D9E5DB] bg-[#F3F9F5] space-y-2.5 hover:border-[#D3AF62]/60 transition-colors">
            <div class="flex items-center justify-between">
              <!-- 品类名称 -->
              <span class="font-bold text-sm text-[#1F3326]">
                {{ $t('mobileAgent.materialFlour') }}
              </span>

              <!-- 状态胶囊：平账 -->
              <span class="rcm-pill-badge rcm-pill-success">
                <span class="rcm-badge-dot"></span>
                <span>{{ $t('mobileAgent.matchedStatus') }}</span>
              </span>
            </div>

            <!-- 4 列对账参数 (调拨 / 已发 / 理论 / 实盘) -->
            <div class="grid grid-cols-4 gap-1.5 text-center pt-0.5 font-mono">
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">2,000</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colDispatch') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">1,240</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colDistributed') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">760</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colTheory') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#326445]">760</div>
                <div class="text-[10px] text-[#326445] font-bold font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colActual') }}</div>
              </div>
            </div>
          </div>

          <!-- 物料 2: 大米 (调拨 900 - 已发 720 = 理论 180 = 实盘 180，账实相符) -->
          <div class="p-3 rounded-lg border border-[#D9E5DB] bg-[#F3F9F5] space-y-2.5 hover:border-[#D3AF62]/60 transition-colors">
            <div class="flex items-center justify-between">
              <!-- 品类名称 -->
              <span class="font-bold text-sm text-[#1F3326]">
                {{ $t('mobileAgent.materialRice') }}
              </span>

              <!-- 状态胶囊：平账 -->
              <span class="rcm-pill-badge rcm-pill-success">
                <span class="rcm-badge-dot"></span>
                <span>{{ $t('mobileAgent.matchedStatus') }}</span>
              </span>
            </div>

            <!-- 4 列对账参数 -->
            <div class="grid grid-cols-4 gap-1.5 text-center pt-0.5 font-mono">
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">900</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colDispatch') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">720</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colDistributed') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">180</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colTheory') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#326445]">180</div>
                <div class="text-[10px] text-[#326445] font-bold font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colActual') }}</div>
              </div>
            </div>
          </div>

          <!-- 物料 3: 食用油 -->
          <div class="p-3 rounded-lg border border-[#D9E5DB] bg-[#F3F9F5] space-y-2.5 hover:border-[#D3AF62]/60 transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-[#1F3326]">
                {{ $t('mobileAgent.materialOil') }}
              </span>

              <span class="rcm-pill-badge rcm-pill-success">
                <span class="rcm-badge-dot"></span>
                <span>{{ $t('mobileAgent.matchedStatus') }}</span>
              </span>
            </div>

            <div class="grid grid-cols-4 gap-1.5 text-center pt-0.5 font-mono">
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">800</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colDispatch') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">490</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colDistributed') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1F3326]">310</div>
                <div class="text-[10px] text-[#8A9A8F] font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colTheory') }}</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#326445]">310</div>
                <div class="text-[10px] text-[#326445] font-bold font-sans leading-tight mt-0.5">{{ $t('mobileAgent.colActual') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 公民统计子面板 -->
        <div class="pt-3.5 border-t border-[#E9F1EB] space-y-2.5">
          <div class="text-[11px] font-bold text-[#8A9A8F] uppercase tracking-wide">
            {{ $t('mobileAgent.citizenStatsTitle') }}
          </div>

          <div class="grid grid-cols-2 gap-2">
            <!-- 服务辖区公民 -->
            <div class="p-2.5 rounded-lg bg-[#F7FAF8] border border-[#E4EDE6] text-center space-y-0.5">
              <div class="text-base font-bold text-[#1F3326] font-mono">
                1,480<span class="text-[10px] font-sans font-normal text-[#8A9A8F] ml-0.5">{{ $t('mobileAgent.unitHousehold') }}</span>
              </div>
              <div class="text-[10px] text-[#58685D] leading-tight">{{ $t('mobileAgent.citizenServedHouseholds') }}</div>
            </div>

            <!-- 今日核销公民 -->
            <div class="p-2.5 rounded-lg bg-[#F3F9F5] border border-[#E4EDE6] text-center space-y-0.5">
              <div class="text-base font-bold text-[#326445] font-mono">
                128<span v-if="$t('mobileAgent.unitPerson')" class="text-[10px] font-sans font-normal text-[#8A9A8F] ml-0.5">{{ $t('mobileAgent.unitPerson') }}</span>
              </div>
              <div class="text-[10px] text-[#58685D] leading-tight">{{ $t('mobileAgent.citizenVerifiedToday') }}</div>
            </div>

            <!-- 户均发放 -->
            <div class="p-2.5 rounded-lg bg-[#F7FAF8] border border-[#E4EDE6] text-center space-y-0.5">
              <div class="text-base font-bold text-[#B8934A] font-mono">
                25.4<span class="text-[10px] font-sans font-normal text-[#B8934A]/70 ml-0.5">kg</span>
              </div>
              <div class="text-[10px] text-[#58685D] leading-tight">{{ $t('mobileAgent.citizenAvgPerHousehold') }}</div>
            </div>

            <!-- 公民满意度 -->
            <div class="p-2.5 rounded-lg bg-[#FDF9EF] border border-[#EED9AE] text-center space-y-0.5">
              <div class="text-base font-bold text-[#B8934A] font-mono">
                98.2<span class="text-[10px] font-sans font-normal text-[#B8934A]/70 ml-0.5">%</span>
              </div>
              <div class="text-[10px] text-[#58685D] leading-tight">{{ $t('mobileAgent.citizenSatisfaction') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- ======================================================== -->
    <!-- 模拟现场扫码核销仿真弹窗 (带激光扫描线) -->
    <!-- ======================================================== -->
    <!-- 模拟现场扫码核销仿真弹窗 (严控宽度不超过 412px 视口，居中展示) -->
    <el-dialog
      v-model="scanDialogVisible"
      :title="$t('mobileAgent.scanModalTitle')"
      width="350px"
      align-center
      append-to-body
      class="mobile-scan-dialog"
    >
      <div class="space-y-3.5 text-center" data-demo-target="scan-viewfinder">
        <!-- 扫码取景框模拟 -->
        <div class="relative w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-lg bg-black/95 overflow-hidden border-2 border-[#D3AF62] shadow-inner flex items-center justify-center">
          <!-- 激光扫描线 -->
          <div class="absolute w-full h-1 bg-gradient-to-r from-transparent via-[#D3AF62] to-transparent shadow-[0_0_12px_#D3AF62] animate-scanBeam"></div>
          
          <!-- 取景角标 -->
          <div class="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D3AF62]"></div>
          <div class="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D3AF62]"></div>
          <div class="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D3AF62]"></div>
          <div class="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D3AF62]"></div>

          <div class="text-white/70 text-xs font-mono space-y-1">
            <el-icon :size="28" class="text-[#D3AF62] animate-pulse"><FullScreen /></el-icon>
            <div class="text-[11px]">{{ $t('mobileAgent.scanModalAlignQr') }}</div>
          </div>
        </div>

        <div class="text-[11px] text-[#58685D]">
          {{ $t('mobileAgent.scanModalTips') }}
        </div>

        <div class="pt-1 flex items-center justify-center gap-2">
          <el-button size="small" @click="scanDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button size="small" type="primary" color="#326445" class="font-bold" @click="handleConfirmSimulatedScan">
            {{ $t('mobileAgent.simulateSuccessBtn') }}
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 分发流水抽屉 (历史分发记录) -->
    <!-- ======================================================== -->
    <el-drawer
      v-model="showHistoryDrawer"
      :title="$t('mobileAgent.historyDrawerTitle')"
      direction="btt"
      size="65%"
      append-to-body
    >
      <div class="space-y-3 p-1">
        <div class="text-xs text-[#58685D] flex justify-between items-center pb-2 border-b">
          <span>{{ $t('mobileAgent.historyDrawerSiteTitle') }}</span>
          <span class="font-bold text-[#326445]">{{ $t('mobileAgent.historyDrawerDispatchedCount') }}</span>
        </div>

        <div class="space-y-2 max-h-[360px] overflow-y-auto">
          <div
            v-for="(item, idx) in distributionRecords"
            :key="idx"
            class="p-2.5 rounded-lg border border-[#D9E5DB] bg-white flex items-center justify-between text-xs"
          >
            <div>
              <div class="font-bold text-[#1F3326]">{{ item.name }} ({{ $t('mobileAgent.unitCardNo') }}: {{ item.cardNo }})</div>
              <div class="text-[11px] text-[#8A9A8F]">{{ item.time }} · {{ $t('mobileAgent.flourShort') }} {{ item.flour }}kg · {{ $t('mobileAgent.riceShort') }} {{ item.rice }}kg</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E1F4E4] text-[#326445]">
              {{ $t('mobileAgent.statusVerified') }}
            </span>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- ======================================================== -->
    <!-- 网点与操作员信息抽屉 (我的) -->
    <!-- ======================================================== -->
    <el-drawer
      v-model="showProfileDrawer"
      :title="$t('mobileAgent.profileDrawerTitle')"
      direction="btt"
      size="55%"
      append-to-body
    >
      <div class="space-y-4 p-2 text-xs">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB]">
          <div class="w-10 h-10 rounded-full bg-[#326445] text-white flex items-center justify-center font-bold text-base">
            AG
          </div>
          <div class="flex-1">
            <div class="font-bold text-sm text-[#1F3326]">{{ $t('mobileAgent.profileSiteName') }}</div>
            <div class="text-[#8A9A8F] font-mono">{{ $t('mobileAgent.profileSiteDesc') }}</div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E1F4E4] text-[#326445]">
            {{ $t('mobileAgent.statusOperating') }}
          </span>
        </div>

        <div class="space-y-2">
          <div class="text-[11px] font-bold text-[#8A9A8F]">{{ $t('mobileAgent.sectionBizStats') }}</div>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2.5 rounded-lg bg-white border border-[#D9E5DB]">
              <div class="text-base font-bold text-[#326445] font-mono">1,480 {{ $t('mobileAgent.unitHousehold') }}</div>
              <div class="text-[10px] text-[#58685D]">{{ $t('mobileAgent.totalServiceHouseholds') }}</div>
            </div>
            <div class="p-2.5 rounded-lg bg-white border border-[#D9E5DB]">
              <div class="text-base font-bold text-[#D3AF62] font-mono">92.4%</div>
              <div class="text-[10px] text-[#58685D]">{{ $t('mobileAgent.monthFulfillmentRate') }}</div>
            </div>
          </div>
        </div>

        <div class="pt-2 flex flex-col gap-2">
          <el-button type="primary" class="!bg-[#326445] !border-[#326445]" @click="goToOverview">
            {{ $t('mobileAgent.btnSwitchOverview') }}
          </el-button>
          <el-button @click="showProfileDrawer = false">
            {{ $t('common.cancel') }}
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { isDemoActive, demoSubStep, setDemoStep, activateDemo } from '../../../utils/demoState.js';
import {
  CircleCheck,
  FullScreen,
  Back,
  Document,
  HomeFilled,
  Clock,
  WarningFilled,
  UserFilled,
  Check
} from '@element-plus/icons-vue';
import gsap from 'gsap';
import ModuleDescTip from '../../../components/common/ModuleDescTip.vue';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// 判断是否为独立 App 布局 (如 Portal 打开或带 layout=app)
const isStandaloneLayout = computed(() => {
  return route.query.layout === 'app';
});
import {
  useSmoothNumber,
  useButtonPress,
  useStaggerListEnter
} from '../../../composables/useMobileInteractions.js';
import { onTabMessage } from '../../../utils/crossTabBus.js';

const activeTab = ref('home');

// 弹窗状态
const scanDialogVisible = ref(false);
const showHistoryDrawer = ref(false);
const showProfileDrawer = ref(false);

const emit = defineEmits(['switch-mode']);

let stopTabListener = null;

onMounted(() => {
  stopTabListener = onTabMessage('ORDER_PURCHASED', (newOrder) => {
    // 跨标签页收到公民新下的配给订单，自动追加到今日核销台账列表
    newlyAddedOrders.value.unshift({
      name: newOrder.headName || t('mobileAgent.defaultHeadName'),
      cardNo: newOrder.cardNo || 'RC-10029381',
      time: new Date().toTimeString().slice(0, 5),
      flour: 10,
      rice: 5
    });

    // 触发核心数值平滑补间动画
    countDispatched.animateTo(129);
    countRemaining.animateTo(341);

    ElMessage.success(`${t('mobileAgent.toastOrderReceived')} [#${newOrder.id}]，${newOrder.headName} ${t('mobileAgent.toastCitizenClaimed')}`);
  });

  // 演示模式：URL 携带 demo 参数时激活 06 阶段引导（不自动弹扫码窗，由引导提示用户点击）
  if (route.query.demo === 'true') {
    activateDemo(String(route.query.demoStep || 'step6_1'));
  } else if (route.query.action === 'scan' || route.query.tab === 'verify') {
    // 若路由指定进入扫码核销，自动弹出扫码取景框
    handleTriggerScan();
  }
});

// 演示模式：组件已挂载时 URL 变更携带新演示步骤，同步引导子步骤
watch(() => route.query, (q) => {
  if (q.demo === 'true' && isDemoActive.value) {
    const step = String(q.demoStep || 'step6_1');
    if (step && step !== demoSubStep.value) setDemoStep(step);
  }
});

onUnmounted(() => {
  if (stopTabListener) stopTabListener();
});

// DOM 引用
const scanCtaBtnRef = ref(null);
const contentContainerRef = ref(null);
const materialsListRef = ref(null);
const bottomNavRef = ref(null);

// ====================================================================
// 1. 核心数字平滑补间动画 (支持千分位格式化)
// 对标参考图数值：今日发放 128、剩余户数 342、待办预警 2
// ====================================================================
const countDispatched = useSmoothNumber(128, { duration: 1.2, delay: 0.1 });
const countRemaining = useSmoothNumber(342, { duration: 1.4, delay: 0.2 });
const countAlerts = useSmoothNumber(2, { duration: 0.8, delay: 0.3 });

// ====================================================================
// 2. 扫码主按钮轻触按压微缩放动效 (Active scale: 0.965，释放弹性恢复)
// ====================================================================
const { triggerPressEffect } = useButtonPress(scanCtaBtnRef, {
  pressScale: 0.965,
  ease: 'back.out(2)'
});

// ====================================================================
// 3. 列表卡片交错淡入动效 (Stagger Slide Up)
// ====================================================================
useStaggerListEnter(contentContainerRef, '.rcm-stagger-item', {
  stagger: 0.08,
  duration: 0.5,
  y: 18
});

// 动态发放记录字典 (随全局国际化语言切换)
const newlyAddedOrders = ref([]);

const distributionRecordsMap = {
  zh: [
    { name: '穆斯塔法·哈桑', cardNo: 'RC-9081', time: '10:42', flour: 10, rice: 5 },
    { name: '法蒂玛·阿里', cardNo: 'RC-9079', time: '10:35', flour: 15, rice: 8 },
    { name: '艾哈迈德·萨利赫', cardNo: 'RC-9076', time: '10:28', flour: 20, rice: 10 },
    { name: '奥马尔·哈立德', cardNo: 'RC-9071', time: '10:15', flour: 10, rice: 5 },
    { name: '宰纳卜·卡西姆', cardNo: 'RC-9065', time: '09:58', flour: 25, rice: 12 },
  ],
  en: [
    { name: 'Mustafa Hassan', cardNo: 'RC-9081', time: '10:42', flour: 10, rice: 5 },
    { name: 'Fatima Ali', cardNo: 'RC-9079', time: '10:35', flour: 15, rice: 8 },
    { name: 'Ahmed Saleh', cardNo: 'RC-9076', time: '10:28', flour: 20, rice: 10 },
    { name: 'Omar Khalid', cardNo: 'RC-9071', time: '10:15', flour: 10, rice: 5 },
    { name: 'Zainab Qasim', cardNo: 'RC-9065', time: '09:58', flour: 25, rice: 12 },
  ],
  ar: [
    { name: 'مصطفى حسن', cardNo: 'RC-9081', time: '10:42', flour: 10, rice: 5 },
    { name: 'فاطمة علي', cardNo: 'RC-9079', time: '10:35', flour: 15, rice: 8 },
    { name: 'أحمد صالح', cardNo: 'RC-9076', time: '10:28', flour: 20, rice: 10 },
    { name: 'عمر خالد', cardNo: 'RC-9071', time: '10:15', flour: 10, rice: 5 },
    { name: 'زينب قاسم', cardNo: 'RC-9065', time: '09:58', flour: 25, rice: 12 },
  ],
  ku: [
    { name: 'مستەفا حەسەن', cardNo: 'RC-9081', time: '10:42', flour: 10, rice: 5 },
    { name: 'فاتیمە عەلی', cardNo: 'RC-9079', time: '10:35', flour: 15, rice: 8 },
    { name: 'ئەحمەد ساڵح', cardNo: 'RC-9076', time: '10:28', flour: 20, rice: 10 },
    { name: 'عومەر خالید', cardNo: 'RC-9071', time: '10:15', flour: 10, rice: 5 },
    { name: 'زەینەب قاسم', cardNo: 'RC-9065', time: '09:58', flour: 25, rice: 12 },
  ]
};

const distributionRecords = computed(() => {
  const baseList = distributionRecordsMap[locale.value] || distributionRecordsMap.zh;
  return [...newlyAddedOrders.value, ...baseList];
});

function handleTriggerScan() {
  triggerPressEffect();
  scanDialogVisible.value = true;
  // 演示模式 06-1：点击「扫码核销」弹出扫描窗口后，推进至 06-2
  if (isDemoActive.value && demoSubStep.value === 'step6_1') setDemoStep('step6_2');
}

function handleConfirmSimulatedScan() {
  scanDialogVisible.value = false;
  ElMessage.success(t('mobileAgent.toastVerifySuccess'));
  // 演示模式 06-2：扫描公民二维码确认收货完成后，进入全流程演示完成提示
  if (isDemoActive.value && demoSubStep.value === 'step6_2') setDemoStep('step6_done');
  // 动效增加发放数
  countDispatched.animateTo(129);
  countRemaining.animateTo(341);
}

function goToOverview() {
  showProfileDrawer.value = false;
  emit('switch-mode', 'overview');
  ElMessage.success(t('mobileAgent.toastSwitchOverview'));
}

function selectTab(tabKey) {
  activeTab.value = tabKey;
  // 点击 TabBar 微弹跳动效
  if (bottomNavRef.value) {
    gsap.fromTo(
      bottomNavRef.value,
      { y: 2 },
      { y: 0, duration: 0.2, ease: 'power1.out' }
    );
  }
  if (tabKey === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tabKey === 'scan') {
    handleTriggerScan();
  } else if (tabKey === 'records') {
    showHistoryDrawer.value = true;
  } else if (tabKey === 'exceptions') {
    if (materialsListRef.value) {
      materialsListRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else if (tabKey === 'profile') {
    showProfileDrawer.value = true;
  }
}

// 库存台账快速稽查定位
function openInventoryAudit() {
  if (materialsListRef.value) {
    materialsListRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  ElMessage.info(t('mobileAgent.toastAuditLocated'));
}
</script>

<style scoped>
@keyframes scanBeam {
  0% {
    top: 5%;
    opacity: 0.2;
  }
  50% {
    top: 90%;
    opacity: 1;
  }
  100% {
    top: 5%;
    opacity: 0.2;
  }
}

.animate-scanBeam {
  animation: scanBeam 2.2s infinite ease-in-out;
}

/* 扫码弹窗深度约束：严禁超出 412px 视口 */
:deep(.mobile-scan-dialog.el-dialog) {
  width: 350px !important;
  max-width: calc(100vw - 28px) !important;
  border-radius: 20px !important;
  margin: 0 auto !important;
  overflow: hidden;
}

:deep(.mobile-scan-dialog .el-dialog__header) {
  padding: 14px 18px 8px !important;
  margin-right: 0 !important;
}

:deep(.mobile-scan-dialog .el-dialog__title) {
  font-size: 13px !important;
  font-weight: 800 !important;
  color: #326445 !important;
}

:deep(.mobile-scan-dialog .el-dialog__body) {
  padding: 8px 16px 18px !important;
}

/* 抽屉深度约束：居中贴合在 412px 手机视口内部 */
:deep(.el-drawer.btt) {
  max-width: 412px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  border-top-left-radius: 22px !important;
  border-top-right-radius: 22px !important;
}
</style>
