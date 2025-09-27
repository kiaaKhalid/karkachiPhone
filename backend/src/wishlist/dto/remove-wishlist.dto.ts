import { IsUUID } from 'class-validator';

export class RemoveWishlistDto {
  @IsUUID()
  productId!: string;
}
