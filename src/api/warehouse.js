import { request } from './client.js';

/**
 * 仓储管理 (SCM) 与配给代理微服务 API 集合
 * 契合 Spring Cloud 分布式微服务架构:
 * - Gateway: 统一请求路由、Token 校验与未授权重定向至 Auth 认证
 * - Auth: 用户身份凭据发放、Token 鉴权与校验
 * - Common: 全局数据契约、枚举常数与异常规范
 * - SCM: 仓储作业核心、多维六维库存、在途锁定、配送核验与流水台账
 * - BPM: 贸易部配给总计划审批、高风险操作双人签批流 (大额报损/盘亏调整)
 * - UNICODE: 全局唯一一物一码 (箱码)、交付校验码、防伪数字凭证与全链路溯源引擎
 */

// ========================================================
// 模块一：配给计划管理模块 (SCM / BPM)
// ========================================================

/**
 * 1.1 查询贸易部物资配给总计划列表
 */
export function getRationPlanList(params) {
  return request({
    url: '/warehouse/ration-plans',
    method: 'GET',
    params
  });
}

/**
 * 1.2 制定并下发新的宏观物资配给总计划 (对接贸易部 BPM)
 */
export function createRationPlan(data) {
  return request({
    url: '/warehouse/ration-plans',
    method: 'POST',
    data
  });
}

/**
 * 1.3 查询代理网点配额分解与排程配送任务单 (联动“我的代理中心列表”)
 */
export function getAgentAllocationTasks(params) {
  return request({
    url: '/warehouse/agent-tasks',
    method: 'GET',
    params
  });
}

/**
 * 1.4 手动/自动将宏观计划分解排程至“我的代理中心列表”各网点
 */
export function decomposePlanToAgents(data) {
  return request({
    url: '/warehouse/agent-tasks/decompose',
    method: 'POST',
    data
  });
}

// ========================================================
// 模块二：仓储作业核心模块 (SCM / UNICODE / BPM)
// ========================================================

/**
 * 2.1 查询采购收货与质检入库单列表
 */
export function getInboundOrders(params) {
  return request({
    url: '/warehouse/inbound-orders',
    method: 'GET',
    params
  });
}

/**
 * 2.2 提交采购收货与质检入库申请 (强制 P1 校验: 贸易部计划编号、生产日期与效期批次、一物一码建档与货位绑定)
 */
export function submitInboundOrder(data) {
  return request({
    url: '/warehouse/inbound-orders',
    method: 'POST',
    data
  });
}

/**
 * 2.3 查询配给配送出库波次拣选单列表
 */
export function getOutboundOrders(params) {
  return request({
    url: '/warehouse/outbound-orders',
    method: 'GET',
    params
  });
}

/**
 * 2.4 创建出库波次并复核发运 (遵循 FIFO / 效期优先，强制 P2 校验: 生成唯一交付流水号，库位可用库存转在途锁定)
 */
export function createOutboundWave(data) {
  return request({
    url: '/warehouse/outbound-orders/wave',
    method: 'POST',
    data
  });
}

/**
 * 2.5 查询跨库调拨流水单列表 (中心仓向区域前置仓三段式)
 */
export function getTransferOrders(params) {
  return request({
    url: '/warehouse/transfer-orders',
    method: 'GET',
    params
  });
}

/**
 * 2.6 创建新的跨库调拨计划
 */
export function createTransferOrder(data) {
  return request({
    url: '/warehouse/transfer-orders',
    method: 'POST',
    data
  });
}

/**
 * 2.7 推进调拨单流转阶段 (阶段1调出出库 -> 阶段2在途管理 -> 阶段3调入验收)
 */
export function advanceTransferStage(transferId, data) {
  return request({
    url: `/warehouse/transfer-orders/${transferId}/advance`,
    method: 'POST',
    data
  });
}

/**
 * 2.8 查询全流程盘点记录 (周期盘点、盲盘、动销盘点)
 */
export function getStocktakeRecords(params) {
  return request({
    url: '/warehouse/stocktakes',
    method: 'GET',
    params
  });
}

/**
 * 2.9 提交盘点录入 (生成盈亏差异报告，严禁直接冲抵，需双人签批)
 */
export function submitStocktake(data) {
  return request({
    url: '/warehouse/stocktakes',
    method: 'POST',
    data
  });
}

/**
 * 2.10 查询报损与报溢记录明细
 */
export function getLossRecords(params) {
  return request({
    url: '/warehouse/loss-records',
    method: 'GET',
    params
  });
}

/**
 * 2.11 登记报损与报溢申请 (强制录入损耗原因并绑定现场存证影像)
 */
export function submitLossRecord(data) {
  return request({
    url: '/warehouse/loss-records',
    method: 'POST',
    data
  });
}

// ========================================================
// 模块三：多维库存与流水台账模块 (SCM)
// ========================================================

/**
 * 3.1 查询六维实时多维库存视图 (物理仓库 - 货架货位 - 物资分类 - 生产批次 - 效期状态 - 业务状态)
 */
export function getWarehouseStockList(params) {
  return request({
    url: '/warehouse/stocks',
    method: 'GET',
    params
  });
}

