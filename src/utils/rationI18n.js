import { useI18n } from 'vue-i18n';
import { useWarehouseI18n } from './warehouseI18n.js';

const commodities = [
  [/flour|面粉|小麦粉|طحين|ئارد/i, '特级小麦面粉 (一等粉)', '面粉'],
  [/rice|大米|精制米|أرز|برنج/i, '进口长粒大米', '大米'],
  [/oil|食用油|植物油|زيت|ڕۆن/i, '精炼食用植物油', '食用油'],
  [/sugar|白糖|砂糖|سكر|شەکر/i, '精制纯白细砂糖', '白糖'],
  [/milk|奶粉|حليب|شیر/i, '全脂强化配方奶粉', '奶粉'],
  [/tea|红茶|شاي|چای/i, '特选高山红茶', '红茶']
];

export function useRationI18n() {
  const { w } = useWarehouseI18n();
  const { locale } = useI18n({ useScope: 'global' });
  const formatRationItem = (item, short = false) => {
    const name = typeof item === 'string' ? item : item?.itemName || '';
    const code = typeof item === 'object' ? item?.itemCode || '' : '';
    const match = commodities.find(([pattern]) => pattern.test(code) || pattern.test(name));
    return match ? w(match[short ? 2 : 1]) : w(name);
  };
  const formatQuotaPeriod = (period) => {
    const match = /^(\d{4})(?:年|[-/])(\d{1,2})(?:月|$|[-/])/.exec(String(period || ''));
    if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) return period || '';
    const language = { zh: 'zh-CN', en: 'en-GB', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-GB';
    return new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long', timeZone: 'UTC', calendar: 'gregory' })
      .format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)));
  };
  return { w, formatRationItem, formatQuotaPeriod };
}
