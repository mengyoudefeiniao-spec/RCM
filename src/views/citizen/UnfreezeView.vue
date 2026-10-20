<template>
  <div class="unfreeze-view space-y-4 sm:space-y-6">
    <SupplementMaterialsPanel />
    <div class="bg-white rounded-lg p-4 sm:p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 顶部标题与返回导航 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-[#E9F1EB] pb-4">
        <ModuleDescTip
          :title="$t('unfreeze.title')"
          :content="$t('unfreeze.subtitle')"
          badge="第140号决议申诉"
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
              class="w-full font-bold shadow-md rounded-lg text-sm py-3"
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
      :title="$t('unfreeze.paymentTitle', { type: unfreezeType })"
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

const isEn = computed(() => locale.value === 'en');

watch(locale, (newLang) => {
  if (allDefaultTexts.includes(unfreezeStatement.value)) {
    const caseObj = STATEMENTS_BY_TYPE[unfreezeType.value] || STATEMENTS_BY_TYPE['商业'];
    unfreezeStatement.value = caseObj[newLang] || caseObj.en;
  }
});

const DOC_CONFIGS = computed(() => {
  if (isEn.value) {
    return {
      商业: {
        title: 'Commercial Deregistration & Tax Clearance Certificate',
        subtitle: 'Ministry of Trade Deregistration Deed & Tax Clearance Receipt',
        badge: 'Commercial Deregistration',
        issuer: 'Ministry of Trade Companies Directorate & General Commission for Taxes',
        fileName: 'Commercial_Chamber_Tax_Clearance_Deed_COM-2026-0914.pdf',
        refNo: 'COM-TAX-2026-9901',
        ocrSummary: 'Commercial entity registration annulled; zero-liability tax clearance verified.'
      },
      旅行: {
        title: 'Customs Entry Stamp & Permanent Return Affidavit',
        subtitle: 'Border control passport stamps & permanent domestic resettlement proof',
        badge: 'Customs & Return Deed',
        issuer: 'Ministry of Interior Residency & Border Directorate',
        fileName: 'Border_Control_Passport_Entry_Stamp_TRV-2026-5521.pdf',
        refNo: 'CUST-TRV-2026-4418',
        ocrSummary: 'Baghdad International Airport entry stamp verified; permanent residency affidavit confirmed.'
      },
      高收入: {
        title: 'Income Assessment Deed & Employer Payroll Statement',
        subtitle: 'Ministry of Finance civil payroll assessment deed',
        badge: 'Income Statement',
        issuer: 'Ministry of Finance & Employer',
        fileName: 'Ministry_of_Finance_Salary_Audit_Sheet_INC-2026-3108.pdf',
        refNo: 'FIN-SAL-2026-7821',
        ocrSummary: 'Monthly income evaluated below state subsidy ceiling threshold.'
      },
      住址不明: {
        title: 'Community Grid In-Person Residency Verification Deed',
        subtitle: 'Municipal neighborhood grid chief residency certificate and utility invoices',
        badge: 'Residency Verification',
        issuer: 'Provincial Administrative Council & Local Grid Division',
        fileName: 'Community_Grid_Residency_Verification_LOC-2026-7740.pdf',
        refNo: 'LOC-GRD-2026-1193',
        ocrSummary: 'On-site verification completed; applicant confirmed residing over 6 months continuously.'
      },
      更新: {
        title: 'National Unified Card Correction Approval Letter',
        subtitle: 'Civil Status General Directorate archive correction decree',
        badge: 'Civil Archive Correction',
        issuer: 'Ministry of Interior Civil Status Directorate',
        fileName: 'Civil_Status_Record_Correction_Decree_UPD-2026-6219.pdf',
        refNo: 'MOI-UPD-2026-1102',
        ocrSummary: 'Civil profile corrections verified; identity status synchronised.'
      },
      重复: {
        title: 'Civil Registration Duplicate Cancellation Decree',
        subtitle: 'Court of Personal Status unique identity affidavit and duplicate cancellation',
        badge: 'Duplicate Cancellation',
        issuer: 'Supreme Judicial Council Court of Personal Status',
        fileName: 'Court_Decree_Cancelling_Duplicate_Card_DUP-2026-9041.pdf',
        refNo: 'JUD-DUP-2026-3391',
        ocrSummary: 'Judicial confirmation of unique identity; redundant registration deleted.'
      },
      临时: {
        title: 'Order Lifting Temporary Ration Suspension',
        subtitle: 'Strategic Reserve Directorate temporary restriction termination notice',
        badge: 'Lifting Suspension Order',
        issuer: 'Ministry of Trade Grain Reserve Directorate',
        fileName: 'Notice_Lifting_Temporary_Suspension_TMP-2026-2810.pdf',
        refNo: 'TRD-TMP-2026-8820',
        ocrSummary: 'Temporary restriction cause resolved; full quota restoration instructed.'
      },
      地理位置: {
        title: 'Geographic Residential Relocation & GPS Audit Deed',
        subtitle: 'Spatial coordinates verification and lease notarization',
        badge: 'Spatial Location Audit',
        issuer: 'Urban Planning Commission & Territorial Supply Division',
        fileName: 'GIS_Location_Audit_Deed_GEO-2026-6102.pdf',
        refNo: 'GEO-LOC-2026-5509',
        ocrSummary: 'GPS spatial coordinates confirmed within target distribution center zone.'
      }
    };
  }

  return {
    商业: {
      title: '商业登记注销公文与税务清算核定函',
      subtitle: '贸易部企业注册总局注销证明及税务局清税证明',
      badge: '商业登记与税务清算',
      issuer: '伊拉克贸易部企业注册总局 & 国家税务局',
      fileName: '商业总商会与税务局_商户执照注销与清税核定公函_COM-2026-0914.pdf',
      refNo: 'COM-TAX-2026-9901',
      ocrSummary: '企业法人营业执照名额已注销，纳税零申报及税务清算完毕，符合配给补贴恢复标准'
    },
    旅行: {
      title: '海关出入境与永久回国居留公证书',
      subtitle: '海关边检入境戳记及出入境常住定居证明',
      badge: '海关出入境与永久居留',
      issuer: '伊拉克内政部居留与边境总局',
      fileName: '内政部海关边检_入境戳记护照扫描件及回国定居申明_TRV-2026-5521.pdf',
      refNo: 'CUST-TRV-2026-4418',
      ocrSummary: '巴格达国际机场入境戳记核实属实，居留常驻伊拉克境内声明经公证生效'
    },
    高收入: {
      title: '财政薪资核定单与雇主证明',
      subtitle: '财政部薪资发放底册核算公文',
      badge: '财政薪资核定与雇主证明',
      issuer: '财政部公共薪资核准司 & 雇主单位',
      fileName: '财政部与雇主用人单位_最新月收入核定单与社保证明_INC-2026-3108.pdf',
      refNo: 'FIN-SAL-2026-7821',
      ocrSummary: '月度核算收入低于国家配给补助门槛标准，雇主公章与税单一致'
    },
    住址不明: {
      title: '社区网格户籍实地核查公函',
      subtitle: '社区网格长连续居住证明与水电账单',
      badge: '社区网格户籍实地核查',
      issuer: '巴格达省地方行政委员会 & 社区网格处',
      fileName: '地方社区行政处_网格长常住户籍确认公函与水电账单_LOC-2026-7740.pdf',
      refNo: 'LOC-GRD-2026-1193',
      ocrSummary: '社区网格员现场入户核验属实，已连续常住超过6个月，地址有效激活'
    },
    更新: {
      title: '统一国民卡数据校正批准通知书',
      subtitle: '内政部户政总局个人底账信息已完成更正核实公文',
      badge: '内政部户籍更正公文',
      issuer: '伊拉克内政部户政总局',
      fileName: '内政部户政总局_国家统一国民卡数据校正批准通知书_UPD-2026-6219.pdf',
      refNo: 'MOI-UPD-2026-1102',
      ocrSummary: '国民卡档案信息与配给底册完成双向对齐，系统更正生效记录比对属实'
    },
    重复: {
      title: '户籍身份唯一性司法公证书及销重批文',
      subtitle: '民事身份法院出具的无多重档案唯一人身地位证明',
      badge: '司法唯一身份公证',
      issuer: '最高司法委员会民事身份法庭',
      fileName: '司法法庭_配给卡唯一登记与多重底册销重裁定书_DUP-2026-9041.pdf',
      refNo: 'JUD-DUP-2026-3391',
      ocrSummary: '司法裁定明确家庭成员人身唯一合法性，重复登记条目已正式注销'
    },
    临时: {
      title: '临时限制解除通知函及合规证明',
      subtitle: '贸易部粮食总署撤销临时管制清单公函',
      badge: '临时限制解除批文',
      issuer: '贸易部国家粮食与物资总署',
      fileName: '国家粮食总署_关于解除数字配给卡临时管制决定的批函_TMP-2026-2810.pdf',
      refNo: 'TRD-TMP-2026-8820',
      ocrSummary: '解除临时口粮配额暂停发放管制，指令属地代销点即日恢复核销'
    },
    地理位置: {
      title: '属地不动产权属公证书及现场定位核验单',
      subtitle: '不动产登记处合法住所证明及网点经纬度核验公函',
      badge: '属地不动产与定位核验',
      issuer: '司法部不动产登记总局 & 属地配给中心',
      fileName: '不动产登记总局_合法居所所有权登记证与GPS定位件_GEO-2026-6102.pdf',
      refNo: 'GEO-LOC-2026-5509',
      ocrSummary: '现场地理位置核验通过，家庭居住地址位于该配给中心标准服务辐射半径内'
    }
  };
});

const currentDocConfig = computed(() => {
  return DOC_CONFIGS.value[unfreezeType.value] || DOC_CONFIGS.value['商业'];
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
    const res = await citizenStore.unfreezeCard({
      cardNo: citizenStore.currentFamily?.rationCardNo,
      type: unfreezeType.value,
      statement: unfreezeStatement.value,
      docName: currentDocConfig.value?.fileName,
      paymentInfo
    });

    // 跨标签页共享与广播新解冻公文
    addSharedTicket({
      source: '配给卡解冻复核申请',
      sourceCode: 'UNF',
      categoryType: '异常状态解除类',
      appType: '配给卡解冻公文',
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
