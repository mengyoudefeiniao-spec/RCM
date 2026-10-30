// Run with playwright-cli against a local Vite server with mock mode enabled and PocketBase disabled.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Local regression only');
  await page.goto(origin + '/#/login?demo=true');
  await page.locator('.login-page').waitFor();
  await page.evaluate(() => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('rcm_language', 'zh');
    localStorage.setItem('rcm_shared_citizen_accounts', JSON.stringify([
      { nationalId: 'REG-1001', name: 'Test Citizen One', phone: '07000001001', province: 'baghdad' },
      { nationalId: 'REG-1002', name: 'Test Citizen Two', phone: '07000001002', province: 'basra' }
    ]));
    sessionStorage.setItem('rcm_auth_token', 'test-token');
    sessionStorage.setItem('rcm_user_profile', JSON.stringify({ id: 'registered-REG-1001', nationalId: 'REG-1001', name: 'Test Citizen One', role: 'citizen', needsFamilySetup: true }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/#/citizen?layout=app');
  const view = page.locator('.citizen-family-view');
  await view.locator('[data-member-id="registered-REG-1001"]').waitFor();
  assert(await view.locator('.citizen-ration-card').innerText().then(text => text.includes('Test Citizen One') && text.includes('RC-TMP-')), 'First account card missing');
  assert(!(await view.innerText()).includes('演示电子核验已完成'), 'Obsolete banner remains');
  const firstCard = await view.locator('.citizen-ration-card').innerText();
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    await page.evaluate(async lang => (await import('/src/locales/index.js')).setLanguage(lang), lang);
    await view.locator('[data-member-id="registered-REG-1001"]').waitFor();
    assert(await view.locator('.citizen-ration-card').innerText().then(text => text.includes('Test Citizen One') && text.match(/RC-TMP-[A-F0-9]+/)?.[0] === firstCard.match(/RC-TMP-[A-F0-9]+/)?.[0]), 'Card changed on language switch');
  }
  await page.evaluate(() => sessionStorage.setItem('rcm_user_profile', JSON.stringify({ id: 'registered-REG-1002', nationalId: 'REG-1002', name: 'Test Citizen Two', role: 'citizen', needsFamilySetup: true })));
  await page.reload();
  await view.locator('[data-member-id="registered-REG-1002"]').waitFor();
  assert(await view.locator('.citizen-ration-card').innerText().then(text => text.includes('Test Citizen Two') && !firstCard.includes(text.match(/RC-TMP-[A-F0-9]+/)?.[0])), 'Accounts share a card');
  assert(await view.locator('[data-member-id="registered-REG-1001"]').count() === 0, 'Other account is visible');
  return 'Registered family UI verified in four languages';
}
