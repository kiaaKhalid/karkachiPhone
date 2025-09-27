import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ProductDetailImageDto {
  @IsString()
  url!: string;
}

export class ProductDetailSpecDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

export class ProductDetailDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  price!: number;

  // Map entity originalPrice -> priceOriginal in response
  @IsNumber()
  @IsOptional()
  @Expose({ name: 'priceOriginal' })
  priceOriginal?: number | null;

  @IsNumber()
  stock!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDetailImageDto)
  images!: ProductDetailImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDetailSpecDto)
  specs!: ProductDetailSpecDto[];
}

export class ProductIdParamDto {
  @IsUUID()
  id!: string;
}
