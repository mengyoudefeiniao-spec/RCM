<template>
  <div class="agent-g2b-panel" :class="isAppMode ? 'space-y-3' : 'space-y-4'">
    <!-- 筛选工具栏与新建采购按钮 -->
    <div
      class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 gap-2.5 text-xs"
      :class="isAppMode ? 'flex flex-col space-y-2' : 'flex flex-col sm:flex-row items-stretch sm:items-center justify-between'"
    >
      <div class="flex flex-wrap items-center gap-2.5 flex-1" :class="isAppMode ? 'w-full flex-col items-stretch' : ''">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('agentG2B.searchPlaceholder')"
          clearable
          size="small"
          :style="isAppMode ? 'width: 100%' : 'width: 240px'"
          @input="handleFilter"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <div :class="isAppMode ? 'grid grid-cols-2 gap-2 w-full' : 'contents'">
          <el-select
            v-model="statusFilter"
            size="small"
            :style="isAppMode ? 'width: 100%' : 'width: 170px'"
            @change="handleFilter"
          >
            <el-option :label="$t('agentG2B.filterUnfinished')" value="UNFINISHED" />
            <el-option :label="$t('agentG2B.filterAll')" value="全部" />
            <el-option :label="$t('agentG2B.filterPendingPayment')" value="PENDING_PAYMENT" />
            <el-option :label="$t('agentG2B.filterPaidPicking')" value="PAID_WMS_PICKING" />
            <el-option :label="$t('agentG2B.filterInTransit')" value="IN_TRANSIT" />
            <el-option :label="$t('agentG2B.filterCompleted')" value="COMPLETED" />
          </el-select>

          <el-button size="small" type="primary" plain :class="isAppMode ? 'w-full' : ''" @click="loadOrders">
            <el-icon class="mr-1"><Refresh /></el-icon>
            {{ $t('common.refresh') }}
          </el-button>
        </div>
      </div>

      <!-- 新建采购按钮 -->
      <el-button
        type="primary"
        size="small"
        class="font-bold shadow-xs shrink-0"
        :class="isAppMode ? 'w-full' : ''"
        @click="openCreateModal"
      >
        <el-icon class="mr-1"><Plus /></el-icon>
        {{ $t('agentG2B.btnNewPurchase') }}
      </el-button>
    </div>

    <!-- ============================================== -->
    <!-- 视图 A: 移动端采购订单卡片流 (Pixel 9 412px 视口适配) -->
    <!-- ============================================== -->
    <div v-if="isAppMode" class="space-y-3" v-loading="loading">
      <div
        v-for="row in pagedOrders"
        :key="row.orderNo"
        class="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5"
      >
        <!-- 头部：订单编号与履约模式 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-bold text-blue-700 text-xs">{{ row.orderNo }}</span>
          </div>
          <el-tag
            size="small"
            :type="row.logisticsMode === 'DISPATCH' ? 'success' : 'warning'"
            effect="light"
          >
            {{ row.logisticsMode === 'DISPATCH' ? $t('agentG2B.modeDispatch') : $t('agentG2B.modePickup') }}
          </el-tag>
        </div>

        <!-- 履约时间与出库状态 -->
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-400 font-mono">{{ row.createdAt }}</span>
          <div>
            <el-tag v-if="row.status === 'PENDING_PAYMENT'" size="small" type="danger" effect="light">
              {{ $t('agentG2B.statusPendingPaymentTag') }}
            </el-tag>
            <el-tag v-else-if="row.status === 'PAID_WMS_PICKING'" size="small" type="primary" effect="dark">
              {{ $t('agentG2B.statusPaidPickingTag') }}
            </el-tag>
            <el-tag v-else-if="row.status === 'IN_TRANSIT'" size="small" type="warning" effect="dark">
              {{ $t('agentG2B.statusInTransitTag') }}
            </el-tag>
            <el-tag v-else size="small" type="success" effect="dark">
              {{ $t('agentG2B.statusCompletedTag') }}
            </el-tag>
          </div>
        </div>

        <!-- 中心仓与车辆 -->
        <div class="p-2 bg-slate-50 rounded-lg text-[11px] space-y-1 border border-slate-100">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 font-medium truncate">{{ row.centerName }}</span>
            <span class="text-slate-400 font-mono">{{ row.deliveryVehicleNo }}</span>
          </div>
          <div class="text-[10px] text-slate-400 flex items-center justify-between">
            <span>{{ $t('agentG2B.timeSlotLabel') }}{{ row.timeSlot }}</span>
            <span v-if="row.pickupVoucherCode" class="text-emerald-600 font-mono font-bold">
              {{ row.pickupVoucherCode }}
            </span>
          </div>
        </div>

        <!-- 采购物资清单 -->
        <div class="space-y-1">
          <div
            v-for="(item, idx) in row.items"
            :key="idx"
            class="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50/70 px-2.5 py-1 rounded border border-slate-100"
          >
            <span class="font-medium truncate max-w-[200px]">{{ item.itemName }}</span>
            <span class="font-mono font-bold text-slate-900">{{ item.qty.toLocaleString() }} {{ item.unit }}</span>
          </div>
        </div>

        <!-- 金额与支付状态 -->
        <div class="pt-1 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-500">{{ $t('agentG2B.colTotalAmount') }}:</span>
            <span class="font-mono font-bold text-sm text-slate-900">
              {{ row.totalAmount.toLocaleString() }} <span class="text-[10px] text-slate-400">IQD</span>
            </span>
          </div>
          <el-tag size="small" :type="row.payStatus === 'PAID' ? 'success' : 'danger'" effect="plain">
            {{ row.payStatus === 'PAID' ? $t('agentG2B.payStatusPaid') : $t('agentG2B.payStatusPending') }}
          </el-tag>
        </div>

        <!-- 操作栏 -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <el-button
            v-if="row.status === 'PENDING_PAYMENT'"
            type="primary"
            size="small"
            class="!h-7 text-xs flex-1 font-bold"
            @click="handlePayOrder(row)"
          >
            {{ $t('agentG2B.btnPayElectronic') }}
          </el-button>

          <el-button
            v-if="row.payStatus === 'PAID'"
            size="small"
            type="success"
            plain
            class="!h-7 text-xs flex-1 font-bold"
            @click="showOrderQRCode(row)"
          >
            <el-icon class="mr-1"><FullScreen /></el-icon>
            {{ $t('agentG2B.btnPickupQR') }}
          </el-button>

          <el-button
            size="small"
            class="!h-7 text-xs"
            @click="viewOrderDetail(row)"
          >
            {{ $t('agentG2B.btnDetail') }}
          </el-button>
        </div>
      </div>

      <div v-if="filteredOrders.length === 0" class="text-center py-8 text-slate-400 text-xs">
        暂无符合条件的采购记录
      </div>
    </div>

    <!-- ============================================== -->
    <!-- 视图 B: 桌面 Web 宽表格视图 (全量国际化绑定) -->
    <!-- ============================================== -->
    <el-table
      v-else
      :data="pagedOrders"
      v-loading="loading"
      border
      style="width: 100%"
      class="text-xs"
    >
      <el-table-column prop="orderNo" :label="$t('agentG2B.colOrderNo')" width="180">
        <template #default="{ row }">
          <div class="font-mono font-bold text-blue-700">{{ row.orderNo }}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">{{ row.createdAt }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colCenterAndMode')" min-width="210">
        <template #default="{ row }">
          <div class="font-bold text-slate-900 flex items-center gap-1.5">
            <span>{{ row.centerName }}</span>
            <el-tag size="small" :type="row.logisticsMode === 'DISPATCH' ? 'success' : 'warning'" effect="light">
              {{ row.logisticsMode === 'DISPATCH' ? $t('agentG2B.modeDispatch') : $t('agentG2B.modePickup') }}
            </el-tag>
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5">{{ $t('agentG2B.timeSlotLabel') }}{{ row.timeSlot }}</div>
          <div class="text-[10px] text-slate-400 font-mono">{{ $t('agentG2B.vehicleNoLabel') }}{{ row.deliveryVehicleNo }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colItemsDetail')" min-width="230">
        <template #default="{ row }">
          <div class="space-y-1">
            <div
              v-for="(item, idx) in row.items"
              :key="idx"
              class="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
            >
              <span>{{ item.itemName }}</span>
              <span class="font-mono font-bold text-slate-900">{{ item.qty.toLocaleString() }} {{ item.unit }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colTotalAmount')" width="160" align="right">
        <template #default="{ row }">
          <div class="font-mono font-bold text-slate-900 text-sm">
            {{ row.totalAmount.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">IQD</span>
          </div>
          <div class="mt-1">
            <el-tag size="small" :type="row.payStatus === 'PAID' ? 'success' : 'danger'" effect="plain">
              {{ row.payStatus === 'PAID' ? $t('agentG2B.payStatusPaid') : $t('agentG2B.payStatusPending') }}
            </el-tag>
          </div>
          <div v-if="row.payTime" class="text-[10px] text-slate-400 mt-0.5">{{ row.payTime.slice(5) }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colStatusTask')" width="160" align="center">
        <template #default="{ row }">
          <div v-if="row.status === 'PENDING_PAYMENT'">
            <el-tag size="small" type="danger" effect="light">{{ $t('agentG2B.statusPendingPaymentTag') }}</el-tag>
            <div class="text-[10px] text-rose-500 mt-0.5">{{ $t('agentG2B.statusPendingPaymentDesc') }}</div>
          </div>
          <div v-else-if="row.status === 'PAID_WMS_PICKING'">
            <el-tag size="small" type="primary" effect="dark">{{ $t('agentG2B.statusPaidPickingTag') }}</el-tag>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ row.wmsTaskId }}</div>
          </div>
          <div v-else-if="row.status === 'IN_TRANSIT'">
            <el-tag size="small" type="warning" effect="dark">{{ $t('agentG2B.statusInTransitTag') }}</el-tag>
            <div class="text-[10px] text-emerald-600 font-mono mt-0.5">{{ $t('agentG2B.statusPickupCode', { code: row.pickupVoucherCode }) }}</div>
          </div>
          <div v-else>
            <el-tag size="small" type="success" effect="dark">{{ $t('agentG2B.statusCompletedTag') }}</el-tag>
            <div class="text-[10px] text-slate-400 mt-0.5">{{ row.completedAt?.slice(5) }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colSmsVoucher')" width="150">
        <template #default="{ row }">
          <div v-if="row.smsNotified" class="space-y-0.5">
            <el-tooltip :content="row.smsContent" placement="top" :width="280">
              <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 cursor-pointer font-semibold">
                <el-icon><ChatLineSquare /></el-icon>
                <span>{{ $t('agentG2B.smsSent') }}</span>
              </span>
            </el-tooltip>
            <div class="font-mono text-[10px] text-slate-500">{{ row.pickupVoucherCode }}</div>
          </div>
          <div v-else class="text-[11px] text-slate-400">{{ $t('agentG2B.smsWaitPayment') }}</div>
        </template>
      </el-table-column>

      <!-- 操作栏提供二维码展示 -->
      <el-table-column :label="$t('agent.colActions')" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            <el-button
              v-if="row.status === 'PENDING_PAYMENT'"
              type="primary"
              size="small"
              @click="handlePayOrder(row)"
            >
              {{ $t('agentG2B.btnPayElectronic') }}
            </el-button>

            <el-button
              v-if="row.payStatus === 'PAID'"
              size="small"
              type="success"
              plain
              @click="showOrderQRCode(row)"
            >
              <el-icon class="mr-1"><FullScreen /></el-icon>
              {{ $t('agentG2B.btnPickupQR') }}
            </el-button>

            <el-button
              size="small"
              type="primary"
              link
              @click="viewOrderDetail(row)"
            >
              {{ $t('agentG2B.btnDetail') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div
      class="flex items-center justify-between text-xs pt-2"
      :class="isAppMode ? 'flex-col gap-2 items-center' : ''"
    >
      <span class="text-slate-500 text-[11px]">
        {{ $t('agentG2B.totalRecords', { count: filteredOrders.length }) }}
      </span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        :layout="isAppMode ? 'prev, pager, next' : 'sizes, prev, pager, next'"
        :total="filteredOrders.length"
        size="small"
      />
    </div>

    <!-- ======================================================== -->
    <!-- 模态框 1: 新建采购弹窗 (自适应移动视口与全量国际化) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="createModalVisible"
      :title="$t('agentG2B.modalCreateTitle')"
      :width="isAppMode ? 'min(94vw, 560px)' : '680px'"
      destroy-on-close
    >
      <div class="space-y-3 sm:space-y-4 text-xs">
        <!-- 顶部提示：单中心物理归属与安全库存约束 -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
          <div class="font-bold flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ $t('agentG2B.quotaConstraintTitle') }}</span>
            </span>
            <el-tag size="small" type="primary" effect="dark" class="scale-90 font-mono">
              {{ $t('agentG2B.quotaHouseholdsLimit') }}
            </el-tag>
          </div>
          <p class="text-[11px] leading-relaxed">
            {{ $t('agentG2B.quotaConstraintDesc', { center: currentCenterName }) }}
          </p>
        </div>

        <!-- 配给中心实时库存看板 -->
        <div class="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <el-icon class="text-blue-600"><OfficeBuilding /></el-icon>
              <span>{{ $t('agentG2B.centerStockTitle', { center: currentCenterName }) }}</span>
            </span>
            <span class="text-[11px] text-slate-400">{{ $t('agentG2B.strategicReserveSub') }}</span>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
            <div class="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div class="text-[10px] text-slate-500">{{ $t('agentG2B.itemFlourTitle') }}</div>
              <div class="font-mono font-bold text-slate-900 text-xs sm:text-base mt-0.5 text-blue-700">
                {{ centerStock.flour.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">KG</span>
              </div>
              <div class="text-[9px] sm:text-[10px] text-emerald-600 mt-0.5 truncate">{{ $t('agentG2B.itemFlourLoc') }}</div>
            </div>

            <div class="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div class="text-[10px] text-slate-500">{{ $t('agentG2B.itemRiceTitle') }}</div>
              <div class="font-mono font-bold text-slate-900 text-xs sm:text-base mt-0.5 text-blue-700">
                {{ centerStock.rice.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">KG</span>
              </div>
              <div class="text-[9px] sm:text-[10px] text-emerald-600 mt-0.5 truncate">{{ $t('agentG2B.itemRiceLoc') }}</div>
            </div>

            <div class="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div class="text-[10px] text-slate-500">{{ $t('agentG2B.itemOilTitle') }}</div>
              <div class="font-mono font-bold text-slate-900 text-xs sm:text-base mt-0.5 text-blue-700">
                {{ centerStock.oil.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">L</span>
              </div>
              <div class="text-[9px] sm:text-[10px] text-emerald-600 mt-0.5 truncate">{{ $t('agentG2B.itemOilLoc') }}</div>
            </div>
          </div>
        </div>

        <!-- 基础配置：物理中心与履约模式 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <span class="block text-slate-600 mb-1 font-semibold">{{ $t('agentG2B.labelPhysicalCenter') }}</span>
            <el-input :value="currentCenterName" readonly class="bg-slate-100 font-bold" />
          </div>
          <div>
            <span class="block text-slate-600 mb-1 font-semibold">{{ $t('agentG2B.labelLogisticsMode') }} <span class="text-rose-500">*</span></span>
            <el-select v-model="form.logisticsMode" class="w-full">
              <el-option :label="$t('agentG2B.modeDispatchOption')" value="DISPATCH" />
              <el-option :label="$t('agentG2B.modePickupOption')" value="PICKUP" />
            </el-select>
          </div>
        </div>

        <!-- 预约履约/到货时间窗口：日期控件 + 时段控件 复合展示 -->
        <div class="p-3 bg-slate-50/70 border border-slate-200/90 rounded-xl space-y-2">
          <div class="font-semibold text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="flex items-center gap-1">
              <el-icon class="text-indigo-600"><Calendar /></el-icon>
              <span>{{ $t('agentG2B.deliveryWindowLabel') }} <span class="text-rose-500">*</span></span>
            </span>
            <span class="text-[11px] text-indigo-700 font-mono">
              {{ $t('agentG2B.selectedTimeLabel', { date: form.deliveryDate || $t('agentG2B.notSelectedDate'), slot: form.deliverySlot || $t('agentG2B.notSelectedSlot') }) }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <span class="block text-slate-500 mb-1">{{ $t('agentG2B.deliveryDateLabel') }}</span>
              <el-date-picker
                v-model="form.deliveryDate"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="$t('agentG2B.deliveryDatePlaceholder')"
                :disabled-date="disabledPastDates"
                class="w-full"
                style="width: 100%"
              />
            </div>
            <div>
              <span class="block text-slate-500 mb-1">{{ $t('agentG2B.deliverySlotLabel') }}</span>
              <el-select v-model="form.deliverySlot" :placeholder="$t('agentG2B.deliverySlotPlaceholder')" class="w-full">
                <el-option :label="$t('agentG2B.slot1')" value="08:00-10:00" />
                <el-option :label="$t('agentG2B.slot2')" value="10:00-12:00" />
                <el-option :label="$t('agentG2B.slot3')" value="14:00-16:00" />
                <el-option :label="$t('agentG2B.slot4')" value="16:00-18:00" />
              </el-select>
            </div>
          </div>

          <div>
            <span class="block text-slate-500 mb-1">{{ $t('agentG2B.vehicleNoInputLabel') }}</span>
            <el-input v-model="form.deliveryVehicleNo" :placeholder="$t('agentG2B.vehicleNoPlaceholder')" />
          </div>
        </div>

        <!-- 订购物资申报区：中心库存与辖区配额双重硬约束 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span>{{ $t('agentG2B.orderItemsTitle') }}</span>
            <span class="text-[11px] text-blue-600 font-mono">
              {{ $t('agentG2B.agentSignedHouseholds') }}
            </span>
          </div>

          <div class="space-y-2.5">
            <!-- 1. 特级面粉 -->
            <div class="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800">{{ $t('agentG2B.flourItemSpec') }}</span>
                <span class="font-mono text-blue-700 font-bold">{{ (form.flourQty * 350).toLocaleString() }} IQD</span>
              </div>
              <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-12 sm:col-span-5">
                  <el-input-number
                    v-model="form.flourQty"
                    :min="0"
                    :max="maxAllowed.flour"
                    :step="500"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="col-span-12 sm:col-span-7 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="text-slate-400">{{ $t('agentG2B.quotaUpperLimit', { limit: agentQuotaLimits.flour.toLocaleString(), unit: 'KG' }) }}</span>
                  <span class="text-slate-400">{{ $t('agentG2B.centerStockUpperLimit', { limit: centerStock.flour.toLocaleString(), unit: 'KG' }) }}</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono origin-left">
                    {{ $t('agentG2B.orderLimitTag', { limit: maxAllowed.flour.toLocaleString(), unit: 'KG' }) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 2. 精制大米 -->
            <div class="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800">{{ $t('agentG2B.riceItemSpec') }}</span>
                <span class="font-mono text-blue-700 font-bold">{{ (form.riceQty * 500).toLocaleString() }} IQD</span>
              </div>
              <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-12 sm:col-span-5">
                  <el-input-number
                    v-model="form.riceQty"
                    :min="0"
                    :max="maxAllowed.rice"
                    :step="500"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="col-span-12 sm:col-span-7 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="text-slate-400">{{ $t('agentG2B.quotaUpperLimit', { limit: agentQuotaLimits.rice.toLocaleString(), unit: 'KG' }) }}</span>
                  <span class="text-slate-400">{{ $t('agentG2B.centerStockUpperLimit', { limit: centerStock.rice.toLocaleString(), unit: 'KG' }) }}</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono origin-left">
                    {{ $t('agentG2B.orderLimitTag', { limit: maxAllowed.rice.toLocaleString(), unit: 'KG' }) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 3. 食用植物油 -->
            <div class="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800">{{ $t('agentG2B.oilItemSpec') }}</span>
                <span class="font-mono text-blue-700 font-bold">{{ (form.oilQty * 1200).toLocaleString() }} IQD</span>
              </div>
              <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-12 sm:col-span-5">
                  <el-input-number
                    v-model="form.oilQty"
                    :min="0"
                    :max="maxAllowed.oil"
                    :step="100"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="col-span-12 sm:col-span-7 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="text-slate-400">{{ $t('agentG2B.quotaUpperLimit', { limit: agentQuotaLimits.oil.toLocaleString(), unit: 'L' }) }}</span>
                  <span class="text-slate-400">{{ $t('agentG2B.centerStockUpperLimit', { limit: centerStock.oil.toLocaleString(), unit: 'L' }) }}</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono origin-left">
                    {{ $t('agentG2B.orderLimitTag', { limit: maxAllowed.oil.toLocaleString(), unit: 'L' }) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800">{{ $t('agentG2B.totalPaymentPayable') }}</span>
            <span class="font-mono text-base font-bold text-blue-700">
              {{ calculatedTotalAmount.toLocaleString() }} IQD
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2" :class="isAppMode ? 'flex-col-reverse' : ''">
          <el-button :class="isAppMode ? 'w-full' : ''" @click="createModalVisible = false">
            {{ $t('common.cancel') }}
          </el-button>
          <el-button type="primary" class="font-bold" :class="isAppMode ? 'w-full !m-0' : ''" @click="handleProceedToPayment">
            {{ $t('agentG2B.btnConfirmPurchaseAndPay', { amount: calculatedTotalAmount.toLocaleString() }) }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 模态框 2: 电子支付弹窗 (CBI-PAY 规费与货款专管结算) -->
    <!-- ======================================================== -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      :title="$t('agentG2B.paymentModalTitle')"
      :amount="pendingOrderAmount"
      :business-no="pendingOrderNo"
      :applicant-name="isEn ? 'Mohammed Jabbar (Station #1)' : '穆罕默德·贾巴尔 (第一配给代销店)'"
      currency="IQD"
      @success="handlePaymentSuccess"
      @cancel="handlePaymentCancel"
    />

    <!-- ======================================================== -->
    <!-- 模态框 3: 提货核验二维码与出库凭证展示弹窗 -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="qrModalVisible"
      :title="$t('agentG2B.qrModalTitle')"
      :width="isAppMode ? 'min(92vw, 420px)' : '460px'"
      align-center
      destroy-on-close
    >
      <div v-if="activeQRRow" class="space-y-3 sm:space-y-4 text-xs text-center">
        <!-- 顶部中心仓与凭证说明 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-[11px]">{{ $t('agentG2B.qrCenterLabel') }}</span>
            <span class="font-bold text-slate-800">{{ activeQRRow.centerName }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-[11px]">{{ $t('agentG2B.qrTimeSlotLabel') }}</span>
            <span class="font-semibold text-blue-700">{{ activeQRRow.timeSlot }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-[11px]">{{ $t('agentG2B.qrVehicleLabel') }}</span>
            <span class="font-mono text-slate-700">{{ activeQRRow.deliveryVehicleNo }} ({{ activeQRRow.logisticsMode === 'DISPATCH' ? $t('agentG2B.modeDispatch') : $t('agentG2B.modePickup') }})</span>
          </div>
        </div>

        <!-- 高清晰度矢量 SVG 二维码展示区 -->
        <div class="p-4 sm:p-5 bg-white border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center space-y-2.5 sm:space-y-3 shadow-inner">
          <div class="relative p-2.5 sm:p-3 bg-white rounded-xl shadow-xs border border-slate-200">
            <!-- 矢量 SVG 二维码图形 -->
            <svg class="w-40 h-40 sm:w-48 sm:h-48" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="160" height="160" fill="#FFFFFF" />

              <rect x="10" y="10" width="36" height="36" rx="4" fill="#0F172A" />
              <rect x="16" y="16" width="24" height="24" rx="2" fill="#FFFFFF" />
              <rect x="22" y="22" width="12" height="12" rx="2" fill="#2563EB" />

              <rect x="114" y="10" width="36" height="36" rx="4" fill="#0F172A" />
              <rect x="120" y="16" width="24" height="24" rx="2" fill="#FFFFFF" />
              <rect x="126" y="22" width="12" height="12" rx="2" fill="#2563EB" />

              <rect x="10" y="114" width="36" height="36" rx="4" fill="#0F172A" />
              <rect x="16" y="120" width="24" height="24" rx="2" fill="#FFFFFF" />
              <rect x="22" y="126" width="12" height="12" rx="2" fill="#2563EB" />

              <g fill="#1E293B">
                <rect x="52" y="12" width="6" height="6" rx="1" />
                <rect x="64" y="12" width="6" height="6" rx="1" />
                <rect x="76" y="12" width="6" height="6" rx="1" />
                <rect x="88" y="12" width="6" height="6" rx="1" />
                <rect x="100" y="12" width="6" height="6" rx="1" />
                
                <rect x="58" y="22" width="6" height="6" rx="1" />
                <rect x="70" y="22" width="6" height="6" rx="1" />
                <rect x="94" y="22" width="6" height="6" rx="1" />

                <rect x="52" y="32" width="6" height="6" rx="1" />
                <rect x="64" y="32" width="6" height="6" rx="1" />
                <rect x="82" y="32" width="6" height="6" rx="1" />
                <rect x="100" y="32" width="6" height="6" rx="1" />

                <rect x="12" y="52" width="6" height="6" rx="1" />
                <rect x="24" y="52" width="6" height="6" rx="1" />
                <rect x="36" y="52" width="6" height="6" rx="1" />
                <rect x="48" y="52" width="6" height="6" rx="1" />
                <rect x="60" y="52" width="6" height="6" rx="1" />
                <rect x="72" y="52" width="6" height="6" rx="1" />
                <rect x="84" y="52" width="6" height="6" rx="1" />
                <rect x="96" y="52" width="6" height="6" rx="1" />
                <rect x="108" y="52" width="6" height="6" rx="1" />
                <rect x="120" y="52" width="6" height="6" rx="1" />
                <rect x="132" y="52" width="6" height="6" rx="1" />
                <rect x="144" y="52" width="6" height="6" rx="1" />

                <rect x="18" y="64" width="6" height="6" rx="1" />
                <rect x="30" y="64" width="6" height="6" rx="1" />
                <rect x="54" y="64" width="6" height="6" rx="1" />
                <rect x="90" y="64" width="6" height="6" rx="1" />
                <rect x="114" y="64" width="6" height="6" rx="1" />
                <rect x="138" y="64" width="6" height="6" rx="1" />

                <rect x="12" y="76" width="6" height="6" rx="1" />
                <rect x="42" y="76" width="6" height="6" rx="1" />
                <rect x="66" y="76" width="6" height="6" rx="1" />
                <rect x="78" y="76" width="6" height="6" rx="1" />
                <rect x="102" y="76" width="6" height="6" rx="1" />
                <rect x="126" y="76" width="6" height="6" rx="1" />
                <rect x="144" y="76" width="6" height="6" rx="1" />

                <rect x="52" y="88" width="6" height="6" rx="1" />
                <rect x="64" y="88" width="6" height="6" rx="1" />
                <rect x="88" y="88" width="6" height="6" rx="1" />
                <rect x="100" y="88" width="6" height="6" rx="1" />
                <rect x="112" y="88" width="6" height="6" rx="1" />
                <rect x="136" y="88" width="6" height="6" rx="1" />

                <rect x="12" y="100" width="6" height="6" rx="1" />
                <rect x="36" y="100" width="6" height="6" rx="1" />
                <rect x="60" y="100" width="6" height="6" rx="1" />
                <rect x="84" y="100" width="6" height="6" rx="1" />
                <rect x="108" y="100" width="6" height="6" rx="1" />
                <rect x="132" y="100" width="6" height="6" rx="1" />

                <rect x="52" y="114" width="6" height="6" rx="1" />
                <rect x="76" y="114" width="6" height="6" rx="1" />
                <rect x="100" y="114" width="6" height="6" rx="1" />
                <rect x="124" y="114" width="6" height="6" rx="1" />
                <rect x="144" y="114" width="6" height="6" rx="1" />

                <rect x="64" y="126" width="6" height="6" rx="1" />
                <rect x="88" y="126" width="6" height="6" rx="1" />
                <rect x="112" y="126" width="6" height="6" rx="1" />
                <rect x="136" y="126" width="6" height="6" rx="1" />

                <rect x="52" y="138" width="6" height="6" rx="1" />
                <rect x="76" y="138" width="6" height="6" rx="1" />
                <rect x="94" y="138" width="6" height="6" rx="1" />
                <rect x="118" y="138" width="6" height="6" rx="1" />
                <rect x="142" y="138" width="6" height="6" rx="1" />
              </g>

              <rect x="65" y="65" width="30" height="30" rx="6" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="2" />
              <text x="80" y="83" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">RCM</text>
            </svg>
          </div>

          <div class="space-y-1">
            <span class="text-[11px] text-slate-500 block">{{ $t('agentG2B.qrCodeNoLabel') }}</span>
            <div class="font-mono text-base font-extrabold text-blue-700 tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {{ activeQRRow.pickupVoucherCode }}
            </div>
          </div>
          <span class="text-[10px] text-slate-400">{{ $t('agentG2B.qrScanHint') }}</span>
        </div>

        <!-- 采购明细与金额汇总 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-left">
          <div class="flex justify-between items-center font-semibold text-slate-700">
            <span>{{ $t('agentG2B.qrOrderNoLabel') }}</span>
            <span class="font-mono text-slate-900">{{ activeQRRow.orderNo }}</span>
          </div>
          <div class="flex justify-between items-center font-semibold text-slate-700">
            <span>{{ $t('agentG2B.qrPaidAmountLabel') }}</span>
            <span class="font-mono text-emerald-700 font-bold">{{ $t('agentG2B.qrPaidAmountVal', { amount: activeQRRow.totalAmount.toLocaleString() }) }}</span>
          </div>
          <div class="pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
            {{ $t('agentG2B.qrIncludeItems') }}
            <span v-for="(it, i) in activeQRRow.items" :key="i" class="mr-2">
              {{ it.itemName }}: <strong>{{ it.qty }}{{ it.unit }}</strong>
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2" :class="isAppMode ? 'grid grid-cols-2 gap-2' : ''">
          <el-button :class="isAppMode ? 'w-full' : ''" @click="copyPickupCode">
            {{ $t('agentG2B.btnCopyCode') }}
          </el-button>
          <el-button type="primary" :class="isAppMode ? 'w-full !m-0' : ''" @click="handlePrintVoucher">
            {{ $t('agentG2B.btnPrintVoucher') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  ChatLineSquare,
  InfoFilled,
  FullScreen,
  OfficeBuilding,
  Calendar,
  Van,
  Box,
  Location,
  Tickets
} from '@element-plus/icons-vue';
import { getG2BPurchaseOrders, createG2BPurchaseOrder } from '../../../api/agent.js';
import ElectronicPaymentDialog from '../../../components/common/ElectronicPaymentDialog.vue';

const { t, locale } = useI18n();
const route = useRoute();
const isEn = computed(() => locale.value === 'en');
const isAppMode = computed(() => {
  return route.query.layout === 'app' ||
    sessionStorage.getItem('rcm_layout_mode') === 'app' ||
    window.innerWidth <= 768;
});

const loading = ref(false);
const orders = ref([]);
const searchKeyword = ref('');
const statusFilter = ref('UNFINISHED'); // 默认显示未完成的采购记录
const currentPage = ref(1);
const pageSize = ref(10);

const createModalVisible = ref(false);
const paymentDialogVisible = ref(false);
const qrModalVisible = ref(false);
const activeQRRow = ref(null);

const currentCenterName = '卡尔赫第一配给中心 (曼苏尔)';

// 1. 配给中心（中心仓）实时可用库存数据 (需求 2)
const centerStock = ref({
  flour: 92400, // 卡尔赫战略储备仓
  rice: 184500, // 国家第一储备粮库
  oil: 34100 // 液体储罐温控库
});

// 2. 代理辖区签约户数与标准配额安全冗余 (1.2倍冗余系数，硬上限1500户)
const householdsCount = ref(1120);
const safetyFactor = 1.2;

// 各品类户均基础配额 (单户每月公斤/升数)
const householdQuota = {
  flour: 9, // KG/户
  rice: 4.5, // KG/户
  oil: 1.2 // L/户
};

// 代理辖区额度上限计算
const agentQuotaLimits = computed(() => ({
  flour: Math.floor(householdsCount.value * householdQuota.flour * safetyFactor), // 12,096 KG
  rice: Math.floor(householdsCount.value * householdQuota.rice * safetyFactor), // 6,048 KG
  oil: Math.floor(householdsCount.value * householdQuota.oil * safetyFactor) // 1,612 L
}));

// 双重硬约束上限：既不能超过代理户数额度限制，也不能超过中心仓实时库存 (需求 2)
const maxAllowed = computed(() => ({
  flour: Math.min(agentQuotaLimits.value.flour, centerStock.value.flour),
  rice: Math.min(agentQuotaLimits.value.rice, centerStock.value.rice),
  oil: Math.min(agentQuotaLimits.value.oil, centerStock.value.oil)
}));

// 待提交采购单暂存数据
const pendingOrderNo = ref('');
const pendingOrderAmount = ref(0);
const pendingPayload = ref(null);

// 复合履约窗口：日期控件 + 时段控件
const disabledPastDates = (time) => {
  return time.getTime() < Date.now() - 8.64e7;
};

const form = ref({
  logisticsMode: 'DISPATCH',
  deliveryDate: '2026-10-14',
  deliverySlot: '08:00 - 10:00 (早间第一批)',
  deliveryVehicleNo: 'BAG-TRK-7841',
  flourQty: 5000,
  riceQty: 2500,
  oilQty: 600
});

const calculatedTotalAmount = computed(() => {
  return (Number(form.value.flourQty) || 0) * 350 +
    (Number(form.value.riceQty) || 0) * 500 +
    (Number(form.value.oilQty) || 0) * 1200;
});

// 核心修复：兼容 Axios 响应拦截器解包或未解包格式 (需求 3)
const loadOrders = async () => {
  loading.value = true;
  try {
    const res = await getG2BPurchaseOrders();
    const list = Array.isArray(res) ? res : (res?.data || []);
    orders.value = list;
  } catch (error) {
    ElMessage.error(t('agentG2B.loadOrdersError') || '加载采购订单失败');
  } finally {
    loading.value = false;
  }
};

// 列表过滤逻辑：默认显示未完成的采购记录 (需求 3)
const filteredOrders = computed(() => {
  let list = [...orders.value];

  if (statusFilter.value === 'UNFINISHED') {
    // 默认显示未完成：非 COMPLETED
    list = list.filter((o) => o.status !== 'COMPLETED');
  } else if (statusFilter.value && statusFilter.value !== '全部') {
    list = list.filter((o) => o.status === statusFilter.value);
  }

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase().trim();
    list = list.filter(
      (o) =>
        (o.orderNo && o.orderNo.toLowerCase().includes(kw)) ||
        (o.pickupVoucherCode && o.pickupVoucherCode.toLowerCase().includes(kw)) ||
        (o.centerName && o.centerName.toLowerCase().includes(kw))
    );
  }
  return list;
});

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredOrders.value.slice(start, start + pageSize.value);
});

const handleFilter = () => {
  currentPage.value = 1;
};

const openCreateModal = () => {
  form.value = {
    logisticsMode: 'DISPATCH',
    deliveryDate: '2026-10-14',
    deliverySlot: '08:00 - 10:00 (早间第一批)',
    deliveryVehicleNo: 'BAG-TRK-7841',
    flourQty: Math.min(5000, maxAllowed.value.flour),
    riceQty: Math.min(2500, maxAllowed.value.rice),
    oilQty: Math.min(600, maxAllowed.value.oil)
  };
  createModalVisible.value = true;
};

// 1. 提交采购记录前，进行双重上限强校验并进入电子支付环节 (需求 2)
const handleProceedToPayment = () => {
  // 1. 时间窗口校验
  if (!form.value.deliveryDate || !form.value.deliverySlot) {
    ElMessage.warning(t('agentG2B.selectDateTimeWarning') || '请完整选择预约履约/到货日期与时段窗口');
    return;
  }

  // 2. 数量非空校验
  if (form.value.flourQty <= 0 && form.value.riceQty <= 0 && form.value.oilQty <= 0) {
    ElMessage.warning(t('agentG2B.atLeastOneItemWarning') || '请至少填报一项采购物资数量');
    return;
  }

  // 3. 面粉双重上限校验
  if (form.value.flourQty > maxAllowed.value.flour) {
    ElMessage.warning(
      t('agentG2B.exceedFlourLimitWarning') || `特级面粉订购量超过可订上限！`
    );
    return;
  }

  // 4. 大米双重上限校验
  if (form.value.riceQty > maxAllowed.value.rice) {
    ElMessage.warning(
      t('agentG2B.exceedRiceLimitWarning') || `精制大米订购量超过可订上限！`
    );
    return;
  }

  // 5. 食用油双重上限校验
  if (form.value.oilQty > maxAllowed.value.oil) {
    ElMessage.warning(
      t('agentG2B.exceedOilLimitWarning') || `食用植物油订购量超过可订上限！`
    );
    return;
  }

  const compositeTimeSlot = `${form.value.deliveryDate} ${form.value.deliverySlot}`;
  pendingOrderAmount.value = calculatedTotalAmount.value;
  pendingOrderNo.value = `ORD-${Date.now().toString().slice(-8)}`;

  pendingPayload.value = {
    agentId: 'FA-00128',
    centerId: '101',
    logisticsMode: form.value.logisticsMode,
    timeSlot: compositeTimeSlot,
    deliveryVehicleNo: form.value.deliveryVehicleNo,
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: isEn.value ? 'Standard Wheat Flour' : '优质特级面粉 (标准白面)', qty: form.value.flourQty, unit: 'KG', unitPrice: 350, subtotal: form.value.flourQty * 350 },
      { itemCode: 'RICE-BAS-01', itemName: isEn.value ? 'Refined Basmati Rice' : '精制大米 (巴斯马蒂一等品)', qty: form.value.riceQty, unit: 'KG', unitPrice: 500, subtotal: form.value.riceQty * 500 },
      { itemCode: 'OIL-SUN-03', itemName: isEn.value ? 'Refined Vegetable Oil' : '精炼食用植物油 (葵花籽配方)', qty: form.value.oilQty, unit: 'L', unitPrice: 1200, subtotal: form.value.oilQty * 1200 }
    ],
    isPaid: true,
    payStatus: 'PAID',
    payChannel: 'PUBLIC_TREASURY_ACCOUNT'
  };

  createModalVisible.value = false;
  paymentDialogVisible.value = true;
};

// 2. 电子支付成功回调：列表增加一条采购记录并刷新，且弹出二维码 (需求 3)
const handlePaymentSuccess = async () => {
  paymentDialogVisible.value = false;
  loading.value = true;
  try {
    const res = await createG2BPurchaseOrder(pendingPayload.value);
    const newOrder = res?.data || res;
    ElMessage.success(t('agentG2B.paymentSuccessMsg') || '采购货款电子支付成功！采购记录已新增入库。');

    // 本地优先追加，确保列表即时呈现
    if (newOrder && newOrder.orderNo) {
      const idx = orders.value.findIndex((o) => o.orderNo === newOrder.orderNo);
      if (idx >= 0) {
        orders.value[idx] = newOrder;
      } else {
        orders.value.unshift(newOrder);
      }
    }

    // 重新加载服务器列表
    await loadOrders();

    // 弹出展示该新增订单的出库二维码
    if (newOrder && newOrder.orderNo) {
      showOrderQRCode(newOrder);
    }
  } catch (error) {
    ElMessage.error(error.message || (t('agentG2B.generateOrderError') || '生成采购订单异常'));
  } finally {
    loading.value = false;
  }
};

const handlePaymentCancel = () => {
  paymentDialogVisible.value = false;
  ElMessage.info(t('agentG2B.cancelPaymentMsg') || '已取消电子支付，采购单未提交。');
};

// 3. 点击操作栏展示二维码
const showOrderQRCode = (row) => {
  activeQRRow.value = row;
  qrModalVisible.value = true;
};

const copyPickupCode = () => {
  if (activeQRRow.value) {
    navigator.clipboard?.writeText(activeQRRow.value.pickupVoucherCode);
    ElMessage.success(t('agentG2B.codeCopiedMsg', { code: activeQRRow.value.pickupVoucherCode }) || `提货码已复制！`);
  }
};

const handlePrintVoucher = () => {
  ElMessage.success(t('agentG2B.printTaskSentMsg') || '出库提货凭证打印任务已发送至本地打印机');
};

const handlePayOrder = (row) => {
  pendingOrderAmount.value = row.totalAmount;
  pendingOrderNo.value = row.orderNo;
  paymentDialogVisible.value = true;
};

const viewOrderDetail = (row) => {
  showOrderQRCode(row);
};

onMounted(() => {
  loadOrders();
});
</script>
