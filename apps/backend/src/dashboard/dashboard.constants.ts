export const ROLE_NAMES = {
    SYSTEM_ADMIN: "System Admin",
    DON: "DON (Director of Nursing)",
    NURSE: "Nurse (RN/LPN)",
    CNA: "CNA",
};

export const CLINICAL_ROLES = [
    ROLE_NAMES.SYSTEM_ADMIN,
    ROLE_NAMES.DON,
    ROLE_NAMES.NURSE,
    ROLE_NAMES.CNA,
];

export const DON_ROLES = [
    ROLE_NAMES.SYSTEM_ADMIN,
    ROLE_NAMES.DON,
];

// Note: Keep these status strings in sync with frontend/router
export const STATUS = {
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
    DRAFT: "Draft",
    REJECTED: "Rejected",
    PENDING_REVIEW: "Pending Review",
    APPROVED_SIGNATURE: "Approved - Signature Required",
};

export const CUTOFF_DAYS = {
    ASSESSMENT: 14,
    REVIEW: 90,
};

export const DAY_IN_MS = 24 * 60 * 60 * 1000;
