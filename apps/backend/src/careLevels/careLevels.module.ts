import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CareLevelsController } from './careLevels.controller.js';
import { CareLevelsService } from './careLevels.service.js';

@Module({
    imports: [PrismaModule],
    controllers: [CareLevelsController],
    providers: [CareLevelsService],
})
export class CareLevelsModule {}
