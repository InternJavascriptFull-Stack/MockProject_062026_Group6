import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
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

    private async updateFacilityProfile(
        transaction: Prisma.TransactionClient,
        facilityId: string,
        dto: UpdateFacilitySettingsDto,
    ) {
        await transaction.facility.update({
            where: { id: facilityId },
            data: {
                name: dto.name,
                licenseNumber: dto.licenseNumber,
                targetState: dto.targetState,
                timezone: dto.timezone,
                phoneNumber: dto.phoneNumber,
            } as any,
        });
    }

    private async upsertFacilityRooms(
        transaction: Prisma.TransactionClient,
        facilityId: string,
        rooms: NonNullable<UpdateFacilitySettingsDto["rooms"]>,
    ) {
        for (const room of rooms) {
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
                        facility_id: facilityId,
                        room_number: room.roomNumber,
                    },
                },
                update: { room_type: room.roomType, is_deleted: false },
                create: {
                    facility_id: facilityId,
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

    private async upsertFacilityRoomRates(
        transaction: Prisma.TransactionClient,
        facilityId: string,
        roomRates: NonNullable<UpdateFacilitySettingsDto["roomRates"]>,
    ) {
        for (const rate of roomRates) {
            await (transaction as any).facility_room_rates.upsert({
                where: {
                    facility_id_room_type: {
                        facility_id: facilityId,
                        room_type: rate.roomType,
                    },
                },
                update: {
                    daily_rate: rate.dailyRate,
                    effective_from: this.toDate(rate.effectiveFrom),
                },
                create: {
                    facility_id: facilityId,
                    room_type: rate.roomType,
                    daily_rate: rate.dailyRate,
                    effective_from: this.toDate(rate.effectiveFrom),
                },
            });
        }
    }

    private async upsertFacilityCapabilities(
        transaction: Prisma.TransactionClient,
        facilityId: string,
        capabilities: NonNullable<UpdateFacilitySettingsDto["capabilities"]>,
    ) {
        for (const capability of capabilities) {
            await (transaction as any).facility_clinical_capabilities.upsert({
                where: {
                    facility_id_capability: {
                        facility_id: facilityId,
                        capability: capability.capability,
                    },
                },
                update: {
                    supported: capability.supported,
                    note: capability.note ?? null,
                },
                create: {
                    facility_id: facilityId,
                    capability: capability.capability,
                    supported: capability.supported,
                    note: capability.note ?? null,
                },
            });
        }
    }

    private mapDetailedCapabilities(dto: DetailedFacilitySettingsDto) {
        return dto.capabilities.map((capability) => ({
            capability: capability.label,
            supported: capability.supported,
            note: capability.note,
        }));
    }

    private async upsertFacilityAddress(
        transaction: Prisma.TransactionClient,
        addressId: bigint | number | null | undefined,
        dto: DetailedFacilitySettingsDto,
    ) {
        const addressData = {
            street_line1: dto.address.streetLine1,
            street_line2: dto.address.streetLine2,
            city: dto.address.city,
            state: dto.address.state.toUpperCase().slice(0, 2),
            zip_code: dto.address.zipCode,
        };

        if (addressId) {
            await transaction.addresses.update({
                where: { id: addressId },
                data: {
                    ...addressData,
                    updated_at: new Date(),
                },
            });

            return addressId;
        }

        const address = await transaction.addresses.create({
            data: {
                ...addressData,
                address_type: "FACILITY",
            },
        });

        return address.id;
    }

    private async updateDetailedFacilityProfile(
        transaction: Prisma.TransactionClient,
        facilityId: string,
        addressId: bigint | number,
        dto: DetailedFacilitySettingsDto,
    ) {
        await transaction.facility.update({
            where: { id: facilityId },
            data: {
                name: dto.name,
                licenseNumber: dto.licenseNumber,
                targetState: dto.targetState.toUpperCase().slice(0, 2),
                phoneNumber: dto.phoneNumber,
                timezone: dto.timezone,
                addressId,
            } as any,
        });
    }

    private async createFacilitySettingsAuditLog(
        transaction: Prisma.TransactionClient,
        facilityId: string,
        dto: DetailedFacilitySettingsDto,
        userId?: string,
    ) {
        if (!userId) {
            return;
        }

        const user = await transaction.user.findUnique({ where: { id: userId } });
        if (!user) {
            return;
        }

        await transaction.audit_logs.create({
            data: {
                table_name: "facility_settings",
                record_id: facilityId,
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
            await this.updateFacilityProfile(transaction, facility.id, dto);

            if (dto.rooms) {
                await this.upsertFacilityRooms(transaction, facility.id, dto.rooms);
            }

            if (dto.roomRates) {
                await this.upsertFacilityRoomRates(transaction, facility.id, dto.roomRates);
            }

            if (dto.capabilities) {
                await this.upsertFacilityCapabilities(transaction, facility.id, dto.capabilities);
            }
        });

        return this.getFacilitySettings(facility.id);
    }

    async updateDetailedSettings(id: string, dto: DetailedFacilitySettingsDto, userId?: string) {
        const facility = await this.resolveFacility(id);

        await this.prisma.$transaction(async (transaction) => {
            const addressId = await this.upsertFacilityAddress(transaction, facility.addressId, dto);
            await this.updateDetailedFacilityProfile(transaction, id, addressId, dto);
            await this.upsertFacilityCapabilities(transaction, id, this.mapDetailedCapabilities(dto));

            if (dto.roomRates?.length) {
                await this.upsertFacilityRoomRates(transaction, id, dto.roomRates);
            }

            await this.createFacilitySettingsAuditLog(transaction, id, dto, userId);
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
