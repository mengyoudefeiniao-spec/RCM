<template>
  <el-dialog :model-value="modelValue" :title="title || $t('faceCompareDemo.title')" :width="dialogWidth" align-center :close-on-click-modal="false" @update:model-value="onVisibilityChange" @closed="reset">
    <div class="space-y-3">
      <el-alert :title="$t('faceCompareDemo.notice')" type="warning" :closable="false" show-icon />
      <p class="text-xs text-[#58685D]">{{ $t('faceCompareDemo.warning') }}</p>
      <p class="text-xs font-semibold text-[#9A5C12]">{{ $t('faceCompareDemo.cost') }}</p>
      <el-alert v-if="notice" :title="notice" type="warning" :closable="false" />
      <p v-if="targetName" class="text-sm font-semibold">{{ targetName }}</p>
      <p class="text-xs text-[#58685D]">{{ $t('faceCompareDemo.loginHint') }}</p>
      <label class="block text-sm">SecretId</label>
      <el-input v-model.trim="secretId" :disabled="busy || recording || authenticating" autocomplete="off" dir="ltr" />
      <label class="block text-sm">SecretKey</label>
      <el-input v-model="secretKey" :disabled="busy || recording || authenticating" type="password" show-password autocomplete="new-password" dir="ltr" />
      <details><summary class="text-sm">{{ $t('faceCompareDemo.optionalToken') }}</summary><el-input v-model="sessionToken" :disabled="busy || recording || authenticating" type="password" show-password autocomplete="off" dir="ltr" /></details>
      <label class="block text-sm">{{ $t('faceCompareDemo.reference') }}</label>
      <input type="file" accept="image/jpeg,image/png" :disabled="busy || recording" class="block w-full text-sm" @change="selectReference" />
      <div class="flex flex-wrap gap-2">
        <el-button :disabled="busy || recording || authenticating" @click="startCamera">{{ $t('faceCompareDemo.camera') }}</el-button>
        <el-button :disabled="!cameraActive || busy || recording || authenticating || !secretId || !secretKey" @click="recordVideo">{{ $t('faceCompareDemo.record') }}</el-button>
      </div>
      <video ref="videoRef" autoplay playsinline muted class="w-full max-h-56 bg-[#12241A] rounded-lg" v-show="cameraActive"></video>
      <p v-if="recording" role="status" class="font-bold">{{ $t('faceCompareDemo.recording') }}: {{ sequence.split(',').map(item => $t(item === '1' ? 'faceCompareDemo.mouth' : 'faceCompareDemo.closeEyes')).join(' → ') }}</p>
      <p v-else-if="videoBlob" class="text-sm">{{ $t('faceCompareDemo.ready') }}</p>
      <img v-if="result?.image" :src="result.image" :alt="$t('faceCompareDemo.download')" class="h-32 max-w-full object-contain" />
      <a v-if="result?.image" :href="result.image" download="face-capture.jpg" class="block text-sm text-[#326445] underline">{{ $t('faceCompareDemo.download') }}</a>
      <el-alert v-if="result" :title="$t(result.passed ? 'faceCompareDemo.passed' : 'faceCompareDemo.failed')" :type="result.passed ? 'success' : 'warning'" :closable="false" show-icon />
      <p v-if="result?.score != null" class="text-sm">{{ $t('faceCompareDemo.score') }}: {{ result.score.toFixed(1) }}%</p>
    </div>
    <template #footer>
      <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="busy" :disabled="!secretId || !secretKey || !referenceFile || !videoBlob || recording || authenticating" @click="compare">{{ $t('faceCompareDemo.compare') }}</el-button>
      <el-button v-if="result?.passed && isMock" type="success" @click="confirm">{{ $t('faceCompareDemo.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { compareLiveFace, getActionSequence } from '../../utils/liveFaceCompare.js';
const props = defineProps({ modelValue:Boolean, title:{ type:String, default:'' }, targetName:{ type:String, default:'' }, targetNationalId:{ type:String, default:'' }, allowQuickPass:Boolean, notice:{ type:String, default:'' } });
const emit = defineEmits(['update:modelValue', 'success', 'cancel']);
const { t } = useI18n();
const { dialogWidth } = useCompactDialog(520);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const secretId = ref(''), secretKey = ref(''), sessionToken = ref(''), sequence = ref('');
const referenceFile = ref(null), videoBlob = ref(null), videoRef = ref(null), result = ref(null);
const authenticating = ref(false);
const busy = ref(false), recording = ref(false), cameraActive = ref(false);
let stream = null, recorder = null, timer = null, controller = null, authController = null, generation = 0;
function stopCamera() { stream?.getTracks().forEach(track => track.stop()); stream = null; cameraActive.value = false; }
function reset() { generation++; authController?.abort(); authController = null; secretId.value = ''; secretKey.value = ''; sessionToken.value = ''; sequence.value = ''; authenticating.value = false; controller?.abort(); controller = null; clearTimeout(timer); if (recorder?.state === 'recording') recorder.stop(); recorder = null; stopCamera(); referenceFile.value = null; videoBlob.value = null; result.value = null; busy.value = false; recording.value = false; }
watch(() => props.modelValue, value => { if (!value) reset(); });
watch([secretId, secretKey, sessionToken], () => { videoBlob.value = null; sequence.value = ''; result.value = null; }, { flush:'sync' });
onBeforeUnmount(reset);
function onVisibilityChange(value) { if (!value) cancel(); }
function cancel() { reset(); emit('update:modelValue', false); emit('cancel'); }
function errorMessage(error, fallback) {
  const code = error?.message || '';
  let key = fallback;
  if (code === 'network_error' || code === 'network_timeout' || code === 'upstream_http_error') key = 'faceCompareDemo.errorNetwork';
  else if (/^AuthFailure\.(SecretIdNotFound|SignatureFailure|InvalidSecretId|TokenFailure)/.test(code)) key = 'faceCompareDemo.errorCredentials';
  else if (code === 'UnauthorizedOperation.Nonactivated') key = 'faceCompareDemo.errorNotActivated';
  else if (code.startsWith('UnauthorizedOperation') || code.startsWith('AuthFailure.UnauthorizedOperation')) key = 'faceCompareDemo.errorPermission';
  else if (code.includes('RequestExpired') || code.includes('RequestTimeTooSkewed')) key = 'faceCompareDemo.errorClock';
  const safeCode = /^[A-Za-z][A-Za-z0-9._]{0,79}$/.test(code) && code !== 'request_failed' ? code : '';
  const safeId = typeof error?.requestId === 'string' && /^[a-f0-9-]{1,64}$/i.test(error.requestId) ? error.requestId : '';
  return [t(key), safeCode, safeId ? `RequestId: ${safeId}` : ''].filter(Boolean).join(' · ');
}
function credentials() { return { secretId:secretId.value, secretKey:secretKey.value, ...(sessionToken.value ? { sessionToken:sessionToken.value } : {}) }; }
function selectReference(event) {
  const file = event.target.files?.[0]; referenceFile.value = null; result.value = null;
  if (!file) return;
  if (!['image/jpeg','image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) { ElMessage.error(t('faceCompareDemo.imageError')); event.target.value = ''; return; }
  referenceFile.value = file;
}
async function startCamera() {
  const current = ++generation; stopCamera(); videoBlob.value = null; result.value = null;
  try {
    const next = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ ideal:640 }, height:{ ideal:480 }, frameRate:{ ideal:15, max:30 } }, audio:false });
    if (current !== generation || !props.modelValue) { next.getTracks().forEach(track => track.stop()); return; }
    stream = next; cameraActive.value = true; await nextTick();
    if (videoRef.value) { videoRef.value.srcObject = next; await videoRef.value.play(); }
  } catch { if (current === generation) { stopCamera(); ElMessage.error(t('faceCompareDemo.cameraError')); } }
}
async function recordVideo() {
  if (!stream || recording.value) return;
  videoBlob.value = null; result.value = null;
  const mime = ['video/mp4;codecs=avc1.42E01E','video/mp4'].find(type => globalThis.MediaRecorder?.isTypeSupported(type));
  if (!mime) { ElMessage.error(t('faceCompareDemo.recordError')); return; }
  const current = generation, chunks = [];
  authenticating.value = true; authController = new AbortController();
  try {
    sequence.value = await getActionSequence({ credentials:credentials(), signal:authController.signal });
    if (current !== generation || !props.modelValue) return;
    recorder = new MediaRecorder(stream, { mimeType:mime, videoBitsPerSecond:700000 });
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => { if (current === generation) { recording.value = false; ElMessage.error(t('faceCompareDemo.recordError')); } };
    recorder.onstop = () => {
      if (current !== generation || !props.modelValue) return;
      recording.value = false;
      const blob = new Blob(chunks, { type:mime });
      if (!blob.size || blob.size > 5 * 1024 * 1024) { ElMessage.error(t('faceCompareDemo.videoError')); return; }
      videoBlob.value = blob;
    };
    recorder.start(); recording.value = true;
    timer = setTimeout(() => { if (recorder?.state === 'recording') recorder.stop(); }, 8000);
  } catch (error) { if (current === generation && props.modelValue) { recording.value = false; ElMessage.error({ message:errorMessage(error, 'faceCompareDemo.recordError'), duration:10000, showClose:true }); } }
  finally { if (current === generation) { authenticating.value = false; authController = null; } }
}
async function compare() {
  if (busy.value || !referenceFile.value || !videoBlob.value || !secretId.value || !secretKey.value) return;
  const current = generation; busy.value = true; result.value = null; controller = new AbortController();
  try {
    const response = await compareLiveFace({ credentials:credentials(), referenceImage:referenceFile.value, video:videoBlob.value, sequence:sequence.value, signal:controller.signal });
    if (current === generation && props.modelValue) result.value = response;
  } catch (error) { if (current === generation && props.modelValue) ElMessage.error({ message:errorMessage(error, error.message === 'face_count' ? 'faceCompareDemo.faceCount' : 'faceCompareDemo.unavailable'), duration:10000, showClose:true }); }
  finally { if (current === generation) { busy.value = false; controller = null; } }
}
function confirm() {
  if (!isMock || !result.value?.passed || !result.value.image) return;
  const payload = { targetName:props.targetName, nationalId:props.targetNationalId, image:result.value.image, simulated:true, provider:'tencent', similarity:result.value.score };
  stopCamera(); emit('success', payload); emit('update:modelValue', false);
}
</script>
