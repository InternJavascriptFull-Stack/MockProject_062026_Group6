import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class FacilityAddressDto {
    @IsString()
    @IsNotEmpty()
    streetLine1!: string;

    @IsOptional()
    @IsString()
    streetLine2?: string;

    @IsString()
    @IsNotEmpty()
    city!: string;

    @IsString()
    @IsNotEmpty()
    state!: string;

    @IsString()
    @IsNotEmpty()
    zipCode!: string;
}

export class FacilityCapabilityDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    label!: string;

    @IsBoolean()
    supported!: boolean;

    @IsOptional()
    @IsString()
    note?: string;
}

export class FacilityRoomRateDto {
    @IsString()
    @IsNotEmpty()
    roomType!: string;

    @Type(() => Number)
    @Min(0)
    dailyRate!: number;

    @IsString()
    @IsNotEmpty()
    effectiveFrom!: string;
}

export class UpdateFacilitySettingsDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    licenseNumber!: string;

    @IsString()
    @IsNotEmpty()
    targetState!: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsString()
    @IsNotEmpty()
    timezone!: string;

    @ValidateNested()
    @Type(() => FacilityAddressDto)
    address!: FacilityAddressDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityCapabilityDto)
    capabilities!: FacilityCapabilityDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityRoomRateDto)
    roomRates?: FacilityRoomRateDto[];
}

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    roomNumber!: string;

    @IsString()
    @IsNotEmpty()
    roomType!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    bedCount!: number;
}
