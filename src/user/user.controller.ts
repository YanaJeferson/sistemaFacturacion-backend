import { Body, Controller, Post, Req } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserService } from './user.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiBody({ type: UserRegisterDto })
  register(@Body() userRegisterDto: UserRegisterDto, @Req() req: Request) {
    return this.userService.register(userRegisterDto, req);
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Get("allUser")
  // getAllUser() {
  //     return this.userService.findAll();
  // }
}
