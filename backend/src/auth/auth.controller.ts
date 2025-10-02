import {
  Body,
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Role } from '../common/enums/role.enum';
import type { JwtRequestUser } from './jwt.strategy';
import { SendResetCodeDto } from './dto/send-reset-code.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

const REFRESH_COOKIE = 'rt';

type CookieRequest = Omit<Request, 'cookies'> & {
  cookies: Record<string, string>;
};

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.signup(
      dto.email,
      dto.password,
      dto.name,
    );
    // Issue refresh token as secure httpOnly cookie
    const { refreshToken } = await this.authService.login(user);
    this.setRefreshCookie(res, refreshToken);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  // ===== Forgot Password =====
  @HttpCode(HttpStatus.OK)
  @Post('send-reset-code')
  async sendResetCode(@Body() dto: SendResetCodeDto) {
    await this.authService.sendResetCode(dto.email);
    return { success: true, message: 'Reset code sent if user exists' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-reset-code')
  verifyResetCode(@Body() body: { email: string; code: string }) {
    const valid = this.authService.verifyCode(body.email, body.code);
    return { valid };
  }

  @HttpCode(HttpStatus.OK)
  @Patch('forget-password')
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { success: true };
  }

  private readRefreshCookie(req: CookieRequest): string | null {
    const val = req.cookies?.[REFRESH_COOKIE];
    return typeof val === 'string' && val.length > 0 ? val : null;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = dto as unknown as Record<string, unknown>;
    const emailVal = payload['email'];
    const passVal = payload['password'];
    if (typeof emailVal !== 'string' || typeof passVal !== 'string') {
      throw new BadRequestException('Invalid login payload');
    }
    const email = emailVal;
    const password = passVal;
    const user = await this.authService.validateUser(email, password);
    const { accessToken, refreshToken } = await this.authService.login(user);
    this.setRefreshCookie(res, refreshToken);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: CookieRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rt = this.readRefreshCookie(req);
    if (!rt) return { accessToken: null, user: null };
    const resTokens = await this.authService.refreshByToken(rt);
    if (!resTokens) return { accessToken: null, user: null };
    const { accessToken, refreshToken } = resTokens;
    const u = (resTokens.user ?? {}) as {
      id?: unknown;
      name?: unknown;
      email?: unknown;
      role?: unknown;
      avatarUrl?: unknown;
    };
    const safeUser = {
      id: typeof u.id === 'string' ? u.id : '',
      name: typeof u.name === 'string' ? u.name : undefined,
      email: typeof u.email === 'string' ? u.email : '',
      role: (u.role as Role) ?? Role.USER,
      avatar:
        typeof u.avatarUrl === 'string' && u.avatarUrl
          ? u.avatarUrl
          : 'https://i.ibb.co/C3R4f9gT/user.png',
    };
    this.setRefreshCookie(res, refreshToken);
    return {
      accessToken,
      user: safeUser,
    };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.LIVREUR, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('logout')
  async logout(
    @Req()
    req: CookieRequest &
      Request & { user?: { id?: string; email?: string; role?: Role } },
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/', // IMPORTANT
    });
    const userId = req.user?.id ?? 'unknown';
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    const ua = req.headers['user-agent'] || 'unknown';
    console.info(`[logout] user=${userId} ip=${ip} ua=${ua}`);

    if (userId !== 'unknown') {
      await this.authService.logout(userId);
    } else {
      const rt = this.readRefreshCookie(req as CookieRequest);
      if (rt) await this.authService.logoutByToken(rt);
    }

    res.clearCookie(REFRESH_COOKIE, this.cookieOptions());

    return { success: true, message: 'Déconnexion réussie' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('me')
  me(@Req() req: Request & { user: JwtRequestUser }) {
    return req.user;
  }

  // ===== Google OAuth =====
  @UseGuards(AuthGuard('google'))
  @Get('google')
  async googleAuth(): Promise<void> {
    // Handled by Passport (redirect to Google)
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleCallback(
    @Req()
    req: Request & {
      user?: {
        email?: unknown;
        name?: unknown;
        avatarUrl?: unknown;
        emailVerified?: unknown;
      };
    },
    @Res() res: Response,
  ) {
    try {
      const userPayload = req.user ?? {};
      const email =
        typeof userPayload.email === 'string' ? userPayload.email : null;
      const name =
        typeof userPayload.name === 'string' ? userPayload.name : undefined;
      const avatarUrl =
        typeof userPayload.avatarUrl === 'string'
          ? userPayload.avatarUrl
          : undefined;
      const emailVerified = Boolean(
        (userPayload as { emailVerified?: unknown }).emailVerified,
      );

      if (!email) {
        return res.redirect(
          'http://localhost:3000/auth/login?error=google_auth_failed',
        );
      }

      const { refreshToken } = await this.authService.loginWithGoogle({
        email,
        name,
        avatarUrl,
        emailVerified,
      });

      // Stocker le refresh token
      this.setRefreshCookie(res, refreshToken);

      // Rediriger SANS params sensibles
      return res.redirect('http://localhost:3000/auth/google/callback');
    } catch (error: unknown) {
      console.error('Google callback error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return res.redirect(
        'http://localhost:3000/auth/login?error=google_auth_error',
      );
    }
  }

  private cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict' as const,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, this.cookieOptions());
  }
}
