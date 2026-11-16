<template>
  <div class="login-page" :class="{ 'login-app-mode': isAppMode }">
    <div v-if="!isAppMode" class="login-language"><LanguageSwitcher /></div>
    <main class="login-viewport">
      <div v-if="isAppMode" class="login-app-toolbar"><LanguageSwitcher /></div>
      <div class="login-scroll-content">
        <header class="login-header">
          <div class="flex justify-center"><AppLogo :size="112" theme="light" /></div>
          <h1>{{ $t('loginPage.title') }}</h1>
          <p>{{ $t('loginPage.ministry') }}</p>
        </header>
        <section class="login-content">
          <el-form ref="formRef" :model="loginForm" :rules="loginRules" label-position="top" @submit.prevent="handleLogin">
            <el-form-item :label="loginIdentifierLabel" prop="username">
              <el-input v-model.trim="loginForm.username" :placeholder="loginIdentifierPlaceholder" size="large" :prefix-icon="User" clearable />
            </el-form-item>
            <el-form-item :label="$t('login.passwordLabel')" prop="password">
              <el-input v-model="loginForm.password" type="password" :placeholder="$t('login.passwordPlaceholder')" size="large" :prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" size="large" class="login-submit" :loading="loading" native-type="submit">{{ $t('login.loginBtn') }}</el-button>
          </el-form>
          <div class="login-register">
            <span>{{ isAgentLogin ? $t('agentAuth.noAccount') : $t('loginPage.noAccount') }}</span>
            <el-button type="primary" plain data-demo-target="btn-register" @click="handleStartRegister">
              {{ isAgentLogin ? $t('agentAuth.registerEntry') : $t('login.registerBtn') }}
            </el-button>
          </div>
          <div class="login-register login-forgot">
            <span>{{ $t('forgotPassword.entry') }}</span>
            <el-button type="primary" plain @click="forgotDialogVisible = true">{{ $t('forgotPassword.open') }}</el-button>
          </div>
          <!-- Browser preview uses separate URLs; packaged apps never show the other role's entry. -->
          <div v-if="!isPackagedApp" class="login-alt-entry">
            <router-link :to="isAgentLogin ? { path: '/login', query: { layout: 'web' } } : { path: '/login/agent', query: { layout: 'web' } }">
              {{ isAgentLogin ? $t('agentAuth.citizenEntry') : $t('agentAuth.agentEntry') }}
            </router-link>
          </div>
        </section>
      </div>
    </main>

    <!-- 弹窗 0: 短信验证码找回登录密码 -->
    <ForgotPasswordDialog v-model="forgotDialogVisible" @done="handlePasswordReset" />

    <!-- 弹窗 1: 公民注册向导 (卡片类型 -> OCR 识别 -> 配给中心与代理 -> 身份与账户验证) -->
    <CitizenRegisterDialog v-model="registerDialogVisible" :demo-mode="isDemoActive" @registered="handleRegistered" />
    <IdentityVerifyDialog
      v-if="authStore.pendingIdentityVerification && !authStore.pendingIdentityVerification.agentNo"
      v-model="firstLoginVerifyVisible"
      :verification="authStore.pendingIdentityVerification"
      @success="handleFirstLoginVerified"
      @cancel="authStore.pendingIdentityVerification = null"
    />

    <!-- 代理注册向导 (Company Branch + Agent NO -> NFC 芯片 -> 人脸活体 -> 手机与密码) -->
    <AgentRegisterDialog v-model="agentRegisterDialogVisible" @registered="handleAgentRegistered" />
    <AgentIdentityVerifyDialog
      v-if="authStore.pendingIdentityVerification?.agentNo"
      v-model="agentVerifyVisible"
      :verification="authStore.pendingIdentityVerification"
      @success="handleAgentFirstLoginVerified"
      @cancel="authStore.pendingIdentityVerification = null"
    />

    <!-- 弹窗 2: 新设备登录二次核验选择弹窗 (用户需求 2.2) -->
    <el-dialog
      v-model="newDeviceVerifyDialogVisible"
      :title="$t('login.newDeviceTitle')"
      width="min(480px, calc(100vw - 32px))"
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

  </div>
