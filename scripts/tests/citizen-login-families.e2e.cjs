// Run against a local mock-mode Vite server with PocketBase synchronization disabled.
async (page) => {
  const origin = new URL(page.url()).origin;
  if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Local regression only');
  await page.goto(origin);
  const result = await page.evaluate(async () => {
    localStorage.clear(); sessionStorage.clear(); localStorage.setItem('rcm_language', 'zh');
    const { createCitizenAccount, updateCitizenAccount, findCitizenAccount } = await import('/src/utils/citizenAccounts.js');
    const { mockDispatch } = await import('/src/mock/adapter.js');
    const { getInitialFamilies } = await import('/src/utils/sharedSession.js');
    const defaultFamily = getInitialFamilies('zh')[0];
    const account = await createCitizenAccount({ nationalId: defaultFamily.members[1].nationalId, name: 'Registered Test', phone: '07000001001', province: 'baghdad', password: 'test-password', identityVerification: { status: 'passed', simulated: true } });
    const request = (url, method, data) => mockDispatch({ url, method, data });
    const first = await request('/auth/login', 'POST', { username: account.phone, password: 'test-password' });
    const card = first.data.user.rationCardNo;
    const logins = [];
    for (const username of [account.phone, account.nationalId, card]) {
      const response = await request('/auth/login', 'POST', { username, password: 'test-password' });
      sessionStorage.setItem('rcm_user_profile', JSON.stringify(response.data.user));
      const families = await request('/citizen/families', 'GET', {});
      const wrongPassword = await request('/auth/login', 'POST', { username, password: 'incorrect-password' });
      logins.push({ code: response.code, wrongPassword: wrongPassword.code, id: response.data.user.nationalId, card: response.data.user.rationCardNo, families: families.data.length, memberCount: families.data[0]?.members.length, memberId: families.data[0]?.members[0]?.nationalId });
    }
    await updateCitizenAccount(account.nationalId, { rationCardNo: null });
    const legacyCardLogin = await request('/auth/login', 'POST', { username: card, password: 'test-password' });
    const restoredCard = (await findCitizenAccount(account.nationalId)).rationCardNo;
    const demo = await request('/auth/login', 'POST', { username: 'RC-10029381', password: 'iq-pass-2026' });
    sessionStorage.setItem('rcm_user_profile', JSON.stringify(demo.data.user));
    sessionStorage.setItem('rcm_auth_token', demo.data.token);
    const demoFamilies = await request('/citizen/families', 'GET', {});
    const { updateSharedFamily } = await import('/src/utils/sharedSession.js');
    updateSharedFamily('RC-10029381', family => ({ ...family, members: [], memberCount: 0 }), 'zh');
    const restoredDemo = await request('/citizen/families', 'GET', {});
    return { card, logins, legacyCardLogin: legacyCardLogin.code, restoredCard, demoLogin: demo.code, demoFamilies: demoFamilies.data.length, demoCard: demoFamilies.data[0]?.rationCardNo, demoMemberIds: demoFamilies.data[0]?.members.map(member => member.nationalId), restoredIds: restoredDemo.data[0]?.members.map(member => member.nationalId), expectedIds: defaultFamily.members.map(member => member.nationalId) };
  });
  if (!result.card?.startsWith('RC-TMP-')) throw new Error('Registered card missing');
  for (const login of result.logins) {
    if (login.code !== 200 || login.wrongPassword === 200 || login.card !== result.card || login.families !== 1 || login.memberCount !== 1 || login.memberId !== login.id) throw new Error('Registered identity or card login failed');
  }
  if (result.legacyCardLogin !== 200 || result.restoredCard !== result.card) throw new Error('Legacy registered card did not reconnect');
  if (result.demoLogin !== 200 || result.demoFamilies !== 1 || result.demoCard !== 'RC-10029381' || JSON.stringify(result.demoMemberIds) !== JSON.stringify(result.expectedIds)) throw new Error('Default household was not restored');
  if (JSON.stringify(result.restoredIds) !== JSON.stringify(result.expectedIds)) throw new Error('Empty default household was not repaired');
  await page.goto(origin + '/#/citizen?role=citizen&layout=app');
  await page.locator('[data-member-id="M-001"]').waitFor();
  if (await page.locator('.member-card').count() !== result.expectedIds.length) throw new Error('Default household members not displayed');
  return 'Default household and all three registered login methods passed';
}
