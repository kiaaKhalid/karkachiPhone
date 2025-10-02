import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AdminListOrdersDto } from './dto/admin-list-orders.dto';
import { AdminSearchOrdersDto } from './dto/admin-search-orders.dto';
import { RateLimit } from '../rate-limit/rate-limit.decorator';

@ApiTags('Admin - Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('api/admin/orders')
export class AdminOrdersController {
  constructor(private readonly service: OrdersService) {}

  @ApiOperation({
    summary: 'Lister les commandes (pagination + filtre status)',
  })
  @Get()
  @RateLimit({ refillRatePerSec: 1, burstCapacity: 60 })
  async list(@Query() dto: AdminListOrdersDto) {
    const result = await this.service.adminList(dto);
    return { success: true as const, message: 'OK', data: result };
  }

  @ApiOperation({ summary: 'Rechercher des commandes' })
  @Get('search')
  @RateLimit({ refillRatePerSec: 1, burstCapacity: 60 })
  async search(@Query() dto: AdminSearchOrdersDto) {
    const result = await this.service.adminSearch(dto);
    return { success: true as const, message: 'OK', data: result };
  }

  @ApiOperation({ summary: 'Exporter les commandes en PDF' })
  @Get('exports')
  @RateLimit({ refillRatePerSec: 1, burstCapacity: 10 })
  async export(@Res() res: Response) {
    const pdf = await this.service.adminExportPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="orders-export.pdf"',
    );
    res.send(pdf);
  }
}
