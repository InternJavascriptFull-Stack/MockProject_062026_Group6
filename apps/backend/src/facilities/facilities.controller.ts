import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service.js';
import { UpdateFacilitySettingsDto } from './dto/updateFacilitySettings.dto.js';

@ApiTags('facilities')
@Controller()
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get('api/facilities')
  @ApiOperation({ summary: 'Get a list of facilities' })
  findAll() {
    return this.facilitiesService.findAll();
  }

  @Get('api/facility/settings')
  @ApiOperation({ summary: 'Get facility settings' })
  getFacilitySettings() {
    return this.facilitiesService.getFacilitySettings();
  }

  @Put('api/facility/settings')
  @ApiOperation({ summary: 'Update facility settings' })
  updateFacilitySettings(@Body() dto: UpdateFacilitySettingsDto) {
    return this.facilitiesService.updateFacilitySettings(dto);
  }
}
