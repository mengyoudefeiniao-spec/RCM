import { request } from './client.js';

export const getMyProfile = () => request({ url: '/me/profile', method: 'GET' });
export const updateMyProfile = (data) => request({ url: '/me/profile', method: 'PUT', data });
export const changeMyPassword = (data) => request({ url: '/me/password', method: 'POST', data });
export const sendMyPasswordCode = () => request({ url: '/me/password/sms', method: 'POST' });
export const verifyMyPhoneFace = (data) => request({ url: '/me/phone/face', method: 'POST', data });

export const getMyNotifications = () => request({ url: '/me/notifications', method: 'GET' });
export const markMyNotificationsRead = (ids) => request({
  url: '/me/notifications/read', method: 'POST', data: { ids }
});
export const uploadMySupplement = (id, file) => {
  const data = new FormData();
  data.append('file', file);
  return request({ url: `/me/notifications/${encodeURIComponent(id)}/materials`, method: 'POST', data, headers: { 'Content-Type': 'multipart/form-data' } });
};
export const registerMyPushSubscription = (data) => request({ url: '/me/push-subscription', method: 'POST', data });

export const getMyCouriers = () => request({ url: '/me/couriers', method: 'GET' });
export const createMyCourier = (data) => request({ url: '/me/couriers', method: 'POST', data });
export const updateMyCourier = (id, data) => request({ url: `/me/couriers/${encodeURIComponent(id)}`, method: 'PUT', data });
export const deleteMyCourier = (id) => request({ url: `/me/couriers/${encodeURIComponent(id)}`, method: 'DELETE' });

// 受信设备列表：查询当前账号已登录设备，删除前需手机号或人脸验证
export const getMyDevices = () => request({ url: '/me/devices', method: 'GET' });
export const sendMyDeviceCode = () => request({ url: '/me/devices/sms', method: 'POST' });
export const verifyMyDeviceFace = (data) => request({ url: '/me/devices/face', method: 'POST', data });
export const deleteMyDevice = (id, data) => request({ url: `/me/devices/${encodeURIComponent(id)}`, method: 'DELETE', data });
