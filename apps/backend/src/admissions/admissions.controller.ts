import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdmissionsService } from "./admissions.service.js";
import { CreatePreScreeningDto } from "./dto/create-pre-screening.dto.js";

@ApiTags("admissions")
@Controller("api/admissions")
export class AdmissionsController {
    constructor(private readonly admissionsService: AdmissionsService) {}

    @Post("pre-screening")
    @ApiOperation({ summary: "Create a pre-admission screening" })
    createPreScreening(@Body() dto: CreatePreScreeningDto) {
        return this.admissionsService.createPreScreening(dto);
    }
}
