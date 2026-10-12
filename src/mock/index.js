import { mockDispatch } from './adapter.js';

/**
 * 装配独立 Mock 拦截适配器
 * @param {import('axios').AxiosInstance} axiosInstance 
 */
export function setupMock(axiosInstance) {
  const isMockMode = import.meta.env.VITE_APP_MOCK_MODE === 'true';

  if (!isMockMode) {
    console.info('[HTTP Client] 当前运行在生产级后端 API 模式 (REAL_API_MODE)，直连微服务网关。');
    return;
  }

  console.info('[HTTP Client] 已启用本地纯前端 Mock 拦截适配器 (MOCK_MODE)。');

  // 保存原有 adapter 以备兜底
  const defaultAdapter = axiosInstance.defaults.adapter;

  axiosInstance.defaults.adapter = async (config) => {
    try {
      const mockResult = await mockDispatch(config);
      return {
        data: mockResult,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: {}
      };
    } catch (err) {
      if (typeof defaultAdapter === 'function') {
        return defaultAdapter(config);
      }
      throw err;
    }
  };
}
