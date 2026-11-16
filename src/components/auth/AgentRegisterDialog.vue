<template>
  <el-dialog
    v-model="visible"
    :title="$t('agentAuth.title')"
    :width="dialogWidth"
    align-center
    :class="['agent-register-dialog', 'rcm-compact-dialog']"
    :before-close="close"
  >
    <el-alert :title="$t(isMock ? 'agentAuth.demoNotice' : 'agentAuth.liveNotice')" type="warning" :closable="false" show-icon class="mb-3" />

    <el-steps :active="stepIndex" finish-status="success" simple class="mb-4">
      <el-step :title="$t('agentAuth.companyStep')" />
      <el-step :title="$t('agentAuth.identityStep')" />
      <el-step :title="$t('agentAuth.accountStep')" />
    </el-steps>

    <!-- 第一步：Company Branch + Agent NO 身份认证 -->
    <div v-if="step === 'company'" class="agent-step">
      <el-form label-position="top">
        <el-form-item :label="$t('agentAuth.companyBranch')" required class="!mb-3">
          <el-select
            v-model="form.companyBranchCode"
            class="w-full"
            filterable
            :loading="directoryLoading"
            :placeholder="$t('agentAuth.companyBranchPlaceholder')"
            @change="resetCompanyVerification"
          >
            <el-option
              v-for="branch in branches"
              :key="branch.code"
              :value="branch.code"
              :label="branchName(branch)"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('agentAuth.agentNo')" required class="!mb-0">
          <el-input
            v-model.trim="form.agentNo"
            class="bidi-ltr"
            :placeholder="$t('agentAuth.agentNoPlaceholder')"
            @input="resetCompanyVerification"
          />
        </el-form-item>
      </el-form>

      <div class="agent-verify-row">
        <el-button type="primary" plain :loading="verifyingCompany" :disabled="!isMock" @click="verifyCompany">
          {{ $t('agentAuth.verifyCompany') }}
        </el-button>
        <span v-if="verification" class="agent-verified">
          <el-icon><CircleCheck /></el-icon>
          {{ $t('agentAuth.companyVerified') }}
        </span>
      </div>

      <dl v-if="verification" class="agent-summary">
        <div>
          <dt>{{ $t('agentAuth.shopName') }}</dt>
          <dd>{{ verification.shopName || '-' }}</dd>
        </div>
        <div>
          <dt>{{ $t('agentAuth.ownerName') }}</dt>
          <dd>{{ verification.ownerName || '-' }}</dd>
        </div>
        <div>
          <dt>{{ $t('agentAuth.companyBranch') }}</dt>
          <dd>{{ verification.branchName || verification.companyBranchCode }}</dd>
        </div>
      </dl>
    </div>

    <!-- 第二步：NFC 读取国民身份证芯片 + 人脸活体核验 -->
    <div v-else-if="step === 'identity'" class="agent-step">
      <div :class="isCompact ? 'space-y-4' : 'grid grid-cols-2 gap-4'">
        <section class="minimal-card">
          <h3 class="minimal-card-title">{{ $t('agentAuth.chipTitle') }}</h3>
          <p class="minimal-card-hint">{{ $t('agentAuth.chipHint') }}</p>
          <el-form label-position="top">
            <el-form-item :label="$t('agentAuth.nationalId')" required class="!mb-0">
              <el-input
                v-model.trim="form.nationalId"
                class="bidi-ltr"
                :disabled="Boolean(identity)"
                :placeholder="$t('agentAuth.nationalIdPlaceholder')"
                @input="resetIdentity"
              />
            </el-form-item>
          </el-form>
          <div class="minimal-readout">
            <el-icon :size="32"><CreditCard /></el-icon>
            <div v-if="identity?.name" class="text-sm font-semibold">{{ identity.name }}</div>
            <div><span dir="ltr" class="font-mono text-xs">{{ identity?.nationalId || form.nationalId }}</span></div>
            <p v-if="identity" class="text-xs">{{ $t('agentAuth.chipDone') }}</p>
          </div>
          <input ref="referenceInput" type="file" accept="image/jpeg,image/png" class="sr-only" @change="selectReference" />
          <div class="flex flex-wrap items-center gap-2">
            <el-button size="small" plain @click="chooseReference">{{ $t('agentAuth.referenceChoose') }}</el-button>
            <span v-if="referenceFile" class="minimal-file-name">{{ referenceFile.name }}</span>
          </div>
          <p v-if="referenceChecking" class="minimal-status" role="status">{{ $t('agentAuth.referenceChecking') }}</p>
          <p v-else-if="referenceReady" class="minimal-status is-ok">{{ $t('agentAuth.referenceReady') }}</p>
          <el-button class="w-full" type="primary" plain :loading="reading || referenceChecking" :disabled="!isMock || !verification" @click="readChip">
            {{ $t(identity ? 'agentAuth.chipRead' : 'agentAuth.chipButton') }}
          </el-button>
        </section>

        <section class="minimal-card">
          <h3 class="minimal-card-title">{{ $t('agentAuth.faceTitle') }}</h3>
          <p class="minimal-card-hint">{{ $t('agentAuth.faceHint') }}</p>
          <div class="minimal-readout">
            <img v-if="face?.image" :src="face.image" :alt="$t('agentAuth.faceTitle')" class="h-28 w-full object-contain rounded-lg" />
            <el-icon v-else :size="32"><Camera /></el-icon>
            <p v-if="face" class="text-xs">{{ $t('agentAuth.faceCaptured') }}</p>
          </div>
          <el-button class="w-full" type="primary" plain :disabled="!isMock || !identity || reading" @click="showFace = true">
            {{ $t('agentAuth.faceButton') }}
          </el-button>
        </section>
      </div>
    </div>

    <!-- 第三步：手机号、短信验证与登录密码 -->
    <div v-else class="agent-step">
      <el-button v-if="isMock && !smsVerified" size="small" plain class="mb-2" @click="fillExample">{{ $t('agentAuth.fillExample') }}</el-button>
      <el-form label-position="top">
        <el-form-item :label="$t('agentAuth.phone')" required class="!mb-3">
          <el-input v-model.trim="form.phone" class="bidi-ltr" inputmode="tel" :disabled="smsVerified" :placeholder="$t('agentAuth.phonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('agentAuth.smsCode')" required :class="smsVerified ? '!mb-2' : '!mb-0'">
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

      <template v-if="smsVerified">
        <div class="flex items-center gap-1.5 text-[11px] text-[#326445] mb-2">
          <el-icon><CircleCheck /></el-icon>
          <span>{{ $t('agentAuth.codeVerified') }}</span>
        </div>
        <el-form label-position="top">
          <el-form-item :label="$t('agentAuth.password')" required class="!mb-3">
            <el-input v-model="form.password" type="password" show-password autocomplete="new-password" :placeholder="$t('agentAuth.passwordPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('agentAuth.confirmPassword')" required class="!mb-0">
            <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password" :placeholder="$t('agentAuth.confirmPasswordPlaceholder')" />
          </el-form-item>
        </el-form>
      </template>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2 w-full">
        <el-button :disabled="step === 'company'" @click="back">{{ $t('agentAuth.back') }}</el-button>
        <el-button
          v-if="step !== 'account'"
          type="primary"
          :disabled="!isMock || (step === 'company' ? !verification : !identity || !face)"
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
          :disabled="!isMock"
          :loading="registering"
          @click="submit"
        >{{ $t('agentAuth.submit') }}</el-button>
      </div>
    </template>
  </el-dialog>

  <FaceLivenessVerifyDialog
    v-model="showFace"
    :target-name="identity?.name || form.nationalId"
    :target-national-id="form.nationalId"
    :allow-quick-pass="isMock"
    :prepared-reference="referenceFile"
    :prepared-token="cloudToken"
    auto-start
    @success="onFaceCaptured"
  />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Camera, CircleCheck, CreditCard } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { verifyAgentCredentials, readAgentRegistrationIdentity, registerAgent, sendSmsCode, verifySmsCode } from '../../api/auth.js';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';
