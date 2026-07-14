import { Module } from '@nestjs/common';
import { SlaConfigurationsController } from './sla-configurations.controller.js';
import { SlaConfigurationsService } from './sla-configurations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [SlaConfigurationsController],
  providers: [SlaConfigurationsService, PrismaService],
})
export class SlaConfigurationsModule {}
