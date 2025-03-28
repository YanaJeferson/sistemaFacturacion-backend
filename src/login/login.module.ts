import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { User } from '../register/entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { TokenSave } from '../lib/token-save';
import { LoginTokenGenerator } from 'src/lib/token-generator';
import { HttpModule } from '@nestjs/axios';
import { GithubAuthService } from './services/github.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession]),
    JwtModule.register({}),
    HttpModule,
  ],
  controllers: [LoginController],
  providers: [LoginService, TokenSave, LoginTokenGenerator, GithubAuthService],
})
export class LoginModule {}
