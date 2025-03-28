import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../register/entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import * as bcrypt from 'bcrypt';
import { TokenSave } from '../lib/token-save';
import { LoginTokenGenerator } from 'src/lib/token-generator';
import { GithubAuthService } from './services/github.services';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private loginTokenGenerator: LoginTokenGenerator,
    private tokenSave: TokenSave,
    private readonly githubAuthService: GithubAuthService,
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

    await this.tokenSave.saveToken(user, accessToken, refreshToken, req);
    // Guardar tokens en cookies seguras HTTP-only
    req.res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
    });

    req.res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
    });

    return req.res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
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

  async githubLoginCallBack(code, state, res, req) {
    if (!code || !state) {
      throw new BadRequestException('Authentication params failed.');
    }
    try {
      const githubTokenUser = await this.githubAuthService.getGithubToken(
        code,
        state,
      );
      const githubUserEmail =
        await this.githubAuthService.getGithubEmailUser(githubTokenUser);
      const githubUserData =
        await this.githubAuthService.getGithubDataUser(githubTokenUser);

      if (!githubUserEmail || !githubUserData) {
        throw new BadRequestException('GitHub user data not found.');
      }

      const hashedGithubId = await bcrypt.hash(
        githubUserData.id.toString(),
        10,
      );
      console.log('hachedGithubId: ', hashedGithubId);

      const user = await this.userRepository.find({
        where: [{ email: githubUserEmail }, { providerId: hashedGithubId }],
        select: ['id', 'providerId', 'email', 'name'],
      });

      if (user.length === 0) {
        const newUser = this.userRepository.create({
          name: githubUserData.name,
          email: githubUserEmail,
          password: await bcrypt.hash('github-auth', 10),
          provider: 'github',
          providerId: hashedGithubId,
        });
        return this.userRepository.save(newUser);
      } else if (user.length === 1) {
        const { accessToken, refreshToken } =
          await this.loginTokenGenerator.generateToken(
            user[0].id,
            user[0].email,
          );

        return this.tokenSave.saveToken(
          user[0],
          accessToken,
          refreshToken,
          req,
        );
      }
    } catch (error) {
      console.error('GitHub auth error:', error);
      throw new BadRequestException('Error en la autenticación con GitHub.');
    }
  }
}
