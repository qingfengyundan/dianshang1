import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { DataSyncService } from './data-sync.service.js';

describe('DataSyncService', () => {
  const findMany = vi.fn(); const create = vi.fn(); const count = vi.fn(); const updateMany = vi.fn(); const update = vi.fn(); const findUnique = vi.fn(); const findFirst = vi.fn();
  let service: DataSyncService;
  beforeEach(async () => {
    [findMany, create, count, updateMany, update, findUnique, findFirst].forEach((mock) => mock.mockReset());
    const module = await Test.createTestingModule({ providers: [DataSyncService, { provide: PrismaService, useValue: { shop: { findMany, updateMany }, dataSync: { findMany, create, update, findUnique, findFirst }, metric: { count }, $transaction: vi.fn((queries) => Promise.all(queries)) } }] }).compile();
    service = module.get(DataSyncService);
  });
  it('同步店铺时限定当前租户并更新最后同步时间', async () => {
    findMany.mockResolvedValue([{ id: 8 }]); create.mockResolvedValue({ id: 3 }); count.mockResolvedValue(61); updateMany.mockResolvedValue({ count: 1 }); update.mockResolvedValue({}); findUnique.mockResolvedValue({ id: 3, status: 'success' });
    await service.trigger(5, 8);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 5, isActive: true, id: 8 } }));
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: [8] } } }));
  });
  it('找不到本租户启用店铺时不创建同步记录', async () => {
    findMany.mockResolvedValue([]);
    await expect(service.trigger(5, 99)).rejects.toThrow(NotFoundException);
    expect(create).not.toHaveBeenCalled();
  });
});
