import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service.js';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles('system_admin')
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantService.createTenant(dto);
  }

  @Get()
  @Roles('system_admin')
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.tenantService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @Roles('system_admin', 'merchant_admin')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.findOne(id);
  }

  @Put(':id')
  @Roles('system_admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, dto);
  }

  @Delete(':id')
  @Roles('system_admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.tenantService.remove(id);
    return { message: '租户已停用' };
  }
}
