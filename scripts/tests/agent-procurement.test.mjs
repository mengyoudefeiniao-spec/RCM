import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeProcurementOrders, normalizeProcurementItems, projectProcurementStocks, procurementSummary, presentProcurementOrder, readProcurementOrders, writeProcurementOrder, readAgentStockBase, writeAgentStockBase, G2B_ORDER_PREFIX } from '../../src/utils/agentProcurement.js';
import messages from '../../src/locales/agentProcurement.js';

const order = { orderNo: 'TEST-1', agentId: 'A', createdAt: '2026-10-26T01:00:00Z', status: 'PAID_WMS_PICKING', payStatus: 'PAID', totalAmount: 3500, items: [{ itemCode: 'FLOUR-WHT-02', qty: 10 }] };
const base = [{ agentId: 'A', itemCode: 'FLOUR-WHT-02', currentOnHand: 100, g2bTotalIn: 200 }];

test('merges orders by business number, preserving payment state across languages and refreshes', () => {
  const rows = mergeProcurementOrders([{ ...order, status: 'COMPLETED' }], [order]);
  assert.equal(rows.length, 1); assert.equal(rows[0].status, 'COMPLETED');
  rows[0].items[0].qty = 999; assert.equal(order.items[0].qty, 10);
});
test('recalculates procurement prices and rejects invalid quantities, unknown goods and duplicates', () => {
  assert.equal(normalizeProcurementItems([{ itemCode: 'FLOUR-WHT-02', qty: 10, unitPrice: 1, subtotal: 1 }])[0].subtotal, 3500);
  for (const items of [[], [{ itemCode: 'UNKNOWN', qty: 1 }], [{ itemCode: 'FLOUR-WHT-02', qty: -1 }], [{ itemCode: 'FLOUR-WHT-02', qty: NaN }], [{ itemCode: 'FLOUR-WHT-02', qty: 1.5 }], [{ itemCode: 'FLOUR-WHT-02', qty: 0 }], [order.items[0], order.items[0]]]) assert.throws(() => normalizeProcurementItems(items));
});
test('paid purchases increase pending receipts without pretending the goods are in stock', () => {
  const stock = projectProcurementStocks(base, [order], [])[0];
  assert.equal(stock.pendingReceipt, 10); assert.equal(stock.orderedQty, 10); assert.equal(stock.currentOnHand, 100); assert.equal(stock.g2bTotalIn, 200);
});
test('sugar uses the fourth commodity price and follows payment and receipt accounting', () => {
  const items = normalizeProcurementItems([{ itemCode: 'FLOUR-WHT-02', qty: 0 }, { itemCode: 'RICE-BAS-01', qty: 0 }, { itemCode: 'OIL-SUN-03', qty: 0 }, { itemCode: 'SUGAR-WHT-04', qty: 12, unitPrice: 1 }]);
  assert.equal(items.length, 1); assert.equal(items[0].subtotal, 4800); assert.equal(items[0].unit, 'KG');
  const sugarOrder = { ...order, totalAmount: 4800, items };
  const sugarBase = [{ agentId: 'A', itemCode: 'SUGAR-WHT-04', currentOnHand: 100, g2bTotalIn: 200 }];
  assert.equal(projectProcurementStocks(sugarBase, [sugarOrder], [])[0].pendingReceipt, 12);
  assert.equal(procurementSummary([sugarOrder]).paidAmount, 4800);
  const received = projectProcurementStocks(sugarBase, [{ ...sugarOrder, status: 'COMPLETED' }], [])[0];
  assert.equal(received.currentOnHand, 112); assert.equal(received.pendingReceipt, 0);
});
test('confirmed receipts enter stock once and seeded receipts are not counted twice', () => {
  const received = { ...order, status: 'COMPLETED' };
  const stock = projectProcurementStocks(base, mergeProcurementOrders([received, received], []), [])[0];
  assert.equal(stock.currentOnHand, 110); assert.equal(stock.g2bTotalIn, 210); assert.equal(stock.pendingReceipt, 0);
  assert.equal(projectProcurementStocks(base, [received], [received])[0].currentOnHand, 100);
});
test('stock and funds stay isolated by agent and unpaid orders remain payable', () => {
  const other = { ...order, orderNo: 'OTHER', agentId: 'B', status: 'COMPLETED' };
  assert.equal(projectProcurementStocks(base, [other], [])[0].currentOnHand, 100);
  const unpaid = { ...order, orderNo: 'UNPAID', payStatus: 'UNPAID', status: 'PENDING_PAYMENT' };
  const result = procurementSummary([order, unpaid, { ...order, status: 'CANCELLED' }]);
  assert.deepEqual(result, { orderCount: 2, purchaseAmount: 7000, paidAmount: 3500, payableAmount: 3500 });
  assert.equal(projectProcurementStocks(base, [unpaid], [])[0].pendingReceipt, 0);
});
test('persists separate order and stock keys and reloads without duplicate entries', () => {
  const data = new Map();
  const storage = { get length() { return data.size; }, key: index => [...data.keys()][index], getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  globalThis.localStorage = storage; globalThis.sessionStorage = storage; globalThis.window = new EventTarget();
  writeProcurementOrder(order); writeProcurementOrder({ ...order, status: 'COMPLETED' });
  assert.equal([...data.keys()].filter(key => key.startsWith(G2B_ORDER_PREFIX)).length, 1);
  assert.equal(readProcurementOrders().filter(row => row.orderNo === order.orderNo).length, 1);
  writeAgentStockBase('A', [{ itemCode: 'FLOUR-WHT-02', currentOnHand: 42 }]);
  assert.equal(readAgentStockBase('A')[0].currentOnHand, 42); assert.notEqual(readAgentStockBase('B')[0].currentOnHand, 42);
  delete globalThis.localStorage; delete globalThis.sessionStorage; delete globalThis.window;
});
test('localizes shared order fields and keeps the four locale packs aligned', () => {
  const keys = Object.keys(messages.en).sort();
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    assert.deepEqual(Object.keys(messages[lang]).sort(), keys);
    const row = presentProcurementOrder({ ...order, agentId: 'FA-00128' }, lang);
    assert.equal(row.orderNo, order.orderNo); assert.equal(row.items[0].qty, 10); assert.ok(row.items[0].itemName);
    if (lang !== 'zh') assert.ok(!/[\u4e00-\u9fff]/.test(row.items[0].itemName + row.agentName + row.centerName));
    for (const key of keys) assert.deepEqual([...messages[lang][key].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), [...messages.en[key].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort());
  }
});
