import { IsArray, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateRolePermissionsDto {
    @ApiProperty({ type: [String], example: ["USERS_VIEW", "USERS_MANAGE"] })
    @IsArray()
    @IsString({ each: true })
    permissions!: string[];
}
