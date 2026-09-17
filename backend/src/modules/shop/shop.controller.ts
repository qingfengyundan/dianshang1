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
  BadRequestException,
} from '@nestjs/common';
import { ShopService, sanitizeShop } from './shop.service.js';
import { CreateShopDto, UpdateShopDto } from './dto/shop.dto.js';
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
    if (!dto.tenantId) {
      throw new BadRequestException('缺少 tenantId');
    }
    const shop = await this.shopService.createShop(dto);
    return sanitizeShop(shop);
  }

  @Get()
  @Roles('system_admin', 'merchant_admin', 'merchant_user')
  async findAll(@Req() req: any) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    if (!tenantId && req.user.role !== 'system_admin') {
      return [];
    }
    const shops = await this.shopService.findByTenant(tenantId || req.user.tenantId);
    return shops.map(sanitizeShop);
  }

  @Get(':id')
  @Roles('system_admin', 'merchant_admin', 'merchant_user')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    const shop = await this.shopService.findOne(id, tenantId);
    return sanitizeShop(shop);
  }

  @Put(':id')
  @Roles('system_admin', 'merchant_admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShopDto,
    @Req() req: any,
  ) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    const shop = await this.shopService.update(id, dto, tenantId);
    return sanitizeShop(shop);
  }

  @Delete(':id')
  @Roles('system_admin', 'merchant_admin')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const tenantId = req.user.role === 'system_admin' ? undefined : req.user.tenantId;
    await this.shopService.remove(id, tenantId);
    return { message: '店铺已停用' };
  }
}
