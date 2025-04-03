// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { UserSession } from 'src/login/entities/user-session.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class SessionUserService {
//   constructor(
//     @InjectRepository(UserSession)
//     private readonly userSessionRepository: Repository<UserSession>,
//   ) {}

//   async getAllSessions(req: any) {
//     const refreshToken = req.cookies['refreshToken'];
//     const userSessions = await this.userSessionRepository.find({
//       where: { refreshToken },
//     });
//     return userSessions;
//   }
// }
