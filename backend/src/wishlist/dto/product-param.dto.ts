import { IsUUID } from 'class-validator';

export class WishlistProductParamDto {
  @IsUUID()
  id!: string;
}
