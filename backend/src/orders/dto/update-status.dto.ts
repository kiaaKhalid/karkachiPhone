import { IsEnum, IsInt, Min } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsInt()
  @Min(0)
  version!: number;

  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
