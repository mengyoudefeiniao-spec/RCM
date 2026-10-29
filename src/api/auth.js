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
 * 纸质配给卡 OCR 智能扫描识别 (POST)
 * 提取旧版纸卡中的卡号、户主姓名、省份、人数等核心存根
 */
export function ocrScanPaperCard(data = {}) {
  return request({
    url: '/auth/ocr-paper-card',
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
