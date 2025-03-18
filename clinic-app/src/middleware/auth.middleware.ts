// src/middleware/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { jwtConstants } from 'src/jwt.config';
import { refreshAccessToken } from 'src/utils/auth.utils';
// 确保你有常量存放 JWT 密钥

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 获取头部信息
    const accessToken = req.headers['authorization']?.split(' ')[1];
    const refreshToken = req.headers['x-refresh-token'];
    console.log('wzy999 accessToken ', accessToken);

    if (!accessToken || !refreshToken) {
      throw new HttpException('未认证', HttpStatus.UNAUTHORIZED);
    }

    try {
      // 校验 accessToken
      const payload = this.jwtService.verify(accessToken, {
        secret: jwtConstants.secret,
      });
      req.user = payload;  // 把用户信息加到请求对象上
      return next();  // 如果验证通过，继续执行后续的请求处理
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // 如果 accessToken 过期，尝试使用 refreshToken 获取新 token
        res.json(refreshAccessToken(refreshToken, res, this.jwtService));
        return next();
      }

      throw new HttpException('无效的 Token', HttpStatus.UNAUTHORIZED);
    }
  }
}
