import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistPaginationDto } from './dto/pagination.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist) private readonly repo: Repository<Wishlist>,
  ) {}

  // O(1): rely on composite unique index (userId, productId)
  async add(userId: string, productId: string) {
    const entity = this.repo.create({ userId, productId });
    try {
      await this.repo.insert(entity);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const msg = err.message || '';
        // MySQL duplicate key
        if (
          msg.includes('Duplicate') ||
          msg.includes('UNIQUE') ||
          msg.includes('duplicate key')
        ) {
          // Idempotent behavior: already in wishlist
          throw new ConflictException('Product already in wishlist');
        }
        // FK error when productId does not exist
        if (
          msg.includes('ER_NO_REFERENCED_ROW') ||
          msg.includes('foreign key constraint fails') ||
          msg.includes('1452')
        ) {
          throw new BadRequestException('Invalid productId');
        }
      }
      throw err;
    }
    return { success: true as const };
  }

  // O(1): direct delete
  async remove(userId: string, productId: string) {
    const res = await this.repo.delete({ userId, productId });
    if (res.affected === 0) {
      throw new NotFoundException('Item not found in wishlist');
    }
    return { success: true as const };
  }

  // O(1) check
  async has(userId: string, productId: string) {
    const exists = await this.repo.exist({ where: { userId, productId } });
    return { success: true as const, data: { present: exists } };
  }

  // List products in user's wishlist with minimal fields from product (paginated)
  async list(userId: string, { page = 1, limit = 25 }: WishlistPaginationDto) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const base = this.repo
      .createQueryBuilder('w')
      .innerJoin('w.product', 'p')
      .where('w.userId = :uid', { uid: userId });

    const totalRow = await base
      .clone()
      .select('COUNT(*)', 'cnt')
      .getRawOne<{ cnt: string }>();
    const total = Number(totalRow?.cnt ?? 0);

    const rows = await base
      .clone()
      .select([
        'p.id AS p_id',
        'p.name AS p_name',
        'p.description AS p_description',
        'p.image AS p_image',
        'p.price AS p_price',
        'p.originalPrice AS p_originalPrice',
        'p.stock AS p_stock',
        'p.isActive AS p_isActive',
      ])
      .orderBy('w.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getRawMany<{
        p_id: string;
        p_name: string;
        p_description: string;
        p_image: string;
        p_price: string;
        p_originalPrice?: string | null;
        p_stock: string;
        p_isActive: number;
      }>();

    const items = rows.map((r) => ({
      id: r.p_id,
      name: r.p_name,
      description: r.p_description,
      image: r.p_image,
      price: Number(r.p_price),
      priceOriginal:
        r.p_originalPrice != null ? Number(r.p_originalPrice) : null,
      stock: Number(r.p_stock),
      isAvailable: Number(r.p_stock) > 0 && r.p_isActive === 1,
    }));

    return {
      success: true as const,
      data: { items, total, page: Math.max(page, 1), limit: take },
    };
  }

  // O(1): clear all wishlist items for a user
  async clear(userId: string) {
    await this.repo.delete({ userId });
    return { success: true as const };
  }
}
