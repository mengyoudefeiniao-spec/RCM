<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t('firstLoginVerification.title')"
    :width="dialogWidth"
    align-center
    :class="['first-login-verify', { 'rcm-compact-dialog': isCompact }]"
    :close-on-click-modal="false"
    :before-close="close"
  >
    <el-alert :title="$t(isMock ? 'firstLoginVerification.demoNotice' : 'firstLoginVerification.liveUnavailable')" type="warning" :closable="false" show-icon class="mb-4" />
    <p class="text-sm text-[#43554B] mb-4">{{ $t('firstLoginVerification.instruction') }}</p>
    <el-steps :active="face ? 2 : identity ? 1 : 0" finish-status="success" simple class="mb-4">
      <el-step :title="$t('firstLoginVerification.chipTitle')" />
      <el-step :title="$t('firstLoginVerification.faceTitle')" />
    </el-steps>
    <div :class="isCompact ? 'space-y-4' : 'grid grid-cols-2 gap-4'">
      <section class="rounded-lg border border-[#D9E5DB] p-4 space-y-3">
        <h3 class="font-bold text-[#1F3326]">{{ $t('firstLoginVerification.chipTitle') }}</h3>
        <p class="text-xs text-[#58685D]">{{ $t('firstLoginVerification.chipHint') }}</p>
        <div class="rounded-lg bg-[#EFF5F1] p-4 text-center text-[#43554B] space-y-2">
          <el-icon :size="36"><CreditCard /></el-icon>
          <div><span dir="ltr" class="font-mono text-xs">{{ verification.nationalId }}</span></div>
          <p v-if="identity" class="text-xs">{{ $t('firstLoginVerification.chipPlaceholder') }}</p>
        </div>
        <el-button class="w-full" type="primary" plain :loading="reading" :disabled="!isMock || comparing" data-first-login="read-chip" @click="readChip">
          {{ $t(identity ? 'firstLoginVerification.chipRead' : 'firstLoginVerification.chipButton') }}
        </el-button>
      </section>
      <section class="rounded-lg border border-[#D9E5DB] p-4 space-y-3">
        <h3 class="font-bold text-[#1F3326]">{{ $t('firstLoginVerification.faceTitle') }}</h3>
        <p class="text-xs text-[#58685D]">{{ $t('firstLoginVerification.faceHint') }}</p>
        <div class="rounded-lg bg-[#EFF5F1] p-4 text-center text-[#43554B]">
          <img v-if="face?.image" :src="face.image" :alt="$t('firstLoginVerification.faceTitle')" class="h-32 w-full object-contain rounded-lg" />
          <el-icon v-else :size="36"><Camera /></el-icon>
          <p v-if="face" class="text-xs mt-2">{{ $t('firstLoginVerification.faceCaptured') }}</p>
        </div>
        <el-button class="w-full" type="primary" plain :disabled="!isMock || !identity || reading || comparing" data-first-login="start-face" @click="showFace = true">
          {{ $t('firstLoginVerification.faceButton') }}
        </el-button>
      </section>
    </div>
    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <el-button :disabled="comparing" @click="close">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :disabled="!identity || !face || !isMock || reading" :loading="comparing" data-first-login="finish" @click="compareAndLogin">{{ $t('firstLoginVerification.compareButton') }}</el-button>
      </div>
    </template>
  </el-dialog>
  <FaceLivenessVerifyDialog
    v-model="showFace"
    :target-name="verification.nationalId"
    :target-national-id="verification.nationalId"
    :allow-quick-pass="false"
    :notice="$t('firstLoginVerification.demoNotice')"
    @success="onFaceCaptured"
  />
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Camera, CreditCard } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { readFirstLoginIdentity, completeFirstLoginVerification } from '../../api/auth.js';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';

const props = defineProps({ modelValue: Boolean, verification: { type: Object, required: true } });
const emit = defineEmits(['update:modelValue', 'success', 'cancel']);
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const identity = ref(null);
const face = ref(null);
const reading = ref(false);
const comparing = ref(false);
const showFace = ref(false);
let generation = 0;
watch(() => props.modelValue, () => {
  generation++;
  identity.value = null;
  face.value = null;
  showFace.value = false;
});
function close() {
  if (comparing.value) return;
  generation++;
  showFace.value = false;
  emit('update:modelValue', false);
  emit('cancel');
}
async function readChip() {
  if (!isMock || reading.value || comparing.value) return;
  const request = generation;
  identity.value = null;
  face.value = null;
  reading.value = true;
  try {
    const result = await readFirstLoginIdentity({ challenge: props.verification.challenge });
    if (request === generation && props.modelValue) identity.value = result;
  } catch { ElMessage.error(t('firstLoginVerification.readFailed')); }
  finally { reading.value = false; }
}
function onFaceCaptured(payload) {
  if (props.modelValue && identity.value && payload?.nationalId === props.verification.nationalId) face.value = payload;
}
async function compareAndLogin() {
  if (!isMock || !identity.value || !face.value || comparing.value || reading.value) return;
  comparing.value = true;
  try {
    const result = await completeFirstLoginVerification({
      challenge: props.verification.challenge,
      nationalId: props.verification.nationalId,
      readToken: identity.value.readToken,
      livenessCompleted: true,
      faceImage: face.value.image || '',
      simulated: true
    });
    if (result.passed !== true) throw new Error('Verification did not pass');
    emit('success', result);
    emit('update:modelValue', false);
  } catch { ElMessage.error(t('firstLoginVerification.compareFailed')); }
  finally { comparing.value = false; }
}
</script>
