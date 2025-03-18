import {
  Controller,
  Get,
  Post,
  Inject,
  Body,
  UseInterceptors,
  BadRequestException,
  Res,
  Req,
  UploadedFile
} from '@nestjs/common';
import { AppService } from './app.service';
import { RedisClientType } from 'redis';
import { User } from './orm/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express'; // 引入 express 的 Response 类型
import { BullBoardInstance, InjectBullBoard } from '@bull-board/nestjs';
import { Express } from 'express'; // ✅ 正确引入 Express 以支持 Multer.File 类型

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectBullBoard() private readonly boardInstance: BullBoardInstance,
  ) {}

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  @Get('admin/queues')
  getQueues() {
    // return this.boardInstance.getRouter(); // 访问 UI 界面
  }

  @Get('user-info') // 设置查询接口
  async getUserInfo(): Promise<User[]> {
    this.appService.addJobToQueue();
    return this.appService.getUserInfo(); // 调用 service 获取用户信息
  }

  @Post('register') // 注册接口
  @UseInterceptors(FileInterceptor('')) // 解析 form-data
  async registerUser(@Body() body: any, @Res() res: Response): Promise<any> {
    const { username, password, email } = body;

    if (!username || !password) {
      throw new BadRequestException('用户名或密码不能为空');
    }

    // 调用 service 执行注册逻辑
    return this.appService.registerUser({ username, password, email }, res);
  }

  @Post('login') // 登录接口
  @UseInterceptors(FileInterceptor('')) // 解析 form-data
  async loginUser(@Body() body: any, @Res() res: Response): Promise<any> {
    const { username, password } = body;

    if (!username || !password) {
      throw new BadRequestException('用户名或密码不能为空');
    }

    // 调用 service 执行登录逻辑
    return this.appService.login({ username, password }, res);
  }

  @Get('check')
  async checkAuth(@Req() req: Request, @Res() res: Response): Promise<any> {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];

    return this.appService.checkAuth({ accessToken, refreshToken }, res);
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    // 清除 Cookie
    res.clearCookie('accessToken', { httpOnly: true });
    res.clearCookie('refreshToken', { httpOnly: true });

    return res.json({ message: '退出成功' });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 处理文件上传
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.appService.uploadFile(file);
  }
}
