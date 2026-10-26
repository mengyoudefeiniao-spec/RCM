// Run with playwright-cli run-code --filename against a local Vite server with PocketBase sync disabled.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Local regression only');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/#/citizen?role=citizen&layout=app');
  await page.locator('.citizen-family-view').waitFor();
  assert(!await page.evaluate(async () => (await import('/src/services/pocketBaseSync.js')).isPocketBaseSyncEnabled()), 'PocketBase must be disabled');
  await page.evaluate(async () => {
    const { getInitialFamilies } = await import('/src/utils/sharedSession.js');
    const chineseMembers = getInitialFamilies('zh')[0].members;
    for (const lang of ['zh', 'en', 'ar', 'ku']) {
      const families = getInitialFamilies(lang);
      families[0].members = JSON.parse(JSON.stringify(chineseMembers));
      families[0].members.push({ id: 'REGRESSION-EN', nationalId: 'REGRESSION-IDENTITY', name: 'English Demo Name', relation: 'Child', gender: 'Male', status: 'Active', birthDate: '2019-01-01' });
      families[0].memberCount = families[0].members.length;
      localStorage.setItem('rcm_shared_families_' + lang, JSON.stringify(families));
    }
    (await import('/src/locales/index.js')).setLanguage('zh');
  });
  await page.reload();
  await page.locator('.splash-screen').waitFor({ state: 'hidden' });
  await page.locator('.citizen-family-view').getByText('艾哈迈德·哈桑·萨利赫', { exact: true }).last().waitFor();

  const labels = await page.evaluate(async () => {
    const { i18n } = await import('/src/locales/index.js');
    return { update: i18n.global.t('citizenCard.actionUpdate'), title: i18n.global.t('citizen.editMemberTitle'), confirm: i18n.global.t('citizen.confirmUpdate') };
  });
  await page.locator('.citizen-family-view').getByRole('button', { name: labels.update, exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: labels.title, exact: true });
  await dialog.locator('.el-form-item').nth(1).locator('input').fill('07700009999');
  await dialog.getByRole('button', { name: labels.confirm, exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });

  const reports = [];
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    const language = await page.evaluate(async lang => {
      const { SUPPORTED_LANGUAGES, i18n } = await import('/src/locales/index.js');
      return { ...SUPPORTED_LANGUAGES.find(item => item.code === lang), switchTitle: i18n.global.t('nav.langSwitch') };
    }, lang);
    await page.getByTitle(language.switchTitle, { exact: true }).click();
    await page.getByRole('menuitem').filter({ hasText: language.nativeName }).click();
    const expected = await page.evaluate(async lang => {
      const { getInitialFamilies } = await import('/src/utils/sharedSession.js');
      return getInitialFamilies(lang)[0].members.map(member => member.name).concat('English Demo Name');
    }, lang);
    for (const name of expected) await page.locator('.citizen-family-view').getByText(name, { exact: true }).last().waitFor();
    const current = await page.evaluate(() => document.querySelector('.citizen-family-view').__vueParentComponent.setupState.citizenStore.currentFamily);
    assert(JSON.stringify(current.members.map(member => member.name)) === JSON.stringify(expected), 'Localized roster: ' + lang);
    assert(current.members[0].phone === '07700009999', 'Phone edit persists across language: ' + lang);
    assert(current.members.at(-1).name === 'English Demo Name', 'English registered name remains verbatim');
    assert(await page.locator('html').getAttribute('dir') === language.dir, 'Layout direction: ' + lang);
    const rosterLabel = await page.evaluate(async () => (await import('/src/locales/index.js')).i18n.global.t('citizenCard.registeredMemberList'));
    await page.getByText(rosterLabel, { exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: '.playwright-cli/family-names-' + lang + '.png', animations: 'disabled' });
    reports.push({ lang, names: current.members.map(member => member.name), phone: current.members[0].phone });
  }

  await page.evaluate(async () => {
    const { setLanguage } = await import('/src/locales/index.js');
    for (const lang of ['en', 'ar', 'zh', 'ckb', 'en']) setLanguage(lang);
  });
  await page.locator('.citizen-family-view').getByText('Fatima Ali Mohammed', { exact: true }).waitFor();
  const requestNames = await page.evaluate(async () => {
    const { mockDispatch } = await import('/src/mock/adapter.js');
    return (await mockDispatch({ url: '/citizen/families', method: 'GET', headers: { 'Accept-Language': 'ar' } })).data[0].members.map(member => member.name);
  });
  assert(requestNames[0] === 'أحمد حسن صالح', 'API honors requested language independently of stored UI language');
  await page.evaluate(async () => (await import('/src/locales/index.js')).setLanguage('zh'));
  await page.locator('.citizen-family-view').getByRole('button', { name: '登记新成员', exact: true }).click();
  const registration = page.getByRole('dialog').filter({ has: page.locator('.member-registration-steps') });
  const nameInput = registration.locator('.el-form-item').first().locator('input');
  assert(await nameInput.inputValue() === 'Omar Ahmed Hassan', 'New demonstration registration defaults to English');
  await nameInput.fill('Custom English Name');
  await page.evaluate(async () => (await import('/src/locales/index.js')).setLanguage('ar'));
  assert(await nameInput.inputValue() === 'Custom English Name', 'Language switching does not rewrite an entered name');
  assert(errors.length === 0, 'Runtime errors: ' + errors.join('; '));
  return { passed: ['legacy PocketBase cache repair', 'phone update without locale contamination', 'global language menu in four locales', 'English registered names', 'English registration default', 'entered name preservation', 'rapid switching', 'requested API language'], reports, errors };
}
