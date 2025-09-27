import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicProductsService } from './public-products.service';
import { Product } from '../../products/entities/product.entity';
import { PublicPaginationDto } from './dto/pagination.dto';
import { PublicProductsFilterDto } from './dto/filter.dto';
import { ListPublicProductsQueryDto } from './dto/list.query.dto';
import { SearchProductsDto } from './dto/search.dto';
import { ProductDetailDto, ProductIdParamDto } from './dto/product-detail.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

type PublicMany = {
  success: true;
  message: string;
  data: any[] | Product[];
};

type PublicList = {
  success: true;
  message: string;
  data: { items: Product[]; total: number; page: number; limit: number };
};

// extended filter shape accepted by service.list
// note: filters may be extended at service layer as needed

@ApiTags('Public - Products')
@Controller('api/public/products')
export class PublicProductsController {
  constructor(private readonly service: PublicProductsService) {}

  @ApiOperation({ summary: 'Produits panneau (grand) - max 3' })
  @Get('panale-big')
  async getPanelBig(): Promise<PublicMany> {
    return await this.service.findLimited({ isPromotionalBanner: true }, 3);
  }

  @ApiOperation({ summary: 'Produits panneau (petit) - max 5' })
  @Get('panale-smale')
  async getPanelSmall(): Promise<PublicMany> {
    return await this.service.findLimited({ isPromotional: true }, 3);
  }

  @ApiOperation({ summary: 'Meilleures ventes - max 3' })
  @Get('saller')
  async getBestSellers(): Promise<PublicMany> {
    return await this.service.findLimited({ isBestSeller: true }, 3);
  }

  @ApiOperation({ summary: 'Produits phares - max 6' })
  @Get('phares')
  async getPhares(): Promise<PublicMany> {
    return await this.service.findLimited(
      { isProductphares: true, isFeatured: true },
      6,
    );
  }

  @ApiOperation({ summary: 'Détail produit par ID (public)' })
  @Get(':id')
  async getById(
    @Param() { id }: ProductIdParamDto,
  ): Promise<{ success: true; message: string; data: ProductDetailDto }> {
    const data = await this.service.getPublicById(id);
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({ summary: 'Recherche rapide produits (projection minimale)' })
  @Get('search')
  async search(@Query() dto: SearchProductsDto): Promise<PublicMany> {
    return await this.service.search(dto);
  }

  @ApiOperation({ summary: 'Produits flash - max 6' })
  @Get('flash')
  async getFlash(): Promise<PublicMany> {
    return await this.service.findLimited(
      { isProductFlash: true, isFlashDeal: true },
      6,
    );
  }

  @ApiOperation({ summary: 'Liste des produits (pagination + filtres)' })
  @Get()
  async list(@Query() q: ListPublicProductsQueryDto): Promise<PublicList> {
    const { page, limit, ...filters } = q as unknown as PublicPaginationDto &
      PublicProductsFilterDto;
    return await this.service.list({ page, limit }, filters);
  }
  @ApiOperation({ summary: 'Deals (pagination + filtres)' })
  @Get('deals')
  async deals(@Query() q: ListPublicProductsQueryDto): Promise<PublicList> {
    const { page, limit, ...filters } = q as unknown as PublicPaginationDto &
      PublicProductsFilterDto;
    return await this.service.list(
      { page, limit },
      { ...filters, isFlashDeal: true },
    );
  }

  @ApiOperation({ summary: 'Produits par marque (pagination + filtres)' })
  @Get('brand/:brandId')
  async byBrand(
    @Param('brandId') brandId: string,
    @Query() q: ListPublicProductsQueryDto,
  ): Promise<PublicList> {
    const { page, limit, ...filters } = q as unknown as PublicPaginationDto &
      PublicProductsFilterDto;
    return await this.service.list({ page, limit }, { ...filters, brandId });
  }

  @ApiOperation({ summary: 'Produits par catégorie (pagination + filtres)' })
  @Get('category/:categoryId')
  async byCategory(
    @Param('categoryId') categoryId: string,
    @Query() q: ListPublicProductsQueryDto,
  ): Promise<PublicList> {
    const { page, limit, ...filters } = q as unknown as PublicPaginationDto &
      PublicProductsFilterDto;
    return await this.service.list({ page, limit }, { ...filters, categoryId });
  }
}
