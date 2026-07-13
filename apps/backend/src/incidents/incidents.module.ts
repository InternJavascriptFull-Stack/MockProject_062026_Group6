import { Module } from "@nestjs/common";
import { IncidentsController } from "./incidents.controller.js";
import { IncidentsService } from "./incidents.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
