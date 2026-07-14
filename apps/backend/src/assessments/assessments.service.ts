import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { ConfirmLocDto, CreateAssessmentDto, CreateReassessmentDto } from "./dto/assessment.dto.js";

@Injectable()
export class AssessmentsService {
    constructor(private readonly prisma: PrismaService) {}

    private async chooseSuggestedCareLevel(totalScore: number) {
        const preferredCode =
            totalScore <= 6 ? "INDEPENDENT_LIVING" : totalScore <= 12 ? "ASSISTED_LIVING" : totalScore <= 18 ? "MEMORY_CARE" : totalScore <= 24 ? "SKILLED_NURSING" : "HOSPICE";

        const level = await this.prisma.care_levels.findFirst({
            where: { level_code: preferredCode, is_deleted: false },
        });

        if (level) {
            return level;
        }

        const fallback = await this.prisma.care_levels.findFirst({
            where: { is_deleted: false },
            orderBy: { id: "asc" },
        });
        if (!fallback) {
            throw new NotFoundException("Care level reference data has not been seeded");
        }
        return fallback;
    }

    private serializeAssessment(assessment: any, hasConfirmedHistory = false) {
        return {
            id: assessment.id,
            residentId: assessment.resident_id,
            assessedBy: assessment.assessed_by,
            adlTotalScore: assessment.adl_total_score,
            isOverridden: assessment.is_overridden,
            createdAt: assessment.created_at.toISOString(),
            suggestedCareLevel: assessment.care_levels_assessments_suggested_care_level_idTocare_levels
                ? {
                      id: assessment.care_levels_assessments_suggested_care_level_idTocare_levels.id.toString(),
                      code: assessment.care_levels_assessments_suggested_care_level_idTocare_levels.level_code,
                      name: assessment.care_levels_assessments_suggested_care_level_idTocare_levels.level_name,
                  }
                : null,
            confirmedCareLevel:
                hasConfirmedHistory && assessment.care_levels_assessments_confirmed_care_level_idTocare_levels
                    ? {
                          id: assessment.care_levels_assessments_confirmed_care_level_idTocare_levels.id.toString(),
                          code: assessment.care_levels_assessments_confirmed_care_level_idTocare_levels.level_code,
                          name: assessment.care_levels_assessments_confirmed_care_level_idTocare_levels.level_name,
                      }
                    : null,
            details: (assessment.assessment_details ?? []).map((detail: any) => ({
                id: detail.id,
                category: detail.assessment_metrics?.category,
                metricName: detail.assessment_metrics?.metric_name,
                score: detail.score,
                notes: detail.notes,
            })),
            metrics: (assessment.assessment_details ?? []).map((detail: any) => ({
                id: detail.id,
                category: detail.assessment_metrics?.category,
                metricName: detail.assessment_metrics?.metric_name,
                score: detail.score,
                notes: detail.notes,
            })),
            assessor: assessment.users ? { id: assessment.users.id, name: `${assessment.users.firstName} ${assessment.users.lastName}` } : null,
        };
    }

    async create(dto: CreateAssessmentDto, userId: string) {
        const resident = await this.prisma.residents.findUnique({ where: { id: dto.residentId } });
        if (!resident || resident.is_deleted) {
            throw new NotFoundException("Resident not found");
        }
        if (resident.is_chart_locked) {
            throw new BadRequestException("Resident chart is locked");
        }
        if (!dto.metrics.length) {
            throw new BadRequestException("At least one assessment metric is required");
        }

        const totalScore = dto.metrics.reduce((sum, metric) => sum + metric.score, 0);
        const suggestedLevel = await this.chooseSuggestedCareLevel(totalScore);

        const metricReferences: { id: bigint; score: number; notes?: string }[] = [];
        for (const metric of dto.metrics) {
            let reference = await this.prisma.assessment_metrics.findFirst({
                where: { category: metric.category.toUpperCase(), metric_name: metric.metricName },
            });
            reference ??= await this.prisma.assessment_metrics.create({
                data: { category: metric.category.toUpperCase(), metric_name: metric.metricName },
            });
            metricReferences.push({ id: reference.id, score: metric.score, notes: metric.notes });
        }

        const assessment = await this.prisma.assessments.create({
            data: {
                resident_id: dto.residentId,
                assessed_by: userId,
                adl_total_score: totalScore,
                suggested_care_level_id: suggestedLevel.id,
                confirmed_care_level_id: suggestedLevel.id,
                is_overridden: false,
                assessment_details: {
                    create: metricReferences.map((metric) => ({
                        metric_id: metric.id,
                        score: metric.score,
                        notes: metric.notes,
                    })),
                },
            },
            include: {
                assessment_details: { include: { assessment_metrics: true } },
                users: true,
                care_levels_assessments_suggested_care_level_idTocare_levels: true,
                care_levels_assessments_confirmed_care_level_idTocare_levels: true,
            },
        });

        if (dto.clinicalNotes?.trim()) {
            await this.prisma.clinical_records.create({
                data: {
                    resident_id: dto.residentId,
                    recorded_by: userId,
                    record_type: "PROGRESS_NOTE",
                    description: JSON.stringify({ type: "INITIAL_ASSESSMENT", assessmentId: assessment.id, notes: dto.clinicalNotes }),
                },
            });
        }

        return this.serializeAssessment(assessment, false);
    }

