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

@Controller('web')
@UseGuards(AuthGuard('jwt'))
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get()
  getData(
    @Query('name') name: string,
    @Query('url') url: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: any,
  ) {
    return this.webService.findData(req.user, { name, url, page, limit });
  }

  @Post()
  upsert(@Body() body: webUpsertDto, @Req() req: any) {
    return this.webService.upsert(body, req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.webService.delete(id, req.user);
  }
}
