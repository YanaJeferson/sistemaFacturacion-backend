import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Delete,
  Query,
} from '@nestjs/common';
import { WebService } from './web.service';
import { AuthGuard } from '@nestjs/passport';
import { webUpsertDto } from './dto/web-register.dto';
import { WebFilterDto } from './dto/web-filter.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebPaginatedResponseDto } from './dto/web-paginated-response.dto';

@Controller('web')
@UseGuards(AuthGuard('jwt'))
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: WebPaginatedResponseDto
  })

  // @ApiResponse({
  //   status: 401,
  //   description: 'Invalid credentials',
  //   type: ErrorResponseDto,
  // })

  @ApiOperation({ summary: 'Get registered websites for user' })
  getData(@Query() params: WebFilterDto, @Req() req: any) {
    return this.webService.findData(req.user, params);
  }

  @Post()
  @ApiOperation({ summary: 'Register or update a website for user' })
  upsert(@Body() body: webUpsertDto, @Req() req: any) {
    return this.webService.upsert(body, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a website for user' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.webService.delete(id, req.user);
  }
}
