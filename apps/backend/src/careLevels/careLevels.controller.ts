import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CareLevelsService } from './careLevels.service.js';
import { UpdateCareLevelDto } from './dto/updateCareLevel.dto.js';

@ApiTags('care-levels')
@Controller('api/care-levels')
export class CareLevelsController {
    constructor(private readonly careLevelsService: CareLevelsService) {}

    @Get()
    @ApiOperation({ summary: 'Get Level of Care rates' })
    getCareLevels() {
        return this.careLevelsService.getCareLevels();
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update Level of Care rate' })
    updateCareLevel(
        @Param('id') id: string,
        @Body() dto: UpdateCareLevelDto,
    ) {
        return this.careLevelsService.updateCareLevel(id, dto);
    }
}
