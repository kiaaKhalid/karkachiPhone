import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OrdersService } from './orders.service';
import { RateLimit } from '../rate-limit/rate-limit.decorator';

@ApiTags('Admin - Dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly service: OrdersService) {}

  @ApiOperation({ summary: 'Statistiques globales (chiffres clés)' })
  @Get('static')
  @RateLimit({ refillRatePerSec: 1, burstCapacity: 30 })
  async stats() {
    const data = await this.service.adminDashboardStats();
    return { success: true as const, message: 'OK', data };
  }

  @ApiOperation({ summary: 'Dernières commandes (4 plus récentes)' })
  @Get('orders')
  @RateLimit({ refillRatePerSec: 1, burstCapacity: 30 })
  async latestOrders() {
    const data = await this.service.adminDashboardLatestOrders();
    return { success: true as const, message: 'OK', data };
  }
}
