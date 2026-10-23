import test from 'node:test';
import assert from 'node:assert/strict';
import { ownsCustomerOrder, customerOrderSnapshot, customerOrderAnswer, orderStatusKey, validComplaintPhoto } from '../../src/utils/customerOrders.js';
import messages from '../../src/locales/chatOrders.js';

const order = { orderId: 'TEST-ORDER', cardNo: 'CARD-A', agentId: 'AGENT-A', status: 'DISPATCHED', payStatus: 'PAID', deliveryType: 'HOME_DELIVERY', selfPayAmount: 12500, items: [{ itemCode: 'RICE-BAS-01', qty: 3, unit: 'kg' }], dispatchInfo: { dispatchedAt: '2026-10-23 09:00', estimatedTime: '2026-10-23 12:00', phone: 'private' }, phone: 'private' };

test('limits citizen orders to the current card and agent orders to the current outlet', () => {
  assert.ok(ownsCustomerOrder(order, { id: 'citizen-a', role: 'citizen', cardNo: 'CARD-A' }));
  assert.ok(ownsCustomerOrder(order, { id: 'agent-a', role: 'agent', agentId: 'AGENT-A' }));
  for (const profile of [{ id: 'stranger', role: 'citizen' }, { id: 'stranger', role: 'agent' }, { id: 'admin', role: 'admin' }, { id: 'b', role: 'citizen', cardNo: 'CARD-B' }, { id: 'b', role: 'agent', agentId: 'AGENT-B' }]) assert.equal(ownsCustomerOrder(order, profile), false);
});

test('keeps demo identity defaults limited to the known demo users', () => {
  const demoOrder = { cardNo: 'RC-10029381', agentId: 'FA-00128' };
  assert.ok(ownsCustomerOrder(demoOrder, { id: 'usr-cit-01', role: 'citizen' }));
  assert.ok(ownsCustomerOrder(demoOrder, { id: 'usr-agt-01', role: 'agent' }));
  assert.equal(ownsCustomerOrder(demoOrder, { id: 'usr-cit-02', role: 'citizen' }), false);
});

test('stores a minimal detached order snapshot and normalizes procurement fields', () => {
  const snapshot = customerOrderSnapshot(order);
  assert.equal(snapshot.phone, undefined);
  assert.equal(snapshot.dispatchInfo.phone, undefined);
  snapshot.items[0].qty = 9;
  assert.equal(order.items[0].qty, 3);
  const procurement = customerOrderSnapshot({ orderNo: 'G2B-1', totalAmount: 999, logisticsMode: 'DISPATCH', items: [{ unit: '公斤 (KG)' }] });
  assert.equal(procurement.orderId, 'G2B-1'); assert.equal(procurement.amount, 999); assert.equal(procurement.deliveryType, 'HOME_DELIVERY'); assert.equal(procurement.items[0].unit, 'kg');
});

test('answers order questions with recorded payment, quantities and delivery data in all four languages', () => {
  for (const lang of ['zh', 'en', 'ar', 'ckb']) {
    const summary = customerOrderAnswer(order, '', lang);
    assert.ok(summary.includes('TEST-ORDER')); assert.ok(summary.includes('12,500')); assert.ok(summary.includes('3 kg'));
    assert.ok(!summary.includes('private'));
  }
  assert.ok(customerOrderAnswer(order, 'Where is my delivery?', 'en').includes('2026-10-23 12:00'));
  assert.ok(customerOrderAnswer(order, 'How much did I pay?', 'en').includes('12,500'));
  assert.equal(orderStatusKey({ status: 'COMPLETED' }), 'delivered');
  assert.equal(orderStatusKey({ status: 'READY_PICKUP' }), 'ready');
});

test('provides identical translation keys and interpolation placeholders', () => {
  const keys = Object.keys(messages.en).sort();
  for (const [lang, pack] of Object.entries(messages)) {
    assert.deepEqual(Object.keys(pack).sort(), keys, lang);
    for (const key of keys) assert.deepEqual([...pack[key].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), [...messages.en[key].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), `${lang}.${key}`);
  }
});

test('rejects empty, oversized, mismatched and active content photo uploads', async () => {
  assert.equal(await validComplaintPhoto(new Blob([], { type: 'image/png' })), false);
  assert.equal(await validComplaintPhoto(new Blob(['<svg/>'], { type: 'image/svg+xml' })), false);
  assert.equal(await validComplaintPhoto(new Blob(['not a picture'], { type: 'image/jpeg' })), false);
  assert.equal(await validComplaintPhoto(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/png' })), false);
  const png = new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0foAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' });
  assert.equal(await validComplaintPhoto(png), true);
});
