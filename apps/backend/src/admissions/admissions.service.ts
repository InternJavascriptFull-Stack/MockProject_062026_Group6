import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateAdmissionDto } from "./dto/create-admission.dto.js";
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
            admissionDate: resident.created_at.toISOString().slice(0, 10),
            status: resident.status,
            isChartLocked: resident.is_chart_locked,
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
        return { first_name: firstName, middle_name: middleName, last_name: lastName };
    }

    private async calculateScreeningStatus(dto: CreatePreScreeningDto): Promise<{ status: string; reasons: string[] }> {
        const combinedNotes = `${dto.medicalSummary.primaryDiagnosis ?? ""} ${dto.initialEvaluation.clinicalNotes ?? ""}`.toLowerCase();
        const requestedCapabilities: string[] = [];
        if (combinedNotes.includes("bariatric")) requestedCapabilities.push("bariatric");
        if (combinedNotes.includes("ventilator")) requestedCapabilities.push("ventilator");
        if (dto.admissionInfo.careLevel === "memory_care") requestedCapabilities.push("memory-care");
        if (dto.admissionInfo.careLevel === "skilled_nursing") requestedCapabilities.push("skilled-nursing");

        const facility = await this.prisma.facility.findFirst({ where: { isDeleted: false }, select: { id: true } });
        if (!facility || !requestedCapabilities.length) return { status: "COMPLETED", reasons: [] };
        const settingsLog = await this.prisma.audit_logs.findFirst({
            where: { table_name: "facility_settings", record_id: facility.id },
            orderBy: { performed_at: "desc" },
        });
        if (!settingsLog?.new_data) return { status: "COMPLETED", reasons: [] };
        try {
            const settings = JSON.parse(settingsLog.new_data) as { capabilities?: { code: string; supported: boolean; note?: string }[] };
            const unsupported = (settings.capabilities ?? []).filter((capability) => requestedCapabilities.includes(capability.code) && !capability.supported);
            return unsupported.length
                ? { status: "REJECTED", reasons: unsupported.map((capability) => capability.note ?? `${capability.code} is not supported`) }
                : { status: "COMPLETED", reasons: [] };
        } catch {
            return { status: "COMPLETED", reasons: [] };
        }
    }

    async createPreScreening(dto: CreatePreScreeningDto, userId: string) {
        const screeningResult = await this.calculateScreeningStatus(dto);
        const result = await this.prisma.$transaction(async (transaction) => {
            const resident = await transaction.residents.create({
                data: {
                    ...this.splitFullName(dto.personalInfo.fullName),
                    date_of_birth: this.toDate(dto.personalInfo.dateOfBirth),
                    gender: dto.personalInfo.gender.toUpperCase(),
                    status: screeningResult.status === "REJECTED" ? "PENDING" : "PENDING",
                },
            });
            const contactName = this.splitFullName(dto.emergencyContact.name);
            const contact = await transaction.contacts.create({
                data: {
                    ...contactName,
                    phone_primary: dto.emergencyContact.phone,
                    email: dto.emergencyContact.email,
                },
            });
            await transaction.resident_contacts.create({
                data: {
                    resident_id: resident.id,
                    contact_id: contact.id,
                    relationship_type: dto.emergencyContact.relationship || "Emergency Contact",
                    is_emergency_contact: true,
                    is_primary: true,
                },
            });
            const screening = await transaction.pre_admission_screenings.create({
                data: { resident_id: resident.id, screened_by: userId, status: screeningResult.status },
            });
            await transaction.clinical_records.create({
                data: {
                    resident_id: resident.id,
                    recorded_by: userId,
                    record_type: "PROGRESS_NOTE",
                    description: JSON.stringify({
                        type: "PRE_ADMISSION_SCREENING",
                        screeningId: screening.id,
                        admissionInfo: dto.admissionInfo,
                        medicalSummary: dto.medicalSummary,
                        initialEvaluation: dto.initialEvaluation,
                        contact: dto.emergencyContact,
                        screeningReasons: screeningResult.reasons,
                    }),
                },
            });
            return { resident, screening };
        });

        return {
            ...this.serializeResident(result.resident),
            screening: {
                id: result.screening.id,
                status: result.screening.status,
                reasons: screeningResult.reasons,
                createdAt: result.screening.created_at.toISOString(),
            },
        };
    }

    async createAdmission(dto: CreateAdmissionDto, userId: string) {
        const resident = await this.prisma.residents.findUnique({ where: { id: dto.residentId } });
        if (!resident || resident.is_deleted) throw new NotFoundException("Resident not found");
        const latestScreening = await this.prisma.pre_admission_screenings.findFirst({
            where: { resident_id: dto.residentId },
            orderBy: { created_at: "desc" },
        });
        if (latestScreening?.status === "REJECTED") throw new BadRequestException("Rejected screening must be resolved before admission");
        const requiredConsents = ["Admission Agreement", "HIPAA Notice of Privacy Practices", "Financial Responsibility Agreement", "Advance Directive Acknowledgment"];
        const missingConsents = requiredConsents.filter((consent) => !dto.consents.includes(consent));
        if (missingConsents.length) {
            throw new BadRequestException(`Missing required consents: ${missingConsents.join(", ")}`);
        }

        const result = await this.prisma.$transaction(async (transaction) => {
            const admission = await transaction.admissions.create({
                data: { resident_id: dto.residentId, facility_id: dto.facilityId, admission_date: this.toDate(dto.admissionDate) },
            });
            await transaction.residents.update({
                where: { id: dto.residentId },
                data: { status: "ACTIVE", bed_id: dto.bedId },
            });
            if (dto.bedId) {
                await transaction.beds.update({ where: { id: dto.bedId }, data: { status: "OCCUPIED" } });
            }
            await transaction.clinical_records.create({
                data: {
                    resident_id: dto.residentId,
                    recorded_by: userId,
                    record_type: "PROGRESS_NOTE",
                    description: JSON.stringify({
                        type: "ADMISSION",
                        admissionId: admission.id,
                        payerSource: dto.payerSource,
                        policyNumber: dto.policyNumber,
                        primaryPhysician: dto.primaryPhysician,
                        nurseInCharge: dto.nurseInCharge,
                        consents: dto.consents,
                    }),
                },
            });
            return admission;
        });

        return {
            id: result.id,
            residentId: result.resident_id,
            facilityId: result.facility_id,
            admissionDate: result.admission_date.toISOString().slice(0, 10),
            status: "ADMITTED",
            payerSource: dto.payerSource,
            consents: dto.consents,
        };
    }

    async getResidentAdmissions(residentId: string) {
        const admissions = await this.prisma.admissions.findMany({
            where: { resident_id: residentId },
            include: { facilities: true },
            orderBy: { admission_date: "desc" },
        });
        return admissions.map((admission) => ({
            id: admission.id,
            residentId: admission.resident_id,
            facility: { id: admission.facilities.id, name: admission.facilities.name },
            admissionDate: admission.admission_date.toISOString().slice(0, 10),
            dischargeDate: admission.discharge_date?.toISOString().slice(0, 10) ?? null,
            dischargeReason: admission.discharge_reason,
        }));
    }
}