import { getDefaultHuaweiIamToken } from '../../utils/huaweiIam.js';
import { checkReferenceImage } from '../../utils/liveFaceCompare.js';
import { getAgentCompanyBranches, localizeAgentNames, normalizeAgentNo, isValidAgentNo } from '../../utils/agentDirectory.js';
import { isValidNationalId, isValidPhone } from '../../utils/registrationCard.js';

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
const step = ref('company');
const stepIndex = computed(() => (step.value === 'account' ? 2 : step.value === 'identity' ? 1 : 0));

const branches = ref([]);
const directoryLoading = ref(false);
const verifyingCompany = ref(false);
const verification = ref(null);
const identity = ref(null);
const face = ref(null);
const reading = ref(false);
const showFace = ref(false);
const referenceInput = ref(null);
const referenceFile = ref(null);
const referenceChecking = ref(false);
const referenceReady = ref(false);
const cloudToken = ref(null);
const sending = ref(false);
const verifying = ref(false);
const registering = ref(false);
const smsVerified = ref(false);
const exampleCode = ref('');
const cooldown = ref(0);
const cooldownKey = 'rcm_agent_registration_sms_retry_at';
let cooldownTimer = null;
let referenceGeneration = 0;
let referenceController = null;
let tokenController = null;

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

function resetWizard() {
  Object.assign(form, {
    companyBranchCode: '', agentNo: '', nationalId: '',
    phone: '', password: '', confirmPassword: '', smsCode: ''
  });
  step.value = 'company';
  verification.value = null;
  identity.value = null;
  face.value = null;
  showFace.value = false;
  exampleCode.value = '';
  smsVerified.value = false;
  clearPrepared();
  updateCooldown();
}

