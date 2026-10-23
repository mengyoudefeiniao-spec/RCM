import { broadcastTabMessage } from './crossTabBus.js';

export const COMPLAINT_STORAGE_PREFIX = 'rcm_shared_complaint_';
export const COMPLAINT_STATUSES = {
  PENDING: ['待分配', 'Pending Assignment', 'statusPendingAssign'],
  INVESTIGATING: ['核查中', 'Under Investigation', 'statusInvestigating'],
  RECTIFYING: ['督办整改中', 'Rectification in Progress', 'statusSupervising'],
  RESOLVED: ['已办结', 'Resolved', 'statusResolved']
};
export const COMPLAINT_TYPES = {
  OVERCHARGE: ['私自加价/违规收费', 'Unauthorized Overcharge / Illegal Fees', 'typeOvercharge'],
  SHORTAGE: ['缺斤短两/克扣', 'Short Weight / Deductions', 'typeShortage'],
  QUALITY: ['物资品质口感异议', 'Quality / Odor Complaints', 'typeQuality'],
  SERVICE: ['服务态度差/排队耗时', 'Poor Service / Long Waiting Queues', 'typeService'],
  QUOTA: ['配给份额核定有误', 'Quota Calculation Dispute', 'typeQuota']
};
const resolveCode = (catalog, value, fallback) => Object.hasOwn(catalog, value || '')
  ? value : Object.keys(catalog).find(key => catalog[key].slice(0, 2).includes(value)) || fallback;
export const complaintStatusCode = value => resolveCode(COMPLAINT_STATUSES, value, 'PENDING');
export const complaintTypeCode = value => resolveCode(COMPLAINT_TYPES, value, 'SERVICE');
export const complaintOwnerId = profile => String(profile?.id || profile?.username || '');
export const ownsComplaint = (ticket, profile) => !!complaintOwnerId(profile)
  && ticket.requesterId === complaintOwnerId(profile) && ticket.requesterRole === profile?.role;

export function normalizeComplaint(ticket) {
  const statusCode = complaintStatusCode(ticket.statusCode || ticket.status);
  const typeCode = complaintTypeCode(ticket.typeCode || ticket.type);
  return { ...ticket, statusCode, typeCode, status: COMPLAINT_STATUSES[statusCode][0], type: COMPLAINT_TYPES[typeCode][0] };
}

export function presentComplaint(ticket, isEn = false) {
  const row = normalizeComplaint(ticket);
  return { ...row, status: COMPLAINT_STATUSES[row.statusCode][isEn ? 1 : 0], type: COMPLAINT_TYPES[row.typeCode][isEn ? 1 : 0],
    ...(row.channelCode ? { channel: row.channelCode === 'AI' ? (isEn ? 'AI Smart Assistant' : 'AI智能客服助手') : (isEn ? '1919 Government Hotline' : '1919政务热线电话') } : {}) };
}

export function readSharedComplaints(seeds = []) {
  const byId = new Map(seeds.map(ticket => [ticket.id, normalizeComplaint(ticket)]));
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(COMPLAINT_STORAGE_PREFIX)) continue;
    try {
      const ticket = JSON.parse(localStorage.getItem(key));
      if (ticket?.id) byId.set(ticket.id, normalizeComplaint(ticket));
    } catch { /* Skip invalid cached records. */ }
  }
  return [...byId.values()].sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
}

export function writeSharedComplaint(ticket) {
  const record = normalizeComplaint(ticket);
  // One key per ticket prevents unrelated submissions from overwriting each other.
  localStorage.setItem(`${COMPLAINT_STORAGE_PREFIX}${record.id}`, JSON.stringify(record));
  window.dispatchEvent(new CustomEvent('rcm:complaints-changed', { detail: { id: record.id } }));
  window.dispatchEvent(new CustomEvent('rcm:notifications-changed'));
  broadcastTabMessage('COMPLAINT_CHANGED', { id: record.id });
  return record;
}
