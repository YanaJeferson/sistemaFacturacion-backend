// import { Module } from '@nestjs/common';
// import { SessionUserController } from './session-user.controller';
// import { SessionUserService } from './session-user.service';
// import { UserSession } from 'src/login/entities/user-session.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
// import { User } from 'src/register/entities/user.entity';
// @Module({
//   imports: [TypeOrmModule.forFeature([UserSession,User]), JwtModule.register({})],
//   controllers: [SessionUserController],
//   providers: [SessionUserService,JwtStrategy],
// })
// export class SessionUserModule {}