function close() {
  visible.value = false;
  emit('update:modelValue', false);
}

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

function resetCompanyVerification() {
  verification.value = null;
  resetIdentity();
}

function resetIdentity() {
  identity.value = null;
  face.value = null;
  clearPrepared();
}

async function verifyCompany() {
  if (verifyingCompany.value) return;
  if (!form.companyBranchCode || !form.agentNo.trim()) {
    ElMessage.warning(t('agentAuth.companyRequired'));
    return;
  }
  if (!isValidAgentNo(form.agentNo)) {
    ElMessage.warning(t('agentAuth.agentNoInvalid'));
    return;
  }
  verifyingCompany.value = true;
  try {
    verification.value = await verifyAgentCredentials({
      companyBranchCode: form.companyBranchCode,
      agentNo: normalizeAgentNo(form.agentNo)
    });
    ElMessage.success(t('agentAuth.companyVerified'));
  } catch {
    verification.value = null;
  } finally {
    verifyingCompany.value = false;
  }
}

function chooseReference() {
  if (referenceInput.value) referenceInput.value.value = '';
  referenceInput.value?.click();
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

async function readChip() {
  if (reading.value || referenceChecking.value) return;
  if (!verification.value) {
    ElMessage.warning(t('agentAuth.companyRequired'));
    return;
  }
  const nationalId = form.nationalId.trim();
  if (!isValidNationalId(nationalId)) {
    ElMessage.warning(t('agentAuth.invalidNationalId'));
    return;
  }
  clearPrepared();
  identity.value = null;
  face.value = null;
  chooseReference();
  reading.value = true;
  const activeTokenController = new AbortController();
  tokenController = activeTokenController;
  try {
    identity.value = await readAgentRegistrationIdentity({
      verificationToken: verification.value.verificationToken,
      agentNo: verification.value.agentNo,
      companyBranchCode: form.companyBranchCode,
      nationalId
    });
    // The cloud token is only needed for real face comparison; the demo quick
    // pass stays available when the local environment has no IAM credentials.
    try {
      cloudToken.value = await getDefaultHuaweiIamToken({ signal: activeTokenController.signal });
      void prepareReference();
    } catch {
      cloudToken.value = null;
    }
  } catch {
    activeTokenController.abort();
    ElMessage.error(t('agentAuth.chipReadFailed'));
  } finally {
    reading.value = false;
    if (tokenController === activeTokenController) tokenController = null;
  }
}

async function prepareReference() {
  if (!identity.value || !cloudToken.value || !referenceFile.value) return;
  referenceController?.abort();
  const request = ++referenceGeneration;
  referenceController = new AbortController();
  referenceChecking.value = true;
  referenceReady.value = false;
  try {
    await checkReferenceImage({ ...cloudToken.value, referenceImage: referenceFile.value, signal: referenceController.signal });
    if (request === referenceGeneration) referenceReady.value = true;
  } catch (error) {
    if (request === referenceGeneration) {
      ElMessage.error(t(error.message === 'face_count' ? 'faceCompareDemo.faceCount' : 'agentAuth.referenceFailed'));
    }
  } finally {
    if (request === referenceGeneration) {
      referenceChecking.value = false;
      referenceController = null;
    }
  }
}

function onFaceCaptured(payload) {
  if (!payload) return;
  face.value = {
    ...payload,
    nationalId: payload.nationalId || form.nationalId.trim()
  };
}

function next() {
  if (step.value === 'company') {
    if (!verification.value) return ElMessage.warning(t('agentAuth.companyRequired'));
    step.value = 'identity';
    return;
  }
  if (step.value === 'identity') {
    if (!identity.value || !face.value) return ElMessage.warning(t('agentAuth.identityRequired'));
    step.value = 'account';
  }
}

function back() {
  if (step.value === 'account') { step.value = 'identity'; return; }
  if (step.value === 'identity') { step.value = 'company'; }
}

function fillExample() {
  Object.assign(form, { nationalId: '198004198271', phone: '07801234567' });
}

async function sendCode() {
  if (!isMock || sending.value || cooldown.value > 0 || smsVerified.value) return;
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
  if (!identity.value || !face.value) return ElMessage.warning(t('agentAuth.identityRequired'));
  if (!form.password || !form.confirmPassword) return ElMessage.warning(t('agentAuth.accountRequired'));
  if (form.password.length < 8) return ElMessage.warning(t('agentAuth.passwordTooShort'));
  if (form.password !== form.confirmPassword) return ElMessage.warning(t('agentAuth.passwordMismatch'));
  registering.value = true;
  try {
    const result = await registerAgent({
      verificationToken: verification.value.verificationToken,
      companyBranchCode: form.companyBranchCode,
      agentNo: normalizeAgentNo(form.agentNo),
      nationalId: form.nationalId.trim(),
      phone: form.phone.replace(/[\s-]/g, ''),
      password: form.password,
      confirmPassword: form.confirmPassword,
      smsCode: form.smsCode,
      readToken: identity.value.readToken,
      livenessCompleted: true,
      faceImage: face.value.image || '',
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
  max-height: calc(100dvh - 260px);
  overflow-y: auto;
  scrollbar-width: thin;
}
.agent-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.agent-verify-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.agent-verified {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #326445;
}
.agent-summary {
  margin: 0;
  padding: 12px;
  border: 1px solid #e5cea1;
  border-radius: 8px;
  background: #fdf3e0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.agent-summary > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.agent-summary dt {
  flex: 0 0 auto;
  font-size: 11px;
  color: #8a7a4e;
}
.agent-summary dd {
  margin: 0;
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  color: #5a4718;
  text-align: end;
  overflow-wrap: anywhere;
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
  min-height: 88px;
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
