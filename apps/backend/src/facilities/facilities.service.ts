import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import {
    CreateRoomDto,
    UpdateFacilitySettingsDto as DetailedFacilitySettingsDto,
} from "./dto/facility-settings.dto.js";
import { UpdateFacilitySettingsDto } from "./dto/updateFacilitySettings.dto.js";
import {
    BED_STATUS_LABELS,
    DEFAULT_FACILITY_CODE,
    ROOM_OCCUPANT_NOTES,
    STATE_NAMES,
} from "./facilities.constants.js";

@Injectable()
export class FacilitiesService {
    constructor(private readonly prisma: PrismaService) {}

    private serialize<T>(data: T): T {
        return JSON.parse(
            JSON.stringify(data, (_key, value) => (typeof value === "bigint" ? value.toString() : value)),
        ) as T;
    }

    private getStateName(stateCode: string) {
        return STATE_NAMES[stateCode] ?? stateCode;
    }

    private toDate(value: string) {
        return new Date(`${value}T00:00:00.000Z`);
    }

    private formatDate(value: Date | string) {
        return new Date(value).toISOString().slice(0, 10);
    }

    private getWing(roomNumber: string) {
        const numericRoom = Number.parseInt(roomNumber, 10);

        if (numericRoom >= 220) {
            return "Wing C";
        }

        if (numericRoom >= 200) {
            return "Wing B";
        }

        return "Wing A";
    }

    private getOccupantNote(status: string, roomNumber: string) {
        if (status === "MAINTENANCE") {
            return "Maintenance required";
        }

        return ROOM_OCCUPANT_NOTES[roomNumber] ?? null;
    }

    private mapBedStatus(status: string) {
        return BED_STATUS_LABELS[status] ?? status;
    }

