<template>
  <div class="order-dispatch-tab space-y-4">
    <!-- ======================================================== -->
    <!-- 1. 顶部操作栏：搜索筛选 + 【📸 扫码核验交货】核心大按钮 -->
    <!-- ======================================================== -->
    <div class="bg-[#F3F8F4] p-3 sm:p-4 rounded-lg border border-[#D9E5DB]/80 space-y-3">
      <!-- 搜索、履约类型筛选与扫码交货大按钮 (自适应 APP 移动端视口) -->
      <div class="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
        <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2 min-w-0">
          <el-input
            v-model="searchKeyword"
            :placeholder="$t('agentOrders.searchPlaceholder')"
            clearable
            size="small"
            class="flex-1"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="deliveryTypeFilter"
            size="small"
            class="w-32 sm:w-40 shrink-0"
            :aria-label="$t('agentDelivery.filterType')"
            @change="loadOrders"
          >
            <el-option :label="$t('agentOrders.typeAll')" value="ALL" />
            <el-option :label="$t('agentOrders.typeDelivery')" value="HOME_DELIVERY" />
            <el-option :label="$t('agentOrders.typePickup')" value="PICKUP" />
          </el-select>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
          <!-- 阶段 4 核心：扫码核验交货按钮 (高亮翠绿) -->
          <el-button
            type="success"
            size="small"
            class="!h-9 !w-full font-bold shadow-xs px-3 bg-[#2F7A50] hover:bg-[#2F5B44] border-none text-white flex items-center justify-center gap-1.5 rounded-lg !m-0"
            @click="openScanVerifyModal()"
          >
            <el-icon class="text-base"><Camera /></el-icon>
            <span class="truncate">{{ $t('orderClaim.scanVerifyBtn') }}</span>
          </el-button>

          <el-button
            size="small"
            :loading="loading"
            class="!m-0 rounded-lg !h-9 !w-full flex items-center justify-center"
            :aria-label="$t('agentDelivery.refreshList')"
            @click="loadOrders"
          >
            <el-icon class="me-1"><Refresh /></el-icon>
            <span>{{ $t('common.refresh') }}</span>
          </el-button>
        </div>
      </div>

      <div v-if="urgentCount" class="flex items-center gap-2 rounded-lg bg-[#FFF1E8] px-3 py-2 text-xs font-semibold text-[#A53A2D]" role="status">
        <span class="h-2 w-2 rounded-full bg-[#D34B3F] shrink-0" />
        {{ $t('agentDelivery.priorityCount', { count: urgentCount }) }}
      </div>

      <!-- 状态筛选药丸横向滑动条 (针对手机端触控优化) -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'ALL'
              ? 'bg-[#326445] text-white shadow-xs'
              : 'bg-white text-[#58685D] border border-[#D9E5DB] hover:bg-[#E9F1EB]'
          ]"
          @click="setStatusFilter('ALL')"
        >
          <span>{{ $t('agentOrders.filterAll') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'ALL' ? 'bg-[#5C8A6B] text-white' : 'bg-[#E9F1EB] text-[#58685D]'">
            {{ counts.all }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'PENDING'
              ? 'bg-[#C9A13B] text-white shadow-xs'
              : 'bg-white text-[#58685D] border border-[#D9E5DB] hover:bg-[#E9F1EB]'
          ]"
          @click="setStatusFilter('PENDING')"
        >
          <span>{{ $t('agentOrders.filterPending') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'PENDING' ? 'bg-[#D3AF62] text-white' : 'bg-[#FDF3E0] text-[#7A5F21]'">
            {{ counts.pending }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'DISPATCHED'
              ? 'bg-[#2F7A50] text-white shadow-xs'
              : 'bg-white text-[#58685D] border border-[#D9E5DB] hover:bg-[#E9F1EB]'
          ]"
          @click="setStatusFilter('DISPATCHED')"
        >
          <span>{{ $t('agentOrders.filterDispatched') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'DISPATCHED' ? 'bg-[#3E9B68] text-white' : 'bg-[#E1F4E4] text-[#2F5B44]'">
            {{ counts.dispatched }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'READY_FOR_PICKUP'
              ? 'bg-[#C9A13B] text-white shadow-xs'
              : 'bg-white text-[#58685D] border border-[#D9E5DB] hover:bg-[#E9F1EB]'
          ]"
          @click="setStatusFilter('READY_FOR_PICKUP')"
        >
          <span>{{ $t('agentOrders.filterReadyPickup') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'READY_FOR_PICKUP' ? 'bg-[#D3AF62] text-white' : 'bg-[#FDF3E0] text-[#7A5F21]'">
            {{ counts.readyPickup }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
            statusFilter === 'DELIVERED'
              ? 'bg-[#2F7A50] text-white shadow-xs'
              : 'bg-white text-[#58685D] border border-[#D9E5DB] hover:bg-[#E9F1EB]'
          ]"
          @click="setStatusFilter('DELIVERED')"
        >
          <span>{{ $t('agentOrders.filterDelivered') }}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono" :class="statusFilter === 'DELIVERED' ? 'bg-[#3E9B68] text-white' : 'bg-[#E1F4E4] text-[#2F5B44]'">
            {{ counts.delivered }}
          </span>
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 订单卡片流 (极简移动端友好布局，大字号、高触控区) -->
    <!-- ======================================================== -->
    <div v-loading="loading" class="min-h-[200px]">
      <div v-if="filteredOrders.length === 0" class="py-12 text-center text-[#8A9A8F]">
        <el-icon class="text-4xl mb-2 text-[#C9DBCE]"><Document /></el-icon>
        <p class="text-sm font-medium">{{ $t('agentOrders.noOrders') }}</p>
      </div>

      <div
        class="grid"
        :class="isAppMode ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-3.5'"
      >
        <div
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="bg-white border border-[#D9E5DB]/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-2.5"
          :class="[
            isAppMode ? 'p-3 rounded-lg' : 'p-4 rounded-lg',
            selectedOrderId === order.orderId ? 'ring-2 ring-[#D3AF62]' : ''
          ]"
          role="button"
          tabindex="0"
          @click="openOrderDetails(order)"
          @keydown.enter.self="openOrderDetails(order)"
        >
          <!-- 卡片头部：订单单号与状态标签 (移动端优雅排列) -->
          <div class="flex items-center justify-between gap-1.5 border-b border-[#E9F1EB] pb-2">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold text-[#1B3123] text-xs sm:text-sm">#{{ (order.orderId || '').slice(-8) }}</span>
              <span class="text-[10px] sm:text-[11px] text-[#8A9A8F] font-mono">{{ (order.createdAt || '').slice(5, 16) }}</span>
            </div>

            <div class="flex items-center gap-1">
              <!-- 履约方式胶囊 -->
              <span
                v-if="order.deliveryType === 'HOME_DELIVERY'"
                class="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#EFF5F1] text-[#2A5440] border border-[#C7DED0]/60 flex items-center gap-1"
              >
                🚚 <span class="truncate">{{ $t('agentOrders.typeDelivery') }}</span>
              </span>
              <span
                v-else
                class="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#EFF5F1] text-[#2F5B44] border border-[#C7E0CE]/60 flex items-center gap-1"
              >
                🏬 <span class="truncate">{{ $t('agentOrders.typePickup') }}</span>
              </span>

              <!-- 状态胶囊 -->
              <span
                :class="[
                  'px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold truncate',
                  getStatusBadgeClass(order.status)
                ]"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <div v-if="priorityFor(order).rank <= 1" class="flex items-center justify-between gap-2 rounded-md bg-[#FFF1E8] px-2 py-1.5 text-[11px] font-bold text-[#A53A2D]">
            <span>{{ $t(priorityFor(order).rank === 0 ? 'agentDelivery.priorityOverdue' : 'agentDelivery.prioritySoon') }}</span>
            <bdi v-if="priorityFor(order).dueAt" dir="ltr" class="font-mono">{{ formatDeadline(priorityFor(order).dueAt) }}</bdi>
          </div>

          <!-- 户主核心信息 (极简化提炼，支持一键复制电话) -->
          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-[#43554B] gap-1">
              <div class="flex items-center gap-1.5 truncate">
                <span class="font-bold text-[#1B3123] text-xs sm:text-sm truncate">{{ formatHeadName(order.headName) }}</span>
                <span class="text-[10px] sm:text-[11px] font-mono text-[#8A9A8F] shrink-0">({{ order.cardNo }})</span>
              </div>
              <div class="flex items-center gap-1 text-[#58685D] font-mono shrink-0">
                <bdi dir="ltr" class="text-[11px]">{{ order.phone }}</bdi>
                <el-button size="small" text class="p-0.5" @click.stop="copyText(order.phone)">
                  <el-icon class="text-xs text-[#326445]"><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- 送货住址或自提网点 -->
            <div class="flex items-start gap-1 text-[11px] text-[#58685D]">
              <el-icon class="text-xs text-[#8A9A8F] mt-0.5 shrink-0"><Location /></el-icon>
              <span class="truncate leading-tight">{{ order.deliveryType === 'HOME_DELIVERY' ? formatDeliveryAddress(order.deliveryAddress) : formatAgentName(order.agentName) }}</span>
            </div>

            <!-- 物资品类胶囊清单 (微型化展示，不占用大版面) -->
            <div class="flex flex-wrap items-center gap-1 pt-0.5">
              <span
                v-for="(it, idx) in order.items"
                :key="idx"
                class="px-2 py-0.5 rounded-md bg-[#E9F1EB] text-[#43554B] text-[10px] sm:text-[11px] font-medium border border-[#D9E5DB]/60"
              >
                {{ formatItemName(it.itemName) }} <b class="font-mono text-[#1B3123] font-bold">×{{ it.qty }}{{ formatUnit(it.unit) }}</b>
              </span>
            </div>
          </div>

          <!-- 结算金额与核验提货码栏 -->
          <div class="bg-[#F3F8F4] p-2 sm:p-2.5 rounded-lg border border-[#E9F1EB] flex items-center justify-between text-xs">
            <div>
              <span class="text-[10px] text-[#8A9A8F] block">{{ $t('agentOrders.orderCardPaid') }}</span>
              <span class="font-mono font-bold text-[#C9A13B] text-xs sm:text-sm">IQD {{ (order.selfPayAmount || 0).toLocaleString() }}</span>
            </div>

            <div class="text-end">
              <span class="text-[10px] text-[#8A9A8F] block">{{ $t('agentOrders.orderCardPickupCode') }}</span>
              <div class="flex items-center gap-1">
                <span class="font-mono font-bold text-[#1F3326] bg-white px-1.5 py-0.5 rounded border border-[#D9E5DB] text-xs">
                  {{ order.pickupCode }}
                </span>
                <el-button size="small" text class="p-0.5" @click.stop="copyText(order.pickupCode)">
                  <el-icon class="text-xs text-[#58685D]"><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 若已派单，展示车队指派信息微条 (允许换行，避免英文长词条被截断) -->
          <div
            v-if="order.dispatchInfo && order.dispatchInfo.deliveryPerson"
            class="p-2 rounded-lg bg-[#EFF5F1]/70 border border-[#E1F4E4] text-[11px] text-[#24483A] flex items-start justify-between gap-2"
          >
            <div class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
              <span>🚚</span>
              <span class="font-bold">{{ formatDeliveryPerson(order.dispatchInfo.deliveryPerson) }}</span>
              <span class="font-mono text-[#2F7A50]">[{{ formatVehicleNo(order.dispatchInfo.vehicleNo) }}]</span>
            </div>
            <span class="font-mono font-semibold shrink-0 text-[#2F5B44] text-[10px] sm:text-[11px]">{{ formatEstimatedTime(order.dispatchInfo.estimatedTime) }}</span>
          </div>

          <!-- 卡片底部操作大按钮 (极简触控交互) -->
          <div class="pt-1">
            <button type="button" class="mb-2 w-full text-start text-xs font-semibold text-[#2F7A50] underline underline-offset-2" @click.stop="openOrderDetails(order)">
              {{ $t('agentDelivery.details') }}
            </button>
            <!-- 送货上门 待处理 -> 安排配送 -->
            <el-button
              v-if="order.deliveryType === 'HOME_DELIVERY' && (order.status === 'PENDING_DELIVERY' || order.status === 'PAID')"
              type="primary"
              class="w-full font-bold shadow-xs rounded-lg !h-8 sm:!h-9 text-xs"
              data-demo-target="btn-dispatch"
              @click.stop="openDispatchModal(order)"
            >
              <el-icon class="me-1"><Van /></el-icon>
              {{ $t('agentOrders.dispatchBtn') }}
            </el-button>

            <!-- 到店自提 待处理 -> 标记备货就绪 -->
            <el-button
              v-else-if="order.deliveryType === 'PICKUP' && (order.status === 'PENDING_PICKUP' || order.status === 'PAID')"
              type="warning"
              class="w-full font-bold shadow-xs rounded-lg !h-8 sm:!h-9 text-xs"
              @click.stop="handleMarkReady(order)"
            >
              <el-icon class="me-1"><CircleCheck /></el-icon>
              {{ $t('agentOrders.readyPickupBtn') }}
            </el-button>

            <!-- 阶段 4 核心：配送中状态 -> 打开摄像头扫码核验 (先拍照扫码，再出确认单) -->
            <el-button
              v-else-if="order.status === 'DISPATCHED'"
              type="success"
              class="w-full font-bold shadow-xs rounded-lg bg-[#2F7A50] hover:bg-[#2F5B44] border-none text-white flex items-center justify-center gap-1 !h-8 sm:!h-9 text-xs"
              @click.stop="openScanVerifyModal(order)"
            >
              <el-icon><Camera /></el-icon>
              <span>{{ isAppMode ? $t('orderClaim.scanVerifyBtn') : ($t('orderClaim.scanVerifyBtn') + '（' + ($t('agentOrders.deliveryPhotoVerify') || '送达拍照核验') + '）') }}</span>
            </el-button>

            <!-- 阶段 4 核心：备货就绪状态 -> 打开摄像头扫码核验 (先拍照扫码，再出确认单) -->
            <el-button
              v-else-if="order.status === 'READY_FOR_PICKUP'"
              type="success"
              class="w-full font-bold shadow-xs rounded-lg bg-[#C9A13B] hover:bg-[#7A5F21] border-none text-white flex items-center justify-center gap-1 !h-8 sm:!h-9 text-xs"
              @click.stop="openScanVerifyModal(order)"
            >
              <el-icon><Camera /></el-icon>
              <span>{{ isAppMode ? $t('orderClaim.scanVerifyBtn') : ($t('orderClaim.scanVerifyBtn') + '（' + ($t('agentOrders.pickupPhotoVerify') || '到店拍照核验') + '）') }}</span>
            </el-button>

            <!-- 已交付完结 -->
            <div
              v-else-if="order.status === 'DELIVERED'"
              class="w-full py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg bg-[#EFF5F1] border border-[#C7E0CE]/80 text-[#24483A] text-center text-xs font-bold flex items-center justify-between"
            >
              <div class="flex items-center gap-1.5 truncate">
                <el-icon class="text-[#2F7A50] text-sm shrink-0"><SuccessFilled /></el-icon>
                <span class="truncate">{{ $t('agentOrders.filterDelivered') }} · {{ $t('agentOrders.deliveredStockDeducted') }}</span>
              </div>
              <span class="font-mono text-[10px] sm:text-[11px] text-[#2F5B44] font-semibold shrink-0">{{ order.deliveredAt?.slice(5, 16) || '' }}</span>
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
        <div class="p-3 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB]/70 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-[#1F3326] text-sm">{{ currentDispatchOrder.headName }}</span>
            <span class="font-mono text-[#58685D] font-bold">#{{ currentDispatchOrder.orderId }}</span>
          </div>
          <div class="text-[11px] text-[#58685D] flex items-center gap-1 truncate">
            <el-icon class="text-xs text-[#8A9A8F]"><Location /></el-icon>
            <span class="truncate">{{ currentDispatchOrder.deliveryAddress }}</span>
          </div>
        </div>

        <!-- 常用保供司机与车辆快捷点选胶囊 -->
        <div>
          <span class="text-[11px] text-[#58685D] font-bold mb-1.5 block">{{ $t('agentOrders.quickAssignDriver') }}</span>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="p-2 rounded-lg text-start border transition-all"
              data-demo-target="btn-quick-driver"
              :class="dispatchForm.vehicleNo.includes('78219') ? 'bg-[#EFF5F1] border-[#7FA48C] text-[#1F3326] font-bold' : 'bg-white border-[#D9E5DB] text-[#43554B] hover:bg-[#F3F8F4]'"
              @click="applyQuickDriver(0)"
            >
              <div class="text-xs font-bold">{{ $t('agentOrders.driver1Name') || '哈希姆·阿里' }}</div>
              <div class="text-[10px] text-[#8A9A8F] font-mono mt-0.5">{{ $t('agentOrders.driver1Desc') || 'BG-78219 (急送货车)' }}</div>
            </button>

            <button
              type="button"
              class="p-2 rounded-lg text-start border transition-all"
              :class="dispatchForm.vehicleNo.includes('33812') ? 'bg-[#EFF5F1] border-[#7FA48C] text-[#1F3326] font-bold' : 'bg-white border-[#D9E5DB] text-[#43554B] hover:bg-[#F3F8F4]'"
              @click="applyQuickDriver(1)"
            >
              <div class="text-xs font-bold">{{ $t('agentOrders.driver2Name') || '萨米尔·卡西姆' }}</div>
              <div class="text-[10px] text-[#8A9A8F] font-mono mt-0.5">{{ $t('agentOrders.driver2Desc') || 'BG-33812 (冷链专车)' }}</div>
            </button>
          </div>
        </div>

        <!-- 详细表单 -->
        <div class="space-y-3">
          <div v-if="managedCouriers.length">
            <label class="block text-[#58685D] font-semibold mb-1">{{ $t('my.selectCourier') }}</label>
            <el-select v-model="selectedCourierId" class="w-full" :placeholder="$t('my.selectCourier')" @change="applyManagedCourier">
              <el-option v-for="courier in managedCouriers" :key="courier.id" :label="courier.name" :value="courier.id" />
            </el-select>
          </div>
          <div>
            <label class="block text-[#58685D] font-semibold mb-1">{{ $t('agentOrders.deliveryPersonLabel') }}</label>
            <el-input v-model="dispatchForm.deliveryPerson" :placeholder="$t('agentOrders.dispatchPersonNamePlaceholder')" />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[#58685D] font-semibold mb-1">{{ $t('agentOrders.driverPhoneLabel') }}</label>
              <el-input class="bidi-ltr" v-model="dispatchForm.driverPhone" placeholder="+964 780..." />
            </div>
            <div>
              <label class="block text-[#58685D] font-semibold mb-1">{{ $t('agentOrders.vehicleNoLabel') }}</label>
              <el-input v-model="dispatchVehicleInput" placeholder="BG-..." />
            </div>
          </div>

          <div>
            <label class="block text-[#58685D] font-semibold mb-1">{{ $t('agentOrders.estimatedTimeLabel') }}</label>
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
          <el-button type="primary" :loading="dispatching" class="font-bold px-5" data-demo-target="btn-confirm-dispatch" @click="confirmDispatch">
            <el-icon class="me-1"><Van /></el-icon>
            {{ $t('agentOrders.confirmDispatchBtn') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 4. 阶段 4 核心：高纵深 APP 风格扫码拍照核验与实物交接弹窗 -->
    <!-- 摄像头与相册图片共用凭证解析和订单核验流程 -->
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
      <!-- 固定在可视高度内；详情区滚动，底部操作区保持可见 -->
      <div
        class="flex flex-col h-full min-h-0 select-none relative overflow-hidden rounded-[28px] border shadow-2xl transition-all duration-300"
        :class="claimStep === 'camera'
          ? 'bg-[#12241A]/80 text-white border-[#43554B]/60 backdrop-blur-2xl'
          : 'bg-[#F3F8F4]/85 text-[#1F3326] border-white/70 backdrop-blur-2xl shadow-[0_25px_50px_rgba(0,0,0,0.25)]'"
      >
        <!-- APP 沉浸式顶部标题栏 (根据步骤自适应黑白半透明磨砂效果) -->
        <div
          class="px-4 py-2.5 border-b flex items-center justify-between shrink-0 z-20 backdrop-blur-md transition-colors"
          :class="claimStep === 'camera'
            ? 'bg-[#1B3123]/80 border-[#1F3326]/80 text-white'
            : 'bg-white/80 border-[#D9E5DB]/80 text-[#1B3123]'"
        >
          <div class="flex items-center gap-2">
            <!-- 补光灯/手电筒开关 (仅相机步骤展示) -->
            <button
              v-if="claimStep === 'camera' && scanSource === 'camera'"
              type="button"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
              :class="isFlashOn ? 'bg-[#DFC08B] text-[#1B3123] shadow-[0_0_12px_#D9B567]' : 'bg-[#1F3326] text-[#C9DBCE] hover:bg-[#43554B]'"
              :disabled="scanBusy"
              @click="toggleFlashlight"
            >
              <span>⚡</span>
            </button>
            <div
              v-else
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              :class="claimStep === 'camera' ? 'bg-[#1F3326] text-[#C9DBCE]' : claimStep === 'scan-error' ? 'bg-[#F6D9D9]/90 text-[#C04442]' : 'bg-[#E1F4E4]/90 text-[#2F5B44]'"
            >
              <el-icon v-if="claimStep === 'camera'"><Picture /></el-icon>
              <span v-else>{{ claimStep === 'scan-error' ? '✕' : '✓' }}</span>
            </div>
            <div>
              <div class="text-xs font-bold flex items-center gap-1" :class="claimStep === 'camera' ? 'text-white' : 'text-[#1B3123]'">
                <span>{{ claimStep === 'camera' ? $t('agentOrders.scanCameraModalTitle') : claimStep === 'citizen-card' ? $t('citizenCard.qrVerifyTitle') : claimStep === 'government-order' ? $t('agentG2B.qrModalTitle') : claimStep === 'confirm' ? $t('agentOrders.confirmOrderModalTitle') : claimStep === 'scan-error' ? $t('scanGuard.panelTitle') : $t('agentOrders.officialVoucherModalTitle') }}</span>
                <span
                  class="text-[9px] px-1 rounded font-mono"
                  :class="claimStep === 'camera' ? 'bg-[#12241A] text-[#6FBF92] border border-[#3E9B68]/40' : claimStep === 'scan-error' ? 'bg-[#C04442] text-white border border-[#C04442]/60' : 'bg-[#E1F4E4] text-[#24483A] border border-[#A7D9BC]'"
                >MOT-APP</span>
              </div>
            </div>
          </div>

          <!-- 关闭小叉号 -->
          <button
            type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            :class="claimStep === 'camera' ? 'bg-[#1F3326] hover:bg-[#43554B] text-[#C9DBCE]' : 'bg-[#E9F1EB] hover:bg-[#D9E5DB] text-[#58685D]'"
            @click="scanVerifyModalVisible = false"
            :aria-label="$t('common.close')"
          >
            ✕
          </button>
        </div>

        <!-- ====================================================== -->
        <!-- 页面 1：相机扫码与拍照视窗 (Step 1 必须首先展示) -->
        <!-- ====================================================== -->
        <div
          v-if="claimStep === 'camera'"
          class="flex-1 flex flex-col justify-between p-3.5 bg-[#12241A] relative overflow-hidden"
        >
          <!-- 目标订单提示微胶囊 (从卡片点进来时高亮指引) -->
          <div v-if="targetPresetOrder" class="z-20 mb-1.5 shrink-0">
            <div class="p-2 rounded-lg bg-[#1F3326]/90 border border-[#43554B]/80 text-[11px] flex items-center justify-between">
              <span class="text-[#C9DBCE] truncate">
                📸 {{ $t('agentOrders.verifyTarget') }}: <strong class="text-[#6FBF92] font-bold">{{ scanOrderText(targetPresetOrder.headName, 'recipient', locale) }}</strong>
              </span>
              <span class="font-mono text-[#8A9A8F] text-[10px]">#{{ targetPresetOrder.orderId?.slice(-6) }}</span>
            </div>
          </div>

          <!-- 核心相机取景器窗口 (自适应高度，带最大高度限制) -->
          <div class="relative w-full flex-1 min-h-[180px] max-h-[340px] rounded-lg overflow-hidden bg-black border border-[#1F3326] shadow-2xl flex items-center justify-center">
            <!-- 公民卡二维码状态核验中的加载遮罩 -->
            <div v-if="scanBusy" class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#12241A]/85 rounded-lg" role="status">
              <el-icon class="is-loading text-2xl text-[#6FBF92]"><Loading /></el-icon>
              <span class="text-[11px] text-[#A7D9BC] mt-1.5 tracking-wide">{{ $t(imageDecoding ? 'agentDelivery.scanImageReading' : 'scanGuard.verifying') }}</span>
            </div>
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
            <div v-if="!cameraActive && !isFinalScanDemo" class="absolute inset-0 flex flex-col items-center justify-center bg-[#12241A]/90">
              <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div class="w-20 h-20 rounded-lg border-2 border-[#3E9B68]/20 flex items-center justify-center text-[#3E9B68]/40 text-3xl mb-1.5">
                <el-icon><Picture v-if="scanSource === 'image'" /><Camera v-else /></el-icon>
              </div>
              <p class="text-[10px] text-center px-3" :class="cameraError ? 'text-[#FCA5A5]' : 'text-[#A7D9BC]'">
                {{ scanSource === 'image' ? $t('agentDelivery.scanImageHint') : cameraError || (cameraActive ? $t('agentOrders.cameraScanningHint') : $t('agentOrders.cameraStartingHint')) }}
              </p>
            </div>

            <button
              v-if="isFinalScanDemo"
              type="button"
              data-demo-target="scan-viewfinder"
              class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-[#A7D9BC] cursor-pointer"
              @click="completeScanDemo"
            >
              <el-icon class="text-4xl"><Camera /></el-icon>
              <span class="rounded-lg bg-[#326445] px-4 py-2 text-sm font-bold text-white">{{ $t('demo.simulateVerification') }}</span>
            </button>

            <!-- 取景器四角定位框 -->
            <div v-if="scanSource === 'camera'" class="relative w-48 h-48 sm:w-52 sm:h-52 border-2 border-dashed border-[#6FBF92]/80 rounded-lg flex items-center justify-center pointer-events-none z-10">
              <!-- 四角强化 L 标 -->
              <div class="absolute -top-1 -start-1 w-4 h-4 border-t-3 border-s-3 border-[#6FBF92]"></div>
              <div class="absolute -top-1 -end-1 w-4 h-4 border-t-3 border-e-3 border-[#6FBF92]"></div>
              <div class="absolute -bottom-1 -start-1 w-4 h-4 border-b-3 border-s-3 border-[#6FBF92]"></div>
              <div class="absolute -bottom-1 -end-1 w-4 h-4 border-b-3 border-e-3 border-[#6FBF92]"></div>

              <!-- 动态上下激光扫描线 -->
              <div class="absolute start-2 end-2 h-0.5 bg-gradient-to-r rtl:bg-gradient-to-l from-transparent via-[#6FBF92] to-transparent shadow-[0_0_15px_#6FBF92] animate-pulse-scan"></div>
            </div>

            <!-- 取景提示浮条 -->
            <div v-if="scanSource === 'camera'" class="absolute bottom-2.5 inset-x-4 z-20 flex justify-center">
              <span class="px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#A7D9BC] text-[10px] tracking-wide border border-[#3E9B68]/30">
                {{ $t('orderClaim.scanningHint') }}
              </span>
            </div>
          </div>

          <!-- 取景器下半部分：自动扫码状态与手动输入 -->
          <div v-if="!isFinalScanDemo" class="pt-2 pb-1 shrink-0 space-y-2 z-20">
            <div class="grid grid-cols-2 gap-2">
              <button type="button" class="scan-source-button" :class="{ 'is-active': scanSource === 'camera' }" :aria-pressed="scanSource === 'camera'" :disabled="scanBusy" @click="resumeCameraScan">
                <el-icon class="text-xl"><Camera /></el-icon><span>{{ $t('agentDelivery.scanCamera') }}</span>
              </button>
              <button type="button" class="scan-source-button" :class="{ 'is-active': scanSource === 'image' }" :aria-pressed="scanSource === 'image'" :disabled="scanBusy" @click="chooseQrImage">
                <el-icon class="text-xl"><Picture /></el-icon><span>{{ $t('agentDelivery.scanUpload') }}</span>
              </button>
            </div>
            <input ref="qrImageInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="readQrImage" />
            <p v-if="imageErrorKey" role="alert" class="text-[11px] leading-relaxed text-[#FCA5A5]">{{ $t(imageErrorKey) }}</p>
            <p v-else class="text-[10px] text-center text-[#A7D9BC] leading-relaxed" role="status">{{ scanSource === 'image' ? $t('agentDelivery.scanImageHint') : cameraError || (cameraActive ? $t('agentOrders.cameraScanningHint') : $t('agentOrders.cameraStartingHint')) }}</p>

            <div class="flex items-center justify-between gap-2 pt-1 border-t border-[#1F3326]/80">
              <button
                type="button"
                class="text-[11px] text-[#8A9A8F] hover:text-white underline cursor-pointer"
                :disabled="scanBusy"
                @click="showManualInput = !showManualInput"
              >
                {{ showManualInput ? $t('agentOrders.collapseInput') : $t('agentOrders.manualInput') }}
              </button>
            </div>

            <!-- 折叠手动输入框 -->
            <div v-if="showManualInput" class="flex items-center gap-1.5 pt-0.5">
              <el-input
                v-model="scanInputCode"
                :disabled="scanBusy"
                size="small"
                :placeholder="$t('agentOrders.manualInputPlaceholder')"
                clearable
                @keyup.enter="handleLookupCode"
              />
              <el-button size="small" type="primary" :loading="lookupLoading" :disabled="scanBusy" @click="handleLookupCode">
                {{ $t('agentOrders.queryBtn') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 扫描代理向政府下单凭证后展示订单信息 -->
        <div
          v-else-if="claimStep === 'government-order' && verifiedGovernmentOrder"
          class="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 custom-scrollbar">
          <div class="rounded-xl bg-[#E1F4E4] border border-[#C7E0CE] p-4 text-center">
            <div class="mx-auto mb-2 w-12 h-12 rounded-full bg-white text-[#326445] flex items-center justify-center">
              <el-icon class="text-2xl"><CircleCheck /></el-icon>
            </div>
            <div class="text-lg font-bold text-[#1F3326]">{{ verifiedGovernmentOrder.orderNo }}</div>
            <div class="text-xs text-[#58685D] font-mono mt-1">{{ verifiedGovernmentOrder.voucherCode }}</div>
          </div>

          <div class="rounded-xl bg-white border border-[#D9E5DB] divide-y divide-[#E9F1EB] text-xs">
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('agentG2B.qrAgentLabel') }}</span>
              <span class="font-mono text-end">{{ verifiedGovernmentOrder.agentId || '—' }}</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('agentG2B.qrCenterLabel') }}</span>
              <span class="text-end">{{ verifiedGovernmentOrder.centerName || '—' }}<span v-if="verifiedGovernmentOrder.centerId"> ({{ verifiedGovernmentOrder.centerId }})</span></span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('agentG2B.qrTimeSlotLabel') }}</span>
              <span class="text-end">{{ verifiedGovernmentOrder.timeSlot || '—' }}</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('agentG2B.qrVehicleLabel') }}</span>
              <span class="text-end">{{ formatVehicleNo(verifiedGovernmentOrder.deliveryVehicleNo) || '—' }} ({{ verifiedGovernmentOrder.logisticsMode === 'DISPATCH' ? $t('agentG2B.modeDispatch') : $t('agentG2B.modePickup') }})</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('agentG2B.qrPaidAmountLabel') }}</span>
              <span class="font-mono font-bold text-[#2F5B44]">{{ $t('agentG2B.qrPaidAmountVal', { amount: Number(verifiedGovernmentOrder.totalAmount || 0).toLocaleString() }) }}</span>
            </div>
          </div>

          <div class="rounded-xl bg-white border border-[#D9E5DB] p-3 text-xs">
            <div class="font-bold text-[#43554B] mb-2">{{ $t('agentG2B.qrIncludeItems') }}</div>
            <div v-for="(item, index) in verifiedGovernmentOrder.items || []" :key="index" class="flex justify-between gap-3 py-1 border-t border-[#E9F1EB]">
              <span>{{ item.itemName ? formatItemName(item.itemName) : '—' }}</span>
              <strong class="font-mono">{{ item.qty }}{{ item.unit }}</strong>
            </div>
          </div>

          </div>
          <div class="scan-action-tray shrink-0 p-3 bg-white/95 border-t border-[#D9E5DB]/90 z-20">
            <el-button type="success" class="w-full whitespace-normal leading-snug" @click="retakePhoto">
              {{ $t('agentDelivery.scanAgain') }}
            </el-button>
          </div>
        </div>

        <!-- 扫描电子配给卡后展示持卡人信息 -->
        <div
          v-else-if="claimStep === 'citizen-card' && verifiedCitizenCard"
          class="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 custom-scrollbar">
          <div class="rounded-xl bg-[#E1F4E4] border border-[#C7E0CE] p-4 text-center">
            <div class="mx-auto mb-2 w-12 h-12 rounded-full bg-white text-[#326445] flex items-center justify-center">
              <el-icon class="text-2xl"><CircleCheck /></el-icon>
            </div>
            <div class="text-lg font-bold text-[#1F3326]">{{ verifiedCitizenCard.headName || $t('citizenCard.legalHeadName') }}</div>
            <div class="text-xs text-[#58685D] font-mono mt-1">{{ verifiedCitizenCard.cardNo }}</div>
            <div class="text-xs text-[#326445] mt-1">{{ $t('citizenCard.totalMembersRegistered', { count: verifiedCitizenCard.memberCount || 0 }) }}</div>
          </div>

          <div class="rounded-xl bg-white border border-[#D9E5DB] divide-y divide-[#E9F1EB] text-xs">
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('citizenCard.linkedPaperBook') }}</span>
              <span class="font-mono text-end">{{ verifiedCitizenCard.paperCardNo || '—' }}</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('citizen.province') }} / {{ $t('citizen.district') }}</span>
              <span class="text-end">{{ [verifiedCitizenCard.province, verifiedCitizenCard.district].filter(Boolean).join(' · ') || '—' }}</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('citizenCard.agentStore') }}</span>
              <span class="text-end">{{ verifiedCitizenCard.agentName || '—' }}</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('citizenCard.agentCodePrefix') }}</span>
              <span class="font-mono">{{ verifiedCitizenCard.agentId || '—' }}</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('citizenCard.securityCipherLabel') }}</span>
              <span class="font-mono text-end">{{ verifiedCitizenCard.verificationCode || '—' }}</span>
            </div>
            <div class="p-3 flex justify-between gap-3">
              <span class="text-[#8A9A8F]">{{ $t('citizenCard.recordActive') }}</span>
              <span class="font-bold text-[#326445]">{{ verifiedCitizenCard.status || $t('citizenCard.statusActive') }}</span>
            </div>
          </div>

          </div>
          <div class="scan-action-tray shrink-0 p-3 bg-white/95 border-t border-[#D9E5DB]/90 z-20">
            <el-button type="success" class="w-full whitespace-normal leading-snug" @click="retakePhoto">
              {{ $t('agentDelivery.scanAgain') }}
            </el-button>
          </div>
        </div>

        <!-- ====================================================== -->
        <!-- 扫码状态异常红色拦截面板 -->
        <!-- ERR_FROZEN 已冻结 / ERR_QUOTA 配额不足 / ERR_DUPLICATE 重复领取 -->
        <!-- ERR_EXPIRED 提货码过期 / ERR_CARD 卡注销挂失 / ERR_SYS 系统错误 -->
        <!-- ====================================================== -->
        <div
          v-else-if="claimStep === 'scan-error' && scanStatusError"
          class="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 custom-scrollbar">
            <!-- 红色错误头部 -->
            <div class="rounded-xl bg-[#FBEAEA] border border-[#E5B8B8] p-4 text-center">
              <div class="mx-auto mb-2 w-12 h-12 rounded-full bg-white text-[#C04442] flex items-center justify-center">
                <el-icon class="text-2xl"><CircleCloseFilled /></el-icon>
              </div>
              <div class="text-base font-bold text-[#C04442] leading-snug">
                {{ $t(`scanGuard.${scanErrorMeta.titleKey}`) }}
              </div>
              <div class="mt-1.5 inline-flex items-center px-2 py-0.5 rounded bg-[#C04442] text-white text-[10px] font-mono font-bold tracking-wider">
                {{ scanStatusError.code }}
              </div>
              <div v-if="scanStatusError.cardNo" class="text-xs text-[#8A4A48] font-mono mt-1.5">
                {{ scanStatusError.cardNo }}<span v-if="scanStatusError.headName"> · {{ scanStatusError.headName }}</span>
              </div>
            </div>

            <!-- 异常明细（按错误码渲染） -->
            <div class="rounded-xl bg-white border border-[#E5B8B8] divide-y divide-[#F3E3E3] text-xs">
              <!-- ERR_FROZEN：红色提示冻结原因 -->
              <div v-if="scanStatusError.code === 'ERR_FROZEN'" class="p-3 flex justify-between gap-3">
                <span class="text-[#8A9A8F]">{{ $t('scanGuard.errFrozenReasonLabel') }}</span>
                <span class="font-bold text-[#C04442] text-end">
                  {{ scanStatusError.freezeReason ? formatFreezeReason(scanStatusError.freezeReason) : $t('scanGuard.errFrozenReasonNone') }}
                </span>
              </div>

              <!-- ERR_QUOTA：剩余可领量与本次请求量差额 -->
              <template v-if="scanStatusError.code === 'ERR_QUOTA'">
                <div class="p-3 flex justify-between gap-3">
                  <span class="text-[#8A9A8F]">{{ $t('scanGuard.errQuotaRemainingLabel') }}</span>
                  <span class="font-mono font-bold text-[#1F3326]">{{ scanStatusError.remaining }} {{ $t('scanGuard.errQuotaUnit') }}</span>
                </div>
                <div class="p-3 flex justify-between gap-3">
                  <span class="text-[#8A9A8F]">{{ $t('scanGuard.errQuotaRequestedLabel') }}</span>
                  <span class="font-mono font-bold text-[#1F3326]">{{ scanStatusError.requested }} {{ $t('scanGuard.errQuotaUnit') }}</span>
                </div>
                <div class="p-3 flex justify-between gap-3 bg-[#FBEAEA]/60">
                  <span class="text-[#8A9A8F]">{{ $t('scanGuard.errQuotaDeficitLabel') }}</span>
                  <span class="font-mono font-bold text-[#C04442]">-{{ scanStatusError.deficit }} {{ $t('scanGuard.errQuotaUnit') }}</span>
                </div>
                <div class="p-3 text-[11px] text-[#8A9A8F]">
                  {{ $t('scanGuard.errQuotaMemberNote', { memberCount: scanStatusError.memberCount, eligible: scanStatusError.eligibleMembers }) }}
                </div>
              </template>

              <!-- ERR_DUPLICATE：本期已核销记录 -->
              <template v-if="scanStatusError.code === 'ERR_DUPLICATE'">
                <div class="p-3 flex justify-between gap-3">
                  <span class="text-[#8A9A8F]">{{ $t('scanGuard.errDuplicatePeriodLabel') }}</span>
                  <span class="font-bold text-[#1F3326]">{{ scanStatusError.claimPeriod || '—' }}</span>
                </div>
                <div class="p-3 space-y-2">
                  <div class="font-bold text-[#43554B]">{{ $t('scanGuard.errDuplicateRecordsLabel') }}</div>
                  <div
                    v-for="(rec, ri) in scanStatusError.claimedRecords"
                    :key="ri"
                    class="bg-[#F7F7F5] border border-[#E5E0DA] rounded-lg p-2 space-y-1"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="font-mono font-bold text-[#2A5440]">{{ rec.claimVoucherNo }}</span>
                      <span class="text-[10px] text-[#8A9A8F] font-mono">{{ rec.claimTime }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="(it, ii) in (rec.claimedItems || [])"
                        :key="ii"
                        class="bg-white border border-[#D9E5DB] px-1.5 py-0.5 rounded text-[10px] text-[#43554B]"
                      >
                        {{ formatItemName(it.itemName) }}: <strong>{{ it.qty }}{{ it.unit }}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ERR_EXPIRED：提货码签发时间与动态有效期 -->
              <template v-if="scanStatusError.code === 'ERR_EXPIRED'">
                <div class="p-3 flex justify-between gap-3">
                  <span class="text-[#8A9A8F]">{{ $t('scanGuard.errExpiredIssuedAtLabel') }}</span>
                  <span class="font-mono text-[#1F3326] text-end">{{ formatIssuedAt(scanStatusError.issuedAt) }}</span>
                </div>
                <div class="p-3 flex justify-between gap-3">
                  <span class="text-[#8A9A8F]">{{ $t('scanGuard.errExpiredValidityLabel') }}</span>
                  <span class="font-bold text-[#C04442]">{{ $t('scanGuard.errExpiredValidityValue', { minutes: scanStatusError.validMinutes }) }}</span>
                </div>
              </template>

              <!-- ERR_CARD：配给卡状态 -->
              <div v-if="scanStatusError.code === 'ERR_CARD'" class="p-3 flex justify-between gap-3">
                <span class="text-[#8A9A8F]">{{ $t('scanGuard.errCardStatusLabel') }}</span>
                <span class="font-bold text-[#C04442] text-end">{{ formatCardStatus(scanStatusError.cardStatus) }}</span>
              </div>

              <!-- ERR_SYS：系统错误明细（可空） -->
              <div v-if="scanStatusError.code === 'ERR_SYS'" class="p-3 text-[11px] text-[#8A9A8F]">
                {{ scanStatusError.detail || '' }}
              </div>
            </div>

            <!-- 红色处理引导 -->
            <div class="rounded-xl bg-[#FDF3F3] border border-[#E5B8B8] p-3 text-xs text-[#A03E3C] leading-relaxed">
              <div class="font-bold mb-1">{{ $t('scanGuard.guideTitle') }}</div>
              <div>{{ $t(`scanGuard.${scanErrorMeta.guideKey}`) }}</div>
            </div>
          </div>
          <div class="scan-action-tray shrink-0 p-3 bg-white/95 border-t border-[#D9E5DB]/90 z-20 space-y-1.5">
            <el-button type="danger" class="w-full font-bold" @click="retakePhoto">
              {{ $t('scanGuard.rescanBtn') }}
            </el-button>
            <el-button class="w-full" @click="closeScanVerifyModal">
              {{ $t('scanGuard.closeBtn') }}
            </el-button>
          </div>
        </div>

        <!-- ====================================================== -->
        <!-- 页面 2：核验成功后的【实物交割核销确认单】 (Step 2) -->
        <!-- ====================================================== -->
        <div
          v-else-if="claimStep === 'confirm' && verifiedOrder"
          class="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <!-- 中间自适应可滚动信息区 (带细微滚动条，不会挤压底部按钮) -->
          <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 space-y-2.5 custom-scrollbar">
            <!-- 识别成功绿色彩条 -->
            <div class="p-2.5 rounded-lg bg-[#3E9B68]/10 border border-[#3E9B68]/30 backdrop-blur-sm flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-2">
                <el-icon class="text-[#2F7A50] text-lg"><CircleCheck /></el-icon>
                <div>
                  <span class="font-bold text-[#12241A] block text-xs">{{ $t('scanHandover.matchedTitle') }}</span>
                  <span class="font-mono text-[10px] text-[#2F5B44]">{{ $t('agentOrders.codeLabel') }}: {{ verifiedOrder.pickupCode }}</span>
                </div>
              </div>
              <el-button size="small" text type="info" @click="retakePhoto">{{ $t('agentDelivery.scanAgain') }}</el-button>
            </div>

            <!-- 户主与送货信息卡片 -->
            <div class="p-3 rounded-lg bg-white/80 border border-[#D9E5DB]/80 backdrop-blur-sm shadow-sm space-y-1.5 text-xs">
              <div class="flex items-center justify-between text-[#1F3326]">
                <span class="min-w-0 break-words font-bold text-sm">{{ scanOrderText(verifiedOrder.headName, 'recipient', locale) }}</span>
                <bdi dir="ltr" class="shrink-0 ms-2 font-mono text-[#58685D]">{{ verifiedOrder.phone }}</bdi>
              </div>
              <div class="flex items-center justify-between text-[11px] text-[#58685D]">
                <span>{{ $t('orderClaim.cardNo') }}: <b class="font-mono text-[#1F3326]">{{ verifiedOrder.cardNo }}</b></span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="verifiedOrder.deliveryType === 'HOME_DELIVERY' ? 'bg-[#E1F4E4] text-[#2A5440]' : 'bg-[#E1F4E4] text-[#2F5B44]'">
                  {{ verifiedOrder.deliveryType === 'HOME_DELIVERY' ? $t('agentOrders.typeDelivery') : $t('agentOrders.typePickup') }}
                </span>
              </div>
              <div class="text-[11px] text-[#58685D] flex items-start gap-1 whitespace-normal">
                <el-icon class="text-[#8A9A8F] shrink-0"><Location /></el-icon>
                <span class="break-words">{{ scanOrderText(verifiedOrder.deliveryAddress, 'address', locale) || formatAgentName(verifiedOrder.agentName) }}</span>
              </div>
            </div>

            <!-- 配发物资明细与代销站现货库存实时扣减预演 -->
            <div class="space-y-1.5">
              <h3 class="text-xs font-bold text-[#43554B]">{{ $t('scanHandover.title') }}</h3>
              <p v-if="claimStockLoading || claimStockError" role="status" class="text-[11px] text-[#7A5F21]">{{ $t(claimStockLoading ? 'scanHandover.stockLoading' : 'scanHandover.stockLoadFailed') }}</p>

              <div class="grid grid-cols-2 gap-2" data-testid="scan-item-grid">
                <div
                  v-for="(item, idx) in verifiedOrder.items"
                  :key="item.itemCode || idx"
                  class="min-w-0 p-2.5 rounded-lg bg-white/80 border border-[#D9E5DB]/80 shadow-sm text-xs space-y-1.5"
                  data-testid="scan-item-card"
                >
                  <h4 class="font-bold leading-snug break-words text-[#1F3326]">{{ scanItemName(item, locale) }}</h4>
                  <div class="flex flex-wrap items-center justify-between gap-x-1 gap-y-0.5 text-[11px]"><span class="text-[#58685D]">{{ $t('scanHandover.issued') }}</span><bdi class="font-bold" dir="ltr">{{ scanQuantity(item.qty, item) }}</bdi></div>
                  <div class="border-t border-[#E1EAE3] pt-1.5 space-y-1 text-[10px]">
                    <div class="flex flex-wrap justify-between gap-x-1 gap-y-0.5 text-[#58685D]"><span>{{ $t('scanHandover.before') }}</span><bdi dir="ltr">{{ scanQuantity(getStockOnHand(item.itemCode), item) }}</bdi></div>
                    <div class="flex flex-wrap justify-between gap-x-1 gap-y-0.5 font-bold text-[#2F5B44]"><span>{{ $t('scanHandover.after') }}</span><bdi dir="ltr">{{ scanQuantity(getStockOnHand(item.itemCode) == null ? null : Math.max(0, getStockOnHand(item.itemCode) - Number(item.qty || 0)), item) }}</bdi></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 自付规费结算与财政全额直补信息 -->
            <div class="p-2.5 rounded-lg bg-[#D3AF62]/10 border border-[#D3AF62]/30 backdrop-blur-sm flex items-center justify-between text-xs">
              <span class="text-[#6B5321] font-medium text-[11px]">{{ $t('scanHandover.subsidy') }}</span>
              <div class="text-end">
                <span class="text-[10px] text-[#7A5F21] block">{{ $t('scanHandover.paid') }}</span>
                <bdi dir="ltr" class="font-mono font-bold text-[#5A4718] text-sm">IQD {{ Number(verifiedOrder.selfPayAmount || 0).toLocaleString(locale) }}</bdi>
              </div>
            </div>

          </div>

          <!-- 底部固定操作托盘 (永远位于视口底部，绝不被弹窗挡住) -->
          <div class="scan-action-tray shrink-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#D9E5DB]/90 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] space-y-1.5 z-20">
            <el-button
              type="success"
              size="large"
              :loading="claiming"
              :disabled="claimStockLoading || claimStockError || verifiedOrder.items?.some(item => getStockOnHand(item.itemCode) == null)"
              class="w-full h-auto min-h-12 whitespace-normal text-center leading-snug font-bold shadow-md rounded-lg bg-[#2F7A50] hover:bg-[#2F5B44] border-none text-white text-sm py-2.5"
              @click="submitConfirmClaim"
            >
              <el-icon class="me-1.5"><Check /></el-icon>
              {{ $t('orderClaim.confirmDeliveryBtn') }}
            </el-button>

            <el-button size="small" class="!m-0 w-full text-[#58685D]" @click="retakePhoto">
              {{ $t('agentDelivery.scanAgain') }}
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
          <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 space-y-3 custom-scrollbar">
            <!-- 成功标头 -->
            <div class="text-center space-y-1 pt-1">
              <div class="w-12 h-12 bg-[#E1F4E4] text-[#2F7A50] rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <h3 class="text-base font-bold text-[#1B3123]">{{ $t('orderClaim.claimSuccessTitle') }}</h3>
              <p class="text-[11px] text-[#58685D]">{{ $t('agentOrders.receiptSubtitle') }}</p>
            </div>

            <!-- 伊拉克贸易部官方交接小票纸 (高纵深长小票) -->
            <div class="p-3.5 rounded-lg bg-white/85 backdrop-blur-sm border-2 border-dashed border-[#C9DBCE] shadow-sm space-y-2.5 relative">
              <!-- 电子公章印戳 -->
              <div class="absolute end-3 bottom-3 pointer-events-none opacity-85 border-2 border-[#2F7A50] rounded-full w-20 h-20 flex flex-col items-center justify-center text-[#2F5B44] rotate-[-12deg] scale-90">
                <span class="text-[8px] font-bold">REPUBLIC OF IRAQ</span>
                <span class="text-[8px] font-bold">MOT VERIFIED</span>
                <span class="text-[7px] font-mono">100% BALANCED</span>
              </div>

              <div class="flex items-center justify-between border-b border-[#D9E5DB] pb-2">
                <span class="font-bold text-[#1F3326] text-xs">{{ $t('scanHandover.receipt') }}</span>
                <span class="font-mono text-[#2F5B44] font-bold text-xs">{{ claimReceipt.claimVoucherNo }}</span>
              </div>

              <div class="grid grid-cols-2 gap-1.5 text-[11px] text-[#58685D]">
                <div>{{ $t('agentOrders.receivingFamily') }}: <b class="text-[#1B3123]">{{ scanOrderText(claimReceipt.order?.headName, 'recipient', locale) }}</b></div>
                <div>{{ $t('orderClaim.cardNo') }}: <b class="text-[#1B3123] font-mono">{{ claimReceipt.order?.cardNo }}</b></div>
                <div>{{ $t('agentOrders.deliveryTime') }}: <span class="font-mono">{{ claimReceipt.deliveredAt }}</span></div>
                <div>{{ $t('agentOrders.redemptionStation') }}: <span class="font-bold text-[#1F3326]">{{ formatAgentName(claimReceipt.order?.agentName) }}</span></div>
              </div>

              <!-- 扣减清单 -->
              <div class="pt-2 border-t border-[#D9E5DB] space-y-1">
                <div class="text-[10px] font-bold text-[#58685D]">{{ $t('agentOrders.deductionSummaryTitle') }}</div>
                <div
                  v-for="(it, idx) in claimReceipt.deductedItems"
                  :key="idx"
                  class="flex items-center justify-between text-[11px] bg-[#F3F8F4]/80 p-1.5 rounded border border-[#D9E5DB]/60"
                >
                  <span class="font-medium text-[#1F3326]">{{ scanItemName(it, locale) }}</span>
                  <span class="font-mono font-bold text-[#2F5B44]">-<bdi dir="ltr">{{ scanQuantity(it.qty, it) }}</bdi> · {{ $t('agentOrders.stockRemaining') }}: <bdi dir="ltr">{{ scanQuantity(it.afterOnHand, it) }}</bdi></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部固定打印与完成操作托盘 (永远位于视口底部，绝不被弹窗挡住) -->
          <div class="scan-action-tray shrink-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#D9E5DB]/90 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] space-y-1.5 z-20">
            <el-button class="w-full font-bold" @click="printReceipt">
              <el-icon class="me-1"><Printer /></el-icon>
              {{ $t('orderClaim.printReceiptBtn') }}
            </el-button>
            <el-button type="primary" size="large" class="w-full font-bold rounded-lg" @click="closeScanVerifyModal">
              {{ $t('orderClaim.closeBtn') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRationI18n } from '../../../utils/rationI18n.js';
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import { BrowserQRCodeReader } from '@zxing/browser';
import { parseRcmQrPayload } from '@/utils/qrPayload';
import { decodeQrImage } from '@/utils/qrImage.js';
import { canonicalDeliveryVehicle, formatDeliveryVehicle, formatDeliveryTime } from '@/utils/deliveryEnums.js';
import { scanOrderText, scanItemName, scanUnitKey } from '@/utils/scanOrderDisplay.js';

const route = useRoute();
const router = useRouter();
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
  CircleCloseFilled,
  SuccessFilled,
  Document,
  Camera,
  Picture,
  Printer,
  Loading
} from '@element-plus/icons-vue';
import {
  getAgentCitizenOrders,
  dispatchCitizenOrder,
  lookupCitizenOrderByCode,
  verifyAndClaimCitizenOrder,
  getAgentLocalStocks
} from '@/api/agent';
import { verifyCitizenCardAndQuota, getCitizenClaimRecords } from '@/api/warehouse';
import { evaluateCitizenCardScan, createScanSystemError, getScanErrorMeta } from '@/utils/scanStatusGuard';
import { localizeFreezeReason } from '@/utils/freezeReason.js';
import { onTabMessage } from '@/utils/crossTabBus';
import { getMyCouriers } from '@/api/my';
import { isDemoActive, demoSubStep, setDemoStep, activateDemo } from '../../../utils/demoState.js';
import { deliveryPriority, sortDeliveryOrders } from '@/utils/deliveryPriority';

const { t, locale } = useI18n();
const { w, formatRationItem } = useRationI18n();
const authStore = useAuthStore();
const isEn = computed(() => locale.value === 'en');

function formatItemName(name) {
  return formatRationItem(name);
}

function formatHeadName(name) {
  return w(name);
}

function formatDeliveryAddress(addr) {
  if (!addr) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (addr.includes('卡尔赫') || addr.includes('曼苏尔')) return 'Baghdad · Karkh Dist · Mansour 14th St No. 8';
    if (addr.includes('鲁萨法') || addr.includes('卡拉达')) return 'Baghdad · Rusafa Dist · Karrada Inner St No. 22';
    if (addr.includes('巴格达')) return addr.replace('巴格达省', 'Baghdad Prov, ').replace('号院', ', No. ').replace('街道', ' St');
  } else if (lang === 'ar') {
    if (addr.includes('卡尔赫') || addr.includes('曼苏尔')) return 'بغداد · قاطع الكرخ · المنصور زقاق 14 دار 8';
    if (addr.includes('鲁萨法') || addr.includes('卡拉达')) return 'بغداد · قاطع الرصافة · الكرادة داخل دار 22';
  } else if (lang === 'ckb') {
    if (addr.includes('卡尔赫') || addr.includes('曼苏尔')) return 'بەغدا · کەرخ · مەنسوور کۆڵانی ١٤ خانووی ٨';
    if (addr.includes('鲁萨法') || addr.includes('卡拉达')) return 'بەغدا · ڕەسافە · کەڕادە ناوەوە خانووی ٢٢';
  }
  return addr;
}

function formatAgentName(name) {
  if (!name) return '';
  const translated = w(name);
  if (translated !== name) return translated;
  const lang = locale.value;
  if (lang === 'en') {
    if (name.includes('卡尔赫第一')) return 'Karkh 1st Central Ration Station (Mansour)';
    if (name.includes('卡拉达')) return 'Karrada 1st Community Distribution Point';
    if (name.includes('鲁萨法')) return 'Rusafa 2nd Food Security Co-op';
  } else if (lang === 'ar') {
    if (name.includes('卡尔赫第一')) return 'منفذ الكرخ الأول لتوزيع التموين (المنصور)';
    if (name.includes('卡拉达')) return 'منفذ الكرادة الأول للسلع التموينية';
    if (name.includes('鲁萨法')) return 'جمعية الرصافة الثانية للأمن الغذائي';
  } else if (lang === 'ckb') {
    if (name.includes('卡尔赫第一')) return 'بنکەی یەکەمی دابەشکردنی کەرخ (مەنسوور)';
    if (name.includes('卡拉达')) return 'بنکەی یەکەمی کەڕادە';
    if (name.includes('鲁萨法')) return 'کۆمەڵەی دووەمی ئاسایشی خۆراکی ڕەسافە';
  }
  return name;
}

function formatDeliveryPerson(person) {
  if (!person) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (person.includes('前台备货员') || person.includes('备货员')) return 'Store Inventory Clerk';
    if (person.includes('哈希姆·阿里') || person.includes('哈希姆')) return 'Hashim Ali (Express Van)';
    if (person.includes('萨米尔·卡西姆') || person.includes('萨米尔')) return 'Samir Qasim (Cold-chain)';
  } else if (lang === 'ar') {
    if (person.includes('前台备货员') || person.includes('备货员')) return 'موظف تجهيز البضائع بالمنفذ';
    if (person.includes('哈希姆·阿里') || person.includes('哈希姆')) return 'هاشم علي (شاحنة سريعة)';
    if (person.includes('萨米尔·卡西姆') || person.includes('萨米尔')) return 'سمير قاسم (شاحنة مبردة)';
  } else if (lang === 'ckb') {
    if (person.includes('前台备货员') || person.includes('备货员')) return 'کارمەندی ئامادەکردنی کاڵا';
    if (person.includes('哈希姆·阿里') || person.includes('哈希姆')) return 'هاشم عەلی (بارهەڵگری خێرا)';
    if (person.includes('萨米尔·卡西姆') || person.includes('萨米尔')) return 'سەمیر قاسم (ساردکەرەوە)';
  }
  return person;
}

