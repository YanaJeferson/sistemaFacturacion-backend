import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubAuthService {
  constructor(private readonly httpService: HttpService) {}

  async getGithubToken(code: string, state: string) {
    try {
      const token = await firstValueFrom(
        this.httpService.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL,
            state,
          },
          { headers: { Accept: 'application/json' } },
        ),
      );
      return token.data.access_token;
    } catch (error) {
      console.error('error get token github', error);
    }
  }

  async getGithubEmailUser(token: string) {
    try {
      const emailUser = await firstValueFrom(
        this.httpService.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      const primaryEmail =
        emailUser.data.find((item) => item.primary)?.email ?? null;
      return primaryEmail;
    } catch (error) {
      console.error('error get email user github', error);
    }
  }

  async getGithubDataUser(token: string) {
    try {
      const userData = await firstValueFrom(
        this.httpService.get('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      const { id, name, avatar_url } = userData.data;
      const userShortData = {
        id,
        name,
        avatar_url,
        provider: 'github',
      };

      return userShortData;
    } catch (error) {
      console.error('error get data user github', error);
    }
  }
}
