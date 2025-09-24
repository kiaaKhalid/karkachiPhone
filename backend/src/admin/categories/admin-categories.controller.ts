/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/categories')
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}

  @ApiOperation({ summary: 'Activer une catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie activée' })
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.service.activate(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Désactiver une catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie désactivée' })
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    await this.service.deactivate(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Lister les catégories  (pagination)' })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des catégories ',
  })
  @Get()
  async listCategorie(@Query() { page, limit }: PaginationDto) {
    return await this.service.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Récupérer le prochain sortOrder pour une nouvelle catégorie',
  })
  @ApiResponse({
    status: 200,
    description: 'Prochain sortOrder disponible',
    schema: {
      example: { nextSortOrder: 5 },
    },
  })
  @Get('next-order')
  async getNextSortOrder(): Promise<{ nextSortOrder: number }> {
    const lastCategory = await this.service.findLastOrder();
    const nextSortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;
    return { nextSortOrder };
  }

  @ApiOperation({ summary: 'Récupérer une catégorie par ID' })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiOperation({ summary: 'Créer une catégorie' })
  @ApiResponse({ status: 201, description: 'Catégorie créée' })
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie mise à jour' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }
}
