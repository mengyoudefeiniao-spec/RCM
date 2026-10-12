<template>
  <el-dialog
    :model-value="modelValue"
    :title="null"
    width="520px"
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="paymentStatus !== 'processing'"
    class="electronic-payment-dialog"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <div class="p-2 sm:p-4 space-y-5">
      <!-- 顶部：国家财政与中央银行安全网关标识 -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <el-icon :size="18"><CreditCard /></el-icon>
          </div>
          <div>
            <div class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{{ $t('payment.title') }}</span>
              <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono">
                {{ $t('payment.cbiCertified') }}
              </el-tag>
            </div>
            <div class="text-[11px] text-slate-400">
              {{ $t('payment.gatewayName') }}
            </div>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-slate-400 block">{{ $t('payment.countdown') }}</span>
          <span class="font-mono text-xs font-bold text-amber-600">{{ countdownFormatted }}</span>
        </div>
      </div>

      <!-- 待支付状态 (Pending) -->
      <div v-if="paymentStatus === 'pending'" class="space-y-4">
        <!-- 金额与账单信息卡 -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs space-y-3">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>{{ title || $t('payment.title') }}</span>
            <span class="font-mono text-[11px]">{{ $t('payment.orderNo') }}: {{ orderId }}</span>
          </div>

          <div class="flex items-baseline justify-between">
            <div class="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              {{ amount.toLocaleString() }} <span class="text-sm text-slate-300 font-normal">{{ currency }}</span>
            </div>
            <el-tag size="small" type="warning" effect="dark">
              {{ $t('common.pending') }}
            </el-tag>
          </div>

          <div class="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300 flex flex-wrap justify-between gap-y-1">
            <span>{{ $t('payment.cardNo') }}：<strong class="font-mono text-white">{{ businessNo || 'RC-10029381' }}</strong></span>
            <span>{{ $t('payment.applicant') }}：<strong class="text-white">{{ applicantName || '持卡户主' }}</strong></span>
          </div>
        </div>

        <!-- 支付方式切换标签 -->
        <div class="space-y-1.5">
          <div class="text-xs font-medium text-slate-600">选择支付渠道钱包：</div>
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

        <!-- 二维码扫描展示卡 -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
          <div class="relative w-48 h-48 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
            <!-- 仿真 SVG 二维码图案 -->
            <svg class="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
              <!-- 四角寻像点 左上 -->
              <rect x="5" y="5" width="22" height="22" rx="2" fill="#0f172a" />
              <rect x="8" y="8" width="16" height="16" rx="1" fill="#ffffff" />
              <rect x="11" y="11" width="10" height="10" rx="1" fill="#0f172a" />

              <!-- 四角寻像点 右上 -->
              <rect x="73" y="5" width="22" height="22" rx="2" fill="#0f172a" />
              <rect x="76" y="8" width="16" height="16" rx="1" fill="#ffffff" />
              <rect x="79" y="11" width="10" height="10" rx="1" fill="#0f172a" />

              <!-- 四角寻像点 左下 -->
              <rect x="5" y="73" width="22" height="22" rx="2" fill="#0f172a" />
              <rect x="8" y="76" width="16" height="16" rx="1" fill="#ffffff" />
              <rect x="11" y="79" width="10" height="10" rx="1" fill="#0f172a" />

              <!-- 定位线与伪随机高保真点阵 -->
              <rect x="30" y="8" width="4" height="4" fill="#0f172a" />
              <rect x="38" y="8" width="4" height="4" fill="#0f172a" />
              <rect x="46" y="8" width="4" height="4" fill="#0f172a" />
              <rect x="54" y="8" width="4" height="4" fill="#0f172a" />
              <rect x="62" y="8" width="4" height="4" fill="#0f172a" />

              <rect x="8" y="30" width="4" height="4" fill="#0f172a" />
              <rect x="8" y="38" width="4" height="4" fill="#0f172a" />
              <rect x="8" y="46" width="4" height="4" fill="#0f172a" />
              <rect x="8" y="54" width="4" height="4" fill="#0f172a" />
              <rect x="8" y="62" width="4" height="4" fill="#0f172a" />

              <!-- 矩阵数据方块 -->
              <rect x="32" y="32" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="32" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="32" width="6" height="6" fill="#0f172a" />
              <rect x="62" y="32" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="32" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="32" width="6" height="6" fill="#0f172a" />

              <rect x="32" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="62" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="42" width="6" height="6" fill="#0f172a" />

              <rect x="32" y="52" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="52" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="52" width="6" height="6" fill="#0f172a" />

              <rect x="32" y="62" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="62" width="6" height="6" fill="#0f172a" />
              <rect x="62" y="62" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="62" width="6" height="6" fill="#0f172a" />

              <rect x="32" y="72" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="72" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="72" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="72" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="72" width="6" height="6" fill="#0f172a" />

              <rect x="32" y="82" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="82" width="6" height="6" fill="#0f172a" />
              <rect x="62" y="82" width="6" height="6" fill="#0f172a" />
              <rect x="82" y="82" width="6" height="6" fill="#0f172a" />

              <!-- 中间 Logo 背景 -->
              <rect x="42" y="42" width="16" height="16" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
              <circle cx="50" cy="50" r="5" fill="#059669" />
            </svg>

            <!-- 动态扫描激光线 (CSS 动画) -->
            <div class="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_#10b981] animate-scan" />
          </div>

          <div class="text-center text-xs text-slate-500">
            <p class="font-medium text-slate-700">{{ $t('payment.scanHint') }} ({{ currentChannelName }})</p>
            <p class="text-[11px] text-slate-400 mt-0.5">{{ $t('payment.biometricHint') }}</p>
          </div>
        </div>

        <!-- 模拟扫码支付与返回操作按钮 -->
        <div class="flex items-center gap-3 pt-2">
          <el-button
            type="success"
            size="large"
            class="flex-1 font-bold shadow-md bg-emerald-600 border-emerald-600 hover:bg-emerald-500"
            @click="handleSimulateScanPay"
          >
            <el-icon class="mr-1.5"><Cellphone /></el-icon>
            {{ $t('payment.simulatePayBtn') }}
          </el-button>
          <el-button size="large" @click="handleCancel">
            {{ $t('payment.cancelBtn') }}
          </el-button>
        </div>
      </div>

      <!-- 支付处理中 (Processing) -->
      <div v-else-if="paymentStatus === 'processing'" class="py-12 flex flex-col items-center justify-center space-y-4">
        <div class="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin flex items-center justify-center" />
        <div class="text-center space-y-1">
          <h3 class="text-base font-bold text-slate-800">{{ $t('payment.processing') }}</h3>
          <p class="text-xs text-slate-400 font-mono">Channel: {{ currentChannelName }} · Order: {{ orderId }}</p>
        </div>
      </div>

      <!-- 支付成功 (Success) -->
      <div v-else-if="paymentStatus === 'success'" class="py-8 flex flex-col items-center justify-center space-y-4 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
          <el-icon :size="36"><CircleCheckFilled /></el-icon>
        </div>

        <div class="space-y-1">
          <h3 class="text-lg font-bold text-slate-900">{{ $t('payment.success') }}</h3>
          <p class="text-xs text-emerald-700 font-medium">CBI E-Payment Clearance Verified</p>
          <div class="font-mono text-xs text-slate-400 mt-2">
            TXN-{{ Math.floor(100000 + Math.random() * 900000) }}-IQD
          </div>
        </div>

        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 max-w-sm">
          {{ $t('payment.successHint') }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { CreditCard, Cellphone, CircleCheckFilled } from '@element-plus/icons-vue';

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

const channels = [
  { id: 'qi_card', name: 'Qi Card (万事达)', icon: '💳' },
  { id: 'zain_cash', name: 'ZainCash 钱包', icon: '📱' },
  { id: 'cbi_switch', name: 'Switch 银联通道', icon: '🏦' }
];

const currentChannelName = computed(() => {
  return channels.find((c) => c.id === selectedChannel.value)?.name || '电子钱包';
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
      startTimer();
    } else {
      stopTimer();
    }
  }
);

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

onUnmounted(() => {
  stopTimer();
});

function handleCancel() {
  stopTimer();
  emit('update:modelValue', false);
  emit('cancel');
}

function handleSimulateScanPay() {
  paymentStatus.value = 'processing';
  setTimeout(() => {
    paymentStatus.value = 'success';
    setTimeout(() => {
      stopTimer();
      emit('update:modelValue', false);
      emit('success', {
        orderId: orderId.value,
        amount: props.amount,
        channel: currentChannelName.value,
        paidAt: new Date().toISOString()
      });
    }, 1200);
  }, 1200);
}
</script>

<style scoped>
@keyframes scanAnimation {
  0% {
    top: 0%;
    opacity: 0.8;
  }
  50% {
    top: 96%;
    opacity: 1;
  }
  100% {
    top: 0%;
    opacity: 0.8;
  }
}

.animate-scan {
  animation: scanAnimation 2.2s ease-in-out infinite;
}
</style>
