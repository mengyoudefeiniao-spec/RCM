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

// ========================================================
// 4. 三大管理员法定专属职权 API 体系
// ========================================================

// --------------------------------------------------------
// 4.1 配给中心部长专属职权
// 职权：授予代理权、统一代理权、设立代理权、拆分大型代理权
// --------------------------------------------------------

/**
 * 授予代理权 (核发新代理经营许可)
 */
export function grantAgency(data) {
  return apiClient.post('/admin/authority/minister/grant', data);
}

/**
 * 统一代理权 (统筹规范辖区代销资质与服务规程)
 */
export function unifyAgency(data) {
  return apiClient.post('/admin/authority/minister/unify', data);
}

/**
 * 设立代理权 (主动新设配给代销站)
 */
export function establishAgency(data) {
  return apiClient.post('/admin/authority/minister/establish', data);
}

/**
 * 拆分大型代理权 (针对超 1,500 户红线或超负荷网点执行拆分)
 */
export function splitLargeAgency(agentId, data) {
  return apiClient.post(`/admin/authority/minister/split/${agentId}`, data);
}

// --------------------------------------------------------
// 4.2 行政次长专属职权
// 职权：已故代理代理权的轮替、已注销代理权的恢复（前提是规划与跟进司确认）
// --------------------------------------------------------

/**
 * 已故代理代理权的轮替裁定
 */
export function approveDeceasedRotation(ticketId, data) {
  return apiClient.post(`/admin/authority/deputy/deceased-rotation/${ticketId}`, data);
}

/**
 * 已注销代理权的恢复 (前提是规划与跟进司确认)
 */
export function restoreRevokedAgency(agentId, data) {
  return apiClient.post(`/admin/authority/deputy/restore/${agentId}`, data);
}

// --------------------------------------------------------
// 4.3 规划与跟进司总干事专属职权
// 职权：代理注销、代理轮替/转移、合并代理权和处罚
// --------------------------------------------------------

/**
 * 代理注销 (受理并执行主动清退或违规注销)
 */
export function cancelAgency(agentId, data) {
  return apiClient.post(`/admin/authority/planning/cancel/${agentId}`, data);
}

/**
 * 代理轮替/转移审批
 */
export function rotateTransferAgency(ticketId, data) {
  return apiClient.post(`/admin/authority/planning/rotate-transfer/${ticketId}`, data);
}

/**
 * 合并代理权 (合并低于 750 户小型网点)
 */
export function mergeAgencies(data) {
  return apiClient.post('/admin/authority/planning/merge', data);
}

/**
 * 对网点下达行政处罚 (停业整顿 / 罚款 / 吊销)
 */
export function penalizeAgency(agentId, data) {
  return apiClient.post(`/admin/authority/planning/penalize/${agentId}`, data);
}

/**
 * 规划与跟进司完成联合调查并确认 (供行政次长恢复代理权的前置条件)
 */
export function confirmPlanningReview(agentId, data) {
  return apiClient.post(`/admin/authority/planning/confirm-review/${agentId}`, data);
}

// ==========================================
// 4. 仓储中心管理 (增删改查)
// ==========================================

export function getAdminWarehouses(params = {}) {
  return apiClient.get('/admin/warehouses', { params });
}

export function createAdminWarehouse(data) {
  return apiClient.post('/admin/warehouses', data);
}

export function updateAdminWarehouse(warehouseId, data) {
  return apiClient.put(`/admin/warehouses/${warehouseId}`, data);
}

export function deleteAdminWarehouse(warehouseId) {
  return apiClient.delete(`/admin/warehouses/${warehouseId}`);
}

