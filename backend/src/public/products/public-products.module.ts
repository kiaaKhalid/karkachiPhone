import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../products/entities/product.entity';
import { PublicProductsController } from './public-products.controller';
import { PublicProductsService } from './public-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [PublicProductsController],
  providers: [PublicProductsService],
})
export class PublicProductsModule {}
