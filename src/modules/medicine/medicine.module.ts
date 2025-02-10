import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { MedicineEntity } from '../../orm/medicine.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicineEntity]),
    HttpModule
  ],
  providers: [MedicineService],
  controllers: [MedicineController],
  exports: [MedicineService],
})
export class MedicineModule {}
