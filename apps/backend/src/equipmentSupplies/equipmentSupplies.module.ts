import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { EquipmentSuppliesController } from "./equipmentSupplies.controller.js";
import { EquipmentSuppliesService } from "./equipmentSupplies.service.js";

@Module({ imports: [PrismaModule], controllers: [EquipmentSuppliesController], providers: [EquipmentSuppliesService] })
export class EquipmentSuppliesModule {}
