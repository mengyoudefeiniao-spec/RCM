import { addSharedFamily, getSharedFamilies, updateSharedFamily } from './sharedSession.js';
import { SIMULATED_IDENTITY_NAME } from './simulatedIdentity.js';

const languages = ['zh', 'en', 'ar', 'ku'];

function applyRegisteredAccount(member, account) {
  if (member.nationalId !== account.nationalId) return member;
  const changes = {};
  const verifiedDemoName = account.identityVerification?.status === 'passed' && account.identityVerification?.simulated === true
    ? account.identityVerification.simulatedName || SIMULATED_IDENTITY_NAME : '';
  const accountName = account.name || verifiedDemoName;
  if (accountName && (!member.name || member.name === member.nationalId)) changes.name = accountName;
  if (account.phone && !member.phone) changes.phone = account.phone;
  const result = account.identityVerification;
  const emptyPending = member.verification?.status === 'pending' && !member.verification.method && !member.verification.verifiedAt;
  if (result?.status === 'passed' && result.simulated === true && member.faceVerified !== true && (!member.verification || emptyPending)) {
    changes.verification = { ...result, memberId: member.id, method: 'online' };
    changes.faceVerified = true;
    if (result.verifiedAt) changes.faceVerifiedAt = result.verifiedAt;
  }
  return Object.keys(changes).length ? { ...member, ...changes } : member;
}

// Locally generated cards remain unconfirmed until an authoritative registry is available.
// Never attach an account to a family by card number alone.
export function getRegisteredFamily(account, lang) {
  if (!account?.nationalId) return null;
  const families = getSharedFamilies(lang);
  const existing = families.find(family => family.members?.some(member => member.nationalId === account.nationalId));
  if (existing) {
    if (!existing.members.some(member => applyRegisteredAccount(member, account) !== member)) return existing;
    return updateSharedFamily(existing.rationCardNo, family => ({
      ...family, members: family.members.map(member => applyRegisteredAccount(member, account))
    }), lang) || existing;
  }
  const otherLocale = languages.map(language => getSharedFamilies(language).find(family => family.members?.some(member => member.nationalId === account.nationalId))).find(Boolean);
  if (otherLocale) {
    addSharedFamily(structuredClone(otherLocale), lang);
    return getRegisteredFamily(account, lang);
  }

  const requestedCard = String(account.rationCardNo || '').trim();
  const cardTaken = requestedCard && languages.some(language => getSharedFamilies(language).some(family => family.rationCardNo === requestedCard));
  const rationCardNo = requestedCard && !cardTaken ? requestedCard : `RC-TMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  for (const language of languages) {
    const pool = getSharedFamilies(language);
    if (pool.some(family => family.rationCardNo === rationCardNo)) continue;
    addSharedFamily({
      rationCardNo,
      cardUnconfirmed: true,
      simulatedFamilyNumber: account.simulatedFamilyNumber || null,
      headName: '', familyCode: '', oldPaperCardNo: account.paperCardNo || '',
      provinceCode: account.province || '', district: '', agentName: '', address: '',
      status: '', memberCount: 1,
      members: [applyRegisteredAccount({
        id: `registered-${account.nationalId}`, name: account.name || account.nationalId, nationalId: account.nationalId,
        relation: '', gender: '', status: 'Active', phone: account.phone || '',
        simulatedFamilyNumber: account.simulatedFamilyNumber || null,
        verification: { status: 'pending' }, faceVerified: false
      }, account)]
    }, language);
  }
  return getSharedFamilies(lang).find(family => family.rationCardNo === rationCardNo) || null;
}
