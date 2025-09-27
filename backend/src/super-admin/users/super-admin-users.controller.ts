import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { SuperAdminUsersService } from './super-admin-users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { RateLimit } from '../../rate-limit/rate-limit.decorator';
import type { Request } from 'express';
import { ListUsersQueryDto } from './dto/list-users.query.dto';

@ApiTags('Super Admin - Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('api/super-admin/users')
export class SuperAdminUsersController {
  constructor(private readonly service: SuperAdminUsersService) {}

  @ApiOperation({ summary: 'Activer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur activé' })
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.service.activate(id);
    return { success: true, message: 'User activated', data: null } as const;
  }

  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur désactivé' })
  @Patch(':id/desactivate')
  async desactivate(@Param('id') id: string) {
    await this.service.desactivate(id);
    return { success: true, message: 'User deactivated', data: null } as const;
  }

  @ApiOperation({ summary: 'Lister les utilisateurs (filtrage & pagination)' })
  @ApiResponse({ status: 200, description: 'Liste paginée des utilisateurs' })
  @Get()
  async list(@Query() q: ListUsersQueryDto) {
    const result = await this.service.findAllWithFilters(q);
    return { success: true, message: 'OK', data: result } as const;
  }

  @ApiOperation({ summary: "Détails d'un utilisateur par ID" })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.service.findById(id);
    return { success: true, message: 'OK', data: user } as const;
  }

  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé' })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.service.create(dto);
    return { success: true, message: 'Created', data: user } as const;
  }

  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.service.update(id, dto);
    return { success: true, message: 'Updated', data: user } as const;
  }

  @ApiOperation({ summary: "Changer le rôle d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour' })
  @Patch(':id/role')
  @RateLimit({
    refillRatePerSec: 0.166,
    burstCapacity: 10,
    keyStrategy: 'user',
  }) // ~10 req/min
  async changeRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ChangeRoleDto,
    @Req() req: Request & { user?: { sub?: string } },
  ) {
    const actorId = req.user?.sub ?? 'unknown';
    const actorIp =
      (req.headers['x-forwarded-for'] as string) ||
      (req.socket?.remoteAddress as string) ||
      undefined;
    const result = await this.service.changeRole({
      id,
      newRole: dto.role,
      actorId: String(actorId),
      actorIp: actorIp ?? null,
    });
    return {
      success: true,
      message: 'Role updated',
      data: result,
    } as const;
  }
}
