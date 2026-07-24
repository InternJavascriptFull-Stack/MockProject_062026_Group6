import { apiClient } from "./apiClient";
import type { ApiResponse, LoginResponse, VerifyOtpResponse, ResendOtpResponse, User } from "../types/auth";
import { session } from "../utils/session";

/**
 * Auth service — uses the shared Axios apiClient which:
 *   - attaches Bearer token automatically via request interceptor
 *   - normalises error messages via response interceptor
 *   - has a 15 s timeout
 */
export const authService = {
    /** POST /api/auth/login */
    async login(emailOrPhone: string, password: string): Promise<ApiResponse<LoginResponse>> {
        const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", {
            identifier: emailOrPhone,
            password,
        });
        return data;
    },

    /** POST /api/auth/verify-otp */
    async verifyOtp(email: string, otp: string): Promise<ApiResponse<VerifyOtpResponse>> {
        const { data } = await apiClient.post<ApiResponse<VerifyOtpResponse>>("/auth/verify-otp", {
            email,
            otp,
        });
        return data;
    },

    /** POST /api/auth/resend-otp */
    async resendOtp(email: string): Promise<ApiResponse<ResendOtpResponse>> {
        const { data } = await apiClient.post<ApiResponse<ResendOtpResponse>>("/auth/resend-otp", {
            email,
        });
        return data;
    },

    /** POST /api/auth/activate */
    async activate(email: string, activationCode: string, password: string, phoneNumber: string): Promise<ApiResponse<void>> {
        const { data } = await apiClient.post<ApiResponse<void>>("/auth/activate", {
            email,
            activationCode,
            password,
            phoneNumber,
        });
        return data;
    },

    /** GET /api/auth/activate?token=... */
    async getActivateContext(token: string): Promise<ApiResponse<{ email: string; phoneNumber?: string }>> {
        const { data } = await apiClient.get<ApiResponse<{ email: string; phoneNumber?: string }>>(`/auth/activate?token=${token}`);
        return data;
    },

    /** GET /api/auth/me — requires Bearer token (added via interceptor automatically) */
    async getMe(): Promise<ApiResponse<User>> {
        const { data } = await apiClient.get<ApiResponse<User>>("/auth/me");
        return data;
    },

    /** GET /api/auth/profile — requires Bearer token */
    async getProfile(): Promise<ApiResponse<User>> {
        const { data } = await apiClient.get<ApiResponse<User>>("/auth/profile");
        return data;
    },

    /**
     * POST /api/auth/logout
     * Session is cleared in `finally` so it always happens regardless of
     * network errors (prevents stale local session if server call fails).
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post("/auth/logout");
        } finally {
            // Always clear local session — even if the network request fails
            session.clear();
        }
    },
};
