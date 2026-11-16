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

    <!-- 第三步：省份、代理机构、配给中心与卡号/代理编号 -->
    <div v-else-if="step === 'cardSelect'" class="space-y-3">
      <div v-if="optionsError" class="p-3 rounded-lg border border-[#F2E3C6] bg-[#FDF3E0] text-[11px] text-[#5A4718] flex items-center justify-between gap-2 flex-wrap">
        <span>{{ $t('registerWizard.optionsFailed') }}</span>
        <el-button size="small" plain @click="loadOptions">{{ $t('registerWizard.reloadOptions') }}</el-button>
      </div>

      <el-form label-position="top">
        <div class="grid gap-3" :class="isCompact ? 'grid-cols-1' : 'grid-cols-2'">
          <el-form-item :label="$t('registerWizard.province')" required class="!mb-3 min-w-0">
            <el-select
              v-model="form.provinceCode"
              class="w-full"
              filterable
              :loading="optionsLoading"
              :placeholder="$t('registerWizard.provincePlaceholder')"
              @change="handleProvinceChange"
            >
              <el-option
                v-for="province in provinceOptions"
                :key="province.code"
                :value="province.code"
                :label="catalogLabel(province.names)"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('registerWizard.agency')" required class="!mb-3 min-w-0">
            <el-select
              v-model="form.agencyCode"
              class="w-full"
              filterable
              :disabled="!form.provinceCode"
              :placeholder="$t('registerWizard.agencyPlaceholder')"
              @change="handleAgencyChange"
            >
              <el-option
                v-for="agency in agencyOptions"
                :key="agency.code"
                :value="agency.code"
                :label="catalogLabel(agency.names)"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item :label="$t('registerWizard.center')" required class="!mb-3">
          <el-select
            v-model="form.centerId"
            class="w-full"
            filterable
            :disabled="!form.agencyCode"
            :loading="optionsLoading"
            :placeholder="$t('registerWizard.centerPlaceholder')"
            @change="handleCenterChange"
          >
            <el-option
              v-for="center in centerOptions"
              :key="center.centerId"
              :value="center.centerId"
              :label="`${center.centerName} (#${center.centerId})`"
            />
          </el-select>
        </el-form-item>

        <template v-if="needsCardDetails">
          <el-form-item :label="$t('registerWizard.rationCardNo')" required class="!mb-3">
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
        </template>
        <el-alert v-else :title="$t('registerWizard.noCardNotice')" type="info" :closable="false" show-icon class="mt-1" />
      </el-form>
    </div>

    <!-- 第四步：身份证与短信验证 -->
    <div v-else-if="step === 'account'" class="space-y-3">
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

    <!-- 第五步：身份证正面、背面、NFC 芯片读取与人脸活体核验 -->
    <div v-else class="identity-step">
      <p class="identity-intro">{{ $t('registerWizard.identityStepHint') }}</p>
      <div class="identity-list">
        <section class="identity-card" :class="{ 'is-done': Boolean(frontImage) }">
          <div class="identity-body">
            <h3 class="identity-title">{{ $t('registerWizard.identityFront') }}</h3>
            <p class="identity-hint">{{ $t('registerWizard.identityFrontHint') }}</p>
            <input ref="frontInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handleIdentityImage($event, 'front')" />
            <el-button size="small" type="primary" plain :disabled="registering" @click="pickIdentityImage('front')">
              {{ frontImage ? $t('registerWizard.identityReplace') : $t('registerWizard.identityUpload') }}
            </el-button>
            <p v-if="frontImage" class="identity-status is-ok">{{ $t('registerWizard.identityImageReady') }}</p>
          </div>
          <div class="identity-thumb">
            <img v-if="frontImage" :src="frontImage" :alt="$t('registerWizard.identityFront')" />
            <el-icon v-else :size="26"><Postcard /></el-icon>
          </div>
        </section>

        <section class="identity-card" :class="{ 'is-done': Boolean(backImage) }">
          <div class="identity-body">
            <h3 class="identity-title">{{ $t('registerWizard.identityBack') }}</h3>
            <p class="identity-hint">{{ $t('registerWizard.identityBackHint') }}</p>
            <input ref="backInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handleIdentityImage($event, 'back')" />
            <el-button size="small" type="primary" plain :disabled="registering" @click="pickIdentityImage('back')">
              {{ backImage ? $t('registerWizard.identityReplace') : $t('registerWizard.identityUpload') }}
            </el-button>
            <p v-if="backImage" class="identity-status is-ok">{{ $t('registerWizard.identityImageReady') }}</p>
          </div>
          <div class="identity-thumb">
            <img v-if="backImage" :src="backImage" :alt="$t('registerWizard.identityBack')" />
            <el-icon v-else :size="26"><Postcard /></el-icon>
          </div>
        </section>

        <section class="identity-card" :class="{ 'is-done': Boolean(chipIdentity) }">
          <div class="identity-body">
            <h3 class="identity-title">{{ $t('registerWizard.nfcTitle') }}</h3>
            <p class="identity-hint">{{ $t('registerWizard.nfcHint') }}</p>
            <el-button size="small" type="primary" plain :loading="chipReading" :disabled="!isMock || !smsVerified || registering" @click="readChip">
              {{ chipIdentity ? $t('registerWizard.nfcReread') : $t('registerWizard.nfcRead') }}
            </el-button>
            <p v-if="chipReading" class="identity-status" role="status">{{ $t('registerWizard.nfcReading') }}</p>
            <template v-else-if="chipIdentity">
              <p class="identity-status is-ok">{{ $t('registerWizard.nfcDone') }}</p>
              <p class="identity-meta">{{ $t('registerWizard.chipName') }}: {{ chipIdentity.name }} · <span dir="ltr">{{ chipIdentity.nationalId }}</span></p>
              <p class="identity-hint">{{ $t(chipPhotoFallback ? 'registerWizard.nfcChipPhotoFallback' : 'registerWizard.nfcChipPhotoReady') }}</p>
            </template>
          </div>
          <div class="identity-thumb">
            <img v-if="chipPhoto" :src="chipPhoto" :alt="$t('registerWizard.nfcChipPhoto')" />
            <el-icon v-else :size="26"><Cpu /></el-icon>
          </div>
        </section>

        <section class="identity-card" :class="{ 'is-done': Boolean(faceCapture) }">
          <div class="identity-body">
            <h3 class="identity-title">{{ $t('registerWizard.livenessTitle') }}</h3>
            <p class="identity-hint">{{ $t('registerWizard.livenessHint') }}</p>
            <el-button size="small" type="primary" plain :disabled="!isMock || !chipIdentity || !frontImage || registering || chipReading" @click="startLiveness">
              {{ faceCapture ? $t('registerWizard.livenessRedo') : $t('registerWizard.livenessStart') }}
            </el-button>
            <p v-if="faceCapture" class="identity-status is-ok">{{ $t('registerWizard.livenessDone') }}</p>
            <p v-if="faceScoreText" class="identity-meta">{{ $t('registerWizard.livenessMatch', { score: faceScoreText }) }}</p>
          </div>
          <div class="identity-thumb">
            <img v-if="faceCapture?.image" :src="faceCapture.image" :alt="$t('registerWizard.livenessTitle')" />
            <el-icon v-else :size="26"><Camera /></el-icon>
          </div>
        </section>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2 w-full">
        <el-button :disabled="step === 'cardType' || registering" @click="back">{{ $t('registerWizard.back') }}</el-button>
        <el-button
          v-if="step === 'cardType'"
          type="primary"
          :disabled="!isMock || optionsLoading"
          @click="next"
        >{{ $t('registerWizard.next') }}</el-button>
        <el-button
          v-else-if="step === 'scan'"
          type="primary"
          :disabled="!isMock || optionsLoading"
          @click="next"
        >{{ $t('registerWizard.confirmCardNo') }}</el-button>
        <el-button
          v-else-if="step === 'cardSelect'"
          type="primary"
          :disabled="!isMock || optionsLoading"
          @click="next"
        >{{ $t('registerWizard.next') }}</el-button>
        <el-button
          v-else-if="step === 'account' && !smsVerified"
          type="primary"
          data-demo-target="btn-verify-sms"
          :disabled="!isMock"
          :loading="verifying"
          @click="verifyCode"
        >{{ $t('registerWizard.verifyCode') }}</el-button>
        <el-button
          v-else-if="step === 'account'"
          type="primary"
          :disabled="!isMock"
          @click="next"
        >{{ $t('registerWizard.next') }}</el-button>
        <el-button
          v-else
          type="primary"
          data-demo-target="btn-finish-reg"
          :disabled="!isMock || !identityReady"
          :loading="registering"
          @click="submit"
        >{{ $t('registerWizard.submit') }}</el-button>
      </div>
    </template>
  </el-dialog>

  <FaceLivenessVerifyDialog
    v-model="showFace"
    :target-name="chipIdentity?.name || form.nationalId"
    :target-national-id="form.nationalId.trim()"
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
import { Camera, Loading, CircleCheck, Postcard, Cpu } from '@element-plus/icons-vue';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { sendSmsCode, verifySmsCode, registerCitizen, ocrScanPaperCard, readRegistrationIdentity } from '../../api/auth.js';
import { getRegistrationOptions } from '../../api/citizen.js';
import { CARD_TYPES, cardTypeNeedsScan, normalizeRationCardNo, isValidNationalId, isValidPhone } from '../../utils/registrationCard.js';
import { localizeCatalogNames } from '../../utils/registrationCatalog.js';
import { identityStepCompletion, chipMatchPassed } from '../../utils/registrationIdentity.js';
import FaceLivenessVerifyDialog from '../common/FaceLivenessVerifyDialog.vue';
import { getDefaultHuaweiIamToken } from '../../utils/huaweiIam.js';

