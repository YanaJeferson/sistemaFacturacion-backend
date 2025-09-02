import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDto {
  @ApiProperty({
    example: 'john_doe',
  })
  name: string;

  @ApiProperty({
    example: 'password123',
  })
  password: string;

  @ApiProperty({
    example: 'john@example.com',
  })
  email: string;
}
