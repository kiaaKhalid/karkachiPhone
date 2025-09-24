import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async activate(id: string): Promise<void> {
    const res = await this.categoriesRepo.update({ id }, { isActive: true });
    if (res.affected === 0) throw new NotFoundException('Category not found');
  }

  async deactivate(id: string): Promise<void> {
    const res = await this.categoriesRepo.update({ id }, { isActive: false });
    if (res.affected === 0) throw new NotFoundException('Category not found');
  }

  async findLastOrder(): Promise<Category | null> {
    return await this.categoriesRepo.findOne({
      where: {},
      order: { sortOrder: 'DESC' },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    items: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Récupération paginée des catégories actives
    const [items, total] = await this.categoriesRepo.findAndCount({
      where: {},
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calcul du nombre total de pages
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Retour structuré pour le controller
    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<Category> {
    const cat = await this.categoriesRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const entity = this.categoriesRepo.create();
    entity.name = dto.name;
    entity.slug = dto.slug;
    entity.image = dto.image;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    if (dto.isRebone !== undefined) entity.isRebone = dto.isRebone;
    if (dto.sortOrder !== undefined) entity.sortOrder = dto.sortOrder;
    return this.categoriesRepo.save(entity);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const patch: Partial<Category> = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (dto.name !== undefined) patch.name = dto.name;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (dto.slug !== undefined) patch.slug = dto.slug;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (dto.image !== undefined) patch.image = dto.image;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (dto.description !== undefined) patch.description = dto.description;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (dto.isRebone !== undefined) patch.isRebone = dto.isRebone;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    const res = await this.categoriesRepo.update({ id }, patch);
    if (res.affected === 0) throw new NotFoundException('Category not found');
    return this.findById(id);
  }
}
