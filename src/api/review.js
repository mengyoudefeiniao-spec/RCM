import { request } from './client.js';

/**
 * 获取电子审核待办工单清单 (GET)
 * 支持按【来源】筛选：全部、申请分户、申请解冻、变更户主、成员录入、成员转移
 */
export function getReviewTicketList(params) {
  return request({
    url: '/review/tickets',
    method: 'GET',
    params
  });
}

/**
 * 提交第一级：分部员工初审意见 (POST)
 */
export function submitStaffOpinion(data) {
  return request({
    url: '/review/staff-opinion',
    method: 'POST',
    data
  });
}

/**
 * 提交第二级：分部经理终审裁决 (POST)
 */
export function submitManagerDecision(data) {
  return request({
    url: '/review/manager-decision',
    method: 'POST',
    data
  });
}
