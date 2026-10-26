// Run in an isolated local Vite browser with PocketBase synchronization disabled.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Local regression only');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const switchLanguage = async lang => {
    const current = await page.locator('html').getAttribute('lang');
    const language = await page.evaluate(async ({ lang, current }) => {
      const { SUPPORTED_LANGUAGES, i18n } = await import('/src/locales/index.js');
      return { ...SUPPORTED_LANGUAGES.find(item => item.code === lang), switchTitle: i18n.global.t('nav.langSwitch', {}, { locale: current }) };
    }, { lang, current });
    await page.getByTitle(language.switchTitle, { exact: true }).click();
    await page.getByRole('menuitem').filter({ hasText: language.nativeName }).click();
  };
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(origin + '/#/review?role=minister_center&layout=web');
  await page.locator('.electronic-review-view').waitFor();
  assert(!await page.evaluate(async () => (await import('/src/services/pocketBaseSync.js')).isPocketBaseSyncEnabled()), 'PocketBase must be disabled');
  await page.evaluate(async () => {
    const { MOCK_REVIEW_TICKETS } = await import('/src/mock/data/reviewData.js');
    const english = (await import('/src/mock/data/en/reviewData.js')).MOCK_REVIEW_TICKETS;
    for (const lang of ['zh', 'en', 'ar', 'ku']) {
      const tickets = JSON.parse(JSON.stringify(lang === 'en' ? english : MOCK_REVIEW_TICKETS));
      for (const ticket of tickets) ticket.status = english.find(row => row.id === ticket.id).status;
      tickets.push({ id: 'REV-UNF-NAME-REGRESSION', source: 'Card unfreeze', cardNo: 'RC-10029381', targetMemberName: '宰娜卜·艾哈迈德·哈桑', applicantName: '艾哈迈德·哈桑·萨利赫', appType: 'Unfreeze Application', reason: 'Name regression', status: 'Pending Staff Review', payload: { targetMemberId: 'M-004' } });
      localStorage.setItem('rcm_shared_tickets_' + lang, JSON.stringify(tickets));
    }
    (await import('/src/locales/index.js')).setLanguage('zh');
  });
  await page.reload();
  await page.locator('.splash-screen').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.querySelector('.review-nav-count')?.innerText.trim() === '6');
  const results = [];
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    await switchLanguage(lang);
    const labels = await page.evaluate(async lang => {
      const { i18n } = await import('/src/locales/index.js');
      const view = document.querySelector('.electronic-review-view').__vueParentComponent.setupState;
      view.resetFilters();
      return { search: i18n.global.t('review.searchPlaceholder', {}, { locale: lang }), source: i18n.global.t('review.sourceUnfreeze', {}, { locale: lang }) };
    }, lang);
    await page.waitForFunction(() => document.querySelector('.review-nav-count')?.innerText.trim() === '6');
    const expectedName = await page.evaluate(async lang => (await import('/src/utils/sharedSession.js')).getInitialFamilies(lang)[0].members[3].name, lang);
    const search = page.locator('.electronic-review-view').getByPlaceholder(labels.search, { exact: true });
    await search.fill(expectedName);
    await page.waitForFunction(() => document.querySelector('.electronic-review-view').__vueParentComponent.setupState.filteredTickets.some(ticket => ticket.id === 'REV-UNF-NAME-REGRESSION'));
    const escaped = labels.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await page.locator('.electronic-review-view').getByRole('button', { name: new RegExp('^' + escaped + '\\s*\\d+$') }).click();
    const state = await page.evaluate(() => {
      const view = document.querySelector('.electronic-review-view').__vueParentComponent.setupState;
      return { globalCount: view.reviewStore.pendingCount, total: view.reviewStore.tickets.length, filtered: view.filteredTickets.map(ticket => ticket.id) };
    });
    assert(state.globalCount === 6 && state.total === 7, 'Source filters retain the global pending count: ' + lang);
    assert(state.filtered.includes('REV-UNF-NAME-REGRESSION'), 'Legacy English source label remains filterable');
    const text = await page.locator('.electronic-review-view').innerText();
    assert(text.includes(expectedName), 'Localized target name: ' + lang);
    if (lang !== 'zh') assert(!text.includes('宰娜卜·艾哈迈德·哈桑'), 'No Chinese target name remains: ' + lang);
    const badge = page.locator('.review-nav-count');
    assert(await badge.isVisible(), 'Visible badge after language change');
    assert((await badge.getAttribute('aria-label')).includes('6'), 'Badge has an accessible full count');
    await page.screenshot({ path: '.playwright-cli/review-locale-' + lang + '.png', animations: 'disabled' });
    results.push({ lang, name: expectedName, ...state });
  }
  for (const width of [1280, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await switchLanguage('en');
    const geometry = await page.locator('.review-nav-count').evaluate(el => {
      const badge = el.getBoundingClientRect(), nav = el.closest('nav').getBoundingClientRect();
      return { badge: { x: badge.x, right: badge.right }, nav: { x: nav.x, right: nav.right } };
    });
    assert(geometry.badge.x >= geometry.nav.x && geometry.badge.right <= geometry.nav.right + 1, 'Counter is not clipped at width ' + width);
  }
  await page.evaluate(() => { document.querySelector('.electronic-review-view').__vueParentComponent.setupState.reviewStore.tickets = []; });
  await page.waitForFunction(() => document.querySelector('.review-nav-count')?.innerText.trim() === '0');
  assert(await page.locator('.review-nav-count').isVisible(), 'Zero remains visible');
  await page.evaluate(() => {
    const store = document.querySelector('.electronic-review-view').__vueParentComponent.setupState.reviewStore;
    store.tickets = Array.from({ length: 123 }, (_, index) => ({ id: 'COUNT-' + index, source: 'Card unfreeze', status: 'Pending Staff Review' }));
  });
  await page.waitForFunction(() => document.querySelector('.review-nav-count')?.innerText.trim() === '99+');
  assert((await page.locator('.review-nav-count').getAttribute('aria-label')).includes('123'), 'Full count retained when badge is capped');
  assert(errors.length === 0, 'Runtime errors: ' + errors.join('; '));
  return { results, badgeCases: ['four locales', 'filtered list', '1024px and 1280px', 'zero', '123 capped to 99+'], errors };
}
