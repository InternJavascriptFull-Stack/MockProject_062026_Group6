import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { extractBearer, requireSecret } from "./extract-bearer.js";

/**
 * Validates the short-lived Access Token (JWT_ACCESS_SECRET).
 * Attaches the decoded payload to request["user"].
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const token = extractBearer(req);

        if (!token) {
            throw new UnauthorizedException("Access token is missing");
        }

        try {
            const secret = requireSecret("JWT_ACCESS_SECRET", "local_dev_access_secret");
            const payload = await this.jwtService.verifyAsync(token, { secret });
            (req as any).user = payload;
        } catch (err: any) {
            // Re-throw NestJS exceptions as-is; wrap JWT errors
            if (err?.status) throw err;
            throw new UnauthorizedException("Invalid or expired access token");
        }

        return true;
    }
}
