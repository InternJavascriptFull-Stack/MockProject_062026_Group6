import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CarePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.carePlan.findMany({
      include: {
        resident: true,
        creator: true,
      },
    });
  }

  async getResidents() {
    return this.prisma.resident.findMany();
  }

  async findOne(id: string) {
    const cp = await this.prisma.carePlan.findUnique({
      where: { id },
      include: {
        resident: true,
        creator: true,
        goals: true,
        interventions: {
          include: { tasks: true }
        },
        reviews: {
          include: { reviewer: true }
        },
        signatures: {
          include: { signer: true }
        },
        idtAcks: {
          include: { user: true }
        }
      },
    });
    if (!cp) throw new NotFoundException('Care plan not found');
    return cp;
  }

  async create(data: any, userId: string) {
    return this.prisma.carePlan.create({
      data: {
        residentId: data.residentId,
        createdBy: userId,
        status: data.status || 'Draft',
        goals: {
          create: data.goals?.map((g: any) => ({ description: g.description, status: g.status || 'IN_PROGRESS' })) || []
        },
        interventions: {
          create: data.interventions?.map((i: any) => ({ description: i.description, assignedRole: i.assignedRole })) || []
        }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.carePlan.update({
      where: { id },
      data: {
        status: data.status,
        significantChangeFlag: data.significantChangeFlag,
      }
    });
  }

  async checkLocGate(id: string, data: any) {
    const plan = await this.prisma.carePlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Care plan not found');
    
    // Simulate LOC gate logic
    const hasWarning = data?.triggerGate === true;
    return { success: !hasWarning, message: 'LOC Gate check completed', warnings: hasWarning ? ['LOC exceeded'] : [] };
  }

  async donReview(id: string, data: any, reviewerId: string) {
    const review = await this.prisma.carePlanReview.create({
      data: {
        carePlanId: id,
        reviewerId: reviewerId,
        status: data.status, // APPROVED, REJECTED
        notes: data.notes
      }
    });
    
    await this.prisma.carePlan.update({
      where: { id },
      data: { status: data.status === 'APPROVED' ? 'Approved' : 'Rejected' }
    });

    return review;
  }

  async eSign(id: string, data: any, signerId: string) {
    const sig = await this.prisma.carePlanSignature.create({
      data: {
        carePlanId: id,
        signerId: signerId,
        signatureToken: data.signatureToken || 'dummy-token-123'
      }
    });
    
    await this.prisma.carePlan.update({
      where: { id },
      data: { status: 'Signed' }
    });

    return sig;
  }

  async idtAck(id: string, data: any, userId: string) {
    return this.prisma.idtAcknowledgment.create({
      data: {
        carePlanId: id,
        userId: userId,
        notes: data.notes
      }
    });
  }
}
