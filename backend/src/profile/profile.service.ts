import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Order } from '../orders/entities/order.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { Review } from '../reviews/entities/review.entity';
import { OptimisticLockVersionMismatchError } from 'typeorm/error/OptimisticLockVersionMismatchError';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Wishlist)
    private readonly wishlists: Repository<Wishlist>,
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
  ) {}

  // O(1): single indexed lookup by id with projection
  async getInfo(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        version: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      name: user.name,
      phone: user.phone ?? null,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
      version: user.version,
    } as const;
  }

  // O(1): single update by PK, with uniqueness check on email
  async updateInfo(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const newEmail = dto.email.toLowerCase();
      const exists = await this.users.findOne({ where: { email: newEmail } });
      if (exists && exists.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
      dto.email = newEmail;
    }

    if (dto.phone) {
      // Basic normalization: collapse whitespace
      dto.phone = dto.phone.trim().replace(/\s+/g, ' ');
    }

    // Optimistic locking: save with provided version. If version mismatch -> conflict.
    const { version, ...fields } = dto as unknown as {
      version: number;
      [k: string]: unknown;
    };
    try {
      const partial = this.users.create({
        id: userId,
        version,
        ...(fields as object),
      });
      await this.users.save(partial);
    } catch (e) {
      if (e instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException(
          'Conflict: resource modified by another user',
        );
      }
      throw e;
    }
    return this.getInfo(userId);
  }

  // O(1): read user by PK (with password) + update hash
  async changePassword(userId: string, payload: ChangePasswordDto) {
    const u = await this.users.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!u || !u.password) {
      throw new ForbiddenException('Password change not allowed');
    }
    const ok = await bcrypt.compare(payload.oldPassword, u.password);
    if (!ok) throw new ForbiddenException('Old password is incorrect');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(payload.newPassword, salt);
    await this.users.update({ id: userId }, { password: hash });
    return { success: true as const };
  }

  // O(1): constant number of aggregate queries on indexed columns
  async getAccountStats(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        name: true,
        phone: true,
        email: true,
        avatarUrl: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const [ordersAgg, favCount, reviewsCount] = await Promise.all([
      this.orders
        .createQueryBuilder('o')
        .select('COUNT(*)', 'cnt')
        .addSelect('COALESCE(SUM(o.total), 0)', 'sum')
        .where('o.userId = :uid', { uid: userId })
        .getRawOne<{ cnt: string; sum: string }>(),
      this.wishlists.count({ where: { userId } }),
      this.reviews.count({ where: { userId } }),
    ]);

    const totalOrders = Number(ordersAgg?.cnt ?? 0);
    const totalSpent = Number(ordersAgg?.sum ?? 0);

    // Simple profile completion scoring: 4 fields equally weighted
    const fieldsArr = [user.name, user.phone, user.email, user.avatarUrl];
    const filled = fieldsArr.filter(
      (v) => v && String(v).trim().length > 0,
    ).length;
    const profileCompletion = Math.round((filled / fieldsArr.length) * 100);

    return {
      accountStatus: user.isActive ? 'active' : 'suspended',
      totalOrders,
      totalSpent,
      profileCompletionPercent: profileCompletion,
      numberFavorites: favCount,
      numberReviewsWritten: reviewsCount,
    } as const;
  }
}
