<template>
  <div class="citizen-family-view space-y-6">
    <!-- 顶部配给卡基本信息面板 (强化展示电子配给卡编号与关联纸质卡编号) -->
    <div v-if="citizenStore.currentFamily" class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
            {{ $t('citizen.cardBadge') }}
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-slate-900">{{ citizenStore.currentFamily.headName }} ({{ $t('citizen.head') }})</span>
              <el-tag size="small" type="success" effect="light">{{ citizenStore.currentFamily.status }}</el-tag>
              <el-tag size="small" type="primary" effect="plain" class="font-mono">{{ $t('citizen.rationCard') }}</el-tag>
            </div>
            <!-- 电子配给卡与关联纸质卡编号 -->
            <div class="text-xs text-slate-500 font-mono mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                {{ $t('citizen.rationCardNo') }}：<strong class="text-blue-600 font-bold">{{ citizenStore.currentFamily.rationCardNo }}</strong>
              </span>
              <span>
                {{ $t('citizen.oldPaperCardNo') }}：<strong class="text-amber-700 font-bold">{{ citizenStore.currentFamily.oldPaperCardNo || 'IQ-P-1994-082194' }}</strong>
              </span>
              <span class="text-slate-400">{{ $t('citizen.familyCode') }}：{{ citizenStore.currentFamily.familyCode }}</span>
            </div>
          </div>
        </div>

        <!-- 业务快捷操作按钮 -->
        <div class="flex items-center gap-2 flex-wrap">
          <el-button type="success" plain @click="$router.push('/citizen/transfer-agent')">
            <el-icon class="mr-1"><Switch /></el-icon>
            {{ $t('citizen.applyTransferAgent') }}
          </el-button>
          <el-button color="#6366f1" plain @click="$router.push('/citizen/member-transfer')">
            <el-icon class="mr-1"><User /></el-icon>
            {{ $t('citizen.applyMemberTransfer') }}
          </el-button>
          <el-button type="primary" plain @click="$router.push('/citizen/split-household')">
            <el-icon class="mr-1"><Share /></el-icon>
            {{ $t('citizen.applySplitHousehold') }}
          </el-button>
          <el-button type="warning" plain @click="$router.push('/citizen/change-head')">
            <el-icon class="mr-1"><UserFilled /></el-icon>
            {{ $t('citizen.applyChangeHead') }}
          </el-button>
          <el-button type="info" plain @click="$router.push('/citizen/unfreeze')">
            <el-icon class="mr-1"><Unlock /></el-icon>
            {{ $t('citizen.applyUnfreeze') }}
          </el-button>
        </div>
      </div>

      <!-- 属性网格 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span class="text-slate-400 block text-[11px]">{{ $t('citizen.province') }}：</span>
          <span class="font-medium text-slate-800">{{ citizenStore.currentFamily.province }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">{{ $t('citizen.district') }}：</span>
          <span class="font-medium text-slate-800">{{ citizenStore.currentFamily.district }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">{{ $t('citizen.agentName') }}：</span>
          <span class="font-medium text-slate-800">{{ citizenStore.currentFamily.agentName }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">{{ $t('citizen.address') }}：</span>
          <span class="font-medium text-slate-800 truncate block">{{ citizenStore.currentFamily.address }}</span>
        </div>
      </div>
    </div>

    <!-- 家庭成员清单表格 -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <ModuleDescTip
          :title="$t('citizen.memberList')"
          :content="`伊拉克内政部统一国民身份认证联网，当前家庭在册共 ${citizenStore.currentFamily?.members?.length || 0} 位直系亲属及受抚养成员。`"
          :badge="`${citizenStore.currentFamily?.members?.length || 0} ${$t('common.person')}`"
          badge-type="primary"
          title-class="text-sm font-bold text-slate-900"
        >
          <template #icon>
            <el-icon class="text-blue-600 text-base"><User /></el-icon>
          </template>
        </ModuleDescTip>
        <!-- 添加新成员 -->
        <el-button type="primary" size="small" class="font-bold shadow-xs shrink-0" @click="openAddMemberDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          {{ $t('citizen.addNewMember') }}
        </el-button>
      </div>

      <el-table
        :data="citizenStore.currentFamily?.members || []"
        v-loading="citizenStore.loading"
        style="width: 100%"
        class="text-xs"
        border
        stripe
      >
        <el-table-column prop="name" :label="$t('citizen.headName')" min-width="140" fixed>
          <template #default="{ row }">
            <span class="font-bold text-slate-800">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="`${$t('citizen.rationCardNo')} / ${$t('citizen.oldPaperCardNo')}`" min-width="210">
          <template #default>
            <div class="space-y-0.5">
              <div class="flex items-center gap-1 font-mono">
                <span class="font-bold text-blue-600">{{ citizenStore.currentFamily?.rationCardNo }}</span>
                <el-tag size="small" effect="plain" type="primary" class="scale-90 origin-left">{{ $t('citizen.rationCard') }}</el-tag>
              </div>
              <div class="text-[11px] text-amber-800 font-mono flex items-center gap-1">
                <span>{{ $t('citizen.oldPaperCardNo') }}:</span>
                <span class="font-semibold">{{ citizenStore.currentFamily?.oldPaperCardNo || 'IQ-P-1994-082194' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="relation" :label="$t('citizen.relation')" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.relation === '户主' || row.relation === 'Head' ? 'primary' : (row.relation === '配偶' || row.relation === 'Spouse') ? 'success' : 'info'"
            >
              {{ row.relation }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="gender" :label="$t('citizen.gender')" width="80" align="center" />

        <el-table-column prop="nationalId" :label="$t('citizen.nationalId')" min-width="160">
          <template #default="{ row }">
            <span class="font-mono text-slate-600">{{ row.nationalId }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="$t('citizen.status')" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.status === '正常' || row.status === 'Active' ? 'success' : (row.status === '冻结' || row.status === 'Frozen') ? 'danger' : 'info'"
              effect="light"
            >
              {{ row.status }}{{ row.freezeReason ? ` (${row.freezeReason})` : '' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="phone" :label="$t('citizen.phone')" min-width="130">
          <template #default="{ row }">
            <span class="font-mono">{{ row.phone || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.action')" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEditModal(row)">
              {{ $t('citizen.updateInfo') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ======================================================== -->
    <!-- 模态框 1: 添加新成员对话框 (全量覆盖六大法定前提条件) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="addMemberDialogVisible"
      :title="$t('citizen.addMemberTitle')"
      width="640px"
      align-center
    >
      <div class="space-y-4 text-xs">
        <!-- 流程化步骤条导航 -->
        <div class="py-1">
          <el-steps :active="addMemberStep - 1" finish-status="success" align-center>
            <el-step :title="$t('citizen.stepBasic')" :description="$t('citizen.stepBasicDesc')" />
            <el-step :title="$t('citizen.stepVerify')" :description="$t('citizen.stepVerifyDesc')" />
            <el-step :title="$t('citizen.stepConfirm')" :description="$t('citizen.stepConfirmDesc')" />
          </el-steps>
        </div>

        <!-- 步骤 1: 填写基本身份信息 -->
        <div v-show="addMemberStep === 1" class="space-y-3.5">
          <!-- 简要指引提示 -->
          <div class="bg-blue-50/80 border border-blue-200/80 p-3 rounded-xl text-blue-900 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <el-icon class="text-blue-600"><InfoFilled /></el-icon>
              <span>{{ $t('citizen.fillRealIdentityNotice') }}</span>
            </div>
            <!-- 法定户主就绪小标签 -->
            <el-tag size="small" type="success" effect="light">{{ $t('citizen.headVerifiedBadge') }}</el-tag>
          </div>

          <el-form label-position="top" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <el-form-item :label="$t('citizen.memberFullName')" required>
                <el-input v-model="newMemberForm.name" :placeholder="$t('citizen.inputFullNamePlaceholder')" />
              </el-form-item>
              <el-form-item :label="$t('citizen.nidLabel')" required>
                <el-input v-model="newMemberForm.nationalId" :placeholder="$t('citizen.inputNidPlaceholder')" />
              </el-form-item>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <el-form-item :label="$t('citizen.birthDate')" required>
                <el-date-picker
                  v-model="newMemberForm.birthDate"
                  type="date"
                  :placeholder="$t('citizen.selectBirthDate')"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                  @change="handleBirthDateChange"
                />
              </el-form-item>
              <el-form-item :label="$t('citizen.gender')" required>
                <el-select v-model="newMemberForm.gender" class="w-full">
                  <el-option :label="$t('citizen.male')" :value="isEn ? 'Male' : '男'" />
                  <el-option :label="$t('citizen.female')" :value="isEn ? 'Female' : '女'" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('citizen.specifyRelation')" required>
                <el-select v-model="newMemberForm.relation" :placeholder="$t('citizen.selectRelation')" class="w-full">
                  <el-option :label="$t('citizen.relationChild')" :value="isEn ? 'Child' : '子女'" />
                  <el-option :label="$t('citizen.relationSpouse')" :value="isEn ? 'Spouse' : '配偶'" />
                  <el-option :label="$t('citizen.relationFather')" :value="isEn ? 'Father' : '父亲'" />
                  <el-option :label="$t('citizen.relationMother')" :value="isEn ? 'Mother' : '母亲'" />
                  <el-option :label="$t('citizen.relationDependent')" :value="isEn ? 'Dependent' : '受抚养人'" />
                </el-select>
              </el-form-item>
            </div>

            <!-- 户主资质极简展示 -->
            <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
              <div class="flex items-center gap-2">
                <el-icon class="text-emerald-500"><CircleCheckFilled /></el-icon>
                <span>{{ $t('citizen.headBioEnrolled') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <el-icon class="text-emerald-500"><CircleCheckFilled /></el-icon>
                <span>{{ $t('citizen.qiCardBound') }}</span>
              </div>
            </div>
          </el-form>
        </div>

        <!-- 步骤 2: 三重资格核验 -->
        <div v-show="addMemberStep === 2" class="space-y-3">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            {{ $t('citizen.verifyNotice') }}
          </div>

          <div class="space-y-2.5">
            <!-- 条件 1: 系统更新 -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div>
                <div class="font-bold text-slate-800">{{ $t('citizen.step2Item1Title') }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ $t('citizen.step2Item1Desc') }}</div>
              </div>
              <el-button
                size="small"
                :type="systemInfoUpdated ? 'success' : 'primary'"
                :plain="systemInfoUpdated"
                @click="systemInfoUpdated = true"
              >
                {{ systemInfoUpdated ? $t('citizen.step2Item1Done') : $t('citizen.step2Item1Action') }}
              </el-button>
            </div>

            <!-- 条件 2: 生物识别 -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div>
                <div class="font-bold text-slate-800">{{ $t('citizen.step2Item2Title') }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ $t('citizen.step2Item2Desc') }}</div>
              </div>
              <el-button
                size="small"
                :type="memberBiometricVerified ? 'success' : 'primary'"
                :plain="memberBiometricVerified"
                @click="newMemberFaceDialogVisible = true"
              >
                {{ memberBiometricVerified ? $t('citizen.step2Item2Done') : $t('citizen.step2Item2Action') }}
              </el-button>
            </div>

            <!-- 条件 3: 地理位置 -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div>
                <div class="font-bold text-slate-800">{{ $t('citizen.step2Item3Title') }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ $t('citizen.step2Item3Desc') }}</div>
              </div>
              <el-button
                size="small"
                :type="locationVerified ? 'success' : 'primary'"
                :plain="locationVerified"
                @click="locationVerified = true"
              >
                {{ locationVerified ? $t('citizen.step2Item3Done') : $t('citizen.step2Item3Action') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 3: 证明材料与确认纳保 -->
        <div v-show="addMemberStep === 3" class="space-y-3.5">
          <!-- 申报信息摘要 -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span class="text-slate-400 block">{{ $t('citizen.headName') }}：</span>
              <span class="font-bold text-slate-800">{{ newMemberForm.name }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">{{ $t('citizen.nationalId') }}：</span>
              <span class="font-mono text-slate-800">{{ newMemberForm.nationalId }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">{{ $t('citizen.relation') }}：</span>
              <span class="font-bold text-blue-700">{{ newMemberForm.relation }} ({{ newMemberForm.gender }})</span>
            </div>
            <div>
              <span class="text-slate-400 block">{{ $t('citizen.ageJudge') }}：</span>
              <span class="font-medium" :class="isUnder12 ? 'text-rose-600' : 'text-emerald-600'">
                {{ isUnder12 ? $t('citizen.under12Child') : $t('citizen.over12Person') }}
              </span>
            </div>
          </div>

          <!-- 儿童证明文件上传 (若未满12岁) -->
          <div v-if="isUnder12" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-rose-700">{{ $t('citizen.childDocTitle') }}</span>
              <el-tag type="danger" size="small" effect="plain">{{ $t('citizen.childDocBadge') }}</el-tag>
            </div>
            <DocumentUploader
              v-model="childDocumentUploaded"
              :title="$t('citizen.childDocName')"
              :subtitle="$t('citizen.childDocSubtitle')"
              is-required
              :category-badge="$t('citizen.childDocBadge')"
              issuer="MOH & Ministry of Interior"
              default-file-name="Medical_Birth_Certificate_2020.pdf"
            />
          </div>
          <div v-else class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
            <el-icon class="text-emerald-600"><CircleCheckFilled /></el-icon>
            <span>{{ $t('citizen.over12ExemptNotice') }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div>
            <el-button v-if="addMemberStep > 1" @click="addMemberStep--">{{ $t('common.prevStep') }}</el-button>
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="addMemberDialogVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button v-if="addMemberStep < 3" type="primary" @click="handleNextAddMemberStep">
              {{ $t('common.nextStep') }}
            </el-button>
            <el-button v-else type="primary" :loading="addingMember" @click="handleSubmitAddMember">
              {{ $t('citizen.confirmAddMember') }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 成员信息更新弹窗 -->
    <el-dialog
      v-model="editModalVisible"
      :title="$t('citizen.editMemberTitle')"
      width="480px"
      align-center
    >
      <el-form :model="editForm" label-position="top">
        <el-form-item :label="$t('citizen.headName')">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item :label="$t('citizen.contactPhone')">
          <el-input v-model="editForm.phone" :placeholder="$t('citizen.inputPhonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('citizen.residenceAddress')">
          <el-input v-model="editForm.residenceInfo" :placeholder="$t('citizen.inputAddressPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editModalVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveMember">{{ $t('citizen.confirmUpdate') }}</el-button>
      </template>
    </el-dialog>

    <!-- 活体人脸动作核验弹窗 (添加新成员生物识别) -->
    <FaceLivenessVerifyDialog
      v-model="newMemberFaceDialogVisible"
      title="新登记家庭成员活体人脸动作核验"
      :target-name="newMemberForm.name || '待登记成员'"
      :target-national-id="newMemberForm.nationalId || '198004198271'"
      @success="handleNewMemberFaceSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import FaceLivenessVerifyDialog from '../../components/common/FaceLivenessVerifyDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import {
  Share,
  User,
  UserFilled,
  Unlock,
  Switch,
  Plus,
  InfoFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');
const citizenStore = useCitizenStore();
const editModalVisible = ref(false);
const saving = ref(false);

const editForm = reactive({
  id: '',
  name: '',
  phone: '',
  residenceInfo: ''
});

function handleLanguageChange() {
  citizenStore.fetchFamilies();
}

onMounted(() => {
  citizenStore.fetchFamilies();
  window.addEventListener('rcm-language-changed', handleLanguageChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('rcm-language-changed', handleLanguageChange);
});

function openEditModal(member) {
  editForm.id = member.id;
  editForm.name = member.name;
  editForm.phone = member.phone || '';
  editForm.residenceInfo = member.residenceInfo || '';
  editModalVisible.value = true;
}

async function handleSaveMember() {
  saving.value = true;
  try {
    await citizenStore.updateMember(editForm.id, {
      phone: editForm.phone,
      residenceInfo: editForm.residenceInfo
    });
    editModalVisible.value = false;
  } finally {
    saving.value = false;
  }
}

// ==========================================
// 需求 2: 添加新成员 (流程化步骤与前提核验)
// ==========================================
const addMemberDialogVisible = ref(false);
const addingMember = ref(false);
const addMemberStep = ref(1);

// 核验前提状态
const newMemberFaceDialogVisible = ref(false);
const systemInfoUpdated = ref(false);
const memberBiometricVerified = ref(false);
const locationVerified = ref(false);
const childDocumentUploaded = ref(false);

function handleNewMemberFaceSuccess(data) {
  memberBiometricVerified.value = true;
  ElMessage.success(`家庭成员【${newMemberForm.name || '待登记成员'}】活体人脸识别与生物特征比对通过！`);
}

const newMemberForm = reactive({
  name: '',
  nationalId: '',
  birthDate: '2019-05-15',
  gender: '男',
  relation: '子女',
  phone: ''
});

// 计算是否未满 12 岁
const isUnder12 = computed(() => {
  if (!newMemberForm.birthDate) return true;
  const birthYear = new Date(newMemberForm.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return (currentYear - birthYear) < 12;
});

function handleBirthDateChange() {
  if (isUnder12.value) {
    childDocumentUploaded.value = true; // 自动加载儿童证明样本以方便快速体验
  }
}

function openAddMemberDialog() {
  addMemberStep.value = 1;
  const isEnglish = locale.value === 'en';
  newMemberForm.name = isEnglish ? 'Youssef Ahmed Hassan' : '优素福·艾哈迈德·哈桑';
  newMemberForm.nationalId = '201982910488';
  newMemberForm.birthDate = '2019-05-15';
  newMemberForm.gender = isEnglish ? 'Male' : '男';
  newMemberForm.relation = isEnglish ? 'Child' : '子女';
  newMemberForm.phone = '';

  // 初始化前提核验为就绪状态
  systemInfoUpdated.value = true;
  memberBiometricVerified.value = true;
  locationVerified.value = true;
  childDocumentUploaded.value = true;

  addMemberDialogVisible.value = true;
}

function handleNextAddMemberStep() {
  if (addMemberStep.value === 1) {
    if (!newMemberForm.name || !newMemberForm.nationalId || !newMemberForm.relation) {
      ElMessage.warning(t('citizen.pleaseFillMemberRequired'));
      return;
    }
    addMemberStep.value = 2;
    return;
  }
  if (addMemberStep.value === 2) {
    if (!systemInfoUpdated.value) {
      ElMessage.warning(t('citizen.pleaseCompleteSystemCheck'));
      return;
    }
    if (!memberBiometricVerified.value) {
      ElMessage.warning(t('citizen.pleaseCompleteBioCheck'));
      return;
    }
    if (!locationVerified.value) {
      ElMessage.warning(t('citizen.pleaseCompleteLocationCheck'));
      return;
    }
    addMemberStep.value = 3;
    return;
  }
}

async function handleSubmitAddMember() {
  if (!newMemberForm.name || !newMemberForm.nationalId || !newMemberForm.relation) {
    ElMessage.warning(t('citizen.pleaseFillMemberRequired'));
    return;
  }

  // 1. 校验系统更新
  if (!systemInfoUpdated.value) {
    ElMessage.error(t('citizen.precond1'));
    return;
  }

  // 2. 校验生物识别
  if (!memberBiometricVerified.value) {
    ElMessage.error(t('citizen.precond2'));
    return;
  }

  // 3. 校验地理位置
  if (!locationVerified.value) {
    ElMessage.error(t('citizen.precond3'));
    return;
  }

  // 4. 校验未满 12 岁儿童证明
  if (isUnder12.value && !childDocumentUploaded.value) {
    ElMessage.error(t('citizen.under12Notice'));
    return;
  }

  addingMember.value = true;
  try {
    const cardNo = citizenStore.currentFamily?.rationCardNo || 'RC-10029381';
    await citizenStore.addMember(cardNo, {
      ...newMemberForm,
      isUnder12: isUnder12.value
    });
    addMemberDialogVisible.value = false;
  } catch (err) {
    ElMessage.error(t('citizen.addMemberFailed'));
  } finally {
    addingMember.value = false;
  }
}
</script>
