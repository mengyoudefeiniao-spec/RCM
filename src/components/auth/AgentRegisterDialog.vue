<template>
  <el-dialog
    v-model="visible"
    :title="$t('agentAuth.title')"
    :width="dialogWidth"
    align-center
    :class="['agent-register-dialog', 'rcm-compact-dialog']"
    :before-close="close"
  >
    <!-- 第一步：代理归属与身份证核验；四张卡片分别引导拍照、NFC 读卡与人脸活体 -->
    <div v-if="step === 'identity'" class="agent-step">
      <el-form label-position="top">
        <el-form-item :label="$t('agentAuth.companyBranch')" required class="!mb-3">
          <el-select
            v-model="form.companyBranchCode"
            class="w-full"
            filterable
            :loading="directoryLoading"
            :placeholder="$t('agentAuth.companyBranchPlaceholder')"
            @change="resetChip"
          >
            <el-option
              v-for="branch in branches"
              :key="branch.code"
              :value="branch.code"
              :label="branchName(branch)"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('agentAuth.agentNo')" required class="!mb-3">
          <el-input
            v-model.trim="form.agentNo"
            class="bidi-ltr"
            :placeholder="$t('agentAuth.agentNoPlaceholder')"
            @input="resetChip"
          />
        </el-form-item>
        <el-form-item :label="$t('agentAuth.nationalId')" required class="!mb-0">
          <el-input
            v-model.trim="form.nationalId"
            class="bidi-ltr"
            inputmode="numeric"
            :placeholder="$t('agentAuth.nationalIdPlaceholder')"
            @input="resetChip"
          />
        </el-form-item>
      </el-form>

      <div class="identity-list">
        <input ref="frontInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handleIdentityImage($event, 'front')" />
        <input ref="backInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handleIdentityImage($event, 'back')" />

        <button
          type="button"
          class="identity-card"
          :class="{ 'is-done': Boolean(frontImage) }"
          :disabled="registering"
          :aria-label="$t('agentAuth.idFront')"
          @click="pickIdentityImage('front')"
        >
          <span class="identity-body">
            <span class="identity-title">{{ $t('agentAuth.idFront') }}</span>
            <span class="identity-hint">{{ $t('agentAuth.idFrontHint') }}</span>
            <span class="identity-status" :class="{ 'is-ok': Boolean(frontImage) }">
              {{ frontImage ? $t('agentAuth.cardDone') : $t('agentAuth.cardPending') }}
            </span>
          </span>
          <span class="identity-thumb">
            <img v-if="frontImage" :src="frontImage" :alt="$t('agentAuth.idFront')" />
            <el-icon v-else :size="26"><Postcard /></el-icon>
            <span v-if="frontImage" class="identity-badge"><el-icon :size="12"><CircleCheck /></el-icon></span>
          </span>
        </button>

        <button
          type="button"
          class="identity-card"
          :class="{ 'is-done': Boolean(backImage) }"
          :disabled="registering"
          :aria-label="$t('agentAuth.idBack')"
          @click="pickIdentityImage('back')"
        >
          <span class="identity-body">
            <span class="identity-title">{{ $t('agentAuth.idBack') }}</span>
            <span class="identity-hint">{{ $t('agentAuth.idBackHint') }}</span>
            <span class="identity-status" :class="{ 'is-ok': Boolean(backImage) }">
              {{ backImage ? $t('agentAuth.cardDone') : $t('agentAuth.cardPending') }}
            </span>
          </span>
          <span class="identity-thumb">
            <img v-if="backImage" :src="backImage" :alt="$t('agentAuth.idBack')" />
            <el-icon v-else :size="26"><Postcard /></el-icon>
            <span v-if="backImage" class="identity-badge"><el-icon :size="12"><CircleCheck /></el-icon></span>
          </span>
        </button>

        <button
          type="button"
          class="identity-card"
          :class="{ 'is-done': Boolean(identity), 'is-busy': reading }"
          :disabled="!isMock || reading || registering"
          :aria-label="$t('agentAuth.chipTitle')"
          @click="readChip"
        >
          <span class="identity-body">
            <span class="identity-title">{{ $t('agentAuth.chipTitle') }}</span>
            <span class="identity-hint">{{ $t('agentAuth.chipHint') }}</span>
            <span class="identity-status" :class="{ 'is-ok': Boolean(identity) && !reading }">
              {{ reading ? $t('agentAuth.cardReading') : identity ? $t('agentAuth.cardDone') : $t('agentAuth.cardPending') }}
            </span>
            <template v-if="identity && !reading">
              <span v-if="identity.shopName" class="identity-meta">{{ $t('agentAuth.shopName') }}: {{ identity.shopName }}</span>
              <span v-if="identity.branchName" class="identity-meta">{{ $t('agentAuth.companyBranch') }}: {{ identity.branchName }}</span>
              <span v-if="!identity.directoryMatched" class="identity-hint">{{ $t('agentAuth.directoryPending') }}</span>
            </template>
          </span>
          <span class="identity-thumb">
            <img v-if="chipPhoto" :src="chipPhoto" :alt="$t('agentAuth.chipTitle')" />
            <el-icon v-else :size="26"><Cpu /></el-icon>
            <span v-if="identity" class="identity-badge"><el-icon :size="12"><CircleCheck /></el-icon></span>
          </span>
        </button>

        <button
          type="button"
          class="identity-card"
          :class="{ 'is-done': Boolean(face) }"
          :disabled="!isMock || !identity || !frontImage || reading || registering"
          :aria-label="$t('agentAuth.faceTitle')"
          @click="startLiveness"
        >
          <span class="identity-body">
            <span class="identity-title">{{ $t('agentAuth.faceTitle') }}</span>
            <span class="identity-hint">{{ $t('agentAuth.faceHint') }}</span>
            <span class="identity-status" :class="{ 'is-ok': Boolean(face) }">
              {{ face ? $t('agentAuth.cardDone') : $t('agentAuth.cardPending') }}
            </span>
          </span>
          <span class="identity-thumb">
            <img v-if="face?.image" :src="face.image" :alt="$t('agentAuth.faceTitle')" />
            <el-icon v-else :size="26"><Camera /></el-icon>
            <span v-if="face" class="identity-badge"><el-icon :size="12"><CircleCheck /></el-icon></span>
          </span>
        </button>
      </div>
    </div>

    <!-- 第二步：手机号、登录密码与短信验证；先设密码，再发送验证码 -->
    <div v-else class="agent-step">
      <el-form label-position="top">
        <el-form-item :label="$t('agentAuth.phone')" required class="!mb-3">
          <el-input v-model.trim="form.phone" class="bidi-ltr" inputmode="tel" :disabled="smsVerified" :placeholder="$t('agentAuth.phonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('agentAuth.password')" required class="!mb-3">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" :placeholder="$t('agentAuth.passwordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('agentAuth.confirmPassword')" required class="!mb-3">
          <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password" :placeholder="$t('agentAuth.confirmPasswordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('agentAuth.smsCode')" required class="!mb-0">
          <div class="flex gap-2 w-full">
            <el-input v-model.trim="form.smsCode" class="bidi-ltr" maxlength="6" inputmode="numeric" :disabled="smsVerified" :placeholder="$t('agentAuth.smsPlaceholder')" />
            <el-button :loading="sending" :disabled="!isMock || smsVerified || cooldown > 0 || sending" @click="sendCode">
              {{ cooldown > 0 ? $t('agentAuth.resendCountdown', { seconds: cooldown }) : $t('agentAuth.sendCode') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <div v-if="exampleCode && !smsVerified" class="text-xs flex items-center gap-1 flex-wrap">
        <span>{{ $t('agentAuth.demoCode', { code: exampleCode }) }}</span>
        <el-button text type="primary" @click="form.smsCode = exampleCode">{{ $t('agentAuth.fillIn') }}</el-button>
      </div>
      <div v-if="smsVerified" class="flex items-center gap-1.5 text-[11px] text-[#326445]">
        <el-icon><CircleCheck /></el-icon>
        <span>{{ $t('agentAuth.codeVerified') }}</span>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2 w-full">
        <el-button :disabled="step === 'identity' || registering" @click="back">{{ $t('agentAuth.back') }}</el-button>
        <el-button
          v-if="step === 'identity'"
          type="primary"
          @click="next"
        >{{ $t('agentAuth.next') }}</el-button>
        <el-button
          v-else-if="!smsVerified"
          type="primary"
          :disabled="!isMock"
          :loading="verifying"
          @click="verifyCode"
        >{{ $t('agentAuth.verifySms') }}</el-button>
        <el-button
          v-else
          type="primary"
          :disabled="!isMock || !identityReady"
          :loading="registering"
          @click="submit"
        >{{ $t('agentAuth.submit') }}</el-button>
      </div>
    </template>
  </el-dialog>

  <FaceLivenessVerifyDialog
    v-model="showFace"
    :target-name="identity?.name || form.nationalId"
    :target-national-id="form.nationalId.trim()"
    :allow-quick-pass="isMock"
    :show-demo-hints="false"
    :prepared-reference="frontFile"
    :prepared-token="cloudToken"
    auto-start
    @success="onFaceCaptured"
  />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Camera, CircleCheck, Cpu, Postcard } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { readAgentRegistrationIdentity, registerAgent, sendSmsCode, verifySmsCode } from '../../api/auth.js';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';
import { getDefaultHuaweiIamToken } from '../../utils/huaweiIam.js';
import { getAgentCompanyBranches, localizeAgentNames, normalizeAgentNo } from '../../utils/agentDirectory.js';
import { isValidNationalId, isValidPhone } from '../../utils/registrationCard.js';
import { identityStepCompletion, chipMatchPassed, readPhoto, compressPhoto, dataUrlToFile } from '../../utils/registrationIdentity.js';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'registered']);
const { t, locale } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const visible = ref(props.modelValue);

const form = reactive({
  companyBranchCode: '',
  agentNo: '',
  nationalId: '',
  phone: '',
  password: '',
  confirmPassword: '',
  smsCode: ''
});
const step = ref('identity');

const branches = ref([]);
const directoryLoading = ref(false);
const identity = ref(null);
const reading = ref(false);
const chipPhoto = ref('');
const frontImage = ref('');
const backImage = ref('');
const frontFile = ref(null);
const backFile = ref(null);
const frontInputRef = ref(null);
const backInputRef = ref(null);
const face = ref(null);
const showFace = ref(false);
const cloudToken = ref(null);
const sending = ref(false);
const verifying = ref(false);
const registering = ref(false);
const smsVerified = ref(false);
const exampleCode = ref('');
const cooldown = ref(0);
const cooldownKey = 'rcm_agent_registration_sms_retry_at';
let cooldownTimer = null;

const identityState = computed(() => identityStepCompletion({
  frontImage: frontImage.value,
  backImage: backImage.value,
  chipRead: identity.value,
  liveness: face.value,
  nationalId: form.nationalId.trim()
}));
const identityReady = computed(() => Object.values(identityState.value).every(Boolean) && chipMatchPassed(face.value?.similarity));

function branchName(branch) {
  return localizeAgentNames(branch?.names, locale.value) || branch?.code || '';
}

function updateCooldown() {
  const retryAt = Number(sessionStorage.getItem(cooldownKey)) || 0;
  cooldown.value = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
  if (!cooldown.value) sessionStorage.removeItem(cooldownKey);
}

onMounted(() => {
  updateCooldown();
  cooldownTimer = setInterval(updateCooldown, 1000);
});
onUnmounted(() => clearInterval(cooldownTimer));

watch(() => props.modelValue, value => {
  visible.value = value;
  if (value) {
    resetWizard();
    if (!branches.value.length) loadBranches();
  }
});

async function loadBranches() {
  if (directoryLoading.value) return;
  directoryLoading.value = true;
  try {
    branches.value = await getAgentCompanyBranches();
  } catch {
    branches.value = [];
    ElMessage.error(t('registerWizard.optionsFailed'));
  } finally {
    directoryLoading.value = false;
  }
}

function resetChip() {
  identity.value = null;
  chipPhoto.value = '';
  face.value = null;
  cloudToken.value = null;
  showFace.value = false;
}

function resetIdentity() {
  resetChip();
  frontImage.value = '';
  backImage.value = '';
  frontFile.value = null;
  backFile.value = null;
  if (frontInputRef.value) frontInputRef.value.value = '';
  if (backInputRef.value) backInputRef.value.value = '';
}

function resetWizard() {
  Object.assign(form, {
    companyBranchCode: '', agentNo: '', nationalId: '',
    phone: '', password: '', confirmPassword: '', smsCode: ''
  });
  step.value = 'identity';
  exampleCode.value = '';
  smsVerified.value = false;
  resetIdentity();
  updateCooldown();
}

function close() {
  visible.value = false;
  emit('update:modelValue', false);
}

function pickIdentityImage(side) {
  const input = side === 'front' ? frontInputRef.value : backInputRef.value;
  if (input) input.value = '';
  input?.click();
}

async function handleIdentityImage(event, side) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    ElMessage.warning(t('agentAuth.imageError'));
    return;
  }
  try {
    const dataUrl = await compressPhoto(await readPhoto(file), 1000, 0.7);
    const stored = await dataUrlToFile(dataUrl, side === 'front' ? 'agent-identity-front.jpg' : 'agent-identity-back.jpg');
    if (side === 'front') {
      frontImage.value = dataUrl;
      frontFile.value = stored;
      // The front photo is the liveness reference, so a new capture invalidates it.
      face.value = null;
    } else {
      backImage.value = dataUrl;
      backFile.value = stored;
    }
  } catch {
    ElMessage.error(t('agentAuth.imageError'));
  }
}

