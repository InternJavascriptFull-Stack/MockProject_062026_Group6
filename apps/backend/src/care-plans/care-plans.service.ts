import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service.js";

const DON_ROLES = new Set(["DON", "DIRECTOR_OF_NURSING", "ADMIN", "SYSTEM_ADMIN", "NHA"]);

@Injectable()
export class CarePlansService {
    constructor(private readonly prisma: PrismaService) {}

    private async assertDonAccess(role?: string) {
        if (!role || !DON_ROLES.has(role.toUpperCase())) {
            throw new ForbiddenException("Only DON or Administrator users can perform this action.");
        }
    }

    private async checkChartLockByResidentId(residentId: string) {
        const resident = await this.prisma.residents.findUnique({
            where: { id: residentId },
            select: { is_chart_locked: true },
        });
        if (!resident) {
            throw new NotFoundException("Resident not found.");
        }
        if (resident.is_chart_locked) {
            throw new ForbiddenException("Resident chart is locked. Modifications are not allowed.");
        }
    }

    private async checkChartLockByCarePlanId(id: string) {
        const carePlan = await this.prisma.care_plans.findUnique({
            where: { id },
            select: { resident_id: true },
        });
        if (!carePlan) {
            throw new NotFoundException("Care plan not found.");
        }
        await this.checkChartLockByResidentId(carePlan.resident_id);
    }

    private async getActiveLoc(residentId: string) {
        return this.prisma.resident_care_level_history.findFirst({
            where: { resident_id: residentId, end_date: null },
            include: { care_levels: true },
            orderBy: { start_date: "desc" },
        });
    }

    async findAll() {
        const plans = await this.prisma.care_plans.findMany({
            where: { is_deleted: false },
            include: {
                residents: { include: { beds: { include: { rooms: true } } } },
                users: true,
                care_plan_reviews: { orderBy: { reviewed_at: "desc" }, take: 1 },
            },
            orderBy: { updated_at: "desc" },
        });

        return Promise.all(
            plans.map(async (plan) => {
                const activeLoc = await this.getActiveLoc(plan.resident_id);
                return {
                    ...plan,
                    residentId: plan.resident_id,
                    createdBy: plan.created_by,
                    significantChangeFlag: plan.significant_change_flag,
                    isDeleted: plan.is_deleted,
                    createdAt: plan.created_at,
                    updatedAt: plan.updated_at,
                    lastReviewAt: plan.care_plan_reviews[0]?.reviewed_at ?? null,
                    nextReviewAt: plan.care_plan_reviews[0]?.reviewed_at ? new Date(plan.care_plan_reviews[0].reviewed_at.getTime() + 90 * 24 * 60 * 60 * 1000) : null,
                    resident: plan.residents
                        ? {
                              ...plan.residents,
                              firstName: plan.residents.first_name,
                              lastName: plan.residents.last_name,
                              roomNumber: plan.residents.beds?.rooms?.room_number ?? null,
                          }
                        : null,
                    activeCareLevel: activeLoc
                        ? {
                              id: activeLoc.care_level_id.toString(),
                              code: activeLoc.care_levels.level_code,
                              name: activeLoc.care_levels.level_name,
                          }
                        : null,
                    creator: plan.users,
                };
            }),
        );
    }

    async getResidents() {
        const residents = await this.prisma.residents.findMany({
            where: { is_deleted: false },
            include: { beds: { include: { rooms: true } } },
            orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
        });

        return Promise.all(
            residents.map(async (resident) => {
                const activeLoc = await this.getActiveLoc(resident.id);
                return {
                    id: resident.id,
                    firstName: resident.first_name,
                    lastName: resident.last_name,
                    roomNumber: resident.beds?.rooms?.room_number ?? null,
                    chartLocked: resident.is_chart_locked,
                    locConfirmed: Boolean(activeLoc),
                    activeCareLevel: activeLoc
                        ? {
                              id: activeLoc.care_level_id.toString(),
                              code: activeLoc.care_levels.level_code,
                              name: activeLoc.care_levels.level_name,
                          }
                        : null,
                };
            }),
        );
    }

    async findOne(id: string) {
        const carePlan = await this.prisma.care_plans.findUnique({
            where: { id },
            include: {
                residents: { include: { beds: { include: { rooms: true } } } },
                users: true,
                care_goals: true,
                care_interventions: { include: { care_tasks: true } },
                care_plan_reviews: { include: { users: true }, orderBy: { reviewed_at: "desc" } },
                care_plan_signatures: { include: { users: true }, orderBy: { signed_at: "desc" } },
                idt_acknowledgments: { include: { users: true }, orderBy: { acknowledged_at: "desc" } },
            },
        });
        if (!carePlan || carePlan.is_deleted) {
            throw new NotFoundException("Care plan not found.");
        }

        const activeLoc = await this.getActiveLoc(carePlan.resident_id);
        return {
            ...carePlan,
            residentId: carePlan.resident_id,
            createdBy: carePlan.created_by,
            significantChangeFlag: carePlan.significant_change_flag,
            isDeleted: carePlan.is_deleted,
            createdAt: carePlan.created_at,
            updatedAt: carePlan.updated_at,
            resident: {
                ...carePlan.residents,
                firstName: carePlan.residents.first_name,
                lastName: carePlan.residents.last_name,
                roomNumber: carePlan.residents.beds?.rooms?.room_number ?? null,
            },
            activeCareLevel: activeLoc
                ? {
                      id: activeLoc.care_level_id.toString(),
                      code: activeLoc.care_levels.level_code,
                      name: activeLoc.care_levels.level_name,
                  }
                : null,
            creator: carePlan.users,
            goals: carePlan.care_goals,
            interventions: carePlan.care_interventions.map((intervention) => ({
                ...intervention,
                assignedRole: intervention.assigned_role,
                tasks: intervention.care_tasks,
            })),
            reviews: carePlan.care_plan_reviews.map((review) => ({ ...review, reviewer: review.users })),
            signatures: carePlan.care_plan_signatures.map((signature) => ({ ...signature, signer: signature.users })),
            idtAcks: carePlan.idt_acknowledgments.map((acknowledgment) => ({ ...acknowledgment, user: acknowledgment.users })),
        };
    }

