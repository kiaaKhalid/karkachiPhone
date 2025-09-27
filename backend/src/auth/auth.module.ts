import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PassportModule,

    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d' },
    }),

    TypeOrmModule.forFeature([User]),
    UsersModule,

    // ✅ Mailer config async (corrige l’erreur ESLint)

    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST || 'localhost',
          port: Number(process.env.SMTP_PORT) || 1025,
          secure: false,
          auth: process.env.SMTP_USER
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              }
            : undefined,
        },
        defaults: {
          from: process.env.MAIL_FROM || 'no-reply@karkachiphone.ma',
        },
      }),
    }),

    // ✅ Throttler config async (corrige aussi l’erreur ESLint)

    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: 15 * 60, // 15 minutes en secondes
          limit: 100,
        },
      ],
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
