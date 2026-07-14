import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacilityRoomDto {
    @ApiProperty({ example: '1', required: false })
    @IsString()
    @IsOptional()
    roomId?: string;

    @ApiProperty({ example: '1', required: false })
    @IsString()
    @IsOptional()
    bedId?: string;

    @ApiProperty({ example: '101' })
    @IsString()
    @IsNotEmpty()
    roomNumber!: string;

    @ApiProperty({ example: 'A' })
    @IsString()
    @IsNotEmpty()
    bedNumber!: string;

    @ApiProperty({ example: 'Private' })
    @IsString()
    @IsNotEmpty()
    roomType!: string;

    @ApiProperty({ enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] })
    @IsIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
    status!: string;
}

export class FacilityRoomRateDto {
    @ApiProperty({ example: 'Private' })
    @IsString()
    @IsNotEmpty()
    roomType!: string;

    @ApiProperty({ example: 220 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    dailyRate!: number;

    @ApiProperty({ example: '2026-01-01' })
    @IsDateString()
    effectiveFrom!: string;
}

export class FacilityClinicalCapabilityDto {
    @ApiProperty({ example: 'Wound care / pressure ulcer management' })
    @IsString()
    @IsNotEmpty()
    capability!: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    supported!: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    note?: string | null;
}

export class UpdateFacilitySettingsDto {
    @ApiProperty({ example: 'NHMS Demo Skilled Nursing Facility', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'CA-SNF-004821', required: false })
    @IsString()
    @IsOptional()
    licenseNumber?: string;

    @ApiProperty({ example: 'CA', required: false })
    @IsString()
    @IsOptional()
    targetState?: string;

    @ApiProperty({ example: 'America/Los_Angeles (Pacific)', required: false })
    @IsString()
    @IsOptional()
    timezone?: string;

    @ApiProperty({ example: '+14155550142', required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ type: [FacilityRoomDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityRoomDto)
    @IsOptional()
    rooms?: FacilityRoomDto[];

    @ApiProperty({ type: [FacilityRoomRateDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityRoomRateDto)
    @IsOptional()
    roomRates?: FacilityRoomRateDto[];

    @ApiProperty({ type: [FacilityClinicalCapabilityDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FacilityClinicalCapabilityDto)
    @IsOptional()
    capabilities?: FacilityClinicalCapabilityDto[];
}
