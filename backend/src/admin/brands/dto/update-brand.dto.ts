import { PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  slug?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'logoUrl must be a valid URL' })
  @MaxLength(255)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
