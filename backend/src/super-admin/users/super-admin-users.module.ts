import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { SuperAdminUsersController } from './super-admin-users.controller';
import { SuperAdminUsersService } from './super-admin-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [SuperAdminUsersController],
  providers: [SuperAdminUsersService],
})
export class SuperAdminUsersModule {}
