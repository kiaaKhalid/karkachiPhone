import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateDirectOrderDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
