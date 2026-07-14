import { Allow, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCarePlanDto {
    @IsString()
    @IsNotEmpty()
    residentId!: string;

    @Allow()
    goals!: { description: string; status?: string }[];

    @Allow()
    interventions!: { description: string; assignedRole: string }[];

    @IsString()
    @IsOptional()
    status?: string;
}

export class UpdateCarePlanDto {
    @IsString()
    @IsOptional()
    status?: string;

    @IsBoolean()
    @IsOptional()
    significantChangeFlag?: boolean;
}

export class DonReviewDto {
    @IsIn(["APPROVED", "REJECTED"])
    status!: "APPROVED" | "REJECTED";

    @IsString()
    @IsOptional()
    notes?: string;
}

export class ESignDto {
    @IsString()
    @MinLength(1)
    password!: string;
}

export class IdtAckDto {
    @IsString()
    @IsOptional()
    notes?: string;
}
