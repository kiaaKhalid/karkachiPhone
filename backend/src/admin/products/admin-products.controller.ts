import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminProductsPaginationDto } from './dto/pagination.dto';

@ApiTags('Admin - Products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/products')
export class AdminProductsController {
  constructor(private readonly service: AdminProductsService) {}

  @ApiOperation({ summary: 'Liste des produits (pagination + filtres)' })
  @Get()
  async list(
    @Query() { limit, offset }: AdminProductsPaginationDto,
    @Query('q') q?: string,
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters = {
      q,
      brandId,
      categoryId,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
    };
    const result = await this.service.findAll(limit, offset, filters);
    return { success: true as const, message: 'OK', data: result };
  }

  @ApiOperation({ summary: "Détails d'un produit (toutes les informations)" })
  @ApiResponse({ status: 200, description: 'Produit trouvé' })
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const product = await this.service.findOneFull(id);
    return { success: true as const, message: 'OK', data: product };
  }

  @ApiOperation({ summary: 'Créer un produit' })
  @ApiResponse({ status: 201, description: 'Produit créé' })
  @Post()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.service.create(dto);
    return { success: true as const, message: 'Created', data: product };
  }

  @ApiOperation({ summary: 'Mettre à jour un produit' })
  @ApiResponse({ status: 200, description: 'Produit mis à jour' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.service.update(id, dto);
    return { success: true as const, message: 'Updated', data: product };
  }

  @ApiOperation({ summary: 'Désactiver un produit' })
  @Patch(':id/desactive')
  async desactive(@Param('id') id: string) {
    await this.service.setActive(id, false);
    return { success: true as const, message: 'Deactivated', data: null };
  }

  @ApiOperation({ summary: 'Activer un produit' })
  @Patch(':id/active')
  async active(@Param('id') id: string) {
    await this.service.setActive(id, true);
    return { success: true as const, message: 'Activated', data: null };
  }
}
