import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @IsString()
  @IsNotEmpty()
  image!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating = 0;

  @IsBoolean()
  @OptionalBoolean()
  isActive: boolean = true;

  @IsBoolean()
  @OptionalBoolean()
  isFeatured: boolean = false;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  reviewsCount?: number;

  @IsBoolean()
  @OptionalBoolean()
  isNew: boolean = false;

  @IsBoolean()
  @OptionalBoolean()
  isBestSeller: boolean = false;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @IsBoolean()
  @OptionalBoolean()
  isFlashDeal: boolean = false;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  flashPrice?: number | null;

  @IsOptional()
  @IsDateString()
  flashStartsAt?: string | null;

  @IsOptional()
  @IsDateString()
  flashEndsAt?: string | null;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  flashStock?: number | null;

  @IsBoolean()
  @OptionalBoolean()
  isPromotionalBanner: boolean = false;

  @IsBoolean()
  @OptionalBoolean()
  isPromotional: boolean = false;

  @IsBoolean()
  @OptionalBoolean()
  isProductphares: boolean = false;

  @IsBoolean()
  @OptionalBoolean()
  isProductFlash: boolean = false;

  @IsUUID()
  brandId!: string;

  @IsUUID()
  categoryId!: string;

  // --- Related collections for O(1) transactional create ---
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSpecDto)
  specs?: CreateProductSpecDto[];
}

function OptionalBoolean(): PropertyDecorator {
  // helper decorator to allow boolean missing values to default
  return () => undefined as unknown as void;
}

export class CreateProductImageDto {
  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class CreateProductSpecDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;
}
