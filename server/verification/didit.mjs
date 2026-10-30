// Server-only Didit adapter. The host owns authorization, persistence and image storage.
const API_BASE = 'https://verification.didit.me/v3';
const approved = value => typeof value === 'string' && value.toLowerCase() === 'approved';

export function createDiditProvider({ apiKey, workflowId, callbackUrl, fetchImpl = globalThis.fetch }) {
  if (!apiKey || !workflowId || typeof fetchImpl !== 'function') throw new Error('Didit configuration is incomplete');
  if (callbackUrl && new URL(callbackUrl).protocol !== 'https:') throw new Error('Callback URL must use HTTPS');

  async function request(path, options = {}) {
    const response = await fetchImpl(`${API_BASE}${path}`, {
      ...options,
      headers: { 'x-api-key': apiKey, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(15000),
      redirect: 'error'
    });
    if (!response.ok) throw new Error(`Didit request failed (${response.status})`);
    return response.json();
  }

  return Object.freeze({
    name: 'didit',
    // correlationId must be a non-PII opaque identifier generated and stored by the host.
    async createSession({ correlationId }) {
      if (typeof correlationId !== 'string' || !correlationId.trim()) throw new Error('Missing correlation ID');
      const result = await request('/session/', {
        method: 'POST',
        body: JSON.stringify({ workflow_id: workflowId, vendor_data: correlationId, ...(callbackUrl ? { callback: callbackUrl } : {}) })
      });
      let url;
      try { url = new URL(result.url); } catch { throw new Error('Invalid Didit session URL'); }
      if (url.protocol !== 'https:' || url.hostname !== 'verify.didit.me' || !result.session_id || result.vendor_data !== correlationId || result.workflow_id !== workflowId) {
        throw new Error('Invalid Didit session response');
      }
      return { provider: 'didit', sessionId: result.session_id, url: url.href, correlationId };
    },
    // Called only with session ID and correlation ID loaded from the server's own record.
    async getLiveness({ sessionId, correlationId }) {
      if (!sessionId || !correlationId) throw new Error('Missing session binding');
      const result = await request(`/session/${encodeURIComponent(sessionId)}/decision/`);
      if (result.session_id !== sessionId || result.vendor_data !== correlationId || result.workflow_id !== workflowId || result.session_kind !== 'user') {
        throw new Error('Didit session binding mismatch');
      }
      const checks = Array.isArray(result.liveness_checks) ? result.liveness_checks : [];
      // Only one approved liveness result is accepted. The caller must retain the image securely.
      const check = checks.length === 1 ? checks[0] : null;
      const livenessPassed = approved(result.status) && approved(check?.status) && typeof check?.reference_image === 'string' && check.reference_image.startsWith('https://');
      return {
        provider: 'didit', sessionId, correlationId,
        livenessStatus: livenessPassed ? 'passed' : 'pending',
        providerStatus: result.status,
        // A temporary URL for server-side processing only; never store it as the image or return it to a client.
        referenceImageUrl: livenessPassed ? check.reference_image : null
      };
    }
  });
}
