import { Injectable, Logger, InternalServerErrorException } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    /**
     * Sends a 6-digit OTP to the given email address.
     * Throws InternalServerErrorException if the send fails —
     * the caller must NOT create a session when this throws.
     *
     * Config via environment variables:
     *   MAIL_HOST     — SMTP host (e.g. smtp.gmail.com)
     *   MAIL_PORT     — SMTP port (e.g. 587 for TLS, 465 for SSL)
     *   MAIL_SECURE   — "true" for SSL (port 465), omit or "false" for TLS
     *   MAIL_USER     — SMTP username / sender address
     *   MAIL_PASSWORD — SMTP password or app password
     *   MAIL_FROM     — Display name + address, e.g. "NHMS <noreply@nhms.org>"
     */
    async sendOtp(toEmail: string, otp: string): Promise<void> {
        const host = process.env.MAIL_HOST || process.env.SMTP_HOST;
        const user = process.env.MAIL_USER || process.env.EMAIL_USER;
        const password = process.env.MAIL_PASSWORD || process.env.EMAIL_PASSWORD;
        const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587);
        const secure = process.env.MAIL_SECURE === "true" || process.env.SMTP_SECURE === "true";

        // Development fallback — log to console when SMTP is not configured
        if (!host || !user || !password) {
            this.logger.log(`[OTP DEV] Code for ${toEmail}: ${otp}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass: password },
        });

        const from = process.env.MAIL_FROM || process.env.EMAIL_FROM || user;

        const mailOptions: nodemailer.SendMailOptions = {
            from,
            to: toEmail,
            subject: "Your Verification Code",
            text: [
                "Hello,",
                "",
                "Your verification code is:",
                "",
                `  ${otp}`,
                "",
                "This code will expire in 5 minutes.",
                "If you did not request this code, please ignore this email.",
            ].join("\n"),
            html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#1e3a5f">Your Verification Code</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                      color:#2563eb;padding:16px 0">${otp}</div>
          <p style="color:#555">This code will expire in <strong>5 minutes</strong>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="font-size:12px;color:#999">
            If you did not request this code, please ignore this email.
          </p>
        </div>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            this.logger.log(`[Mail] OTP sent to ${toEmail}`);
        } catch (error: any) {
            this.logger.error(`[Mail] Failed to send OTP to ${toEmail}: ${error.message}`);
            // Requirement 6: if email fails, do NOT create session — throw so caller aborts
            throw new InternalServerErrorException("Unable to send OTP email.");
        }
    }

    async sendInvitation(toEmail: string, fullName: string, token: string): Promise<void> {
        const host = process.env.MAIL_HOST || process.env.SMTP_HOST;
        const user = process.env.MAIL_USER || process.env.EMAIL_USER;
        const password = process.env.MAIL_PASSWORD || process.env.EMAIL_PASSWORD;
        const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587);
        const secure = process.env.MAIL_SECURE === "true" || process.env.SMTP_SECURE === "true";
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

        // Development fallback — log to console when SMTP is not configured
        if (!host || !user || !password) {
            this.logger.log(`[Invitation DEV] Activation link for ${toEmail}: ${frontendUrl}/activate?token=${token}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass: password },
        });

        const from = process.env.MAIL_FROM || process.env.EMAIL_FROM || user;

        const mailOptions: nodemailer.SendMailOptions = {
            from,
            to: toEmail,
            subject: "You're invited to activate your account",
            text: [
                `Hello ${fullName},`,
                "",
                "An administrator has created an account for you.",
                "",
                "Please click the link below to activate your account:",
                `${frontendUrl}/activate?token=${token}`,
                "",
                "The link expires in 24 hours.",
                "",
                "If you did not expect this invitation, please ignore this email.",
            ].join("\n"),
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto">
                  <h2 style="color:#1e3a5f">Activate Your Account</h2>
                  <p>Hello ${fullName},</p>
                  <p>An administrator has created an account for you.</p>
                  <p>Please click the button below to activate your account.</p>
                  <p style="margin:24px 0">
                    <a href="${frontendUrl}/activate?token=${token}"
                       style="background-color:#2563eb;color:#ffffff;padding:12px 24px;
                              text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block">
                      Activate Account
                    </a>
                  </p>
                  <p style="color:#555">Alternatively, copy and paste this link in your browser:</p>
                  <p style="word-break:break-all;color:#2563eb">${frontendUrl}/activate?token=${token}</p>
                  <p style="color:#555">The link expires in <strong>24 hours</strong>.</p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                  <p style="font-size:12px;color:#999">
                    If you did not expect this invitation, please ignore this email.
                  </p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            this.logger.log(`[Mail] Invitation sent to ${toEmail}`);
        } catch (error: any) {
            this.logger.error(`[Mail] Failed to send invitation to ${toEmail}: ${error.message}`);
            // Log fallback activation link to terminal in case SMTP is blocked/fails
            console.log(`[Invitation FALLBACK] Failed to send email. Activation link for ${toEmail}: ${frontendUrl}/activate?token=${token}`);
        }
    }
}
