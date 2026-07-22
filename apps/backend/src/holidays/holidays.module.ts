import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { HolidaysController } from "./holidays.controller.js";
import { HolidaysService } from "./holidays.service.js";

@Module({
    imports: [PrismaModule],
    controllers: [HolidaysController],
    providers: [HolidaysService],
    exports: [HolidaysService],
})
export class HolidaysModule {}
