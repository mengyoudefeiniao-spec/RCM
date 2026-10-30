import test from 'node:test';
import assert from 'node:assert/strict';
import { getHuaweiIamToken } from '../../src/utils/huaweiIam.js';
const projectId = '0123456789abcdef0123456789abcdef';
function reply(project = { id:projectId, name:'cn-north-4' }, token = 'issued-token') {
  return { ok:true, headers:new Headers(token ? { 'X-Subject-Token':token } : {}), json:async () => ({ token:{ project, expires_at:'2099-01-01T00:00:00Z' } }) };
}
test('requests regional project token and obtains project ID from IAM', async () => {
  let request;
  const value = await getHuaweiIamToken({ account:' tenant ', username:' user ', password:' pass ', fetchImpl:async (url, options) => { request = {url, options}; return reply(); } });
  assert.equal(request.url, '/__huawei_iam/v3/auth/tokens?nocatalog=true');
  const auth = JSON.parse(request.options.body).auth;
  assert.deepEqual(auth.scope, { project:{ name:'cn-north-4' } });
  assert.deepEqual(auth.identity.password.user, { domain:{ name:'tenant' }, name:'user', password:' pass ' });
  assert.equal(value.projectId, projectId); assert.equal(value.token, 'issued-token');
});
test('rejects failures, absent token, wrong region and expired tokens', async () => {
  const args = { account:'a', username:'b', password:'p' };
  await assert.rejects(getHuaweiIamToken({ ...args, fetchImpl:async () => ({ ok:false }) }));
  await assert.rejects(getHuaweiIamToken({ ...args, fetchImpl:async () => reply(undefined, '') }));
  await assert.rejects(getHuaweiIamToken({ ...args, fetchImpl:async () => reply({ id:projectId, name:'cn-south-1' }) }));
  await assert.rejects(getHuaweiIamToken({ ...args, fetchImpl:async () => ({ ...reply(), json:async () => ({ token:{ project:{ id:projectId, name:'cn-north-4' }, expires_at:'2000-01-01T00:00:00Z' } }) }) }));
  await assert.rejects(getHuaweiIamToken({ ...args, username:'' }));
});
