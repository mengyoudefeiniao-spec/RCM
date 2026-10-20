<template>
  <div class="inbound-outbound-tab space-y-6">
    <!-- 标头与子分类切换 (已去除冗余介绍) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB]">
      <el-radio-group v-model="subSection" size="small">
        <el-radio-button value="inbound">{{ $t('warehouse.subInbound') || '入库质检与建档' }}</el-radio-button>
        <el-radio-button value="outbound">{{ $t('warehouse.subOutbound') || '出库波次与交付' }}</el-radio-button>
        <el-radio-button value="transfer">{{ $t('warehouse.subTransfer') || '跨库调拨(三段式)' }}</el-radio-button>
        <el-radio-button value="stocktake">{{ $t('warehouse.subStocktake') || '盘点与存证报损' }}</el-radio-button>
      </el-radio-group>

      <div class="flex items-center gap-2">
        <el-button size="small" @click="loadData">
          <el-icon class="me-1"><Refresh /></el-icon>
          {{ $t('common.refresh') || '刷新' }}
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 子部分 1: 入库管理 (采购收货、质检建档、推荐库位上架) - P1 -->
    <!-- ======================================================== -->
    <div v-if="subSection === 'inbound'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
          <el-icon class="text-[#2F7A50]"><Download /></el-icon>
          <span>{{ $t('warehouse.subInbound') || '采购收货质检入库记录' }}</span>
        </h3>
        <el-button type="primary" size="small" @click="openInboundDialog">
          <el-icon class="me-1"><Plus /></el-icon>
          {{ $t('warehouse.newInbound') || '新建收货质检入库' }}
        </el-button>
      </div>

      <!-- 入库单查询过滤栏 -->
      <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
        <el-input
          v-model="inboundSearch"
          :placeholder="isEn ? 'Search Inbound No / PO / Item Name' : '搜索入库单号 / 采购单 / 物资品名'"
          clearable
          size="small"
          class="max-w-xs"
          @input="inboundPage = 1"
        >
          <template #prefix>
            <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="inboundStatus" :placeholder="isEn ? 'Quality Status' : '质检状态'" clearable size="small" class="w-32" @change="inboundPage = 1">
          <el-option :label="isEn ? 'Passed' : '合格入库'" value="合格" />
          <el-option :label="isEn ? 'Pending' : '待检'" value="待检" />
          <el-option :label="isEn ? 'Rejected' : '不合格'" value="不合格" />
        </el-select>

        <el-button size="small" link type="primary" @click="resetInboundFilter">{{ $t('common.reset') || '重置' }}</el-button>
        <span class="text-[11px] text-[#8A9A8F] ms-auto">{{ isEn ? `Total ${filteredInboundOrders.length} records` : `共 ${filteredInboundOrders.length} 条记录` }}</span>
      </div>

      <!-- 入库单表格 -->
      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
        <el-table :data="paginatedInboundOrders" v-loading="loading" border style="width: 100%" class="text-xs">
          <el-table-column prop="inboundNo" :label="isEn ? 'Inbound No. / PO' : '入库单号 / 采购单'" min-width="160">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#326445]">{{ row.inboundNo }}</span>
              <div class="text-[11px] text-[#8A9A8F] font-mono">{{ row.purchaseOrderNo }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="tradePlanNo" :label="isEn ? 'Plan Link (P1)' : '关联贸易部计划 (P1校验)'" min-width="160">
            <template #default="{ row }">
              <el-tag size="small" type="primary" effect="light" class="font-mono">
                {{ row.tradePlanNo }}
              </el-tag>
              <div class="text-[10px] text-[#2F7A50] font-medium mt-0.5">● {{ isEn ? 'Verified' : '计划校验合格' }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="itemName" :label="isEn ? 'Item Name & Qty' : '物资品名与实收量'" min-width="160">
            <template #default="{ row }">
              <div class="font-bold text-[#1F3326]">{{ formatItemName(row.itemName) }}</div>
              <div class="font-mono text-[#2F7A50] font-bold mt-0.5">
                {{ (row.actualQty || 0).toLocaleString() }} {{ row.unit }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="batchNo" :label="isEn ? 'Batch & Expiry' : '生产批次与效期 (强制建档)'" min-width="210">
            <template #default="{ row }">
              <span class="font-mono text-[11px] font-bold text-[#43554B] bg-[#E9F1EB] px-1.5 py-0.5 rounded">
                {{ row.batchNo }}
              </span>
              <div class="text-[10px] text-[#58685D] font-mono mt-0.5">
                {{ isEn ? 'MFG: ' : '生产: ' }}{{ row.productionDate }} ~ {{ isEn ? 'EXP: ' : '效期: ' }}{{ row.expiryDate }}
              </div>
              <div class="text-[10px] text-[#326445] font-mono mt-0.5 flex items-center gap-1">
                <el-icon><Tickets /></el-icon>
                <span>{{ row.uniqueTraceCode }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="warehouseName" :label="isEn ? 'Location / Shelf' : '推荐上架货位'" min-width="170">
            <template #default="{ row }">
              <div class="text-[#1F3326] font-medium">{{ row.warehouseName }}</div>
              <div class="font-mono text-[#326445] font-bold text-[11px] mt-0.5">
                {{ isEn ? 'Bin: ' : '库位: ' }}{{ row.locationCode }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="inspectStatus" label="品控质检报告" width="130" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success" effect="light">{{ row.inspectStatus }}</el-tag>
              <div class="text-[10px] text-[#8A9A8F] mt-0.5 truncate" :title="row.inspectReport">
                {{ row.inspectReport }}
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 入库单分页 -->
        <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
          <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredInboundOrders.length }} 笔入库单</span>
          <el-pagination
            v-model:current-page="inboundPage"
            v-model:page-size="inboundPageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredInboundOrders.length"
            layout="total, sizes, prev, pager, next"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 子部分 2: 出库管理 (波次拣选、交付流水与在途锁定) - P2 -->
    <!-- ======================================================== -->
    <div v-if="subSection === 'outbound'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
          <el-icon class="text-[#326445]"><Upload /></el-icon>
          <span>配给配送出库波次与交付流水</span>
        </h3>
        <el-button type="primary" size="small" @click="openOutboundDialog">
          <el-icon class="me-1"><Plus /></el-icon>
          创建配送波次出库 (FIFO)
        </el-button>
      </div>

      <!-- 出库单查询过滤栏 -->
      <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
        <el-input
          v-model="outboundSearch"
          placeholder="搜索流水号 / 任务单 / 物资 / 代理网点"
          clearable
          size="small"
          class="max-w-xs"
          @input="outboundPage = 1"
        >
          <template #prefix>
            <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="outboundStatus" placeholder="交付流转状态" clearable size="small" class="w-36" @change="outboundPage = 1">
          <el-option label="在途锁定" value="在途锁定" />
          <el-option label="已出库在途" value="已出库在途" />
          <el-option label="已签收交付" value="已签收交付" />
          <el-option label="签收异常" value="异常" />
        </el-select>

        <el-button size="small" link type="primary" @click="resetOutboundFilter">重置</el-button>
        <span class="text-[11px] text-[#8A9A8F] ms-auto">共 {{ filteredOutboundOrders.length }} 条记录</span>
      </div>

      <!-- 出库单表格 -->
      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
        <el-table :data="paginatedOutboundOrders" v-loading="loading" border style="width: 100%" class="text-xs">
          <el-table-column prop="deliveryFlowNo" label="全局唯一交付流水号 (P2标准)" min-width="190">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#2A5440] bg-[#EFF5F1] px-2 py-0.5 rounded border border-[#E1F4E4]">
                {{ row.deliveryFlowNo }}
              </span>
              <div class="text-[10px] text-[#8A9A8F] font-mono mt-1">
                防伪校验码: {{ row.securityCheckCode }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="taskNo" label="对应配给任务单" width="160">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#43554B]">{{ row.taskNo }}</span>
              <div class="text-[11px] text-[#58685D]">{{ row.targetAgentName }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="itemName" label="出库物资与拣选批次" min-width="180">
            <template #default="{ row }">
              <div class="font-bold text-[#1F3326]">{{ row.itemName }}</div>
              <div class="font-mono text-[#58685D] text-[11px] mt-0.5">{{ row.batchNo }}</div>
              <el-tag size="small" type="info" effect="plain" class="scale-90 origin-left rtl:origin-right mt-0.5">
                {{ row.pickingRule }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="actualOutQty" label="出库量 / 在途锁定" width="140" align="right">
            <template #default="{ row }">
              <div class="font-mono font-bold text-[#326445] text-sm">
                {{ (row.actualOutQty || 0).toLocaleString() }} {{ row.unit }}
              </div>
              <div class="text-[10px] text-[#C9A13B] font-mono mt-0.5">
                已锁定在途: {{ (row.lockedInTransitQty || 0).toLocaleString() }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="carrierName" label="物流承运与车队" min-width="150">
            <template #default="{ row }">
              <div class="text-[#43554B] font-medium">{{ row.carrierName }}</div>
              <div class="text-[11px] text-[#8A9A8F] font-mono">{{ row.vehicleNo }} ({{ row.driverName }})</div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="交付流转状态" width="140" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="row.status.includes('锁定') ? 'warning' : row.status.includes('异常') ? 'danger' : 'success'"
                effect="light"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 出库单分页 -->
        <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
          <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredOutboundOrders.length }} 笔出库单</span>
          <el-pagination
            v-model:current-page="outboundPage"
            v-model:page-size="outboundPageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredOutboundOrders.length"
            layout="total, sizes, prev, pager, next"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 子部分 3: 跨库调拨 (中心仓向区域前置仓三段式) -->
    <!-- ======================================================== -->
    <div v-if="subSection === 'transfer'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
          <el-icon class="text-[#326445]"><Switch /></el-icon>
          <span>跨库调拨管理 (中心仓至区域前置仓)</span>
        </h3>
        <el-button type="primary" size="small" @click="openTransferDialog">
          <el-icon class="me-1"><Plus /></el-icon>
          发起跨库调拨申请
        </el-button>
      </div>

      <!-- 调拨单查询过滤栏 -->
      <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
        <el-input
          v-model="transferSearch"
          placeholder="搜索调拨单号 / 物资 / 调出仓 / 调入仓"
          clearable
          size="small"
          class="max-w-xs"
          @input="transferPage = 1"
        >
          <template #prefix>
            <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="transferStage" placeholder="调拨流转阶段" clearable size="small" class="w-36" @change="transferPage = 1">
          <el-option label="阶段1: 调出出库" value="阶段1" />
          <el-option label="阶段2: 运输在途" value="阶段2" />
          <el-option label="阶段3: 验收入库" value="阶段3" />
        </el-select>

        <el-button size="small" link type="primary" @click="resetTransferFilter">重置</el-button>
        <span class="text-[11px] text-[#8A9A8F] ms-auto">共 {{ filteredTransferOrders.length }} 条记录</span>
      </div>

      <!-- 调拨卡片列表 -->
      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="trf in paginatedTransferOrders" :key="trf.id" class="p-4 bg-white rounded-lg border border-[#D9E5DB] shadow-xs space-y-3">
            <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2">
              <div>
                <span class="font-mono font-bold text-[#326445]">{{ trf.transferNo }}</span>
                <span class="text-[#8A9A8F] text-xs ms-2 font-bold">{{ trf.itemName }} ({{ trf.transferQty.toLocaleString() }} {{ trf.unit }})</span>
              </div>
              <el-tag size="small" type="primary" effect="dark">{{ trf.currentStage }}</el-tag>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 bg-[#F3F8F4] rounded">
                <span class="text-[11px] text-[#8A9A8F] block">调出中心仓</span>
                <span class="font-bold text-[#43554B]">{{ trf.fromWarehouseName }}</span>
              </div>
              <div class="p-2 bg-[#EFF5F1]/50 rounded">
                <span class="text-[11px] text-[#8A9A8F] block">调入前置仓</span>
                <span class="font-bold text-[#2A5440]">{{ trf.toWarehouseName }}</span>
              </div>
            </div>

            <!-- 三段式步骤指示条 -->
            <div class="p-2.5 bg-[#F3F8F4] rounded-lg space-y-1.5 text-[11px]">
              <div class="flex items-center justify-between">
                <span class="text-[#58685D]">1. 调出出库:</span>
                <span class="font-mono text-[#43554B]">{{ trf.stage1Outbound.outboundFlowNo }} ({{ trf.stage1Outbound.status }})</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#58685D]">2. 在途管理:</span>
                <span class="font-mono text-[#43554B]">{{ trf.stage2InTransit.vehicleNo }} ({{ trf.stage2InTransit.status }})</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#58685D]">3. 调入验收:</span>
                <span class="font-mono" :class="trf.stage3Inbound.status === '已验收入库' ? 'text-[#2F7A50] font-bold' : 'text-[#8A9A8F]'">
                  {{ trf.stage3Inbound.status }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[11px] text-[#58685D] truncate max-w-[200px]" :title="trf.reason">
                事由: {{ trf.reason }}
              </span>
              <el-button
                v-if="!trf.currentStage.includes('阶段3')"
                size="small"
                type="success"
                plain
                @click="handleAdvanceTransfer(trf)"
              >
                推进至下一步
              </el-button>
            </div>
          </div>
        </div>

        <!-- 调拨单分页 -->
        <div class="p-3 bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs flex items-center justify-between text-xs">
          <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredTransferOrders.length }} 笔调拨单</span>
          <el-pagination
            v-model:current-page="transferPage"
            v-model:page-size="transferPageSize"
            :page-sizes="[2, 4, 10]"
            :total="filteredTransferOrders.length"
            layout="total, sizes, prev, pager, next"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 子部分 4: 全流程盘点与存证影像报损 -->
    <!-- ======================================================== -->
    <div v-if="subSection === 'stocktake'" class="space-y-6">
      <!-- 4.1 盘点管理 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
            <el-icon class="text-[#C9A13B]"><Check /></el-icon>
            <span>全流程盘点管理</span>
          </h3>
          <el-button type="primary" size="small" @click="openStocktakeDialog">
            <el-icon class="me-1"><Plus /></el-icon>
            录入盘点结果
          </el-button>
        </div>

        <!-- 盘点查询过滤栏 -->
        <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
          <el-input
            v-model="stocktakeSearch"
            placeholder="搜索盘点单号 / 仓库 / 货位 / 物资"
            clearable
            size="small"
            class="max-w-xs"
            @input="stocktakePage = 1"
          >
            <template #prefix>
              <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="stocktakeStatus" placeholder="盘点状态" clearable size="small" class="w-36" @change="stocktakePage = 1">
            <el-option label="盘点无差异" value="盘点无差异" />
            <el-option label="待双人签批核销" value="待双人签批" />
          </el-select>

          <el-button size="small" link type="primary" @click="resetStocktakeFilter">重置</el-button>
          <span class="text-[11px] text-[#8A9A8F] ms-auto">共 {{ filteredStocktakeRecords.length }} 条记录</span>
        </div>

        <!-- 盘点表格 -->
        <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
          <el-table :data="paginatedStocktakeRecords" v-loading="loading" border style="width: 100%" class="text-xs">
            <el-table-column prop="stocktakeNo" label="盘点单号" width="160">
              <template #default="{ row }">
                <span class="font-mono font-bold text-[#326445]">{{ row.stocktakeNo }}</span>
                <div class="text-[10px] text-[#8A9A8F]">{{ row.type }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="warehouseName" label="所在仓库与货位" min-width="160">
              <template #default="{ row }">
                <div class="text-[#1F3326]">{{ row.warehouseName }}</div>
                <div class="font-mono text-[#58685D] text-[11px]">{{ row.locationCode }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="itemName" label="盘点物资" min-width="150" />
            <el-table-column prop="diffQty" label="账面 / 实盘 / 差异" width="170" align="right">
              <template #default="{ row }">
                <div class="font-mono text-[#58685D] text-[11px]">账面: {{ row.bookQty.toLocaleString() }} {{ row.unit }}</div>
                <div class="font-mono text-[#43554B] font-bold">实盘: {{ row.countedQty.toLocaleString() }} {{ row.unit }}</div>
                <div class="font-mono font-bold text-[11px]" :class="row.diffQty < 0 ? 'text-[#C04442]' : row.diffQty > 0 ? 'text-[#C9A13B]' : 'text-[#2F7A50]'">
                  差异: {{ row.diffQty > 0 ? '+' : '' }}{{ row.diffQty }} {{ row.unit }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="diffResolution" label="处理规则与双人签批" min-width="200">
              <template #default="{ row }">
                <div class="text-[11px] text-[#43554B] font-medium">{{ row.diffResolution }}</div>
                <div class="text-[10px] text-[#8A9A8F] mt-0.5">
                  双人签批: {{ row.approver1 }} / {{ row.approver2 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === '盘点无差异' ? 'success' : 'warning'" effect="light">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 盘点单分页 -->
          <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
            <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredStocktakeRecords.length }} 笔盘点记录</span>
            <el-pagination
              v-model:current-page="stocktakePage"
              v-model:page-size="stocktakePageSize"
              :page-sizes="[5, 10, 20]"
              :total="filteredStocktakeRecords.length"
              layout="total, sizes, prev, pager, next"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- 4.2 报损报溢与存证影像 -->
      <div class="space-y-3 pt-3 border-t border-[#D9E5DB]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
            <el-icon class="text-[#C04442]"><Warning /></el-icon>
            <span>报损与报溢管理</span>
          </h3>
          <el-button type="danger" size="small" plain @click="openLossDialog">
            <el-icon class="me-1"><Plus /></el-icon>
            登记报损/报溢
          </el-button>
        </div>

        <!-- 报损查询过滤栏 -->
        <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
          <el-input
            v-model="lossSearch"
            placeholder="搜索损耗单号 / 物资品名 / 损耗原因"
            clearable
            size="small"
            class="max-w-xs"
            @input="lossPage = 1"
          >
            <template #prefix>
              <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="lossType" placeholder="损耗类型" clearable size="small" class="w-36" @change="lossPage = 1">
            <el-option label="物理破损" value="物理破损" />
            <el-option label="过期变质" value="过期变质" />
            <el-option label="自然散耗" value="散耗" />
            <el-option label="不可抗力损耗" value="不可抗力" />
          </el-select>

          <el-button size="small" link type="primary" @click="resetLossFilter">重置</el-button>
          <span class="text-[11px] text-[#8A9A8F] ms-auto">共 {{ filteredLossRecords.length }} 条记录</span>
        </div>

        <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
          <el-table :data="paginatedLossRecords" v-loading="loading" border style="width: 100%" class="text-xs">
            <el-table-column prop="lossNo" label="损耗单号" width="160">
              <template #default="{ row }">
                <span class="font-mono font-bold text-[#C04442]">{{ row.lossNo }}</span>
                <div class="text-[11px] text-[#58685D]">{{ row.lossType }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="itemName" label="物资与损耗量" min-width="160">
              <template #default="{ row }">
                <div class="font-bold text-[#1F3326]">{{ row.itemName }}</div>
                <div class="font-mono text-[#C04442] font-bold mt-0.5">
                  损耗: {{ row.qty }} {{ row.unit }} (约 {{ row.estimatedCostIQD.toLocaleString() }} IQD)
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="damageReason" label="损耗原因及事实说明" min-width="220" />
            <el-table-column label="现场存证影像" width="130" align="center">
              <template #default="{ row }">
                <el-image
                  v-if="row.evidenceImageUrl"
                  :src="row.evidenceImageUrl"
                  class="w-14 h-10 rounded object-cover cursor-pointer border border-[#D9E5DB]"
                  :preview-src-list="[row.evidenceImageUrl]"
                  preview-teleported
                />
                <span v-else class="text-[#8A9A8F] text-[11px]">无影像</span>
              </template>
            </el-table-column>
            <el-table-column prop="approvalStatus" label="双人签批审核" width="140" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.approvalStatus.includes('通过') ? 'success' : 'warning'" effect="light">
                  {{ row.approvalStatus }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 报损单分页 -->
          <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
            <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredLossRecords.length }} 笔报损记录</span>
            <el-pagination
              v-model:current-page="lossPage"
              v-model:page-size="lossPageSize"
              :page-sizes="[5, 10, 20]"
              :total="filteredLossRecords.length"
              layout="total, sizes, prev, pager, next"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 对话框群：入库、出库、调拨、盘点、报损 -->
    <!-- ======================================================== -->
    <!-- 1. 新建采购收货质检入库对话框 (P1 规则校验) -->
    <el-dialog v-model="inboundDialogVisible" title="采购收货质检与批次一物一码建档 (P1 标准)" width="640px" destroy-on-close>
      <div class="p-3 bg-[#FDF3E0] rounded-lg border border-[#F2E3C6] text-[#5A4718] text-xs mb-3 space-y-1">
        <div class="font-bold">【P1 规则合规提示】</div>
        <div>1. 采购入库单必须校验并关联贸易部计划编号；</div>
        <div>2. 批次号生成时必须包含生产日期及效期字段 (系统将强制核验并自动建档一物一码)。</div>
      </div>
      <el-form :model="inboundForm" label-width="140px" class="space-y-3 text-xs">
        <el-form-item label="贸易部配给计划编号" required>
          <el-input v-model="inboundForm.tradePlanNo" placeholder="如 PLAN-2026-Q4-001 (P1强制校验)" />
        </el-form-item>
        <el-form-item label="物资品名与规格" required>
          <el-select v-model="inboundForm.itemName" class="w-full" @change="onInboundItemChange">
            <el-option label="精制大米 (巴斯马蒂一等品)" value="精制大米 (巴斯马蒂一等品)" />
            <el-option label="优质特级面粉 (标准白面)" value="优质特级面粉 (标准白面)" />
            <el-option label="精炼食用植物油 (葵花籽配方)" value="精炼食用植物油 (葵花籽配方)" />
            <el-option label="一级纯精制白砂糖" value="一级纯精制白砂糖" />
          </el-select>
        </el-form-item>
        <div class="grid grid-cols-2 gap-2">
          <el-form-item label="生产日期" required>
            <el-date-picker v-model="inboundForm.productionDate" type="date" value-format="YYYY-MM-DD" placeholder="生产日期" class="w-full" @change="generateBatchCode" />
          </el-form-item>
          <el-form-item label="有效截止日期" required>
            <el-date-picker v-model="inboundForm.expiryDate" type="date" value-format="YYYY-MM-DD" placeholder="截止日期" class="w-full" @change="generateBatchCode" />
          </el-form-item>
        </div>
        <el-form-item label="生成批次号 (P1规则)" required>
          <el-input v-model="inboundForm.batchNo" placeholder="系统按生产日期与效期自动拼接" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-2">
          <el-form-item label="实收数量" required>
            <el-input-number v-model="inboundForm.qty" :min="100" :max="1000000" :step="1000" class="w-full" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="inboundForm.unit" disabled />
          </el-form-item>
        </div>
        <el-form-item label="分配库位绑定" required>
          <el-input v-model="inboundForm.locationCode" placeholder="如 A01-03-02 (A区-03架-02位)" />
        </el-form-item>
        <el-form-item label="质检报告结论">
          <el-input v-model="inboundForm.inspectReport" placeholder="水分≤13.5%，杂质≤0.2%，密封包装完好" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInbound" :loading="submitting">完成质检建档并上架</el-button>
      </template>
    </el-dialog>

    <!-- 2. 出库波次与交付流水生成对话框 (P2 规则校验) -->
    <el-dialog v-model="outboundDialogVisible" title="创建波次拣选出库与生成交付流水单 (P2 标准)" width="640px" destroy-on-close>
      <div class="p-3 bg-[#EFF5F1] rounded-lg border border-[#C7DED0] text-[#1F3326] text-xs mb-3 space-y-1">
        <div class="font-bold">【P2 规则合规提示】</div>
        <div>依据先进先出 (FIFO) 拣选。出库单审核后将自动生成具备全局唯一校验码的【配送交付流水单】，库位可用库存同步转为在途锁定库存！</div>
      </div>
      <el-form :model="outboundForm" label-width="140px" class="space-y-3 text-xs">
        <el-form-item label="对应代理任务单" required>
          <el-input v-model="outboundForm.taskNo" placeholder="如 TASK-2026-Q4-BAG-001" />
        </el-form-item>
        <el-form-item label="目标代销网点" required>
          <el-input v-model="outboundForm.targetAgentName" placeholder="如 卡尔赫第一配给中心综合代销站" />
        </el-form-item>
        <el-form-item label="FIFO 推荐出库批次" required>
          <el-input v-model="outboundForm.batchNo" placeholder="BATCH-20261012-EXP202710-RC01" />
        </el-form-item>
        <el-form-item label="出库发运数量" required>
          <el-input-number v-model="outboundForm.outQty" :min="100" :max="50000" :step="500" class="w-full" />
        </el-form-item>
        <el-form-item label="物流承运车队">
          <el-input v-model="outboundForm.carrierName" placeholder="如 国家粮食运输总队 #BAG-T99" />
        </el-form-item>
        <el-form-item label="随车押运司机/电话">
          <div class="flex items-center gap-2 w-full">
            <el-input v-model="outboundForm.driverName" placeholder="司机姓名" />
            <el-input class="bidi-ltr" v-model="outboundForm.driverPhone" placeholder="联系电话" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="outboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOutboundWave" :loading="submitting">复核出库并锁定在途数量</el-button>
      </template>
    </el-dialog>

    <!-- 3. 跨库调拨对话框 -->
    <el-dialog v-model="transferDialogVisible" title="发起中心仓至区域前置仓调拨 (三段式)" width="600px" destroy-on-close>
      <el-form :model="transferForm" label-width="130px" class="space-y-3 text-xs">
        <el-form-item label="调拨物资品名" required>
          <el-input v-model="transferForm.itemName" />
        </el-form-item>
        <el-form-item label="调出中心仓" required>
          <el-input v-model="transferForm.fromWarehouseName" />
        </el-form-item>
        <el-form-item label="调入前置仓" required>
          <el-input v-model="transferForm.toWarehouseName" />
        </el-form-item>
        <el-form-item label="调拨数量" required>
          <el-input-number v-model="transferForm.transferQty" :min="1000" :max="50000" :step="1000" class="w-full" />
        </el-form-item>
        <el-form-item label="调拨事由">
          <el-input v-model="transferForm.reason" placeholder="如 争议区防灾储备平衡加仓" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTransfer" :loading="submitting">确认发起调出出库</el-button>
      </template>
    </el-dialog>

    <!-- 4. 盘点录入对话框 -->
    <el-dialog v-model="stocktakeDialogVisible" title="录入仓储盘点结果 (禁止直接冲抵)" width="560px" destroy-on-close>
      <el-form :model="stocktakeForm" label-width="120px" class="space-y-3 text-xs">
        <el-form-item label="盘点模式" required>
          <el-select v-model="stocktakeForm.type" class="w-full">
            <el-option label="周期盘点 (Cycle Count)" value="周期盘点 (Cycle Count)" />
            <el-option label="盲盘 (Blind Count)" value="盲盘 (Blind Count)" />
            <el-option label="动销盘点 (Active Count)" value="动销盘点 (Active Count)" />
          </el-select>
        </el-form-item>
        <el-form-item label="账面数量 (KG)">
          <el-input-number v-model="stocktakeForm.bookQty" class="w-full" />
        </el-form-item>
        <el-form-item label="实盘数量 (KG)" required>
          <el-input-number v-model="stocktakeForm.countedQty" class="w-full" />
        </el-form-item>
        <el-form-item label="差异原因说明">
          <el-input v-model="stocktakeForm.diffReason" placeholder="若有差异请详细阐述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stocktakeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStocktakeForm" :loading="submitting">提交盘点报告</el-button>
      </template>
    </el-dialog>

    <!-- 5. 登记报损报溢对话框 -->
    <el-dialog v-model="lossDialogVisible" title="登记报损与现场存证影像留痕" width="560px" destroy-on-close>
      <el-form :model="lossForm" label-width="120px" class="space-y-3 text-xs">
        <el-form-item label="损耗类型" required>
          <el-select v-model="lossForm.lossType" class="w-full">
            <el-option label="物理破损 (Damage)" value="物理破损 (Damage)" />
            <el-option label="过期变质 (Expired)" value="过期变质 (Expired)" />
            <el-option label="不可抗力损耗 (Force Majeure)" value="不可抗力损耗 (Force Majeure)" />
          </el-select>
        </el-form-item>
        <el-form-item label="报损数量" required>
          <el-input-number v-model="lossForm.qty" :min="1" :max="5000" class="w-full" />
        </el-form-item>
        <el-form-item label="损耗原因" required>
          <el-input v-model="lossForm.damageReason" type="textarea" :rows="3" placeholder="强制录入具体破损事实原因" />
        </el-form-item>
        <el-form-item label="现场存证影像">
          <el-input v-model="lossForm.evidenceImageUrl" placeholder="现场照片影像网络 URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="lossDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLoss" :loading="submitting">提交报损待双人审批</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

function formatItemName(name) {
  if (isEn.value && name) {
    if (name.includes('大米')) return 'Refined Basmati Rice';
    if (name.includes('面粉')) return 'Premium Wheat Flour';
    if (name.includes('油')) return 'Sunflower Cooking Oil';
    if (name.includes('糖')) return 'Refined White Sugar';
    return name;
  }
  return name;
}
import {
  getInboundOrders,
  submitInboundOrder,
  getOutboundOrders,
  createOutboundWave,
  getTransferOrders,
  createTransferOrder,
  advanceTransferStage,
  getStocktakeRecords,
  submitStocktake,
  getLossRecords,
  submitLossRecord
} from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import {
  Refresh,
  Plus,
  Download,
  Upload,
  Switch,
  Check,
  Warning,
  Tickets,
  Search
} from '@element-plus/icons-vue';

const subSection = ref('inbound');
const loading = ref(false);
const submitting = ref(false);

const inboundOrders = ref([]);
const outboundOrders = ref([]);
const transferOrders = ref([]);
const stocktakeRecords = ref([]);
const lossRecords = ref([]);

// 1. 入库过滤与分页
const inboundSearch = ref('');
const inboundStatus = ref('');
const inboundPage = ref(1);
const inboundPageSize = ref(5);
const filteredInboundOrders = computed(() => {
  return inboundOrders.value.filter(item => {
    const q = (inboundSearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.inboundNo || '').toLowerCase().includes(q) ||
      (item.purchaseOrderNo || '').toLowerCase().includes(q) ||
      (item.itemName || '').toLowerCase().includes(q) ||
      (item.tradePlanNo || '').toLowerCase().includes(q);
    const matchStatus = !inboundStatus.value || (item.inspectStatus || '').includes(inboundStatus.value);
    return matchSearch && matchStatus;
  });
});
const paginatedInboundOrders = computed(() => {
  const start = (inboundPage.value - 1) * inboundPageSize.value;
  return filteredInboundOrders.value.slice(start, start + inboundPageSize.value);
});
function resetInboundFilter() {
  inboundSearch.value = '';
  inboundStatus.value = '';
  inboundPage.value = 1;
}

// 2. 出库过滤与分页
const outboundSearch = ref('');
const outboundStatus = ref('');
const outboundPage = ref(1);
const outboundPageSize = ref(5);
const filteredOutboundOrders = computed(() => {
  return outboundOrders.value.filter(item => {
    const q = (outboundSearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.deliveryFlowNo || '').toLowerCase().includes(q) ||
      (item.taskNo || '').toLowerCase().includes(q) ||
      (item.itemName || '').toLowerCase().includes(q) ||
      (item.targetAgentName || '').toLowerCase().includes(q);
    const matchStatus = !outboundStatus.value || (item.status || '').includes(outboundStatus.value);
    return matchSearch && matchStatus;
  });
});
const paginatedOutboundOrders = computed(() => {
  const start = (outboundPage.value - 1) * outboundPageSize.value;
  return filteredOutboundOrders.value.slice(start, start + outboundPageSize.value);
});
function resetOutboundFilter() {
  outboundSearch.value = '';
  outboundStatus.value = '';
  outboundPage.value = 1;
}

// 3. 调拨过滤与分页
const transferSearch = ref('');
const transferStage = ref('');
const transferPage = ref(1);
const transferPageSize = ref(2);
const filteredTransferOrders = computed(() => {
  return transferOrders.value.filter(item => {
    const q = (transferSearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.transferNo || '').toLowerCase().includes(q) ||
      (item.itemName || '').toLowerCase().includes(q) ||
      (item.fromWarehouseName || '').toLowerCase().includes(q) ||
      (item.toWarehouseName || '').toLowerCase().includes(q);
    const matchStage = !transferStage.value || (item.currentStage || '').includes(transferStage.value);
    return matchSearch && matchStage;
  });
});
const paginatedTransferOrders = computed(() => {
  const start = (transferPage.value - 1) * transferPageSize.value;
  return filteredTransferOrders.value.slice(start, start + transferPageSize.value);
});
function resetTransferFilter() {
  transferSearch.value = '';
  transferStage.value = '';
  transferPage.value = 1;
}

// 4. 盘点过滤与分页
const stocktakeSearch = ref('');
const stocktakeStatus = ref('');
const stocktakePage = ref(1);
const stocktakePageSize = ref(5);
const filteredStocktakeRecords = computed(() => {
  return stocktakeRecords.value.filter(item => {
    const q = (stocktakeSearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.stocktakeNo || '').toLowerCase().includes(q) ||
      (item.warehouseName || '').toLowerCase().includes(q) ||
      (item.locationCode || '').toLowerCase().includes(q) ||
      (item.itemName || '').toLowerCase().includes(q);
    const matchStatus = !stocktakeStatus.value || (item.status || '').includes(stocktakeStatus.value);
    return matchSearch && matchStatus;
  });
});
const paginatedStocktakeRecords = computed(() => {
  const start = (stocktakePage.value - 1) * stocktakePageSize.value;
  return filteredStocktakeRecords.value.slice(start, start + stocktakePageSize.value);
});
function resetStocktakeFilter() {
  stocktakeSearch.value = '';
  stocktakeStatus.value = '';
  stocktakePage.value = 1;
}

// 5. 报损过滤与分页
const lossSearch = ref('');
const lossType = ref('');
const lossPage = ref(1);
const lossPageSize = ref(5);
const filteredLossRecords = computed(() => {
  return lossRecords.value.filter(item => {
    const q = (lossSearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.lossNo || '').toLowerCase().includes(q) ||
      (item.itemName || '').toLowerCase().includes(q) ||
      (item.damageReason || '').toLowerCase().includes(q);
    const matchType = !lossType.value || (item.lossType || '').includes(lossType.value);
    return matchSearch && matchType;
  });
});
const paginatedLossRecords = computed(() => {
  const start = (lossPage.value - 1) * lossPageSize.value;
  return filteredLossRecords.value.slice(start, start + lossPageSize.value);
});
function resetLossFilter() {
  lossSearch.value = '';
  lossType.value = '';
  lossPage.value = 1;
}

// 弹窗状态
const inboundDialogVisible = ref(false);
const outboundDialogVisible = ref(false);
const transferDialogVisible = ref(false);
const stocktakeDialogVisible = ref(false);
const lossDialogVisible = ref(false);

// 表单对象
const inboundForm = ref({
  tradePlanNo: 'PLAN-2026-Q4-001',
  itemName: '精制大米 (巴斯马蒂一等品)',
  productionDate: '2026-10-12',
  expiryDate: '2027-10-11',
  batchNo: 'BATCH-20261012-EXP202710-RC01',
  qty: 25000,
  unit: '公斤 (KG)',
  warehouseName: '巴格达第一国家储备粮库',
  locationCode: 'A01-03-02',
  inspectReport: '水分≤13.5%，杂质≤0.2%，双层编织袋密封完好'
});

const outboundForm = ref({
  taskNo: 'TASK-2026-Q4-BAG-001',
  targetAgentName: '卡尔赫第一配给中心综合代销站',
  batchNo: 'BATCH-20261012-EXP202710-RC01',
  outQty: 13440,
  carrierName: '伊拉克国家粮食运输第一车队',
  driverName: '拉希姆·卡西姆',
  driverPhone: '07705544332'
});

const transferForm = ref({
  itemName: '精制大米',
  fromWarehouseName: '巴格达第一国家储备粮库 (中心仓)',
  toWarehouseName: '迪亚拉哈奈根前置战略保供仓 (前置仓)',
  transferQty: 15000,
  reason: '第140号决议区前置仓储备加仓'
});

const stocktakeForm = ref({
  type: '盲盘 (Blind Count)',
  bookQty: 92400,
  countedQty: 92380,
  diffReason: '包装微量粉尘自然散耗'
});

const lossForm = ref({
  lossType: '物理破损 (Damage)',
  qty: 25,
  damageReason: '装卸托盘受力不均轻微开线破损，已就地清理留样封存。',
  evidenceImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'
});

function onInboundItemChange(val) {
  inboundForm.value.unit = val.includes('植物油') ? '升 (L)' : '公斤 (KG)';
}

function generateBatchCode() {
  const pDate = (inboundForm.value.productionDate || '').replace(/-/g, '');
  const eDate = (inboundForm.value.expiryDate || '').replace(/-/g, '').slice(0, 6);
  inboundForm.value.batchNo = `BATCH-${pDate}-EXP${eDate}-RC01`;
}

async function loadData() {
  loading.value = true;
  try {
    const [inList, outList, trfList, stkList, lossList] = await Promise.all([
      getInboundOrders(),
      getOutboundOrders(),
      getTransferOrders(),
      getStocktakeRecords(),
      getLossRecords()
    ]);
    inboundOrders.value = inList || [];
    outboundOrders.value = outList || [];
    transferOrders.value = trfList || [];
    stocktakeRecords.value = stkList || [];
    lossRecords.value = lossList || [];
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Failed to load warehouse operation data' : '加载仓储作业数据失败'));
  } finally {
    loading.value = false;
  }
}

// 弹窗打开
function openInboundDialog() {
  generateBatchCode();
  inboundDialogVisible.value = true;
}

function openOutboundDialog() {
  outboundDialogVisible.value = true;
}

function openTransferDialog() {
  transferDialogVisible.value = true;
}

function openStocktakeDialog() {
  stocktakeDialogVisible.value = true;
}

function openLossDialog() {
  lossDialogVisible.value = true;
}

// 提交操作
async function submitInbound() {
  submitting.value = true;
  try {
    await submitInboundOrder(inboundForm.value);
    ElMessage.success((isEnNow() ? 'Inbound QC passed! One-item-one-code label generated and storage slot binding completed' : '采购入库质检合格！已生成一物一码标签并完成库位上架绑定'));
    inboundDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Inbound failed' : '入库失败'));
  } finally {
    submitting.value = false;
  }
}

async function submitOutboundWave() {
  submitting.value = true;
  try {
    await createOutboundWave(outboundForm.value);
    ElMessage.success((isEnNow() ? 'Wave picking outbound succeeded! A globally unique delivery flow order was generated and in-transit stock locked' : '波次拣选出库成功！已生成全局唯一校验交付流水单，在途库存已锁定'));
    outboundDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Outbound failed' : '出库失败'));
  } finally {
    submitting.value = false;
  }
}

async function submitTransfer() {
  submitting.value = true;
  try {
    await createTransferOrder(transferForm.value);
    ElMessage.success((isEnNow() ? 'Cross-warehouse transfer initiated; outbound leg completed' : '跨库调拨已发起，调出出库完成'));
    transferDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Transfer failed' : '调拨失败'));
  } finally {
    submitting.value = false;
  }
}

async function handleAdvanceTransfer(row) {
  try {
    await advanceTransferStage(row.id);
    ElMessage.success((isEnNow() ? 'Transfer flow succeeded!' : '调拨流转成功！'));
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Advance failed' : '推进失败'));
  }
}

async function submitStocktakeForm() {
  submitting.value = true;
  try {
    await submitStocktake(stocktakeForm.value);
    ElMessage.success((isEnNow() ? 'Stocktake record entered' : '盘点记录已录入'));
    stocktakeDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Stocktake entry failed' : '盘点录入失败'));
  } finally {
    submitting.value = false;
  }
}

async function submitLoss() {
  submitting.value = true;
  try {
    await submitLossRecord(lossForm.value);
    ElMessage.success((isEnNow() ? 'Loss report submitted with archived evidence imagery!' : '报损申请已提交并留存存证影像！'));
    lossDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Loss report submission failed' : '报损提交失败'));
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
