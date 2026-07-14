import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { EquipmentSuppliesController } from "./equipment-supplies.controller.js";
import { EquipmentSuppliesService } from "./equipment-supplies.service.js";

@Module({ imports: [PrismaModule], controllers: [EquipmentSuppliesController], providers: [EquipmentSuppliesService] })
export class EquipmentSuppliesModule {}
