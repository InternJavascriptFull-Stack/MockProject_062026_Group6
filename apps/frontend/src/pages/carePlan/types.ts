export type CarePlanStatus = "draft" | "active" | "pending_review" | "review_due" | "needs_update";

export type CarePlan = {
  id: string;
  residentName: string;
  room: string;
  locTier: string;
  status: CarePlanStatus;
  lastReview: string | null;
  nextReview: string | null;
  assigned: string;
};

export type CarePlanListQuery = {
  search?: string;
  status?: CarePlanStatus | "all";
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};
