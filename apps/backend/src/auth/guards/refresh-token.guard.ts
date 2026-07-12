import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

/**
 * Validates the long-lived Refresh Token (signed with JWT_REFRESH_SECRET).
 * Attaches the decoded payload to request["user"].
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearer(req);

    if (!token) {
      throw new UnauthorizedException("Refresh token is missing");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      (req as any)["user"] = payload;
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    return true;
  }

  private extractBearer(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
