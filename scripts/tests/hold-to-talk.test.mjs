import assert from 'node:assert/strict';
import test from 'node:test';
import { createHoldToTalkSession, MAX_VOICE_DURATION_MS } from '../../src/utils/holdToTalk.js';

function fakeClock() {
  let now = 0;
  let nextId = 0;
  const tasks = new Map();
  const schedule = (fn, delay, interval = 0) => {
    const id = ++nextId;
    tasks.set(id, { fn, at: now + delay, interval });
    return id;
  };
  return {
    now: () => now,
    setTimeout: (fn, delay) => schedule(fn, delay),
    setInterval: (fn, delay) => schedule(fn, delay, delay),
    clearTimeout: id => tasks.delete(id),
    clearInterval: id => tasks.delete(id),
    get pending() { return tasks.size; },
    advance(ms) {
      const until = now + ms;
      while (tasks.size) {
        const [id, task] = [...tasks].sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (task.at > until) break;
        now = task.at;
        if (task.interval) tasks.set(id, { ...task, at: now + task.interval });
        else tasks.delete(id);
        task.fn();
      }
      now = until;
    }
  };
}

function harness(factory) {
  const clock = fakeClock();
  const engines = [];
  const transcripts = [];
  let state;
  const controller = createHoldToTalkSession({
    clock,
    createRecognition: factory || (() => {
      const engine = {
        starts: 0, stops: 0, aborts: 0,
        start() { this.starts += 1; },
        stop() { this.stops += 1; },
        abort() { this.aborts += 1; },
        result(...results) {
          this.onresult?.({ resultIndex: 0, results: results.map(([text, isFinal]) => Object.assign([{ transcript: text }], { isFinal })) });
        },
        end() { this.onend?.(); },
        error(error) { this.onerror?.({ error }); }
      };
      engines.push(engine);
      return engine;
    }),
    onTranscript: text => transcripts.push(text),
    onChange: value => { state = value; }
  });
  return { controller, clock, engines, transcripts, get state() { return state; } };
}

test('keeps listening across utterance endings and deduplicates cumulative final results', () => {
  const h = harness();
  assert.equal(h.controller.start('ar-IQ'), true);
  const first = h.engines[0];
  assert.equal(first.lang, 'ar-IQ');
  assert.equal(first.continuous, true);
  assert.equal(first.interimResults, true);
  first.result(['مرحبا', true], ['بكم', false]);
  first.result(['مرحبا', true], ['بكم', true]);
  first.result(['مرحبا', true], ['بكم', true]);
  h.clock.advance(4000);
  first.end();
  assert.equal(h.state.phase, 'recording');
  h.clock.advance(150);
  assert.equal(h.engines.length, 2);
  h.engines[1].result(['دووبارە', true]);
  h.controller.stop();
  h.engines[1].end();
  assert.deepEqual(h.transcripts, ['مرحبا', 'بكم', 'دووبارە']);
  assert.equal(h.state.phase, 'idle');
  assert.equal(h.clock.pending, 0);
});

test('all restarted utterances share one hard 60-second recording limit', () => {
  const h = harness();
  h.controller.start('zh-CN');
  h.clock.advance(20000);
  h.engines[0].end();
  h.clock.advance(150);
  h.clock.advance(20000);
  h.engines[1].end();
  h.clock.advance(150);
  h.clock.advance(MAX_VOICE_DURATION_MS - h.clock.now() - 1);
  const last = h.engines.at(-1);
  assert.equal(last.stops, 0);
  h.clock.advance(1);
  assert.equal(last.stops, 1);
  assert.equal(h.state.limitReached, true);
  assert.equal(h.state.elapsedMs, MAX_VOICE_DURATION_MS);
  assert.equal(h.state.phase, 'finishing');
  last.result(['最后一句', true]);
  last.end();
  h.clock.advance(10000);
  assert.equal(h.engines.length, 3);
  assert.deepEqual(h.transcripts, ['最后一句']);
  assert.equal(h.state.phase, 'idle');
  assert.equal(h.clock.pending, 0);
});

