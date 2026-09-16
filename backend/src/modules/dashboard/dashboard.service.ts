import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface MetricsSummary {
  totalGmv: number;
  totalOrders: number;
  avgConversionRate: number;
  avgUv: number;
  shopCount: number;
  shopBreakdown: ShopMetrics[];
  dailyTrend: DailyMetric[];
  gmvGrowth: number;
  ordersGrowth: number;
}

export interface ShopMetrics {
  shopId: number;
  shopName: string;
  platform: string;
  gmv: number;
  orders: number;
  uv: number;
  conversionRate: number;
  gmvShare: number;
}

export interface DailyMetric {
  date: string;
  gmv: number;
  orders: number;
  uv: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: number, days = 7): Promise<MetricsSummary> {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 上一周期（对比用）
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    // 本期指标
    const [current, previous, shops, dailyData] = await Promise.all([
      this.prisma.metric.aggregate({
        where: { tenantId, date: { gte: startDate, lte: endDate } },
        _sum: { gmv: true, orders: true, uv: true, pv: true },
        _avg: { conversionRate: true, cartRate: true },
      }),
      this.prisma.metric.aggregate({
        where: { tenantId, date: { gte: prevStartDate, lt: startDate } },
        _sum: { gmv: true, orders: true },
      }),
      this.prisma.metric.groupBy({
        by: ['shopId'],
        where: { tenantId, date: { gte: startDate, lte: endDate } },
        _sum: { gmv: true, orders: true, uv: true },
        _avg: { conversionRate: true },
      }),
      this.prisma.metric.groupBy({
        by: ['date'],
        where: { tenantId, date: { gte: startDate, lte: endDate } },
        _sum: { gmv: true, orders: true, uv: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    // 拉取店铺信息
    const shopIds = shops.map((s) => s.shopId);
    const shopInfos = await this.prisma.shop.findMany({
      where: { id: { in: shopIds } },
      select: { id: true, name: true, platform: true },
    });
    const shopMap = Object.fromEntries(shopInfos.map((s) => [s.id, s]));

    const totalGmv = Number(current._sum.gmv) || 0;
    const prevGmv = Number(previous._sum.gmv) || 0;
    const prevOrders = Number(previous._sum.orders) || 0;

    const shopBreakdown: ShopMetrics[] = shops.map((s) => ({
      shopId: s.shopId,
      shopName: shopMap[s.shopId]?.name || '未知店铺',
      platform: shopMap[s.shopId]?.platform || '',
      gmv: Number(s._sum.gmv) || 0,
      orders: Number(s._sum.orders) || 0,
      uv: Number(s._sum.uv) || 0,
      conversionRate: Number(s._avg.conversionRate) || 0,
      gmvShare: totalGmv > 0 ? (Number(s._sum.gmv) / totalGmv) * 100 : 0,
    }));

    const dailyTrend: DailyMetric[] = dailyData.map((d) => ({
      date: d.date.toISOString().split('T')[0],
      gmv: Number(d._sum.gmv) || 0,
      orders: Number(d._sum.orders) || 0,
      uv: Number(d._sum.uv) || 0,
    }));

    return {
      totalGmv,
      totalOrders: Number(current._sum.orders) || 0,
      avgConversionRate: Number(current._avg.conversionRate) || 0,
      avgUv: Math.floor((Number(current._sum.uv) || 0) / days),
      shopCount: shopIds.length,
      shopBreakdown,
      dailyTrend,
      gmvGrowth: prevGmv > 0 ? ((totalGmv - prevGmv) / prevGmv) * 100 : 0,
      ordersGrowth:
        prevOrders > 0
          ? ((Number(current._sum.orders) - prevOrders) / prevOrders) * 100
          : 0,
    };
  }
}
