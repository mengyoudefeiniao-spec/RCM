<template>
  <el-dialog v-model="visible" :title="$t('forgotPassword.title')" :width="dialogWidth" align-center :class="{ 'rcm-compact-dialog': isCompact }" :before-close="close">
    <el-alert :title="$t(isMock ? 'forgotPassword.demoNotice' : 'forgotPassword.liveNotice')" type="warning" :closable="false" show-icon class="mb-3" />
    <el-form label-position="top">
      <el-form-item :label="$t('forgotPassword.identifier')" required>
        <el-input v-model.trim="form.identifier" class="bidi-ltr" :disabled="verified" :placeholder="$t('forgotPassword.identifierPlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('forgotPassword.smsCode')" required :class="verified ? '!mb-2' : ''">
        <div class="flex gap-2 w-full">
          <el-input v-model.trim="form.smsCode" class="bidi-ltr" maxlength="6" inputmode="numeric" :disabled="verified" :placeholder="$t('forgotPassword.smsPlaceholder')" />
          <el-button :loading="sending" :disabled="!isMock || verified || cooldown > 0 || sending" @click="sendCode">
            {{ cooldown > 0 ? $t('forgotPassword.resendCountdown', { seconds: cooldown }) : $t('forgotPassword.sendCode') }}
          </el-button>
        </div>
      </el-form-item>
      <div v-if="exampleCode && !verified" class="text-xs flex items-center gap-1 flex-wrap">
        <span>{{ $t('forgotPassword.demoCode', { code: exampleCode }) }}</span>
        <el-button text type="primary" @click="form.smsCode = exampleCode">{{ $t('forgotPassword.fillIn') }}</el-button>
      </div>
      <template v-if="verified">
        <div class="flex items-center gap-1.5 text-[11px] text-[#326445] py-1">
          <el-icon><CircleCheck /></el-icon>
          <span>{{ $t('forgotPassword.codeVerified') }}</span>
        </div>
        <el-form-item :label="$t('forgotPassword.newPassword')" required>
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" :placeholder="$t('forgotPassword.newPasswordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('forgotPassword.confirmPassword')" required class="!mb-0">
          <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password" :placeholder="$t('forgotPassword.confirmPasswordPlaceholder')" />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="close">{{ $t('forgotPassword.cancel') }}</el-button>
      <el-button v-if="!verified" type="primary" :disabled="!isMock" :loading="verifying" @click="verifyCode">{{ $t('forgotPassword.verifyCode') }}</el-button>
      <el-button v-else type="primary" :disabled="!isMock" :loading="submitting" @click="submit">{{ $t('forgotPassword.submit') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { CircleCheck } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { sendSmsCode, verifySmsCode, resetCitizenPassword } from '../../api/auth.js';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'done']);
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(480);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const visible = ref(props.modelValue);

const blank = () => ({ identifier: '', smsCode: '', password: '', confirmPassword: '' });
const form = reactive(blank());
const exampleCode = ref('');
const sending = ref(false);
const verifying = ref(false);
const submitting = ref(false);
const verified = ref(false);
const cooldown = ref(0);
const cooldownKey = 'rcm_password_reset_sms_retry_at';
let cooldownTimer;

function updateCooldown() {
  const retryAt = Number(sessionStorage.getItem(cooldownKey)) || 0;
  cooldown.value = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
  if (!cooldown.value) sessionStorage.removeItem(cooldownKey);
}
onMounted(() => { updateCooldown(); cooldownTimer = setInterval(updateCooldown, 1000); });
onUnmounted(() => clearInterval(cooldownTimer));

function resetVerification() {
  verified.value = false;
  form.password = '';
  form.confirmPassword = '';
}

watch(() => props.modelValue, value => {
  visible.value = value;
  if (value) {
    Object.assign(form, blank());
    exampleCode.value = '';
    resetVerification();
    updateCooldown();
  }
});
watch(() => form.identifier, () => { form.smsCode = ''; exampleCode.value = ''; resetVerification(); });

function close() {
  visible.value = false;
  emit('update:modelValue', false);
}

async function sendCode() {
  if (!isMock || sending.value || cooldown.value > 0 || verified.value) return;
  const identifier = form.identifier.trim();
  if (!identifier) {
    ElMessage.warning(t('forgotPassword.identifierRequired'));
    return;
  }
  sending.value = true;
  try {
    const result = await sendSmsCode({ identifier, purpose: 'citizen-password-reset' });
    sessionStorage.setItem(cooldownKey, String(Date.now() + 60000));
    updateCooldown();
    if (identifier === form.identifier.trim()) exampleCode.value = result.smsCode || '';
    ElMessage.success(t('forgotPassword.smsSent'));
  } catch {
    /* handled by the request layer */
  } finally {
    sending.value = false;
  }
}

// Verify the SMS code first so a mistyped new password never forces another SMS request.
async function verifyCode() {
  if (verifying.value || verified.value) return;
  const identifier = form.identifier.trim();
  if (!identifier || !form.smsCode) return ElMessage.warning(t('forgotPassword.verifyRequired'));
  verifying.value = true;
  try {
    await verifySmsCode({ identifier, smsCode: form.smsCode, purpose: 'citizen-password-reset' });
    verified.value = true;
    ElMessage.success(t('forgotPassword.codeVerified'));
  } catch {
    /* handled by the request layer */
  } finally {
    verifying.value = false;
  }
}

async function submit() {
  if (submitting.value) return;
  const identifier = form.identifier.trim();
  if (!verified.value) { ElMessage.warning(t('forgotPassword.verifyRequired')); return; }
  if (!form.password || !form.confirmPassword) { ElMessage.warning(t('forgotPassword.passwordRequired')); return; }
  if (form.password.length < 8) { ElMessage.warning(t('forgotPassword.passwordTooShort')); return; }
  if (form.password !== form.confirmPassword) { ElMessage.warning(t('forgotPassword.passwordMismatch')); return; }
  submitting.value = true;
  try {
    await resetCitizenPassword({
      identifier,
      smsCode: form.smsCode,
      password: form.password,
      confirmPassword: form.confirmPassword
    });
    emit('done', { identifier });
    close();
    ElMessage.success(t('forgotPassword.success'));
  } catch {
    /* handled by the request layer */
  } finally {
    submitting.value = false;
    form.password = '';
    form.confirmPassword = '';
  }
}
</script>
