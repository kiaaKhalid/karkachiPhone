import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

// Combined DTO for pagination + filters in a single @Query() binding
export class ListPublicProductsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  ratingMin?: number;
}
