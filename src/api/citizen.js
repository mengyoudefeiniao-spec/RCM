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
