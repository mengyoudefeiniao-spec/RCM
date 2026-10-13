<template>
  <el-dialog
    :model-value="modelValue"
    :title="null"
    width="540px"
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="paymentStatus !== 'processing'"
    class="electronic-payment-dialog"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <div class="p-2 sm:p-4 space-y-4">
      <!-- 顶部：国家财政与中央银行安全网关标识 -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <el-icon :size="18"><CreditCard /></el-icon>
          </div>
          <div>
            <div class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{{ $t('payment.title') || '统一在线安全支付网关' }}</span>
              <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono">
                CBI-PAY
              </el-tag>
            </div>
            <div class="text-[11px] text-slate-400">
              中央银行规费在线直接清算系统 · SSL 256-bit 加密
            </div>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-slate-400 block">支付有效倒计时</span>
          <span class="font-mono text-xs font-bold text-amber-600">{{ countdownFormatted }}</span>
        </div>
      </div>

      <!-- 待支付状态 (Pending) -->
      <div v-if="paymentStatus === 'pending'" class="space-y-4">
        <!-- 账单金额卡片 -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs space-y-3">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>{{ title || '法定业务公文规费缴交' }}</span>
            <span class="font-mono text-[11px]">单号: {{ orderId }}</span>
          </div>

          <div class="flex items-baseline justify-between">
            <div class="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              {{ amount.toLocaleString() }} <span class="text-sm text-slate-300 font-normal">{{ currency }}</span>
            </div>
            <el-tag size="small" type="warning" effect="dark">
              待扣款
            </el-tag>
          </div>

          <div class="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300 flex flex-wrap justify-between gap-y-1">
            <span>缴费卡号：<strong class="font-mono text-white">{{ businessNo || 'RC-10029381' }}</strong></span>
            <span>申报户主：<strong class="text-white">{{ applicantName || '持卡公民' }}</strong></span>
          </div>
        </div>

        <!-- 扣款渠道账户选择 -->
        <div class="space-y-1.5">
          <div class="text-xs font-medium text-slate-600">选择扣款资金账户：</div>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="ch in channels"
              :key="ch.id"
              type="button"
              class="p-2 rounded-xl border text-xs text-center transition-all cursor-pointer flex flex-col items-center gap-1"
              :class="
                selectedChannel === ch.id
                  ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
              "
              @click="selectedChannel = ch.id"
            >
              <span class="text-base">{{ ch.icon }}</span>
              <span class="text-[11px]">{{ ch.name }}</span>
            </button>
          </div>
        </div>

        <!-- 真实在线支付核身验证方式 Tab 切换 (密码 / 指纹 / 刷脸) -->
        <div class="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <el-icon class="text-emerald-600"><Lock /></el-icon>
              <span>选择在线支付验证方式</span>
            </span>
            <div class="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
                :class="verifyMode === 'pin' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                @click="switchVerifyMode('pin')"
              >
                密码支付
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
                :class="verifyMode === 'fingerprint' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                @click="switchVerifyMode('fingerprint')"
              >
                指纹验证
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
                :class="verifyMode === 'face' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                @click="switchVerifyMode('face')"
              >
                刷脸支付
              </button>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- 验证模式 1: 输入 6 位安全支付密码 (PIN 码) -->
          <!-- ======================================================== -->
          <div v-if="verifyMode === 'pin'" class="space-y-4 py-1">
            <div class="text-center space-y-1">
              <div class="text-xs font-semibold text-slate-700">请输入 6 位数字支付密码</div>
              <div class="text-[11px] text-slate-400">已启用国家清算中心防按键劫持键盘</div>
            </div>

            <!-- 6 个独立方格输入框展示 (暗文圆点) -->
            <div class="flex justify-center gap-2 sm:gap-3 py-1">
              <div
                v-for="idx in 6"
                :key="idx"
                class="w-10 h-12 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center transition-all text-xl font-bold font-mono"
                :class="
                  pinCode.length >= idx
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-700'
                    : pinCode.length === idx - 1
                    ? 'border-indigo-500 bg-white ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white'
                "
              >
                <span v-if="pinCode.length >= idx" class="w-3 h-3 rounded-full bg-slate-800"></span>
                <span v-else-if="pinCode.length === idx - 1" class="w-0.5 h-5 bg-indigo-500 animate-pulse"></span>
              </div>
            </div>

            <!-- 虚拟防窥数字安全小键盘 -->
            <div class="max-w-xs mx-auto grid grid-cols-3 gap-2 pt-1">
              <button
                v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
                :key="num"
                type="button"
                class="h-10 rounded-xl bg-white border border-slate-200 font-bold font-mono text-base text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                @click="handleInputPin(num)"
              >
                {{ num }}
              </button>
              <button
                type="button"
                class="h-10 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                @click="pinCode = ''"
              >
                清空
              </button>
              <button
                type="button"
                class="h-10 rounded-xl bg-white border border-slate-200 font-bold font-mono text-base text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                @click="handleInputPin(0)"
              >
                0
              </button>
              <button
                type="button"
                class="h-10 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                @click="handleDeletePin"
              >
                <el-icon><Back /></el-icon>
              </button>
            </div>

            <div class="flex items-center justify-between text-[11px] pt-1">
              <span class="text-slate-400">支持直接输入物理数字键</span>
              <el-button type="primary" link size="small" @click="handleFastFillPin">
                一键填入默认支付密码 (666888)
              </el-button>
            </div>

            <el-button
              type="success"
              size="large"
              class="w-full font-bold shadow-md bg-emerald-600 border-emerald-600 hover:bg-emerald-500"
              :disabled="pinCode.length < 6"
              @click="handleSubmitPinPay"
            >
              <el-icon class="mr-1.5"><Lock /></el-icon>
              确认支付 {{ amount.toLocaleString() }} {{ currency }}
            </el-button>
          </div>

          <!-- ======================================================== -->
          <!-- 验证模式 2: 生物指纹核身支付 (Touch ID) -->
          <!-- ======================================================== -->
          <div v-else-if="verifyMode === 'fingerprint'" class="space-y-4 py-3 text-center">
            <div class="space-y-1">
              <div class="text-xs font-semibold text-slate-800">轻触或长按指纹传感器</div>
              <div class="text-[11px] text-slate-400">调用设备安全芯片生物认证 · 免密极速扣款</div>
            </div>

            <!-- 指纹感应高科技传感器按钮 -->
            <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
              <!-- 外圈呼吸光环 -->
              <div
                class="absolute inset-0 rounded-full border-2 transition-all duration-700"
                :class="fingerScanning ? 'border-emerald-400 shadow-[0_0_20px_#10b981] animate-ping' : 'border-emerald-200'"
              ></div>

              <!-- 指纹按钮核心 -->
              <button
                type="button"
                class="relative w-24 h-24 rounded-full bg-gradient-to-b from-slate-900 to-slate-950 text-emerald-400 flex flex-col items-center justify-center shadow-lg border border-slate-700 cursor-pointer hover:border-emerald-400 transition-all active:scale-95 group overflow-hidden"
                @click="triggerFingerprintScan"
              >
                <!-- 动态激光波纹 (扫描时) -->
                <div
                  v-if="fingerScanning"
                  class="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#34d399] animate-scan-finger top-0"
                ></div>

                <!-- 指纹 SVG 图案 -->
                <svg
                  class="w-12 h-12 transition-transform duration-300"
                  :class="fingerScanning ? 'scale-110 text-emerald-300' : 'group-hover:scale-105'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                  <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                  <path d="M2 12a10 10 0 0 1 18-6" />
                  <path d="M2 16h.01" />
                  <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                  <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                  <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                  <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                </svg>

                <span class="text-[10px] font-mono text-emerald-300/80 mt-1">
                  {{ fingerScanning ? '读取比对中...' : 'TOUCH ID' }}
                </span>
              </button>
            </div>

            <div class="text-xs text-slate-500">
              <span v-if="fingerScanning" class="text-emerald-600 font-bold flex items-center justify-center gap-1.5">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在校验生物指纹哈希令牌...</span>
              </span>
              <span v-else class="text-slate-400">
                点击上方传感器模拟指纹按下识别
              </span>
            </div>

            <el-button
              type="primary"
              size="large"
              class="w-full font-bold shadow-md bg-emerald-600 border-emerald-600 hover:bg-emerald-500"
              :loading="fingerScanning"
              @click="triggerFingerprintScan"
            >
              感应指纹并完成支付
            </el-button>
          </div>

          <!-- ======================================================== -->
          <!-- 验证模式 3: 摄像头识别人脸 (Face ID 刷脸扣款) -->
          <!-- ======================================================== -->
          <div v-else-if="verifyMode === 'face'" class="space-y-4 py-2 text-center">
            <div class="space-y-1">
              <div class="text-xs font-semibold text-slate-800">注视屏幕进行 Face ID 刷脸支付</div>
              <div class="text-[11px] text-slate-400">由国家身份中心生物数字证书提供免密支付验签</div>
            </div>

            <!-- 微型刷脸取景扫描圆框 -->
            <div class="relative w-32 h-32 mx-auto rounded-full bg-slate-900 border-2 border-indigo-400/80 overflow-hidden flex items-center justify-center shadow-lg">
              <!-- 激光环绕光环 -->
              <div
                class="absolute inset-0 rounded-full border-2 border-indigo-400/30"
                :class="faceScanning ? 'border-t-emerald-400 animate-spin shadow-[0_0_15px_#34d399]' : ''"
              ></div>

              <!-- 仿真面孔剪影 -->
              <div class="text-indigo-400/80 flex flex-col items-center">
                <el-icon :size="48"><User /></el-icon>
                <div class="text-[9px] font-mono text-indigo-300 mt-1">
                  {{ faceScanning ? 'SCANNING' : 'FACE ID' }}
                </div>
              </div>

              <!-- 扫描对齐光标 -->
              <div
                v-if="faceScanning"
                class="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-scan-face top-0"
              ></div>
            </div>

            <div class="text-xs text-slate-500">
              <span v-if="faceScanning" class="text-emerald-600 font-bold flex items-center justify-center gap-1.5">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在匹配央行面部支付授权证书...</span>
              </span>
              <span v-else class="text-slate-400">
                请正对摄像头，确认为【{{ applicantName || '持卡人' }}】本人
              </span>
            </div>

            <el-button
              type="primary"
              size="large"
              class="w-full font-bold shadow-md bg-indigo-600 border-indigo-600 hover:bg-indigo-500"
              :loading="faceScanning"
              @click="triggerFacePayScan"
            >
              <el-icon class="mr-1.5"><Camera /></el-icon>
              立即刷脸验证并扣款
            </el-button>
          </div>
        </div>

        <!-- 返回取消按钮 -->
        <div class="flex items-center justify-end pt-1">
          <el-button size="default" @click="handleCancel">
            返回修改申请资料
          </el-button>
        </div>
      </div>

      <!-- 支付处理中 (Processing) -->
      <div v-else-if="paymentStatus === 'processing'" class="py-12 flex flex-col items-center justify-center space-y-4">
        <div class="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin flex items-center justify-center shadow-md" />
        <div class="text-center space-y-1">
          <h3 class="text-base font-bold text-slate-800">正在与中央银行规费清算网络安全清算...</h3>
          <p class="text-xs text-slate-400 font-mono">
            Channel: {{ currentChannelName }} · Verify: {{ currentVerifyLabel }} · Order: {{ orderId }}
          </p>
        </div>
      </div>

      <!-- 支付成功 (Success) -->
      <div v-else-if="paymentStatus === 'success'" class="py-8 flex flex-col items-center justify-center space-y-4 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
          <el-icon :size="36"><CircleCheckFilled /></el-icon>
        </div>

        <div class="space-y-1">
          <h3 class="text-lg font-bold text-slate-900">电子支付扣款成功！</h3>
          <p class="text-xs text-emerald-700 font-medium">CBI E-Payment Clearance Verified · 国库已入账</p>
          <div class="font-mono text-xs text-slate-400 mt-2">
            TXN-{{ successTxnNo || '883921' }}-IQD ({{ currentVerifyLabel }})
          </div>
        </div>

        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 max-w-sm">
          规费已全额扣缴入国库配给专户，正在将您的业务正式提交系统核验与流转...
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  CreditCard,
  Lock,
  User,
  Camera,
  Back,
  CircleCheckFilled,
  Loading
} from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '法定业务公文规费'
  },
  amount: {
    type: Number,
    default: 5000
  },
  currency: {
    type: String,
    default: 'IQD'
  },
  businessNo: {
    type: String,
    default: ''
  },
  applicantName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'success', 'cancel']);

