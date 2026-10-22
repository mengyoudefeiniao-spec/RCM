export const PICKUP_ORDER_QR_TYPE = 'rcm-pickup-order';
export const CITIZEN_CARD_QR_TYPE = 'rcm-citizen-card';
export const AGENT_GOVERNMENT_ORDER_QR_TYPE = 'rcm-agent-government-order';

export function createPickupOrderQrPayload(pickupCode) {
  return JSON.stringify({
    type: PICKUP_ORDER_QR_TYPE,
    version: 1,
    pickupCode: String(pickupCode || '').trim()
  });
}

export function createCitizenCardQrPayload(family, verificationCode) {
  return JSON.stringify({
    type: CITIZEN_CARD_QR_TYPE,
    version: 1,
    cardNo: family?.rationCardNo || 'RC-10029381',
    paperCardNo: family?.oldPaperCardNo || '',
    headName: family?.headName || '',
    memberCount: Array.isArray(family?.members) ? family.members.length : 0,
    province: family?.province || '',
    district: family?.district || '',
    agentName: family?.agentName || '',
    agentId: family?.agentId || '',
    status: family?.status || '',
    // 冻结原因随码下发，便于代理终端扫码时直接展示（稳定代码/历史词根，展示层经 i18n 转译）
    freezeReason: family?.freezeReason || '',
    verificationCode: verificationCode || '',
    issuedAt: new Date().toISOString()
  });
}

export function createAgentGovernmentOrderQrPayload(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return JSON.stringify({
    type: AGENT_GOVERNMENT_ORDER_QR_TYPE,
    version: 1,
    orderNo: String(order?.orderNo || ''),
    voucherCode: String(order?.pickupVoucherCode || order?.voucherCode || ''),
    agentId: String(order?.agentId || ''),
    centerId: String(order?.centerId || ''),
    centerName: String(order?.centerName || ''),
    timeSlot: String(order?.timeSlot || ''),
    deliveryVehicleNo: String(order?.deliveryVehicleNo || ''),
    logisticsMode: String(order?.logisticsMode || ''),
    totalAmount: Number(order?.totalAmount || 0),
    payStatus: String(order?.payStatus || (order?.isPaid ? 'PAID' : '')),
    items: items.map((item) => ({
      itemName: String(item?.itemName || item?.name || ''),
      qty: Number(item?.qty || item?.quantity || 0),
      unit: String(item?.unit || '')
    }))
  });
}

export function parseRcmQrPayload(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw);
    if (payload?.type === CITIZEN_CARD_QR_TYPE && payload.cardNo) {
      return { type: 'citizen-card', payload };
    }
    if (payload?.type === PICKUP_ORDER_QR_TYPE && payload.pickupCode) {
      return { type: 'pickup-order', pickupCode: String(payload.pickupCode).trim() };
    }
    if (payload?.type === AGENT_GOVERNMENT_ORDER_QR_TYPE && payload.orderNo && payload.voucherCode) {
      return { type: 'agent-government-order', payload };
    }
  } catch {
    // Older pickup QR codes may contain the pickup code as plain text.
  }

  try {
    const url = new URL(raw);
    const pickupCode = url.searchParams.get('pickupCode') || url.searchParams.get('code');
    if (pickupCode) return { type: 'pickup-order', pickupCode: pickupCode.trim() };
  } catch {
    // The QR content is not a URL; keep treating it as a legacy pickup code.
  }

  return { type: 'pickup-order', pickupCode: raw };
}