/**
 * 3.2 查询流水台账中心完整明细 (“单据 - 流水 - 库位余额”三级钩稽)
 */
export function getInventoryLedgers(params) {
  return request({
    url: '/warehouse/ledgers',
    method: 'GET',
    params
  });
}

/**
 * 3.3 任意历史时间点库存快照回溯查询
 */
export function getInventorySnapshot(params) {
  return request({
    url: '/warehouse/stocks/snapshot',
    method: 'GET',
    params
  });
}

// ========================================================
// 模块四：代理配送与交付核对模块 (SCM)
// ========================================================

/**
 * 4.1 查询配送在途实时追踪监控与时效链路
 */
export function getDeliveryTrackings(params) {
  return request({
    url: '/warehouse/delivery-trackings',
    method: 'GET',
    params
  });
}

/**
 * 4.2 查询代理网点签收记录与对账明细
 */
export function getAgentReceipts(params) {
  return request({
    url: '/warehouse/agent-receipts',
    method: 'GET',
    params
  });
}

/**
 * 4.3 代理网点终端扫码核收录入 (强制 P3 校验: 签收数量 ≠ 交付流水时触发在途差异报警、锁定差额阻断流转并派发核查工单)
 */
export function submitAgentReceipt(data) {
  return request({
    url: '/warehouse/agent-receipts',
    method: 'POST',
    data
  });
}

/**
 * 4.3.1 公民/代理扫码确认签收配送单并更新状态为已签收
 */
export function confirmDeliveryReceipt(flowNo, data) {
  return request({
    url: `/warehouse/delivery-trackings/${flowNo}/confirm-receipt`,
    method: 'POST',
    data
  });
}

/**
 * 4.4 查询在途损耗/短缺差异核查工单
 */
export function getDiscrepancyTickets(params) {
  return request({
    url: '/warehouse/discrepancy-tickets',
    method: 'GET',
    params
  });
}

/**
 * 4.5 协同处理差异核查工单
 */
export function resolveDiscrepancyTicket(ticketId, data) {
  return request({
    url: `/warehouse/discrepancy-tickets/${ticketId}/resolve`,
    method: 'POST',
    data
  });
}

// ========================================================
// 模块五：末端配给与家庭核销模块 (SCM / UNICODE)
// ========================================================

/**
 * 5.1 智能读卡与公民配给资格及可用份额核验 (支持数字卡号/纸质卡号)
 */
export function verifyCitizenCardAndQuota(params) {
  return request({
    url: '/warehouse/citizen-claim/verify',
    method: 'GET',
    params
  });
}

/**
 * 5.2 提交配额核销与即时交付 (强制 P4 校验: 事务原子性、防跨期重领超额申领、秒级双向同步回写云端主账本)
 */
export function claimCitizenRation(data) {
  return request({
    url: '/warehouse/citizen-claim/claim',
    method: 'POST',
    data
  });
}

/**
 * 5.3 查询末端配给核销流水单与凭据记录
 */
export function getCitizenClaimRecords(params) {
  return request({
    url: '/warehouse/citizen-claim/records',
    method: 'GET',
    params
  });
}

// ========================================================
// 模块六：全链路溯源与报表分析模块 (UNICODE / SCM)
// ========================================================

/**
 * 6.1 “仓库到家庭”端到端溯源引擎 (正向追溯 / 反向倒查)
 */
export function getTraceChain(params) {
  return request({
    url: '/warehouse/traceability/chain',
    method: 'GET',
    params
  });
}

/**
 * 6.2 查询多维切片流转报表 (按行政区域、网点、仓库、品类下钻)
 */
export function getWarehouseAnalyticsReport(params) {
  return request({
    url: '/warehouse/analytics/reports',
    method: 'GET',
    params
  });
}

/**
 * 6.3 查询损耗与差异审计分析指标 (仓储存储损耗、运输损耗、代理交付损耗三节点比对)
 */
export function getLossAuditStats(params) {
  return request({
    url: '/warehouse/analytics/loss-stats',
    method: 'GET',
    params
  });
}

// ========================================================
// 模块七：安全审计模块 (BPM / GATEWAY)
// ========================================================

/**
 * 7.1 查询操作审计不可篡改日志
 */
export function getAuditLogs(params) {
  return request({
    url: '/warehouse/security/audit-logs',
    method: 'GET',
    params
  });
}

/**
 * 7.2 提交高风险关键操作双人复核审批 (强制 P5 校验: 报损/盘亏调整双人签批)
 */
export function submitDoubleApproval(data) {
  return request({
    url: '/warehouse/security/double-approval',
    method: 'POST',
    data
  });
}

// ========================================================
// 核心验证标准 P1 ~ P5 阶段规则实体验证
// ========================================================

/**
 * 获取 P1 ~ P5 阶段验证规则列表与当前系统合规态
 */
export function getPhaseValidationRules() {
  return request({
    url: '/warehouse/verification/rules',
    method: 'GET'
  });
}

/**
 * 运行特定阶段规则的仿真测试与合规性自测
 */
export function runPhaseRuleValidation(ruleCode, testPayload) {
  return request({
    url: `/warehouse/verification/rules/${ruleCode}/test`,
    method: 'POST',
    data: testPayload
  });
}
