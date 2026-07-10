import { Module } from "@nestjs/common";
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { FacilitiesModule } from './facilities/facilities.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, RolesModule, FacilitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
