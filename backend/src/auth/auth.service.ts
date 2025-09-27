import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { AuthProvider } from '../users/entities/auth-provider.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ForgetPasswordDto } from './dto/forget-password.dto';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // email -> { code, expiresAt }
  private readonly resetCodes = new Map<
    string,
    { code: string; expiresAt: number }
  >();
  // per-email timestamps for throttling requests
  private readonly resetRequestTimes = new Map<string, number[]>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // periodically clean expired codes
  private scheduleCleanupOnce = (() => {
    let scheduled = false;
    return () => {
      if (scheduled) return;
      scheduled = true;
      setInterval(() => {
        const now = Date.now();
        for (const [email, entry] of this.resetCodes.entries()) {
          if (entry.expiresAt <= now) this.resetCodes.delete(email);
        }
        // also cleanup old timestamps
        for (const [email, arr] of this.resetRequestTimes.entries()) {
          const pruned = arr.filter((t) => now - t <= 15 * 60 * 1000);
          if (pruned.length > 0) this.resetRequestTimes.set(email, pruned);
          else this.resetRequestTimes.delete(email);
        }
      }, 60 * 1000);
    };
  })();

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

  // ===== Forgot Password =====
  async sendResetCode(email: string): Promise<void> {
    this.scheduleCleanupOnce();
    const normalized = email.toLowerCase();
    const user = await this.usersService.findByEmail(normalized);
    if (!user) {
      this.logger.warn(
        `Password reset requested for unknown email: ${normalized}`,
      );
      throw new NotFoundException('User not found');
    }
    if (user.authProvider !== AuthProvider.LOCAL) {
      throw new ForbiddenException('Only LOCAL accounts can reset password');
    }
    // Per-email throttle: max 5 per 15 minutes
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const times = this.resetRequestTimes.get(normalized) || [];
    const recent = times.filter((t) => now - t <= windowMs);
    if (recent.length >= 5) {
      this.logger.warn(`Throttled reset code for ${normalized}`);
      throw new BadRequestException('Too many requests, try later');
    }
    recent.push(now);
    this.resetRequestTimes.set(normalized, recent);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + windowMs; // valid 15 minutes
    this.resetCodes.set(normalized, { code, expiresAt });
    // auto remove at expiry
    setTimeout(() => {
      const existing = this.resetCodes.get(normalized);
      if (existing && existing.expiresAt <= Date.now()) {
        this.resetCodes.delete(normalized);
      }
    }, windowMs + 1000);

    // Send email
    const html = this.buildResetCodeEmailHtml(user.name || user.email, code);
    try {
      await this.mailer.sendMail({
        to: normalized,
        subject: 'Code de vérification - KARKACHI PHONE',
        html,
      });
    } catch (err) {
      this.logger.error('Failed to send reset code email', err as Error);
      throw new BadRequestException('Failed to send email');
    }
  }

  verifyCode(email: string, code: string): boolean {
    const normalized = email.toLowerCase();
    const entry = this.resetCodes.get(normalized);
    if (!entry) return false;
    const now = Date.now();
    if (entry.expiresAt <= now) {
      this.resetCodes.delete(normalized);
      return false;
    }
    return entry.code === code;
  }

  async resetPassword(dto: ForgetPasswordDto): Promise<void> {
    const { email, code, newPassword, confirmPassword } = dto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const normalized = email.toLowerCase();
    const user = await this.usersService.findByEmail(normalized);
    if (!user) throw new NotFoundException('User not found');
    if (user.authProvider !== AuthProvider.LOCAL) {
      throw new ForbiddenException('Only LOCAL accounts can reset password');
    }
    const ok = this.verifyCode(normalized, code);
    if (!ok) throw new BadRequestException('Invalid or expired code');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await this.usersRepo.update({ id: user.id }, { password: passwordHash });
    // Invalidate the code immediately
    this.resetCodes.delete(normalized);
    // Optional: revoke refresh sessions
    await this.usersService.setRefreshToken(user.id, null);
  }

  private buildResetCodeEmailHtml(userName: string, code: string): string {
    // Provided HTML template with placeholders userName and code
    return `<!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code de vérification - KARKACHI PHONE</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #475569; background-color: #f8fafc; }
                    .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                    .header { background-color: #1E90FF; color: #ffffff; padding: 32px; text-align: left; }
                    .logo-section { display: flex; align-items: center; gap: 12px; }
                    .logo-icon { background-color: #ffffff; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
                    .brand-name { font-size: 28px; font-weight: bold; margin: 0; }
                    .tagline { font-size: 14px; opacity: 0.9; margin: 4px 0 0 0; }
                    .body { padding: 32px; }
                    .greeting { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #475569; }
                    .message { color: #64748b; margin-bottom: 24px; line-height: 1.6; }
                    .code-container { background-color: #E6F0FA; border: 2px solid rgba(30, 144, 255, 0.3); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px; }
                    .code-label { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 500; color: #1E90FF; margin-bottom: 12px; }
                    .verification-code { font-size: 36px; font-weight: bold; color: #1E90FF; letter-spacing: 4px; margin-bottom: 8px; }
                    .code-validity { font-size: 12px; color: #64748b; }
                    .instructions { background-color: #F0F8FF; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
                    .instructions h3 { font-weight: 500; color: #104E8B; margin-bottom: 8px; }
                    .instructions ul { list-style: none; font-size: 14px; color: #64748b; }
                    .instructions li { margin-bottom: 4px; }
                    .security-notice { border-left: 4px solid #104E8B; padding-left: 16px; margin-bottom: 24px; font-size: 14px; color: #64748b; }
                    .cta-button { text-align: center; margin-bottom: 24px; }
                    .btn { background-color: #1E90FF; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; display: inline-block; transition: background-color 0.2s; }
                    .btn:hover { background-color: #104E8B; }
                    .footer { background-color: #F0F8FF; padding: 32px; border-top: 1px solid #e5e7eb; text-align: center; }
                    .footer h3 { font-weight: 600; color: #104E8B; margin-bottom: 8px; }
                    .footer p { font-size: 14px; color: #64748b; margin-bottom: 8px; }
                    .footer-links { margin: 16px 0; }
                    .footer-links a { color: #64748b; text-decoration: none; font-size: 12px; margin: 0 8px; }
                    .footer-links a:hover { color: #1E90FF; }
                    .copyright { font-size: 12px; color: #64748b; margin-top: 16px; }
                    @media (max-width: 600px) { .email-container { margin: 10px; border-radius: 0; } .header, .body, .footer { padding: 20px; } .verification-code { font-size: 28px; } }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div class="logo-section">
                            <div class="logo-icon">📱</div>
                            <div>
                                <h1 class="brand-name">KARKACHI PHONE</h1>
                                <p class="tagline">Votre magasin de confiance</p>
                            </div>
                        </div>
                    </div>
                    <div class="body">
                        <h2 class="greeting">Bonjour, ${this.escapeHtml(userName)}</h2>
                        <p class="message">Nous avons reçu une demande de vérification pour votre compte KARKACHI PHONE. Utilisez le code ci-dessous pour confirmer votre identité.</p>
                        <div class="code-container">
                            <div class="code-label">🛡️ Code de vérification</div>
                            <div class="verification-code">${this.escapeHtml(code)}</div>
                            <p class="code-validity">Ce code est valide pendant 15 minutes</p>
                        </div>
                        <div class="instructions">
                            <h3>⏰ Instructions :</h3>
                            <ul>
                                <li>• Saisissez ce code dans l'application ou le site web</li>
                                <li>• Le code expire dans 15 minutes</li>
                                <li>• Ne partagez jamais ce code avec personne</li>
                            </ul>
                        </div>
                        <div class="security-notice"><strong>Note de sécurité :</strong> Si vous n'avez pas demandé ce code, ignorez cet email ou contactez notre support client immédiatement.</div>
                    </div>
                    <div class="footer">
                        <h3>KARKACHI PHONE</h3>
                        <p>123 Avenue Mohammed V, Casablanca, Maroc</p>
                        <p>Tél: +212 5 22 XX XX XX | Email: support@karachiphone.ma</p>
                        <div class="footer-links">
                            <a href="#">Politique de confidentialité</a> •
                            <a href="#">Conditions d'utilisation</a> •
                            <a href="#">Support client</a>
                        </div>
                        <p class="copyright">© 2025 KARKACHI PHONE. Tous droits réservés.</p>
                    </div>
                </div>
            </body>
            </html>`;
  }

  private escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
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
