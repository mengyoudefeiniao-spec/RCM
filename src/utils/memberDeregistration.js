// Stable identity and eligibility checks shared by the application and review gateway.
export const DEFAULT_DEATH_PROOF_NO = 'DTH-BAG-2026-90182';

// Materialize the prefilled sample as a real image so it follows the same file
// upload, PocketBase storage and reviewer download path as a selected local file.
export async function createDefaultDeathProofFile({ t, locale, member, cardNo, reference }) {
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
  context.fillText(t('memberDeregistration.defaultProofTitle'), x, 140, 1000);
  const fields = [
    [t('memberDeregistration.deathProofNo'), reference],
    [t('memberDeregistration.member'), member.name],
    [t('common.nationalId'), member.nationalId],
    [t('citizen.rationCardNo'), cardNo]
  ];
  fields.forEach(([label, value], index) => {
    const y = 235 + index * 125;
    context.fillStyle = '#718277';
    context.font = '24px sans-serif';
    context.fillText(label, x, y, 1000);
    context.fillStyle = '#1B3123';
    context.font = '30px sans-serif';
    context.fillText(String(value || '—'), x, y + 45, 1000);
  });
  context.fillStyle = '#8D713D';
  context.font = '22px sans-serif';
  context.fillText(t('memberDeregistration.defaultProofHint'), x, 790, 1000);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image encoding failed')), 'image/png'));
  const filenameReference = reference.replace(/[\\/:*?"<>|]/g, '-');
  return new File([blob], t('memberDeregistration.defaultFileName', { reference: filenameReference }), { type: 'image/png' });
}

export function isHouseholdHead(member) {
  return ['户主', 'head', 'head of household', 'رب الأسرة', 'سەرۆکی خێزان'].includes(String(member?.relation || '').trim().toLowerCase());
}

export function matchesDeregistrationMember(member, payload) {
  return Boolean(member && (
    (payload?.targetMemberId && String(member.id) === String(payload.targetMemberId))
    || (payload?.targetNationalId && String(member.nationalId) === String(payload.targetNationalId))
  ));
}

export function deregistrationSuccessors(family, target) {
  return (family?.members || []).filter(member => member.id !== target?.id
    && ['正常', 'active', 'نشط', 'ساري المفعول', 'چالاک', 'چالاکە'].includes(String(member.status || '').trim().toLowerCase())
    && !member.freezeReason);
}
