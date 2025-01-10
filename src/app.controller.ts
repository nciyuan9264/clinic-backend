import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisClientType } from 'redis';
import { User } from './orm/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  @Get()
  async getHello() {
    // const keys = await this.redisClient.keys('*');
    return this.appService.getHello();
  }

  @Get('user-info') // 设置查询接口
  async getUserInfo(): Promise<User[]> {
    return this.appService.getUserInfo(); // 调用 service 获取用户信息
  }
}
