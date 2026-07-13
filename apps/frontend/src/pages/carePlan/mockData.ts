import type { CarePlan } from "./types";

export const MOCK_CARE_PLANS: CarePlan[] = [
  {
    id: "CP-001",
    residentName: "Susan Wright",
    room: "114B",
    locTier: "Tier 2",
    status: "needs_update",
    lastReview: "2026-03-30",
    nextReview: "overdue",
    assigned: "Anna Lee",
    createdAt: "2026-07-13T00:00:00.000Z"
  },
  {
    id: "CP-002",
    residentName: "James Porter",
    room: "210B",
    locTier: "Tier 4",
    status: "review_due",
    lastReview: "2026-04-04",
    nextReview: "2026-07-03",
    assigned: "Anna Lee",
    createdAt: "2026-07-13T00:00:00.000Z"
  },
  {
    id: "CP-003",
    residentName: "Robert Hayes",
    room: "204B",
    locTier: "Tier 3",
    status: "active",
    lastReview: "2026-04-08",
    nextReview: "2026-07-07",
    assigned: "Anna Lee",
    createdAt: "2026-07-13T00:00:00.000Z"
  },
  {
    id: "CP-004",
    residentName: "David Nguyen",
    room: "222A",
    locTier: "Tier 3",
    status: "active",
    lastReview: "2026-05-20",
    nextReview: "2026-08-18",
    assigned: "Anna Lee",
    createdAt: "2026-07-13T00:00:00.000Z"
  },
  {
    id: "CP-005",
    residentName: "Mary Coleman",
    room: "118A",
    locTier: "Tier 2",
    status: "pending_review",
    lastReview: null,
    nextReview: null,
    assigned: "Anna Lee",
    createdAt: "2026-07-13T00:00:00.000Z"
  },
  {
    id: "CP-006",
    residentName: "Elena Ramos",
    room: "106A",
    locTier: "Tier 1",
    status: "draft",
    lastReview: null,
    nextReview: null,
    assigned: "Anna Lee",
    createdAt: "2026-07-13T00:00:00.000Z"
  }
];
