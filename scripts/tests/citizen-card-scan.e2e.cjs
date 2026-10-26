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
    assert(await dialog.locator('.scan-source-button').count() === 2, 'Only camera scanning and gallery upload are shown');
    const inputs = dialog.locator('input[type="file"]');
    assert(await inputs.count() === 2, 'Separate photo and gallery inputs');
    assert(await inputs.nth(1).getAttribute('capture') === 'environment', 'Rear camera requested');
    const verification = await page.evaluate(async () => (await import('/src/api/warehouse.js')).verifyCitizenCardAndQuota({ cardNo: 'RC-10029381' }));
    assert(verification.eligibleMembers === 3, 'Eligible members in ' + lang);
    const before = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
    await inputs.nth(lang === 'en' ? 1 : 0).setInputFiles(screenshot);
    await dialog.locator('.citizen-card-scan-details').waitFor({ timeout: 20000 });
    const details = await dialog.locator('.citizen-card-scan-details').innerText();
    assert(details.includes('RC-10029381') && details.includes(verification.family.headName), 'Current citizen card information: ' + lang);
    if (lang !== 'zh') assert(!/[\u4e00-\u9fff]/.test(details), 'Localized current family: ' + lang);
    const after = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
    assert(JSON.stringify(before) === JSON.stringify(after), 'Card recognition is read-only');
    assert(await page.locator('html').getAttribute('dir') === (['ar', 'ckb'].includes(lang) ? 'rtl' : 'ltr'), 'RTL direction');
    await page.screenshot({ path: '.playwright-cli/citizen-card-result-' + lang + '.png', animations: 'disabled' });
    reports.push({ lang, eligibleMembers: verification.eligibleMembers, identified: true });
  }
  const dialog = page.locator('.app-scan-dialog');
  await dialog.locator('.scan-action-tray button').first().click();
  await dialog.locator('input[type="file"]:not([capture])').setInputFiles('.playwright-cli/citizen-card-legacy.png');
  await dialog.locator('.citizen-card-scan-details').waitFor();
  assert(!(await dialog.innerText()).includes('STALE QR NAME'), 'Legacy QR displays the persisted family, not stale embedded fields');
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    const expected = await page.evaluate(async lang => {
      const { setLanguage } = await import('/src/locales/index.js'); setLanguage(lang);
      return (await import('/src/utils/sharedSession.js')).getSharedFamily('RC-10029381', lang).headName;
    }, lang);
    await dialog.locator('.citizen-card-scan-details').getByText(expected, { exact: true }).waitFor();
  }
  await dialog.locator('.scan-action-tray button').first().click();
  await dialog.locator('input[type="file"]:not([capture])').setInputFiles('.playwright-cli/citizen-card-unknown.png');
  await dialog.getByText('ERR_SYS', { exact: true }).waitFor();
  assert(await dialog.locator('.citizen-card-scan-details').count() === 0, 'Unknown cards never fall back to a sample family');
  assert(errors.length === 0, 'Runtime errors: ' + errors.join('; '));
  return { reports, legacyQr: true, runtimeSwitch: true, unknownCardRejected: true, errors };
}
