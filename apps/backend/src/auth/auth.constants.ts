// ─── OTP configuration ────────────────────────────────────────────────────────
/** OTP time-to-live in milliseconds (5 minutes). */
export const OTP_TTL_MS = 5 * 60 * 1000;

/** Maximum number of incorrect OTP attempts before the session is invalidated. */
export const OTP_MAX_ATTEMPTS = 5;

/** Maximum number of OTP resend requests per session. */
export const OTP_MAX_RESENDS = 3;

// ─── Activation link configuration ───────────────────────────────────────────
/**
 * Activation link TTL in milliseconds (24 hours).
 * Displayed as 24 h in all UI copy — keep in sync with frontend Activation.tsx.
 */
export const ACTIVATION_TTL_MS = 24 * 60 * 60 * 1000;

// ─── Account status values ────────────────────────────────────────────────────
export const ACCOUNT_STATUS = {
    INVITED: "INVITED",
    PENDING: "PENDING",
    INACTIVE: "INACTIVE",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    DEACTIVATED: "DEACTIVATED",
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

// ─── Helper predicates ────────────────────────────────────────────────────────

/** Returns true if account has not been activated yet. */
export function isUnactivated(status: string): boolean {
    return status === ACCOUNT_STATUS.INVITED || status === ACCOUNT_STATUS.PENDING || status === ACCOUNT_STATUS.INACTIVE;
}

/** Returns true if account is blocked by admin. */
export function isBlocked(status: string): boolean {
    return status === ACCOUNT_STATUS.SUSPENDED || status === ACCOUNT_STATUS.DEACTIVATED;
}
