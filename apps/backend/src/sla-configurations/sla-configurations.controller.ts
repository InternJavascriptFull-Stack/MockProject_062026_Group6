import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { SlaConfigurationsService } from "./sla-configurations.service.js";
import { UpdateSlaConfigurationDto } from "./dto/update-sla-configuration.dto.js";

@ApiTags("sla-configurations")
@UseGuards(AccessTokenGuard)
@Controller("api/sla-configurations")
export class SlaConfigurationsController {
    constructor(private readonly slaConfigurationsService: SlaConfigurationsService) {}

    @Get()
    @ApiOperation({ summary: "Get the list of SLA configurations" })
    findAll() {
        return this.slaConfigurationsService.findAll();
    }

    @Put(":id")
    @ApiOperation({ summary: "Update an SLA configuration" })
    update(@Param("id") id: string, @Body() updateSlaConfigurationDto: UpdateSlaConfigurationDto) {
        return this.slaConfigurationsService.update(id, updateSlaConfigurationDto);
    }
}
