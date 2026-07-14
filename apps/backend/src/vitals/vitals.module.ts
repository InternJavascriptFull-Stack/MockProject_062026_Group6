import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { VitalsController } from "./vitals.controller.js";
import { VitalsService } from "./vitals.service.js";

@Module({ imports: [PrismaModule], controllers: [VitalsController], providers: [VitalsService] })
export class VitalsModule {}
