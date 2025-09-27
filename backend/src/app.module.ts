import { Module } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { ExampleController } from './example/example.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Review } from './reviews/entities/review.entity';
import { Product } from './products/entities/product.entity';
import { ProductImage } from './products/entities/product-image.entity';
import { ProductSpec } from './products/entities/product-spec.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Category } from './categories/entities/category.entity';
import { Brand } from './brands/entities/brand.entity';
import { createPool } from 'mysql2/promise';
import { AdminCategoriesModule } from './admin/categories/admin-categories.module';
import { PublicCategoriesModule } from './public/categories/public-categories.module';
import { AdminBrandsModule } from './admin/brands/admin-brands.module';
import { PublicBrandsModule } from './public/brands/public-brands.module';
import { AdminProductsModule } from './admin/products/admin-products.module';
import { PublicProductsModule } from './public/products/public-products.module';
import { SuperAdminUsersModule } from './super-admin/users/super-admin-users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Wishlist } from './wishlist/entities/wishlist.entity';
import { WishlistModule } from './wishlist/wishlist.module';

async function ensureDatabaseExists() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'karkachi_phone';

  const pool = createPool({
    host,
    port,
    user,
    password,
    waitForConnections: true,
  });
  try {
    await pool.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
  } finally {
    await pool.end();
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        // In non-production, ensure DB exists to allow auto table creation
        if (process.env.NODE_ENV !== 'production') {
          await ensureDatabaseExists();
        }
        return {
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT || 3306),
          username: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'karkachi_phone',
          // autoLoadEntities: true can be used, but we list entities explicitly for clarity
          entities: [
            User,
            Review,
            Product,
            ProductImage,
            ProductSpec,
            Order,
            OrderItem,
            Category,
            Brand,
            Wishlist,
          ],
          synchronize: process.env.NODE_ENV !== 'production',
          // logging: process.env.TYPEORM_LOGGING === 'true',
        } as const;
      },
    }),
    UsersModule,
    AuthModule,
    AdminCategoriesModule,
    PublicCategoriesModule,
    AdminBrandsModule,
    PublicBrandsModule,
    AdminProductsModule,
    PublicProductsModule,
    SuperAdminUsersModule,
    ReviewsModule,
    WishlistModule,
    RateLimitModule.forRoot({
      trustProxy: true, // enable when behind reverse proxy / CDN in prod
      keyStrategy: 'ip', // global default
      refillRatePerSec: 5, // global default: 5 req/sec
      burstCapacity: 100, // allow short bursts
      cost: 1,
      idleExpireSeconds: 3600,
      // If using JWT and req.user exists, this is not needed; but you can customize:
      userIdResolver: (req: { headers: IncomingHttpHeaders; user?: any }) => {
        // Example fallback: read user id from a header in dev
        const val = req.headers['x-user-id'];
        const hdr = Array.isArray(val) ? val[0] : val;
        if (typeof hdr === 'string') return hdr;
        return undefined;
      },
    }),
  ],
  controllers: [ExampleController],
})
export class AppModule {}
