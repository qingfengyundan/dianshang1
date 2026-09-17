import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MerchantAccountController } from './merchant-account.controller.js';
import { MerchantAccountService } from './merchant-account.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [MerchantAccountController],
  providers: [MerchantAccountService],
})
export class MerchantAccountModule {}
