<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t('agentAuth.loginTitle')"
    :width="dialogWidth"
    align-center
    :class="['agent-identity-dialog', 'rcm-compact-dialog', { 'is-compact': isCompact }]"
    :close-on-click-modal="false"
    :before-close="close"
  >
    <el-alert :title="$t(isMock ? 'agentAuth.dataNotice' : 'agentAuth.liveNotice')" type="info" :closable="false" show-icon class="mb-4" />
    <p class="text-sm text-[#43554B] mb-4">{{ $t('agentAuth.loginInstruction') }}</p>
    <el-steps :active="face ? 2 : identity ? 1 : 0" finish-status="success" simple class="mb-4">
      <el-step :title="$t('agentAuth.loginChipTitle')" />
      <el-step :title="$t('agentAuth.loginFaceTitle')" />
    </el-steps>

    <div :class="isCompact ? 'space-y-4' : 'grid grid-cols-2 gap-4'">
      <section class="minimal-card">
        <h3 class="minimal-card-title">{{ $t('agentAuth.loginChipTitle') }}</h3>
        <p class="minimal-card-hint">{{ $t('agentAuth.loginChipHint') }}</p>
        <div class="minimal-readout">
          <el-icon :size="32"><CreditCard /></el-icon>
          <div v-if="identity?.name" class="text-sm font-semibold">{{ identity.name }}</div>
          <div><span dir="ltr" class="font-mono text-xs">{{ nationalId }}</span></div>
          <p v-if="identity" class="text-xs">{{ $t('agentAuth.loginChipPlaceholder') }}</p>
        </div>
        <input ref="referenceInput" type="file" accept="image/jpeg,image/png" class="sr-only" @change="selectReference" />
        <p v-if="referenceFile" class="minimal-file-name">{{ referenceFile.name }}</p>
        <p v-if="referenceChecking" class="minimal-status" role="status">{{ $t('agentAuth.referenceChecking') }}</p>
        <p v-else-if="referenceReady" class="minimal-status is-ok">{{ $t('agentAuth.referenceReady') }}</p>
        <el-button class="w-full" type="primary" plain :loading="reading || referenceChecking" :disabled="!isMock || comparing" @click="readChip">
          {{ $t(identity ? 'agentAuth.loginChipRead' : 'agentAuth.loginChipButton') }}
        </el-button>
      </section>

      <section class="minimal-card">
        <h3 class="minimal-card-title">{{ $t('agentAuth.loginFaceTitle') }}</h3>
        <p class="minimal-card-hint">{{ $t('agentAuth.loginFaceHint') }}</p>
        <div class="minimal-readout">
          <img v-if="face?.image" :src="face.image" :alt="$t('agentAuth.loginFaceTitle')" class="h-28 w-full object-contain rounded-lg" />
          <el-icon v-else :size="32"><Camera /></el-icon>
          <p v-if="face" class="text-xs">{{ $t('agentAuth.loginFaceCaptured') }}</p>
        </div>
        <el-button class="w-full" type="primary" plain :disabled="!isMock || !identity || reading || comparing" @click="showFace = true">
          {{ $t('agentAuth.loginFaceButton') }}
        </el-button>
      </section>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <el-button :disabled="comparing" @click="close">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :disabled="!identity || !face || !isMock || reading" :loading="comparing" @click="completeVerification">
          {{ $t('agentAuth.loginCompareButton') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <FaceLivenessVerifyDialog
    v-model="showFace"
    :target-name="identity?.name || nationalId"
    :target-national-id="nationalId"
    :allow-quick-pass="isMock"
    :prepared-reference="referenceFile"
    :prepared-token="cloudToken"
    auto-start
    @success="onFaceCaptured"
  />
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Camera, CreditCard } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { readAgentLoginIdentity, completeAgentLoginVerification } from '../../api/auth.js';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';
import { getDefaultHuaweiIamToken } from '../../utils/huaweiIam.js';
import { checkReferenceImage } from '../../utils/liveFaceCompare.js';

const props = defineProps({
  modelValue: Boolean,
  verification: { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue', 'success', 'cancel']);
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const nationalId = computed(() => props.verification?.nationalId || '');
const identity = ref(null);
const face = ref(null);
const reading = ref(false);
const comparing = ref(false);
const showFace = ref(false);
const referenceInput = ref(null);
const referenceFile = ref(null);
const referenceChecking = ref(false);
const referenceReady = ref(false);
const cloudToken = ref(null);
let generation = 0;
let referenceGeneration = 0;
let referenceController = null;
let tokenController = null;

watch(() => props.modelValue, () => {
  generation++;
  clearPrepared();
  identity.value = null;
  face.value = null;
  showFace.value = false;
});

function clearPrepared() {
  referenceGeneration++;
  referenceController?.abort();
  tokenController?.abort();
  referenceController = null;
  tokenController = null;
  referenceFile.value = null;
  cloudToken.value = null;
  referenceChecking.value = false;
  referenceReady.value = false;
  reading.value = false;
}

onBeforeUnmount(() => { generation++; clearPrepared(); });

function close() {
  if (comparing.value) return;
  generation++;
  clearPrepared();
  showFace.value = false;
  emit('update:modelValue', false);
  emit('cancel');
}

async function readChip() {
  if (!isMock || reading.value || comparing.value || referenceChecking.value) return;
  const request = generation;
  clearPrepared();
  identity.value = null;
  face.value = null;
  if (referenceInput.value) referenceInput.value.value = '';
  referenceInput.value?.click();
  reading.value = true;
  const activeTokenController = new AbortController();
  tokenController = activeTokenController;
  try {
    const result = await readAgentLoginIdentity({ challenge: props.verification?.challenge });
    if (request === generation && props.modelValue) {
      identity.value = result;
      // Real comparison needs a cloud token; when it is unavailable the demo
      // quick pass in the liveness dialog still lets the operator continue.
      try {
        cloudToken.value = await getDefaultHuaweiIamToken({ signal: activeTokenController.signal });
        void prepareReference();
      } catch {
        cloudToken.value = null;
      }
    }
  } catch (error) {
    activeTokenController.abort();
    if (request === generation && props.modelValue) {
      ElMessage.error(t('agentAuth.loginReadFailed'));
    }
  } finally {
    if (request === generation) {
      reading.value = false;
      if (tokenController === activeTokenController) tokenController = null;
    }
  }
}

function selectReference(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  referenceGeneration++;
  referenceController?.abort();
  referenceFile.value = null;
  referenceReady.value = false;
  face.value = null;
  if (!file) return;
  if (!['image/jpeg', 'image/png'].includes(file.type) || !file.size || file.size >= 8 * 1024 * 1024) {
    ElMessage.error(t('agentAuth.imageError'));
    return;
  }
  referenceFile.value = file;
  void prepareReference();
}

async function prepareReference() {
  if (!identity.value || !cloudToken.value || !referenceFile.value) return;
  referenceController?.abort();
  const request = ++referenceGeneration;
  const dialog = generation;
  referenceController = new AbortController();
  referenceChecking.value = true;
  referenceReady.value = false;
  try {
    await checkReferenceImage({ ...cloudToken.value, referenceImage: referenceFile.value, signal: referenceController.signal });
    if (request === referenceGeneration && dialog === generation && props.modelValue) referenceReady.value = true;
  } catch (error) {
    if (request === referenceGeneration && dialog === generation && props.modelValue) {
      ElMessage.error(t(error.message === 'face_count' ? 'faceCompareDemo.faceCount' : 'agentAuth.referenceFailed'));
    }
  } finally {
    if (request === referenceGeneration && dialog === generation) {
      referenceChecking.value = false;
      referenceController = null;
    }
  }
}

function onFaceCaptured(payload) {
  if (props.modelValue && identity.value && payload?.nationalId === nationalId.value) face.value = payload;
}

async function completeVerification() {
  if (!isMock || !identity.value || !face.value || comparing.value || reading.value) return;
  comparing.value = true;
  try {
    const result = await completeAgentLoginVerification({
      challenge: props.verification?.challenge,
      nationalId: nationalId.value,
      readToken: identity.value.readToken,
      livenessCompleted: true,
      faceImage: face.value.image || '',
      simulated: true
    });
    if (result?.passed !== true) throw new Error('Verification did not pass');
    emit('success', result);
    emit('update:modelValue', false);
  } catch {
    ElMessage.error(t('agentAuth.loginCompareFailed'));
  } finally {
    comparing.value = false;
  }
}
</script>

<style scoped>
.agent-identity-dialog :deep(.el-dialog__body) {
  max-height: calc(100dvh - 260px);
  overflow-y: auto;
  scrollbar-width: thin;
}
.minimal-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid #d9e5db;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.minimal-card-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f3326;
}
.minimal-card-hint {
  font-size: 11px;
  line-height: 1.6;
  color: #58685d;
}
.minimal-readout {
  min-height: 96px;
  padding: 12px;
  border-radius: 8px;
  background: #eff5f1;
  color: #43554b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
}
.minimal-file-name {
  font-size: 11px;
  color: #58685d;
  overflow-wrap: anywhere;
}
.minimal-status {
  font-size: 11px;
  color: #8a9a8f;
}
.minimal-status.is-ok { color: #326445; }
</style>