const props = defineProps({ modelValue: Boolean, demoMode: Boolean });
const emit = defineEmits(['update:modelValue', 'registered']);
const { t, locale } = useI18n();
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
  provinceCode: '',
  agencyCode: '',
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
const registrationOptions = ref({ provinces: [], centers: [] });
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

// Identity verification state: documents, NFC chip reading and the live face capture.
const identityProof = ref('');
const frontInputRef = ref(null);
const backInputRef = ref(null);
const frontImage = ref('');
const backImage = ref('');
const frontFile = ref(null);
const backFile = ref(null);
const chipIdentity = ref(null);
const chipReading = ref(false);
const chipPhoto = ref('');
const chipPhotoFile = ref(null);
const chipPhotoFallback = ref(false);
const cloudToken = ref(null);
const faceCapture = ref(null);
const showFace = ref(false);

const provinceOptions = computed(() => registrationOptions.value.provinces || []);
const agencyOptions = computed(() => provinceOptions.value.find(province => province.code === form.provinceCode)?.agencies || []);
const centerOptions = computed(() => (registrationOptions.value.centers || []).filter(center =>
  center.provinceCode === form.provinceCode && center.agencyCode === form.agencyCode));
const selectedCenter = computed(() => centerOptions.value.find(center => center.centerId === form.centerId) || null);
const needsCardDetails = computed(() => form.cardType !== CARD_TYPES.NONE);
const referenceFile = computed(() => chipPhotoFile.value || frontFile.value);
const identityState = computed(() => identityStepCompletion({
  frontImage: frontImage.value,
  backImage: backImage.value,
  chipRead: chipIdentity.value,
  liveness: faceCapture.value,
  nationalId: form.nationalId.trim()
}));
const identityReady = computed(() => Object.values(identityState.value).every(Boolean) && chipMatchPassed(faceCapture.value?.similarity));
const faceScoreText = computed(() => {
  const score = Number(faceCapture.value?.similarity);
  return Number.isFinite(score) ? (score * 100).toFixed(1) : '';
});

