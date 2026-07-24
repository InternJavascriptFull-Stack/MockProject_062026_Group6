import { Controller, Get, Post, Param, UseGuards, Req, ForbiddenException, BadRequestException } from "@nestjs/common";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { DemoDataService } from "./demo-data.service.js";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("demo-data")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/demo-data")
export class DemoDataController {
    constructor(private readonly demoDataService: DemoDataService) {}

    @Get("status")
    @ApiOperation({ summary: "Get status of demo data" })
    getStatus(@Req() req: any) {
        this.checkAdmin(req);
        return this.demoDataService.getStatus();
    }

    @Post("seed")
    @ApiOperation({ summary: "Seed demo data" })
    seed(@Req() req: any) {
        this.checkAdmin(req);
        const userId = req.user.sub;
        return this.demoDataService.seedAll(userId);
    }

    @Post("reset")
    @ApiOperation({ summary: "Clear all demo data" })
    reset(@Req() req: any) {
        this.checkAdmin(req);
        return this.demoDataService.clearAll();
    }

    @Post("load/:dataset")
    @ApiOperation({ summary: "Load specific dataset" })
    loadDataset(@Param("dataset") dataset: string, @Req() req: any) {
        this.checkAdmin(req);
        this.validateDataset(dataset);
        const userId = req.user.sub;
        return this.demoDataService.loadDataset(dataset, userId);
    }

    @Post("clear/:dataset")
    @ApiOperation({ summary: "Clear specific dataset" })
    clearDataset(@Param("dataset") dataset: string, @Req() req: any) {
        this.checkAdmin(req);
        this.validateDataset(dataset);
        return this.demoDataService.clearDataset(dataset);
    }

    private validateDataset(dataset: string) {
        const valid = ["residents", "care-plans", "incidents", "medications"];
        if (!valid.includes(dataset)) {
            throw new BadRequestException(`Dataset '${dataset}' is invalid. Allowed: ${valid.join(", ")}`);
        }
    }

    private checkAdmin(req: any) {
        const role = req.user?.role;
        const adminRoles = ["System Admin", "Administrator"];
        if (!adminRoles.includes(role)) {
            throw new ForbiddenException("Only administrators can perform this action");
        }
    }
}
