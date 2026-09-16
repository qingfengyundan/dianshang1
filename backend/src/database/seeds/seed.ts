import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据填充...');

  // 1. 创建演示租户
  const tenant = await prisma.tenant.upsert({
    where: { name: 'demo_merchant' },
    update: {},
    create: {
      name: 'demo_merchant',
      displayName: '演示电商商户',
      config: { maxShops: 10, features: ['dashboard', 'analytics', 'ai'] },
      isActive: true,
    },
  });
  console.log(`✅ 租户: ${tenant.displayName}`);

  // 2. 创建系统管理员（如不存在）
  const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'system_admin',
      },
    });
    console.log('✅ 系统管理员: admin / admin123');
  }

  // 3. 创建演示商户账号
  const merchantExists = await prisma.user.findUnique({ where: { username: 'merchant1' } });
  if (!merchantExists) {
    await prisma.user.create({
      data: {
        username: 'merchant1',
        passwordHash: await bcrypt.hash('merchant123', 10),
        role: 'merchant_admin',
        tenantId: tenant.id,
      },
    });
    console.log('✅ 商户账号: merchant1 / merchant123');
  }

  // 4. 创建演示店铺
  const shopData = [
    { name: '旗舰淘宝店', platform: 'taobao', shopUrl: 'https://shop.taobao.com/demo1' },
    { name: '拼多多官方店', platform: 'pinduoduo', shopUrl: 'https://mobile.yangkeduo.com/demo' },
    { name: '抖音小店', platform: 'douyin', shopUrl: 'https://haohuo.jinritemai.com/demo' },
  ];
  const shops: any[] = [];
  for (const s of shopData) {
    const shop = await prisma.shop.upsert({
      where: { id: shops.length + 1 },
      update: {},
      create: { tenantId: tenant.id, ...s, isActive: true },
    });
    shops.push(shop);
    console.log(`✅ 店铺: ${shop.name} (${shop.platform})`);
  }

  // 5. 生成 60 天历史数据指标
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let metricCount = 0;

  for (const shop of shops) {
    const platformBase: Record<string, number> = {
      taobao: 1.0,
      pinduoduo: 0.8,
      douyin: 1.2,
    };
    const base = platformBase[shop.platform] || 1.0;

    for (let i = 60; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 模拟真实数据波动：周末流量高，带增长趋势
      const dayOfWeek = date.getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 1.4 : 1.0;
      const growthFactor = 1 + (60 - i) * 0.003; // 6% 成长
      const jitter = 0.85 + Math.random() * 0.3;

      const uv = Math.floor(base * weekendFactor * growthFactor * jitter * 2800);
      const pv = Math.floor(uv * (2.5 + Math.random() * 1.5));
      const conversionRate = parseFloat((base * 0.032 * (0.9 + Math.random() * 0.2)).toFixed(4));
      const orders = Math.floor(uv * conversionRate);
      const avgOrderValue = base * (180 + Math.random() * 80);
      const gmv = parseFloat((orders * avgOrderValue).toFixed(2));
      const cartRate = parseFloat((conversionRate * (2.5 + Math.random())).toFixed(4));
      const favoriteRate = parseFloat((conversionRate * (1.2 + Math.random() * 0.5)).toFixed(4));

      await prisma.metric.upsert({
        where: {
          id: metricCount + 1,
        },
        update: {},
        create: {
          tenantId: tenant.id,
          shopId: shop.id,
          date,
          gmv,
          orders,
          uv,
          pv,
          conversionRate,
          cartRate,
          favoriteRate,
        },
      });
      metricCount++;
    }
    console.log(`✅ ${shop.name}: 生成 61 天历史数据`);
  }

  console.log(`\n🎉 数据填充完成！共生成 ${metricCount} 条指标数据`);
  console.log('\n登录信息:');
  console.log('  系统管理员: admin / admin123');
  console.log('  商户管理员: merchant1 / merchant123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
