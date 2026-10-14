<template>
  <div class="unfreeze-view space-y-4 sm:space-y-6">
    <div class="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 顶部标题与返回导航 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <ModuleDescTip
          :title="$t('unfreeze.title')"
          :content="$t('unfreeze.subtitle')"
          badge="第140号决议申诉"
          badge-type="warning"
          title-class="text-base font-bold text-slate-900"
        >
          <template #icon>
            <el-icon class="text-amber-500 text-lg"><Unlock /></el-icon>
          </template>
        </ModuleDescTip>
        <el-button size="small" plain class="shrink-0" @click="handleGoBack">
          <el-icon class="mr-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 左侧：情形选择与对应证明材料上传 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
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

          <!-- 独立证明材料上传组件 -->
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

        <!-- 右侧：申诉陈述与审核须知 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              {{ $t('unfreeze.statement') }}
            </label>
            <el-input
              v-model="unfreezeStatement"
              type="textarea"
              :rows="4"
              :placeholder="$t('unfreeze.statementPlaceholder')"
            />
          </div>

          <div class="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-800 space-y-1">
            <div class="font-bold">{{ $t('unfreeze.reviewNoticeTitle') }}</div>
            <p>
              {{ $t('unfreeze.reviewNoticeText') }}
            </p>
          </div>

          <div class="pt-4">
            <el-button
              type="warning"
              size="large"
              class="w-full font-bold shadow-md"
              :loading="submitting"
              @click="handleStartUnfreeze"
            >
              {{ $t('unfreeze.submitBtn') }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import { addSharedTicket } from '../../utils/sharedSession.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import { Unlock, Back } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const citizenStore = useCitizenStore();

function handleGoBack() {
  if (route.query.layout === 'app') {
    router.push({ path: '/citizen', query: { layout: 'app' } });
  } else {
    router.push('/citizen');
  }
}

const unfreezeType = ref('商业');
const unfreezeFileUploaded = ref(true);
const unfreezeStatement = ref('该商户名额已于2026年正式注销并完成清税，申请恢复食品配给。');
const submitting = ref(false);
const paymentDialogVisible = ref(false);

const isEn = computed(() => locale.value === 'en');

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
