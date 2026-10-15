<template>
  <div class="security-audit-tab space-y-4">
    <!-- 标头 (极简，去掉了冗长介绍和微服务标签) -->
    <div class="flex items-center justify-between bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB]">
      <h3 class="text-xs font-bold text-[#43554B] uppercase tracking-wider flex items-center gap-1.5">
        <el-icon class="text-[#58685D]"><Document /></el-icon>
        <span>{{ $t('warehouse.securityAuditTitle') || '安全审计与操作留痕' }}</span>
      </h3>

      <div class="flex items-center gap-2">
        <el-button size="small" @click="loadData">
          <el-icon class="mr-1"><Refresh /></el-icon>
          {{ $t('common.refresh') || '刷新' }}
        </el-button>
      </div>
    </div>

    <!-- 查询过滤栏 -->
    <div class="bg-white p-3.5 rounded-lg border border-[#D9E5DB]/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
      <el-input
        v-model="searchQuery"
        :placeholder="isEn ? 'Search Operator / IP / Action' : '搜索操作人 / 终端 IP / 业务动作'"
        clearable
        size="small"
        class="max-w-xs"
        @input="page = 1"
      >
        <template #prefix>
          <el-icon class="text-[#8A9A8F]"><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="riskLevelFilter" :placeholder="isEn ? 'Risk Level' : '风险等级'" clearable size="small" class="w-32" @change="page = 1">
        <el-option :label="isEn ? 'CRITICAL (Critical)' : 'CRITICAL (极高危)'" value="CRITICAL" />
        <el-option :label="isEn ? 'HIGH (High)' : 'HIGH (高风险)'" value="HIGH" />
        <el-option :label="isEn ? 'INFO (Normal)' : 'INFO (常规提示)'" value="INFO" />
      </el-select>

      <el-select v-model="serviceFilter" :placeholder="isEn ? 'Microservice' : '微服务'" clearable size="small" class="w-32" @change="page = 1">
        <el-option label="SCM (仓储核心)" value="SCM" />
        <el-option label="BPM (工作流)" value="BPM" />
        <el-option label="GATEWAY (网关)" value="GATEWAY" />
        <el-option label="UNICODE (溯源)" value="UNICODE" />
        <el-option label="AUTH (认证中心)" value="AUTH" />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        :range-separator="$t('warehouse.timeSeparator') || '至'"
        :start-placeholder="$t('warehouse.startTime') || '开始时间'"
        :end-placeholder="$t('warehouse.endTime') || '结束时间'"
        value-format="YYYY-MM-DD HH:mm:ss"
        size="small"
        class="!w-72"
        @change="page = 1"
      />

      <el-button size="small" link type="primary" @click="resetFilters">{{ $t('common.reset') || '重置' }}</el-button>
      <span class="text-[11px] text-[#8A9A8F] ml-auto">{{ isEn ? `Total ${filteredAuditLogs.length} records` : `共 ${filteredAuditLogs.length} 条记录` }}</span>
    </div>

    <!-- 不可篡改操作审计日志表格 -->
    <div class="bg-white rounded-lg border border-[#D9E5DB]/80 shadow-xs overflow-hidden">
      <el-table :data="paginatedAuditLogs" v-loading="loading" border style="width: 100%" class="text-xs">
        <el-table-column prop="timestamp" label="操作时间 / 终端 IP" min-width="170">
          <template #default="{ row }">
            <div class="font-mono font-bold text-[#1F3326]">{{ row.timestamp }}</div>
            <div class="font-mono text-[#8A9A8F] text-[10px] mt-0.5">IP: {{ row.terminalIp }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人 / 角色" width="160">
          <template #default="{ row }">
            <div class="font-bold text-[#1F3326]">{{ row.operatorName }}</div>
            <div class="text-[11px] text-[#8A9A8F]">{{ row.role }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="microservice" label="所属微服务" width="130">
          <template #default="{ row }">
            <el-tag size="small" type="primary" effect="plain" class="font-mono font-bold">
              {{ row.microservice }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actionDesc" label="操作业务动作与留痕详情" min-width="260">
          <template #default="{ row }">
            <div class="font-medium text-[#1F3326]">{{ row.actionDesc }}</div>
            <div class="text-[10px] text-[#8A9A8F] font-mono mt-0.5">模块: {{ row.module }} · 动作: {{ row.action }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="安全风险等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.riskLevel === 'CRITICAL' ? 'danger' : row.riskLevel === 'HIGH' ? 'warning' : 'info'"
              effect="dark"
            >
              {{ row.riskLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审计快照与操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <el-button size="small" type="primary" link @click="viewSnapshotDiff(row)">
                快照对比
              </el-button>
              <!-- 列表中的 风险核验 按钮，点击弹出 强制签批要求 窗口 -->
              <el-button
                size="small"
                type="danger"
                plain
                @click="openRiskVerify(row)"
              >
                风险核验
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 审计日志分页 -->
      <div class="p-3 bg-[#F3F8F4]/60 border-t border-[#E9F1EB] flex items-center justify-between text-xs">
        <span class="text-[#8A9A8F] text-[11px]">共 {{ filteredAuditLogs.length }} 笔日志记录</span>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filteredAuditLogs.length"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          size="small"
        />
      </div>
    </div>

    <!-- 强制签批要求 窗口 (P5 规则) -->
    <el-dialog v-model="doubleSignDialogVisible" title="强制签批要求 (P5 标准)" width="580px" destroy-on-close>
      <div class="p-3 bg-[#FDF3E0] rounded-lg border border-[#F2E3C6] text-[#5A4718] text-xs mb-3 space-y-1">
        <div class="font-bold">【强制签批要求】</div>
        <div>对入库批次强制修改、库存盘点差异入账、大额报损等操作，必须强制录入主操作人与复核主管双人工号和密码验证，严禁单人直接入账！</div>
      </div>
      <el-form :model="doubleSignForm" label-width="130px" class="space-y-3 text-xs">
        <el-form-item label="待审批高风险业务" required>
          <el-select v-model="doubleSignForm.targetTitle" class="w-full">
            <el-option label="LOSS-20261012-003 物理破损 50KG 报损出库" value="LOSS-20261012-003 物理破损 50KG 报损出库" />
            <el-option label="STK-CHK-202610-01 面粉盘亏 20KG 差异入账" value="STK-CHK-202610-01 面粉盘亏 20KG 差异入账" />
          </el-select>
        </el-form-item>
        <el-form-item label="主操作人身份" required>
          <el-input v-model="doubleSignForm.approver1" placeholder="主操作仓管员工号/姓名" />
        </el-form-item>
        <el-form-item label="复核主管身份" required>
          <el-input v-model="doubleSignForm.approver2" placeholder="复核监督主管工号/姓名 (必须双人)" />
        </el-form-item>
        <el-form-item label="复核主管动态授权口令" required>
          <el-input v-model="doubleSignForm.authCode" type="password" placeholder="6位安全动态令牌" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="doubleSignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDoubleSign" :loading="submitting">双人签批确认并入账</el-button>
      </template>
    </el-dialog>

    <!-- 查看快照 JSON 对账弹窗 -->
    <el-dialog v-model="snapshotDiffVisible" title="操作审计原始数据与变更后快照详情" width="600px" destroy-on-close>
      <div v-if="activeLog" class="space-y-3 text-xs">
        <div>
          <span class="font-bold text-[#43554B] block mb-1">变更前原始快照 (Before Snapshot)：</span>
          <pre class="bg-[#1B3123] text-[#E9F1EB] p-3 rounded-lg font-mono text-[11px] overflow-x-auto">{{ activeLog.beforeSnapshot }}</pre>
        </div>
        <div>
          <span class="font-bold text-[#43554B] block mb-1">变更后当前快照 (After Snapshot)：</span>
          <pre class="bg-[#1B3123] text-[#6FBF92] p-3 rounded-lg font-mono text-[11px] overflow-x-auto">{{ activeLog.afterSnapshot }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAuditLogs, submitDoubleApproval } from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import { Refresh, Document, Search } from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const loading = ref(false);
const submitting = ref(false);
const auditLogs = ref([]);

// 过滤状态
const searchQuery = ref('');
const riskLevelFilter = ref('');
const serviceFilter = ref('');
const dateRange = ref(null);

// 分页状态
const page = ref(1);
const pageSize = ref(10);

const filteredAuditLogs = computed(() => {
  return auditLogs.value.filter(item => {
    // 关键字搜索
    const q = (searchQuery.value || '').toLowerCase();
    const matchSearch = !q ||
      (item.operatorName || '').toLowerCase().includes(q) ||
      (item.terminalIp || '').toLowerCase().includes(q) ||
      (item.actionDesc || '').toLowerCase().includes(q) ||
      (item.module || '').toLowerCase().includes(q);

    // 风险等级筛选
    const matchRisk = !riskLevelFilter.value || item.riskLevel === riskLevelFilter.value;

    // 微服务筛选
    const matchService = !serviceFilter.value || item.microservice === serviceFilter.value;

    // 日期范围过滤
    let matchDate = true;
    if (dateRange.value && Array.isArray(dateRange.value) && dateRange.value.length === 2) {
      const [start, end] = dateRange.value;
      if (start && item.timestamp < start) matchDate = false;
      if (end && item.timestamp > end) matchDate = false;
    }

    return matchSearch && matchRisk && matchService && matchDate;
  });
});

const paginatedAuditLogs = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredAuditLogs.value.slice(start, start + pageSize.value);
});

function resetFilters() {
  searchQuery.value = '';
  riskLevelFilter.value = '';
  serviceFilter.value = '';
  dateRange.value = null;
  page.value = 1;
}

const doubleSignDialogVisible = ref(false);
const snapshotDiffVisible = ref(false);
const activeLog = ref(null);

const doubleSignForm = ref({
  targetTitle: 'LOSS-20261012-003 物理破损 50KG 报损出库',
  lossId: 'LOSS-20261012-003',
  stocktakeId: 'STK-CHK-202610-01',
  approver1: '阿里·扎基 (主仓管员)',
  approver2: '塔里克·阿齐兹 (复核主管)',
  authCode: '881920'
});

async function loadData() {
  loading.value = true;
  try {
    const list = await getAuditLogs();
    auditLogs.value = list || [];
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Failed to load security audit logs' : '加载安全审计日志失败'));
  } finally {
    loading.value = false;
  }
}

function openRiskVerify(row) {
  if (row) {
    doubleSignForm.value.targetTitle = `${row.actionDesc || '高风险审计留痕业务'} (风险等级: ${row.riskLevel})`;
  }
  doubleSignDialogVisible.value = true;
}

async function submitDoubleSign() {
  submitting.value = true;
  try {
    await submitDoubleApproval(doubleSignForm.value);
    ElMessage.success((isEnNow() ? 'High-risk operation dual sign-off passed! Tamper-proof audit trail has been booked' : '高风险业务双人签批通过！已完成不可篡改审计留痕入账'));
    doubleSignDialogVisible.value = false;
    await loadData();
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Dual sign-off failed' : '双人签批失败'));
  } finally {
    submitting.value = false;
  }
}

function viewSnapshotDiff(row) {
  activeLog.value = row;
  snapshotDiffVisible.value = true;
}

onMounted(() => {
  loadData();
});
</script>
