import {
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './orm/user.entity';
import { RedisClientType } from 'redis';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Response, Express } from 'express'; // 引入 express 的 Response 类型
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './jwt.config';
import { refreshAccessToken } from './utils/auth.utils';
import * as OSS from 'ali-oss';
import OpenAI from 'openai';

@Injectable()
export class AppService {
  constructor(
    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectQueue('myQueue')
    private readonly myQueue: Queue, // 注入 Bull 队列

    private readonly jwtService: JwtService,

    @Inject('OSS_CLIENT')
    private readonly client: OSS, // ✅ 正确注入 OSS

    private readonly openai: OpenAI,
  ) {}

  // 添加任务到队列
  async addJobToQueue(): Promise<void> {
    await this.myQueue.add('myTask', { userId: 1 }); // 你可以在这里传递任务数据
    console.log('Job added to the queue');
  }

  // 获取队列状态等
  // async getJobStatus(jobId: string): Promise<any> {
  //   const job = await this.myQueue.getJob(jobId);
  //   return job?.status;
  // }

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

  async registerUser(
    @Body()
    userData: {
      username: string;
      password: string;
      email: string;
    },
    @Res() res: Response,
  ) {
    const { username, password, email } = userData;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { name: username },
    });

    if (existingUser) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: '用户名已被占用',
          name: existingUser,
          userData: userData,
        },
        HttpStatus.CONFLICT,
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = this.userRepository.create({
      name: username,
      password: hashedPassword,
      email: email,
    });

    // 保存到数据库
    try {
      const savedUser = await this.userRepository.save(newUser);
      return res.json({
        message: '注册成功',
        user: {
          id: savedUser.id,
          username: savedUser.name,
          email: savedUser.email,
        },
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '用户注册失败',
          error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 登录方法
  async login(
    @Body() userData: { username: string; password: string },
    @Res() res: Response,
  ): Promise<any> {
    const { username, password } = userData;

    // 检查用户是否存在
    const existingUser = await this.userRepository.findOne({
      where: { name: username },
    });

    if (!existingUser) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 校验密码
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
    }

    // 生成 Access Token 和 Refresh Token
    const accessToken = this.jwtService.sign(
      { id: existingUser.id, username: existingUser.name },
      {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.accessTokenExpiry,
      },
    );

    const refreshToken = this.jwtService.sign(
      { id: existingUser.id, username: existingUser.name },
      {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.refreshTokenExpiry,
      },
    );

    // 将 Refresh Token 设置到 HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // 如果启用 HTTPS，请设置为 true
      maxAge: 7 * 24 * 60 * 60 * 1000, // 设置 Cookie 过期时间为 7 天
    });

    // 将 Refresh Token 设置到 HttpOnly Cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // 如果启用 HTTPS，请设置为 true
      maxAge: 7 * 24 * 60 * 60 * 1000, // 设置 Cookie 过期时间为 7 天
    });

    // 返回 Access Token
    return res.json({
      message: '登录成功',
      userInfo: { username: existingUser.name },
    });
  }

  // 刷新 Token 方法
  async refreshToken(@Res() res: Response, @Body() body: any): Promise<any> {
    const { refresh_token } = body;

    if (!refresh_token) {
      throw new HttpException('没有提供 Refresh Token', HttpStatus.BAD_REQUEST);
    }

    try {
      // 验证 Refresh Token
      const payload = this.jwtService.verify(refresh_token, {
        secret: jwtConstants.secret,
      });

      // 生成新的 Access Token
      const newAccessToken = this.jwtService.sign(
        { id: payload.id, username: payload.username },
        {
          secret: jwtConstants.secret,
          expiresIn: jwtConstants.accessTokenExpiry,
        },
      );

      return res.json({
        message: 'Token 刷新成功',
        accessToken: newAccessToken,
      });
    } catch (err) {
      throw new HttpException('无效的 Refresh Token', HttpStatus.UNAUTHORIZED);
    }
  }

  async checkAuth(
    @Body() tokens: { accessToken: string; refreshToken: string },
    @Res() res: Response,
  ): Promise<any> {
    const { accessToken, refreshToken } = tokens;
    // 没有 accessToken 和 refreshToken，直接拒绝
    if (!accessToken || !refreshToken) {
      throw new HttpException('未认证', HttpStatus.UNAUTHORIZED);
    }

    try {
      // ✅ 尝试解析 accessToken
      const payload = this.jwtService.verify(accessToken, {
        secret: jwtConstants.secret,
      });
      return res.json({ message: '已认证', user: payload });
    } catch (err) {
      // ❌ 如果 accessToken 过期，尝试使用 refreshToken 重新获取
      if (err.name === 'TokenExpiredError') {
        return res.json(refreshAccessToken(refreshToken, res, this.jwtService));
      }

      throw new HttpException('无效的 Token', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * 上传文件到阿里云 OSS
   * @param file 文件对象
   */
  async uploadFile(file: Express.Multer.File) {
    try {
      const fileName = `uploads/${Date.now()}-${file.originalname}`; // 生成唯一文件名
      const result = await this.client.put(fileName, file.buffer);

      return {
        url: result.url, // 返回文件 URL
        fileName,
      };
    } catch (error) {
      throw new Error(`文件上传失败: ${error.message}`);
    }
  }

  async getChatStream(messages: any[], res: Response) {
    res.flushHeaders(); // 立即发送 Headers，避免缓存问题
    const stream = await this.openai.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      stream: true, // 启用流式返回
    });

    try {
      for await (const chunk of stream) {
        const text = JSON.stringify(chunk.choices[0]?.delta?.content);
        if (text) {
          res.write(`data: {"content": ${text}}\n\n`); // ✅ 格式必须是 `data: ...\n\n`
        }
      }
    } catch (error) {
      console.error('流式数据错误:', error);
      res.write(`data: [ERROR] ${error.message}\n\n`);
    }

    res.end();
  }
}
