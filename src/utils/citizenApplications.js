// Shared citizen application-history rules for the My Account preview and the Applications module.
import { getSharedTickets } from './sharedSession.js';

export const APPLICATION_SOURCE_CODES = Object.freeze(['TRF', 'TRM', 'SPL', 'HED', 'UNF', 'DRG', 'MUPD']);

const sourceCodeSet = new Set(APPLICATION_SOURCE_CODES);

export function isApplicationSourceCode(code) {
  return sourceCodeSet.has(code);
}

// Older tickets only carry localized labels, so map them back to a stable source code.
export function resolveApplicationSourceCode(ticket) {
  if (isApplicationSourceCode(ticket?.sourceCode)) return ticket.sourceCode;
  const source = `${ticket?.source || ''} ${ticket?.categoryType || ''} ${ticket?.appType || ''}`.toLowerCase();
  if (/成员.*转移|member transfer|member entry/.test(source)) return 'TRM';
  if (/代理.*转移|agent transfer|transfer agent/.test(source)) return 'TRF';
  if (/分户|split household/.test(source)) return 'SPL';
  if (/变更户主|change head/.test(source)) return 'HED';
  if (/解冻|unfreeze/.test(source)) return 'UNF';
  return '';
}

export function applicationStatusKey(record) {
  const value = `${record?.status || ''} ${record?.managerDecision || ''}`.toLowerCase();
  if (/reject|denied|驳回|未通过|不予|مرفوض|رفض|پەسەند نەکرا/.test(value)) return 'rejected';
  if (/approv|passed|通过|核准|生效|办结|批准|تمت الموافقة|مقبول|پەسەندکرا/.test(value)) return 'approved';
  return 'pending';
}

export function applicationReviewMode(record) {
  if (record?.reviewMode === 'automatic' || record?.reviewMode === 'manual') return record.reviewMode;
  return applicationStatusKey(record) === 'pending' ? 'manual' : 'automatic';
}

// Tickets carry the applicant card number; only the signed-in family's own history is returned.
export function listCitizenApplications(cardNo) {
  return getSharedTickets()
    .map(ticket => ({ ...ticket, sourceCode: resolveApplicationSourceCode(ticket) }))
    .filter(ticket => ticket.sourceCode && (!cardNo || ticket.cardNo === cardNo))
    .sort((a, b) => new Date(String(b.submittedAt || '').replace(' ', 'T')) - new Date(String(a.submittedAt || '').replace(' ', 'T')));
}
