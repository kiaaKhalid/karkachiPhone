import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  PublicCategoriesService,
  PublicRootCategory,
} from './public-categories.service';

@ApiTags('Public - Categories')
@Controller('api/public/category')
export class PublicCategoriesController {
  constructor(private readonly service: PublicCategoriesService) {}

  @ApiOperation({ summary: 'Lister les catégories racines actives (public)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories (id, name, image)',
  })
  @Get('root-active')
  async getRootActive(): Promise<PublicRootCategory[]> {
    return this.service.findRootActive();
  }
}
