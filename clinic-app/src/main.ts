import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // 启用 CORS

  const allowedOrigins = [
    'http://localhost',
    'https://yandaifu.xyz',
    'https://www.yandaifu.xyz',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // 允许请求的 Origin
      } else {
        callback(new Error('Not allowed by CORS')); // 拒绝不在列表中的 Origin
      }
    },
    credentials: true, // 允许 Cookie
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
