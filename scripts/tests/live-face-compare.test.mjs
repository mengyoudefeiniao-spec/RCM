import test from 'node:test';
import assert from 'node:assert/strict';
import { compareLiveFace } from '../../src/utils/liveFaceCompare.js';
const projectId = '0123456789abcdef0123456789abcdef';
const referenceImage = new Blob(['reference'], { type:'image/jpeg' });
const video = new Blob(['video'], { type:'video/webm;codecs=vp8' });
function mock(responses, requests) {
  return async (url, options) => { requests.push({ url, options }); return { ok:true, json:async () => responses.shift() }; };
}
const success = () => [{ 'video-result':{ alive:true, actions:[{ action:3, confidence:0.9 }], picture:'YWJj' } }, { faces:[{}] }, { faces:[{}] }, { similarity:0.95 }];
test('sends the recorded video, detects one face per image, then compares the returned frame', async () => {
  const requests = [];
  const result = await compareLiveFace({ token:'temporary', projectId, referenceImage, video, action:3, fetchImpl:mock(success(), requests) });
  assert.equal(result.passed, true);
  assert.equal(result.image, 'data:image/jpeg;base64,YWJj');
  assert.deepEqual(requests.map(item => item.url.split('/').at(-1)), ['live-detect','face-detect','face-detect','face-compare']);
  assert.equal(requests[0].options.body.get('actions'), '3');
  assert.equal(requests[0].options.headers['X-Auth-Token'], 'temporary');
  assert.ok(requests[3].options.body.get('image1_file') instanceof Blob);
});
test('never compares on action failure, invalid result or multiple faces', async () => {
  let requests = [];
  const result = await compareLiveFace({ token:'x', projectId, referenceImage, video, action:3, fetchImpl:mock([{ 'video-result':{ alive:false } }], requests) });
  assert.equal(result.passed, false); assert.equal(requests.length, 1);
  requests = [];
  await assert.rejects(compareLiveFace({ token:'x', projectId, referenceImage, video, action:3, fetchImpl:mock([{ 'video-result':{ alive:true, actions:[{action:4}], picture:'YWJj' } }], requests) }));
  requests = [];
  await assert.rejects(compareLiveFace({ token:'x', projectId, referenceImage, video, action:3, fetchImpl:mock([{ 'video-result':{ alive:true, actions:[{action:3}], picture:'YWJj' } }, { faces:[{},{}] }], requests) }), /face_count/);
  assert.equal(requests.length, 2);
});
test('validates configuration and does not pass a low or invalid similarity', async () => {
  await assert.rejects(compareLiveFace({ token:'x', projectId:'bad', referenceImage, video, action:3 }));
  const data = success(); data[3] = { similarity:0.93 };
  assert.equal((await compareLiveFace({ token:'x', projectId, referenceImage, video, action:3, fetchImpl:mock(data, []) })).passed, false);
  const invalid = success(); invalid[3] = {};
  await assert.rejects(compareLiveFace({ token:'x', projectId, referenceImage, video, action:3, fetchImpl:mock(invalid, []) }));
});

test('uploads reference photos with a matching filename for comparison', async () => {
  for (const [type, filename] of [['image/jpeg','reference.jpg'], ['image/png','reference.png'], ['image/bmp','reference.bmp']]) {
    const requests = [];
    await compareLiveFace({ token:'temporary', projectId, referenceImage:new Blob(['photo'], { type }), video, action:3, fetchImpl:mock(success(), requests) });
    assert.equal(requests[3].options.body.get('image1_file').name, filename);
  }
});
test('reports the failing API step and a sanitized Huawei error code', async () => {
  const fetchImpl = async () => ({ok:false, json:async () => ({error_code:'FRS.0016', error_msg:'private text'})});
  await assert.rejects(compareLiveFace({ token:'temporary', projectId, referenceImage, video, action:3, fetchImpl }), error => error.message === 'huawei_request_failed' && error.step === 'live-detect' && error.code === 'FRS.0016' && !error.message.includes('private text'));
});

test('supports each Huawei action code and rejects unsupported actions', async () => {
  for (const action of [1, 2, 3, 4, 5]) {
    const requests = [];
    const responses = [{ 'video-result':{ alive:true, actions:[{ action }], picture:'YWJj' } }, { faces:[{}] }, { faces:[{}] }, { similarity:0.95 }];
    const result = await compareLiveFace({ token:'temporary', projectId, referenceImage, video, action, fetchImpl:mock(responses, requests) });
    assert.equal(result.passed, true);
    assert.equal(requests[0].options.body.get('actions'), String(action));
  }
  await assert.rejects(compareLiveFace({ token:'temporary', projectId, referenceImage, video, action:6 }));
});
