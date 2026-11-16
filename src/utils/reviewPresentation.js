import { MOCK_REVIEW_TICKETS as chineseTickets } from '../mock/data/reviewData.js';
import { MOCK_REVIEW_TICKETS as englishTickets } from '../mock/data/en/reviewData.js';
import { localizeDemoFamilyNames } from './sharedSession.js';

export const REVIEW_SOURCE_KEYS = {
  '全部': 'sourceAll', All: 'sourceAll',
  '申请分户': 'sourceSplit', 'Split Household': 'sourceSplit',
  '申请解冻': 'sourceUnfreeze', 'Unfreeze Card': 'sourceUnfreeze', 'Card unfreeze': 'sourceUnfreeze',
  '变更户主': 'sourceChangeHead', 'Change Head': 'sourceChangeHead',
  '注销成员': 'sourceDeregistration', 'Member Deregistration': 'sourceDeregistration',
  '代理转移': 'sourceTransferAgent', 'Transfer Agent': 'sourceTransferAgent',
  '成员录入': 'sourceMemberEntry', 'Member Entry': 'sourceMemberEntry',
  '成员转移': 'sourceMemberTransfer', 'Transfer Member': 'sourceMemberTransfer',
  '成员信息变更': 'sourceMemberUpdate', 'Member Update': 'sourceMemberUpdate'
};

const pendingStatuses = new Set([
  'PENDING_STAFF', 'PENDING_MANAGER', 'PENDING_STAFF_REVIEW', 'PENDING_MANAGER_REVIEW',
  '待分部初审', '待经理终审', 'Pending Staff Review', 'Pending Manager Review',
  'بانتظار تدقيق الموظف', 'بانتظار موافقة المدير',
  'چاوەڕوانی وردبینی کارمەند', 'چاوەڕوانی پەسەندی بەڕێوەبەر'
].map(value => value.toLowerCase()));

export function isPendingReview(ticket) {
  const status = typeof ticket === 'string' ? ticket : ticket?.statusCode || ticket?.status;
  return pendingStatuses.has(String(status || '').trim().toLowerCase());
}

const seeds = {
  zh: new Map(chineseTickets.map(ticket => [ticket.id, ticket])),
  en: new Map(englishTickets.map(ticket => [ticket.id, ticket]))
};
function seedField(ticket, field) {
  const attachment = field.match(/^attachment(\d+)$/);
  return attachment ? ticket?.attachments?.[Number(attachment[1])]?.name : ticket?.[field];
}

export function reviewTicketField(ticket, field, locale, t, te, fallback) {
  const value = fallback ?? ticket?.[field] ?? '';
  if (!ticket) return value;
  if (ticket.sourceCode === 'DRG') {
    if (['appType', 'categoryType'].includes(field)) return t('memberDeregistration.applicationType');
    if (field === 'reason') return t('memberDeregistration.reason', { reference: ticket.payload?.deathProofNo || '' });
  }
  const person = ['targetMemberName', 'applicantName', 'replacementHeadName'].includes(field);
  if (person) {
    const name = localizeDemoFamilyNames({ rationCardNo: ticket.cardNo, headName: value }, locale).headName;
    if (name !== value) return name;
  }
  const zh = seedField(seeds.zh.get(ticket.id), field);
  const en = seedField(seeds.en.get(ticket.id), field);
  const knownSeedValue = value === zh || value === en;
  if (knownSeedValue) {
    if (locale === 'zh') return zh ?? value;
    if (locale === 'en') return en ?? value;
    const key = `review.ticketData.${ticket.id}.${field}`;
    if (te(key, locale)) return t(key);
    return en ?? value;
  }
  return value;
}
