import { Body, Controller, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateResidentDto } from "./dto/create-resident.dto.js";
import { ListResidentsQueryDto } from "./dto/list-residents-query.dto.js";
import { UpdateResidentStatusDto } from "./dto/update-resident-status.dto.js";
import { UpdateResidentDto } from "./dto/update-resident.dto.js";
import { ResidentsService } from "./residents.service.js";

@ApiTags("residents")
@Controller("api/residents")
export class ResidentsController {
    constructor(private readonly residentsService: ResidentsService) {}

    @Get()
    @ApiOperation({ summary: "Get residents with search and filters" })
    findAll(@Query() query: ListResidentsQueryDto) {
        return this.residentsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get resident detail" })
    findOne(@Param("id") id: string) {
        return this.residentsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: "Create a resident" })
    create(@Body() dto: CreateResidentDto) {
        return this.residentsService.create(dto);
    }

    @Put(":id")
    @ApiOperation({ summary: "Update a resident" })
    update(@Param("id") id: string, @Body() dto: UpdateResidentDto) {
        return this.residentsService.update(id, dto);
    }

    @Patch(":id/status")
    @ApiOperation({ summary: "Update resident status" })
    updateStatus(@Param("id") id: string, @Body() dto: UpdateResidentStatusDto) {
        return this.residentsService.updateStatus(id, dto);
    }
}
