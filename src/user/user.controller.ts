import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Post("register")
    @ApiBody({ type: UserRegisterDto })
    register(@Body() userRegisterDto: UserRegisterDto) {
        return this.userService.register(userRegisterDto);
    } 

    @UseGuards(AuthGuard('jwt'))
    @Get("allUser")
    getAllUser() {
        return this.userService.findAll();  
    }
}
