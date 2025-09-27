import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { PersonReviewsController } from './routes/person-reviews.controller';
import { AdminReviewsController } from './routes/admin-reviews.controller';
import { PublicReviewsController } from './routes/public-reviews.controller';
import { OwnershipGuard } from './guards/ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  controllers: [PersonReviewsController, AdminReviewsController, PublicReviewsController],
  providers: [ReviewsService, OwnershipGuard],
})
export class ReviewsModule {}
