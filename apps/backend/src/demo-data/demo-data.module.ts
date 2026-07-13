import { Module } from "@nestjs/common";
import { DemoDataController } from "./demo-data.controller.js";
import { DemoDataService } from "./demo-data.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule],
  controllers: [DemoDataController],
  providers: [DemoDataService],
  exports: [DemoDataService],
})
export class DemoDataModule {}
