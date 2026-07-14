import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateBillingRateDto } from "./dto/update-billing-rate.dto.js";

@Injectable()
export class BillingService {
    constructor(private readonly prisma: PrismaService) {}

    async getResidentBilling(residentId: string) {
        const resident = await this.prisma.residents.findUnique({
            where: { id: residentId },
            include: { beds: { include: { rooms: true } } },
        });
        if (!resident || resident.is_deleted) throw new NotFoundException("Resident not found");

        const loc = await this.prisma.resident_care_level_history.findFirst({
            where: { resident_id: residentId },
            include: { care_levels: true },
            orderBy: { start_date: "desc" },
        });
        const facility = await this.prisma.facility.findFirst({ where: { isDeleted: false } });
        const rate =
            loc && facility
                ? await this.prisma.care_level_rates.findFirst({
                      where: {
                          care_level_id: loc.care_level_id,
                          facility_id: facility.id,
                          effective_from: { lte: new Date() },
                          OR: [{ effective_to: null }, { effective_to: { gte: new Date() } }],
                      },
                      orderBy: { effective_from: "desc" },
                  })
                : null;
        const invoice = await this.prisma.invoices.findFirst({
            where: { resident_id: residentId, is_deleted: false },
            include: { invoice_line_items: true },
            orderBy: { created_at: "desc" },
        });

        const dailyRate = rate ? Number(rate.daily_rate) : 0;
        const monthlyEstimate = dailyRate * 30;
        const total = invoice ? Number(invoice.total_amount) : monthlyEstimate;
        const medicare = invoice ? Number(invoice.medicare_covered_amount) : total * 0.45;
        const medicaid = invoice ? Number(invoice.medicaid_covered_amount) : total * 0.25;
        const privateInsurance = invoice ? Number(invoice.private_insurance_covered_amount) : 0;
        const privatePay = invoice ? Number(invoice.patient_responsibility_amount) : Math.max(0, total - medicare - medicaid - privateInsurance);

        const rateHistory =
            loc && facility
                ? await this.prisma.care_level_rates.findMany({
                      where: { care_level_id: loc.care_level_id, facility_id: facility.id },
                      orderBy: { effective_from: "desc" },
                      take: 10,
                  })
                : [];

        return {
            resident: {
                id: resident.id,
                fullName: [resident.first_name, resident.middle_name, resident.last_name].filter(Boolean).join(" "),
                roomNumber: resident.beds?.rooms?.room_number ?? null,
            },
            activeLoc: loc
                ? { id: loc.care_level_id.toString(), code: loc.care_levels.level_code, name: loc.care_levels.level_name, startDate: loc.start_date.toISOString().slice(0, 10) }
                : null,
            dailyRate,
            monthlyEstimate,
            billingPeriod: invoice
                ? {
                      start: invoice.billing_period_start.toISOString().slice(0, 10),
                      end: invoice.billing_period_end.toISOString().slice(0, 10),
                      dueDate: invoice.due_date.toISOString().slice(0, 10),
                  }
                : null,
            status: invoice?.status ?? "ESTIMATE",
            total,
            payerBreakdown: { medicare, medicaid, privateInsurance, privatePay },
            lineItems:
                invoice?.invoice_line_items.map((item) => ({ id: item.id.toString(), description: item.description, itemType: item.item_type, amount: Number(item.amount) })) ?? [],
            rateHistory: rateHistory.map((item) => ({
                id: item.id.toString(),
                dailyRate: Number(item.daily_rate),
                effectiveFrom: item.effective_from.toISOString().slice(0, 10),
                effectiveTo: item.effective_to?.toISOString().slice(0, 10) ?? null,
            })),
        };
    }

    async updateRate(residentId: string, careLevelId: string, dto: UpdateBillingRateDto) {
        const resident = await this.prisma.residents.findUnique({ where: { id: residentId } });
        if (!resident) throw new NotFoundException("Resident not found");
        const facilityId = dto.facilityId ?? (await this.prisma.facility.findFirst({ where: { isDeleted: false }, select: { id: true } }))?.id;
        if (!facilityId) throw new NotFoundException("No active facility is available");
        const effectiveFrom = new Date(`${dto.effectiveFrom}T00:00:00.000Z`);
        const previousDay = new Date(effectiveFrom);
        previousDay.setUTCDate(previousDay.getUTCDate() - 1);
        await this.prisma.$transaction(async (transaction) => {
            await transaction.care_level_rates.updateMany({
                where: { care_level_id: BigInt(careLevelId), facility_id: facilityId, effective_to: null, effective_from: { lt: effectiveFrom } },
                data: { effective_to: previousDay },
            });
            await transaction.care_level_rates.create({
                data: { care_level_id: BigInt(careLevelId), facility_id: facilityId, daily_rate: dto.dailyRate, effective_from: effectiveFrom },
            });
        });
        return this.getResidentBilling(residentId);
    }
}
