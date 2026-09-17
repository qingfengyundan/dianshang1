import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { DataSyncService } from './data-sync.service.js';
import { TriggerDataSyncDto } from './dto/data-sync.dto.js';

@Controller('data-syncs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataSyncController {
  constructor(private readonly service: DataSyncService) {}

  @Get()
  @Roles('merchant_admin', 'merchant_user')
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.tenantId);
  }

  @Post()
  @Roles('merchant_admin')
  trigger(@Req() req: any, @Body() dto: TriggerDataSyncDto) {
    return this.service.trigger(req.user.tenantId, dto.shopId);
  }

  @Post(':id/retry')
  @Roles('merchant_admin')
  retry(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.retry(req.user.tenantId, id);
  }
}
