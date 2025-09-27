import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

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

  // List products in user's wishlist with minimal fields from product
  async list(userId: string) {
    const qb = this.repo
      .createQueryBuilder('w')
      .innerJoin('w.product', 'p')
      .select([
        'p.id',
        'p.name',
        'p.description',
        'p.image',
        'p.price',
        'p.originalPrice',
        'p.stock',
        'p.isActive',
      ])
      .where('w.userId = :uid', { uid: userId })
      .orderBy('w.createdAt', 'DESC');

    const rows = await qb.getRawMany<{
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

    return { success: true as const, data: items };
  }
}
