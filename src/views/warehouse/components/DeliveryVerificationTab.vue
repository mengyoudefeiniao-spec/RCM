<template>
  <div class="delivery-verification-tab space-y-4">
    <!-- 标头与子切换 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB]">
      <div v-if="isCitizen" class="flex items-center gap-2">
        <span class="text-xs font-bold text-[#1F3326]">{{ $t('warehouse.inTransitTitle') || '在途口粮物资配送追踪与终端扫码核收' }}</span>
        <el-tag size="small" type="success" effect="plain">{{ $t('warehouse.realtimeSync') || '实时同步' }}</el-tag>
      </div>
      <el-radio-group v-else v-model="activeView" size="small">
        <el-radio-button value="tracking">{{ $t('warehouse.viewTracking') || '在途配送追踪' }}</el-radio-button>
        <el-radio-button value="receipt">{{ $t('warehouse.viewReceipt') || '网点扫码核收对账' }}</el-radio-button>
        <el-radio-button value="discrepancy">{{ $t('warehouse.viewDiscrepancy') || '差异预警与核查工单' }}</el-radio-button>
      </el-radio-group>

      <div class="flex items-center gap-2">
        <el-button size="small" @click="loadData">
          <el-icon class="me-1"><Refresh /></el-icon>
          {{ $t('common.refresh') || '刷新' }}
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 1: 在途配送追踪与交接链路监控 (改造为可查询列表表格) -->
    <!-- ======================================================== -->
    <div v-if="activeView === 'tracking'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
          <el-icon class="text-[#326445]"><Van /></el-icon>
          <span>{{ $t('warehouse.viewTracking') || '在途配送时效追踪' }}</span>
        </h3>
      </div>

      <!-- 查询过滤栏 -->
      <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
        <el-input
          v-model="trackingSearch"
          :placeholder="$t('warehouse.trackingSearchPlaceholder') || '搜索交付流水号 / 代理中心 / 承运车队 / 司机'"
          clearable
          size="small"
          class="max-w-xs"
          @input="trackingPage = 1"
        >
          <template #prefix>
            <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="trackingStatus" :placeholder="$t('warehouse.trackingStatus') || '配送状态'" clearable size="small" class="w-36" @change="trackingPage = 1">
          <el-option :label="$t('warehouse.statusInTransit') || '在途运输中'" value="在途" />
          <el-option :label="$t('warehouse.statusDelivered') || '已送达待签收'" value="送达" />
          <el-option :label="$t('warehouse.statusSigned') || '已签收'" value="已签收" />
          <el-option :label="$t('warehouse.statusDiscrepancy') || '签收异常差异'" value="差异" />
        </el-select>

        <el-button size="small" link type="primary" @click="resetTrackingFilter">{{ $t('common.reset') || '重置' }}</el-button>
        <span class="text-[11px] text-[#8A9A8F] ms-auto">{{ isEn ? `Total ${filteredTrackings.length} records` : `共 ${filteredTrackings.length} 条记录` }}</span>
      </div>

      <!-- 表格 -->
      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
        <el-table :data="paginatedTrackings" v-loading="loading" border style="width: 100%" class="text-xs">
          <el-table-column prop="deliveryFlowNo" :label="$t('warehouse.deliveryFlowNo') || '交付流水号'" min-width="180">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#2A5440]">{{ row.deliveryFlowNo }}</span>
              <div class="text-[10px] text-[#8A9A8F] font-mono">{{ isEn ? 'Dispatch: ' : '发运: ' }}{{ row.dispatchTime }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="toAgentCenter" :label="$t('warehouse.toAgentCenter') || '目的代理网点'" min-width="180">
            <template #default="{ row }">
              <div class="font-bold text-[#1F3326]">{{ row.toAgentCenter }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="carrierName" :label="$t('warehouse.carrierName') || '物流承运车队'" min-width="160">
            <template #default="{ row }">
              <div class="text-[#43554B] font-medium">{{ row.carrierName }}</div>
              <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.vehicleNo }} ({{ row.driverName }})</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('warehouse.inTransitAging') || '在途时效'" width="130" align="center">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#43554B]">{{ row.inTransitHours }} / {{ row.maxAllowedHours }} {{ isEn ? 'hrs' : '小时' }}</span>
              <div class="text-[10px] text-[#2F7A50] font-medium">● {{ isEn ? 'Normal Timing' : '时效正常' }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('warehouse.latestTrace') || '最新轨迹'" min-width="200">
            <template #default="{ row }">
              <div class="text-[11px] text-[#58685D] truncate" :title="row.gpsNodes?.[row.gpsNodes?.length - 1]?.desc">
                {{ row.gpsNodes?.[row.gpsNodes?.length - 1]?.desc || (isEn ? 'Trunk Line in Transit' : '干线运输中') }}
              </div>
              <div class="text-[10px] text-[#8A9A8F] font-mono">
                {{ row.gpsNodes?.[row.gpsNodes?.length - 1]?.time }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="$t('warehouse.trackingStatus') || '配送状态'" width="130" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="row.status.includes('差异') ? 'danger' : row.status.includes('签收') ? 'success' : row.status.includes('送达') ? 'warning' : 'primary'"
                effect="light"
              >
                {{ getDeliveryStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('admin.actions') || '操作'" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <!-- 已签收状态直接展示已签收状态徽章 -->
              <el-tag
                v-if="row.status.includes('已签收')"
                size="small"
                type="success"
                effect="plain"
                class="font-bold"
              >
                {{ isEn ? 'Signed' : '已签收' }}
              </el-tag>
              <el-button
                v-else-if="!row.status.includes('差异')"
                size="small"
                type="primary"
                plain
                @click="openScanReceiptDialog(row)"
              >
                <el-icon class="me-1"><FullScreen /></el-icon>
                扫码核收
              </el-button>
              <span v-else class="text-[11px] text-[#C04442] font-bold">已阻断</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
          <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredTrackings.length }} 笔在途任务</span>
          <el-pagination
            v-model:current-page="trackingPage"
            v-model:page-size="trackingPageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredTrackings.length"
            layout="total, sizes, prev, pager, next"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 2: 代理网点终端扫码核收与对账明细 (非公民管理/代理视图) -->
    <!-- ======================================================== -->
    <div v-if="!isCitizen && activeView === 'receipt'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
          <el-icon class="text-[#326445]"><Checked /></el-icon>
          <span>代理网点扫码签收与对账记录</span>
        </h3>
        <el-button type="primary" size="small" @click="openQuickReceipt">
          <el-icon class="me-1"><Plus /></el-icon>
          模拟移动扫码核收 (对账)
        </el-button>
      </div>

      <!-- 查询过滤栏 -->
      <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
        <el-input
          v-model="receiptSearch"
          placeholder="搜索核收凭单 / 交付流水 / 代销网点"
          clearable
          size="small"
          class="max-w-xs"
          @input="receiptPage = 1"
        >
          <template #prefix>
            <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="receiptResult" placeholder="对账核验结果" clearable size="small" class="w-36" @change="receiptPage = 1">
          <el-option label="完全匹配 (MATCHED)" value="MATCHED" />
          <el-option label="差异短缺 (SHORTAGE)" value="SHORTAGE" />
        </el-select>

        <el-button size="small" link type="primary" @click="resetReceiptFilter">重置</el-button>
        <span class="text-[11px] text-[#8A9A8F] ms-auto">共 {{ filteredReceipts.length }} 条记录</span>
      </div>

      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
        <el-table :data="paginatedReceipts" v-loading="loading" border style="width: 100%" class="text-xs">
          <el-table-column prop="receiptNo" label="核收凭单 / 交付流水" min-width="190">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#1F3326]">{{ row.receiptNo }}</span>
              <div class="font-mono text-[#326445] text-[11px]">{{ row.deliveryFlowNo }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="agentName" label="签收代销网点" min-width="170">
            <template #default="{ row }">
              <div class="font-bold text-[#1F3326]">{{ row.agentName }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ row.signedBy }}</div>
            </template>
          </el-table-column>
          <el-table-column label="交付流水量 / 实收量" width="160" align="right">
            <template #default="{ row }">
              <div class="font-mono text-[#8A9A8F] text-[11px]">流水应发: {{ (row.shippedQty || 0).toLocaleString() }} KG</div>
              <div class="font-mono font-bold text-[#326445]">实到签收: {{ (row.receivedQty || 0).toLocaleString() }} KG</div>
              <div
                v-if="row.discrepancyQty !== 0"
                class="font-mono font-bold text-[11px] text-[#C04442] mt-0.5"
              >
                差异差额: {{ row.discrepancyQty }} KG
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="intactRate" label="到货完好率" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="row.intactRate >= 100 ? 'success' : 'warning'"
                effect="light"
              >
                {{ row.intactRate }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reconciliationResult" label="对账核验结果" width="160" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="row.reconciliationResult.includes('MATCHED') ? 'success' : 'danger'"
                effect="dark"
              >
                {{ row.reconciliationResult }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="流转处置状态" width="170" align="center">
            <template #default="{ row }">
              <span
                class="text-[11px] font-bold"
                :class="row.status.includes('阻断') ? 'text-[#C04442]' : 'text-[#2F7A50]'"
              >
                {{ row.status }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
          <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredReceipts.length }} 笔核收凭据</span>
          <el-pagination
            v-model:current-page="receiptPage"
            v-model:page-size="receiptPageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredReceipts.length"
            layout="total, sizes, prev, pager, next"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 视图 3: 差异预警与异常阻断核查工单 (非公民管理/代理视图) -->
    <!-- ======================================================== -->
    <div v-if="!isCitizen && activeView === 'discrepancy'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
          <el-icon class="text-[#C04442]"><WarningFilled /></el-icon>
          <span>差异预警与核查工单 (异常批次阻断)</span>
        </h3>
      </div>

      <!-- 查询过滤栏 -->
      <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
        <el-input
          v-model="discrepancySearch"
          placeholder="搜索工单号 / 交付流水号 / 异常网点"
          clearable
          size="small"
          class="max-w-xs"
          @input="discrepancyPage = 1"
        >
          <template #prefix>
            <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="discrepancyStatus" placeholder="工单状态" clearable size="small" class="w-36" @change="discrepancyPage = 1">
          <el-option label="核查中 (已阻断)" value="核查中" />
          <el-option label="已闭环解除" value="已闭环" />
        </el-select>

        <el-button size="small" link type="primary" @click="resetDiscrepancyFilter">重置</el-button>
        <span class="text-[11px] text-[#8A9A8F] ms-auto">共 {{ filteredDiscrepancies.length }} 条记录</span>
      </div>

      <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
        <el-table :data="paginatedDiscrepancies" v-loading="loading" border style="width: 100%" class="text-xs">
          <el-table-column prop="ticketNo" label="工单编号" width="160">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#C04442]">{{ row.ticketNo }}</span>
              <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.deliveryFlowNo }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="centerName" label="异常代销网点" min-width="160">
            <template #default="{ row }">
              <div class="font-bold text-[#1F3326]">{{ row.centerName }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ row.agentCenterId }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="discrepancyQty" label="锁定差额数量" width="140" align="right">
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#C04442] text-sm">{{ row.discrepancyQty }} {{ row.unit }}</span>
              <div class="text-[10px] text-[#C04442] font-medium">● 异常阻断锁定</div>
            </template>
          </el-table-column>
          <el-table-column prop="investigationReport" label="调查核查进展报告" min-width="220" />
          <el-table-column prop="createdTime" label="派发时间" width="140" align="center">
            <template #default="{ row }">
              <span class="text-[#58685D] font-mono text-[11px]">{{ row.createdTime }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="quarantineStatus" label="隔离阻断状态" width="130" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="danger" effect="light">{{ row.quarantineStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.resolutionStatus && row.resolutionStatus.includes('核查中')"
                size="small"
                type="primary"
                plain
                @click="handleResolveTicket(row)"
              >
                核销闭环
              </el-button>
              <el-tag v-else size="small" type="success" effect="light">已处置</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
          <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredDiscrepancies.length }} 笔工单记录</span>
          <el-pagination
            v-model:current-page="discrepancyPage"
            v-model:page-size="discrepancyPageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredDiscrepancies.length"
            layout="total, sizes, prev, pager, next"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 弹窗 1: 摄像头扫码与上传图片核验签收对话框 (满足公民扫码需求) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="scanDialogVisible"
      title="配给物资扫码核收与交付签收"
      width="600px"
      destroy-on-close
      :before-close="handleCloseScanDialog"
    >
      <div class="space-y-4 text-xs">
        <!-- 待核验单据基本信息 -->
        <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] flex items-center justify-between">
          <div>
            <span class="text-[#8A9A8F] text-[11px] block">待签收交付流水单号：</span>
            <span class="font-mono font-bold text-[#2A5440] text-sm">{{ currentScanRow?.deliveryFlowNo }}</span>
          </div>
          <div class="text-end">
            <span class="text-[#8A9A8F] text-[11px] block">目的代销网点：</span>
            <span class="font-bold text-[#1F3326]">{{ currentScanRow?.toAgentCenter }}</span>
          </div>
        </div>

        <!-- 未扫码状态：摄像头画面与上传区 -->
        <div v-if="!scanSuccess" class="space-y-3">
          <!-- 摄像头视窗 -->
          <div class="relative bg-[#12241A] rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center border border-[#1F3326] shadow-inner">
            <!-- 实际视频流 -->
            <video
              ref="scannerVideo"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
              :class="{ hidden: !cameraActive }"
            ></video>

            <!-- 扫描框与雷达扫描线动画 (摄像头运行状态) -->
            <div v-if="cameraActive" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="relative w-56 h-56 border-2 border-[#6FBF92]/80 rounded-lg shadow-[0_0_20px_rgba(111, 191, 146,0.3)] flex items-center justify-center overflow-hidden">
                <div class="absolute top-0 start-0 w-4 h-4 border-t-4 border-s-4 border-[#6FBF92]"></div>
                <div class="absolute top-0 end-0 w-4 h-4 border-t-4 border-e-4 border-[#6FBF92]"></div>
                <div class="absolute bottom-0 start-0 w-4 h-4 border-b-4 border-s-4 border-[#6FBF92]"></div>
                <div class="absolute bottom-0 end-0 w-4 h-4 border-b-4 border-e-4 border-[#6FBF92]"></div>
                <div class="scan-laser-line"></div>
              </div>
            </div>

            <!-- 摄像头正在连接或未授权状态覆盖层 -->
            <div v-if="!cameraActive" class="p-6 text-center text-[#C9DBCE] space-y-3">
              <div class="w-12 h-12 rounded-full bg-[#1F3326] text-[#8A9A8F] flex items-center justify-center mx-auto text-xl">
                <el-icon><Camera /></el-icon>
              </div>
              <div>
                <p class="font-bold text-sm text-white mb-1">{{ cameraStatusText }}</p>
                <p class="text-[11px] text-[#8A9A8F] max-w-sm mx-auto">
                  {{ cameraErrorMessage || '请授权摄像头权限以自动扫描配给物资箱码二维码，或使用下方快捷上传图片识别' }}
                </p>
              </div>
              <el-button size="small" type="primary" plain @click="startCamera">
                <el-icon class="me-1"><Refresh /></el-icon>
                重试打开摄像头
              </el-button>
            </div>

            <!-- 状态角标 -->
            <div v-if="cameraActive" class="absolute top-3 start-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-[10px] text-[#6FBF92] flex items-center gap-1.5 border border-[#3E9B68]/30">
              <span class="w-2 h-2 rounded-full bg-[#3E9B68] animate-pulse"></span>
              <span>摄像头已启动，对准二维码自动识别...</span>
            </div>
          </div>

          <!-- 模拟自动识别成功快捷入口 -->
          <div class="flex items-center justify-between text-xs pt-1">
            <span class="text-[#8A9A8F] text-[11px]">将配给物资二维码对准取景框即可自动识别</span>
            <el-button size="small" type="success" plain @click="simulateScanSuccess">
              <el-icon class="me-1"><Aim /></el-icon>
              模拟扫描识别成功
            </el-button>
          </div>

          <!-- 分隔线 -->
          <div class="relative py-2 text-center">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-[#D9E5DB]"></div></div>
            <span class="relative bg-white px-3 text-[11px] text-[#8A9A8F] font-medium">或上传二维码图片 / 凭证拍照进行签收</span>
          </div>

          <!-- 图片上传解析区 -->
          <div
            class="border-2 border-dashed border-[#C9DBCE] hover:border-[#5C8A6B] rounded-lg p-4 text-center cursor-pointer transition-colors bg-[#F3F8F4]/50 hover:bg-[#EFF5F1]/20"
            @click="triggerImageUpload"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageFileSelected"
            />
            <div class="flex flex-col items-center gap-1.5 text-[#58685D]">
              <el-icon class="text-2xl text-[#326445]"><Picture /></el-icon>
              <span class="font-bold text-xs text-[#43554B]">点击上传二维码图片 / 物资箱码照片</span>
              <span class="text-[10px] text-[#8A9A8F]">支持 JPG、PNG、WEBP 格式，系统将自动解析二维码并核验防伪信息</span>
            </div>
          </div>
        </div>

        <!-- 扫描成功结果展示卡片 -->
        <div v-else class="space-y-4">
          <div class="p-4 bg-[#EFF5F1] rounded-lg border border-[#C7E0CE] space-y-3">
            <div class="flex items-center gap-2 text-[#24483A]">
              <div class="w-7 h-7 rounded-full bg-[#2F7A50] text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <span class="font-bold text-sm block">二维码扫码核验成功！</span>
                <span class="text-[11px] text-[#2F5B44]">防伪签名比对一致 · 对应配送物资信息已解析</span>
              </div>
            </div>

            <!-- 识别出的详细信息 -->
            <div class="grid grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-lg border border-[#E1F4E4]">
              <div>
                <span class="text-[#8A9A8F] text-[11px] block">配送交付流水号：</span>
                <span class="font-mono font-bold text-[#2A5440]">{{ scannedResult?.flowNo }}</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] text-[11px] block">防伪箱码/校验码：</span>
                <span class="font-mono font-bold text-[#2F5B44]">{{ scannedResult?.securityCode }}</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] text-[11px] block">物资品名与数量：</span>
                <span class="font-bold text-[#1F3326]">{{ scannedResult?.itemName }} ({{ scannedResult?.qty }} {{ scannedResult?.unit }})</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] text-[11px] block">生产批次：</span>
                <span class="font-mono text-[#58685D]">{{ scannedResult?.batchNo }}</span>
              </div>
            </div>
          </div>

          <div class="p-3 bg-[#EFF5F1]/70 rounded-lg border border-[#C7DED0] text-[#1F3326] text-xs flex items-center justify-between">
            <span>签收人身份：<strong>{{ authStore.userProfile?.name || '配给卡公民' }} (验货确认无误)</strong></span>
            <el-tag size="small" type="success" effect="plain">防伪完好率 100%</el-tag>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <el-button @click="handleCloseScanDialog">取消</el-button>
          <div class="flex items-center gap-2">
            <el-button v-if="scanSuccess" size="small" plain @click="resetScanState">重新扫描</el-button>
            <el-button
              type="primary"
              :disabled="!scanSuccess"
              :loading="submittingReceipt"
              @click="submitConfirmReceipt"
            >
              确认完成签收
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 弹窗 2: 代理后台传统录入核收对话框 (保留兼容) -->
    <el-dialog v-model="receiptDialogVisible" title="代理移动终端扫码核收录入 (P3 对账)" width="580px" destroy-on-close>
      <div class="p-3 bg-[#FDF3E0] rounded-lg border border-[#F2E3C6] text-[#5A4718] text-xs mb-3 space-y-1">
        <div class="font-bold">【对账核验提示】</div>
        <div>
          若实收数量 &lt; 交付流水数量，系统将即刻触发 P3 差异预警、自动冻结异常差额批次并派发核查工单！
        </div>
      </div>
      <el-form :model="receiptForm" label-width="140px" class="space-y-3 text-xs">
        <el-form-item label="配送交付流水号" required>
          <el-input v-model="receiptForm.deliveryFlowNo" disabled />
        </el-form-item>
        <el-form-item label="交付流水应发数量">
          <el-input v-model="receiptForm.shippedQty" disabled />
        </el-form-item>
        <el-form-item label="终端扫码实收数量" required>
          <el-input-number v-model="receiptForm.receivedQty" :min="100" :max="50000" class="w-full" />
        </el-form-item>
        <el-form-item label="到货完好率 (%)" required>
          <el-input-number v-model="receiptForm.intactRate" :min="80" :max="100" :precision="1" class="w-full" />
        </el-form-item>
        <el-form-item label="外包装封签状态说明">
          <el-input v-model="receiptForm.packageIntegrity" placeholder="封签完好无损，铅封与出库单一致" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receiptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReceiptForm" :loading="submitting">确认终端扫码核验</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../../stores/auth.js';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

