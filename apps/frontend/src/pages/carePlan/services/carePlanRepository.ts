import type { CarePlan, CarePlanListQuery, PaginatedResult } from "../types";
import { session } from "../../../utils/session";

const API_BASE = "http://localhost:3000/api/care-plans";

export const carePlanRepository = {
  async listCarePlans(query: CarePlanListQuery): Promise<PaginatedResult<CarePlan>> {
    const token = session.getAccessToken();
    const res = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!json.success) {
      console.error("Failed to fetch care plans", json);
      return { items: [], total: 0 };
    }

    // Map backend data to frontend UI structure
    let mapped: CarePlan[] = json.data.map((cp: any) => ({
      id: cp.id,
      residentName: cp.resident ? `${cp.resident.firstName} ${cp.resident.lastName}` : "Unknown Resident",
      room: "101A", // Dummy data as physical structure isn't fully seeded
      locTier: "Tier 2", // Dummy data
      status: cp.status.toLowerCase().replace(" ", "_") as any,
      lastReview: cp.updatedAt ? new Date(cp.updatedAt).toISOString().split('T')[0] : null,
      nextReview: null,
      assigned: cp.creator ? `${cp.creator.firstName} ${cp.creator.lastName}` : "Unassigned",
      createdAt: cp.createdAt
    }));

    // Sort by newest first
    mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (query.search) {
      const lowerSearch = query.search.toLowerCase();
      mapped = mapped.filter((cp) => cp.residentName.toLowerCase().includes(lowerSearch));
    }

    if (query.status && query.status !== "all") {
      mapped = mapped.filter((cp) => cp.status === query.status);
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 5;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: mapped.slice(start, end),
      total: mapped.length,
    };
  },

  async getSummary() {
    const token = session.getAccessToken();
    const res = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!json.success) return { total: 0, draftCount: 0, pendingCount: 0, reviewDueCount: 0, rejectedCount: 0 };

    let draftCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    json.data.forEach((cp: any) => {
      const status = cp.status.toLowerCase();
      if (status === "draft") draftCount++;
      if (status === "pending review") pendingCount++;
      if (status === "rejected") rejectedCount++;
    });

    return {
      total: json.data.length,
      draftCount,
      pendingCount,
      rejectedCount,
      reviewDueCount: 0 // Mocked for now since nextReview logic isn't fully implemented
    };
  }
};

