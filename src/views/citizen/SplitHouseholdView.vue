<template>
  <div class="split-household-view space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <!-- 标题与业务说明 -->
      <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <el-icon class="text-purple-600"><Share /></el-icon>
            <span>申请家庭分立分户 (优先智能判别)</span>
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            将现有配给卡内已婚成员（夫妻年满 14 周岁且具法定结婚证明）分立并设立全新数字配给卡。
          </p>
        </div>
        <el-button size="small" plain @click="$router.push('/citizen')">
          <el-icon class="mr-1"><Back /></el-icon>
          返回公民服务
        </el-button>
      </div>

      <!-- 智能办理流转须知 -->
      <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <el-icon class="text-purple-600"><Compass /></el-icon>
          <span>办理说明：无需手动选择路径。提交后系统将<strong>优先智能自动判别</strong>，若未满足全自动标准，可一键<strong>转入分部电子审核</strong>。</span>
        </div>
        <el-tag size="small" type="purple" effect="light" class="font-bold">智能分流</el-tag>
      </div>

      <!-- 1. 勾选移入新卡的人员 -->
      <div class="space-y-3">
        <label class="block text-xs font-semibold text-slate-700">
          第一步：勾选移入新户的家庭成员 (从当前配给卡内选择)
        </label>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="m in currentMembers"
            :key="m.id"
            class="p-3.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition-all"
            :class="
              selectedMemberIds.includes(m.id)
                ? 'border-purple-500 bg-purple-50/50 text-purple-900 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
            "
            @click="toggleMember(m.id)"
          >
            <div>
              <div class="font-bold">{{ m.name }}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                {{ m.gender }} · {{ m.relation }} · {{ m.nationalId }}
              </div>
            </div>
            <el-checkbox
              :model-value="selectedMemberIds.includes(m.id)"
              @click.stop
              @change="toggleMember(m.id)"
            />
          </div>
        </div>
      </div>

      <!-- 2. 两份材料各自独立上传 (必需与可选分离) -->
      <div class="space-y-4 pt-4 border-t border-slate-100">
        <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <el-icon class="text-purple-600"><Document /></el-icon>
          <span>第二步：分户证明材料上传 (支持两份各自独立上传与管理)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 材料一：结婚证明或同等效力公文 (必需 ★) -->
          <div class="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-2">
            <DocumentUploader
              v-model="marriageCertUploaded"
              title="1. 结婚证明或同等效力公文"
              subtitle="民政婚姻登记证书或最高司法委员会法院判决文书（系统自动判别夫妻合法关系的核心依据）"
              category-badge="民政结婚证书 / 司法判决书"
              issuer="伊拉克最高司法委员会 · 卡尔赫民事法庭"
              default-file-name="最高司法委员会_民事结婚证书与分立公函_MC-2026-BAG-09921.pdf"
              default-ref-no="MC-2026-BAG-09921"
              ocr-summary="已识别民政婚姻公证印鉴，配偶身份核验属实，符合婚姻分户立卡规定"
              :is-required="true"
            />
          </div>

          <!-- 材料二：其他辅助证明文件 (可选) -->
          <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
            <DocumentUploader
              v-model="otherDocUploaded"
              title="2. 其他辅助证明文件"
              subtitle="如独立常住住宅产权证/房屋租赁合同、独立水电气户头单据或社区常住网格证明（可选提交）"
              category-badge="住所产权 / 租赁合同 / 补充公文"
              issuer="地方市政规划委员会 & 房屋所有权登记局"
              default-file-name="市政规划委员会_独立常住住宅不动产权公证书与租约_ADD-2026-7810.pdf"
              default-ref-no="ADD-DOC-2026-7810"
              ocr-summary="已识别房屋租赁合同及独立网格电费编号，具备独立常住生活居住条件"
              :is-required="false"
            />
          </div>
        </div>
      </div>

      <!-- 3. 判别失败展示与操作提交区 -->
      <div class="pt-4 space-y-3">
        <!-- 判别失败警示条目与【转入分部电子审核】按钮 -->
        <div
          v-if="judgeResult && !judgeResult.passed"
          class="p-4 rounded-xl border border-amber-300 bg-amber-50/80 space-y-3"
        >
          <div class="flex items-center gap-2 text-xs font-bold text-amber-800">
            <el-icon class="text-amber-600"><WarningFilled /></el-icon>
            <span>系统自动判别未通过</span>
          </div>
          <p class="text-xs text-amber-900 leading-relaxed">
            {{ judgeResult.reason }}
          </p>
          <div class="flex items-center gap-3 pt-1">
            <el-button
              type="warning"
              size="default"
              class="font-bold shadow-xs"
              :loading="reviewSubmitting"
              @click="handleTransferToElectronicReview"
            >
              <el-icon class="mr-1"><Stamp /></el-icon>
              转入分部电子审核 (提交分部门人员手动复核)
            </el-button>
            <el-button size="default" text @click="judgeResult = null">
              重新调整成员
            </el-button>
          </div>
        </div>

        <!-- 初始/通过状态主按钮：优先系统智能判别 -->
        <div v-if="!judgeResult || judgeResult.passed">
          <el-button
            type="primary"
            size="large"
            class="w-full font-bold shadow-md bg-purple-600 border-purple-600 hover:bg-purple-500"
            :disabled="selectedMemberIds.length === 0"
            :loading="judging"
            @click="handleStartSplitPayment"
          >
            <el-icon class="mr-1.5"><Compass /></el-icon>
            验证资料并前往电子支付 (规费 10,000 IQD)
          </el-button>
        </div>
      </div>
    </div>

    <!-- 电子支付二维码收银台 -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      title="数字配给卡家庭分立分户与独立建卡规费"
      :amount="10000"
      currency="IQD"
      :business-no="citizenStore.currentFamily?.rationCardNo"
      :applicant-name="citizenStore.currentFamily?.headName"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCitizenStore } from '../../stores/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import { Share, Compass, Document, WarningFilled, Stamp, Back } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const citizenStore = useCitizenStore();

