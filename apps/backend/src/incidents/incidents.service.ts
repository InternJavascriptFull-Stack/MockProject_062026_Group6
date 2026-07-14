import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service.js";
import { AddIncidentNoteDto, CreateIncidentDto, ResolveIncidentDto, SubmitExternalReportDto, UpdateInvestigationDto } from "./dto/incident.dto.js";

interface IncidentMetadata {
    incidentId: string;
    location?: string;
    immediateAction?: string;
    occurredAt?: string;
    rootCause?: string;
    correctiveAction?: string;
    preventiveAction?: string;
    witnesses?: string[];
    externalReport?: {
        agency: string;
        referenceNumber: string;
        submittedAt: string;
        submittedBy: string;
        notes?: string;
        receiptId?: string;
        storedAt?: string;
    };
    resolution?: string;
    followUpPlan?: string;
}

@Injectable()
export class IncidentsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        const incidents = await this.prisma.incidents.findMany({
            include: {
                residents: { include: { beds: { include: { rooms: true } } } },
                users: true,
                incident_severities: true,
            },
            orderBy: { reported_at: "desc" },
        });

        const metadata = await this.getMetadataByIncidentIds(incidents.map((incident) => incident.id));

        return incidents.map((incident) => this.mapIncident(incident, metadata.get(incident.id)));
    }

    async findOne(id: string) {
        const incident = await this.prisma.incidents.findUnique({
            where: { id },
            include: {
                residents: { include: { beds: { include: { rooms: true } } } },
                users: true,
                incident_severities: true,
                chart_lock_events: { orderBy: { event_time: "desc" } },
            },
        });

        if (!incident) {
            throw new NotFoundException(`Incident with ID ${id} not found`);
        }

        const records = await this.prisma.clinical_records.findMany({
            where: {
                resident_id: incident.resident_id,
                is_deleted: false,
                record_type: { in: ["INCIDENT_METADATA", "INCIDENT_NOTE", "EXTERNAL_REPORT", "INCIDENT_RESOLUTION"] },
            },
            include: { users: true },
            orderBy: { created_at: "asc" },
        });

        const relevantRecords = records.filter((record) => {
            const data = this.parseJson(record.description);
            return data?.incidentId === id;
        });
        const metadataRecord = relevantRecords.find((record) => record.record_type === "INCIDENT_METADATA");
        const metadata = metadataRecord ? (this.parseJson(metadataRecord.description) as IncidentMetadata) : undefined;

        const timeline = [
            {
                id: `reported-${id}`,
                type: "REPORTED",
                description: "Incident reported",
                timestamp: incident.reported_at.toISOString(),
                user: this.fullName(incident.users),
            },
            ...relevantRecords
                .filter((record) => record.record_type !== "INCIDENT_METADATA")
                .map((record) => {
                    const data = this.parseJson(record.description) ?? {};
                    return {
                        id: record.id,
                        type: record.record_type,
                        description: data.note ?? data.notes ?? data.resolution ?? `${record.record_type.replaceAll("_", " ")} recorded`,
                        timestamp: record.created_at.toISOString(),
                        user: this.fullName(record.users),
                        data,
                    };
                }),
            ...incident.chart_lock_events.map((event) => ({
                id: event.id,
                type: event.unlocked_by ? "CHART_UNLOCKED" : "CHART_LOCKED",
                description: event.unlocked_by ? event.unlock_reason || "Chart unlocked" : event.lock_reason || "Chart locked",
                timestamp: event.event_time.toISOString(),
                user: event.unlocked_by || event.locked_by || "System",
            })),
        ].sort((left, right) => left.timestamp.localeCompare(right.timestamp));

        return {
            ...this.mapIncident(incident, metadata),
            investigation: {
                rootCause: metadata?.rootCause ?? "",
                correctiveAction: metadata?.correctiveAction ?? "",
                preventiveAction: metadata?.preventiveAction ?? "",
                witnesses: metadata?.witnesses ?? [],
            },
            externalReport: metadata?.externalReport ?? null,
            resolution: metadata?.resolution ?? null,
            followUpPlan: metadata?.followUpPlan ?? null,
            timeline,
        };
    }

    async create(dto: CreateIncidentDto, userId: string) {
        const [resident, severity] = await Promise.all([
            this.prisma.residents.findUnique({ where: { id: dto.residentId } }),
            this.prisma.incident_severities.findUnique({
                where: { id: BigInt(dto.severityId) },
                include: { sla_configs: true },
            }),
        ]);

        if (!resident || resident.is_deleted) {
            throw new NotFoundException("Resident not found");
        }
        if (!severity) {
            throw new NotFoundException("Incident severity not found");
        }

        const slaHours = severity.sla_configs[0]?.sla_window_hrs ?? 24;
        const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        const incident = await this.prisma.$transaction(async (transaction) => {
            const created = await transaction.incidents.create({
                data: {
                    resident_id: dto.residentId,
                    incident_type: dto.incidentType,
                    severity_id: BigInt(dto.severityId),
                    description: dto.description,
                    reported_by: userId,
                    sla_deadline: slaDeadline,
                    status: "OPEN",
                },
            });

            const metadata: IncidentMetadata = {
                incidentId: created.id,
                location: dto.location,
                immediateAction: dto.immediateAction,
                occurredAt: dto.occurredAt ?? new Date().toISOString(),
            };
            await transaction.clinical_records.create({
                data: {
                    resident_id: dto.residentId,
                    recorded_by: userId,
                    record_type: "INCIDENT_METADATA",
                    description: JSON.stringify(metadata),
                },
            });

            if (severity.chart_lock_trigger && !resident.is_chart_locked) {
                await transaction.residents.update({
                    where: { id: dto.residentId },
                    data: { is_chart_locked: true },
                });
                await transaction.chart_lock_events.create({
                    data: {
                        incident_id: created.id,
                        locked_by_system: true,
                        lock_reason: `${severity.level_name} incident automatically locked the chart`,
                    },
                });
            }

            await transaction.audit_logs.create({
                data: {
                    table_name: "incidents",
                    record_id: created.id,
                    action: "CREATE",
                    performed_by: userId,
                    new_data: JSON.stringify({
                        incidentType: dto.incidentType,
                        severityId: dto.severityId,
                        chartLocked: severity.chart_lock_trigger,
                    }),
                },
            });

            if (dto.notifyDon !== false) {
                const donUsers = await transaction.user.findMany({
                    where: {
                        isDeleted: false,
                        status: "ACTIVE",
                        role: { roleName: { in: ["DON (Director of Nursing)", "System Admin"] } },
                    },
                    select: { id: true },
                });
                if (donUsers.length > 0) {
                    await transaction.notifications.createMany({
                        data: donUsers.map((user) => ({
                            user_id: user.id,
                            title: `New ${severity.level_name} incident: ${dto.incidentType}`,
                            type: "INCIDENT_REVIEW",
                        })),
                    });
                }
            }
            return created;
        });

        return {
            success: true,
            message: severity.chart_lock_trigger ? "Incident reported and resident chart locked automatically" : "Incident reported successfully",
            data: await this.findOne(incident.id),
        };
    }

    async updateInvestigation(incidentId: string, dto: UpdateInvestigationDto, userId: string) {
        await this.requirePrivilegedUser(userId);
        const incident = await this.requireIncident(incidentId);
        const metadataRecord = await this.getOrCreateMetadataRecord(incident, userId);
        const metadata = this.parseJson(metadataRecord.description) as IncidentMetadata;
        Object.assign(metadata, {
            rootCause: dto.rootCause ?? metadata.rootCause,
            correctiveAction: dto.correctiveAction ?? metadata.correctiveAction,
            preventiveAction: dto.preventiveAction ?? metadata.preventiveAction,
            witnesses: dto.witnesses ?? metadata.witnesses,
        });

        await this.prisma.$transaction([
            this.prisma.clinical_records.update({
                where: { id: metadataRecord.id },
                data: { description: JSON.stringify(metadata), updated_at: new Date() },
            }),
            this.prisma.incidents.update({
                where: { id: incidentId },
                data: { status: dto.status ?? "UNDER_INVESTIGATION" },
            }),
            this.prisma.audit_logs.create({
                data: {
                    table_name: "incidents",
                    record_id: incidentId,
                    action: "UPDATE",
                    performed_by: userId,
                    new_data: JSON.stringify(dto),
                },
            }),
        ]);

        return {
            success: true,
            message: "Investigation updated successfully",
            data: await this.findOne(incidentId),
        };
    }

    async addProgressNote(incidentId: string, dto: AddIncidentNoteDto, userId: string) {
        const incident = await this.requireIncident(incidentId);
        const note = await this.prisma.clinical_records.create({
            data: {
                resident_id: incident.resident_id,
                recorded_by: userId,
                record_type: "INCIDENT_NOTE",
                description: JSON.stringify({
                    incidentId,
                    note: dto.note,
                    noteType: dto.noteType ?? "PROGRESS",
                }),
            },
            include: { users: true },
        });
        return {
            success: true,
            message: "Progress note added",
            data: {
                id: note.id,
                note: dto.note,
                createdAt: note.created_at.toISOString(),
                createdBy: this.fullName(note.users),
            },
        };
    }

    async requestDonReview(incidentId: string, userId: string) {
        const incident = await this.requireIncident(incidentId);
        const donUsers = await this.prisma.user.findMany({
            where: {
                isDeleted: false,
                status: "ACTIVE",
                role: { roleName: { in: ["DON (Director of Nursing)", "System Admin"] } },
            },
            select: { id: true },
        });

        await this.prisma.$transaction(async (transaction) => {
            await transaction.incidents.update({
                where: { id: incidentId },
                data: { status: "PENDING_REVIEW" },
            });
            if (donUsers.length > 0) {
                await transaction.notifications.createMany({
                    data: donUsers.map((user) => ({
                        user_id: user.id,
                        title: `Incident ${incident.incident_type} is ready for DON review`,
                        type: "INCIDENT_REVIEW",
                    })),
                });
            }
            await transaction.audit_logs.create({
                data: {
                    table_name: "incidents",
                    record_id: incidentId,
                    action: "UPDATE",
                    performed_by: userId,
                    new_data: JSON.stringify({ status: "PENDING_REVIEW" }),
                },
            });
        });

        return { success: true, message: "Incident sent to DON review queue" };
    }

    async submitExternalReport(incidentId: string, dto: SubmitExternalReportDto, userId: string) {
        const incident = await this.requireIncident(incidentId);
        const user = await this.requireValidPassword(userId, dto.passwordConfirm);
        this.assertPrivilegedRole(user.role.roleName);
        const metadataRecord = await this.getOrCreateMetadataRecord(incident, userId);
        const metadata = this.parseJson(metadataRecord.description) as IncidentMetadata;
        metadata.externalReport = {
            agency: dto.agency,
            referenceNumber: dto.referenceNumber ?? `EXT-${Date.now().toString().slice(-8)}`,
            submittedAt: dto.submittedAt ?? new Date().toISOString(),
            submittedBy: this.fullName(user),
            notes: dto.notes,
            receiptId: `RCP-${incidentId.slice(0, 8).toUpperCase()}-${Date.now()}`,
            storedAt: new Date().toISOString(),
        };

        await this.prisma.$transaction([
            this.prisma.clinical_records.update({
                where: { id: metadataRecord.id },
                data: { description: JSON.stringify(metadata), updated_at: new Date() },
            }),
            this.prisma.clinical_records.create({
                data: {
                    resident_id: incident.resident_id,
                    recorded_by: userId,
                    record_type: "EXTERNAL_REPORT",
                    description: JSON.stringify({
                        incidentId,
                        ...metadata.externalReport,
                    }),
                },
            }),
            this.prisma.incidents.update({
                where: { id: incidentId },
                data: { status: "SUBMITTED" },
            }),
            this.prisma.audit_logs.create({
                data: {
                    table_name: "incidents",
                    record_id: incidentId,
                    action: "UPDATE",
                    performed_by: userId,
                    new_data: JSON.stringify({ status: "SUBMITTED", externalReport: metadata.externalReport }),
                },
            }),
        ]);

        return {
            success: true,
            message: "External report submitted successfully",
            data: metadata.externalReport,
        };
    }

    async resolve(incidentId: string, dto: ResolveIncidentDto, userId: string) {
        await this.requirePrivilegedUser(userId);
        const incident = await this.requireIncident(incidentId);
        if (incident.residents.is_chart_locked) {
            throw new ConflictException("Unlock the resident chart before resolving the incident");
        }
        const metadataRecord = await this.getOrCreateMetadataRecord(incident, userId);
        const metadata = this.parseJson(metadataRecord.description) as IncidentMetadata;
        if (!metadata.externalReport && incident.incident_severities.chart_lock_trigger) {
            throw new ConflictException("External report is required before resolving this incident");
        }
        metadata.resolution = dto.resolution;
        metadata.followUpPlan = dto.followUpPlan;

        await this.prisma.$transaction([
            this.prisma.clinical_records.update({
                where: { id: metadataRecord.id },
                data: { description: JSON.stringify(metadata), updated_at: new Date() },
            }),
            this.prisma.clinical_records.create({
                data: {
                    resident_id: incident.resident_id,
                    recorded_by: userId,
                    record_type: "INCIDENT_RESOLUTION",
                    description: JSON.stringify({ incidentId, ...dto }),
                },
            }),
            this.prisma.incidents.update({
                where: { id: incidentId },
                data: { status: "RESOLVED" },
            }),
            this.prisma.audit_logs.create({
                data: {
                    table_name: "incidents",
                    record_id: incidentId,
                    action: "UPDATE",
                    performed_by: userId,
                    new_data: JSON.stringify({ status: "RESOLVED", ...dto }),
                },
            }),
        ]);

        return { success: true, message: "Incident resolved successfully" };
    }

    async lockChart(incidentId: string, reason: string, userId: string) {
        const incident = await this.requireIncident(incidentId);
        if (incident.residents.is_chart_locked) {
            throw new ConflictException("Resident chart is already locked");
        }

        await this.prisma.$transaction(async (transaction) => {
            await transaction.residents.update({
                where: { id: incident.resident_id },
                data: { is_chart_locked: true },
            });
            await transaction.chart_lock_events.create({
                data: {
                    incident_id: incidentId,
                    locked_by_system: false,
                    locked_by: userId,
                    lock_reason: reason,
                },
            });
            await transaction.audit_logs.create({
                data: {
                    table_name: "residents",
                    record_id: incident.resident_id,
                    action: "UPDATE",
                    performed_by: userId,
                    new_data: JSON.stringify({ isChartLocked: true, incidentId, reason }),
                },
            });
        });

        return {
            success: true,
            message: "Chart locked successfully",
            data: { incidentId, chartLocked: true, lockedAt: new Date().toISOString(), reason },
        };
    }

    async unlockChart(incidentId: string, reason: string, passwordConfirm: string, userId: string) {
        const incident = await this.requireIncident(incidentId);
        if (!incident.residents.is_chart_locked) {
            throw new ConflictException("Resident chart is not locked");
        }
        const user = await this.requireValidPassword(userId, passwordConfirm);
        this.assertPrivilegedRole(user.role.roleName);

        await this.prisma.$transaction(async (transaction) => {
            await transaction.residents.update({
                where: { id: incident.resident_id },
                data: { is_chart_locked: false },
            });
            const openEvent = await transaction.chart_lock_events.findFirst({
                where: { incident_id: incidentId, unlocked_by: null },
                orderBy: { event_time: "desc" },
            });
            if (openEvent) {
                await transaction.chart_lock_events.update({
                    where: { id: openEvent.id },
                    data: { unlocked_by: userId, unlock_reason: reason },
                });
            } else {
                await transaction.chart_lock_events.create({
                    data: {
                        incident_id: incidentId,
                        locked_by_system: false,
                        unlocked_by: userId,
                        unlock_reason: reason,
                    },
                });
            }
            await transaction.audit_logs.create({
                data: {
                    table_name: "residents",
                    record_id: incident.resident_id,
                    action: "UPDATE",
                    performed_by: userId,
                    new_data: JSON.stringify({ isChartLocked: false, incidentId, reason }),
                },
            });
        });

        return {
            success: true,
            message: "Chart unlocked successfully",
            data: {
                incidentId,
                chartLocked: false,
                unlockedAt: new Date().toISOString(),
                unlockedBy: { id: userId, name: this.fullName(user) },
                reason,
            },
        };
    }

    private async requireIncident(id: string) {
        const incident = await this.prisma.incidents.findUnique({
            where: { id },
            include: { residents: true, incident_severities: true },
        });
        if (!incident) {
            throw new NotFoundException(`Incident with ID ${id} not found`);
        }
        return incident;
    }

    private async requireValidPassword(userId: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
        if (!user) {
            throw new ForbiddenException("User not found");
        }
        if (!(await bcrypt.compare(password, user.passwordHash))) {
            throw new BadRequestException("Invalid confirmation password");
        }
        return user;
    }

    private async requirePrivilegedUser(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
        if (!user) {
            throw new ForbiddenException("User not found");
        }
        this.assertPrivilegedRole(user.role.roleName);
        return user;
    }

    private assertPrivilegedRole(roleName: string) {
        if (!["DON (Director of Nursing)", "System Admin"].includes(roleName)) {
            throw new ForbiddenException("This action is restricted to DON or System Admin users");
        }
    }

    private async getOrCreateMetadataRecord(incident: Awaited<ReturnType<IncidentsService["requireIncident"]>>, userId: string) {
        const records = await this.prisma.clinical_records.findMany({
            where: {
                resident_id: incident.resident_id,
                record_type: "INCIDENT_METADATA",
                is_deleted: false,
            },
            orderBy: { created_at: "desc" },
        });
        const existing = records.find((record) => this.parseJson(record.description)?.incidentId === incident.id);
        if (existing) {
            return existing;
        }
        return this.prisma.clinical_records.create({
            data: {
                resident_id: incident.resident_id,
                recorded_by: userId,
                record_type: "INCIDENT_METADATA",
                description: JSON.stringify({ incidentId: incident.id }),
            },
        });
    }

    private async getMetadataByIncidentIds(ids: string[]) {
        const records = await this.prisma.clinical_records.findMany({
            where: { record_type: "INCIDENT_METADATA", is_deleted: false },
            orderBy: { created_at: "desc" },
        });
        const idSet = new Set(ids);
        const result = new Map<string, IncidentMetadata>();
        for (const record of records) {
            const data = this.parseJson(record.description) as IncidentMetadata | null;
            if (data?.incidentId && idSet.has(data.incidentId) && !result.has(data.incidentId)) {
                result.set(data.incidentId, data);
            }
        }
        return result;
    }

    private mapIncident(incident: any, metadata?: IncidentMetadata) {
        const isSlaStopped = ["SUBMITTED", "RESOLVED"].includes(incident.status);
        const remainingMilliseconds = isSlaStopped ? 0 : new Date(incident.sla_deadline).getTime() - Date.now();
        return {
            id: incident.id,
            incidentType: incident.incident_type,
            status: incident.status,
            description: incident.description,
            location: metadata?.location ?? incident.residents?.beds?.rooms?.room_number ?? "Not specified",
            immediateAction: metadata?.immediateAction ?? "",
            occurredAt: metadata?.occurredAt ?? incident.reported_at.toISOString(),
            reportedAt: incident.reported_at.toISOString(),
            slaDeadline: incident.sla_deadline.toISOString(),
            slaRemainingMinutes: Math.ceil(remainingMilliseconds / 60000),
            isSlaOverdue: !isSlaStopped && remainingMilliseconds < 0,
            isSlaStopped,
            resident: {
                id: incident.residents.id,
                fullName: this.fullName(incident.residents),
                isChartLocked: incident.residents.is_chart_locked,
                roomNumber: incident.residents?.beds?.rooms?.room_number ?? null,
            },
            reporter: {
                id: incident.users.id,
                name: this.fullName(incident.users),
            },
            severity: {
                id: incident.incident_severities.id.toString(),
                name: incident.incident_severities.level_name,
                chartLockTrigger: incident.incident_severities.chart_lock_trigger,
            },
        };
    }

    private fullName(person: any): string {
        return [person.firstName ?? person.first_name, person.middleName ?? person.middle_name, person.lastName ?? person.last_name].filter(Boolean).join(" ");
    }

    private parseJson(value: string): any | null {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
}