const formatVehicleNo = value => formatDeliveryVehicle(value, locale.value);
const formatEstimatedTime = value => formatDeliveryTime(value, locale.value);

function formatUnit(unit) {
  if (!unit) return '';
  const lang = locale.value;
  if (lang === 'en') {
    if (unit === '公斤' || unit === 'KG') return 'KG';
    if (unit === '升' || unit === 'L') return 'L';
    if (unit === '包' || unit === '袋') return 'pkts';
  } else if (lang === 'ar') {
    if (unit === '公斤' || unit === 'KG') return 'كجم';
    if (unit === '升' || unit === 'L') return 'لتر';
    if (unit === '包' || unit === '袋') return 'كيس';
  } else if (lang === 'ckb') {
    if (unit === '公斤' || unit === 'KG') return 'کگم';
    if (unit === '升' || unit === 'L') return 'لیتر';
    if (unit === '包' || unit === '袋') return 'دانە';
  }
  return unit;
}

watch(locale, () => {
  loadOrders();
});

// 数据状态
const loading = ref(false);
const orders = ref([]);
const priorityNow = ref(Date.now());
let priorityTimer;
const priorityFor = (order) => deliveryPriority(order, priorityNow.value);
const urgentCount = computed(() => orders.value.filter((order) => priorityFor(order).rank <= 1).length);
const formatDeadline = (timestamp) => new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : locale.value === 'ckb' ? 'ckb-IQ' : locale.value === 'ar' ? 'ar-IQ' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp);
function openOrderDetails(order) {
  const orderId = order.orderId || order.id || order.ticketNo || order.pickupCode;
  if (!orderId) { ElMessage.warning(t('agentDelivery.orderNotFound')); return; }
  router.push({ name: 'AgentDeliveryOrderDetail', params: { orderId }, query: { role: 'agent', layout: isAppMode.value ? 'app' : 'web' } });
}
const searchKeyword = ref('');
const statusFilter = ref('ALL');
const deliveryTypeFilter = ref('ALL');

