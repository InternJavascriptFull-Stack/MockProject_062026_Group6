import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export const RESIDENT_STATUSES = ["pending", "under_evaluation", "admitted", "discharged"] as const;

export class UpdateResidentStatusDto {
    @ApiProperty({ enum: RESIDENT_STATUSES, example: "admitted" })
    @IsEnum(RESIDENT_STATUSES)
    status!: string;
}
