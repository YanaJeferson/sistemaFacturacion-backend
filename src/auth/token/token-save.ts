import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../entities/user-session.entities';

@Injectable()
export class TokenSave {
  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {}

  async saveTokenInDB(
    user: any,
    accessToken: string,
    refreshToken: string,
    req: any,
  ) {
    try {
      const session = this.sessionRepository.create({
        user,
        refreshToken,
        deviceInfo: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      await this.sessionRepository.save(session);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      console.error('Error saving token in db:', error);
      throw new Error('Failed to save session');
    }
  }
  
  async saveTokenInCookies(
    accessToken: string,
    refreshToken: string,
    req: any,
  ) {
    try {
      req.res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
      });

      req.res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
      });
    } catch (error) {
      console.error('Error saving token in cookies:', error);
      throw new Error('Failed to save session');
    }
  }
}