// 本地现货库存表
const localStocks = ref([]);
const claimStockLoading = ref(false), claimStockError = ref(false);

function getStockOnHand(itemCode) {
  const s = localStocks.value.find((it) => it.itemCode === itemCode);
  return s?.currentOnHand != null && Number.isFinite(Number(s.currentOnHand)) ? Number(s.currentOnHand) : null;
}

function scanQuantity(quantity, item) {
  if (quantity == null || !Number.isFinite(Number(quantity))) return '—';
  const key = scanUnitKey(item);
  const unit = key ? t(`scanHandover.${key}`) : item?.unit || '';
  return `${new Intl.NumberFormat(locale.value).format(Number(quantity))} ${unit}`.trim();
}

async function loadClaimStocks(order, token) {
  localStocks.value = []; claimStockError.value = false; claimStockLoading.value = true;
  try {
    if (!order.agentId) throw new Error('Missing outlet');
    const result = await getAgentLocalStocks(order.agentId);
    if (!isScanCurrent(token)) return;
    localStocks.value = Array.isArray(result) ? result : result?.data || [];
    claimStockError.value = (order.items || []).some(item => getStockOnHand(item.itemCode) == null);
  } catch {
    if (isScanCurrent(token)) claimStockError.value = true;
  } finally {
    if (isScanCurrent(token)) claimStockLoading.value = false;
  }
}

