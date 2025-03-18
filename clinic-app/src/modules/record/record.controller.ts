import { Controller, Post, Body, Get, Param, Query, Res, Delete } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordEntity } from '../../orm/record.entity';
import { Response } from 'express'; // 引入 express 的 Response 类型

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  // 创建药品接口
  @Post('add-record')
  async createRecord(@Body() recordData: Partial<RecordEntity>) {
    return this.recordService.create(recordData);
  }

  // 编辑药品接口
  @Post('edit-record')
  async editRecord(@Body() recordData: Partial<RecordEntity>) {
    return this.recordService.edit(recordData);
  }

  // 根据 id 查询病历详情
  @Get('/list/:Id')
  async getRecordById(@Param('Id') Id: string) {
    return this.recordService.findById(Id);
  }

  // 获取病历列表接口
  @Get('list')
  async getAllRecord() {
    return this.recordService.findAll();
  }

  // **根据 ID 删除病历**
  @Delete('delete/:id')
  async deleteRecord(@Param('id') id: string) {
    return this.recordService.deleteById(id);
  }
}
