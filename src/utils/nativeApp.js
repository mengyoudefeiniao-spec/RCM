export const hasNativeAppBridge = () => typeof window !== 'undefined' && typeof window.RcmNative?.postMessage === 'function';

export function nativeAppRequest(action, data = {}, timeout = 10000) {
  if (!hasNativeAppBridge()) return Promise.resolve(false);
  const requestId = crypto.randomUUID();
  return new Promise(resolve => {
    const finish = value => { clearTimeout(timer); window.removeEventListener('rcm-native-response', onResponse); resolve(value); };
    const onResponse = event => { if (event.detail?.requestId === requestId) finish(event.detail.success === true); };
    const timer = setTimeout(() => finish(false), timeout);
    window.addEventListener('rcm-native-response', onResponse);
    try { window.RcmNative.postMessage(JSON.stringify({ ...data, action, requestId })); }
    catch { finish(false); }
  });
}

// Android WebView does not consistently expose Web Speech; use the installed
// device recognition service through the origin-restricted native bridge.
export class NativeSpeechRecognition {
  constructor() {
    this.requestId = crypto.randomUUID();
    this.listener = event => {
      const data = event.detail;
      if (data?.requestId !== this.requestId) return;
      if (data.type === 'result') {
        const result = Object.assign([{ transcript: data.transcript || '' }], { isFinal: data.final === true });
        this.onresult?.({ resultIndex: 0, results: [result] });
      } else if (data.type === 'error') this.onerror?.({ error: data.error || 'network' });
      else if (data.type === 'end') { window.removeEventListener('rcm-native-speech', this.listener); this.onend?.(); }
    };
  }
  start() {
    window.addEventListener('rcm-native-speech', this.listener);
    try { window.RcmNative.postMessage(JSON.stringify({ action: 'startSpeech', requestId: this.requestId, language: this.lang })); }
    catch (error) { window.removeEventListener('rcm-native-speech', this.listener); throw error; }
  }
  stop() { window.RcmNative.postMessage(JSON.stringify({ action: 'stopSpeech', requestId: this.requestId })); }
  abort() {
    window.removeEventListener('rcm-native-speech', this.listener);
    window.RcmNative.postMessage(JSON.stringify({ action: 'cancelSpeech', requestId: this.requestId }));
  }
}
