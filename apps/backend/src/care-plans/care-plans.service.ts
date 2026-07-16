import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CarePlanStatus, CreateCarePlanDto, UpdateCarePlanDto, DonReviewDto, ESignDto, IdtAckDto } from './dto/care-plans.dto.js';
import { mapResidentSummary, mapCarePlanSummary, mapCarePlanDetail } from './care-plans.mapper.js';

@Injectable()
export class CarePlansService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        const plans = await this.prisma.care_plans.findMany({
            take: 50, // Pagination limit (Performance)
            include: {
                residents: true,
                users: true,
            },
            orderBy: { created_at: 'desc' }
        });
        return plans.map(mapCarePlanSummary);
    }

    async getResidents() {
        const res = await this.prisma.residents.findMany({
            take: 50,
            orderBy: { created_at: 'desc' }
        });
        return res.map(mapResidentSummary);
    }

    async findOne(id: string) {
        const cp = await this.prisma.care_plans.findUnique({
            where: { id },
            include: {
                residents: true,
                users: true,
                care_goals: true,
                care_interventions: {
                    include: { care_tasks: true }
                },
                care_plan_reviews: {
                    include: { users: true }
                },
                care_plan_signatures: {
                    include: { users: true }
                },
                idt_acknowledgments: {
                    include: { users: true }
                }
            },
        });
        if (!cp) throw new NotFoundException('Care plan not found');
        return mapCarePlanDetail(cp);
    }

    async create(data: CreateCarePlanDto, userId: string) {
        // Validate resident existence
        const resident = await this.prisma.residents.findUnique({ where: { id: data.residentId } });
        if (!resident) throw new NotFoundException('Resident not found');

        return this.prisma.care_plans.create({
            data: {
                resident_id: data.residentId,
                created_by: userId,
                status: data.status || CarePlanStatus.DRAFT,
                care_goals: data.goals ? {
                    create: data.goals.map(g => ({ description: g.description, status: g.status || 'IN_PROGRESS' }))
                } : undefined,
                care_interventions: data.interventions ? {
                    create: data.interventions.map(i => ({ description: i.description, assigned_role: i.assignedRole }))
                } : undefined
            }
        });
    }

    async update(id: string, data: UpdateCarePlanDto) {
        const plan = await this.prisma.care_plans.findUnique({ where: { id } });
        if (!plan) throw new NotFoundException('Care plan not found');
        const normalizedStatus = plan.status.toUpperCase().replace(" ", "_");
        if (normalizedStatus !== CarePlanStatus.DRAFT && normalizedStatus !== CarePlanStatus.REJECTED) {
            throw new ForbiddenException('Only Draft or Rejected care plans can be edited');
        }

        if (data.interventions) {
            const interventions = await this.prisma.care_interventions.findMany({ where: { care_plan_id: id } });
            const interventionIds = interventions.map(i => i.id);
            if (interventionIds.length > 0) {
                // Must delete child records to avoid P2003 Foreign Key constraint
                await this.prisma.care_tasks.deleteMany({ where: { care_intervention_id: { in: interventionIds } } });
            }
        }

        return this.prisma.care_plans.update({
            where: { id },
            data: {
                status: data.status,
                significant_change_flag: data.significantChangeFlag,
                care_goals: data.goals ? {
                    deleteMany: {},
                    create: data.goals.map(g => ({ description: g.description, status: g.status || 'IN_PROGRESS' }))
                } : undefined,
                care_interventions: data.interventions ? {
                    deleteMany: {},
                    create: data.interventions.map(i => ({ description: i.description, assigned_role: i.assignedRole }))
                } : undefined,
            }
        });
    }

    async checkLocGate(data: any) {
        // Check if new interventions require higher Level Of Care (LOC).
        // In a real scenario, this would query resident_care_level_history and assessment_details.
        const isExceedingLoc = data?.interventions?.some(
            (i: any) => i.description.toLowerCase().includes('tube feeding')
        );
        const hasWarning = isExceedingLoc || data?.triggerGate === true;

        return {
            success: !hasWarning,
            message: hasWarning ? 'LOC Gate check failed' : 'LOC Gate check passed',
            warnings: hasWarning ? ['Interventions exceed current Level of Care (LOC)'] : []
        };
    }

    async donReview(id: string, data: DonReviewDto, reviewerId: string) {
        const plan = await this.prisma.care_plans.findUnique({ where: { id } });
        if (!plan) throw new NotFoundException('Care plan not found');
        const normalizedStatus = plan.status.toUpperCase().replace(" ", "_");
        if (normalizedStatus !== CarePlanStatus.PENDING_REVIEW) {
            throw new BadRequestException('Care plan is not in pending review status');
        }

        // Wrap in transaction (Exception Handling & Prisma Transaction)
        return this.prisma.$transaction(async (tx) => {
            const review = await tx.care_plan_reviews.create({
                data: {
                    care_plan_id: id,
                    reviewer_id: reviewerId,
                    status: data.status, // CarePlanStatus.APPROVED or CarePlanStatus.REJECTED
                    notes: data.notes
                }
            });

            await tx.care_plans.update({
                where: { id },
                data: { status: data.status }
            });

            return review;
        });
    }

    async eSign(id: string, data: ESignDto, signerId: string) {
        const plan = await this.prisma.care_plans.findUnique({ where: { id } });
        if (!plan) throw new NotFoundException('Care plan not found');
        const normalizedStatus = plan.status.toUpperCase().replace(" ", "_");
        if (normalizedStatus !== CarePlanStatus.APPROVED) {
            throw new BadRequestException('Care plan must be approved before signing');
        }

        // E-signature re-auth token validation should happen here.
        // We assume data.signatureToken is valid for this mock.
        if (!data.signatureToken) {
            throw new BadRequestException('Signature token is required');
        }

        // Wrap in transaction
        return this.prisma.$transaction(async (tx) => {
            const sig = await tx.care_plan_signatures.create({
                data: {
                    care_plan_id: id,
                    signer_id: signerId,
                    signature_token: data.signatureToken // Use the real token provided
                }
            });

            await tx.care_plans.update({
                where: { id },
                data: { status: CarePlanStatus.SIGNED }
            });

            return sig;
        });
    }

    async idtAck(id: string, data: IdtAckDto, userId: string) {
        const plan = await this.prisma.care_plans.findUnique({ where: { id } });
        if (!plan) throw new NotFoundException('Care plan not found');
        const normalizedStatus = plan.status.toUpperCase().replace(" ", "_");
        if (normalizedStatus !== CarePlanStatus.SIGNED) {
            throw new BadRequestException('Care plan must be signed before IDT acknowledgment');
        }

        return this.prisma.idt_acknowledgments.create({
            data: {
                care_plan_id: id,
                user_id: userId,
                notes: data.notes
            }
        });
    }
}
