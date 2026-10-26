const activeMemberStatuses = new Set(['正常', 'active', 'نشط', 'چالاکە']);

export function isEligibleCardMember(member) {
  return activeMemberStatuses.has(String(member?.status || '').trim().toLowerCase());
}

// Read-only verification uses the persisted family and stable dates, never translated labels.
export function buildCitizenCardVerification(family, claims, quotas, now = new Date()) {
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const eligibleMembers = (family.members || []).filter(isEligibleCardMember).length;
  return {
    family,
    cardNo: family.rationCardNo,
    headName: family.headName,
    eligibleMembers,
    alreadyClaimed: (claims || []).some(claim => claim.rationCardNo === family.rationCardNo && String(claim.claimTime || '').startsWith(period)),
    claimPeriod: period,
    quotaList: quotas.map(item => ({ ...item, totalQuota: eligibleMembers * item.quotaPerHead }))
  };
}

export function verifiedCitizenCardPayload(payload, verification) {
  const family = verification?.family;
  if (!family || family.rationCardNo !== payload?.cardNo) throw new Error('card-not-found');
  return {
    ...payload,
    cardNo: family.rationCardNo,
    paperCardNo: family.oldPaperCardNo || '',
    headName: family.headName || '',
    memberCount: Array.isArray(family.members) ? family.members.length : Number(family.memberCount) || 0,
    province: family.province || '', district: family.district || '',
    agentName: family.agentName || '', agentId: family.agentId || '',
    status: family.status || '', freezeReason: family.freezeReason || ''
  };
}
