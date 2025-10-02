import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto } from './dto/add-item.dto';

export interface CartSummary {
  cartId: string;
  items: CartItem[];
  total: number;
}

@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getOrCreateActiveCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { userId, isActive: true },
    });
    if (!cart) {
      cart = this.cartRepo.create({ userId, isActive: true, total: 0 });
      await this.cartRepo.save(cart);
    }
    return cart;
  }

  async getCart(userId: string): Promise<CartSummary> {
    const cart = await this.getOrCreateActiveCart(userId);
    const items = await this.itemRepo.find({ where: { cartId: cart.id } });
    const total = items.reduce(
      (sum, it) => sum + Number(it.price) * it.quantity,
      0,
    );
    if (Number(cart.total) !== total) {
      cart.total = total;
      await this.cartRepo.update(cart.id, { total });
    }
    return { cartId: cart.id, items, total } as CartSummary;
  }

  private async assertProduct(productId: string): Promise<Product> {
    const prod = await this.productRepo.findOne({ where: { id: productId } });
    if (!prod) throw new NotFoundException('Product not found');
    if (!prod.isActive) throw new BadRequestException('Product inactive');
    return prod;
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartSummary> {
    const cart = await this.getOrCreateActiveCart(userId);
    const prod = await this.assertProduct(dto.productId);

    // upsert item by (cartId, productId)
    let item = await this.itemRepo.findOne({
      where: { cartId: cart.id, productId: dto.productId },
    });
    if (item) {
      item.quantity += dto.quantity;
      item.price = Number(prod.price);
    } else {
      item = this.itemRepo.create({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        price: Number(prod.price),
      });
    }
    await this.itemRepo.save(item);
    return this.getCart(userId);
  }

  async addMany(userId: string, items: AddCartItemDto[]): Promise<CartSummary> {
    const cart = await this.getOrCreateActiveCart(userId);
    for (const it of items) {
      // If exists in cart, skip (do not change quantity)
      const already = await this.itemRepo.exist({
        where: { cartId: cart.id, productId: it.productId },
      });
      if (already) continue;

      // Otherwise, add new item with provided quantity
      const prod = await this.assertProduct(it.productId);
      const item = this.itemRepo.create({
        cartId: cart.id,
        productId: it.productId,
        quantity: it.quantity,
        price: Number(prod.price),
      });
      await this.itemRepo.save(item);
    }
    return this.getCart(userId);
  }

  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartSummary> {
    if (quantity <= 0) throw new BadRequestException('Quantity must be > 0');
    const cart = await this.getOrCreateActiveCart(userId);
    const item = await this.itemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Item not found');

    const prod = await this.assertProduct(item.productId);
    item.quantity = quantity;
    item.price = Number(prod.price);
    await this.itemRepo.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<CartSummary> {
    const cart = await this.getOrCreateActiveCart(userId);
    await this.itemRepo.delete({ id: itemId, cartId: cart.id });
    return this.getCart(userId);
  }

  async clear(userId: string): Promise<CartSummary> {
    // Delete ALL carts for this user (cascade will remove cart_items)
    await this.cartRepo.delete({ userId });
    // Create a fresh empty active cart to keep flow consistent
    const fresh = this.cartRepo.create({ userId, isActive: true, total: 0 });
    await this.cartRepo.save(fresh);
    return { cartId: fresh.id, items: [], total: 0 };
  }
}
