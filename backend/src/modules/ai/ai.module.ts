import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { AiConfigController } from './ai-config.controller.js';
import { AiConfigService } from './ai-config.service.js';
import { DatabaseModule } from '../../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DashboardModule } from '../dashboard/dashboard.module.js';

@Module({
  imports: [DatabaseModule, AuthModule, DashboardModule],
  controllers: [AiController, AiConfigController],
  providers: [AiService, AiConfigService],
  exports: [AiService, AiConfigService],
})
export class AiModule {}
