import { Injectable, Logger } from "@nestjs/common";

/**
 * eSMS Vietnam SMS Service
 * Documentation: https://esms.vn/Public/help/api
 *
 * SmsType values:
 *   2 = Brandname (requires registered sender name — most reliable)
 *   4 = Regular SMS (no brandname, cheaper, may be filtered)
 *   6 = OTP brandname (fastest delivery, recommended for OTP)
 *   8 = Zalo ZNS (Zalo notification — different flow)
 *
 * Required env vars:
 *   ESMS_API_KEY     — from esms.vn dashboard
 *   ESMS_SECRET_KEY  — from esms.vn dashboard
 *   ESMS_BRAND_NAME  — registered brandname (e.g. "NHMS"), required for SmsType 2/6
 *                      leave empty to use SmsType 4 (no brandname)
 */

const ESMS_ENDPOINT =
  "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    const apiKey = process.env.ESMS_API_KEY;
    const secretKey = process.env.ESMS_SECRET_KEY;
    const brandName = process.env.ESMS_BRAND_NAME;

    // Development mode — no credentials configured
    if (!apiKey || !secretKey) {
      this.logger.log(`[OTP DEV] Code for ${phoneNumber}: ${otp}`);
      return;
    }

    // Use SmsType 6 (OTP brandname) if brandname is set, else SmsType 4 (regular)
    const smsType = brandName ? 6 : 4;

    const content = `Ma xac thuc NHMS cua ban la: ${otp}. Co hieu luc trong 5 phut. Khong chia se ma nay voi bat ky ai.`;

    const body: Record<string, any> = {
      ApiKey: apiKey,
      Content: content,
      Phone: phoneNumber,
      SecretKey: secretKey,
      SmsType: smsType,
      IsUnicode: 0,
      Sandbox: process.env.NODE_ENV === "production" ? 0 : 1, // 1 = test mode (no real SMS, no charge)
    };

    if (brandName) {
      body.Brandname = brandName;
    }

    try {
      const response = await fetch(ESMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as {
        CodeResult?: string;
        ErrorMessage?: string;
      };

      // eSMS success code is "100"
      if (result.CodeResult !== "100") {
        this.logger.error(
          `eSMS error — code: ${result.CodeResult}, message: ${result.ErrorMessage ?? "unknown"}`,
        );
        // Fail silently — OTP is still stored, user can request resend
      } else {
        this.logger.log(`[SMS] OTP sent to ${phoneNumber} via eSMS`);
      }
    } catch (error: any) {
      // Network error — fail silently so auth flow is not blocked
      this.logger.error(`eSMS network error: ${error.message}`);
    }
  }
}
