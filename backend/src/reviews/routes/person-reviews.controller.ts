import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RateLimit } from '../../rate-limit/rate-limit.decorator';
import { ReviewsService } from '../reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { OwnershipGuard } from '../guards/ownership.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('Person - Reviews')
@UseGuards(JwtAuthGuard)
@Controller('api/person/reviews')
export class PersonReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @ApiOperation({ summary: 'Créer une review (isVerified = null)' })
  @RateLimit({ cost: 2 })
  @Post()
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser('id') userId: string,
  ) {
    if (!userId) throw new Error('User not found in request context');
    const review = await this.service.create(userId, dto);
    return { success: true as const, message: 'Created', data: review };
  }

  @ApiOperation({ summary: 'Supprimer ma review (ownership enforced)' })
  @UseGuards(OwnershipGuard)
  @RateLimit({ cost: 2 })
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    if (!userId) throw new Error('User not found in request context');
    await this.service.deleteOwn(id, userId);
    return { success: true as const, message: 'Deleted', data: null };
  }
}