</template>

<script setup>
import { i18n } from '../../locales/index.js';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { getDefaultPathByRole } from '../../router/index.js';
import CitizenRegisterDialog from '../../components/auth/CitizenRegisterDialog.vue';
import AgentRegisterDialog from '../../components/auth/AgentRegisterDialog.vue';
import ForgotPasswordDialog from '../../components/auth/ForgotPasswordDialog.vue';
import IdentityVerifyDialog from '../../components/auth/IdentityVerifyDialog.vue';
import AgentIdentityVerifyDialog from '../../components/auth/AgentIdentityVerifyDialog.vue';
import BiometricVerifyDialog from '../../components/auth/BiometricVerifyDialog.vue';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.vue';
import AppLogo from '../../components/common/AppLogo.vue';
import { isDemoActive, setDemoStep, activateDemo } from '../../utils/demoState.js';
import { resolveAppRole, isDedicatedApp } from '../../utils/appRole.js';
import {
  User,
  Lock,
  Camera,
  Location
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();
const isMockMode = import.meta.env.VITE_APP_MOCK_MODE === 'true';

// The role is fixed by the APK flavor; browser previews use dedicated routes.
// There is no in-page switch between citizen and agent login/registration.
const isPackagedApp = isDedicatedApp();
const activeLoginRole = computed(() => resolveAppRole(route) || 'citizen');
const isAgentLogin = computed(() => activeLoginRole.value === 'agent');
const loginIdentifierLabel = computed(() => isAgentLogin.value ? t('agentAuth.loginIdentifier') : t('loginPage.username'));
const loginIdentifierPlaceholder = computed(() => isAgentLogin.value ? t('agentAuth.loginIdentifierPlaceholder') : t('loginPage.usernamePlaceholder'));

const isAppMode = computed(() => {
  if (route.query.layout === 'app' || route.query.mode === 'mobile') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

const formRef = ref(null);
const loading = ref(false);

function handleStartRegister() {
  if (isAgentLogin.value) {
    agentRegisterDialogVisible.value = true;
    return;
  }
  if (isDemoActive.value) {
    setDemoStep('step1_2');
  }
  registerDialogVisible.value = true;
}

function handleAgentRegistered(result) {
  loginForm.username = result?.agentNo || result?.username || '';
  loginForm.password = '';
}

onMounted(() => {
  if (route.query.demo === 'true') {
    activateDemo(String(route.query.demoStep || 'step1_1'));
  } else if (route.query.mode === 'register' || route.query.action === 'register') {
    if (activeLoginRole.value === 'agent') agentRegisterDialogVisible.value = true;
    else registerDialogVisible.value = true;
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
const agentRegisterDialogVisible = ref(false);
const forgotDialogVisible = ref(false);
const firstLoginVerifyVisible = ref(false);
const agentVerifyVisible = ref(false);
const newDeviceVerifyDialogVisible = ref(false);
const biometricVerifyDialogVisible = ref(false);

const loginForm = reactive({
  username: isMockMode ? (isAgentLogin.value ? 'FA-00128' : 'RC-10029381') : '',
  password: isMockMode ? 'iq-pass-2026' : ''
});

function handleRegistered(result) {
  loginForm.username = result.username;
  loginForm.password = '';
}

function handlePasswordReset(result) {
  loginForm.username = result.identifier;
  loginForm.password = '';
}

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
  if (!formRef.value || loading.value) return;
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

      // Shared citizen accounts must authenticate before the first-login identity gate is selected.
      if (isMockMode && !isAdminAccount(loginForm.username) && loginForm.username !== 'FA-00128') {
        await executeDirectLogin();
        return;
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
    const ok = await authStore.login(loginForm.username, loginForm.password, { role: activeLoginRole.value });
    if (!ok && authStore.pendingIdentityVerification) {
      if (authStore.pendingIdentityVerification.agentNo) agentVerifyVisible.value = true;
      else firstLoginVerifyVisible.value = true;
      return;
    }
    if (ok) {
      localStorage.setItem('rcm_trusted_device', 'true');
      isTrustedDevice.value = true;
      if (authStore.userProfile?.needsFamilySetup) {
        await router.push({ path: '/citizen', query: isAppMode.value ? { layout: 'app' } : {} });
        return;
      }
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

async function handleFirstLoginVerified(result) {
  authStore.completeIdentityLogin(result);
  firstLoginVerifyVisible.value = false;
  localStorage.setItem('rcm_trusted_device', 'true');
  isTrustedDevice.value = true;
  ElMessage.success(i18n.global.t('firstLoginVerification.success'));
  await router.push({ path: '/citizen', query: isAppMode.value ? { layout: 'app' } : {} });
}

async function handleAgentFirstLoginVerified(result) {
  authStore.completeIdentityLogin(result);
  agentVerifyVisible.value = false;
  localStorage.setItem('rcm_trusted_device', 'true');
  isTrustedDevice.value = true;
  ElMessage.success(t('agentAuth.loginSuccess'));
  await router.push(isAppMode.value
    ? { path: '/dashboard', query: { role: 'agent', mode: 'mobile', layout: 'app' } }
    : { path: '/dashboard' });
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

</script>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 40px;
  background: radial-gradient(circle at 15% 20%, #d3af6229, transparent 45%),
    linear-gradient(135deg, #12241a, #326445 50%, #12241a);
  position: relative;
}
.login-language {
  position: absolute;
  top: 16px;
  inset-inline-end: 16px;
  z-index: 2;
}
.login-viewport {
  width: min(100%, 448px);
  min-height: 0;
  border: 1px solid #d9e5db;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 20px 50px -10px #0f231d59;
}
.login-scroll-content { padding: 32px; }
.login-header { margin-bottom: 40px; text-align: center; }
.login-header h1 {
  margin-top: 12px;
  color: #1f3326;
  font-size: 1.125rem;
  line-height: 1.5;
  font-weight: 700;
}
.login-header p {
  margin-top: 4px;
  color: #8a9a8f;
  font-size: .7rem;
  line-height: 1.6;
}
.login-alt-entry {
  margin-top: 16px;
  text-align: center;
  font-size: .75rem;
}
.login-alt-entry a {
  color: #326445;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid #d3af62;
  padding-bottom: 2px;
}
.login-alt-entry a:hover { color: #244c34; }
.login-alt-entry a:focus-visible { outline: 2px solid #d3af62; outline-offset: 3px; }
.login-content :deep(.el-form-item) { margin-bottom: 24px; }
.login-content :deep(.el-form-item__error) {
  position: static;
  flex-basis: 100%;
  padding-top: 6px;
  line-height: 1.4;
}
.login-submit { width: 100%; margin-top: 8px; font-weight: 700; }
.login-register {
  margin-top: 32px;
  padding: 12px;
  border: 1px solid #e5cea1;
  border-radius: 8px;
  background: #fdf3e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  color: #58685d;
  font-size: .75rem;
}
.login-forgot { margin-top: 12px; }
.login-app-mode {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  padding: 10px 0;
  background: #1b31231a;
}
.login-app-mode .login-viewport {
  display: flex;
  flex-direction: column;
  width: 412px;
  max-width: 100%;
  height: min(924px, calc(100dvh - 20px));
  max-height: calc(100dvh - 20px);
  border-radius: 28px;
  overflow: hidden;
}
.login-app-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
  height: 48px;
  padding-inline: 12px;
  background: #326445;
  border-bottom: 1px solid #2f5b44;
}
.login-app-mode .login-scroll-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 32px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #32644533 transparent;
}
.login-app-mode .login-scroll-content::before,
.login-app-mode .login-scroll-content::after {
  content: '';
}
.login-app-mode .login-scroll-content::before { flex: 1 0 0; }
.login-app-mode .login-scroll-content::after { flex: 2 0 0; }
.login-app-mode .login-header {
  flex-shrink: 0;
}
.login-app-mode .login-content {
  flex-shrink: 0;
}
@media (max-width: 639px) {
  .login-scroll-content { padding: 24px 16px; }
  .login-app-mode { padding-block: 4px; }
  .login-app-mode .login-viewport {
    width: 100%;
    height: min(924px, calc(100dvh - 8px));
    max-height: calc(100dvh - 8px);
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