async function readChip() {
  if (reading.value) return;
  if (!form.companyBranchCode || !form.agentNo.trim()) {
    ElMessage.warning(t('agentAuth.companyRequired'));
    return;
  }
  const nationalId = form.nationalId.trim();
  if (!isValidNationalId(nationalId)) {
    ElMessage.warning(t('agentAuth.invalidNationalId'));
    return;
  }
  resetChip();
  reading.value = true;
  try {
    const result = await readAgentRegistrationIdentity({
      agentNo: normalizeAgentNo(form.agentNo),
      companyBranchCode: form.companyBranchCode,
      nationalId
    });
    identity.value = result;
    chipPhoto.value = result?.chipPhoto || '';
    try {
      cloudToken.value = await getDefaultHuaweiIamToken();
    } catch {
      cloudToken.value = null;
    }
  } catch {
    identity.value = null;
    ElMessage.error(t('agentAuth.chipReadFailed'));
  } finally {
    reading.value = false;
  }
}

function startLiveness() {
  if (!identity.value) return ElMessage.warning(t('agentAuth.identityRequired'));
  if (!frontFile.value) return ElMessage.warning(t('agentAuth.identityRequired'));
  showFace.value = true;
}

function onFaceCaptured(payload) {
  if (!payload) return;
  face.value = { ...payload, nationalId: payload.nationalId || form.nationalId.trim() };
}

