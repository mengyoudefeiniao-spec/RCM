import { request } from './client.js';

/**
 * 查询仓储物资战略储备与批次库存列表 (GET)
 */
export function getWarehouseStockList(params) {
  return request({
    url: '/warehouse/stocks',
    method: 'GET',
    params
  });
}
