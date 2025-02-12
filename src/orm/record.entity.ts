import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { MedicineEntity } from './medicine.entity';

@Entity('records') // 对应数据库中的 records 表
export class RecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientName: string; // 病人姓名

  @Column({ nullable: true })
  patientAge: number; // 病人年龄

  @Column('enum', { enum: ['male', 'female'] })
  patientGender: 'male' | 'female';

  @Column('json', { nullable: true })
  prescriptionImageUrls: string[]; // 处方照片地址

  @Column('timestamp')
  startDate: string; // 看病开始日期

  @Column('timestamp')
  endDate: string; // 看病结束日期

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice?: number; // 一次性总价（如果是整体收费，使用此字段）

  @Column('json', { nullable: true })
  medications?: MedicineEntity[]; // 使用的药品，存储为 JSON 数组
}
