import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import type { IncomingHttpHeaders } from 'http';
import { readFileSync } from 'node:fs';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { BatchModule } from './batch/batch.module';
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
import { Cart } from './carts/entities/cart.entity';
import { CartItem } from './carts/entities/cart-item.entity';
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
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { ProfileModule } from './profile/profile.module';

async function ensureDatabaseExists() {
  const host = process.env.DB_HOST!;
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER!;
  const password = process.env.DB_PASSWORD!;
  const database = process.env.DB_NAME!;

  const pool = createPool({
    host,
    port,
    user,
    password,
    waitForConnections: true,
    ssl: {
      ca: readFileSync(process.env.DB_CA_CERT_PATH!, 'utf-8'),
    },
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
        if (process.env.NODE_ENV !== 'production') {
          await ensureDatabaseExists();
        }

        return {
          type: 'mysql',
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
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
            Cart,
            CartItem,
          ],
          synchronize: process.env.NODE_ENV !== 'production', // jamais en prod !
          ssl: {
            ca: readFileSync(process.env.DB_CA_CERT_PATH!, 'utf-8'),
          },
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
    CartsModule,
    OrdersModule,
    ProfileModule,
    // In-memory batch processing (jobs with retries/backoff)
    BatchModule.forRoot(
      {
        concurrency: 2,
        defaultMaxAttempts: 5,
        initialBackoffMs: 500,
        maxBackoffMs: 30_000,
        pollIntervalMs: 1_000,
      },
      {
        // Example job handlers (replace with real implementations later)
        'orders.export': (payload: { from?: string; to?: string }) => {
          console.log('Running orders.export job with payload:', payload);
          return Promise.resolve();
        },
        generic: () => {
          console.log('Running generic job');
          return Promise.resolve();
        },
      },
    ),
    RateLimitModule.forRoot({
      trustProxy: true, // behind reverse proxy / CDN in prod
      // Prefer per-user limiting when JWT is present, fallback to IP if anonymous
      keyStrategy: 'user',
      // Global defaults
      refillRatePerSec: 5,
      burstCapacity: 100,
      cost: 1,
      idleExpireSeconds: 3600,
      // Whitelist routes (health checks, public assets/APIs)
      whitelist: ['/health', '/api/public', /^\/public\//],
      // Per-role overrides (higher quotas for admins)
      rolePolicies: {
        USER: { refillRatePerSec: 5, burstCapacity: 100 },
        ADMIN: { refillRatePerSec: 10, burstCapacity: 200 },
        SUPER_ADMIN: { refillRatePerSec: 15, burstCapacity: 300 },
      },
      // Fallback user id resolver (dev tools, no JWT)
      userIdResolver: (req: { headers: IncomingHttpHeaders; user?: any }) => {
        const val = req.headers['x-user-id'];
        const hdr = Array.isArray(val) ? val[0] : val;
        if (typeof hdr === 'string') return hdr;
        return undefined;
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
