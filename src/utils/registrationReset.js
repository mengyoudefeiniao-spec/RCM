// Duplicate registration no longer blocks the flow: the previous account and its
// household are reset before the new registration is written. This module keeps the
// matching rules pure so the adapter and the tests share one definition.
import { normalizeRationCardNo } from './registrationCard.js';

export function normalizeRegistrationPhone(value) {
  return String(value || '').replace(/[\s-]/g, '').trim();
}

/**
 * Finds accounts that already use the same national ID, phone number or ration
 * card number, and collects every card / national ID that must be cleared.
 */
export function collectRegistrationConflicts(accounts, { nationalId = '', phone = '', rationCardNo = '' } = {}) {
  const keys = new Set([
    String(nationalId).trim(),
    normalizeRegistrationPhone(phone),
    normalizeRationCardNo(rationCardNo)
  ].filter(Boolean));
  const conflicts = (Array.isArray(accounts) ? accounts : []).filter(account => [
    account?.phone,
    account?.nationalId,
    account?.rationCardNo,
    account?.paperCardNo
  ].filter(Boolean).some(value => {
    const text = String(value);
    return keys.has(text) || keys.has(normalizeRegistrationPhone(text)) || keys.has(normalizeRationCardNo(text));
  }));
  const cardNos = new Set([normalizeRationCardNo(rationCardNo)].filter(Boolean));
  const nationalIds = new Set([String(nationalId).trim()].filter(Boolean));
  conflicts.forEach(account => {
    if (account.rationCardNo) cardNos.add(account.rationCardNo);
    if (account.paperCardNo) cardNos.add(account.paperCardNo);
    if (account.nationalId) nationalIds.add(account.nationalId);
  });
  return { conflicts, cardNos: [...cardNos], nationalIds: [...nationalIds] };
}
