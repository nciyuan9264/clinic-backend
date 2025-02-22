import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // 启用 CORS
  app.enableCors({
    origin: ['http://localhost', 'http://localhost:9527', 'http://10.95.21.245:9527', 'http://192.168.3.6','http://10.254.180.213'], // 允许的前端地址
    credentials: true, // 支持 Cookie
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
