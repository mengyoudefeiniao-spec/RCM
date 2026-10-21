<template>
  <div
    class="font-sans text-[#1F3326] transition-all duration-300"
    :class="[
      isAppMode
        ? 'h-screen max-h-screen overflow-hidden bg-[#1B3123]/10 py-1 sm:py-2.5 justify-center items-center flex flex-col'
        : 'min-h-screen flex items-center justify-center p-4 relative overflow-hidden'
    ]"
    :style="!isAppMode ? loginBgStyle : {}"
  >
    <!-- 国际化语言切换选择器 (Web 桌面端右上角浮动) -->
    <div v-if="!isAppMode" class="absolute top-4 end-4 z-20">
      <LanguageSwitcher />
    </div>

    <!-- 背景暖砂金与翡翠墨绿光影装饰 (Web 桌面端) -->
    <template v-if="!isAppMode">
      <div class="absolute -top-32 -start-32 w-96 h-96 rounded-full bg-[#D3AF62]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -end-32 w-96 h-96 rounded-full bg-[#326445]/40 blur-3xl pointer-events-none"></div>
    </template>

    <!-- 登录主视口容器：APP 模式下自适应 Pixel 9 手机视口 (412px 宽，最大 924px 高，内部滚动)；Web 模式下居中居宽 -->
    <div
      class="w-full transition-all duration-300 relative min-h-0 bg-white"
      :class="[
        isAppMode
          ? 'sm:w-[412px] sm:max-w-[412px] sm:mx-auto sm:rounded-[28px] sm:shadow-2xl sm:overflow-hidden sm:border sm:border-[#D9E5DB] flex flex-col'
          : 'max-w-md w-full rounded-lg p-4 sm:p-8 space-y-4 sm:space-y-5 relative z-10 border border-[#D9E5DB] shadow-2xl'
      ]"
      :style="isAppMode ? { height: 'min(924px, calc(100vh - 20px))', maxHeight: 'calc(100vh - 20px)' } : { boxShadow: '0 20px 50px -10px rgba(15, 35, 29, 0.35)' }"
    >
      <!-- APP 模式手机顶部微型顶栏 (固定在手机内部顶部，含 Logo 与语言选择器) -->
      <div
        v-if="isAppMode"
        class="w-full px-3 h-12 bg-[#326445] text-white flex items-center justify-between shrink-0 shadow-xs border-b border-[#2F5B44]"
      >
        <div class="flex items-center gap-2">
          <AppLogo size="sm" />
          <span class="text-xs font-bold text-white tracking-wider">RCM</span>
        </div>
        <LanguageSwitcher />
      </div>

      <!-- 登录表单内容区域 (APP 模式在手机内部滚动) -->
      <div
        :class="[
          isAppMode
            ? 'flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 custom-pixel-scrollbar'
            : 'space-y-4 sm:space-y-5'
        ]"
      >
        <!-- 官方徽标与标题 (契合伊拉克配给卡官方体系) -->
        <div class="text-center space-y-1.5">
          <div class="flex justify-center">
            <AppLogo size="lg" theme="light" />
          </div>
          <div>
            <div class="text-xs font-bold text-[#D3AF62] font-sans" dir="rtl">البطاقة التموينية</div>
            <h2 class="text-base sm:text-lg font-bold text-[#1F3326] tracking-normal">
              Ration Card Management
            </h2>
            <div class="text-[9px] text-[#8A9A8F] font-mono tracking-wider mt-0.5">
              REPUBLIC OF IRAQ · MINISTRY OF TRADE
            </div>
          </div>
        </div>

        <!-- 新设备终端安全状态条 -->
        <div class="p-2.5 rounded-lg border flex items-center justify-between text-xs" :class="isTrustedDevice ? 'bg-[#E1F4E4] border-[#C7DED0] text-[#2F7A50]' : 'bg-[#FDF3E0] border-[#E5CEA1] text-[#7A5F21]'">
          <div class="flex items-center gap-1.5">
            <el-icon><Monitor /></el-icon>
            <span>{{ $t('login.deviceStatus') || '终端状态：' }}<strong class="font-mono">{{ isTrustedDevice ? ($t('login.trustedDevice') || '已受信任授信设备') : ($t('login.untrustedDevice') || '未授信新设备终端') }}</strong></span>
          </div>
          <el-button type="info" text size="small" @click="toggleDeviceTrust">
            {{ isTrustedDevice ? ($t('login.simulateNewDevice') || '模拟新设备') : ($t('login.restoreTrust') || '恢复授信') }}
          </el-button>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          @keyup.enter="handleLogin"
        >
          <el-form-item :label="$t('login.usernameLabel') || '配给卡号 / 手机号 / 账号'" prop="username">
            <el-input
              v-model="loginForm.username"
              :placeholder="$t('login.usernamePlaceholder') || '例如：admin 或 RC-10029381'"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item :label="$t('login.passwordLabel') || '密码'" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              :placeholder="$t('login.passwordPlaceholder') || '请输入登录密码'"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <div class="flex items-center justify-between text-xs text-[#58685D] mb-2">
            <el-checkbox v-model="rememberMe">{{ $t('login.rememberDevice') || '记住当前设备' }}</el-checkbox>
            <span class="text-[#D3AF62] font-medium cursor-pointer hover:underline" @click="quickNfcDialogVisible = true">
              {{ $t('login.nfcAuth') || '生物特征 / NFC 免密认证' }}
            </span>
          </div>

          <el-button
            type="primary"
            size="large"
            class="w-full font-bold shadow-md tracking-wide"
            style="background: #326445; border-color: #326445; color: #FFFFFF;"
            :loading="loading"
            @click="handleLogin"
          >
            {{ $t('login.loginBtn') }}
          </el-button>
        </el-form>

        <!-- 纸质配给卡数字化注册通道入口 -->
        <div class="bg-[#FDF3E0] border border-[#E5CEA1] rounded-lg p-2.5 flex items-center justify-between text-xs">
          <span class="text-[#58685D] font-medium">{{ $t('login.firstTimePaper') || '首次使用持纸质配给卡？' }}</span>
          <el-button
            type="primary"
            plain
            size="small"
            class="font-bold px-4"
            data-demo-target="btn-register"
            style="color: #326445; border-color: #D3AF62; background-color: #FDF3E0;"
            @click="handleStartRegister"
          >
            {{ $t('login.registerBtn') }}
          </el-button>
        </div>

        <!-- 国家物资配给总门户直达通道 (全场景终端跳转页面) -->
        <div
          class="rounded-lg border border-[#D3AF62]/60 bg-gradient-to-r rtl:bg-gradient-to-l from-[#FDF3E0] to-[#FDF3E0] p-2.5 flex items-center justify-between text-xs cursor-pointer hover:border-[#D3AF62] hover:shadow-2xs transition-all select-none"
          @click="$router.push('/portal')"
        >
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#D3AF62] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <el-icon :size="16"><Compass /></el-icon>
            </div>
            <div>
              <div class="font-bold text-[#326445]">{{ $t('login.portalCardTitle') || '国家食品保障总门户 (Portal)' }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ $t('login.portalCardDesc') || '跨端终端导航：公民APP · 代理APP · 管理Web' }}</div>
            </div>
          </div>
          <div class="flex items-center text-[#7A5F21] font-bold text-[11px] gap-0.5">
            <span>{{ $t('login.portalCardEnter') || '进入' }}</span>
            <el-icon class="rtl-mirror-icon"><Right /></el-icon>
          </div>
        </div>

        <!-- 快速演示预设身份与模式切换 (3个图标对应: 1.公民B2C APP模式; 2.代理C2B APP模式; 3.管理员Web模式) -->
        <div class="pt-3 border-t border-[#D9E5DB] space-y-2">
          <div class="text-[11px] text-[#8A9A8F] font-semibold text-center flex items-center justify-center gap-1">
            <span>{{ $t('login.quickPresetTitle') || '快速演示预设身份切换' }}</span>
            <span class="text-[10px] text-[#8A9A8F] font-normal">{{ $t('login.quickPresetHint') || '（点击图标切换模式）' }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <!-- 1. 公民角色登录的B2C APP模式 -->
            <div
              class="group border rounded-lg p-2 sm:p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
              :class="activeMode === 'citizen_b2c' ? 'border-[#326445] bg-[#E2F4E4] shadow-sm ring-1 ring-[#326445]/40' : 'border-[#D9E5DB] bg-[#F3F8F4] hover:border-[#326445]/60 hover:bg-[#E2F4E4]/60'"
              @click="handleSelectPreset('citizen_b2c')"
            >
              <div
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                :class="activeMode === 'citizen_b2c' ? 'bg-[#326445] text-white shadow-xs' : 'bg-[#E2F4E4] text-[#326445]'"
              >
                <el-icon :size="18"><Iphone /></el-icon>
              </div>
              <div class="text-[11px] sm:text-xs font-bold text-[#1F3326] group-hover:text-[#326445] transition-colors">
                {{ $t('login.presetCitizenRole') || '公民角色' }}
              </div>
              <div class="text-[10px] px-1 py-0.2 rounded font-medium bg-[#E1F4E4] text-[#326445]">
                {{ $t('login.presetCitizenMode') || 'B2C APP模式' }}
              </div>
            </div>

            <!-- 2. 代理登录的C2B APP模式 -->
            <div
              class="group border rounded-lg p-2 sm:p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
              :class="activeMode === 'agent_c2b' ? 'border-[#D3AF62] bg-[#FDF3E0] shadow-sm ring-1 ring-[#D3AF62]/50' : 'border-[#D9E5DB] bg-[#F3F8F4] hover:border-[#D3AF62]/60 hover:bg-[#FDF3E0]/50'"
              @click="handleSelectPreset('agent_c2b')"
            >
              <div
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                :class="activeMode === 'agent_c2b' ? 'bg-[#D3AF62] text-white shadow-xs' : 'bg-[#FDF3E0] text-[#7A5F21]'"
              >
                <el-icon :size="18"><Shop /></el-icon>
              </div>
              <div class="text-[11px] sm:text-xs font-bold text-[#1F3326] group-hover:text-[#D3AF62] transition-colors">
                {{ $t('login.presetAgentRole') || '代理角色' }}
              </div>
              <div class="text-[10px] px-1 py-0.2 rounded font-medium bg-[#FDF3E0] text-[#7A5F21]">
                {{ $t('login.presetAgentMode') || 'C2B APP模式' }}
              </div>
            </div>

            <!-- 3. 管理员角色登录的web模式 -->
            <div
              class="group border rounded-lg p-2 sm:p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
              :class="activeMode === 'admin_web' ? 'border-[#326445] bg-[#E2F4E4] shadow-sm ring-1 ring-[#326445]/40' : 'border-[#D9E5DB] bg-[#F3F8F4] hover:border-[#326445]/60 hover:bg-[#E2F4E4]/60'"
              @click="handleSelectPreset('admin_web')"
            >
              <div
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                :class="activeMode === 'admin_web' ? 'bg-[#326445] text-white shadow-xs' : 'bg-[#E2F4E4] text-[#326445]'"
              >
                <el-icon :size="18"><Monitor /></el-icon>
              </div>
              <div class="text-[11px] sm:text-xs font-bold text-[#1F3326] group-hover:text-[#326445] transition-colors">
                {{ $t('login.presetAdminRole') || '管理员' }}
              </div>
              <div class="text-[10px] px-1 py-0.2 rounded font-medium bg-[#E2F4E4] text-[#326445]">
                {{ $t('login.presetAdminMode') || 'Web模式' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
              class="border rounded-lg p-3 text-center cursor-pointer hover:border-[#D3AF62] hover:bg-[#FDF3E0]/50 transition-all space-y-1"
              @click="openRemoteVerify"
            >
              <el-icon :size="24" class="text-[#C9A13B]"><Location /></el-icon>
              <div class="text-xs font-bold text-[#1F3326]">{{ $t('login.remoteFamilyVerify') }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ $t('login.remoteGpsCheck') }}</div>
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

    <!-- 弹窗 4: 异地成员远程核验弹窗 (新设备登录使用) -->
    <RemoteVerifyDialog
      v-model="remoteVerifyDialogVisible"
      default-member-name="艾哈迈德·哈桑·萨利赫"
      @success="handleSecondaryVerifySuccess"
    />

    <!-- 弹窗 5: 快捷生物特征 / NFC 免密感应核验 -->
    <el-dialog
      v-model="quickNfcDialogVisible"
      title="统一国民卡 NFC 芯片及活体人脸核验"
      width="420px"
      align-center
    >
      <div class="text-center py-6 space-y-4">
        <div class="w-20 h-20 rounded-full bg-[#EFF5F1] text-[#326445] flex items-center justify-center mx-auto border-4 border-[#E1F4E4] animate-pulse">
          <el-icon :size="36"><Iphone /></el-icon>
        </div>
        <div>
          <div class="text-sm font-bold text-[#1F3326]">请将统一国民卡贴近设备 NFC 区域</div>
          <div class="text-xs text-[#8A9A8F] mt-1">系统将自动校验生物活体特征与内政部身份芯片存根</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="quickNfcDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="quickNfcLoading" @click="simulateQuickNfcPass">
          模拟感应核验通过
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { isEnNow } from '../../utils/langHint.js';
import { i18n } from '../../locales/index.js';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { getDefaultPathByRole } from '../../router/index.js';
import CitizenRegisterDialog from '../../components/auth/CitizenRegisterDialog.vue';
import BiometricVerifyDialog from '../../components/auth/BiometricVerifyDialog.vue';
import RemoteVerifyDialog from '../../components/auth/RemoteVerifyDialog.vue';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.vue';
import AppLogo from '../../components/common/AppLogo.vue';
import { isDemoActive, demoSubStep, setDemoStep, activateDemo, deactivateDemo } from '../../utils/demoState.js';
import {
  User,
  Lock,
  Iphone,
  Monitor,
  Shop,
  Document,
  Camera,
  Location,
  Compass,
  Right
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

const loginBgStyle = "background: radial-gradient(circle at 15% 20%, rgba(211, 175, 98, 0.16) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(211, 175, 98, 0.12) 0%, transparent 45%), linear-gradient(135deg, #12241A 0%, #326445 50%, #12241A 100%);";

const formRef = ref(null);
const loading = ref(false);
const rememberMe = ref(true);

function handleStartRegister() {
  if (isDemoActive.value) {
    setDemoStep('step1_2');
  }
  registerDialogVisible.value = true;
}

onMounted(() => {
  if (isAppMode.value) {
    loginForm.username = 'RC-10029381';
    loginForm.password = 'iq-pass-2026';
  }
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

function toggleDeviceTrust() {
  if (isTrustedDevice.value) {
    localStorage.removeItem('rcm_trusted_device');
    isTrustedDevice.value = false;
    ElMessage.warning(i18n.global.t('login.switchedToUntrusted'));
  } else {
    localStorage.setItem('rcm_trusted_device', 'true');
    isTrustedDevice.value = true;
    ElMessage.success(i18n.global.t('login.switchedToTrusted'));
  }
}

// 弹窗控制
const registerDialogVisible = ref(false);
const newDeviceVerifyDialogVisible = ref(false);
const biometricVerifyDialogVisible = ref(false);
const remoteVerifyDialogVisible = ref(false);
const quickNfcDialogVisible = ref(false);
const quickNfcLoading = ref(false);

const loginForm = reactive({
  username: 'admin',
  password: 'iq-pass-2026'
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

// 快捷演示预设切换：公民 B2C APP模式 / 代理 C2B APP模式 / 管理员 Web模式
function handleSelectPreset(mode) {
  if (mode === 'citizen_b2c') {
    loginForm.username = 'RC-10029381';
    loginForm.password = 'iq-pass-2026';
    ElMessage.success((isEnNow() ? 'Switched to the [Citizen Role Login · B2C APP Mode] preset account' : '已切换为【公民角色登录 · B2C APP模式】预设账号'));
  } else if (mode === 'agent_c2b') {
    loginForm.username = 'FA-00128';
    loginForm.password = 'iq-pass-2026';
    ElMessage.success((isEnNow() ? 'Switched to the [Agent Login · C2B APP Mode] preset account' : '已切换为【代理登录 · C2B APP模式】预设账号'));
  } else if (mode === 'admin_web') {
    // 3. 管理员角色登录的web模式（如果是手机登录，提示请切换到浏览器操作）
    if (checkIsMobile()) {
      ElMessageBox.alert(
        '管理员角色登录为 Web 模式（含审查调度总控台），仅支持在 PC 电脑端浏览器操作。检测到您当前为手机移动终端，请切换到浏览器操作！',
        '请切换到浏览器操作',
        {
          confirmButtonText: '我知道了',
          type: 'warning',
          center: true
        }
      );
      return;
    }
    loginForm.username = 'admin';
    loginForm.password = 'iq-pass-2026';
    ElMessage.success((isEnNow() ? 'Switched to the [Administrator Role Login · Web Mode] preset account' : '已切换为【管理员角色登录 · Web模式】预设账号'));
  }
}

const loginRules = {
  username: [{ required: true, message: (isEnNow() ? 'Please enter the ration card number or account' : '请输入配给卡号或账号'), trigger: 'blur' }],
  password: [{ required: true, message: (isEnNow() ? 'Please enter the password' : '请输入密码'), trigger: 'blur' }]
};

async function handleLogin() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 1. 如果管理员角色在手机端登录，阻断并提示请切换到浏览器操作
      if (isAdminAccount(loginForm.username) && checkIsMobile()) {
        ElMessageBox.alert(
          '管理员角色仅支持在 PC 电脑端浏览器操作。检测到您当前为手机移动终端，请切换到浏览器操作！',
          '请切换到浏览器操作',
          {
            confirmButtonText: '我知道了',
            type: 'warning',
            center: true
          }
        );
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
    const ok = await authStore.login(loginForm.username, loginForm.password);
    if (ok) {
      if (rememberMe.value) {
        localStorage.setItem('rcm_trusted_device', 'true');
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

function openBiometricVerify() {
  newDeviceVerifyDialogVisible.value = false;
  biometricVerifyDialogVisible.value = true;
}

function openRemoteVerify() {
  newDeviceVerifyDialogVisible.value = false;
  remoteVerifyDialogVisible.value = true;
}

// 新设备二次认证成功回调
async function handleSecondaryVerifySuccess() {
  localStorage.setItem('rcm_trusted_device', 'true');
  isTrustedDevice.value = true;
  ElMessage.success(i18n.global.t('login.newDeviceVerificationPassed'));
  executeDirectLogin();
}

async function simulateQuickNfcPass() {
  quickNfcLoading.value = true;
  setTimeout(async () => {
    quickNfcLoading.value = false;
    quickNfcDialogVisible.value = false;
    ElMessage.success((isEnNow() ? 'Unified national card NFC read succeeded; liveness face match consistent ✓' : '统一国民卡 NFC 读取成功，活体人脸比对一致 ✓'));
    await authStore.login('RC-10029381', 'iq-pass-2026');
    localStorage.setItem('rcm_trusted_device', 'true');
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
.custom-pixel-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-pixel-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(50, 100, 69, 0.2);
  border-radius: 4px;
}
.custom-pixel-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
