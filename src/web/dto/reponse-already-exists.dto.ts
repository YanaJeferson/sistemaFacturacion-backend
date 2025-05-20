import { ApiProperty } from '@nestjs/swagger';

export class ResponseAlreadyExistsDto {
  @ApiProperty({
    description: 'Descriptive error message',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code',
  })
  statusCode: number;
}
