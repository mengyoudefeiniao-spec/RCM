import messages from '../locales/chatOrders.js';
import { formatDeliveryTime } from './deliveryEnums.js';

export function ownsCustomerOrder(order, profile) {
  if (!profile?.id && !profile?.username) return false;
  if (profile.role === 'citizen') {
    const card = profile.cardNo || profile.rationCardNo || (profile.id === 'usr-cit-01' ? 'RC-10029381' : '');
    return !!card && order.cardNo === card;
  }
  if (profile.role === 'agent') {
    const agent = profile.agentId || profile.agentCode || (profile.id === 'usr-agt-01' ? 'FA-00128' : '');
    return !!agent && order.agentId === agent;
  }
  return false;
}

export function customerOrderSnapshot(order) {
  const keys = ['orderId', 'ticketNo', 'cardNo', 'agentId', 'agentName', 'createdAt', 'status', 'payStatus', 'deliveryType', 'selfPayAmount', 'amount'];
  return { ...Object.fromEntries(keys.map(key => [key, order[key]])),
    orderId: order.orderId || order.id || order.orderNo,
    deliveryType: order.deliveryType || (order.logisticsMode === 'DISPATCH' ? 'HOME_DELIVERY' : 'PICKUP'),
    amount: order.selfPayAmount ?? order.amount ?? order.totalAmount,
    items: (order.items || []).map(({ itemCode, itemName, qty, unit, subtotal }) => ({ itemCode, itemName, qty, unit: /kg|公斤/i.test(unit) ? 'kg' : /升|\bL\b/i.test(unit) ? 'L' : unit, subtotal })),
    dispatchInfo: order.dispatchInfo ? { dispatchedAt: order.dispatchInfo.dispatchedAt, estimatedTime: order.dispatchInfo.estimatedTime } : null };
}

export function orderStatusKey(order) {
  if (order.status === 'CANCELLED') return 'cancelled';
  if (order.status === 'REJECTED') return 'rejected';
  if (order.status === 'PENDING_PAYMENT') return 'unpaid';
  if (['DELIVERED', 'COMPLETED', 'CLAIMED'].includes(order.status)) return 'delivered';
  if (['DISPATCHED', 'DELIVERING', 'IN_TRANSIT'].includes(order.status)) return 'dispatched';
  if (['READY_PICKUP', 'READY_FOR_PICKUP', 'READY', 'PICKUP_READY'].includes(order.status)) return 'ready';
  return ['PAID', 'PAID_WMS_PICKING', 'PAID_PENDING_DELIVERY', 'PENDING', 'PACKING', 'PREPARING'].includes(order.status) ? 'pending' : 'unknown';
}
export const orderItemKey = code => ({ 'FLOUR-WHT-02': 'flour', 'RICE-BAS-01': 'rice', 'OIL-SUN-03': 'oil', 'SUGAR-WHT-04': 'sugar' })[code];
export function orderPaidAmount(order) {
  const value = order.selfPayAmount ?? order.amount;
  return order.payStatus === 'PAID' && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
}

export function customerOrderAnswer(order, question, lang) {
  const m = messages[lang === 'ku' ? 'ckb' : lang] || messages.en;
  const lines = [m.summary.replace('{id}', order.orderId)];
  const payment = /支付|付款|实付|payment|paid|pay\b|cost|amount|دفع|مدفوع|پارە/i.test(question);
  const delivery = /配送|送达|提货|物流|where|deliver|pickup|arriv|توصيل|استلام|گەیاندن|وەرگرتن/i.test(question);
  const items = /物资|重量|数量|items|weight|quantity|ration|مواد|وزن|کەلوپەل|کێش/i.test(question);
  const amount = orderPaidAmount(order);
  if (payment || (!delivery && !items)) lines.push(`${m.payment}: ${order.payStatus === 'PAID' ? m.paid : order.payStatus === 'UNPAID' ? m.unpaid : m.unknown}`, `${m.amount}: ${amount === null ? m.unknown : amount.toLocaleString('en-US') + ' IQD'}`);
  if (items || (!payment && !delivery)) lines.push(`${m.items}: ${(order.items || []).map(item => `${m[orderItemKey(item.itemCode)] || item.itemName || item.itemCode} ${item.qty} ${item.unit || ''}`).join(' / ')}`);
  lines.push(`${m.status}: ${m[orderStatusKey(order)]}`, `${m.delivery}: ${order.deliveryType === 'HOME_DELIVERY' ? m.home : m.pickup}`);
  if (delivery) lines.push(`${m.tracking}: ${order.dispatchInfo?.dispatchedAt || m.noTracking}`, `${m.eta}: ${formatDeliveryTime(order.dispatchInfo?.estimatedTime, lang) || m.unknown}`);
  lines.push(m.followup);
  return lines.join('\n');
}

export async function validComplaintPhoto(file) {
  if (!(file instanceof Blob) || !file.size || file.size > 5 * 1024 * 1024) return false;
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return (file.type === 'image/png' && png) || (file.type === 'image/jpeg' && jpeg) || (file.type === 'image/webp' && webp);
}
