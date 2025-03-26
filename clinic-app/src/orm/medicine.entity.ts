import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicine')
export class MedicineEntity {
  @PrimaryGeneratedColumn()
  id: number; // 主键，自增ID

  @Column({ unique: true, default: '' })
  barcode: string; // 唯一条形码

  @Column({nullable: false})
  brand: string;

  @Column({ nullable: false })
  goods_name: string; // 必填项

  @Column({nullable: true})
  company: string;

  @Column({nullable: true})
  keyword: string;

  @Column({nullable: true})
  goods_type: string;

  @Column({nullable: true})
  category_code: string;

  @Column({nullable: true})
  category_name: string;

  @Column({nullable: true})
  image: string;

  @Column({nullable: true})
  spec: string;

  @Column({nullable: true})
  width: string;

  @Column({nullable: true})
  height: string;

  @Column({nullable: true})
  depth: string;

  @Column({nullable: true})
  gross_weight: string;

  @Column({nullable: true})
  net_weight: string;

  @Column({ nullable: false })
  purchase_price: string; // 进价（必填）

  @Column({ nullable: false })
  sale_price: string; // 售价（必填）

  @Column({nullable: true})
  origin_country: string;

  @Column({nullable: true})
  first_ship_date: string;

  @Column({nullable: true})
  packaging_type: string;

  @Column({nullable: true})
  shelf_life: string;

  @Column({nullable: true})
  min_sales_unit: string;

  @Column({nullable: true})
  certification_standard: string;

  @Column({nullable: true})
  certificate_license: string;

  @Column({nullable: true})
  remark: string;

  @Column({ type: 'text', nullable: true })
  description: string; // 允许为空
}