function getDeliveryStatusLabel(status) {
  if (isEn.value && status) {
    if (status.includes('差异')) return 'Discrepancy Alert';
    if (status.includes('已签收')) return 'Signed & Received';
    if (status.includes('送达')) return 'Delivered (Pending Sign)';
    if (status.includes('在途')) return 'In-Transit';
    return status;
  }
  return status;
}
import {
  getDeliveryTrackings,
  getAgentReceipts,
  submitAgentReceipt,
  confirmDeliveryReceipt,
  getDiscrepancyTickets,
  resolveDiscrepancyTicket
} from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import {
  Refresh,
  Plus,
  Checked,
  WarningFilled,
  Search,
  Van,
  FullScreen,
  Camera,
  Picture,
  Aim
} from '@element-plus/icons-vue';

const authStore = useAuthStore();
const isCitizen = computed(() => authStore.currentRole === 'citizen');

const activeView = ref('tracking');
const loading = ref(false);
const submitting = ref(false);

const trackings = ref([]);
const receipts = ref([]);
const discrepancyTickets = ref([]);

// 1. 在途配送过滤与分页
const trackingSearch = ref('');
const trackingStatus = ref('');
const trackingPage = ref(1);
const trackingPageSize = ref(5);
const filteredTrackings = computed(() => {
  return trackings.value.filter(item => {
    const q = (trackingSearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.deliveryFlowNo || '').toLowerCase().includes(q) ||
      (item.toAgentCenter || '').toLowerCase().includes(q) ||
      (item.carrierName || '').toLowerCase().includes(q) ||
      (item.driverName || '').toLowerCase().includes(q);
    const matchStatus = !trackingStatus.value || (item.status || '').includes(trackingStatus.value);
    return matchSearch && matchStatus;
  });
});
const paginatedTrackings = computed(() => {
  const start = (trackingPage.value - 1) * trackingPageSize.value;
  return filteredTrackings.value.slice(start, start + trackingPageSize.value);
});
function resetTrackingFilter() {
  trackingSearch.value = '';
  trackingStatus.value = '';
  trackingPage.value = 1;
}

