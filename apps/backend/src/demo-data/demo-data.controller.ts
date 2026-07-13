import { Controller, Get, Post, Param, UseGuards, Req, ForbiddenException } from "@nestjs/common";
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
  getStatus() {
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
    const userId = req.user.sub;
    return this.demoDataService.loadDataset(dataset, userId);
  }

  @Post("clear/:dataset")
  @ApiOperation({ summary: "Clear specific dataset" })
  clearDataset(@Param("dataset") dataset: string, @Req() req: any) {
    this.checkAdmin(req);
    return this.demoDataService.clearDataset(dataset);
  }

  private checkAdmin(req: any) {
    const role = req.user?.role;
    if (role !== "System Admin") {
      throw new ForbiddenException("Only administrators can perform this action");
    }
  }
}
