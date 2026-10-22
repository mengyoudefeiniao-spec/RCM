import { request } from './client.js';

export const getSystemRecords = (section, params = {}) => request({ url: `/admin/system/${section}`, method: 'GET', params });
export const logAuditExport = (filters = {}) => request({ url: '/admin/system/audit-logs/export', method: 'POST', data: { filters } });
export const saveSystemRecord = (section, data) => request({ url: `/admin/system/${section}`, method: 'POST', data });
export const deleteSystemRecord = (section, id, data = {}) => request({ url: `/admin/system/${section}/${encodeURIComponent(id)}`, method: 'DELETE', data });
export const getMessages = (box = 'inbox', params = {}) => request({ url: `/messages/${box}`, method: 'GET', params });
export const decideMessageReview = (id, decision, notes = '') => request({
  url: `/messages/${encodeURIComponent(id)}/review`,
  method: 'POST',
  data: { decision, notes }
});
export const setMessageFavorite = (id, favorite) => request({ url: `/messages/${encodeURIComponent(id)}/favorite`, method: 'PUT', data: { favorite } });
export const getMessageRecipientTree = () => request({ url: '/messages/recipients/tree', method: 'GET' });
export const sendMessage = (data) => {
  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (key === 'attachments') value.forEach((file) => form.append('attachments', file, file.name));
    else form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
  return request({ url: '/messages', method: 'POST', data: form, headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getMessageAttachment = (id) => request({ url: `/messages/attachments/${encodeURIComponent(id)}`, method: 'GET' });
export const markMessageRead = (id) => request({ url: `/messages/${encodeURIComponent(id)}/read`, method: 'POST' });
