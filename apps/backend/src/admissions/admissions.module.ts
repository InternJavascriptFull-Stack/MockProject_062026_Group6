import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AdmissionsController } from "./admissions.controller.js";
import { AdmissionsService } from "./admissions.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [AdmissionsController],
    providers: [AdmissionsService],
})
export class AdmissionsModule {}
