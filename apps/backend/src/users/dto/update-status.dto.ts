import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateStatusDto {
    @ApiProperty({ enum: ["ACTIVE", "INACTIVE", "LOCKED"], example: "INACTIVE" })
    @IsString()
    @IsNotEmpty()
    @IsEnum(["ACTIVE", "INACTIVE", "LOCKED"])
    status!: string;
}
