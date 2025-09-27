import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';
import { ListUsersQueryDto } from './dto/list-users.query.dto';

export type PublicUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'name'
  | 'role'
  | 'avatarUrl'
  | 'phone'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;

@Injectable()
export class SuperAdminUsersService {
  private readonly logger = new Logger(SuperAdminUsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async activate(id: string): Promise<void> {
    const res = await this.usersRepo.update({ id }, { isActive: true });
    if (!res.affected) throw new NotFoundException('User not found');
  }

  async findAllWithFilters(q: ListUsersQueryDto): Promise<{
    items: PublicUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.max(1, q.limit ?? 10);
    const offset = (page - 1) * limit;

    const qb = this.usersRepo
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.email',
        'u.name',
        'u.role',
        'u.avatarUrl',
        'u.phone',
        'u.isActive',
        'u.createdAt',
        'u.updatedAt',
      ]);

    if (q.role) {
      qb.andWhere('u.role = :role', { role: q.role });
    }
    if (q.status === 'true') {
      qb.andWhere('u.isActive = :ia', { ia: true });
    } else if (q.status === 'false') {
      qb.andWhere('u.isActive = :ia', { ia: false });
    }
    if (q.search && q.search.trim().length > 0) {
      const term = `%${q.search.trim().toLowerCase()}%`;
      qb.andWhere('(LOWER(u.email) LIKE :term OR LOWER(u.name) LIKE :term)', {
        term,
      });
    }

    const sortBy = q.sortBy ?? 'createdAt';
    const sortOrder: 'ASC' | 'DESC' = (q.sortOrder ?? 'desc').toUpperCase() as
      | 'ASC'
      | 'DESC';
    qb.orderBy(`u.${sortBy}`, sortOrder);

    qb.skip(offset).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { items, total, page, limit, totalPages };
  }

  async desactivate(id: string): Promise<void> {
    const res = await this.usersRepo.update({ id }, { isActive: false });
    if (!res.affected) throw new NotFoundException('User not found');
  }

  async findAll(
    limit = 10,
    offset = 0,
  ): Promise<{
    items: PublicUser[];
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  }> {
    const [items, total] = await this.usersRepo.findAndCount({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {},
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
    return { items, total, limit, offset, totalPages };
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.usersRepo.findOne({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const entity = this.usersRepo.create({
      email: dto.email.toLowerCase(),
      name: dto.name ?? '',
      password: passwordHash,
      role: dto.role,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.usersRepo.save(entity);
    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const patch: Partial<User> = {};
    if (dto.email !== undefined) patch.email = dto.email.toLowerCase();
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.role !== undefined) patch.role = dto.role;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;

    if (dto.password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      patch.password = await bcrypt.hash(dto.password, salt);
    }

    const res = await this.usersRepo.update({ id }, patch);
    if (!res.affected) throw new NotFoundException('User not found');
    return this.findById(id);
  }

  async changeRole(params: {
    id: string;
    newRole: Role;
    actorId: string;
    actorIp?: string | null;
  }): Promise<{ user: PublicUser; oldRole: Role; newRole: Role }> {
    const { id, newRole, actorId, actorIp } = params;
    // Read current user role (indexed PK lookup)
    const current = await this.usersRepo.findOne({
      select: { id: true, role: true },
      where: { id },
    });
    if (!current) throw new NotFoundException('User not found');

    const oldRole = current.role;
    if (oldRole === newRole) {
      // No-op: return current user with minimal fields
      const user = await this.findById(id);
      return { user, oldRole, newRole };
    }

    // Safety: prevent demoting the last SUPER_ADMIN
    if (oldRole === Role.SUPER_ADMIN && newRole !== Role.SUPER_ADMIN) {
      const count = await this.usersRepo.count({
        where: { role: Role.SUPER_ADMIN },
      });
      if (count <= 1) {
        throw new ForbiddenException(
          'Cannot remove role from the last SUPER_ADMIN',
        );
      }
    }

    // Minimal O(1) update on single column
    await this.usersRepo.update({ id }, { role: newRole });

    // Audit log
    this.logger.log(
      `Role change: userId=${id} ${oldRole} -> ${newRole} by actor=${actorId} ip=${actorIp ?? 'unknown'}`,
    );

    const user = await this.findById(id);
    return { user, oldRole, newRole };
  }
}
