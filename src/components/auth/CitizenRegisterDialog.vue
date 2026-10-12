<template>
  <el-dialog
    v-model="visible"
    title="纸质配给卡数字化升级与新公民户主注册"
    width="680px"
    align-center
    :before-close="handleClose"
  >
    <!-- 步骤进度指示条 (Element Plus el-steps) -->
    <el-steps :active="currentStep" finish-status="success" simple class="mb-5">
      <el-step title="纸质卡 OCR 识别" :icon="Document" />
      <el-step title="补充公民信息" :icon="Edit" />
      <el-step title="人脸 / 远程验证" :icon="Check" />
    </el-steps>

    <!-- ======================================================== -->
    <!-- 步骤 1: 上传纸质配给卡 OCR 自动识别 -->
    <!-- ======================================================== -->
    <div v-if="currentStep === 0" class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 space-y-1">
        <div class="font-bold flex items-center gap-1.5">
          <el-icon><InfoFilled /></el-icon>
          <span>纸质配给卡换发数字化电子卡指南</span>
        </div>
        <p>请上传现持有之伊拉克贸易部历史纸质家庭配给卡正面照片，系统将启动 OCR 视觉模型自动识别存根档案。</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 左侧：纸卡预览与模拟上传 -->
        <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-amber-400">历史纸质配给卡存根</span>
            <el-tag size="small" type="warning" effect="dark">旧卡样本</el-tag>
          </div>

          <!-- 模拟纸质旧卡 -->
          <div class="aspect-4/3 rounded-lg bg-amber-950/40 border border-amber-800/60 p-3 flex flex-col justify-between text-amber-200 font-mono text-[10px] relative overflow-hidden">
            <!-- OCR 扫描光束动效 -->
            <div v-if="scanning" class="absolute inset-x-0 h-1 bg-emerald-400/80 shadow-[0_0_12px_#34d399] animate-pulse top-1/2"></div>

            <div class="flex justify-between border-b border-amber-800/40 pb-1">
              <span>بطاقة التموين الغذائية (1994)</span>
              <span>BAGHDAD</span>
            </div>
            <div class="space-y-1 my-auto">
              <div>纸质编号: <strong class="text-white">IQ-P-1994-082194</strong></div>
              <div>户主姓名: <strong class="text-white">艾哈迈德·哈桑·萨利赫</strong></div>
              <div>保障人口: <strong class="text-white">5 人 (全额配发)</strong></div>
              <div>配发分部: <strong>卡尔赫第一代销所 (BAG-01)</strong></div>
            </div>
            <div class="text-[9px] text-amber-400/80 border-t border-amber-800/40 pt-1 flex justify-between">
              <span>MINISTRY OF TRADE</span>
              <span>STAMP: VERIFIED</span>
            </div>
          </div>

          <div class="flex gap-2">
            <el-button size="small" type="primary" plain class="w-full" :loading="scanning" @click="handleRunOcr">
              {{ scanning ? '正在光学解析识别...' : '启动智能 OCR 识别' }}
            </el-button>
          </div>
        </div>

        <!-- 右侧：OCR 提取数据预览卡 -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-xs font-bold text-slate-800">OCR 结构化识别结果</span>
              <el-tag v-if="ocrExtracted" size="small" type="success">匹配度 98.5%</el-tag>
              <el-tag v-else size="small" type="info">待识别</el-tag>
            </div>

            <div v-if="ocrExtracted" class="mt-3 space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">纸质配给卡编号:</span>
                <span class="font-mono font-bold text-slate-800">{{ ocrData.paperCardNo }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">法定户主姓名:</span>
                <span class="font-bold text-slate-800">{{ ocrData.headName }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">行政省份 / 区域:</span>
                <span class="text-slate-700">{{ ocrData.province }} {{ ocrData.district }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">在册核准人数:</span>
                <span class="font-bold text-blue-600">{{ ocrData.memberCount }} 人</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">内政部底账状态:</span>
                <span class="text-emerald-600 font-bold">存根有效无重卡记录 ✓</span>
              </div>
            </div>

            <div v-else class="h-32 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
              <el-icon :size="28"><Document /></el-icon>
              <span>点击左侧按钮启动 OCR 扫描识别</span>
            </div>
          </div>

          <el-button
            type="primary"
            class="w-full font-bold"
            :disabled="!ocrExtracted"
            @click="currentStep = 1"
          >
            下一步：补充公民身份信息
          </el-button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 步骤 2: 补充公民信息注册 -->
    <!-- ======================================================== -->
    <div v-else-if="currentStep === 1" class="space-y-4">
      <el-form label-position="top" :model="registerForm" class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <el-form-item label="户主姓名 (OCR自动载入)" required>
            <el-input v-model="registerForm.headName" disabled />
          </el-form-item>
          <el-form-item label="纸质卡编号 (存根绑定)" required>
            <el-input v-model="registerForm.paperCardNo" disabled class="font-mono" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <el-form-item label="统一国民卡身份证号 (NID)" required>
            <el-input v-model="registerForm.nationalId" placeholder="例如：IQ-1980-0419-8271" />
          </el-form-item>
          <el-form-item label="保障人口数">
            <el-input-number v-model="registerForm.memberCount" :min="1" :max="15" class="w-full" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <el-form-item label="手机号码 (接收配给通知)" required>
            <el-input v-model="registerForm.phone" placeholder="+964 780 123 4567" />
          </el-form-item>

          <el-form-item label="短信验证码" required>
            <div class="flex gap-2 w-full">
              <el-input v-model="registerForm.smsCode" placeholder="6 位验证码" maxlength="6" class="font-mono" />
              <el-button type="primary" plain :disabled="smsCountdown > 0" @click="handleSendSms">
                {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </div>

        <!-- 模拟收到的短信提示框 -->
        <div v-if="simulatedSmsCode" class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>收到短信验证码：<strong class="font-mono text-emerald-700 text-sm">{{ simulatedSmsCode }}</strong></span>
          <el-button type="success" size="small" text @click="registerForm.smsCode = simulatedSmsCode">
            一键填入
          </el-button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <el-form-item label="设置登录密码" required>
            <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="确认登录密码" required>
            <el-input v-model="registerForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
          </el-form-item>
        </div>
      </el-form>

      <div class="flex items-center justify-between pt-2">
        <el-button @click="currentStep = 0">返回上一步</el-button>
        <el-button type="primary" @click="handleProceedToVerify">
          下一步：选择身份认证方式
        </el-button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 步骤 3: 人脸认证 / 远程验证 -->
    <!-- ======================================================== -->
    <div v-else class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-800 space-y-1">
        <div class="font-bold">最后一步：完成安全法定身份核验</div>
        <p>为防止冒领套取国家战略面粉与食油，需完成人脸活体认证或异地成员远程核验，验证通过后系统将即时签发新电子配给卡！</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- 方式 A: 人脸自拍与统一国民卡比对 -->
        <div class="border rounded-xl p-4 space-y-3 bg-slate-50 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 text-sm">方式 A: 本地人脸活体认证</span>
              <el-tag v-if="biometricPassed" size="small" type="success">已通过 ✓</el-tag>
            </div>
            <p class="text-xs text-slate-500">
              适合户主本人在场，通过终端摄像头采集人脸活体与统一国民卡双因子对碰。
            </p>
          </div>

          <el-button type="primary" :plain="!biometricPassed" @click="showBiometricModal = true">
            {{ biometricPassed ? '重新进行人脸比对' : '立即启动人脸与国民卡核验' }}
          </el-button>
        </div>

        <!-- 方式 B: 异地成员远程邀请验证 -->
        <div class="border rounded-xl p-4 space-y-3 bg-slate-50 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 text-sm">方式 B: 异地家庭成员远程核验</span>
              <el-tag v-if="remotePassed" size="small" type="success">已通过 ✓</el-tag>
            </div>
            <p class="text-xs text-slate-500">
              适合成员异地求学/工作，生成邀请码通过手机端 GPS 基站位置进行远程合法性核验。
            </p>
          </div>

          <el-button type="warning" :plain="!remotePassed" @click="showRemoteModal = true">
            {{ remotePassed ? '重新进行远程核验' : '启动异地成员远程核验' }}
          </el-button>
        </div>
      </div>

      <!-- 最终提交按钮 -->
      <div class="pt-4 flex items-center justify-between">
        <el-button @click="currentStep = 1">返回上一步</el-button>
        <el-button
          type="success"
          size="large"
          class="font-bold shadow-md"
          :disabled="!biometricPassed && !remotePassed"
          :loading="registering"
          @click="handleCompleteRegistration"
        >
          完成注册并签发电子配给卡
        </el-button>
      </div>
    </div>

    <!-- 子弹窗：人脸活体核验 -->
    <BiometricVerifyDialog
      v-model="showBiometricModal"
      :user-name="registerForm.headName"
      user-card-no="NEW-REGISTER"
      @success="onBiometricSuccess"
    />

    <!-- 子弹窗：异地成员远程核验 -->
    <RemoteVerifyDialog
      v-model="showRemoteModal"
      default-member-name="扎伊德·艾哈迈德·萨利赫"
      @success="onRemoteSuccess"
    />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { ocrScanPaperCard, sendSmsCode, registerCitizen } from '../../api/auth.js';
import { ElMessage } from 'element-plus';
import BiometricVerifyDialog from './BiometricVerifyDialog.vue';
import RemoteVerifyDialog from './RemoteVerifyDialog.vue';
import {
  Document,
  Edit,
  Check,
  InfoFilled
} from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'registered']);

const router = useRouter();
const authStore = useAuthStore();

const visible = ref(props.modelValue);
watch(() => props.modelValue, (val) => { visible.value = val; });

const currentStep = ref(0);

// 步骤 1: OCR 识别
const scanning = ref(false);
const ocrExtracted = ref(false);
const ocrData = reactive({
  paperCardNo: '',
  headName: '',
  province: '',
  district: '',
  memberCount: 5
});

async function handleRunOcr() {
  scanning.value = true;
  try {
    const res = await ocrScanPaperCard();
    Object.assign(ocrData, res);
    ocrExtracted.value = true;
    // 同步到步骤 2 表单
    registerForm.headName = res.headName;
    registerForm.paperCardNo = res.paperCardNo;
    registerForm.province = res.province;
    registerForm.district = res.district;
    registerForm.memberCount = res.memberCount;
    ElMessage.success('纸质配给卡内政部存根 OCR 解析匹配成功！');
  } catch (e) {
    ElMessage.error('OCR 扫描失败');
  } finally {
    scanning.value = false;
  }
}

// 步骤 2: 补充公民信息
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

async function handleSendSms() {
  if (!registerForm.phone) {
    ElMessage.warning('请输入手机号码');
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
    ElMessage.success('短信验证码已发送');
  } catch (e) {
    ElMessage.error('发送验证码失败');
  }
}

function handleProceedToVerify() {
  if (!registerForm.nationalId || !registerForm.phone || !registerForm.smsCode) {
    ElMessage.warning('请完整填写国民身份证号、手机号及短信验证码');
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次密码输入不一致');
    return;
  }
  currentStep.value = 2;
}

// 步骤 3: 认证与开户
const showBiometricModal = ref(false);
const showRemoteModal = ref(false);
const biometricPassed = ref(false);
const remotePassed = ref(false);
const registering = ref(false);

function onBiometricSuccess() {
  biometricPassed.value = true;
  ElMessage.success('已完成人脸活体与国民卡防伪芯片核验 ✓');
}

function onRemoteSuccess() {
  remotePassed.value = true;
  ElMessage.success('已完成异地成员远程地理位置核查 ✓');
}

async function handleCompleteRegistration() {
  registering.value = true;
  try {
    const res = await registerCitizen({
      ...registerForm,
      biometricVerified: biometricPassed.value,
      remoteVerified: remotePassed.value
    });

    ElMessage.success(res.message || '注册成功！已为您签发新电子配给卡');

    // 自动登录到系统
    authStore.token = res.token;
    authStore.userProfile = res.user;
    localStorage.setItem('rcm_auth_token', res.token);
    localStorage.setItem('rcm_user_profile', JSON.stringify(res.user));
    // 标记当前设备为受信任设备
    localStorage.setItem('rcm_trusted_device', 'true');

    visible.value = false;
    emit('update:modelValue', false);
    emit('registered', res);

    router.push('/citizen');
  } catch (e) {
    ElMessage.error('注册建档提交失败');
  } finally {
    registering.value = false;
  }
}

function handleClose() {
  visible.value = false;
  emit('update:modelValue', false);
}
</script>