function catalogLabel(names) {
  return localizeCatalogNames(names, locale.value);
}

function isAgentFull(agent) {
  return Number(agent.currentHouseholds) >= Number(agent.maxCapacity);
}

function normalizePhone(value) {
  return String(value || '').replace(/[\s-]/g, '').trim();
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
    if (!registrationOptions.value.provinces.length) loadOptions();
  }
});
watch(() => form.phone, () => {
  form.smsCode = '';
  exampleCode.value = '';
  resetVerification();
});
// Center and agent labels come back per request language; reload them in place
// when the UI language changes while the wizard is open. Selected codes survive.
watch(locale, () => {
  if (visible.value && registrationOptions.value.provinces.length) loadOptions();
});

function resetVerification() {
  smsVerified.value = false;
  form.password = '';
  form.confirmPassword = '';
  identityProof.value = '';
}

function resetIdentity() {
  frontImage.value = '';
  backImage.value = '';
  frontFile.value = null;
  backFile.value = null;
  chipIdentity.value = null;
  chipReading.value = false;
  chipPhoto.value = '';
  chipPhotoFile.value = null;
  chipPhotoFallback.value = false;
  cloudToken.value = null;
  faceCapture.value = null;
  showFace.value = false;
  if (frontInputRef.value) frontInputRef.value.value = '';
  if (backInputRef.value) backInputRef.value.value = '';
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
  resetIdentity();
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
    const result = await getRegistrationOptions();
    registrationOptions.value = {
      provinces: Array.isArray(result?.provinces) ? result.provinces : [],
      centers: Array.isArray(result?.centers) ? result.centers : []
    };
  } catch {
    registrationOptions.value = { provinces: [], centers: [] };
    optionsError.value = true;
  } finally {
    optionsLoading.value = false;
  }
}

