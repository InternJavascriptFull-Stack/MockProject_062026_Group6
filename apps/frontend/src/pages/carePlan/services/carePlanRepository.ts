import { MOCK_CARE_PLANS } from "../mockData";
import type { CarePlan, CarePlanListQuery, PaginatedResult } from "../types";

export const carePlanRepository = {
  async listCarePlans(query: CarePlanListQuery): Promise<PaginatedResult<CarePlan>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...MOCK_CARE_PLANS];

    if (query.search) {
      const lowerSearch = query.search.toLowerCase();
      filtered = filtered.filter(
        (cp) =>
          cp.residentName.toLowerCase().includes(lowerSearch) ||
          cp.residentCode.toLowerCase().includes(lowerSearch) ||
          cp.title.toLowerCase().includes(lowerSearch)
      );
    }

    if (query.status && query.status !== "all") {
      filtered = filtered.filter((cp) => cp.status === query.status);
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 5;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
    };
  },
};
