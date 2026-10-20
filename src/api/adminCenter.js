import { request } from './client.js';

export const getSystemRecords = (section) => request({ url: `/admin/system/${section}`, method: 'GET' });
export const saveSystemRecord = (section, data) => request({ url: `/admin/system/${section}`, method: 'POST', data });
export const deleteSystemRecord = (section, id, data = {}) => request({ url: `/admin/system/${section}/${encodeURIComponent(id)}`, method: 'DELETE', data });
export const getMessages = (box = 'inbox') => request({ url: `/messages/${box}`, method: 'GET' });
export const sendMessage = (data) => request({ url: '/messages', method: 'POST', data });
export const markMessageRead = (id) => request({ url: `/messages/${encodeURIComponent(id)}/read`, method: 'POST' });
