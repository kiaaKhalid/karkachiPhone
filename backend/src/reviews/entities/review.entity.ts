import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Min, Max } from 'class-validator';

@Entity('reviews')
@Index(['productId'])
@Index(['userId'])
@Index(['productId', 'isVerified'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('tinyint')
  @Min(1)
  @Max(5)
  rating: number;

  @Column('text')
  comment: string;

  @ManyToOne(() => User, (user) => user.reviews, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'char', length: 36 })
  userId: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'char', length: 36 })
  productId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean', nullable: true, default: null })
  isVerified: boolean | null;
}