function next() {
  if (step.value !== 'identity') return;
  if (!form.companyBranchCode || !form.agentNo.trim()) {
    return ElMessage.warning(t('agentAuth.companyRequired'));
  }
  const nationalId = form.nationalId.trim();
  if (!isValidNationalId(nationalId)) {
    return ElMessage.warning(t('agentAuth.invalidNationalId'));
  }
  if (!identityReady.value) return ElMessage.warning(t('agentAuth.identityRequired'));
  step.value = 'account';
}

function back() {
  if (step.value === 'account') step.value = 'identity';
}

async function sendCode() {
  if (!isMock || sending.value || cooldown.value > 0 || smsVerified.value) return;
  if (!form.password || !form.confirmPassword) {
    ElMessage.warning(t('agentAuth.accountRequired'));
    return;
  }
  if (form.password.length < 8) {
    ElMessage.warning(t('agentAuth.passwordTooShort'));
    return;
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning(t('agentAuth.passwordMismatch'));
    return;
  }
  const phone = form.phone.replace(/[\s-]/g, '');
  if (!isValidPhone(phone)) {
    ElMessage.warning(t('agentAuth.invalidPhone'));
    return;
  }
  sending.value = true;
  try {
    const result = await sendSmsCode({ phone, purpose: 'agent-registration' });
    sessionStorage.setItem(cooldownKey, String(Date.now() + 60000));
    updateCooldown();
    if (phone === form.phone.replace(/[\s-]/g, '')) exampleCode.value = result.smsCode || '';
    ElMessage.success(t('agentAuth.smsSent'));
  } catch {
    /* handled by the request layer */
  } finally {
    sending.value = false;
  }
}

