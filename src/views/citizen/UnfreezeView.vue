<template>
  <div class="unfreeze-view space-y-4 sm:space-y-6">
    <SupplementMaterialsPanel />
    <div class="bg-white rounded-lg p-4 sm:p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 顶部标题与返回导航 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-[#E9F1EB] pb-4">
        <ModuleDescTip
          :title="$t('unfreeze.title')"
          :content="$t('unfreeze.subtitle')"
          :badge="$t('unfreeze.resolutionBadge')"
          badge-type="warning"
          title-class="text-base font-bold text-[#1B3123]"
        >
          <template #icon>
            <el-icon class="text-[#D3AF62] text-lg"><Unlock /></el-icon>
          </template>
        </ModuleDescTip>
        <el-button size="small" plain class="shrink-0" @click="handleGoBack">
          <el-icon class="rtl-mirror-icon me-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div :class="isAppMode ? 'flex flex-col space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'">
        <!-- 第一部分：情形选择与申诉陈述 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-[#43554B] mb-1">
              {{ $t('unfreeze.type') }}
            </label>
            <el-select v-model="unfreezeType" class="w-full" size="large" @change="handleTypeChange">
              <el-option :label="$t('unfreeze.caseCommercial')" value="商业" />
              <el-option :label="$t('unfreeze.caseTravel')" value="旅行" />
              <el-option :label="$t('unfreeze.caseHighIncome')" value="高收入" />
              <el-option :label="$t('unfreeze.caseUnknownAddress')" value="住址不明" />
              <el-option :label="$t('unfreeze.caseUpdate')" value="更新" />
              <el-option :label="$t('unfreeze.caseDuplicate')" value="重复" />
              <el-option :label="$t('unfreeze.caseTemporary')" value="临时" />
              <el-option :label="$t('unfreeze.caseGeoLocation')" value="地理位置" />
            </el-select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#43554B] mb-1">
              {{ $t('unfreeze.statement') }}
            </label>
            <el-input
              v-model="unfreezeStatement"
              type="textarea"
              :rows="3"
              :placeholder="$t('unfreeze.statementPlaceholder')"
            />
          </div>

          <!-- 证明材料附件上传组件 (通栏展开，美观宽敞) -->
          <div>
            <DocumentUploader
              v-model="unfreezeFileUploaded"
              :title="currentDocConfig.title"
              :subtitle="currentDocConfig.subtitle"
              :category-badge="currentDocConfig.badge"
              :issuer="currentDocConfig.issuer"
              :default-file-name="currentDocConfig.fileName"
              :default-ref-no="currentDocConfig.refNo"
              :ocr-summary="currentDocConfig.ocrSummary"
              :is-required="true"
            />
          </div>
        </div>

        <!-- 第二部分：审核须知与提交支付按钮 -->
        <div class="space-y-4 flex flex-col justify-between">
          <div class="p-4 bg-[#EFF5F1]/60 rounded-lg border border-[#C7DED0]/80 text-xs text-[#1F3326] space-y-1.5">
            <div class="font-bold flex items-center gap-1.5">
              <span>📋</span>
              <span>{{ $t('unfreeze.reviewNoticeTitle') }}</span>
            </div>
            <p class="text-[#24483A]/90 text-[11px] leading-relaxed">
              {{ $t('unfreeze.reviewNoticeText') }}
            </p>
          </div>

          <div class="pt-2">
            <el-button
              type="warning"
              size="large"
              class="w-full font-bold shadow-md rounded-lg text-sm !h-auto min-h-11 !whitespace-normal !py-3 [&>span]:whitespace-normal [&>span]:leading-snug"
              :loading="submitting"
              @click="handleStartUnfreeze"
            >
              <el-icon class="me-1.5"><Unlock /></el-icon>
              <span>{{ $t('unfreeze.submitBtn') }}</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 电子支付二维码收银台 -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      :title="$t('unfreeze.paymentTitle', { type: currentCaseLabel })"
      :amount="5000"
      currency="IQD"
      :business-no="citizenStore.currentFamily?.rationCardNo"
      :applicant-name="citizenStore.currentFamily?.headName"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import { addSharedTicket } from '../../utils/sharedSession.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import SupplementMaterialsPanel from '../../components/citizen/SupplementMaterialsPanel.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import { Unlock, Back } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const citizenStore = useCitizenStore();

const isAppMode = computed(() => {
  return route.query.layout === 'app' || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app');
});

function handleGoBack() {
  if (isAppMode.value) {
    router.push({ path: '/citizen', query: { layout: 'app' } });
  } else {
    router.push('/citizen');
  }
}

const STATEMENTS_BY_TYPE = {
  商业: {
    en: 'The commercial business registration was formally deregistered and tax clearance was finalized in 2026. Requesting immediate restoration of strategic ration entitlement.',
    zh: '该商户名额已于2026年正式注销并完成清税，申请恢复食品配给。',
    ar: 'تم شطب السجل التجاري رسمياً وإتمام براءة الذمة الضريبية لعام 2026، ونلتمس إعادة تفعيل الحصة التموينية الغذائية.',
    ku: 'تۆماری بازرگانی بە فەرمی سڕاوەتەوە و باج پاکتاو کراوە لە 2026، داوای گەڕاندنەوەی بەشەخۆراکی دەوڵەتی دەکەین.'
  },
  旅行: {
    en: 'Returned permanently to Iraq through Baghdad International Airport. Completed border control registration and residency affidavit to restore ration allocation.',
    zh: '已正式回国定居并通过海关入境边检，提交永久居留公证，申请恢复口粮配给。',
    ar: 'العودة الدائمة إلى العراق عبر مطار بغداد الدولي وإتمام إجراءات الإقامة لطلب إعادة تفعيل البطاقة التموينية.',
    ku: 'گەڕانەوەی هەمیشەیی بۆ عێراق لە ڕێگەی فڕۆکەخانەی نێودەوڵەتی بەغدا و تەواوکردنی ڕێکارەکان.'
  },
  高收入: {
    en: 'Current verified household income is below the statutory national subsidy cutoff threshold as certified by official payroll audit. Requesting reinstatement.',
    zh: '最新经核定的家庭人均月收入已低于国家配给补助门槛线，特申请恢复享受口粮配给待遇。',
    ar: 'الدخل الشهري الحالي للأسرة يقع دون سقف استحقاق الدعم الحكومي بموجب بيان الراتب الرسمي المرفق.',
    ku: 'داهاتی مانگانەی خێزان لەژێر ڕێژەی دیاریکراوی پشتیوانی دەوڵەتدایە بەپێی بەڵگەنامەی فەرمی.'
  },
  住址不明: {
    en: 'Physical residential address has been verified on-site by community administration and municipal grid committee. Requesting unfreeze.',
    zh: '已完成属地社区网格员现场入户核验并出具连续居住证明，申请解除因地址异常导致的冻结。',
    ar: 'تم التحقق الميداني من عنوان السكن الفعلي عبر المختار واللجنة الإدارية المحلية ونلتمس رفع الحظر.',
    ku: 'پشتڕاستکردنەوەی ناونیشانی نیشتەجێبوون لەلایەن لیژنەی گەڕەکەوە ئەنجامدراوە.'
  },
  更新: {
    en: 'Civil demographic record corrections completed and synchronised with the National Unified Civil Registry database. Requesting unfreezing.',
    zh: '内政部户政底账信息勘误已完成核准并同步至国家统一数据库，申请解冻配给资格。',
    ar: 'تم تصحيح وتحديث البيانات الشخصية في السجل المدني الموحد ونطلب رفع التجميد عن البطاقة.',
    ku: 'ڕاستکردنەوەی زانیارییە کەسییەکان لە تۆماری باری شارستانی فەرمی پەسەندکراوە.'
  },
  重复: {
    en: 'Judicial decree confirmed sole active identity and eliminated redundant duplicate civil registration record. Requesting quota unfreeze.',
    zh: '司法裁定书已核实并注销重复建卡户籍档案，确认保留唯一合法身份，申请解冻配给。',
    ar: 'صدر قرار قضائي بإلغاء القيد المكرر وتثبيت القيد القانوني المعتمد الوحيد، ونلتمس رفع التجميد.',
    ku: 'بڕیاری دادگا بۆ سڕینەوەی تۆماری دووبارە دەرکراوە بۆ کاراکردنەوەی بەشەخۆراک.'
  },
  临时: {
    en: 'The grounds for administrative temporary suspension have been thoroughly remedied and cleared by local supply authority. Requesting immediate reactivation.',
    zh: '行政临时冻结原因已彻底整改并经属地配给主管部门现场复核，申请解除临时冻结。',
    ar: 'تمت معالجة وزوال أسباب التعليق الإداري المؤقت، ونرجو استئناف صرف المواد التموينية.',
    ku: 'هۆکارەکانی ڕاگرتنی کاتی چارەسەرکراون و داوای دەستپێکردنەوەی بەشەخۆراک دەکەین.'
  },
  地理位置: {
    en: 'GPS coordinates and territorial supply outlet alignment verified within accredited distribution zone. Requesting transfer and unfreeze.',
    zh: '家庭常住地经纬度及属地供销网点网格匹配已通过核定，申请解除定位锁定并恢复配给发放。',
    ar: 'تم التحقق من الإحداثيات الجغرافية لمحل السكن ومطابقتها للمركز التمويني المعتمد لرفع التجميد.',
    ku: 'پێگەی جوگرافی شوێنی نیشتەجێبوون پەسەندکراوە لەگەڵ بریکاری پەسەندکراودا.'
  }
};

const allDefaultTexts = Object.values(STATEMENTS_BY_TYPE).flatMap(typeObj => Object.values(typeObj));

const unfreezeType = ref('商业');
const unfreezeFileUploaded = ref(true);
const unfreezeStatement = ref(STATEMENTS_BY_TYPE['商业'][locale.value === 'ckb' ? 'ku' : locale.value] || STATEMENTS_BY_TYPE['商业'].en);
const submitting = ref(false);
const paymentDialogVisible = ref(false);



watch(locale, (newLang) => {
  if (allDefaultTexts.includes(unfreezeStatement.value)) {
    const caseObj = STATEMENTS_BY_TYPE[unfreezeType.value] || STATEMENTS_BY_TYPE['商业'];
    unfreezeStatement.value = caseObj[newLang === 'ckb' ? 'ku' : newLang] || caseObj.en;
  }
});

const unfreezeDocumentTypes = {
  商业: ['commercial', 'COM-TAX-2026-9901'], 旅行: ['travel', 'CUST-TRV-2026-4418'],
  高收入: ['income', 'FIN-SAL-2026-7821'], 住址不明: ['address', 'LOC-GRD-2026-1193'],
  更新: ['update', 'MOI-UPD-2026-1102'], 重复: ['duplicate', 'JUD-DUP-2026-3391'],
  临时: ['temporary', 'TRD-TMP-2026-8820'], 地理位置: ['location', 'GEO-LOC-2026-5509']
};
const currentCaseKey = computed(() => (unfreezeDocumentTypes[unfreezeType.value] || unfreezeDocumentTypes.商业)[0]);
const currentCaseLabel = computed(() => t('unfreeze.caseNames.' + currentCaseKey.value));
const currentDocConfig = computed(() => {
  const fields = ['title', 'subtitle', 'badge', 'issuer', 'fileName', 'ocrSummary'];
  return {
    ...Object.fromEntries(fields.map((field) => [field, t('unfreeze.documents.' + currentCaseKey.value + '.' + field)])),
    refNo: (unfreezeDocumentTypes[unfreezeType.value] || unfreezeDocumentTypes.商业)[1]
  };
});

function handleTypeChange() {
  unfreezeFileUploaded.value = true;
  if (!unfreezeStatement.value.trim() || allDefaultTexts.includes(unfreezeStatement.value)) {
    const caseObj = STATEMENTS_BY_TYPE[unfreezeType.value] || STATEMENTS_BY_TYPE['商业'];
    unfreezeStatement.value = caseObj[locale.value === 'ckb' ? 'ku' : locale.value] || caseObj.en;
  }
}

function handleStartUnfreeze() {
  if (!unfreezeFileUploaded.value) {
    ElMessage.error(t('unfreeze.errorUploadProof'));
    return;
  }
  if (!unfreezeStatement.value.trim()) {
    ElMessage.error(t('unfreeze.errorInputStatement'));
    return;
  }
  paymentDialogVisible.value = true;
}

async function handlePaymentSuccess(paymentInfo) {
  submitting.value = true;
  try {
    const res = await citizenStore.applyUnfreeze({
      cardNo: citizenStore.currentFamily?.rationCardNo,
      unfreezeType: unfreezeType.value,
      statement: unfreezeStatement.value,
      docName: currentDocConfig.value?.fileName,
      paymentInfo
    });

    // 跨标签页共享与广播新解冻公文
    addSharedTicket({
      id: res.ticketId,
      sourceCode: 'UNF',
      reviewMode: 'manual',
      source: t('my.applicationTypes.UNF'),
      categoryType: currentCaseLabel.value,
      appType: t('unfreeze.title'),
      cardNo: citizenStore.currentFamily?.rationCardNo || 'RC-10029381',
      applicantName: citizenStore.currentFamily?.headName || '艾哈迈德·哈桑·萨利赫 (户主)',
      reason: unfreezeStatement.value || '公民提交配给卡解冻材料及合规陈述，申请撤销冻结状态。',
      attachments: [
        { name: currentDocConfig.value?.fileName || '解冻法定证明材料.pdf', type: 'required', verified: true }
      ]
    });

    ElMessage.success(t('unfreeze.submitSuccess'));
    handleGoBack();
  } finally {
    submitting.value = false;
  }
}

const handleLangChanged = async () => {
  await citizenStore.fetchFamilies();
};

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
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
</script>

<style scoped>
</style>