const paymentStatus = ref('pending'); // 'pending' | 'processing' | 'success'
const selectedChannel = ref('qi_card');
const orderId = ref('');
const countdown = ref(900); // 15分钟
let timer = null;

// 验证方式模式: 'pin' | 'fingerprint' | 'face'
const verifyMode = ref('pin');
const pinCode = ref('');
const fingerScanning = ref(false);
const faceScanning = ref(false);
const successTxnNo = ref('');

const channels = [
  { id: 'qi_card', name: 'Qi Card (万事达)', icon: '💳' },
  { id: 'zain_cash', name: 'ZainCash 钱包', icon: '📱' },
  { id: 'cbi_switch', name: 'Switch 银联通道', icon: '🏦' }
];

const currentChannelName = computed(() => {
  return channels.find((c) => c.id === selectedChannel.value)?.name || '电子钱包';
});

const currentVerifyLabel = computed(() => {
  if (verifyMode.value === 'pin') return 'PIN密码安全扣款';
  if (verifyMode.value === 'fingerprint') return '生物指纹免密扣款';
  if (verifyMode.value === 'face') return 'Face ID 刷脸支付';
  return '在线安全扣款';
});

const countdownFormatted = computed(() => {
  const m = Math.floor(countdown.value / 60);
  const s = countdown.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      paymentStatus.value = 'pending';
      orderId.value = `PAY-${Date.now().toString().slice(-8)}`;
      countdown.value = 900;
      pinCode.value = '';
      fingerScanning.value = false;
      faceScanning.value = false;
      startTimer();
      window.addEventListener('keydown', handleGlobalKeydown);
    } else {
      stopTimer();
      window.removeEventListener('keydown', handleGlobalKeydown);
    }
  }
);