async function verifyCode() {
  if (verifying.value || smsVerified.value) return;
  const phone = form.phone.replace(/[\s-]/g, '');
  if (!phone || !form.smsCode) return ElMessage.warning(t('agentAuth.verifyRequired'));
  if (!isValidPhone(phone)) return ElMessage.warning(t('agentAuth.invalidPhone'));
  verifying.value = true;
  try {
    await verifySmsCode({ phone, smsCode: form.smsCode, purpose: 'agent-registration' });
    smsVerified.value = true;
    ElMessage.success(t('agentAuth.codeVerified'));
  } catch {
    /* handled by the request layer */
  } finally {
    verifying.value = false;
  }
}

async function submit() {
  if (registering.value) return;
  if (!smsVerified.value) return ElMessage.warning(t('agentAuth.verifyRequired'));
  if (!identityReady.value) return ElMessage.warning(t('agentAuth.identityRequired'));
  if (!form.password || !form.confirmPassword) return ElMessage.warning(t('agentAuth.accountRequired'));
  if (form.password.length < 8) return ElMessage.warning(t('agentAuth.passwordTooShort'));
  if (form.password !== form.confirmPassword) return ElMessage.warning(t('agentAuth.passwordMismatch'));
  registering.value = true;
  try {
    const result = await registerAgent({
      verificationToken: identity.value.verificationToken,
      companyBranchCode: form.companyBranchCode,
      agentNo: normalizeAgentNo(form.agentNo),
      nationalId: form.nationalId.trim(),
      phone: form.phone.replace(/[\s-]/g, ''),
      password: form.password,
      confirmPassword: form.confirmPassword,
      smsCode: form.smsCode,
      readToken: identity.value.readToken,
      chipName: identity.value.name || '',
      chipMatchScore: Number(face.value?.similarity) || 0,
      faceImage: face.value?.image || '',
      identityFrontImage: frontImage.value,
      identityBackImage: backImage.value,
      chipPhotoAvailable: Boolean(chipPhoto.value),
      livenessCompleted: true,
      simulated: true
    });
    emit('registered', { ...result, username: normalizeAgentNo(form.agentNo) });
    close();
    ElMessageBox.alert(t('agentAuth.registered'), t('agentAuth.title')).catch(() => {});
  } catch {
    /* handled by the request layer */
  } finally {
    registering.value = false;
    form.password = '';
    form.confirmPassword = '';
  }
}
</script>

