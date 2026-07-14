import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateIncidentSeverityDto } from "./dto/update-incident-severity.dto.js";

interface IncidentSeverityRow {
    id: bigint;
    level_name: string;
    description: string | null;
    chart_lock_trigger: boolean;
}

@Injectable()
export class IncidentSeveritiesService {
    constructor(private readonly prisma: PrismaService) {}

    private toResponse(severity: IncidentSeverityRow) {
        return {
            id: Number(severity.id),
            levelName: severity.level_name,
            description: severity.description,
            chartLockTrigger: severity.chart_lock_trigger,
        };
    }

    async findAll() {
        const severities = await this.prisma.$queryRaw<IncidentSeverityRow[]>(Prisma.sql`
            SELECT id, level_name, description, chart_lock_trigger
            FROM incident_severities
            ORDER BY id
        `);

        return {
            message: "Incident severities retrieved successfully.",
            data: severities.map((severity) => this.toResponse(severity)),
        };
    }

    async update(id: string, dto: UpdateIncidentSeverityDto) {
        const numericId = BigInt(id);
        const rows = await this.prisma.$queryRaw<IncidentSeverityRow[]>(Prisma.sql`
            SELECT id, level_name, description, chart_lock_trigger
            FROM incident_severities
            WHERE id = ${numericId}
        `);

        if (!rows[0]) {
            throw new NotFoundException("Incident severity not found.");
        }

        const current = rows[0];
        await this.prisma.$executeRaw(Prisma.sql`
            UPDATE incident_severities
            SET level_name = ${dto.levelName ?? current.level_name},
                description = ${dto.description ?? current.description},
                chart_lock_trigger = ${dto.chartLockTrigger ?? current.chart_lock_trigger}
            WHERE id = ${numericId}
        `);

        const updatedRows = await this.prisma.$queryRaw<IncidentSeverityRow[]>(Prisma.sql`
            SELECT id, level_name, description, chart_lock_trigger
            FROM incident_severities
            WHERE id = ${numericId}
        `);

        return {
            message: "Incident severity updated successfully.",
            data: this.toResponse(updatedRows[0]),
        };
    }
}
