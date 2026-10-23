<template>
  <div :class="iconOnly ? 'relative shrink-0' : 'space-y-2'">
    <button
      type="button"
      class="voice-hold-button flex items-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3AF62] disabled:cursor-not-allowed disabled:opacity-60"
      :class="[
        iconOnly ? 'h-8 w-8 justify-center' : 'w-full min-h-16 gap-3 px-3 py-2.5 text-start',
        recording ? 'border-[#E5B8B8] bg-[#FBEAE9] text-[#A03E3C]' : 'border-[#C7DED0] bg-[#F3F8F4] text-[#326445] hover:border-[#D3AF62]'
      ]"
      :disabled="disabled || state.phase === 'finishing'"
      :aria-label="buttonLabel"
      :title="`${buttonLabel} · ${t('chatComplaint.voiceMaxDuration')}`"
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
      <span class="flex shrink-0 items-center justify-center" :class="iconOnly ? '' : ['h-10 w-10 rounded-full', recording ? 'bg-[#F2D5D4]' : 'bg-[#E1F4E4]']">
        <el-icon class="text-lg" :class="{ 'animate-pulse': recording, 'animate-spin': state.phase === 'finishing' }"><Loading v-if="state.phase === 'finishing'" /><Microphone v-else /></el-icon>
      </span>
      <span v-if="!iconOnly" class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-sm font-semibold leading-snug">{{ buttonLabel }}</span>
        <span class="text-[11px] leading-snug opacity-80">{{ t(recording ? 'chatComplaint.listening' : 'chatComplaint.voiceMaxDuration') }}</span>
      </span>
      <bdi v-if="!iconOnly && (state.elapsedMs > 0 || recording)" dir="ltr" class="shrink-0 font-mono text-xs tabular-nums" aria-hidden="true">{{ elapsed }} / 01:00</bdi>
    </button>
    <div v-if="showFeedback" :class="iconOnly ? 'absolute bottom-full end-0 z-10 mb-2 w-56 max-w-[calc(100vw-5rem)] space-y-2 rounded-lg border border-[#D9E5DB] bg-white p-3 text-start shadow-lg' : 'space-y-2'">
      <div v-if="iconOnly && state.phase !== 'idle'" class="flex items-center justify-between gap-2 text-xs text-[#326445]">
        <span role="status">{{ t(recording ? 'chatComplaint.listening' : 'chatComplaint.voiceFinishing') }}</span>
        <bdi dir="ltr" class="shrink-0 font-mono tabular-nums" aria-hidden="true">{{ elapsed }} / 01:00</bdi>
      </div>
      <p v-if="state.interim" role="status" class="max-h-20 overflow-y-auto break-words text-xs text-[#43554B]">{{ state.interim }}</p>
      <p v-if="state.error" role="alert" class="text-xs text-[#C04442]">{{ t(errorKey) }}</p>
      <p v-else-if="state.limitReached" role="status" class="text-xs text-[#7A5F21]">{{ t('chatComplaint.voiceLimitReached') }}</p>
    </div>
    <p :id="hintId" :class="iconOnly ? 'sr-only' : 'text-[11px] leading-relaxed text-[#8A9A8F]'">{{ t('chatComplaint.voiceHint') }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Loading, Microphone } from '@element-plus/icons-vue';
import { hasNativeAppBridge, NativeSpeechRecognition } from '../../utils/nativeApp.js';
import { createHoldToTalkSession } from '../../utils/holdToTalk.js';

const props = defineProps({ disabled: Boolean, iconOnly: Boolean });
const emit = defineEmits(['transcript', 'activeChange']);
const { t, locale } = useI18n();
const hintId = useId();
const state = ref({ phase: 'idle', elapsedMs: 0, interim: '', error: '', limitReached: false });
const recording = computed(() => state.value.phase === 'recording');
const buttonLabel = computed(() => t(state.value.phase === 'finishing' ? 'chatComplaint.voiceFinishing' : recording.value ? 'chatComplaint.stopVoice' : 'chatComplaint.startVoice'));
const showFeedback = computed(() => (props.iconOnly && state.value.phase !== 'idle') || state.value.interim || state.value.error || state.value.limitReached);
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
