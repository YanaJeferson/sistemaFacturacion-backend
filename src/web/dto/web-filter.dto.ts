import { IsOptional } from 'class-validator';

export class WebFilterDto {
  @IsOptional()
  name: string;

  @IsOptional()
  url: string;
}
