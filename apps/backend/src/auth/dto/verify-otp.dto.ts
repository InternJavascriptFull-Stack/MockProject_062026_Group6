import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class VerifyOtpDto {
  @IsEmail({}, { message: "Email must be valid" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "OTP is required" })
  @Length(6, 6, { message: "OTP must be exactly 6 digits" })
  @Matches(/^\d{6}$/, { message: "OTP must contain only digits" })
  otp!: string;
}
