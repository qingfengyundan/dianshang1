import apiClient from './api';

/** 与后端 sanitizeShop 返回结构一致的店铺对象（凭证字段已在后端剥离） */
export interface Shop {
  id: number;
  tenantId: number;
  name: string;
  platform: string;
  shopUrl: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShopInput {
  name: string;
  platform: string;
  shopUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
}

export interface UpdateShopInput {
  name?: string;
  platform?: string;
  shopUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  isActive?: boolean;
}

/** 从 axios 错误中提取后端返回的中文提示 */
function toMessage(error: any, fallback: string): Error {
  const detail = error?.response?.data?.message;
  return new Error(Array.isArray(detail) ? detail.join('；') : detail || fallback);
}

class ShopService {
  /** 获取当前租户的所有店铺 */
  async list(): Promise<Shop[]> {
    try {
      return await apiClient.get<never, Shop[]>('/shops');
    } catch (error) {
      throw toMessage(error, '获取店铺列表失败');
    }
  }

  /** 新增店铺 */
  async create(input: CreateShopInput): Promise<Shop> {
    try {
      return await apiClient.post<never, Shop>('/shops', input);
    } catch (error) {
      throw toMessage(error, '新增店铺失败');
    }
  }

  /** 更新店铺（含启用/停用） */
  async update(id: number, input: UpdateShopInput): Promise<Shop> {
    try {
      return await apiClient.put<never, Shop>(`/shops/${id}`, input);
    } catch (error) {
      throw toMessage(error, '更新店铺失败');
    }
  }

  /** 停用店铺（软删除） */
  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete<never, { message: string }>(`/shops/${id}`);
    } catch (error) {
      throw toMessage(error, '停用店铺失败');
    }
  }
}

export const shopService = new ShopService();
