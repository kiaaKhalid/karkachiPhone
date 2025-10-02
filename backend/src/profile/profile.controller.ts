import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('api/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  // GET /api/profile/info
  @Get('info')
  async getInfo(@CurrentUser('id') userId: string) {
    return this.service.getInfo(userId);
  }

  // PUT /api/profile/info
  @Put('info')
  async updateInfo(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.service.updateInfo(userId, dto);
  }

  // PATCH /api/profile/password
  @Patch('password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.service.changePassword(userId, dto);
  }

  // GET /api/profile/account-stats
  @Get('account-stats')
  async getAccountStats(@CurrentUser('id') userId: string) {
    return this.service.getAccountStats(userId);
  }
}
