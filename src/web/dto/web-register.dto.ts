import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsOptional } from 'class-validator';
export class webUpsertDto {
  @ApiProperty({
    required: false,
    description: 'Unique identifier of the user.',
  })
  @IsOptional()
  id?: string;

  @ApiProperty({
    required: true,
    description: 'Descriptive name of the website to be registered or updated',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    description: 'Complete URL of the website',
  })
  @IsNotEmpty()
  @MinLength(4)
  url: string;
}
