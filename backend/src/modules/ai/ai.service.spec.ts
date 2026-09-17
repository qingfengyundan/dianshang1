import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { DashboardService, type MetricsSummary } from '../dashboard/dashboard.service.js';

/** 与 /api/v1/dashboard/summary 真实返回结构一致的样例数据 */
const summary: MetricsSummary = {
  totalGmv: 655833.58,
  totalOrders: 2823,
  avgConversionRate: 0.03166666666666667,
  avgUv: 12432,
  shopCount: 3,
  gmvGrowth: 15.516897911153487,
  ordersGrowth: -12.604706820901477,
  shopBreakdown: [
    {
      shopId: 1,
      shopName: '旗舰店',
      platform: 'taobao',
      gmv: 300000.5,
      orders: 1200,
      uv: 60000,
      conversionRate: 0.02,
      gmvShare: 45.75,
    },
    {
      shopId: 2,
      shopName: '拼多多店',
      platform: 'pinduoduo',
      gmv: 200000,
      orders: 1000,
      uv: 30000,
      conversionRate: 0.0333,
      gmvShare: 30.5,
    },
  ],
  dailyTrend: [
    { date: '2026-09-10', gmv: 90000.4, orders: 400, uv: 1700 },
    { date: '2026-09-11', gmv: 95000.6, orders: 420, uv: 1800 },
  ],
};

describe('AiService', () => {
  let service: AiService;
  const getSummary = vi.fn();
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    // 显式清空，保证本地配置了真实 Key 时测试结果依然稳定
    delete process.env.OPENAI_API_KEY;
    getSummary.mockReset().mockResolvedValue(summary);
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService, { provide: DashboardService, useValue: { getSummary } }],
    }).compile();
    service = module.get(AiService);
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  });

  describe('未配置 OPENAI_API_KEY 时', () => {
    it('三个入口都抛出 503，而不是 500', async () => {
      await expect(service.generateInsights(1, 7)).rejects.toThrow(ServiceUnavailableException);
      await expect(
        service.generateReport(1, 'weekly', '2026-09-01', '2026-09-07'),
      ).rejects.toThrow(ServiceUnavailableException);
      await expect(service.chat('销量如何？', { tenantId: 1 })).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('在调用 AI 之前失败，不会白跑一次数据库查询', async () => {
      await expect(service.generateInsights(1, 7)).rejects.toThrow();
      expect(getSummary).not.toHaveBeenCalled();
    });
  });

  describe('buildDataContext', () => {
    // buildDataContext 是私有方法，这里通过实例访问以验证它与真实数据结构对齐
    const build = (s: MetricsSummary, days: number): string =>
      (service as any).buildDataContext(s, days);

    it('读取的字段与 MetricsSummary 完全对应，不产生 undefined/NaN', () => {
      const text = build(summary, 7);
      expect(text).not.toMatch(/undefined|NaN/);
    });

    it('核心指标按真实字段名渲染，转化率换算为百分比', () => {
      const text = build(summary, 7);
      expect(text).toContain('数据时间范围: 最近 7 天');
      expect(text).toContain('总订单量: 2,823 单');
      expect(text).toContain('平均转化率: 3.17%');
      expect(text).toContain('日均访客: 12,432 人');
      expect(text).toContain('店铺数量: 3 家');
    });

    it('环比为正加 + 号，为负保留 - 号', () => {
      const text = build(summary, 7);
      expect(text).toContain('环比 +15.52%');
      expect(text).toContain('环比 -12.60%');
    });

    it('逐条列出店铺，并换算转化率与占比', () => {
      const text = build(summary, 7);
      expect(text).toContain('1. 旗舰店 (taobao)');
      expect(text).toContain('2. 拼多多店 (pinduoduo)');
      expect(text).toContain('转化率: 2.00%');
      expect(text).toContain('GMV占比: 45.75%');
    });

    it('趋势标题使用实际天数，避免少于 7 天时写死 7', () => {
      const text = build(summary, 30);
      expect(text).toContain('日趋势（最近 2 天）');
      expect(text).toContain('2026-09-10');
      expect(text).toContain('2026-09-11');
    });

    it('最多保留最近 7 天趋势', () => {
      const long = {
        ...summary,
        dailyTrend: Array.from({ length: 30 }, (_, i) => ({
          date: `2026-09-${String(i + 1).padStart(2, '0')}`,
          gmv: 1000,
          orders: 10,
          uv: 100,
        })),
      };
      const text = build(long, 30);
      expect(text).toContain('日趋势（最近 7 天）');
      expect(text).toContain('2026-09-30');
      expect(text).not.toContain('2026-09-23');
    });

    it('无店铺、无趋势时不抛错', () => {
      const empty: MetricsSummary = {
        ...summary,
        shopCount: 0,
        shopBreakdown: [],
        dailyTrend: [],
      };
      expect(() => build(empty, 7)).not.toThrow();
      expect(build(empty, 7)).toContain('日趋势（最近 0 天）');
    });
  });
});
