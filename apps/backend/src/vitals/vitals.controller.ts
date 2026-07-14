import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { CreateVitalSignDto } from "./dto/create-vital-sign.dto.js";
import { VitalsService } from "./vitals.service.js";

@ApiTags("vitals")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/vitals")
export class VitalsController {
    constructor(private readonly vitalsService: VitalsService) {}

    @Post()
    @ApiOperation({ summary: "Record bedside vital signs" })
    create(@Body() dto: CreateVitalSignDto, @Req() request: any) {
        return this.vitalsService.create(dto, request.user.sub);
    }

    @Get("resident/:residentId")
    @ApiOperation({ summary: "Get recent vital signs" })
    recent(@Param("residentId") residentId: string) {
        return this.vitalsService.recent(residentId);
    }
}
