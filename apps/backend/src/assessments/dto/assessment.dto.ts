import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength, ValidateIf, ValidateNested } from "class-validator";

export class AssessmentMetricDto {
    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsString()
    @IsNotEmpty()
    metricName!: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    score!: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateAssessmentDto {
    @IsString()
    @IsNotEmpty()
    residentId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AssessmentMetricDto)
    metrics!: AssessmentMetricDto[];

    @IsOptional()
    @IsString()
    clinicalNotes?: string;
}

export class ConfirmLocDto {
    @IsString()
    @IsNotEmpty()
    careLevelId!: string;

    @IsOptional()
    @IsBoolean()
    isOverride?: boolean;

    @ValidateIf((dto: ConfirmLocDto) => dto.isOverride === true)
    @IsString()
    @MinLength(20)
    overrideReason?: string;
}

export class CreateReassessmentDto extends CreateAssessmentDto {
    @IsString()
    @IsNotEmpty()
    carePlanId!: string;

    @IsString()
    @IsNotEmpty()
    reason!: string;

    @IsOptional()
    @IsArray()
    goals?: { description: string; status?: string }[];

    @IsOptional()
    @IsArray()
    interventions?: { description: string; assignedRole: string }[];
}
