import { request } from './client.js';

/**
 * 查询代销网点档案及容积率数据 (GET)
 */
export function getAgentList(params) {
  return request({
    url: '/agent/list',
    method: 'GET',
    params
  });
}