test('releasing between utterances cancels pending restarts', () => {
  const h = harness();
  h.controller.start('en-US');
  h.engines[0].end();
  h.controller.stop();
  h.clock.advance(60000);
  assert.equal(h.engines.length, 1);
  assert.equal(h.state.phase, 'idle');
  assert.equal(h.clock.pending, 0);
});

test('release waits for the trailing final result instead of duplicating its interim', () => {
  const h = harness();
  h.controller.start('en-US');
  const engine = h.engines[0];
  engine.result(['partial', false]);
  h.controller.stop();
  assert.equal(engine.stops, 1);
  assert.equal(h.state.phase, 'finishing');
  assert.equal(h.controller.start('en-US'), false);
  engine.result(['complete sentence', true]);
  engine.end();
  h.clock.advance(2000);
  assert.deepEqual(h.transcripts, ['complete sentence']);
  assert.equal(h.clock.pending, 0);
});

test('retains the last interim and aborts if the service never finishes after release', () => {
  const h = harness();
  h.controller.start('ckb-IQ');
  const engine = h.engines[0];
  engine.result(['latest words', false]);
  h.controller.stop();
  h.clock.advance(1500);
  assert.deepEqual(h.transcripts, ['latest words']);
  assert.equal(engine.aborts, 1);
  assert.equal(h.state.phase, 'idle');
  assert.equal(h.clock.pending, 0);
});

test('silence is recoverable but permission errors and app cancellation never restart', () => {
  for (const terminalError of ['not-allowed', 'language-not-supported', 'network', 'aborted']) {
    const h = harness();
    h.controller.start('en-US');
    h.engines[0].error('no-speech');
    assert.equal(h.state.phase, 'recording');
    h.clock.advance(150);
    const staleEnd = h.engines[1].onend;
    h.engines[1].error(terminalError);
    staleEnd();
    h.clock.advance(60000);
    assert.equal(h.engines.length, 2);
    assert.equal(h.state.error, terminalError === 'aborted' ? '' : terminalError);
    assert.equal(h.state.phase, 'idle');
    assert.equal(h.clock.pending, 0);
  }
});

test('native busy retries are bounded', () => {
  const h = harness();
  h.controller.start('en-US');
  for (let index = 1; index <= 3; index += 1) {
    h.engines.at(-1).error('busy');
    h.clock.advance(400 * index);
  }
  h.engines.at(-1).error('busy');
  h.clock.advance(60000);
  assert.equal(h.engines.length, 4);
  assert.equal(h.state.error, 'busy');
  assert.equal(h.clock.pending, 0);
});

test('unsupported speech and thrown starts leave no active recording or timers', () => {
  for (const factory of [() => null, () => { throw Object.assign(new Error('denied'), { name: 'NotAllowedError' }); }]) {
    const h = harness(factory);
    assert.equal(h.controller.start('en-US'), false);
    assert.equal(h.state.phase, 'idle');
    assert.ok(['unsupported', 'not-allowed'].includes(h.state.error));
    assert.equal(h.clock.pending, 0);
  }
});

test('unmount aborts capture and ignores all stale recognition callbacks', () => {
  const h = harness();
  h.controller.start('en-US');
  const engine = h.engines[0];
  const staleResult = engine.onresult;
  const staleEnd = engine.onend;
  h.controller.dispose();
  staleResult({ results: [Object.assign([{ transcript: 'late' }], { isFinal: true })] });
  staleEnd();
  h.clock.advance(60000);
  assert.equal(engine.aborts, 1);
  assert.deepEqual(h.transcripts, []);
  assert.equal(h.engines.length, 1);
  assert.equal(h.clock.pending, 0);
  assert.equal(h.controller.start('en-US'), false);
});
