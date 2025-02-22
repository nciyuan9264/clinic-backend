import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicine')
export class MedicineEntity {
  @PrimaryGeneratedColumn()
  id: number; // 主键，自增ID

  @Column({ unique: true })
  barcode: string; // 唯一条形码

  @Column()
  brand: string;

  @Column({ nullable: false })
  goods_name: string; // 必填项

  @Column()
  company: string;

  @Column()
  keyword: string;

  @Column()
  goods_type: string;

  @Column()
  category_code: string;

  @Column()
  category_name: string;

  @Column()
  image: string;

  @Column()
  spec: string;

  @Column()
  width: string;

  @Column()
  height: string;

  @Column()
  depth: string;

  @Column()
  gross_weight: string;

  @Column()
  net_weight: string;

  @Column({ nullable: false })
  purchase_price: string; // 进价（必填）

  @Column({ nullable: false })
  sale_price: string; // 售价（必填）

  @Column()
  origin_country: string;

  @Column()
  first_ship_date: string;

  @Column()
  packaging_type: string;

  @Column()
  shelf_life: string;

  @Column()
  min_sales_unit: string;

  @Column()
  certification_standard: string;

  @Column()
  certificate_license: string;

  @Column()
  remark: string;

  @Column({ type: 'text', nullable: true })
  description: string; // 允许为空
}
