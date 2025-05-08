import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { abstractCrudService } from '../utils/abstractCrudService';
import { Web } from './entitie/web.entities';
import { User } from '../user/entitie/user.entities';
import { WebFilterDto } from './dto/web-filter.dto';
import { webUpsertDto } from './dto/web-register.dto';

@Injectable()
export class WebService extends abstractCrudService {
  constructor(
    @InjectRepository(Web)
    private webRepository: Repository<Web>,
  ) {
    super(webRepository);
  }

  private validateUser(user: User) {
    if (!user?.id) throw new UnauthorizedException('Invalid user');
  }

  async upsert(data: webUpsertDto, user: User) {
    this.validateUser(user);

    const { url, name, id } = data;

    // Validate URL format: must be HTTPS and contain domain
    if (!url?.includes('https://') || !url.includes('.')) {
      throw new ConflictException(
        'URL must contain "https://" and at least one dot (.)',
      );
    }

    // Prevent duplicate entries for new records
    if (!id) {
      const exists = await this.findRegister({
        name,
        url,
        user: { id: user.id },
      });
      if (exists?.data.length) {
        throw new ConflictException('Web already exists for the user');
      }
    }

    return this.upsertRegister({ ...data, user: { id: user.id } });
  }

  async findData(user: User, params: WebFilterDto) {
    this.validateUser(user);

    const result = await this.findRegister({
      ...params,
      user: { id: user.id },
    });

    return {
      message: result?.data.length
        ? 'Web sites found successfully'
        : 'No web sites found',
      ...result,
    };
  }

  async delete(id: string, user: User) {
    this.validateUser(user);

    // Ensure user owns the web entry before deletion
    const result = await this.findRegister({ id, user: { id: user.id } });
    if (!result?.data.length) {
      throw new UnauthorizedException('Web not found or unauthorized');
    }

    return this.deleteRegister(id);
  }
}
