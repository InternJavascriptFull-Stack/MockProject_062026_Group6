import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { TIME_CONSTANTS } from "../constants/timeConstants.js";

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Helper to get the room number of a resident.
     *
     * @param resident The resident object containing beds and rooms data.
     * @returns The room number as a string, or "Unassigned".
     */
    private roomNumber(resident: any): string {
        return resident?.beds?.rooms?.room_number ?? "Unassigned";
    }

    /**
     * Helper to get the start of the current day.
     *
     * @returns A Date object representing midnight of today.
     */
    private startOfToday(): Date {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }

    /**
     * Get dashboard data for Nurse roles.
     * Includes due assessments, open incidents, and residents needing attention.
     *
     * @param _userId The ID of the Nurse requesting the dashboard.
     * @returns An object containing the success flag and the dashboard data.
     */
    async getNurseDashboard(_userId: string) {
        const today = this.startOfToday();
        const assessmentCutoff = new Date(
            today.getTime() - 14 * TIME_CONSTANTS.DAY_IN_MS
        );
        const reviewCutoff = new Date(
            today.getTime() - 90 * TIME_CONSTANTS.DAY_IN_MS
        );

        const residents = await this.prisma.residents.findMany({
            where: { is_deleted: false, status: "ACTIVE" },
            include: {
                beds: { include: { rooms: true } },
                assessments: { orderBy: { created_at: "desc" }, take: 1 },
                resident_care_level_history: {
                    where: { end_date: null },
                    take: 1,
                },
                care_plans: {
                    where: { is_deleted: false },
                    orderBy: { updated_at: "desc" },
                    take: 1,
                },
            },
        });

        const openIncidents = await this.prisma.incidents.findMany({
            where: { status: { not: "CLOSED" } },
            include: {
                residents: {
                    include: { beds: { include: { rooms: true } } },
                },
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

                if (
                    !latestAssessment ||
                    latestAssessment.created_at < assessmentCutoff
                ) {
                    return {
                        resident: fullName,
                        room: this.roomNumber(resident),
                        task: "Initial or 14-day assessment is due",
                        status: latestAssessment ? "Overdue" : "Not started",
                        type: "overdue",
                    };
                }

                if (!resident.resident_care_level_history.length) {
                    return {
                        resident: fullName,
                        room: this.roomNumber(resident),
                        task: "LOC classification awaiting confirmation",
                        status: "Pending Review",
                        type: "warning",
                    };
                }

                if (!latestPlan) {
                    return {
                        resident: fullName,
                        room: this.roomNumber(resident),
                        task: "Care plan has not been created",
                        status: "Not started",
                        type: "warning",
                    };
                }

                if (latestPlan.updated_at < reviewCutoff) {
                    return {
                        resident: fullName,
                        room: this.roomNumber(resident),
                        task: "90-day care plan reassessment is due",
                        status: "Review Due",
                        type: "warning",
                    };
                }

                return {
                    resident: fullName,
                    room: this.roomNumber(resident),
                    task: `Care plan ${latestPlan.status}`,
                    status: "On track",
                    type: "success",
                };
            })
            .slice(0, 8);

        const assessmentsDue = residents.filter(
            (r) =>
                !r.assessments[0] || r.assessments[0].created_at < assessmentCutoff
        ).length;

        const locAwaitingConfirm = residents.filter(
            (r) => r.assessments.length && !r.resident_care_level_history.length
        ).length;

        const carePlansToSubmit = residents.filter((r) => {
            const plan = r.care_plans[0];
            return !plan || ["Draft", "Rejected"].includes(plan.status);
        }).length;

        const reassessmentsDue = residents.filter(
            (r) => r.care_plans[0]?.updated_at < reviewCutoff
        ).length;

        const mappedIncidents = openIncidents.map((incident) => ({
            type: incident.incident_type.replaceAll("_", " "),
            resident: `${incident.residents.first_name} ${incident.residents.last_name}`,
            room: this.roomNumber(incident.residents),
            detail: `Reported ${incident.reported_at.toLocaleString()} · ${incident.status.replaceAll("_", " ")}`,
            severity: incident.incident_severities.level_name,
        }));

        return {
            success: true,
            data: {
                assessmentsDue,
                locAwaitingConfirm,
                carePlansToSubmit,
                reassessmentsDue,
                assignedResidentsDueSoon: dueResidents,
                openIncidents: mappedIncidents,
            },
        };
    }

    /**
     * Get dashboard data for Director of Nursing (DON).
     * Includes facility-wide compliance, staffing alerts, and billing snapshots.
     *
     * @param _userId The ID of the DON requesting the dashboard.
     * @returns An object containing the success flag and the dashboard data.
     */
    async getDonDashboard(_userId: string) {
        const today = this.startOfToday();
        const reviewCutoff = new Date(
            today.getTime() - 90 * TIME_CONSTANTS.DAY_IN_MS
        );

        const pendingPlans = await this.prisma.care_plans.findMany({
            where: {
                is_deleted: false,
                status: { in: ["Pending Review", "Approved - Signature Required"] },
            },
            include: {
                residents: { include: { beds: { include: { rooms: true } } } },
                users: true,
            },
            orderBy: { updated_at: "asc" },
            take: 10,
        });

        const openIncidents = await this.prisma.incidents.count({
            where: { status: { not: "CLOSED" } },
        });

        const overdueIncidents = await this.prisma.incidents.count({
            where: {
                status: { not: "CLOSED" },
                sla_deadline: { lt: new Date() },
            },
        });

        const totalBeds = await this.prisma.beds.count();

        const activeResidents = await this.prisma.residents.count({
            where: { is_deleted: false, status: "ACTIVE" },
        });

        const reassessmentsDue = await this.prisma.care_plans.count({
            where: { is_deleted: false, updated_at: { lt: reviewCutoff } },
        });

        const staffingConfig = await this.prisma.staffing_configs.findFirst({
            orderBy: { created_at: "desc" },
        });

        const activeLocHistory =
            await this.prisma.resident_care_level_history.findMany({
                where: { end_date: null },
                include: {
                    care_levels: {
                        include: {
                            care_level_rates: {
                                where: {
                                    effective_from: { lte: today },
                                    OR: [
                                        { effective_to: null },
                                        { effective_to: { gte: today } },
                                    ],
                                },
                                orderBy: { effective_from: "desc" },
                                take: 1,
                            },
                        },
                    },
                },
            });

        const tierMap = new Map<string, number>();
        let estimatedDailyRevenue = 0;

        for (const history of activeLocHistory) {
            const levelName = history.care_levels.level_name;
            tierMap.set(levelName, (tierMap.get(levelName) ?? 0) + 1);

            const rate = history.care_levels.care_level_rates[0]?.daily_rate;
            estimatedDailyRevenue += Number(rate ?? 0);
        }

        const occupancyRate = totalBeds
            ? Number(((activeResidents / totalBeds) * 100).toFixed(1))
            : 0;

        const staffingAlert = staffingConfig
            ? `Minimum staffing target: ${staffingConfig.min_hrs_per_resident_day.toString()} ` +
              `hours per resident day; warn below ${staffingConfig.warn_below_percentage}%.`
            : "Staffing configuration has not been set.";

        const carePlansPendingReview = pendingPlans.map((plan) => {
            const userName = plan.users
                ? `${plan.users.firstName} ${plan.users.lastName}`
                : "Unassigned";

            const msPassed = Date.now() - plan.updated_at.getTime();
            const hoursWaiting = Math.max(
                0,
                Math.floor(msPassed / (60 * 60 * 1000))
            );

            return {
                id: plan.id,
                resident: `${plan.residents.first_name} ${plan.residents.last_name}`,
                room: this.roomNumber(plan.residents),
                submittedBy: userName,
                submittedDate: plan.updated_at.toISOString().slice(0, 10),
                locTier: "Confirmed LOC",
                waiting: `${hoursWaiting}h`,
            };
        });

        const pendingAuthorizations = await this.prisma.invoices.count({
            where: { status: "DRAFT", is_deleted: false },
        });

        return {
            success: true,
            data: {
                pendingReview: pendingPlans.length,
                openIncidents,
                reassessmentsDue,
                complianceAlerts: overdueIncidents,
                staffingAlert,
                carePlansPendingReview,
                censusAndLocMix: {
                    current: activeResidents,
                    total: totalBeds,
                    occupancyRate,
                    tiers: Array.from(tierMap.entries()).map(([label, count]) => ({
                        label,
                        count,
                    })),
                },
                billingSnapshot: {
                    estDailyRevenue: estimatedDailyRevenue,
                    estMonthlyRevenue: estimatedDailyRevenue * 30,
                    pendingAuthorizations,
                    medicare100DayCapAlerts: 0,
                },
            },
        };
    }

    /**
     * Get dashboard data for Certified Nursing Assistants (CNA).
     * Focuses on daily care tasks, scheduled times, and assigned residents.
     *
     * @param userId The ID of the CNA requesting the dashboard.
     * @returns An object containing the success flag and the dashboard data.
     */
    async getCnaDashboard(userId: string) {
        const today = this.startOfToday();
        const tomorrow = new Date(today.getTime() + TIME_CONSTANTS.DAY_IN_MS);

        const tasks = await this.prisma.care_tasks.findMany({
            where: {
                scheduled_time: { gte: today, lt: tomorrow },
                OR: [{ assigned_cna_id: userId }, { assigned_cna_id: null }],
            },
            include: {
                care_interventions: {
                    include: {
                        care_plans: {
                            include: {
                                residents: {
                                    include: {
                                        beds: { include: { rooms: true } },
                                    },
                                },
                            },
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

        const residentIds = new Set(
            tasks.map((t) => t.care_interventions.care_plans.resident_id)
        );

        const completedTasks = tasks.filter(
            (t) => t.status === "COMPLETED"
        ).length;
        const abnormalFlags = tasks.filter((t) => t.is_abnormal_flagged).length;

        const shiftInfo = shiftAssignment
            ? `${shiftAssignment.shifts.shift_name} Shift`
            : "No shift assigned today";

        const shiftTime = shiftAssignment
            ? `${shiftAssignment.shifts.start_time.toLocaleTimeString()} - ` +
              `${shiftAssignment.shifts.end_time.toLocaleTimeString()}`
            : "—";

        const upcomingTasks = tasks.map((task) => {
            const resident = task.care_interventions.care_plans.residents;
            const timeStr = task.scheduled_time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            let statusStr = "Pending";
            if (task.status === "COMPLETED") {
                statusStr = "Done";
            } else if (task.scheduled_time < new Date()) {
                statusStr = "Missed";
            }

            return {
                id: task.id,
                resident: `${resident.first_name} ${resident.last_name}`,
                room: this.roomNumber(resident),
                task: task.task_type,
                due: timeStr,
                status: statusStr,
            };
        });

        return {
            success: true,
            data: {
                todaysTasks: { completed: completedTasks, total: tasks.length },
                abnormalFlagsReported: abnormalFlags,
                assignedResidents: residentIds.size,
                shiftInfo,
                shiftTime,
                upcomingTasks,
            },
        };
    }

    /**
     * Get a high-level summary dashboard, useful for general admins.
     * Includes total census, incident count, and missing setups.
     *
     * @returns An object containing the success flag and the dashboard data.
     */
    async getSummaryDashboard() {
        const totalResidents = await this.prisma.residents.count({
            where: { is_deleted: false, status: "ACTIVE" },
        });

        const totalBeds = await this.prisma.beds.count();

        const openIncidents = await this.prisma.incidents.count({
            where: { status: { not: "CLOSED" } },
        });

        const pendingAssessments = await this.prisma.residents.count({
            where: {
                is_deleted: false,
                status: "ACTIVE",
                assessments: { none: {} },
            },
        });

        const staffingConfigs = await this.prisma.staffing_configs.count();

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
