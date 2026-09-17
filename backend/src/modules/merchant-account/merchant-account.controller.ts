import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CreateMerchantAccountDto, ResetMerchantAccountPasswordDto, UpdateMerchantAccountStatusDto } from './dto/merchant-account.dto.js';
import { MerchantAccountService } from './merchant-account.service.js';

@Controller('merchant-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('system_admin')
export class MerchantAccountController {
  constructor(private readonly service: MerchantAccountService) {}

  @Get()
  findAll(@Query('tenantId', ParseIntPipe) tenantId: number) { return this.service.findAll(tenantId); }

  @Post()
  create(@Body() dto: CreateMerchantAccountDto) { return this.service.create(dto); }

  @Put(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMerchantAccountStatusDto) { return this.service.updateStatus(id, dto.isActive); }

  @Put(':id/password')
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetMerchantAccountPasswordDto) { return this.service.resetPassword(id, dto.password); }
}