    async create(data: any, userId: string) {
        await this.checkChartLockByResidentId(data.residentId);
        const activeLoc = await this.getActiveLoc(data.residentId);
        if (!activeLoc) {
            throw new ForbiddenException("Confirm LOC classification before creating a care plan.");
        }
        if (!data.goals?.length) {
            throw new BadRequestException("At least one care goal is required.");
        }
        if (!data.interventions?.length) {
            throw new BadRequestException("At least one care intervention is required.");
        }

        return this.prisma.care_plans.create({
            data: {
                resident_id: data.residentId,
                created_by: userId,
                status: data.status || "Draft",
                care_goals: {
                    create: data.goals.map((goal: any) => ({
                        description: goal.description,
                        status: goal.status || "IN_PROGRESS",
                    })),
                },
                care_interventions: {
                    create: data.interventions.map((intervention: any) => ({
                        description: intervention.description,
                        assigned_role: intervention.assignedRole,
                    })),
                },
            },
            include: { care_goals: true, care_interventions: true },
        });
    }

    async update(id: string, data: any) {
        await this.checkChartLockByCarePlanId(id);
        return this.prisma.care_plans.update({
            where: { id },
            data: {
                ...(data.status !== undefined && { status: data.status }),
                ...(data.significantChangeFlag !== undefined && {
                    significant_change_flag: data.significantChangeFlag,
                }),
            },
        });
    }

    async checkLocGate(residentId: string) {
        const resident = await this.prisma.residents.findUnique({
            where: { id: residentId },
            select: { id: true, first_name: true, last_name: true, is_chart_locked: true },
        });
        if (!resident) {
            throw new NotFoundException("Resident not found.");
        }
        const activeLoc = await this.getActiveLoc(residentId);
        return {
            success: Boolean(activeLoc) && !resident.is_chart_locked,
            blocked: !activeLoc || resident.is_chart_locked,
            message: resident.is_chart_locked
                ? "The resident chart is locked due to an active incident."
                : activeLoc
                  ? "LOC classification is confirmed."
                  : "Confirm LOC classification before creating a care plan.",
            resident: {
                id: resident.id,
                name: `${resident.first_name} ${resident.last_name}`,
            },
            activeCareLevel: activeLoc
                ? {
                      id: activeLoc.care_level_id.toString(),
                      code: activeLoc.care_levels.level_code,
                      name: activeLoc.care_levels.level_name,
                  }
                : null,
        };
    }

    async donReview(id: string, data: any, reviewerId: string, role?: string) {
        await this.assertDonAccess(role);
        await this.checkChartLockByCarePlanId(id);
        const review = await this.prisma.care_plan_reviews.create({
            data: {
                care_plan_id: id,
                reviewer_id: reviewerId,
                status: data.status,
                notes: data.notes,
            },
        });
        await this.prisma.care_plans.update({
            where: { id },
            data: { status: data.status === "APPROVED" ? "Approved - Signature Required" : "Rejected" },
        });
        return review;
    }

    async eSign(id: string, password: string, signerId: string, role?: string) {
        await this.assertDonAccess(role);
        await this.checkChartLockByCarePlanId(id);
        const user = await this.prisma.user.findUnique({ where: { id: signerId } });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new UnauthorizedException("Electronic signature credentials are invalid.");
        }
        const latestReview = await this.prisma.care_plan_reviews.findFirst({
            where: { care_plan_id: id },
            orderBy: { reviewed_at: "desc" },
        });
        if (latestReview?.status !== "APPROVED") {
            throw new BadRequestException("The care plan must be approved before e-signature.");
        }

        const signature = await this.prisma.care_plan_signatures.create({
            data: {
                care_plan_id: id,
                signer_id: signerId,
                signature_token: await bcrypt.hash(`${signerId}:${id}:${Date.now()}`, 10),
            },
        });

        const interventions = await this.prisma.care_interventions.findMany({
            where: { care_plan_id: id },
            include: { care_tasks: true },
        });
        const baseTime = new Date();
        baseTime.setHours(8, 0, 0, 0);
        for (const [index, intervention] of interventions.entries()) {
            if (intervention.care_tasks.length > 0) continue;
            const scheduledTime = new Date(baseTime.getTime() + index * 60 * 60 * 1000);
            await this.prisma.care_tasks.create({
                data: {
                    task_type: intervention.description.slice(0, 50),
                    status: "PENDING",
                    care_intervention_id: intervention.id,
                    scheduled_time: scheduledTime,
                },
            });
        }

        await this.prisma.care_plans.update({
            where: { id },
            data: { status: "Active" },
        });
        return signature;
    }

    async idtAck(id: string, data: any, userId: string) {
        await this.checkChartLockByCarePlanId(id);
        const existing = await this.prisma.idt_acknowledgments.findFirst({
            where: { care_plan_id: id, user_id: userId },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.idt_acknowledgments.create({
            data: {
                care_plan_id: id,
                user_id: userId,
                notes: data.notes,
            },
        });
    }
}
