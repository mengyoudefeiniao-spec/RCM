<template>
  <div class="login-page">
    <div class="login-language"><LanguageSwitcher /></div>
    <main class="login-card">
      <header class="login-header">
        <h1>{{ $t('loginPage.title') }}</h1>
        <p>{{ $t('loginPage.ministry') }}</p>
      </header>
      <section class="login-content">
        <h2>{{ $t('login.accountLogin') }}</h2>
        <el-form ref="formRef" :model="loginForm" :rules="loginRules" label-position="top" @submit.prevent="handleLogin">
          <el-form-item :label="$t('loginPage.username')" prop="username">
            <el-input v-model.trim="loginForm.username" :placeholder="$t('loginPage.usernamePlaceholder')" size="large" :prefix-icon="User" clearable />
          </el-form-item>
          <el-form-item :label="$t('login.passwordLabel')" prop="password">
            <el-input v-model="loginForm.password" type="password" :placeholder="$t('login.passwordPlaceholder')" size="large" :prefix-icon="Lock" show-password />
          </el-form-item>
          <div class="login-options">
            <el-button text type="primary" @click="quickNfcDialogVisible = true">{{ $t('login.nfcAuth') }}</el-button>
          </div>
          <el-button type="primary" size="large" class="login-submit" :loading="loading" native-type="submit">{{ $t('login.loginBtn') }}</el-button>
        </el-form>
        <div class="login-register">
          <span>{{ $t('loginPage.noAccount') }}</span>
          <el-button type="primary" plain data-demo-target="btn-register" @click="handleStartRegister">{{ $t('login.registerBtn') }}</el-button>
        </div>
      </section>
    </main>

    <!-- 弹窗 1: 用户全流程注册弹窗 (OCR扫描 -> 补充公民信息 -> 人脸/远程认证) -->
    <CitizenRegisterDialog v-model="registerDialogVisible" :demo-mode="isDemoActive" />

    <!-- 弹窗 2: 新设备登录二次核验选择弹窗 (用户需求 2.2) -->
    <el-dialog
      v-model="newDeviceVerifyDialogVisible"
      :title="$t('login.newDeviceTitle')"
      width="480px"
      align-center
    >
      <div class="space-y-4">
        <div class="bg-[#FDF3E0] border border-[#F2E3C6] p-3 rounded-lg text-xs text-[#5A4718] space-y-1">
          <div class="font-bold">{{ $t('login.newDeviceDetected') }}</div>
          <p>{{ $t('login.newDeviceExplanation') }}</p>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-semibold text-[#43554B]">{{ $t('login.chooseVerificationMethod') }}</div>
          <div class="grid grid-cols-2 gap-3">
            <div
              class="border rounded-lg p-3 text-center cursor-pointer hover:border-[#5C8A6B] hover:bg-[#EFF5F1]/50 transition-all space-y-1"
              @click="openBiometricVerify"
            >
              <el-icon :size="24" class="text-[#326445]"><Camera /></el-icon>
              <div class="text-xs font-bold text-[#1F3326]">{{ $t('login.faceAndNationalCard') }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ $t('login.selfieChipMatch') }}</div>
            </div>

            <div
              class="border rounded-lg p-3 text-center opacity-60 space-y-1"
              aria-disabled="true"
            >
              <el-icon :size="24" class="text-[#C9A13B]"><Location /></el-icon>
              <div class="text-xs font-bold text-[#1F3326]">{{ $t('login.remoteFamilyVerify') }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ $t('memberVerification.unavailable') }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="newDeviceVerifyDialogVisible = false">{{ $t('login.cancel') }}</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗 3: 生物人脸活体核验弹窗 (新设备登录使用) -->
    <BiometricVerifyDialog
      v-model="biometricVerifyDialogVisible"
      :user-name="currentAccountDisplayName"
      :user-card-no="loginForm.username"
      @success="handleSecondaryVerifySuccess"
    />

    <!-- 弹窗 5: 快捷生物特征 / NFC 免密感应核验 -->
    <el-dialog
      v-model="quickNfcDialogVisible"
      :title="$t('loginPage.nfcTitle')"
      width="420px"
      align-center
    >
      <div class="text-center py-6 space-y-4">
        <div class="w-20 h-20 rounded-full bg-[#EFF5F1] text-[#326445] flex items-center justify-center mx-auto border-4 border-[#E1F4E4] animate-pulse">
          <el-icon :size="36"><Iphone /></el-icon>
        </div>
        <div>
          <div class="text-sm font-bold text-[#1F3326]">{{ $t('loginPage.nfcInstruction') }}</div>
          <div class="text-xs text-[#8A9A8F] mt-1">{{ $t('loginPage.nfcDemoNotice') }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="quickNfcDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button v-if="isMockMode" type="primary" :loading="quickNfcLoading" @click="simulateQuickNfcPass">
          {{ $t('loginPage.nfcDemoButton') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { i18n } from '../../locales/index.js';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { getDefaultPathByRole } from '../../router/index.js';
import CitizenRegisterDialog from '../../components/auth/CitizenRegisterDialog.vue';
import BiometricVerifyDialog from '../../components/auth/BiometricVerifyDialog.vue';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.vue';
import { isDemoActive, setDemoStep, activateDemo } from '../../utils/demoState.js';
import {
  User,
  Lock,
  Iphone,
  Camera,
  Location
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isAppMode = computed(() => {
  if (route.query.layout === 'app' || route.query.mode === 'mobile') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

const formRef = ref(null);
const loading = ref(false);

function handleStartRegister() {
  if (isDemoActive.value) {
    setDemoStep('step1_2');
  }
  registerDialogVisible.value = true;
}

onMounted(() => {
  if (route.query.demo === 'true') {
    activateDemo(String(route.query.demoStep || 'step1_1'));
  } else if (route.query.mode === 'register' || route.query.action === 'register') {
    registerDialogVisible.value = true;
  }
});

// 检测是否为移动端 / 手机环境
function checkIsMobile() {
  if (typeof window === 'undefined') return false;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent || ''
  );
  const isNarrowScreen = window.innerWidth <= 768;
  return isMobileUA || isNarrowScreen;
}

// 是否为管理员账号集合
function isAdminAccount(username) {
  const adminList = ['admin', 'minister_center', 'deputy_minister', 'director_planning'];
  return adminList.includes(username);
}

// 终端授信状态
const isTrustedDevice = ref(localStorage.getItem('rcm_trusted_device') === 'true');

// 弹窗控制
const registerDialogVisible = ref(false);
const newDeviceVerifyDialogVisible = ref(false);
const biometricVerifyDialogVisible = ref(false);
const quickNfcDialogVisible = ref(false);
const quickNfcLoading = ref(false);
const isMockMode = import.meta.env.VITE_APP_MOCK_MODE === 'true';

const loginForm = reactive({
  username: '',
  password: ''
});

// 当前选中的模式指示高亮
const activeMode = computed(() => {
  if (loginForm.username === 'RC-10029381') return 'citizen_b2c';
  if (loginForm.username === 'FA-00128') return 'agent_c2b';
  if (isAdminAccount(loginForm.username)) return 'admin_web';
  return '';
});

// 当前展示的人员姓名（供二次生物核验时友好展示）
const currentAccountDisplayName = computed(() => {
  if (loginForm.username === 'admin' || loginForm.username === 'minister_center') {
    return '阿卜杜勒·拉赫曼 (配给中心部长)';
  }
  if (loginForm.username === 'deputy_minister') {
    return '法鲁克·卡西姆 (行政次长)';
  }
  if (loginForm.username === 'director_planning') {
    return '塔里克·萨利赫 (规划总干事)';
  }
  if (loginForm.username === 'FA-00128') {
    return '穆罕默德·贾巴尔 (代销网点负责人)';
  }
  if (loginForm.username === 'RC-10029381') {
    return '艾哈迈德·哈桑·萨利赫 (配给卡户主)';
  }
  return loginForm.username || '配给申请人';
});

const loginRules = computed(() => ({
  username: [{ required: true, message: i18n.global.t('loginPage.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: i18n.global.t('loginPage.passwordRequired'), trigger: 'blur' }]
}));

async function handleLogin() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 1. 如果管理员角色在手机端登录，阻断并提示请切换到浏览器操作
      if (isAdminAccount(loginForm.username) && checkIsMobile()) {
        ElMessageBox.alert(
          i18n.global.t('loginPage.adminDesktopOnly'),
          i18n.global.t('loginPage.desktopTitle'),
          {
            confirmButtonText: i18n.global.t('common.confirm'),
            type: 'warning',
            center: true
          }
        );
        return;
      }

      // New demo accounts must reach the first-login identity gate before the older device flow.
      if (import.meta.env.VITE_APP_MOCK_MODE === 'true') {
        const accounts = JSON.parse(sessionStorage.getItem('rcm_demo_registrations') || '[]');
        if (accounts.some(account => account.phone === loginForm.username || account.nationalId === loginForm.username)) {
          await executeDirectLogin();
          return;
        }
      }

      // 2. 判断是否为未授信新设备终端：强制触发二次身份认证核验 (修复之前直接进入系统的Bug)
      if (!isTrustedDevice.value) {
        newDeviceVerifyDialogVisible.value = true;
        return;
      }

      // 3. 已授信终端，直接登录
      executeDirectLogin();
    }
  });
}

async function executeDirectLogin() {
  loading.value = true;
  try {
    const ok = await authStore.login(loginForm.username, loginForm.password);
    if (ok) {
      localStorage.setItem('rcm_trusted_device', 'true');
      isTrustedDevice.value = true;
      // 根据选中的预设演示身份自动重定向至适配视口
      if (activeMode.value === 'agent_c2b' || (isAppMode.value && authStore.currentRole === 'agent')) {
        router.push('/dashboard?role=agent&mode=mobile&layout=app');
      } else if (activeMode.value === 'citizen_b2c' || (isAppMode.value && authStore.currentRole === 'citizen')) {
        router.push('/citizen?role=citizen&layout=app');
      } else if (activeMode.value === 'admin_web') {
        router.push('/dashboard?role=admin&mode=overview&layout=web');
      } else {
        const target = getDefaultPathByRole(authStore.currentRole);
        if (isAppMode.value) {
          router.push({ path: target, query: { layout: 'app' } });
        } else {
          router.push(target);
        }
      }
    }
  } finally {
    loading.value = false;
  }
}

function openBiometricVerify() {
  newDeviceVerifyDialogVisible.value = false;
  biometricVerifyDialogVisible.value = true;
}

// 新设备二次认证成功回调
async function handleSecondaryVerifySuccess() {
  ElMessage.success(i18n.global.t('login.newDeviceVerificationPassed'));
  executeDirectLogin();
}

async function simulateQuickNfcPass() {
  quickNfcLoading.value = true;
  setTimeout(async () => {
    quickNfcLoading.value = false;
    quickNfcDialogVisible.value = false;
    const ok = await authStore.login('RC-10029381', 'iq-pass-2026');
    if (!ok) return;
    ElMessage.success(i18n.global.t('loginPage.nfcDemoSuccess'));
    localStorage.setItem('rcm_trusted_device', 'true');
    isTrustedDevice.value = true;
    if (isAppMode.value) {
      router.push('/citizen?role=citizen&layout=app');
    } else {
      const target = getDefaultPathByRole(authStore.currentRole);
      router.push(target);
    }
  }, 600);
}
</script>

<style scoped>
.login-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 80px 20px 40px; background: radial-gradient(circle at 12% 12%, #526b4b 0, transparent 35%), linear-gradient(145deg, #12241a, #234b35); position: relative; }
.login-language { position: absolute; top: 20px; inset-inline-end: 20px; z-index: 2; }
.login-card { width: min(100%, 460px); overflow: hidden; border-radius: 18px; background: #fff; box-shadow: 0 24px 64px #091b1180; }
.login-header { padding: 36px 32px 30px; text-align: center; color: #fff; background: linear-gradient(140deg, #1b3928, #326445); }
.login-header h1 { font-size: 1.55rem; line-height: 1.3; font-weight: 700; }
.login-header p { margin-top: 10px; color: #e4d0a5; font-size: .75rem; line-height: 1.6; }
.login-content { padding: 32px; }
.login-content h2 { color: #1f3326; font-size: 1.05rem; font-weight: 700; margin-bottom: 24px; }
.login-options { display: flex; justify-content: flex-end; margin: -5px 0 14px; }
.login-submit { width: 100%; font-weight: 700; }
.login-register { margin-top: 28px; padding-top: 22px; border-top: 1px solid #e5ede7; display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #58685d; font-size: .875rem; }
@media (max-width: 480px) { .login-page { padding: 70px 16px 24px; } .login-header { padding: 30px 24px 26px; } .login-content { padding: 26px 24px; } }
</style>
