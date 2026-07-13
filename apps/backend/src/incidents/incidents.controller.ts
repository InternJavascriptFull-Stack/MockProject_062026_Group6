import { Controller, Get, Post, Param, Body, UseGuards, Req, ForbiddenException, BadRequestException } from "@nestjs/common";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { IncidentsService } from "./incidents.service.js";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("incidents")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/incidents")
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get incident by ID" })
  findOne(@Param("id") id: string) {
    return this.incidentsService.findOne(id);
  }

  @Post(":id/lock-chart")
  @ApiOperation({ summary: "Lock resident chart relative to an incident" })
  lockChart(
    @Param("id") id: string,
    @Body() body: { reason?: string },
    @Req() req: any
  ) {
    this.checkPermission(req, ["System Admin", "DON (Director of Nursing)", "Nurse (RN/LPN)"]);
    const userId = req.user.sub;
    return this.incidentsService.lockChart(id, body.reason || "", userId);
  }

  @Post(":id/unlock-chart")
  @ApiOperation({ summary: "Unlock resident chart relative to an incident" })
  unlockChart(
    @Param("id") id: string,
    @Body() body: { reason: string; passwordConfirm: string },
    @Req() req: any
  ) {
    this.checkPermission(req, ["System Admin", "DON (Director of Nursing)"]);
    if (!body.reason?.trim()) {
      throw new BadRequestException("Reason is required to unlock chart");
    }
    if (!body.passwordConfirm) {
      throw new BadRequestException("Password confirmation is required");
    }
    const userId = req.user.sub;
    return this.incidentsService.unlockChart(id, body.reason, body.passwordConfirm, userId);
  }

  private checkPermission(req: any, allowedRoles: string[]) {
    const role = req.user?.role;
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException("You do not have permission to perform this action");
    }
  }
}
