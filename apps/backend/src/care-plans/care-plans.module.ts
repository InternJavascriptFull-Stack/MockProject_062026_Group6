import { Module } from '@nestjs/common';
import { CarePlansController } from './care-plans.controller.js';
import { CarePlansService } from './care-plans.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CarePlansController],
  providers: [CarePlansService],
  exports: [CarePlansService],
})
export class CarePlansModule {}
