import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../products/entities/product.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category])],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
