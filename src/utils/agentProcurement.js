import { MOCK_G2B_PURCHASE_ORDERS as seedOrders, MOCK_AGENT_LOCAL_STOCKS as seedStocks } from '../mock/data/agentData.js';
import { MOCK_G2B_PURCHASE_ORDERS as englishSeeds } from '../mock/data/en/agentData.js';
import rulesMessages from '../locales/businessRules.js';
import myMessages from '../locales/my.js';
import deliveryMessages from '../locales/agentDelivery.js';
import procurementMessages from '../locales/agentProcurement.js';
import { broadcastTabMessage } from './crossTabBus.js';

export const G2B_ORDER_PREFIX = 'rcm_shared_g2b_order_';
export const AGENT_STOCK_PREFIX = 'rcm_shared_agent_stock_';
export const PROCUREMENT_PRICES = { 'FLOUR-WHT-02': 350, 'RICE-BAS-01': 500, 'OIL-SUN-03': 1200, 'SUGAR-WHT-04': 400 };
const clone = value => JSON.parse(JSON.stringify(value));
const completed = order => ['COMPLETED', 'DELIVERED'].includes(order.status) && order.payStatus === 'PAID';
export const activeProcurement = order => !['REJECTED', 'CANCELLED'].includes(order.status);

export function mergeProcurementOrders(records = [], seeds = seedOrders) {
  const rows = new Map(seeds.map(order => [order.orderNo, clone(order)]));
  for (const order of records) if (order?.orderNo) rows.set(order.orderNo, clone(order));
  return [...rows.values()].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || b.orderNo.localeCompare(a.orderNo));
}

export function readProcurementOrders() {
  const records = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(G2B_ORDER_PREFIX)) continue;
    try { records.push(JSON.parse(localStorage.getItem(key))); } catch { /* Ignore invalid cache entries. */ }
  }
  return mergeProcurementOrders(records);
}

function notifyProcurement(orderNo) {
  window.dispatchEvent(new CustomEvent('rcm:agent-procurement-changed', { detail: { orderNo } }));
  broadcastTabMessage('AGENT_PROCUREMENT_CHANGED', { orderNo });
}
export function writeProcurementOrder(order) {
  localStorage.setItem(G2B_ORDER_PREFIX + order.orderNo, JSON.stringify(order));
  notifyProcurement(order.orderNo);
  return order;
}

export function presentProcurementOrder(order, language = 'zh') {
  const lang = language === 'ku' ? 'ckb' : language;
  const seed = (lang === 'zh' ? seedOrders : englishSeeds).find(row => row.orderNo === order.orderNo);
  const names = order.agentId === 'FA-00128' ? { agentName: myMessages[lang]?.demoOutletName, centerName: myMessages[lang]?.demoCenterName }
    : order.agentId === 'FD-00129' ? { agentName: deliveryMessages[lang]?.demoSecondOutletName, centerName: deliveryMessages[lang]?.demoSecondCenterName } : {};
  return { ...order, smsContent: order.smsNotified ? procurementMessages[lang]?.paymentSuccess || '' : '', agentName: names.agentName || seed?.agentName || order.agentName, centerName: names.centerName || seed?.centerName || order.centerName,
    items: (order.items || []).map(item => ({ ...item, itemName: rulesMessages[lang]?.items?.[item.itemCode] || item.itemName, unit: item.itemCode === 'OIL-SUN-03' ? 'L' : 'KG' })) };
}

export function normalizeProcurementItems(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('invalidItems');
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const price = PROCUREMENT_PRICES[item.itemCode], qty = Number(item.qty);
    if (!price || !Number.isFinite(qty) || qty < 0 || !Number.isInteger(qty) || seen.has(item.itemCode)) throw new Error('invalidItems');
    seen.add(item.itemCode);
    if (qty) result.push({ itemCode: item.itemCode, itemName: rulesMessages.zh.items[item.itemCode], qty, unit: item.itemCode === 'OIL-SUN-03' ? 'L' : 'KG', unitPrice: price, subtotal: qty * price });
  }
  if (!result.length) throw new Error('invalidItems');
  return result;
}

export function readAgentStockBase(agentId) {
  return seedStocks.map(seed => {
    const base = agentId === 'FA-00128' ? clone(seed) : { ...seed, currentOnHand: 0, g2bTotalIn: 0, b2cTotalSold: 0, lossDamaged: 0, bookDiscrepancy: 0 };
    try { return { ...base, ...JSON.parse(localStorage.getItem(`${AGENT_STOCK_PREFIX}${agentId}_${seed.itemCode}`) || '{}'), agentId }; }
    catch { return { ...base, agentId }; }
  });
}
export function writeAgentStockBase(agentId, stocks) {
  for (const stock of stocks) localStorage.setItem(`${AGENT_STOCK_PREFIX}${agentId}_${stock.itemCode}`, JSON.stringify({ ...stock, agentId }));
  notifyProcurement();
}

export function projectProcurementStocks(base, orders, initialOrders = seedOrders) {
  return base.map(stock => {
    const rows = orders.filter(order => order.agentId === stock.agentId && activeProcurement(order));
    const sum = (orders, predicate) => orders.filter(predicate).reduce((total, order) => total + (order.items || []).filter(item => item.itemCode === stock.itemCode).reduce((n, item) => n + Number(item.qty || 0), 0), 0);
    const receivedDelta = sum(rows, completed) - sum(initialOrders.filter(order => order.agentId === stock.agentId), completed);
    return { ...stock, currentOnHand: Number(stock.currentOnHand || 0) + receivedDelta, g2bTotalIn: Number(stock.g2bTotalIn || 0) + receivedDelta,
      orderedQty: sum(rows, () => true), pendingReceipt: sum(rows, order => order.payStatus === 'PAID' && !completed(order)), receivedDelta };
  });
}

export function procurementSummary(orders) {
  const active = orders.filter(activeProcurement);
  return { orderCount: active.length, purchaseAmount: active.reduce((n, order) => n + Number(order.totalAmount || 0), 0), paidAmount: active.filter(order => order.payStatus === 'PAID').reduce((n, order) => n + Number(order.totalAmount || 0), 0),
    payableAmount: active.filter(order => order.payStatus !== 'PAID').reduce((n, order) => n + Number(order.totalAmount || 0), 0) };
}
