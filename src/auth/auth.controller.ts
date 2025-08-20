import {
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { ErrorResponseDto } from './dto/error-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/attacktracer')
  @ApiOperation({ summary: 'login with attack tracer' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  async login(@Query() query: UserLoginDto, @Req() req: Request) {
    return this.authService.loginAttackTracer(query, req);
  }

  @Get('login/refresh')
  @ApiOperation({ summary: 'refresh login' })
  refreshLogin(@Req() req: Request) {
    return this.authService.refreshLogin(req);
  }

  //login with github
  @Get('login/github/callback')
  @ApiOperation({ summary: 'login with github' })
  githubLogin(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: any,
    @Req() req: Request,
  ) {
    return this.authService.githubLoginCallBack(code, state, res, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'test login' })
  @Get('check')
  test() {
    return { status: 'ok' };
  }
}
