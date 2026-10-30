import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiditProvider } from '../../server/verification/didit.mjs';

const sessionId = 'session-123';
const correlationId = 'opaque-123';
const workflowId = 'workflow-123';
const base = { session_id: sessionId, session_kind: 'user', workflow_id: workflowId, vendor_data: correlationId, status: 'Approved', liveness_checks: [{ status: 'Approved', reference_image: 'https://media.example/image' }] };
function provider(result, capture = () => {}) {
  return createDiditProvider({ apiKey: 'secret', workflowId, fetchImpl: async (url, options) => { capture(url, options); return { ok: true, json: async () => result }; } });
}
test('creates a bound session using server-side credentials', async () => {
  let request;
  const p = provider({ session_id: sessionId, vendor_data: correlationId, workflow_id: workflowId, url: 'https://verify.didit.me/session/token' }, (url, options) => { request = { url, options }; });
  const result = await p.createSession({ correlationId });
  assert.equal(result.sessionId, sessionId);
  assert.equal(request.options.headers['x-api-key'], 'secret');
  assert.equal(JSON.parse(request.options.body).vendor_data, correlationId);
  assert.equal(request.options.redirect, 'error');
});
test('rejects untrusted redirects and wrong bindings', async () => {
  await assert.rejects(provider({ session_id: sessionId, vendor_data: correlationId, workflow_id: workflowId, url: 'https://attacker.example/' }).createSession({ correlationId }));
  await assert.rejects(provider({ ...base, vendor_data: 'other' }).getLiveness({ sessionId, correlationId }));
});
test('requires an approved session, a single approved check and a reference image', async () => {
  for (const data of [ { ...base, status: 'In Review' }, { ...base, liveness_checks: [] }, { ...base, liveness_checks: [{ status: 'Approved' }] }, { ...base, liveness_checks: [base.liveness_checks[0], base.liveness_checks[0]] }, { ...base, liveness_checks: [{ status: 'Declined', reference_image: 'https://media.example/image' }] } ]) {
    assert.equal((await provider(data).getLiveness({ sessionId, correlationId })).livenessStatus, 'pending');
  }
  const result = await provider(base).getLiveness({ sessionId, correlationId });
  assert.equal(result.livenessStatus, 'passed');
  assert.equal(result.referenceImageUrl, base.liveness_checks[0].reference_image);
  assert.equal(result.identityStatus, undefined);
});
