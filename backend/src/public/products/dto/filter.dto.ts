import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class PublicProductsFilterDto {
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
