import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const user = this.userRepository.create({
      ...registerUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    return user;
  }

  async githubLogin(githubUser: any) {
    
    let user = await this.userRepository.findOne({
      where: { email: githubUser.email }
    });

    if (!user) {
      user = this.userRepository.create({
        email: githubUser.email,
        name: githubUser.name,
        password: 'github-auth',
        provider: "github",
        providerId: githubUser.providerId
      });
      await this.userRepository.save(user);
    }
    const { password, ...result } = user;
    return result;
  }
}
