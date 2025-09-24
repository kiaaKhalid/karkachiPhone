import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { Review } from '../../reviews/entities/review.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ProductImage } from './product-image.entity';
import { ProductSpec } from './product-spec.entity';
import { Min, Max } from 'class-validator';

@Entity('products')
@Index(['categoryId'])
@Index(['brandId'])
@Index(['price'])
@Index(['isNew', 'isBestSeller'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice?: number;

  @Column({ length: 255 })
  image: string; // Image principale

  @Column('int')
  stock: number;

  @Min(1)
  @Max(5)
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('boolean', { default: false })
  isFeatured: boolean;

  @Column('int', { default: 0 })
  reviewsCount: number;

  @Column('boolean', { default: false })
  isNew: boolean;

  @Column('boolean', { default: false })
  isBestSeller: boolean;

  @Column('int', { nullable: true })
  discount?: number;

  @ManyToOne(() => Category, (category) => category.products, { eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'char', length: 36 })
  categoryId: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { eager: false })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ type: 'char', length: 36 })
  brandId: string;

  @OneToMany(() => Review, (review) => review.product, { cascade: true })
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @ManyToMany(() => Product, { cascade: true })
  @JoinTable({
    name: 'product_accessories',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'accessoryId', referencedColumnName: 'id' },
  })
  accessories: Product[];

  // Relations pour les images et specs
  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductSpec, (spec) => spec.product, { cascade: true })
  specs: ProductSpec[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
