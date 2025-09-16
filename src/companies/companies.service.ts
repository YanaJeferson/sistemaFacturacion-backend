import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Companies } from './entities/companies.entities';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { abstractCrudService } from 'src/utils/abstractCrudService';
import { CompanyFindDto } from './dto/company-find.dto';

@Injectable()
export class CompaniesService extends abstractCrudService {
  constructor(
    @InjectRepository(Companies)
    private readonly companiesRepository: Repository<Companies>,
  ) {
    super(companiesRepository);
  }

  async upsert(companyRegisterDto: CompanyRegisterDto, req) {
    const exists = await this.findRegister({
      ruc: companyRegisterDto.ruc,
    });

    if (exists.data.length > 0) {
      return this.upsertRegister({
        ...companyRegisterDto,
        user_id: req.id,
        id: exists.data[0].id,
      });
    }

    return this.upsertRegister({
      ...companyRegisterDto,
      user_id: req.id,
      status: 'activo',
    });
  }

  async findUserCompaniesById(params: CompanyFindDto, req) {
    return this.findRegister({
      ...params,
      user_id: { id: req.id },
    });
  }

  async deleteUserCompanyById(id: number) {
    return this.deleteRegister(String(id));
  }
}
