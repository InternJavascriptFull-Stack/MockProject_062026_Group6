import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCareLevelDto {
    @ApiProperty({ example: 205 })
    @Type(() => Number)
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    dailyRate!: number;

    @ApiProperty({ example: '2026-01-01', required: false })
    @IsDateString()
    @IsOptional()
    effectiveFrom?: string;
}
