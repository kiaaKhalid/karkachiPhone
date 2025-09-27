import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('wishlists')
@Unique('UQ_wishlist_user_product', ['userId', 'productId'])
@Index(['userId'])
@Index(['productId'])
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'char', length: 36 })
  userId!: string;

  @Column({ type: 'char', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
