import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShopService, sanitizeShop } from './shop.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { Shop } from '@prisma/client';

/** 与 Prisma Shop 模型一致的样例（含凭证字段） */
const shop: Shop = {
  id: 1,
  tenantId: 100,
  name: '淘宝旗舰店',
  platform: 'taobao',
  shopUrl: 'https://shop.example.com',
  apiKey: 'ak-secret',
  apiSecret: 'as-secret',
  accessToken: 'at-secret',
  isActive: true,
  lastSyncAt: null,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
};

describe('sanitizeShop', () => {
  it('剥离 apiKey / apiSecret / accessToken，保留其余字段', () => {
    const safe = sanitizeShop(shop);
    expect(safe).not.toHaveProperty('apiKey');
    expect(safe).not.toHaveProperty('apiSecret');
    expect(safe).not.toHaveProperty('accessToken');
    expect(safe.id).toBe(1);
    expect(safe.tenantId).toBe(100);
    expect(safe.name).toBe('淘宝旗舰店');
    expect(safe.platform).toBe('taobao');
    expect(safe.isActive).toBe(true);
  });

  it('不修改原对象（无副作用）', () => {
    const clone = { ...shop };
    sanitizeShop(shop);
    expect(shop).toEqual(clone);
  });
});

describe('ShopService 租户隔离', () => {
  let service: ShopService;
  const create = vi.fn();
  const findMany = vi.fn();
  const findFirst = vi.fn();
  const update = vi.fn();

  beforeEach(async () => {
    create.mockReset();
    findMany.mockReset();
    findFirst.mockReset();
    update.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        {
          provide: PrismaService,
          useValue: { shop: { create, findMany, findFirst, update } },
        },
      ],
    }).compile();
    service = module.get(ShopService);
  });

  it('findOne 把 tenantId 写进 where，防止跨租户读取', async () => {
    findFirst.mockResolvedValue(shop);
    await service.findOne(1, 100);
    expect(findFirst).toHaveBeenCalledWith({ where: { id: 1, tenantId: 100 } });
  });

  it('findOne 未传 tenantId 时不加租户条件（system_admin 路径）', async () => {
    findFirst.mockResolvedValue(shop);
    await service.findOne(1);
    expect(findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('跨租户查询（别的租户的 id）返回 404，且 update 不会继续', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.update(1, { name: '改名' }, 999)).rejects.toThrow(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('跨租户删除（别的租户的 id）返回 404，且不会置 isActive=false', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('本租户删除走软删除，置 isActive=false', async () => {
    findFirst.mockResolvedValue(shop);
    update.mockResolvedValue({ ...shop, isActive: false });
    await service.remove(1, 100);
    expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isActive: false } });
  });

  it('createShop 原样落库（含凭证），供平台后续采集使用', async () => {
    create.mockResolvedValue(shop);
    await service.createShop({
      tenantId: 100,
      name: '淘宝旗舰店',
      platform: 'taobao',
      apiKey: 'ak',
      apiSecret: 'as',
      accessToken: 'at',
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        tenantId: 100,
        name: '淘宝旗舰店',
        platform: 'taobao',
        shopUrl: undefined,
        apiKey: 'ak',
        apiSecret: 'as',
        accessToken: 'at',
        isActive: true,
      },
    });
  });
});
