import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateFacilitySettingsDto } from './dto/updateFacilitySettings.dto.js';
import {
    BED_STATUS_LABELS,
    DEFAULT_FACILITY_CODE,
    ROOM_OCCUPANT_NOTES,
    STATE_NAMES,
} from './facilities.constants.js';

@Injectable()
export class FacilitiesService {
    constructor(private readonly prisma: PrismaService) {}

    private serializeBigInt(data: unknown) {
        return JSON.parse(
            JSON.stringify(data, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
            ),
        );
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
            return 'Wing C';
        }

        if (numericRoom >= 200) {
            return 'Wing B';
        }

        return 'Wing A';
    }

    private getOccupantNote(status: string, roomNumber: string) {
        if (status === 'MAINTENANCE') {
            return 'Plumbing repair';
        }

        return ROOM_OCCUPANT_NOTES[roomNumber] ?? null;
    }

    private mapBedStatus(status: string) {
        return BED_STATUS_LABELS[status] ?? status;
    }

    async getFacilitySettings() {
        const facilitySettings = await this.prisma.facility.findFirst({
            where: {
                facilityCode: DEFAULT_FACILITY_CODE,
                isDeleted: false,
            },
            include: {
                rooms: {
                    where: { isDeleted: false },
                    include: { beds: true },
                    orderBy: { roomNumber: 'asc' },
                },
                roomRates: {
                    orderBy: { roomType: 'asc' },
                },
                capabilities: {
                    orderBy: { id: 'asc' },
                },
            },
        });

        if (!facilitySettings) {
            throw new NotFoundException('Facility settings not found. Please run the Prisma seed first.');
        }

        const rooms = facilitySettings.rooms.flatMap((room) =>
            room.beds.map((bed) => ({
                roomId: room.id.toString(),
                bedId: bed.id.toString(),
                wing: this.getWing(room.roomNumber),
                roomNumber: room.roomNumber,
                bedNumber: bed.bedNumber,
                roomType: room.roomType,
                status: this.mapBedStatus(bed.status),
                occupantNote: this.getOccupantNote(bed.status, room.roomNumber),
            })),
        );

        return this.serializeBigInt({
            id: facilitySettings.id,
            facilityCode: facilitySettings.facilityCode,
            name: facilitySettings.name,
            licenseNumber: facilitySettings.licenseNumber,
            targetState: facilitySettings.targetState,
            targetStateName: this.getStateName(facilitySettings.targetState),
            timezone: facilitySettings.timezone,
            phoneNumber: facilitySettings.phoneNumber,
            roomSummary: `${rooms.length} rooms configured across 3 wings`,
            rooms,
            roomRates: facilitySettings.roomRates.map((rate) => ({
                id: rate.id.toString(),
                roomType: rate.roomType,
                dailyRate: Number(rate.dailyRate),
                effectiveFrom: this.formatDate(rate.effectiveFrom),
            })),
            capabilities: facilitySettings.capabilities.map((capability) => ({
                id: capability.id.toString(),
                capability: capability.capability,
                supported: capability.supported,
                note: capability.note,
            })),
        });
    }

    async updateFacilitySettings(dto: UpdateFacilitySettingsDto) {
        const facility = await this.prisma.facility.findUnique({
            where: { facilityCode: DEFAULT_FACILITY_CODE },
        });

        if (!facility) {
            throw new NotFoundException('Facility settings not found. Please run the Prisma seed first.');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.facility.update({
                where: { id: facility.id },
                data: {
                    name: dto.name,
                    licenseNumber: dto.licenseNumber,
                    targetState: dto.targetState,
                    timezone: dto.timezone,
                    phoneNumber: dto.phoneNumber,
                },
            });

            if (dto.rooms) {
                for (const room of dto.rooms) {
                    if (room.roomId && room.bedId) {
                        await tx.room.update({
                            where: { id: BigInt(room.roomId) },
                            data: {
                                roomNumber: room.roomNumber,
                                roomType: room.roomType,
                                isDeleted: false,
                            },
                        });

                        await tx.bed.update({
                            where: { id: BigInt(room.bedId) },
                            data: {
                                bedNumber: room.bedNumber,
                                status: room.status,
                            },
                        });
                    } else {
                        const savedRoom = await tx.room.upsert({
                            where: {
                                facilityId_roomNumber: {
                                    facilityId: facility.id,
                                    roomNumber: room.roomNumber,
                                },
                            },
                            update: {
                                roomType: room.roomType,
                                isDeleted: false,
                            },
                            create: {
                                facilityId: facility.id,
                                roomNumber: room.roomNumber,
                                roomType: room.roomType,
                            },
                        });

                        await tx.bed.upsert({
                            where: {
                                roomId_bedNumber: {
                                    roomId: savedRoom.id,
                                    bedNumber: room.bedNumber,
                                },
                            },
                            update: { status: room.status },
                            create: {
                                roomId: savedRoom.id,
                                bedNumber: room.bedNumber,
                                status: room.status,
                            },
                        });
                    }
                }
            }

            if (dto.roomRates) {
                for (const rate of dto.roomRates) {
                    await tx.facilityRoomRate.upsert({
                        where: {
                            facilityId_roomType: {
                                facilityId: facility.id,
                                roomType: rate.roomType,
                            },
                        },
                        update: {
                            dailyRate: rate.dailyRate,
                            effectiveFrom: this.toDate(rate.effectiveFrom),
                        },
                        create: {
                            facilityId: facility.id,
                            roomType: rate.roomType,
                            dailyRate: rate.dailyRate,
                            effectiveFrom: this.toDate(rate.effectiveFrom),
                        },
                    });
                }
            }

            if (dto.capabilities) {
                for (const capability of dto.capabilities) {
                    await tx.facilityClinicalCapability.upsert({
                        where: {
                            facilityId_capability: {
                                facilityId: facility.id,
                                capability: capability.capability,
                            },
                        },
                        update: {
                            supported: capability.supported,
                            note: capability.note ?? null,
                        },
                        create: {
                            facilityId: facility.id,
                            capability: capability.capability,
                            supported: capability.supported,
                            note: capability.note ?? null,
                        },
                    });
                }
            }
        });

        return this.getFacilitySettings();
    }
}
