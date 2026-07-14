import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateIncidentSeverityDto } from './dto/update-incident-severity.dto.js';

@Injectable()
export class IncidentSeveritiesService {
  constructor(private readonly prisma: PrismaService) {}

  // Map a Prisma row to the API contract shape (see docs/API_Document.md).
  private toResponse(severity: {
    id: bigint;
    level_name: string;
    chart_lock_trigger: boolean;
  }) {
    return {
      id: Number(severity.id),
      levelName: severity.level_name,
      chartLockTrigger: severity.chart_lock_trigger,
    };
  }

  async findAll() {
    const severities = await this.prisma.incident_severities.findMany({
      orderBy: { id: 'asc' },
    });

    return {
      message: 'Incident severities retrieved successfully.',
      data: severities.map((severity) => this.toResponse(severity)),
    };
  }

  async update(id: string, dto: UpdateIncidentSeverityDto) {
    const severity = await this.prisma.incident_severities.findUnique({
      where: { id: BigInt(id) },
    });

    if (!severity) {
      throw new NotFoundException('Incident severity not found.');
    }

    const updated = await this.prisma.incident_severities.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.levelName !== undefined && { level_name: dto.levelName }),
        ...(dto.chartLockTrigger !== undefined && {
          chart_lock_trigger: dto.chartLockTrigger,
        }),
      },
    });

    return {
      message: 'Incident severity updated successfully.',
      data: this.toResponse(updated),
    };
  }
}
