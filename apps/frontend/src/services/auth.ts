import type {
  ApiResponse,
  LoginResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
  User,
} from "../types/auth";
import { session } from "../utils/session";

const BASE_URL = "/api/auth";

export const authService = {
  /** POST /api/auth/login */
  async login(
    emailOrPhone: string,
    password: string,
  ): Promise<ApiResponse<LoginResponse>> {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: emailOrPhone, password }),
    });
    return res.json();
  },

  /** POST /api/auth/verify-otp */
  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<ApiResponse<VerifyOtpResponse>> {
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return res.json();
  },

  /** POST /api/auth/resend-otp */
  async resendOtp(email: string): Promise<ApiResponse<ResendOtpResponse>> {
    const res = await fetch(`${BASE_URL}/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  /** POST /api/auth/activate */
  async activate(
    email: string,
    activationCode: string,
    password: string,
    phoneNumber: string,
  ): Promise<ApiResponse<void>> {
    const res = await fetch(`${BASE_URL}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, activationCode, password, phoneNumber }),
    });
    return res.json();
  },

  /** GET /api/auth/me (requires Bearer token) */
  async getMe(): Promise<ApiResponse<User>> {
    const token = session.getAccessToken();
    const res = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  /** GET /api/auth/profile (requires Bearer token) */
  async getProfile(): Promise<ApiResponse<User>> {
    const token = session.getAccessToken();
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  /** POST /api/auth/logout */
  async logout(): Promise<ApiResponse<void>> {
    const token = session.getAccessToken();
    const res = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    session.clear();
    return res.json();
  },
};
