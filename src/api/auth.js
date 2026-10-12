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
