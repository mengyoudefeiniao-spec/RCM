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
      <div class="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-icon class="text-blue-600"><Camera /></el-icon>
          <span>{{ $t('register.ocrAutoOnPrefix') }}<strong>{{ $t('register.ocrAutoOnHighlight') }}</strong>{{ $t('register.ocrAutoOnSuffix') }}</span>
        </div>
        <el-tag size="small" type="success" effect="dark" class="font-mono">OCR ACTIVE</el-tag>
      </div>

      <div :class="isCompact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'">
        <!-- 左侧：拍照/上传纸质旧卡区域 -->
        <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-amber-400">{{ $t('register.captureTitle') }}</span>
            <span class="text-[10px] text-slate-400 font-mono">AUTOSCAN · READY</span>
          </div>

          <!-- 演示引导指示说明框 (步骤 01-2: 拍照上传) -->
          <div v-if="demoMode && demoSubStep === 'step1_2'" class="animate-fadeIn">
            <DemoGuideTooltip
              step-badge="全流程演示 · 步骤 01-2"
            >
              请点击下方「拍照上传」按钮，扫描纸质旧卡并触发自动 OCR 存根比对
            </DemoGuideTooltip>
          </div>

          <!-- 模拟取景器 / 上传预览卡片 -->
          <div
            class="aspect-4/3 rounded-lg border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center p-3 cursor-pointer"
            :class="[
              hasUploadedPhoto ? 'border-emerald-500 bg-amber-950/40 text-amber-200' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-blue-500 hover:bg-slate-900',
              demoMode && demoSubStep === 'step1_2' ? 'ring-2 ring-[#C59D5F] border-[#C59D5F]' : ''
            ]"
            @click="triggerPhotoCapture"
          >
            <!-- 正在扫描激光束动效 -->
            <div v-if="scanning" class="absolute inset-x-0 h-1 bg-emerald-400/90 shadow-[0_0_14px_#34d399] animate-pulse top-1/2 z-20"></div>

            <div v-if="hasUploadedPhoto" class="w-full h-full flex flex-col justify-between font-mono text-[10px] relative z-10">
              <div class="flex justify-between border-b border-amber-800/40 pb-1">
                <span>بطاقة التموين (1994)</span>
                <span class="text-emerald-400 font-bold">{{ $t('register.capturedImage') }}</span>
              </div>
              <div class="space-y-1 my-auto">
                <div>{{ $t('register.cardNoShortLabel') }} <strong class="text-white">IQ-P-1994-082194</strong></div>
                <div>{{ $t('register.holderLabel') }} <strong class="text-white">{{ $t('register.defaultUserName') }}</strong></div>
                <div>{{ $t('register.registeredPopLabel') }} <strong class="text-white">{{ $t('register.registeredPopValue', { count: 5 }) }}</strong></div>
              </div>
              <div class="text-[9px] text-amber-400/80 border-t border-amber-800/40 pt-1 flex justify-between">
                <span>MINISTRY OF TRADE</span>
                <span>{{ $t('register.stubSealOk') }}</span>
              </div>
            </div>

            <div v-else class="text-center space-y-2 py-4">
              <div class="w-12 h-12 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center mx-auto">
                <el-icon :size="24"><Camera /></el-icon>
              </div>
              <div class="text-xs font-bold text-slate-200">{{ $t('register.clickCapture') }}</div>
              <div class="text-[10px] text-slate-500">{{ $t('register.autoOcrHint') }}</div>
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
              class="w-full font-bold transition-all"
              :class="{ 'demo-target-highlight': demoMode && demoSubStep === 'step1_2' }"
              @click="triggerPhotoCapture"
            >
              <el-icon class="mr-1"><Camera /></el-icon>
              {{ hasUploadedPhoto ? $t('register.retakeBtn') : $t('register.captureBtn') }}
            </el-button>
            <el-button size="small" type="info" plain class="w-full" :disabled="scanning" @click="triggerTestInvalidCard">
              {{ $t('register.simulateInvalid') }}
            </el-button>
          </div>
        </div>

        <!-- 右侧：自动 OCR 识别与有效性校验状态卡 -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-xs font-bold text-slate-800">{{ $t('register.ocrCompareTitle') }}</span>
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
              <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5">
                <el-icon class="text-emerald-600"><CircleCheckFilled /></el-icon>
                <span>{{ $t('register.validBanner') }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">{{ $t('register.labelPaperCardNo') }}</span>
                <span class="font-mono font-bold text-slate-800">{{ ocrData.paperCardNo }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">{{ $t('register.labelLegalHead') }}</span>
                <span class="font-bold text-slate-800">{{ ocrData.headName }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">{{ $t('register.labelRegion') }}</span>
                <span class="text-slate-700">{{ ocrData.province }} {{ ocrData.district }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">{{ $t('register.labelApprovedPop') }}</span>
                <span class="font-bold text-blue-600">{{ $t('register.approvedPopValue', { count: ocrData.memberCount }) }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">{{ $t('register.labelStubCheck') }}</span>
                <span class="text-emerald-600 font-bold">{{ $t('register.stubValidResult') }}</span>
              </div>
            </div>

            <!-- 校验失败阻断提示 -->
            <div v-else-if="ocrExtracted && !isValidCard" class="mt-3 space-y-2 text-xs">
              <div class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-1.5">
                <el-icon class="text-rose-600"><CircleCloseFilled /></el-icon>
                <span>{{ $t('register.invalidBanner') }}</span>
              </div>
              <p class="text-rose-700 leading-relaxed text-[11px]">
                {{ validationNotice || $t('register.invalidDefaultNotice') }}
              </p>
            </div>

            <!-- 初始待上传状态 -->
            <div v-else class="h-32 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
              <el-icon :size="28" class="text-slate-300"><Picture /></el-icon>
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
          <el-form-item :label="$t('register.headNameLabel')" required class="relative">
            <!-- 演示引导说明框 (步骤 01-3: 输入户主姓名，点击即可自动填入) -->
            <div v-if="demoMode && demoSubStep === 'step1_3'" class="mb-1 w-full animate-fadeIn">
              <DemoGuideTooltip
                step-badge="全流程演示 · 步骤 01-3"
              >
                请点击下方「户主姓名」输入框（无需键盘打字，点击自动输入就绪）
              </DemoGuideTooltip>
            </div>

            <div
              class="w-full cursor-pointer transition-all"
              :class="{ 'demo-target-highlight rounded-lg': demoMode && demoSubStep === 'step1_3' }"
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
            <el-input v-model="registerForm.nationalId" :placeholder="$t('register.nidPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('register.memberCountLabel')">
            <el-input-number v-model="registerForm.memberCount" :min="1" :max="15" class="w-full" />
          </el-form-item>
        </div>

        <div :class="isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'">
          <el-form-item :label="$t('register.phoneLabel')" required>
            <el-input v-model="registerForm.phone" placeholder="+964 780 123 4567" />
          </el-form-item>

          <el-form-item :label="$t('register.smsLabel')" required class="relative">
            <!-- 演示引导说明框 (步骤 01-4: 获取验证码) -->
            <div v-if="demoMode && demoSubStep === 'step1_4'" class="mb-1 w-full animate-fadeIn">
              <DemoGuideTooltip
                step-badge="全流程演示 · 步骤 01-4"
              >
                请点击下方「获取验证码」按钮，发送安全短信核验码
              </DemoGuideTooltip>
            </div>

            <div class="flex gap-2 w-full">
              <el-input v-model="registerForm.smsCode" :placeholder="$t('register.smsPlaceholder')" maxlength="6" class="font-mono" />
              <el-button
                type="primary"
                plain
                :disabled="smsCountdown > 0"
                class="font-bold transition-all shrink-0"
                :class="{ 'demo-target-highlight': demoMode && demoSubStep === 'step1_4' }"
                @click="handleDemoSendSms"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s` : $t('register.getSmsCode') }}
              </el-button>
            </div>
          </el-form-item>
        </div>

        <!-- 模拟收到的短信提示框 -->
        <div v-if="simulatedSmsCode" class="space-y-1.5">
          <!-- 演示引导说明框 (步骤 01-5: 一键填入) -->
          <div v-if="demoMode && demoSubStep === 'step1_5'" class="animate-fadeIn">
            <DemoGuideTooltip
              step-badge="全流程演示 · 步骤 01-5"
            >
              请点击下方「一键填入」按钮，自动录入短信验证码
            </DemoGuideTooltip>
          </div>

          <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <span>{{ $t('register.smsReceived') }}<strong class="font-mono text-emerald-700 text-sm">{{ simulatedSmsCode }}</strong></span>
            <el-button
              type="success"
              size="small"
              class="font-bold transition-all"
              :class="{ 'demo-target-highlight': demoMode && demoSubStep === 'step1_5' }"
              @click="handleDemoFillSms"
            >
              {{ $t('register.fillIn') }}
            </el-button>
          </div>
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

      <div class="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-2">
        <el-button @click="currentStep = 0">{{ $t('register.backPrev') }}</el-button>

        <div class="flex flex-col items-end gap-1.5 w-full sm:w-auto">
          <!-- 演示引导说明框 (步骤 01-6: 选择身份认证方式) -->
          <div v-if="demoMode && demoSubStep === 'step1_6'" class="w-full sm:w-auto animate-fadeIn">
            <DemoGuideTooltip
              step-badge="全流程演示 · 步骤 01-6"
            >
              信息补录已就绪，请点击「选择身份认证方式」按钮继续
            </DemoGuideTooltip>
          </div>

          <el-button
            type="primary"
            class="font-bold transition-all w-full sm:w-auto"
            :class="{ 'demo-target-highlight': demoMode && demoSubStep === 'step1_6' }"
            @click="handleDemoProceedToVerify"
          >
            {{ $t('register.nextChooseAuth') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 步骤 3: 人脸认证 / 远程验证 -->
    <!-- ======================================================== -->
    <div v-else class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-800 space-y-1">
        <div class="font-bold">{{ $t('register.finalBannerTitle') }}</div>
        <p>{{ $t('register.finalBannerDesc') }}</p>
      </div>

      <div :class="isCompact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'">
        <!-- 方式 A: 人脸自拍与统一国民卡比对 -->
        <div class="border rounded-xl p-4 space-y-3 bg-slate-50 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 text-sm">{{ $t('register.methodATitle') }}</span>
              <el-tag v-if="biometricPassed" size="small" type="success">{{ $t('register.passedTag') }}</el-tag>
            </div>
            <p class="text-xs text-slate-500">
              {{ $t('register.methodADesc') }}
            </p>
          </div>

          <!-- 演示引导说明框 (步骤 01-7: 立即启动人脸与国民卡核验) -->
          <div v-if="demoMode && demoSubStep === 'step1_7'" class="animate-fadeIn">
            <DemoGuideTooltip
              step-badge="全流程演示 · 步骤 01-7"
            >
              请点击下方「立即启动人脸与国民卡核验」按钮
            </DemoGuideTooltip>
          </div>

          <el-button
            type="primary"
            :plain="!biometricPassed"
            class="font-bold transition-all"
            :class="{ 'demo-target-highlight': demoMode && demoSubStep === 'step1_7' }"
            @click="handleDemoStartBiometric"
          >
            {{ biometricPassed ? $t('register.biometricBtnRedo') : $t('register.biometricBtn') }}
          </el-button>
        </div>

        <!-- 方式 B: 异地成员远程邀请验证 -->
        <div class="border rounded-xl p-4 space-y-3 bg-slate-50 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 text-sm">{{ $t('register.methodBTitle') }}</span>
              <el-tag v-if="remotePassed" size="small" type="success">{{ $t('register.passedTag') }}</el-tag>
            </div>
            <p class="text-xs text-slate-500">
              {{ $t('register.methodBDesc') }}
            </p>
          </div>

          <el-button type="warning" :plain="!remotePassed" @click="showRemoteModal = true">
            {{ remotePassed ? $t('register.remoteBtnRedo') : $t('register.remoteBtn') }}
          </el-button>
        </div>
      </div>

      <!-- 最终提交按钮 -->
      <div class="pt-4 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
        <el-button @click="currentStep = 1">{{ $t('register.backPrev') }}</el-button>

        <div class="flex flex-col items-end gap-1.5 w-full sm:w-auto">
          <!-- 演示引导说明框 (步骤 01-9: 完成注册并签发电子配给卡) -->
          <div v-if="demoMode && demoSubStep === 'step1_9'" class="w-full sm:w-auto animate-fadeIn">
            <DemoGuideTooltip
              step-badge="全流程演示 · 步骤 01-9"
            >
              所有核验已通过！请点击「完成注册并签发电子配给卡」
            </DemoGuideTooltip>
          </div>

          <el-button
            type="success"
            size="large"
            class="font-bold shadow-md transition-all w-full sm:w-auto"
            :class="{ 'demo-target-highlight': demoMode && demoSubStep === 'step1_9' }"
            :disabled="!biometricPassed && !remotePassed"
            :loading="registering"
            @click="handleCompleteRegistration"
          >
            {{ $t('register.finishBtn') }}
          </el-button>
        </div>
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
import DemoGuideTooltip from '../common/DemoGuideTooltip.vue';
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
    registerForm.headName = '艾哈迈德·哈桑·拉希德';
    if (!registerForm.nationalId) registerForm.nationalId = 'IQ-1980-0419-8271';
    if (!registerForm.phone) registerForm.phone = '+964 780 123 4567';
    ElMessage.success('户主姓名输入完成：艾哈迈德·哈桑·拉希德');
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
    if (!registerForm.headName) registerForm.headName = '艾哈迈德·哈桑·拉希德';
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
    setDemoStep('step1_8');
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
