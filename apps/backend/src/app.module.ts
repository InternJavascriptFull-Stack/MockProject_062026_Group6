import { Module } from "@nestjs/common";
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { FacilitiesModule } from './facilities/facilities.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { IncidentSeveritiesModule } from './incident-severities/incident-severities.module.js';
import { SlaConfigurationsModule } from './sla-configurations/sla-configurations.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    FacilitiesModule,
    DashboardModule,
    IncidentSeveritiesModule,
    SlaConfigurationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
