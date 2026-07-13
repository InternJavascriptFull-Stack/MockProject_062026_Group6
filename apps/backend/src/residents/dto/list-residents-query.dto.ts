import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { CARE_LEVELS } from "./create-resident.dto.js";
import { RESIDENT_STATUSES } from "./update-resident-status.dto.js";

export class ListResidentsQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ example: "Eleanor" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: RESIDENT_STATUSES, example: "admitted" })
    @IsOptional()
    @IsEnum(RESIDENT_STATUSES)
    status?: string;

    @ApiPropertyOptional({ enum: CARE_LEVELS, example: "assisted_living" })
    @IsOptional()
    @IsEnum(CARE_LEVELS)
    careLevel?: string;
}
