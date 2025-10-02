import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OrdersService } from './orders.service';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { AnalyticsQueryDto, AnalyticsPeriod } from './dto/analytics-period.dto';

@ApiTags('Admin - Analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly service: OrdersService) {}

  @ApiOperation({
    summary: 'Statistiques globales par période (avec croissance)',
  })
  @Get('static')
  @RateLimit({ refillRatePerSec: 1, burstCapacity: 30 })
  async static(@Query() dto: AnalyticsQueryDto) {
    const period = dto.period ?? AnalyticsPeriod.LAST_30_DAYS;
    const data = await this.service.adminAnalyticsStatic(period);
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({
    summary:
      'Données graphiques (revenus, top produits, statuts, clients) par période',
  })
  @Get('graph')
  @RateLimit({ refillRatePerSec: 1, burstCapacity: 30 })
  async graph(@Query() dto: AnalyticsQueryDto) {
    const period = dto.period ?? AnalyticsPeriod.LAST_30_DAYS;
    const data = await this.service.adminAnalyticsGraph(period);
    return { success: true as const, message: 'OK', data };
  }
}
