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
          message: '缺少病历 ID',
        };
      }

      // 查找对应的病历记录
      const record = await this.recordRepository.findOne({
        where: { id: recordData.id },
      });

      if (!record) {
        return {
          success: false,
          message: '病历未找到',
        };
      }

      // 更新病历信息（仅更新传入的字段）
      Object.assign(record, recordData);

      // 使用 update 方法来更新
      const result = await this.recordRepository.update(record.id, recordData);

      if (result.affected === 0) {
        return {
          success: false,
          message: '病历未更新，请检查数据是否正确',
        };
      }

      return {
        success: true,
        message: '病历更新成功',
        data: record, // 或者 result 返回的信息
      };
    } catch (error) {
      console.error('Error details:', error); // 打印错误详细信息
      return {
        success: false,
        message: '病历更新失败',
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

  // **根据 ID 删除病历**
  async deleteById(id: string) {
    const recordId = Number(id);
    if (isNaN(recordId)) {
      throw new HttpException('无效的 ID', HttpStatus.BAD_REQUEST);
    }

    const record = await this.recordRepository.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new HttpException('病历未找到', HttpStatus.NOT_FOUND);
    }

    await this.recordRepository.remove(record);

    return {
      success: true,
      message: '病历删除成功',
    };
  }
}
