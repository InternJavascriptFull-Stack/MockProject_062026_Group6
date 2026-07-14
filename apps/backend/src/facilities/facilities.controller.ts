import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import {
    CreateRoomDto,
    UpdateFacilitySettingsDto as DetailedFacilitySettingsDto,
} from "./dto/facility-settings.dto.js";
import { UpdateFacilitySettingsDto } from "./dto/updateFacilitySettings.dto.js";
import { FacilitiesService } from "./facilities.service.js";

@ApiTags("facilities")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller()
export class FacilitiesController {
    constructor(private readonly facilitiesService: FacilitiesService) {}

    @Get("api/facilities")
    @ApiOperation({ summary: "Get a list of facilities" })
    findAll() {
        return this.facilitiesService.findAll();
    }

    @Get("api/facility/settings")
    @ApiOperation({ summary: "Get facility settings used by the administration screen" })
    getFacilitySettings() {
        return this.facilitiesService.getFacilitySettings();
    }

    @Put("api/facility/settings")
    @ApiOperation({ summary: "Update facility settings used by the administration screen" })
    updateFacilitySettings(@Body() dto: UpdateFacilitySettingsDto) {
        return this.facilitiesService.updateFacilitySettings(dto);
    }

    @Get("api/facilities/settings/current")
    @ApiOperation({ summary: "Get the primary facility with nested rooms and beds" })
    getCurrentSettings() {
        return this.facilitiesService.getSettings();
    }

    @Get("api/facilities/:id/settings")
    @ApiOperation({ summary: "Get facility settings, rooms and clinical capabilities" })
    getSettings(@Param("id") id: string) {
        return this.facilitiesService.getSettings(id);
    }

    @Put("api/facilities/:id/settings")
    @ApiOperation({ summary: "Update detailed facility settings" })
    updateSettings(
        @Param("id") id: string,
        @Body() dto: DetailedFacilitySettingsDto,
        @Req() request: { user?: { sub?: string } },
    ) {
        return this.facilitiesService.updateDetailedSettings(id, dto, request.user?.sub);
    }

    @Post("api/facilities/:id/rooms")
    @ApiOperation({ summary: "Add a room and its beds" })
    addRoom(@Param("id") id: string, @Body() dto: CreateRoomDto) {
        return this.facilitiesService.addRoom(id, dto);
    }

    @Get("api/facilities/:id/capabilities")
    @ApiOperation({ summary: "Get clinical capabilities used by pre-admission screening" })
    getCapabilities(@Param("id") id: string) {
        return this.facilitiesService.getCapabilities(id);
    }
}
