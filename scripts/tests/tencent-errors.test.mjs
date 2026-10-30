import test from 'node:test';
import assert from 'node:assert/strict';
import { callTencent, TencentRequestError } from '../../server/tencent/localProxy.mjs';
import { callLocalTencent } from '../../src/utils/liveFaceCompare.js';
const args = { secretId:'AKIDexample', secretKey:'secret-value', action:'GetActionSequence', params:{} };
test('preserves safe provider code and request ID without provider message', async () => {
  const requestId = '12345678-abcd-4321-abcd-123456789abc';
  await assert.rejects(callTencent({ ...args, fetchImpl:async () => ({ ok:true, json:async () => ({ Response:{ Error:{ Code:'UnauthorizedOperation.Nonactivated', Message:'secret-value' }, RequestId:requestId } }) }) }), error => error instanceof TencentRequestError && error.code === 'UnauthorizedOperation.Nonactivated' && error.requestId === requestId && !error.message.includes('secret-value'));
});
test('classifies connection failures and discards untrusted error fields', async () => {
  await assert.rejects(callTencent({ ...args, fetchImpl:async () => { throw new Error('secret-value'); } }), error => error.code === 'network_error' && !error.message.includes('secret-value'));
  await assert.rejects(callTencent({ ...args, fetchImpl:async () => ({ ok:true, json:async () => ({ Response:{ Error:{ Code:'secret value with spaces' }, RequestId:'private data' } }) }) }), error => error.code === 'request_failed' && error.requestId === null);
});
test('client receives safe error code and request ID', async () => {
  await assert.rejects(callLocalTencent({ credentials:{secretId:'id',secretKey:'key'}, action:'GetActionSequence', params:{}, fetchImpl:async () => ({ok:false,json:async () => ({error:'UnauthorizedOperation.Nonactivated', requestId:'abcd-1234'})}) }), error => error.message === 'UnauthorizedOperation.Nonactivated' && error.requestId === 'abcd-1234');
});
