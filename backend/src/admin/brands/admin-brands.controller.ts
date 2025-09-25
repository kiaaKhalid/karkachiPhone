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
import { AdminBrandsService } from './admin-brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('Admin - Brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/brands')
export class AdminBrandsController {
  constructor(private readonly service: AdminBrandsService) {}

  @ApiOperation({ summary: 'Activer une marque' })
  @ApiResponse({ status: 200, description: 'Marque activée' })
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.service.activate(id);
    return { success: true, message: 'Brand activated', data: null } as const;
  }

  @ApiOperation({ summary: 'Désactiver une marque' })
  @ApiResponse({ status: 200, description: 'Marque désactivée' })
  @Patch(':id/desactivate')
  async desactivate(@Param('id') id: string) {
    await this.service.desactivate(id);
    return { success: true, message: 'Brand deactivated', data: null } as const;
  }

  @ApiOperation({ summary: 'Lister les marques (pagination limit/offset)' })
  @ApiResponse({ status: 200, description: 'Liste paginée des marques' })
  @Get()
  async list(@Query() { limit, offset }: PaginationDto) {
    const result = await this.service.findAll(limit, offset);
    return { success: true, message: 'OK', data: result } as const;
  }

  @ApiOperation({ summary: "Détails d'une marque par ID" })
  @ApiResponse({ status: 200, description: 'Marque trouvée' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    const brand = await this.service.findById(id);
    return { success: true, message: 'OK', data: brand } as const;
  }

  @ApiOperation({ summary: 'Créer une marque' })
  @ApiResponse({ status: 201, description: 'Marque créée' })
  @Post()
  async create(@Body() dto: CreateBrandDto) {
    const brand = await this.service.create(dto);
    return { success: true, message: 'Created', data: brand } as const;
  }

  @ApiOperation({ summary: 'Mettre à jour une marque' })
  @ApiResponse({ status: 200, description: 'Marque mise à jour' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    const brand = await this.service.update(id, dto);
    return { success: true, message: 'Updated', data: brand } as const;
  }
}
