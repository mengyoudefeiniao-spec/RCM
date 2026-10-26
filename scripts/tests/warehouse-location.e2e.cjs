// Run via playwright-cli in an isolated local browser with PocketBase sync disabled.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Local server required');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/#/agent-orders?role=agent&layout=app');
  await page.evaluate(() => { sessionStorage.setItem('rcm_agent_order_center_id', 'FA-00128'); localStorage.setItem('rcm_language', 'zh'); });
  await page.reload();
  await page.locator('.splash-screen').waitFor({ state: 'hidden', timeout: 20000 });
  assert(!await page.evaluate(async () => (await import('/src/services/pocketBaseSync.js')).isPocketBaseSyncEnabled()), 'Disable PocketBase for local regression');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 33.30, longitude: 44.32 });
  await page.route('https://*.tile.openstreetmap.org/**', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#edf2e8"/><path d="M0 128H256M128 0V256" stroke="#d3dccf" stroke-width="5"/></svg>' }));
  let failRoute = false, routeRequests = 0;
  await page.route('https://router.project-osrm.org/**', route => {
    routeRequests++;
    if (failRoute) return route.fulfill({ status: 503, body: '{}' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ routes: [{ distance: 1200, duration: 300, geometry: { coordinates: [[44.32, 33.30], [44.3535, 33.3152]] } }] }) });
  });
  const initialData = await page.evaluate(async () => (await import('/src/api/agent.js')).getMyAgentCenters());
  assert(initialData.find(center => center.centerId === '101').warehouseLocation.source === 'demo', 'Demo coordinates explicitly marked');
  await page.getByRole('button', { name: '定位（导航）', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: '配给仓库位置' });
  await dialog.locator('.leaflet-container').waitFor();
  assert(await dialog.locator('[data-lat="33.3152"][data-lng="44.3535"]').count() === 1, 'First center warehouse destination');
  assert(await dialog.getByTestId('warehouse-demo-notice').isVisible(), 'Visible demo disclosure');
  let url = new URL(await dialog.getByRole('link', { name: 'Google 地图' }).getAttribute('href'));
  assert(url.searchParams.get('destination') === '33.3152,44.3535' && !url.searchParams.has('origin'), 'Google Maps targets warehouse without invented origin');
  assert(routeRequests === 0, 'No location/route requested on open');
  await dialog.getByRole('button', { name: '我的位置', exact: true }).click();
  await dialog.getByText('驾车路线约 1.2 公里 · 5 分钟', { exact: true }).waitFor();
  url = new URL(await dialog.getByRole('link', { name: 'Google 地图' }).getAttribute('href'));
  assert(url.searchParams.get('origin') === '33.3,44.32', 'Current position used for navigation');
  await page.evaluate(async () => (await import('/src/locales/index.js')).setLanguage('en'));
  await page.getByRole('dialog', { name: 'Ration warehouse location' }).getByText('Driving route: about 1.2 km · 5 min', { exact: true }).waitFor();
  await page.evaluate(async () => (await import('/src/locales/index.js')).setLanguage('zh'));
  await dialog.getByText('驾车路线约 1.2 公里 · 5 分钟', { exact: true }).waitFor();
  failRoute = true;
  await dialog.getByRole('button', { name: '我的位置', exact: true }).click();
  await dialog.getByText('暂时无法获取路线，请检查网络后重试。', { exact: true }).waitFor();
  await page.evaluate(() => Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (_success, failure) => failure({ code: 1 }) } }));
  await dialog.getByRole('button', { name: '我的位置', exact: true }).click();
  await dialog.getByText('无法获取当前位置，请允许定位或使用 Google 地图导航。', { exact: true }).waitFor();
  await dialog.getByRole('button', { name: '关闭', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: '切换中心', exact: true }).click();
  await page.getByRole('menuitem').filter({ hasText: '哈奈根' }).click();
  await page.getByRole('button', { name: '定位（导航）', exact: true }).click();
  dialog = page.getByRole('dialog', { name: '配给仓库位置' });
  await dialog.locator('[data-lat="34.348"][data-lng="45.383"].leaflet-container').waitFor();
  assert((await dialog.innerText()).includes('哈奈根第一配给中心'), 'Second center warehouse title');
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    const labels = await page.evaluate(async lang => {
      const { setLanguage, i18n } = await import('/src/locales/index.js'); setLanguage(lang);
      return { title: i18n.global.t('warehouseLocation.title'), close: i18n.global.t('common.close'), locate: i18n.global.t('warehouseLocation.locate'), direction: document.documentElement.dir };
    }, lang);
    dialog = page.getByRole('dialog', { name: labels.title });
    await dialog.locator('.leaflet-container').waitFor();
    assert(labels.direction === (['ar', 'ckb'].includes(lang) ? 'rtl' : 'ltr'), 'Language direction: ' + lang);
    assert(await page.getByRole('button', { name: labels.locate, exact: true }).isVisible(), 'Localized locate action: ' + lang);
    if (lang !== 'zh') assert(!/[\u4e00-\u9fff]/.test(await dialog.innerText()), 'No Chinese copy in dialog: ' + lang);
    assert(await dialog.locator('[data-lat="34.348"][data-lng="45.383"]').count() === 1, 'Destination survives locale change');
    assert(await dialog.getByRole('button', { name: labels.close, exact: true }).isVisible(), 'Localized close action');
  }
  await dialog.getByRole('button', { name: '关闭', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: '定位（导航）', exact: true }).click();
  await page.getByRole('dialog', { name: '配给仓库位置' }).locator('.leaflet-container').waitFor();
  assert(errors.length === 0, 'Browser exceptions: ' + errors.join(';'));
  return { passed: ['warehouse GIS marker', 'navigation URL', 'current position route', 'route failure', 'permission failure', 'switch center', 'four locales and RTL', 'close and reopen'], errors };
}
