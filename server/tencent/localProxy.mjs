import { createHash, createHmac } from 'node:crypto';
const hash = value => createHash('sha256').update(value).digest('hex');
const hmac = (key, value) => createHmac('sha256', key).update(value).digest();
const services = Object.freeze({ GetActionSequence:'faceid', LivenessCompare:'faceid', DetectFace:'iai' });
const safeCode = value => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9._]{0,79}$/.test(value) ? value : null;
const safeRequestId = value => typeof value === 'string' && /^[a-f0-9-]{1,64}$/i.test(value) ? value : null;
export class TencentRequestError extends Error {
  constructor(code, requestId = null) { super('Tencent request failed'); this.code = safeCode(code) || 'request_failed'; this.requestId = safeRequestId(requestId); }
}

export function signTencentRequest({ secretId, secretKey, action, payload, timestamp }) {
  const service = services[action];
  if (!service || !secretId || !secretKey || !Number.isInteger(timestamp)) throw new Error('invalid_request');
  const host = `${service}.tencentcloudapi.com`, date = new Date(timestamp * 1000).toISOString().slice(0, 10);
  const contentType = 'application/json; charset=utf-8';
  const canonical = `POST\n/\n\ncontent-type:${contentType}\nhost:${host}\n\ncontent-type;host\n${hash(payload)}`;
  const scope = `${date}/${service}/tc3_request`;
  const toSign = `TC3-HMAC-SHA256\n${timestamp}\n${scope}\n${hash(canonical)}`;
  const signature = createHmac('sha256', hmac(hmac(hmac(`TC3${secretKey}`, date), service), 'tc3_request')).update(toSign).digest('hex');
  return { host, contentType, authorization:`TC3-HMAC-SHA256 Credential=${secretId}/${scope}, SignedHeaders=content-type;host, Signature=${signature}` };
}
export async function callTencent({ secretId, secretKey, sessionToken, action, params, fetchImpl = fetch, timestamp = Math.floor(Date.now()/1000) }) {
  if (!services[action] || typeof secretId !== 'string' || !secretId.trim() || typeof secretKey !== 'string' || !secretKey.trim() || !params || typeof params !== 'object') throw new Error('invalid_request');
  const payload = JSON.stringify(params);
  const signed = signTencentRequest({ secretId:secretId.trim(), secretKey:secretKey.trim(), action, payload, timestamp });
  let response;
  try { response = await fetchImpl(`https://${signed.host}/`, {
    method:'POST', redirect:'error', signal:AbortSignal.timeout(60000),
    headers:{ 'Content-Type':signed.contentType, Authorization:signed.authorization, 'X-TC-Action':action, 'X-TC-Version':action === 'DetectFace' ? '2020-03-03' : '2018-03-01', 'X-TC-Timestamp':String(timestamp), ...(action === 'DetectFace' ? { 'X-TC-Region':'ap-guangzhou' } : {}), ...(sessionToken ? { 'X-TC-Token':sessionToken } : {}) }, body:payload
  }); } catch (error) { throw new TencentRequestError(error?.name === 'TimeoutError' ? 'network_timeout' : 'network_error'); }
  let data;
  try { data = (await response.json())?.Response; } catch { throw new TencentRequestError('upstream_http_error'); }
  if (data?.Error) throw new TencentRequestError(data.Error.Code, data.RequestId);
  if (!response.ok || !data) throw new TencentRequestError('upstream_http_error');
  return data;
}
export function localTencentPlugin() {
  return { name:'local-tencent-face-demo', configureServer(server) {
    server.middlewares.use('/__tencent_face', async (req,res) => {
      const remote = req.socket.remoteAddress || '', host = req.headers.host || '';
      const local = ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote);
      const validHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
      const origin = req.headers.origin;
      if (!local || !validHost || (origin && origin !== `http://${host}` && origin !== `https://${host}`) || req.method !== 'POST' || req.url !== '/') { res.statusCode=403; res.end(); return; }
      try {
        let size = 0; const chunks = [];
        for await (const chunk of req) { size += chunk.length; if (size > 12 * 1024 * 1024) { res.statusCode=413; res.end(); return; } chunks.push(chunk); }
        const { secretId, secretKey, sessionToken, action, params } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const data = await callTencent({ secretId, secretKey, sessionToken, action, params });
        res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-store'); res.end(JSON.stringify(data));
      } catch (error) {
        const code = error instanceof TencentRequestError ? error.code : 'request_failed';
        const requestId = error instanceof TencentRequestError ? error.requestId : null;
        res.statusCode=502; res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-store');
        res.end(JSON.stringify({ error:code, ...(requestId ? { requestId } : {}) }));
      }
    });
  } };
}
