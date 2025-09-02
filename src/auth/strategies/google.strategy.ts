import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, StrategyOptionsWithRequest } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3080/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    try {
      const { emails, displayName, photos, id, provider } = profile;

      const user = {
        email: emails?.[0]?.value,
        name: displayName,
        picture: photos?.[0]?.value,
        id,
        provider,
        accessToken,
      };

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}

