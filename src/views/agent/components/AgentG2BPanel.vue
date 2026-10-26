<template>
  <div class="agent-g2b-panel" :class="isAppMode ? 'space-y-3' : 'space-y-4'">
    <!-- 筛选工具栏与新建采购按钮 -->
    <div class="grid gap-2.5 rounded-lg border border-[#D9E5DB]/80 bg-[#F3F8F4] p-3 text-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div class="grid min-w-0 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('agentG2B.searchPlaceholder')"
          clearable
          size="small"
          class="w-full"
          @input="handleFilter"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <el-select
            v-model="statusFilter"
            size="small"
            class="w-full"
            :aria-label="$t('agentDelivery.filterStatus')"
            @change="handleFilter"
          >
            <el-option :label="$t('agentG2B.filterUnfinished')" value="UNFINISHED" />
            <el-option :label="$t('agentG2B.filterAll')" value="全部" />
            <el-option :label="$t('agentG2B.filterPendingPayment')" value="PENDING_PAYMENT" />
            <el-option :label="$t('agentG2B.filterPaidPicking')" value="PAID_WMS_PICKING" />
            <el-option :label="$t('agentG2B.filterInTransit')" value="IN_TRANSIT" />
            <el-option :label="$t('agentG2B.filterCompleted')" value="COMPLETED" />
          </el-select>

          <el-button size="small" type="primary" plain class="!m-0 !h-8 !w-9" :aria-label="$t('agentDelivery.refreshList')" :title="$t('agentDelivery.refreshList')" @click="loadOrders">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 新建采购按钮 -->
      <el-button
        type="primary"
        size="small"
        class="!m-0 !h-8 w-full shrink-0 font-bold shadow-xs sm:w-auto"
        v-if="!allAgents"
        @click="openCreateModal"
      >
        <el-icon class="me-1"><Plus /></el-icon>
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
        class="p-3.5 bg-white rounded-lg border border-[#D9E5DB]/80 shadow-2xs space-y-2.5"
      >
        <!-- 头部：订单编号与履约模式 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-bold text-[#2A5440] text-xs">{{ row.orderNo }}</span>
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
          <span class="text-[#8A9A8F] font-mono">{{ row.createdAt }}</span>
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

        <!-- 中心仓与车辆 (国际化绑定) -->
        <div class="p-2 bg-[#F3F8F4] rounded-lg text-[11px] space-y-1 border border-[#E9F1EB]">
          <div class="flex items-center justify-between">
            <span class="text-[#58685D] font-medium truncate">{{ formatG2BCenterName(row.centerName) }}</span>
            <span class="text-[#8A9A8F] font-mono">{{ row.deliveryVehicleNo }}</span>
          </div>
          <div class="text-[10px] text-[#8A9A8F] flex items-center justify-between">
            <span>{{ $t('agentG2B.timeSlotLabel') }}{{ formatG2BTimeSlot(row.timeSlot) }}</span>
            <span v-if="row.pickupVoucherCode" class="text-[#2F7A50] font-mono font-bold">
              {{ row.pickupVoucherCode }}
            </span>
          </div>
        </div>

        <!-- 采购物资清单 (国际化绑定) -->
        <div class="space-y-1">
          <div
            v-for="(item, idx) in row.items"
            :key="idx"
            class="flex items-center justify-between text-[11px] text-[#43554B] bg-[#F3F8F4]/70 px-2.5 py-1 rounded border border-[#E9F1EB]"
          >
            <span class="font-medium truncate max-w-[200px]">{{ formatG2BItemName(item.itemName) }}</span>
            <span class="font-mono font-bold text-[#1B3123]">{{ item.qty.toLocaleString() }} {{ formatG2BUnit(item.unit) }}</span>
          </div>
        </div>

        <!-- 金额与支付状态 -->
        <div class="pt-1 border-t border-[#E9F1EB] flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-[#58685D]">{{ $t('agentG2B.colTotalAmount') }}:</span>
            <span class="font-mono font-bold text-sm text-[#1B3123]">
              {{ row.totalAmount.toLocaleString() }} <span class="text-[10px] text-[#8A9A8F]">IQD</span>
            </span>
          </div>
          <el-tag size="small" :type="row.payStatus === 'PAID' ? 'success' : 'danger'" effect="plain">
            {{ row.payStatus === 'PAID' ? $t('agentG2B.payStatusPaid') : $t('agentG2B.payStatusPending') }}
          </el-tag>
        </div>

        <!-- 操作栏 -->
        <div class="pt-2 border-t border-[#E9F1EB] flex items-center justify-end gap-2">
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
            <el-icon class="me-1"><FullScreen /></el-icon>
            {{ $t('agentG2B.btnPickupQR') }}
          </el-button>

          <el-button v-if="canReceive(row)" size="small" type="primary" plain @click="confirmReceive(row)">{{ $t('agentProcurement.receipt') }}</el-button>
          <el-button
            size="small"
            class="!h-7 text-xs"
            @click="viewOrderDetail(row)"
          >
            {{ $t('agentG2B.btnDetail') }}
          </el-button>
        </div>
      </div>

      <div v-if="filteredOrders.length === 0" class="text-center py-8 text-[#8A9A8F] text-xs">
        {{ $t('agentG2B.noOrders') || '暂无符合条件的采购记录' }}
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
          <div class="font-mono font-bold text-[#2A5440]">{{ row.orderNo }}</div>
          <div class="text-[10px] text-[#8A9A8F] mt-0.5">{{ row.createdAt }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colCenterAndMode')" min-width="210">
        <template #default="{ row }">
          <div class="font-bold text-[#1B3123] flex items-center gap-1.5">
            <span>{{ formatG2BCenterName(row.centerName) }}</span>
            <el-tag size="small" :type="row.logisticsMode === 'DISPATCH' ? 'success' : 'warning'" effect="light">
              {{ row.logisticsMode === 'DISPATCH' ? $t('agentG2B.modeDispatch') : $t('agentG2B.modePickup') }}
            </el-tag>
          </div>
          <div class="text-[11px] text-[#58685D] mt-0.5">{{ $t('agentG2B.timeSlotLabel') }}{{ formatG2BTimeSlot(row.timeSlot) }}</div>
          <div class="text-[10px] text-[#8A9A8F] font-mono">{{ $t('agentG2B.vehicleNoLabel') }}{{ row.deliveryVehicleNo }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colItemsDetail')" min-width="230">
        <template #default="{ row }">
          <div class="space-y-1">
            <div
              v-for="(item, idx) in row.items"
              :key="idx"
              class="flex items-center justify-between text-[11px] text-[#43554B] bg-[#F3F8F4] px-2 py-0.5 rounded border border-[#E9F1EB]"
            >
              <span>{{ formatG2BItemName(item.itemName) }}</span>
              <span class="font-mono font-bold text-[#1B3123]">{{ item.qty.toLocaleString() }} {{ formatG2BUnit(item.unit) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colTotalAmount')" width="130" align="right">
        <template #default="{ row }">
          <div class="font-mono font-bold text-[#1B3123] text-sm">
            {{ row.totalAmount.toLocaleString() }} <span class="text-[10px] font-normal text-[#58685D]">IQD</span>
          </div>
          <div class="mt-1">
            <el-tooltip :content="row.payStatus === 'PAID' ? $t('agentG2B.payStatusPaid') : $t('agentG2B.payStatusPending')" placement="top">
              <el-tag size="small" :type="row.payStatus === 'PAID' ? 'success' : 'danger'" effect="plain">
                {{ row.payStatus === 'PAID' ? $t('agentG2B.payStatusPaidShort') : $t('agentG2B.payStatusPendingShort') }}
              </el-tag>
            </el-tooltip>
          </div>
          <div v-if="row.payTime" class="text-[10px] text-[#8A9A8F] mt-0.5">{{ row.payTime.slice(5) }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colStatusTask')" width="130" align="center">
        <template #default="{ row }">
          <div v-if="row.status === 'PENDING_PAYMENT'">
            <el-tooltip :content="$t('agentG2B.statusPendingPaymentTag') + ' · ' + $t('agentG2B.statusPendingPaymentDesc')" placement="top">
              <el-tag size="small" type="danger" effect="light">{{ $t('agentG2B.statusShortPending') }}</el-tag>
            </el-tooltip>
          </div>
          <div v-else-if="row.status === 'PAID_WMS_PICKING'">
            <el-tooltip :content="$t('agentG2B.statusPaidPickingTag')" placement="top">
              <el-tag size="small" type="primary" effect="dark">{{ $t('agentG2B.statusShortPicking') }}</el-tag>
            </el-tooltip>
            <div class="text-[10px] text-[#8A9A8F] font-mono mt-0.5">{{ row.wmsTaskId }}</div>
          </div>
          <div v-else-if="row.status === 'IN_TRANSIT'">
            <el-tooltip :content="$t('agentG2B.statusInTransitTag') + ' · ' + $t('agentG2B.statusPickupCode', { code: row.pickupVoucherCode })" placement="top">
              <el-tag size="small" type="warning" effect="dark">{{ $t('agentG2B.statusShortInTransit') }}</el-tag>
            </el-tooltip>
          </div>
          <div v-else>
            <el-tooltip :content="$t('agentG2B.statusCompletedTag')" placement="top">
              <el-tag size="small" type="success" effect="dark">{{ $t('agentG2B.statusShortCompleted') }}</el-tag>
            </el-tooltip>
            <div class="text-[10px] text-[#8A9A8F] mt-0.5">{{ row.completedAt?.slice(5) }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('agentG2B.colSmsVoucher')" width="150">
        <template #default="{ row }">
          <div v-if="row.smsNotified" class="space-y-0.5">
            <el-tooltip :content="row.smsContent" placement="top" :width="280">
              <span class="inline-flex items-center gap-1 text-[11px] text-[#2F5B44] cursor-pointer font-semibold">
                <el-icon><ChatLineSquare /></el-icon>
                <span>{{ $t('agentG2B.smsSent') }}</span>
              </span>
            </el-tooltip>
            <div class="font-mono text-[10px] text-[#58685D]">{{ row.pickupVoucherCode }}</div>
          </div>
          <div v-else class="text-[11px] text-[#8A9A8F]">{{ $t('agentG2B.smsWaitPayment') }}</div>
        </template>
      </el-table-column>

      <!-- 操作栏提供二维码展示 (图标按钮 + tooltip) -->
      <el-table-column :label="$t('agent.colActions')" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-1">
            <el-tooltip v-if="row.status === 'PENDING_PAYMENT'" :content="$t('agentG2B.btnPayElectronic')" placement="top">
              <el-button type="primary" size="small" circle @click="handlePayOrder(row)">
                <el-icon><Money /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip v-if="row.payStatus === 'PAID'" :content="$t('agentG2B.btnPickupQR')" placement="top">
              <el-button size="small" type="success" plain circle @click="showOrderQRCode(row)">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip v-if="canReceive(row)" :content="$t('agentProcurement.receipt')" placement="top"><el-button size="small" type="primary" plain circle :aria-label="$t('agentProcurement.receipt')" @click="confirmReceive(row)"><el-icon><Box /></el-icon></el-button></el-tooltip>
            <el-tooltip :content="$t('agentG2B.btnDetail')" placement="top">
              <el-button size="small" type="primary" plain circle @click="viewOrderDetail(row)">
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div
      class="flex items-center justify-between text-xs pt-2"
      :class="isAppMode ? 'flex-col gap-2 items-center' : ''"
    >
      <span class="text-[#58685D] text-[11px]">
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
        <div class="p-3 bg-[#EFF5F1] border border-[#C7DED0] rounded-lg text-[#1F3326] space-y-1">
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
            {{ $t('agentG2B.quotaConstraintDesc', { center: formatG2BCenterName(currentCenterName) }) }}
          </p>
        </div>

        <!-- 配给中心实时库存看板 -->
        <div class="p-3 bg-[#F3F8F4]/80 border border-[#D9E5DB] rounded-lg space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-[#1F3326] flex items-center gap-1.5">
              <el-icon class="text-[#326445]"><OfficeBuilding /></el-icon>
              <span>{{ $t('agentG2B.centerStockTitle', { center: currentCenterName }) }}</span>
            </span>
            <span class="text-[11px] text-[#8A9A8F]">{{ $t('agentG2B.strategicReserveSub') }}</span>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
            <div class="p-2 sm:p-2.5 bg-white rounded-lg border border-[#D9E5DB] shadow-2xs">
              <div class="text-[10px] text-[#58685D]">{{ $t('agentG2B.itemFlourTitle') }}</div>
              <div class="font-mono font-bold text-[#1B3123] text-xs sm:text-base mt-0.5 text-[#2A5440]">
                {{ stockText(centerStock.flour) }} <span v-if="centerStock.flour != null" class="text-[10px] font-normal text-[#58685D]">KG</span>
              </div>
              <div class="text-[9px] sm:text-[10px] text-[#2F7A50] mt-0.5 truncate">{{ centerStock.flour == null ? $t('agentDelivery.stockUnavailable') : $t('agentG2B.itemFlourLoc') }}</div>
            </div>

            <div class="p-2 sm:p-2.5 bg-white rounded-lg border border-[#D9E5DB] shadow-2xs">
              <div class="text-[10px] text-[#58685D]">{{ $t('agentG2B.itemRiceTitle') }}</div>
              <div class="font-mono font-bold text-[#1B3123] text-xs sm:text-base mt-0.5 text-[#2A5440]">
                {{ stockText(centerStock.rice) }} <span v-if="centerStock.rice != null" class="text-[10px] font-normal text-[#58685D]">KG</span>
              </div>
              <div class="text-[9px] sm:text-[10px] text-[#2F7A50] mt-0.5 truncate">{{ centerStock.rice == null ? $t('agentDelivery.stockUnavailable') : $t('agentG2B.itemRiceLoc') }}</div>
            </div>

            <div class="p-2 sm:p-2.5 bg-white rounded-lg border border-[#D9E5DB] shadow-2xs">
              <div class="text-[10px] text-[#58685D]">{{ $t('agentG2B.itemOilTitle') }}</div>
              <div class="font-mono font-bold text-[#1B3123] text-xs sm:text-base mt-0.5 text-[#2A5440]">
                {{ stockText(centerStock.oil) }} <span v-if="centerStock.oil != null" class="text-[10px] font-normal text-[#58685D]">L</span>
              </div>
              <div class="text-[9px] sm:text-[10px] text-[#2F7A50] mt-0.5 truncate">{{ centerStock.oil == null ? $t('agentDelivery.stockUnavailable') : $t('agentG2B.itemOilLoc') }}</div>
            </div>
          </div>
        </div>

        <!-- 基础配置：物理中心与履约模式 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agentG2B.labelPhysicalCenter') }}</span>
            <el-input :value="currentCenterName" readonly class="bg-[#E9F1EB] font-bold" />
          </div>
          <div>
            <span class="block text-[#58685D] mb-1 font-semibold">{{ $t('agentG2B.labelLogisticsMode') }} <span class="text-[#C04442]">*</span></span>
            <el-select v-model="form.logisticsMode" class="w-full">
              <el-option :label="$t('agentG2B.modeDispatchOption')" value="DISPATCH" />
              <el-option :label="$t('agentG2B.modePickupOption')" value="PICKUP" />
            </el-select>
          </div>
        </div>

        <!-- 预约履约/到货时间窗口：日期控件 + 时段控件 复合展示 -->
        <div class="p-3 bg-[#F3F8F4]/70 border border-[#D9E5DB]/90 rounded-lg space-y-2">
          <div class="font-semibold text-[#43554B] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="flex items-center gap-1">
              <el-icon class="text-[#326445]"><Calendar /></el-icon>
              <span>{{ $t('agentG2B.deliveryWindowLabel') }} <span class="text-[#C04442]">*</span></span>
            </span>
            <span class="text-[11px] text-[#2A5440] font-mono">
              {{ $t('agentG2B.selectedTimeLabel', { date: form.deliveryDate || $t('agentG2B.notSelectedDate'), slot: form.deliverySlot ? formatSlotValue(form.deliverySlot) : $t('agentG2B.notSelectedSlot') }) }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <span class="block text-[#58685D] mb-1">{{ $t('agentG2B.deliveryDateLabel') }}</span>
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
              <span class="block text-[#58685D] mb-1">{{ $t('agentG2B.deliverySlotLabel') }}</span>
              <el-select v-model="form.deliverySlot" :placeholder="$t('agentG2B.deliverySlotPlaceholder')" class="w-full">
                <el-option :label="$t('agentG2B.slot1')" value="08:00-10:00" />
                <el-option :label="$t('agentG2B.slot2')" value="10:00-12:00" />
                <el-option :label="$t('agentG2B.slot3')" value="14:00-16:00" />
                <el-option :label="$t('agentG2B.slot4')" value="16:00-18:00" />
              </el-select>
            </div>
          </div>

          <div>
            <span class="block text-[#58685D] mb-1">{{ $t('agentG2B.vehicleNoInputLabel') }}</span>
            <el-input v-model="form.deliveryVehicleNo" :placeholder="$t('agentG2B.vehicleNoPlaceholder')" />
          </div>
        </div>

        <!-- 订购物资申报区：中心库存与辖区配额双重硬约束 -->
        <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] space-y-2.5">
          <div class="flex items-center justify-between font-bold text-[#1F3326]">
            <span>{{ $t('agentG2B.orderItemsTitle') }}</span>
            <span class="text-[11px] text-[#326445] font-mono">
              {{ $t('agentG2B.agentSignedHouseholds') }}
            </span>
          </div>

          <div class="space-y-2.5">
            <!-- 1. 特级面粉 -->
            <div class="p-2.5 bg-white rounded-lg border border-[#D9E5DB] space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-[#1F3326]">{{ $t('agentG2B.flourItemSpec') }}</span>
                <span class="font-mono text-[#2A5440] font-bold">{{ (form.flourQty * 350).toLocaleString() }} IQD</span>
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
                <div class="col-span-12 sm:col-span-7 text-[10px] sm:text-[11px] text-[#58685D] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="text-[#8A9A8F]">{{ $t('agentG2B.quotaUpperLimit', { limit: agentQuotaLimits.flour.toLocaleString(), unit: 'KG' }) }}</span>
                  <span v-if="centerStock.flour != null" class="text-[#8A9A8F]">{{ $t('agentG2B.centerStockUpperLimit', { limit: centerStock.flour.toLocaleString(), unit: 'KG' }) }}</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono origin-left rtl:origin-right">
                    {{ $t('agentG2B.orderLimitTag', { limit: maxAllowed.flour.toLocaleString(), unit: 'KG' }) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 2. 精制大米 -->
            <div class="p-2.5 bg-white rounded-lg border border-[#D9E5DB] space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-[#1F3326]">{{ $t('agentG2B.riceItemSpec') }}</span>
                <span class="font-mono text-[#2A5440] font-bold">{{ (form.riceQty * 500).toLocaleString() }} IQD</span>
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
                <div class="col-span-12 sm:col-span-7 text-[10px] sm:text-[11px] text-[#58685D] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="text-[#8A9A8F]">{{ $t('agentG2B.quotaUpperLimit', { limit: agentQuotaLimits.rice.toLocaleString(), unit: 'KG' }) }}</span>
                  <span v-if="centerStock.rice != null" class="text-[#8A9A8F]">{{ $t('agentG2B.centerStockUpperLimit', { limit: centerStock.rice.toLocaleString(), unit: 'KG' }) }}</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono origin-left rtl:origin-right">
                    {{ $t('agentG2B.orderLimitTag', { limit: maxAllowed.rice.toLocaleString(), unit: 'KG' }) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 3. 食用植物油 -->
            <div class="p-2.5 bg-white rounded-lg border border-[#D9E5DB] space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-[#1F3326]">{{ $t('agentG2B.oilItemSpec') }}</span>
                <span class="font-mono text-[#2A5440] font-bold">{{ (form.oilQty * 1200).toLocaleString() }} IQD</span>
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
                <div class="col-span-12 sm:col-span-7 text-[10px] sm:text-[11px] text-[#58685D] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="text-[#8A9A8F]">{{ $t('agentG2B.quotaUpperLimit', { limit: agentQuotaLimits.oil.toLocaleString(), unit: 'L' }) }}</span>
                  <span v-if="centerStock.oil != null" class="text-[#8A9A8F]">{{ $t('agentG2B.centerStockUpperLimit', { limit: centerStock.oil.toLocaleString(), unit: 'L' }) }}</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono origin-left rtl:origin-right">
                    {{ $t('agentG2B.orderLimitTag', { limit: maxAllowed.oil.toLocaleString(), unit: 'L' }) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-[#D9E5DB] flex items-center justify-between text-xs">
            <span class="font-bold text-[#1F3326]">{{ $t('agentG2B.totalPaymentPayable') }}</span>
            <span class="font-mono text-base font-bold text-[#2A5440]">
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
      :applicant-name="$t('my.demoAgentName')"
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
        <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/80 text-start space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-[#58685D] text-[11px]">{{ $t('agentG2B.qrCenterLabel') }}</span>
            <span class="font-bold text-[#1F3326]">{{ activeQRRow.centerName }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#58685D] text-[11px]">{{ $t('agentG2B.qrTimeSlotLabel') }}</span>
            <span class="font-semibold text-[#2A5440]">{{ formatG2BTimeSlot(activeQRRow.timeSlot) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#58685D] text-[11px]">{{ $t('agentG2B.qrVehicleLabel') }}</span>
            <span class="font-mono text-[#43554B]">{{ activeQRRow.deliveryVehicleNo }} ({{ activeQRRow.logisticsMode === 'DISPATCH' ? $t('agentG2B.modeDispatch') : $t('agentG2B.modePickup') }})</span>
          </div>
        </div>

        <!-- 可由代理 APP 摄像头识别的真实订单二维码 -->
        <div class="p-4 sm:p-5 bg-white border-2 border-dashed border-[#C7DED0] rounded-lg flex flex-col items-center justify-center space-y-2.5 sm:space-y-3 shadow-inner">
          <div class="w-48 h-48 sm:w-56 sm:h-56 p-2 bg-white rounded-lg shadow-xs border border-[#D9E5DB] flex items-center justify-center">
            <img
              v-if="qrDataUrl"
              :src="qrDataUrl"
              :alt="$t('agentG2B.qrModalTitle')"
              class="w-full h-full object-contain"
            />
            <el-icon v-else class="text-2xl text-[#2F5B44] animate-spin"><Loading /></el-icon>
          </div>

          <div class="space-y-1">
            <span class="text-[11px] text-[#58685D] block">{{ $t('agentG2B.qrCodeNoLabel') }}</span>
            <div class="font-mono text-base font-extrabold text-[#2A5440] tracking-wider bg-[#EFF5F1] px-3 py-1 rounded-lg border border-[#C7DED0]">
              {{ activeQRRow.pickupVoucherCode }}
            </div>
          </div>
          <span class="text-[10px] text-[#8A9A8F]">{{ $t('agentG2B.qrScanHint') }}</span>
        </div>
        <!-- 采购明细与金额汇总 -->
        <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/80 space-y-1.5 text-start">
          <div class="flex justify-between items-center font-semibold text-[#43554B]">
            <span>{{ $t('agentG2B.qrOrderNoLabel') }}</span>
            <span class="font-mono text-[#1B3123]">{{ activeQRRow.orderNo }}</span>
          </div>
          <div class="flex justify-between items-center font-semibold text-[#43554B]">
            <span>{{ $t('agentG2B.qrPaidAmountLabel') }}</span>
            <span class="font-mono text-[#2F5B44] font-bold">{{ $t('agentG2B.qrPaidAmountVal', { amount: activeQRRow.totalAmount.toLocaleString() }) }}</span>
          </div>
          <div class="pt-1 border-t border-[#D9E5DB]/60 text-[11px] text-[#58685D]">
            {{ $t('agentG2B.qrIncludeItems') }}
            <span v-for="(it, i) in activeQRRow.items" :key="i" class="me-2">
              {{ formatG2BItemName(it.itemName) }}: <strong>{{ it.qty }}{{ formatG2BUnit(it.unit) }}</strong>
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
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
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
  Tickets,
  View,
  Money,
  Loading
} from '@element-plus/icons-vue';
import QRCode from 'qrcode';
import { getG2BPurchaseOrders, createG2BPurchaseOrder, payG2BPurchaseOrder, receiveG2BPurchaseOrder } from '../../../api/agent.js';
import ElectronicPaymentDialog from '../../../components/common/ElectronicPaymentDialog.vue';
import { useAgentDataRefresh } from '../../../composables/useAgentDataRefresh.js';
import { createAgentGovernmentOrderQrPayload } from '../../../utils/qrPayload.js';

const props = defineProps({
  selectedCenter: { type: Object, required: true },
  selectedCenterName: { type: String, required: true },
  allAgents: Boolean
});
const { t, locale } = useI18n();
const route = useRoute();
const isEn = computed(() => locale.value === 'en');
const isAr = computed(() => locale.value === 'ar');
const isKu = computed(() => locale.value === 'ckb');
const isAppMode = computed(() => {
  return route.query.layout === 'app' ||
    sessionStorage.getItem('rcm_layout_mode') === 'app' ||
    window.innerWidth <= 768;
});

// 采购列表字段四语国际化格式化函数
const formatG2BItemName = (name) => {
  if (!name) return '';
  if (isEn.value) {
    if (name.includes('面粉') || name.toLowerCase().includes('flour')) return 'Wheat Flour (Standard)';
    if (name.includes('米') || name.toLowerCase().includes('rice')) return 'Basmati Rice (Grade A)';
    if (name.includes('油') || name.toLowerCase().includes('oil')) return 'Refined Cooking Oil';
    if (name.includes('糖') || name.toLowerCase().includes('sugar')) return 'Refined White Sugar';
  } else if (isAr.value) {
    if (name.includes('面粉') || name.toLowerCase().includes('flour')) return 'طحين قمح استراتيجي (معياري)';
    if (name.includes('米') || name.toLowerCase().includes('rice')) return 'أرز بسمتي فاخر (درجة أولى)';
    if (name.includes('油') || name.toLowerCase().includes('oil')) return 'زيت نباتي مكرر';
    if (name.includes('糖') || name.toLowerCase().includes('sugar')) return 'سكر أبيض نقي';
  } else if (isKu.value) {
    if (name.includes('面粉') || name.toLowerCase().includes('flour')) return 'ئاردی گەنمی ستراتیژی';
    if (name.includes('米') || name.toLowerCase().includes('rice')) return 'برنجی بەسمەتی پلە یەک';
    if (name.includes('油') || name.toLowerCase().includes('oil')) return 'ڕۆنی ڕووەکی پاڵاوتە';
    if (name.includes('糖') || name.toLowerCase().includes('sugar')) return 'شەکری سپی';
  }
  return name;
};

const formatG2BUnit = (unit) => {
  if (!unit) return '';
  if (isEn.value) return unit === '升' || unit === 'L' ? 'L' : 'KG';
  if (isAr.value) return unit === '升' || unit === 'L' ? 'لتر' : 'كجم';
  if (isKu.value) return unit === '升' || unit === 'L' ? 'لیتر' : 'کگم';
  return unit;
};

const formatG2BCenterName = (name) => {
  if (!name) return '';
  if (isEn.value) {
    if (name.includes('哈奈根') || name.toLowerCase().includes('khanaqin')) return 'Khanaqin 1st Ration Center';
    if (name.includes('卡尔赫第一') || name.toLowerCase().includes('karkh')) return 'Karkh 1st Ration Center (Mansour)';
    if (name.includes('曼苏尔') || name.toLowerCase().includes('mansour')) return 'Mansour Central Storage Depot';
    if (name.includes('萨德尔城') || name.toLowerCase().includes('sadr')) return 'Sadr City Central Ration Center';
    if (name.includes('鲁萨法') || name.toLowerCase().includes('rusafa')) return 'Rusafa Central Ration Center';
    if (name.includes('基尔库克') || name.toLowerCase().includes('kirkuk')) return 'Kirkuk Strategic Ration Depot';
    if (name.includes('巴士拉') || name.toLowerCase().includes('basra')) return 'Basra Port Strategic Supply Center';
    if (name.includes('摩苏尔') || name.toLowerCase().includes('mosul')) return 'Mosul Old City Regional Supply Center';
    if (name.includes('迪亚拉') || name.toLowerCase().includes('diyala')) return 'Diyala Regional Supply Center';
    if (name.includes('卡达米亚') || name.toLowerCase().includes('kadhimiya')) return 'Kadhimiya 2nd Ration Center';
  } else if (isAr.value) {
    if (name.includes('哈奈根') || name.toLowerCase().includes('khanaqin')) return 'مركز خانقين الأول للتموين (المادة 140)';
    if (name.includes('卡尔赫第一') || name.toLowerCase().includes('karkh')) return 'مركز توزيع الكرخ الأول (المنصور)';
    if (name.includes('曼苏尔') || name.toLowerCase().includes('mansour')) return 'مستودع المنصور المركزي للتموين';
    if (name.includes('萨德尔城') || name.toLowerCase().includes('sadr')) return 'مركز مدينة الصدر لتوزيع الطحين';
    if (name.includes('鲁萨法') || name.toLowerCase().includes('rusafa')) return 'مركز توزيع الرصافة المركزي';
    if (name.includes('基尔库克') || name.toLowerCase().includes('kirkuk')) return 'مستودع كركوك الاستراتيجي للتموين';
    if (name.includes('巴士拉') || name.toLowerCase().includes('basra')) return 'مركز إمداد ميناء البصرة الاستراتيجي';
    if (name.includes('摩苏尔') || name.toLowerCase().includes('mosul')) return 'مركز إمداد الموصل القديمة الإقليمي';
    if (name.includes('迪亚拉') || name.toLowerCase().includes('diyala')) return 'مركز إمداد ديالى الإقليمي';
    if (name.includes('卡达米亚') || name.toLowerCase().includes('kadhimiya')) return 'مركز الكاظمية الثاني للتموين';
  } else if (isKu.value) {
    if (name.includes('哈奈根') || name.toLowerCase().includes('khanaqin')) return 'Navenda Xaneqîn 1 ya Xwarinê';
    if (name.includes('卡尔赫第一') || name.toLowerCase().includes('karkh')) return 'Navenda Belavkirinê ya Karkh 1 (Mansour)';
    if (name.includes('曼苏尔') || name.toLowerCase().includes('mansour')) return 'Embara Navendî ya Mansour';
    if (name.includes('萨德尔城') || name.toLowerCase().includes('sadr')) return 'Navenda Arvan ya Şaristana Sadr';
    if (name.includes('鲁萨法') || name.toLowerCase().includes('rusafa')) return 'Navenda Belavkirinê ya Rusafa';
  }
  return name;
};

const formatG2BTimeSlot = (slot) => {
  if (!slot) return '';
  if (isEn.value) {
    if (slot.includes('早间第一批')) return '08:00 - 10:00 (Early Morning Slot 1)';
    if (slot.includes('上午第二批')) return '10:00 - 12:00 (Morning Slot 2)';
    if (slot.includes('午后第三批')) return '14:00 - 16:00 (Afternoon Slot 3)';
  } else if (isAr.value) {
    if (slot.includes('早间第一批')) return '08:00 - 10:00 (الفترة الصباحية الأولى)';
    if (slot.includes('上午第二批')) return '10:00 - 12:00 (الفترة الصباحية الثانية)';
    if (slot.includes('午后第三批')) return '14:00 - 16:00 (فترة بعد الظهر)';
  } else if (isKu.value) {
    if (slot.includes('早间第一批')) return '08:00 - 10:00 (بەشی بەیانی ١)';
    if (slot.includes('上午第二批')) return '10:00 - 12:00 (بەشی بەیانی ٢)';
    if (slot.includes('午后第三批')) return '14:00 - 16:00 (بەشی پاشنیوەڕۆ)';
  }
  return slot;
};

// 表单时段 value → 当前语言展示标签 (新建订单默认时间提示用)
const SLOT_VALUE_KEYS = {
  '08:00-10:00': 'slot1',
  '10:00-12:00': 'slot2',
  '14:00-16:00': 'slot3',
  '16:00-18:00': 'slot4'
};

const formatSlotValue = (slot) => {
  if (!slot) return '';
  const key = SLOT_VALUE_KEYS[slot];
  return key ? t(`agentG2B.${key}`) : formatG2BTimeSlot(slot);
};

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
const qrDataUrl = ref('');
let qrGenerationToken = 0;

const currentCenterName = computed(() => props.selectedCenterName);

// 1. 配给中心（中心仓）实时可用库存数据 (需求 2)
const centerStock = computed(() => props.selectedCenter.id === 'FA-00128'
  ? { flour: 92400, rice: 184500, oil: 34100 }
  : { flour: null, rice: null, oil: null });
const stockText = (value) => value == null ? '—' : value.toLocaleString();

// 2. 代理辖区签约户数与标准配额安全冗余 (1.2倍冗余系数，硬上限1500户)
const householdsCount = computed(() => Number(props.selectedCenter.householdsCount || 0));
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
  flour: centerStock.value.flour == null ? agentQuotaLimits.value.flour : Math.min(agentQuotaLimits.value.flour, centerStock.value.flour),
  rice: centerStock.value.rice == null ? agentQuotaLimits.value.rice : Math.min(agentQuotaLimits.value.rice, centerStock.value.rice),
  oil: centerStock.value.oil == null ? agentQuotaLimits.value.oil : Math.min(agentQuotaLimits.value.oil, centerStock.value.oil)
}));

// 待提交采购单暂存数据
const pendingOrderNo = ref('');
const pendingOrderAmount = ref(0);
const pendingPayload = ref(null);

// 复合履约窗口：日期控件 + 时段控件
const disabledPastDates = (time) => {
  return time.getTime() < Date.now() - 8.64e7;
};

function nextDeliveryDate() { const date = new Date(); date.setDate(date.getDate() + 1); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }

const form = ref({
  logisticsMode: 'DISPATCH',
  deliveryDate: nextDeliveryDate(),
  deliverySlot: '08:00-10:00',
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
let requestVersion = 0, alive = true;
const loadOrders = async () => {
  const version = ++requestVersion;
  const requestedAgentId = props.selectedCenter.id;
  loading.value = true;
  try {
    const res = await getG2BPurchaseOrders(props.allAgents ? {} : { agentId: requestedAgentId });
    const list = Array.isArray(res) ? res : (res?.data || []);
    if (alive && version === requestVersion && props.selectedCenter.id === requestedAgentId) orders.value = props.allAgents ? list : list.filter((item) => item.agentId === requestedAgentId);
  } catch (error) {
    if (alive && version === requestVersion) ElMessage.error(t('agentG2B.loadOrdersError') || (isEnNow() ? 'Failed to load purchase orders' : '加载采购订单失败'));
  } finally {
    if (alive && version === requestVersion) loading.value = false;
  }
};

// 列表过滤逻辑：默认显示未完成的采购记录 (需求 3)
const filteredOrders = computed(() => {
  let list = props.allAgents ? orders.value : orders.value.filter((item) => item.agentId === props.selectedCenter.id);

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
    deliveryDate: nextDeliveryDate(),
    deliverySlot: '08:00-10:00',
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
    ElMessage.warning(t('agentG2B.selectDateTimeWarning') || (isEnNow() ? 'Please fully select the reservation fulfillment/arrival date and time-slot window' : '请完整选择预约履约/到货日期与时段窗口'));
    return;
  }

  // 2. 数量非空校验
  if (form.value.flourQty <= 0 && form.value.riceQty <= 0 && form.value.oilQty <= 0) {
    ElMessage.warning(t('agentG2B.atLeastOneItemWarning') || (isEnNow() ? 'Please enter a quantity for at least one procurement item' : '请至少填报一项采购物资数量'));
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
    requestId: crypto.randomUUID(),
    agentId: props.selectedCenter.id,
    centerId: props.selectedCenter.centerId,
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
    const res = pendingPayload.value ? await createG2BPurchaseOrder(pendingPayload.value) : await payG2BPurchaseOrder(pendingOrderNo.value, { channel: 'PUBLIC_TREASURY_ACCOUNT' });
    const newOrder = res?.data || res;
    ElMessage.success(t('agentProcurement.paymentSuccess'));

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
    ElMessage.error(error.message || (t('agentG2B.generateOrderError') || (isEnNow() ? 'Purchase order generation error' : '生成采购订单异常')));
  } finally {
    loading.value = false;
  }
};

const handlePaymentCancel = () => {
  paymentDialogVisible.value = false;
  ElMessage.info(t('agentG2B.cancelPaymentMsg') || (isEnNow() ? 'Electronic payment cancelled; the purchase order was not submitted.' : '已取消电子支付，采购单未提交。'));
};

// 3. 点击操作栏展示二维码
const showOrderQRCode = (row) => {
  activeQRRow.value = {
    ...row,
    pickupVoucherCode: row?.pickupVoucherCode || row?.voucherCode || '',
    centerName: row?.centerName || props.selectedCenterName,
    centerId: row?.centerId || props.selectedCenter?.centerId || ''
  };
  qrModalVisible.value = true;
};

const copyPickupCode = () => {
  if (activeQRRow.value) {
    navigator.clipboard?.writeText(activeQRRow.value.pickupVoucherCode);
    ElMessage.success(t('agentG2B.codeCopiedMsg', { code: activeQRRow.value.pickupVoucherCode }) || (isEnNow() ? `Pickup code copied!` : `提货码已复制！`));
  }
};

const handlePrintVoucher = () => {
  ElMessage.success(t('agentG2B.printTaskSentMsg') || (isEnNow() ? 'The outbound pickup voucher print job has been sent to the local printer' : '出库提货凭证打印任务已发送至本地打印机'));
};

const handlePayOrder = (row) => {
  pendingPayload.value = null;
  pendingOrderAmount.value = row.totalAmount;
  pendingOrderNo.value = row.orderNo;
  paymentDialogVisible.value = true;
};

const viewOrderDetail = (row) => {
  showOrderQRCode(row);
};

const canReceive = row => row.payStatus === 'PAID' && ['PAID_WMS_PICKING', 'IN_TRANSIT'].includes(row.status);
async function confirmReceive(row) {
  try {
    await ElMessageBox.confirm(t('agentProcurement.receiptConfirm'), t('agentProcurement.receipt'), { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' });
    await receiveG2BPurchaseOrder(row.orderNo);
    ElMessage.success(t('agentProcurement.receivedSuccess'));
    await loadOrders();
  } catch { /* A cancelled confirmation makes no changes; API errors are already displayed. */ }
}
useAgentDataRefresh(loadOrders);
watch(locale, loadOrders);
onBeforeUnmount(() => { alive = false; requestVersion++; });
onMounted(() => { loadOrders(); });
watch(() => props.selectedCenter.id, () => {
  orders.value = [];
  currentPage.value = 1;
  loadOrders();
});

watch([qrModalVisible, activeQRRow], async ([isVisible, order]) => {
  const token = ++qrGenerationToken;
  qrDataUrl.value = '';
  if (!isVisible || !order) return;
  try {
    const dataUrl = await QRCode.toDataURL(createAgentGovernmentOrderQrPayload(order), {
      width: 480,
      margin: 3,
      errorCorrectionLevel: 'M',
      color: { dark: '#1F3326', light: '#FFFFFF' }
    });
    if (token === qrGenerationToken) qrDataUrl.value = dataUrl;
  } catch (error) {
    console.error('生成代理政府采购订单二维码失败', error);
    if (token === qrGenerationToken) ElMessage.error(t('agentG2B.qrGenerateError'));
  }
});
</script>
