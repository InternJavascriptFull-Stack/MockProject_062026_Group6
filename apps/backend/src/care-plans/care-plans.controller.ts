import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CarePlansService } from './care-plans.service.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
    CreateCarePlanDto,
    UpdateCarePlanDto,
    DonReviewDto,
    ESignDto,
    IdtAckDto
} from './dto/care-plans.dto.js';

@ApiTags('Care Plans')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('api/care-plans')
export class CarePlansController {
    constructor(private readonly carePlansService: CarePlansService) {}

    @Get()
    @ApiOperation({ summary: 'Get list of Care Plans' })
    async findAll() {
        const data = await this.carePlansService.findAll();
        return { success: true, data };
    }

    @Get('residents/list')
    @ApiOperation({ summary: 'Get list of Residents (Helper for Create Form)' })
    async getResidents() {
        const data = await this.carePlansService.getResidents();
        return { success: true, data };
    }

    @Get('check-active/:residentId')
    @ApiOperation({ summary: 'Check if resident has active or draft Care Plan' })
    async checkActiveCarePlan(@Param('residentId') residentId: string) {
        const data = await this.carePlansService.checkActiveCarePlan(residentId);
        return { success: true, data };
    }

    @Get(':id')
    @ApiOperation({ summary: 'View Care Plan details by ID' })
    async findOne(@Param('id') id: string) {
        const data = await this.carePlansService.findOne(id);
        return { success: true, data };
    }

    @Post()
    @Roles('Nurse', 'DON', 'Admin')
    @ApiOperation({ summary: 'Create a new Care Plan' })
    async create(@Body() body: CreateCarePlanDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.create(body, userId);
        return { success: true, data };
    }

    @Put(':id')
    @Roles('Nurse', 'DON', 'Admin')
    @ApiOperation({ summary: 'Update an existing Care Plan' })
    async update(@Param('id') id: string, @Body() body: UpdateCarePlanDto) {
        const data = await this.carePlansService.update(id, body);
        return { success: true, data };
    }

    @Post('check-loc-gate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Check LOC Gate warnings' })
    async checkLocGate(@Body() body: any) {
        const data = await this.carePlansService.checkLocGate(body);
        // Standardize response wrapper
        return { success: data.success, message: data.message, data: data.warnings };
    }

    @Post(':id/don-review')
    @Roles('DON', 'Admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Director of Nursing (DON) Review' })
    async donReview(@Param('id') id: string, @Body() body: DonReviewDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.donReview(id, body, userId);
        return { success: true, data };
    }

    @Post(':id/esign')
    @Roles('MD', 'Physician', 'Admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Electronic Signature' })
    async eSign(@Param('id') id: string, @Body() body: ESignDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.eSign(id, body, userId);
        return { success: true, data };
    }

    @Post(':id/idt-ack')
    @Roles('CNA', 'RN', 'LPN', 'Therapist', 'Admin', 'Nurse')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'IDT Acknowledgment' })
    async idtAck(@Param('id') id: string, @Body() body: IdtAckDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.idtAck(id, body, userId);
        return { success: true, data };
    }
}
