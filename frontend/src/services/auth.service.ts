import apiClient from './api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '../constants';
import type { LoginRequest, LoginResponse, User } from '../../../shared/types';

export const authService = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<any, LoginResponse>('/auth/login', data);

    // 保存 Token 和用户信息
    if (response.accessToken) {
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * 用户注册
   */
  async register(data: {
    username: string;
    password: string;
    role: string;
    tenantId?: number;
  }): Promise<User> {
    return apiClient.post('/auth/register', data);
  },

  /**
   * 获取当前用户信息
   */
  async getProfile(): Promise<User> {
    return apiClient.get('/auth/profile');
  },

  /**
   * 退出登录
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    window.location.href = '/login';
  },

  /**
   * 获取本地存储的用户信息
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_INFO_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
