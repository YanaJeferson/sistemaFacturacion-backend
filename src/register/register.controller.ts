import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RegisterService } from './register.service';
import { AuthGuard } from '@nestjs/passport';
import { UserRegisterDto } from './dto/user-register.dto';

@Controller('register')
export class RegisterController {
    constructor (private readonly registerService: RegisterService) {}
    
    @Post("attacktracer")
    register(@Body() userRegisterDto: UserRegisterDto) {
        return this.registerService.registerAttackTracer(userRegisterDto);
    }

    @Get("github")
    @UseGuards(AuthGuard('github'))
    async githubAuth() {
        // GitHub authentication will be handled by Passport
    }

    @Get("github/callback")
    @UseGuards(AuthGuard('github'))
    async githubAuthCallback(@Req() req) {
        return this.registerService.registerGitHub(req.user);
    }
}
