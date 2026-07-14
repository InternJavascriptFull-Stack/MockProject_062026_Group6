import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIncidentSeverityDto {
  @ApiProperty({ example: 'Major', required: false })
  @IsString()
  @IsOptional()
  levelName?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  chartLockTrigger?: boolean;
}
