import { isHouseholdHead } from './memberDeregistration.js';
import { normalizeSpecialStatus } from './memberSpecialStatus.js';

// Canonical ticket source. Language catalogues map this value to their own label.
export const MEMBER_UPDATE_SOURCE = '成员信息变更';
export const MEMBER_UPDATE_SOURCE_CODE = 'MUPD';
export const MEMBER_UPDATE_PROOF_TYPES = Object.freeze(['application/pdf', 'image/jpeg', 'image/png']);
export const MEMBER_UPDATE_PROOF_MAX_SIZE = 10 * 1024 * 1024;

export function normalizePhoneNumber(value) {
  return String(value || '').replace(/[\s-]/g, '').trim();
}

// The household head phone doubles as a login identifier, so it cannot change without evidence.
export function headPhoneRequiresVerification(member, nextPhone) {
  return isHouseholdHead(member)
    && normalizePhoneNumber(nextPhone) !== normalizePhoneNumber(member?.phone);
}

export function sameSpecialStatus(left, right) {
  const a = normalizeSpecialStatus(left).sort();
  const b = normalizeSpecialStatus(right).sort();
  return a.length === b.length && a.every((code, index) => code === b[index]);
}

export function memberUpdateChanges(member, form) {
  const phoneChanged = normalizePhoneNumber(form?.phone) !== normalizePhoneNumber(member?.phone);
  const addressChanged = String(form?.residenceInfo || '').trim() !== String(member?.residenceInfo || '').trim();
  return {
    phoneChanged,
    addressChanged,
    headPhoneChange: phoneChanged && isHouseholdHead(member),
    specialStatusChanged: !sameSpecialStatus(form?.specialStatus, member?.specialStatus),
    requiresHeadPhoneVerification: headPhoneRequiresVerification(member, form?.phone)
  };
}

export function isMemberUpdateProofValid(file) {
  return Boolean(file)
    && MEMBER_UPDATE_PROOF_TYPES.includes(file.type)
    && file.size > 0
    && file.size <= MEMBER_UPDATE_PROOF_MAX_SIZE;
}

export function matchesMemberUpdateTarget(member, payload) {
  return Boolean(member && (
    (payload?.targetMemberId && String(member.id) === String(payload.targetMemberId))
    || (payload?.targetNationalId && String(member.nationalId) === String(payload.targetNationalId))
  ));
}

// Materialize the demo proof as a real image so it follows the same upload and
// PocketBase storage path as a document chosen from the device.
export async function createDefaultSpecialStatusProofFile({ t, locale, member, cardNo, statuses, reference }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  const rtl = ['ar', 'ckb', 'ku'].includes(locale);
  const x = rtl ? 1100 : 100;
  context.fillStyle = '#FBFDFB';
  context.fillRect(0, 0, 1200, 900);
  context.strokeStyle = '#C9DBCE';
  context.lineWidth = 3;
  context.strokeRect(50, 50, 1100, 800);
  context.textAlign = rtl ? 'right' : 'left';
  context.direction = rtl ? 'rtl' : 'ltr';
  context.fillStyle = '#1B3123';
  context.font = 'bold 38px sans-serif';
  context.fillText(t('memberUpdate.sampleProofTitle'), x, 140, 1000);
  const fields = [
    [t('memberUpdate.proofReference'), reference],
    [t('citizenCard.memberName'), member?.name],
    [t('common.nationalId'), member?.nationalId],
    [t('citizen.rationCardNo'), cardNo],
    [t('citizenCard.specialStatusTitle'), (statuses || []).join(' / ')]
  ];
  fields.forEach(([label, value], index) => {
    const y = 215 + index * 105;
    context.fillStyle = '#718277';
    context.font = '24px sans-serif';
    context.fillText(label, x, y, 1000);
    context.fillStyle = '#1B3123';
    context.font = '30px sans-serif';
    context.fillText(String(value || '—'), x, y + 42, 1000);
  });
  context.fillStyle = '#8D713D';
  context.font = '22px sans-serif';
  context.fillText(t('memberUpdate.sampleProofHint'), x, 790, 1000);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image encoding failed')), 'image/png'));
  const filenameReference = String(reference || '').replace(/[\\/:*?"<>|]/g, '-');
  return new File([blob], t('memberUpdate.sampleProofFileName', { reference: filenameReference }), { type: 'image/png' });
}
