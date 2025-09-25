import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { AdminBrandsController } from './admin-brands.controller';
import { AdminBrandsService } from './admin-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [AdminBrandsController],
  providers: [AdminBrandsService],
})
export class AdminBrandsModule {}
