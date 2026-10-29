<template>
  <el-dialog v-model="visible" :title="$t('register.title')" :width="dialogWidth" align-center :class="{ 'rcm-compact-dialog': isCompact }" :before-close="close">
    <el-alert :title="$t(isMock ? 'registrationFlow.demoNotice' : 'registrationFlow.liveNotice')" type="warning" :closable="false" show-icon class="mb-4" />
    <el-button v-if="isMock" class="mb-4" plain @click="fillExample">{{ $t('registrationFlow.fillExample') }}</el-button>
    <el-form label-position="top">
      <el-form-item :label="$t('common.province')" required>
        <el-select v-model="form.province" class="w-full" :placeholder="$t('registrationFlow.chooseProvince')">
          <el-option v-for="province in provinces" :key="province" :value="province" :label="$t(`registrationFlow.provinces.${province}`)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('registrationFlow.nationalId')" required><el-input v-model.trim="form.nationalId" class="bidi-ltr" /></el-form-item>
      <el-form-item :label="$t('registrationFlow.phone')" required><el-input v-model.trim="form.phone" class="bidi-ltr" /></el-form-item>
      <el-form-item :label="$t('register.smsLabel')" required>
        <div class="flex gap-2 w-full"><el-input v-model.trim="form.smsCode" class="bidi-ltr" maxlength="6" /><el-button :loading="sending" :disabled="!isMock || cooldown > 0 || sending" @click="sendCode">{{ cooldown > 0 ? $t('registrationFlow.resendCountdown', { seconds: cooldown }) : $t('register.getSmsCode') }}</el-button></div>
      </el-form-item>
      <div v-if="exampleCode" class="mb-3 text-sm"><span>{{ $t('registrationFlow.demoCode', { code: exampleCode }) }}</span> <el-button text type="primary" @click="form.smsCode = exampleCode">{{ $t('register.fillIn') }}</el-button></div>
    </el-form>
    <template #footer><el-button type="primary" :disabled="!isMock" :loading="registering" @click="submit">{{ $t('registrationFlow.finish') }}</el-button></template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { sendSmsCode, registerCitizen } from '../../api/auth.js';

const props = defineProps({ modelValue: Boolean, demoMode: Boolean });
const emit = defineEmits(['update:modelValue', 'registered']);
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const visible = ref(props.modelValue);
const provinces = ['baghdad','nineveh','basra','diyala','kirkuk','anbar','erbil','sulaymaniyah','duhok','babylon','karbala','najaf','wasit','salahuddin','qadisiyyah','muthanna','dhiqar','maysan','halabja'];
const blank = () => ({ province: '', nationalId: '', phone: '', smsCode: '' });
const form = reactive(blank());
const exampleCode = ref('');
const sending = ref(false);
const registering = ref(false);
const cooldown = ref(0);
const cooldownKey = 'rcm_registration_sms_retry_at';
let cooldownTimer;
function updateCooldown() {
  const retryAt = Number(sessionStorage.getItem(cooldownKey)) || 0;
  cooldown.value = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
  if (!cooldown.value) sessionStorage.removeItem(cooldownKey);
}
onMounted(() => { updateCooldown(); cooldownTimer = setInterval(updateCooldown, 1000); });
onUnmounted(() => clearInterval(cooldownTimer));
watch(() => props.modelValue, value => { visible.value = value; if (value) { Object.assign(form, blank()); exampleCode.value = ''; updateCooldown(); } });
watch(() => form.phone, () => { form.smsCode = ''; exampleCode.value = ''; });
function close() { visible.value = false; emit('update:modelValue', false); }
function fillExample() { Object.assign(form, { province: 'baghdad', nationalId: '198004198271', phone: '07801234567' }); }
async function sendCode() {
  if (!isMock || sending.value || cooldown.value > 0) return;
  if (!form.phone) { ElMessage.warning(t('register.msgPhoneRequired')); return; }
  sending.value = true;
  const phone = form.phone;
  try {
    const res = await sendSmsCode({ phone, purpose: 'citizen-registration' });
    sessionStorage.setItem(cooldownKey, String(Date.now() + 60000));
    updateCooldown();
    if (phone === form.phone) exampleCode.value = res.smsCode || '';
  }
  catch { ElMessage.error(t('register.msgSmsFail')); }
  finally { sending.value = false; }
}
async function submit() {
  if (!form.province || !form.nationalId || !form.phone || !form.smsCode) { ElMessage.warning(t('registrationFlow.required')); return; }
  registering.value = true;
  try {
    const result = await registerCitizen({ ...form });
    emit('registered', result);
    close();
    ElMessageBox.alert(t('registrationFlow.demoRegistered', { password: result.demoPassword }), t('register.title')).catch(() => {});
  } catch { ElMessage.error(t('register.msgRegisterFail')); }
  finally { registering.value = false; }
}
</script>
