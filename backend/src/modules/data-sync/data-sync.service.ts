import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class DataSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: number) {
    return this.prisma.dataSync.findMany({
      where: { tenantId },
      include: { shop: { select: { id: true, name: true, platform: true } } },
      orderBy: { startedAt: 'desc' },
      take: 30,
    });
  }

  async trigger(tenantId: number, shopId?: number) {
    const shops = await this.prisma.shop.findMany({
      where: { tenantId, isActive: true, ...(shopId ? { id: shopId } : {}) },
      select: { id: true },
    });
    if (shops.length === 0) {
      throw new NotFoundException(shopId ? '店铺不存在或已停用' : '没有可同步的启用店铺');
    }

    const sync = await this.prisma.dataSync.create({
      data: { tenantId, shopId: shopId ?? null, status: 'running', source: 'mock_data' },
    });
    const recordsSynced = await this.prisma.metric.count({
      where: { tenantId, ...(shopId ? { shopId } : { shopId: { in: shops.map((shop) => shop.id) } }) },
    });
    const completedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.shop.updateMany({ where: { id: { in: shops.map((shop) => shop.id) } }, data: { lastSyncAt: completedAt } }),
      this.prisma.dataSync.update({ where: { id: sync.id }, data: { status: 'success', recordsSynced, completedAt } }),
    ]);
    return this.prisma.dataSync.findUnique({
      where: { id: sync.id },
      include: { shop: { select: { id: true, name: true, platform: true } } },
    });
  }

  async retry(tenantId: number, id: number) {
    const sync = await this.prisma.dataSync.findFirst({ where: { id, tenantId }, select: { shopId: true } });
    if (!sync) throw new NotFoundException('同步记录不存在');
    return this.trigger(tenantId, sync.shopId ?? undefined);
  }
}
