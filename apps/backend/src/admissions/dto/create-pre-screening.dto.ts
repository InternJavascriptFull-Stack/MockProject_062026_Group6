import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEmail, IsEnum, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength, ValidateNested } from "class-validator";
import { CARE_LEVELS, GENDERS, MOBILITY_STATUSES } from "../../residents/dto/create-resident.dto.js";

const COGNITIVE_STATUSES = ["alert_oriented", "mild_impairment", "moderate_impairment", "severe_impairment"] as const;

const FALL_RISKS = ["low", "medium", "high"] as const;

class PersonalInfoDto {
    @ApiProperty({ example: "Eleanor Rigby" })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    fullName!: string;

    @ApiProperty({ example: "1942-08-18" })
    @IsISO8601({ strict: true })
    dateOfBirth!: string;

    @ApiProperty({ enum: GENDERS, example: "female" })
    @IsEnum(GENDERS)
    gender!: string;

    @ApiPropertyOptional({ example: "(415) 555-0128" })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: "123 Mission St, San Francisco, CA" })
    @IsOptional()
    @IsString()
    address?: string;
}

class AdmissionInfoDto {
    @ApiProperty({ example: "2026-07-10" })
    @IsISO8601({ strict: true })
    admissionDate!: string;

    @ApiPropertyOptional({ example: "A-104" })
    @IsOptional()
    @IsString()
    roomNumber?: string;

    @ApiProperty({ enum: CARE_LEVELS, example: "assisted_living" })
    @IsEnum(CARE_LEVELS)
    careLevel!: string;

    @ApiPropertyOptional({ example: "Sarah Johnson, RN" })
    @IsOptional()
    @IsString()
    assignedNurse?: string;

    @ApiPropertyOptional({ example: "Dr. Michael Brown" })
    @IsOptional()
    @IsString()
    assignedDoctor?: string;
}

class EmergencyContactDto {
    @ApiProperty({ example: "Paul Rigby" })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name!: string;

    @ApiPropertyOptional({ example: "Son" })
    @IsOptional()
    @IsString()
    relationship?: string;

    @ApiProperty({ example: "(415) 555-0199" })
    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    phone!: string;

    @ApiPropertyOptional({ example: "paul.rigby@example.com" })
    @IsOptional()
    @Transform(({ value }) => (value === "" ? undefined : value))
    @IsEmail()
    email?: string;
}

class MedicalSummaryDto {
    @ApiPropertyOptional({ example: "Hypertension, Type 2 Diabetes" })
    @IsOptional()
    @IsString()
    primaryDiagnosis?: string;

    @ApiPropertyOptional({ example: "Penicillin" })
    @IsOptional()
    @IsString()
    allergies?: string;

    @ApiPropertyOptional({ example: "Metformin 500mg daily" })
    @IsOptional()
    @IsString()
    currentMedications?: string;

    @ApiPropertyOptional({ enum: MOBILITY_STATUSES, example: "walker" })
    @IsOptional()
    @Transform(({ value }) => (value === "" ? undefined : value))
    @IsEnum(MOBILITY_STATUSES)
    mobilityStatus?: string;
}

class InitialEvaluationDto {
    @ApiPropertyOptional({ enum: COGNITIVE_STATUSES, example: "mild_impairment" })
    @IsOptional()
    @Transform(({ value }) => (value === "" ? undefined : value))
    @IsEnum(COGNITIVE_STATUSES)
    cognitiveStatus?: string;

    @ApiPropertyOptional({ enum: FALL_RISKS, example: "medium" })
    @IsOptional()
    @Transform(({ value }) => (value === "" ? undefined : value))
    @IsEnum(FALL_RISKS)
    fallRisk?: string;

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    painLevel?: number;

    @ApiPropertyOptional({ example: "Soft diet recommended." })
    @IsOptional()
    @IsString()
    nutritionNotes?: string;

    @ApiPropertyOptional({ example: "Requires review by admissions nurse." })
    @IsOptional()
    @IsString()
    clinicalNotes?: string;
}

export class CreatePreScreeningDto {
    @ApiProperty({ type: PersonalInfoDto })
    @ValidateNested()
    @Type(() => PersonalInfoDto)
    personalInfo!: PersonalInfoDto;

    @ApiProperty({ type: AdmissionInfoDto })
    @ValidateNested()
    @Type(() => AdmissionInfoDto)
    admissionInfo!: AdmissionInfoDto;

    @ApiProperty({ type: EmergencyContactDto })
    @ValidateNested()
    @Type(() => EmergencyContactDto)
    emergencyContact!: EmergencyContactDto;

    @ApiProperty({ type: MedicalSummaryDto })
    @ValidateNested()
    @Type(() => MedicalSummaryDto)
    medicalSummary!: MedicalSummaryDto;

    @ApiProperty({ type: InitialEvaluationDto })
    @ValidateNested()
    @Type(() => InitialEvaluationDto)
    initialEvaluation!: InitialEvaluationDto;
}
