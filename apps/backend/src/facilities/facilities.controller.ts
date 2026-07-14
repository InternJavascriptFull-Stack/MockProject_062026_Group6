import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service.js';
import { UpdateFacilitySettingsDto } from './dto/updateFacilitySettings.dto.js';

@ApiTags('facilities')
@Controller('api/facility')
export class FacilitiesController {
    constructor(private readonly facilitiesService: FacilitiesService) {}

    @Get('settings')
    @ApiOperation({ summary: 'Get facility settings' })
    getFacilitySettings() {
        return this.facilitiesService.getFacilitySettings();
    }

    @Put('settings')
    @ApiOperation({ summary: 'Update facility settings' })
    updateFacilitySettings(@Body() dto: UpdateFacilitySettingsDto) {
        return this.facilitiesService.updateFacilitySettings(dto);
    }
}
