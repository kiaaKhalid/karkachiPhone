import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { PublicPaginationDto } from './dto/pagination.dto';
import { PublicProductsFilterDto } from './dto/filter.dto';
import { SearchProductsDto } from './dto/search.dto';
import { ProductDetailDto } from './dto/product-detail.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class PublicProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  // very small in-memory cache for product detail
  private readonly detailCache = new Map<
    string,
    { data: ProductDetailDto; expires: number }
  >();
  private readonly detailTtlMs = 60 * 1000; // 60s

  async getPublicById(id: string): Promise<ProductDetailDto> {
    const now = Date.now();
    const cached = this.detailCache.get(id);
    if (cached && cached.expires > now) {
      return cached.data;
    }

    // Minimal SELECT: only required product columns
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoin('p.images', 'img')
      .leftJoin('p.specs', 'sp')
      .select([
        'p.id',
        'p.name',
        'p.description',
        'p.price',
        'p.originalPrice',
        'p.stock',
        'img.url',
        'sp.key',
        'sp.value',
      ])
      .where('p.id = :id', { id });

    type ProductRawRow = {
      p_id: string;
      p_name: string;
      p_description: string;
      p_price: string; // decimals come back as strings
      p_originalPrice?: string | null;
      p_stock: string;
      img_url?: string;
      sp_key?: string;
      sp_value?: string;
    };

    const rows = await qb.getRawMany<ProductRawRow>();
    if (!rows || rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    const first = rows[0];
    const idVal = first.p_id;
    const name = first.p_name;
    const description = first.p_description;
    const price = Number(first.p_price);
    const priceOriginal =
      first.p_originalPrice != null ? Number(first.p_originalPrice) : null;
    const stock = Number(first.p_stock);

    const imagesSet = new Set<string>();
    const specsMap = new Map<string, Set<string>>();

    for (const r of rows) {
      const imgUrl = r.img_url;
      if (imgUrl) imagesSet.add(imgUrl);
      const k = r.sp_key;
      const v = r.sp_value;
      if (k && v) {
        if (!specsMap.has(k)) specsMap.set(k, new Set<string>());
        specsMap.get(k)!.add(v);
      }
    }

    const specs: { key: string; value: string }[] = [];
    for (const [key, values] of specsMap.entries()) {
      for (const value of values) specs.push({ key, value });
    }

    const dto: ProductDetailDto = {
      id: idVal,
      name,
      description,
      price,
      priceOriginal,
      stock,
      images: Array.from(imagesSet).map((url): { url: string } => ({ url })),
      specs,
    };

    this.detailCache.set(id, { data: dto, expires: now + this.detailTtlMs });
    return dto;
  }

  async findLimited(flags: Partial<Record<keyof Product, any>>, limit: number) {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.isActive = :active', { active: true })
      .limit(limit);

    Object.entries(flags).forEach(([key, val]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      qb.andWhere(`p.${key} = :${key}`, { [key]: val });
    });

    qb.orderBy('p.createdAt', 'DESC');

    const items = await qb.getMany();
    return { success: true as const, message: 'OK', data: items };
  }

  // O(1) search: single query with projection and limit
  async search({ q, limit = 10, page = 1 }: SearchProductsDto) {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;
    const qb = this.repo
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.name',
        'p.description',
        'p.image',
        'p.price',
        'p.originalPrice',
        'p.reviewsCount',
      ])
      .where('p.isActive = 1')
      .andWhere('(p.name LIKE :q OR p.description LIKE :q)', { q: `%${q}%` })
      .orderBy('p.createdAt', 'DESC')
      .skip(skip)
      .limit(take);

    const items = await qb.getMany();
    return { success: true as const, message: 'OK', data: items };
  }

  async list(
    { page = 1, limit = 25 }: PublicPaginationDto,
    filters: PublicProductsFilterDto & {
      brandId?: string;
      categoryId?: string;
      isFlashDeal?: boolean;
    },
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const qb = this.repo.createQueryBuilder('p').where('p.isActive = 1');

    if (filters.brandId)
      qb.andWhere('p.brandId = :brandId', { brandId: filters.brandId });
    if (filters.categoryId)
      qb.andWhere('p.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    if (filters.isFlashDeal) qb.andWhere('p.isFlashDeal = 1');

    if (typeof filters.priceMin === 'number')
      qb.andWhere('p.price >= :priceMin', { priceMin: filters.priceMin });
    if (typeof filters.priceMax === 'number')
      qb.andWhere('p.price <= :priceMax', { priceMax: filters.priceMax });
    if (typeof filters.ratingMin === 'number')
      qb.andWhere('p.rating >= :ratingMin', { ratingMin: filters.ratingMin });

    qb.orderBy('p.createdAt', 'DESC');

    const [items, total] = await qb.take(take).skip(skip).getManyAndCount();

    return {
      success: true as const,
      message: 'OK',
      data: {
        items,
        total,
        page: Math.max(page, 1),
        limit: take,
      },
    };
  }

  async topOrdered(limit: number): Promise<{
    success: true;
    message: string;
    data: Product[];
  }> {
    const take = Math.min(Math.max(limit, 1), 50);
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoin('p.orderItems', 'oi')
      .where('p.isActive = 1')
      .groupBy('p.id')
      .orderBy('COUNT(oi.id)', 'DESC')
      .limit(take);

    const items = await qb.getMany();
    return { success: true as const, message: 'OK', data: items };
  }

  // O(1): single query selecting only the main image column
  async getImageById(id: string): Promise<string> {
    const row = await this.repo
      .createQueryBuilder('p')
      .select('p.image', 'image')
      .where('p.id = :id', { id })
      .getRawOne<{ image?: string }>();

    if (!row || !row.image) {
      throw new NotFoundException('Product not found');
    }
    return row.image;
  }
}
