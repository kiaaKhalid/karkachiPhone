import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

export type PublicBrandLogo = { id: string; name: string; logoUrl: string };

@Injectable()
export class PublicBrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

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
