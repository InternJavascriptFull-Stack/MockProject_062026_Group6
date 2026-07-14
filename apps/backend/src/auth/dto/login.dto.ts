import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LoginDto {
    /** Email address or phone number (E.164). */
    @IsString()
    @IsNotEmpty({ message: "Email or phone number is required" })
    @MaxLength(255)
    identifier!: string;

    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    password!: string;
}