function handleProvinceChange() {
  form.agencyCode = '';
  handleAgencyChange();
}

function handleAgencyChange() {
  form.centerId = '';
  handleCenterChange();
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

async function dataUrlToFile(dataUrl, name) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type || 'image/jpeg' });
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
    ElMessage.warning(t('registerWizard.identityImageError'));
    return;
  }
  try {
    const dataUrl = await compressPhoto(await readPhoto(file), 1400, 0.78);
    const stored = await dataUrlToFile(dataUrl, side === 'front' ? 'identity-front.jpg' : 'identity-back.jpg');
    if (side === 'front') {
      frontImage.value = dataUrl;
      frontFile.value = stored;
    } else {
      backImage.value = dataUrl;
      backFile.value = stored;
    }
    // The chip portrait is the authoritative reference; the front photo only
    // substitutes for it while the demo reader returns no portrait.
    if (!chipPhoto.value && chipPhotoFallback.value) faceCapture.value = null;
  } catch {
    ElMessage.error(t('registerWizard.identityImageError'));
  }
}

async function readChip() {
  if (chipReading.value) return;
  if (!smsVerified.value) {
    ElMessage.warning(t('registerWizard.verifyRequired'));
    return;
  }
  const nationalId = form.nationalId.trim();
  if (!isValidNationalId(nationalId)) {
    ElMessage.warning(t('registerWizard.invalidNationalId'));
    return;
  }
  chipReading.value = true;
  chipIdentity.value = null;
  chipPhoto.value = '';
  chipPhotoFile.value = null;
  chipPhotoFallback.value = false;
  faceCapture.value = null;
  try {
    const result = await readRegistrationIdentity({
      nationalId,
      phone: normalizePhone(form.phone),
      name: ocr.value?.headName || '',
      verificationToken: identityProof.value
    });
    chipIdentity.value = result;
    if (result?.chipPhoto) {
      chipPhoto.value = result.chipPhoto;
      chipPhotoFile.value = await dataUrlToFile(result.chipPhoto, 'chip-portrait.jpg');
    } else {
      chipPhotoFallback.value = Boolean(frontFile.value);
    }
    try {
      cloudToken.value = await getDefaultHuaweiIamToken();
    } catch {
      cloudToken.value = null;
    }
  } catch {
    ElMessage.error(t('registerWizard.nfcFailed'));
  } finally {
    chipReading.value = false;
  }
}

function startLiveness() {
  if (!chipIdentity.value) return ElMessage.warning(t('registerWizard.chipReadRequired'));
  if (!referenceFile.value) return ElMessage.warning(t('registerWizard.identityFrontRequired'));
  showFace.value = true;
}

function onFaceCaptured(payload) {
  if (!payload) return;
  faceCapture.value = { ...payload, nationalId: payload.nationalId || form.nationalId.trim() };
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
    if (!form.provinceCode || !form.agencyCode || !form.centerId) {
      return ElMessage.warning(t('registerWizard.provinceRequired'));
    }
    if (needsCardDetails.value) {
      if (!form.foodAgentId) return ElMessage.warning(t('registerWizard.selectCardRequired'));
      if (!form.cardNo) return ElMessage.warning(t('registerWizard.cardNoRequired'));
    }
    step.value = 'account';
    return;
  }
  if (step.value === 'account') {
    if (!smsVerified.value) return ElMessage.warning(t('registerWizard.verifyRequired'));
    if (!form.password || !form.confirmPassword) return ElMessage.warning(t('registerWizard.passwordRequired'));
    if (form.password.length < 8) return ElMessage.warning(t('registerWizard.passwordTooShort'));
    if (form.password !== form.confirmPassword) return ElMessage.warning(t('registerWizard.passwordMismatch'));
    step.value = 'identity';
  }
}

