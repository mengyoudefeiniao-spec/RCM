<template>
  <div class="agent-b2c-panel space-y-5">
    <!-- ======================================================== -->
    <!-- 1. 今日各时段接待容量 (Capacity) 与并发监控看板 -->
    <!-- ======================================================== -->
    <div class="bg-white rounded-lg border border-[#D9E5DB] p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[#3E9B68] animate-pulse"></span>
          <h4 class="font-bold text-[#1F3326] text-xs sm:text-sm">
            今日分时段预约接待容量与现场排期看板 (并发配额池)
          </h4>
        </div>
        <div class="flex items-center gap-3 text-xs text-[#58685D]">
          <span class="text-[11px]">接待阈值单窗口上限：<strong>50~60 户</strong></span>
          <el-button size="small" link type="primary" @click="loadSlots">刷新排期</el-button>
        </div>
      </div>

      <!-- 四个时间窗口接待负荷卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div
          v-for="slot in timeSlots"
          :key="slot.slotId"
          class="p-3.5 rounded-lg border transition-all"
          :class="slot.status === 'ACTIVE_NOW' ? 'bg-[#EFF5F1]/70 border-[#A7D9BC] ring-2 ring-[#3E9B68]/20' : 'bg-[#F3F8F4] border-[#D9E5DB]'"
        >
          <div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]/60">
            <span class="font-bold font-mono text-[#1B3123] text-sm">{{ slot.timeRange }}</span>
            <el-tag
              size="small"
              :type="slot.status === 'ACTIVE_NOW' ? 'success' : 'info'"
              :effect="slot.status === 'ACTIVE_NOW' ? 'dark' : 'plain'"
            >
              {{ slot.status === 'ACTIVE_NOW' ? '当前核销中' : (slot.status === 'UPCOMING' ? '即将开始' : '已结束') }}
            </el-tag>
          </div>

          <div class="pt-2 space-y-1.5">
            <div class="flex items-center justify-between text-[11px] text-[#58685D]">
              <span>已预约 / 容量阈值:</span>
              <span class="font-mono font-bold text-[#1F3326]">{{ slot.reservedCount }} / {{ slot.capacity }} 户</span>
            </div>
            <el-progress
              :percentage="Math.min(100, Math.round((slot.reservedCount / slot.capacity) * 100))"
              :color="slot.reservedCount >= slot.capacity ? '#C04442' : (slot.reservedCount > 50 ? '#D9B567' : '#3E9B68')"
              :stroke-width="6"
              :show-text="false"
            />
            <div class="flex items-center justify-between text-[10px] text-[#8A9A8F] pt-0.5">
              <span>已核销交付: <strong class="text-[#2F5B44]">{{ slot.verifiedCount }}</strong></span>
              <span>逾期爽约: <strong class="text-[#C04442]">{{ slot.missedCount }}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 现场到店核销工作台 (扫动态码 / NFC 读卡直读) -->
    <!-- ======================================================== -->
    <div class="bg-gradient-to-r rtl:bg-gradient-to-l from-[#1B3123] via-[#12241A] to-[#1B3123] rounded-lg p-5 text-white shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#326445] flex items-center justify-center text-white">
            <el-icon class="text-lg"><FullScreen /></el-icon>
          </div>
          <div>
            <h3 class="font-bold text-sm tracking-wide">智能终端现场核销仪 (V5 现场交付校验引擎)</h3>
            <p class="text-[11px] text-[#C9DBCE]">
              支持扫描公民 APP 动态提货码或直连 NFC/OTG 读配给卡，校验时段容差 (±30分钟)，严禁无单发货
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <el-button size="small" type="success" plain @click="simulateScan('AGT101-20261013-1012-3841')">
            <el-icon class="me-1"><Aim /></el-icon>
            快速载入待核销示范码 (穆斯塔法)
          </el-button>
          <el-button size="small" type="info" plain @click="simulateReadNfc('RC-10029381')">
            <el-icon class="me-1"><CreditCard /></el-icon>
            模拟 NFC 读卡
          </el-button>
        </div>
      </div>

      <!-- 搜索核销输入行 -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div class="sm:col-span-8">
          <el-input
            v-model="scanInput"
            placeholder="请扫描公民动态提货码 (如 AGT101-20261013-1012-3841) 或输入配给卡号 / 身份证号"
            size="large"
            clearable
            @keyup.enter="handleQueryReservation"
          >
            <template #prefix>
              <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="sm:col-span-4 flex items-center gap-2">
          <el-button
            type="primary"
            size="large"
            class="flex-1 font-bold"
            :loading="querying"
            @click="handleQueryReservation"
          >
            <el-icon class="me-1"><Aim /></el-icon>
            核验预约单
          </el-button>
          <el-button size="large" @click="resetScan">重置</el-button>
        </div>
      </div>

      <!-- 检索出的待核销单据卡片 -->
      <div v-if="currentRedeemTicket" class="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/15 space-y-3 text-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-[#E5CEA1]">{{ currentRedeemTicket.headName }}</span>
            <span class="text-[#C9DBCE] font-mono">({{ currentRedeemTicket.cardNo }})</span>
            <el-tag size="small" type="primary" effect="dark">{{ currentRedeemTicket.timeSlot }}</el-tag>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[#C9DBCE]">防截屏提货码：</span>
            <span class="font-mono font-bold text-[#6FBF92] text-sm tracking-wider">{{ currentRedeemTicket.pickupCode }}</span>
          </div>
        </div>

        <!-- 物资与配额核定 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="(it, i) in currentRedeemTicket.items"
            :key="i"
            class="p-2.5 bg-black/20 rounded-lg border border-white/5 space-y-1"
          >
            <div class="text-[11px] text-[#C9DBCE]">{{ it.itemName }}</div>
            <div class="font-mono font-bold text-base text-white">
              {{ it.qty }} <span class="text-xs font-normal text-[#8A9A8F]">{{ it.unit }}</span>
            </div>
          </div>
        </div>

        <!-- 时段与交付容差状态检验 (V5) -->
        <div
          class="p-3 rounded-lg border text-xs flex items-center justify-between"
          :class="isSlotMatched ? 'bg-[#12241A]/60 border-[#3E9B68]/40 text-[#C7E0CE]' : 'bg-[#3F3017]/60 border-[#D3AF62]/40 text-[#F2E3C6]'"
        >
          <div class="flex items-center gap-2">
            <el-icon class="text-base" :class="isSlotMatched ? 'text-[#6FBF92]' : 'text-[#DFC08B]'">
              <component :is="isSlotMatched ? 'CircleCheckFilled' : 'WarningFilled'" />
            </el-icon>
            <div>
              <span class="font-bold">{{ isSlotMatched ? '时段窗口校验合格' : '时段容差预警' }}：</span>
              <span>
                {{ isSlotMatched ? '当前处于允许履约窗口期内 (容差范围 ±30 分钟)。' : `预约时段为 ${currentRedeemTicket.timeSlot}，与当前时间窗口存在偏差。` }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <el-button
              type="success"
              size="default"
              class="font-bold shadow-xs"
              :loading="redeeming"
              @click="handleExecuteRedeem(false)"
            >
              一键核销出库发货 (扣减代理现货)
            </el-button>
            <el-button
              v-if="!isSlotMatched"
              type="warning"
              size="default"
              plain
              @click="handleExecuteRedeem(true)"
            >
              人工特批放行发货
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. 今日 B2C 预约履约流水记录列表 -->
    <!-- ======================================================== -->
    <div class="bg-white rounded-lg border border-[#D9E5DB] p-4 space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 font-bold text-[#1F3326]">
          <el-icon class="text-[#326445]"><Tickets /></el-icon>
          <span>社区居民分时预约与到店核销台账</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <el-select v-model="tableStatusFilter" size="small" style="width: 140px" @change="loadReservations">
            <el-option label="全部状态" value="全部" />
            <el-option label="待核销 (未到店)" value="PENDING_VERIFY" />
            <el-option label="已核销 (发货完成)" value="VERIFIED" />
            <el-option label="逾期爽约" value="EXPIRED" />
          </el-select>
          <el-button size="small" type="primary" plain @click="loadReservations">
            <el-icon class="me-1"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table
        :data="reservations"
        v-loading="loadingReservations"
        border
        style="width: 100%"
        class="text-xs"
      >
        <el-table-column prop="ticketNo" label="预约流水单号" width="180">
          <template #default="{ row }">
            <span class="font-mono font-bold text-[#1F3326]">{{ row.ticketNo }}</span>
            <div class="text-[10px] text-[#8A9A8F] mt-0.5">自费工本: {{ row.selfPayAmount }} IQD (已预付)</div>
          </template>
        </el-table-column>

        <el-table-column label="户主与配给卡号" min-width="190">
          <template #default="{ row }">
            <div class="font-bold text-[#1B3123]">{{ row.headName }}</div>
            <div class="text-[10px] text-[#58685D] font-mono">卡号: {{ row.cardNo }} · {{ row.familyMemberCount }}口人</div>
            <div class="text-[10px] text-[#8A9A8F] font-mono">国籍编号: {{ row.nationalId }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="timeSlot" label="预约时段窗口" width="130" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" class="font-mono">{{ row.timeSlot }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="核定补给物资明细" min-width="210">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(it, idx) in row.items"
                :key="idx"
                class="bg-[#F3F8F4] border border-[#D9E5DB] px-1.5 py-0.5 rounded text-[10px] text-[#43554B]"
              >
                {{ it.itemName }}: <strong>{{ it.qty }}{{ it.unit }}</strong>
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="提货凭证与动态码" width="190">
          <template #default="{ row }">
            <span class="font-mono font-bold text-[#2A5440]">{{ row.pickupCode }}</span>
            <div class="text-[10px] text-[#2F7A50] mt-0.5">
              短信已送达 ({{ row.smsSentTime?.slice(11) }})
            </div>
          </template>
        </el-table-column>

        <el-table-column label="核销状态 / 方式" width="150" align="center">
          <template #default="{ row }">
            <div v-if="row.status === 'VERIFIED'">
              <el-tag size="small" type="success" effect="dark">已核销出库</el-tag>
              <div class="text-[10px] text-[#8A9A8F] mt-0.5">{{ row.verifiedAt?.slice(11) }} (扫码)</div>
            </div>
            <div v-else-if="row.status === 'EXPIRED'">
              <el-tag size="small" type="danger" effect="light">逾期爽约</el-tag>
              <div class="text-[10px] text-[#C04442] mt-0.5">号源已释放</div>
            </div>
            <div v-else>
              <el-tag size="small" type="warning" effect="light">待到店核验</el-tag>
              <div class="text-[10px] text-[#8A9A8F] mt-0.5">等待出示提货码</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="现场操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING_VERIFY'"
              type="primary"
              size="small"
              @click="selectToRedeem(row)"
            >
              载入核销
            </el-button>
            <span v-else class="text-[#8A9A8F] text-[11px]">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  FullScreen,
  Search,
  Aim,
  CreditCard,
  CircleCheckFilled,
  WarningFilled,
  Tickets,
  Refresh
} from '@element-plus/icons-vue';
import {
  getAgentTimeSlots,
  getB2CReservations,
  verifyAndRedeemReservation
} from '../../../api/agent.js';

const timeSlots = ref([]);
const reservations = ref([]);
const loadingReservations = ref(false);
const tableStatusFilter = ref('全部');

const scanInput = ref('');
const querying = ref(false);
const redeeming = ref(false);
const currentRedeemTicket = ref(null);
const isSlotMatched = ref(true);

const loadSlots = async () => {
  try {
    const res = await getAgentTimeSlots('FA-00128', '2026-10-13');
    timeSlots.value = res.data || [];
  } catch (error) {
    ElMessage.error((isEnNow() ? 'Failed to load reception schedule' : '加载接待排期失败'));
  }
};

const loadReservations = async () => {
  loadingReservations.value = true;
  try {
    const res = await getB2CReservations({ status: tableStatusFilter.value });
    reservations.value = res.data || [];
  } catch (error) {
    ElMessage.error((isEnNow() ? 'Failed to load B2C reservation flow' : '加载 B2C 预约流水失败'));
  } finally {
    loadingReservations.value = false;
  }
};

const handleQueryReservation = async () => {
  const code = scanInput.value.trim();
  if (!code) {
    ElMessage.warning((isEnNow() ? 'Please enter the pickup code, card number or scan the QR code' : '请输入提货码、卡号或扫描二维码'));
    return;
  }
  querying.value = true;
  try {
    const res = await getB2CReservations({ keyword: code });
    const list = res.data || [];
    if (list.length === 0) {
      ElMessage.error((isEnNow() ? '[No Delivery Without Order]: No valid matching reservation found; dispatch is prohibited!' : '【严禁无单发货】：未检索到有效匹配的预约单，禁止发货！'));
      currentRedeemTicket.value = null;
    } else {
      const match = list[0];
      currentRedeemTicket.value = match;
      isSlotMatched.value = match.timeSlot.includes('08:00') || match.timeSlot.includes('10:00');
      ElMessage.success((isEnNow() ? `Search succeeded: Head [${match.headName}]` : `检索成功：户主【${match.headName}】`));
    }
  } catch (error) {
    ElMessage.error((isEnNow() ? 'Query error' : '查询异常'));
  } finally {
    querying.value = false;
  }
};

const simulateScan = (code) => {
  scanInput.value = code;
  handleQueryReservation();
};

const simulateReadNfc = (cardNo) => {
  scanInput.value = cardNo;
  handleQueryReservation();
};

const selectToRedeem = (row) => {
  currentRedeemTicket.value = row;
  scanInput.value = row.pickupCode;
  isSlotMatched.value = row.timeSlot.includes('08:00') || row.timeSlot.includes('10:00');
  window.scrollTo({ top: 120, behavior: 'smooth' });
};

const resetScan = () => {
  scanInput.value = '';
  currentRedeemTicket.value = null;
};

const handleExecuteRedeem = async (forceOverride = false) => {
  if (!currentRedeemTicket.value) return;
  redeeming.value = true;
  try {
    const payload = {
      pickupCode: currentRedeemTicket.value.pickupCode,
      verifyMethod: 'DYNAMIC_QR_CODE',
      forceOverride
    };
    const res = await verifyAndRedeemReservation(payload);
    ElMessage.success(res.message || (isEnNow() ? 'Verification and dispatch succeeded! Local agent stock has been deducted.' : '核销出库发货成功！代理本地现货已扣减。'));
    currentRedeemTicket.value = null;
    scanInput.value = '';
    await loadSlots();
    await loadReservations();
  } catch (error) {
    ElMessage.error(error.message || (isEnNow() ? 'Verification failed' : '核销失败'));
  } finally {
    redeeming.value = false;
  }
};

onMounted(() => {
  loadSlots();
  loadReservations();
});
</script>
