import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ShopService } from './shop.service.js';
import type { CreateShopDto, UpdateShopDto } from './shop.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @Roles('system_admin', 'merchant_admin')
  async create(@Body() dto: CreateShopDto, @Req() req: any) {
    // 如果是商户管理员，强制使用自己的 tenantId
    if (req.user.role === 'merchant_admin') {
      dto.tenantId = req.user.tenantId;
    }
    return this.shopService.createShop(dto);
  }

  @Get()
  @Roles('system_admin', 'merchant_admin', 'merchant_user')
  async findAll(@Req() req: any) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    if (!tenantId && req.user.role !== 'system_admin') {
      return [];
    }
    return this.shopService.findByTenant(tenantId || req.user.tenantId);
  }

  @Get(':id')
  @Roles('system_admin', 'merchant_admin', 'merchant_user')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    return this.shopService.findOne(id, tenantId);
  }

  @Put(':id')
  @Roles('system_admin', 'merchant_admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShopDto,
    @Req() req: any,
  ) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    return this.shopService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @Roles('system_admin', 'merchant_admin')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    await this.shopService.remove(id, tenantId);
    return { message: '店铺已停用' };
  }
}
