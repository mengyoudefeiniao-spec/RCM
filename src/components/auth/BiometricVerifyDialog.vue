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
      <div class="bg-[#EFF5F1] border border-[#C7DED0] p-3 rounded-lg flex items-center justify-between text-xs text-[#24483A]">
        <div class="flex items-center gap-2">
          <el-icon :size="16" class="text-[#326445]"><Lock /></el-icon>
          <span>{{ $t('register.bio.verifySubject') }}<strong class="text-[#1B3123]">{{ displayName }}</strong> ({{ $t('register.labelPaperCardNo') }} {{ userCardNo || $t('register.bio.pendingBind') }})</span>
        </div>
        <el-tag size="small" type="primary" effect="plain" class="font-mono">NID-CHIP · ICAO-9303</el-tag>
      </div>

      <!-- 三要素采集卡片网格 -->
      <div :class="isCompact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-3 gap-3'">
        <!-- 1. 现场活体人脸 -->
        <div class="bg-[#1B3123] text-white rounded-lg p-3.5 flex flex-col justify-between border border-[#1F3326] space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#6FBF92]">{{ $t('register.bio.faceTitle') }}</span>
            <el-icon v-if="faceCaptured" class="text-[#6FBF92]"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-[#8A9A8F]">{{ $t('register.bio.faceDesc') }}</p>

          <!-- 模拟取景器画面 -->
          <div class="aspect-4/3 rounded-lg bg-[#12241A] border border-[#43554B] overflow-hidden flex items-center justify-center relative">
            <div v-if="faceCaptured" class="w-full h-full relative">
              <img
                :src="faceImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'"
                alt="Face Preview"
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-1 end-1 bg-[#2F7A50]/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                PASS: 99.8%
              </div>
            </div>
            <div v-else class="text-center text-[#58685D] text-[11px] space-y-1">
              <el-icon :size="24"><Camera /></el-icon>
              <div>{{ $t('register.bio.awaitingCapture') }}</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" data-demo-target="btn-bio-face" @click="faceLivenessDialogVisible = true">
            {{ faceCaptured ? $t('register.bio.livenessBtnRedo') : $t('register.bio.livenessBtn') }}
          </el-button>
        </div>

        <!-- 2. 统一国民卡正面 -->
        <div class="bg-[#1B3123] text-white rounded-lg p-3.5 flex flex-col justify-between border border-[#1F3326] space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#6FBF92]">{{ $t('register.bio.frontTitle') }}</span>
            <el-icon v-if="cardFrontCaptured" class="text-[#6FBF92]"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-[#8A9A8F]">{{ $t('register.bio.frontDesc') }}</p>

          <div class="aspect-4/3 rounded-lg bg-[#12241A] border border-[#43554B] overflow-hidden flex items-center justify-center p-2 relative">
            <div v-if="cardFrontCaptured" class="w-full h-full flex flex-col justify-between text-[9px] font-mono text-[#C9DBCE]">
              <div class="flex justify-between border-b border-[#1F3326] pb-0.5 text-[#6FBF92] font-bold">
                <span>REPUBLIC OF IRAQ</span>
                <span>NID-FRONT</span>
              </div>
              <div>
                <div class="text-white font-bold">{{ displayName }}</div>
                <div class="text-[8px] text-[#8A9A8F]">NID: 198004198271</div>
              </div>
              <div class="text-[8px] text-[#58685D]">{{ $t('register.bio.authorityLine') }}</div>
            </div>
            <div v-else class="text-center text-[#58685D] text-[11px] space-y-1">
              <el-icon :size="24"><Postcard /></el-icon>
              <div>{{ $t('register.bio.awaitingFront') }}</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" data-demo-target="btn-bio-front" @click="handleCaptureFront">
            {{ cardFrontCaptured ? $t('register.bio.scanFrontBtnRedo') : $t('register.bio.scanFrontBtn') }}
          </el-button>
        </div>

        <!-- 3. 统一国民卡背面芯片 -->
        <div class="bg-[#1B3123] text-white rounded-lg p-3.5 flex flex-col justify-between border border-[#1F3326] space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#6FBF92]">{{ $t('register.bio.chipTitle') }}</span>
            <el-icon v-if="cardBackCaptured" class="text-[#6FBF92]"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-[#8A9A8F]">{{ $t('register.bio.chipDesc') }}</p>

          <div class="aspect-4/3 rounded-lg bg-[#12241A] border border-[#43554B] overflow-hidden flex items-center justify-center p-2 relative">
            <div v-if="cardBackCaptured" class="w-full h-full flex flex-col justify-between text-[8px] font-mono text-[#8A9A8F]">
              <div class="flex justify-between border-b border-[#1F3326] pb-0.5 text-[#DFC08B]">
                <span>CHIP: NFC-9941</span>
                <span>ICAO-9303</span>
              </div>
              <div class="bg-[#1B3123] p-1 rounded leading-none text-[#C9DBCE]">
                <div>I&lt;IRQ198004198271&lt;&lt;&lt;&lt;&lt;&lt;</div>
                <div>8004194M3110298IRQ&lt;&lt;&lt;&lt;9</div>
              </div>
              <div class="text-[#6FBF92] font-bold">CHIP INTEGRITY: OK</div>
            </div>
            <div v-else class="text-center text-[#58685D] text-[11px] space-y-1">
              <el-icon :size="24"><CreditCard /></el-icon>
              <div>{{ $t('register.bio.awaitingChip') }}</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" data-demo-target="btn-bio-chip" @click="handleCaptureChip">
            {{ cardBackCaptured ? $t('register.bio.chipBtnRedo') : $t('register.bio.chipBtn') }}
          </el-button>
        </div>
      </div>

      <!-- 对碰核验结果展示栏 -->
      <div class="bg-[#12241A] p-4 rounded-lg border border-[#1F3326] text-xs">
        <div v-if="verifying" class="flex items-center gap-2 text-[#7FA48C]">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>{{ $t('register.bio.verifyingText') }}</span>
        </div>
        <div v-else-if="verificationPassed" class="space-y-2">
          <div class="flex items-center gap-2 text-[#6FBF92] font-bold">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>{{ $t('register.bio.passedTitle') }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#8A9A8F] border-t border-[#1F3326] pt-2 font-mono">
            <div>{{ $t('register.bio.statSimilarity') }} <strong class="text-white">99.4%</strong></div>
            <div>{{ $t('register.bio.statChip') }} <strong class="text-white">{{ $t('register.bio.chipPass') }}</strong></div>
            <div>{{ $t('register.bio.statLedger') }} <strong class="text-white">{{ $t('register.bio.ledgerMatch') }}</strong></div>
            <div>{{ $t('register.bio.statTrust') }} <strong class="text-[#6FBF92]">{{ $t('register.bio.trustBound') }}</strong></div>
          </div>
        </div>
        <div v-else class="flex items-center justify-between text-[#8A9A8F]">
          <span>{{ $t('register.bio.idleHint') }}</span>
          <el-button type="success" text size="small" @click="handleQuickCollectAll">
            {{ $t('register.bio.quickFillBtn') }}
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          :disabled="!allCaptured"
          :loading="verifying"
          class="font-bold"
          data-demo-target="btn-confirm-bio"
          @click="handleExecuteVerify"
        >
          {{ $t('register.bio.confirmBtn') }}
        </el-button>
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

import { demoSubStep, setDemoStep } from '../../utils/demoState.js';

// 演示引导：三要素采集步骤推进（从任意未完成的三要素子步骤强制推进，避免提示延迟导致卡步）
const DEMO_CAPTURE_ORDER = ['step1_7a', 'step1_7b', 'step1_7c'];

function advanceDemoAfterCapture(nextStep) {
  if (!props.demoMode) return;
  const idx = DEMO_CAPTURE_ORDER.indexOf(nextStep);
  if (idx === -1) return;
  const currentIdx = DEMO_CAPTURE_ORDER.indexOf(demoSubStep.value);
  // 仅当当前仍处于该步骤或更早的三要素子步骤时推进
  if (currentIdx !== -1 && currentIdx <= idx && idx < DEMO_CAPTURE_ORDER.length - 1) {
    setDemoStep(DEMO_CAPTURE_ORDER[idx + 1]);
  }
}

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
  if (val) {
    faceCaptured.value = false;
    faceImage.value = '';
    cardFrontCaptured.value = false;
    cardBackCaptured.value = false;
    verificationPassed.value = false;
  }
  if (val && props.demoMode) {
    // 演示模式下不自动就绪：引导用户依次完成 3 项验证（人脸/卡正面/卡芯片）
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
  // 演示引导：人脸活体核验完成后推进至卡正面采集
  if (props.demoMode && demoSubStep.value === 'step1_7a') {
    setTimeout(() => {
      if (demoSubStep.value === 'step1_7a') {
        setDemoStep('step1_7b');
      }
    }, 400);
  }
}

function handleCaptureFront() {
  if (props.demoMode) {
    // 演示模式：单击即完成采集并推进引导，避免切换语义导致状态回翻卡步
    cardFrontCaptured.value = true;
    advanceDemoAfterCapture('step1_7b');
    return;
  }
  cardFrontCaptured.value = !cardFrontCaptured.value;
}

function handleCaptureChip() {
  if (props.demoMode) {
    // 演示模式：单击「感应卡片背面芯片」即完成采集并进入「确认核验并放行进入」
    cardBackCaptured.value = true;
    advanceDemoAfterCapture('step1_7c');
    return;
  }
  cardBackCaptured.value = !cardBackCaptured.value;
}

const allCaptured = computed(() => faceCaptured.value && cardFrontCaptured.value && cardBackCaptured.value);

// 演示引导兜底：三要素任一路径全部就绪后，自动推进到「确认核验并放行进入」
watch(allCaptured, (val) => {
  if (val && props.demoMode && DEMO_CAPTURE_ORDER.includes(demoSubStep.value)) {
    setDemoStep('step1_8');
  }
});

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
      emit('success', { ...res, faceImage: faceImage.value, verifiedAt: new Date().toISOString() });
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
