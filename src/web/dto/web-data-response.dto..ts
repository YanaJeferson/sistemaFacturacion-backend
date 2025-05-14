import { ApiProperty } from '@nestjs/swagger';

export class WebDataResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
