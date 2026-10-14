import { request } from './client.js';

/**
 * 代理商微服务 API 集合
 * 对标 Spring Cloud: Gateway -> SCM (供应链/代理) / BPM (流程审批) / UNICODE (第140号决议编码)
 */

/**
 * 1. 查询当前登录代理人名下的中心与代销站列表 (SCM)
 */
export function getMyAgentCenters(params) {
  return request({
    url: '/agent/my-centers',
    method: 'GET',
    params
  });
}

/**
 * 2. 查询全国省份与配给中心列表 (UNICODE / SCM)
 * 包含完整 19 个省份、300 多个行政市区以及 600 个配给仓库，标识第140号决议管辖网点
 * 支持过滤：province, city, isArticle140, status(已注销/已被代理), keyword
 */
export function getArticle140Centers(params) {
  return request({
    url: '/agent/article140-centers',
    method: 'GET',
    params
  });
}
export const getProvincesAndCenters = getArticle140Centers;

/**
 * 3. 查询当前代理人档案及法定资格状态 (AUTH / SCM)
 */
export function getAgentProfile() {
  return request({
    url: '/agent/profile',
    method: 'GET'
  });
}

/**
 * 4. 提交新代理权授予申请 (BPM / SCM)
 * 流程：上传对应证明附件 -> 自动/手动审核 -> 电子支付(250,000 IQD) -> 完成申请
 */
export function submitAgentGrantApplication(data) {
  return request({
    url: '/agent/apply-grant',
    method: 'POST',
    data
  });
}

/**
 * 5. 提交代理权轮替 (转移) 申请 (BPM / SCM)
 * 流程：已故轮替/生前申请轮替 -> 上传对应证明附件 -> 自动/手动审核 -> 电子支付(50,000 IQD) -> 完成转移
 */
export function submitAgentRotationApplication(data) {
  return request({
    url: '/agent/apply-rotation',
    method: 'POST',
    data
  });
}

/**
 * 6. 提交恢复已注销的代理权申请 (BPM / SCM)
 * 流程：上传对应证明附件 -> 自动/手动审核 -> 电子支付(50,000 IQD) -> 完成申请
 */
export function submitAgentRestorationApplication(data) {
  return request({
    url: '/agent/apply-restoration',
    method: 'POST',
    data
  });
}

/**
 * 7. 主动申请注销代理中心 (SCM)
 * 规则：已被代理的中心需要先注销代理，才能重新申请
 */
export function cancelAgentCenter(centerId, data) {
  return request({
    url: `/agent/centers/${centerId}/cancel`,
    method: 'POST',
    data
  });
}

/**
 * 8. 电子支付申请规费 (SCM / PAYMENT)
 * 支持 250,000 IQD (新授予) 或 50,000 IQD (轮替/恢复)
 */
export function payAgentApplicationFee(ticketNo, data) {
  return request({
    url: `/agent/applications/${ticketNo}/pay`,
    method: 'POST',
    data
  });
}

/**
 * 9. 查询代理人发起的业务工单流水 (BPM)
 */
export function getAgentApplications(params) {
  return request({
    url: '/agent/applications',
    method: 'GET',
    params
  });
}

/**
 * 10. 兼容旧接口：查询全部代销网点列表
 */
export function getAgentList(params) {
  return request({
    url: '/agent/list',
    method: 'GET',
    params
  });
}

/**
 * 11. G2B 集中批发采购补货订单列表 (SCM)
 */
export function getG2BPurchaseOrders(params) {
  return request({
    url: '/agent/g2b/orders',
    method: 'GET',
    params
  });
}

/**
 * 12. 提交 G2B 集中采购预约单 (SCM / WMS)
 * 校验代理资质、单中心归属、中心库存及 1.2 倍安全库存上限
 */
export function createG2BPurchaseOrder(data) {
  return request({
    url: '/agent/g2b/orders',
    method: 'POST',
    data
  });
}

/**
 * 13. 线上支付 G2B 采购货款 (PAYMENT / TREASURY)
 * 货款入政府财政/贸易专管账户，自动触发 WMS 出库排期并下发提货凭证与短信
 */
