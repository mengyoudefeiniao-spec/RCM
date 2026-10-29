import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { i18n } from '../locales/index.js';

// 创建统一的 Axios 实例
const client = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求取消控制器管理映射表（避免重复提交）
const pendingMap = new Map();

const getPendingKey = (config) => {
  return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&');
};

const addPending = (config) => {
  const key = getPendingKey(config);
  if (!config.cancelToken && !config.signal) {
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingMap.set(key, controller);
  }
};

const removePending = (config) => {
  const key = getPendingKey(config);
  if (pendingMap.has(key)) {
    pendingMap.delete(key);
  }
};

// 1. 请求拦截器：注入 Token 与取消令牌管理
client.interceptors.request.use(
  (config) => {
    removePending(config);
    addPending(config);

    // 从 localStorage 读取统一鉴权 Token（对应 Spring Cloud Gateway 校验标准）
    const token = localStorage.getItem('rcm_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 注入当前业务语言请求头 (国际化网关标准)
    const lang = i18n.global.locale.value;
    config.headers['Accept-Language'] = lang;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. 响应拦截器：统一解包 Response Wrapper 与错误分流
client.interceptors.response.use(
  (response) => {
    removePending(response.config);

    // 标准契约响应体：{ code: 200, message: 'success', data: {} }
    const res = response.data;

    // 如果返回的是二进制流文件，直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return res;
    }

    // 业务状态码 200 为成功
    if (res.code === 200) {
      return res.data;
    }

    // 401 凭证过期或未授权：统一清理凭据并重定向登录
    if (res.code === 401) {
      ElMessage.error(res.message || i18n.global.t('api.sessionExpired'));
      localStorage.removeItem('rcm_auth_token');
      localStorage.removeItem('rcm_user_profile');
      window.location.hash = '#/login';
      return Promise.reject(new Error(res.message || 'Unauthorized'));
    }

    // Keep the first-login ID instructions visible until the user dismisses them.
    if (res.code === 428 && response.config.url === '/auth/login') {
      ElMessageBox.alert(res.message || i18n.global.t('registrationFlow.firstLoginUnavailable'), i18n.global.t('registrationFlow.firstLoginTitle')).catch(() => {});
      return Promise.reject(new Error(res.message || 'Identity verification required'));
    }

    // 其它业务异常：统一弹出 Element Plus 提示
    ElMessage.error(res.message || i18n.global.t('api.businessError'));
    return Promise.reject(new Error(res.message || 'Business Error'));
  },
  (error) => {
    if (error.config) {
      removePending(error.config);
    }

    // 如果是被主动取消的请求，不重复报错
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      return Promise.reject(error);
    }

    let errorMessage = i18n.global.t('api.networkError');
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        errorMessage = i18n.global.t('api.unauthorized');
        localStorage.removeItem('rcm_auth_token');
        localStorage.removeItem('rcm_user_profile');
        window.location.hash = '#/login';
      } else if (status === 403) {
        errorMessage = i18n.global.t('api.forbidden');
      } else if (status === 404) {
        errorMessage = i18n.global.t('api.notFound');
      } else if (status >= 500) {
        errorMessage = i18n.global.t('api.serverError');
      }
    } else if (error.message.includes('timeout')) {
      errorMessage = i18n.global.t('api.timeout');
    }

    ElMessage.error(errorMessage);
    return Promise.reject(error);
  }
);

// 暴露统一 RESTful 请求抽象方法
export function request(config) {
  return client(config);
}

// 注入独立 Mock 适配器（根据 VITE_APP_MOCK_MODE 开关动态挂载）
import { setupMock } from '../mock/index.js';
setupMock(client);

export default client;
