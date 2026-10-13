import { request } from './client.js';

/**
 * 获取企业级大屏总览核心指标数据 (GET，向后兼容)
 */
export function getDashboardOverviewStats() {
  return request({
    url: '/dashboard/overview',
    method: 'GET'
  });
}

/**
 * 获取管理角色综合数据看板（公民、家庭、各地区代理商、实际配给情况、投诉和处理）(GET)
 * @param {string} timeRange - 'quarter' | 'month' | 'week'
 */
export function getAdminDashboardStats(timeRange = 'quarter') {
  return request({
    url: `/dashboard/admin-overview?timeRange=${timeRange}`,
    method: 'GET'
  });
}

/**
 * 获取配给代理保供大盘数据（支持时间范围联动）(GET)
 * @param {string} timeRange - 'quarter' | 'month' | 'week'
 */
export function getAgentDashboardStats(timeRange = 'quarter') {
  return request({
    url: `/dashboard/agent-overview?timeRange=${timeRange}`,
    method: 'GET'
  });
}
