import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { PublicBrandsController } from './public-brands.controller';
import { PublicBrandsService } from './public-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [PublicBrandsController],
  providers: [PublicBrandsService],
})
export class PublicBrandsModule {}
