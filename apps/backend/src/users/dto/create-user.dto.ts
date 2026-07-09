import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  roleId!: number;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'LOCKED'], example: 'ACTIVE' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['ACTIVE', 'INACTIVE', 'LOCKED'])
  status!: string;
}
