import deliveryMessages from '../locales/agentDelivery.js';
import itemMessages from '../locales/businessRules.js';
import { warehouseTerms } from '../locales/warehouseDetails.js';

const languages = ['zh', 'en', 'ar', 'ckb'];
const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

// Translate known demonstration data only. Custom names and full addresses stay intact.
export function scanOrderText(value, field, language = 'zh') {
  const lang = language === 'ku' ? 'ckb' : language;
  const text = normalize(value);
  if (!text) return '';
  for (const id of Object.keys(deliveryMessages.zh.demoOrders)) {
    if (languages.some(code => normalize(deliveryMessages[code].demoOrders[id]?.[field]) === text)) return deliveryMessages[lang]?.demoOrders[id]?.[field] || value;
  }
  for (const forms of Object.values(warehouseTerms)) {
    if (forms.some(form => normalize(form) === text)) return forms[languages.indexOf(lang)] || value;
  }
  return value;
}

export function scanItemName(item, language = 'zh') {
  const lang = language === 'ku' ? 'ckb' : language;
  return itemMessages[lang]?.items?.[item?.itemCode] || item?.itemName || item?.itemCode || '—';
}

export function scanUnitKey(item) {
  const unit = String(item?.unit || '').trim();
  if (/kg|公斤|千克|كجم|كغم|کگم|کیلۆ/i.test(unit)) return 'unitKg';
  if (/^l$|升|لتر|لیتر/i.test(unit)) return 'unitLitre';
  if (item?.itemCode === 'OIL-SUN-03') return 'unitLitre';
  if (['FLOUR-WHT-02', 'RICE-BAS-01', 'SUGAR-WHT-04'].includes(item?.itemCode)) return 'unitKg';
  return '';
}
