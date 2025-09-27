import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class AdminBrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  async activate(id: string): Promise<void> {
    const res = await this.repo.update({ id }, { isActive: true });
    if (!res.affected) throw new NotFoundException('Brand not found');
  }

  async desactivate(id: string): Promise<void> {
    const res = await this.repo.update({ id }, { isActive: false });
    if (!res.affected) throw new NotFoundException('Brand not found');
  }

  async findAll(
    limit = 10,
    offset = 0,
  ): Promise<{
    items: Brand[];
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  }> {
    const [items, total] = await this.repo.findAndCount({
      where: {},
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
    return { items, total, limit, offset, totalPages };
  }

  async findById(id: string): Promise<Brand> {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(dto: CreateBrandDto): Promise<Brand> {
    const entity = this.repo.create();
    entity.name = dto.name;
    entity.slug = slugify(dto.name);
    entity.logo = dto.logoUrl;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) entity.isFeatured = dto.isFeatured;
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const patch: Partial<Brand> = {};
    if (dto.name !== undefined) {
      patch.name = dto.name;
      patch.slug = dto.slug;
    }
    if (dto.logoUrl !== undefined) patch.logo = dto.logoUrl;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) patch.isFeatured = dto.isFeatured;

    const res = await this.repo.update({ id }, patch);
    if (!res.affected) throw new NotFoundException('Brand not found');
    return this.findById(id);
  }
}
