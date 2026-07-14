import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateVitalSignDto {
    @IsString()
    residentId!: string;

    @IsOptional()
    @IsString()
    taskId?: string;

    @Type(() => Number)
    @IsInt()
    @Min(50)
    @Max(260)
    bloodPressureSystolic!: number;

    @Type(() => Number)
    @IsInt()
    @Min(30)
    @Max(180)
    bloodPressureDiastolic!: number;

    @Type(() => Number)
    @IsInt()
    @Min(20)
    @Max(250)
    heartRateBpm!: number;

    @Type(() => Number)
    @IsInt()
    @Min(5)
    @Max(80)
    respiratoryRate!: number;

    @Type(() => Number)
    @IsNumber()
    @Min(90)
    @Max(110)
    temperatureFahrenheit!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    spo2Percentage!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    painScale!: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
