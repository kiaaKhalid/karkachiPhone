import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  PublicBrandsService,
  PublicBrandLogo,
  PublicBrandDetails,
} from './public-brands.service';

@ApiTags('Public - Brands')
@Controller('api/public/brands')
export class PublicBrandsController {
  constructor(private readonly service: PublicBrandsService) {}

  @ApiOperation({ summary: 'Lister les logos des marques (public)' })
  @ApiResponse({ status: 200, description: 'Liste {id, name, logoUrl}' })
  @Get('logo')
  async listLogos(): Promise<{
    success: true;
    message: string;
    data: PublicBrandLogo[];
  }> {
    const data = await this.service.listLogos();
    return { success: true, message: 'OK', data } as const;
  }

  @ApiOperation({ summary: "Détails d'une marque par ID (public)" })
  @ApiResponse({
    status: 200,
    description: 'Détails de la marque {id, name, logoUrl, description}',
  })
  @ApiResponse({ status: 404, description: 'Marque non trouvée' })
  @Get(':id')
  async getBrand(
    @Param('id') id: string,
  ): Promise<{ success: true; message: string; data: PublicBrandDetails }> {
    const data = await this.service.getBrandById(id);
    return { success: true, message: 'OK', data } as const;
  }
}
