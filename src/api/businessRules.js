import { request } from './client.js';

/**
 * 读取业务规则配置文档（含当前版本与历史版本快照）
 */
export function getBusinessRulesDocument() {
  return request({
    url: '/admin/business-rules',
    method: 'GET'
  });
}

/**
 * 发布业务规则：返回版本号递增后的规则文档
 */
export function saveBusinessRulesDocument(data) {
  return request({
    url: '/admin/business-rules',
    method: 'POST',
    data
  });
}
