import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { CareTasksService } from "./care-tasks.service.js";
import { CompleteCareTaskDto } from "./dto/complete-care-task.dto.js";

@ApiTags("care-tasks")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/care-tasks")
export class CareTasksController {
    constructor(private readonly careTasksService: CareTasksService) {}

    @Get("today")
    @ApiOperation({ summary: "Get today's assigned care tasks" })
    today(@Query("status") status?: string, @Query("assignedCnaId") assignedCnaId?: string) {
        return this.careTasksService.today(status, assignedCnaId);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a care task" })
    findOne(@Param("id") id: string) {
        return this.careTasksService.findOne(id);
    }

    @Patch(":id/complete")
    @ApiOperation({ summary: "Complete a care task" })
    complete(@Param("id") id: string, @Body() dto: CompleteCareTaskDto) {
        return this.careTasksService.complete(id, dto);
    }
}