// 快速派单弹窗
const dispatchModalVisible = ref(false);
const dispatching = ref(false);
const currentDispatchOrder = ref(null);
const managedCouriers = ref([]);
const selectedCourierId = ref('');
const dispatchForm = ref({
  deliveryPerson: '哈希姆·阿里 (保供急送专员)',
  driverPhone: '+964 780 999 8811',
  vehicleNo: 'BG-78219 (EXPRESS_TRUCK)',
  estimatedTime: '30分钟内送达'
});

const dispatchVehicleInput = computed({
  get: () => formatVehicleNo(dispatchForm.value.vehicleNo),
  set: value => { dispatchForm.value.vehicleNo = canonicalDeliveryVehicle(value); }
});

const quickDrivers = [
  {
    name: '哈希姆·阿里 (保供急送专员)',
    phone: '+964 780 999 8811',
    vehicleNo: 'BG-78219 (EXPRESS_TRUCK)',
    time: '30分钟内送达'
  },
  {
    name: '萨米尔·卡西姆 (微网格骑手)',
    phone: '+964 771 223 9090',
    vehicleNo: 'BG-33812 (COLD_CHAIN_VEHICLE)',
    time: '1小时内送达'
  }
];

function applyQuickDriver(idx) {
  selectedCourierId.value = '';
  const d = quickDrivers[idx];
  if (d) {
    dispatchForm.value.deliveryPerson = idx === 0 ? (t('agentOrders.driver1Name') || d.name) : (t('agentOrders.driver2Name') || d.name);
    dispatchForm.value.driverPhone = d.phone;
    dispatchForm.value.vehicleNo = d.vehicleNo;
    dispatchForm.value.estimatedTime = d.time;
  }
  // 演示模式：用户点选配送员后推进至 04-3 确认出车发货（openDispatchModal 预填时弹窗尚未打开，不会误触发）
  if (isDemoActive.value && dispatchModalVisible.value) setDemoStep('step4_3');
}

