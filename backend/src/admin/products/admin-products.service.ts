import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { ProductSpec } from '../../products/entities/product-spec.entity';
import {
  CreateProductDto,
  CreateProductImageDto,
  CreateProductSpecDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Brand) private readonly brands: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async findAll(
    limit = 25,
    offset = 0,
    filters: {
      q?: string;
      brandId?: string;
      categoryId?: string;
      isActive?: boolean;
    },
  ) {
    const qb = this.products
      .createQueryBuilder('p')
      .leftJoin('p.brand', 'brand'); // jointure pour récupérer le nom de la marque

    // Sélection des champs du produit + brand name
    qb.select([
      'p.id',
      'p.name',
      'p.description',
      'p.price',
      'p.stock',
      'p.rating',
      'p.image',
      'p.isActive',
      'p.brandId',
      'p.categoryId',
      'p.createdAt',
      'brand.name', // ajoute le nom de la marque
    ]);

    // Filtres
    if (filters.q) {
      qb.andWhere('(p.name LIKE :q OR p.description LIKE :q)', {
        q: `%${filters.q}%`,
      });
    }
    if (filters.brandId) {
      qb.andWhere('p.brandId = :brandId', { brandId: filters.brandId });
    }
    if (filters.categoryId) {
      qb.andWhere('p.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }
    if (typeof filters.isActive === 'boolean') {
      qb.andWhere('p.isActive = :isActive', { isActive: filters.isActive });
    }

    qb.orderBy('p.createdAt', 'DESC');

    // Pagination
    const [items, total] = await qb
      .take(Math.max(1, limit))
      .skip(Math.max(0, offset))
      .getManyAndCount();

    // Réponse finale avec brandName
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        rating: item.rating,
        image: item.image,
        isActive: item.isActive,
        brandId: item.brandId,
        brandName: item.brand?.name, // ici on récupère le nom de la marque
        categoryId: item.categoryId,
        createdAt: item.createdAt,
      })),
      total,
      limit: Math.max(1, limit),
      offset: Math.max(0, offset),
    } as const;
  }

  // O(1): single query with relations to fetch the full product details
  async findOneFull(id: string) {
    const product = await this.products.findOne({
      where: { id },
      relations: ['images', 'specs', 'brand', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // Vérifier existence du brand et category
      const brand = await qr.manager.findOne(Brand, {
        where: { id: dto.brandId },
      });
      if (!brand) throw new NotFoundException('Brand not found');

      const category = await qr.manager.findOne(Category, {
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');

      // 1️⃣ Créer le produit principal
      const product = qr.manager.create(Product, {
        ...dto,
        flashStartsAt: dto.flashStartsAt ? new Date(dto.flashStartsAt) : null,
        flashEndsAt: dto.flashEndsAt ? new Date(dto.flashEndsAt) : null,
      });

      const savedProduct = await qr.manager.save(Product, product);

      // 2️⃣ Créer les images associées (si fournies)
      if (dto.images?.length) {
        const images = dto.images.map((img) =>
          qr.manager.create(ProductImage, {
            url: img.url,
            productId: savedProduct.id,
          }),
        );
        await qr.manager.save(ProductImage, images);
      }

      // 3️⃣ Créer les spécifications associées (si fournies)
      if (dto.specs?.length) {
        const specs = dto.specs.map((spec) =>
          qr.manager.create(ProductSpec, {
            key: spec.key,
            value: spec.value,
            productId: savedProduct.id,
          }),
        );
        await qr.manager.save(ProductSpec, specs);
      }

      // 4️⃣ Incrémenter les compteurs
      await qr.manager.increment(Brand, { id: dto.brandId }, 'productCount', 1);
      await qr.manager.increment(
        Category,
        { id: dto.categoryId },
        'productCount',
        1,
      );

      // 5️⃣ Commit final
      await qr.commitTransaction();

      this.logger.log(`✅ Product created: ${savedProduct.id}`);
      return savedProduct;
    } catch (e: unknown) {
      await qr.rollbackTransaction();

      if (e instanceof Error) {
        this.logger.error(`❌ Product creation failed: ${e.message}`);
      } else {
        this.logger.error('❌ Product creation failed: Unknown error');
      }

      throw e;
    } finally {
      await qr.release();
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const existing = await qr.manager.findOne(Product, {
        where: { id },
      });
      if (!existing) throw new NotFoundException('Product not found');

      // Validate brand/category if they are changing
      if (dto.brandId && dto.brandId !== existing.brandId) {
        const brand = await qr.manager.findOne(Brand, {
          where: { id: dto.brandId },
        });
        if (!brand) throw new NotFoundException('Brand not found');
      }
      if (dto.categoryId && dto.categoryId !== existing.categoryId) {
        const category = await qr.manager.findOne(Category, {
          where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException('Category not found');
      }

      // Update scalar fields only
      const imagesDto: CreateProductImageDto[] | undefined = dto.images;
      const specsDto: CreateProductSpecDto[] | undefined = dto.specs;

      const toSave: Product = qr.manager.create(Product, { ...existing });

      if (dto.name !== undefined) toSave.name = dto.name;
      if (dto.description !== undefined) toSave.description = dto.description;
      if (dto.price !== undefined) toSave.price = dto.price;
      if (dto.originalPrice !== undefined)
        toSave.originalPrice = dto.originalPrice;
      if (dto.image !== undefined) toSave.image = dto.image;
      if (dto.stock !== undefined) toSave.stock = dto.stock;
      if (dto.rating !== undefined) toSave.rating = dto.rating;
      if (dto.isActive !== undefined) toSave.isActive = dto.isActive;
      if (dto.isFeatured !== undefined) toSave.isFeatured = dto.isFeatured;
      if (dto.reviewsCount !== undefined)
        toSave.reviewsCount = dto.reviewsCount;
      if (dto.isNew !== undefined) toSave.isNew = dto.isNew;
      if (dto.isBestSeller !== undefined)
        toSave.isBestSeller = dto.isBestSeller;
      if (dto.discount !== undefined) toSave.discount = dto.discount;
      if (dto.isFlashDeal !== undefined) toSave.isFlashDeal = dto.isFlashDeal;
      if (dto.flashPrice !== undefined) toSave.flashPrice = dto.flashPrice;
      if (dto.flashStartsAt === undefined) {
        toSave.flashStartsAt = existing.flashStartsAt ?? null;
      } else {
        toSave.flashStartsAt = dto.flashStartsAt
          ? new Date(dto.flashStartsAt)
          : null;
      }
      if (dto.flashEndsAt === undefined) {
        toSave.flashEndsAt = existing.flashEndsAt ?? null;
      } else {
        toSave.flashEndsAt = dto.flashEndsAt ? new Date(dto.flashEndsAt) : null;
      }
      if (dto.flashStock !== undefined) toSave.flashStock = dto.flashStock;
      if (dto.isPromotionalBanner !== undefined)
        toSave.isPromotionalBanner = dto.isPromotionalBanner;
      if (dto.isPromotional !== undefined)
        toSave.isPromotional = dto.isPromotional;
      if (dto.isProductphares !== undefined)
        toSave.isProductphares = dto.isProductphares;
      if (dto.isProductFlash !== undefined)
        toSave.isProductFlash = dto.isProductFlash;
      if (dto.brandId !== undefined) toSave.brandId = dto.brandId;
      if (dto.categoryId !== undefined) toSave.categoryId = dto.categoryId;

      await qr.manager.save(Product, toSave);

      // Replace images if provided (including deletions)
      if (imagesDto !== undefined) {
        await qr.manager.delete(ProductImage, { productId: id });
        if (imagesDto.length > 0) {
          const images = imagesDto.map((i) =>
            qr.manager.create(ProductImage, { url: i.url, productId: id }),
          );
          await qr.manager.save(ProductImage, images);
        }
      }

      // Replace specs if provided (including deletions)
      if (specsDto !== undefined) {
        await qr.manager.delete(ProductSpec, { productId: id });
        if (specsDto.length > 0) {
          const specs = specsDto.map((s) =>
            qr.manager.create(ProductSpec, {
              key: s.key,
              value: s.value,
              productId: id,
            }),
          );
          await qr.manager.save(ProductSpec, specs);
        }
      }

      await qr.commitTransaction();
      this.logger.log(`Product updated: ${id} by admin`);
      return await this.products.findOne({ where: { id } });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async setActive(id: string, active: boolean) {
    const res = await this.products.update({ id }, { isActive: active });
    if (res.affected === 0) throw new NotFoundException('Product not found');
    this.logger.log(
      `Product ${active ? 'activated' : 'deactivated'}: ${id} by admin`,
    );
  }
}
