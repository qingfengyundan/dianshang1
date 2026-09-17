import apiClient from './api';

export type MerchantAccountRole = 'merchant_admin' | 'merchant_user';

export interface MerchantAccount {
  id: number;
  tenantId: number;
  username: string;
  role: MerchantAccountRole;
  permissions: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface CreateMerchantAccountInput {
  tenantId: number;
  username: string;
  password: string;
  role: MerchantAccountRole;
}

function toMessage(error: any, fallback: string): Error {
  const detail = error?.response?.data?.message;
  return new Error(Array.isArray(detail) ? detail.join('；') : detail || fallback);
}

class MerchantAccountService {
  async list(tenantId: number): Promise<MerchantAccount[]> {
    try {
      return await apiClient.get<never, MerchantAccount[]>('/merchant-accounts', { params: { tenantId } });
    } catch (error) {
      throw toMessage(error, '获取商户账号失败');
    }
  }

  async create(input: CreateMerchantAccountInput): Promise<MerchantAccount> {
    try {
      return await apiClient.post<never, MerchantAccount>('/merchant-accounts', input);
    } catch (error) {
      throw toMessage(error, '创建商户账号失败');
    }
  }

  async updateStatus(id: number, isActive: boolean): Promise<MerchantAccount> {
    try {
      return await apiClient.put<never, MerchantAccount>(`/merchant-accounts/${id}/status`, { isActive });
    } catch (error) {
      throw toMessage(error, '更新账号状态失败');
    }
  }

  async resetPassword(id: number, password: string): Promise<void> {
    try {
      await apiClient.put<never, { message: string }>(`/merchant-accounts/${id}/password`, { password });
    } catch (error) {
      throw toMessage(error, '重置密码失败');
    }
  }
}

export const merchantAccountService = new MerchantAccountService();
