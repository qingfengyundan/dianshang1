import axios from 'axios';
import { API_BASE_URL, API_PREFIX, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 错误 - Token 过期
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 尝试刷新 Token
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          // TODO: 实现 refresh token 逻辑
          // const { accessToken } = await refreshAccessToken(refreshToken);
          // localStorage.setItem(TOKEN_KEY, accessToken);
          // return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh 失败，清除 Token 并跳转到登录页
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // 没有 refresh token，直接跳转登录
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
