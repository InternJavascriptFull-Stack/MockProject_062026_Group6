import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StaffingShiftDto {
    @ApiProperty({ example: 'Day' })
    @IsString()
    @IsNotEmpty()
    shiftName!: string;

    @ApiProperty({ example: '07:00' })
    @IsString()
    @IsNotEmpty()
    startTime!: string;

    @ApiProperty({ example: '15:00' })
    @IsString()
    @IsNotEmpty()
    endTime!: string;

    @ApiProperty({ example: 1.5 })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    requiredCnaHours!: number;

    @ApiProperty({ example: 0.9 })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    requiredNurseHours!: number;
}

export class StaffingRatioDto {
    @ApiProperty({ example: 3.5 })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    minHrsPerResidentDay!: number;

    @ApiProperty({ example: 90 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    warnBelowPercentage?: number;

    @ApiProperty({ type: [StaffingShiftDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StaffingShiftDto)
    @IsOptional()
    shifts?: StaffingShiftDto[];

    @ApiProperty({ example: 1, required: false })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    facilityId?: number;
}
