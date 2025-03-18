import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { MedicineEntity } from '../../orm/medicine.entity';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicineEntity]),
    HttpModule,
    JwtModule.register({
      secret: jwtConstants.secret
    }),
  ],
  providers: [MedicineService],
  controllers: [MedicineController],
  exports: [MedicineService],
  
})
export class MedicineModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(MedicineController);  // 仅对 MedicineController 路由应用中间件
  }
}
