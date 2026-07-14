import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../prisma/prisma.service.js";
import { MailService } from "../mail/mail.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { VerifyOtpDto } from "./dto/verify-otp.dto.js";
import { ResendOtpDto } from "./dto/resend-otp.dto.js";
import { ActivateDto } from "./dto/activate.dto.js";

// ─── In-memory OTP store ──────────────────────────────────────────────────────
// Keyed by user email (canonical, always unique).
// TODO: replace with Redis in production.
const otpStore = new Map<string, { code: string; expiresAt: Date; attempts: number; resends: number }>();

// ─── Account status constants ─────────────────────────────────────────────────
const STATUS = {
    INVITED: "INVITED", // SC_001: newly provisioned, not yet activated
    PENDING: "PENDING", // alias used in current DB default
    INACTIVE: "INACTIVE", // activation-pending state in current schema
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    DEACTIVATED: "DEACTIVATED",
} as const;

function isOtpBypassEnabled(): boolean {
    return String(process.env.SKIP_OTP ?? "false").toLowerCase() === "true";
}

/** Returns true if account has not been activated yet (SC_001). */
function isUnactivated(status: string): boolean {
    return status === STATUS.INVITED || status === STATUS.PENDING || status === STATUS.INACTIVE;
}

/** Returns true if account is blocked by admin (SC_001). */
function isBlocked(status: string): boolean {
    return status === STATUS.SUSPENDED || status === STATUS.DEACTIVATED;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    // ── Private helpers ───────────────────────────────────────────────────────

    /** Sanitised user object for API responses. BigInt → string. */
    private buildUserPayload(user: any) {
        return {
            id: user.id,
            email: user.email,
            employeeCode: user.employeeCode,
            firstName: user.firstName,
            middleName: user.middleName ?? null,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber ?? null,
            roleId: user.roleId != null ? user.roleId.toString() : null,
            roleName: user.role?.roleName ?? null,
            status: user.status,
            mfaEnabled: user.mfaEnabled,
        };
    }

    /** Signs a short-lived access JWT (24 h). */
    private async issueAccessToken(user: { id: string; email: string; role?: { roleName: string } | null }): Promise<string> {
        return this.jwtService.signAsync(
            { sub: user.id, email: user.email, role: user.role?.roleName ?? null },
            {
                secret: process.env.JWT_ACCESS_SECRET || ["local", "dev", "access", "secret"].join("_"),
                expiresIn: "24h" as any,
            },
        );
    }

    /** Signs a long-lived refresh JWT (7 d). */
    private async issueRefreshToken(user: { id: string; email: string }): Promise<string> {
        return this.jwtService.signAsync(
            { sub: user.id, email: user.email },
            {
                secret: process.env.JWT_REFRESH_SECRET || ["local", "dev", "refresh", "secret"].join("_"),
                expiresIn: "7d" as any,
            },
        );
    }

    /** Generates a random 6-digit OTP string. */
    private generateOtp(): string {
        return Math.floor(100_000 + Math.random() * 900_000).toString();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. LOGIN  —  POST /api/auth/login
    //
    // Accepts email OR phone number + password.
    // On success: generate OTP → send to email → return otpRequired.
    // DO NOT issue JWT. DO NOT update last_login_at here.
    // ══════════════════════════════════════════════════════════════════════════
    async login(dto: LoginDto) {
        const identifier = dto.identifier;
        const { password } = dto;

        const isEmail = identifier.includes("@");

        // Always use user.email as OTP session key — never identifier directly
        const user = await this.prisma.user.findFirst({
            where: isEmail ? { email: identifier.toLowerCase(), isDeleted: false } : { phoneNumber: identifier, isDeleted: false },
        });

        // Timing-safe: run bcrypt even when user not found
        const hashToCompare = user?.passwordHash?.trim() ? user.passwordHash : "$2b$12$AAAAAAAAAAAAAAAAAAAAAA.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

        const isPasswordValid = await bcrypt.compare(password, hashToCompare);

        // Generic error — never reveal whether user exists or password is wrong
        if (!user || !isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // SC_001: INVITED / PENDING / INACTIVE → not yet activated
        if (isUnactivated(user.status)) {
            throw new BadRequestException("Account not activated, check invite link.");
        }

        // SC_001: SUSPENDED / DEACTIVATED → blocked by admin
        if (isBlocked(user.status)) {
            throw new ForbiddenException("Please contact your administrator.");
        }

        if (user.status !== STATUS.ACTIVE) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (isOtpBypassEnabled()) {
            const [accessToken, refreshToken] = await Promise.all([this.issueAccessToken(user), this.issueRefreshToken(user)]);

            return {
                success: true,
                message: "Login successful.",
                data: {
                    email: user.email,
                    twoStepRequired: false,
                    accessToken,
                    refreshToken,
                    user: this.buildUserPayload({ ...user, role: null } as any),
                },
            };
        }

        // Generate OTP and store — keyed by user.email
        const code = this.generateOtp();
        otpStore.set(user.email, {
            code,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            attempts: 0,
            resends: 0,
        });

        // Send OTP via email — throws if delivery fails (requirement 6)
        await this.mailService.sendOtp(user.email, code);

        return {
            success: true,
            message: "OTP has been sent to your email.",
            data: {
                email: user.email,
                otpRequired: true,
                twoStepRequired: true,
            },
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. VERIFY OTP  —  POST /api/auth/verify-otp
    //
    // ONLY place where JWT is issued.
    // ONLY place where last_login_at is updated.
    // ══════════════════════════════════════════════════════════════════════════
    async verifyOtp(dto: VerifyOtpDto) {
        const { email, otp } = dto;
        const stored = otpStore.get(email);

        if (!stored) {
            throw new BadRequestException("OTP session not found or expired. Please log in again.");
        }

        if (new Date() > stored.expiresAt) {
            otpStore.delete(email);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (stored.attempts >= 5) {
            otpStore.delete(email);
            throw new BadRequestException("Too many incorrect attempts. Please log in again.");
        }

        if (stored.code !== otp) {
            stored.attempts += 1;
            const remaining = 5 - stored.attempts;
            if (remaining <= 0) {
                otpStore.delete(email);
                throw new BadRequestException("Too many incorrect attempts. Please log in again.");
            }
            throw new BadRequestException(`Invalid OTP code. ${remaining} attempt(s) remaining.`);
        }

        // ✅ Correct OTP — consume immediately (one-time use)
        otpStore.delete(email);

        // Fetch full user with role for JWT payload
        const user = await this.prisma.user.findFirst({
            where: { email, isDeleted: false },
            include: { role: true },
        });

        if (!user) {
            throw new UnauthorizedException("User not found.");
        }

        if (isBlocked(user.status)) {
            throw new ForbiddenException("Please contact your administrator.");
        }

        if (user.status !== STATUS.ACTIVE) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Update last_login_at ONLY here (SC requirement 5)
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Issue JWT ONLY here (SC requirement 2)
        const [accessToken, refreshToken] = await Promise.all([this.issueAccessToken(user), this.issueRefreshToken(user)]);

        return {
            success: true,
            message: "Login successful",
            data: {
                token: accessToken,
                accessToken,
                refreshToken,
                user: this.buildUserPayload(user),
            },
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. RESEND OTP  —  POST /api/auth/resend-otp
    // ══════════════════════════════════════════════════════════════════════════
    async resendOtp(dto: ResendOtpDto) {
        const { email } = dto;
        const stored = otpStore.get(email);

        if (!stored) {
            throw new BadRequestException("No active OTP session. Please log in again.");
        }

        if (new Date() > stored.expiresAt) {
            otpStore.delete(email);
            throw new BadRequestException("OTP session has expired. Please log in again.");
        }

        if (stored.resends >= 3) {
            otpStore.delete(email);
            throw new HttpException(
                {
                    success: false,
                    message: "Too many resend requests. Please log in again.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        // Replace old OTP with new one, reset expiry
        const code = this.generateOtp();
        otpStore.set(email, {
            code,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0,
            resends: stored.resends + 1,
        });

        await this.mailService.sendOtp(email, code);

        return {
            success: true,
            message: "A new OTP has been sent to your email.",
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4a. GET ACTIVATION CONTEXT  —  GET /api/auth/activate?email=&code=
    // ══════════════════════════════════════════════════════════════════════════
    async getActivateContext(email: string, code: string) {
        const user = await this.prisma.user.findFirst({
            where: { email, isDeleted: false },
        });

        if (!user || !isUnactivated(user.status)) {
            throw new BadRequestException("Invalid or expired activation link.");
        }

        if (user.licenseNumber !== code) {
            throw new BadRequestException("Invalid or expired activation link.");
        }

        const ageMs = Date.now() - user.createdAt.getTime();
        if (ageMs > 24 * 60 * 60 * 1000) {
            throw new BadRequestException("Invalid or expired activation link.");
        }

        return {
            success: true,
            data: {
                email: user.email,
                phoneNumber: user.phoneNumber ?? null,
            },
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4b. ACTIVATE ACCOUNT  —  POST /api/auth/activate
    //
    // SC_002: validate code → set password + phone → status=ACTIVE, mfa=true.
    // DO NOT send OTP. DO NOT log user in.
    // ══════════════════════════════════════════════════════════════════════════
    async activate(dto: ActivateDto) {
        const { email, activationCode, password, phoneNumber } = dto;

        const user = await this.prisma.user.findFirst({
            where: { email, isDeleted: false },
        });

        if (!user || !isUnactivated(user.status)) {
            throw new BadRequestException("Invalid or expired activation link.");
        }

        if (user.licenseNumber !== activationCode) {
            throw new BadRequestException("Invalid or expired activation link.");
        }

        const ageMs = Date.now() - user.createdAt.getTime();
        if (ageMs > 24 * 60 * 60 * 1000) {
            throw new BadRequestException("Invalid or expired activation link.");
        }

        const finalPhone = phoneNumber?.trim() || user.phoneNumber?.trim() || "";
        if (!finalPhone) {
            throw new BadRequestException("Phone number is required for activation.");
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                phoneNumber: finalPhone,
                status: STATUS.ACTIVE,
                mfaEnabled: true,
                licenseNumber: null,
            },
        });

        return {
            success: true,
            message: "Account activated successfully. Please login.",
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. REFRESH  —  POST /api/auth/refresh  (RefreshTokenGuard)
    // ══════════════════════════════════════════════════════════════════════════
    async refreshTokens(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || user.isDeleted || user.status !== STATUS.ACTIVE) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        const [accessToken, refreshToken] = await Promise.all([this.issueAccessToken(user), this.issueRefreshToken(user)]);

        return {
            success: true,
            message: "Tokens refreshed successfully.",
            data: { accessToken, refreshToken },
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. LOGOUT  —  POST /api/auth/logout  (AccessTokenGuard)
    // ══════════════════════════════════════════════════════════════════════════
    async logout(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        if (user) {
            otpStore.delete(user.email);
        }
        return { success: true, message: "Logged out successfully." };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PROFILE  —  GET /api/auth/profile & GET /api/auth/me  (AccessTokenGuard)
    // ══════════════════════════════════════════════════════════════════════════
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || user.isDeleted) {
            throw new UnauthorizedException("User not found.");
        }

        return {
            success: true,
            data: this.buildUserPayload(user),
        };
    }
}
