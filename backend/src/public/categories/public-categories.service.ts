import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export type PublicRootCategory = Pick<Category, 'id' | 'name' | 'image'>;

@Injectable()
export class PublicCategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async findRootActive(): Promise<PublicRootCategory[]> {
    return this.categoriesRepo.find({
      select: {
        id: true,
        name: true,
        image: true,
      },
      where: {
        isActive: true,
        isRebone: true,
      },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }
}
