import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { Web } from './entitie/web.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Web])],
  controllers: [WebController],
  providers: [WebService]
})
export class WebModule {}
