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
        const careLevels = await this.prisma.careLevel.findMany({
            where: {
                isDeleted: false,
                levelCode: { in: Object.keys(CARE_LEVEL_SCORE_RANGES) },
            },
            include: {
                careLevelRates: {
                    where: {
                        facilityId: facility.id,
                        effectiveTo: null,
                    },
                },
            },
            orderBy: { id: 'asc' },
        });

        const result = careLevels.map((careLevel) => {
            const scoreRange = CARE_LEVEL_SCORE_RANGES[careLevel.levelCode] ?? {
                scoreMin: 0,
                scoreMax: 0,
            };
            const currentRate = careLevel.careLevelRates[0];

            return {
                id: careLevel.id.toString(),
                levelCode: careLevel.levelCode,
                levelName: careLevel.levelName,
                scoreMin: scoreRange.scoreMin,
                scoreMax: scoreRange.scoreMax,
                dailyRate: currentRate ? this.decimalToNumber(currentRate.dailyRate) : 0,
                effectiveFrom: currentRate ? this.formatDate(currentRate.effectiveFrom) : null,
                lastUpdatedBy: DEFAULT_LAST_UPDATED_BY,
            };
        });

        return result.sort((first, second) => first.scoreMin - second.scoreMin);
    }

    async updateCareLevel(id: string, dto: UpdateCareLevelDto) {
        const facility = await this.getDefaultFacility();
        const careLevelId = BigInt(id);
        const careLevel = await this.prisma.careLevel.findUnique({
            where: { id: careLevelId },
        });

        if (!careLevel) {
            throw new NotFoundException(`Care level with ID ${id} not found.`);
        }

        const currentRate = await this.prisma.careLevelRate.findFirst({
            where: {
                careLevelId,
                facilityId: facility.id,
                effectiveTo: null,
            },
        });

        if (!currentRate) {
            await this.prisma.careLevelRate.create({
                data: {
                    careLevelId,
                    facilityId: facility.id,
                    dailyRate: dto.dailyRate,
                    effectiveFrom: this.toDate(dto.effectiveFrom ?? '2026-01-01'),
                },
            });
        } else {
            await this.prisma.careLevelRate.update({
                where: { id: currentRate.id },
                data: {
                    dailyRate: dto.dailyRate,
                    effectiveFrom: dto.effectiveFrom ? this.toDate(dto.effectiveFrom) : undefined,
                },
            });
        }

        return this.getCareLevels();
    }
}
