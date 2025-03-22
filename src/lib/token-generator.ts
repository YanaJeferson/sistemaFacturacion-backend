import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface Token {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginTokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(user_id: number, user_email: string): Promise<Token> {
    try {
      const userSecret = `${process.env.JWT_SECRET}_${user_id}`;
      const payload = { sub: user_id, email: user_email };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          expiresIn: '15m',
          secret: userSecret,
        }),
        this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET,
        }),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }
}
