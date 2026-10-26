import messages from '../locales/agentDelivery.js';

const aliasesFor = (scope, code, legacy) => [code, ...legacy,
  ...Object.values(messages).map(pack => pack[scope][code])];
const normalized = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
  .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
  .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06F0));
const catalog = language => messages[language === 'ku' ? 'ckb' : language] || messages.en;

const vehicleAliases = {
  EXPRESS_TRUCK: ['急送货车', '急送火车', 'Express Van', 'Express delivery truck', 'شاحنة سريعة'],
  COLD_CHAIN_VEHICLE: ['冷链专车', 'Cold Chain', 'Cold-chain', 'Cold-chain vehicle'],
  REFRIGERATED_BOX_TRUCK: ['厢式冷链货车', '厢式冷链保供货车', 'Refrigerated van'],
  LIGHT_SUPPLY_VEHICLE: ['轻型保供机动车'],
  PICKUP_TRUCK: ['自提卡车', 'Self-Pickup Truck']
};
const timeAliases = {
  MINUTES_30: ['30分钟内送达', '30分钟内极速送达', 'Within 30 mins', 'Within 30 mins (Express)', 'خلال 30 دقيقة (سريع جداً)', 'لە ماوەی 30 خولەکدا (خێرا)'],
  MINUTES_45: ['45分钟内送达', 'Within 45 mins'],
  HOUR_1: ['1小时内送达', '1小时内按约送达', 'Within 1 hour (Scheduled)', 'خلال ساعة واحدة (حسب الموعد)', 'لە ماوەی 1 کاتژمێردا (بەپێی کات)'],
  HOURS_2: ['2小时内送达', '2小时内完成配送', 'خلال 2 ساعة', 'لە ماوەی 2 کاتژمێردا'],
  EVENING: ['当日晚间送达', '当日晚间保供专配', 'Evening Delivery Dedicated', 'توصيل مسائي خاص', 'گەیاندنی تایبەتی ئێوارە'],
  PICKUP_ANYTIME: ['随时到店可提', 'ئامادەیە بۆ وەرگرتن', 'Ready for pickup at any time']
};

function aliasMap(scope, aliases) {
  return new Map(Object.entries(aliases).flatMap(([code, legacy]) =>
    aliasesFor(scope, code, legacy).map(value => [normalized(value), code])));
}
const vehicles = aliasMap('vehicleTypes', vehicleAliases);
const times = aliasMap('deliveryTimes', timeAliases);

// Keep plate numbers and custom descriptions intact; translate only known enums.
export function canonicalDeliveryVehicle(value) {
  let text = String(value || '').trim();
  const direct = vehicles.get(normalized(text));
  if (direct) return direct;
  text = text.replace(/[(（]([^()（）]+)[)）]/g, (full, label) => {
    const code = vehicles.get(normalized(label));
    return code ? `(${code})` : full;
  });
  // Government pickup vouchers historically use a prefix rather than brackets.
  for (const alias of aliasesFor('vehicleTypes', 'PICKUP_TRUCK', vehicleAliases.PICKUP_TRUCK)) {
    if (normalized(text).startsWith(`${normalized(alias)} `)) {
      return `PICKUP_TRUCK ${text.slice(alias.length).trim()}`;
    }
  }
  return text;
}

export function formatDeliveryVehicle(value, language = 'zh') {
  const pack = catalog(language);
  const text = canonicalDeliveryVehicle(value);
  const slot = /^(?:代销站仓位|Station Depot|مخزن الوكالة|مخزن المنفذ|کۆگای نوێنەری|کۆگای بنکە)\s+([A-Z0-9-]+)$/i.exec(text);
  if (slot) return pack.stationSlotLabel.replace('{slot}', slot[1]);
  if (Object.hasOwn(pack.vehicleTypes, text)) return pack.vehicleTypes[text];
  return text.replace(/\((\w+)\)/g, (full, code) => Object.hasOwn(pack.vehicleTypes, code) ? `(${pack.vehicleTypes[code]})` : full)
    .replace(/^PICKUP_TRUCK\s+/, `${pack.vehicleTypes.PICKUP_TRUCK} `);
}

export function deliveryTimeCode(value) {
  return times.get(normalized(value)) || '';
}

export function formatDeliveryTime(value, language = 'zh') {
  const code = deliveryTimeCode(value);
  return code ? catalog(language).deliveryTimes[code] : String(value || '');
}
