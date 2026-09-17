import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AiService } from './ai.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /** 从请求中取出当前用户的 tenantId，系统管理员无归属租户 */
  private resolveTenantId(req: any): number {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('当前账号未归属商户，无法使用 AI 分析功能');
    }
    return tenantId;
  }

  /**
   * 获取 AI 数据洞察
   * GET /api/v1/ai/insights?days=7
   */
  @Get('insights')
  @Roles('merchant_admin', 'merchant_user')
  async getInsights(
    @Req() req: any,
    @Query('days') days?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const tenantId = this.resolveTenantId(req);
    const opts = {
      days: days ? parseInt(days, 10) : undefined,
      startDate,
      endDate,
    };
    const insights = await this.aiService.generateInsights(tenantId, opts);
    return {
      success: true,
      data: insights,
      meta: {
        days: opts.days,
        startDate: opts.startDate,
        endDate: opts.endDate,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 生成智能报告
   * POST /api/v1/ai/report
   * Body: { type: 'weekly' | 'monthly', startDate: '2026-09-01', endDate: '2026-09-07' }
   */
  @Post('report')
  @Roles('merchant_admin')
  async generateReport(
    @Req() req: any,
    @Body() body: { type?: 'weekly' | 'monthly'; startDate?: string; endDate?: string },
  ) {
    const tenantId = this.resolveTenantId(req);
    const { type, startDate, endDate } = body;

    if (type !== 'weekly' && type !== 'monthly') {
      throw new BadRequestException('报告类型必须是 weekly 或 monthly');
    }
    if (!startDate || !endDate) {
      throw new BadRequestException('请提供 startDate 和 endDate');
    }
    if (Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(endDate))) {
      throw new BadRequestException('日期格式无效，请使用 YYYY-MM-DD');
    }
    if (Date.parse(startDate) > Date.parse(endDate)) {
      throw new BadRequestException('开始日期不能晚于结束日期');
    }

    const report = await this.aiService.generateReport(tenantId, type, startDate, endDate);
    return {
      success: true,
      data: {
        report,
        type,
        dateRange: { startDate, endDate },
      },
    };
  }

  /**
   * 对话式查询
   * POST /api/v1/ai/chat
   * Body: { question: "上周哪个店铺表现最好？", days: 7 }
   */
  @Post('chat')
  @Roles('merchant_admin', 'merchant_user')
  async chat(@Req() req: any, @Body() body: { question?: string; days?: number }) {
    const tenantId = this.resolveTenantId(req);
    const question = body.question?.trim();

    if (!question) {
      throw new BadRequestException('问题内容不能为空');
    }
    if (question.length > 500) {
      throw new BadRequestException('问题内容过长，请控制在 500 字以内');
    }

    const days = Number(body.days) > 0 ? Math.min(Number(body.days), 90) : 7;
    const answer = await this.aiService.chat(question, { tenantId, days });
    return {
      success: true,
      data: {
        question,
        answer,
        context: { days },
      },
    };
  }
}
