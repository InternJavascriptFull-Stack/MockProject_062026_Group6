import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BillingController } from "./billing.controller.js";
import { BillingService } from "./billing.service.js";

@Module({ imports: [PrismaModule], controllers: [BillingController], providers: [BillingService] })
export class BillingModule {}
