import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { Shop } from '@prisma/client';

export interface CreateShopDto {
  tenantId: number;
  name: string;
  platform: string;
  shopUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  isActive?: boolean;
}

export interface UpdateShopDto {
  name?: string;
  platform?: string;
  shopUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  isActive?: boolean;
}

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async createShop(dto: CreateShopDto): Promise<Shop> {
    return this.prisma.shop.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        platform: dto.platform,
        shopUrl: dto.shopUrl,
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        accessToken: dto.accessToken,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findByTenant(tenantId: number): Promise<Shop[]> {
    return this.prisma.shop.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, tenantId?: number): Promise<Shop> {
    const shop = await this.prisma.shop.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
    });

    if (!shop) {
      throw new NotFoundException('店铺不存在');
    }

    return shop;
  }

  async update(id: number, dto: UpdateShopDto, tenantId?: number): Promise<Shop> {
    await this.findOne(id, tenantId);

    return this.prisma.shop.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, tenantId?: number): Promise<void> {
    await this.findOne(id, tenantId);
    await this.prisma.shop.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
