const CASE_KEY_ALIASES = Object.freeze({
  commercial: 'commercial', 'commercial activity': 'commercial', 'نشاط تجاري': 'commercial', 'بازرگانی': 'commercial', '商业': 'commercial',
  travel: 'travel', 'overseas travel': 'travel', 'سفر': 'travel', 'گەشت': 'travel', '旅行': 'travel',
  income: 'income', highincome: 'income', 'high income': 'income', 'دخل مرتفع': 'income', 'داهاتی بەرز': 'income', '高收入': 'income',
  address: 'address', unknownaddress: 'address', 'unknown address': 'address', 'unknown residence address': 'address', 'عنوان غير معروف': 'address', 'ناونیشانی نەزانراو': 'address', '住址不明': 'address',
  update: 'update', 'record update': 'update', 'information update': 'update', 'civil registry update required': 'update', 'تحديث البيانات': 'update', 'نوێکردنەوەی زانیاری': 'update', '更新': 'update',
  duplicate: 'duplicate', 'duplicate registration': 'duplicate', 'قيد مكرر': 'duplicate', 'تۆماری دووبارە': 'duplicate', '重复': 'duplicate',
  temporary: 'temporary', 'temporary restriction': 'temporary', 'temporary biometric audit': 'temporary', 'قيد مؤقت': 'temporary', 'بەستنی کاتی': 'temporary', '临时': 'temporary',
  location: 'location', geolocation: 'location', geolocationdiscrepancy: 'location', 'geographic discrepancy': 'location', 'الموقع الجغرافي': 'location', 'شوێنی جوگرافی': 'location', '地理位置': 'location'
});

const CASE_KEY_CODES = Object.freeze({ highIncome: 'income', unknownAddress: 'address', geoLocation: 'location' });

export function resolveUnfreezeCaseKey(value) {
  if (value == null) return '';
  const normalized = String(value).trim();
  if (!normalized) return '';
  return CASE_KEY_ALIASES[normalized.toLowerCase()] || CASE_KEY_CODES[normalized] || '';
}

export function localizeUnfreezeCase(value, t) {
  const key = resolveUnfreezeCaseKey(value);
  return key ? t(`unfreeze.caseNames.${key}`) : String(value ?? '');
}
