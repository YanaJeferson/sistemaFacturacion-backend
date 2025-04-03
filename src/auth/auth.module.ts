import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entitie/user.entities';
import { TokenSave } from './token/token-save';
import { LoginTokenGenerator } from './token/token-generator';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-strategies';
import { GithubAuthService } from './services/github.services';
import { HttpModule } from '@nestjs/axios';
import { UserSession } from 'src/session-user/entitie/user-session.entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession]), HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    TokenSave,
    LoginTokenGenerator,
    JwtStrategy,
    GithubAuthService,
  ],
})
export class AuthModule {}
