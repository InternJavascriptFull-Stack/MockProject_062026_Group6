import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    private roomNumber(resident: any): string {
        return resident?.beds?.rooms?.room_number ?? "Unassigned";
    }

    private startOfToday(): Date {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }

    async getNurseDashboard(_userId: string) {
        const today = this.startOfToday();
        const assessmentCutoff = new Date(today.getTime() - 14 * DAY_IN_MS);
        const reviewCutoff = new Date(today.getTime() - 90 * DAY_IN_MS);

        const residents = await this.prisma.residents.findMany({
            where: { is_deleted: false, status: "ACTIVE" },
            include: {
                beds: { include: { rooms: true } },
                assessments: { orderBy: { created_at: "desc" }, take: 1 },
                resident_care_level_history: { where: { end_date: null }, take: 1 },
                care_plans: { where: { is_deleted: false }, orderBy: { updated_at: "desc" }, take: 1 },
            },
        });
        const openIncidents = await this.prisma.incidents.findMany({
            where: { status: { not: "CLOSED" } },
            include: {
                residents: { include: { beds: { include: { rooms: true } } } },
                incident_severities: true,
            },
            orderBy: { reported_at: "desc" },
            take: 5,
        });

        const dueResidents = residents
            .map((resident) => {
                const latestAssessment = resident.assessments[0];
                const latestPlan = resident.care_plans[0];
                const fullName = `${resident.first_name} ${resident.last_name}`;
                if (!latestAssessment || latestAssessment.created_at < assessmentCutoff) {
                    return {
                        resident: fullName,
                        room: this.roomNumber(resident),
                        task: "Initial or 14-day assessment is due",
                        status: latestAssessment ? "Overdue" : "Not started",
                        type: "overdue",
                    };
                }
                if (!resident.resident_care_level_history.length) {
                    return { resident: fullName, room: this.roomNumber(resident), task: "LOC classification awaiting confirmation", status: "Pending Review", type: "warning" };
                }
                if (!latestPlan) {
                    return { resident: fullName, room: this.roomNumber(resident), task: "Care plan has not been created", status: "Not started", type: "warning" };
                }
                if (latestPlan.updated_at < reviewCutoff) {
                    return { resident: fullName, room: this.roomNumber(resident), task: "90-day care plan reassessment is due", status: "Review Due", type: "warning" };
                }
                return { resident: fullName, room: this.roomNumber(resident), task: `Care plan ${latestPlan.status}`, status: "On track", type: "success" };
            })
            .slice(0, 8);

        return {
            success: true,
            data: {
                assessmentsDue: residents.filter((resident) => !resident.assessments[0] || resident.assessments[0].created_at < assessmentCutoff).length,
                locAwaitingConfirm: residents.filter((resident) => resident.assessments.length && !resident.resident_care_level_history.length).length,
                carePlansToSubmit: residents.filter((resident) => !resident.care_plans[0] || ["Draft", "Rejected"].includes(resident.care_plans[0].status)).length,
                reassessmentsDue: residents.filter((resident) => resident.care_plans[0]?.updated_at < reviewCutoff).length,
                assignedResidentsDueSoon: dueResidents,
                openIncidents: openIncidents.map((incident) => ({
                    type: incident.incident_type.replaceAll("_", " "),
                    resident: `${incident.residents.first_name} ${incident.residents.last_name}`,
                    room: this.roomNumber(incident.residents),
                    detail: `Reported ${incident.reported_at.toLocaleString()} · ${incident.status.replaceAll("_", " ")}`,
                    severity: incident.incident_severities.level_name,
                })),
            },
        };
    }

    async getDonDashboard(_userId: string) {
        const today = this.startOfToday();
        const reviewCutoff = new Date(today.getTime() - 90 * DAY_IN_MS);
        const pendingPlans = await this.prisma.care_plans.findMany({
            where: { is_deleted: false, status: { in: ["Pending Review", "Approved - Signature Required"] } },
            include: {
                residents: { include: { beds: { include: { rooms: true } } } },
                users: true,
            },
            orderBy: { updated_at: "asc" },
            take: 10,
        });
        const [openIncidents, overdueIncidents, totalBeds, activeResidents, reassessmentsDue, staffingConfig, activeLocHistory] = await Promise.all([
            this.prisma.incidents.count({ where: { status: { not: "CLOSED" } } }),
            this.prisma.incidents.count({ where: { status: { not: "CLOSED" }, sla_deadline: { lt: new Date() } } }),
            this.prisma.beds.count(),
            this.prisma.residents.count({ where: { is_deleted: false, status: "ACTIVE" } }),
            this.prisma.care_plans.count({ where: { is_deleted: false, updated_at: { lt: reviewCutoff } } }),
            this.prisma.staffing_configs.findFirst({ orderBy: { created_at: "desc" } }),
            this.prisma.resident_care_level_history.findMany({
                where: { end_date: null },
                include: {
                    care_levels: {
                        include: {
                            care_level_rates: {
                                where: {
                                    effective_from: { lte: today },
                                    OR: [{ effective_to: null }, { effective_to: { gte: today } }],
                                },
                                orderBy: { effective_from: "desc" },
                                take: 1,
                            },
                        },
                    },
                },
            }),
        ]);

        const tierMap = new Map<string, number>();
        let estimatedDailyRevenue = 0;
        for (const history of activeLocHistory) {
            tierMap.set(history.care_levels.level_name, (tierMap.get(history.care_levels.level_name) ?? 0) + 1);
            estimatedDailyRevenue += Number(history.care_levels.care_level_rates[0]?.daily_rate ?? 0);
        }
        const occupancyRate = totalBeds ? Number(((activeResidents / totalBeds) * 100).toFixed(1)) : 0;

        return {
            success: true,
            data: {
                pendingReview: pendingPlans.length,
                openIncidents,
                reassessmentsDue,
                complianceAlerts: overdueIncidents,
                staffingAlert: staffingConfig
                    ? `Minimum staffing target: ${staffingConfig.min_hrs_per_resident_day.toString()} hours per resident day; warn below ${staffingConfig.warn_below_percentage}%.`
                    : "Staffing configuration has not been set.",
                carePlansPendingReview: pendingPlans.map((plan) => ({
                    id: plan.id,
                    resident: `${plan.residents.first_name} ${plan.residents.last_name}`,
                    room: this.roomNumber(plan.residents),
                    submittedBy: plan.users ? `${plan.users.firstName} ${plan.users.lastName}` : "Unassigned",
                    submittedDate: plan.updated_at.toISOString().slice(0, 10),
                    locTier: "Confirmed LOC",
                    waiting: `${Math.max(0, Math.floor((Date.now() - plan.updated_at.getTime()) / (60 * 60 * 1000)))}h`,
                })),
                censusAndLocMix: {
                    current: activeResidents,
                    total: totalBeds,
                    occupancyRate,
                    tiers: Array.from(tierMap.entries()).map(([label, count]) => ({ label, count })),
                },
                billingSnapshot: {
                    estDailyRevenue: estimatedDailyRevenue,
                    estMonthlyRevenue: estimatedDailyRevenue * 30,
                    pendingAuthorizations: await this.prisma.invoices.count({ where: { status: "DRAFT", is_deleted: false } }),
                    medicare100DayCapAlerts: 0,
                },
            },
        };
    }

    async getCnaDashboard(userId: string) {
        const today = this.startOfToday();
        const tomorrow = new Date(today.getTime() + DAY_IN_MS);
        const tasks = await this.prisma.care_tasks.findMany({
            where: {
                scheduled_time: { gte: today, lt: tomorrow },
                OR: [{ assigned_cna_id: userId }, { assigned_cna_id: null }],
            },
            include: {
                care_interventions: {
                    include: {
                        care_plans: {
                            include: { residents: { include: { beds: { include: { rooms: true } } } } },
                        },
                    },
                },
            },
            orderBy: { scheduled_time: "asc" },
        });
        const shiftAssignment = await this.prisma.shift_assignments.findFirst({
            where: { user_id: userId, work_date: today },
            include: { shifts: true },
        });
        const residentIds = new Set(tasks.map((task) => task.care_interventions.care_plans.resident_id));

        return {
            success: true,
            data: {
                todaysTasks: { completed: tasks.filter((task) => task.status === "COMPLETED").length, total: tasks.length },
                abnormalFlagsReported: tasks.filter((task) => task.is_abnormal_flagged).length,
                assignedResidents: residentIds.size,
                shiftInfo: shiftAssignment ? `${shiftAssignment.shifts.shift_name} Shift` : "No shift assigned today",
                shiftTime: shiftAssignment ? `${shiftAssignment.shifts.start_time.toLocaleTimeString()} - ${shiftAssignment.shifts.end_time.toLocaleTimeString()}` : "—",
                upcomingTasks: tasks.map((task) => {
                    const resident = task.care_interventions.care_plans.residents;
                    return {
                        id: task.id,
                        resident: `${resident.first_name} ${resident.last_name}`,
                        room: this.roomNumber(resident),
                        task: task.task_type,
                        due: task.scheduled_time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        status: task.status === "COMPLETED" ? "Done" : task.scheduled_time < new Date() ? "Missed" : "Pending",
                    };
                }),
            },
        };
    }

    async getSummaryDashboard() {
        const [totalResidents, totalBeds, openIncidents, pendingAssessments, staffingConfigs] = await Promise.all([
            this.prisma.residents.count({ where: { is_deleted: false, status: "ACTIVE" } }),
            this.prisma.beds.count(),
            this.prisma.incidents.count({ where: { status: { not: "CLOSED" } } }),
            this.prisma.residents.count({ where: { is_deleted: false, status: "ACTIVE", assessments: { none: {} } } }),
            this.prisma.staffing_configs.count(),
        ]);
        return {
            success: true,
            data: {
                totalResidents,
                totalBeds,
                openIncidents,
                pendingAssessments,
                staffingAlerts: staffingConfigs ? 0 : 1,
            },
        };
    }
}
