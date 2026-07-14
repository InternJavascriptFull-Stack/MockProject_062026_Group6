import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { BillingService } from "./billing.service.js";
import { UpdateBillingRateDto } from "./dto/update-billing-rate.dto.js";

@ApiTags("billing")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/residents")
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get(":residentId/billing-cost")
    @ApiOperation({ summary: "Get cost and payer breakdown for a resident" })
    getResidentBilling(@Param("residentId") residentId: string) {
        return this.billingService.getResidentBilling(residentId);
    }

    @Put(":residentId/billing-cost/rates/:careLevelId")
    @ApiOperation({ summary: "Create a future-effective private-pay LOC rate" })
    updateRate(@Param("residentId") residentId: string, @Param("careLevelId") careLevelId: string, @Body() dto: UpdateBillingRateDto) {
        return this.billingService.updateRate(residentId, careLevelId, dto);
    }
}
