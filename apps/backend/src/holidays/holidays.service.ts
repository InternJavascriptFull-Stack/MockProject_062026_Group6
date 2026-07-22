import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateHolidayDto, UpdateHolidayDto } from "./dto/holiday.dto.js";

@Injectable()
export class HolidaysService {
    constructor(private readonly prisma: PrismaService) {}

    private serialize<T>(data: T): T {
        return JSON.parse(
            JSON.stringify(data, (_key, value) => (typeof value === "bigint" ? value.toString() : value)),
        ) as T;
    }

    async getHolidays(facilityId: string) {
        const facility = await this.prisma.facility.findFirst({
            where: { OR: [{ id: facilityId }, { facilityCode: facilityId }] },
        });

        const targetFacilityId = facility ? facility.id : facilityId;
        const activeState = facility ? facility.targetState : "CA";

        const stateHolidays = await this.prisma.holidays.findMany({
            where: { facility_id: targetFacilityId },
            orderBy: [{ is_active: "desc" }, { month: "asc" }, { day: "asc" }, { name: "asc" }],
        });

        const federalHolidays = await this.prisma.holidays.findMany({
            where: { is_federal_read_only: true },
            orderBy: [{ month: "asc" }, { day: "asc" }, { name: "asc" }],
        });

        return this.serialize({
            facilityId: targetFacilityId,
            activeState,
            stateHolidays: stateHolidays.map((h) => ({
                id: h.id.toString(),
                facilityId: h.facility_id,
                name: h.name,
                dateType: h.date_type,
                month: h.month,
                day: h.day,
                floatingRule: h.floating_rule,
                repeatsAnnually: h.repeats_annually,
                isActive: h.is_active,
                isFederalReadOnly: h.is_federal_read_only,
                createdAt: h.created_at,
                updatedAt: h.updated_at,
            })),
            federalHolidays: federalHolidays.map((h) => ({
                id: h.id.toString(),
                name: h.name,
                dateType: h.date_type,
                month: h.month,
                day: h.day,
                floatingRule: h.floating_rule,
                repeatsAnnually: h.repeats_annually,
                isActive: h.is_active,
                isFederalReadOnly: true,
            })),
        });
    }

    async createStateHoliday(facilityId: string, dto: CreateHolidayDto) {
        const facility = await this.prisma.facility.findFirst({
            where: { OR: [{ id: facilityId }, { facilityCode: facilityId }] },
        });
        const targetFacilityId = facility ? facility.id : facilityId;

        if (dto.dateType === "FIXED" && dto.month && dto.day) {
            const existingDuplicate = await this.prisma.holidays.findFirst({
                where: {
                    facility_id: targetFacilityId,
                    date_type: "FIXED",
                    month: dto.month,
                    day: dto.day,
                    is_active: true,
                },
            });
            if (existingDuplicate) {
                throw new BadRequestException(
                    "This date is already used by another active State Holiday (HOL-BR-02)",
                );
            }
        }

        const newHoliday = await this.prisma.holidays.create({
            data: {
                facility_id: targetFacilityId,
                name: dto.name,
                date_type: dto.dateType,
                month: dto.month ?? null,
                day: dto.day ?? null,
                floating_rule: dto.floatingRule ?? null,
                repeats_annually: dto.repeatsAnnually ?? true,
                is_active: true,
                is_federal_read_only: false,
            },
        });

        return this.serialize(newHoliday);
    }

    async updateStateHoliday(_facilityId: string, id: number, dto: UpdateHolidayDto) {
        const holiday = await this.prisma.holidays.findUnique({
            where: { id: BigInt(id) },
        });

        if (!holiday) {
            throw new NotFoundException("State Holiday not found");
        }
        if (holiday.is_federal_read_only) {
            throw new BadRequestException("Federal Holidays are read-only (HOL-BR-01)");
        }

        if (dto.dateType === "FIXED" && dto.month && dto.day) {
            const existingDuplicate = await this.prisma.holidays.findFirst({
                where: {
                    facility_id: holiday.facility_id,
                    date_type: "FIXED",
                    month: dto.month,
                    day: dto.day,
                    is_active: true,
                    NOT: { id: BigInt(id) },
                },
            });
            if (existingDuplicate) {
                throw new BadRequestException(
                    "This date is already used by another active State Holiday (HOL-BR-02)",
                );
            }
        }

        const updated = await this.prisma.holidays.update({
            where: { id: BigInt(id) },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.dateType !== undefined && { date_type: dto.dateType }),
                ...(dto.month !== undefined && { month: dto.month }),
                ...(dto.day !== undefined && { day: dto.day }),
                ...(dto.floatingRule !== undefined && { floating_rule: dto.floatingRule }),
                ...(dto.repeatsAnnually !== undefined && { repeats_annually: dto.repeatsAnnually }),
                ...(dto.isActive !== undefined && { is_active: dto.isActive }),
            },
        });

        return this.serialize(updated);
    }

    async toggleStatus(_facilityId: string, id: number) {
        const holiday = await this.prisma.holidays.findUnique({
            where: { id: BigInt(id) },
        });

        if (!holiday) {
            throw new NotFoundException("State Holiday not found");
        }
        if (holiday.is_federal_read_only) {
            throw new BadRequestException("Federal Holidays cannot be toggled (HOL-BR-01)");
        }

        const updated = await this.prisma.holidays.update({
            where: { id: BigInt(id) },
            data: { is_active: !holiday.is_active },
        });

        return this.serialize(updated);
    }
}
