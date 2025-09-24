import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { AuthProvider } from '../users/entities/auth-provider.enum';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ accessToken: string; user: User }> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ForbiddenException('Email already registered');
    }
    const user = await this.usersService.createUser({
      email,
      password,
      name,
      role: Role.USER,
    });
    const accessToken = await this.signAccessToken(user);
    return { accessToken, user };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    // Only LOCAL provider can use email/password login
    if (user.authProvider !== AuthProvider.LOCAL) {
      throw new ForbiddenException(
        'This account must login with social provider',
      );
    }
    const isValid = await this.usersService.validatePassword(user, password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new ForbiddenException('User is inactive');
    return user;
  }

  async login(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    // store hashed refresh token
    const hashedRt = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashedRt);
    return { accessToken, refreshToken };
  }

  async refresh(
    userId: string,
    providedRt: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('No session');
    const match = await bcrypt.compare(providedRt, user.refreshToken);
    if (!match) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = await this.signAccessToken(user);
    const newRt = await this.signRefreshToken(user);
    const hashedRt = await bcrypt.hash(newRt, 10);
    await this.usersService.setRefreshToken(user.id, hashedRt);
    return { accessToken, refreshToken: newRt };
  }

  async refreshByToken(
    providedRt: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const decoded = await this.jwtService.verifyAsync<{ sub: string }>(
        providedRt,
        {
          secret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
        },
      );
      const userId = decoded?.sub;
      if (!userId) return null;
      return this.refresh(userId, providedRt);
    } catch {
      return null;
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshToken(userId, null);
  }

  async logoutByToken(providedRt: string): Promise<void> {
    try {
      const decoded = await this.jwtService.verifyAsync<{ sub: string }>(
        providedRt,
        {
          secret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
        },
      );
      const userId = decoded?.sub;
      if (userId) {
        await this.logout(userId);
      }
    } catch {
      // Ignore invalid token on logout
    }
  }

  // Google OAuth: create/find user and issue tokens
  async loginWithGoogle(profile: {
    email: string;
    name?: string;
    avatarUrl?: string | null;
    emailVerified?: boolean;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.usersService.findOrCreateOAuthUser({
      provider: AuthProvider.GOOGLE,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      emailVerified: profile.emailVerified,
    });
    const { accessToken, refreshToken } = await this.login(user);
    return { accessToken, refreshToken, user };
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
  }

  private async signRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  }
}
