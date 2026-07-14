import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { AdmissionsService } from "./admissions.service.js";
import { CreateAdmissionDto } from "./dto/create-admission.dto.js";
import { CreatePreScreeningDto } from "./dto/create-pre-screening.dto.js";

@ApiTags("admissions")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/admissions")
export class AdmissionsController {
    constructor(private readonly admissionsService: AdmissionsService) {}

    @Post("pre-screening")
    @ApiOperation({ summary: "Create a pre-admission screening" })
    createPreScreening(@Body() dto: CreatePreScreeningDto, @Req() request: any) {
        return this.admissionsService.createPreScreening(dto, request.user.sub);
    }

    @Post()
    @ApiOperation({ summary: "Admit a screened resident and capture consents" })
    createAdmission(@Body() dto: CreateAdmissionDto, @Req() request: any) {
        return this.admissionsService.createAdmission(dto, request.user.sub);
    }

    @Get("resident/:residentId")
    @ApiOperation({ summary: "Get admission history for a resident" })
    getResidentAdmissions(@Param("residentId") residentId: string) {
        return this.admissionsService.getResidentAdmissions(residentId);
    }
}