function applyManagedCourier(id) {
  const courier = managedCouriers.value.find((item) => item.id === id);
  if (!courier) return;
  dispatchForm.value.deliveryPerson = courier.name;
  dispatchForm.value.driverPhone = courier.phone;
  dispatchForm.value.vehicleNo = canonicalDeliveryVehicle(courier.vehicleNo);
  if (isDemoActive.value && dispatchModalVisible.value) setDemoStep('step4_3');
}

async function loadManagedCouriers() {
  if (authStore.currentRole !== 'agent') return;
  try {
    const couriers = await getMyCouriers();
    managedCouriers.value = couriers.filter((courier) => courier.active);
  } catch {
    managedCouriers.value = [];
  }
}

// ==========================================
// 阶段 4 核心：高纵深 APP 风格扫码与拍照核验状态
// ==========================================
const scanVerifyModalVisible = ref(false);
const isFinalScanDemo = computed(() => (
  route.query.demo === 'true' && isDemoActive.value && demoSubStep.value === 'step6_2'
));
const claimStep = ref('camera'); // 'camera' | 'citizen-card' | 'confirm' | 'receipt' | 'scan-error'
const targetPresetOrder = ref(null);
const showManualInput = ref(false);
const isFlashOn = ref(false);
const lookupLoading = ref(false);
const claiming = ref(false);
const cardVerifyLoading = ref(false);
const scanInputCode = ref('');
const verifiedOrder = ref(null);
const verifiedCitizenCard = ref(null);
const verifiedGovernmentOrder = ref(null);
const claimReceipt = ref(null);
const scanStatusError = ref(null);
const selectedOrderId = ref('');
const cameraError = ref('');
const scanSource = ref('camera');
const qrImageInput = ref(null);
const imageDecoding = ref(false);
const imageErrorKey = ref('');
const scanBusy = computed(() => imageDecoding.value || lookupLoading.value || cardVerifyLoading.value);
let imageController = null;
let scanSessionToken = 0;
let cameraRetryTimer;

