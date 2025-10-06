import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsPaginationDto } from './dto/pagination.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  // User: create review (isVerified null by default)
  async create(userId: string, dto: CreateReviewDto) {
    const entity = this.reviews.create({
      userId,
      productId: dto.productId,
      rating: dto.rating,
      comment: dto.comment,
      isVerified: null,
    });
    try {
      const saved = await this.reviews.save(entity);
      return saved;
    } catch (err: unknown) {
      // Map common FK errors to user-friendly messages
      if (err instanceof QueryFailedError) {
        const msg = err.message || '';
        if (
          msg.includes('ER_NO_REFERENCED_ROW_2') ||
          msg.includes('foreign key constraint fails') ||
          msg.includes('1452')
        ) {
          // Cannot add or update a child row: a foreign key constraint fails
          throw new BadRequestException('Invalid productId or userId');
        }
      }
      throw err;
    }
  }

  // User: delete own review, ensuring ownership
  async deleteOwn(reviewId: string, authUserId: string) {
    const review = await this.reviews.findOne({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== authUserId) throw new ForbiddenException('Not owner');
    await this.reviews.delete({ id: reviewId });
  }

  // Admin: verify/unverify
  async setVerified(id: string, verified: boolean) {
    // Fetch review to get productId (minimal select)
    const review = await this.reviews.findOne({
      where: { id },
      select: { id: true, productId: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Update verification state
    await this.reviews.update({ id }, { isVerified: verified });

    // O(1): Update product stats with a single update + subquery aggregation on verified reviews
    const pid = review.productId;
    await this.reviews.query(
      `UPDATE products p
       LEFT JOIN (
         SELECT productId, AVG(rating) AS avgRating, COUNT(*) AS cnt
         FROM reviews
         WHERE productId = ? AND isVerified = 1
       ) agg ON agg.productId = p.id
       SET p.rating = COALESCE(agg.avgRating, 0),
           p.reviewsCount = COALESCE(agg.cnt, 0)
       WHERE p.id = ?`,
      [pid, pid],
    );

    this.logger.log(
      `Review ${verified ? 'verified' : 'not-verified'}: ${id} -> product stats recalculated for ${pid}`,
    );
  }
  // Admin: list all reviews with pagination (O(1) query)
  async adminList({ page = 1, limit = 25 }: ReviewsPaginationDto) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const base = this.reviews
      .createQueryBuilder('r')
      .leftJoin('r.user', 'u')
      .leftJoin('r.product', 'p');
    const totalRow = await base
      .clone()
      .select('COUNT(*)', 'cnt')
      .getRawOne<{ cnt: string }>();
    const total = Number(totalRow?.cnt ?? 0);

    const rows = await base
      .clone()
      .select([
        'r.id AS r_id',
        'r.userId AS r_userId',
        'r.productId AS r_productId',
        'r.rating AS r_rating',
        'r.comment AS r_comment',
        'r.isVerified AS r_isVerified',
        'r.createdAt AS r_createdAt',
        'u.name AS u_name',
        'u.avatarUrl AS u_avatarUrl',
        'p.name AS p_name',
      ])
      .orderBy('r.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getRawMany<{
        r_id: string;
        r_userId: string;
        r_productId: string;
        r_rating: number;
        r_comment: string;
        r_isVerified: 0 | 1 | null;
        r_createdAt: Date;
        u_name: string | null;
        u_avatarUrl: string | null;
        p_name: string | null;
      }>();

    const items = rows.map((r) => ({
      id: r.r_id,
      userId: r.r_userId,
      productId: r.r_productId,
      rating: r.r_rating,
      comment: r.r_comment,
      isVerified: r.r_isVerified,
      createdAt: r.r_createdAt,
      userName: r.u_name ?? null,
      userImage: r.u_avatarUrl ?? null,
      productName: r.p_name ?? null,
    }));

    return { items, total, page: Math.max(page, 1), limit: take } as const;
  }

  // Public: list verified reviews by productId
  // If userId is provided, also include that user's own reviews (even if not verified)
  // and mark each item with isMine: true/false
  async publicListByProduct(
    productId: string,
    { page = 1, limit = 25 }: ReviewsPaginationDto,
    userId?: string,
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    // Base builder (no pagination) for count
    const base = this.reviews
      .createQueryBuilder('r')
      .leftJoin('r.user', 'u')
      .where('r.productId = :pid', { pid: productId });

    if (userId) {
      base.andWhere(
        '(r.isVerified = 1 OR (r.userId = :uid AND (r.isVerified = 1 OR r.isVerified IS NULL)))',
        { uid: userId },
      );
    } else {
      base.andWhere('r.isVerified = 1');
    }

    const totalRow = await base
      .clone()
      .select('COUNT(*)', 'cnt')
      .getRawOne<{ cnt: string }>();
    const total = Number(totalRow?.cnt ?? 0);

    const rows = await base
      .clone()
      .select([
        'r.id AS r_id',
        'r.userId AS r_userId',
        'r.rating AS r_rating',
        'r.comment AS r_comment',
        'r.createdAt AS r_createdAt',
        'u.name AS u_name',
        'u.avatarUrl AS u_avatarUrl',
      ])
      .orderBy('r.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getRawMany<{
        r_id: string;
        r_userId: string;
        r_rating: number;
        r_comment: string;
        r_createdAt: Date;
        u_name: string | null;
        u_avatarUrl: string | null;
      }>();

    const items = rows.map((r) => ({
      id: r.r_id,
      userId: r.r_userId,
      rating: r.r_rating,
      comment: r.r_comment,
      createdAt: r.r_createdAt,
      userName: r.u_name ?? null,
      userImage: r.u_avatarUrl ?? null,
      isMine: userId ? r.r_userId === userId : false,
    }));

    return {
      items,
      total,
      page: Math.max(page, 1),
      limit: take,
    } as const;
  }
}
