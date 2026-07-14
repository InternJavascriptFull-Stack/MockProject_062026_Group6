import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { AssessmentsService } from "./assessments.service.js";
import { ConfirmLocDto, CreateAssessmentDto, CreateReassessmentDto } from "./dto/assessment.dto.js";

@ApiTags("assessments")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/assessments")
export class AssessmentsController {
    constructor(private readonly assessmentsService: AssessmentsService) {}

    @Post()
    @ApiOperation({ summary: "Create an initial clinical assessment" })
    create(@Body() dto: CreateAssessmentDto, @Req() request: any) {
        return this.assessmentsService.create(dto, request.user.sub);
    }

    @Get("resident/:residentId")
    @ApiOperation({ summary: "Get assessment history for a resident" })
    history(@Param("residentId") residentId: string) {
        return this.assessmentsService.history(residentId);
    }

    @Get("resident/:residentId/latest-classification")
    @ApiOperation({ summary: "Get the latest suggested or confirmed LOC" })
    latestClassification(@Param("residentId") residentId: string) {
        return this.assessmentsService.latestClassification(residentId);
    }

    @Post(":id/confirm-loc")
    @ApiOperation({ summary: "Confirm or override the suggested LOC" })
    confirmLoc(@Param("id") id: string, @Body() dto: ConfirmLocDto, @Req() request: any) {
        return this.assessmentsService.confirmLoc(id, dto, request.user.sub);
    }
}

@ApiTags("reassessments")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/reassessments")
export class ReassessmentsController {
    constructor(private readonly assessmentsService: AssessmentsService) {}

    @Post()
    @ApiOperation({ summary: "Create a reassessment and a new care-plan version" })
    create(@Body() dto: CreateReassessmentDto, @Req() request: any) {
        return this.assessmentsService.createReassessment(dto, request.user.sub);
    }
}

@ApiTags("resident-loc-history")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/residents")
export class ResidentLocHistoryController {
    constructor(private readonly assessmentsService: AssessmentsService) {}

    @Get(":residentId/loc-history")
    @ApiOperation({ summary: "Get LOC history for a resident" })
    history(@Param("residentId") residentId: string) {
        return this.assessmentsService.locHistory(residentId);
    }
}