    private toCapabilityCode(value: string) {
        return value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    async findAll() {
        const facilities = await this.prisma.facility.findMany({
            where: { isDeleted: false },
            orderBy: { name: "asc" },
        });

        return this.serialize(facilities);
    }

    private async resolveFacility(id?: string) {
        const facility = id
            ? await this.prisma.facility.findUnique({ where: { id } })
            : (await this.prisma.facility.findUnique({ where: { facilityCode: DEFAULT_FACILITY_CODE } })) ??
              (await this.prisma.facility.findFirst({
                  where: { isDeleted: false },
                  orderBy: { createdAt: "asc" },
              }));

        if (!facility || facility.isDeleted) {
            throw new NotFoundException("Facility settings not found. Please run the Prisma seed first.");
        }

        return facility;
    }

    async getFacilitySettings(id?: string) {
        const facility = await this.resolveFacility(id);
        const [rooms, roomRates, capabilities] = await Promise.all([
            this.prisma.rooms.findMany({
                where: {
                    facility_id: facility.id,
                    is_deleted: false,
                },
                include: { beds: true },
                orderBy: { room_number: "asc" },
            }),
            (this.prisma as any).facility_room_rates.findMany({
                where: { facility_id: facility.id },
                orderBy: { room_type: "asc" },
            }),
            (this.prisma as any).facility_clinical_capabilities.findMany({
                where: { facility_id: facility.id },
                orderBy: { id: "asc" },
            }),
        ]);

        const roomRows = rooms.flatMap((room) =>
            room.beds.map((bed) => ({
                roomId: room.id,
                bedId: bed.id,
                wing: this.getWing(room.room_number),
                roomNumber: room.room_number,
                bedNumber: bed.bed_number,
                roomType: room.room_type,
                status: this.mapBedStatus(bed.status),
                occupantNote: this.getOccupantNote(bed.status, room.room_number),
            })),
        );

        return this.serialize({
            id: facility.id,
            facilityCode: facility.facilityCode,
            name: facility.name,
            licenseNumber: facility.licenseNumber,
            targetState: facility.targetState,
            targetStateName: this.getStateName(facility.targetState),
            timezone: (facility as any).timezone,
            phoneNumber: facility.phoneNumber,
            roomSummary: `${roomRows.length} beds configured across ${new Set(roomRows.map((room) => room.wing)).size} wings`,
            rooms: roomRows,
            roomRates: roomRates.map((rate) => ({
                id: rate.id.toString(),
                roomType: rate.room_type,
                dailyRate: Number(rate.daily_rate),
                effectiveFrom: this.formatDate(rate.effective_from),
            })),
            capabilities: capabilities.map((capability) => ({
                id: capability.id.toString(),
                capability: capability.capability,
                supported: capability.supported,
                note: capability.note,
            })),
        });
    }

    async getSettings(id?: string) {
        const facility = await this.resolveFacility(id);
        const [rooms, capabilities, roomRates, address] = await Promise.all([
            this.prisma.rooms.findMany({
                where: { facility_id: facility.id, is_deleted: false },
                include: { beds: { include: { residents: true } } },
                orderBy: { room_number: "asc" },
            }),
            (this.prisma as any).facility_clinical_capabilities.findMany({
                where: { facility_id: facility.id },
                orderBy: { id: "asc" },
            }),
            (this.prisma as any).facility_room_rates.findMany({
                where: { facility_id: facility.id },
                orderBy: { room_type: "asc" },
            }),
            facility.addressId
                ? this.prisma.addresses.findUnique({ where: { id: facility.addressId } })
                : Promise.resolve(null),
        ]);

        return this.serialize({
            id: facility.id,
            facilityCode: facility.facilityCode,
            name: facility.name,
            licenseNumber: facility.licenseNumber,
            targetState: facility.targetState,
            phoneNumber: facility.phoneNumber,
            timezone: (facility as any).timezone,
            address: address
                ? {
                      id: address.id.toString(),
                      streetLine1: address.street_line1,
                      streetLine2: address.street_line2,
                      city: address.city,
                      state: address.state,
                      zipCode: address.zip_code,
                  }
                : null,
            rooms: rooms.map((room) => ({
                id: room.id,
                wing: this.getWing(room.room_number),
                roomNumber: room.room_number,
                roomType: room.room_type,
                beds: room.beds.map((bed) => ({
                    id: bed.id,
                    bedNumber: bed.bed_number,
                    status: bed.status,
                    occupant: bed.residents[0]
                        ? [bed.residents[0].first_name, bed.residents[0].middle_name, bed.residents[0].last_name]
                              .filter(Boolean)
                              .join(" ")
                        : null,
                })),
            })),
            capabilities: capabilities.map((capability) => ({
                code: this.toCapabilityCode(capability.capability),
                label: capability.capability,
                supported: capability.supported,
                note: capability.note,
            })),
            roomRates: roomRates.map((rate) => ({
                roomType: rate.room_type,
                dailyRate: Number(rate.daily_rate),
                effectiveFrom: this.formatDate(rate.effective_from),
            })),
            updatedAt: facility.updatedAt.toISOString(),
        });
    }

    async updateFacilitySettings(dto: UpdateFacilitySettingsDto, facilityId?: string) {
        const facility = await this.resolveFacility(facilityId);

        await this.prisma.$transaction(async (transaction) => {
            await transaction.facility.update({
                where: { id: facility.id },
                data: {
                    name: dto.name,
                    licenseNumber: dto.licenseNumber,
                    targetState: dto.targetState,
                    timezone: dto.timezone,
                    phoneNumber: dto.phoneNumber,
                } as any,
            });

            if (dto.rooms) {
                for (const room of dto.rooms) {
                    if (room.roomId && room.bedId) {
                        await transaction.rooms.update({
                            where: { id: room.roomId },
                            data: {
                                room_number: room.roomNumber,
                                room_type: room.roomType,
                                is_deleted: false,
                            },
                        });
                        await transaction.beds.update({
                            where: { id: room.bedId },
                            data: {
                                bed_number: room.bedNumber,
                                status: room.status,
                            },
                        });
                        continue;
                    }

                    const savedRoom = await transaction.rooms.upsert({
                        where: {
                            facility_id_room_number: {
                                facility_id: facility.id,
                                room_number: room.roomNumber,
                            },
                        },
                        update: { room_type: room.roomType, is_deleted: false },
                        create: {
                            facility_id: facility.id,
                            room_number: room.roomNumber,
                            room_type: room.roomType,
                        },
                    });

                    const savedBed = await transaction.beds.findFirst({
                        where: { room_id: savedRoom.id, bed_number: room.bedNumber },
                    });
                    if (savedBed) {
                        await transaction.beds.update({
                            where: { id: savedBed.id },
                            data: { status: room.status },
                        });
                    } else {
                        await transaction.beds.create({
                            data: {
                                room_id: savedRoom.id,
                                bed_number: room.bedNumber,
                                status: room.status,
                            },
                        });
                    }
                }
            }

            if (dto.roomRates) {
                for (const rate of dto.roomRates) {
                    await (transaction as any).facility_room_rates.upsert({
                        where: {
                            facility_id_room_type: {
                                facility_id: facility.id,
                                room_type: rate.roomType,
                            },
                        },
                        update: {
                            daily_rate: rate.dailyRate,
                            effective_from: this.toDate(rate.effectiveFrom),
                        },
                        create: {
                            facility_id: facility.id,
                            room_type: rate.roomType,
                            daily_rate: rate.dailyRate,
                            effective_from: this.toDate(rate.effectiveFrom),
                        },
                    });
                }
            }

            if (dto.capabilities) {
                for (const capability of dto.capabilities) {
                    await (transaction as any).facility_clinical_capabilities.upsert({
                        where: {
                            facility_id_capability: {
                                facility_id: facility.id,
                                capability: capability.capability,
                            },
                        },
                        update: {
                            supported: capability.supported,
                            note: capability.note ?? null,
                        },
                        create: {
                            facility_id: facility.id,
                            capability: capability.capability,
                            supported: capability.supported,
                            note: capability.note ?? null,
                        },
                    });
                }
            }
        });

        return this.getFacilitySettings(facility.id);
    }

    async updateDetailedSettings(id: string, dto: DetailedFacilitySettingsDto, userId?: string) {
        const facility = await this.resolveFacility(id);

        await this.prisma.$transaction(async (transaction) => {
            let addressId = facility.addressId;

            if (addressId) {
                await transaction.addresses.update({
                    where: { id: addressId },
                    data: {
                        street_line1: dto.address.streetLine1,
                        street_line2: dto.address.streetLine2,
                        city: dto.address.city,
                        state: dto.address.state.toUpperCase().slice(0, 2),
                        zip_code: dto.address.zipCode,
                        updated_at: new Date(),
                    },
                });
            } else {
                const address = await transaction.addresses.create({
                    data: {
                        street_line1: dto.address.streetLine1,
                        street_line2: dto.address.streetLine2,
                        city: dto.address.city,
                        state: dto.address.state.toUpperCase().slice(0, 2),
                        zip_code: dto.address.zipCode,
                        address_type: "FACILITY",
                    },
                });
                addressId = address.id;
            }

            await transaction.facility.update({
                where: { id },
                data: {
                    name: dto.name,
                    licenseNumber: dto.licenseNumber,
                    targetState: dto.targetState.toUpperCase().slice(0, 2),
                    phoneNumber: dto.phoneNumber,
                    timezone: dto.timezone,
                    addressId,
                } as any,
            });

            for (const capability of dto.capabilities) {
                await (transaction as any).facility_clinical_capabilities.upsert({
                    where: {
                        facility_id_capability: {
                            facility_id: id,
                            capability: capability.label,
                        },
                    },
                    update: { supported: capability.supported, note: capability.note ?? null },
                    create: {
                        facility_id: id,
                        capability: capability.label,
                        supported: capability.supported,
                        note: capability.note ?? null,
                    },
                });
            }

            for (const rate of dto.roomRates ?? []) {
                await (transaction as any).facility_room_rates.upsert({
                    where: {
                        facility_id_room_type: {
                            facility_id: id,
                            room_type: rate.roomType,
                        },
                    },
                    update: {
                        daily_rate: rate.dailyRate,
                        effective_from: this.toDate(rate.effectiveFrom),
                    },
                    create: {
                        facility_id: id,
                        room_type: rate.roomType,
                        daily_rate: rate.dailyRate,
                        effective_from: this.toDate(rate.effectiveFrom),
                    },
                });
            }

            if (userId) {
                const user = await transaction.user.findUnique({ where: { id: userId } });
                if (user) {
                    await transaction.audit_logs.create({
                        data: {
                            table_name: "facility_settings",
                            record_id: id,
                            action: "UPDATE",
                            performed_by: userId,
                            new_data: JSON.stringify({
                                timezone: dto.timezone,
                                capabilities: dto.capabilities,
                                roomRates: dto.roomRates,
                            }),
                        },
                    });
                }
            }
        });

        return this.getSettings(id);
    }

    async addRoom(facilityId: string, dto: CreateRoomDto) {
        await this.resolveFacility(facilityId);
        const room = await this.prisma.rooms.create({
            data: {
                facility_id: facilityId,
                room_number: dto.roomNumber,
                room_type: dto.roomType,
                beds: {
                    create: Array.from({ length: dto.bedCount }, (_, index) => ({
                        bed_number: String.fromCharCode(65 + index),
                        status: "AVAILABLE",
                    })),
                },
            },
            include: { beds: true },
        });

        return this.serialize({
            id: room.id,
            roomNumber: room.room_number,
            roomType: room.room_type,
            beds: room.beds.map((bed) => ({
                id: bed.id,
                bedNumber: bed.bed_number,
                status: bed.status,
            })),
        });
    }

    async getCapabilities(id?: string) {
        const facility = await this.resolveFacility(id);
        const capabilities = await (this.prisma as any).facility_clinical_capabilities.findMany({
            where: { facility_id: facility.id },
            orderBy: { id: "asc" },
        });

        return capabilities.map((capability) => ({
            code: this.toCapabilityCode(capability.capability),
            label: capability.capability,
            supported: capability.supported,
            note: capability.note,
        }));
    }
}