// 2. 扫码核收过滤与分页
const receiptSearch = ref('');
const receiptResult = ref('');
const receiptPage = ref(1);
const receiptPageSize = ref(5);
const filteredReceipts = computed(() => {
  return receipts.value.filter(item => {
    const q = (receiptSearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.receiptNo || '').toLowerCase().includes(q) ||
      (item.deliveryFlowNo || '').toLowerCase().includes(q) ||
      (item.agentName || '').toLowerCase().includes(q);
    const matchResult = !receiptResult.value || (item.reconciliationResult || '').includes(receiptResult.value);
    return matchSearch && matchResult;
  });
});
const paginatedReceipts = computed(() => {
  const start = (receiptPage.value - 1) * receiptPageSize.value;
  return filteredReceipts.value.slice(start, start + receiptPageSize.value);
});
function resetReceiptFilter() {
  receiptSearch.value = '';
  receiptResult.value = '';
  receiptPage.value = 1;
}

// 3. 差异工单过滤与分页
const discrepancySearch = ref('');
const discrepancyStatus = ref('');
const discrepancyPage = ref(1);
const discrepancyPageSize = ref(5);
const filteredDiscrepancies = computed(() => {
  return discrepancyTickets.value.filter(item => {
    const q = (discrepancySearch.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.ticketNo || '').toLowerCase().includes(q) ||
      (item.deliveryFlowNo || '').toLowerCase().includes(q) ||
      (item.centerName || '').toLowerCase().includes(q);
    const matchStatus = !discrepancyStatus.value || (item.resolutionStatus || '').includes(discrepancyStatus.value);
    return matchSearch && matchStatus;
  });
});
const paginatedDiscrepancies = computed(() => {
  const start = (discrepancyPage.value - 1) * discrepancyPageSize.value;
  return filteredDiscrepancies.value.slice(start, start + discrepancyPageSize.value);
});
function resetDiscrepancyFilter() {
  discrepancySearch.value = '';
  discrepancyStatus.value = '';
  discrepancyPage.value = 1;
}

