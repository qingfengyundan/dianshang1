import apiClient from './api';

/** 与后端 SafeAiConfig 返回结构一致（apiKey 已脱敏） */
export interface SafeAiConfig {
  id: number;
  tenantId: number | null;
  baseUrl: string;
  model: string;
  isActive: boolean;
  hasApiKey: boolean;
  apiKeyMasked: string;
  updatedAt: string;
}

export interface UpsertAiConfigInput {
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive?: boolean;
}

interface AiConfigResponse {
  success: boolean;
  data: SafeAiConfig | null;
  message?: string;
}

/** 从 axios 错误中提取后端返回的中文提示 */
function toMessage(error: any, fallback: string): Error {
  const detail = error?.response?.data?.message;
  return new Error(Array.isArray(detail) ? detail.join('；') : detail || fallback);
}

class AiConfigService {
  async getGlobal(): Promise<SafeAiConfig | null> {
    try {
      const res = await apiClient.get<never, AiConfigResponse>('/ai-config/global');
      return res.data;
    } catch (error) {
      throw toMessage(error, '获取 AI 配置失败');
    }
  }

  async saveGlobal(input: UpsertAiConfigInput): Promise<SafeAiConfig> {
    try {
      const res = await apiClient.put<never, AiConfigResponse>('/ai-config/global', input);
      return res.data!;
    } catch (error) {
      throw toMessage(error, '保存 AI 配置失败');
    }
  }

  async getTenant(tenantId: number): Promise<SafeAiConfig | null> {
    try {
      const res = await apiClient.get<never, AiConfigResponse>(`/ai-config/tenant/${tenantId}`);
      return res.data;
    } catch (error) {
      throw toMessage(error, '获取商户 AI 配置失败');
    }
  }

  async saveTenant(tenantId: number, input: UpsertAiConfigInput): Promise<SafeAiConfig> {
    try {
      const res = await apiClient.put<never, AiConfigResponse>(
        `/ai-config/tenant/${tenantId}`,
        input,
      );
      return res.data!;
    } catch (error) {
      throw toMessage(error, '保存商户 AI 配置失败');
    }
  }

  async removeTenant(tenantId: number): Promise<void> {
    try {
      await apiClient.delete<never, { success: boolean; message: string }>(
        `/ai-config/tenant/${tenantId}`,
      );
    } catch (error) {
      throw toMessage(error, '移除商户 AI 配置失败');
    }
  }
}

export const aiConfigService = new AiConfigService();
