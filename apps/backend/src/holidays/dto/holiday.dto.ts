import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateHolidayDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    dateType!: string; // 'FIXED' | 'FLOATING'

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    month?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(31)
    day?: number;

    @IsOptional()
    @IsString()
    floatingRule?: string;

    @IsOptional()
    @IsBoolean()
    repeatsAnnually?: boolean;
}

export class UpdateHolidayDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    dateType?: string;

    @IsOptional()
    @IsInt()
    month?: number;

    @IsOptional()
    @IsInt()
    day?: number;

    @IsOptional()
    @IsString()
    floatingRule?: string;

    @IsOptional()
    @IsBoolean()
    repeatsAnnually?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
