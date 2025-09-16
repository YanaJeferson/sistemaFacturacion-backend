import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { AuthGuard } from '@nestjs/passport';
import { CompanyFindDto } from './dto/company-find.dto';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  find(@Query() params: CompanyFindDto, @Req() req: any) {
    return this.companiesService.findUserCompaniesById(params, req.user);
  }

  @Post()
  upsert(@Body() body: CompanyRegisterDto, @Req() req: any) {
    return this.companiesService.upsert(body, req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.companiesService.deleteUserCompanyById(id);
  }
}
