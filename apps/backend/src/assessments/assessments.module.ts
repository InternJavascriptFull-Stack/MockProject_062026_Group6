import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AssessmentsController, ReassessmentsController, ResidentLocHistoryController } from "./assessments.controller.js";
import { AssessmentsService } from "./assessments.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [AssessmentsController, ReassessmentsController, ResidentLocHistoryController],
    providers: [AssessmentsService],
    exports: [AssessmentsService],
})
export class AssessmentsModule {}
