// Requires an isolated local Vite server with PocketBase disabled and the QR image fixture.
async page => {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Local server required');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/#/warehouse?role=agent&layout=app&tab=delivery');
  await page.locator('.splash-screen').waitFor({ state: 'hidden', timeout: 20000 });
  assert(!await page.evaluate(async () => (await import('/src/services/pocketBaseSync.js')).isPocketBaseSyncEnabled()), 'Disable PocketBase sync for regression');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key === 'rcm_shared_orders' || key.startsWith('rcm_shared_orders_')) localStorage.removeItem(key);
    localStorage.setItem('rcm_language', 'en');
    localStorage.setItem('rcm_shared_orders_en', JSON.stringify([{ orderId: 'SCAN-HANDOVER-E2E', id: 'SCAN-HANDOVER-E2E', cardNo: 'RC-10029381', headName: '艾哈迈德·哈桑·萨利赫', phone: '+964 780 123 4567', agentId: 'FA-00128', agentName: '卡尔赫第一配给中心综合代销站', deliveryType: 'HOME_DELIVERY', deliveryAddress: '巴格达省卡尔赫区海法街88号 3号楼201', pickupCode: 'PK-SCAN-HANDOVER-E2E', status: 'DISPATCHED', payStatus: 'PAID', selfPayAmount: 5500, amount: 5500, createdAt: new Date().toISOString(), items: [{ itemCode: 'FLOUR-WHT-02', qty: 4 }, { itemCode: 'RICE-BAS-01', qty: 4 }, { itemCode: 'OIL-SUN-03', qty: 1 }, { itemCode: 'SUGAR-WHT-04', qty: 1 }] }]));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.locator('.splash-screen').waitFor({ state: 'hidden', timeout: 20000 });
  const labels = () => page.evaluate(async () => { const { i18n } = await import('/src/locales/index.js'); return { open: i18n.global.t('orderClaim.scanVerifyBtn'), confirm: i18n.global.t('orderClaim.confirmDeliveryBtn'), receipt: i18n.global.t('orderClaim.claimSuccessTitle'), sign: i18n.global.t('orderClaim.signTitle'), close: i18n.global.t('orderClaim.closeBtn') }; });
  const before = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
  let copy = await labels();
  await page.getByRole('button', { name: copy.open, exact: true }).first().click();
  const dialog = page.locator('.app-scan-dialog');
  await dialog.locator('input[type="file"]:not([capture])').setInputFiles('.playwright-cli/scan-handover-qr.png');
  await dialog.getByTestId('scan-item-card').first().waitFor();
  assert(await dialog.getByTestId('scan-item-card').count() === 4, 'Four commodity cards');
  const positions = await dialog.getByTestId('scan-item-card').evaluateAll(nodes => nodes.map(node => { const box = node.getBoundingClientRect(); return { x: box.x, y: box.y }; }));
  assert(Math.abs(positions[0].y - positions[1].y) < 2 && Math.abs(positions[2].y - positions[3].y) < 2 && positions[2].y > positions[0].y, 'Two rows of two cards');
  assert(!(await dialog.innerText()).includes(copy.sign) && !(await dialog.innerText()).includes('DIGITAL SIGNED'), 'Signature module removed');
  await dialog.getByTestId('scan-item-card').first().getByText(before[0].currentOnHand.toLocaleString('en') + ' kg', { exact: true }).waitFor();
  assert((await dialog.innerText()).includes('Haifa St 88') && (await dialog.innerText()).includes('201'), 'Full correct address preserved');
  assert((await dialog.getByTestId('scan-item-card').locator('h4').allTextContents()).every(Boolean), 'Item names resolved from codes');
  const layout = await dialog.evaluate(el => { const nodes = [el, el.querySelector('.el-dialog__body'), el.querySelector('.el-dialog__body').firstElementChild, el.querySelector('.scan-action-tray')]; return nodes.map(node => { const box = node.getBoundingClientRect(), css = getComputedStyle(node); return { className: node.className, top: box.top, bottom: box.bottom, height: box.height, flex: css.flex, overflow: css.overflow }; }); });
  assert(layout[3].bottom <= layout[1].bottom + 1 && layout[3].top >= layout[1].top, 'Confirmation action tray is fully visible');
  for (const language of ['zh', 'en', 'ar', 'ckb']) {
    const translated = await page.evaluate(async language => { const { setLanguage, i18n } = await import('/src/locales/index.js'); setLanguage(language); return { title: i18n.global.t('scanHandover.title'), firstItem: i18n.global.t('businessRules.items.FLOUR-WHT-02') }; }, language);
    await dialog.getByRole('heading', { name: translated.title, exact: true }).waitFor();
    await dialog.getByRole('heading', { name: translated.firstItem, exact: true }).waitFor();
    if (language !== 'zh') assert(!/[\u4e00-\u9fff]/.test(await dialog.innerText()), 'No untranslated Chinese in confirmation: ' + language);
    assert(await dialog.getByTestId('scan-item-card').count() === 4, 'Cards retained across languages');
    assert(await page.evaluate(() => document.documentElement.dir) === (['ar', 'ckb'].includes(language) ? 'rtl' : 'ltr'), 'RTL layout: ' + language);
    if (['en', 'ar'].includes(language)) {
      await page.locator('.el-message').first().waitFor({ state: 'hidden', timeout: 6000 });
      await page.screenshot({ path: `.playwright-cli/scan-handover-${language}.png` });
    }
  }
  await page.evaluate(async () => (await import('/src/locales/index.js')).setLanguage('en'));
  copy = await labels();
  await dialog.getByRole('button', { name: copy.confirm, exact: true }).click();
  await dialog.getByText(copy.receipt, { exact: true }).waitFor();
  assert(!/[\u4e00-\u9fff]/.test(await dialog.innerText()), 'Localized handover receipt');
  const after = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
  for (const stock of before) assert(after.find(row => row.itemCode === stock.itemCode).currentOnHand === stock.currentOnHand - (['FLOUR-WHT-02', 'RICE-BAS-01'].includes(stock.itemCode) ? 4 : 1), 'Actual stock deduction: ' + stock.itemCode);
  await page.evaluate(async () => (await import('/src/api/agent.js')).verifyAndClaimCitizenOrder('SCAN-HANDOVER-E2E', { pickupCode: 'PK-SCAN-HANDOVER-E2E' }));
  const repeated = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
  assert(after.every(stock => repeated.find(row => row.itemCode === stock.itemCode).currentOnHand === stock.currentOnHand), 'Repeated verification does not duplicate deductions');
  await dialog.getByRole('button', { name: copy.close, exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.evaluate(() => {
    const order = JSON.parse(localStorage.getItem('rcm_shared_orders_en')).find(row => row.orderId === 'SCAN-HANDOVER-E2E');
    order.agentId = 'UNKNOWN'; order.status = 'DISPATCHED'; order.updatedAt = new Date().toISOString(); order.deliveredAt = null;
    for (const key of Object.keys(localStorage)) if (key === 'rcm_shared_orders' || key.startsWith('rcm_shared_orders_')) localStorage.removeItem(key);
    localStorage.setItem('rcm_shared_orders_en', JSON.stringify([order]));
  });
  await page.getByRole('button', { name: copy.open, exact: true }).first().click();
  await dialog.locator('input[type="file"]:not([capture])').setInputFiles('.playwright-cli/scan-handover-qr.png');
  await dialog.getByText('Could not load outlet stock. Scan again to retry.', { exact: true }).waitFor();
  assert(await dialog.getByRole('button', { name: copy.confirm, exact: true }).isDisabled(), 'Unavailable stock never uses fabricated quantities');
  assert(errors.length === 0, 'Browser exceptions: ' + errors.join(';'));
  return { passed: ['QR image scan', 'four named cards in two rows', 'full address', 'four languages and RTL', 'signature removed', 'real stock preview and deduction', 'receipt localization', 'repeat verification', 'unavailable stock', 'visible confirmation tray'], layout, errors };
}