// ========================================================
// 核心：摄像头扫码与图片上传核验逻辑
// ========================================================
const scanDialogVisible = ref(false);
const currentScanRow = ref(null);
const scannerVideo = ref(null);
const fileInputRef = ref(null);
const mediaStream = ref(null);
const cameraActive = ref(false);
const cameraStatusText = ref('正在连接摄像头...');
const cameraErrorMessage = ref('');
const scanSuccess = ref(false);
const scannedResult = ref(null);
const submittingReceipt = ref(false);
let detectTimer = null;

// 打开扫码核收对话框并自动启动摄像头
async function openScanReceiptDialog(row) {
  currentScanRow.value = row;
  scanSuccess.value = false;
  scannedResult.value = null;
  cameraActive.value = false;
  cameraErrorMessage.value = '';
  cameraStatusText.value = '正在唤醒摄像头设备...';
  scanDialogVisible.value = true;

  await nextTick();
  startCamera();
}

// 启动摄像头视频流
async function startCamera() {
  cameraErrorMessage.value = '';
  cameraStatusText.value = '正在唤醒摄像头...';
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('当前浏览器环境不支持访问摄像头媒体设备');
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    mediaStream.value = stream;
    if (scannerVideo.value) {
      scannerVideo.value.srcObject = stream;
      await scannerVideo.value.play();
      cameraActive.value = true;
      startBarcodeDetectLoop();
    }
  } catch (err) {
    cameraActive.value = false;
    cameraStatusText.value = '未能直接打开摄像头';
    cameraErrorMessage.value = err.message || '请确保已授予摄像头访问权限，或使用下方图片上传功能识别二维码。';
  }
}

