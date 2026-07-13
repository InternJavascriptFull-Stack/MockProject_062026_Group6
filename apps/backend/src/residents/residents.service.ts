import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateResidentDto } from "./dto/create-resident.dto.js";
import { ListResidentsQueryDto } from "./dto/list-residents-query.dto.js";
import { UpdateResidentStatusDto } from "./dto/update-resident-status.dto.js";
import { UpdateResidentDto } from "./dto/update-resident.dto.js";

@Injectable()
export class ResidentsService {
    constructor(private readonly prisma: PrismaService) {}

    private serializeResident(resident: any) {
        const fullName = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean).join(" ");
        const roomNumber = resident.beds?.rooms?.room_number ?? undefined;

        return {
            id: resident.id,
            residentCode: `NH-${String(resident.id).slice(0, 8).toUpperCase()}`,
            fullName,
            dateOfBirth: resident.date_of_birth.toISOString().slice(0, 10),
            gender: String(resident.gender ?? "other").toLowerCase(),
            phone: undefined,
            address: undefined,
            admissionDate: resident.created_at.toISOString().slice(0, 10),
            roomNumber,
            careLevel: "assisted_living",
            status: this.toApiStatus(resident.status),
            assignedNurse: undefined,
            assignedDoctor: undefined,
            emergencyContactName: "Not provided",
            emergencyContactRelationship: undefined,
            emergencyContactPhone: "Not provided",
            emergencyContactEmail: undefined,
            primaryDiagnosis: undefined,
            allergies: undefined,
            currentMedications: undefined,
            mobilityStatus: undefined,
        };
    }

    private toDate(value: string) {
        return new Date(`${value}T00:00:00.000Z`);
    }

    private splitFullName(fullName: string) {
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts.shift() ?? fullName.trim();
        const lastName = parts.pop() ?? firstName;
        const middleName = parts.length ? parts.join(" ") : null;

        return {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
        };
    }

    private toApiStatus(status: string) {
        const normalized = status.toUpperCase();

        if (normalized === "ACTIVE") {
            return "admitted";
        }

        if (normalized === "DISCHARGED") {
            return "discharged";
        }

        return "pending";
    }

    private toDbStatus(status?: string) {
        if (status === "admitted") {
            return "ACTIVE";
        }

        if (status === "discharged") {
            return "DISCHARGED";
        }

        return "PENDING";
    }

    async findAll(query: ListResidentsQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const search = query.search?.trim();

        const where: Prisma.residentsWhereInput = {
            ...(query.status && query.status !== "all" ? { status: this.toDbStatus(query.status) } : {}),
            ...(search
                ? {
                      OR: [{ first_name: { contains: search } }, { middle_name: { contains: search } }, { last_name: { contains: search } }],
                  }
                : {}),
        };

        const [residents, total] = await Promise.all([
            this.prisma.residents.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: { beds: { include: { rooms: true } } },
            }),
            this.prisma.residents.count({ where }),
        ]);

        return {
            data: residents.map((resident) => this.serializeResident(resident)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const resident = await this.prisma.residents.findUnique({
            where: { id },
            include: { beds: { include: { rooms: true } } },
        });

        if (!resident) {
            throw new NotFoundException(`Resident with ID ${id} not found`);
        }

        return this.serializeResident(resident);
    }

    async create(dto: CreateResidentDto) {
        const resident = await this.prisma.residents.create({
            data: {
                ...this.splitFullName(dto.fullName),
                date_of_birth: this.toDate(dto.dateOfBirth),
                gender: dto.gender.toUpperCase(),
                status: "PENDING",
            },
            include: { beds: { include: { rooms: true } } },
        });

        return this.serializeResident(resident);
    }

    async update(id: string, dto: UpdateResidentDto) {
        await this.findOne(id);

        const data: Prisma.residentsUpdateInput = {
            ...(dto.fullName !== undefined ? this.splitFullName(dto.fullName) : {}),
            ...(dto.dateOfBirth !== undefined ? { date_of_birth: this.toDate(dto.dateOfBirth) } : {}),
            ...(dto.gender !== undefined ? { gender: dto.gender.toUpperCase() } : {}),
        };

        const resident = await this.prisma.residents.update({
            where: { id },
            data,
            include: { beds: { include: { rooms: true } } },
        });

        return this.serializeResident(resident);
    }

    async updateStatus(id: string, dto: UpdateResidentStatusDto) {
        await this.findOne(id);

        const resident = await this.prisma.residents.update({
            where: { id },
            data: { status: this.toDbStatus(dto.status) },
            include: { beds: { include: { rooms: true } } },
        });

        return this.serializeResident(resident);
    }
}
