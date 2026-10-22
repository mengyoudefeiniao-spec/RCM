// 订单默认备注由系统按履约方式生成，存库时可能是下单时的语言。
// 展示层需要识别这些系统默认文案，并按当前界面语言重新渲染，避免阿语/库语界面出现中文。
const DEFAULT_NOTE_TEXTS = {
  PICKUP: [
    '到店出示二维码提货',
    'Present the QR code at the station for pickup',
    'اعرض رمز QR في المنفذ للاستلام',
    'کۆدی QR لە بنکە نیشان بدە بۆ وەرگرتن'
  ],
  HOME_DELIVERY: [
    '送货上门出示二维码签收',
    'Sign for home delivery by presenting the QR code',
    'وقّع على التوصيل المنزلي بعرض رمز QR',
    'واژوو لەسەر گەیاندنی ماڵ بکە بە نیشاندانی کۆدی QR'
  ]
};

export function orderNoteType(order) {
  return order?.deliveryType === 'PICKUP' ? 'PICKUP' : 'HOME_DELIVERY';
}

export function isDefaultOrderNote(note, deliveryType) {
  const text = String(note || '').trim();
  if (!text) return false;
  return (DEFAULT_NOTE_TEXTS[deliveryType === 'PICKUP' ? 'PICKUP' : 'HOME_DELIVERY'] || []).includes(text);
}

/**
 * 解析订单备注：系统默认备注按当前语言渲染，用户自填备注原样展示。
 * @param {object} order 订单
 * @param {(key: string) => string} t vue-i18n 的 t 函数
 */
export function resolveOrderNote(order, t) {
  if (!order) return '';
  const type = orderNoteType(order);
  if (order.notesIsDefault || isDefaultOrderNote(order.notes, type)) {
    return t(type === 'PICKUP' ? 'citizenOrder.defaultPickupNote' : 'citizenOrder.defaultDeliveryNote');
  }
  return order.notes || '';
}
