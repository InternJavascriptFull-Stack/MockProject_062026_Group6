import { Module } from "@nestjs/common";
import { AdmissionsModule } from "./admissions/admissions.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AssessmentsModule } from "./assessments/assessments.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { BillingModule } from "./billing/billing.module.js";
import { CareLevelsModule } from "./careLevels/careLevels.module.js";
import { CarePlansModule } from "./care-plans/care-plans.module.js";
import { CareTasksModule } from "./care-tasks/care-tasks.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { DemoDataModule } from "./demo-data/demo-data.module.js";
import { EquipmentSuppliesModule } from "./equipment-supplies/equipment-supplies.module.js";
import { FacilitiesModule } from "./facilities/facilities.module.js";
import { HolidaysModule } from "./holidays/holidays.module.js";
import { IncidentSeveritiesModule } from "./incident-severities/incident-severities.module.js";
import { IncidentsModule } from "./incidents/incidents.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ResidentsModule } from "./residents/residents.module.js";
import { RolesModule } from "./roles/roles.module.js";
import { SlaConfigurationsModule } from "./sla-configurations/sla-configurations.module.js";
import { StaffingRatiosModule } from "./staffingRatios/staffingRatios.module.js";
import { UsersModule } from "./users/users.module.js";
import { VitalsModule } from "./vitals/vitals.module.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        UsersModule,
        RolesModule,
        FacilitiesModule,
        HolidaysModule,
        CareLevelsModule,
        StaffingRatiosModule,
        DashboardModule,
        IncidentSeveritiesModule,
        SlaConfigurationsModule,
        DemoDataModule,
        IncidentsModule,
        ResidentsModule,
        AdmissionsModule,
        CarePlansModule,
        AssessmentsModule,
        CareTasksModule,
        VitalsModule,
        BillingModule,
        EquipmentSuppliesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
