import { Module } from "@nestjs/common";
import { IncidentSeveritiesController } from "./incident-severities.controller.js";
import { IncidentSeveritiesService } from "./incident-severities.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Module({
    controllers: [IncidentSeveritiesController],
    providers: [IncidentSeveritiesService, PrismaService],
})
export class IncidentSeveritiesModule {}
