<template>
  <div class="agent-g2b-panel space-y-4">
    <!-- 筛选工具栏与新建采购按钮 (已去除原顶部统计栏) -->
    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-2.5 flex-1">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索采购单号 / 提货凭证码 / 仓储中心"
          clearable
          size="small"
          style="width: 240px"
          @input="handleFilter"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <!-- 默认显示未完成采购记录 -->
        <el-select v-model="statusFilter" size="small" style="width: 170px" @change="handleFilter">
          <el-option label="未完成采购 (默认)" value="UNFINISHED" />
          <el-option label="全部采购记录" value="全部" />
          <el-option label="待支付 (禁止拣货)" value="PENDING_PAYMENT" />
          <el-option label="已付款 (待拣货)" value="PAID_WMS_PICKING" />
          <el-option label="配送在途 / 待自提" value="IN_TRANSIT" />
          <el-option label="已验收完成" value="COMPLETED" />
        </el-select>

        <el-button size="small" type="primary" plain @click="loadOrders">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 简化按钮为“新建采购” -->
      <el-button type="primary" size="small" class="font-bold shadow-xs shrink-0" @click="openCreateModal">
        <el-icon class="mr-1"><Plus /></el-icon>
        新建采购
      </el-button>
    </div>

    <!-- 采购记录列表表格 (去掉所有 G2B 字样) -->
    <el-table
      :data="pagedOrders"
      v-loading="loading"
      border
      style="width: 100%"
      class="text-xs"
    >
      <el-table-column prop="orderNo" label="采购单号" width="180">
        <template #default="{ row }">
          <div class="font-mono font-bold text-blue-700">{{ row.orderNo }}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">{{ row.createdAt }}</div>
        </template>
      </el-table-column>

      <el-table-column label="归属配给中心仓与履约方式" min-width="210">
        <template #default="{ row }">
          <div class="font-bold text-slate-900 flex items-center gap-1.5">
            <span>{{ row.centerName }}</span>
            <el-tag size="small" :type="row.logisticsMode === 'DISPATCH' ? 'success' : 'warning'" effect="light">
              {{ row.logisticsMode === 'DISPATCH' ? '中心配送' : '代理自提' }}
            </el-tag>
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5">预约时段：{{ row.timeSlot }}</div>
          <div class="text-[10px] text-slate-400 font-mono">运力车号：{{ row.deliveryVehicleNo }}</div>
        </template>
      </el-table-column>

      <el-table-column label="采购物资品类明细" min-width="230">
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

      <el-table-column label="货款金额与专户支付" width="160" align="right">
        <template #default="{ row }">
          <div class="font-mono font-bold text-slate-900 text-sm">
            {{ row.totalAmount.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">IQD</span>
          </div>
          <div class="mt-1">
            <el-tag size="small" :type="row.payStatus === 'PAID' ? 'success' : 'danger'" effect="plain">
              {{ row.payStatus === 'PAID' ? '专管专户已结算' : '待线上支付' }}
            </el-tag>
          </div>
          <div v-if="row.payTime" class="text-[10px] text-slate-400 mt-0.5">{{ row.payTime.slice(5) }}</div>
        </template>
      </el-table-column>

      <el-table-column label="仓储出库状态 / 任务" width="160" align="center">
        <template #default="{ row }">
          <div v-if="row.status === 'PENDING_PAYMENT'">
            <el-tag size="small" type="danger" effect="light">未付款·禁止拣货</el-tag>
            <div class="text-[10px] text-rose-500 mt-0.5">资金未入库</div>
          </div>
          <div v-else-if="row.status === 'PAID_WMS_PICKING'">
            <el-tag size="small" type="primary" effect="dark">WMS拣货组织中</el-tag>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ row.wmsTaskId }}</div>
          </div>
          <div v-else-if="row.status === 'IN_TRANSIT'">
            <el-tag size="small" type="warning" effect="dark">在途配送 / 待自提</el-tag>
            <div class="text-[10px] text-emerald-600 font-mono mt-0.5">提货码: {{ row.pickupVoucherCode }}</div>
          </div>
          <div v-else>
            <el-tag size="small" type="success" effect="dark">已验收·台账已入</el-tag>
            <div class="text-[10px] text-slate-400 mt-0.5">{{ row.completedAt?.slice(5) }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="短信与提货凭证" width="150">
        <template #default="{ row }">
          <div v-if="row.smsNotified" class="space-y-0.5">
            <el-tooltip :content="row.smsContent" placement="top" :width="280">
              <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 cursor-pointer font-semibold">
                <el-icon><ChatLineSquare /></el-icon>
                <span>短信已下发</span>
              </span>
            </el-tooltip>
            <div class="font-mono text-[10px] text-slate-500">{{ row.pickupVoucherCode }}</div>
          </div>
          <div v-else class="text-[11px] text-slate-400">待付款后触发通知</div>
        </template>
      </el-table-column>

      <!-- 操作栏提供二维码展示 -->
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            <!-- 待支付单据 -->
            <el-button
              v-if="row.status === 'PENDING_PAYMENT'"
              type="primary"
              size="small"
              @click="handlePayOrder(row)"
            >
              电子支付
            </el-button>

            <!-- 已支付/在途单据提供二维码展示 -->
            <el-button
              v-if="row.payStatus === 'PAID'"
              size="small"
              type="success"
              plain
              @click="showOrderQRCode(row)"
            >
              <el-icon class="mr-1"><FullScreen /></el-icon>
              提货二维码
            </el-button>

            <el-button
              size="small"
              type="primary"
              link
              @click="viewOrderDetail(row)"
            >
              详情
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="flex items-center justify-between text-xs pt-2">
      <span class="text-slate-500">共 {{ filteredOrders.length }} 条采购记录 (当前筛选: {{ statusFilter === 'UNFINISHED' ? '未完成采购' : statusFilter }})</span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        layout="sizes, prev, pager, next"
        :total="filteredOrders.length"
        size="small"
      />
    </div>

    <!-- ======================================================== -->
    <!-- 模态框 1: 新建采购弹窗 -->
    <!-- ======================================================== -->
    <!-- ======================================================== -->
    <!-- 模态框 1: 新建采购弹窗 -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="createModalVisible"
      title="新建集中批发采购"
      width="680px"
      destroy-on-close
    >
      <div class="space-y-4 text-xs">
        <!-- 顶部提示：单中心物理归属与安全库存约束 -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
          <div class="font-bold flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <el-icon><InfoFilled /></el-icon>
              <span>单中心物理绑定与配额安全约束：</span>
            </span>
            <el-tag size="small" type="primary" effect="dark" class="scale-90 font-mono">1,120 户 / 上限 1,500 户</el-tag>
          </div>
          <p class="text-[11px] leading-relaxed">
            当前代理物理归属于【{{ currentCenterName }}】。订购量既不能超过配给中心实时可用库存，也不能超过代理辖区 1,120 户对应额定配额的 1.2 倍安全冗余上限。
          </p>
        </div>

        <!-- 配给中心实时库存看板 (需求 2) -->
        <div class="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <el-icon class="text-blue-600"><OfficeBuilding /></el-icon>
              <span>【{{ currentCenterName }}】中心仓实时可用库存</span>
            </span>
            <span class="text-[11px] text-slate-400">国家粮食与加工战略储备总仓</span>
          </div>

          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div class="text-[10px] text-slate-500">特级标准面粉 (白面)</div>
              <div class="font-mono font-bold text-slate-900 text-sm sm:text-base mt-0.5 text-blue-700">
                {{ centerStock.flour.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">KG</span>
              </div>
              <div class="text-[10px] text-emerald-600 mt-0.5">● 卡尔赫战略储备仓</div>
            </div>

            <div class="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div class="text-[10px] text-slate-500">精制大米 (巴斯马蒂)</div>
              <div class="font-mono font-bold text-slate-900 text-sm sm:text-base mt-0.5 text-blue-700">
                {{ centerStock.rice.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">KG</span>
              </div>
              <div class="text-[10px] text-emerald-600 mt-0.5">● 国家第一储备粮库</div>
            </div>

            <div class="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div class="text-[10px] text-slate-500">食用植物油 (葵花籽)</div>
              <div class="font-mono font-bold text-slate-900 text-sm sm:text-base mt-0.5 text-blue-700">
                {{ centerStock.oil.toLocaleString() }} <span class="text-[10px] font-normal text-slate-500">L</span>
              </div>
              <div class="text-[10px] text-emerald-600 mt-0.5">● 液体储罐温控库</div>
            </div>
          </div>
        </div>

        <!-- 基础配置：物理中心与履约模式 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span class="block text-slate-600 mb-1 font-semibold">物理归属国家配给中心仓</span>
            <el-input :value="currentCenterName" readonly class="bg-slate-100 font-bold" />
          </div>
          <div>
            <span class="block text-slate-600 mb-1 font-semibold">履约与运输模式选择 <span class="text-rose-500">*</span></span>
            <el-select v-model="form.logisticsMode" class="w-full">
              <el-option label="中心仓统筹配送到店 (推荐)" value="DISPATCH" />
              <el-option label="代理自行前往中心仓验核自提" value="PICKUP" />
            </el-select>
          </div>
        </div>

        <!-- 预约履约/到货时间窗口：日期控件 + 时段控件 复合展示 (需求 2) -->
        <div class="p-3 bg-slate-50/70 border border-slate-200/90 rounded-xl space-y-2">
          <div class="font-semibold text-slate-700 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <el-icon class="text-indigo-600"><Calendar /></el-icon>
              <span>预约履约 / 到货时间窗口 (复合指定) <span class="text-rose-500">*</span></span>
            </span>
            <span class="text-[11px] text-indigo-700 font-mono">
              已选: {{ form.deliveryDate || '未选日期' }} | {{ form.deliverySlot || '未选时段' }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="block text-slate-500 mb-1">预约履约日期</span>
              <el-date-picker
                v-model="form.deliveryDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择履约日期"
                :disabled-date="disabledPastDates"
                class="w-full"
                style="width: 100%"
              />
            </div>
            <div>
              <span class="block text-slate-500 mb-1">履约时段窗口</span>
              <el-select v-model="form.deliverySlot" placeholder="请选择具体时段" class="w-full">
                <el-option label="08:00 - 10:00 (早间第一批)" value="08:00-10:00" />
                <el-option label="10:00 - 12:00 (上午第二批)" value="10:00-12:00" />
                <el-option label="14:00 - 16:00 (下午第一批)" value="14:00-16:00" />
                <el-option label="16:00 - 18:00 (傍晚第二批)" value="16:00-18:00" />
              </el-select>
            </div>
          </div>

          <div>
            <span class="block text-slate-500 mb-1">配送车号 / 自提车辆号牌</span>
            <el-input v-model="form.deliveryVehicleNo" placeholder="如：BAG-TRK-8891 或 代理自提车 (AGT-BAG-091)" />
          </div>
        </div>

        <!-- 订购物资申报区：中心库存与辖区配额双重硬约束 (需求 2) -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span>订购物资申报 (双重上限强管控)</span>
            <span class="text-[11px] text-blue-600 font-mono">
              辖区签约: 1,120 户 (冗余系数: 1.2x)
            </span>
          </div>

          <div class="space-y-3">
            <!-- 1. 特级面粉 -->
            <div class="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800">优质特级面粉 (标准白面 · 350 IQD/KG)</span>
                <span class="font-mono text-blue-700 font-bold">{{ (form.flourQty * 350).toLocaleString() }} IQD</span>
              </div>
              <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-6 sm:col-span-5">
                  <el-input-number
                    v-model="form.flourQty"
                    :min="0"
                    :max="maxAllowed.flour"
                    :step="500"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="col-span-6 sm:col-span-7 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2">
                  <span class="text-slate-400">辖区上限: <strong class="text-slate-700 font-mono">{{ agentQuotaLimits.flour.toLocaleString() }}</strong> KG</span>
                  <span class="text-slate-400">中心库存: <strong class="text-slate-700 font-mono">{{ centerStock.flour.toLocaleString() }}</strong> KG</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono">
                    可订上限: {{ maxAllowed.flour.toLocaleString() }} KG
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 2. 精制大米 -->
            <div class="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800">精制大米 (巴斯马蒂一等品 · 500 IQD/KG)</span>
                <span class="font-mono text-blue-700 font-bold">{{ (form.riceQty * 500).toLocaleString() }} IQD</span>
              </div>
              <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-6 sm:col-span-5">
                  <el-input-number
                    v-model="form.riceQty"
                    :min="0"
                    :max="maxAllowed.rice"
                    :step="500"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="col-span-6 sm:col-span-7 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2">
                  <span class="text-slate-400">辖区上限: <strong class="text-slate-700 font-mono">{{ agentQuotaLimits.rice.toLocaleString() }}</strong> KG</span>
                  <span class="text-slate-400">中心库存: <strong class="text-slate-700 font-mono">{{ centerStock.rice.toLocaleString() }}</strong> KG</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono">
                    可订上限: {{ maxAllowed.rice.toLocaleString() }} KG
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 3. 食用植物油 -->
            <div class="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800">精炼食用植物油 (葵花籽配方 · 1200 IQD/L)</span>
                <span class="font-mono text-blue-700 font-bold">{{ (form.oilQty * 1200).toLocaleString() }} IQD</span>
              </div>
              <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-6 sm:col-span-5">
                  <el-input-number
                    v-model="form.oilQty"
                    :min="0"
                    :max="maxAllowed.oil"
                    :step="100"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="col-span-6 sm:col-span-7 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2">
                  <span class="text-slate-400">辖区上限: <strong class="text-slate-700 font-mono">{{ agentQuotaLimits.oil.toLocaleString() }}</strong> L</span>
                  <span class="text-slate-400">中心库存: <strong class="text-slate-700 font-mono">{{ centerStock.oil.toLocaleString() }}</strong> L</span>
                  <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono">
                    可订上限: {{ maxAllowed.oil.toLocaleString() }} L
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800">核算应付采购总货款：</span>
            <span class="font-mono text-base font-bold text-blue-700">
              {{ calculatedTotalAmount.toLocaleString() }} IQD
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <el-button @click="createModalVisible = false">取消</el-button>
          <el-button type="primary" class="font-bold" @click="handleProceedToPayment">
            确认采购并前往电子支付 ({{ calculatedTotalAmount.toLocaleString() }} IQD)
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 模态框 2: 电子支付弹窗 (CBI-PAY 规费与货款专管结算) -->
    <!-- ======================================================== -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      title="集中批发采购货款结算 (粮食财政专管专户)"
      :amount="pendingOrderAmount"
      :business-no="pendingOrderNo"
      applicant-name="穆罕默德·贾巴尔 (第一配给代销店)"
      currency="IQD"
      @success="handlePaymentSuccess"
      @cancel="handlePaymentCancel"
    />

    <!-- ======================================================== -->
    <!-- 模态框 3: 提货核验二维码与出库凭证展示弹窗 -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="qrModalVisible"
      title="物资提货核验二维码与出库凭证"
      width="460px"
      align-center
      destroy-on-close
    >
      <div v-if="activeQRRow" class="space-y-4 text-xs text-center">
        <!-- 顶部中心仓与凭证说明 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-[11px]">提货配给中心仓：</span>
            <span class="font-bold text-slate-800">{{ activeQRRow.centerName }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-[11px]">预约履约时段：</span>
            <span class="font-semibold text-blue-700">{{ activeQRRow.timeSlot }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-[11px]">配送车号 / 方式：</span>
            <span class="font-mono text-slate-700">{{ activeQRRow.deliveryVehicleNo }} ({{ activeQRRow.logisticsMode === 'DISPATCH' ? '中心配送' : '代理自提' }})</span>
          </div>
        </div>

        <!-- 高清晰度矢量 SVG 二维码展示区 -->
        <div class="p-5 bg-white border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-inner">
          <div class="relative p-3 bg-white rounded-xl shadow-xs border border-slate-200">
            <!-- 矢量 SVG 二维码图形 -->
            <svg class="w-48 h-48" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 背景白色底板 -->
              <rect width="160" height="160" fill="#FFFFFF" />

              <!-- 左上角回字定位标 -->
              <rect x="10" y="10" width="36" height="36" rx="4" fill="#0F172A" />
              <rect x="16" y="16" width="24" height="24" rx="2" fill="#FFFFFF" />
              <rect x="22" y="22" width="12" height="12" rx="2" fill="#2563EB" />

              <!-- 右上角回字定位标 -->
              <rect x="114" y="10" width="36" height="36" rx="4" fill="#0F172A" />
              <rect x="120" y="16" width="24" height="24" rx="2" fill="#FFFFFF" />
              <rect x="126" y="22" width="12" height="12" rx="2" fill="#2563EB" />

              <!-- 左下角回字定位标 -->
              <rect x="10" y="114" width="36" height="36" rx="4" fill="#0F172A" />
              <rect x="16" y="120" width="24" height="24" rx="2" fill="#FFFFFF" />
              <rect x="22" y="126" width="12" height="12" rx="2" fill="#2563EB" />

              <!-- 二维码拟真点阵模块数据 -->
              <g fill="#1E293B">
                <!-- 第一区 -->
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

                <!-- 侧边 -->
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

                <!-- 下部数据 -->
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

                <!-- 右下部数据 -->
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

              <!-- 中心专属官方贸易部防伪徽标 -->
              <rect x="65" y="65" width="30" height="30" rx="6" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="2" />
              <text x="80" y="83" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">RCM</text>
            </svg>
          </div>

          <div class="space-y-1">
            <span class="text-[11px] text-slate-500 block">防伪提货凭证编号：</span>
            <div class="font-mono text-base font-extrabold text-blue-700 tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {{ activeQRRow.pickupVoucherCode }}
            </div>
          </div>
          <span class="text-[10px] text-slate-400">提货司机或代理前往中心仓出示本码直验出库</span>
        </div>

        <!-- 采购明细与金额汇总 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-left">
          <div class="flex justify-between items-center font-semibold text-slate-700">
            <span>采购单据编号：</span>
            <span class="font-mono text-slate-900">{{ activeQRRow.orderNo }}</span>
          </div>
          <div class="flex justify-between items-center font-semibold text-slate-700">
            <span>已缴财政货款：</span>
            <span class="font-mono text-emerald-700 font-bold">{{ activeQRRow.totalAmount.toLocaleString() }} IQD (已入库)</span>
          </div>
          <div class="pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
            包含物资：
            <span v-for="(it, i) in activeQRRow.items" :key="i" class="mr-2">
              {{ it.itemName }}: <strong>{{ it.qty }}{{ it.unit }}</strong>
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <el-button @click="copyPickupCode">复制提货码</el-button>
          <el-button type="primary" @click="handlePrintVoucher">打印出库单</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  ChatLineSquare,
  InfoFilled,
  FullScreen,
  OfficeBuilding,
  Calendar
} from '@element-plus/icons-vue';
import { getG2BPurchaseOrders, createG2BPurchaseOrder } from '../../../api/agent.js';
import ElectronicPaymentDialog from '../../../components/common/ElectronicPaymentDialog.vue';

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
    ElMessage.error('加载采购订单失败');
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
    ElMessage.warning('请完整选择预约履约/到货日期与时段窗口');
    return;
  }

  // 2. 数量非空校验
  if (form.value.flourQty <= 0 && form.value.riceQty <= 0 && form.value.oilQty <= 0) {
    ElMessage.warning('请至少填报一项采购物资数量');
    return;
  }

  // 3. 面粉双重上限校验
  if (form.value.flourQty > maxAllowed.value.flour) {
    ElMessage.warning(
      `特级面粉订购量 (${form.value.flourQty.toLocaleString()} KG) 超过可订上限 (${maxAllowed.value.flour.toLocaleString()} KG)！(辖区配额: ${agentQuotaLimits.value.flour.toLocaleString()} KG, 中心仓存量: ${centerStock.value.flour.toLocaleString()} KG)`
    );
    return;
  }

  // 4. 大米双重上限校验
  if (form.value.riceQty > maxAllowed.value.rice) {
    ElMessage.warning(
      `精制大米订购量 (${form.value.riceQty.toLocaleString()} KG) 超过可订上限 (${maxAllowed.value.rice.toLocaleString()} KG)！(辖区配额: ${agentQuotaLimits.value.rice.toLocaleString()} KG, 中心仓存量: ${centerStock.value.rice.toLocaleString()} KG)`
    );
    return;
  }

  // 5. 食用油双重上限校验
  if (form.value.oilQty > maxAllowed.value.oil) {
    ElMessage.warning(
      `食用植物油订购量 (${form.value.oilQty.toLocaleString()} L) 超过可订上限 (${maxAllowed.value.oil.toLocaleString()} L)！(辖区配额: ${agentQuotaLimits.value.oil.toLocaleString()} L, 中心仓存量: ${centerStock.value.oil.toLocaleString()} L)`
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
      { itemCode: 'FLOUR-WHT-02', itemName: '优质特级面粉 (标准白面)', qty: form.value.flourQty, unit: '公斤 (KG)', unitPrice: 350, subtotal: form.value.flourQty * 350 },
      { itemCode: 'RICE-BAS-01', itemName: '精制大米 (巴斯马蒂一等品)', qty: form.value.riceQty, unit: '公斤 (KG)', unitPrice: 500, subtotal: form.value.riceQty * 500 },
      { itemCode: 'OIL-SUN-03', itemName: '精炼食用植物油 (葵花籽配方)', qty: form.value.oilQty, unit: '升 (L)', unitPrice: 1200, subtotal: form.value.oilQty * 1200 }
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
    ElMessage.success('采购货款电子支付成功！采购记录已新增入库。');

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
    ElMessage.error(error.message || '生成采购订单异常');
  } finally {
    loading.value = false;
  }
};

const handlePaymentCancel = () => {
  paymentDialogVisible.value = false;
  ElMessage.info('已取消电子支付，采购单未提交。');
};

// 3. 点击操作栏展示二维码
const showOrderQRCode = (row) => {
  activeQRRow.value = row;
  qrModalVisible.value = true;
};

const copyPickupCode = () => {
  if (activeQRRow.value) {
    navigator.clipboard?.writeText(activeQRRow.value.pickupVoucherCode);
    ElMessage.success(`提货码【${activeQRRow.value.pickupVoucherCode}】已复制到剪贴板！`);
  }
};

const handlePrintVoucher = () => {
  ElMessage.success('出库提货凭证打印任务已发送至本地打印机');
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
