import { Type } from "class-transformer";
import { IsISO8601, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateBillingRateDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    dailyRate!: number;

    @IsISO8601({ strict: true })
    effectiveFrom!: string;

    @IsOptional()
    @IsString()
    facilityId?: string;
}
