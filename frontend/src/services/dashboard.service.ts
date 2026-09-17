import apiClient from './api';

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

export interface GetSummaryOptions {
  days?: number;
  startDate?: string;
  endDate?: string;
}

export const dashboardService = {
  async getSummary(opts: GetSummaryOptions = {}): Promise<MetricsSummary> {
    return apiClient.get('/dashboard/summary', { params: opts });
  },
};
