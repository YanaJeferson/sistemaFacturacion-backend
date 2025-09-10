import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entitie/user.entities';
import { TokenSave } from 'src/auth/token/token-save';
import { LoginTokenGenerator } from 'src/auth/token/token-generator';
import { UserSession } from 'src/session-user/entitie/user-session.entities';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  controllers: [UserController],
  providers: [UserService, TokenSave, LoginTokenGenerator, JwtService],
})
export class UserModule {}
