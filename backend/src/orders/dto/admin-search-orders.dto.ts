import { IsInt, IsOptional, Max, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminSearchOrdersDto {
  @IsString()
  @IsOptional()
  q?: string; // order id, user email/name, etc.

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 25;
}
