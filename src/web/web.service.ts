import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity, Repository } from 'typeorm';
import { Web } from './entitie/web.entities';
import { User } from '../user/entitie/user.entities';

@Injectable()
export class WebService {
  constructor(
    @InjectRepository(Web)
    private webRepository: Repository<Web>,
  ) {}

  async create(createWebDto: any, user: User) {
    const web = this.webRepository.create({
      ...createWebDto,
      user: user
    });
    return await this.webRepository.save(web);
  }

  async findAllByUser(user: User) {
    return await this.webRepository.find({
      where: { user: { id: user.id } },
    });
  }
  

  async update(id: string, updateWebDto: any, user: User) {
    const web = await this.webRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!web) {
      throw new UnauthorizedException('Web not found or unauthorized');
    }

    Object.assign(web, updateWebDto);
    return await this.webRepository.save(web);
  }

  async delete(id: string, user: User) {
    const web = await this.webRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!web) {
      throw new UnauthorizedException('Web not found or unauthorized');
    }

    await this.webRepository.remove(web);
    return { message: 'Web eliminada exitosamente' };
  }
}
