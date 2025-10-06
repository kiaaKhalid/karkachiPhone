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
      secret: process.env.JWT_SECRET || 'change-me-access-secret',
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d' },
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,

    // Mailer
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          requireTLS: true,
          auth: {
            user:
              process.env.SMTP_USER || process.env.MAIL_FROM || 'you@gmail.com',
            pass: process.env.SMTP_PASS || '',
          },
        },
        defaults: { from: process.env.MAIL_FROM || 'you@gmail.com' },
      }),
    }),

    // Throttler
    ThrottlerModule.forRootAsync({
      // New API expects an array of throttler options; ttl is in milliseconds
      useFactory: () => [
        {
          ttl: 15 * 60 * 1000, // 15 minutes
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
