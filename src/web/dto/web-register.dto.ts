import { IsNotEmpty, MinLength, IsOptional } from 'class-validator';
export class webUpsertDto {
  @IsOptional()
  id?: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @MinLength(4)
  url: string;
}
