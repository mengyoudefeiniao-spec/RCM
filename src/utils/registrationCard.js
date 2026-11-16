// Shared ration-card rules for the registration wizard and the demo API adapter.
export const CARD_TYPES = Object.freeze({ PAPER: 'paper', ELECTRONIC: 'electronic', NONE: 'none' });
export const CARD_TYPE_VALUES = Object.freeze(Object.values(CARD_TYPES));

// Order matches TRANSFER_BRANCH_OPTIONS provinces in the demo registry.
export const PROVINCE_CODES = Object.freeze(['baghdad', 'diyala', 'nineveh', 'kirkuk', 'basra']);

const CARD_NO_PATTERN = /^[A-Z0-9][A-Z0-9-]{5,29}$/;
const NATIONAL_ID_PATTERN = /^[0-9A-Z][0-9A-Z-]{5,29}$/;
const PHONE_PATTERN = /^\+?[0-9]{8,15}$/;

export function normalizeCardType(value) {
  return CARD_TYPE_VALUES.includes(value) ? value : CARD_TYPES.NONE;
}

export function cardTypeNeedsScan(cardType) {
  return normalizeCardType(cardType) !== CARD_TYPES.NONE;
}

export function normalizeRationCardNo(value) {
  return String(value || '').trim().toUpperCase();
}

export function isValidRationCardNo(value) {
  return CARD_NO_PATTERN.test(normalizeRationCardNo(value));
}

export function isValidNationalId(value) {
  return NATIONAL_ID_PATTERN.test(String(value || '').trim().toUpperCase());
}

export function isValidPhone(value) {
  return PHONE_PATTERN.test(String(value || '').replace(/[\s-]/g, ''));
}

export function provinceCodeAt(index) {
  return PROVINCE_CODES[index] || '';
}

// Citizens without a card receive a provisional number until the center issues the final one.
export function provisionalRationCardNo(centerId) {
  const suffix = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  return `RC-${String(centerId || 'NEW').replace(/[^A-Za-z0-9]/g, '').toUpperCase()}-${suffix}`;
}
