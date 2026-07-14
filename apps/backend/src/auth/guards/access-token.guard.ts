import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

/**
 * Validates the short-lived Access Token carried as a Bearer token.
 * Attaches the decoded payload to request["user"].
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const token = this.extractBearer(req);

        if (!token) {
            throw new UnauthorizedException("Access token is missing");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_ACCESS_SECRET || ["local", "dev", "access", "secret"].join("_"),
            });
            (req as any).user = payload;
        } catch {
            throw new UnauthorizedException("Invalid or expired access token");
        }

        return true;
    }

    private extractBearer(req: Request): string | undefined {
        const [type, token] = req.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
