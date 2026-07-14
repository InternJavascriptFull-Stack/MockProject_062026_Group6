import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import bcrypt from "bcrypt";

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const list = await this.prisma.incidents.findMany({
      include: {
        residents: true,
        users: true,
        incident_severities: true
      },
      orderBy: { reported_at: "desc" }
    });
    return list.map(incident => ({
      id: incident.id,
      incidentType: incident.incident_type,
      status: incident.status,
      description: incident.description,
      reportedAt: incident.reported_at.toISOString(),
      resident: {
        id: incident.residents.id,
        fullName: [incident.residents.first_name, incident.residents.middle_name, incident.residents.last_name].filter(Boolean).join(" "),
        isChartLocked: incident.residents.is_chart_locked
      },
      reporter: {
        id: incident.users.id,
        name: `${incident.users.firstName} ${incident.users.lastName}`
      },
      severity: incident.incident_severities.level_name
    }));
  }

  async findOne(id: string) {
    const incident = await this.prisma.incidents.findUnique({
      where: { id },
      include: {
        residents: true,
        users: true,
        incident_severities: true
      }
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    return {
      id: incident.id,
      incidentType: incident.incident_type,
      status: incident.status,
      description: incident.description,
      reportedAt: incident.reported_at.toISOString(),
      resident: {
        id: incident.residents.id,
        fullName: [incident.residents.first_name, incident.residents.middle_name, incident.residents.last_name].filter(Boolean).join(" "),
        isChartLocked: incident.residents.is_chart_locked
      },
      reporter: {
        id: incident.users.id,
        name: `${incident.users.firstName} ${incident.users.lastName}`
      },
      severity: incident.incident_severities.level_name
    };
  }

  async lockChart(incidentId: string, reason: string, userId: string) {
    const incident = await this.prisma.incidents.findUnique({
      where: { id: incidentId },
      include: { residents: true }
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${incidentId} not found`);
    }

    if (incident.residents.is_chart_locked) {
      throw new ConflictException("Resident's chart is already locked");
    }

    // Perform transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Lock resident's chart
      await tx.residents.update({
        where: { id: incident.resident_id },
        data: { is_chart_locked: true }
      });

      // 2. Log lock event
      await tx.chart_lock_events.create({
        data: {
          incident_id: incidentId,
          locked_by_system: false,
          locked_by: userId,
          lock_reason: reason || "Incident under investigation"
        }
      });

      // 3. Create Audit Log Entry
      await tx.audit_logs.create({
        data: {
          table_name: "residents",
          record_id: incident.resident_id,
          action: "LOCK",
          performed_by: userId,
          new_data: JSON.stringify({ is_chart_locked: true, reason: reason || "Incident under investigation" })
        }
      });
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    return {
      success: true,
      message: "Chart locked successfully",
      data: {
        incidentId,
        chartLocked: true,
        lockedAt: new Date().toISOString(),
        lockedBy: {
          id: userId,
          name: user ? `${user.firstName} ${user.lastName}` : "Unknown User"
        },
        reason: reason || "Incident under investigation"
      }
    };
  }

  async unlockChart(incidentId: string, reason: string, passwordConfirm: string, userId: string) {
    const incident = await this.prisma.incidents.findUnique({
      where: { id: incidentId },
      include: { residents: true }
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${incidentId} not found`);
    }

    if (!incident.residents.is_chart_locked) {
      throw new ConflictException("Resident's chart is not locked");
    }

    // Verify password
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException("User not found");
    }

    const passwordMatch = await bcrypt.compare(passwordConfirm, user.passwordHash);
    if (!passwordMatch) {
      throw new BadRequestException("Invalid confirmation password");
    }

    // Perform transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Unlock resident's chart
      await tx.residents.update({
        where: { id: incident.resident_id },
        data: { is_chart_locked: false }
      });

      // 2. Find latest open lock event and update it
      const openEvent = await tx.chart_lock_events.findFirst({
        where: { incident_id: incidentId, unlocked_by: null },
        orderBy: { event_time: "desc" }
      });

      if (openEvent) {
        await tx.chart_lock_events.update({
          where: { id: openEvent.id },
          data: {
            unlocked_by: userId,
            unlock_reason: reason
          }
        });
      } else {
        // Fallback: create unlock event record
        await tx.chart_lock_events.create({
          data: {
            incident_id: incidentId,
            locked_by_system: false,
            unlocked_by: userId,
            unlock_reason: reason
          }
        });
      }

      // 3. Create Audit Log Entry
      await tx.audit_logs.create({
        data: {
          table_name: "residents",
          record_id: incident.resident_id,
          action: "UNLOCK",
          performed_by: userId,
          new_data: JSON.stringify({ is_chart_locked: false, reason })
        }
      });
    });

    return {
      success: true,
      message: "Chart unlocked successfully",
      data: {
        incidentId,
        chartLocked: false,
        unlockedAt: new Date().toISOString(),
        unlockedBy: {
          id: userId,
          name: `${user.firstName} ${user.lastName}`
        },
        reason
      }
    };
  }
}
