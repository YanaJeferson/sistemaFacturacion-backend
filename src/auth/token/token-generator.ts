import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface Token {
  accessToken: string;
  refreshToken?: string | undefined;
}

@Injectable()
export class LoginTokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(
    user_id: string, 
    user_email: string, 
    refreshToken: boolean = false
  ): Promise<Token> {
    try {
      const userAccessSecret = `${process.env.JWT_SECRET}_${user_id}_${user_email}`;
      const userRefreshSecret = `${process.env.JWT_REFRESH_SECRET}_${user_email}_${user_id}`;
      const payload = { sub: user_id, email: user_email };

      if (refreshToken) {
        const accessToken = await this.jwtService.signAsync(payload, {
          expiresIn: '1d',
          secret: userAccessSecret,
        });
        return { accessToken };
      }

      const [accessToken, refreshTokenValue] = await Promise.all([
        this.jwtService.signAsync(payload, {
          expiresIn: '1d',
          secret: userAccessSecret,
        }),
        this.jwtService.signAsync(payload, {
          expiresIn: '30d',
          secret: userRefreshSecret,
        }),
      ]);

      return {
        accessToken,
        refreshToken: refreshTokenValue,
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }
}
