import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultIamHandler } from '../../server/huawei/localIam.mjs';
import { getDefaultHuaweiIamToken } from '../../src/utils/huaweiIam.js';
const projectId = '0123456789abcdef0123456789abcdef';
function response() { return { headers:{}, setHeader(k,v){this.headers[k]=v;}, end(body){this.body=body;} }; }
const iamResponse = { ok:true, headers:new Headers({ 'X-Subject-Token':'issued-token' }), json:async () => ({token:{project:{id:projectId,name:'cn-north-4'},expires_at:'2099-01-01T00:00:00Z',user:{name:'private-name'}}}) };
test('server sends local credentials to fixed IAM endpoint and returns only token and project data', async () => {
  let captured;
  const handler = createDefaultIamHandler({account:'account',username:'user',password:'secret',fetchImpl:async (url,options) => {captured={url,options}; return iamResponse;} });
  const res=response(); await handler({},res);
  assert.equal(res.statusCode,200);
  assert.equal(captured.url,'https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens?nocatalog=true');
  assert.equal(JSON.parse(captured.options.body).auth.identity.password.user.password,'secret');
  assert.ok(!res.body.includes('private-name')); assert.ok(!res.body.includes('secret'));
  assert.equal(res.headers['Cache-Control'],'no-store');
});
test('missing configuration or authentication failure never exposes credentials', async () => {
  const missing=response(); await createDefaultIamHandler({})({},missing); assert.equal(missing.statusCode,503);
  const failed=response(); await createDefaultIamHandler({account:'a',username:'u',password:'secret',fetchImpl:async () => {throw new Error('secret');}})({},failed);
  assert.equal(failed.statusCode,502); assert.ok(!failed.body.includes('secret'));
});
test('client obtains a validated project token from the local endpoint', async () => {
  let args;
  const result=await getDefaultHuaweiIamToken({fetchImpl:async (url,options) => { args={url,options}; return iamResponse; }});
  assert.equal(args.url,'/__huawei_iam/default-token'); assert.equal(args.options.headers['X-Huawei-Demo'],'1');
  assert.equal(result.projectId,projectId); assert.equal(result.token,'issued-token');
});