const isScanCurrent = token => token === scanSessionToken && scanVerifyModalVisible.value;
function invalidateScanSession() {
  scanSessionToken += 1;
  imageController?.abort();
  imageController = null;
  window.clearTimeout(cameraRetryTimer);
  imageDecoding.value = false;
  imageErrorKey.value = '';
  lookupLoading.value = false;
  cardVerifyLoading.value = false;
}

function chooseQrImage() {
  if (scanBusy.value || !qrImageInput.value) return;
  scanSource.value = 'image';
  imageErrorKey.value = '';
  cameraError.value = '';
  stopCamera();
  qrImageInput.value.value = '';
  qrImageInput.value.click();
}

async function readQrImage(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file || !scanVerifyModalVisible.value || claimStep.value !== 'camera' || scanBusy.value) return;
  scanSource.value = 'image';
  stopCamera();
  imageController?.abort();
  const controller = new AbortController();
  imageController = controller;
  const token = scanSessionToken;
  imageDecoding.value = true;
  imageErrorKey.value = '';
  try {
    const text = await decodeQrImage(file, { signal: controller.signal });
    if (!isScanCurrent(token) || controller.signal.aborted) return;
    imageDecoding.value = false;
    await handleScannedQr(text);
  } catch (error) {
    if (!isScanCurrent(token) || controller.signal.aborted || error.code === 'aborted') return;
    imageErrorKey.value = error.code === 'image-too-large' ? 'agentDelivery.scanImageTooLarge'
      : error.code === 'no-qr' ? 'agentDelivery.scanImageNotFound' : 'agentDelivery.scanImageInvalid';
  } finally {
    if (isScanCurrent(token) && imageController === controller) {
      imageDecoding.value = false;
      imageController = null;
    }
  }
}

