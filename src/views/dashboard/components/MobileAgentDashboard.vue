<template>
  <div
    class="mobile-agent-dashboard w-full bg-[#F7F6F1] flex flex-col font-sans pb-4 text-slate-800 transition-all duration-300"
    :class="[
      isStandaloneLayout
        ? 'min-h-full'
        : 'sm:max-w-[412px] sm:h-[924px] sm:max-h-[924px] sm:mx-auto sm:rounded-3xl sm:shadow-2xl sm:border sm:border-[#ECE7DE] sm:overflow-y-auto sm:relative'
    ]"
  >
    <!-- ======================================================== -->
    <!-- 1. Hero Banner 头部：沉浸式石拱门建筑纹理背景 + 业务大标题 (100% 满宽流式适配) -->
    <!-- ======================================================== -->
    <div class="relative w-full h-44 sm:h-52 overflow-hidden select-none shrink-0 border-b border-[#ECE7DE]">
      <!-- 背景图图层：真实截图处理后的无字背景大图 -->
      <img
        src="/images/dashboard-banner.png"
        alt="National Food Support Platform Background"
        class="absolute inset-0 w-full h-full object-cover object-left sm:object-center select-none pointer-events-none"
        loading="eager"
      />

      <!-- 柔和微弱渐变保护层：确保在移动端窄屏下文字对比度与清晰度 -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#F7F6F1]/90 via-[#FAF8F5]/30 to-black/5 pointer-events-none"></div>

      <!-- 头部文字排版：位于图片图层上方 (relative z-10)，不要直接加在图片里面 -->
      <div class="relative z-10 h-full p-4 flex flex-col justify-between items-end text-right">
        <!-- 右上角小副标签与安全盾牌小图标 -->
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E5DAC8] shadow-xs">
          <span class="text-[11px] font-bold text-[#966C2E] font-sans">
            خدمات الدعم الغذائي
          </span>
          <span class="text-xs text-[#966C2E] font-medium font-sans">· 保供服务</span>
          <el-icon :size="13" class="text-[#966C2E]"><CircleCheck /></el-icon>
        </div>

        <!-- 主标题：今日配给发放 (توزيع اليوم) -->
        <div class="pb-1">
          <h1 class="text-2xl sm:text-3xl font-black text-[#1E3F35] tracking-tight flex items-center justify-end gap-2">
            <span class="text-xs sm:text-sm font-semibold text-[#5E6862]">今日发放 /</span>
            <span>توزيع اليوم</span>
          </h1>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 核心业务卡片流 (标准移动端内边距: px-4, 卡片间距: space-y-3) -->
    <!-- ======================================================== -->
    <div class="flex-1 px-4 space-y-3 pt-2" ref="contentContainerRef">
      
      <!-- ======================================================== -->
      <!-- 2. 汇总状态卡片 (淡灰绿微底 #EBF3EE, 浅绿细描边 #D6E6DC) -->
      <!-- ======================================================== -->
      <div class="rcm-summary-card rcm-stagger-item space-y-3">
        <!-- 卡片右上角网点标识与浮层规则说明 -->
        <div class="flex items-center justify-between text-xs">
          <ModuleDescTip
            title="网点今日执行概览"
            desc="现场配给代理网点今日核销配发、待领户数与异常告警总揽。"
            badge="网点监控"
            badge-type="success"
          />
          
          <div class="flex items-center gap-1 text-[#275A3E] font-medium font-sans">
            <span class="font-mono text-xs font-bold text-[#1E3F35]">AG-0217#</span>
            <span>·</span>
            <span>وكيل النور (努尔网点)</span>
          </div>
        </div>

        <!-- 3 列核心统计数字 (从右往左按参考图排布：今日发放 128 | 剩余户数 342 | 待办预警 2) -->
        <div class="grid grid-cols-3 gap-2 text-center pt-1">
          <!-- 列 1: 今日发放 (توزيع اليوم) -->
          <div class="space-y-1">
            <div class="text-2xl sm:text-3xl font-black font-mono text-[#1E3F35] tracking-tight">
              {{ countDispatched.displayValue.value }}
            </div>
            <div class="text-[11px] font-bold text-[#5E6862] leading-tight">
              <div>توزيع اليوم</div>
              <div class="text-[10px] font-normal text-[#8C958F]">今日发放</div>
            </div>
          </div>

          <!-- 列 2: 剩余户数 (أسر متبقية) -->
          <div class="space-y-1 border-x border-[#D6E6DC]/80">
            <div class="text-2xl sm:text-3xl font-black font-mono text-[#1E3F35] tracking-tight">
              {{ countRemaining.displayValue.value }}
            </div>
            <div class="text-[11px] font-bold text-[#5E6862] leading-tight">
              <div>أسر متبقية</div>
              <div class="text-[10px] font-normal text-[#8C958F]">剩余户数</div>
            </div>
          </div>

          <!-- 列 3: 待办预警 (تنبيهات) -->
          <div class="space-y-1">
            <div class="text-2xl sm:text-3xl font-black font-mono text-[#D04343] tracking-tight">
              {{ countAlerts.displayValue.value }}
            </div>
            <div class="text-[11px] font-bold text-[#5E6862] leading-tight">
              <div>تنبيهات</div>
              <div class="text-[10px] font-normal text-[#8C958F]">待办预警</div>
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
            <span class="tracking-wide">مسح وتحقق (扫码核销)</span>
          </div>
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- 4. 跳转操作栏：历史分发记录 (带利落方向箭头) -->
      <!-- ======================================================== -->
      <div
        class="rcm-list-card rcm-stagger-item flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-[#FAF8F4] active:scale-[0.99] transition-all"
        @click="showHistoryDrawer = true"
      >
        <!-- 左侧指示箭头 -->
        <div class="w-7 h-7 rounded-full bg-[#F4F1EA] flex items-center justify-center text-[#1E3F35]">
          <el-icon :size="14"><Back /></el-icon>
        </div>

        <!-- 右侧操作栏名称 -->
        <div class="flex items-center gap-2 text-right">
          <span class="text-xs text-[#8C958F] font-normal font-sans">/ 历史分发台账</span>
          <span class="text-sm font-bold text-[#18231E]">سجل التوزيع</span>
          <el-icon class="text-[#D3A757]"><Document /></el-icon>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 5. 周期台账核验卡片 (سجل المخزون للدورة) -->
      <!-- ======================================================== -->
      <div class="rcm-list-card rcm-stagger-item space-y-3.5">
        <!-- 头部标题区：左侧辅助公式说明，右侧主标题 -->
        <div class="flex items-center justify-between border-b border-[#F4EFE6] pb-2.5">
          <!-- 左侧公式说明：افتتاحي+وارد-موزّع=متوقع (期初+调入-已发=理论应存) -->
          <div class="flex items-center gap-1">
            <ModuleDescTip
              title="台账平衡稽查公式"
              desc="理论应存 = 期初在库 + 调拨入库 - 累计已发放。实盘与理论不一致即触发损益差异预警。"
              badge="平衡公式"
              badge-type="warning"
            />
            <span class="text-[10px] font-mono text-[#8C958F]">
              افتتاحي+وارد-موزّع=متوقع
            </span>
          </div>

          <!-- 右侧标题 -->
          <div class="flex items-center gap-1.5 text-right">
            <span class="text-[11px] text-[#8C958F]">本期库存台账 /</span>
            <h3 class="text-sm font-bold text-[#18231E]">سجل المخزون للدورة</h3>
          </div>
        </div>

        <!-- 物料明细子卡片列表 -->
        <div class="space-y-3" ref="materialsListRef">
          
          <!-- 物料 1: 面粉 (طحين) - 状态胶囊：● مطابق (平账) -->
          <div class="p-3 rounded-xl border border-[#ECE7DE] bg-[#FCFBF8] space-y-2 hover:border-[#D4AA6A]/60 transition-colors">
            <div class="flex items-center justify-between">
              <!-- 状态胶囊：平账 (مطابق) -->
              <span class="rcm-pill-badge rcm-pill-success">
                <span class="rcm-badge-dot"></span>
                <span>مطابق · 账实相符</span>
              </span>

              <!-- 品类名称 -->
              <span class="font-bold text-sm text-[#18231E] flex items-center gap-1">
                <span>طحين</span>
                <span class="text-xs font-normal text-[#8C958F]">(面粉)</span>
              </span>
            </div>

            <!-- 4 列对账参数 (调拨 / 已发 / 理论 / 实盘) -->
            <div class="grid grid-cols-4 gap-1 text-center pt-1 font-mono">
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">2,000</div>
                <div class="text-[9px] text-[#8C958F] font-sans">调拨 (وارد)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">1,240</div>
                <div class="text-[9px] text-[#8C958F] font-sans">已发 (موزّع)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">760</div>
                <div class="text-[9px] text-[#8C958F] font-sans">理论 (متوقع)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1E3F35]">760</div>
                <div class="text-[9px] text-[#275A3E] font-bold font-sans">实盘 (فعلي)</div>
              </div>
            </div>
          </div>

          <!-- 物料 2: 大米 (أرز) - 状态胶囊：● فرق 20 كغ- (差异 -20kg) -->
          <div class="p-3 rounded-xl border border-[#FAD8D8] bg-[#FFFBFB] space-y-2 hover:border-[#D04343]/60 transition-colors">
            <div class="flex items-center justify-between">
              <!-- 状态胶囊：损益差异 (فرق 20 كغ-) -->
              <span class="rcm-pill-badge rcm-pill-danger">
                <span class="rcm-badge-dot"></span>
                <span>فرق 20 كغ- · 亏损20KG</span>
              </span>

              <!-- 品类名称 -->
              <span class="font-bold text-sm text-[#18231E] flex items-center gap-1">
                <span>أرز</span>
                <span class="text-xs font-normal text-[#8C958F]">(大米)</span>
              </span>
            </div>

            <!-- 4 列对账参数 -->
            <div class="grid grid-cols-4 gap-1 text-center pt-1 font-mono">
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">900</div>
                <div class="text-[9px] text-[#8C958F] font-sans">调拨 (وارد)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">720</div>
                <div class="text-[9px] text-[#8C958F] font-sans">已发 (موزّع)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#8C958F]">180</div>
                <div class="text-[9px] text-[#8C958F] font-sans">理论 (متوقع)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#D04343]">160</div>
                <div class="text-[9px] text-[#D04343] font-bold font-sans">实盘 (فعلي)</div>
              </div>
            </div>
          </div>

          <!-- 物料 3: 食用油 (زيت طعام) -->
          <div class="p-3 rounded-xl border border-[#ECE7DE] bg-[#FCFBF8] space-y-2 hover:border-[#D4AA6A]/60 transition-colors">
            <div class="flex items-center justify-between">
              <span class="rcm-pill-badge rcm-pill-success">
                <span class="rcm-badge-dot"></span>
                <span>مطابق · 账实相符</span>
              </span>

              <span class="font-bold text-sm text-[#18231E] flex items-center gap-1">
                <span>زيت طعام</span>
                <span class="text-xs font-normal text-[#8C958F]">(食用油)</span>
              </span>
            </div>

            <div class="grid grid-cols-4 gap-1 text-center pt-1 font-mono">
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">800</div>
                <div class="text-[9px] text-[#8C958F] font-sans">调拨 (وارد)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">490</div>
                <div class="text-[9px] text-[#8C958F] font-sans">已发 (موزّع)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#18231E]">310</div>
                <div class="text-[9px] text-[#8C958F] font-sans">理论 (متوقع)</div>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#1E3F35]">310</div>
                <div class="text-[9px] text-[#275A3E] font-bold font-sans">实盘 (فعلي)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 6. 核心保供服务直通车 (和公民APP 1:1 规范对标的功能模块条) -->
      <!-- ======================================================== -->
      <div class="rcm-list-card rcm-stagger-item space-y-3 p-4 bg-white rounded-2xl border border-[#ECE7DE] shadow-xs">
        <div class="flex items-center justify-between pb-2.5 border-b border-[#F4EFE6]">
          <span class="text-xs font-bold text-[#1E3F35] flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 bg-[#C59D5F] rounded-full"></span>
            <span>{{ $t('dashboard.quickServices.title') || '代理保供核心服务直通车' }}</span>
          </span>
          <span class="text-[11px] text-[#8C958F] font-medium">{{ $t('dashboard.quickServices.subtitle') || '网点现场协同' }}</span>
        </div>

        <div class="grid grid-cols-5 gap-1.5 text-center select-none">
          <!-- 1. 现场智能核销 (扫码弹窗) -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            @click="handleTriggerScan"
          >
            <div class="w-11 h-11 rounded-2xl bg-[#EAF5EF] text-[#1E3F35] flex items-center justify-center text-lg border border-[#D1E7DA] shadow-xs">
              <el-icon><FullScreen /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-slate-700 leading-tight">{{ $t('dashboard.quickServices.scanVerify') || '现场智能核销' }}</span>
          </div>

          <!-- 2. 物资配给履约 (跳转配给配送) -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            @click="navigateToModule('/warehouse')"
          >
            <div class="w-11 h-11 rounded-2xl bg-[#F4EFFB] text-[#7C3AED] flex items-center justify-center text-lg border border-[#E4D8F7] shadow-xs">
              <el-icon><Van /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-slate-700 leading-tight">{{ $t('dashboard.quickServices.rationDelivery') || '物资配给履约' }}</span>
          </div>

          <!-- 3. 签约网点档案 (跳转代理档案) -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            @click="navigateToModule('/agent')"
          >
            <div class="w-11 h-11 rounded-2xl bg-[#FAF3E6] text-[#C59D5F] flex items-center justify-center text-lg border border-[#F2E3C6] shadow-xs">
              <el-icon><Shop /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-slate-700 leading-tight">{{ $t('dashboard.quickServices.agentProfile') || '签约网点档案' }}</span>
          </div>

          <!-- 4. 核销分发流水 (历史流水抽屉) -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            @click="showHistoryDrawer = true"
          >
            <div class="w-11 h-11 rounded-2xl bg-[#F0F2FA] text-[#4F46E5] flex items-center justify-center text-lg border border-[#D9DCF2] shadow-xs">
              <el-icon><Document /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-slate-700 leading-tight">{{ $t('dashboard.quickServices.ledgerRecords') || '核销分发流水' }}</span>
          </div>

          <!-- 5. 库存台账稽查 (平衡公式与实体验证) -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            @click="openInventoryAudit"
          >
            <div class="w-11 h-11 rounded-2xl bg-[#FEECEC] text-[#D34545] flex items-center justify-center text-lg border border-[#FCD5D5] shadow-xs">
              <el-icon><Check /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-slate-700 leading-tight">{{ $t('dashboard.quickServices.auditBalance') || '库存台账稽查' }}</span>
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
      title="现场智能扫码核验 (Scan & Verify)"
      width="350px"
      align-center
      append-to-body
      class="mobile-scan-dialog"
    >
      <div class="space-y-3.5 text-center">
        <!-- 扫码取景框模拟 -->
        <div class="relative w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-2xl bg-black/95 overflow-hidden border-2 border-[#D3A757] shadow-inner flex items-center justify-center">
          <!-- 激光扫描线 -->
          <div class="absolute w-full h-1 bg-gradient-to-r from-transparent via-[#D3A757] to-transparent shadow-[0_0_12px_#D3A757] animate-scanBeam"></div>
          
          <!-- 取景角标 -->
          <div class="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D3A757]"></div>
          <div class="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D3A757]"></div>
          <div class="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D3A757]"></div>
          <div class="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D3A757]"></div>

          <div class="text-white/70 text-xs font-mono space-y-1">
            <el-icon :size="28" class="text-[#D3A757] animate-pulse"><FullScreen /></el-icon>
            <div class="text-[11px]">对准公民卡二维码 / 智能识别</div>
          </div>
        </div>

        <div class="text-[11px] text-slate-500">
          支持配给电子卡、纸质条码及国家统一身份凭证。
        </div>

        <div class="pt-1 flex items-center justify-center gap-2">
          <el-button size="small" @click="scanDialogVisible = false">取消</el-button>
          <el-button size="small" type="primary" color="#1E3F35" class="font-bold" @click="handleConfirmSimulatedScan">
            模拟识别成功 (#RC-9082)
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 分发流水抽屉 (历史分发记录) -->
    <!-- ======================================================== -->
    <el-drawer
      v-model="showHistoryDrawer"
      title="今日现场分发台账 (سجل التوزيع)"
      direction="btt"
      size="65%"
      append-to-body
    >
      <div class="space-y-3 p-1">
        <div class="text-xs text-[#5E6862] flex justify-between items-center pb-2 border-b">
          <span>努尔网点 (AG-0217#) 今日实时核销流水</span>
          <span class="font-bold text-[#1E3F35]">已成功发放 128 户</span>
        </div>

        <div class="space-y-2 max-h-[360px] overflow-y-auto">
          <div
            v-for="(item, idx) in distributionRecords"
            :key="idx"
            class="p-2.5 rounded-lg border border-[#ECE7DE] bg-white flex items-center justify-between text-xs"
          >
            <div>
              <div class="font-bold text-[#18231E]">{{ item.name }} (卡号: {{ item.cardNo }})</div>
              <div class="text-[11px] text-[#8C958F]">{{ item.time }} · 面粉 {{ item.flour }}kg · 大米 {{ item.rice }}kg</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4F2E9] text-[#275A3E]">
              已核销
            </span>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- ======================================================== -->
    <!-- 网点与操作员信息抽屉 (حسابي 我的) -->
    <!-- ======================================================== -->
    <el-drawer
      v-model="showProfileDrawer"
      title="网点工作台设置 (حسابي)"
      direction="btt"
      size="55%"
      append-to-body
    >
      <div class="space-y-4 p-2 text-xs">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F4] border border-[#ECE7DE]">
          <div class="w-10 h-10 rounded-full bg-[#1E3F35] text-white flex items-center justify-center font-bold text-base">
            AG
          </div>
          <div class="flex-1">
            <div class="font-bold text-sm text-[#18231E]">巴格达第4区努尔配给网点</div>
            <div class="text-[#8C958F] font-mono">网点编码: AG-0217# · 主管负责人: 阿卜杜勒</div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4F2E9] text-[#275A3E]">
            营业中
          </span>
        </div>

        <div class="space-y-2">
          <div class="text-[11px] font-bold text-[#8C958F]">业务统计</div>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2.5 rounded-lg bg-white border border-[#ECE7DE]">
              <div class="text-base font-bold text-[#1E3F35] font-mono">1,480 户</div>
              <div class="text-[10px] text-[#5E6862]">服务辖区总户数</div>
            </div>
            <div class="p-2.5 rounded-lg bg-white border border-[#ECE7DE]">
              <div class="text-base font-bold text-[#D3A757] font-mono">92.4%</div>
              <div class="text-[10px] text-[#5E6862]">本月物资履约率</div>
            </div>
          </div>
        </div>

        <div class="pt-2 flex flex-col gap-2">
          <el-button type="primary" class="!bg-[#1E3F35] !border-[#1E3F35]" @click="goToOverview">
            切换至国家战略大盘 (政务全景)
          </el-button>
          <el-button @click="showProfileDrawer = false">
            关闭
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  CircleCheck,
  FullScreen,
  Back,
  Document,
  HomeFilled,
  Clock,
  WarningFilled,
  UserFilled,
  Van,
  Shop,
  Check
} from '@element-plus/icons-vue';
import gsap from 'gsap';
import ModuleDescTip from '../../../components/common/ModuleDescTip.vue';

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
    distributionRecords.value.unshift({
      name: newOrder.headName || '公民户主',
      cardNo: newOrder.cardNo || 'RC-10029381',
      time: new Date().toTimeString().slice(0, 5),
      flour: 10,
      rice: 5
    });

    // 触发核心数值平滑补间动画
    countDispatched.animateTo(129);
    countRemaining.animateTo(341);

    ElMessage.success(`【跨标签页联动】网点收到新订单 [#${newOrder.id}]，公民【${newOrder.headName}】已线上申领！`);
  });
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

