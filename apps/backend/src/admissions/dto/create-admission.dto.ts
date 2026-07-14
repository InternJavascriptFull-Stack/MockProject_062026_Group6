import { Type } from "class-transformer";
import { IsArray, IsISO8601, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAdmissionDto {
    @IsString()
    @IsNotEmpty()
    residentId!: string;

    @IsString()
    @IsNotEmpty()
    facilityId!: string;

    @IsOptional()
    @IsString()
    bedId?: string;

    @IsISO8601({ strict: true })
    admissionDate!: string;

    @IsString()
    @IsNotEmpty()
    payerSource!: string;

    @IsOptional()
    @IsString()
    policyNumber?: string;

    @IsOptional()
    @IsString()
    primaryPhysician?: string;

    @IsOptional()
    @IsString()
    nurseInCharge?: string;

    @IsArray()
    @Type(() => String)
    consents!: string[];
}
