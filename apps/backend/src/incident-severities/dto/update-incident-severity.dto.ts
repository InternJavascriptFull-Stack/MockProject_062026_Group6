import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateIncidentSeverityDto {
    @ApiProperty({ example: "Major", required: false })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    levelName?: string;

    @ApiProperty({ example: "Significant injury requiring clinical treatment.", required: false })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    chartLockTrigger?: boolean;
}
