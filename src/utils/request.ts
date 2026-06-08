import axios, { AxiosHeaders } from 'axios';

import type { ApiEnvelope, HttpClient } from '@/src/types/api';
import { resolveApiBaseUrl } from '@/src/utils/api-base-url';
import { notifyAuthExpired } from '@/src/utils/auth-events';
import { tokenStorage } from '@/src/utils/token-storage';

export const API_BASE_URL = resolveApiBaseUrl();

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

service.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();

    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('token', token);
      config.headers = headers;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

service.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown>;
    const code = String(payload?.code ?? response.status);

    if (code === '200') {
      return payload.data as typeof response;
    }

    const message = payload?.msg || payload?.message || '请求失败';

    if (code === '-1') {
      tokenStorage.removeToken();
      notifyAuthExpired(message);
    }

    return Promise.reject(new Error(message));
  },
  (error: unknown) => {
    if (axios.isAxiosError(error) && !error.response) {
      const isWebProxy = process.env.EXPO_OS === 'web' && API_BASE_URL.includes(':5174/api');
      const hint = isWebProxy ? '请先启动 AMHA_Final 的 5174 端口作为本地 API 代理。' : '请检查后端服务或当前网络。';

      return Promise.reject(new Error(`网络连接失败：无法访问 ${API_BASE_URL}。${hint}`));
    }

    return Promise.reject(error);
  },
);

export default service as HttpClient;
