<template>
  <el-dialog :model-value="modelValue" :title="title || $t('faceCompareDemo.title')" :width="dialogWidth" align-center :close-on-click-modal="false" @update:model-value="onVisibilityChange" @closed="reset">
    <div class="space-y-3">
      <el-alert :title="$t('faceCompareDemo.notice')" type="warning" :closable="false" show-icon />
      <p class="text-xs text-[#58685D]">{{ $t('faceCompareDemo.warning') }}</p>
      <el-alert v-if="notice" :title="notice" type="warning" :closable="false" />
      <p v-if="targetName" class="text-sm font-semibold">{{ targetName }}</p>
      <label class="block text-sm">{{ $t('faceCompareDemo.token') }}</label>
      <el-input v-model="token" type="password" show-password autocomplete="off" dir="ltr" />
      <p class="text-xs text-[#58685D]">{{ $t('faceCompareDemo.tokenHint') }}</p>
      <label class="block text-sm">{{ $t('faceCompareDemo.reference') }}</label>
      <input type="file" accept="image/jpeg,image/png,image/webp" class="block w-full text-sm" @change="selectReference" />
      <img v-if="referenceImage" :src="referenceImage" :alt="$t('faceCompareDemo.reference')" class="h-24 max-w-full object-contain" />
      <div class="flex flex-wrap gap-2">
        <el-button :disabled="busy" @click="startCamera">{{ $t('faceCompareDemo.camera') }}</el-button>
        <el-button :disabled="!cameraActive || busy" @click="capture">{{ $t(liveImage ? 'faceCompareDemo.retake' : 'faceCompareDemo.capture') }}</el-button>
      </div>
      <video ref="videoRef" autoplay playsinline muted class="w-full max-h-56 bg-[#12241A] rounded-lg" v-show="cameraActive"></video>
      <img v-if="liveImage" :src="liveImage" :alt="$t('faceCompareDemo.capture')" class="h-32 max-w-full object-contain" />
      <a v-if="liveImage" :href="liveImage" download="face-capture.jpg" class="block text-sm text-[#326445] underline">{{ $t('faceCompareDemo.download') }}</a>
      <el-alert v-if="result" :title="$t(result.passed ? 'faceCompareDemo.passed' : 'faceCompareDemo.failed')" :type="result.passed ? 'success' : 'warning'" :closable="false" show-icon />
      <p v-if="result" class="text-sm">{{ $t('faceCompareDemo.score') }}: {{ (result.score * 100).toFixed(1) }}% · {{ $t('faceCompareDemo.liveness') }}: {{ $t(result.livenessPassed ? 'faceCompareDemo.passed' : 'faceCompareDemo.failed') }}</p>
    </div>
    <template #footer>
      <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="busy" :disabled="!token || !referenceImage || !liveImage" @click="compare">{{ $t('faceCompareDemo.compare') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { compareLiveFace } from '../../utils/liveFaceCompare.js';
const props = defineProps({ modelValue: Boolean, title: { type: String, default: '' }, targetName: { type: String, default: '' }, targetNationalId: { type: String, default: '' }, allowQuickPass: Boolean, notice: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue', 'success', 'cancel']);
const { t } = useI18n();
const { dialogWidth } = useCompactDialog(520);
const token = ref(''), referenceImage = ref(''), liveImage = ref(''), videoRef = ref(null), result = ref(null);
const busy = ref(false), cameraActive = ref(false);
let stream = null, generation = 0;
function stopCamera() { stream?.getTracks().forEach(track => track.stop()); stream = null; cameraActive.value = false; }
function reset() { generation++; stopCamera(); token.value = ''; referenceImage.value = ''; liveImage.value = ''; result.value = null; busy.value = false; }
watch(() => props.modelValue, value => { if (!value) reset(); });
onBeforeUnmount(reset);
function onVisibilityChange(value) { if (!value) cancel(); }
function cancel() { reset(); emit('update:modelValue', false); emit('cancel'); }
function selectReference(event) {
  const file = event.target.files?.[0]; referenceImage.value = ''; result.value = null;
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { ElMessage.error(t('faceCompareDemo.imageError')); event.target.value = ''; return; }
  const current = generation; const reader = new FileReader();
  reader.onload = () => { if (current === generation && props.modelValue) referenceImage.value = reader.result; };
  reader.readAsDataURL(file);
}
async function startCamera() {
  const current = generation; stopCamera();
  try {
    const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (current !== generation || !props.modelValue) { next.getTracks().forEach(track => track.stop()); return; }
    stream = next; cameraActive.value = true; await nextTick();
    if (videoRef.value) { videoRef.value.srcObject = stream; await videoRef.value.play(); }
  } catch { stopCamera(); if (current === generation) ElMessage.error(t('faceCompareDemo.cameraError')); }
}
function capture() {
  const video = videoRef.value;
  if (!video?.videoWidth || !video?.videoHeight) return;
  const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0); liveImage.value = canvas.toDataURL('image/jpeg', 0.9); result.value = null;
}
async function compare() {
  if (busy.value || !referenceImage.value || !liveImage.value || !token.value) return;
  const current = generation; const image = liveImage.value; busy.value = true; result.value = null;
  try {
    const response = await compareLiveFace({ token: token.value, referenceImage: referenceImage.value, liveImage: image });
    if (current !== generation || !props.modelValue) return;
    result.value = response;
    if (response.passed && import.meta.env.VITE_APP_MOCK_MODE === 'true') {
      stopCamera();
      emit('success', { targetName: props.targetName, nationalId: props.targetNationalId, image, simulated: true, provider: 'verifik', livenessPassed: true, similarity: response.score });
      emit('update:modelValue', false);
    }
  } catch { if (current === generation && props.modelValue) ElMessage.error(t('faceCompareDemo.unavailable')); }
  finally { if (current === generation) busy.value = false; }
}
</script>
