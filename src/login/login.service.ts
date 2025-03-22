import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../register/entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import * as bcrypt from 'bcrypt';
import { TokenSave } from '../lib/token-save';
import { LoginTokenGenerator } from 'src/lib/token-generator';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private loginTokenGenerator: LoginTokenGenerator,
    private tokenSave: TokenSave,
  ) {}

  async loginAttackTracer(userLoginDto, req) {
    const user = await this.userRepository.findOne({
      where: { email: userLoginDto.email },
      select: ['id', 'email', 'name', 'avatar', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } =
      await this.loginTokenGenerator.generateToken(user.id, user.email);

    return this.tokenSave.saveToken(user, accessToken, refreshToken, req);
  }

  async logoutSession(userId: number, sessionId: number) {
    await this.sessionRepository.update(
      { id: sessionId, user: { id: userId } },
      { isActive: false },
    );
  }

  async logoutAllSessions(userId: number) {
    await this.sessionRepository.update(
      { user: { id: userId }, isActive: true },
      { isActive: false },
    );
  }

  async getUserSessions(userId: number) {
    return this.sessionRepository.find({
      where: { user: { id: userId }, isActive: true },
      select: ['id', 'deviceInfo', 'ipAddress', 'createdAt'],
    });
  }

  async loginGitHub(githubUser, req) {
      try {
          const user = await this.userRepository.findOne({
              where: [
                  { providerId: githubUser.providerId },
                  { email: githubUser.email }
              ]
          });
  
          if (!user) {
              throw new UnauthorizedException('User not registered with GitHub');
          }
  
          const { accessToken, refreshToken } = await this.loginTokenGenerator.generateToken(
              user.id,
              user.email
          );

          return this.tokenSave.saveToken(user, accessToken, refreshToken, req);
      } catch (error) {
          throw new UnauthorizedException('GitHub login failed');
      }
  }
}
