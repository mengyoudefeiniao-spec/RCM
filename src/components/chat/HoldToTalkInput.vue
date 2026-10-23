<template>
  <div class="space-y-2">
    <button
      type="button"
      class="voice-hold-button flex w-full min-h-16 items-center gap-3 rounded-lg border px-3 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3AF62] disabled:cursor-not-allowed disabled:opacity-60"
      :class="recording ? 'border-[#E5B8B8] bg-[#FBEAE9] text-[#A03E3C]' : 'border-[#C7DED0] bg-[#F3F8F4] text-[#326445] hover:border-[#D3AF62]'"
      :disabled="disabled || state.phase === 'finishing'"
      :aria-pressed="recording"
      :aria-describedby="hintId"
      @pointerdown="startPointer"
      @pointerup="releasePointer"
      @pointercancel="releasePointer"
      @lostpointercapture="releasePointer"
      @keydown="startKey"
      @keyup="releaseKey"
      @blur="release"
      @click.prevent
      @contextmenu.prevent
    >
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" :class="recording ? 'bg-[#F2D5D4]' : 'bg-[#E1F4E4]'">
        <el-icon class="text-lg" :class="{ 'animate-pulse': recording }"><Microphone /></el-icon>
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-sm font-semibold leading-snug">{{ t(state.phase === 'finishing' ? 'chatComplaint.voiceFinishing' : recording ? 'chatComplaint.stopVoice' : 'chatComplaint.startVoice') }}</span>
        <span class="text-[11px] leading-snug opacity-80">{{ t(recording ? 'chatComplaint.listening' : 'chatComplaint.voiceMaxDuration') }}</span>
      </span>
      <bdi v-if="state.elapsedMs > 0 || recording" dir="ltr" class="shrink-0 font-mono text-xs tabular-nums" aria-hidden="true">{{ elapsed }} / 01:00</bdi>
    </button>
    <p v-if="state.interim" role="status" class="break-words text-xs text-[#43554B]">{{ state.interim }}</p>
    <p v-if="state.error" role="alert" class="text-xs text-[#C04442]">{{ t(errorKey) }}</p>
    <p v-else-if="state.limitReached" role="status" class="text-xs text-[#7A5F21]">{{ t('chatComplaint.voiceLimitReached') }}</p>
    <p :id="hintId" class="text-[11px] leading-relaxed text-[#8A9A8F]">{{ t('chatComplaint.voiceHint') }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Microphone } from '@element-plus/icons-vue';
import { hasNativeAppBridge, NativeSpeechRecognition } from '../../utils/nativeApp.js';
import { createHoldToTalkSession } from '../../utils/holdToTalk.js';

const props = defineProps({ disabled: Boolean });
const emit = defineEmits(['transcript', 'activeChange']);
const { t, locale } = useI18n();
const hintId = useId();
const state = ref({ phase: 'idle', elapsedMs: 0, interim: '', error: '', limitReached: false });
const recording = computed(() => state.value.phase === 'recording');
const elapsed = computed(() => {
  const seconds = Math.floor(state.value.elapsedMs / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
});
const errorKey = computed(() => {
  const error = state.value.error;
  if (error === 'unsupported') return 'chatComplaint.voiceUnsupported';
  if (error === 'language-not-supported') return 'chatComplaint.voiceLanguageUnsupported';
  return ['not-allowed', 'service-not-allowed', 'audio-capture'].includes(error) ? 'chatComplaint.voiceDenied' : 'chatComplaint.voiceFailed';
});
let pointerId = null;
let heldKey = '';

const session = createHoldToTalkSession({
  createRecognition() {
    const Recognition = hasNativeAppBridge() ? NativeSpeechRecognition : (window.SpeechRecognition || window.webkitSpeechRecognition);
    return Recognition ? new Recognition() : null;
  },
  onTranscript: text => emit('transcript', text),
  onChange: value => { state.value = value; emit('activeChange', value.phase !== 'idle'); }
});

function start() {
  if (props.disabled) return false;
  const language = { zh: 'zh-CN', en: 'en-US', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'ar-IQ';
  return session.start(language);
}
function startPointer(event) {
  if (event.button !== 0 || event.isPrimary === false || pointerId !== null || heldKey) return;
  event.preventDefault();
  if (!start()) return;
  pointerId = event.pointerId;
  try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Window release listeners provide a fallback. */ }
}
function releasePointer(event) {
  if (event.pointerId !== pointerId) return;
  release();
}
function startKey(event) {
  if (event.code === 'Escape') { event.preventDefault(); release(); return; }
  if (!['Space', 'Enter'].includes(event.code)) return;
  event.preventDefault();
  if (!event.repeat && !heldKey && pointerId === null && start()) heldKey = event.code;
}
function releaseKey(event) {
  if (event.code !== heldKey) return;
  event.preventDefault();
  release();
}
function release() { pointerId = null; heldKey = ''; session.stop(); }
function onVisibilityChange() { if (document.hidden) release(); }

watch(locale, release);
watch(() => props.disabled, disabled => { if (disabled) release(); });
onMounted(() => {
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
  window.addEventListener('keyup', releaseKey);
  window.addEventListener('blur', release);
  window.addEventListener('pagehide', release);
  document.addEventListener('visibilitychange', onVisibilityChange);
});
onBeforeUnmount(() => {
  session.dispose();
  window.removeEventListener('pointerup', releasePointer);
  window.removeEventListener('pointercancel', releasePointer);
  window.removeEventListener('keyup', releaseKey);
  window.removeEventListener('blur', release);
  window.removeEventListener('pagehide', release);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>

<style scoped>
.voice-hold-button { touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
</style>
