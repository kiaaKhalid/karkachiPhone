import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class ChangeRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'role must be a valid Role enum value' })
  role: Role;
}