onUnmounted(() => {
  stopTimer();
  window.removeEventListener('keydown', handleGlobalKeydown);
});

function switchVerifyMode(mode) {
  verifyMode.value = mode;
  pinCode.value = '';
  fingerScanning.value = false;
  faceScanning.value = false;
}

// 物理键盘数字监听 (仅在 PIN 模式下)
function handleGlobalKeydown(e) {
  if (!props.modelValue || paymentStatus.value !== 'pending' || verifyMode.value !== 'pin') return;
  if (/^[0-9]$/.test(e.key)) {
    handleInputPin(Number(e.key));
  } else if (e.key === 'Backspace') {
    handleDeletePin();
  }
}

function handleInputPin(num) {
  if (pinCode.value.length < 6) {
    pinCode.value += num.toString();
    if (pinCode.value.length === 6) {
      // 输满 6 位自动提交
      setTimeout(() => {
        handleSubmitPinPay();
      }, 300);
    }
  }
}

function handleDeletePin() {
  if (pinCode.value.length > 0) {
    pinCode.value = pinCode.value.slice(0, -1);
  }
}

function handleFastFillPin() {
  pinCode.value = '666888';
  setTimeout(() => {
    handleSubmitPinPay();
  }, 200);
}

// 提交密码支付
function handleSubmitPinPay() {
  if (pinCode.value.length < 6) {
    ElMessage.warning('请输入完整的 6 位支付密码');
    return;
  }
  executePaymentProcess('pin');
}

