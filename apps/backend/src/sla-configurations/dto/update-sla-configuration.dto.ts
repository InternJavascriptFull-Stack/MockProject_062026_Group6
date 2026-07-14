import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateSlaConfigurationDto {
    @ApiProperty({ example: 24 })
    @IsInt()
    @Min(0, { message: "slaWindowHrs cannot be negative" })
    slaWindowHrs!: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    externalReportRequired?: boolean;

    @ApiProperty({ example: "CA Department of Public Health", required: false })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    regulatoryBody?: string;
}
