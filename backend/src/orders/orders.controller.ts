import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { CartsService, CartSummary } from '../carts/carts.service';

@ApiTags('Person - Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN, Role.LIVREUR)
@Controller('api/person/orders')
export class OrdersController {
  constructor(
    private readonly service: OrdersService,
    private readonly cartsService: CartsService,
  ) {}

  // 7. Create order from cart
  @ApiOperation({ summary: 'Créer une commande à partir du panier' })
  @Post('from-cart')
  async fromCart(@CurrentUser('id') userId: string) {
    const cart: CartSummary = await this.cartsService.getCart(userId);
    const order = await this.service.createFromCart(userId, {
      items: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      total: cart.total,
    });
    // Optionally clear cart after creating order
    await this.cartsService.clear(userId);
    return { success: true as const, message: 'OK', data: order };
  }

  // 8. Create direct order for a single product
  @ApiOperation({ summary: 'Créer une commande directe pour un produit' })
  @Post()
  async createDirect(
    @Body() dto: CreateDirectOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    const order = await this.service.createDirect(userId, dto);
    return { success: true as const, message: 'OK', data: order };
  }

  // 9. List my orders
  @ApiOperation({ summary: 'Lister mes commandes' })
  @Get()
  async listMine(@CurrentUser('id') userId: string) {
    const orders = await this.service.listMy(userId);
    return { success: true as const, message: 'OK', data: orders };
  }

  // 10. Get order details
  @ApiOperation({ summary: 'Voir les détails d’une commande' })
  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;
    const order = await this.service.getByIdFor(userId, id, isAdmin);
    return { success: true as const, message: 'OK', data: order };
  }

  // 11. Update order status (ADMIN only)
  @ApiOperation({ summary: 'Mettre à jour le statut de la commande' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.service.updateStatus(id, dto.status);
    return { success: true as const, message: 'OK', data: order };
  }
}