// 模拟生物指纹支付
function triggerFingerprintScan() {
  if (fingerScanning.value) return;
  fingerScanning.value = true;
  setTimeout(() => {
    fingerScanning.value = false;
    executePaymentProcess('fingerprint');
  }, 900);
}

// 模拟摄像头刷脸支付
function triggerFacePayScan() {
  if (faceScanning.value) return;
  faceScanning.value = true;
  setTimeout(() => {
    faceScanning.value = false;
    executePaymentProcess('face');
  }, 1000);
}

// 统一执行在线扣款流水
function executePaymentProcess(method) {
  paymentStatus.value = 'processing';
  successTxnNo.value = Math.floor(100000 + Math.random() * 900000).toString();

  setTimeout(() => {
    paymentStatus.value = 'success';
    ElMessage.success(`扣款成功！已通过【${currentVerifyLabel.value}】完成缴费`);

    setTimeout(() => {
      stopTimer();
      emit('update:modelValue', false);
      emit('success', {
        orderId: orderId.value,
        amount: props.amount,
        currency: props.currency,
        channel: currentChannelName.value,
        verifyMethod: currentVerifyLabel.value,
        paidAt: new Date().toISOString()
      });
    }, 1200);
  }, 1100);
}

function startTimer() {
  stopTimer();
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function handleCancel() {
  stopTimer();
  emit('update:modelValue', false);
  emit('cancel');
}
</script>

<style scoped>
@keyframes scanFingerAnimation {
  0% {
    top: 0%;
    opacity: 0.8;
  }
  50% {
    top: 90%;
    opacity: 1;
  }
  100% {
    top: 0%;
    opacity: 0.8;
  }
}

.animate-scan-finger {
  animation: scanFingerAnimation 1.4s ease-in-out infinite;
}

@keyframes scanFaceAnimation {
  0% {
    top: 5%;
    opacity: 0.8;
  }
  50% {
    top: 90%;
    opacity: 1;
  }
  100% {
    top: 5%;
    opacity: 0.8;
  }
}

.animate-scan-face {
  animation: scanFaceAnimation 1.6s ease-in-out infinite;
}
</style>
