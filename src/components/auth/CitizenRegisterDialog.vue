<template>
  <el-dialog
    v-model="visible"
    :title="$t('register.title')"
    :width="dialogWidth"
    align-center
    :class="{ 'rcm-compact-dialog': isCompact }"
    :before-close="handleClose"
  >
    <!-- 步骤进度指示条 (Element Plus el-steps) -->
    <el-steps :active="currentStep" finish-status="success" simple class="mb-5">
      <el-step :title="$t('register.stepOcr')" :icon="Document" />
      <el-step :title="$t('register.stepInfo')" :icon="Edit" />
      <el-step :title="$t('register.stepVerify')" :icon="Check" />
    </el-steps>

    <!-- ======================================================== -->
    <!-- 步骤 1: 拍照上传纸质配给卡 (默认开启 OCR 自动识别与底账校验) -->
    <!-- ======================================================== -->
    <div v-if="currentStep === 0" class="space-y-4">
      <!-- 顶部提示：明确指出 OCR 默认开启 -->
      <div class="bg-[#EFF5F1] border border-[#C7DED0] p-3 rounded-lg text-xs text-[#24483A] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-icon class="text-[#326445]"><Camera /></el-icon>
          <span>{{ $t('register.ocrAutoOnPrefix') }}<strong>{{ $t('register.ocrAutoOnHighlight') }}</strong>{{ $t('register.ocrAutoOnSuffix') }}</span>
        </div>
        <el-tag size="small" type="success" effect="dark" class="font-mono">OCR ACTIVE</el-tag>
      </div>

      <div :class="isCompact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'">
        <!-- 左侧：拍照/上传纸质旧卡区域 -->
        <div class="bg-[#1B3123] rounded-lg p-4 border border-[#1F3326] text-white flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between border-b border-[#1F3326] pb-2">
            <span class="text-xs font-bold text-[#DFC08B]">{{ $t('register.captureTitle') }}</span>
            <span class="text-[10px] text-[#8A9A8F] font-mono">AUTOSCAN · READY</span>
          </div>

          <!-- 模拟取景器 / 上传预览卡片 -->
          <div
            class="aspect-4/3 rounded-lg border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center p-3 cursor-pointer"
            :class="hasUploadedPhoto ? 'border-[#3E9B68] bg-[#3F3017]/40 text-[#F2E3C6]' : 'border-[#43554B] bg-[#12241A] text-[#8A9A8F] hover:border-[#5C8A6B] hover:bg-[#1B3123]'"
            @click="triggerPhotoCapture"
          >
            <!-- 正在扫描激光束动效 -->
            <div v-if="scanning" class="absolute inset-x-0 h-1 bg-[#6FBF92]/90 shadow-[0_0_14px_#6FBF92] animate-pulse top-1/2 z-20"></div>

            <div v-if="hasUploadedPhoto" class="w-full h-full flex flex-col justify-between font-mono text-[10px] relative z-10">
              <div class="flex justify-between border-b border-[#6B5321]/40 pb-1">
                <span>بطاقة التموين (1994)</span>
                <span class="text-[#6FBF92] font-bold">{{ $t('register.capturedImage') }}</span>
              </div>
              <div class="space-y-1 my-auto">
                <div>{{ $t('register.cardNoShortLabel') }} <strong class="text-white">IQ-P-1994-082194</strong></div>
                <div>{{ $t('register.holderLabel') }} <strong class="text-white">{{ $t('register.defaultUserName') }}</strong></div>
                <div>{{ $t('register.registeredPopLabel') }} <strong class="text-white">{{ $t('register.registeredPopValue', { count: 5 }) }}</strong></div>
              </div>
              <div class="text-[9px] text-[#DFC08B]/80 border-t border-[#6B5321]/40 pt-1 flex justify-between">
                <span>MINISTRY OF TRADE</span>
                <span>{{ $t('register.stubSealOk') }}</span>
              </div>
            </div>

            <div v-else class="text-center space-y-2 py-4">
              <div class="w-12 h-12 rounded-full bg-[#1F3326] text-[#7FA48C] flex items-center justify-center mx-auto">
                <el-icon :size="24"><Camera /></el-icon>
              </div>
              <div class="text-xs font-bold text-[#D9E5DB]">{{ $t('register.clickCapture') }}</div>
              <div class="text-[10px] text-[#58685D]">{{ $t('register.autoOcrHint') }}</div>
            </div>

            <!-- 隐藏的真实文件选择控件，方便移动端真实调起摄像头 -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="handleFileChange"
            />
          </div>

          <!-- 拍照上传操作按钮 -->
          <div class="grid grid-cols-2 gap-2">
            <el-button
              size="small"
              type="primary"
              :loading="scanning"
              class="w-full font-bold"
              data-demo-target="btn-capture"
              @click="triggerPhotoCapture"
            >
              <el-icon class="me-1"><Camera /></el-icon>
              {{ hasUploadedPhoto ? $t('register.retakeBtn') : $t('register.captureBtn') }}
            </el-button>
            <el-button size="small" type="info" plain class="w-full" :disabled="scanning" @click="triggerTestInvalidCard">
              {{ $t('register.simulateInvalid') }}
            </el-button>
          </div>
        </div>

        <!-- 右侧：自动 OCR 识别与有效性校验状态卡 -->
        <div class="bg-[#F3F8F4] rounded-lg p-4 border border-[#D9E5DB] flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]">
              <span class="text-xs font-bold text-[#1F3326]">{{ $t('register.ocrCompareTitle') }}</span>
              <el-tag v-if="scanning" size="small" type="warning" effect="dark">
                {{ $t('register.tagScanning') }}
              </el-tag>
              <el-tag v-else-if="ocrExtracted && isValidCard" size="small" type="success" effect="dark">
                {{ $t('register.tagValidStub') }}
              </el-tag>
              <el-tag v-else-if="ocrExtracted && !isValidCard" size="small" type="danger" effect="dark">
                {{ $t('register.tagInvalidStub') }}
              </el-tag>
              <el-tag v-else size="small" type="info">{{ $t('register.tagWaitingUpload') }}</el-tag>
            </div>

            <!-- 识别并校验成功展示 -->
            <div v-if="ocrExtracted && isValidCard" class="mt-3 space-y-2 text-xs">
              <div class="p-2.5 rounded-lg bg-[#EFF5F1] border border-[#C7E0CE] text-[#24483A] font-semibold flex items-center gap-1.5">
                <el-icon class="text-[#2F7A50]"><CircleCheckFilled /></el-icon>
                <span>{{ $t('register.validBanner') }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
                <span class="text-[#8A9A8F]">{{ $t('register.labelPaperCardNo') }}</span>
                <span class="font-mono font-bold text-[#1F3326]">{{ ocrData.paperCardNo }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
                <span class="text-[#8A9A8F]">{{ $t('register.labelLegalHead') }}</span>
                <span class="font-bold text-[#1F3326]">{{ ocrData.headName }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
                <span class="text-[#8A9A8F]">{{ $t('register.labelRegion') }}</span>
                <span class="text-[#43554B]">{{ ocrData.province }} {{ ocrData.district }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
                <span class="text-[#8A9A8F]">{{ $t('register.labelApprovedPop') }}</span>
                <span class="font-bold text-[#326445]">{{ $t('register.approvedPopValue', { count: ocrData.memberCount }) }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-[#8A9A8F]">{{ $t('register.labelStubCheck') }}</span>
                <span class="text-[#2F7A50] font-bold">{{ $t('register.stubValidResult') }}</span>
              </div>
            </div>

            <!-- 校验失败阻断提示 -->
            <div v-else-if="ocrExtracted && !isValidCard" class="mt-3 space-y-2 text-xs">
              <div class="p-2.5 rounded-lg bg-[#FBEAE9] border border-[#F2D5D4] text-[#6E2F2E] font-semibold flex items-center gap-1.5">
                <el-icon class="text-[#C04442]"><CircleCloseFilled /></el-icon>
                <span>{{ $t('register.invalidBanner') }}</span>
              </div>
              <p class="text-[#A93B39] leading-relaxed text-[11px]">
                {{ validationNotice || $t('register.invalidDefaultNotice') }}
              </p>
            </div>

            <!-- 初始待上传状态 -->
            <div v-else class="h-32 flex flex-col items-center justify-center text-[#8A9A8F] text-xs gap-1.5">
              <el-icon :size="28" class="text-[#C9DBCE]"><Picture /></el-icon>
              <span>{{ $t('register.waitingScanHint') }}</span>
            </div>
          </div>

          <!-- 推进按钮（支持自动跳转，也可手动点击立即推进） -->
          <el-button
            type="primary"
            class="w-full font-bold"
            :disabled="!ocrExtracted || !isValidCard"
            @click="currentStep = 1"
          >
            {{ isValidCard ? $t('register.nextWhenValid') : $t('register.nextWhenInvalid') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 步骤 2: 补充公民信息注册 -->
    <!-- ======================================================== -->
    <div v-else-if="currentStep === 1" class="space-y-4">
      <el-form label-position="top" :model="registerForm" class="space-y-3">
        <div :class="isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'">
          <el-form-item :label="$t('register.headNameLabel')" required>
            <div
              class="w-full cursor-pointer"
              data-demo-target="input-head-name"
              @click="handleDemoClickHeadName"
            >
              <el-input
                v-model="registerForm.headName"
                :disabled="!demoMode && !!registerForm.headName"
                :placeholder="$t('register.defaultUserName') || '艾哈迈德·哈桑·拉希德'"
                class="w-full"
              />
            </div>
          </el-form-item>

          <el-form-item :label="$t('register.cardNoBindLabel')" required>
            <el-input v-model="registerForm.paperCardNo" disabled class="font-mono" />
          </el-form-item>
        </div>

        <div :class="isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'">
          <el-form-item :label="$t('register.nidLabel')" required>
            <el-input class="bidi-ltr" v-model="registerForm.nationalId" :placeholder="$t('register.nidPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('register.memberCountLabel')">
            <el-input-number v-model="registerForm.memberCount" :min="1" :max="15" class="w-full" />
          </el-form-item>
        </div>

        <div :class="isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'">
          <el-form-item :label="$t('register.phoneLabel')" required>
            <el-input class="bidi-ltr" v-model="registerForm.phone" placeholder="+964 780 123 4567" />
          </el-form-item>

          <el-form-item :label="$t('register.smsLabel')" required>
            <div class="flex gap-2 w-full">
              <el-input v-model="registerForm.smsCode" :placeholder="$t('register.smsPlaceholder')" maxlength="6" class="font-mono" />
              <el-button
                type="primary"
                plain
                :disabled="smsCountdown > 0"
                class="font-bold shrink-0"
                data-demo-target="btn-get-sms"
                @click="handleDemoSendSms"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s` : $t('register.getSmsCode') }}
              </el-button>
            </div>
          </el-form-item>
        </div>

        <!-- 模拟收到的短信提示框 -->
        <div v-if="simulatedSmsCode" class="p-2.5 bg-[#EFF5F1] border border-[#C7E0CE] rounded-lg text-xs text-[#24483A] flex items-center justify-between">
          <span>{{ $t('register.smsReceived') }}<strong class="font-mono text-[#2F5B44] text-sm">{{ simulatedSmsCode }}</strong></span>
          <el-button
            type="success"
            size="small"
            class="font-bold"
            data-demo-target="btn-fill-sms"
            @click="handleDemoFillSms"
          >
            {{ $t('register.fillIn') }}
          </el-button>
        </div>

        <div :class="isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'">
          <el-form-item :label="$t('register.pwdLabel')" required>
            <el-input v-model="registerForm.password" type="password" show-password :placeholder="$t('register.pwdPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('register.confirmPwdLabel')" required>
            <el-input v-model="registerForm.confirmPassword" type="password" show-password :placeholder="$t('register.confirmPwdPlaceholder')" />
          </el-form-item>
        </div>
      </el-form>

      <div class="flex items-center justify-between pt-2">
        <el-button @click="currentStep = 0">{{ $t('register.backPrev') }}</el-button>
        <el-button
          type="primary"
          class="font-bold"
          data-demo-target="btn-next-auth"
          @click="handleDemoProceedToVerify"
        >
          {{ $t('register.nextChooseAuth') }}
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 步骤 3: 人脸认证 / 远程验证 -->
    <!-- ======================================================== -->
    <div v-else class="space-y-4">
      <div class="bg-[#EFF5F1] border border-[#C7DED0] p-3.5 rounded-lg text-xs text-[#24483A] space-y-1">
        <div class="font-bold">{{ $t('register.finalBannerTitle') }}</div>
        <p>{{ $t('register.finalBannerDesc') }}</p>
      </div>

      <div :class="isCompact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'">
        <!-- 方式 A: 人脸自拍与统一国民卡比对 -->
        <div class="border rounded-lg p-4 space-y-3 bg-[#F3F8F4] flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326] text-sm">{{ $t('register.methodATitle') }}</span>
              <el-tag v-if="biometricPassed" size="small" type="success">{{ $t('register.passedTag') }}</el-tag>
            </div>
            <p class="text-xs text-[#58685D]">
              {{ $t('register.methodADesc') }}
            </p>
          </div>

          <el-button
            type="primary"
            :plain="!biometricPassed"
            class="font-bold"
            data-demo-target="btn-start-bio"
            @click="handleDemoStartBiometric"
          >
            {{ biometricPassed ? $t('register.biometricBtnRedo') : $t('register.biometricBtn') }}
          </el-button>
        </div>

        <!-- 方式 B: 异地成员远程邀请验证 -->
        <div class="border rounded-lg p-4 space-y-3 bg-[#F3F8F4] flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326] text-sm">{{ $t('register.methodBTitle') }}</span>
              <el-tag v-if="remotePassed" size="small" type="success">{{ $t('register.passedTag') }}</el-tag>
            </div>
            <p class="text-xs text-[#58685D]">
              {{ $t('register.methodBDesc') }}
            </p>
          </div>

          <el-button type="warning" :plain="!remotePassed" @click="showRemoteModal = true">
            {{ remotePassed ? $t('register.remoteBtnRedo') : $t('register.remoteBtn') }}
          </el-button>
        </div>
      </div>

      <!-- 最终提交按钮 -->
      <div class="pt-4 flex items-center justify-between">
        <el-button @click="currentStep = 1">{{ $t('register.backPrev') }}</el-button>
        <el-button
          type="success"
          size="large"
          class="font-bold shadow-md"
          data-demo-target="btn-finish-reg"
          :disabled="!biometricPassed && !remotePassed"
          :loading="registering"
          @click="handleCompleteRegistration"
        >
          {{ $t('register.finishBtn') }}
        </el-button>
      </div>
    </div>

    <!-- 子弹窗：人脸活体核验 -->
    <BiometricVerifyDialog
      v-model="showBiometricModal"
      :user-name="registerForm.headName || $t('register.defaultUserName')"
      user-card-no="NEW-REGISTER"
      :demo-mode="demoMode"
      @success="onBiometricSuccess"
    />

    <!-- 子弹窗：异地成员远程核验 -->
    <RemoteVerifyDialog
      v-model="showRemoteModal"
      :default-member-name="$t('register.defaultMemberName')"
      @success="onRemoteSuccess"
    />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.js';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { ocrScanPaperCard, sendSmsCode, registerCitizen } from '../../api/auth.js';
import { ElMessage } from 'element-plus';
import BiometricVerifyDialog from './BiometricVerifyDialog.vue';
import RemoteVerifyDialog from './RemoteVerifyDialog.vue';
import { demoSubStep, setDemoStep } from '../../utils/demoState.js';
import {
  Document,
  Edit,
  Check,
  Camera,
  Picture,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  demoMode: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'registered']);

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);

const visible = ref(props.modelValue);
watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) {
    // 弹窗打开时重置状态
    currentStep.value = 0;
    if (props.demoMode) {
      setDemoStep('step1_2');
    }
  }
});

const currentStep = ref(0);

// ==========================================
// 步骤 1: 拍照上传与自动 OCR 识别及有效性校验
// ==========================================
const fileInputRef = ref(null);
const scanning = ref(false);
const hasUploadedPhoto = ref(false);
const ocrExtracted = ref(false);
const isValidCard = ref(false);
const validationNotice = ref('');

const ocrData = reactive({
  paperCardNo: '',
  headName: '',
  province: '',
  district: '',
  memberCount: 5
});

// 调起拍照或上传
function triggerPhotoCapture() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  } else {
    executeAutoOcrProcess(false);
  }
}

function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (file || true) {
    // 用户拍照或选图后，立即默认自动执行 OCR 解析与存根校验，无需再次点击
    executeAutoOcrProcess(false);
  }
}

// 模拟测试注销卡
function triggerTestInvalidCard() {
  executeAutoOcrProcess(true);
}

// 核心：拍照后自动执行 OCR 扫描并比对内政部有效性存根
async function executeAutoOcrProcess(mockInvalid = false) {
  scanning.value = true;
  hasUploadedPhoto.value = true;
  ocrExtracted.value = false;
  isValidCard.value = false;
  validationNotice.value = '';

  try {
    const res = await ocrScanPaperCard({ mockInvalid });
    Object.assign(ocrData, res);
    ocrExtracted.value = true;
    isValidCard.value = !!res.isValid;
    validationNotice.value = res.validationNotice || '';

    if (res.isValid) {
      // 校验是有效配给卡，自动带入步骤 2 表单
      registerForm.headName = res.headName;
      registerForm.paperCardNo = res.paperCardNo;
      registerForm.province = res.province;
      registerForm.district = res.district;
      registerForm.memberCount = res.memberCount;

      ElMessage.success(t('register.msgOcrSuccess'));

      // 自动推进到下一步补充公民信息
      setTimeout(() => {
        if (currentStep.value === 0 && isValidCard.value) {
          currentStep.value = 1;
          if (props.demoMode) {
            setDemoStep('step1_3');
          }
          ElMessage.info(t('register.msgAutoNext'));
        }
      }, 1000);
    } else {
      ElMessage.error(res.validationNotice || t('register.msgInvalidCardFallback'));
    }
  } catch (err) {
    ocrExtracted.value = true;
    isValidCard.value = false;
    validationNotice.value = t('register.msgOcrCrash');
    ElMessage.error(t('register.msgOcrBlock'));
  } finally {
    scanning.value = false;
  }
}

// ==========================================
// 步骤 2: 补充公民信息
// ==========================================
const registerForm = reactive({
  headName: '',
  paperCardNo: '',
  province: '巴格达省',
  district: '卡尔赫区',
  nationalId: 'IQ-1980-0419-8271',
  memberCount: 5,
  phone: '+964 780 123 4567',
  smsCode: '',
  password: 'iq-pass-2026',
  confirmPassword: 'iq-pass-2026'
});

const smsCountdown = ref(0);
const simulatedSmsCode = ref('');

function handleDemoClickHeadName() {
  if (props.demoMode) {
    // 不覆盖已有姓名（保留 OCR 识别结果），仅在为空时填入默认演示姓名
    if (!registerForm.headName) {
      registerForm.headName = t('register.defaultUserName');
    }
    if (!registerForm.nationalId) registerForm.nationalId = 'IQ-1980-0419-8271';
    if (!registerForm.phone) registerForm.phone = '+964 780 123 4567';
    ElMessage.success(t('register.demoNameFilled', { name: registerForm.headName }));
    setDemoStep('step1_4');
  }
}

async function handleDemoSendSms() {
  if (props.demoMode) {
    if (!registerForm.phone) registerForm.phone = '+964 780 123 4567';
  }
  await handleSendSms();
  if (props.demoMode) {
    setDemoStep('step1_5');
  }
}

function handleDemoFillSms() {
  registerForm.smsCode = simulatedSmsCode.value || '839201';
  if (props.demoMode) {
    setDemoStep('step1_6');
  }
}

function handleDemoProceedToVerify() {
  if (props.demoMode) {
    if (!registerForm.headName) registerForm.headName = t('register.defaultUserName');
    if (!registerForm.nationalId) registerForm.nationalId = 'IQ-1980-0419-8271';
    if (!registerForm.phone) registerForm.phone = '+964 780 123 4567';
    if (!registerForm.smsCode) registerForm.smsCode = simulatedSmsCode.value || '839201';
    currentStep.value = 2;
    setDemoStep('step1_7');
    return;
  }
  handleProceedToVerify();
}

function handleDemoStartBiometric() {
  if (props.demoMode) {
    // 打开三要素核验弹窗，引导用户依次完成 3 项验证 (人脸/卡正面/卡芯片)
    setDemoStep('step1_7a');
  }
  showBiometricModal.value = true;
}

async function handleSendSms() {
  if (!registerForm.phone) {
    ElMessage.warning(t('register.msgPhoneRequired'));
    return;
  }
  try {
    const res = await sendSmsCode({ phone: registerForm.phone });
    simulatedSmsCode.value = res.smsCode || '839201';
    smsCountdown.value = 60;
    const timer = setInterval(() => {
      smsCountdown.value--;
      if (smsCountdown.value <= 0) clearInterval(timer);
    }, 1000);
    ElMessage.success(t('register.msgSmsSent'));
  } catch (e) {
    ElMessage.error(t('register.msgSmsFail'));
  }
}

function handleProceedToVerify() {
  if (!registerForm.nationalId || !registerForm.phone || !registerForm.smsCode) {
    ElMessage.warning(t('register.msgFormIncomplete'));
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning(t('register.msgPwdMismatch'));
    return;
  }
  currentStep.value = 2;
}

// ==========================================
// 步骤 3: 认证与开户
// ==========================================
const showBiometricModal = ref(false);
const showRemoteModal = ref(false);
const biometricPassed = ref(false);
const remotePassed = ref(false);
const registering = ref(false);

function onBiometricSuccess() {
  biometricPassed.value = true;
  ElMessage.success(t('register.msgBiometricDone'));
}

function onRemoteSuccess() {
  remotePassed.value = true;
  ElMessage.success(t('register.msgRemoteDone'));
}

async function handleCompleteRegistration() {
  registering.value = true;
  try {
    const res = await registerCitizen({
      ...registerForm,
      biometricVerified: biometricPassed.value,
      remoteVerified: remotePassed.value
    });

    ElMessage.success(res.message || t('register.msgRegisterSuccessFallback'));

    // 自动登录到系统（修复 BUG：写入 sessionStorage 与 layoutMode 为 app）
    authStore.token = res.token;
    authStore.userProfile = res.user;
    sessionStorage.setItem('rcm_auth_token', res.token);
    sessionStorage.setItem('rcm_user_profile', JSON.stringify(res.user));
    sessionStorage.setItem('rcm_layout_mode', 'app');
    localStorage.setItem('rcm_auth_token', res.token);
    localStorage.setItem('rcm_user_profile', JSON.stringify(res.user));
    localStorage.setItem('rcm_trusted_device', 'true');
    localStorage.setItem('rcm_layout_mode', 'app');

    authStore.setSessionUser(res.user, res.token);

    visible.value = false;
    emit('update:modelValue', false);
    emit('registered', res);

    if (props.demoMode) {
      setDemoStep('step1_done');
    }

    // 核心修复 BUG：明确设置 session 与 layout 为 app，确保进入公民端时展示最新移动 APP 页面
    router.push('/citizen?role=citizen&layout=app&demo=true&step=1&done=true');
  } catch (e) {
    ElMessage.error(t('register.msgRegisterFail'));
  } finally {
    registering.value = false;
  }
}

function handleClose() {
  visible.value = false;
  emit('update:modelValue', false);
}
</script>
