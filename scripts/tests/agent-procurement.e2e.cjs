// Run with playwright-cli run-code --filename against an isolated local Vite server.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Local server required');
  const ready = async p => { await p.locator('.splash-screen').waitFor({ state: 'hidden', timeout: 20000 }); };
  await page.goto(origin + '/#/agent-orders?role=agent&layout=app'); await ready(page);
  assert(!await page.evaluate(async () => (await import('/src/services/pocketBaseSync.js')).isPocketBaseSyncEnabled()), 'Disable PocketBase sync for this isolated regression');
  const api = (p, name, ...args) => p.evaluate(async ({ name, args }) => (await import('/src/api/agent.js'))[name](...args), { name, args });
  const web = await page.context().newPage();
  const inventory = await page.context().newPage();
  const finance = await page.context().newPage();
  await Promise.all([
    web.goto(origin + '/#/agent?role=minister_center&layout=web&tab=g2bOrders'),
    inventory.goto(origin + '/#/agent?role=minister_center&layout=web&tab=orderAnalytics'),
    finance.goto(origin + '/#/agent?role=minister_center&layout=web&tab=finance')
  ]);
  await Promise.all([ready(web), ready(inventory), ready(finance)]);
  await inventory.locator('[data-ledger-kpi="purchases"]').waitFor();
  await finance.locator('[data-ledger-kpi="expenses"]').waitFor();
  const before = await api(page, 'getG2BPurchaseOrders', {});
  const stockBefore = (await api(page, 'getAgentLocalStocks', 'FA-00128')).find(x => x.itemCode === 'FLOUR-WHT-02');
  const requestId = 'regression-' + Date.now();
  const payload = { agentId: 'FA-00128', centerId: '101', requestId, isPaid: true, logisticsMode: 'PICKUP', timeSlot: '2026-10-28 09:00-11:00', items: [{ itemCode: 'FLOUR-WHT-02', qty: 100, unitPrice: 1 }, { itemCode: 'RICE-BAS-01', qty: 50 }, { itemCode: 'OIL-SUN-03', qty: 10 }] };
  const order = await api(page, 'createG2BPurchaseOrder', payload);
  assert(order.totalAmount === 72000, 'Official pricing');
  assert((await api(page, 'createG2BPurchaseOrder', payload)).orderNo === order.orderNo, 'Idempotent create');
  assert((await api(web, 'getG2BPurchaseOrders', {})).length === before.length + 1, 'Web shared orders');
  await web.getByText(order.orderNo, { exact: true }).first().waitFor({ timeout: 12000 });
  const stockPaid = (await api(page, 'getAgentLocalStocks', 'FA-00128')).find(x => x.itemCode === 'FLOUR-WHT-02');
  assert(stockPaid.currentOnHand === stockBefore.currentOnHand && stockPaid.pendingReceipt === stockBefore.pendingReceipt + 100, 'Paid pending goods are not physical stock');
  const paidTotal = before.filter(x => x.payStatus === 'PAID' && !['CANCELLED', 'REJECTED'].includes(x.status)).reduce((n, x) => n + x.totalAmount, 0) + 72000;
  const periodPaidTotal = before.filter(x => x.payStatus === 'PAID' && Date.parse(x.createdAt) >= Date.now() - 30 * 86400000).reduce((n, x) => n + x.totalAmount, 0) + 72000;
  await finance.waitForFunction(expected => document.querySelector('[data-ledger-kpi="expenses"]')?.textContent.includes(expected), periodPaidTotal.toLocaleString('zh-CN'), { timeout: 12000 });
  await inventory.waitForFunction(expected => document.querySelector('[data-ledger-kpi="paid"]')?.textContent.includes(expected), paidTotal.toLocaleString('zh-CN'), { timeout: 12000 });
  const received = await api(page, 'receiveG2BPurchaseOrder', order.orderNo);
  assert(received.status === 'COMPLETED', 'Receipt completes order');
  await api(page, 'receiveG2BPurchaseOrder', order.orderNo);
  const paidAgain = await api(page, 'payG2BPurchaseOrder', order.orderNo, {});
  assert(paidAgain.status === 'COMPLETED', 'Repeated payment preserves receipt');
  const stockReceived = (await api(page, 'getAgentLocalStocks', 'FA-00128')).find(x => x.itemCode === 'FLOUR-WHT-02');
  assert(stockReceived.currentOnHand === stockBefore.currentOnHand + 100 && stockReceived.g2bTotalIn === stockBefore.g2bTotalIn + 100 && stockReceived.pendingReceipt === stockBefore.pendingReceipt, 'Receipt counted once');
  await inventory.waitForFunction(expected => document.querySelector('[data-ledger-kpi="on-hand"]')?.textContent.includes(expected), (await api(page, 'getAgentLocalStocks')).filter(x => x.itemCode !== 'OIL-SUN-03').reduce((n, x) => n + x.currentOnHand, 0).toLocaleString('zh-CN'), { timeout: 12000 });
  const unpaid = await api(page, 'createG2BPurchaseOrder', { ...payload, requestId: requestId + '-unpaid', isPaid: false });
  assert(unpaid.payStatus === 'UNPAID', 'Unpaid order');
  await finance.waitForFunction(() => document.querySelector('[data-ledger-kpi="payable"]')?.textContent.includes('72,000'), null, { timeout: 12000 });
  await api(page, 'payG2BPurchaseOrder', unpaid.orderNo, { channel: 'QI_CARD_ENTERPRISE' });
  assert((await api(page, 'getG2BPurchaseOrders', {})).length === before.length + 2, 'Pay existing order does not create another');
  const second = await api(page, 'createG2BPurchaseOrder', { ...payload, requestId: requestId + '-other', agentId: 'FD-00129', centerId: '496' });
  assert(!(await api(page, 'getG2BPurchaseOrders', { agentId: 'FA-00128' })).some(x => x.orderNo === second.orderNo), 'Outlet filtering');
  for (const invalid of [{ ...payload, requestId: requestId + '-bad', centerId: '496' }, { ...payload, requestId: requestId + '-badqty', items: [{ itemCode: 'FLOUR-WHT-02', qty: -1 }] }]) {
    let rejected = false; try { await api(page, 'createG2BPurchaseOrder', invalid); } catch { rejected = true; }
    assert(rejected, 'Invalid order rejected');
  }
  await page.reload(); await ready(page);
  assert((await api(page, 'getG2BPurchaseOrders', {})).some(x => x.orderNo === order.orderNo && x.status === 'COMPLETED'), 'Reload persistence');
  for (const lang of ['en', 'ar', 'ckb', 'zh']) {
    const translated = await page.evaluate(async lang => { const { setLanguage } = await import('/src/locales/index.js'); setLanguage(lang); return (await import('/src/api/agent.js')).getG2BPurchaseOrders({}); }, lang);
    assert(translated.find(x => x.orderNo === order.orderNo)?.totalAmount === 72000, 'Language shares data: ' + lang);
    if (lang !== 'zh') assert(!/[\u4e00-\u9fff]/.test(translated.find(x => x.orderNo === order.orderNo).items.map(x => x.itemName).join('')), 'Localized items: ' + lang);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const orderIdsBeforeUi = (await api(page, 'getG2BPurchaseOrders', {})).map(order => order.orderNo);
  await page.getByRole('button', { name: '新建采购', exact: true }).click();
  await page.getByRole('dialog').filter({ hasText: '新建集中批发采购' }).getByRole('button', { name: /确认采购并前往电子支付/ }).click();
  await page.locator('.electronic-payment-dialog').getByRole('button', { name: /一键填入/ }).click();
  await page.getByRole('dialog').filter({ hasText: '物资提货核验二维码与出库凭证' }).waitFor({ state: 'visible', timeout: 20000 });
  const uiOrder = (await api(page, 'getG2BPurchaseOrders', {})).find(order => !orderIdsBeforeUi.includes(order.orderNo));
  assert(uiOrder.totalAmount === 4120000 && uiOrder.payStatus === 'PAID', 'APP form and electronic payment');
  assert(uiOrder.items.length === 4 && uiOrder.items.find(item => item.itemCode === 'SUGAR-WHT-04')?.qty === 1000, 'Four commodities including sugar');
  await Promise.all([web.close(), inventory.close(), finance.close()]);
  return { passed: ['shared orders', 'live Web list', 'live funds', 'live inventory', 'official prices', 'idempotent create/pay/receive', 'unpaid to paid', 'outlet filter', 'invalid data', 'reload', 'four languages', 'APP form and electronic payment'], orderNo: order.orderNo };
}
