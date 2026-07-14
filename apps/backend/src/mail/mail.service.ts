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
        const host = process.env.MAIL_HOST;
        const user = process.env.MAIL_USER;
        const password = process.env.MAIL_PASSWORD;

        // Development fallback — log to console when SMTP is not configured
        if (!host || !user || !password) {
            this.logger.log(`[OTP DEV] Code for ${toEmail}: ${otp}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            host,
            port: Number(process.env.MAIL_PORT ?? 587),
            secure: process.env.MAIL_SECURE === "true",
            auth: { user, pass: password },
        });

        const from = process.env.MAIL_FROM ?? user;

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
}
