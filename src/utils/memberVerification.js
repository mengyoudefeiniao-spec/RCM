export function memberVerificationStatus(member = {}) {
  const status = member?.verification?.status;
  if (['pending', 'passed', 'failed', 'manual'].includes(status)) return status;
  if (status != null) return 'pending';
  return member?.faceVerified === true ? 'passed' : 'pending';
}

export function hasPendingRemoteVerification(member = {}) {
  return memberVerificationStatus(member) === 'pending' && member?.verification?.method === 'remote';
}
