import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { StaffingRatioDto, StaffingShiftDto } from './dto/staffingRatio.dto.js';
import {
    DEFAULT_CENSUS,
    DEFAULT_FACILITY_CODE,
    DEFAULT_SCHEDULED_DIRECT_CARE_HOURS,
    STAFFING_SHIFT_BREAKDOWN,
    STATE_NAMES,
} from './staffingRatios.constants.js';

@Injectable()
export class StaffingRatiosService {
    constructor(private readonly prisma: PrismaService) {}

    private serializeBigInt(data: unknown) {
        return JSON.parse(
            JSON.stringify(data, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
            ),
        );
    }

    private decimalToNumber(value: Prisma.Decimal | number) {
        return Number(value);
    }

    private getStateName(stateCode: string) {
        return STATE_NAMES[stateCode] ?? stateCode;
    }

    private getShiftBreakdown(shiftBreakdownJson?: string | null): StaffingShiftDto[] {
        if (!shiftBreakdownJson) {
            return STAFFING_SHIFT_BREAKDOWN;
        }

        try {
            const parsed = JSON.parse(shiftBreakdownJson);

            if (!Array.isArray(parsed)) {
                return STAFFING_SHIFT_BREAKDOWN;
            }

            return parsed.map((shift) => ({
                shiftName: String(shift.shiftName),
                startTime: String(shift.startTime),
                endTime: String(shift.endTime),
                requiredCnaHours: Number(shift.requiredCnaHours),
                requiredNurseHours: Number(shift.requiredNurseHours),
            }));
        } catch {
            return STAFFING_SHIFT_BREAKDOWN;
        }
    }

    private async getDefaultFacility() {
        const facility = await this.prisma.facility.findUnique({
            where: { facilityCode: DEFAULT_FACILITY_CODE },
        });

        if (!facility) {
            throw new NotFoundException('Facility not found. Please run the Prisma seed first.');
        }

        return facility;
    }

    async getStaffingRatios() {
        const facility = await this.getDefaultFacility();
        const staffingConfig = await this.prisma.staffing_configs.findFirst({
            where: { facility_id: facility.id },
            orderBy: { id: 'desc' },
        });

        if (!staffingConfig) {
            throw new NotFoundException('Staffing ratio configuration not found. Please run the Prisma seed first.');
        }

        const shiftBreakdown = this.getShiftBreakdown(staffingConfig.shift_breakdown_json);
        const shiftTotal = shiftBreakdown.reduce(
            (total, shift) => total + shift.requiredCnaHours + shift.requiredNurseHours,
            0,
        );
        const scheduledPerResident = DEFAULT_SCHEDULED_DIRECT_CARE_HOURS / DEFAULT_CENSUS;
        const minimumHours = this.decimalToNumber(staffingConfig.min_hrs_per_resident_day);

        return this.serializeBigInt({
            id: staffingConfig.id,
            facilityId: facility.id,
            targetState: facility.targetState,
            targetStateName: this.getStateName(facility.targetState),
            minHrsPerResidentDay: minimumHours,
            warnBelowPercentage: staffingConfig.warn_below_percentage,
            regulationReference: 'BR-01 (CA)',
            shifts: shiftBreakdown.map((shift) => ({
                ...shift,
                subtotal: shift.requiredCnaHours + shift.requiredNurseHours,
            })),
            shiftTotal,
            census: DEFAULT_CENSUS,
            scheduledDirectCareHours: DEFAULT_SCHEDULED_DIRECT_CARE_HOURS,
            scheduledPerResident: Number(scheduledPerResident.toFixed(1)),
            isCompliant: scheduledPerResident >= minimumHours,
            usedBy: 'DON Dashboard staffing-ratio alert (BR-01) · M2 Daily Task List capacity check',
        });
    }

    async createStaffingRatio(dto: StaffingRatioDto) {
        const facility = await this.getDefaultFacility();
        const created = await this.prisma.staffing_configs.create({
            data: {
                facility_id: dto.facilityId ?? facility.id,
                min_hrs_per_resident_day: dto.minHrsPerResidentDay,
                warn_below_percentage: dto.warnBelowPercentage ?? 90,
                shift_breakdown_json: JSON.stringify(dto.shifts ?? STAFFING_SHIFT_BREAKDOWN),
            },
        });

        return this.serializeBigInt(created);
    }

    async updateStaffingRatio(id: string, dto: StaffingRatioDto) {
        const staffingConfigId = BigInt(id);
        const staffingConfig = await this.prisma.staffing_configs.findUnique({
            where: { id: staffingConfigId },
        });

        if (!staffingConfig) {
            throw new NotFoundException(`Staffing ratio with ID ${id} not found.`);
        }

        await this.prisma.staffing_configs.update({
            where: { id: staffingConfigId },
            data: {
                min_hrs_per_resident_day: dto.minHrsPerResidentDay,
                warn_below_percentage: dto.warnBelowPercentage,
                shift_breakdown_json: dto.shifts ? JSON.stringify(dto.shifts) : undefined,
                facility_id: dto.facilityId,
            },
        });

        return this.getStaffingRatios();
    }
}
