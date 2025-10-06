import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS strict avec credentials
  const allowOrigin = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ✅ Security headers
  const helmetOptions = {
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  } as const;

  const helmetFactory = helmet as unknown as (opts?: unknown) => RequestHandler;
  app.use(helmetFactory(helmetOptions));

  // ✅ Validation globale pour DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Cookies parsing
  const cookieSecret = process.env.COOKIE_SECRET || 'change-me-cookie-secret';
  app.use(cookieParser(cookieSecret));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
}

bootstrap().catch((error: Error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
