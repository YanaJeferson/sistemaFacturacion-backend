import { Body, Controller, Post, Get, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService) {}

    @Post("attacktracer")
    login(@Body() userLoginDto: UserLoginDto, @Req() req: Request) {
        return this.loginService.loginAttackTracer(userLoginDto, req);
    }

    @Get("github")
    @UseGuards(AuthGuard('github'))
    async githubAuth() {
        // GitHub authentication will be handled by Passport
    }

    @Get("github/callback")
    @UseGuards(AuthGuard('github'))
    async githubAuthCallback(@Req() req: Request) {
        return this.loginService.loginGitHub(req.user, req);
    }














    
    @UseGuards(JwtAuthGuard)
    @Get('sessions')
    getUserSessions(@Req() req: Request) {
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        return this.loginService.getUserSessions(req.user['id']);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('sessions/:sessionId')
    logoutSession(@Req() req: Request, @Param('sessionId') sessionId: number) {
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        return this.loginService.logoutSession(req.user['id'], sessionId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('sessions')
    logoutAllSessions(@Req() req: Request) {
        if (!req.user) {
            throw new Error('User not authenticated');
        }
        return this.loginService.logoutAllSessions(req.user['userId']);
    }
}
