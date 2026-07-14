import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ResidentsController } from "./residents.controller.js";
import { ResidentsService } from "./residents.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [ResidentsController],
    providers: [ResidentsService],
    exports: [ResidentsService],
})
export class ResidentsModule {}
