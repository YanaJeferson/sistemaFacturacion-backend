import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'jefersoncarcasi@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'jeferson yana carcasi jhony',
  })
  name: string;

  @ApiProperty({
    description: 'The avatar URL of the user',
    example: null,
    nullable: true,
  })
  avatar: string | null;
}
