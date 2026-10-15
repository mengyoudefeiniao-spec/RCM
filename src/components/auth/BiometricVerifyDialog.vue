<template>
  <el-dialog
    v-model="visible"
    :title="$t('register.bio.title')"
    :width="dialogWidth"
    align-center
    :class="{ 'rcm-compact-dialog': isCompact }"
    :before-close="handleClose"
  >
    <div class="space-y-5">
      <!-- 官方安全提示 -->
      <div class="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs text-blue-800">
        <div class="flex items-center gap-2">
          <el-icon :size="16" class="text-blue-600"><Lock /></el-icon>
          <span>{{ $t('register.bio.verifySubject') }}<strong class="text-slate-900">{{ displayName }}</strong> ({{ $t('register.labelPaperCardNo') }} {{ userCardNo || $t('register.bio.pendingBind') }})</span>
        </div>
        <el-tag size="small" type="primary" effect="plain" class="font-mono">NID-CHIP · ICAO-9303</el-tag>
      </div>

      <!-- 三要素采集卡片网格 -->
      <div :class="isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-3 gap-3'">
        <!-- 1. 现场活体人脸 -->
        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between border border-slate-800 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-400">{{ $t('register.bio.faceTitle') }}</span>
            <el-icon v-if="faceCaptured" class="text-emerald-400"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-slate-400">{{ $t('register.bio.faceDesc') }}</p>

          <!-- 模拟取景器画面 -->
          <div class="aspect-4/3 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center relative">
            <div v-if="faceCaptured" class="w-full h-full relative">
              <img
                :src="faceImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'"
                alt="Face Preview"
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-1 right-1 bg-emerald-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                PASS: 99.8%
              </div>
            </div>
            <div v-else class="text-center text-slate-500 text-[11px] space-y-1">
              <el-icon :size="24"><Camera /></el-icon>
              <div>{{ $t('register.bio.awaitingCapture') }}</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" @click="faceLivenessDialogVisible = true">
            {{ faceCaptured ? $t('register.bio.livenessBtnRedo') : $t('register.bio.livenessBtn') }}
          </el-button>
        </div>

        <!-- 2. 统一国民卡正面 -->
        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between border border-slate-800 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-400">{{ $t('register.bio.frontTitle') }}</span>
            <el-icon v-if="cardFrontCaptured" class="text-emerald-400"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-slate-400">{{ $t('register.bio.frontDesc') }}</p>

          <div class="aspect-4/3 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center p-2 relative">
            <div v-if="cardFrontCaptured" class="w-full h-full flex flex-col justify-between text-[9px] font-mono text-slate-300">
              <div class="flex justify-between border-b border-slate-800 pb-0.5 text-emerald-400 font-bold">
                <span>REPUBLIC OF IRAQ</span>
                <span>NID-FRONT</span>
              </div>
              <div>
                <div class="text-white font-bold">{{ displayName }}</div>
                <div class="text-[8px] text-slate-400">NID: 198004198271</div>
              </div>
              <div class="text-[8px] text-slate-500">{{ $t('register.bio.authorityLine') }}</div>
            </div>
            <div v-else class="text-center text-slate-500 text-[11px] space-y-1">
              <el-icon :size="24"><Postcard /></el-icon>
              <div>{{ $t('register.bio.awaitingFront') }}</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" @click="cardFrontCaptured = !cardFrontCaptured">
            {{ cardFrontCaptured ? $t('register.bio.scanFrontBtnRedo') : $t('register.bio.scanFrontBtn') }}
          </el-button>
        </div>

        <!-- 3. 统一国民卡背面芯片 -->
        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between border border-slate-800 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-400">{{ $t('register.bio.chipTitle') }}</span>
            <el-icon v-if="cardBackCaptured" class="text-emerald-400"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-slate-400">{{ $t('register.bio.chipDesc') }}</p>

          <div class="aspect-4/3 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center p-2 relative">
            <div v-if="cardBackCaptured" class="w-full h-full flex flex-col justify-between text-[8px] font-mono text-slate-400">
              <div class="flex justify-between border-b border-slate-800 pb-0.5 text-amber-400">
                <span>CHIP: NFC-9941</span>
                <span>ICAO-9303</span>
              </div>
              <div class="bg-slate-900 p-1 rounded leading-none text-slate-300">
                <div>I&lt;IRQ198004198271&lt;&lt;&lt;&lt;&lt;&lt;</div>
                <div>8004194M3110298IRQ&lt;&lt;&lt;&lt;9</div>
              </div>
              <div class="text-emerald-400 font-bold">CHIP INTEGRITY: OK</div>
            </div>
            <div v-else class="text-center text-slate-500 text-[11px] space-y-1">
              <el-icon :size="24"><CreditCard /></el-icon>
              <div>{{ $t('register.bio.awaitingChip') }}</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" @click="cardBackCaptured = !cardBackCaptured">
            {{ cardBackCaptured ? $t('register.bio.chipBtnRedo') : $t('register.bio.chipBtn') }}
          </el-button>
        </div>
      </div>

      <!-- 对碰核验结果展示栏 -->
      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        <div v-if="verifying" class="flex items-center gap-2 text-indigo-400">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>{{ $t('register.bio.verifyingText') }}</span>
        </div>
        <div v-else-if="verificationPassed" class="space-y-2">
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>{{ $t('register.bio.passedTitle') }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
            <div>{{ $t('register.bio.statSimilarity') }} <strong class="text-white">99.4%</strong></div>
            <div>{{ $t('register.bio.statChip') }} <strong class="text-white">{{ $t('register.bio.chipPass') }}</strong></div>
            <div>{{ $t('register.bio.statLedger') }} <strong class="text-white">{{ $t('register.bio.ledgerMatch') }}</strong></div>
            <div>{{ $t('register.bio.statTrust') }} <strong class="text-emerald-400">{{ $t('register.bio.trustBound') }}</strong></div>
          </div>
        </div>
        <div v-else class="flex items-center justify-between text-slate-400">
          <span>{{ $t('register.bio.idleHint') }}</span>
          <el-button type="success" text size="small" @click="handleQuickCollectAll">
            {{ $t('register.bio.quickFillBtn') }}
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 w-full">
        <!-- 演示引导指示说明框 (步骤 01-8) -->
        <div v-if="demoMode && demoSubStep === 'step1_8'" class="w-full sm:w-auto">
          <DemoGuideTooltip
            step-badge="全流程演示 · 步骤 01-8"
          >
            生物特征比对已就绪，请点击「确认核验并放行进入」
          </DemoGuideTooltip>
        </div>
        <div v-else></div>

        <div class="flex items-center gap-2 shrink-0">
          <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
          <el-button
            type="primary"
            :disabled="!allCaptured"
            :loading="verifying"
            class="font-bold transition-all"
            :class="{ 'demo-target-highlight': demoMode && demoSubStep === 'step1_8' }"
            @click="handleExecuteVerify"
          >
            {{ $t('register.bio.confirmBtn') }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 活体人脸动作核验子弹窗 (带正视、摇头、张嘴动作检测) -->
  <FaceLivenessVerifyDialog
    v-model="faceLivenessDialogVisible"
    :target-name="userName"
    @success="handleFaceLivenessSuccess"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { verifyBiometricFace } from '../../api/auth.js';
import { ElMessage } from 'element-plus';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';
import {
  Lock,
  Camera,
  Postcard,
  CreditCard,
  CircleCheckFilled,
  Loading
} from '@element-plus/icons-vue';

import DemoGuideTooltip from '../common/DemoGuideTooltip.vue';
import { demoSubStep, setDemoStep } from '../../utils/demoState.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userName: { type: String, default: '' },
  userCardNo: { type: String, default: 'RC-10029381' },
  demoMode: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'success']);

