import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpsertAiConfigDto } from './dto/ai-config.dto.js';
import { AiConfig } from '@prisma/client';

/** 对外暴露的 AI 配置（脱敏，不含明文 apiKey） */
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

/** 运行时使用的明文配置 */
export interface ResolvedAiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/** 脱敏 apiKey：前 4 位 + … + 后 4 位，长度不足则整体隐藏 */
function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '••••••••';
  return `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`;
}

function toSafe(config: AiConfig): SafeAiConfig {
  return {
    id: config.id,
    tenantId: config.tenantId,
    baseUrl: config.baseUrl,
    model: config.model,
    isActive: config.isActive,
    hasApiKey: !!config.apiKey,
    apiKeyMasked: maskApiKey(config.apiKey),
    updatedAt: config.updatedAt.toISOString(),
  };
}

@Injectable()
export class AiConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /** 全局默认配置（tenantId = null） */
  async getGlobal(): Promise<SafeAiConfig | null> {
    const config = await this.prisma.aiConfig.findFirst({
      where: { tenantId: null },
    });
    return config ? toSafe(config) : null;
  }

  async upsertGlobal(dto: UpsertAiConfigDto): Promise<SafeAiConfig> {
    const existing = await this.prisma.aiConfig.findFirst({
      where: { tenantId: null },
    });

    const data = {
      baseUrl: dto.baseUrl,
      apiKey: dto.apiKey,
      model: dto.model,
      isActive: dto.isActive ?? true,
    };

    const config = existing
      ? await this.prisma.aiConfig.update({ where: { id: existing.id }, data })
      : await this.prisma.aiConfig.create({ data: { ...data, tenantId: null } });

    return toSafe(config);
  }

  /** 租户覆盖配置 */
  async getByTenant(tenantId: number): Promise<SafeAiConfig | null> {
    const config = await this.prisma.aiConfig.findUnique({
      where: { tenantId },
    });
    return config ? toSafe(config) : null;
  }

  async upsertTenant(tenantId: number, dto: UpsertAiConfigDto): Promise<SafeAiConfig> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('商户不存在');
    }

    const config = await this.prisma.aiConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        baseUrl: dto.baseUrl,
        apiKey: dto.apiKey,
        model: dto.model,
        isActive: dto.isActive ?? true,
      },
      update: {
        baseUrl: dto.baseUrl,
        apiKey: dto.apiKey,
        model: dto.model,
        isActive: dto.isActive ?? true,
      },
    });
    return toSafe(config);
  }

  /** 删除租户覆盖，回退到全局默认 */
  async removeTenant(tenantId: number): Promise<void> {
    await this.prisma.aiConfig.deleteMany({ where: { tenantId } });
  }

  /**
   * 解析运行时配置：租户覆盖（启用）→ 全局默认（启用）→ .env 兜底
   * 返回 null 表示无任何可用配置
   */
  async resolve(tenantId?: number): Promise<ResolvedAiConfig | null> {
    if (tenantId) {
      const tenantConfig = await this.prisma.aiConfig.findUnique({ where: { tenantId } });
      if (tenantConfig && tenantConfig.isActive && tenantConfig.apiKey) {
        return {
          baseUrl: tenantConfig.baseUrl,
          apiKey: tenantConfig.apiKey,
          model: tenantConfig.model,
        };
      }
    }

    const global = await this.prisma.aiConfig.findFirst({ where: { tenantId: null } });
    if (global && global.isActive && global.apiKey) {
      return {
        baseUrl: global.baseUrl,
        apiKey: global.apiKey,
        model: global.model,
      };
    }

    // .env 兜底
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey && envKey !== 'your-openai-api-key-here') {
      return {
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: envKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      };
    }

    return null;
  }
}
