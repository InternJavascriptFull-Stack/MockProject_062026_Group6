import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export const GENDERS = ["male", "female", "other"] as const;
export const CARE_LEVELS = ["independent", "assisted_living", "memory_care", "skilled_nursing"] as const;
export const MOBILITY_STATUSES = ["independent", "walker", "wheelchair", "bed_bound"] as const;

export class CreateResidentDto {
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

    @ApiProperty({ example: "2026-07-10" })
    @IsISO8601({ strict: true })
    admissionDate!: string;

    @ApiProperty({ example: "A-104" })
    @IsString()
    @IsNotEmpty()
    roomNumber!: string;

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

    @ApiProperty({ example: "Paul Rigby" })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    emergencyContactName!: string;

    @ApiPropertyOptional({ example: "Son" })
    @IsOptional()
    @IsString()
    emergencyContactRelationship?: string;

    @ApiProperty({ example: "(415) 555-0199" })
    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    emergencyContactPhone!: string;

    @ApiPropertyOptional({ example: "paul.rigby@example.com" })
    @IsOptional()
    @Transform(({ value }) => (value === "" ? undefined : value))
    @IsEmail()
    emergencyContactEmail?: string;

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
