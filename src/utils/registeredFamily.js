import { addSharedFamily, getSharedFamilies } from './sharedSession.js';

const languages = ['zh', 'en', 'ar', 'ku'];

// Locally generated cards remain unconfirmed until an authoritative registry is available.
// Never attach an account to a family by card number alone.
export function getRegisteredFamily(account, lang) {
  if (!account?.nationalId) return null;
  const families = getSharedFamilies(lang);
  const existing = families.find(family => family.members?.some(member => member.nationalId === account.nationalId));
  if (existing) return existing;
  const otherLocale = languages.map(language => getSharedFamilies(language).find(family => family.members?.some(member => member.nationalId === account.nationalId))).find(Boolean);
  if (otherLocale) {
    addSharedFamily(structuredClone(otherLocale), lang);
    return otherLocale;
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
      headName: '', familyCode: '', oldPaperCardNo: account.paperCardNo || '',
      provinceCode: account.province || '', district: '', agentName: '', address: '',
      status: '', memberCount: 1,
      members: [{
        id: `registered-${account.nationalId}`, name: account.name || account.nationalId, nationalId: account.nationalId,
        relation: '', gender: '', status: 'Active', phone: account.phone || '',
        verification: { status: 'pending' }, faceVerified: false
      }]
    }, language);
  }
  return getSharedFamilies(lang).find(family => family.rationCardNo === rationCardNo) || null;
}
