import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  totalPages: number;
}