const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(720);

// 展示名称：外部未传入时回退到 i18n 默认演示姓名
const displayName = computed(() => props.userName || t('register.defaultUserName'));

const visible = ref(props.modelValue);
watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val && props.demoMode) {
    // 演示模式下自动就绪要素采集，确保用户能直接点击指示按钮
    handleQuickCollectAll();
  }
});

const faceLivenessDialogVisible = ref(false);
const faceCaptured = ref(false);
// 活体核验通过后由摄像头视频流抓取的人脸截图 (Base64)
const faceImage = ref('');
const cardFrontCaptured = ref(false);
const cardBackCaptured = ref(false);
const verifying = ref(false);
const verificationPassed = ref(false);

function handleFaceLivenessSuccess(payload) {
  faceCaptured.value = true;
  faceImage.value = payload?.image || '';
  ElMessage.success(t('register.bio.msgLivenessDone'));
}

const allCaptured = computed(() => faceCaptured.value && cardFrontCaptured.value && cardBackCaptured.value);

function handleQuickCollectAll() {
  faceCaptured.value = true;
  cardFrontCaptured.value = true;
  cardBackCaptured.value = true;
}

async function handleExecuteVerify() {
  verifying.value = true;
  try {
    const res = await verifyBiometricFace({
      userName: props.userName,
      cardNo: props.userCardNo
    });
    verificationPassed.value = true;
    ElMessage.success(res.message || t('register.bio.msgVerifySuccess'));
    if (props.demoMode) {
      setDemoStep('step1_9');
    }
    setTimeout(() => {
      visible.value = false;
      emit('update:modelValue', false);
      emit('success', res);
    }, 600);
  } catch (e) {
    ElMessage.error(t('register.bio.msgVerifyFail'));
  } finally {
    verifying.value = false;
  }
}

function handleClose() {
  visible.value = false;
  emit('update:modelValue', false);
}
</script>
