import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class ListUsersQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsIn(['true', 'false'])
  status?: 'true' | 'false'; // maps to isActive

  @IsOptional()
  @IsIn(['createdAt', 'email', 'name'])
  sortBy?: 'createdAt' | 'email' | 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
