import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineEntity } from '../../orm/medicine.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(MedicineEntity)
    private readonly medicineRepository: Repository<MedicineEntity>,
  ) {}

  async create(medicineData: Partial<MedicineEntity>) {
    try {
      console.log('wzy ', medicineData);
      const medicine = this.medicineRepository.create(medicineData);
      const savedMedicine = await this.medicineRepository.save(medicine);

      return {
        success: true,
        message: '药品创建成功',
        data: savedMedicine,
      };
    } catch (error) {
      return {
        success: false,
        message: '药品创建失败',
        error: error.message || '未知错误',
      };
    }
  }

  async edit(medicineData: Partial<MedicineEntity>) {
    try {
      // 先确保传入的 medicineData 中包含 id
      if (!medicineData.id) {
        return {
          success: false,
          message: '缺少药品 ID',
        };
      }

      // 查找对应的药品
      const medicine = await this.medicineRepository.findOne({
        where: { id: medicineData.id },
      });

      if (!medicine) {
        return {
          success: false,
          message: '药品未找到',
        };
      }

      // 更新药品信息（仅更新传入的字段）
      Object.assign(medicine, medicineData);
      const updatedMedicine = await this.medicineRepository.save(medicine);

      return {
        success: true,
        message: '药品更新成功',
        data: updatedMedicine,
      };
    } catch (error) {
      return {
        success: false,
        message: '药品更新失败',
        error: error.message || '未知错误',
      };
    }
  }

  // 根据 barcode 或 id 查找药品
  async findByBarcodeOrId(barcodeOrId: string): Promise<MedicineEntity> {
    // 如果 barcodeOrId 是数字类型（id），需要转换为数字
    const id = isNaN(Number(barcodeOrId)) ? undefined : Number(barcodeOrId);
    const medicine = await this.medicineRepository.findOne({
      where: [
        { barcode: barcodeOrId }, // 根据 barcode 查找
        { id }, // 如果是数字则按 id 查找
      ],
    });
    if (!medicine) {
      throw new Error('药品未找到');
    }
    return medicine;
  }

  // 获取药品列表
  async findAll(): Promise<{
    code: number;
    message: string;
    data: MedicineEntity[];
  }> {
    const medicines = await this.medicineRepository.find();
    return {
      code: 200,
      message: medicines.length > 0 ? '获取成功' : '暂无药品数据',
      data: medicines,
    };
  }
}
