import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { AuthService } from "./auth.service.js";
import { AccessTokenGuard } from "./guards/access-token.guard.js";
import { RefreshTokenGuard } from "./guards/refresh-token.guard.js";
import { LoginDto } from "./dto/login.dto.js";
import { VerifyOtpDto } from "./dto/verify-otp.dto.js";
import { ResendOtpDto } from "./dto/resend-otp.dto.js";
import { ActivateDto } from "./dto/activate.dto.js";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/login
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /api/auth/verify-otp
  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // POST /api/auth/resend-otp
  @Post("resend-otp")
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  // GET /api/auth/activate?email=...&code=...
  @Get("activate")
  async getActivateContext(
    @Query("email") email: string,
    @Query("code") code: string,
  ) {
    return this.authService.getActivateContext(email, code);
  }

  // GET /api/auth/activate-context?email=...&code=...
  @Get("activate-context")
  async getActivateContextOnly(
    @Query("email") email: string,
    @Query("code") code: string,
  ) {
    return this.authService.getActivateContext(email, code);
  }

  // POST /api/auth/activate
  @Post("activate")
  @HttpCode(HttpStatus.OK)
  async activate(@Body() dto: ActivateDto) {
    return this.authService.activate(dto);
  }

  // POST /api/auth/refresh  — Bearer: <refreshToken>
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refresh(@Req() req: Request) {
    const user = (req as any)["user"];
    return this.authService.refreshTokens(user.sub);
  }

  // POST /api/auth/logout  — Bearer: <accessToken>
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async logout(@Req() req: Request) {
    const user = (req as any)["user"];
    return this.authService.logout(user.sub);
  }

  // GET /api/auth/me  — Bearer: <accessToken>
  @Get("me")
  @UseGuards(AccessTokenGuard)
  async getMe(@Req() req: Request) {
    const user = (req as any)["user"];
    return this.authService.getProfile(user.sub);
  }

  // GET /api/auth/profile  — Bearer: <accessToken>
  @Get("profile")
  @UseGuards(AccessTokenGuard)
  async getProfile(@Req() req: Request) {
    const user = (req as any)["user"];
    return this.authService.getProfile(user.sub);
  }
}
