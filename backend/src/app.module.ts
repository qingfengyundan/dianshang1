import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TenantModule } from './modules/tenant/tenant.module.js';
import { ShopModule } from './modules/shop/shop.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { MerchantAccountModule } from './modules/merchant-account/merchant-account.module.js';
import { DataSyncModule } from './modules/data-sync/data-sync.module.js';

@Module({
  imports: [DatabaseModule, AuthModule, TenantModule, ShopModule, DashboardModule, AiModule, MerchantAccountModule, DataSyncModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
