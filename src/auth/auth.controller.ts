import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiLoginDocs } from './dto/login-response';
import { RequestResetDto, ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiLoginDocs()
  async login(@Body() userLoginDto: UserLoginDto, @Req() req: Request) {
    return this.authService.login(userLoginDto, req);
  }

  @Get('login/refresh')
  @ApiOperation({ summary: 'refresh login' })
  refreshLogin(@Req() req: Request) {
    return this.authService.refreshLogin(req);
  }

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'login with Google (redirect)' })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google Auth Callback' })
  async googleAuthCallback(@Req() req, @Res() res) {
    return this.authService.googleLoginCallback(req, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'check login and return user data' })
  @Get('check')
  test(@Req() req: any) {
    return {
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar || null,
    };
  }

  @Post('request-reset')
  @ApiOperation({ summary: 'Request password reset (send email)' })
  async requestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestReset(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(dto, req);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out and delete tokens' })
  async logout(@Req() req, @Res() res) {
    return this.authService.logout(req, res);
  }
}
