import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateSlaConfigurationDto } from "./dto/update-sla-configuration.dto.js";

interface SlaConfigurationRow {
    id: bigint;
    sla_window_hrs: number;
    external_report_required: boolean;
    regulatory_body: string | null;
    severity_id: bigint;
    level_name: string;
}

@Injectable()
export class SlaConfigurationsService {
    constructor(private readonly prisma: PrismaService) {}

    private toResponse(config: SlaConfigurationRow) {
        return {
            id: Number(config.id),
            severity: {
                id: Number(config.severity_id),
                levelName: config.level_name,
            },
            slaWindowHrs: config.sla_window_hrs,
            externalReportRequired: config.external_report_required,
            regulatoryBody: config.regulatory_body,
        };
    }

    async findAll() {
        const configs = await this.prisma.$queryRaw<SlaConfigurationRow[]>(Prisma.sql`
            SELECT c.id, c.sla_window_hrs, c.external_report_required, c.regulatory_body,
                   c.severity_id, s.level_name
            FROM sla_configs c
            INNER JOIN incident_severities s ON s.id = c.severity_id
            ORDER BY c.severity_id
        `);

        return {
            message: "SLA configurations retrieved successfully.",
            data: configs.map((config) => this.toResponse(config)),
        };
    }

    async update(id: string, dto: UpdateSlaConfigurationDto) {
        const numericId = BigInt(id);
        const rows = await this.prisma.$queryRaw<SlaConfigurationRow[]>(Prisma.sql`
            SELECT c.id, c.sla_window_hrs, c.external_report_required, c.regulatory_body,
                   c.severity_id, s.level_name
            FROM sla_configs c
            INNER JOIN incident_severities s ON s.id = c.severity_id
            WHERE c.id = ${numericId}
        `);

        if (!rows[0]) {
            throw new NotFoundException("SLA configuration not found.");
        }

        const current = rows[0];
        await this.prisma.$executeRaw(Prisma.sql`
            UPDATE sla_configs
            SET sla_window_hrs = ${dto.slaWindowHrs},
                external_report_required = ${dto.externalReportRequired ?? current.external_report_required},
                regulatory_body = ${dto.regulatoryBody ?? current.regulatory_body}
            WHERE id = ${numericId}
        `);

        const updatedRows = await this.prisma.$queryRaw<SlaConfigurationRow[]>(Prisma.sql`
            SELECT c.id, c.sla_window_hrs, c.external_report_required, c.regulatory_body,
                   c.severity_id, s.level_name
            FROM sla_configs c
            INNER JOIN incident_severities s ON s.id = c.severity_id
            WHERE c.id = ${numericId}
        `);

        return {
            message: "SLA configuration updated successfully.",
            data: this.toResponse(updatedRows[0]),
        };
    }
}
