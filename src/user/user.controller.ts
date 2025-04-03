import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Post("register/attacktracer")
    register(@Body() userRegisterDto: UserRegisterDto) {
        return this.userService.registerAttackTracer(userRegisterDto);
    } 

    @UseGuards(AuthGuard('jwt'))
    @Get("allUser")
    getAllUser() {
        return this.userService.findAll();  
    }
}
