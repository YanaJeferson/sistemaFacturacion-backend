import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const customCss = readFileSync(
    join(__dirname, '../css/swagger-dark.css'),
    'utf8',
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('AttackTracer API')
    .setDescription('API documentation for AttackTracer Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customCss,
    customSiteTitle: 'AttackTracer API Documentation'
  });

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(cookieParser());
  
  await app.listen(3000);
}
bootstrap();
