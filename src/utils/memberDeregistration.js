// Stable identity and eligibility checks shared by the application and review gateway.
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
