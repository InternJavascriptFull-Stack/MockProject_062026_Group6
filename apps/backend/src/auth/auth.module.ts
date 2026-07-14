import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { AccessTokenGuard } from "./guards/access-token.guard.js";
import { RefreshTokenGuard } from "./guards/refresh-token.guard.js";
import { MailModule } from "../mail/mail.module.js";

@Module({
    imports: [JwtModule.register({ global: true }), MailModule],
    controllers: [AuthController],
    providers: [AuthService, AccessTokenGuard, RefreshTokenGuard],
    exports: [AuthService, AccessTokenGuard, RefreshTokenGuard],
})
export class AuthModule {}
