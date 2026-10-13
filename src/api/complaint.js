import { request } from './client.js';

/**
 * 查询投诉与维权工单列表 (支持渠道来源、状态、省市、关键词等)
 */
export function getComplaintList(params = {}) {
  return request({
    url: '/complaint/list',
    method: 'GET',
    params
  });
}

/**
 * 录入新的投诉工单 (如 1919 电话登记或 AI 客服转交)
 */
export function createComplaintTicket(data) {
  return request({
    url: '/complaint/create',
    method: 'POST',
    data
  });
}

/**
 * 处理并办结投诉工单
 */
export function handleComplaintTicket(id, data) {
  return request({
    url: `/complaint/handle/${id}`,
    method: 'POST',
    data
  });
}
