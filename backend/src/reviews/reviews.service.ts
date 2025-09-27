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

    const [items, total] = await this.reviews
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.productId',
        'r.userId',
        'r.rating',
        'r.comment',
        'r.isVerified',
        'r.createdAt',
      ])
      .orderBy('r.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    return {
      items,
      total,
      limit: take,
    } as const;
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

    const qb = this.reviews
      .createQueryBuilder('r')
      .select(['r.id', 'r.userId', 'r.rating', 'r.comment', 'r.createdAt'])
      .where('r.productId = :pid', { pid: productId })
      .orderBy('r.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    if (userId) {
      qb.andWhere(
        '(r.isVerified = 1 OR (r.userId = :uid AND (r.isVerified = 1 OR r.isVerified IS NULL)))',
        { uid: userId },
      );
    } else {
      qb.andWhere('r.isVerified = 1');
    }

    const [rawItems, total] = await qb.getManyAndCount();

    const items = rawItems.map((r) => ({
      ...r,
      isMine: userId ? r.userId === userId : false,
    }));

    return {
      items,
      total,
      page: Math.max(page, 1),
      limit: take,
    } as const;
  }
}
