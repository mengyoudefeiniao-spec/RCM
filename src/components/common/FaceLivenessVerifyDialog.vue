<template>
  <el-dialog :model-value="modelValue" :title="title || $t('faceCompareDemo.title')" :width="dialogWidth" align-center :close-on-click-modal="false" @update:model-value="onVisibilityChange" @closed="reset">
    <div class="space-y-3">
      <p v-if="targetName" class="text-sm font-semibold">{{ targetName }}</p>
      <label v-if="!autoStart" class="block text-sm">{{ $t('faceCompareDemo.reference') }}</label>
      <div v-if="!autoStart" class="flex flex-wrap items-center gap-2">
        <label :class="{ 'opacity-50 cursor-not-allowed': busy || recording || authenticating }" class="inline-flex items-center rounded-lg bg-[#326445] px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-[#244c34] focus-within:ring-2 focus-within:ring-[#D3AF62]">
          {{ $t('faceCompareDemo.chooseReference') }}
          <input type="file" accept="image/jpeg,image/png" :disabled="busy || recording || authenticating" class="sr-only" @change="selectReference" />
        </label>
        <span v-if="referenceFile" class="min-w-0 break-all text-sm text-[#58685D]">{{ referenceFile.name }}</span>
        <span v-else class="text-sm text-[#58685D]">{{ $t('faceCompareDemo.noReference') }}</span>
      </div>
      <p v-if="authenticating" class="text-xs text-[#58685D]" role="status">{{ $t('faceCompareDemo.autoTokenLoading') }}</p>
      <div class="flex flex-wrap gap-2">
        <el-button :disabled="busy || recording || authenticating" @click="startCamera">{{ $t('faceCompareDemo.camera') }}</el-button>
        <el-button :disabled="!cameraActive || busy || recording || authenticating" @click="recordVideo">{{ $t('faceCompareDemo.record') }}</el-button>
      </div>
      <video ref="videoRef" autoplay playsinline muted class="w-full max-h-56 bg-[#12241A] rounded-lg" v-show="cameraActive"></video>
      <p v-if="recording" role="status" class="font-bold">{{ $t('faceCompareDemo.recording') }}: {{ $t(actionLabels[action]) }}</p>
      <p v-else-if="videoBlob" class="text-sm">{{ $t('faceCompareDemo.ready') }}</p>
      <img v-if="result?.image" :src="result.image" :alt="$t('faceCompareDemo.download')" class="h-32 max-w-full object-contain" />
      <a v-if="result?.image" :href="result.image" download="face-capture.jpg" class="block text-sm text-[#326445] underline">{{ $t('faceCompareDemo.download') }}</a>
      <el-alert v-if="result" :title="$t(result.passed ? 'faceCompareDemo.passed' : 'faceCompareDemo.failed')" :type="result.passed ? 'success' : 'warning'" :closable="false" show-icon />
      <p v-if="result?.score != null" class="text-sm">{{ $t('faceCompareDemo.score') }}: {{ (result.score * 100).toFixed(1) }}%</p>
      <p v-if="isMock && allowQuickPass" class="text-xs text-[#5A4718]">{{ $t('faceCompareDemo.quickPassNotice') }}</p>
    </div>
    <template #footer>
      <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
      <el-button v-if="isMock && allowQuickPass" type="warning" plain @click="quickPass">{{ $t('faceCompareDemo.quickPass') }}</el-button>
      <el-button type="primary" :loading="busy" :disabled="!token || !projectId || !referenceFile || !videoBlob || recording || authenticating" @click="compare">{{ $t('faceCompareDemo.compare') }}</el-button>
      <el-button v-if="result?.passed && isMock" type="success" @click="confirm">{{ $t('faceCompareDemo.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { compareLiveFace } from '../../utils/liveFaceCompare.js';
import { getDefaultHuaweiIamToken } from '../../utils/huaweiIam.js';
const props = defineProps({ modelValue:Boolean, title:{ type:String, default:'' }, targetName:{ type:String, default:'' }, targetNationalId:{ type:String, default:'' }, allowQuickPass:Boolean, notice:{ type:String, default:'' }, preparedReference:{ type:Object, default:null }, preparedToken:{ type:Object, default:null }, autoStart:Boolean });
const emit = defineEmits(['update:modelValue', 'success', 'cancel']);
const { t } = useI18n();
const { dialogWidth } = useCompactDialog(520);
const isMock = import.meta.env.VITE_APP_MOCK_MODE === 'true';
const token = ref(''), projectId = ref(''), referenceFile = ref(null), videoBlob = ref(null), videoRef = ref(null), result = ref(null);
const authenticating = ref(false);
const busy = ref(false), recording = ref(false), cameraActive = ref(false), action = ref(3);
const actionLabels = { 1:'faceCompareDemo.turnLeft', 2:'faceCompareDemo.turnRight', 3:'faceCompareDemo.nod', 4:'faceCompareDemo.mouth', 5:'faceCompareDemo.blink' };
let stream = null, recorder = null, timer = null, controller = null, authController = null, generation = 0;
function stopCamera() { stream?.getTracks().forEach(track => track.stop()); stream = null; cameraActive.value = false; }
function reset() { generation++; authController?.abort(); authController = null; authenticating.value = false; controller?.abort(); controller = null; clearTimeout(timer); if (recorder?.state === 'recording') recorder.stop(); recorder = null; stopCamera(); token.value = ''; projectId.value = ''; referenceFile.value = null; videoBlob.value = null; result.value = null; busy.value = false; recording.value = false; }
watch(() => props.modelValue, async value => {
  if (!value) { reset(); return; }
  if (!props.autoStart) return;
  referenceFile.value = props.preparedReference;
  token.value = props.preparedToken?.token || '';
  projectId.value = props.preparedToken?.projectId || '';
  if (!referenceFile.value || !token.value || !projectId.value) return;
  await nextTick();
  if (!props.modelValue || !props.autoStart) return;
  await startCamera();
  if (props.modelValue && cameraActive.value) recordVideo();
});
onBeforeUnmount(reset);
function onVisibilityChange(value) { if (!value) cancel(); }
function cancel() { reset(); emit('update:modelValue', false); emit('cancel'); }
async function selectReference(event) {
  const file = event.target.files?.[0]; event.target.value = ''; referenceFile.value = null; result.value = null;
  if (!file) return;
  if (!['image/jpeg','image/png'].includes(file.type) || file.size >= 8 * 1024 * 1024) { ElMessage.error(t('faceCompareDemo.imageError')); event.target.value = ''; return; }
  referenceFile.value = file;
  const current = generation; authenticating.value = true; token.value = ''; projectId.value = '';
  authController = new AbortController();
  const activeController = authController;
  const timeout = setTimeout(() => activeController.abort(), 30000);
  try {
    const response = await getDefaultHuaweiIamToken({ signal:activeController.signal });
    if (current === generation && props.modelValue) { token.value = response.token; projectId.value = response.projectId; }
  } catch { if (current === generation && props.modelValue) ElMessage.error(t('faceCompareDemo.autoTokenFailed')); }
  finally { clearTimeout(timeout); if (current === generation) { authenticating.value = false; authController = null; } }
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
function recordVideo() {
  if (!stream || recording.value) return;
  videoBlob.value = null; result.value = null;
  const mime = ['video/webm;codecs=vp8','video/mp4;codecs=avc1.42E01E'].find(type => globalThis.MediaRecorder?.isTypeSupported(type));
  if (!mime) { ElMessage.error(t('faceCompareDemo.recordError')); return; }
  const current = generation, chunks = [];
  const random = new Uint32Array(1);
  // Rejection sampling keeps all five actions equally likely.
  do { crypto.getRandomValues(random); } while (random[0] >= 4294967295);
  action.value = (random[0] % 5) + 1;
  try {
    recorder = new MediaRecorder(stream, { mimeType:mime, videoBitsPerSecond:700000 });
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => { if (current === generation) { recording.value = false; ElMessage.error(t('faceCompareDemo.recordError')); } };
    recorder.onstop = () => {
      if (current !== generation || !props.modelValue) return;
      recording.value = false;
      const blob = new Blob(chunks, { type:mime });
      if (!blob.size || blob.size > 8 * 1024 * 1024) { ElMessage.error(t('faceCompareDemo.videoError')); return; }
      videoBlob.value = blob;
      if (props.autoStart) void compare();
    };
    recorder.start(); recording.value = true;
    timer = setTimeout(() => { if (recorder?.state === 'recording') recorder.stop(); }, 5000);
  } catch { recording.value = false; ElMessage.error(t('faceCompareDemo.recordError')); }
}
async function compare() {
  if (busy.value || !referenceFile.value || !videoBlob.value || !token.value) return;
  const current = generation; busy.value = true; result.value = null; controller = new AbortController();
  try {
    const response = await compareLiveFace({ token:token.value, projectId:projectId.value, referenceImage:referenceFile.value, video:videoBlob.value, action:action.value, signal:controller.signal });
    if (current === generation && props.modelValue) result.value = response;
  } catch (error) {
    if (current === generation && props.modelValue) {
      const steps = { 'live-detect':'faceCompareDemo.stepLive', 'face-detect':'faceCompareDemo.stepDetect', 'face-compare':'faceCompareDemo.stepCompare' };
      const message = error.message === 'face_count' ? t('faceCompareDemo.faceCount') : t('faceCompareDemo.unavailable');
      const detail = steps[error.step] ? [t(steps[error.step]), error.code].filter(Boolean).join(' · ') : '';
      ElMessage.error({ message:[message, detail].filter(Boolean).join(' · '), duration:10000, showClose:true });
    }
  }
  finally { if (current === generation) { busy.value = false; controller = null; } }
}
function confirm() {
  if (!isMock || !result.value?.passed || !result.value.image) return;
  const payload = { targetName:props.targetName, nationalId:props.targetNationalId, image:result.value.image, simulated:true, provider:'huawei', similarity:result.value.score };
  stopCamera(); emit('success', payload); emit('update:modelValue', false);
}
// Demo-only fallback for flows that expose `allowQuickPass` while the cloud
// liveness service is not configured. The payload is explicitly simulated.
const PLACEHOLDER_FACE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==';
function captureFrame() {
  if (!videoRef.value || !cameraActive.value) return PLACEHOLDER_FACE;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.value.videoWidth || 320;
    canvas.height = videoRef.value.videoHeight || 240;
    canvas.getContext('2d').drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch {
    return PLACEHOLDER_FACE;
  }
}
function quickPass() {
  if (!isMock || !props.allowQuickPass) return;
  const image = captureFrame();
  stopCamera();
  const score = 0.99;
  result.value = { passed: true, image, score, simulated: true };
  emit('success', {
    targetName: props.targetName, nationalId: props.targetNationalId,
    image, simulated: true, provider: 'demo', similarity: score
  });
  emit('update:modelValue', false);
}
</script>
