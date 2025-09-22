import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../common/enums/role.enum';

export interface UserEntity {
  id: number;
  email: string;
  passwordHash: string;
  roles: Role[];
  isActive: boolean;
}

@Injectable()
export class UsersService {
  private users: UserEntity[] = [];
  private idSeq = 1;

  constructor() {
    // Seed demo users
    this.seed();
  }

  private async seed() {
    await this.createUser('user@example.com', 'password123', [Role.USER]);
    await this.createUser('admin@example.com', 'password123', [Role.ADMIN]);
    await this.createUser('super@example.com', 'password123', [
      Role.SUPER_ADMIN,
    ]);
    await this.createUser('livreur@example.com', 'password123', [Role.LIVREUR]);
  }

  async createUser(
    email: string,
    password: string,
    roles: Role[] = [Role.USER],
  ) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user: UserEntity = {
      id: this.idSeq++,
      email: email.toLowerCase(),
      passwordHash,
      roles,
      isActive: true,
    };
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return this.users.find((u) => u.email === email.toLowerCase());
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
