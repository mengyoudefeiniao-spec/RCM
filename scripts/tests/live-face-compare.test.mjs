import test from 'node:test';
import assert from 'node:assert/strict';
import { getActionSequence, compareLiveFace } from '../../src/utils/liveFaceCompare.js';
globalThis.FileReader = class { readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result = `data:${blob.type};base64,${Buffer.from(value).toString('base64')}`; this.onload(); }).catch(() => this.onerror()); } };
const credentials = { secretId:'id', secretKey:'key' };
const referenceImage = new Blob(['photo'], {type:'image/jpeg'});
const video = new Blob(['video'], {type:'video/mp4'});
function mocked(responses, calls) { return async (_url, options) => { calls.push(JSON.parse(options.body)); return { ok:true, json:async () => responses.shift() }; }; }
test('uses action sequence then checks both faces and returns verified screenshot', async () => {
  const calls = [];
  const seq = await getActionSequence({ credentials, fetchImpl:mocked([{ActionSequence:'2,1'}],calls) });
  const result = await compareLiveFace({ credentials, referenceImage, video, sequence:seq, fetchImpl:mocked([{FaceInfos:[{}]}, {Result:'Success', Sim:85, BestFrameBase64:'YWJj'}, {FaceInfos:[{}]}],calls) });
  assert.equal(result.passed,true); assert.equal(result.image,'data:image/jpeg;base64,YWJj');
  assert.deepEqual(calls.map(x => x.action), ['GetActionSequence','DetectFace','LivenessCompare','DetectFace']);
  assert.equal(calls[2].params.ValidateData,'2,1');
});
test('stops on action failure or ambiguous face and rejects malformed responses', async () => {
  const args = {credentials, referenceImage, video, sequence:'1,2'};
  let calls = [];
  const result = await compareLiveFace({ ...args, fetchImpl:mocked([{FaceInfos:[{}]}, {Result:'FailedOperation.ActionCloseEye'}],calls) });
  assert.equal(result.passed,false); assert.equal(calls.length,2);
  calls = [];
  await assert.rejects(compareLiveFace({ ...args, fetchImpl:mocked([{FaceInfos:[{},{}]}],calls) }), /face_count/);
  assert.equal(calls.length,1);
  await assert.rejects(getActionSequence({credentials,fetchImpl:mocked([{ActionSequence:'1,3'}],[])}));
  await assert.rejects(compareLiveFace({ ...args, fetchImpl:mocked([{FaceInfos:[{}]}, {Result:'Success',Sim:80}],[]) }));
});
