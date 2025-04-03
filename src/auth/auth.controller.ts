import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/attacktracer')
  async login(@Body() userLoginDto: UserLoginDto, @Req() req: Request) {
    return this.authService.loginAttackTracer(userLoginDto, req);
  }

  @Get('login/refresh')
  refreshLogin(@Req() req: Request) {
    return this.authService.refreshLogin(req);
  }

  //login with github
  @Get('login/github/callback')
  githubLogin(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: any,
    @Req() req: Request,
  ) {
    return this.authService.githubLoginCallBack(code, state, res, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('check')
  test() {
    return { status: 'ok' };
  }
}
