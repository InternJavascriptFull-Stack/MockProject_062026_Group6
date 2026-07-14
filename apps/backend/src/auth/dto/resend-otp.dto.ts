import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendOtpDto {
    @IsEmail({}, { message: "Email must be valid" })
    @IsNotEmpty({ message: "Email is required" })
    email!: string;
}
