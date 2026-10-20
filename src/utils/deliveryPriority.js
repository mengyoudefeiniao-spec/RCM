const ACTIVE_DELIVERY = new Set(['PAID', 'PENDING_DELIVERY', 'DISPATCHED']);

export function parseOrderTime(value) {
  if (!value) return null;
  const timestamp = Date.parse(String(value).replace(' ', 'T'));
  return Number.isFinite(timestamp) ? timestamp : null;
}

function promisedMinutes(value) {
  if (!value) return 120;
  const text = String(value).toLowerCase();
  const amount = Number(text.match(/\d+/)?.[0] || 0);
  if (text.includes('30') || text.includes('نیم') || text.includes('نصف')) return 30;
  if (text.includes('45')) return 45;
  if (text.includes('hour') || text.includes('小时') || text.includes('ساعة') || text.includes('کاتژمێر')) return (amount || 1) * 60;
  if (text.includes('分钟') || text.includes('min') || text.includes('دقيقة') || text.includes('خولەک')) return amount || 120;
  return 120;
}

export function deliveryPriority(order, now = Date.now()) {
  if (order.deliveryType !== 'HOME_DELIVERY' || !ACTIVE_DELIVERY.has(order.status)) {
    return { rank: order.status === 'DELIVERED' ? 4 : 3, dueAt: null, estimated: false };
  }
  const explicit = parseOrderTime(order.promisedDeliveryAt || order.deliveryDeadline || order.expectedDeliveryAt || order.dispatchInfo?.expectedAt);
  const dispatched = parseOrderTime(order.dispatchInfo?.dispatchedAt);
  const placed = parseOrderTime(order.paidAt || order.createdAt);
  const dueAt = explicit || (order.status === 'DISPATCHED' && dispatched
    ? dispatched + promisedMinutes(order.dispatchInfo?.estimatedTime) * 60000
    : placed ? placed + 2 * 60 * 60000 : null);
  if (!dueAt) return { rank: 2, dueAt: null, estimated: true };
  return { rank: dueAt <= now ? 0 : dueAt - now <= 30 * 60000 ? 1 : 2, dueAt, estimated: !explicit };
}

export function sortDeliveryOrders(orders, now = Date.now()) {
  return [...orders].sort((a, b) => {
    const first = deliveryPriority(a, now);
    const second = deliveryPriority(b, now);
    if (first.rank !== second.rank) return first.rank - second.rank;
    if (first.dueAt && second.dueAt && first.dueAt !== second.dueAt) return first.dueAt - second.dueAt;
    return (parseOrderTime(b.createdAt) || 0) - (parseOrderTime(a.createdAt) || 0);
  });
}
