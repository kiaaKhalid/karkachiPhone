import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CartsModule } from '../carts/carts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User]),
    CartsModule,
  ],
  controllers: [
    OrdersController,
    AdminOrdersController,
    AdminDashboardController,
    AdminAnalyticsController,
  ],
  providers: [OrdersService],
})
export class OrdersModule {}
