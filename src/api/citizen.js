import { request } from './client.js';

export function submitMemberDeregistration(fields, file) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.append(key, String(value)));
  data.append('deathProof', file);
  return request({ url: '/citizen/member-deregistration', method: 'POST', data, headers: { 'Content-Type': 'multipart/form-data' } });
}

/**
 * 人员特殊状态登记：附证明材料提交电子审核工单 (POST, multipart)
 */
export function submitMemberUpdateReview(fields, proofFile) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (Array.isArray(value)) data.append(key, value.join(','));
    else data.append(key, String(value ?? ''));
  });
  data.append('proof', proofFile);
  return request({ url: '/citizen/member-update-review', method: 'POST', data, headers: { 'Content-Type': 'multipart/form-data' } });
}

/**
 * 分页与条件查询家庭配给卡档案列表 (GET)
 */
export function getFamilyList(params) {
  return request({
    url: '/citizen/families',
    method: 'GET',
    params
  });
}

/**
 * 根据配给卡号获取单条家庭档案 (GET)
 */
export function getFamilyByCardNo(cardNo) {
  return request({
    url: `/citizen/family/${cardNo}`,
    method: 'GET'
  });
}

/**
 * 更新指定家庭成员信息 (PUT)
 */
export function updateMemberInfo(memberId, data) {
  return request({
    url: `/citizen/members/${memberId}`,
    method: 'PUT',
    data
  });
}

/**
 * 变更户主：原户主身故注销与替代户主任命 (POST)
 */
export function submitChangeHouseholdHead(data) {
  return request({
    url: '/citizen/change-head',
    method: 'POST',
    data
  });
}

/**
 * 申请解冻：8大类情形官方证明申报 (POST)
 */
export function submitApplyUnfreeze(data) {
  return request({
    url: '/citizen/apply-unfreeze',
    method: 'POST',
    data
  });
}

/**
 * 申请分户：优先系统智能自动判别 (POST)
 */
export function autoJudgeSplitHousehold(data) {
  return request({
    url: '/citizen/split-household/auto-judge',
    method: 'POST',
    data
  });
}

/**
 * 申请分户：判别未通过转入分部电子审核 (POST)
 */
export function submitSplitHouseholdForReview(data) {
  return request({
    url: '/citizen/split-household/submit-review',
    method: 'POST',
    data
  });
}

/**
 * 申报添加新家庭成员 (POST)
 * 校验生物特征、位置、婚姻社会关系、儿童证明、父亲生物识别及电子支付
 */
export function addFamilyMember(cardNo, data) {
  return request({
    url: `/citizen/family/${cardNo}/members`,
    method: 'POST',
    data
  });
}

/**
 * 公民注册向导：可选省份、代理机构与配给中心（多语言名称随数据返回） (GET)
 */
export function getRegistrationOptions() {
  return request({
    url: '/citizen/registration/options',
    method: 'GET'
  });
}

/**
 * 获取代理转移候选省份、分部、中心及代理网点元数据 (GET)
 */
export function getTransferOptions() {
  return request({
    url: '/citizen/transfer-agent/options',
    method: 'GET'
  });
}

/**
 * 提交配给卡代理转移申请 (POST)
 * 自动判定省内自动生效或跨省转交电子审核工作台
 */
export function submitTransferAgent(data) {
  return request({
    url: '/citizen/transfer-agent/submit',
    method: 'POST',
    data
  });
}

/**
 * 获取可转移成员演示候选池列表 (GET)
 */
export function getTransferableMemberList() {
  return request({
    url: '/citizen/member-transfer/candidates',
    method: 'GET'
  });
}

/**
 * 根据国民编号查询待转移成员档案与前置更新状态 (GET)
 */
export function queryTransferableMember(nationalId) {
  return request({
    url: `/citizen/member-transfer/query/${nationalId}`,
    method: 'GET'
  });
}

/**
 * 提交成员转移申请 (POST)
 * 涵盖妻子自动识别、子女条件与第140号决议自动/两级电子审核分流
 */
export function submitMemberTransfer(data) {
  return request({
    url: '/citizen/member-transfer/submit',
    method: 'POST',
    data
  });
}

/**
 * 公民提交购买配给品订单 (POST)
 * 选购配额物资、选择配送方式(自提/送货上门)、完成电子支付后生成订单与提货码
 */
export function purchaseRationItems(data) {
  return request({
    url: '/citizen/ration/purchase',
    method: 'POST',
    data
  });
}

/**
 * 查询公民历史购买配给记录列表 (GET)
 */
export function getCitizenPurchaseOrders(params) {
  return request({
    url: '/citizen/ration/orders',
    method: 'GET',
    params
  });
}

/**
 * 查询单个公民配给订单详情与配送进度 (GET)
 */
export function getCitizenPurchaseOrder(orderId) {
  return request({
    url: `/citizen/ration/orders/${encodeURIComponent(orderId)}`,
    method: 'GET'
  });
}

/**
 * 查询家庭当月核定配额及剩余可用配额 (GET)
 */
export function getCitizenQuotaBalance(cardNo) {
  return request({
    url: `/citizen/ration/quota-balance/${cardNo}`,
    method: 'GET'
  });
}

// 别名兼容导出
export const queryMemberForTransfer = queryTransferableMember;
export const getTransferrableMembers = getTransferableMemberList;

