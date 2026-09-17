import apiClient from './api';

/** 与后端 Tenant（Prisma 模型）返回结构一致的租户对象 */
export interface Tenant {
  id: number;
  name: string;
  displayName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  config: Record<string, any> | null;
  isActive: boolean;
  planType: string | null;
  planExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  name: string;
  displayName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  planType?: string;
  isActive?: boolean;
}

export interface UpdateTenantInput {
  name?: string;
  displayName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  planType?: string;
  isActive?: boolean;
}

/** 从 axios 错误中提取后端返回的中文提示 */
function toMessage(error: any, fallback: string): Error {
  const detail = error?.response?.data?.message;
  return new Error(Array.isArray(detail) ? detail.join('；') : detail || fallback);
}

class TenantService {
  async list(includeInactive = false): Promise<Tenant[]> {
    try {
      return await apiClient.get<never, Tenant[]>('/tenants', {
        params: { includeInactive },
      });
    } catch (error) {
      throw toMessage(error, '获取商户列表失败');
    }
  }

  async create(input: CreateTenantInput): Promise<Tenant> {
    try {
      return await apiClient.post<never, Tenant>('/tenants', input);
    } catch (error) {
      throw toMessage(error, '新增商户失败');
    }
  }

  async update(id: number, input: UpdateTenantInput): Promise<Tenant> {
    try {
      return await apiClient.put<never, Tenant>(`/tenants/${id}`, input);
    } catch (error) {
      throw toMessage(error, '更新商户失败');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete<never, { message: string }>(`/tenants/${id}`);
    } catch (error) {
      throw toMessage(error, '停用商户失败');
    }
  }
}

export const tenantService = new TenantService();
