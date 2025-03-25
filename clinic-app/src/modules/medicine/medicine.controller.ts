import { Controller, Post, Body, Get, Param, Query, Res, Req } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { MedicineEntity } from '../../orm/medicine.entity';
import { GetBarcodeInfoType } from 'src/const/medicine';
import { Response, Request } from 'express'; // 引入 express 的 Response 类型

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  // 创建药品接口
  @Post('add-medicine')
  async createMedicine(@Body() medicineData: Partial<MedicineEntity>) {
    return this.medicineService.create(medicineData);
  }

  // 创建药品接口
  @Post('edit-medicine')
  async editMedicine(@Body() medicineData: Partial<MedicineEntity>) {
    return this.medicineService.edit(medicineData);
  }

  // 根据 barcode 或 id 查询药品详情
  @Get('/list/:Id')
  async getMedicineById(@Param('Id') Id: string) {
    return this.medicineService.findById(Id);
  }

  // 获取药品列表接口
  @Get('list')
  async getAllMedicines() {
    return this.medicineService.findAll();
  }

  @Get('barcode')
  async getBarcodeInfo(
    @Query('barcode') barcode: string,
    @Query('type') type: GetBarcodeInfoType, // 新增参数
    @Res() res: Response,
  ) {
    return this.medicineService.getBarcodeInfo({ barcode, type }, res);
  }
}
