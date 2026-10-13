<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- 国际化语言切换选择器 (右上角浮动) -->
    <div class="absolute top-4 right-4 z-20">
      <LanguageSwitcher />
    </div>

    <!-- 背景光影装饰 -->
    <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>

    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-5 relative z-10 border border-slate-100">
      <!-- 官方徽标与标题 -->
      <div class="text-center space-y-2">
        <div class="flex justify-center">
          <AppLogo size="lg" theme="light" />
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{{ $t('login.title') }}</h2>
          <p class="text-xs text-blue-600 font-medium mt-0.5">{{ $t('login.subtitle') }}</p>
          <p class="text-[10px] text-slate-400 font-mono tracking-wider mt-1">
            REPUBLIC OF IRAQ · MINISTRY OF TRADE
          </p>
        </div>
      </div>

      <!-- 新设备终端安全状态条 -->
      <div class="p-2.5 rounded-xl border flex items-center justify-between text-xs" :class="isTrustedDevice ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'">
        <div class="flex items-center gap-1.5">
          <el-icon><Monitor /></el-icon>
          <span>终端状态：<strong class="font-mono">{{ isTrustedDevice ? '已受信任授信设备' : '未授信新设备终端' }}</strong></span>
        </div>
        <el-button type="info" text size="small" @click="toggleDeviceTrust">
          {{ isTrustedDevice ? '模拟新设备' : '恢复授信' }}
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
        <el-form-item label="配给卡号 / 手机号 / 账号" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="例如：admin 或 RC-10029381"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入登录密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
          <el-checkbox v-model="rememberMe">记住当前设备</el-checkbox>
          <span class="text-blue-600 cursor-pointer hover:underline" @click="quickNfcDialogVisible = true">
            生物特征 / NFC 免密认证
          </span>
        </div>

        <el-button
          type="primary"
          size="large"
          class="w-full font-bold shadow-md tracking-wide"
          :loading="loading"
          @click="handleLogin"
        >
          {{ $t('login.loginBtn') }}
        </el-button>
      </el-form>

      <!-- 纸质配给卡数字化注册通道入口 -->
      <div class="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
        <span class="text-slate-600 font-medium">首次使用持纸质配给卡？</span>
        <el-button
          type="primary"
          plain
          size="small"
          class="font-bold px-4"
          @click="registerDialogVisible = true"
        >
          {{ $t('login.registerBtn') }}
        </el-button>
      </div>

      <!-- 快速演示预设身份与模式切换 (3个图标对应: 1.公民B2C APP模式; 2.代理C2B APP模式; 3.管理员Web模式) -->
      <div class="pt-3 border-t border-slate-100 space-y-2">
        <div class="text-[11px] text-slate-400 font-semibold text-center flex items-center justify-center gap-1">
          <span>快速演示预设身份切换</span>
          <span class="text-[10px] text-slate-400 font-normal">（点击图标切换模式）</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <!-- 1. 公民角色登录的B2C APP模式 -->
          <div
            class="group border rounded-xl p-2 sm:p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
            :class="activeMode === 'citizen_b2c' ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-400/50' : 'border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/30'"
            @click="handleSelectPreset('citizen_b2c')"
          >
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              :class="activeMode === 'citizen_b2c' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-100 text-blue-600'"
            >
              <el-icon :size="18"><Iphone /></el-icon>
            </div>
            <div class="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              公民角色
            </div>
            <div class="text-[10px] px-1 py-0.2 rounded font-medium bg-blue-100/70 text-blue-700">
              B2C APP模式
            </div>
          </div>

          <!-- 2. 代理登录的C2B APP模式 -->
          <div
            class="group border rounded-xl p-2 sm:p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
            :class="activeMode === 'agent_c2b' ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-400/50' : 'border-slate-200 bg-slate-50/60 hover:border-amber-400 hover:bg-amber-50/30'"
            @click="handleSelectPreset('agent_c2b')"
          >
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              :class="activeMode === 'agent_c2b' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-100 text-amber-600'"
            >
              <el-icon :size="18"><Shop /></el-icon>
            </div>
            <div class="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
              代理角色
            </div>
            <div class="text-[10px] px-1 py-0.2 rounded font-medium bg-amber-100/70 text-amber-700">
              C2B APP模式
            </div>
          </div>

          <!-- 3. 管理员角色登录的web模式 -->
          <div
            class="group border rounded-xl p-2 sm:p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
            :class="activeMode === 'admin_web' ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-400/50' : 'border-slate-200 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/30'"
            @click="handleSelectPreset('admin_web')"
          >
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              :class="activeMode === 'admin_web' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-100 text-indigo-600'"
            >
              <el-icon :size="18"><Monitor /></el-icon>
            </div>
            <div class="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              管理员
            </div>
            <div class="text-[10px] px-1 py-0.2 rounded font-medium bg-indigo-100/70 text-indigo-700">
              Web模式
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 1: 用户全流程注册弹窗 (OCR扫描 -> 补充公民信息 -> 人脸/远程认证) -->
    <CitizenRegisterDialog v-model="registerDialogVisible" />

    <!-- 弹窗 2: 新设备登录二次核验选择弹窗 (用户需求 2.2) -->
    <el-dialog
      v-model="newDeviceVerifyDialogVisible"
      title="新设备安全登录二次身份核验"
      width="480px"
      align-center
    >
      <div class="space-y-4">
        <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1">
          <div class="font-bold">检测到未授信新设备终端接入</div>
          <p>
            依据《国家配给安全与反冒领条例》，新终端首次登录已注册账户，必须执行二次身份核验以绑定设备硬件指纹。
          </p>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-semibold text-slate-700">请选择二次身份核验方式：</div>
          <div class="grid grid-cols-2 gap-3">
            <div
              class="border rounded-xl p-3 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all space-y-1"
              @click="openBiometricVerify"
            >
              <el-icon :size="24" class="text-blue-600"><Camera /></el-icon>
              <div class="text-xs font-bold text-slate-800">人脸与国民卡核验</div>
              <div class="text-[10px] text-slate-400">现场自拍与芯片对碰</div>
            </div>

            <div
              class="border rounded-xl p-3 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all space-y-1"
              @click="openRemoteVerify"
            >
              <el-icon :size="24" class="text-amber-600"><Location /></el-icon>
              <div class="text-xs font-bold text-slate-800">异地成员远程核验</div>
              <div class="text-[10px] text-slate-400">异地手机 GPS 核查</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="newDeviceVerifyDialogVisible = false">取消</el-button>
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
        <div class="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border-4 border-blue-100 animate-pulse">
          <el-icon :size="36"><Iphone /></el-icon>
        </div>
        <div>
          <div class="text-sm font-bold text-slate-800">请将统一国民卡贴近设备 NFC 区域</div>
          <div class="text-xs text-slate-400 mt-1">系统将自动校验生物活体特征与内政部身份芯片存根</div>
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
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { getDefaultPathByRole } from '../../router/index.js';
import CitizenRegisterDialog from '../../components/auth/CitizenRegisterDialog.vue';
import BiometricVerifyDialog from '../../components/auth/BiometricVerifyDialog.vue';
import RemoteVerifyDialog from '../../components/auth/RemoteVerifyDialog.vue';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.vue';
import AppLogo from '../../components/common/AppLogo.vue';
import {
  User,
  Lock,
  Iphone,
  Monitor,
  Shop,
  Document,
  Camera,
  Location
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref(null);
const loading = ref(false);
const rememberMe = ref(true);

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
    ElMessage.warning('已切换为【未授信新设备】状态，登录时将强制触发二次身份认证！');
  } else {
    localStorage.setItem('rcm_trusted_device', 'true');
    isTrustedDevice.value = true;
    ElMessage.success('已切换为【已授信设备】状态');
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
    ElMessage.success('已切换为【公民角色登录 · B2C APP模式】预设账号');
  } else if (mode === 'agent_c2b') {
    loginForm.username = 'FA-00128';
    loginForm.password = 'iq-pass-2026';
    ElMessage.success('已切换为【代理登录 · C2B APP模式】预设账号');
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
    ElMessage.success('已切换为【管理员角色登录 · Web模式】预设账号');
  }
}

const loginRules = {
  username: [{ required: true, message: '请输入配给卡号或账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
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
      const target = getDefaultPathByRole(authStore.currentRole);
      router.push(target);
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
  ElMessage.success('新设备身份认证通过，已将本终端加入授信白名单！');
  executeDirectLogin();
}

async function simulateQuickNfcPass() {
  quickNfcLoading.value = true;
  setTimeout(async () => {
    quickNfcLoading.value = false;
    quickNfcDialogVisible.value = false;
    ElMessage.success('统一国民卡 NFC 读取成功，活体人脸比对一致 ✓');
    await authStore.login('RC-10029381', 'iq-pass-2026');
    localStorage.setItem('rcm_trusted_device', 'true');
    const target = getDefaultPathByRole(authStore.currentRole);
    router.push(target);
  }, 600);
}
</script>
