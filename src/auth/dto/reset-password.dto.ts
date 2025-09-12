import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsString, MinLength } from 'class-validator';

export class RequestResetDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: '123456',
    description: 'The reset token',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    example: 'password123',
    description: 'The new password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
