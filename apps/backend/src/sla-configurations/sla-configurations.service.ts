import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSlaConfigurationDto } from './dto/update-sla-configuration.dto.js';

@Injectable()
export class SlaConfigurationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Shape a row (with its related severity) into the API contract for GET.
  private toResponse(config: {
    id: bigint;
    sla_window_hrs: number;
    incident_severities: { id: bigint; level_name: string };
  }) {
    return {
      id: Number(config.id),
      severity: {
        id: Number(config.incident_severities.id),
        levelName: config.incident_severities.level_name,
      },
      slaWindowHrs: config.sla_window_hrs,
    };
  }

  async findAll() {
    const configs = await this.prisma.sla_configs.findMany({
      include: { incident_severities: true },
      orderBy: { severity_id: 'asc' },
    });

    return {
      message: 'SLA configurations retrieved successfully.',
      data: configs.map((config) => this.toResponse(config)),
    };
  }

  async update(id: string, dto: UpdateSlaConfigurationDto) {
    const config = await this.prisma.sla_configs.findUnique({
      where: { id: BigInt(id) },
    });

    if (!config) {
      throw new NotFoundException('SLA configuration not found.');
    }

    const updated = await this.prisma.sla_configs.update({
      where: { id: BigInt(id) },
      data: { sla_window_hrs: dto.slaWindowHrs },
    });

    return {
      message: 'SLA configuration updated successfully.',
      data: {
        id: Number(updated.id),
        severityId: Number(updated.severity_id),
        slaWindowHrs: updated.sla_window_hrs,
      },
    };
  }
}
