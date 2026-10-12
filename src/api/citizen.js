import { request } from './client.js';

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
