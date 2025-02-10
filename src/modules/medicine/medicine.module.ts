import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { MedicineEntity } from '../../orm/medicine.entity';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: process.env.MYSQL_HOST,
    //   port: parseInt(process.env.DATABASE_PORT ?? '', 10),
    //   username: process.env.MYSQL_USER,
    //   password: process.env.MYSQL_PASSWORD,
    //   database: process.env.MYSQL_DATABASE,
    //   synchronize: true,
    //   logging: true,
    //   entities: [MedicineEntity],
    //   poolSize: 10,
    //   connectorPackage: 'mysql2',
    //   extra: {
    //     authPlugin: 'sha256_password',
    //   },
    // }),
    TypeOrmModule.forFeature([MedicineEntity])
  ],
  providers: [MedicineService],
  controllers: [MedicineController],
  exports: [MedicineService],
})
export class MedicineModule {}
