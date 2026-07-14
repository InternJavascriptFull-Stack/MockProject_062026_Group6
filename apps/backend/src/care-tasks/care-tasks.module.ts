import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { CareTasksController } from "./care-tasks.controller.js";
import { CareTasksService } from "./care-tasks.service.js";

@Module({ imports: [PrismaModule], controllers: [CareTasksController], providers: [CareTasksService] })
export class CareTasksModule {}
