import { Controller, Get, Query, UseGuards, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @Req() req: any,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return { error: '系统管理员请指定 tenantId 参数' };
    }
    return this.dashboardService.getSummary(tenantId, days);
  }
}
