<template>
  <div class="change-head-view space-y-4 sm:space-y-6">
    <div class="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 标题与业务说明 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <ModuleDescTip
          :title="$t('changeHead.title')"
          :content="$t('changeHead.subtitle')"
          badge="法定继承与变更"
          badge-type="primary"
          title-class="text-base font-bold text-slate-900"
        >
          <template #icon>
            <el-icon class="text-blue-600 text-lg"><UserFilled /></el-icon>
          </template>
        </ModuleDescTip>
        <el-button size="small" plain class="shrink-0" @click="$router.push('/citizen')">
          <el-icon class="mr-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 左侧：原户主与死亡公函附件上传 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">{{ $t('changeHead.currentHeadLabel') }}</label>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div class="font-bold text-slate-900">{{ currentHead?.name }}</div>
              <div class="text-slate-400 font-mono mt-0.5">
                {{ $t('citizen.rationCardNo') }}：{{ citizenStore.currentFamily?.rationCardNo }} · {{ $t('common.nationalId') }}：{{ currentHead?.nationalId }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">{{ $t('changeHead.deathDocNoLabel') }}</label>
            <el-input
              v-model="deathProofNo"
              :placeholder="$t('changeHead.deathDocNoPlaceholder')"
              size="default"
              class="font-mono mb-3"
            />

            <!-- 独立附件上传组件 -->
            <DocumentUploader
              v-model="deathProofUploaded"
              :title="$t('changeHead.deathProofTitle')"
              :subtitle="$t('changeHead.deathProofSubtitle')"
              :category-badge="$t('changeHead.deathProofBadge')"
              :issuer="$t('changeHead.deathProofIssuer')"
              :default-file-name="$t('changeHead.deathProofDefaultFile')"
              :default-ref-no="deathProofNo"
              :ocr-summary="$t('changeHead.deathProofOcrSummary')"
              :is-required="true"
            />
          </div>
        </div>

        <!-- 右侧：指定替代继任新户主 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              {{ $t('changeHead.candidate') }}
            </label>
            <el-select
              v-model="replacementHeadId"
              :placeholder="$t('changeHead.candidateSelectPlaceholder')"
              class="w-full"
              size="large"
            >
              <el-option
                v-for="m in eligibleCandidates"
                :key="m.id"
                :label="`${m.name} (${m.relation} · ${m.nationalId})`"
                :value="m.id"
              />
            </el-select>
            <p class="text-[11px] text-slate-400 mt-1">
              {{ $t('changeHead.candidateNotice') }}
            </p>
          </div>

          <div class="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <div class="font-bold">{{ $t('changeHead.reviewNoticeTitle') }}</div>
            <p>
              {{ $t('changeHead.reviewNoticeText') }}
            </p>
          </div>

          <div class="pt-4">
            <el-button
              type="primary"
              size="large"
              class="w-full font-bold shadow-md"
              :loading="submitting"
              @click="handleStartChangeHead"
            >
              {{ $t('changeHead.submitBtn') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 电子支付二维码收银台 -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      :title="$t('changeHead.paymentTitle')"
      :amount="5000"
      currency="IQD"
      :business-no="citizenStore.currentFamily?.rationCardNo"
      :applicant-name="currentCandidateName"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import { UserFilled, Back } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const router = useRouter();
const citizenStore = useCitizenStore();

const deathProofNo = ref('DTH-BAG-2026-90182');
const deathProofUploaded = ref(true);
const replacementHeadId = ref('');
const submitting = ref(false);
const paymentDialogVisible = ref(false);

const handleLangChanged = async () => {
  await citizenStore.fetchFamilies();
};

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
  const firstCandidate = eligibleCandidates.value[0];
  if (firstCandidate) {
    replacementHeadId.value = firstCandidate.id;
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('rcm-language-changed', handleLangChanged);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('rcm-language-changed', handleLangChanged);
  }
});

const currentHead = computed(() => {
  return citizenStore.currentFamily?.members?.find((m) => m.relation === '户主' || m.relation === 'Head');
});

const eligibleCandidates = computed(() => {
  return (citizenStore.currentFamily?.members || []).filter(
    (m) => m.relation !== '户主' && m.relation !== 'Head' && (m.status === '正常' || m.status === 'Active')
  );
});

const currentCandidateName = computed(() => {
  return eligibleCandidates.value.find((m) => m.id === replacementHeadId.value)?.name || t('changeHead.candidateDefault');
});

function handleStartChangeHead() {
  if (!deathProofUploaded.value) {
    ElMessage.error(t('changeHead.errorUploadProof'));
    return;
  }

  if (!replacementHeadId.value) {
    ElMessage.error(t('changeHead.errorSelectCandidate'));
    return;
  }

  paymentDialogVisible.value = true;
}

async function handlePaymentSuccess(paymentInfo) {
  submitting.value = true;
  try {
    const res = await citizenStore.changeHead({
      cardNo: citizenStore.currentFamily.rationCardNo,
      newHeadId: replacementHeadId.value,
      deathProofNo: deathProofNo.value,
      paymentInfo
    });
    ElMessage.success(t('changeHead.submitSuccess'));
    router.push('/review');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
</style>
