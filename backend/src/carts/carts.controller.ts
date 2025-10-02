import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { AddCartItemDto } from './dto/add-item.dto';
import { AddManyCartItemsDto } from './dto/add-many.dto';
import { UpdateCartItemDto } from './dto/update-item.dto';

@ApiTags('Person - Cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN, Role.LIVREUR)
@Controller('api/person/cart')
export class CartsController {
  constructor(private readonly service: CartsService) {}

  @ApiOperation({ summary: 'Voir panier utilisateur connecté' })
  @Get()
  async getMine(@CurrentUser('id') userId: string) {
    const data = await this.service.getCart(userId);
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({ summary: 'Ajouter un produit au panier' })
  @Post('items')
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.service.addItem(userId, dto);
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({ summary: 'Ajouter plusieurs produits au panier' })
  @Post('items/all')
  async addMany(
    @Body() dto: AddManyCartItemsDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.service.addMany(userId, dto.items);
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({ summary: 'Modifier la quantité d’un produit dans le panier' })
  @Patch('items/:id')
  async updateQty(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.service.updateItemQuantity(
      userId,
      id,
      dto.quantity,
    );
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({ summary: 'Supprimer un produit du panier' })
  @Delete('items/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.service.removeItem(userId, id);
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({ summary: 'Vider le panier de l’utilisateur connecté' })
  @Delete('clear')
  async clear(@CurrentUser('id') userId: string) {
    const data = await this.service.clear(userId);
    return { success: true as const, message: 'OK', data };
  }
}