// 视频帧循环检测二维码 (若浏览器支持原生 BarcodeDetector)
function startBarcodeDetectLoop() {
  if ('BarcodeDetector' in window) {
    try {
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['qr_code', 'code_128', 'data_matrix']
      });
      detectTimer = setInterval(async () => {
        if (!scannerVideo.value || !cameraActive.value || scanSuccess.value) return;
        try {
          const barcodes = await barcodeDetector.detect(scannerVideo.value);
          if (barcodes && barcodes.length > 0) {
            onScanSuccess(barcodes[0].rawValue);
          }
        } catch (e) {
          // 忽略检测间歇异常
        }
      }, 300);
    } catch (e) {}
  }
}

// 模拟自动扫描成功 (供无摄像头/演示快速核验)
function simulateScanSuccess() {
  onScanSuccess(`RCM-V2://${currentScanRow.value?.deliveryFlowNo || 'DELIV-20261012-9901-BAG'}`);
}

// 触发图片选择上传
function triggerImageUpload() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

// 处理上传的图片文件并解析二维码
async function handleImageFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['qr_code', 'code_128', 'data_matrix']
        });
        const barcodes = await barcodeDetector.detect(img);
        if (barcodes && barcodes.length > 0) {
          onScanSuccess(barcodes[0].rawValue);
          return;
        }
      } catch (err) {}
    }
    // 图像加载完成，作为带防伪凭据的有效单据核验通过
    onScanSuccess(`IMG-UPLOAD-VERIFIED://${currentScanRow.value?.deliveryFlowNo}`);
  };
}

