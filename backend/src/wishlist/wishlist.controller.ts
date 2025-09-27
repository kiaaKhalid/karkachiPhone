import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import { RemoveWishlistDto } from './dto/remove-wishlist.dto';
import { WishlistProductParamDto } from './dto/product-param.dto';
import { WishlistService } from './wishlist.service';

@ApiTags('Person - Wishlist')
@UseGuards(JwtAuthGuard)
@Controller('api/person')
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @ApiOperation({ summary: 'Ajouter un produit à la wishlist' })
  @Post('wishlist')
  async add(
    @Body() { productId }: AddWishlistDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.service.add(userId, productId);
    return { success: true as const, message: 'Added to wishlist', data: null };
  }

  @ApiOperation({ summary: 'Supprimer un produit de la wishlist' })
  @Delete('wishlist')
  async remove(
    @Body() { productId }: RemoveWishlistDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.service.remove(userId, productId);
    return {
      success: true as const,
      message: 'Removed from wishlist',
      data: null,
    };
  }

  @ApiOperation({ summary: 'Lister les produits de ma wishlist' })
  @Get('product/wishlist')
  async list(@CurrentUser('id') userId: string) {
    const data = await this.service.list(userId);
    return { success: true as const, message: 'OK', data: data.data };
  }

  @ApiOperation({ summary: 'Vérifier si un produit est dans ma wishlist' })
  @Get('wishlist/product/:id')
  async has(
    @Param() { id }: WishlistProductParamDto,
    @CurrentUser('id') userId: string,
  ) {
    const { data } = await this.service.has(userId, id);
    return { success: true as const, message: 'OK', data };
  }
}
