import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../register/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: async (request, token) => {
                const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                return `${process.env.JWT_SECRET}_${decoded.sub}`;
            },
        });
    }

    async validate(payload: any) {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new UnauthorizedException();
        }
        return { userId: payload.sub, email: payload.email };
    }
}