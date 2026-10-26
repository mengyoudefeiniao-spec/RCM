// Use an isolated local Vite server with VITE_POCKETBASE_SYNC=false.
// First run: node scripts/tests/prepare-citizen-card-scan.mjs
async page => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Local server required');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/#/citizen?role=citizen&layout=app');
  await page.locator('.citizen-family-view').waitFor();
  assert(!await page.evaluate(async () => (await import('/src/services/pocketBaseSync.js')).isPocketBaseSyncEnabled()), 'PocketBase sync must be disabled');
  const reports = [];
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    await page.evaluate(lang => localStorage.setItem('rcm_language', lang), lang);
    await page.goto(origin + '/#/citizen?role=citizen&layout=app');
    await page.reload();
    await page.locator('.citizen-family-view').waitFor();
    await page.locator('.splash-screen').waitFor({ state: 'hidden' });
    for (const close of await page.locator('.el-notification__closeBtn').all()) await close.click();
    const show = await page.evaluate(async () => (await import('/src/locales/index.js')).i18n.global.t('citizenCard.showCardQr'));
    await page.getByTitle(show, { exact: true }).click();
    await page.locator('.citizen-card-verify-dialog img').waitFor();
    const screenshot = '.playwright-cli/citizen-card-source-' + lang + '.png';
    await page.screenshot({ path: screenshot, animations: 'disabled' });
    await page.goto(origin + '/#/dashboard?role=agent&layout=app&mode=mobile');
    await page.locator('[data-demo-target="btn-scan-verify"]').click();
    const dialog = page.locator('.app-scan-dialog');
    await dialog.waitFor();
    assert(new URL(page.url()).hash.startsWith('#/dashboard'), 'Scanner opens within the operations overview');
    assert(await dialog.locator('.scan-source-button').count() === 2, 'Only camera scanning and gallery upload are shown');
    const inputs = dialog.locator('input[type="file"]');
    assert(await inputs.count() === 2, 'Separate photo and gallery inputs');
    assert(await inputs.nth(1).getAttribute('capture') === 'environment', 'Rear camera requested');
    const family = await page.evaluate(async () => (await import('/src/api/citizen.js')).getFamilyByCardNo('RC-10029381'));
    await page.evaluate(async () => {
      window.cardScanRequests = [];
      const client = (await import('/src/api/client.js')).default;
      client.interceptors.request.use(config => { window.cardScanRequests.push({ url: config.url, method: config.method }); return config; });
    });
    const before = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
    await inputs.nth(lang === 'en' ? 1 : 0).setInputFiles(screenshot);
    await dialog.locator('.citizen-card-scan-details').waitFor({ timeout: 20000 });
    assert(new URL(page.url()).hash.startsWith('#/dashboard'), 'Card scan stays on operations overview');
    const details = await dialog.locator('.citizen-card-scan-details').innerText();
    assert(details.includes('RC-10029381') && details.includes(family.headName), 'Current citizen card information: ' + lang);
    const requests = await page.evaluate(() => window.cardScanRequests);
    assert(requests.some(request => request.url === '/citizen/family/RC-10029381'), 'Card information lookup');
    assert(!requests.some(request => request.url.includes('/citizen-claim/') || request.method !== 'get'), 'No eligibility, quota, claim history or write requests');
    assert(!/ERR_|Duplicate Claim|Scan Status Exception/.test(await dialog.innerText()), 'No validation panel');
    if (lang !== 'zh') assert(!/[\u4e00-\u9fff]/.test(details), 'Localized current family: ' + lang);
    const after = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
    assert(JSON.stringify(before) === JSON.stringify(after), 'Card recognition is read-only');
    assert(await page.locator('html').getAttribute('dir') === (['ar', 'ckb'].includes(lang) ? 'rtl' : 'ltr'), 'RTL direction');
    await page.screenshot({ path: '.playwright-cli/citizen-card-result-' + lang + '.png', animations: 'disabled' });
    reports.push({ lang, informationOnly: true });
    const close = await page.evaluate(async () => (await import('/src/locales/index.js')).i18n.global.t('common.close'));
    await dialog.locator('.scan-action-tray').getByRole('button', { name: close, exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert(new URL(page.url()).hash.startsWith('#/dashboard'), 'Closing the card returns to the same overview');
    assert(await page.locator('.mobile-agent-dashboard').isVisible(), 'Operations overview remains mounted');
  }
  const dialog = page.locator('.app-scan-dialog');
  await page.locator('[data-demo-target="btn-scan-verify"]').click();
  await page.evaluate(() => {
    const families = JSON.parse(localStorage.getItem('rcm_shared_families_ku'));
    families[0].status = 'بەستراوە';
    families[0].members.forEach(member => { member.status = 'بەستراوە'; });
    localStorage.setItem('rcm_shared_families_ku', JSON.stringify(families));
    window.cardScanRequests = [];
  });
  await dialog.locator('input[type="file"]:not([capture])').setInputFiles('.playwright-cli/citizen-card-legacy.png');
  await dialog.locator('.citizen-card-scan-details').waitFor();
  assert(!(await dialog.innerText()).includes('STALE QR NAME'), 'Legacy QR displays the persisted family, not stale embedded fields');
  assert((await dialog.innerText()).includes('بەستراوە'), 'Frozen users still show information');
  assert(!(await dialog.innerText()).includes('ERR_'), 'Expired QR and zero eligible members do not trigger validation');
  assert(!(await page.evaluate(() => window.cardScanRequests)).some(request => request.url.includes('/citizen-claim/')), 'No verification for frozen users');
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    const expected = await page.evaluate(async lang => {
      const { setLanguage } = await import('/src/locales/index.js'); setLanguage(lang);
      return (await import('/src/utils/sharedSession.js')).getSharedFamily('RC-10029381', lang).headName;
    }, lang);
    await dialog.locator('.citizen-card-scan-details').getByText(expected, { exact: true }).waitFor();
  }
  await dialog.locator('.scan-action-tray button').first().click();
  await dialog.locator('input[type="file"]:not([capture])').setInputFiles('.playwright-cli/citizen-card-unknown.png');
  const notFound = await page.evaluate(async () => (await import('/src/locales/index.js')).i18n.global.t('scanHandover.cardNotFound'));
  await dialog.getByText(notFound, { exact: true }).waitFor();
  assert(await dialog.locator('.citizen-card-scan-details').count() === 0, 'Unknown cards never fall back to a sample family');
  assert(errors.length === 0, 'Runtime errors: ' + errors.join('; '));
  return { reports, noValidation: ['claim history', 'zero quota', 'frozen status', 'expired QR'], legacyQr: true, runtimeSwitch: true, unknownCardRejected: true, errors };
}
