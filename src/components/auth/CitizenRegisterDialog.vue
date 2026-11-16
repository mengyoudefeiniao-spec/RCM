<template>
  <el-dialog v-model="visible" :title="$t('registerWizard.title')" :width="dialogWidth" align-center :class="{ 'rcm-compact-dialog': isCompact, 'register-wizard-dialog': true }" :before-close="close">
    <el-alert :title="$t(isMock ? 'registerWizard.demoNotice' : 'registerWizard.liveNotice')" type="warning" :closable="false" show-icon class="mb-3" />

    <!-- 第一步：配给卡持有情况 -->
    <div v-if="step === 'cardType'" class="card-type-list">
      <button
        v-for="option in cardTypeOptions"
        :key="option.value"
        type="button"
        class="card-type-option"
        :class="{ 'is-active': form.cardType === option.value }"
        :aria-pressed="form.cardType === option.value"
        @click="form.cardType = option.value"
      >
        <span class="card-type-dot" aria-hidden="true" />
        <span class="card-type-label">{{ $t(`registerWizard.${option.title}`) }}</span>
      </button>
    </div>

    <!-- 第二步：拍照与 OCR 识别 -->
    <div v-else-if="step === 'scan'" class="space-y-3">
      <input ref="photoInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handlePhotoSelected" />
      <div v-if="!photo" class="border-2 border-dashed border-[#C4D6C8] rounded-lg p-6 text-center bg-[#F3F8F4]">
        <div class="flex flex-col items-center gap-2">
          <div class="p-2 bg-white rounded-full text-[#D3AF62] border border-[#D9E5DB]">
            <el-icon :size="22"><Camera /></el-icon>
          </div>
          <el-button type="primary" size="small" data-demo-target="btn-capture" @click="triggerPhotoSelect">{{ $t('registerWizard.captureBtn') }}</el-button>
        </div>
      </div>
      <template v-else>
        <div class="relative rounded-lg overflow-hidden border border-[#D9E5DB] bg-[#F3F8F4]">
          <img :src="photo" :alt="$t('registerWizard.previewAlt')" class="block w-full max-h-56 object-contain" />
          <el-button size="small" class="absolute top-2 end-2" :loading="scanning" @click="triggerPhotoSelect">{{ $t('registerWizard.retakeBtn') }}</el-button>
        </div>
        <div v-if="scanning" class="flex items-center gap-2 text-xs text-[#326445]">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>{{ $t('registerWizard.scanning') }}</span>
        </div>
        <template v-else>
          <el-form label-position="top">
            <el-form-item :label="$t('registerWizard.ocrCardNo')" required class="!mb-2">
              <el-input v-model.trim="form.cardNo" class="bidi-ltr" data-demo-target="input-card-no" :placeholder="$t('registerWizard.cardNoRequired')" />
            </el-form-item>
          </el-form>
          <div v-if="ocr" class="flex items-center justify-between gap-2 text-[11px] text-[#58685D]">
            <span class="truncate">{{ $t('registerWizard.ocrHeadName') }}：{{ ocr.headName || '-' }}</span>
            <el-tag v-if="ocr.confidenceScore" size="small" type="success" effect="light">
              {{ Math.round(ocr.confidenceScore * 100) }}%
            </el-tag>
          </div>
          <p v-if="scanFailed" class="text-[11px] text-[#B54A4A] leading-relaxed">{{ $t('registerWizard.ocrFailed') }}</p>
        </template>
      </template>
    </div>

    <!-- 第三步：配给中心、卡号与代理编号 -->
    <div v-else-if="step === 'cardSelect'" class="space-y-3">
      <div v-if="optionsError" class="p-3 rounded-lg border border-[#F2E3C6] bg-[#FDF3E0] text-[11px] text-[#5A4718] flex items-center justify-between gap-2 flex-wrap">
        <span>{{ $t('registerWizard.optionsFailed') }}</span>
        <el-button size="small" plain @click="loadOptions">{{ $t('registerWizard.reloadOptions') }}</el-button>
      </div>

      <el-form label-position="top">
        <el-form-item :label="$t('registerWizard.center')" required class="!mb-3">
          <el-select
            v-model="form.centerId"
            class="w-full"
            filterable
            :loading="optionsLoading"
            :placeholder="$t('registerWizard.centerPlaceholder')"
            @change="handleCenterChange"
          >
            <el-option-group v-for="group in centerGroups" :key="group.key" :label="group.label">
              <el-option
                v-for="center in group.centers"
                :key="center.centerId"
                :value="center.centerId"
                :label="`${center.centerName} (#${center.centerId})`"
              />
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('registerWizard.rationCardNo')" :required="form.cardType !== 'none'" class="!mb-3">
          <el-input v-model.trim="form.cardNo" class="bidi-ltr" :placeholder="$t('registerWizard.rationCardNoPlaceholder')" />
        </el-form-item>

        <div class="grid gap-3" :class="isCompact ? 'grid-cols-1' : 'grid-cols-2'">
          <el-form-item :label="$t('registerWizard.foodAgent')" required class="!mb-3 min-w-0">
            <el-select v-model="form.foodAgentId" class="w-full" :disabled="!selectedCenter" :placeholder="$t('registerWizard.foodAgentPlaceholder')">
              <el-option
                v-for="agent in selectedCenter?.foodAgents || []"
                :key="agent.id"
                :value="agent.id"
                :label="`${agent.id} · ${agent.name}`"
                :disabled="isAgentFull(agent)"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="truncate">{{ agent.name }}</span>
                  <span class="text-[11px] shrink-0" :class="isAgentFull(agent) ? 'text-[#B54A4A]' : 'text-[#8A9A8F]'">
                    {{ isAgentFull(agent) ? $t('registerWizard.agentFull') : agent.id }}
                  </span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item class="!mb-3 min-w-0">
            <template #label>
              <span>{{ $t('registerWizard.flourAgent') }}<span class="text-[10px] text-[#8A9A8F] font-normal ms-1">{{ $t('registerWizard.optional') }}</span></span>
            </template>
            <el-select
              v-model="form.flourAgentId"
              class="w-full"
              clearable
              :disabled="!selectedCenter"
              :placeholder="$t('registerWizard.flourAgentPlaceholder')"
            >
              <el-option
                v-for="agent in selectedCenter?.flourAgents || []"
                :key="agent.id"
                :value="agent.id"
                :label="`${agent.id} · ${agent.name}`"
                :disabled="isAgentFull(agent)"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="truncate">{{ agent.name }}</span>
                  <span class="text-[11px] shrink-0" :class="isAgentFull(agent) ? 'text-[#B54A4A]' : 'text-[#8A9A8F]'">
                    {{ isAgentFull(agent) ? $t('registerWizard.agentFull') : agent.id }}
                  </span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 第四步：身份验证（短信验证通过后设置登录密码） -->
    <div v-else class="space-y-3">
      <el-button v-if="isMock && !smsVerified" size="small" plain @click="fillExample">{{ $t('registerWizard.fillExample') }}</el-button>
      <el-form label-position="top">
        <el-form-item :label="$t('registerWizard.nationalId')" required class="!mb-3">
          <el-input v-model.trim="form.nationalId" class="bidi-ltr" :disabled="smsVerified" :placeholder="$t('registerWizard.nationalIdPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('registerWizard.phone')" required class="!mb-3">
          <el-input v-model.trim="form.phone" class="bidi-ltr" inputmode="tel" :disabled="smsVerified" :placeholder="$t('registerWizard.phonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('registerWizard.smsCode')" required :class="smsVerified ? '!mb-2' : ''">
          <div class="flex gap-2 w-full">
            <el-input v-model.trim="form.smsCode" class="bidi-ltr" maxlength="6" inputmode="numeric" :disabled="smsVerified" :placeholder="$t('registerWizard.smsPlaceholder')" />
            <el-button data-demo-target="btn-get-sms" :loading="sending" :disabled="!isMock || smsVerified || cooldown > 0 || sending" @click="sendCode">
              {{ cooldown > 0 ? $t('registerWizard.resendCountdown', { seconds: cooldown }) : $t('registerWizard.sendCode') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <div v-if="exampleCode && !smsVerified" class="text-xs flex items-center gap-1 flex-wrap">
        <span>{{ $t('registerWizard.demoCode', { code: exampleCode }) }}</span>
        <el-button text type="primary" data-demo-target="btn-fill-sms" @click="form.smsCode = exampleCode">{{ $t('registerWizard.fillIn') }}</el-button>
      </div>

      <template v-if="smsVerified">
        <div class="flex items-center gap-1.5 text-[11px] text-[#326445]">
          <el-icon><CircleCheck /></el-icon>
          <span>{{ $t('registerWizard.codeVerified') }}</span>
        </div>
        <el-form label-position="top">
          <el-form-item :label="$t('registerWizard.password')" required class="!mb-3">
            <el-input v-model="form.password" type="password" show-password autocomplete="new-password" :placeholder="$t('registerWizard.passwordPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('registerWizard.confirmPassword')" required class="!mb-0">
            <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password" :placeholder="$t('registerWizard.confirmPasswordPlaceholder')" />
          </el-form-item>
        </el-form>
      </template>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2 w-full">
        <el-button :disabled="step === 'cardType'" @click="back">{{ $t('registerWizard.back') }}</el-button>
        <el-button
          v-if="step !== 'account'"
          type="primary"
          :disabled="!isMock || optionsLoading"
          @click="next"
        >{{ step === 'scan' ? $t('registerWizard.confirmCardNo') : $t('registerWizard.next') }}</el-button>
        <el-button
          v-else-if="!smsVerified"
          type="primary"
          data-demo-target="btn-verify-sms"
          :disabled="!isMock"
          :loading="verifying"
          @click="verifyCode"
        >{{ $t('registerWizard.verifyCode') }}</el-button>
        <el-button
          v-else
          type="primary"
          data-demo-target="btn-finish-reg"
          :disabled="!isMock"
          :loading="registering"
          @click="submit"
        >{{ $t('registerWizard.submit') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Camera, Loading, CircleCheck } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { sendSmsCode, verifySmsCode, registerCitizen, ocrScanPaperCard } from '../../api/auth.js';
import { getTransferOptions } from '../../api/citizen.js';
import { CARD_TYPES, cardTypeNeedsScan, normalizeRationCardNo, isValidNationalId, isValidPhone } from '../../utils/registrationCard.js';

const props = defineProps({ modelValue: Boolean, demoMode: Boolean });
const emit = defineEmits(['update:modelValue', 'registered']);
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const visible = ref(props.modelValue);

const cardTypeOptions = [
  { value: CARD_TYPES.PAPER, title: 'paperCard' },
  { value: CARD_TYPES.ELECTRONIC, title: 'electronicCard' },
  { value: CARD_TYPES.NONE, title: 'noCard' }
];

const blank = () => ({
  cardType: '',
  cardNo: '',
  centerId: '',
  foodAgentId: '',
  flourAgentId: '',
  nationalId: '',
  phone: '',
  password: '',
  confirmPassword: '',
  smsCode: ''
});
const form = reactive(blank());
const step = ref('cardType');
const photoInputRef = ref(null);
const photo = ref('');
const ocr = ref(null);
const scanning = ref(false);
const scanFailed = ref(false);
const options = ref([]);
const optionsLoading = ref(false);
const optionsError = ref(false);
const exampleCode = ref('');
const sending = ref(false);
const verifying = ref(false);
const registering = ref(false);
const smsVerified = ref(false);
const cooldown = ref(0);
const cooldownKey = 'rcm_registration_sms_retry_at';
let cooldownTimer;

const centerGroups = computed(() => options.value.flatMap((province, provinceIndex) => province.branches.map((branch, branchIndex) => ({
  key: `${provinceIndex}-${branchIndex}`,
  label: `${province.province} · ${branch.branchName}`,
  centers: branch.centers
}))));
const selectedCenter = computed(() => centerGroups.value.flatMap(group => group.centers).find(center => center.centerId === form.centerId) || null);

function isAgentFull(agent) {
  return Number(agent.currentHouseholds) >= Number(agent.maxCapacity);
}

function updateCooldown() {
  const retryAt = Number(sessionStorage.getItem(cooldownKey)) || 0;
  cooldown.value = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
  if (!cooldown.value) sessionStorage.removeItem(cooldownKey);
}
onMounted(() => { updateCooldown(); cooldownTimer = setInterval(updateCooldown, 1000); });
onUnmounted(() => clearInterval(cooldownTimer));

watch(() => props.modelValue, value => {
  visible.value = value;
  if (value) {
    resetWizard();
    if (!options.value.length) loadOptions();
  }
});
watch(() => form.phone, () => {
  form.smsCode = '';
  exampleCode.value = '';
  resetVerification();
});

function resetVerification() {
  smsVerified.value = false;
  form.password = '';
  form.confirmPassword = '';
}

function resetWizard() {
  Object.assign(form, blank());
  step.value = 'cardType';
  photo.value = '';
  ocr.value = null;
  scanFailed.value = false;
  scanning.value = false;
  exampleCode.value = '';
  resetVerification();
  updateCooldown();
}

function close() {
  visible.value = false;
  emit('update:modelValue', false);
}

async function loadOptions() {
  if (optionsLoading.value) return;
  optionsLoading.value = true;
  optionsError.value = false;
  try {
    const result = await getTransferOptions();
    options.value = Array.isArray(result) ? result : [];
  } catch {
    options.value = [];
    optionsError.value = true;
  } finally {
    optionsLoading.value = false;
  }
}

function handleCenterChange() {
  form.foodAgentId = '';
  form.flourAgentId = '';
}

function triggerPhotoSelect() {
  photoInputRef.value?.click();
}

function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Card photos are downscaled before upload so the PocketBase archive record stays small.
function compressPhoto(dataUrl, maxSize = 1600, quality = 0.82) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) return resolve(dataUrl);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try { resolve(canvas.toDataURL('image/jpeg', quality)); }
      catch { resolve(dataUrl); }
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

async function handlePhotoSelected(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    ElMessage.warning(t('registerWizard.photoRequired'));
    return;
  }
  try {
    photo.value = await compressPhoto(await readPhoto(file));
  } catch {
    ElMessage.error(t('registerWizard.ocrFailed'));
    return;
  }
  await runOcr();
}

async function runOcr() {
  scanning.value = true;
  scanFailed.value = false;
  ocr.value = null;
  try {
    const result = await ocrScanPaperCard({ cardType: form.cardType });
    ocr.value = result;
    form.cardNo = normalizeRationCardNo(result?.cardNo || result?.paperCardNo || '');
    if (!form.cardNo) scanFailed.value = true;
  } catch {
    // The request layer already surfaces the localized validation message.
    scanFailed.value = true;
  } finally {
    scanning.value = false;
  }
}

function next() {
  if (step.value === 'cardType') {
    if (!form.cardType) return ElMessage.warning(t('registerWizard.required'));
    step.value = cardTypeNeedsScan(form.cardType) ? 'scan' : 'cardSelect';
    return;
  }
  if (step.value === 'scan') {
    if (!photo.value) return ElMessage.warning(t('registerWizard.photoRequired'));
    if (!form.cardNo) return ElMessage.warning(t('registerWizard.cardNoRequired'));
    step.value = 'cardSelect';
    return;
  }
  if (step.value === 'cardSelect') {
    if (!form.centerId || !form.foodAgentId) return ElMessage.warning(t('registerWizard.selectCardRequired'));
    if (form.cardType !== CARD_TYPES.NONE && !form.cardNo) return ElMessage.warning(t('registerWizard.cardNoRequired'));
    step.value = 'account';
  }
}

function back() {
  if (step.value === 'account') { resetVerification(); step.value = 'cardSelect'; return; }
  if (step.value === 'cardSelect') { step.value = cardTypeNeedsScan(form.cardType) ? 'scan' : 'cardType'; return; }
  if (step.value === 'scan') step.value = 'cardType';
}

function fillExample() {
  Object.assign(form, { nationalId: '198004198271', phone: '07801234567' });
}

async function sendCode() {
  if (!isMock || sending.value || cooldown.value > 0 || smsVerified.value) return;
  if (!form.phone) {
    ElMessage.warning(t('registerWizard.phonePlaceholder'));
    return;
  }
  sending.value = true;
  const phone = form.phone;
  try {
    const result = await sendSmsCode({ phone, purpose: 'citizen-registration' });
    sessionStorage.setItem(cooldownKey, String(Date.now() + 60000));
    updateCooldown();
    if (phone === form.phone) exampleCode.value = result.smsCode || '';
    ElMessage.success(t('registerWizard.smsSent'));
  } catch {
    /* handled by the request layer */
  } finally {
    sending.value = false;
  }
}

// The SMS code is verified before the password fields appear, so a mistyped password never costs another SMS.
async function verifyCode() {
  if (verifying.value || smsVerified.value) return;
  const nationalId = form.nationalId.trim();
  const phone = form.phone.replace(/[\s-]/g, '');
  if (!nationalId || !phone || !form.smsCode) return ElMessage.warning(t('registerWizard.verifyRequired'));
  if (!isValidNationalId(nationalId)) return ElMessage.warning(t('registerWizard.invalidNationalId'));
  if (!isValidPhone(phone)) return ElMessage.warning(t('registerWizard.invalidPhone'));
  verifying.value = true;
  try {
    await verifySmsCode({ nationalId, phone, smsCode: form.smsCode, purpose: 'citizen-registration' });
    smsVerified.value = true;
    ElMessage.success(t('registerWizard.codeVerified'));
  } catch {
    /* handled by the request layer */
  } finally {
    verifying.value = false;
  }
}

async function submit() {
  if (registering.value) return;
  const nationalId = form.nationalId.trim();
  const phone = form.phone.replace(/[\s-]/g, '');
  if (!smsVerified.value) { ElMessage.warning(t('registerWizard.verifyRequired')); return; }
  if (!form.password || !form.confirmPassword) { ElMessage.warning(t('registerWizard.passwordRequired')); return; }
  if (form.password.length < 8) { ElMessage.warning(t('registerWizard.passwordTooShort')); return; }
  if (form.password !== form.confirmPassword) { ElMessage.warning(t('registerWizard.passwordMismatch')); return; }
  registering.value = true;
  try {
    const result = await registerCitizen({
      cardType: form.cardType,
      ocrCardNo: normalizeRationCardNo(ocr.value?.cardNo || (cardTypeNeedsScan(form.cardType) ? form.cardNo : '')),
      rationCardNo: normalizeRationCardNo(form.cardNo),
      centerId: form.centerId,
      foodAgentId: form.foodAgentId,
      flourAgentId: form.flourAgentId,
      nationalId,
      phone,
      name: ocr.value?.headName || '',
      password: form.password,
      confirmPassword: form.confirmPassword,
      smsCode: form.smsCode,
      cardPhoto: photo.value
    });
    emit('registered', { ...result, username: phone });
    close();
    ElMessageBox.alert(t('registerWizard.registered'), t('registerWizard.title')).catch(() => {});
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
.register-wizard-dialog :deep(.el-dialog__body) {
  max-height: calc(100dvh - 260px);
  overflow-y: auto;
  scrollbar-width: thin;
}

/* 配给卡情况：整行等宽卡片，文案可换行，避免超出弹窗边框 */
.card-type-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.card-type-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 12px;
  border: 1px solid #D9E5DB;
  border-radius: 10px;
  background: #FFFFFF;
  text-align: start;
  cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
}
.card-type-option:hover {
  border-color: #C9DBCE;
  background: #F8FBF9;
}
.card-type-option:focus-visible {
  outline: none;
  border-color: #D3AF62;
  box-shadow: 0 0 0 2px rgba(211, 175, 98, .25);
}
.card-type-option.is-active {
  border-color: #D3AF62;
  box-shadow: inset 0 0 0 1px #D3AF62;
}
.card-type-dot {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1px solid #C4D6C8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-type-option.is-active .card-type-dot {
  border-color: #D3AF62;
}
.card-type-option.is-active .card-type-dot::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #D3AF62;
}
.card-type-label {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  color: #1F3326;
  overflow-wrap: anywhere;
}
</style>
