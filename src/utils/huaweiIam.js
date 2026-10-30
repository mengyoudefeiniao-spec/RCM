// Password and token are used only in memory by the local demo.
export async function getHuaweiIamToken({ account, username, password, fetchImpl = fetch, signal }) {
  if (!account?.trim() || !username?.trim() || !password) throw new Error('missing_credentials');
  const response = await fetchImpl('/__huawei_iam/v3/auth/tokens?nocatalog=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth: { identity: { methods: ['password'], password: { user: { domain: { name: account.trim() }, name: username.trim(), password } } }, scope: { project: { name: 'cn-north-4' } } } }),
    signal
  });
  if (!response.ok) throw new Error('iam_request_failed');
  const token = response.headers.get('X-Subject-Token');
  const data = await response.json();
  const project = data?.token?.project;
  const expiry = Date.parse(data?.token?.expires_at);
  if (!token || project?.name !== 'cn-north-4' || !/^[a-f0-9]{32}$/i.test(project?.id || '') || !Number.isFinite(expiry) || expiry <= Date.now()) throw new Error('iam_invalid_response');
  return { token, projectId: project.id, expiresAt: data.token.expires_at };
}