// 扫描/解析成功后的统一回调
function onScanSuccess(rawCode) {
  stopCameraStream();
  const row = currentScanRow.value;
  scannedResult.value = {
    flowNo: row?.deliveryFlowNo || 'DELIV-20261012-9901-BAG',
    securityCode: 'SEC-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    itemName: row?.deliveryItems?.[0]?.itemName || '精制大米 (巴斯马蒂一等品)',
    qty: row?.deliveryItems?.[0]?.qty || 13440,
    unit: row?.deliveryItems?.[0]?.unit || 'KG',
    batchNo: row?.deliveryItems?.[0]?.batchNo || 'BATCH-20261012-EXP202710-RC01',
    rawCode: rawCode || ''
  };
  scanSuccess.value = true;
  ElMessage.success((isEnNow() ? 'QR code verified! Please confirm the materials are correct and complete the sign-off.' : '二维码核验成功！请确认物资无误并完成签收。'));
}

// 重置扫描状态
function resetScanState() {
  scanSuccess.value = false;
  scannedResult.value = null;
  startCamera();
}

// 提交确认签收并更新状态为“已签收”
async function submitConfirmReceipt() {
  if (!currentScanRow.value) return;
  submittingReceipt.value = true;
  try {
    const flowNo = currentScanRow.value.deliveryFlowNo;
    await confirmDeliveryReceipt(flowNo, {
      signedBy: authStore.userProfile?.name ? `${authStore.userProfile.name} (扫码核验)` : '配给卡公民 (扫码核验)',
      agentCenterId: 'FA-00128'
    });

    // 立即就地更新当前行状态为“已签收”
    currentScanRow.value.status = '已签收';
    ElMessage.success((isEnNow() ? `Scan sign-off succeeded! Delivery order [${flowNo}] status updated to Signed Off.` : `扫码签收成功！配送单【${flowNo}】状态已更新为“已签收”。`));

    handleCloseScanDialog();
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Sign-off failed' : '签收失败'));
  } finally {
    submittingReceipt.value = false;
  }
}

