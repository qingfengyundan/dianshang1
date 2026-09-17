import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateMerchantAccountDto } from './dto/merchant-account.dto.js';

const userSelect = {
  id: true,
  tenantId: true,
  username: true,
  role: true,
  permissions: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class MerchantAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: number) {
    await this.ensureTenant(tenantId);
    return this.prisma.user.findMany({
      where: { tenantId, role: { in: ['merchant_admin', 'merchant_user'] } },
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateMerchantAccountDto) {
    await this.ensureTenant(dto.tenantId);
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) throw new ConflictException('用户名已存在');

    return this.prisma.user.create({
      data: {
        tenantId: dto.tenantId,
        username: dto.username,
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: dto.role,
        permissions: {},
      },
      select: userSelect,
    });
  }

  async updateStatus(id: number, isActive: boolean) {
    await this.ensureMerchantAccount(id);
    return this.prisma.user.update({ where: { id }, data: { isActive }, select: userSelect });
  }

  async resetPassword(id: number, password: string) {
    await this.ensureMerchantAccount(id);
    await this.prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
    return { message: '密码已重置' };
  }

  private async ensureTenant(tenantId: number) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
    if (!tenant) throw new NotFoundException('商户不存在');
  }

  private async ensureMerchantAccount(id: number) {
    const account = await this.prisma.user.findFirst({ where: { id, role: { in: ['merchant_admin', 'merchant_user'] } }, select: { id: true } });
    if (!account) throw new NotFoundException('商户账号不存在');
  }
}
