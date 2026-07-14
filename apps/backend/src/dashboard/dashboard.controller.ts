import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { Request } from "express";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("dashboard")
@ApiBearerAuth()
@Controller("api/dashboard")
@UseGuards(AccessTokenGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get("nurse")
    @ApiOperation({ summary: "Get Nurse Dashboard" })
    async getNurseDashboard(@Req() req: Request) {
        const user = (req as any).user;
        return this.dashboardService.getNurseDashboard(user.sub);
    }

    @Get("don")
    @ApiOperation({ summary: "Get DON Dashboard" })
    async getDonDashboard(@Req() req: Request) {
        const user = (req as any).user;
        return this.dashboardService.getDonDashboard(user.sub);
    }

    @Get("cna")
    @ApiOperation({ summary: "Get CNA Dashboard" })
    async getCnaDashboard(@Req() req: Request) {
        const user = (req as any).user;
        return this.dashboardService.getCnaDashboard(user.sub);
    }

    @Get("summary")
    @ApiOperation({ summary: "Get Summary Dashboard" })
    async getSummaryDashboard() {
        return this.dashboardService.getSummaryDashboard();
    }
}
