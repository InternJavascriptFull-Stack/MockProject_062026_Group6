import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreatePreScreeningDto } from "./dto/create-pre-screening.dto.js";

@Injectable()
export class AdmissionsService {
    constructor(private readonly prisma: PrismaService) {}

    private serializeResident(resident: any) {
        const fullName = [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean).join(" ");

        return {
            id: resident.id,
            residentCode: `NH-${String(resident.id).slice(0, 8).toUpperCase()}`,
            fullName,
            dateOfBirth: resident.date_of_birth.toISOString().slice(0, 10),
            gender: String(resident.gender ?? "other").toLowerCase(),
            phone: undefined,
            address: undefined,
            admissionDate: resident.created_at.toISOString().slice(0, 10),
            roomNumber: undefined,
            careLevel: "assisted_living",
            status: "under_evaluation",
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
            cognitiveStatus: undefined,
            fallRisk: undefined,
            painLevel: undefined,
            nutritionNotes: undefined,
            clinicalNotes: undefined,
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

    async createPreScreening(dto: CreatePreScreeningDto) {
        const resident = await this.prisma.residents.create({
            data: {
                ...this.splitFullName(dto.personalInfo.fullName),
                date_of_birth: this.toDate(dto.personalInfo.dateOfBirth),
                gender: dto.personalInfo.gender.toUpperCase(),
                status: "PENDING",
            },
        });

        return this.serializeResident(resident);
    }
}
