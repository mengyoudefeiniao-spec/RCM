<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t(isMember ? 'memberVerification.online' : 'firstLoginVerification.title')"
    :width="dialogWidth"
    align-center
    :class="['identity-verify-dialog', { 'first-login-verify': !isMember, 'rcm-compact-dialog': isCompact }]"
    :close-on-click-modal="false"
    :before-close="close"
  >
    <el-alert :title="$t(isMock ? 'firstLoginVerification.demoNotice' : 'firstLoginVerification.liveUnavailable')" type="warning" :closable="false" show-icon class="mb-4" />
    <p v-if="isMember" class="font-bold mb-2">{{ member.name }}</p>
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
          <div><span dir="ltr" class="font-mono text-xs">{{ nationalId }}</span></div>
          <p v-if="identity" class="text-xs">{{ $t('firstLoginVerification.chipPlaceholder') }}</p>
        </div>
        <input ref="referenceInput" type="file" accept="image/jpeg,image/png" class="sr-only" @change="selectReference" />
        <p v-if="referenceFile" class="text-xs break-all">{{ referenceFile.name }}</p>
        <p v-if="referenceChecking" class="text-xs" role="status">{{ $t('firstLoginVerification.referenceUploading') }}</p>
        <p v-else-if="referenceReady" class="text-xs text-[#326445]">{{ $t('firstLoginVerification.referenceReady') }}</p>
        <el-button class="w-full" type="primary" plain :loading="reading || referenceChecking" :disabled="!isMock || comparing" data-first-login="read-chip" @click="readChip">
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
        <el-button class="w-full" type="primary" plain :disabled="!isMock || !identity || reading || comparing || !referenceReady" data-first-login="start-face" @click="showFace = true">
          {{ $t('firstLoginVerification.faceButton') }}
        </el-button>
      </section>
    </div>
    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <el-button :disabled="comparing" @click="close">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :disabled="!identity || !face || !isMock || reading" :loading="comparing" data-first-login="finish" @click="completeVerification">{{ $t(isMember ? 'memberVerification.completeOnline' : 'firstLoginVerification.compareButton') }}</el-button>
      </div>
    </template>
  </el-dialog>
  <FaceLivenessVerifyDialog
    v-model="showFace"
    :target-name="member?.name || nationalId"
    :target-national-id="nationalId"
    :allow-quick-pass="false"
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
import { readFirstLoginIdentity, completeFirstLoginVerification, readMemberIdentity, completeMemberVerification } from '../../api/auth.js';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';
import { getDefaultHuaweiIamToken } from '../../utils/huaweiIam.js';
import { checkReferenceImage } from '../../utils/liveFaceCompare.js';

const props = defineProps({
  modelValue: Boolean,
  verification: { type: Object, default: null },
  member: { type: Object, default: null },
  cardNo: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'success', 'cancel']);
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const isMember = computed(() => Boolean(props.member?.id));
const nationalId = computed(() => props.member?.nationalId || props.verification?.nationalId || '');
const identity = ref(null);
const referenceInput = ref(null), referenceFile = ref(null), cloudToken = ref(null);
const referenceChecking = ref(false), referenceReady = ref(false);
let referenceGeneration = 0, referenceController = null, tokenController = null;
const face = ref(null);
const reading = ref(false);
const comparing = ref(false);
const showFace = ref(false);
let generation = 0;
watch(() => props.modelValue, () => {
  generation++;
  clearPrepared();
  identity.value = null;
  face.value = null;
  showFace.value = false;
});
function clearPrepared() {
  referenceGeneration++; referenceController?.abort(); tokenController?.abort();
  referenceController = null; tokenController = null; referenceFile.value = null; cloudToken.value = null;
  referenceChecking.value = false; referenceReady.value = false; reading.value = false;
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
  clearPrepared(); identity.value = null; face.value = null;
  if (referenceInput.value) referenceInput.value.value = '';
  referenceInput.value?.click();
  reading.value = true;
  const activeTokenController = new AbortController(); tokenController = activeTokenController;
  try {
    const identityRequest = isMember.value
      ? readMemberIdentity({ cardNo:props.cardNo, memberId:props.member.id, nationalId:nationalId.value })
      : readFirstLoginIdentity({ challenge:props.verification.challenge });
    const [result, token] = await Promise.all([identityRequest, getDefaultHuaweiIamToken({ signal:activeTokenController.signal })]);
    if (request === generation && props.modelValue) { identity.value = result; cloudToken.value = token; void prepareReference(); }
  } catch (error) { activeTokenController.abort(); if (request === generation && props.modelValue) ElMessage.error(t(error?.message?.startsWith('iam_') ? 'faceCompareDemo.autoTokenFailed' : 'firstLoginVerification.readFailed')); }
  finally { if (request === generation) { reading.value = false; if (tokenController === activeTokenController) tokenController = null; } }
}
function selectReference(event) {
  const file = event.target.files?.[0]; event.target.value = '';
  referenceGeneration++; referenceController?.abort(); referenceFile.value = null; referenceReady.value = false; face.value = null;
  if (!file) return;
  if (!['image/jpeg','image/png'].includes(file.type) || !file.size || file.size >= 8 * 1024 * 1024) { ElMessage.error(t('faceCompareDemo.imageError')); return; }
  referenceFile.value = file; void prepareReference();
}
async function prepareReference() {
  if (!identity.value || !cloudToken.value || !referenceFile.value) return;
  referenceController?.abort(); const request = ++referenceGeneration; const dialog = generation;
  referenceController = new AbortController(); referenceChecking.value = true; referenceReady.value = false;
  try {
    await checkReferenceImage({ ...cloudToken.value, referenceImage:referenceFile.value, signal:referenceController.signal });
    if (request === referenceGeneration && dialog === generation && props.modelValue) referenceReady.value = true;
  } catch (error) {
    if (request === referenceGeneration && dialog === generation && props.modelValue) ElMessage.error(t(error.message === 'face_count' ? 'faceCompareDemo.faceCount' : 'firstLoginVerification.referenceFailed'));
  } finally { if (request === referenceGeneration && dialog === generation) { referenceChecking.value = false; referenceController = null; } }
}
function onFaceCaptured(payload) {
  if (props.modelValue && identity.value && payload?.nationalId === nationalId.value) face.value = payload;
}
async function completeVerification() {
  if (!isMock || !identity.value || !face.value || comparing.value || reading.value) return;
  comparing.value = true;
  try {
    const fields = {
      nationalId: nationalId.value,
      readToken: identity.value.readToken,
      livenessCompleted: true,
      faceImage: face.value.image || '',
      simulated: true
    };
    const result = isMember.value
      ? await completeMemberVerification({ ...fields, cardNo: props.cardNo, memberId: props.member.id })
      : await completeFirstLoginVerification({ ...fields, challenge: props.verification.challenge });
    if (result.passed !== true) throw new Error('Verification did not pass');
    emit('success', result);
    emit('update:modelValue', false);
  } catch { ElMessage.error(t('firstLoginVerification.compareFailed')); }
  finally { comparing.value = false; }
}
</script>
