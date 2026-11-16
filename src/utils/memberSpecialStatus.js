// Member special statuses stay language independent; every catalogue renders its own label.
export const MEMBER_SPECIAL_STATUS = Object.freeze({
  DISPLACED: 'displaced',
  SOCIAL_HEALTH: 'social_health'
});

export const MEMBER_SPECIAL_STATUS_CODES = Object.freeze(Object.values(MEMBER_SPECIAL_STATUS));

const LABEL_KEYS = Object.freeze({
  [MEMBER_SPECIAL_STATUS.DISPLACED]: 'citizenCard.specialStatusDisplaced',
  [MEMBER_SPECIAL_STATUS.SOCIAL_HEALTH]: 'citizenCard.specialStatusSocialHealth'
});

export function normalizeSpecialStatus(value) {
  const list = Array.isArray(value) ? value : String(value || '').split(/[,，\s]+/);
  return [...new Set(list
    .map(item => String(item || '').trim().toLowerCase())
    .filter(item => MEMBER_SPECIAL_STATUS_CODES.includes(item)))];
}

export function specialStatusLabels(t, value) {
  return normalizeSpecialStatus(value).map(code => t(LABEL_KEYS[code]));
}
