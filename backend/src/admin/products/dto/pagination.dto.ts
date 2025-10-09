import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsString, IsUUID } from 'class-validator';

export class AdminProductsPaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 25;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  isActive?: string;
}
