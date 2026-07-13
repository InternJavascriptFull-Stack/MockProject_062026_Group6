import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AdmissionsModule } from "./admissions/admissions.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { FacilitiesModule } from "./facilities/facilities.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ResidentsModule } from "./residents/residents.module.js";
import { RolesModule } from "./roles/roles.module.js";
import { UsersModule } from "./users/users.module.js";
import { CarePlansModule } from "./care-plans/care-plans.module.js";
import { DemoDataModule } from "./demo-data/demo-data.module.js";
import { IncidentsModule } from "./incidents/incidents.module.js";

@Module({
    imports: [
        PrismaModule, 
        AuthModule, 
        UsersModule, 
        RolesModule, 
        FacilitiesModule, 
        DashboardModule, 
        ResidentsModule, 
        AdmissionsModule,
        CarePlansModule,
        DemoDataModule,
        IncidentsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

