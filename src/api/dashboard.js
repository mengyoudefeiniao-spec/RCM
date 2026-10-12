import { request } from './client.js';

/**
 * 获取企业级大屏总览核心指标数据 (GET)
 */
export function getDashboardOverviewStats() {
  return request({
    url: '/dashboard/overview',
    method: 'GET'
  });
}
