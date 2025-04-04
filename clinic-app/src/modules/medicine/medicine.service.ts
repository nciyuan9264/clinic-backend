import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineEntity } from '../../orm/medicine.entity';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express'; // 引入 express 的 Response 类型
import { GetBarcodeInfoType } from 'src/const/medicine';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(MedicineEntity)
    private readonly medicineRepository: Repository<MedicineEntity>,
    private readonly httpService: HttpService,
  ) {}
  async create(medicineData: Partial<MedicineEntity>) {
    try {
      // 1. 先查询数据库，判断是否存在相同的 `barcode` 或 (`goods_name` 和 `brand` 相同)
      const existingMedicine = await this.medicineRepository.findOne({
        where: [
          { barcode: medicineData.barcode },
          { goods_name: medicineData.goods_name, brand: medicineData.brand },
        ],
      });

      let savedMedicine;

      if (existingMedicine) {
        // 2. 如果已存在，更新数据
        await this.medicineRepository.update(existingMedicine.id, medicineData);
        savedMedicine = await this.medicineRepository.findOne({
          where: { id: existingMedicine.id },
        });
      } else {
        // 3. 如果不存在，创建新数据
        const medicine = this.medicineRepository.create(medicineData);
        savedMedicine = await this.medicineRepository.save(medicine);
      }

      return {
        success: true,
        message: existingMedicine ? '药品已更新' : '药品创建成功',
        data: savedMedicine,
      };
    } catch (error) {
      return {
        success: false,
        message: '药品创建/更新失败',
        error: error.message || '未知错误',
      };
    }
  }
  async edit(medicineData: Partial<MedicineEntity>) {
    try {
      // 先确保传入的 recordData 中包含 id
      if (!medicineData.id) {
        return {
          success: false,
          message: '缺少药品 ID',
        };
      }

      // 查找对应的药品记录
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

      // 使用 update 方法来更新
      const result = await this.medicineRepository.update(
        medicine.id,
        medicineData,
      );

      if (result.affected === 0) {
        return {
          success: false,
          message: '药品未更新，请检查数据是否正确',
        };
      }

      return {
        success: true,
        message: '药品更新成功',
        data: medicine, // 或者 result 返回的信息
      };
    } catch (error) {
      console.error('Error details:', error); // 打印错误详细信息
      return {
        success: false,
        message: '药品更新失败',
        error: error.message || '未知错误',
      };
    }
  }

  // 根据 barcode 或 id 查找药品
  async findById(Id: string): Promise<MedicineEntity> {
    // 如果 barcodeOrId 是数字类型（id），需要转换为数字
    const id = isNaN(Number(Id)) ? undefined : Number(Id);
    const medicine = await this.medicineRepository.findOne({
      where: { id },
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

  async getBarcodeInfo(
    { barcode, type }: { barcode: string; type: GetBarcodeInfoType },
    res: Response,
  ): Promise<any> {
    if (!barcode) {
      throw new HttpException('缺少 barcode 参数', HttpStatus.BAD_REQUEST);
    }

    try {
      // **1. 先查数据库**
      const existingMedicine = await this.medicineRepository.findOne({
        where: { barcode },
      });

      if (existingMedicine) {
        return res.json({
          success: true,
          source: 'database',
          data: existingMedicine,
        });
      }
      if (type == GetBarcodeInfoType.ONLY_DATABASE) {
        return res.json({
          success: false,
          source: '',
          data: '',
          message: '不存在该药品',
        });
      }

      // **2. 数据库没有，再去请求 API**
      const apiKey = '909db8ae48e47d0125b699b1907d4a68'; //909db8ae48e47d0125b699b1907d4a68
      const apiUrl = `https://api.tanshuapi.com/api/barcode/v1/index?key=${apiKey}&barcode=${barcode}`;
      const response = await firstValueFrom(this.httpService.get(apiUrl));

      // **3. API 成功返回，检查数据**
      if (response.data && response.data.code === 1) {
        return res.json({
          success: true,
          source: 'api',
          data: response.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: '未找到该条形码对应的药品信息',
        });
      }
    } catch (error) {
      console.error('获取条形码信息失败:', error.message);
      return res
        .status(500)
        .json({ success: false, message: '获取条形码信息失败' });
    }
  }
}
