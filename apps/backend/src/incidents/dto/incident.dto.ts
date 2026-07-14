import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateIncidentDto {
    @IsUUID()
    residentId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    incidentType!: string;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    severityId!: number;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    immediateAction?: string;

    @IsOptional()
    @IsString()
    occurredAt?: string;

    @IsOptional()
    @IsBoolean()
    notifyDon?: boolean;
}

export class UpdateInvestigationDto {
    @IsOptional()
    @IsString()
    rootCause?: string;

    @IsOptional()
    @IsString()
    correctiveAction?: string;

    @IsOptional()
    @IsString()
    preventiveAction?: string;

    @IsOptional()
    @IsArray()
    witnesses?: string[];

    @IsOptional()
    @IsIn(["OPEN", "UNDER_INVESTIGATION", "PENDING_REVIEW", "RESOLVED", "CLOSED"])
    status?: string;
}

export class AddIncidentNoteDto {
    @IsString()
    @IsNotEmpty()
    note!: string;

    @IsOptional()
    @IsString()
    noteType?: string;
}

export class SubmitExternalReportDto {
    @IsString()
    @IsNotEmpty()
    agency!: string;

    @IsOptional()
    @IsString()
    referenceNumber?: string;

    @IsOptional()
    @IsString()
    submittedAt?: string;

    @IsString()
    @IsNotEmpty()
    passwordConfirm!: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class ResolveIncidentDto {
    @IsString()
    @IsNotEmpty()
    resolution!: string;

    @IsOptional()
    @IsString()
    followUpPlan?: string;
}

export class ChartLockDto {
    @IsOptional()
    @IsString()
    reason?: string;
}

export class ChartUnlockDto {
    @IsString()
    @IsNotEmpty()
    reason!: string;

    @IsString()
    @IsNotEmpty()
    passwordConfirm!: string;
}
