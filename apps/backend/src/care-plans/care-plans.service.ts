import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CarePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const plans = await this.prisma.care_plans.findMany({
      include: {
        residents: true,
        users: true,
      },
    });
    return plans.map(p => ({
      ...p,
      residentId: p.resident_id,
      createdBy: p.created_by,
      significantChangeFlag: p.significant_change_flag,
      isDeleted: p.is_deleted,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      resident: p.residents ? { ...p.residents, firstName: p.residents.first_name, lastName: p.residents.last_name } : null,
      creator: p.users,
    }));
  }

  async getResidents() {
    const res = await this.prisma.residents.findMany();
    return res.map(r => ({
      ...r,
      firstName: r.first_name,
      lastName: r.last_name,
      isDeleted: r.is_deleted,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
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
    return {
      ...cp,
      residentId: cp.resident_id,
      createdBy: cp.created_by,
      significantChangeFlag: cp.significant_change_flag,
      isDeleted: cp.is_deleted,
      createdAt: cp.created_at,
      updatedAt: cp.updated_at,
      resident: cp.residents ? { ...cp.residents, firstName: cp.residents.first_name, lastName: cp.residents.last_name } : null,
      creator: cp.users,
      goals: cp.care_goals,
      interventions: cp.care_interventions.map(i => ({
        ...i,
        assignedRole: i.assigned_role,
        tasks: i.care_tasks
      })),
      reviews: cp.care_plan_reviews.map(r => ({ ...r, reviewer: r.users })),
      signatures: cp.care_plan_signatures.map(s => ({ ...s, signer: s.users })),
      idtAcks: cp.idt_acknowledgments.map(a => ({ ...a, user: a.users }))
    };
  }

  async create(data: any, userId: string) {
    return this.prisma.care_plans.create({
      data: {
        resident_id: data.residentId,
        created_by: userId,
        status: data.status || 'Draft',
        care_goals: {
          create: data.goals?.map((g: any) => ({ description: g.description, status: g.status || 'IN_PROGRESS' })) || []
        },
        care_interventions: {
          create: data.interventions?.map((i: any) => ({ description: i.description, assigned_role: i.assignedRole })) || []
        }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.care_plans.update({
      where: { id },
      data: {
        status: data.status,
        significant_change_flag: data.significantChangeFlag,
      }
    });
  }

  async checkLocGate(id: string, data: any) {
    const plan = await this.prisma.care_plans.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Care plan not found');
    
    // Simulate LOC gate logic
    const hasWarning = data?.triggerGate === true;
    return { success: !hasWarning, message: 'LOC Gate check completed', warnings: hasWarning ? ['LOC exceeded'] : [] };
  }

  async donReview(id: string, data: any, reviewerId: string) {
    const review = await this.prisma.care_plan_reviews.create({
      data: {
        care_plan_id: id,
        reviewer_id: reviewerId,
        status: data.status, // APPROVED, REJECTED
        notes: data.notes
      }
    });
    
    await this.prisma.care_plans.update({
      where: { id },
      data: { status: data.status === 'APPROVED' ? 'Approved' : 'Rejected' }
    });

    return review;
  }

  async eSign(id: string, data: any, signerId: string) {
    const sig = await this.prisma.care_plan_signatures.create({
      data: {
        care_plan_id: id,
        signer_id: signerId,
        signature_token: data.signatureToken || 'dummy-token-123'
      }
    });
    
    await this.prisma.care_plans.update({
      where: { id },
      data: { status: 'Signed' }
    });

    return sig;
  }

  async idtAck(id: string, data: any, userId: string) {
    return this.prisma.idt_acknowledgments.create({
      data: {
        care_plan_id: id,
        user_id: userId,
        notes: data.notes
      }
    });
  }
}
