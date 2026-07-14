import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { IncidentSeveritiesService } from "./incident-severities.service.js";
import { UpdateIncidentSeverityDto } from "./dto/update-incident-severity.dto.js";

@ApiTags("incident-severities")
@UseGuards(AccessTokenGuard)
@Controller("api/incident-severities")
export class IncidentSeveritiesController {
    constructor(private readonly incidentSeveritiesService: IncidentSeveritiesService) {}

    @Get()
    @ApiOperation({ summary: "Get the list of incident severity levels" })
    findAll() {
        return this.incidentSeveritiesService.findAll();
    }

    @Put(":id")
    @ApiOperation({ summary: "Update an incident severity level" })
    update(@Param("id") id: string, @Body() updateIncidentSeverityDto: UpdateIncidentSeverityDto) {
        return this.incidentSeveritiesService.update(id, updateIncidentSeverityDto);
    }
}
