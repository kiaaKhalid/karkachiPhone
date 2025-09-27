import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ReviewsService } from '../reviews.service';
import { ReviewsPaginationDto } from '../dto/pagination.dto';

@ApiTags('Admin - Reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/reviews')
export class AdminReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @ApiOperation({ summary: 'Marquer une review comme vérifiée' })
  @Patch(':id/verified')
  async verify(@Param('id') id: string) {
    await this.service.setVerified(id, true);
    return { success: true as const, message: 'Verified', data: null };
  }

  @ApiOperation({ summary: 'Marquer une review comme non vérifiée' })
  @Patch(':id/not-verified')
  async notVerified(@Param('id') id: string) {
    await this.service.setVerified(id, false);
    return { success: true as const, message: 'Not Verified', data: null };
  }

  @ApiOperation({ summary: 'Lister toutes les reviews (pagination)' })
  @Get()
  async list(@Query() { page, limit }: ReviewsPaginationDto) {
    const data = await this.service.adminList({ page, limit });
    return { success: true as const, message: 'OK', data };
  }
}
