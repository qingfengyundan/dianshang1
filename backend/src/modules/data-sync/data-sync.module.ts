import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../../database/database.module.js';
import { DataSyncController } from './data-sync.controller.js';
import { DataSyncService } from './data-sync.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [DataSyncController],
  providers: [DataSyncService],
})
export class DataSyncModule {}
