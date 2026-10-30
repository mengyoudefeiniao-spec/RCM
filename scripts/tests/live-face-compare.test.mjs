import test from 'node:test';
import assert from 'node:assert/strict';
import { compareLiveFace } from '../../src/utils/liveFaceCompare.js';
const image = 'data:image/jpeg;base64,YWJj';
test('sends two images and accepts only a clear liveness and match result', async () => {
  let request;
  const result = await compareLiveFace({ token:'secret', referenceImage:image, liveImage:image, fetchImpl:async (url, options) => { request = { url, options }; return { ok:true, json:async () => ({ data:{ score:0.9, liveness:{ passed:true } } }) }; } });
  assert.equal(request.url, 'https://api.verifik.co/v2/face-recognition/compare-live');
  assert.deepEqual(JSON.parse(request.options.body).gallery, ['YWJj']);
  assert.equal(result.passed, true);
  const failed = await compareLiveFace({ token:'secret', referenceImage:image, liveImage:image, fetchImpl:async () => ({ ok:true, json:async () => ({ data:{ score:0.9, liveness:{ passed:false } } }) }) });
  assert.equal(failed.passed, false);
});
test('rejects missing, malformed and ambiguous responses', async () => {
  await assert.rejects(compareLiveFace({ token:'', referenceImage:image, liveImage:image }));
  await assert.rejects(compareLiveFace({ token:'secret', referenceImage:'bad', liveImage:image }));
  await assert.rejects(compareLiveFace({ token:'secret', referenceImage:image, liveImage:image, fetchImpl:async () => ({ ok:true, json:async () => ({ data:{ score:0.9 } }) }) }));
});