    async history(residentId: string) {
        const histories = await this.prisma.resident_care_level_history.findMany({
            where: { resident_id: residentId },
            orderBy: { start_date: "desc" },
        });
        const confirmedIds = new Set(histories.map((history) => history.care_level_id.toString()));
        const assessments = await this.prisma.assessments.findMany({
            where: { resident_id: residentId },
            include: {
                assessment_details: { include: { assessment_metrics: true } },
                users: true,
                care_levels_assessments_suggested_care_level_idTocare_levels: true,
                care_levels_assessments_confirmed_care_level_idTocare_levels: true,
            },
            orderBy: { created_at: "desc" },
        });
        return assessments.map((assessment) => this.serializeAssessment(assessment, confirmedIds.has(assessment.confirmed_care_level_id.toString())));
    }

    async latestClassification(residentId: string) {
        const assessment = await this.prisma.assessments.findFirst({
            where: { resident_id: residentId },
            include: {
                assessment_details: { include: { assessment_metrics: true } },
                users: true,
                care_levels_assessments_suggested_care_level_idTocare_levels: true,
                care_levels_assessments_confirmed_care_level_idTocare_levels: true,
            },
            orderBy: { created_at: "desc" },
        });
        if (!assessment) {
            throw new NotFoundException("No assessment exists for this resident");
        }
        const currentHistory = await this.prisma.resident_care_level_history.findFirst({
            where: { resident_id: residentId, end_date: null },
            include: { care_levels: true },
            orderBy: { start_date: "desc" },
        });
        return {
            ...this.serializeAssessment(assessment, Boolean(currentHistory)),
            isConfirmed: Boolean(currentHistory),
            activeCareLevel: currentHistory
                ? { id: currentHistory.care_level_id.toString(), code: currentHistory.care_levels.level_code, name: currentHistory.care_levels.level_name }
                : null,
        };
    }

    async confirmLoc(assessmentId: string, dto: ConfirmLocDto, userId: string) {
        const assessment = await this.prisma.assessments.findUnique({ where: { id: assessmentId } });
        if (!assessment) {
            throw new NotFoundException("Assessment not found");
        }

        const careLevelId = BigInt(dto.careLevelId);
        const careLevel = await this.prisma.care_levels.findUnique({ where: { id: careLevelId } });
        if (!careLevel || careLevel.is_deleted) {
            throw new NotFoundException("Care level not found");
        }

        const isOverride = dto.isOverride === true || careLevelId !== assessment.suggested_care_level_id;
        const overrideReason = dto.overrideReason?.trim() ?? "";
        if (isOverride && overrideReason.length < 20) {
            throw new BadRequestException("Override reason must contain at least 20 characters");
        }

        const resident = await this.prisma.residents.findUnique({
            where: { id: assessment.resident_id },
            include: { beds: { include: { rooms: true } } },
        });
        const latestAdmission = resident?.beds?.rooms.facility_id
            ? null
            : await this.prisma.admissions.findFirst({
                  where: { resident_id: assessment.resident_id },
                  orderBy: { admission_date: "desc" },
              });
        const facilityId = resident?.beds?.rooms.facility_id ?? latestAdmission?.facility_id ?? null;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const previousDay = new Date(today);
        previousDay.setUTCDate(previousDay.getUTCDate() - 1);
        const activeRate = facilityId
            ? await this.prisma.care_level_rates.findFirst({
                  where: {
                      care_level_id: careLevelId,
                      facility_id: facilityId,
                      effective_from: { lte: today },
                      OR: [{ effective_to: null }, { effective_to: { gte: today } }],
                  },
                  orderBy: { effective_from: "desc" },
              })
            : null;

        const result = await this.prisma.$transaction(async (transaction) => {
            await transaction.assessments.update({
                where: { id: assessmentId },
                data: { confirmed_care_level_id: careLevelId, is_overridden: isOverride },
            });
            await transaction.resident_care_level_history.updateMany({
                where: { resident_id: assessment.resident_id, end_date: null },
                data: { end_date: previousDay },
            });
            const history = await transaction.resident_care_level_history.create({
                data: { resident_id: assessment.resident_id, care_level_id: careLevelId, start_date: today },
            });
            const confirmedAt = new Date().toISOString();
            await transaction.audit_logs.create({
                data: {
                    table_name: "resident_care_level_history",
                    record_id: history.id,
                    action: "CREATE",
                    performed_by: userId,
                    new_data: JSON.stringify({
                        assessmentId,
                        residentId: assessment.resident_id,
                        careLevelId: careLevelId.toString(),
                        careLevelCode: careLevel.level_code,
                        careLevelName: careLevel.level_name,
                        dailyRate: activeRate ? Number(activeRate.daily_rate) : null,
                        isOverride,
                        overrideReason: isOverride ? overrideReason : null,
                        confirmedAt,
                    }),
                },
            });
            return { historyId: history.id, confirmedAt };
        });

        return {
            assessmentId,
            historyId: result.historyId,
            residentId: assessment.resident_id,
            isConfirmed: true,
            isOverride,
            overrideReason: isOverride ? overrideReason : null,
            dailyRate: activeRate ? Number(activeRate.daily_rate) : null,
            careLevel: { id: careLevel.id.toString(), code: careLevel.level_code, name: careLevel.level_name },
            confirmedAt: result.confirmedAt,
        };
    }

