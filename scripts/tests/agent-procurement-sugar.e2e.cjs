// Run in an isolated local browser with PocketBase sync disabled.
async page => {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Local server required');
  await page.goto(origin + '/#/agent-orders?role=agent&layout=app');
  await page.evaluate(() => { localStorage.setItem('rcm_language', 'zh'); sessionStorage.setItem('rcm_agent_order_center_id', 'FA-00128'); });
  await page.reload();
  await page.locator('.splash-screen').waitFor({ state: 'hidden', timeout: 20000 });
  assert(!await page.evaluate(async () => (await import('/src/services/pocketBaseSync.js')).isPocketBaseSyncEnabled()), 'Disable PocketBase sync');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '新建采购', exact: true }).click();
  const form = page.getByRole('dialog').filter({ has: page.getByTestId('procurement-sugar') });
  assert(await form.getByRole('spinbutton').count() === 4, 'Four procurement quantity fields');
  const sugar = form.getByTestId('procurement-sugar').getByRole('spinbutton');
  assert(await sugar.inputValue() === '1000', 'Sugar default quantity');
  assert(await sugar.getAttribute('aria-valuemax') === '2688', 'Sugar quota ceiling');
  for (const language of ['en', 'ar', 'ckb', 'zh']) {
    const label = await page.evaluate(async language => { const { setLanguage, i18n } = await import('/src/locales/index.js'); setLanguage(language); return i18n.global.t('agentProcurement.sugarItemSpec'); }, language);
    await form.getByTestId('procurement-sugar').getByText(label, { exact: true }).waitFor();
    if (language !== 'zh') assert(!/[\u4e00-\u9fff]/.test(await form.getByTestId('procurement-sugar').innerText()), 'Sugar translated: ' + language);
    assert(await sugar.inputValue() === '1000', 'Locale retains sugar quantity');
  }
  await sugar.fill('999999'); await sugar.press('Tab');
  assert(Number(await sugar.inputValue()) === 2688, 'Input clamps to sugar quota');
  await form.getByRole('spinbutton').nth(0).fill('0');
  await form.getByRole('spinbutton').nth(1).fill('0');
  await form.getByRole('spinbutton').nth(2).fill('0');
  await sugar.fill('0'); await sugar.press('Tab');
  await form.getByRole('button', { name: /确认采购并前往电子支付/ }).click();
  assert(await form.isVisible(), 'Zero quantities do not submit');
  await sugar.fill('12'); await sugar.press('Tab');
  await form.getByRole('button', { name: /确认采购并前往电子支付.*4,800/ }).waitFor();
  const before = await page.evaluate(async () => { const api = await import('/src/api/agent.js'); return { orders: await api.getG2BPurchaseOrders({}), stocks: await api.getAgentLocalStocks('FA-00128') }; });
  await form.getByRole('button', { name: /确认采购并前往电子支付/ }).click();
  await page.locator('.electronic-payment-dialog').getByText('4,800', { exact: false }).first().waitFor();
  await page.locator('.electronic-payment-dialog').getByRole('button', { name: /一键填入/ }).click();
  await page.getByRole('dialog').filter({ hasText: '物资提货核验二维码与出库凭证' }).waitFor({ state: 'visible', timeout: 20000 });
  const result = await page.evaluate(async () => { const api = await import('/src/api/agent.js'); return { orders: await api.getG2BPurchaseOrders({}), stocks: await api.getAgentLocalStocks('FA-00128') }; });
  const order = result.orders.find(row => !before.orders.some(previous => previous.orderNo === row.orderNo));
  assert(order?.totalAmount === 4800 && order.items.length === 1 && order.items[0].itemCode === 'SUGAR-WHT-04' && order.items[0].qty === 12, 'Sugar-only purchase saved with correct total');
  const initialSugar = before.stocks.find(row => row.itemCode === 'SUGAR-WHT-04');
  const paidSugar = result.stocks.find(row => row.itemCode === 'SUGAR-WHT-04');
  assert(paidSugar.currentOnHand === initialSugar.currentOnHand && paidSugar.pendingReceipt === initialSugar.pendingReceipt + 12, 'Sugar pending receipt updates');
  await page.evaluate(async orderNo => (await import('/src/api/agent.js')).receiveG2BPurchaseOrder(orderNo), order.orderNo);
  const received = await page.evaluate(async () => (await import('/src/api/agent.js')).getAgentLocalStocks('FA-00128'));
  assert(received.find(row => row.itemCode === 'SUGAR-WHT-04').currentOnHand === initialSugar.currentOnHand + 12, 'Sugar receipt updates actual stock');
  let rejected = false;
  try { await page.evaluate(async () => (await import('/src/api/agent.js')).createG2BPurchaseOrder({ agentId: 'FA-00128', centerId: '101', items: [{ itemCode: 'SUGAR-WHT-04', qty: 2689 }], isPaid: true })); } catch { rejected = true; }
  assert(rejected, 'API rejects excess sugar quantity');
  assert(errors.length === 0, 'Browser exceptions: ' + errors.join(';'));
  return { passed: ['four items', 'sugar pricing', 'four languages', 'quota input and API limits', 'zero quantities blocked', 'sugar-only purchase and payment', 'pending receipt and stock'], orderNo: order.orderNo, errors };
}
