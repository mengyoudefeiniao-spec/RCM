import { request } from './client.js';

/**
 * 用户统一身份认证与登录 (POST)
 * 对应后端 Auth 微服务及 Spring Cloud Gateway 鉴权签发
 */
export function loginUser(data) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  });
}

/**
 * 获取当前登录人员资料 (GET)
 */
export function getUserProfile() {
  return request({
    url: '/auth/profile',
    method: 'GET'
  });
}

/**
 * 登出与吊销 Token (POST)
 */
export function logoutUser() {
  return request({
    url: '/auth/logout',
    method: 'POST'
  });
}

/**
 * 纸质配给卡 / 旧版电子配给卡 OCR 智能扫描识别 (POST)
 * 提取旧版卡片中的卡号、户主姓名、省份、人数等核心存根
 */
export function ocrScanPaperCard(data = {}) {
  return request({
    url: '/auth/ocr-paper-card',
    method: 'POST',
    data
  });
}

/**
 * 短信验证码找回并重置公民登录密码 (POST)
 */
export function resetCitizenPassword(data) {
  return request({
    url: '/auth/reset-password',
    method: 'POST',
    data
  });
}

/**
 * 发送手机短信验证码 (POST)
 */
export function sendSmsCode(data) {
  return request({
    url: '/auth/send-sms',
    method: 'POST',
    data
  });
}

/**
 * 单独校验手机短信验证码 (POST)
 * 注册与找回密码流程先校验验证码，通过后再让用户设置密码，
 * 避免密码输入错误导致重复接收短信验证码。
 */
export function verifySmsCode(data) {
  return request({
    url: '/auth/verify-sms',
    method: 'POST',
    data
  });
}

/**
 * 户主联系电话变更前的活体/人脸比对凭据校验 (POST)
 */
export function verifyMemberPhoneFace(data) {
  return request({
    url: '/auth/verify-member-phone-face',
    method: 'POST',
    data
  });
}

/**
 * 纸质卡升级换发与公民账号注册 (POST)
 */
export function registerCitizen(data) {
  return request({
    url: '/auth/register-citizen',
    method: 'POST',
    data
  });
}

/**
 * 代理注册：校验 Company Branch 与 Agent NO 是否匹配代理名录 (POST)
 */
export function verifyAgentCredentials(data) {
  return request({
    url: '/auth/agent/verify-credentials',
    method: 'POST',
    data
  });
}

/**
 * 代理注册：读取国民身份证芯片（演示环境为模拟读取） (POST)
 */
export function readAgentRegistrationIdentity(data) {
  return request({
    url: '/auth/agent/read-identity',
    method: 'POST',
    data
  });
}

/**
 * 代理账户注册 (POST)
 */
export function registerAgent(data) {
  return request({
    url: '/auth/register-agent',
    method: 'POST',
    data
  });
}

/**
 * 代理登录：读取国民身份证芯片 (POST)
 */
export function readAgentLoginIdentity(data) {
  return request({
    url: '/auth/agent-login/read-identity',
    method: 'POST',
    data
  });
}

/**
 * 代理登录：完成人脸活体核验并签发会话 (POST)
 */
export function completeAgentLoginVerification(data) {
  return request({
    url: '/auth/agent-login/verify',
    method: 'POST',
    data
  });
}

/**
 * 活体人脸识别与统一国民卡双因子核验 (POST)
 */
export function verifyBiometricFace(data) {
  return request({
    url: '/auth/verify-biometric',
    method: 'POST',
    data
  });
}

export function readFirstLoginIdentity(data) {
  return request({ url: '/auth/first-login/read-identity', method: 'POST', data });
}

export function completeFirstLoginVerification(data) {
  return request({ url: '/auth/first-login/verify', method: 'POST', data });
}

export function readMemberIdentity(data) {
  return request({ url: '/auth/member-verification/read-identity', method: 'POST', data });
}

export function completeMemberVerification(data) {
  return request({ url: '/auth/member-verification/verify', method: 'POST', data });
}

/**
 * 记录指定家庭成员的远程核验申请 (POST)
 */
export function verifyRemoteMember(data) {
  return request({
    url: '/auth/verify-remote',
    method: 'POST',
    data
  });
}
