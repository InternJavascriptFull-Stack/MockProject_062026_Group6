import { Controller, Get, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { Request } from "express";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ROLE_NAMES, DON_ROLES } from "./dashboard.constants.js";

@ApiTags("dashboard")
@ApiBearerAuth()
@Controller("api/dashboard")
@UseGuards(AccessTokenGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    private checkPermission(request: any, allowedRoles: string[]): void {
        const role = request.user?.role;
        if (!allowedRoles.includes(role)) {
            throw new ForbiddenException("You do not have permission to perform this action");
        }
    }

    @Get("nurse")
    @ApiOperation({ summary: "Get Nurse Dashboard" })
    async getNurseDashboard(@Req() req: Request) {
        this.checkPermission(req, [ROLE_NAMES.NURSE, ROLE_NAMES.SYSTEM_ADMIN, ROLE_NAMES.DON]);
        const user = (req as any).user;
        return this.dashboardService.getNurseDashboard(user.sub);
    }

    @Get("don")
    @ApiOperation({ summary: "Get DON Dashboard" })
    async getDonDashboard(@Req() req: Request) {
        this.checkPermission(req, DON_ROLES);
        return this.dashboardService.getDonDashboard();
    }

    @Get("cna")
    @ApiOperation({ summary: "Get CNA Dashboard" })
    async getCnaDashboard(@Req() req: Request) {
        this.checkPermission(req, [ROLE_NAMES.CNA, ROLE_NAMES.SYSTEM_ADMIN, ROLE_NAMES.DON, ROLE_NAMES.NURSE]);
        const user = (req as any).user;
        return this.dashboardService.getCnaDashboard(user.sub);
    }

    @Get("summary")
    @ApiOperation({ summary: "Get Summary Dashboard" })
    async getSummaryDashboard(@Req() req: Request) {
        this.checkPermission(req, DON_ROLES);
        return this.dashboardService.getSummaryDashboard();
    }
}
