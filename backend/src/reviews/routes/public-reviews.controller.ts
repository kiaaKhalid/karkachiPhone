import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from '../reviews.service';
import { ReviewsPaginationDto } from '../dto/pagination.dto';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('Public - Reviews')
@Controller('api/public/reviews')
export class PublicReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @ApiOperation({ summary: 'Reviews vérifiées pour un produit (public)' })
  @Get('products/:productId')
  async listByProduct(
    @Param('productId') productId: string,
    @Query() { page, limit }: ReviewsPaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.service.publicListByProduct(
      productId,
      { page, limit },
      userId,
    );
    return { success: true as const, message: 'OK', data };
  }
}