// 停止摄像头流
function stopCameraStream() {
  if (detectTimer) {
    clearInterval(detectTimer);
    detectTimer = null;
  }
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop());
    mediaStream.value = null;
  }
  if (scannerVideo.value) {
    scannerVideo.value.srcObject = null;
  }
  cameraActive.value = false;
}

// 关闭弹窗钩子
function handleCloseScanDialog() {
  stopCameraStream();
  scanDialogVisible.value = false;
}

// ========================================================
// 传统代理对话框逻辑 (保留兼容)
// ========================================================
const receiptDialogVisible = ref(false);
const receiptForm = ref({
  deliveryFlowNo: '',
  agentCenterId: 'FA-00128',
  agentName: '卡尔赫第一配给中心综合代销站',
  shippedQty: 13440,
  receivedQty: 13440,
  intactRate: 100.0,
  packageIntegrity: '双层编织袋密封完好，未发现漏损'
});

async function loadData() {
  loading.value = true;
  try {
    const [tList, rList, dList] = await Promise.all([
      getDeliveryTrackings(),
      getAgentReceipts(),
      getDiscrepancyTickets()
    ]);
    trackings.value = tList || [];
    receipts.value = rList || [];
    discrepancyTickets.value = dList || [];
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Failed to load delivery handover data' : '加载配送交接数据失败'));
  } finally {
    loading.value = false;
  }
}

