<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- 背景光影装饰 -->
    <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>

    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10 border border-slate-100">
      <!-- 官方徽标与标题 -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
          RC
        </div>
        <h2 class="text-xl font-bold text-slate-900">国家数字配给卡综合服务平台</h2>
        <p class="text-xs text-slate-500 font-mono">
          REPUBLIC OF IRAQ · MINISTRY OF TRADE
        </p>
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

        <div class="flex items-center justify-between text-xs text-slate-500 mb-4">
          <el-checkbox v-model="rememberMe">记住当前设备</el-checkbox>
          <span class="text-blue-600 cursor-pointer hover:underline" @click="biometricDialogVisible = true">
            生物特征 / NFC 免密认证
          </span>
        </div>

        <el-button
          type="primary"
          size="large"
          class="w-full font-bold shadow-md"
          :loading="loading"
          @click="handleLogin"
        >
          立即登录系统
        </el-button>
      </el-form>

      <!-- 快速演示通道 -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <div class="text-[11px] text-slate-400 font-semibold text-center">
          快速演示预设身份切换：
        </div>
        <div class="grid grid-cols-3 gap-2">
          <el-button size="small" plain @click="fillPreset('admin')">
            督察官 (Admin)
          </el-button>
          <el-button size="small" plain @click="fillPreset('citizen')">
            公民户主
          </el-button>
          <el-button size="small" plain @click="fillPreset('agent')">
            代销代理
          </el-button>
        </div>
      </div>
    </div>

    <!-- 模拟生物特征/NFC读取弹窗 -->
    <el-dialog
      v-model="biometricDialogVisible"
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
        <el-button @click="biometricDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="biometricLoading" @click="simulateBiometricPass">
          模拟感应核验通过
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { User, Lock, Iphone } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref(null);
const loading = ref(false);
const rememberMe = ref(true);
const biometricDialogVisible = ref(false);
const biometricLoading = ref(false);

const loginForm = reactive({
  username: 'admin',
  password: 'iq-pass-2026'
});

const loginRules = {
  username: [{ required: true, message: '请输入配给卡号或账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function handleLogin() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const ok = await authStore.login(loginForm.username, loginForm.password);
        if (ok) {
          router.push('/dashboard');
        }
      } finally {
        loading.value = false;
      }
    }
  });
}

function fillPreset(role) {
  if (role === 'admin') {
    loginForm.username = 'admin';
    loginForm.password = 'iq-pass-2026';
  } else if (role === 'citizen') {
    loginForm.username = 'RC-10029381';
    loginForm.password = 'iq-pass-2026';
  } else if (role === 'agent') {
    loginForm.username = 'FA-00128';
    loginForm.password = 'iq-pass-2026';
  }
}

async function simulateBiometricPass() {
  biometricLoading.value = true;
  setTimeout(async () => {
    biometricLoading.value = false;
    biometricDialogVisible.value = false;
    ElMessage.success('统一国民卡 NFC 读取成功，活体人脸比对一致 ✓');
    await authStore.login('RC-10029381', 'iq-pass-2026');
    router.push('/dashboard');
  }, 600);
}
</script>
