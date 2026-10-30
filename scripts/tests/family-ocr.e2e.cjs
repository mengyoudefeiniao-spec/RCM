// Run with playwright-cli against a local mock-mode Vite server, with PocketBase disabled.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Local regression only');
  await page.goto(origin);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(origin + '/#/login');
  await page.reload();
  await page.locator('.login-page').waitFor();
  await page.locator('.splash-screen').waitFor({ state: 'hidden' });
  await page.evaluate(async () => {
    localStorage.clear(); sessionStorage.clear(); localStorage.setItem('rcm_language', 'zh');
    const { createCitizenAccount } = await import('/src/utils/citizenAccounts.js');
    await createCitizenAccount({ nationalId: 'OCR-TEST-1', name: 'OCR Test', phone: '07000001001', province: 'baghdad', password: 'test-password' });
  });
  await page.route('**/__huawei_iam/default-token', route => route.fulfill({ status: 200, headers: { 'X-Subject-Token': 'test-token' }, json: { token: { project: { name: 'cn-north-4', id: '0123456789abcdef0123456789abcdef' }, expires_at: '2099-01-01T00:00:00Z' } } }));
  await page.route('**/__huawei_frs/**/face-detect', route => route.fulfill({ status: 200, json: { faces: [{}] } }));
  await page.locator('.login-page form input').nth(0).fill('07000001001');
  await page.locator('.login-page form input').nth(1).fill('test-password');
  await page.locator('.login-submit').click();
  const dialog = page.locator('.first-login-verify');
  await dialog.waitFor();
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    const label = await page.evaluate(async lang => {
      const { setLanguage, i18n } = await import('/src/locales/index.js');
      setLanguage(lang);
      return i18n.global.t('firstLoginVerification.ocrTitle');
    }, lang);
    await dialog.getByText(label, { exact: true }).first().waitFor();
  }
  assert(await dialog.locator('[data-first-login="ocr"]').isDisabled(), 'OCR must follow NFC');
  await page.evaluate(() => {
    const original = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function (...args) { if (this.type === 'file') return; return original.apply(this, args); };
  });
  await dialog.locator('[data-first-login="read-chip"]').click();
  await dialog.locator('input[accept="image/jpeg,image/png"]').setInputFiles({ name: 'reference.png', mimeType: 'image/png', buffer: Buffer.from('reference') });
  await dialog.locator('[data-first-login="ocr"]:not([disabled])').waitFor();
  assert(await dialog.locator('[data-first-login="start-face"]').isDisabled(), 'Face capture must wait for OCR');
  await dialog.locator('[data-first-login="ocr-image"]').setInputFiles({ name: 'back.gif', mimeType: 'image/gif', buffer: Buffer.from('arbitrary') });
  await dialog.locator('[data-first-login="start-face"]:not([disabled])').waitFor();
  const number = (await dialog.innerText()).match(/SIM-[A-F0-9]{8}/)?.[0];
  assert(number, 'Simulated OCR result missing');
  const outcome = await page.evaluate(async number => {
    const { mockDispatch } = await import('/src/mock/adapter.js');
    const pending = JSON.parse(sessionStorage.getItem('rcm_first_login_challenge'));
    const fields = { challenge: pending.challenge, readToken: pending.readToken, nationalId: pending.nationalId, livenessCompleted: true, simulated: true };
    const missing = await mockDispatch({ url: '/auth/first-login/verify', method: 'POST', data: fields });
    const passed = await mockDispatch({ url: '/auth/first-login/verify', method: 'POST', data: { ...fields, simulatedFamilyNumber: number } });
    const { findCitizenAccount } = await import('/src/utils/citizenAccounts.js');
    const account = await findCitizenAccount('OCR-TEST-1');
    const { getRegisteredFamily } = await import('/src/utils/registeredFamily.js');
    const family = getRegisteredFamily(account, 'zh');
    return { missing: missing.code, passed: passed.code, accountNumber: account.simulatedFamilyNumber, realNumber: account.familyNumber, familyNumber: family.simulatedFamilyNumber, memberNumber: family.members[0].simulatedFamilyNumber };
  }, number);
  assert(outcome.missing === 400 && outcome.passed === 200, 'First-login OCR was not enforced');
  assert(outcome.accountNumber === number && outcome.familyNumber === number && outcome.memberNumber === number && !outcome.realNumber, 'First-login number not stored separately');
  const memberOutcome = await page.evaluate(async () => {
    const { mockDispatch } = await import('/src/mock/adapter.js');
    const { getSharedFamilies } = await import('/src/utils/sharedSession.js');
    const family = getSharedFamilies('zh').find(item => item.rationCardNo === 'RC-10029381');
    const member = family.members.find(item => item.id === 'M-002');
    const fields = { cardNo: family.rationCardNo, memberId: member.id, nationalId: member.nationalId };
    const read = await mockDispatch({ url: '/auth/member-verification/read-identity', method: 'POST', data: fields });
    const payload = { ...fields, readToken: read.data.readToken, livenessCompleted: true, simulated: true };
    const missing = await mockDispatch({ url: '/auth/member-verification/verify', method: 'POST', data: payload });
    const passed = await mockDispatch({ url: '/auth/member-verification/verify', method: 'POST', data: { ...payload, simulatedFamilyNumber: 'SIM-12345678' } });
    const saved = getSharedFamilies('zh').find(item => item.rationCardNo === family.rationCardNo);
    return { missing: missing.code, passed: passed.code, family: saved.simulatedFamilyNumber, member: saved.members.find(item => item.id === member.id).verification?.simulatedFamilyNumber, untouched: saved.members.find(item => item.id === 'M-003').simulatedFamilyNumber };
  });
  assert(memberOutcome.missing === 400 && memberOutcome.passed === 200 && memberOutcome.family === 'SIM-12345678' && memberOutcome.member === 'SIM-12345678' && !memberOutcome.untouched, 'Member OCR association failed');
  return 'First-login OCR UI and both verification records passed';
}
