import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class SearchProductsDto {
  @IsString()
  @IsNotEmpty()
  q!: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;
}
