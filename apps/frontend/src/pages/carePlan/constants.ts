import type { CarePlanStatus } from "./types";

export const CARE_PLAN_STATUS_LABEL: Record<CarePlanStatus, string> = {
  draft: "Draft",
  active: "Active",
  pending_review: "Pending Review",
  review_due: "Review Due",
  needs_update: "Needs Update",
  approved: "Approved",
  signed: "Signed",
  rejected: "Rejected",
};