export function payG2BPurchaseOrder(orderNo, data) {
  return request({
    url: `/agent/g2b/orders/${orderNo}/pay`,
    method: 'POST',
    data
  });
}

/**
 * 14. 查询 B2C 社区分时零售预约单 (B2C / SCM)
 */
export function getB2CReservations(params) {
  return request({
    url: '/agent/b2c/reservations',
    method: 'GET',
    params
  });
}

/**
 * 15. 代理端分时到店核销发货 (B2C / V5 交付校验)
 * 支持扫公民动态码或读卡，校验时段容差(±30分钟)，扣减本地现货库存
 */
export function verifyAndRedeemReservation(data) {
  return request({
    url: '/agent/b2c/reservations/verify-redeem',
    method: 'POST',
    data
  });
}

/**
 * 16. 查询各时段接待容量与排期监控看板 (CAPACITY)
 */
export function getAgentTimeSlots(agentId, date) {
  return request({
    url: '/agent/time-slots',
    method: 'GET',
    params: { agentId, date }
  });
}

/**
 * 17. 查询代理端实物库存与 G2B 进货 vs B2C 销售账实双向自核台账 (RECONCILIATION)
 */
export function getAgentLocalStocks(agentId) {
  return request({
    url: '/agent/local-stocks',
    method: 'GET',
    params: { agentId }
  });
}

/**
 * 18. 本地库存实物盘点与损耗报损申报 (INVENTORY)
 */
export function submitStockInventory(data) {
  return request({
    url: '/agent/local-stocks/inventory',
    method: 'POST',
    data
  });
}

/**
 * 19. 多维流转与审计追溯穿透倒查 (TRACE)
 * 支持批次号 BatchNo、订单号 OrderNo、身份证号 NationalID 双向倒查
 */
export function traceFullPipeline(keyword) {
  return request({
    url: '/agent/trace/pipeline',
    method: 'GET',
    params: { keyword }
  });
}

/**
 * 20. 代理网格 1500 户户籍硬上限校验 (V1 约束引擎)
 */
export function checkHouseholdGridLimit(agentId) {
  return request({
    url: `/agent/grid-limit/${agentId}`,
    method: 'GET'
  });
}

/**
 * 21. 查询代理三级层级拓扑树 (省级 -> 区域级 -> 街道级) (SCM / HIERARCHY)
 */
export function getAgentHierarchyTree(params) {
  return request({
    url: '/agent/hierarchy/tree',
    method: 'GET',
    params
  });
}

/**
 * 22. 查询指定街道代理挂靠的家庭明细列表 (SCM / CITIZEN)
 * 支持 1500 户硬上限穿透核验
 */
export function getAgentFamilies(agentId, params) {
  return request({
    url: `/agent/hierarchy/${agentId}/families`,
    method: 'GET',
    params
  });
}

/**
 * 23. 代理端查询辖区公民配给购买订单列表 (GET)
 * 支撑查看自提/送货上门订单明细、履约状态及物资摘要
 */
export function getAgentCitizenOrders(params) {
  return request({
    url: '/agent/citizen-orders',
    method: 'GET',
    params
  });
}

/**
 * 24. 代理端安排配送或标记备货就绪 (POST)
 * 针对送货上门分配派送员和车辆出车，针对到店自提标记网点备货就绪
 */
export function dispatchCitizenOrder(orderId, data) {
  return request({
    url: `/agent/citizen-orders/${orderId}/dispatch`,
    method: 'POST',
    data
  });
}

/**
 * 25. 代理端根据提货二维码/提货码检索待交付订单 (GET)
 * 支撑扫码枪识别或手动录入提货码检索
 */
export function lookupCitizenOrderByCode(code) {
  return request({
    url: '/agent/citizen-orders/lookup',
    method: 'GET',
    params: { code }
  });
}

/**
 * 26. 代理端核验扫码提货并完成物资交接扣减库存 (POST)
 * 阶段 4 核心：核验公民身份与二维码，扣减本地网点实物库存，生成交接凭证
 */
export function verifyAndClaimCitizenOrder(orderId, data) {
  return request({
    url: `/agent/citizen-orders/${orderId}/verify-claim`,
    method: 'POST',
    data
  });
}

