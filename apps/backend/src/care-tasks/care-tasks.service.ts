import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CompleteCareTaskDto } from "./dto/complete-care-task.dto.js";

@Injectable()
export class CareTasksService {
    constructor(private readonly prisma: PrismaService) {}

    private serialize(task: any) {
        const resident = task.care_interventions?.care_plans?.residents;
        const room = resident?.beds?.rooms?.room_number;
        return {
            id: task.id,
            taskType: task.task_type,
            status: task.status,
            abnormal: task.is_abnormal_flagged,
            scheduledTime: task.scheduled_time.toISOString(),
            completedAt: task.completed_at?.toISOString() ?? null,
            resident: resident
                ? {
                      id: resident.id,
                      fullName: [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean).join(" "),
                      roomNumber: room ?? null,
                      isChartLocked: resident.is_chart_locked,
                  }
                : null,
            assignedCna: task.users ? { id: task.users.id, name: `${task.users.firstName} ${task.users.lastName}` } : null,
            intervention: task.care_interventions
                ? { id: task.care_interventions.id, description: task.care_interventions.description, assignedRole: task.care_interventions.assigned_role }
                : null,
        };
    }

    async today(status?: string, assignedCnaId?: string) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const tasks = await this.prisma.care_tasks.findMany({
            where: {
                scheduled_time: { gte: start, lt: end },
                status: status && status !== "ALL" ? status.toUpperCase() : undefined,
                assigned_cna_id: assignedCnaId,
            },
            include: {
                users: true,
                care_interventions: {
                    include: {
                        care_plans: {
                            include: {
                                residents: { include: { beds: { include: { rooms: true } } } },
                            },
                        },
                    },
                },
            },
            orderBy: { scheduled_time: "asc" },
        });
        return tasks.map((task) => this.serialize(task));
    }

    async findOne(id: string) {
        const task = await this.prisma.care_tasks.findUnique({
            where: { id },
            include: {
                users: true,
                care_interventions: {
                    include: {
                        care_plans: { include: { residents: { include: { beds: { include: { rooms: true } } } } } },
                    },
                },
            },
        });
        if (!task) {
            throw new NotFoundException("Care task not found");
        }
        return this.serialize(task);
    }

    async complete(id: string, dto: CompleteCareTaskDto) {
        const task = await this.prisma.care_tasks.findUnique({
            where: { id },
            include: { care_interventions: { include: { care_plans: { include: { residents: true } } } } },
        });
        if (!task) {
            throw new NotFoundException("Care task not found");
        }
        if (task.care_interventions.care_plans.residents.is_chart_locked) {
            throw new NotFoundException("Resident chart is locked");
        }
        const updated = await this.prisma.care_tasks.update({
            where: { id },
            data: { status: "COMPLETED", completed_at: new Date(), is_abnormal_flagged: dto.abnormal ?? false },
        });
        return {
            id: updated.id,
            status: updated.status,
            completedAt: updated.completed_at?.toISOString() ?? null,
            abnormal: updated.is_abnormal_flagged,
            notes: dto.notes ?? null,
        };
    }
}
