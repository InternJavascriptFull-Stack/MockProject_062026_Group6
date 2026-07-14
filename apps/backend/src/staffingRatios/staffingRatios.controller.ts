import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffingRatioDto } from './dto/staffingRatio.dto.js';
import { StaffingRatiosService } from './staffingRatios.service.js';

@ApiTags('staffing-ratios')
@Controller('api/staffing-ratios')
export class StaffingRatiosController {
    constructor(private readonly staffingRatiosService: StaffingRatiosService) {}

    @Get()
    @ApiOperation({ summary: 'Get staffing ratio configuration' })
    getStaffingRatios() {
        return this.staffingRatiosService.getStaffingRatios();
    }

    @Post()
    @ApiOperation({ summary: 'Create staffing ratio configuration' })
    createStaffingRatio(@Body() dto: StaffingRatioDto) {
        return this.staffingRatiosService.createStaffingRatio(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update staffing ratio configuration' })
    updateStaffingRatio(
        @Param('id') id: string,
        @Body() dto: StaffingRatioDto,
    ) {
        return this.staffingRatiosService.updateStaffingRatio(id, dto);
    }
}
