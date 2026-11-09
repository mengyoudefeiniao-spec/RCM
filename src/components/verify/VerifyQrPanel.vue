<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-1 rounded-lg bg-[#EFF5F1] p-1">
      <button type="button" class="rounded-md px-2 py-1.5 text-xs" :class="mode === 'show' ? 'bg-white font-bold text-[#326445] shadow-sm' : 'text-[#58685D]'" @click="switchMode('show')">
        {{ $t('verification.qr.showTab') }}
      </button>
      <button type="button" class="rounded-md px-2 py-1.5 text-xs" :class="mode === 'scan' ? 'bg-white font-bold text-[#326445] shadow-sm' : 'text-[#58685D]'" @click="switchMode('scan')">
        {{ $t('verification.qr.scanTab') }}
      </button>
    </div>

    <!-- A phone: rotating 60 second code -->
    <div v-if="mode === 'show'" class="space-y-3">
      <p class="rounded-lg bg-[#EFF5F1] px-3 py-2 text-xs text-[#326445]">{{ $t('verification.qr.showHint') }}</p>
      <div class="flex flex-wrap items-end gap-2">
        <el-input v-model="memberId" size="small" class="max-w-[200px]" :placeholder="$t('verification.qr.memberPlaceholder')">
          <template #prepend>{{ $t('verification.qr.memberId') }}</template>
        </el-input>
        <el-button size="small" type="primary" @click="generate">{{ $t('verification.qr.generate') }}</el-button>
        <el-button v-if="payload" size="small" @click="stopRotate">{{ $t('verification.qr.stop') }}</el-button>
      </div>
      <div v-if="qrDataUrl" class="space-y-2 text-center">
        <img :src="qrDataUrl" :alt="$t('verification.qr.showTab')" class="mx-auto h-[220px] w-[220px] rounded-lg border border-[#D9E5DB] bg-white" />
        <p class="text-xs font-semibold" :class="remaining > 0 ? 'text-[#326445]' : 'text-[#A33A38]'">
          {{ remaining > 0 ? $t('verification.qr.remaining', { sec: remaining }) : $t('verification.qr.expired') }}
        </p>
        <p class="break-all font-mono text-[10px] text-[#8A9A8F]">{{ payload }}</p>
      </div>
      <p class="text-[10px] text-[#8A9A8F]">{{ $t('verification.qr.twoDeviceHint') }}</p>
    </div>

    <!-- B phone: decode and replay check -->
    <div v-else class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <el-button v-if="!scanning" type="primary" @click="startScan">{{ $t('verification.qr.scanStart') }}</el-button>
        <el-button v-else type="danger" plain @click="stopCamera">{{ $t('verification.qr.scanStop') }}</el-button>
        <el-select v-model="scene" size="small" class="max-w-[150px]">
          <el-option v-for="option in sceneOptions" :key="option" :label="$t(`verification.options.${option}`)" :value="option" />
        </el-select>
      </div>
      <p v-if="cameraError" class="rounded-lg bg-[#FBEAEA] px-3 py-2 text-xs text-[#A33A38]">{{ cameraError }}</p>
      <p v-else-if="scanning" class="text-xs text-[#326445]">{{ $t('verification.qr.scanning') }}</p>

      <div class="overflow-hidden rounded-lg bg-black" :class="scanning ? 'block' : 'hidden'">
        <video ref="videoEl" class="max-h-64 w-full object-cover" autoplay muted playsinline />
      </div>

      <section v-if="result" class="rounded-lg border p-3 text-xs" :class="result.ok ? 'border-[#AECBB8] bg-[#F3FAF4]' : 'border-[#E9C4C3] bg-[#FDF4F4]'">
        <p class="mb-1 font-bold">{{ result.message }}</p>
        <dl class="grid grid-cols-2 gap-x-3 gap-y-1">
          <div class="flex justify-between gap-2"><dt class="text-[#8A9A8F]">{{ $t('verification.qr.scanMs') }}</dt><dd class="font-mono">{{ result.scanMs }} ms</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#8A9A8F]">{{ $t('verification.qr.skew') }}</dt><dd class="font-mono">{{ result.skewMs ?? '-' }} ms</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#8A9A8F]">{{ $t('verification.qr.replayBlocked') }}</dt><dd class="font-mono">{{ result.replayBlocked ? $t('verification.yes') : $t('verification.no') }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#8A9A8F]">{{ $t('verification.qr.length') }}</dt><dd class="font-mono">{{ result.payload.length }}</dd></div>
        </dl>
        <p class="mt-1 break-all font-mono text-[10px] text-[#58685D]">{{ result.payload }}</p>
        <div class="mt-2 flex justify-end gap-2">
          <el-button size="small" @click="startScan">{{ $t('verification.qr.scanAgain') }}</el-button>
          <el-button size="small" type="primary" @click="save">{{ $t('verification.qr.save') }}</el-button>
        </div>
      </section>
      <p class="text-[10px] text-[#8A9A8F]">{{ $t('verification.qr.hint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import jsQR from 'jsqr';
import QRCode from 'qrcode';

const emit = defineEmits(['record']);
const { t } = useI18n();

const TTL_MS = 60_000;
const REPLAY_KEY = 'rcm_verify_qr_seen';

const mode = ref('scan');
const memberId = ref('');
const payload = ref('');
const qrDataUrl = ref('');
const remaining = ref(0);
const scene = ref('indoor');
const scanning = ref(false);
const cameraError = ref('');
const result = ref(null);
const videoEl = ref(null);
const sceneOptions = ['indoor', 'outdoor', 'weak', 'offline'];

let rotateTimer;
let tickTimer;
let stream;
let startedAt = 0;
let frameTimer;

function stopRotate() {
  clearInterval(rotateTimer);
  clearInterval(tickTimer);
  rotateTimer = tickTimer = undefined;
  payload.value = '';
  qrDataUrl.value = '';
  remaining.value = 0;
}

function switchMode(next) {
  if (mode.value === next) return;
  stopCamera();
  stopRotate();
  mode.value = next;
}

function checksum(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 6).toUpperCase();
}

function buildPayload(id) {
  const issuedAt = Date.now();
  const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
  const body = `RCM1|${id}|${issuedAt}|${nonce}`;
  return `${body}|${checksum(body)}`;
}

async function refreshCode() {
  const id = memberId.value.trim() || '0000000';
  const next = buildPayload(id);
  payload.value = next;
  remaining.value = 60;
  try {
    qrDataUrl.value = await QRCode.toDataURL(next, { margin: 1, width: 320, errorCorrectionLevel: 'M' });
  } catch {
    qrDataUrl.value = '';
  }
}

function generate() {
  stopRotate();
  refreshCode();
  rotateTimer = setInterval(refreshCode, TTL_MS);
  tickTimer = setInterval(() => {
    remaining.value = Math.max(0, remaining.value - 1);
  }, 1000);
}

function parsePayload(text) {
  const parts = String(text || '').split('|');
  if (parts.length !== 5 || parts[0] !== 'RCM1') return null;
  const issuedAt = Number(parts[2]);
  if (!Number.isFinite(issuedAt)) return null;
  if (checksum(parts.slice(0, 4).join('|')) !== parts[4]) return null;
  return { memberId: parts[1], issuedAt, nonce: parts[3], ttl: TTL_MS };
}

function seenCodes() {
  try {
    return JSON.parse(localStorage.getItem(REPLAY_KEY) || '[]');
  } catch {
    return [];
  }
}

function rememberCode(text) {
  const list = seenCodes().filter(entry => entry !== text);
  list.unshift(text);
  localStorage.setItem(REPLAY_KEY, JSON.stringify(list.slice(0, 200)));
}

async function startScan() {
  result.value = null;
  cameraError.value = '';
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    scanning.value = true;
    await new Promise(resolve => setTimeout(resolve, 60));
    if (!videoEl.value) return;
    videoEl.value.srcObject = stream;
    await videoEl.value.play();
    startedAt = performance.now();
    frameTimer = setInterval(decodeFrame, 140);
  } catch {
    scanning.value = false;
    cameraError.value = t('verification.qr.cameraError');
  }
}

function decodeFrame() {
  const video = videoEl.value;
  if (!video || video.readyState < 2 || !video.videoWidth) return;
  const width = Math.min(720, video.videoWidth);
  const height = Math.round((video.videoHeight * width) / video.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(video, 0, 0, width, height);
  const image = context.getImageData(0, 0, width, height);
  const code = jsQR(image.data, width, height, { inversionAttempts: 'dontInvert' });
  if (code?.data) finishScan(code.data);
}

function finishScan(text) {
  const scanMs = Math.round(performance.now() - startedAt);
  stopCamera();
  const parsed = parsePayload(text);
  const previous = seenCodes();
  const replayBlocked = previous.includes(text);
  rememberCode(text);
  let ok = true;
  let message = t('verification.qr.scanned');
  let skewMs = null;
  if (!parsed) {
    ok = false;
    message = t('verification.qr.invalidFormat');
  } else {
    skewMs = Date.now() - parsed.issuedAt;
    if (Math.abs(skewMs) > parsed.ttl + 5000) {
      ok = false;
      message = t('verification.qr.expiredCode');
    } else if (replayBlocked) {
      ok = false;
      message = `${t('verification.qr.scanned')} · ${t('verification.qr.replayBlocked')}`;
    }
  }
  result.value = { payload: text, scanMs, skewMs, replayBlocked, ok, message, parsed };
}

function stopCamera() {
  clearInterval(frameTimer);
  frameTimer = undefined;
  scanning.value = false;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = undefined;
  }
  if (videoEl.value) videoEl.value.srcObject = null;
}

function save() {
  if (!result.value) return;
  emit('record', {
    metrics: {
      scanMs: result.value.scanMs,
      skewMs: result.value.skewMs,
      replayBlocked: result.value.replayBlocked,
      payloadLength: result.value.payload.length,
      ttl: TTL_MS,
      valid: result.value.ok,
    },
    input: { scene: scene.value, payload: result.value.payload.slice(0, 120) },
  });
  ElMessage.success(t('verification.qr.saved'));
  result.value = null;
}

onBeforeUnmount(() => {
  stopRotate();
  stopCamera();
});
</script>
