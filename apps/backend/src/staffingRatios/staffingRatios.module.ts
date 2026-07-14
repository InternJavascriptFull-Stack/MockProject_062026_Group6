import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StaffingRatiosController } from './staffingRatios.controller.js';
import { StaffingRatiosService } from './staffingRatios.service.js';

@Module({
    imports: [PrismaModule],
    controllers: [StaffingRatiosController],
    providers: [StaffingRatiosService],
})
export class StaffingRatiosModule {}
