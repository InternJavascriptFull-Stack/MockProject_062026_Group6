export interface User {
  id: string;
  email: string;
  employeeCode: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phoneNumber: string | null;
  roleId: string | null;
  roleName: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  mfaEnabled: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/** Returned by POST /api/auth/login */
export interface LoginResponse {
  email: string;
  twoStepRequired: boolean;
  token?: string;
  tempCode?: string;
  phoneHint?: string | null;
}

/** Returned by POST /api/auth/verify-otp */
export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Returned by POST /api/auth/resend-otp */
export interface ResendOtpResponse {
  tempCode?: string;
}
