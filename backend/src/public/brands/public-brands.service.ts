import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

export type PublicBrandLogo = { id: string; name: string; logoUrl: string };

export type PublicBrandDetails = {
  id: string;
  name: string;
  logoUrl: string;
  description: string | null;
};

@Injectable()
export class PublicBrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  async getBrandById(id: string): Promise<PublicBrandDetails> {
    const brand = await this.repo.findOne({
      select: ['id', 'name', 'logo', 'description'],
      where: { id, isActive: true },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const { logo, ...rest } = brand;
    return { ...rest, logoUrl: logo };
  }

  async listLogos(): Promise<PublicBrandLogo[]> {
    const rows = await this.repo.find({
      select: { id: true, name: true, logo: true },
      where: { isActive: true },
      order: { name: 'ASC' },
      take: 1000, // safety cap
    });
    return rows.map((b) => ({ id: b.id, name: b.name, logoUrl: b.logo }));
  }
}
