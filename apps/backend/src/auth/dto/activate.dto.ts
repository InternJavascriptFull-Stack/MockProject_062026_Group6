import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from "class-validator";

export class ActivateDto {
    @IsEmail({}, { message: "Email must be valid" })
    @IsNotEmpty({ message: "Email is required" })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: "Activation code is required" })
    activationCode!: string;

    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one digit",
    })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: "Phone number is required" })
    @Matches(/^\+\d{7,15}$/, {
        message: "Phone number must be in E.164 format (e.g. +15550001234)",
    })
    phoneNumber!: string;
}
