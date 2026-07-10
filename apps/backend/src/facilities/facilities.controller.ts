import { Controller, Get } from '@nestjs/common';
import { FacilitiesService } from './facilities.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('facilities')
@Controller('api/facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get a list of facilities' })
  findAll() {
    return this.facilitiesService.findAll();
  }
}
