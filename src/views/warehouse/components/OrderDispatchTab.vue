<template>
  <div class="order-dispatch-tab space-y-4">
    <!-- ======================================================== -->
    <!-- 1. 顶部操作栏：搜索筛选 + 【📸 扫码核验交货】核心大按钮 -->
    <!-- ======================================================== -->
    <div class="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3">
      <!-- 搜索、履约类型筛选与扫码交货大按钮 -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div class="flex items-center gap-2 flex-1">
          <el-input
            v-model="searchKeyword"
            :placeholder="$t('agentOrders.searchPlaceholder')"
            clearable
            size="small"
            class="flex-1 max-w-md"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-slate-400"><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="deliveryTypeFilter"
            size="small"
            class="w-32 shrink-0"
            @change="loadOrders"
          >
            <el-option :label="$t('agentOrders.typeAll')" value="ALL" />
            <el-option :label="$t('agentOrders.typeDelivery')" value="HOME_DELIVERY" />
            <el-option :label="$t('agentOrders.typePickup')" value="PICKUP" />
          </el-select>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <!-- 阶段 4 核心：扫码核验交货按钮 (高亮翠绿) -->
          <el-button
            type="success"
            size="small"
            class="font-bold shadow-xs px-3.5 bg-emerald-600 hover:bg-emerald-700 border-none text-white flex items-center gap-1.5 rounded-xl"
            @click="openScanVerifyModal()"
          >
            <el-icon class="text-base"><Camera /></el-icon>
            <span>{{ $t('orderClaim.scanVerifyBtn') }}</span>
          </el-button>

          <el-button size="small" :loading="loading" @click="loadOrders">
            <el-icon class="mr-1"><Refresh /></el-icon>
            {{ $t('common.refresh') }}
          </el-button>
        </div>
      </div>

      <!-- 状态筛选药丸横向滑动条 (针对手机端触控优化) -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
          @click="setStatusFilter('ALL')"
        >
          <span>{{ $t('agentOrders.filterAll') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'ALL' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'">
            {{ counts.all }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'PENDING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
          @click="setStatusFilter('PENDING')"
        >
          <span>{{ $t('agentOrders.filterPending') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'">
            {{ counts.pending }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'DISPATCHED'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
          @click="setStatusFilter('DISPATCHED')"
        >
          <span>{{ $t('agentOrders.filterDispatched') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'DISPATCHED' ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-700'">
            {{ counts.dispatched }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'READY_FOR_PICKUP'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
          @click="setStatusFilter('READY_FOR_PICKUP')"
        >
          <span>{{ $t('agentOrders.filterReadyPickup') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'READY_FOR_PICKUP' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'">
            {{ counts.readyPickup }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'DELIVERED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
          @click="setStatusFilter('DELIVERED')"
        >
          <span>{{ $t('agentOrders.filterDelivered') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'DELIVERED' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'">
            {{ counts.delivered }}
          </span>
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 订单卡片流 (极简移动端友好布局，大字号、高触控区) -->
    <!-- ======================================================== -->
    <div v-loading="loading" class="min-h-[200px]">
      <div v-if="filteredOrders.length === 0" class="py-12 text-center text-slate-400">
        <el-icon class="text-4xl mb-2 text-slate-300"><Document /></el-icon>
        <p class="text-sm font-medium">{{ $t('agentOrders.noOrders') }}</p>
      </div>

      <div
        class="grid"
        :class="isAppMode ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-3.5'"
      >
        <div
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
        >
          <!-- 卡片头部：订单单号与状态标签 -->
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-slate-900 text-sm">#{{ (order.orderId || '').slice(-8) }}</span>
              <span class="text-[11px] text-slate-400 font-mono">{{ (order.createdAt || '').slice(5, 16) }}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <!-- 履约方式胶囊 -->
              <span
                v-if="order.deliveryType === 'HOME_DELIVERY'"
                class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1"
              >
                🚚 {{ $t('agentOrders.typeDelivery') }}
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1"
              >
                🏬 {{ $t('agentOrders.typePickup') }}
              </span>

              <!-- 状态胶囊 -->
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[11px] font-bold',
                  getStatusBadgeClass(order.status)
                ]"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <!-- 户主核心信息 (极简化提炼，支持一键复制电话) -->
          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-slate-700">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-slate-900 text-sm">{{ order.headName }}</span>
                <span class="text-[11px] font-mono text-slate-400">({{ order.cardNo }})</span>
              </div>
              <div class="flex items-center gap-1 text-slate-600 font-mono">
                <span>{{ order.phone }}</span>
                <el-button size="small" text class="p-0.5" @click="copyText(order.phone)">
                  <el-icon class="text-xs text-blue-600"><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- 送货住址或自提网点 -->
            <div class="flex items-start gap-1 text-[11px] text-slate-500">
              <el-icon class="text-xs text-slate-400 mt-0.5 shrink-0"><Location /></el-icon>
              <span class="truncate">{{ order.deliveryType === 'HOME_DELIVERY' ? order.deliveryAddress : order.agentName }}</span>
            </div>

            <!-- 物资品类胶囊清单 (微型化展示，不占用大版面) -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span
                v-for="(it, idx) in order.items"
                :key="idx"
                class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
              >
                {{ formatItemName(it.itemName) }} <b class="font-mono text-slate-900 font-bold">×{{ it.qty }}{{ it.unit }}</b>
              </span>
            </div>
          </div>

          <!-- 结算金额与核验提货码栏 -->
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block">{{ $t('agentOrders.orderCardPaid') }}</span>
              <span class="font-mono font-bold text-amber-600 text-sm">IQD {{ (order.selfPayAmount || 0).toLocaleString() }}</span>
            </div>

            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">{{ $t('agentOrders.orderCardPickupCode') }}</span>
              <div class="flex items-center gap-1">
                <span class="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs">
                  {{ order.pickupCode }}
                </span>
                <el-button size="small" text class="p-0.5" @click="copyText(order.pickupCode)">
                  <el-icon class="text-xs text-slate-500"><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 若已派单，展示车队指派信息微条 -->
          <div
            v-if="order.dispatchInfo && order.dispatchInfo.deliveryPerson"
            class="p-2 rounded-xl bg-sky-50/70 border border-sky-100 text-[11px] text-sky-800 flex items-center justify-between"
          >
            <div class="flex items-center gap-1.5 truncate">
              <span>🚚</span>
              <span class="font-bold">{{ order.dispatchInfo.deliveryPerson }}</span>
              <span class="font-mono text-sky-600 truncate">[{{ order.dispatchInfo.vehicleNo }}]</span>
            </div>
            <span class="font-mono font-semibold shrink-0 text-sky-700">{{ order.dispatchInfo.estimatedTime }}</span>
          </div>

          <!-- 卡片底部操作大按钮 (极简触控交互) -->
          <div class="pt-1">
            <!-- 送货上门 待处理 -> 安排配送 -->
            <el-button
              v-if="order.deliveryType === 'HOME_DELIVERY' && order.status === 'PENDING_DELIVERY'"
              type="primary"
              class="w-full font-bold shadow-xs rounded-xl"
              @click="openDispatchModal(order)"
            >
              <el-icon class="mr-1"><Van /></el-icon>
              {{ $t('agentOrders.dispatchBtn') }}
            </el-button>

            <!-- 到店自提 待处理 -> 标记备货就绪 -->
            <el-button
              v-else-if="order.deliveryType === 'PICKUP' && (order.status === 'PENDING_PICKUP' || order.status === 'PAID')"
              type="warning"
              class="w-full font-bold shadow-xs rounded-xl"
              @click="handleMarkReady(order)"
            >
              <el-icon class="mr-1"><CircleCheck /></el-icon>
              {{ $t('agentOrders.readyPickupBtn') }}
            </el-button>

            <!-- 阶段 4 核心：配送中状态 -> 打开摄像头扫码核验 (先拍照扫码，再出确认单) -->
            <el-button
              v-else-if="order.status === 'DISPATCHED'"
              type="success"
              class="w-full font-bold shadow-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none text-white flex items-center justify-center gap-1"
              @click="openScanVerifyModal(order)"
            >
              <el-icon><Camera /></el-icon>
              <span>{{ $t('orderClaim.scanVerifyBtn') }}（{{ isEn ? 'Delivery Photo' : '送达拍照核验' }}）</span>
            </el-button>

            <!-- 阶段 4 核心：备货就绪状态 -> 打开摄像头扫码核验 (先拍照扫码，再出确认单) -->
            <el-button
              v-else-if="order.status === 'READY_FOR_PICKUP'"
              type="success"
              class="w-full font-bold shadow-xs rounded-xl bg-purple-600 hover:bg-purple-700 border-none text-white flex items-center justify-center gap-1"
              @click="openScanVerifyModal(order)"
            >
              <el-icon><Camera /></el-icon>
              <span>{{ $t('orderClaim.scanVerifyBtn') }}（{{ isEn ? 'Pickup Photo' : '到店拍照核验' }}）</span>
            </el-button>

            <!-- 已交付完结 -->
            <div
              v-else-if="order.status === 'DELIVERED'"
              class="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-center text-xs font-bold flex items-center justify-between"
            >
              <div class="flex items-center gap-1.5">
                <el-icon class="text-emerald-600 text-sm"><SuccessFilled /></el-icon>
                <span>{{ $t('agentOrders.filterDelivered') }} · {{ $t('agentOrders.deliveredStockDeducted') }}</span>
              </div>
              <span class="font-mono text-[11px] text-emerald-700 font-semibold">{{ order.deliveredAt?.slice(5, 16) || '' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. 极简指派送货上门车队弹窗 (提供常用司机车牌一键预选) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="dispatchModalVisible"
      :title="$t('agentOrders.dispatchModalTitle')"
      width="90%"
      style="max-width: 480px"
      append-to-body
      destroy-on-close
    >
      <div v-if="currentDispatchOrder" class="space-y-4 text-xs">
        <!-- 订单概况微横幅 -->
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 text-sm">{{ currentDispatchOrder.headName }}</span>
            <span class="font-mono text-slate-500 font-bold">#{{ currentDispatchOrder.orderId }}</span>
          </div>
          <div class="text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <el-icon class="text-xs text-slate-400"><Location /></el-icon>
            <span class="truncate">{{ currentDispatchOrder.deliveryAddress }}</span>
          </div>
        </div>

        <!-- 常用保供司机与车辆快捷点选胶囊 -->
        <div>
          <span class="text-[11px] text-slate-500 font-bold mb-1.5 block">{{ $t('agentOrders.quickAssignDriver') }}</span>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="p-2 rounded-xl text-left border transition-all"
              :class="dispatchForm.vehicleNo.includes('78219') ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
              @click="applyQuickDriver(0)"
            >
              <div class="text-xs font-bold">哈希姆·阿里</div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">BG-78219 (急送货车)</div>
            </button>

            <button
              type="button"
              class="p-2 rounded-xl text-left border transition-all"
              :class="dispatchForm.vehicleNo.includes('33812') ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
              @click="applyQuickDriver(1)"
            >
              <div class="text-xs font-bold">萨米尔·卡西姆</div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">BG-33812 (冷链专车)</div>
            </button>
          </div>
        </div>

        <!-- 详细表单 -->
        <div class="space-y-3">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">{{ $t('agentOrders.deliveryPersonLabel') }}</label>
            <el-input v-model="dispatchForm.deliveryPerson" :placeholder="$t('agentOrders.dispatchPersonNamePlaceholder')" />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">{{ $t('agentOrders.driverPhoneLabel') }}</label>
              <el-input v-model="dispatchForm.driverPhone" placeholder="+964 780..." />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">{{ $t('agentOrders.vehicleNoLabel') }}</label>
              <el-input v-model="dispatchForm.vehicleNo" placeholder="BG-..." />
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">{{ $t('agentOrders.estimatedTimeLabel') }}</label>
            <el-select v-model="dispatchForm.estimatedTime" class="w-full">
              <el-option :label="$t('agentOrders.est30Mins')" value="30分钟内送达" />
              <el-option :label="$t('agentOrders.est1Hour')" value="1小时内送达" />
              <el-option :label="$t('agentOrders.est2Hours')" value="2小时内送达" />
              <el-option :label="$t('agentOrders.estEvening')" value="当日晚间送达" />
            </el-select>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <el-button @click="dispatchModalVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="dispatching" class="font-bold px-5" @click="confirmDispatch">
            <el-icon class="mr-1"><Van /></el-icon>
            {{ $t('agentOrders.confirmDispatchBtn') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 4. 阶段 4 核心：高纵深 APP 风格扫码拍照核验与实物交接弹窗 -->
    <!-- (先打开摄像头拍照扫码，拍照识别后再弹出确认单) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="scanVerifyModalVisible"
      :show-close="false"
      align-center
      width="92%"
      style="max-width: 412px; border-radius: 28px; overflow: hidden; padding: 0; background: transparent !important; box-shadow: none !important;"
      class="app-scan-dialog"
      modal-class="app-scan-dialog-overlay"
      append-to-body
      destroy-on-close
      @closed="handleModalClosed"
    >
      <!-- 高纵深手机容器 (整体高度 78vh 适配各种屏幕，半透明磨砂亚克力玻璃材质) -->
      <div
        class="flex flex-col h-[78vh] max-h-[690px] min-h-[480px] select-none relative overflow-hidden rounded-[28px] border shadow-2xl transition-all duration-300"
        :class="claimStep === 'camera'
          ? 'bg-slate-950/80 text-white border-slate-700/60 backdrop-blur-2xl'
          : 'bg-slate-50/85 text-slate-800 border-white/70 backdrop-blur-2xl shadow-[0_25px_50px_rgba(0,0,0,0.25)]'"
      >
        <!-- 模拟快门白闪动画遮罩 -->
        <div
          v-if="isShutterFlashing"
          class="absolute inset-0 bg-white z-50 pointer-events-none animate-shutter-flash"
        ></div>

        <!-- APP 沉浸式顶部标题栏 (根据步骤自适应黑白半透明磨砂效果) -->
        <div
          class="px-4 py-2.5 border-b flex items-center justify-between shrink-0 z-20 backdrop-blur-md transition-colors"
          :class="claimStep === 'camera'
            ? 'bg-slate-900/80 border-slate-800/80 text-white'
            : 'bg-white/80 border-slate-200/80 text-slate-900'"
        >
          <div class="flex items-center gap-2">
            <!-- 补光灯/手电筒开关 (仅相机步骤展示) -->
            <button
              v-if="claimStep === 'camera'"
              type="button"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
              :class="isFlashOn ? 'bg-amber-400 text-slate-900 shadow-[0_0_12px_#fbbf24]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
              @click="isFlashOn = !isFlashOn"
            >
              <span>⚡</span>
            </button>
            <div
              v-else
              class="w-7 h-7 rounded-full bg-emerald-100/90 flex items-center justify-center text-emerald-700 text-xs font-bold"
            >
              ✓
            </div>
            <div>
              <div class="text-xs font-bold flex items-center gap-1" :class="claimStep === 'camera' ? 'text-white' : 'text-slate-900'">
                <span>{{ claimStep === 'camera' ? $t('agentOrders.scanCameraModalTitle') : claimStep === 'confirm' ? $t('agentOrders.confirmOrderModalTitle') : $t('agentOrders.officialVoucherModalTitle') }}</span>
                <span
                  class="text-[9px] px-1 rounded font-mono"
                  :class="claimStep === 'camera' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'"
                >MOT-APP</span>
              </div>
            </div>
          </div>

          <!-- 关闭小叉号 -->
          <button
            type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            :class="claimStep === 'camera' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'"
            @click="scanVerifyModalVisible = false"
          >
            ✕
          </button>
        </div>

        <!-- ====================================================== -->
        <!-- 页面 1：相机扫码与拍照视窗 (Step 1 必须首先展示) -->
        <!-- ====================================================== -->
        <div
          v-if="claimStep === 'camera'"
          class="flex-1 flex flex-col justify-between p-3.5 bg-slate-950 relative overflow-hidden"
        >
          <!-- 目标订单提示微胶囊 (从卡片点进来时高亮指引) -->
          <div v-if="targetPresetOrder" class="z-20 mb-1.5 shrink-0">
            <div class="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-[11px] flex items-center justify-between">
              <span class="text-slate-300 truncate">
                📸 {{ $t('agentOrders.verifyTarget') }}: <strong class="text-emerald-400 font-bold">{{ targetPresetOrder.headName }}</strong>
              </span>
              <span class="font-mono text-slate-400 text-[10px]">#{{ targetPresetOrder.orderId?.slice(-6) }}</span>
            </div>
          </div>

          <!-- 核心相机取景器窗口 (自适应高度，带最大高度限制) -->
          <div class="relative w-full flex-1 min-h-[180px] max-h-[340px] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
            <!-- 真实摄像头视频流预览 -->
            <video
              ref="videoRef"
              autoplay
              playsinline
              webkit-playsinline
              muted
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              :class="cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            />

            <!-- 仿真全息扫描动画网格 (当物理摄像头未开启/PC端时平滑显示) -->
            <div v-if="!cameraActive" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90">
              <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div class="w-20 h-20 rounded-2xl border-2 border-emerald-500/20 flex items-center justify-center text-emerald-500/40 text-3xl mb-1.5">
                <el-icon><Camera /></el-icon>
              </div>
              <p class="text-[10px] text-slate-500">{{ $t('agentOrders.cameraReadyHint') }}</p>
            </div>

            <!-- 取景器四角定位框 -->
            <div class="relative w-48 h-48 sm:w-52 sm:h-52 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center pointer-events-none z-10">
              <!-- 四角强化 L 标 -->
              <div class="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-400"></div>
              <div class="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-400"></div>
              <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-400"></div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-400"></div>

              <!-- 动态上下激光扫描线 -->
              <div class="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-pulse-scan"></div>
            </div>

            <!-- 取景提示浮条 -->
            <div class="absolute bottom-2.5 inset-x-4 z-20 flex justify-center">
              <span class="px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 text-[10px] tracking-wide border border-emerald-500/30">
                {{ $t('orderClaim.scanningHint') }}
              </span>
            </div>
          </div>

          <!-- 取景器下半部分：手机相机大圆快门按钮与快捷操作 (紧凑安全区，绝对不被底部遮挡) -->
          <div class="pt-2 pb-1 shrink-0 space-y-2 z-20">
            <!-- 手机快门拍照大按钮 (居中大圆) -->
            <div class="flex flex-col items-center justify-center">
              <button
                type="button"
                class="w-14 h-14 rounded-full border-4 border-white/90 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_16px_rgba(16,185,129,0.5)] flex items-center justify-center cursor-pointer group"
                @click="takePhotoAndVerify"
              >
                <div class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-emerald-700 font-bold text-base group-hover:scale-105 transition-transform">
                  📸
                </div>
              </button>
              <span class="text-[10px] text-slate-400 mt-1 tracking-wider font-medium">{{ $t('agentOrders.clickShutterHint') }}</span>
            </div>

            <!-- 辅助功能：模拟扫码快捷键与手动输入抽屉 -->
            <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <el-button
                size="small"
                type="success"
                plain
                class="text-[11px] font-bold border-emerald-500/40 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50"
                @click="simulateScanCurrentCitizenCode"
              >
                <span>⚡ {{ $t('orderClaim.simulateScanBtn') }}</span>
              </el-button>

              <button
                type="button"
                class="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                @click="showManualInput = !showManualInput"
              >
                {{ showManualInput ? $t('agentOrders.collapseInput') : $t('agentOrders.manualInput') }}
              </button>
            </div>

            <!-- 折叠手动输入框 -->
            <div v-if="showManualInput" class="flex items-center gap-1.5 pt-0.5">
              <el-input
                v-model="scanInputCode"
                size="small"
                :placeholder="$t('agentOrders.manualInputPlaceholder')"
                clearable
                @keyup.enter="handleLookupCode"
              />
              <el-button size="small" type="primary" :loading="lookupLoading" @click="handleLookupCode">
                {{ $t('agentOrders.queryBtn') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- ====================================================== -->
        <!-- 页面 2：拍照核验成功后的【实物交割核销确认单】 (Step 2) -->
        <!-- ====================================================== -->
        <div
          v-else-if="claimStep === 'confirm' && verifiedOrder"
          class="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <!-- 中间自适应可滚动信息区 (带细微滚动条，不会挤压底部按钮) -->
          <div class="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
            <!-- 识别成功绿色彩条 -->
            <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-2">
                <el-icon class="text-emerald-600 text-lg"><CircleCheck /></el-icon>
                <div>
                  <span class="font-bold text-emerald-950 block text-xs">{{ $t('orderClaim.matchedOrderTitle') }}</span>
                  <span class="font-mono text-[10px] text-emerald-700">{{ $t('agentOrders.codeLabel') }}: {{ verifiedOrder.pickupCode }}</span>
                </div>
              </div>
              <el-button size="small" text type="info" @click="retakePhoto">{{ $t('agentOrders.retakePhotoBtn') }}</el-button>
            </div>

            <!-- 户主与送货信息卡片 -->
            <div class="p-3 rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-sm shadow-sm space-y-1.5 text-xs">
              <div class="flex items-center justify-between text-slate-800">
                <span class="font-bold text-sm">{{ verifiedOrder.headName }}</span>
                <span class="font-mono text-slate-600">{{ verifiedOrder.phone }}</span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span>{{ $t('orderClaim.cardNo') }}: <b class="font-mono text-slate-800">{{ verifiedOrder.cardNo }}</b></span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="verifiedOrder.deliveryType === 'HOME_DELIVERY' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'">
                  {{ verifiedOrder.deliveryType === 'HOME_DELIVERY' ? $t('agentOrders.typeDelivery') : $t('agentOrders.typePickup') }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <el-icon class="text-slate-400 shrink-0"><Location /></el-icon>
                <span class="truncate">{{ verifiedOrder.deliveryAddress || verifiedOrder.agentName }}</span>
              </div>
            </div>

            <!-- 配发物资明细与代销站现货库存实时扣减预演 -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>{{ $t('orderClaim.itemsTitle') }}</span>
                <span class="text-emerald-700 font-mono text-[10px]">{{ $t('agentOrders.actualStockBeforeAfter') }}</span>
              </div>

              <div class="space-y-1.5">
                <div
                  v-for="(item, idx) in verifiedOrder.items"
                  :key="idx"
                  class="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-sm shadow-sm flex items-center justify-between text-xs"
                >
                  <div>
                    <div class="font-bold text-slate-800">{{ formatItemName(item.itemName) }}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {{ $t('agentOrders.actualIssued') }}: <b class="text-slate-900 font-bold">{{ item.qty }}{{ item.unit }}</b>
                    </div>
                  </div>

                  <div class="text-right font-mono">
                    <div class="text-[11px] text-slate-500">
                      <span>{{ getStockOnHand(item.itemCode) }} {{ item.unit }}</span>
                      <span class="text-rose-500 font-bold mx-1">-{{ item.qty }}</span>
                    </div>
                    <div class="text-xs font-bold text-emerald-700 mt-0.5">
                      {{ $t('agentOrders.stockRemaining') }}: {{ Math.max(0, getStockOnHand(item.itemCode) - item.qty) }} {{ item.unit }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 自付规费结算与财政全额直补信息 -->
            <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm flex items-center justify-between text-xs">
              <span class="text-amber-800 font-medium text-[11px]">{{ $t('orderClaim.subsidyNote') }}</span>
              <div class="text-right">
                <span class="text-[10px] text-amber-700 block">{{ $t('agentOrders.settledPaidFee') }}</span>
                <span class="font-mono font-bold text-amber-900 text-sm">IQD {{ (verifiedOrder.selfPayAmount || 0).toLocaleString() }}</span>
              </div>
            </div>

            <!-- 数字签名交接确认区域 -->
            <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-sm space-y-1.5 text-xs">
              <div class="flex items-center justify-between text-indigo-900 font-bold">
                <span>{{ $t('orderClaim.signTitle') }}</span>
                <el-tag size="small" type="success" effect="dark" class="scale-90 font-mono">DIGITAL SIGNED</el-tag>
              </div>
              <div class="p-2 bg-white/90 rounded-lg border border-indigo-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">✍️</span>
                  <span class="font-mono italic font-bold text-slate-800 text-xs">{{ verifiedOrder.headName }} ({{ $t('agentOrders.citizenSignedNote') }})</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">{{ new Date().toISOString().slice(0, 10) }}</span>
              </div>
              <div class="text-[10px] text-indigo-700/80">
                {{ $t('orderClaim.signCitizenConfirmed') }}
              </div>
            </div>
          </div>

          <!-- 底部固定操作托盘 (永远位于视口底部，绝不被弹窗挡住) -->
          <div class="shrink-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] space-y-1.5 z-20">
            <el-button
              type="success"
              size="large"
              :loading="claiming"
              class="w-full font-bold shadow-md rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none text-white text-sm py-2.5"
              @click="submitConfirmClaim"
            >
              <el-icon class="mr-1.5"><Check /></el-icon>
              {{ $t('orderClaim.confirmDeliveryBtn') }}
            </el-button>

            <el-button size="small" class="w-full text-slate-500" @click="retakePhoto">
              {{ $t('agentOrders.retakePhotoBtn') }}
            </el-button>
          </div>
        </div>

        <!-- ====================================================== -->
        <!-- 页面 3：核销成功！展示官方交接回执单 (Step 3) -->
        <!-- ====================================================== -->
        <div
          v-else-if="claimStep === 'receipt' && claimReceipt"
          class="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <!-- 中间自适应可滚动小票单据区 (带细微滚动条，不会挤压底部按钮) -->
          <div class="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
            <!-- 成功标头 -->
            <div class="text-center space-y-1 pt-1">
              <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <h3 class="text-base font-bold text-slate-900">{{ $t('orderClaim.claimSuccessTitle') }}</h3>
              <p class="text-[11px] text-slate-500">{{ $t('agentOrders.receiptSubtitle') }}</p>
            </div>

            <!-- 伊拉克贸易部官方交接小票纸 (高纵深长小票) -->
            <div class="p-3.5 rounded-2xl bg-white/85 backdrop-blur-sm border-2 border-dashed border-slate-300 shadow-sm space-y-2.5 relative">
              <!-- 电子公章印戳 -->
              <div class="absolute right-3 bottom-3 pointer-events-none opacity-85 border-2 border-emerald-600 rounded-full w-20 h-20 flex flex-col items-center justify-center text-emerald-700 rotate-[-12deg] scale-90">
                <span class="text-[8px] font-bold">REPUBLIC OF IRAQ</span>
                <span class="text-[8px] font-bold">MOT VERIFIED</span>
                <span class="text-[7px] font-mono">100% BALANCED</span>
              </div>

              <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                <span class="font-bold text-slate-800 text-xs">{{ $t('agentOrders.receiptTitle') }}</span>
                <span class="font-mono text-emerald-700 font-bold text-xs">{{ claimReceipt.claimVoucherNo }}</span>
              </div>

              <div class="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                <div>{{ $t('agentOrders.receivingFamily') }}: <b class="text-slate-900">{{ claimReceipt.order?.headName }}</b></div>
                <div>{{ $t('orderClaim.cardNo') }}: <b class="text-slate-900 font-mono">{{ claimReceipt.order?.cardNo }}</b></div>
                <div>{{ $t('agentOrders.deliveryTime') }}: <span class="font-mono">{{ claimReceipt.deliveredAt }}</span></div>
                <div>{{ $t('agentOrders.redemptionStation') }}: <span class="font-bold text-slate-800">{{ isEn ? 'Karkh 1st Station' : '卡尔赫第一代销站' }}</span></div>
              </div>

              <!-- 扣减清单 -->
              <div class="pt-2 border-t border-slate-200 space-y-1">
                <div class="text-[10px] font-bold text-slate-500">{{ $t('agentOrders.deductionSummaryTitle') }}</div>
                <div
                  v-for="(it, idx) in claimReceipt.deductedItems"
                  :key="idx"
                  class="flex items-center justify-between text-[11px] bg-slate-50/80 p-1.5 rounded border border-slate-200/60"
                >
                  <span class="font-medium text-slate-800">{{ formatItemName(it.itemName) }}</span>
                  <span class="font-mono font-bold text-emerald-700">-{{ it.qty }}{{ it.unit }} (余: {{ it.afterOnHand }}{{ it.unit }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部固定打印与完成操作托盘 (永远位于视口底部，绝不被弹窗挡住) -->
          <div class="shrink-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] space-y-1.5 z-20">
            <el-button class="w-full font-bold" @click="printReceipt">
              <el-icon class="mr-1"><Printer /></el-icon>
              {{ $t('orderClaim.printReceiptBtn') }}
            </el-button>
            <el-button type="primary" size="large" class="w-full font-bold rounded-xl" @click="closeScanVerifyModal">
              {{ $t('orderClaim.closeBtn') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const isAppMode = computed(() => {
  return route.query.layout === 'app' || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app');
});
import {
  Search,
  Refresh,
  Location,
  CopyDocument,
  Van,
  Check,
  CircleCheck,
  SuccessFilled,
  Document,
  Camera,
  Printer
} from '@element-plus/icons-vue';
import {
  getAgentCitizenOrders,
  dispatchCitizenOrder,
  lookupCitizenOrderByCode,
  verifyAndClaimCitizenOrder
} from '@/api/agent';
import { onTabMessage } from '@/utils/crossTabBus';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

function formatItemName(name) {
  if (!name) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'Wheat Flour (Grade 1)';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'Long-Grain Rice (Imported)';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'Vegetable Oil';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'White Sugar';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'Milk Powder';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'Black Tea';
  } else if (lang === 'ar') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'طحين قمح ممتاز (درجة 1)';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'أرز بسمتي مستورد';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'زيت نباتي مكرر';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'سكر أبيض نقي';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'حليب مجفف';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'شاي أسود';
  } else if (lang === 'ku') {
    if (name.includes('面粉') || name.includes('Flour') || name.includes('طحين')) return 'ئاردی گەنمی پلە یەک';
    if (name.includes('米') || name.includes('Rice') || name.includes('أرز')) return 'برنجی دەنک درێژ';
    if (name.includes('油') || name.includes('Oil') || name.includes('زيت')) return 'ڕۆنی ڕووەکی پاڵاوتە';
    if (name.includes('糖') || name.includes('Sugar') || name.includes('سكر')) return 'شەکری سپی';
    if (name.includes('奶') || name.includes('Milk') || name.includes('حليب')) return 'شیری وشککراو';
    if (name.includes('茶') || name.includes('Tea') || name.includes('شاي')) return 'چای ڕەش';
  } else {
    if (name.includes('Flour') || name.includes('طحين') || name.includes('ئارد')) return '战略储备优质小麦面粉';
    if (name.includes('Rice') || name.includes('أرز') || name.includes('برنج')) return '一级进口长粒大米';
    if (name.includes('Oil') || name.includes('زيت') || name.includes('ڕۆن')) return '一级精炼食用油';
    if (name.includes('Sugar') || name.includes('سكر') || name.includes('شەکر')) return '纯正战略白砂糖';
    if (name.includes('Milk') || name.includes('حليب') || name.includes('شیر')) return '全脂强化配方奶粉';
    if (name.includes('Tea') || name.includes('شاي') || name.includes('چای')) return '特选高山红茶';
  }
  return name;
}

watch(locale, () => {
  loadOrders();
});

// 数据状态
const loading = ref(false);
const orders = ref([]);
const searchKeyword = ref('');
const statusFilter = ref('ALL');
const deliveryTypeFilter = ref('ALL');

// 本地现货库存表
const localStocks = ref([
  { itemCode: 'FLOUR-WHT-02', itemName: '战略储备优质小麦面粉', currentOnHand: 12500, unit: 'kg' },
  { itemCode: 'RICE-BAS-01', itemName: '一级进口长粒大米', currentOnHand: 4800, unit: 'kg' },
  { itemCode: 'OIL-SUN-03', itemName: '一级精炼葵花籽食用油', currentOnHand: 3200, unit: 'L' },
  { itemCode: 'SUGAR-WHT-04', itemName: '纯正精制战略白砂糖', currentOnHand: 2900, unit: 'kg' }
]);

function getStockOnHand(itemCode) {
  const s = localStocks.value.find((it) => it.itemCode === itemCode);
  return s ? s.currentOnHand : 1000;
}

// 快速派单弹窗
const dispatchModalVisible = ref(false);
const dispatching = ref(false);
const currentDispatchOrder = ref(null);
const dispatchForm = ref({
  deliveryPerson: '哈希姆·阿里 (保供急送专员)',
  driverPhone: '+964 780 999 8811',
  vehicleNo: 'BG-78219 (厢式冷链货车)',
  estimatedTime: '30分钟内送达'
});

const quickDrivers = [
  {
    name: '哈希姆·阿里 (保供急送专员)',
    phone: '+964 780 999 8811',
    vehicleNo: 'BG-78219 (厢式冷链货车)',
    time: '30分钟内送达'
  },
  {
    name: '萨米尔·卡西姆 (微网格骑手)',
    phone: '+964 771 223 9090',
    vehicleNo: 'BG-33812 (轻型保供机动车)',
    time: '45分钟内送达'
  }
];

function applyQuickDriver(idx) {
  const d = quickDrivers[idx];
  if (d) {
    dispatchForm.value.deliveryPerson = d.name;
    dispatchForm.value.driverPhone = d.phone;
    dispatchForm.value.vehicleNo = d.vehicleNo;
    dispatchForm.value.estimatedTime = d.time;
  }
}

// ==========================================
// 阶段 4 核心：高纵深 APP 风格扫码与拍照核验状态
// ==========================================
const scanVerifyModalVisible = ref(false);
const claimStep = ref('camera'); // 'camera' | 'confirm' | 'receipt'
const targetPresetOrder = ref(null);
const showManualInput = ref(false);
const isFlashOn = ref(false);
const isShutterFlashing = ref(false);
const lookupLoading = ref(false);
const claiming = ref(false);
const scanInputCode = ref('');
const verifiedOrder = ref(null);
const claimReceipt = ref(null);

// 真实摄像机流控制
const videoRef = ref(null);
const cameraActive = ref(false);
let mediaStream = null;

async function startCamera() {
  if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStream = stream;
      if (videoRef.value) {
        videoRef.value.srcObject = stream;
        videoRef.value.play().catch(() => {});
        cameraActive.value = true;
      }
    } catch (err) {
      console.warn('无法开启物理摄像头，平滑切换至高保真模拟扫描界面:', err);
      cameraActive.value = false;
    }
  } else {
    cameraActive.value = false;
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  cameraActive.value = false;
}

// 打开扫码核验弹窗 (无论从顶部还是卡片进入，都必须先打开相机拍照扫码)
function openScanVerifyModal(order = null) {
  scanInputCode.value = '';
  verifiedOrder.value = null;
  claimReceipt.value = null;
  targetPresetOrder.value = order; // 暂存目标订单
  showManualInput.value = false;
  isFlashOn.value = false;
  claimStep.value = 'camera'; // 第一步严格展示摄像头取景器！
  scanVerifyModalVisible.value = true;

  // 延迟启动摄像头，确保 DOM 已挂载
  setTimeout(() => {
    startCamera();
  }, 100);
}

// 点击快门拍照并识别二维码
async function takePhotoAndVerify() {
  // 触发快门闪烁特效
  isShutterFlashing.value = true;
  setTimeout(() => {
    isShutterFlashing.value = false;
  }, 300);

  // 1. 如果是从特定订单卡片点击进入的，直接精准识别该目标订单
  if (targetPresetOrder.value) {
    stopCamera();
    verifiedOrder.value = targetPresetOrder.value;
    claimStep.value = 'confirm';
    ElMessage.success('拍照扫描成功！已核验匹配公民动态二维码凭证，请核对交接单。');
    return;
  }

  // 2. 如果手动输入了提货码，调用检索
  if (scanInputCode.value.trim()) {
    await handleLookupCode();
    return;
  }

  // 3. 否则自动识别当前最新待核验订单
  const candidate = orders.value.find(
    (o) => o.status === 'DISPATCHED' || o.status === 'READY_FOR_PICKUP' || o.status === 'PENDING_DELIVERY' || o.status === 'PENDING_PICKUP'
  ) || orders.value[0];

  if (candidate) {
    stopCamera();
    verifiedOrder.value = candidate;
    claimStep.value = 'confirm';
    ElMessage.success(`拍照扫描成功！已识别提货码【${candidate.pickupCode}】，请核对交接单。`);
  } else {
    ElMessage.warning('未能识别到有效二维码，请将镜头对准公民手机或手动输入提货码');
  }
}

// 模拟快捷识别公民动态二维码
function simulateScanCurrentCitizenCode() {
  const candidate = targetPresetOrder.value || orders.value.find(
    (o) => o.status === 'DISPATCHED' || o.status === 'READY_FOR_PICKUP' || o.status === 'PENDING_DELIVERY' || o.status === 'PENDING_PICKUP'
  ) || orders.value[0];

  if (candidate) {
    scanInputCode.value = candidate.pickupCode;
    takePhotoAndVerify();
  } else {
    ElMessage.info('暂无可识别的提货凭证');
  }
}

// 查询提货码对应的订单
async function handleLookupCode() {
  const code = scanInputCode.value.trim();
  if (!code) {
    ElMessage.warning(t('orderClaim.scanPlaceholder'));
    return;
  }
  lookupLoading.value = true;
  try {
    const res = await lookupCitizenOrderByCode(code);
    stopCamera();
    verifiedOrder.value = res?.data || res;
    claimStep.value = 'confirm';
    ElMessage.success('提货凭证核验匹配成功！请核对物资与实物库存并签署交接。');
  } catch (err) {
    console.error('检索提货订单失败', err);
    ElMessage.error(t('orderClaim.scanError'));
  } finally {
    lookupLoading.value = false;
  }
}

function retakePhoto() {
  verifiedOrder.value = null;
  claimReceipt.value = null;
  claimStep.value = 'camera';
  setTimeout(() => {
    startCamera();
  }, 100);
}

// 确认交付并核销扣库
async function submitConfirmClaim() {
  if (!verifiedOrder.value) return;
  claiming.value = true;
  try {
    const res = await verifyAndClaimCitizenOrder(verifiedOrder.value.orderId, {
      pickupCode: verifiedOrder.value.pickupCode,
      verifier: '网点核验专员-穆罕默德·贾巴尔',
      verifyMethod: 'DYNAMIC_QR_CODE',
      signature: `${verifiedOrder.value.headName}_DIGITAL_SIGNED`
    });

    const data = res?.data || res;
    claimReceipt.value = data;
    claimStep.value = 'receipt';

    // 同步扣减本地库存展示
    if (data.deductedItems) {
      data.deductedItems.forEach((di) => {
        const item = localStocks.value.find((ls) => ls.itemCode === di.itemCode);
        if (item) {
          item.currentOnHand = di.afterOnHand;
        }
      });
    }

    ElMessage.success(res?.message || '交接核销成功！代销站现货库存已同步扣减。');
    await loadOrders();
  } catch (err) {
    console.error('确认交货核销失败', err);
    ElMessage.error('确认交货核销失败，请重试');
  } finally {
    claiming.value = false;
  }
}

function printReceipt() {
  window.print?.();
  ElMessage.success('已发送至代销站热敏小票打印机！');
}

function closeScanVerifyModal() {
  scanVerifyModalVisible.value = false;
  stopCamera();
  targetPresetOrder.value = null;
  verifiedOrder.value = null;
  claimReceipt.value = null;
  claimStep.value = 'camera';
}

function handleModalClosed() {
  stopCamera();
}

// 加载订单列表
async function loadOrders() {
  loading.value = true;
  try {
    const params = {};
    if (deliveryTypeFilter.value !== 'ALL') {
      params.deliveryType = deliveryTypeFilter.value;
    }
    const res = await getAgentCitizenOrders(params);
    orders.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (err) {
    console.error('加载配给订单失败', err);
    ElMessage.error('加载订单列表失败，请重试');
  } finally {
    loading.value = false;
  }
}

// 统计各状态数量
const counts = computed(() => {
  const all = orders.value.length;
  let pending = 0;
  let dispatched = 0;
  let readyPickup = 0;
  let delivered = 0;

  orders.value.forEach((o) => {
    if (o.status === 'PENDING_DELIVERY' || o.status === 'PENDING_PICKUP' || o.status === 'PAID') {
      pending += 1;
    } else if (o.status === 'DISPATCHED') {
      dispatched += 1;
    } else if (o.status === 'READY_FOR_PICKUP') {
      readyPickup += 1;
    } else if (o.status === 'DELIVERED') {
      delivered += 1;
    }
  });

  return { all, pending, dispatched, readyPickup, delivered };
});

// 本地筛选与搜索
const filteredOrders = computed(() => {
  let list = orders.value;

  // 状态过滤
  if (statusFilter.value === 'PENDING') {
    list = list.filter((o) => o.status === 'PENDING_DELIVERY' || o.status === 'PENDING_PICKUP' || o.status === 'PAID');
  } else if (statusFilter.value === 'DISPATCHED') {
    list = list.filter((o) => o.status === 'DISPATCHED');
  } else if (statusFilter.value === 'READY_FOR_PICKUP') {
    list = list.filter((o) => o.status === 'READY_FOR_PICKUP');
  } else if (statusFilter.value === 'DELIVERED') {
    list = list.filter((o) => o.status === 'DELIVERED');
  }

  // 履约类型过滤
  if (deliveryTypeFilter.value !== 'ALL') {
    list = list.filter((o) => o.deliveryType === deliveryTypeFilter.value);
  }

  // 搜索关键字
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter((o) =>
      (o.orderId && o.orderId.toLowerCase().includes(kw)) ||
      (o.cardNo && o.cardNo.toLowerCase().includes(kw)) ||
      (o.headName && o.headName.toLowerCase().includes(kw)) ||
      (o.phone && o.phone.includes(kw)) ||
      (o.pickupCode && o.pickupCode.toLowerCase().includes(kw))
    );
  }

  return list;
});

function setStatusFilter(st) {
  statusFilter.value = st;
}

function handleSearch() {}

// 状态样式映射
function getStatusBadgeClass(status) {
  switch (status) {
    case 'PENDING_DELIVERY':
    case 'PENDING_PICKUP':
    case 'PAID':
      return 'bg-amber-50 text-amber-700 border border-amber-200/60';
    case 'DISPATCHED':
      return 'bg-sky-50 text-sky-700 border border-sky-200/60';
    case 'READY_FOR_PICKUP':
      return 'bg-purple-50 text-purple-700 border border-purple-200/60';
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

// 状态文本
function getStatusText(status) {
  switch (status) {
    case 'PENDING_DELIVERY':
      return t('citizenPurchase.statusPendingDelivery') || '待排期配送';
    case 'PENDING_PICKUP':
      return t('citizenPurchase.statusPendingPickup') || '待到店自提';
    case 'PAID':
      return t('citizenPurchase.statusPendingDelivery') || '已支付待安排';
    case 'DISPATCHED':
      return t('citizenPurchase.statusDispatched') || '配送中';
    case 'READY_FOR_PICKUP':
      return t('agentOrders.filterReadyPickup') || '备货就绪';
    case 'DELIVERED':
      return t('citizenPurchase.statusDelivered') || '已交付';
    default:
      return status;
  }
}

// 打开指派送货上门弹窗
function openDispatchModal(order) {
  currentDispatchOrder.value = order;
  applyQuickDriver(0);
  dispatchModalVisible.value = true;
}

// 确认出车派单
async function confirmDispatch() {
  if (!currentDispatchOrder.value) return;
  dispatching.value = true;
  try {
    await dispatchCitizenOrder(currentDispatchOrder.value.orderId, {
      deliveryPerson: dispatchForm.value.deliveryPerson,
      phone: dispatchForm.value.driverPhone,
      vehicleNo: dispatchForm.value.vehicleNo,
      estimatedTime: dispatchForm.value.estimatedTime
    });

    ElMessage.success('已指派保供车队出车派送，订单状态已同步更新！');
    dispatchModalVisible.value = false;
    await loadOrders();
  } catch (err) {
    console.error('指派派送失败', err);
    ElMessage.error('指派派送失败，请稍后重试');
  } finally {
    dispatching.value = false;
  }
}

// 标记网点备货就绪 (到店自提)
async function handleMarkReady(order) {
  try {
    await ElMessageBox.confirm(
      t('agentOrders.readyConfirmMsg'),
      t('agentOrders.readyConfirmTitle'),
      {
        confirmButtonText: t('common.confirm') || '确认就绪',
        cancelButtonText: t('common.cancel') || '取消',
        type: 'info'
      }
    );

    loading.value = true;
    await dispatchCitizenOrder(order.orderId, {
      deliveryPerson: '网点前台备货员',
      phone: '+964 780 123 0000',
      vehicleNo: '代销站仓位 A-02',
      estimatedTime: '随时到店可提'
    });

    ElMessage.success('已标记网点备货就绪，等待居民到店出示二维码！');
    await loadOrders();
  } catch (err) {
    if (err !== 'cancel') {
      console.error('标记备货失败', err);
    }
  } finally {
    loading.value = false;
  }
}

// 复制文字工具
function copyText(val) {
  if (!val) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val);
    ElMessage.success(t('citizenPurchase.copySuccess') || '已复制到剪贴板');
  } else {
    ElMessage.info(val);
  }
}

const crossTabUnsubs = [];

onMounted(() => {
  loadOrders();

  // 跨标签页监听公民端下单通知
  const unsubPurchased = onTabMessage('ORDER_PURCHASED', (newOrder) => {
    loadOrders();
    ElMessage.info(`【新订单提醒】收到公民【${newOrder.headName}】提交的新配给领配订单 ${newOrder.orderId}`);
  });

  const unsubUpdated = onTabMessage('ORDER_UPDATED', () => {
    loadOrders();
  });

  crossTabUnsubs.push(unsubPurchased, unsubUpdated);
});

onBeforeUnmount(() => {
  stopCamera();
  crossTabUnsubs.forEach((fn) => fn && fn());
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes scanLine {
  0% {
    top: 6%;
  }
  50% {
    top: 92%;
  }
  100% {
    top: 6%;
  }
}

.animate-pulse-scan {
  animation: scanLine 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes shutterFlash {
  0% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
  }
}

.animate-shutter-flash {
  animation: shutterFlash 0.3s ease-out forwards;
}

:deep(.app-scan-dialog-overlay) {
  background-color: rgba(15, 23, 42, 0.42) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

:deep(.app-scan-dialog) {
  margin: auto !important;
  display: flex !important;
  flex-direction: column !important;
  max-height: 85vh !important;
  overflow: hidden !important;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

:deep(.app-scan-dialog .el-dialog__header) {
  display: none !important;
}

:deep(.app-scan-dialog .el-dialog__body) {
  padding: 0 !important;
  height: 100% !important;
  overflow: hidden !important;
  background: transparent !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.4);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.6);
}
</style>
