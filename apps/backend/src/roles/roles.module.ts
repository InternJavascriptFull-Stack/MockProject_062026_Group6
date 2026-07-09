import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService],
})
export class RolesModule {}
