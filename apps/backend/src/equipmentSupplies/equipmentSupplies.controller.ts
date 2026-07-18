import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { CreateEquipmentSupplyDto, UpdateEquipmentSupplyDto, UpdateEquipmentSupplyStatusDto } from "./dto/equipmentSupply.dto.js";
import { EquipmentSuppliesService } from "./equipmentSupplies.service.js";

@ApiTags("equipment-supplies")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/equipment-supplies")
export class EquipmentSuppliesController {
    constructor(private readonly equipmentSuppliesService: EquipmentSuppliesService) {}

    @Get()
    @ApiOperation({ summary: "List durable equipment and consumable supplies" })
    findAll(@Query("search") search?: string, @Query("category") category?: string, @Query("status") status?: string) {
        return this.equipmentSuppliesService.findAll(search, category, status);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.equipmentSuppliesService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateEquipmentSupplyDto) {
        return this.equipmentSuppliesService.create(dto);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: UpdateEquipmentSupplyDto) {
        return this.equipmentSuppliesService.update(id, dto);
    }

    @Patch(":id/status")
    updateStatus(@Param("id") id: string, @Body() dto: UpdateEquipmentSupplyStatusDto) {
        return this.equipmentSuppliesService.updateStatus(id, dto.status);
    }
}
