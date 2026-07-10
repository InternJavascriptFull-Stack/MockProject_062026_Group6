import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service.js';
import { FacilitiesController } from './facilities.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
})
export class FacilitiesModule {}
