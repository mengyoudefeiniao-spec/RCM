// Local-development helper; credentials never leave the Vite process except to Huawei IAM.
export function createDefaultIamHandler({ account, username, password, fetchImpl = fetch }) {
  return async function defaultIamHandler(req, res) {
    const send = (status, payload) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(payload)); };
    if (!account || !username || !password) return send(503, { error:'not_configured' });
    try {
      const response = await fetchImpl('https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens?nocatalog=true', {
        method:'POST', redirect:'error', signal:AbortSignal.timeout(30000), headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ auth:{ identity:{ methods:['password'], password:{ user:{ domain:{ name:account }, name:username, password } } }, scope:{ project:{ name:'cn-north-4' } } } })
      });
      if (!response.ok) return send(502, { error:'iam_failed' });
      const token = response.headers.get('X-Subject-Token');
      const data = await response.json();
      const project = data?.token?.project;
      const expiry = Date.parse(data?.token?.expires_at);
      if (!token || project?.name !== 'cn-north-4' || !/^[a-f0-9]{32}$/i.test(project?.id || '') || !Number.isFinite(expiry) || expiry <= Date.now()) return send(502, { error:'iam_failed' });
      res.setHeader('X-Subject-Token', token);
      return send(200, { token:{ project:{ id:project.id, name:project.name }, expires_at:data.token.expires_at } });
    } catch { return send(502, { error:'iam_failed' }); }
  };
}
