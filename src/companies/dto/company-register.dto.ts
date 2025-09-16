import { ApiProperty } from '@nestjs/swagger';

export class CompanyRegisterDto {
  @ApiProperty({
    example: 'company name',
  })
  company_name: string;

  @ApiProperty({
    example: 'av. paulista, 1000',
  })
  address: string;

  @ApiProperty({
    example: '2000000000001',
  })
  ruc: number;
}
