import apiClient from './client.js';

/**
 * 监督官 (Admin) 后台综合管理 API 模块
 */

// ==========================================
// 1. 公民（电子配给卡）管理
// ==========================================

/**
 * 获取公民配给卡列表
 * @param {Object} params { cardNo, headName, status, province }
 */
export function getCitizenCards(params = {}) {
  return apiClient.get('/admin/citizen-cards', { params });
}

/**
 * 修改公民配给卡状态（解冻 / 冻结 / 吊销）
 * @param {string} cardId
 * @param {Object} data { status, reason }
 */
export function updateCitizenCardStatus(cardId, data) {
  return apiClient.put(`/admin/citizen-cards/${cardId}/status`, data);
}

/**
 * 调整公民月度配给定额
 * @param {string} cardId
 * @param {Object} data { quotas: { flour, rice, oil, sugar } }
 */
export function updateCitizenCardQuota(cardId, data) {
  return apiClient.put(`/admin/citizen-cards/${cardId}/quota`, data);
}

/**
 * 换发新卡 / 重置 NFC 芯片 UID
 * @param {string} cardId
 * @param {Object} data
 */
export function reissueCitizenCard(cardId, data = {}) {
  return apiClient.post(`/admin/citizen-cards/${cardId}/reissue`, data);
}

// ==========================================
// 2. 家庭户籍档案管理
// ==========================================

/**
 * 获取家庭户籍档案列表
 * @param {Object} params { familyCode, headName, category }
 */
export function getFamilyList(params = {}) {
  return apiClient.get('/admin/families', { params });
}

/**
 * 新增家庭建档
 * @param {Object} data
 */
export function createFamily(data) {
  return apiClient.post('/admin/families', data);
}

/**
 * 修改家庭档案信息
 * @param {string} familyId
 * @param {Object} data
 */
export function updateFamily(familyId, data) {
  return apiClient.put(`/admin/families/${familyId}`, data);
}

/**
 * 删除/注销家庭户籍
 * @param {string} familyId
 */
export function deleteFamily(familyId) {
  return apiClient.delete(`/admin/families/${familyId}`);
}

// ==========================================
// 3. 代理网点治理管理
// ==========================================

/**
 * 获取代理网点列表
 * @param {Object} params { code, name, status }
 */
export function getAdminAgentList(params = {}) {
  return apiClient.get('/admin/agents', { params });
}

/**
 * 修改代理网点运营状态
 * @param {string} agentId
 * @param {Object} data { status, note }
 */
export function updateAdminAgentStatus(agentId, data) {
  return apiClient.put(`/admin/agents/${agentId}/status`, data);
}

/**
 * 新增代理网点登记
 * @param {Object} data
 */
export function createAdminAgent(data) {
  return apiClient.post('/admin/agents', data);
}

/**
 * 更新代理网点资料
 * @param {string} agentId
 * @param {Object} data
 */
export function updateAdminAgent(agentId, data) {
  return apiClient.put(`/admin/agents/${agentId}`, data);
}
