import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { MerchantAccountService } from './merchant-account.service.js';

describe('MerchantAccountService', () => {
  let service: MerchantAccountService;
  const tenantFindUnique = vi.fn();
  const userFindUnique = vi.fn();
  const userFindFirst = vi.fn();
  const userFindMany = vi.fn();
  const userCreate = vi.fn();
  const userUpdate = vi.fn();

  beforeEach(async () => {
    for (const mock of [tenantFindUnique, userFindUnique, userFindFirst, userFindMany, userCreate, userUpdate]) mock.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantAccountService,
        { provide: PrismaService, useValue: { tenant: { findUnique: tenantFindUnique }, user: { findUnique: userFindUnique, findFirst: userFindFirst, findMany: userFindMany, create: userCreate, update: userUpdate } } },
      ],
    }).compile();
    service = module.get(MerchantAccountService);
  });

  it('只列出指定商户的商户角色账号，且不查询密码哈希', async () => {
    tenantFindUnique.mockResolvedValue({ id: 1 });
    userFindMany.mockResolvedValue([]);
    await service.findAll(1);
    expect(userFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: 1, role: { in: ['merchant_admin', 'merchant_user'] } },
      select: expect.not.objectContaining({ passwordHash: expect.anything() }),
    }));
  });

  it('不能向不存在的商户创建账号', async () => {
    tenantFindUnique.mockResolvedValue(null);
    await expect(service.create({ tenantId: 999, username: 'operator', password: 'password', role: 'merchant_user' })).rejects.toThrow(NotFoundException);
    expect(userCreate).not.toHaveBeenCalled();
  });

  it('拒绝重复用户名', async () => {
    tenantFindUnique.mockResolvedValue({ id: 1 });
    userFindUnique.mockResolvedValue({ id: 2 });
    await expect(service.create({ tenantId: 1, username: 'operator', password: 'password', role: 'merchant_user' })).rejects.toThrow(ConflictException);
  });

  it('不能修改系统管理员账号状态', async () => {
    userFindFirst.mockResolvedValue(null);
    await expect(service.updateStatus(1, false)).rejects.toThrow(NotFoundException);
    expect(userUpdate).not.toHaveBeenCalled();
  });
});