    async locHistory(residentId: string) {
        const history = await this.prisma.resident_care_level_history.findMany({
            where: { resident_id: residentId },
            include: { care_levels: true },
            orderBy: { start_date: "desc" },
        });
        const recordIds = history.map((item) => item.id);
        const auditEntries = recordIds.length
            ? await this.prisma.audit_logs.findMany({
                  where: { table_name: "resident_care_level_history", record_id: { in: recordIds } },
                  include: { users: true },
                  orderBy: { performed_at: "desc" },
              })
            : [];
        const auditByRecord = new Map(auditEntries.map((entry) => [entry.record_id, entry]));

        return history.map((item) => {
            const audit = auditByRecord.get(item.id);
            let details: Record<string, unknown> = {};
            try {
                details = audit?.new_data ? (JSON.parse(audit.new_data) as Record<string, unknown>) : {};
            } catch {
                details = {};
            }
            return {
                id: item.id,
                residentId: item.resident_id,
                careLevel: { id: item.care_level_id.toString(), code: item.care_levels.level_code, name: item.care_levels.level_name },
                dailyRate: typeof details.dailyRate === "number" ? details.dailyRate : null,
                startDate: item.start_date.toISOString().slice(0, 10),
                endDate: item.end_date?.toISOString().slice(0, 10) ?? null,
                active: item.end_date === null,
                isOverride: details.isOverride === true,
                overrideReason: typeof details.overrideReason === "string" ? details.overrideReason : null,
                authorizedAt: audit?.performed_at.toISOString() ?? null,
                authorizedBy: audit ? `${audit.users.firstName} ${audit.users.lastName}` : null,
            };
        });
    }

    async createReassessment(dto: CreateReassessmentDto, userId: string) {
        const assessment = await this.create(dto, userId);
        const currentPlan = await this.prisma.care_plans.findUnique({
            where: { id: dto.carePlanId },
            include: { care_goals: true, care_interventions: true },
        });
        if (!currentPlan) {
            throw new NotFoundException("Care plan not found");
        }

        const plan = await this.prisma.care_plans.create({
            data: {
                resident_id: dto.residentId,
                created_by: userId,
                status: "Pending Review",
                significant_change_flag: true,
                care_goals: {
                    create: (dto.goals?.length ? dto.goals : currentPlan.care_goals).map((goal: any) => ({
                        description: goal.description,
                        status: goal.status ?? "IN_PROGRESS",
                    })),
                },
                care_interventions: {
                    create: (dto.interventions?.length ? dto.interventions : currentPlan.care_interventions).map((intervention: any) => ({
                        description: intervention.description,
                        assigned_role: intervention.assignedRole ?? intervention.assigned_role,
                    })),
                },
            },
        });

        await this.prisma.clinical_records.create({
            data: {
                resident_id: dto.residentId,
                recorded_by: userId,
                record_type: "PROGRESS_NOTE",
                description: JSON.stringify({ type: "REASSESSMENT", reason: dto.reason, sourceCarePlanId: dto.carePlanId, newCarePlanId: plan.id, assessmentId: assessment.id }),
            },
        });

        return { assessment, carePlan: { id: plan.id, status: plan.status, significantChangeFlag: plan.significant_change_flag } };
    }
}
