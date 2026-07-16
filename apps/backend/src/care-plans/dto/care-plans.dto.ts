import { IsString, IsUUID, IsOptional, IsArray, ValidateNested, IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum CarePlanStatus {
        DRAFT = 'DRAFT',
        PENDING_REVIEW = 'PENDING_REVIEW',
        APPROVED = 'APPROVED',
        REJECTED = 'REJECTED',
        SIGNED = 'SIGNED'
}

export class CareGoalDto {
        @IsString()
        @IsNotEmpty()
        description!: string;

        @IsString()
        @IsOptional()
        status?: string;
}

export class CareInterventionDto {
        @IsString()
        @IsNotEmpty()
        description!: string;

        @IsString()
        @IsNotEmpty()
        assignedRole!: string;
}

export class CreateCarePlanDto {
        @IsUUID()
        residentId!: string;

        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => CareGoalDto)
        goals!: CareGoalDto[];

        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => CareInterventionDto)
        interventions!: CareInterventionDto[];

        @IsEnum(CarePlanStatus)
        @IsOptional()
        status?: CarePlanStatus;
}

export class UpdateCarePlanDto {
        @IsEnum(CarePlanStatus)
        @IsOptional()
        status?: CarePlanStatus;

        @IsBoolean()
        @IsOptional()
        significantChangeFlag?: boolean;

        @IsUUID()
        @IsOptional()
        residentId?: string;

        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => CareGoalDto)
        @IsOptional()
        goals?: CareGoalDto[];

        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => CareInterventionDto)
        @IsOptional()
        interventions?: CareInterventionDto[];
}

export class DonReviewDto {
        @IsEnum(CarePlanStatus)
        status!: CarePlanStatus;

        @IsString()
        @IsOptional()
        notes?: string;
}

export class ESignDto {
        @IsString()
        @IsNotEmpty()
        signatureToken!: string;
}

export class IdtAckDto {
        @IsString()
        @IsOptional()
        notes?: string;
}
