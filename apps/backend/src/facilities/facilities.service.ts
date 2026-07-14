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

  private serialize(data: unknown) {
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

  async findAll() {
    const facilities = await this.prisma.facility.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });

    return this.serialize(facilities);
  }

  private async getDefaultFacility() {
    const facility = await this.prisma.facility.findUnique({
      where: { facilityCode: DEFAULT_FACILITY_CODE },
    });

    if (!facility) {
      throw new NotFoundException('Facility settings not found. Please run the Prisma seed first.');
    }

    return facility;
  }

  async getFacilitySettings() {
    const facility = await this.getDefaultFacility();
    const [rooms, roomRates, capabilities] = await Promise.all([
      this.prisma.rooms.findMany({
        where: {
          facility_id: facility.id,
          is_deleted: false,
        },
        include: { beds: true },
        orderBy: { room_number: 'asc' },
      }),
      this.prisma.facility_room_rates.findMany({
        where: { facility_id: facility.id },
        orderBy: { room_type: 'asc' },
      }),
      this.prisma.facility_clinical_capabilities.findMany({
        where: { facility_id: facility.id },
        orderBy: { id: 'asc' },
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
      timezone: facility.timezone,
      phoneNumber: facility.phoneNumber,
      roomSummary: `${roomRows.length} rooms configured across 3 wings`,
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

  async updateFacilitySettings(dto: UpdateFacilitySettingsDto) {
    const facility = await this.getDefaultFacility();

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
            await tx.rooms.update({
              where: { id: room.roomId },
              data: {
                room_number: room.roomNumber,
                room_type: room.roomType,
                is_deleted: false,
              },
            });

            await tx.beds.update({
              where: { id: room.bedId },
              data: {
                bed_number: room.bedNumber,
                status: room.status,
              },
            });
          } else {
            let savedRoom = await tx.rooms.findUnique({
              where: {
                facility_id_room_number: {
                  facility_id: facility.id,
                  room_number: room.roomNumber,
                },
              },
            });

            if (!savedRoom) {
              savedRoom = await tx.rooms.create({
                data: {
                  facility_id: facility.id,
                  room_number: room.roomNumber,
                  room_type: room.roomType,
                },
              });
            } else {
              savedRoom = await tx.rooms.update({
                where: { id: savedRoom.id },
                data: {
                  room_type: room.roomType,
                  is_deleted: false,
                },
              });
            }

            const savedBed = await tx.beds.findFirst({
              where: {
                room_id: savedRoom.id,
                bed_number: room.bedNumber,
              },
            });

            if (savedBed) {
              await tx.beds.update({
                where: { id: savedBed.id },
                data: { status: room.status },
              });
            } else {
              await tx.beds.create({
                data: {
                  room_id: savedRoom.id,
                  bed_number: room.bedNumber,
                  status: room.status,
                },
              });
            }
          }
        }
      }

      if (dto.roomRates) {
        for (const rate of dto.roomRates) {
          await tx.facility_room_rates.upsert({
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
          await tx.facility_clinical_capabilities.upsert({
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

    return this.getFacilitySettings();
  }
}
