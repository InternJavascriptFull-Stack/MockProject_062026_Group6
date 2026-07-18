import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateCareLevelDto } from './dto/updateCareLevel.dto.js';

const DEFAULT_FACILITY_CODE = 'FAC-0042';
const DEFAULT_LAST_UPDATED_BY = 'Victor Alvarez, Admin';

const CARE_LEVEL_SCORE_RANGES: Record<string, { scoreMin: number; scoreMax: number }> = {
    INDEPENDENT_LIVING: { scoreMin: 0, scoreMax: 8 },
    ASSISTED_LIVING: { scoreMin: 9, scoreMax: 16 },
    MEMORY_CARE: { scoreMin: 17, scoreMax: 24 },
    SKILLED_NURSING: { scoreMin: 25, scoreMax: 32 },
};

@Injectable()
export class CareLevelsService {
    constructor(private readonly prisma: PrismaService) {}

    private toDate(value: string) {
        return new Date(`${value}T00:00:00.000Z`);
    }

    private formatDate(value: Date | string) {
        return new Date(value).toISOString().slice(0, 10);
    }

    private decimalToNumber(value: Prisma.Decimal | number) {
        return Number(value);
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

    async getCareLevels() {
        const facility = await this.getDefaultFacility();
        const careLevels = await this.prisma.care_levels.findMany({
            where: {
                is_deleted: false,
                level_code: { in: Object.keys(CARE_LEVEL_SCORE_RANGES) },
            },
            include: {
                care_level_rates: {
                    where: {
                        facility_id: facility.id,
                        effective_to: null,
                    },
                },
            },
            orderBy: { id: 'asc' },
        });

        const result = careLevels.map((careLevel) => {
            const scoreRange = CARE_LEVEL_SCORE_RANGES[careLevel.level_code] ?? {
                scoreMin: 0,
                scoreMax: 0,
            };
            const currentRate = careLevel.care_level_rates[0];

            return {
                id: careLevel.id.toString(),
                levelCode: careLevel.level_code,
                levelName: careLevel.level_name,
                scoreMin: scoreRange.scoreMin,
                scoreMax: scoreRange.scoreMax,
                dailyRate: currentRate ? this.decimalToNumber(currentRate.daily_rate) : 0,
                effectiveFrom: currentRate ? this.formatDate(currentRate.effective_from) : null,
                lastUpdatedBy: DEFAULT_LAST_UPDATED_BY,
            };
        });

        return result.sort((first, second) => first.scoreMin - second.scoreMin);
    }

    async updateCareLevel(id: string, dto: UpdateCareLevelDto) {
        const facility = await this.getDefaultFacility();
        const careLevelId = BigInt(id);

        await this.prisma.$transaction(async (transaction) => {
            const careLevel = await transaction.care_levels.findUnique({
                where: { id: careLevelId },
            });

            if (!careLevel) {
                throw new NotFoundException(`Care level with ID ${id} not found.`);
            }

            const currentRate = await transaction.care_level_rates.findFirst({
                where: {
                    care_level_id: careLevelId,
                    facility_id: facility.id,
                    effective_to: null,
                },
            });

            if (!currentRate) {
                await transaction.care_level_rates.create({
                    data: {
                        care_level_id: careLevelId,
                        facility_id: facility.id,
                        daily_rate: dto.dailyRate,
                        effective_from: this.toDate(dto.effectiveFrom ?? '2026-01-01'),
                    },
                });
                return;
            }

            await transaction.care_level_rates.update({
                where: { id: currentRate.id },
                data: {
                    daily_rate: dto.dailyRate,
                    effective_from: dto.effectiveFrom ? this.toDate(dto.effectiveFrom) : undefined,
                },
            });
        });

        return this.getCareLevels();
    }
}
