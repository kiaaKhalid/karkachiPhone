import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Index(['userId'])
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'char', length: 36 })
  userId!: string;

  @OneToMany(() => CartItem, (item: CartItem) => item.cart, { cascade: true })
  items!: CartItem[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total!: number;

  @Column('boolean', { default: true })
  isActive!: boolean; // panier en cours

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