const selectedMemberIds = ref([]);
const marriageCertUploaded = ref(true);
const otherDocUploaded = ref(false);

const judgeResult = ref(null);
const judging = ref(false);
const reviewSubmitting = ref(false);
const paymentDialogVisible = ref(false);

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
});

const currentMembers = computed(() => {
  return citizenStore.currentFamily?.members || [];
});

function toggleMember(memberId) {
  judgeResult.value = null;
  if (selectedMemberIds.value.includes(memberId)) {
    selectedMemberIds.value = selectedMemberIds.value.filter((id) => id !== memberId);
  } else {
    selectedMemberIds.value.push(memberId);
  }
}

/**
 * 1. 验证资料信息通过后，唤起电子支付二维码收银台
 */
function handleStartSplitPayment() {
  if (selectedMemberIds.value.length === 0) {
    ElMessage.error('请勾选移入新户的家庭成员！');
    return;
  }

  if (!marriageCertUploaded.value) {
    ElMessage.error('结婚证明或同等效力公文为必需材料，请上传后重试！');
    return;
  }

  paymentDialogVisible.value = true;
}

/**
 * 2. 扫码付款通过后，正式执行优先系统智能判别
 */
async function handlePaymentSuccess(paymentInfo) {
  judging.value = true;
  try {
    const res = await citizenStore.judgeSplitHousehold({
      memberIds: selectedMemberIds.value,
      currentCardNo: citizenStore.currentFamily.rationCardNo,
      paymentInfo
    });

    if (res.passed) {
      ElMessage.success(res.message);
      selectedMemberIds.value = [];
      judgeResult.value = null;
    } else {
      judgeResult.value = {
        passed: false,
        reason: res.reason
      };
      ElMessage.warning('系统自动判别未通过，已为您开启分部电子审核入口');
    }
  } finally {
    judging.value = false;
  }
}

/**
 * 判别失败，转入分部电子审核
 */
async function handleTransferToElectronicReview() {
  reviewSubmitting.value = true;
  try {
    await citizenStore.submitSplitReview({
      currentCardNo: citizenStore.currentFamily.rationCardNo,
      memberIds: selectedMemberIds.value,
      reason: judgeResult.value?.reason || '系统自动判别未通过，转交分部门人员手动审核'
    });
    router.push('/review');
  } finally {
    reviewSubmitting.value = false;
  }
}
</script>
