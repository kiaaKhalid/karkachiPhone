import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import type { AdminListOrdersDto } from './dto/admin-list-orders.dto';
import type { AdminSearchOrdersDto } from './dto/admin-search-orders.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { AnalyticsPeriod } from './dto/analytics-period.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // O(1): direct access by userId
  async listMy(userId: string) {
    const orders = await this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orders;
  }

  // ===== Helpers =====
  private getPeriodRange(period: AnalyticsPeriod): { from: Date; to: Date } {
    const to = new Date();
    const from = new Date(to);
    switch (period) {
      case AnalyticsPeriod.LAST_7_DAYS:
        from.setDate(to.getDate() - 6); // inclusive window of 7 days
        break;
      case AnalyticsPeriod.LAST_30_DAYS:
        from.setDate(to.getDate() - 29);
        break;
      case AnalyticsPeriod.LAST_90_DAYS:
        from.setDate(to.getDate() - 89);
        break;
      case AnalyticsPeriod.LAST_YEAR:
        from.setFullYear(to.getFullYear() - 1);
        break;
      default:
        from.setDate(to.getDate() - 29);
    }
    // Zero time for from to normalize by day
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  // ===== Admin Analytics: static KPIs with growth (O(1) aggregations)
  async adminAnalyticsStatic(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
  ) {
    const { from, to } = this.getPeriodRange(period);

    // Define previous period window (same length immediately preceding)
    const prevTo = new Date(from);
    const windowMs = to.getTime() - from.getTime();
    const prevFrom = new Date(prevTo.getTime() - windowMs);

    // Revenue over period: statuses that contribute to revenue
    const revStatuses: OrderStatus[] = [
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    const revenueRow = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('o.status IN (:...sts)', { sts: revStatuses })
      .getRawOne<{ sum: string }>();
    const revenue = Number(revenueRow?.sum ?? 0);

    const prevRevenueRow = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.createdAt BETWEEN :from AND :to', {
        from: prevFrom,
        to: prevTo,
      })
      .andWhere('o.status IN (:...sts)', { sts: revStatuses })
      .getRawOne<{ sum: string }>();
    const prevRevenue = Number(prevRevenueRow?.sum ?? 0);
    const revenueGrowth =
      prevRevenue === 0
        ? revenue > 0
          ? 100
          : 0
        : ((revenue - prevRevenue) / prevRevenue) * 100;

    // Orders count (all)
    const ordersRow = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'cnt')
      .where('o.createdAt BETWEEN :from AND :to', { from, to })
      .getRawOne<{ cnt: string }>();
    const orders = Number(ordersRow?.cnt ?? 0);

    // Customers: total customers created during period and new customers (created in period)
    const customersRow = await this.userRepo
      .createQueryBuilder('u')
      .select('COUNT(*)', 'cnt')
      .where('u.createdAt <= :to', { to })
      .andWhere('u.role = :role', { role: Role.USER })
      .getRawOne<{ cnt: string }>();
    const totalCustomers = Number(customersRow?.cnt ?? 0);

    const newCustomersRow = await this.userRepo
      .createQueryBuilder('u')
      .select('COUNT(*)', 'cnt')
      .where('u.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('u.role = :role', { role: Role.USER })
      .getRawOne<{ cnt: string }>();
    const newCustomers = Number(newCustomersRow?.cnt ?? 0);

    // Active products (global, not bound to period)
    const productsRow = await this.productRepo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'cnt')
      .where('p.isActive = :act', { act: true })
      .getRawOne<{ cnt: string }>();
    const products = Number(productsRow?.cnt ?? 0);

    return {
      period,
      revenue: { amount: revenue, growth: revenueGrowth },
      orders,
      customers: { total: totalCustomers, new: newCustomers },
      products,
      range: { from, to },
    };
  }

  // ===== Admin Analytics: graphs data (O(1) aggregations)
  async adminAnalyticsGraph(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
  ) {
    const { from, to } = this.getPeriodRange(period);

    // Revenue trends by day
    const revenueRows = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.createdAt)', 'day')
      .addSelect('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('DATE(o.createdAt)')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; sum: string }>();
    const revenueTrends = revenueRows.map((r) => ({
      day: r.day,
      amount: Number(r.sum),
    }));

    // Top selling products (by quantity) in period
    const topRows = await this.itemRepo
      .createQueryBuilder('it')
      .innerJoin('it.order', 'o')
      .innerJoin('it.product', 'p')
      .select('it.productId', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('SUM(it.quantity)', 'qty')
      .where('o.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('it.productId')
      .addGroupBy('p.name')
      .orderBy('qty', 'DESC')
      .take(10)
      .getRawMany<{ productId: string; name: string; qty: string }>();
    const topSellingProducts = topRows.map((r) => ({
      id: r.productId,
      name: r.name,
      quantity: Number(r.qty),
    }));

    // Order status distribution
    const statusRows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'cnt')
      .where('o.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('o.status')
      .getRawMany<{ status: OrderStatus; cnt: string }>();
    const orderStatusDistribution = statusRows.map((r) => ({
      status: r.status,
      count: Number(r.cnt),
    }));

    // Customer demographics by age ranges (not available: no age field). Return empty stub.
    const customerDemographics: Array<{ range: string; count: number }> = [];

    return {
      period,
      revenueTrends,
      topSellingProducts,
      customerDemographics,
      orderStatusDistribution,
      range: { from, to },
    };
  }

  // O(1): direct access by id; enforce ownership unless admin/super
  async getByIdFor(userId: string, id: string, isAdmin: boolean) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return order;
  }

  private async assertProduct(productId: string): Promise<Product> {
    const prod = await this.productRepo.findOne({ where: { id: productId } });
    if (!prod) throw new NotFoundException('Product not found');
    if (!prod.isActive) throw new BadRequestException('Product inactive');
    return prod;
  }

  // Transaction: create order from cart items provided
  async createDirect(userId: string, dto: CreateDirectOrderDto) {
    const prod = await this.assertProduct(dto.productId);
    if (dto.quantity <= 0)
      throw new BadRequestException('Quantity must be > 0');

    return await this.dataSource.transaction(async (manager) => {
      // build order
      const order = manager.create(Order, {
        userId,
        total: Number(prod.price) * dto.quantity,
        status: OrderStatus.PENDING,
      });
      await manager.save(order);

      const item = manager.create(OrderItem, {
        orderId: order.id,
        productId: prod.id,
        quantity: dto.quantity,
        unitPrice: Number(prod.price),
        name: prod.name,
        image: prod.image,
        totalPrice: Number(prod.price) * dto.quantity,
      } as any);
      await manager.save(item);

      // reload with items
      const withItems = await manager.findOne(Order, {
        where: { id: order.id },
        relations: ['items'],
      });
      return withItems!;
    });
  }

  // Convert existing cart (items already priced in cart) into an order (atomic)
  async createFromCart(
    userId: string,
    cart: {
      items: Array<{ productId: string; quantity: number; price: number }>;
      total: number;
    },
  ) {
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    return await this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        userId,
        total: Number(cart.total),
        status: OrderStatus.PENDING,
      });
      await manager.save(order);

      for (const it of cart.items) {
        const prod = await manager.findOne(Product, {
          where: { id: it.productId },
        });
        if (!prod) throw new NotFoundException('Product not found in cart');
        const item = manager.create(OrderItem, {
          orderId: order.id,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: Number(it.price),
          name: prod.name,
          image: prod.image,
          totalPrice: Number(it.price) * it.quantity,
        } as any);
        await manager.save(item);
      }

      const withItems = await manager.findOne(Order, {
        where: { id: order.id },
        relations: ['items'],
      });
      return withItems!;
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    await this.orderRepo.save(order);
    return order;
  }

  // ===== Admin Dashboard: stats (O(1) using aggregate queries)
  async adminDashboardStats() {
    // total revenue: sum of totals for paid/delivered equivalents
    const revStatuses: OrderStatus[] = [
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    const revenueRow = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.status IN (:...sts)', { sts: revStatuses })
      .getRawOne<{ sum: string }>();
    const totalRevenue = Number(revenueRow?.sum ?? 0);

    const ordersRow = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'cnt')
      .getRawOne<{ cnt: string }>();
    const totalOrders = Number(ordersRow?.cnt ?? 0);

    const productsRow = await this.productRepo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'cnt')
      .where('p.isActive = :act', { act: true })
      .getRawOne<{ cnt: string }>();
    const totalProducts = Number(productsRow?.cnt ?? 0);

    const clientsRow = await this.userRepo
      .createQueryBuilder('u')
      .select('COUNT(*)', 'cnt')
      .where('u.role = :role', { role: Role.USER })
      .getRawOne<{ cnt: string }>();
    const totalClients = Number(clientsRow?.cnt ?? 0);

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      products: totalProducts,
      clients: totalClients,
    };
  }

  // ===== Admin Dashboard: latest 4 orders (O(1) with index + limit)
  async adminDashboardLatestOrders() {
    type Row = {
      id: string;
      userId: string;
      status: OrderStatus;
      total: string;
      createdAt: Date;
      userEmail: string;
      userName: string | null;
    };
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoin('o.user', 'u')
      .select([
        'o.id AS id',
        'o.userId AS userId',
        'o.status AS status',
        'o.total AS total',
        'o.createdAt AS createdAt',
        'u.email AS userEmail',
        'u.name AS userName',
      ])
      .orderBy('o.createdAt', 'DESC')
      .take(4);

    const rows = await qb.getRawMany<Row>();
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      status: r.status,
      total: Number(r.total),
      user: { email: r.userEmail, name: r.userName },
      createdAt: r.createdAt,
    }));
  }

  // ===== Admin: list with pagination and optional status filter (O(1) with index on status)
  async adminList(dto: AdminListOrdersDto) {
    const page = Math.max(dto.page ?? 1, 1);
    const limit = Math.min(Math.max(dto.limit ?? 25, 1), 100);
    type RawRow = {
      id: string;
      userId: string;
      status: OrderStatus;
      total: string;
      createdAt: Date;
      updatedAt: Date;
      userEmail: string;
      userName: string | null;
    };
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoin('o.user', 'u')
      .select([
        'o.id AS id',
        'o.userId AS userId',
        'o.status AS status',
        'o.total AS total',
        'o.createdAt AS createdAt',
        'o.updatedAt AS updatedAt',
        'u.email AS userEmail',
        'u.name AS userName',
      ])
      .orderBy('o.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);
    if (dto.status) qb.andWhere('o.status = :status', { status: dto.status });

    const rows = await qb.getRawMany<RawRow>();
    const cntRow = await qb
      .clone()
      .select('COUNT(*)', 'cnt')
      .getRawOne<{ cnt: string }>();
    const total = Number(cntRow?.cnt ?? 0);

    return {
      data: rows.map((r: RawRow) => ({
        id: r.id,
        userId: r.userId,
        status: r.status,
        total: Number(r.total),
        user: { email: r.userEmail, name: r.userName },
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      page,
      limit,
      total,
    };
  }

  // ===== Admin: search by id/email/name/createdAt (O(1) via indexed columns + LIKE)
  async adminSearch(dto: AdminSearchOrdersDto) {
    const page = Math.max(dto.page ?? 1, 1);
    const limit = Math.min(Math.max(dto.limit ?? 25, 1), 100);
    const q = (dto.q ?? '').trim();

    type RawRow = {
      id: string;
      userId: string;
      status: OrderStatus;
      total: string;
      createdAt: Date;
      updatedAt: Date;
      userEmail: string;
      userName: string | null;
    };
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoin('o.user', 'u')
      .select([
        'o.id AS id',
        'o.userId AS userId',
        'o.status AS status',
        'o.total AS total',
        'o.createdAt AS createdAt',
        'o.updatedAt AS updatedAt',
        'u.email AS userEmail',
        'u.name AS userName',
      ])
      .orderBy('o.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (q) {
      qb.andWhere(
        '(o.id LIKE :q OR u.email LIKE :q OR u.name LIKE :q OR DATE(o.createdAt) = :qd)',
        { q: `%${q}%`, qd: q },
      );
    }

    const rows = await qb.getRawMany<RawRow>();
    const cntRow = await qb
      .clone()
      .select('COUNT(*)', 'cnt')
      .getRawOne<{ cnt: string }>();
    const total = Number(cntRow?.cnt ?? 0);

    return {
      data: rows.map((r: RawRow) => ({
        id: r.id,
        userId: r.userId,
        status: r.status,
        total: Number(r.total),
        user: { email: r.userEmail, name: r.userName },
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      page,
      limit,
      total,
    };
  }

  // ===== Admin: export PDF (graceful fallback if pdfkit unavailable)
  async adminExportPdf(): Promise<Buffer> {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    try {
      // Dynamic import; types may be missing in dev without @types
      const PDFKitMod: any = await import('pdfkit');
      const PDFDocument: any = PDFKitMod?.default ?? PDFKitMod;
      const orders = await this.orderRepo.find({ relations: ['items'] });

      const doc: any = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      const done = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
      });

      // Header
      doc
        .fontSize(18)
        .text('KARKACHI PHONE - Orders Export', { align: 'center' });
      doc.moveDown();

      for (const o of orders) {
        doc
          .fontSize(12)
          .text(`Order: ${o.id}`)
          .text(`User: ${o.userId}`)
          .text(`Status: ${o.status}`)
          .text(`Total: ${Number(o.total).toFixed(2)} MAD`)
          .text(`Created: ${o.createdAt.toISOString()}`);
        doc.moveDown(0.5).text('Items:', { underline: true });
        doc.moveDown(0.25);
        for (const it of o.items ?? []) {
          doc.text(
            `- ${it.name} x${it.quantity} @ ${Number(it.unitPrice).toFixed(2)} = ${Number(it.totalPrice).toFixed(2)} MAD`,
          );
        }
        doc.moveDown();
      }

      doc.end();
      return await done;
    } catch {
      throw new BadRequestException('PDF export not available: install pdfkit');
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }
}