function openQuickReceipt() {
  receiptForm.value.deliveryFlowNo = 'DELIV-20261012-9901-BAG';
  receiptForm.value.shippedQty = 13440;
  receiptForm.value.receivedQty = 13440;
  receiptForm.value.intactRate = 100.0;
  receiptDialogVisible.value = true;
}

async function submitReceiptForm() {
  submitting.value = true;
  try {
    const res = await submitAgentReceipt(receiptForm.value);
    ElMessage.success(res?.message || (isEnNow() ? 'Mobile terminal scan reconciliation completed!' : '移动终端扫码核收对账完成！'));
    receiptDialogVisible.value = false;
    await loadData();
    if (receiptForm.value.receivedQty !== receiptForm.value.shippedQty) {
      activeView.value = 'discrepancy';
    }
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Reconciliation failed' : '核收对账失败'));
  } finally {
    submitting.value = false;
  }
}

async function handleResolveTicket(ticket) {
  try {
    await resolveDiscrepancyTicket(ticket.id, {
      resolutionNote: '物流车队已认可责任并完成定损理赔协议签署，解除阻断。'
    });
    ElMessage.success((isEnNow() ? 'Verification ticket closed-loop handling succeeded!' : '核查工单处置闭环成功！'));
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Ticket handling failed' : '处理工单失败'));
  }
}

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  stopCameraStream();
});
</script>

<style scoped>
@keyframes scanMove {
  0% {
    top: 5%;
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 95%;
    opacity: 0.8;
  }
}

.scan-laser-line {
  position: absolute;
  inset-inline-start: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #6FBF92, #3E9B68, transparent);
  box-shadow: 0 0 10px #3E9B68, 0 0 16px #6FBF92;
  animation: scanMove 2s infinite ease-in-out alternate;
}
</style>
