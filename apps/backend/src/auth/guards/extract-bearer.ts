import { InternalServerErrorException } from "@nestjs/common";
import { Request } from "express";

/**
 * Extracts the raw Bearer token from the Authorization header.
 * Returns undefined if the header is missing or not a Bearer scheme.
 */
export function extractBearer(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
}

/**
 * Returns the JWT secret for the given token type.
 * Throws at startup if the env variable is missing, preventing silent fallback
 * to a weak hard-coded value in production (Security ID-19).
 */
export function requireSecret(envKey: string, fallback?: string): string {
    const value = process.env[envKey];
    if (!value) {
        if (fallback && process.env.NODE_ENV !== "production") {
            // Dev-only fallback — explicit and obvious, never silent
            return fallback;
        }
        throw new InternalServerErrorException(`Missing required environment variable: ${envKey}. ` + "Set it in .env before starting the application.");
    }
    return value;
}
