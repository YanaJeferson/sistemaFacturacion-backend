import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entitie/user.entities';
import { UserRegisterDto } from 'src/user/dto/user-register.dto';
import { LoginTokenGenerator } from 'src/auth/token/token-generator';
import { TokenSave } from 'src/auth/token/token-save';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private loginTokenGenerator: LoginTokenGenerator,
    private readonly tokenSave: TokenSave,
  ) {}

  async register(userRegisterDto: UserRegisterDto, req: Request) {
    const existingUser = await this.userRepository.findOne({
      where: { email: userRegisterDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userRegisterDto.password, 10);

    const newUser = this.userRepository.create({
      ...userRegisterDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    const { accessToken, refreshToken } =
      await this.loginTokenGenerator.generateToken(
        savedUser.id,
        savedUser.email,
      );

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Failed to generate tokens');
    }

    await Promise.all([
      this.tokenSave.saveTokenInDB(savedUser, accessToken, refreshToken, req),
      this.tokenSave.saveTokenInCookies(accessToken, refreshToken, req),
    ]);

    return {
      avatar: savedUser.avatar,
      name: savedUser.name,
      email: savedUser.email,
      // id: savedUser.id,
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
