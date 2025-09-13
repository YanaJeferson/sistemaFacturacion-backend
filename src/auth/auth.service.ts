import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserLoginDto } from './dto/user-login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entitie/user.entities';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginTokenGenerator } from './token/token-generator';
import { TokenSave } from './token/token-save';
import { UserSession } from 'src/session-user/entitie/user-session.entities';
import { Messages } from 'src/common/constants/messages';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly loginTokenGenerator: LoginTokenGenerator,
    private readonly tokenSave: TokenSave,
    // private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}
  async login(userLoginDto: UserLoginDto, req: Request) {
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
      email: user.email,
      name: user.name,
      avatar: user.avatar || null,
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

  async googleLoginCallback(req: any, res: any) {
    try {
      const googleUser = req.user;

      if (!googleUser) {
        throw new BadRequestException('Google user not found.');
      }

      const hashedGoogleId = await bcrypt.hash(googleUser.id.toString(), 10);

      const user = await this.userRepository.find({
        where: [{ email: googleUser.email }, { providerId: hashedGoogleId }],
        select: ['id', 'providerId', 'email', 'name', 'avatar'],
      });

      if (user.length === 0) {
        // Nuevo usuario
        const newUser = this.userRepository.create({
          name: googleUser.name,
          email: googleUser.email,
          password: await bcrypt.hash('google-auth', 10),
          provider: 'google',
          providerId: hashedGoogleId,
          avatar: googleUser.picture,
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

        res.redirect(`${process.env.FRONTEND_URL}/login/successful`);

        return { email: user[0].email, name: user[0].name };
      }
    } catch (error) {
      console.error('Google auth error:', error);
      throw new BadRequestException('Google authentication failed.');
    }
  }

  async logout(req: any, res: any) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found.');
    }

    await this.userSessionRepository.delete({ refreshToken });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
      statusCode: 200,
      message: Messages.LOGOUT_SUCCESS,
    });
  }

  async requestReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.RESET_SECRET || 'fallback_secret',
      { expiresIn: '5m' },
    );

    await this.mailService.sendPasswordReset(user.email, user.name, token);

    return null;
  }

  async resetPassword(dto: ResetPasswordDto, req: Request) {
    try {
      const payload = jwt.verify(
        dto.token,
        process.env.RESET_SECRET || 'fallback_secret',
      ) as unknown as {
        userId: number;
      };

      const user = await this.userRepository.findOne({
        where: { id: String(payload.userId) },
      });
      if (!user) {
        throw new BadRequestException('Invalid token');
      }
      user.password = await bcrypt.hash(dto.newPassword, 10);
      await this.userRepository.save(user);
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
        email: user.email,
        name: user.name,
        avatar: user.avatar || null,
      };
    } catch (err) {
      throw new BadRequestException('Token expired or invalid');
    }
  }
}
