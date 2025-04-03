import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: (req) => {
        if (!req.cookies || !req.cookies.accessToken) {
          throw new UnauthorizedException('Token no encontrado en cookies');
        }
        console.log('Token desde cookies:', req.cookies.accessToken);
        return req.cookies.accessToken;
      },

      ignoreExpiration: false,
      secretOrKeyProvider: (
        request: Request,
        rawJwtToken: string,
        done: (err: Error | null, secret?: string) => void,
      ) => {
        try {
          const payload: any = JSON.parse(
            Buffer.from(rawJwtToken.split('.')[1], 'base64').toString(),
          );
          const secretKey = `${process.env.JWT_SECRET}_${payload.sub}_${payload.email}`;
          done(null, secretKey);
        } catch (error) {
          done(new UnauthorizedException('Invalid token'));
        }
      },
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, email: payload.email },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
