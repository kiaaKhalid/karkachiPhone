import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { User } from './entities/user.entity';
import { AuthProvider } from './entities/auth-provider.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async createUser(params: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
  }): Promise<User> {
    const { email, password, name = '', role = Role.USER } = params;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = this.usersRepo.create({
      email: email.toLowerCase(),
      name,
      password: passwordHash,
      role,
      isActive: true,
    });
    return this.usersRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async setRefreshToken(
    userId: string,
    hashedRt: string | null,
  ): Promise<void> {
    await this.usersRepo.update({ id: userId }, { refreshToken: hashedRt });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async findOrCreateOAuthUser(params: {
    provider: AuthProvider;
    email: string;
    name?: string;
    avatarUrl?: string | null;
    emailVerified?: boolean;
  }): Promise<User> {
    const {
      provider,
      email,
      name = '',
      avatarUrl = null,
      emailVerified,
    } = params;
    const existing = await this.findByEmail(email);
    if (existing) {
      // Ensure provider is set and user active
      if (existing.authProvider !== provider) {
        existing.authProvider = provider;
      }
      if (typeof emailVerified === 'boolean') {
        existing.isEmailVerified = emailVerified;
      }
      if (!existing.name && name) existing.name = name;
      if (!existing.avatarUrl && avatarUrl) existing.avatarUrl = avatarUrl;
      existing.isActive = true;
      return this.usersRepo.save(existing);
    }

    const user = this.usersRepo.create({
      email: email.toLowerCase(),
      name,
      avatarUrl,
      password: null,
      role: Role.USER,
      isActive: true,
      isEmailVerified: Boolean(emailVerified),
      authProvider: provider,
    });
    return this.usersRepo.save(user);
  }
}
