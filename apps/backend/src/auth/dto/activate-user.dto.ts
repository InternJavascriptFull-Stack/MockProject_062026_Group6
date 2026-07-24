import { IsNotEmpty, IsString, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ActivateUserDto {
    @ApiProperty({ example: "abc123token" })
    @IsString()
    @IsNotEmpty({ message: "Token is required" })
    token!: string;

    @ApiProperty({ example: "Password123!" })
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    password!: string;

    @ApiProperty({ example: "Password123!" })
    @IsString()
    @IsNotEmpty({ message: "Confirm password is required" })
    confirmPassword!: string;

    @ApiProperty({ example: "+15550001234" })
    @IsString()
    @IsNotEmpty({ message: "Phone number is required" })
    @Matches(/^\+\d{7,15}$/, {
        message: "Phone number must be in E.164 format (e.g. +15550001234)",
    })
    phoneNumber!: string;
}
