import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TenantModule } from './modules/tenant/tenant.module.js';
import { ShopModule } from './modules/shop/shop.module.js';

@Module({
  imports: [DatabaseModule, AuthModule, TenantModule, ShopModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