function back() {
  if (step.value === 'identity') { step.value = 'account'; return; }
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
  const phone = normalizePhone(form.phone);
  if (!nationalId || !phone || !form.smsCode) return ElMessage.warning(t('registerWizard.verifyRequired'));
  if (!isValidNationalId(nationalId)) return ElMessage.warning(t('registerWizard.invalidNationalId'));
  if (!isValidPhone(phone)) return ElMessage.warning(t('registerWizard.invalidPhone'));
  verifying.value = true;
  try {
    const result = await verifySmsCode({ nationalId, phone, smsCode: form.smsCode, purpose: 'citizen-registration' });
    identityProof.value = result?.verificationToken || '';
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
  const phone = normalizePhone(form.phone);
  if (!smsVerified.value) { ElMessage.warning(t('registerWizard.verifyRequired')); return; }
  if (!form.password || !form.confirmPassword) { ElMessage.warning(t('registerWizard.passwordRequired')); return; }
  if (form.password.length < 8) { ElMessage.warning(t('registerWizard.passwordTooShort')); return; }
  if (form.password !== form.confirmPassword) { ElMessage.warning(t('registerWizard.passwordMismatch')); return; }
  if (!identityState.value.front) { ElMessage.warning(t('registerWizard.identityFrontRequired')); return; }
  if (!identityState.value.back) { ElMessage.warning(t('registerWizard.identityBackRequired')); return; }
  if (!identityState.value.chip) { ElMessage.warning(t('registerWizard.chipReadRequired')); return; }
  if (!identityState.value.liveness || !chipMatchPassed(faceCapture.value?.similarity)) {
    ElMessage.warning(t('registerWizard.livenessRequired')); return;
  }
  registering.value = true;
  try {
    const result = await registerCitizen({
      cardType: form.cardType,
      provinceCode: form.provinceCode,
      agencyCode: form.agencyCode,
      ocrCardNo: normalizeRationCardNo(ocr.value?.cardNo || (cardTypeNeedsScan(form.cardType) ? form.cardNo : '')),
      rationCardNo: normalizeRationCardNo(form.cardNo),
      centerId: form.centerId,
      foodAgentId: form.foodAgentId,
      flourAgentId: form.flourAgentId,
      nationalId,
      phone,
      name: ocr.value?.headName || chipIdentity.value?.name || '',
      password: form.password,
      confirmPassword: form.confirmPassword,
      smsCode: form.smsCode,
      cardPhoto: photo.value,
      identityFrontImage: frontImage.value,
      identityBackImage: backImage.value,
      faceImage: faceCapture.value?.image || '',
      readToken: chipIdentity.value?.readToken || '',
      chipName: chipIdentity.value?.name || '',
      chipMatchScore: Number(faceCapture.value?.similarity) || 0,
      chipPhotoAvailable: Boolean(chipPhoto.value),
      livenessCompleted: true,
      simulated: true
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

/* 身份核验：与手机截图一致的四张纵向卡片，随弹窗上下滚动 */
.identity-step {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.identity-intro {
  font-size: 11px;
  line-height: 1.7;
  color: #58685D;
}
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
  padding: 12px;
  border: 1px solid #D9E5DB;
  border-radius: 12px;
  background: #FFFFFF;
}
.identity-card.is-done {
  border-color: #C7E0CE;
  background: #F8FBF9;
}
.identity-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.identity-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: #1F3326;
  overflow-wrap: anywhere;
}
.identity-hint {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: #58685D;
  overflow-wrap: anywhere;
}
.identity-status {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: #8A9A8F;
}
.identity-status.is-ok {
  color: #326445;
  font-weight: 700;
}
.identity-meta {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: #43554B;
  overflow-wrap: anywhere;
}
.identity-thumb {
  width: 96px;
  height: 64px;
  border: 1px solid #D9E5DB;
  border-radius: 8px;
  background: #F3F8F4;
  color: #8A9A8F;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.identity-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (max-width: 420px) {
  .identity-card { grid-template-columns: minmax(0, 1fr) 84px; }
  .identity-thumb { width: 84px; height: 58px; }
}
</style>