<style scoped>
.agent-register-dialog :deep(.el-dialog__body) {
  max-height: calc(100dvh - 240px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #32644533 transparent;
}
.agent-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* 身份核验：四张纵向卡片，点击整卡触发，随弹窗上下滚动 */
.identity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.identity-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 12px;
  border: 1px solid #d9e5db;
  border-radius: 12px;
  background: #ffffff;
  font: inherit;
  color: inherit;
  text-align: start;
  cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
}
.identity-card:hover:not(:disabled) {
  border-color: #c9dbce;
  background: #f8fbf9;
}
.identity-card:focus-visible {
  outline: none;
  border-color: #d3af62;
  box-shadow: 0 0 0 2px rgba(211, 175, 98, .25);
}
.identity-card.is-done {
  border-color: #c7e0ce;
  background: #f8fbf9;
}
.identity-card:disabled {
  cursor: not-allowed;
  opacity: .62;
}
.identity-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}
.identity-title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f3326;
  overflow-wrap: anywhere;
}
.identity-hint {
  font-size: 11px;
  line-height: 1.6;
  color: #58685d;
  overflow-wrap: anywhere;
}
.identity-status {
  font-size: 11px;
  line-height: 1.5;
  color: #8a9a8f;
}
.identity-status.is-ok {
  color: #326445;
  font-weight: 700;
}
.identity-meta {
  font-size: 11px;
  line-height: 1.5;
  color: #43554b;
  overflow-wrap: anywhere;
}
.identity-thumb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 64px;
  border: 1px solid #d9e5db;
  border-radius: 8px;
  background: #f3f8f4;
  color: #8a9a8f;
  overflow: hidden;
}
.identity-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.identity-badge {
  position: absolute;
  inset-block-start: 4px;
  inset-inline-end: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #326445;
  color: #ffffff;
}
@media (max-width: 420px) {
  .identity-card { grid-template-columns: minmax(0, 1fr) 84px; }
  .identity-thumb { width: 84px; height: 58px; }
}
</style>
