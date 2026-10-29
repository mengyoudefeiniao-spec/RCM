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
        <el-button type="primary" :disabled="!identity || !face || !isMock || reading" :loading="comparing" data-first-login="finish" @click="completeVerification">{{ $t(isMember ? 'memberVerification.completeOnline' : 'firstLoginVerification.compareButton') }}</el-button>
      </div>
    </template>
  </el-dialog>
  <FaceLivenessVerifyDialog
    v-model="showFace"
    :target-name="member?.name || nationalId"
    :target-national-id="nationalId"
    :allow-quick-pass="false"
    :notice="$t('firstLoginVerification.demoNotice')"
    @success="onFaceCaptured"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Camera, CreditCard } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { readFirstLoginIdentity, completeFirstLoginVerification, readMemberIdentity, completeMemberVerification } from '../../api/auth.js';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';

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
    const result = isMember.value
      ? await readMemberIdentity({ cardNo: props.cardNo, memberId: props.member.id, nationalId: nationalId.value })
      : await readFirstLoginIdentity({ challenge: props.verification.challenge });
    if (request === generation && props.modelValue) identity.value = result;
  } catch { ElMessage.error(t('firstLoginVerification.readFailed')); }
  finally { reading.value = false; }
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