function resumeCameraScan() {
  if (scanBusy.value) return;
  scanSource.value = 'camera';
  imageErrorKey.value = '';
  void startCamera();
}

// 扫码状态异常对应的界面词条键（标题 / 处理指引）
const scanErrorMeta = computed(() => (
  getScanErrorMeta(scanStatusError.value?.code) || { titleKey: 'errSysTitle', guideKey: 'errSysGuide' }
));

// 摄像头实时二维码扫描控制
const videoRef = ref(null);
const cameraActive = ref(false);
const qrReader = new BrowserQRCodeReader();
let scannerControls = null;
let cameraStartToken = 0;
let scanHandled = false;

async function startCamera() {
  if (isFinalScanDemo.value) return;
  if (!videoRef.value || !scanVerifyModalVisible.value || claimStep.value !== 'camera' || scanSource.value !== 'camera' || scanBusy.value) return;
  stopCamera();
  const token = ++cameraStartToken;
  cameraError.value = '';
  cameraActive.value = false;
  scanHandled = false;

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    cameraError.value = t('agentOrders.cameraUnavailable');
    ElMessage.error(cameraError.value);
    return;
  }

  try {
    const controls = await qrReader.decodeFromConstraints({
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }, videoRef.value, (result, _error, decodeControls) => {
      if (token !== cameraStartToken || !scanVerifyModalVisible.value || claimStep.value !== 'camera' || scanSource.value !== 'camera') {
        decodeControls?.stop();
        return;
      }
      if (!result || scanHandled) return;
      scanHandled = true;
      decodeControls?.stop();
      if (scannerControls === decodeControls) scannerControls = null;
      cameraActive.value = false;
      void handleScannedQr(result.getText());
    });

    if (token !== cameraStartToken || scanHandled || !scanVerifyModalVisible.value) {
      controls.stop();
      return;
    }
    scannerControls = controls;
    cameraActive.value = true;
  } catch (err) {
    if (token !== cameraStartToken) return;
    console.warn('启动二维码扫描摄像头失败:', err);
    cameraActive.value = false;
    cameraError.value = err?.name === 'NotAllowedError' || err?.name === 'SecurityError'
      ? t('agentOrders.cameraPermissionDenied')
      : t('agentOrders.cameraUnavailable');
    ElMessage.error(cameraError.value);
  }
}

function stopCamera() {
  cameraStartToken += 1;
  scannerControls?.stop();
  scannerControls = null;
  if (videoRef.value) {
    const stream = videoRef.value.srcObject;
    stream?.getTracks?.().forEach(track => track.stop());
    videoRef.value.pause?.();
    videoRef.value.srcObject = null;
  }
  cameraActive.value = false;
  isFlashOn.value = false;
}

async function toggleFlashlight() {
  if (!scannerControls?.switchTorch) {
    ElMessage.info(t('agentOrders.flashUnavailable'));
    return;
  }
  try {
    await scannerControls.switchTorch(!isFlashOn.value);
    isFlashOn.value = !isFlashOn.value;
  } catch {
    ElMessage.info(t('agentOrders.flashUnavailable'));
  }
}

// 打开扫码核验弹窗并开始连续识别二维码
function openScanVerifyModal(order = null) {
  invalidateScanSession();
  stopCamera();
  scanSource.value = 'camera';
  scanInputCode.value = '';
  verifiedOrder.value = null;
  verifiedCitizenCard.value = null;
  verifiedGovernmentOrder.value = null;
  claimReceipt.value = null;
  scanStatusError.value = null;
  targetPresetOrder.value = order; // 暂存目标订单
  selectedOrderId.value = order?.orderId || '';
  showManualInput.value = false;
  isFlashOn.value = false;
  cameraError.value = '';
  claimStep.value = 'camera';
  scanVerifyModalVisible.value = true;

  nextTick(() => startCamera());
}

async function handleScannedQr(rawValue) {
  if (!scanVerifyModalVisible.value || claimStep.value !== 'camera') return;
  const decoded = parseRcmQrPayload(rawValue);
  if (!decoded) {
    ElMessage.warning(t('orderClaim.scanError'));
    return;
  }

  if (decoded.type === 'citizen-card') {
    stopCamera();
    await verifyCitizenCardScan(decoded.payload);
    return;
  }

  if (decoded.type === 'agent-government-order') {
    stopCamera();
    verifiedGovernmentOrder.value = decoded.payload;
    verifiedCitizenCard.value = null;
    verifiedOrder.value = null;
    claimStep.value = 'government-order';
    ElMessage.success(t('agentG2B.qrScanSuccessMsg'));
    return;
  }

  scanInputCode.value = decoded.pickupCode;
  await handleLookupCode();
}

/**
 * 扫描公民电子配给卡二维码：自动判定用户状态异常
 * - 正常：进入持卡人凭证页继续核销流程
 * - 异常：进入红色拦截面板，展示错误码/明细与处理引导（严禁异常发货）
 */
async function verifyCitizenCardScan(cardPayload) {
  const token = scanSessionToken;
  cardVerifyLoading.value = true;
  try {
    const res = await verifyCitizenCardAndQuota({ cardNo: cardPayload?.cardNo });
    if (!isScanCurrent(token)) return;
    const verification = res?.data || res;

    // 重复领取场景：拉取本期已核销流水用于红色面板展示
    let claimedRecords = [];
    if (verification?.alreadyClaimed) {
      try {
        const recordsRes = await getCitizenClaimRecords({ cardNo: cardPayload?.cardNo });
        const list = Array.isArray(recordsRes) ? recordsRes : (recordsRes?.data || []);
        claimedRecords = list
          .filter((rec) => rec?.rationCardNo === cardPayload?.cardNo)
          .slice(0, 3);
      } catch (recordErr) {
        console.warn('拉取本期核销记录失败', recordErr);
      }
    }

    if (!isScanCurrent(token)) return;
    const scanError = evaluateCitizenCardScan(cardPayload, { verification, claimedRecords });
    if (scanError) {
      scanStatusError.value = scanError;
      verifiedCitizenCard.value = null;
      verifiedOrder.value = null;
      claimStep.value = 'scan-error';
      ElMessage.error(t(`scanGuard.${scanErrorMeta.value.titleKey}`));
      return;
    }

    scanStatusError.value = null;
    verifiedCitizenCard.value = cardPayload;
    verifiedOrder.value = null;
    claimStep.value = 'citizen-card';
    ElMessage.success(t('citizenCard.qrScanSuccessMsg'));
  } catch (err) {
    if (!isScanCurrent(token)) return;
    console.error('公民卡状态核验失败', err);
    scanStatusError.value = {
      ...createScanSystemError(err?.message),
      cardNo: cardPayload?.cardNo || '',
      headName: cardPayload?.headName || ''
    };
    verifiedCitizenCard.value = null;
    verifiedOrder.value = null;
    claimStep.value = 'scan-error';
  } finally {
    if (isScanCurrent(token)) cardVerifyLoading.value = false;
  }
}

