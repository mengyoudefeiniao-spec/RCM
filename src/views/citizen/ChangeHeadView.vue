<template>
  <div class="change-head-view space-y-4 sm:space-y-6">
    <SupplementMaterialsPanel />
    <div class="bg-white rounded-lg p-4 sm:p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 标题与业务说明 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-[#E9F1EB] pb-4">
        <ModuleDescTip
          :title="$t('changeHead.title')"
          :content="$t('changeHead.subtitle')"
          :badge="$t('changeHead.legalBadge')"
          badge-type="primary"
          title-class="text-base font-bold text-[#1B3123]"
        >
          <template #icon>
            <el-icon class="text-[#326445] text-lg"><UserFilled /></el-icon>
          </template>
        </ModuleDescTip>
        <el-button size="small" plain class="shrink-0" @click="handleGoBack">
          <el-icon class="rtl-mirror-icon me-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div class="grid gap-6" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'">
        <!-- 左侧：原户主与死亡公函附件上传 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-[#43554B] mb-1">{{ $t('changeHead.currentHeadLabel') }}</label>
            <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] text-xs">
              <div class="font-bold text-[#1B3123]">{{ currentHead?.name }}</div>
              <div class="text-[#8A9A8F] font-mono mt-0.5">
                {{ $t('citizen.rationCardNo') }}：{{ citizenStore.currentFamily?.rationCardNo }} · {{ $t('common.nationalId') }}：{{ currentHead?.nationalId }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#43554B] mb-1">{{ $t('changeHead.deathDocNoLabel') }}</label>
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
            <label class="block text-xs font-semibold text-[#43554B] mb-1">
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
                :label="`${m.name} (${formatRelation(m.relation)} · ${m.nationalId})`"
                :value="m.id"
              />
            </el-select>
            <p class="text-[11px] text-[#8A9A8F] mt-1">
              {{ $t('changeHead.candidateNotice') }}
            </p>
          </div>

          <div class="p-4 bg-[#FDF3E0]/50 rounded-lg border border-[#F2E3C6] text-xs text-[#6B5321] space-y-1">
            <div class="font-bold">{{ $t('changeHead.reviewNoticeTitle') }}</div>
            <p>
              {{ $t('changeHead.reviewNoticeText') }}
            </p>
          </div>

          <div class="pt-4">
            <el-button
              type="primary"
              size="large"
              class="w-full font-bold shadow-md !h-auto min-h-10 !whitespace-normal py-2"
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
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import { addSharedTicket } from '../../utils/sharedSession.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import SupplementMaterialsPanel from '../../components/citizen/SupplementMaterialsPanel.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import { UserFilled, Back } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const citizenStore = useCitizenStore();

// APP 仿真视口判定：APP 模式下强制移动端布局（与 AppLayout 判定保持一致）
const isAppMode = computed(() => {
  return route.query.layout === 'app' || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app');
});

function handleGoBack() {
  if (route.query.layout === 'app') {
    router.push({ path: '/citizen', query: { layout: 'app' } });
  } else {
    router.push('/citizen');
  }
}

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

const relationKeys = {
  '户主': 'relationHead', head: 'relationHead', 'رب الأسرة': 'relationHead', 'سەرۆکی خێزان': 'relationHead',
  '配偶': 'relationSpouse', spouse: 'relationSpouse', wife: 'relationSpouse', husband: 'relationSpouse', 'الزوجة': 'relationSpouse', 'زوج / زوجة': 'relationSpouse', 'هاوسەر': 'relationSpouse',
  '子女': 'relationChild', child: 'relationChild', son: 'relationChild', daughter: 'relationChild', 'ابن': 'relationChild', 'ابنة': 'relationChild', 'ابن/ابنة': 'relationChild', 'ابن / ابنة': 'relationChild', 'منداڵ': 'relationChild',
  '父亲': 'relationFather', father: 'relationFather', 'أب': 'relationFather', 'الأب': 'relationFather', 'باوک': 'relationFather',
  '母亲': 'relationMother', mother: 'relationMother', 'أم': 'relationMother', 'الأم': 'relationMother', 'دایک': 'relationMother',
  '受抚养人': 'relationDependent', dependent: 'relationDependent', 'معال': 'relationDependent', 'مُعال': 'relationDependent', 'بژێویپێدراو': 'relationDependent', 'بەپێندەوەر': 'relationDependent'
};
const relationKey = (relation) => relationKeys[String(relation || '').trim().toLowerCase()];
function formatRelation(relation) {
  const key = relationKey(relation);
  return key ? t(`citizenCard.${key}`) : relation;
}

const currentHead = computed(() => {
  return citizenStore.currentFamily?.members?.find((m) => relationKey(m.relation) === 'relationHead');
});

const eligibleCandidates = computed(() => {
  return (citizenStore.currentFamily?.members || []).filter(
    (m) => relationKey(m.relation) !== 'relationHead' && ['正常', 'active', 'نشط', 'ساري المفعول', 'چالاک', 'چالاکە'].includes(String(m.status || '').trim().toLowerCase())
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

    // 跨标签页数据同步与广播：政府端工作台将实时收到该申办公文
    addSharedTicket({
      id: res.ticketId,
      sourceCode: 'HED',
      reviewMode: 'manual',
      source: t('citizen.applyChangeHead'),
      appType: t('changeHead.applicationType'),
      cardNo: citizenStore.currentFamily?.rationCardNo,
      applicantName: currentCandidateName.value,
      targetMemberName: currentCandidateName.value,
      reason: t('changeHead.applicationReason', { reference: deathProofNo.value }),
      payload: {
        newHeadId: replacementHeadId.value,
        deathProofNo: deathProofNo.value,
        paymentInfo
      }
    });

    handleGoBack();
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
</style>
