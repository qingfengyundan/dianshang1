import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AiConfigService } from './ai-config.service.js';
import { UpsertAiConfigDto } from './dto/ai-config.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('ai-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiConfigController {
  constructor(private readonly aiConfigService: AiConfigService) {}

  /** 获取全局默认配置 */
  @Get('global')
  @Roles('system_admin')
  async getGlobal() {
    const config = await this.aiConfigService.getGlobal();
    return { success: true, data: config };
  }

  /** 保存全局默认配置 */
  @Put('global')
  @Roles('system_admin')
  async upsertGlobal(@Body() dto: UpsertAiConfigDto) {
    const config = await this.aiConfigService.upsertGlobal(dto);
    return { success: true, data: config };
  }

  /** 获取某租户的 AI 配置覆盖 */
  @Get('tenant/:tenantId')
  @Roles('system_admin')
  async getTenant(@Param('tenantId', ParseIntPipe) tenantId: number) {
    const config = await this.aiConfigService.getByTenant(tenantId);
    return { success: true, data: config };
  }

  /** 保存某租户的 AI 配置覆盖 */
  @Put('tenant/:tenantId')
  @Roles('system_admin')
  async upsertTenant(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Body() dto: UpsertAiConfigDto,
  ) {
    const config = await this.aiConfigService.upsertTenant(tenantId, dto);
    return { success: true, data: config };
  }

  /** 删除某租户的 AI 配置覆盖（回退全局默认） */
  @Delete('tenant/:tenantId')
  @Roles('system_admin')
  async removeTenant(@Param('tenantId', ParseIntPipe) tenantId: number) {
    await this.aiConfigService.removeTenant(tenantId);
    return { success: true, message: '已移除租户 AI 覆盖配置' };
  }
}
