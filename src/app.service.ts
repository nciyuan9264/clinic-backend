import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './orm/user.entity';
import { Repository } from 'typeorm';
import { RedisClientType } from 'redis';

@Injectable()
export class AppService {
  constructor(
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,

    @InjectRepository(User)
    private userRepository: Repository<User>,

  ) {}

  // 获取用户信息
  async getUserInfo(): Promise<User[]> {
    const cacheKey = 'user_info';

    // 先尝试从 Redis 缓存中获取数据
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      // 如果缓存中有数据，直接返回
      console.log('Data from cache');
      return JSON.parse(cachedData);
    } else {
      // 如果没有缓存，查询数据库
      const users = await this.userRepository.find();

      // 将查询结果保存到 Redis，并设置缓存过期时间（例如 1 小时）
      await this.redisClient.setEx(cacheKey, 60, JSON.stringify(users)); // 设置过期时间为 3600 秒（1小时）
      console.log('Data from database');
      return users;
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