// 冻结原因本地化展示（稳定代码 → 当前语言词条，兼容历史中英文词根）
function formatFreezeReason(reason) {
  return localizeFreezeReason(reason, t);
}

// 配给卡状态本地化展示（注销 / 挂失 / 无效）
function formatCardStatus(status) {
  const s = String(status || '');
  if (/挂失|丢失|遗失|lost/i.test(s)) return t('scanGuard.errCardStatusLost');
  if (/注销|吊销|撤销|cancell/i.test(s)) return t('scanGuard.errCardStatusCancelled');
  return s || t('scanGuard.errCardStatusInvalid');
}

// 二维码签发时间格式化（ISO → 本地可读时间）
function formatIssuedAt(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 查询提货码对应的订单
async function handleLookupCode() {
  if (!scanVerifyModalVisible.value || claimStep.value !== 'camera' || lookupLoading.value || cardVerifyLoading.value) return;
  const code = scanInputCode.value.trim();
  if (!code) {
    ElMessage.warning(t('orderClaim.scanPlaceholder'));
    return;
  }
  const token = scanSessionToken;
  lookupLoading.value = true;
  try {
    const res = await lookupCitizenOrderByCode(code);
    if (!isScanCurrent(token)) return;
    stopCamera();
    const order = res?.data || res;
    if (!order?.orderId || !order?.pickupCode) throw new Error('订单查询结果不完整');
    if (targetPresetOrder.value && targetPresetOrder.value.orderId !== order.orderId) {
      scanInputCode.value = '';
      ElMessage.warning(t('agentOrders.qrTargetMismatch'));
      return;
    }
    verifiedCitizenCard.value = null;
    verifiedGovernmentOrder.value = null;
    verifiedOrder.value = order;
    selectedOrderId.value = order.orderId;
    claimStep.value = 'confirm';
    await loadClaimStocks(order, token);
    if (!isScanCurrent(token)) return;
    ElMessage.success(t('scanHandover.matched'));
  } catch (err) {
    if (!isScanCurrent(token)) return;
    console.error('检索提货订单失败', err);
    ElMessage.error(t('orderClaim.scanError'));
  } finally {
    if (isScanCurrent(token)) lookupLoading.value = false;
    if (isScanCurrent(token) && claimStep.value === 'camera' && scanSource.value === 'camera') {
      scanHandled = false;
      window.clearTimeout(cameraRetryTimer);
      cameraRetryTimer = window.setTimeout(() => startCamera(), 250);
    }
  }
}

function retakePhoto() {
  invalidateScanSession();
  stopCamera();
  scanSource.value = 'camera';
  verifiedOrder.value = null;
  verifiedCitizenCard.value = null;
  verifiedGovernmentOrder.value = null;
  claimReceipt.value = null;
  scanStatusError.value = null;
  scanInputCode.value = '';
  claimStep.value = 'camera';
  nextTick(() => startCamera());
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

    ElMessage.success(t('orderClaim.handoverSuccessMsg'));
    await loadOrders();
  } catch (err) {
    console.error('确认交货核销失败', err);
    ElMessage.error((isEnNow() ? 'Delivery verification confirmation failed, please retry' : '确认交货核销失败，请重试'));
  } finally {
    claiming.value = false;
  }
}

function printReceipt() {
  window.print?.();
  ElMessage.success((isEnNow() ? 'Sent to the station thermal receipt printer!' : '已发送至代销站热敏小票打印机！'));
}

function closeScanVerifyModal() {
  scanVerifyModalVisible.value = false;
  stopCamera();
  targetPresetOrder.value = null;
  verifiedOrder.value = null;
  verifiedCitizenCard.value = null;
  verifiedGovernmentOrder.value = null;
  claimReceipt.value = null;
  scanStatusError.value = null;
  claimStep.value = 'camera';
}

function completeScanDemo() {
  if (!isFinalScanDemo.value) return;
  closeScanVerifyModal();
  setDemoStep('step6_done');
}

function handleModalClosed() {
  if (!scanVerifyModalVisible.value) stopCamera();
}

watch(scanVerifyModalVisible, visible => {
  if (!visible) {
    invalidateScanSession();
    stopCamera();
  }
}, { flush: 'sync' });

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
    ElMessage.error((isEnNow() ? 'Failed to load order list, please retry' : '加载订单列表失败，请重试'));
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

  return sortDeliveryOrders(list, priorityNow.value);
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
      return 'bg-[#FDF3E0] text-[#7A5F21] border border-[#F2E3C6]/60';
    case 'DISPATCHED':
      return 'bg-[#EFF5F1] text-[#2F5B44] border border-[#C7E0CE]/60';
    case 'READY_FOR_PICKUP':
      return 'bg-[#FDF3E0] text-[#7A5F21] border border-[#F2E3C6]/60';
    case 'DELIVERED':
      return 'bg-[#EFF5F1] text-[#2F5B44] border border-[#C7E0CE]/60';
    default:
      return 'bg-[#E9F1EB] text-[#43554B]';
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
  loadManagedCouriers();
  dispatchModalVisible.value = true;
  // 演示模式：推进至 04-2 选择配送员
  if (isDemoActive.value) setDemoStep('step4_2');
}

// 确认出车派单
async function confirmDispatch() {
  if (!currentDispatchOrder.value) return;
  dispatching.value = true;
  // 演示模式：确认出车发货后 04 阶段演示完成（扫码核销交货由配送员线下执行，不在引导范围内）
  if (isDemoActive.value) setDemoStep('step4_done');
  try {
    await dispatchCitizenOrder(currentDispatchOrder.value.orderId, {
      deliveryPerson: dispatchForm.value.deliveryPerson,
      phone: dispatchForm.value.driverPhone,
      vehicleNo: dispatchForm.value.vehicleNo,
      estimatedTime: dispatchForm.value.estimatedTime
    });

    ElMessage.success((isEnNow() ? 'Supply fleet dispatched for delivery; order status updated synchronously!' : '已指派保供车队出车派送，订单状态已同步更新！'));
    dispatchModalVisible.value = false;
    await loadOrders();
  } catch (err) {
    console.error('指派派送失败', err);
    ElMessage.error((isEnNow() ? 'Dispatch assignment failed, please retry later' : '指派派送失败，请稍后重试'));
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

    ElMessage.success((isEnNow() ? 'Station marked stock-ready; awaiting residents to present the QR code on-site!' : '已标记网点备货就绪，等待居民到店出示二维码！'));
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
    ElMessage.success(t('citizenPurchase.copySuccess') || (isEnNow() ? 'Copied to clipboard' : '已复制到剪贴板'));
  } else {
    ElMessage.info(val);
  }
}

const crossTabUnsubs = [];

// Restore the scan window on deep links/reloads as well as the dashboard scan action.
watch(() => [route.query.action, route.query.demo, route.query.demoStep], ([action, demo, step]) => {
  if (action !== 'scan' && !(demo === 'true' && step === 'step6_2')) return;
  if (!scanVerifyModalVisible.value) openScanVerifyModal();
  if (action === 'scan') {
    router.replace({ query: { ...route.query, action: undefined } });
  }
}, { immediate: true });

onMounted(() => {
  loadOrders();
  priorityTimer = window.setInterval(() => { priorityNow.value = Date.now(); }, 60_000);

  // 全流程演示 04 阶段：URL 携带 demo=true 时激活引导（支持 demoStep 指定起始节点）
  if (route.query.demo === 'true') {
    activateDemo(String(route.query.demoStep || 'step4_1'));
  }

  // 跨标签页监听公民端下单通知
  const unsubPurchased = onTabMessage('ORDER_PURCHASED', (newOrder) => {
    loadOrders();
    ElMessage.info((isEnNow() ? `[New Order Alert] New ration order ${newOrder.orderId} submitted by citizen [${newOrder.headName}]` : `【新订单提醒】收到公民【${newOrder.headName}】提交的新配给领配订单 ${newOrder.orderId}`));
  });

  const unsubUpdated = onTabMessage('ORDER_UPDATED', () => {
    loadOrders();
  });

  crossTabUnsubs.push(unsubPurchased, unsubUpdated);
});

onBeforeUnmount(() => {
  window.clearInterval(priorityTimer);
  invalidateScanSession();
  stopCamera();
  crossTabUnsubs.forEach((fn) => fn && fn());
});
</script>

<style scoped>
.scan-source-button { display: flex; align-items: center; justify-content: center; gap: .45rem; min-height: 2.75rem; padding: .6rem .5rem; border: 1px solid #43554B; border-radius: .65rem; background: #1F3326; color: #C9DBCE; font-size: .75rem; font-weight: 600; line-height: 1.5; cursor: pointer; }
.scan-source-button.is-active { background: #326445; border-color: #7FA48C; color: white; }
.scan-source-button:hover { border-color: #D3AF62; }
.scan-source-button:focus-visible { outline: 2px solid #D3AF62; outline-offset: 2px; }
.scan-source-button:disabled { opacity: .6; cursor: wait; }
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

:global(.el-overlay.app-scan-dialog-overlay) {
  background-color: rgba(31, 51, 38, 0.42) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

:global(.el-dialog.app-scan-dialog) {
  margin: auto !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  height: min(78vh, 690px) !important;
  height: min(78dvh, 690px) !important;
  max-height: calc(100vh - 24px) !important;
  max-height: calc(100dvh - 24px) !important;
  min-height: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

:global(.app-scan-dialog .el-dialog__header) {
  display: none !important;
}

:global(.app-scan-dialog .el-dialog__body) {
  padding: 0 !important;
  height: 100% !important;
  max-height: none !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  display: flex !important;
  overflow: hidden !important;
  background: transparent !important;
}

:global(.app-scan-dialog .el-dialog__body > div) {
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
}

.scan-action-tray {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.75rem);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(138, 154, 143, 0.4);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(88, 104, 93, 0.6);
}
</style>
