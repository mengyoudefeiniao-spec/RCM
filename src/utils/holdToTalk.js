export const MAX_VOICE_DURATION_MS = 60_000;

// One press owns the deadline, even when a browser or native recognizer ends
// an utterance early. A fresh recognizer also resets its result indices.
export function createHoldToTalkSession({ createRecognition, onTranscript = () => {}, onChange = () => {}, clock = {} }) {
  const time = {
    now: () => performance.now(),
    setTimeout: (callback, delay) => setTimeout(callback, delay),
    clearTimeout: id => clearTimeout(id),
    setInterval: (callback, delay) => setInterval(callback, delay),
    clearInterval: id => clearInterval(id),
    ...clock
  };
  const state = { phase: 'idle', elapsedMs: 0, interim: '', error: '', limitReached: false };
  let holding = false;
  let disposed = false;
  let startedAt = 0;
  let language = '';
  let current;
  let deadlineTimer;
  let elapsedTimer;
  let restartTimer;
  let finishTimer;
  let busyRetries = 0;

  const publish = () => onChange({ ...state });
  const updateElapsed = () => { state.elapsedMs = Math.min(MAX_VOICE_DURATION_MS, Math.max(0, time.now() - startedAt)); };

  function clearCaptureTimers() {
    time.clearTimeout(deadlineTimer);
    time.clearTimeout(restartTimer);
    time.clearInterval(elapsedTimer);
    deadlineTimer = restartTimer = elapsedTimer = undefined;
  }

  function detach(session, preserveInterim = true) {
    if (!session || current !== session) return;
    current = undefined;
    session.engine.onresult = session.engine.onerror = session.engine.onend = null;
    if (preserveInterim && session.pending.length) onTranscript(session.pending.join(' '));
    session.pending = [];
    state.interim = '';
    try { session.engine.abort(); } catch { /* The service may already have ended. */ }
  }

  function finish() {
    holding = false;
    clearCaptureTimers();
    time.clearTimeout(finishTimer);
    finishTimer = undefined;
    detach(current);
    state.phase = 'idle';
    publish();
  }

  function stop(atLimit = false) {
    if (disposed || state.phase !== 'recording') return;
    holding = false;
    updateElapsed();
    state.limitReached = atLimit;
    clearCaptureTimers();
    if (!current) { finish(); return; }
    state.phase = 'finishing';
    publish();
    // stop() releases the microphone and can still deliver the last final
    // result. Bound that wait, retaining the latest interim if it never does.
    finishTimer = time.setTimeout(finish, 1500);
    try { current.engine.stop(); } catch { finish(); }
  }

  function endSegment(session, delay = 150) {
    if (disposed || current !== session) return;
    detach(session);
    if (!holding) { finish(); return; }
    updateElapsed();
    if (state.elapsedMs >= MAX_VOICE_DURATION_MS) { stop(true); return; }
    publish();
    restartTimer = time.setTimeout(startSegment, delay);
  }

  function fail(error) {
    state.error = error === 'aborted' ? '' : error;
    updateElapsed();
    finish();
  }

  function startSegment() {
    restartTimer = undefined;
    if (!holding || disposed) return;
    updateElapsed();
    if (state.elapsedMs >= MAX_VOICE_DURATION_MS) { stop(true); return; }
    try {
      const engine = createRecognition();
      if (!engine) { fail('unsupported'); return; }
      const session = { engine, committed: new Set(), pending: [] };
      current = session;
      engine.lang = language;
      engine.continuous = true;
      engine.interimResults = true;
      engine.onresult = event => {
        if (disposed || current !== session) return;
        session.pending = [];
        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];
          const text = (result[0]?.transcript || '').trim();
          if (result.isFinal) {
            if (!session.committed.has(index)) {
              session.committed.add(index);
              if (text) onTranscript(text);
            }
          } else if (text && !session.committed.has(index)) session.pending.push(text);
        }
        busyRetries = 0;
        state.interim = session.pending.join(' ');
        publish();
      };
      engine.onerror = event => {
        if (disposed || current !== session) return;
        if (event.error === 'no-speech') { endSegment(session); return; }
        if (event.error === 'busy' && holding && busyRetries < 3) {
          endSegment(session, 400 * ++busyRetries);
          return;
        }
        fail(event.error || 'recognition-failed');
      };
      engine.onend = () => endSegment(session);
      engine.start();
    } catch (error) {
      fail(['NotAllowedError', 'SecurityError'].includes(error?.name) ? 'not-allowed' : 'recognition-failed');
    }
  }

  function start(lang) {
    if (disposed || state.phase !== 'idle') return false;
    holding = true;
    startedAt = time.now();
    language = lang;
    busyRetries = 0;
    Object.assign(state, { phase: 'recording', elapsedMs: 0, interim: '', error: '', limitReached: false });
    deadlineTimer = time.setTimeout(() => stop(true), MAX_VOICE_DURATION_MS);
    elapsedTimer = time.setInterval(() => {
      updateElapsed();
      if (state.elapsedMs >= MAX_VOICE_DURATION_MS) stop(true);
      else publish();
    }, 100);
    publish();
    startSegment();
    return holding;
  }

  function dispose() {
    if (disposed) return;
    holding = false;
    disposed = true;
    clearCaptureTimers();
    time.clearTimeout(finishTimer);
    detach(current, false);
    state.phase = 'idle';
    publish();
  }

  return { start, stop: () => stop(), dispose };
}
