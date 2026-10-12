<template>
  <div class="electronic-review-view space-y-6">
    <!-- 头部说明 -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <el-icon class="text-amber-500"><Stamp /></el-icon>
          <span>电子审核工作台</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          统一受理申请分户、申请解冻、变更户主、成员录入、成员转移等人工核验工单，支持两级在线审批流转。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <el-button size="small" @click="handleRefresh">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新待办工单
        </el-button>
      </div>
    </div>

    <!-- 主体双栏：左侧待办工单列表(分来源展示)，右侧工作区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：待办清单 (分【来源】类型筛选) -->
      <div class="space-y-3 lg:col-span-1">
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>待办工单清单</span>
            <span class="text-[11px] text-slate-400 font-mono">
              共 {{ reviewStore.tickets.length }} 笔
            </span>
          </div>

          <!-- 分【来源】类型展示筛选按钮组 -->
          <div class="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              v-for="source in sourceList"
              :key="source"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
              :class="
                reviewStore.filterSource === source
                  ? 'bg-white text-amber-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              "
              @click="changeSourceFilter(source)"
            >
              <span>{{ source }}</span>
              <span
                class="text-[10px] px-1 rounded-full"
                :class="
                  reviewStore.filterSource === source
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-slate-200 text-slate-500'
                "
              >
                {{ getSourceCount(source) }}
              </span>
            </button>
          </div>

          <!-- 工单卡片列表 -->
          <div class="space-y-2 max-h-[640px] overflow-y-auto pr-0.5">
            <div
              v-if="reviewStore.tickets.length === 0"
              class="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl"
            >
              当前【{{ reviewStore.filterSource }}】来源下暂无待办工单
            </div>

            <div
              v-for="tk in reviewStore.tickets"
              :key="tk.id"
              class="p-3.5 rounded-xl border text-xs cursor-pointer transition-all"
              :class="
                reviewStore.selectedTicket?.id === tk.id
                  ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              "
              @click="reviewStore.selectTicket(tk)"
            >
              <div class="flex items-center justify-between gap-1 mb-1">
                <div class="flex items-center gap-1.5">
                  <el-tag size="small" :type="getSourceTagType(tk.source)" effect="plain" class="font-bold">
                    {{ tk.source }}
                  </el-tag>
                  <span class="font-bold font-mono text-slate-900">{{ tk.id }}</span>
                </div>

                <el-tag
                  size="small"
                  :type="
                    tk.status === '待分部初审'
                      ? 'warning'
                      : tk.status === '待经理终审'
                      ? 'primary'
                      : tk.status === '已批准'
                      ? 'success'
                      : 'danger'
                  "
                >
                  {{ tk.status }}
                </el-tag>
              </div>

              <div class="font-semibold text-slate-800">{{ tk.appType }}</div>
              <div class="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span class="truncate">目标: {{ tk.targetMemberName }}</span>
                <span class="font-mono text-slate-400 ml-1">{{ tk.submittedAt.slice(5) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：工单工作台详情与两级审批 -->
      <div class="lg:col-span-2 space-y-6">
        <div v-if="!reviewStore.selectedTicket" class="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          请在左侧待办清单中选择工单查看详细信息与审批流
        </div>

        <div v-else class="space-y-4">
          <!-- 工单基础信息面板 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-900 font-mono">
                  工单编号：{{ reviewStore.selectedTicket.id }}
                </span>
                <el-tag size="small" :type="getSourceTagType(reviewStore.selectedTicket.source)" effect="dark" class="font-bold">
                  来源：{{ reviewStore.selectedTicket.source }}
                </el-tag>
              </div>
              <span class="text-slate-400 font-mono">{{ reviewStore.selectedTicket.submittedAt }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">业务类型：</span>
                <span class="font-bold text-slate-800">{{ reviewStore.selectedTicket.appType }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">关联配给卡号：</span>
                <span class="font-mono font-bold text-slate-800">{{ reviewStore.selectedTicket.cardNo }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">申报当事人 / 目标对象：</span>
                <span class="font-bold text-slate-800">{{ reviewStore.selectedTicket.targetMemberName }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">当前审批状态：</span>
                <span class="font-bold text-amber-600">{{ reviewStore.selectedTicket.status }}</span>
              </div>
            </div>

            <!-- 触发电子审核原因 -->
            <div class="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs">
              <span class="font-bold">触发人工核验原因：</span>
              {{ reviewStore.selectedTicket.reason }}
            </div>

            <!-- 附件材料一览 -->
            <div v-if="reviewStore.selectedTicket.attachments?.length" class="space-y-1.5 pt-1">
              <div class="text-[11px] font-bold text-slate-700">提交的电子公文附件清单：</div>
              <div
                v-for="att in reviewStore.selectedTicket.attachments"
                :key="att.name"
                class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-600"><Document /></el-icon>
                  <span class="font-mono text-slate-800">{{ att.name }}</span>
                </div>
                <el-tag size="small" type="success">印鉴有效 ✓</el-tag>
              </div>
            </div>
          </div>

          <!-- 第一级：分部员工审核 (资格与数据查验) -->
          <div class="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3 text-xs">
            <div class="flex items-center justify-between font-bold text-blue-700">
              <span class="flex items-center gap-1.5">
                <el-icon><Check /></el-icon>
                <span>第一级：分部资格审核专员初审</span>
              </span>
              <span v-if="reviewStore.selectedTicket.staffReviewedAt" class="text-emerald-600 font-normal">
                已出具初审意见 ({{ reviewStore.selectedTicket.staffReviewedAt }})
              </span>
            </div>

            <div v-if="reviewStore.selectedTicket.staffOpinion" class="p-3 bg-blue-50/40 rounded-xl border border-blue-100 space-y-1">
              <div class="text-[11px] text-slate-400">审查专员：{{ reviewStore.selectedTicket.staffName }}</div>
              <div class="text-slate-800">{{ reviewStore.selectedTicket.staffOpinion }}</div>
            </div>

            <div v-else class="space-y-2">
              <el-input
                v-model="staffOpinionInput"
                type="textarea"
                :rows="2"
                placeholder="请输入初审意见，例如：经调阅内政部户籍底册核验属实，证明材料真实有效，提请经理签批。"
              />
              <el-button
                type="primary"
                size="small"
                :loading="staffSubmitting"
                @click="handleStaffSubmit"
              >
                提交初审意见并呈报经理终审
              </el-button>
            </div>
          </div>

          <!-- 第二级：分部经理终审裁决 -->
          <div class="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3 text-xs">
            <div class="flex items-center justify-between font-bold text-amber-700">
              <span class="flex items-center gap-1.5">
                <el-icon><Stamp /></el-icon>
                <span>第二级：分部经理终审签批裁决</span>
              </span>
              <span v-if="reviewStore.selectedTicket.managerDecidedAt" class="font-normal" :class="reviewStore.selectedTicket.managerDecision === '接受' ? 'text-emerald-600' : 'text-rose-600'">
                终审裁决结果：【{{ reviewStore.selectedTicket.managerDecision }}】 ({{ reviewStore.selectedTicket.managerDecidedAt }})
              </span>
            </div>

            <div v-if="reviewStore.selectedTicket.managerNotes && reviewStore.selectedTicket.managerDecision !== '待决'" class="p-3 bg-amber-50/40 rounded-xl border border-amber-100 space-y-1">
              <div class="text-[11px] text-slate-400">签批领导：{{ reviewStore.selectedTicket.managerName }}</div>
              <div class="text-slate-800">{{ reviewStore.selectedTicket.managerNotes }}</div>
            </div>

            <div v-else-if="reviewStore.selectedTicket.status === '待经理终审'" class="space-y-2">
              <el-input
                v-model="managerNotesInput"
                type="textarea"
                :rows="2"
                placeholder="请输入终审批注或裁决意见..."
              />
              <div class="flex items-center gap-2">
                <el-button
                  type="success"
                  size="small"
                  :loading="managerSubmitting"
                  @click="handleManagerDecision('接受')"
                >
                  终审批准通过 (正式签发并生效业务)
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  plain
                  :loading="managerSubmitting"
                  @click="handleManagerDecision('拒绝')"
                >
                  终审驳回申请
                </el-button>
              </div>
            </div>

            <div v-else class="text-slate-400 text-[11px]">
              需第一级初审专员出具意见后方可启动经理终审。
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useReviewStore } from '../../stores/review.js';
import { Stamp, Refresh, Document, Check } from '@element-plus/icons-vue';

const reviewStore = useReviewStore();

const sourceList = ['全部', '申请分户', '申请解冻', '变更户主', '成员录入', '成员转移'];
const staffOpinionInput = ref('经调阅内政部户籍底册比对属实，官方证明材料核验通过，建议准予办理。');
const managerNotesInput = ref('符合贸易部例外审批规程，同意专员审查意见，准予签发。');

const staffSubmitting = ref(false);
const managerSubmitting = ref(false);

onMounted(() => {
  reviewStore.fetchTickets('全部');
});

function handleRefresh() {
  reviewStore.fetchTickets(reviewStore.filterSource);
}

function changeSourceFilter(source) {
  reviewStore.fetchTickets(source);
}

function getSourceCount(source) {
  if (source === '全部') {
    return reviewStore.tickets.length;
  }
  return reviewStore.tickets.filter((t) => t.source === source).length;
}

function getSourceTagType(source) {
  switch (source) {
    case '申请分户':
      return 'purple';
    case '申请解冻':
      return 'warning';
    case '变更户主':
      return 'primary';
    case '成员录入':
      return 'success';
    case '成员转移':
      return 'info';
    default:
      return 'info';
  }
}

async function handleStaffSubmit() {
  if (!reviewStore.selectedTicket) return;
  staffSubmitting.value = true;
  try {
    await reviewStore.reviewStaff(reviewStore.selectedTicket.id, staffOpinionInput.value);
  } finally {
    staffSubmitting.value = false;
  }
}

async function handleManagerDecision(decision) {
  if (!reviewStore.selectedTicket) return;
  managerSubmitting.value = true;
  try {
    await reviewStore.reviewManager(
      reviewStore.selectedTicket.id,
      decision,
      managerNotesInput.value
    );
  } finally {
    managerSubmitting.value = false;
  }
}
</script>
