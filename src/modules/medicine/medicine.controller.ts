import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { MedicineEntity } from '../../orm/medicine.entity';

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
  @Get('/list/:barcodeOrId')
  async getMedicineByBarcodeOrId(@Param('barcodeOrId') barcodeOrId: string) {
    return this.medicineService.findByBarcodeOrId(barcodeOrId);
  }

  // 获取药品列表接口
  @Get('list')
  async getAllMedicines() {
    return this.medicineService.findAll();
  }
}
