import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entitie/user.entities';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginTokenGenerator } from './token/token-generator';
import { TokenSave } from './token/token-save';
import { GithubAuthService } from './services/github.services';
import { UserSession } from 'src/session-user/entitie/user-session.entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly loginTokenGenerator: LoginTokenGenerator,
    private readonly tokenSave: TokenSave,
    private readonly githubAuthService: GithubAuthService,
  ) {}
  async loginAttackTracer(userLoginDto: UserLoginDto, req: any) {
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

  async refreshLogin(req: any) {
    const refreshToken = req.cookies.refresh_token;
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
        await Promise.all([
          this.tokenSave.saveTokenInDB(
            user[0],
            accessToken,
            refreshToken as string,
            req,
          ),
          this.tokenSave.saveTokenInCookies(
            accessToken,
            refreshToken as string,
            req,
          ),
        ]);
        res.redirect(`${process.env.FRONTEND_URL}/login/Successful`)
        return {
          message: 'Login successful',
          user: { email: user[0].email, name: user[0].name },
        };
      }
    } catch (error) {
      console.error('GitHub auth error:', error);
      throw new BadRequestException('Error en la autenticación con GitHub.');
    }
  }
}
