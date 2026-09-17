import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto.js';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.prisma.tenant.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('租户名称已存在');
    }

    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        planType: dto.planType,
        config: dto.config || {},
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(includeInactive = false): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('租户不存在');
    }

    return tenant;
  }

  async update(id: number, dto: UpdateTenantDto): Promise<Tenant> {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.tenant.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('租户名称已存在');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
