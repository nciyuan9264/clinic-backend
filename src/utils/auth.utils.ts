import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { jwtConstants } from 'src/jwt.config';


export const refreshAccessToken = (refreshToken: string, res: Response, jwtService: JwtService) => {
  try {
    // ✅ 验证 refreshToken
    const refreshPayload = jwtService.verify(refreshToken, {
      secret: jwtConstants.secret,
    });

    // ✅ 生成新的 accessToken
    const newAccessToken = jwtService.sign(
      { id: refreshPayload.id, username: refreshPayload.username },
      { secret: jwtConstants.secret, expiresIn: jwtConstants.accessTokenExpiry },
    );

    // ✅ 重新设置 Cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 设置 Cookie 过期时间为 7 天
    });

    return {
      message: 'Token 自动刷新成功',
      user: refreshPayload,
    };
  } catch (refreshErr) {
    console.error('refreshToken 失效:', refreshErr.message);
    throw new HttpException(
      '认证已过期，请重新登录',
      HttpStatus.UNAUTHORIZED,
    );
  }
};
