import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyFindDto {
  @ApiProperty({ required: false, description: 'company name' })
  @IsOptional()
  company_name: string;

  @ApiProperty({ required: false, description: 'company ruc' })
  @IsOptional()
  ruc: string;
}
