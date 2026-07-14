import { carePlansService } from "../../../services/carePlans";
import type { CarePlan, CarePlanListQuery, CarePlanStatus, PaginatedResult } from "../types";

function normalizeStatus(status: string): CarePlanStatus {
    const normalized = status.toLowerCase().replaceAll(" - ", "_").replaceAll(" ", "_");
    if (normalized.includes("signature")) return "approved";
    if (normalized === "pending_review") return "pending_review";
    if (normalized === "review_due") return "review_due";
    if (normalized === "needs_update") return "needs_update";
    if (normalized === "approved") return "approved";
    if (normalized === "signed" || normalized === "active") return "active";
    if (normalized === "rejected") return "rejected";
    return "draft";
}

export const carePlanRepository = {
    async listCarePlans(query: CarePlanListQuery): Promise<PaginatedResult<CarePlan>> {
        const plans = await carePlansService.getAll();
        let mapped: CarePlan[] = plans.map((plan) => ({
            id: plan.id,
            residentName: plan.resident ? `${plan.resident.firstName} ${plan.resident.lastName}` : "Unknown Resident",
            room: plan.resident?.roomNumber ?? "Unassigned",
            locTier: plan.activeCareLevel?.name ?? "LOC not confirmed",
            status: normalizeStatus(plan.status),
            lastReview: plan.lastReviewAt ? new Date(plan.lastReviewAt).toISOString().slice(0, 10) : null,
            nextReview: plan.nextReviewAt ? new Date(plan.nextReviewAt).toISOString().slice(0, 10) : null,
            assigned: plan.creator ? `${plan.creator.firstName ?? ""} ${plan.creator.lastName ?? ""}`.trim() || "Unassigned" : "Unassigned",
            createdAt: plan.createdAt,
        }));

        mapped.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
        if (query.search?.trim()) {
            const search = query.search.trim().toLowerCase();
            mapped = mapped.filter((plan) => plan.residentName.toLowerCase().includes(search));
        }
        if (query.status && query.status !== "all") {
            mapped = mapped.filter((plan) => plan.status === query.status);
        }

        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 5;
        const start = (page - 1) * pageSize;
        return { items: mapped.slice(start, start + pageSize), total: mapped.length };
    },

    async getSummary() {
        const plans = await carePlansService.getAll();
        const statuses = plans.map((plan) => normalizeStatus(plan.status));
        const now = Date.now();
        return {
            total: plans.length,
            draftCount: statuses.filter((status) => status === "draft").length,
            pendingCount: statuses.filter((status) => status === "pending_review" || status === "approved").length,
            rejectedCount: statuses.filter((status) => status === "rejected").length,
            reviewDueCount: plans.filter((plan) => plan.nextReviewAt && new Date(plan.nextReviewAt).getTime() <= now).length,
        };
    },
};
