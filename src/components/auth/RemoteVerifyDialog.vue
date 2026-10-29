<template>
  <el-dialog :model-value="modelValue" :title="$t('memberVerification.remote')" :width="dialogWidth" class="member-remote-verification" align-center @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-4">
      <p class="font-bold">{{ member?.name }}</p>
      <p class="text-sm">{{ $t('memberVerification.notice') }}</p>
    </div>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">{{ $t('common.close') }}</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!isMockMode || !member?.id || !cardNo || memberVerificationStatus(member) === 'passed' || hasPendingRemoteVerification(member)" @click="submit">{{ $t('memberVerification.request') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { verifyRemoteMember } from '../../api/auth.js';
import { memberVerificationStatus, hasPendingRemoteVerification } from '../../utils/memberVerification.js';
const props = defineProps({ modelValue: Boolean, member: { type: Object, default: null }, cardNo: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue', 'requested']);
const { t } = useI18n();
const { dialogWidth } = useCompactDialog(520);
const submitting = ref(false);
const isMockMode = import.meta.env.VITE_APP_MOCK_MODE === 'true';
async function submit() {
  if (!isMockMode || !props.member?.id || !props.cardNo || submitting.value || memberVerificationStatus(props.member) === 'passed' || hasPendingRemoteVerification(props.member)) return;
  submitting.value = true;
  try {
    await verifyRemoteMember({ cardNo: props.cardNo, memberId: props.member.id });
    ElMessage.success(t('memberVerification.recorded'));
    emit('requested');
    emit('update:modelValue', false);
  } catch (_) {
    ElMessage.error(t('memberVerification.error'));
  } finally { submitting.value = false; }
}
</script>
