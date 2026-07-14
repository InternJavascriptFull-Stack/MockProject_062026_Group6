import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { AddIncidentNoteDto, ChartLockDto, ChartUnlockDto, CreateIncidentDto, ResolveIncidentDto, SubmitExternalReportDto, UpdateInvestigationDto } from "./dto/incident.dto.js";
import { IncidentsService } from "./incidents.service.js";

const CLINICAL_ROLES = ["System Admin", "DON (Director of Nursing)", "Nurse (RN/LPN)", "CNA (Certified Nursing Assistant)"];
const DON_ROLES = ["System Admin", "DON (Director of Nursing)"];

@ApiTags("incidents")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/incidents")
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) {}

    @Get()
    @ApiOperation({ summary: "Get incident work queue" })
    findAll() {
        return this.incidentsService.findAll();
    }

    @Get(":id")
    @ApiOperation({ summary: "Get incident detail, timeline, and investigation data" })
    findOne(@Param("id") id: string) {
        return this.incidentsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: "Report an incident" })
    create(@Body() dto: CreateIncidentDto, @Req() request: any) {
        this.checkPermission(request, CLINICAL_ROLES);
        return this.incidentsService.create(dto, request.user.sub);
    }

    @Patch(":id/investigation")
    @ApiOperation({ summary: "Update incident investigation and root-cause analysis" })
    updateInvestigation(@Param("id") id: string, @Body() dto: UpdateInvestigationDto, @Req() request: any) {
        this.checkPermission(request, ["System Admin", "DON (Director of Nursing)", "Nurse (RN/LPN)"]);
        return this.incidentsService.updateInvestigation(id, dto, request.user.sub);
    }

    @Post(":id/progress-notes")
    @ApiOperation({ summary: "Add a progress note to an incident timeline" })
    addProgressNote(@Param("id") id: string, @Body() dto: AddIncidentNoteDto, @Req() request: any) {
        this.checkPermission(request, CLINICAL_ROLES);
        return this.incidentsService.addProgressNote(id, dto, request.user.sub);
    }

    @Post(":id/request-don-review")
    @ApiOperation({ summary: "Send the incident to the DON review queue" })
    requestDonReview(@Param("id") id: string, @Req() request: any) {
        this.checkPermission(request, ["System Admin", "Nurse (RN/LPN)"]);
        return this.incidentsService.requestDonReview(id, request.user.sub);
    }

    @Post(":id/submit-external-report")
    @ApiOperation({ summary: "Submit and record an external regulatory report" })
    submitExternalReport(@Param("id") id: string, @Body() dto: SubmitExternalReportDto, @Req() request: any) {
        this.checkPermission(request, DON_ROLES);
        return this.incidentsService.submitExternalReport(id, dto, request.user.sub);
    }

    @Post(":id/resolve")
    @ApiOperation({ summary: "Resolve an incident after required review steps" })
    resolve(@Param("id") id: string, @Body() dto: ResolveIncidentDto, @Req() request: any) {
        this.checkPermission(request, DON_ROLES);
        return this.incidentsService.resolve(id, dto, request.user.sub);
    }

    @Post(":id/lock-chart")
    @ApiOperation({ summary: "Lock a resident chart for an incident investigation" })
    lockChart(@Param("id") id: string, @Body() dto: ChartLockDto, @Req() request: any) {
        this.checkPermission(request, ["System Admin", "DON (Director of Nursing)", "Nurse (RN/LPN)"]);
        return this.incidentsService.lockChart(id, dto.reason?.trim() || "Incident under investigation", request.user.sub);
    }

    @Post(":id/unlock-chart")
    @ApiOperation({ summary: "Unlock a resident chart after DON review" })
    unlockChart(@Param("id") id: string, @Body() dto: ChartUnlockDto, @Req() request: any) {
        this.checkPermission(request, DON_ROLES);
        return this.incidentsService.unlockChart(id, dto.reason, dto.passwordConfirm, request.user.sub);
    }

    private checkPermission(request: any, allowedRoles: string[]): void {
        const role = request.user?.role;
        if (!allowedRoles.includes(role)) {
            throw new ForbiddenException("You do not have permission to perform this action");
        }
    }
}
