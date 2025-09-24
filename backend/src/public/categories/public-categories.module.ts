import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../categories/entities/category.entity';
import { PublicCategoriesService } from './public-categories.service';
import { PublicCategoriesController } from './public-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [PublicCategoriesController],
  providers: [PublicCategoriesService],
})
export class PublicCategoriesModule {}
