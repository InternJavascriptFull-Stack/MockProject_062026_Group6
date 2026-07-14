import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlaConfigurationDto {
  @ApiProperty({ example: 24 })
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'slaWindowHrs must be a positive integer' })
  slaWindowHrs!: number;
}
