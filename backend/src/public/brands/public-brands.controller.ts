import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicBrandsService, PublicBrandLogo } from './public-brands.service';

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
}
