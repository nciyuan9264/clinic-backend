import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createClient } from 'redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './orm/user.entity';
import { BullModule } from '@nestjs/bull';
import { MyTaskProcessor } from './tasks/myTask';
import { BullBoardModule } from '@bull-board/nestjs'; // BullBoard 的 NestJS 集成模块
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '', 10),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      synchronize: true,
      logging: true,
      entities: [User],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
    TypeOrmModule.forFeature([User]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        db: 1, // 使用 Redis 的第 1 个数据库
      },
    }),
    BullModule.registerQueue({
      name: 'myQueue',
    }),
    BullBoardModule.forFeature({
      name: 'myQueue',
      adapter: BullAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    // 配置 Bull Board
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
      // 可以配置一些 UI 的选项
      // boardOptions: {
      //
      // },
    }),
    JwtModule.register({
      secret: jwtConstants.secret
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtModule,
    MyTaskProcessor,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
          database: 0, // 使用 Redis 的第 0 个数据库
        });
        await client.connect();
        return client;
      },
    },
  ],
})
export class AppModule {}
