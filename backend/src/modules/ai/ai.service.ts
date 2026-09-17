import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { DashboardService, type MetricsSummary } from '../dashboard/dashboard.service.js';

export interface InsightResult {
  title: string;
  description: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  category: 'trend' | 'anomaly' | 'opportunity' | 'warning';
}

export interface ChatContext {
  tenantId: number;
  days?: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;
  private readonly cacheStore = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 分钟

  constructor(private readonly dashboardService: DashboardService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      this.logger.warn('OPENAI_API_KEY 未配置，AI 功能不可用');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    });
  }

  /** 确认 OpenAI 客户端已就绪，否则返回明确的 503 */
  private requireClient(): OpenAI {
    if (!this.openai) {
      throw new ServiceUnavailableException('AI 服务未配置，请在后端 .env 中设置 OPENAI_API_KEY');
    }
    return this.openai;
  }

  private get model(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  private getCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cacheStore.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cacheStore.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cacheStore.set(key, { data, timestamp: Date.now() });
  }

  /**
   * 生成 AI 数据洞察
   */
  async generateInsights(tenantId: number, days: number = 7): Promise<InsightResult[]> {
    const openai = this.requireClient();

    // 检查缓存
    const cacheKey = this.getCacheKey('insights', { tenantId, days });
    const cached = this.getFromCache<InsightResult[]>(cacheKey);
    if (cached) {
      this.logger.debug(`返回缓存的洞察数据: ${cacheKey}`);
      return cached;
    }

    // 获取数据上下文
    const summary = await this.dashboardService.getSummary(tenantId, days);
    const dataContext = this.buildDataContext(summary, days);

    // 构建 Prompt
    const prompt = this.buildInsightsPrompt(dataContext);

    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('AI 返回内容为空');
      }

      const parsed = JSON.parse(responseText);
      const insights: InsightResult[] = parsed.insights || [];

      // 缓存结果
      this.setCache(cacheKey, insights);

      this.logger.log(`生成 ${insights.length} 条 AI 洞察，Token 使用: ${completion.usage?.total_tokens}`);
      return insights;
    } catch (error) {
      this.logger.error('AI 洞察生成失败', error as Error);
      throw new ServiceUnavailableException('AI 分析服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 生成智能报告
   */
  async generateReport(
    tenantId: number,
    type: 'weekly' | 'monthly',
    startDate: string,
    endDate: string,
  ): Promise<string> {
    const openai = this.requireClient();

    const cacheKey = this.getCacheKey('report', { tenantId, type, startDate, endDate });
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // 计算天数（至少 1 天，防止无效区间）
    const start = new Date(startDate);
    const end = new Date(endDate);
    const spanDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const days = Number.isFinite(spanDays) && spanDays > 0 ? spanDays : 7;

    const summary = await this.dashboardService.getSummary(tenantId, days);
    const dataContext = this.buildDataContext(summary, days);

    const prompt = this.buildReportPrompt(dataContext, type);

    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const report = completion.choices[0]?.message?.content || '';
      this.setCache(cacheKey, report);

      this.logger.log(`生成${type}报告，Token 使用: ${completion.usage?.total_tokens}`);
      return report;
    } catch (error) {
      this.logger.error('报告生成失败', error as Error);
      throw new ServiceUnavailableException('报告生成服务暂时不可用');
    }
  }

  /**
   * 对话式查询
   */
  async chat(question: string, context: ChatContext): Promise<string> {
    const openai = this.requireClient();

    const days = context.days || 7;
    const summary = await this.dashboardService.getSummary(context.tenantId, days);
    const dataContext = this.buildDataContext(summary, days);

    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          {
            role: 'user',
            content: `数据上下文:\n${dataContext}\n\n用户问题: ${question}\n\n请基于上述数据回答问题，如果数据不足以回答，请明确说明。`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const answer = completion.choices[0]?.message?.content || '抱歉，我无法理解您的问题。';
      this.logger.log(`对话查询完成，Token 使用: ${completion.usage?.total_tokens}`);
      return answer;
    } catch (error) {
      this.logger.error('对话查询失败', error as Error);
      throw new ServiceUnavailableException('AI 对话服务暂时不可用');
    }
  }

  // ==================== 私有方法 ====================

  private getSystemPrompt(): string {
    return `你是一位资深的电商数据分析师，专门为电商商户提供数据洞察和优化建议。

你的职责:
1. 分析店铺销售数据，发现趋势、异常和机会
2. 提供具体、可操作的优化建议
3. 用简洁、专业的语言解释复杂的数据现象

数据背景:
- 用户运营多个电商店铺（淘宝、拼多多、抖音等）
- 核心指标: GMV（销售额）、订单量、UV（访客数）、转化率
- 需要对比不同店铺、不同时间段的表现

输出要求:
- 使用中文
- 结论先行，数据支撑
- 避免术语堆砌，直击业务本质
- 数字保留2位小数`;
  }

  private buildDataContext(summary: MetricsSummary, days: number): string {
    const sign = (n: number) => (n > 0 ? '+' : '');

    let context = `数据时间范围: 最近 ${days} 天\n\n`;
    context += `== 核心指标 ==\n`;
    context += `总销售额: ¥${summary.totalGmv.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} (环比 ${sign(summary.gmvGrowth)}${summary.gmvGrowth.toFixed(2)}%)\n`;
    context += `总订单量: ${summary.totalOrders.toLocaleString('zh-CN')} 单 (环比 ${sign(summary.ordersGrowth)}${summary.ordersGrowth.toFixed(2)}%)\n`;
    context += `平均转化率: ${(summary.avgConversionRate * 100).toFixed(2)}%\n`;
    context += `日均访客: ${Math.round(summary.avgUv).toLocaleString('zh-CN')} 人\n`;
    context += `店铺数量: ${summary.shopCount} 家\n\n`;

    context += `== 店铺明细 ==\n`;
    summary.shopBreakdown.forEach((shop, idx) => {
      context += `${idx + 1}. ${shop.shopName} (${shop.platform}):\n`;
      context += `   GMV: ¥${shop.gmv.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} | 订单: ${shop.orders} 单 | UV: ${shop.uv} | 转化率: ${(shop.conversionRate * 100).toFixed(2)}% | GMV占比: ${shop.gmvShare.toFixed(2)}%\n`;
    });

    const recentTrends = summary.dailyTrend.slice(-7);
    context += `\n== 日趋势（最近 ${recentTrends.length} 天） ==\n`;
    recentTrends.forEach((day) => {
      context += `${day.date}: GMV ¥${Math.round(day.gmv).toLocaleString('zh-CN')}, 订单 ${day.orders} 单, UV ${day.uv}\n`;
    });

    return context;
  }

  private buildInsightsPrompt(dataContext: string): string {
    return `${dataContext}

请分析上述数据，生成 3-5 条关键洞察。

识别重点:
1. 最显著的趋势（上升/下降）
2. 异常数据点（突增/突降）
3. 店铺间的表现差异
4. 潜在的优化机会

返回 JSON 格式:
{
  "insights": [
    {
      "title": "简短总结（10字内）",
      "description": "详细说明（50-80字）",
      "suggestion": "可操作的优化方向（30-50字）",
      "priority": "high|medium|low",
      "category": "trend|anomaly|opportunity|warning"
    }
  ]
}

确保返回有效的 JSON，不要包含其他文本。`;
  }

  private buildReportPrompt(dataContext: string, type: 'weekly' | 'monthly'): string {
    const typeText = type === 'weekly' ? '周报' : '月报';
    return `${dataContext}

请生成一份专业的电商数据${typeText}，包含以下部分:

## 📊 ${typeText}总结

### 一、核心指标概览
（总结GMV、订单量、转化率等关键指标）

### 二、趋势分析
（分析数据趋势，找出关键变化点）

### 三、店铺表现对比
（对比各店铺表现，识别优劣势）

### 四、关键洞察
（3-5 条关键发现）

### 五、优化建议
（3-5 条可操作的建议）

要求:
- 使用 Markdown 格式
- 数据准确，结论明确
- 语言简洁专业`;
  }
}
