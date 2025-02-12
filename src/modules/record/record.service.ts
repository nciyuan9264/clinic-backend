import {
  Body,
  HttpException,
  HttpStatus,
  Injectable,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordEntity } from '../../orm/record.entity';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express'; // 引入 express 的 Response 类型

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(RecordEntity)
    private readonly recordRepository: Repository<RecordEntity>,
    private readonly httpService: HttpService,
  ) {}

  async create(recordData: Partial<RecordEntity>) {
    try {
      console.log('wzy ', recordData);
      const record = this.recordRepository.create(recordData);
      const savedRecord = await this.recordRepository.save(record);

      return {
        success: true,
        message: '病历创建成功',
        data: savedRecord,
      };
    } catch (error) {
      return {
        success: false,
        message: '病历创建失败',
        error: error.message || '未知错误',
      };
    }
  }

  async edit(recordData: Partial<RecordEntity>) {
    try {
      // 先确保传入的 recordData 中包含 id
      if (!recordData.id) {
        return {
          success: false,
          message: '缺少药品 ID',
        };
      }

      // 查找对应的药品
      const record = await this.recordRepository.findOne({
        where: { id: recordData.id },
      });

      if (!record) {
        return {
          success: false,
          message: '药品未找到',
        };
      }

      // 更新药品信息（仅更新传入的字段）
      Object.assign(record, recordData);
      const updatedRecord = await this.recordRepository.save(record);

      return {
        success: true,
        message: '药品更新成功',
        data: updatedRecord,
      };
    } catch (error) {
      return {
        success: false,
        message: '药品更新失败',
        error: error.message || '未知错误',
      };
    }
  }

  // 根据 id 查找病历
  async findById(Id: string): Promise<RecordEntity> {
    // 如果 barcodeOrId 是数字类型（id），需要转换为数字
    const id = isNaN(Number(Id)) ? undefined : Number(Id);
    const record = await this.recordRepository.findOne({
      where: { id },
    });
    if (!record) {
      throw new Error('药品未找到');
    }
    return record;
  }

  // 获取病历列表
  async findAll(): Promise<{
    code: number;
    message: string;
    data: RecordEntity[];
  }> {
    const records = await this.recordRepository.find();
    return {
      code: 200,
      message: records.length > 0 ? '获取成功' : '暂无病历数据',
      data: records,
    };
  }
}
