import test from 'node:test';
import assert from 'node:assert/strict';
import { callTencent, signTencentRequest } from '../../server/tencent/localProxy.mjs';
test('signs requests with the proper service, UTC scope and deterministic body', () => {
  const opts = { secretId:'id', secretKey:'key', action:'LivenessCompare', payload:'{"x":1}', timestamp:1551113065 };
  const signed = signTencentRequest(opts);
  assert.equal(signed.host, 'faceid.tencentcloudapi.com');
  assert.match(signed.authorization, /^TC3-HMAC-SHA256 Credential=id\/2019-02-25\/faceid\/tc3_request, SignedHeaders=content-type;host, Signature=[a-f0-9]{64}$/);
  assert.notEqual(signed.authorization, signTencentRequest({ ...opts, payload:'{"x":2}' }).authorization);
  assert.throws(() => signTencentRequest({ ...opts, action:'DeleteUser' }));
});
test('sends signed request to correct service and rejects provider errors', async () => {
  let captured;
  const args = { secretId:'id', secretKey:'key', action:'DetectFace', params:{ Image:'abc' }, timestamp:1551113065 };
  const result = await callTencent({ ...args, sessionToken:'temporary', fetchImpl:async (url, options) => { captured = {url, options}; return { ok:true, json:async () => ({ Response:{ FaceInfos:[{}] } }) }; } });
  assert.equal(result.FaceInfos.length, 1);
  assert.equal(captured.url, 'https://iai.tencentcloudapi.com/');
  assert.equal(captured.options.headers['X-TC-Region'], 'ap-guangzhou');
  assert.equal(captured.options.headers['X-TC-Version'], '2020-03-03');
  assert.equal(captured.options.headers['X-TC-Token'], 'temporary');
  await assert.rejects(callTencent({ ...args, fetchImpl:async () => ({ok:true,json:async () => ({Response:{Error:{Code:'Denied'}}})}) }));
});
