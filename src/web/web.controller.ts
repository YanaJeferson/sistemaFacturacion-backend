import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { WebService } from './web.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('web')
@UseGuards(AuthGuard('jwt'))
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Post()
  create(@Body() createWebDto: any, @Req() req: any) {
    return this.webService.create(createWebDto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.webService.findAllByUser(req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebDto: any, @Req() req: any) {
    return this.webService.update(id, updateWebDto, req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.webService.delete(id, req.user);
  }
}