// 模拟发放记录
const distributionRecords = ref([
  { name: '穆斯塔法·哈桑', cardNo: 'RC-9081', time: '10:42', flour: 10, rice: 5 },
  { name: '法蒂玛·阿里', cardNo: 'RC-9079', time: '10:35', flour: 15, rice: 8 },
  { name: '艾哈迈德·萨利赫', cardNo: 'RC-9076', time: '10:28', flour: 20, rice: 10 },
  { name: '奥马尔·哈立德', cardNo: 'RC-9071', time: '10:15', flour: 10, rice: 5 },
  { name: '宰纳卜·卡西姆', cardNo: 'RC-9065', time: '09:58', flour: 25, rice: 12 },
]);

function handleTriggerScan() {
  triggerPressEffect();
  scanDialogVisible.value = true;
}

function handleConfirmSimulatedScan() {
  scanDialogVisible.value = false;
  ElMessage.success('公民电子卡 [#RC-9082] 验证通过！本月配给物资已成功核销出库。');
  // 动效增加发放数
  countDispatched.animateTo(129);
  countRemaining.animateTo(341);
}

function goToOverview() {
  showProfileDrawer.value = false;
  emit('switch-mode', 'overview');
  ElMessage.success('已切换至国家配给战略全景大盘');
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
    ElMessage.warning('已定位到库存核验差异物料：大米实盘与理论差异 -60kg');
  } else if (tabKey === 'profile') {
    showProfileDrawer.value = true;
  }
}

// 代理快捷功能直达跳转 (保持 Pixel 9 移动端视口一致性)
function navigateToModule(path) {
  if (isStandaloneLayout.value) {
    router.push({ path, query: { ...route.query, layout: 'app', role: 'agent' } });
  } else {
    router.push({ path, query: { role: 'agent' } });
  }
}

// 库存台账快速稽查定位
function openInventoryAudit() {
  if (materialsListRef.value) {
    materialsListRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  ElMessage.info('已定位至【本期库存台账】稽查专区，理论应存与实盘已对账。');
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
  color: #1E3F35 !important;
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
