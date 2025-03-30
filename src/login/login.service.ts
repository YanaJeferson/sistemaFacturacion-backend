import {
  BadRequestException,
  Injectable,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../register/entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import * as bcrypt from 'bcrypt';
import { TokenSave } from '../lib/token-save';
import { LoginTokenGenerator } from 'src/lib/token-generator';
//import { GithubAuthService } from './services/github.services';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    private loginTokenGenerator: LoginTokenGenerator,
    private tokenSave: TokenSave,
    //private readonly githubAuthService: GithubAuthService,
  ) {}

  async loginAttackTracer(
    userLoginDto,
    req,
  ): Promise<{ message: string; user: any }> {
    const user = await this.userRepository.findOne({
      where: { email: userLoginDto.email },
      select: ['id', 'email', 'name', 'avatar', 'password'],
    });

    if (
      !user ||
      !(await bcrypt.compare(userLoginDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } =
      await this.loginTokenGenerator.generateToken(user.id, user.email);

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Failed to generate tokens');
    }

    await Promise.all([
      this.tokenSave.saveTokenInDB(user, accessToken, refreshToken, req),
      this.tokenSave.saveTokenInCookies(accessToken, refreshToken, req),
    ]);

    return {
      message: 'Login successful',
      user: { email: user.email, name: user.name, avatar: user.avatar || null },
    };
  }

  async refreshLogin(refreshToken: string, req) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const userSession = await this.userSessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    if (!userSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.loginTokenGenerator.generateToken(
        userSession.user.id,
        userSession.user.email,
        true,
      );

    await this.tokenSave.saveTokenInCookies(
      accessToken,
      userSession.refreshToken,
      req,
    );

    return {
      message: 'Login successful',
    };
  }

  // async logoutSession(userId: number, sessionId: number) {
  //   await this.sessionRepository.update(
  //     { id: sessionId, user: { id: userId } },
  //     { isActive: false },
  //   );
  // }

  // async logoutAllSessions(userId: number) {
  //   await this.sessionRepository.update(
  //     { user: { id: userId }, isActive: true },
  //     { isActive: false },
  //   );
  // }

  // async getUserSessions(userId: number) {
  //   return this.sessionRepository.find({
  //     where: { user: { id: userId }, isActive: true },
  //     select: ['id', 'deviceInfo', 'ipAddress', 'createdAt'],
  //   });
  // }

  // async githubLoginCallBack(code, state, res, req) {
  //   if (!code || !state) {
  //     throw new BadRequestException('Authentication params failed.');
  //   }
  //   try {
  //     const githubTokenUser = await this.githubAuthService.getGithubToken(
  //       code,
  //       state,
  //     );
  //     const githubUserEmail =
  //       await this.githubAuthService.getGithubEmailUser(githubTokenUser);
  //     const githubUserData =
  //       await this.githubAuthService.getGithubDataUser(githubTokenUser);

  //     if (!githubUserEmail || !githubUserData) {
  //       throw new BadRequestException('GitHub user data not found.');
  //     }

  //     const hashedGithubId = await bcrypt.hash(
  //       githubUserData.id.toString(),
  //       10,
  //     );
  //     console.log('hachedGithubId: ', hashedGithubId);

  //     const user = await this.userRepository.find({
  //       where: [{ email: githubUserEmail }, { providerId: hashedGithubId }],
  //       select: ['id', 'providerId', 'email', 'name'],
  //     });

  //     if (user.length === 0) {
  //       const newUser = this.userRepository.create({
  //         name: githubUserData.name,
  //         email: githubUserEmail,
  //         password: await bcrypt.hash('github-auth', 10),
  //         provider: 'github',
  //         providerId: hashedGithubId,
  //       });
  //       return this.userRepository.save(newUser);
  //     } else if (user.length === 1) {
  //       const { accessToken, refreshToken } =
  //         await this.loginTokenGenerator.generateToken(
  //           user[0].id,
  //           user[0].email,
  //         );

  //       return this.tokenSave.saveTokenInDB(
  //         user[0],
  //         accessToken,
  //         refreshToken,
  //         req,
  //       );
  //     }
  //   } catch (error) {
  //     console.error('GitHub auth error:', error);
  //     throw new BadRequestException('Error en la autenticación con GitHub.');
  //   }
  // }
}
