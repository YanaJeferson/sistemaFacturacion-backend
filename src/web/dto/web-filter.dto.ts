import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebFilterDto {
  @ApiProperty({ required: false, description: 'Website name' })
  @IsOptional()
  name: string;

  @ApiProperty({ required: false, description: 'Website URL' })
  @IsOptional()
  url: string;

  @ApiProperty({ required: false, description: 'Page number', type: Number })
  @IsOptional()
  page: number;

  @ApiProperty({
    required: false,
    description: 'Records per page limit',
    type: Number,
  })
  @IsOptional()
  limit: number;
}
